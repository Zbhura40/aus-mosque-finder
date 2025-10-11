-- =====================================================
-- Mosques Email Extraction System
-- =====================================================
-- Purpose: Store mosque contact information for marketing campaigns
-- Security: PRIVATE table - no public access, admin only
-- Created: 2025-10-10
-- =====================================================

-- Drop table if exists (for clean reinstall)
DROP TABLE IF EXISTS public.mosques_emails CASCADE;

-- Create mosques_emails table
CREATE TABLE public.mosques_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Information
    name TEXT NOT NULL,
    location TEXT,
    state TEXT,
    suburb TEXT,

    -- Contact Details
    phone TEXT,
    website TEXT,
    facebook TEXT,

    -- Email Addresses (up to 3 per mosque)
    email_primary TEXT,
    email_secondary TEXT,
    email_tertiary TEXT,

    -- Verification Status
    email_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,

    -- Metadata
    source TEXT NOT NULL, -- 'google_maps', 'website', 'facebook'
    google_place_id TEXT, -- Link to mosques_cache if available
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

    -- Notes and Flags
    notes TEXT,
    is_active BOOLEAN DEFAULT true, -- For future filtering

    -- Constraints
    CONSTRAINT email_primary_or_website_required
        CHECK (email_primary IS NOT NULL OR website IS NOT NULL)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Search by state/suburb
CREATE INDEX idx_mosques_emails_state ON public.mosques_emails(state);
CREATE INDEX idx_mosques_emails_suburb ON public.mosques_emails(suburb);

-- Filter verified emails
CREATE INDEX idx_mosques_emails_verified ON public.mosques_emails(email_verified);

-- Search by name
CREATE INDEX idx_mosques_emails_name ON public.mosques_emails(name);

-- Filter active records
CREATE INDEX idx_mosques_emails_active ON public.mosques_emails(is_active);

-- Link to Google Place ID
CREATE INDEX idx_mosques_emails_place_id ON public.mosques_emails(google_place_id);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.mosques_emails ENABLE ROW LEVEL SECURITY;

-- Policy 1: NO PUBLIC ACCESS (critical for privacy)
CREATE POLICY "Block all anonymous access"
    ON public.mosques_emails
    FOR ALL
    TO anon
    USING (false);

-- Policy 2: Authenticated users (admin) have full access
CREATE POLICY "Authenticated full access"
    ON public.mosques_emails
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 3: Service role has full access (for scripts)
CREATE POLICY "Service role full access"
    ON public.mosques_emails
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Get email extraction statistics
CREATE OR REPLACE FUNCTION get_email_extraction_stats()
RETURNS TABLE (
    total_mosques BIGINT,
    with_email_primary BIGINT,
    with_email_secondary BIGINT,
    with_email_tertiary BIGINT,
    verified_emails BIGINT,
    by_state JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_mosques,
        COUNT(email_primary)::BIGINT as with_email_primary,
        COUNT(email_secondary)::BIGINT as with_email_secondary,
        COUNT(email_tertiary)::BIGINT as with_email_tertiary,
        COUNT(CASE WHEN email_verified = true THEN 1 END)::BIGINT as verified_emails,
        jsonb_object_agg(
            COALESCE(state, 'Unknown'),
            state_count
        ) as by_state
    FROM public.mosques_emails
    LEFT JOIN (
        SELECT state, COUNT(*) as state_count
        FROM public.mosques_emails
        GROUP BY state
    ) state_stats ON true;
END;
$$;

-- Function: Get verified emails for export (Make.com/n8n)
CREATE OR REPLACE FUNCTION get_verified_emails_for_export()
RETURNS TABLE (
    mosque_name TEXT,
    email TEXT,
    location TEXT,
    phone TEXT,
    state TEXT,
    website TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        name as mosque_name,
        email_primary as email,
        location,
        phone,
        state,
        website
    FROM public.mosques_emails
    WHERE
        email_verified = true
        AND email_primary IS NOT NULL
        AND is_active = true
    ORDER BY state, name;
END;
$$;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE public.mosques_emails IS
    'Private table storing mosque contact information for marketing campaigns. NO PUBLIC ACCESS.';

COMMENT ON COLUMN public.mosques_emails.email_primary IS
    'Primary email address (e.g., info@, contact@, admin@)';

COMMENT ON COLUMN public.mosques_emails.email_secondary IS
    'Secondary email if multiple found on website';

COMMENT ON COLUMN public.mosques_emails.email_tertiary IS
    'Third email if available (personal, imam@, etc.)';

COMMENT ON COLUMN public.mosques_emails.email_verified IS
    'True if email domain has valid MX records (DNS verification)';

COMMENT ON COLUMN public.mosques_emails.source IS
    'Data source: google_maps, website, or facebook';

COMMENT ON FUNCTION get_email_extraction_stats() IS
    'Returns statistics about email extraction coverage and verification rates';

COMMENT ON FUNCTION get_verified_emails_for_export() IS
    'Returns verified emails ready for export to Make.com or n8n';

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Revoke all public access
REVOKE ALL ON public.mosques_emails FROM PUBLIC;
REVOKE ALL ON public.mosques_emails FROM anon;

-- Grant authenticated users full access
GRANT ALL ON public.mosques_emails TO authenticated;

-- Grant service role full access
GRANT ALL ON public.mosques_emails TO service_role;

-- Grant function execution to authenticated users
GRANT EXECUTE ON FUNCTION get_email_extraction_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_verified_emails_for_export() TO authenticated;

-- =====================================================
-- End of Migration
-- =====================================================
