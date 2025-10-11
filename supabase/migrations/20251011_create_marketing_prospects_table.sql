-- =====================================================
-- Marketing Prospects System
-- =====================================================
-- Purpose: Store complete mosque data for marketing campaigns
-- Security: PRIVATE table - no public access, admin only
-- Created: 2025-10-11
-- =====================================================

-- Drop table if exists (for clean reinstall)
DROP TABLE IF EXISTS public.marketing_prospects CASCADE;

-- Create marketing_prospects table
CREATE TABLE public.marketing_prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information (from Google Maps)
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    state TEXT,
    suburb TEXT,

    -- Location Data
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Contact Details
    phone TEXT,
    website TEXT,

    -- Google Maps Data
    google_place_id TEXT UNIQUE NOT NULL,
    google_maps_url TEXT,
    categories TEXT[], -- Array of categories like ['Mosque', 'Tourist attraction']

    -- Email Extraction Status
    email_primary TEXT,
    email_secondary TEXT,
    email_tertiary TEXT,
    email_verified BOOLEAN DEFAULT false,
    extraction_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'no_website'
    extraction_attempts INTEGER DEFAULT 0,
    last_extraction_attempt TIMESTAMP WITH TIME ZONE,
    extraction_error TEXT, -- Store error message if extraction fails

    -- Campaign Tracking
    campaign_status TEXT DEFAULT 'not_contacted', -- 'not_contacted', 'email_sent', 'opened', 'clicked', 'responded', 'unsubscribed'
    email_sent_date TIMESTAMP WITH TIME ZONE,
    last_interaction_date TIMESTAMP WITH TIME ZONE,

    -- Metadata
    data_source TEXT DEFAULT 'google_maps',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Notes and Flags
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- 0=normal, 1=high, -1=low

    -- Constraints
    CONSTRAINT valid_extraction_status
        CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed', 'no_website')),
    CONSTRAINT valid_campaign_status
        CHECK (campaign_status IN ('not_contacted', 'email_sent', 'opened', 'clicked', 'responded', 'unsubscribed'))
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Geographic queries
CREATE INDEX idx_marketing_prospects_state ON public.marketing_prospects(state);
CREATE INDEX idx_marketing_prospects_suburb ON public.marketing_prospects(suburb);
CREATE INDEX idx_marketing_prospects_location ON public.marketing_prospects(latitude, longitude);

-- Extraction workflow
CREATE INDEX idx_marketing_prospects_extraction_status ON public.marketing_prospects(extraction_status);
CREATE INDEX idx_marketing_prospects_has_website ON public.marketing_prospects(website) WHERE website IS NOT NULL;
CREATE INDEX idx_marketing_prospects_has_email ON public.marketing_prospects(email_primary) WHERE email_primary IS NOT NULL;

-- Campaign management
CREATE INDEX idx_marketing_prospects_campaign_status ON public.marketing_prospects(campaign_status);
CREATE INDEX idx_marketing_prospects_priority ON public.marketing_prospects(priority);

-- Search by name
CREATE INDEX idx_marketing_prospects_name ON public.marketing_prospects(name);

-- Google Place ID (unique lookup)
CREATE INDEX idx_marketing_prospects_place_id ON public.marketing_prospects(google_place_id);

-- Active records
CREATE INDEX idx_marketing_prospects_active ON public.marketing_prospects(is_active);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.marketing_prospects ENABLE ROW LEVEL SECURITY;

-- Policy 1: NO PUBLIC ACCESS (critical for privacy)
CREATE POLICY "Block all anonymous access"
    ON public.marketing_prospects
    FOR ALL
    TO anon
    USING (false);

-- Policy 2: Authenticated users (admin) have full access
CREATE POLICY "Authenticated full access"
    ON public.marketing_prospects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 3: Service role has full access (for scripts)
CREATE POLICY "Service role full access"
    ON public.marketing_prospects
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Get extraction statistics
CREATE OR REPLACE FUNCTION get_extraction_stats()
RETURNS TABLE (
    total_prospects BIGINT,
    with_website BIGINT,
    with_phone BIGINT,
    with_email BIGINT,
    verified_emails BIGINT,
    pending_extraction BIGINT,
    completed_extraction BIGINT,
    failed_extraction BIGINT,
    by_state JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_prospects,
        COUNT(website)::BIGINT as with_website,
        COUNT(phone)::BIGINT as with_phone,
        COUNT(email_primary)::BIGINT as with_email,
        COUNT(CASE WHEN email_verified = true THEN 1 END)::BIGINT as verified_emails,
        COUNT(CASE WHEN extraction_status = 'pending' THEN 1 END)::BIGINT as pending_extraction,
        COUNT(CASE WHEN extraction_status = 'completed' THEN 1 END)::BIGINT as completed_extraction,
        COUNT(CASE WHEN extraction_status = 'failed' THEN 1 END)::BIGINT as failed_extraction,
        (
            SELECT jsonb_object_agg(
                COALESCE(state, 'Unknown'),
                state_data
            )
            FROM (
                SELECT
                    state,
                    jsonb_build_object(
                        'total', COUNT(*),
                        'with_website', COUNT(website),
                        'with_email', COUNT(email_primary)
                    ) as state_data
                FROM public.marketing_prospects
                GROUP BY state
            ) state_stats
        ) as by_state
    FROM public.marketing_prospects;
END;
$$;

-- Function: Get pending websites for extraction
CREATE OR REPLACE FUNCTION get_pending_extraction_websites(batch_size INT DEFAULT 50)
RETURNS TABLE (
    id UUID,
    name TEXT,
    website TEXT,
    state TEXT,
    extraction_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.website,
        p.state,
        p.extraction_attempts
    FROM public.marketing_prospects p
    WHERE
        p.extraction_status = 'pending'
        AND p.website IS NOT NULL
        AND p.is_active = true
        AND p.extraction_attempts < 3 -- Max 3 attempts
    ORDER BY p.priority DESC, p.extraction_attempts ASC, p.created_at ASC
    LIMIT batch_size;
END;
$$;

-- Function: Get campaign-ready prospects
CREATE OR REPLACE FUNCTION get_campaign_ready_prospects()
RETURNS TABLE (
    mosque_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    state TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        name as mosque_name,
        email_primary as email,
        phone,
        website,
        address,
        state
    FROM public.marketing_prospects
    WHERE
        email_verified = true
        AND email_primary IS NOT NULL
        AND is_active = true
        AND campaign_status = 'not_contacted'
    ORDER BY priority DESC, state, name;
END;
$$;

-- Function: Update extraction status
CREATE OR REPLACE FUNCTION update_extraction_status(
    prospect_id UUID,
    new_status TEXT,
    emails TEXT[] DEFAULT NULL,
    verified BOOLEAN DEFAULT false,
    error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.marketing_prospects
    SET
        extraction_status = new_status,
        extraction_attempts = extraction_attempts + 1,
        last_extraction_attempt = now(),
        updated_at = now(),
        email_primary = COALESCE(emails[1], email_primary),
        email_secondary = COALESCE(emails[2], email_secondary),
        email_tertiary = COALESCE(emails[3], email_tertiary),
        email_verified = COALESCE(verified, email_verified),
        extraction_error = error_message
    WHERE id = prospect_id;
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketing_prospects_updated_at
    BEFORE UPDATE ON public.marketing_prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.marketing_prospects IS
    'Private table storing complete mosque data for marketing campaigns. Includes email extraction status and campaign tracking. NO PUBLIC ACCESS.';

COMMENT ON COLUMN public.marketing_prospects.extraction_status IS
    'Email extraction workflow status: pending, processing, completed, failed, no_website';

COMMENT ON COLUMN public.marketing_prospects.campaign_status IS
    'Email campaign tracking: not_contacted, email_sent, opened, clicked, responded, unsubscribed';

COMMENT ON COLUMN public.marketing_prospects.priority IS
    'Campaign priority: 0=normal, 1=high, -1=low';

COMMENT ON FUNCTION get_extraction_stats() IS
    'Returns comprehensive statistics about extraction progress and coverage';

COMMENT ON FUNCTION get_pending_extraction_websites(INT) IS
    'Returns batch of pending websites for email extraction, ordered by priority';

COMMENT ON FUNCTION get_campaign_ready_prospects() IS
    'Returns mosques with verified emails ready for marketing campaign';

COMMENT ON FUNCTION update_extraction_status(UUID, TEXT, TEXT[], BOOLEAN, TEXT) IS
    'Updates extraction status and emails for a prospect';

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Revoke all public access
REVOKE ALL ON public.marketing_prospects FROM PUBLIC;
REVOKE ALL ON public.marketing_prospects FROM anon;

-- Grant authenticated users full access
GRANT ALL ON public.marketing_prospects TO authenticated;

-- Grant service role full access
GRANT ALL ON public.marketing_prospects TO service_role;

-- Grant function execution to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_extraction_stats() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pending_extraction_websites(INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_campaign_ready_prospects() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_extraction_status(UUID, TEXT, TEXT[], BOOLEAN, TEXT) TO authenticated, service_role;

-- =====================================================
-- End of Migration
-- =====================================================
