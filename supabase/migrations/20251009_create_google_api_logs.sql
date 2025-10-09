-- Create google_api_logs table
-- Purpose: Track every Google API call to monitor costs and usage patterns
-- Think of this as: Your expense tracking spreadsheet

CREATE TABLE IF NOT EXISTS google_api_logs (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- API call details
    api_type TEXT NOT NULL CHECK (api_type IN (
        'autocomplete',
        'geocode',
        'place_details',
        'place_search',
        'nearby_search',
        'text_search'
    )),

    -- Request details
    request_params JSONB NOT NULL,
    -- Example: {"query": "mosques near Sydney", "radius": 5000, "location": "-33.8688,151.2093"}

    -- Response details
    response_status TEXT NOT NULL CHECK (response_status IN (
        'success',
        'error',
        'rate_limited',
        'invalid_request',
        'zero_results'
    )),
    response_data JSONB,
    -- Store limited response data for debugging (not full response to save space)

    -- Cost tracking
    cost_estimate NUMERIC(8, 6) NOT NULL DEFAULT 0,
    -- Based on Google's pricing: Place Details = $0.017, Geocoding = $0.005, etc.

    cache_hit BOOLEAN DEFAULT false,
    -- Did we serve from cache (no cost) or call Google (cost incurred)?

    -- Performance metrics
    response_time_ms INTEGER,
    -- How long did the API call take?

    -- Context
    edge_function_name TEXT,
    -- Which Edge Function made this call? (e.g., 'get-mosque-details')

    user_context JSONB,
    -- Optional: IP hash, user agent for analytics
    -- Example: {"ip_hash": "abc123", "user_agent": "Mozilla/5.0..."}

    -- Error details (if any)
    error_message TEXT,
    error_code TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE google_api_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can insert (from Edge Functions)
CREATE POLICY "Allow service role insert" ON google_api_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- RLS Policy: Authenticated users (admins) can read logs
CREATE POLICY "Allow authenticated read" ON google_api_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Service role has full access
CREATE POLICY "Allow service role full access" ON google_api_logs
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create indexes for performance and analytics
CREATE INDEX idx_google_api_logs_api_type ON google_api_logs(api_type);
CREATE INDEX idx_google_api_logs_cache_hit ON google_api_logs(cache_hit);
CREATE INDEX idx_google_api_logs_created ON google_api_logs(created_at DESC);
CREATE INDEX idx_google_api_logs_status ON google_api_logs(response_status);
CREATE INDEX idx_google_api_logs_cost ON google_api_logs(cost_estimate) WHERE cost_estimate > 0;

-- Function to calculate daily API costs
CREATE OR REPLACE FUNCTION get_daily_api_costs(days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    total_calls BIGINT,
    cache_hits BIGINT,
    google_calls BIGINT,
    cache_hit_rate NUMERIC,
    total_cost NUMERIC,
    cost_by_type JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(created_at) AS date,
        COUNT(*)::BIGINT AS total_calls,
        COUNT(*) FILTER (WHERE cache_hit = true)::BIGINT AS cache_hits,
        COUNT(*) FILTER (WHERE cache_hit = false)::BIGINT AS google_calls,
        ROUND(
            (COUNT(*) FILTER (WHERE cache_hit = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
            2
        ) AS cache_hit_rate,
        SUM(CASE WHEN cache_hit = false THEN cost_estimate ELSE 0 END)::NUMERIC AS total_cost,
        jsonb_object_agg(
            api_type,
            json_build_object(
                'count', COUNT(*) FILTER (WHERE cache_hit = false),
                'cost', SUM(CASE WHEN cache_hit = false THEN cost_estimate ELSE 0 END)
            )
        ) AS cost_by_type
    FROM google_api_logs
    WHERE created_at >= CURRENT_DATE - days
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current month's API costs (for billing alert)
CREATE OR REPLACE FUNCTION get_current_month_cost()
RETURNS TABLE (
    total_calls BIGINT,
    google_api_calls BIGINT,
    cache_hit_rate NUMERIC,
    total_cost NUMERIC,
    estimated_monthly_cost NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_calls,
        COUNT(*) FILTER (WHERE cache_hit = false)::BIGINT AS google_api_calls,
        ROUND(
            (COUNT(*) FILTER (WHERE cache_hit = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
            2
        ) AS cache_hit_rate,
        SUM(CASE WHEN cache_hit = false THEN cost_estimate ELSE 0 END)::NUMERIC AS total_cost,
        -- Estimate monthly cost based on current usage
        ROUND(
            SUM(CASE WHEN cache_hit = false THEN cost_estimate ELSE 0 END) *
            (30.0 / NULLIF(EXTRACT(DAY FROM CURRENT_DATE), 0)),
            2
        )::NUMERIC AS estimated_monthly_cost
    FROM google_api_logs
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API usage by type (for optimization)
CREATE OR REPLACE FUNCTION get_api_usage_by_type(days INTEGER DEFAULT 7)
RETURNS TABLE (
    api_type TEXT,
    total_calls BIGINT,
    cache_hits BIGINT,
    google_calls BIGINT,
    cache_hit_rate NUMERIC,
    total_cost NUMERIC,
    avg_response_time_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.api_type,
        COUNT(*)::BIGINT AS total_calls,
        COUNT(*) FILTER (WHERE l.cache_hit = true)::BIGINT AS cache_hits,
        COUNT(*) FILTER (WHERE l.cache_hit = false)::BIGINT AS google_calls,
        ROUND(
            (COUNT(*) FILTER (WHERE l.cache_hit = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
            2
        ) AS cache_hit_rate,
        SUM(CASE WHEN l.cache_hit = false THEN l.cost_estimate ELSE 0 END)::NUMERIC AS total_cost,
        AVG(l.response_time_ms)::NUMERIC AS avg_response_time_ms
    FROM google_api_logs l
    WHERE l.created_at >= CURRENT_DATE - days
    GROUP BY l.api_type
    ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old logs (keep last 90 days only)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM google_api_logs
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE google_api_logs IS 'Track all Google API calls for cost monitoring and usage analytics';
COMMENT ON COLUMN google_api_logs.cache_hit IS 'false = Google API called (cost incurred), true = served from cache (no cost)';
COMMENT ON COLUMN google_api_logs.cost_estimate IS 'Estimated cost in USD based on Google Places API pricing';
COMMENT ON COLUMN google_api_logs.request_params IS 'Store request parameters for debugging and analytics';
