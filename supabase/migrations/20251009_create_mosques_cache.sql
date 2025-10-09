-- Create mosques_cache table
-- Purpose: Store comprehensive mosque data from Google Places API to reduce API costs
-- This is the main "address book" of all mosques

-- Enable PostGIS extension for geography/location types
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS mosques_cache (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_place_id TEXT UNIQUE NOT NULL,

    -- Basic information
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    suburb TEXT,
    state TEXT CHECK (state IN ('NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT')),
    postcode TEXT,

    -- Contact details
    phone_number TEXT,
    website TEXT,
    email TEXT,

    -- Location (PostGIS geography for distance calculations)
    location GEOGRAPHY(POINT, 4326),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),

    -- Operating hours (stored as JSON for flexibility)
    opening_hours JSONB,
    -- Example: {"monday": "5:00 AM - 10:00 PM", "tuesday": "5:00 AM - 10:00 PM", ...}

    -- Google data
    google_rating NUMERIC(2, 1) CHECK (google_rating >= 0 AND google_rating <= 5),
    google_review_count INTEGER DEFAULT 0,
    google_url TEXT,

    -- Mosque attributes (stored as JSON array)
    attributes JSONB DEFAULT '[]'::jsonb,
    -- Example: ["wheelchair_accessible", "parking_available", "womens_prayer_area", "wudu_facilities"]

    -- Photos
    photos JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"reference": "photo_ref_123", "width": 1920, "height": 1080}]

    -- Prayer times (future feature)
    prayer_times JSONB,

    -- Data management
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_fetched_from_google TIMESTAMPTZ,
    fetch_count INTEGER DEFAULT 1,
    data_quality_score INTEGER CHECK (data_quality_score >= 0 AND data_quality_score <= 100),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),

    -- Full-text search support
    search_vector tsvector
);

-- Enable Row Level Security
ALTER TABLE mosques_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read mosque data (public directory)
CREATE POLICY "Allow public read access" ON mosques_cache
    FOR SELECT
    USING (true);

-- RLS Policy: Only authenticated users (admins) can insert
CREATE POLICY "Allow authenticated insert" ON mosques_cache
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Only authenticated users (admins) can update
CREATE POLICY "Allow authenticated update" ON mosques_cache
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Service role can do everything (for automated updates)
CREATE POLICY "Allow service role full access" ON mosques_cache
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_mosques_cache_place_id ON mosques_cache(google_place_id);
CREATE INDEX idx_mosques_cache_state ON mosques_cache(state);
CREATE INDEX idx_mosques_cache_suburb ON mosques_cache(suburb);
CREATE INDEX idx_mosques_cache_location ON mosques_cache USING GIST(location);
CREATE INDEX idx_mosques_cache_active ON mosques_cache(is_active) WHERE is_active = true;
CREATE INDEX idx_mosques_cache_last_fetched ON mosques_cache(last_fetched_from_google);
CREATE INDEX idx_mosques_cache_search ON mosques_cache USING GIN(search_vector);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_mosques_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_mosques_cache_updated_at
    BEFORE UPDATE ON mosques_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_mosques_cache_updated_at();

-- Function to update search_vector for full-text search
CREATE OR REPLACE FUNCTION update_mosques_cache_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.suburb, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search_vector
CREATE TRIGGER trigger_mosques_cache_search_vector
    BEFORE INSERT OR UPDATE ON mosques_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_mosques_cache_search_vector();

-- Comment on table
COMMENT ON TABLE mosques_cache IS 'Cached mosque data from Google Places API to reduce API costs and improve performance';
COMMENT ON COLUMN mosques_cache.google_place_id IS 'Unique identifier from Google Places API';
COMMENT ON COLUMN mosques_cache.location IS 'PostGIS geography point for distance calculations';
COMMENT ON COLUMN mosques_cache.last_fetched_from_google IS 'Track data freshness - refresh if older than 7 days';
COMMENT ON COLUMN mosques_cache.data_quality_score IS 'Score 0-100 based on completeness of data (name, address, hours, etc.)';
