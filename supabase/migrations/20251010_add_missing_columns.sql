-- Add missing columns to mosques_cache table
-- These columns are needed by the Edge Function

ALTER TABLE mosques_cache
ADD COLUMN IF NOT EXISTS is_open_now BOOLEAN,
ADD COLUMN IF NOT EXISTS formatted_address TEXT,
ADD COLUMN IF NOT EXISTS place_types TEXT[],
ADD COLUMN IF NOT EXISTS business_status TEXT,
ADD COLUMN IF NOT EXISTS editorial_summary TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_mosques_cache_business_status ON mosques_cache(business_status);
CREATE INDEX IF NOT EXISTS idx_mosques_cache_is_open_now ON mosques_cache(is_open_now) WHERE is_open_now = true;

COMMENT ON COLUMN mosques_cache.is_open_now IS 'Whether the mosque is currently open (from Google Places)';
COMMENT ON COLUMN mosques_cache.formatted_address IS 'Full formatted address from Google Places';
COMMENT ON COLUMN mosques_cache.place_types IS 'Array of place types from Google Places (e.g., ["mosque", "place_of_worship"])';
COMMENT ON COLUMN mosques_cache.business_status IS 'Business status from Google Places (OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY)';
COMMENT ON COLUMN mosques_cache.editorial_summary IS 'Editorial summary/description from Google Places';
