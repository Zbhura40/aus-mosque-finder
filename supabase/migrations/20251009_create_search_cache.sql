-- Create search_cache table
-- Purpose: Cache user search results to avoid repeated Google API calls
-- Think of this as: Storing common questions and their answers

CREATE TABLE IF NOT EXISTS search_cache (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Search parameters (hashed for quick lookup)
    search_hash TEXT UNIQUE NOT NULL,
    -- Hash created from: lat, lng, radius, filters
    -- Example: MD5("lat=-33.8688,lng=151.2093,radius=5,state=NSW")

    -- Original search parameters (for debugging/analytics)
    search_params JSONB NOT NULL,
    -- Example: {"latitude": -33.8688, "longitude": 151.2093, "radius_km": 5, "state": "NSW"}

    -- Location details
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    radius_km NUMERIC(5, 2) NOT NULL CHECK (radius_km > 0 AND radius_km <= 50),

    -- Search filters
    state TEXT,
    suburb TEXT,
    search_query TEXT,

    -- Results (array of mosque IDs from mosques_cache)
    results JSONB NOT NULL,
    -- Example: [{"mosque_id": "uuid1", "distance_km": 1.2}, {"mosque_id": "uuid2", "distance_km": 2.5}]

    result_count INTEGER DEFAULT 0,

    -- Cache management
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    is_valid BOOLEAN DEFAULT true,

    -- Analytics
    hit_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Performance indicators
    response_time_ms INTEGER,
    data_source TEXT CHECK (data_source IN ('cache', 'google_api', 'database')),

    -- User context (optional, for analytics)
    user_agent TEXT,
    ip_hash TEXT
);

-- Enable Row Level Security
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read valid, non-expired cache entries
CREATE POLICY "Allow public read of valid cache" ON search_cache
    FOR SELECT
    USING (is_valid = true AND expires_at > NOW());

-- RLS Policy: Service role can insert (from Edge Functions)
CREATE POLICY "Allow service role insert" ON search_cache
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- RLS Policy: Service role can update (for hit_count, last_accessed)
CREATE POLICY "Allow service role update" ON search_cache
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Service role can delete expired entries
CREATE POLICY "Allow service role delete" ON search_cache
    FOR DELETE
    TO service_role
    USING (true);

-- Create indexes for performance
CREATE INDEX idx_search_cache_hash ON search_cache(search_hash);
CREATE INDEX idx_search_cache_expires ON search_cache(expires_at) WHERE is_valid = true;
CREATE INDEX idx_search_cache_location ON search_cache(latitude, longitude, radius_km);
CREATE INDEX idx_search_cache_created ON search_cache(created_at);
CREATE INDEX idx_search_cache_valid ON search_cache(is_valid, expires_at) WHERE is_valid = true;

-- Function to increment hit count when cache is accessed
CREATE OR REPLACE FUNCTION increment_search_cache_hit()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE search_cache
    SET hit_count = hit_count + 1,
        last_accessed_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate expired cache entries (runs via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_cache
    WHERE expires_at < NOW() OR is_valid = false;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cache statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_search_cache_stats()
RETURNS TABLE (
    total_entries BIGINT,
    valid_entries BIGINT,
    expired_entries BIGINT,
    total_hits BIGINT,
    avg_hit_count NUMERIC,
    cache_size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_entries,
        COUNT(*) FILTER (WHERE is_valid = true AND expires_at > NOW())::BIGINT AS valid_entries,
        COUNT(*) FILTER (WHERE expires_at <= NOW())::BIGINT AS expired_entries,
        SUM(hit_count)::BIGINT AS total_hits,
        AVG(hit_count)::NUMERIC AS avg_hit_count,
        (pg_total_relation_size('search_cache') / 1024.0 / 1024.0)::NUMERIC AS cache_size_mb
    FROM search_cache;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on table
COMMENT ON TABLE search_cache IS 'Cached search results to reduce Google API calls and improve response time';
COMMENT ON COLUMN search_cache.search_hash IS 'MD5 hash of search parameters for quick lookups';
COMMENT ON COLUMN search_cache.results IS 'Array of mosque IDs and distances from mosques_cache table';
COMMENT ON COLUMN search_cache.expires_at IS 'Cache expires after 7 days to ensure data freshness';
COMMENT ON COLUMN search_cache.hit_count IS 'Number of times this cached search was reused';
