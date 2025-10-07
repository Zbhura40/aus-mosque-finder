-- Halal Supermarket Finder - Database Schema
-- Created: 2025-10-07
-- Purpose: Track supermarkets with halal sections in Australia

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: supermarkets
-- Purpose: Store supermarket data with halal section information
-- ============================================================================

CREATE TABLE IF NOT EXISTS supermarkets (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL,

  -- Basic information
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  chain TEXT,  -- e.g., "Coles", "Woolworths", "IGA", "Aldi", "FoodWorks"

  -- Halal section detection
  has_halal_section BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,  -- AI explanation for the decision
  source TEXT,  -- Where the information came from (e.g., "Google Reviews", "Website", "Social Media")

  -- Google Places data
  user_ratings_total INTEGER DEFAULT 0,
  rating DECIMAL(2, 1),  -- Overall Google rating (0.0 - 5.0)

  -- Metadata
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Soft delete (for stores that close)
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- Index for halal section queries (most common filter)
CREATE INDEX idx_supermarkets_has_halal
ON supermarkets(has_halal_section)
WHERE is_active = true;

-- Index for confidence score filtering
CREATE INDEX idx_supermarkets_confidence
ON supermarkets(confidence_score)
WHERE is_active = true;

-- Index for location-based queries (lat/lng)
CREATE INDEX idx_supermarkets_location
ON supermarkets(lat, lng)
WHERE is_active = true;

-- Index for Google Place ID lookups (used during updates)
CREATE INDEX idx_supermarkets_place_id
ON supermarkets(place_id);

-- Index for chain filtering
CREATE INDEX idx_supermarkets_chain
ON supermarkets(chain)
WHERE is_active = true;

-- Index for last checked (to find stale data)
CREATE INDEX idx_supermarkets_last_checked
ON supermarkets(last_checked DESC);

-- ============================================================================
-- Table: scrape_logs
-- Purpose: Track automated update cycles for monitoring and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS scrape_logs (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Run configuration
  region TEXT,  -- e.g., "Sydney", "Melbourne", "All"
  batch_size INTEGER,  -- How many stores were targeted

  -- Results
  supermarkets_found INTEGER DEFAULT 0,  -- Total found by Google Places
  supermarkets_processed INTEGER DEFAULT 0,  -- Actually analyzed
  halal_stores_found INTEGER DEFAULT 0,  -- With halal sections
  new_stores_added INTEGER DEFAULT 0,  -- First time in database
  stores_updated INTEGER DEFAULT 0,  -- Existing stores with changes

  -- API usage tracking
  google_api_calls INTEGER DEFAULT 0,
  claude_api_calls INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10, 2),  -- Estimated cost in USD

  -- Status tracking
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  duration_seconds INTEGER,

  -- Metadata
  created_by TEXT DEFAULT 'automated_cron'
);

-- Index for recent logs
CREATE INDEX idx_scrape_logs_run_date
ON scrape_logs(run_date DESC);

-- Index for status queries
CREATE INDEX idx_scrape_logs_status
ON scrape_logs(status);

-- ============================================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supermarkets_updated_at
BEFORE UPDATE ON supermarkets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- Purpose: Secure access to data
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to supermarkets (for website)
CREATE POLICY "Public read access to supermarkets"
ON supermarkets
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Only allow service role to insert/update/delete supermarkets
CREATE POLICY "Service role full access to supermarkets"
ON supermarkets
FOR ALL
TO service_role
USING (true);

-- Allow public read access to recent scrape logs (for transparency)
CREATE POLICY "Public read access to recent scrape_logs"
ON scrape_logs
FOR SELECT
TO anon, authenticated
USING (run_date > NOW() - INTERVAL '30 days');

-- Only allow service role to insert scrape logs
CREATE POLICY "Service role full access to scrape_logs"
ON scrape_logs
FOR ALL
TO service_role
USING (true);

-- ============================================================================
-- Helpful Views
-- ============================================================================

-- View: Active supermarkets with halal sections (high confidence)
CREATE OR REPLACE VIEW halal_supermarkets_verified AS
SELECT
  id,
  place_id,
  name,
  address,
  lat,
  lng,
  chain,
  confidence_score,
  reasoning,
  user_ratings_total,
  rating,
  last_checked
FROM supermarkets
WHERE is_active = true
  AND has_halal_section = true
  AND confidence_score >= 0.7
ORDER BY confidence_score DESC, name ASC;

-- View: Recent scrape statistics
CREATE OR REPLACE VIEW recent_scrape_stats AS
SELECT
  run_date,
  region,
  supermarkets_found,
  supermarkets_processed,
  halal_stores_found,
  new_stores_added,
  stores_updated,
  google_api_calls,
  claude_api_calls,
  cost_estimate,
  status,
  duration_seconds
FROM scrape_logs
WHERE run_date > NOW() - INTERVAL '90 days'
ORDER BY run_date DESC;

-- ============================================================================
-- Sample Data (for testing - remove in production)
-- ============================================================================

-- Insert a test supermarket (commented out - uncomment to test)
/*
INSERT INTO supermarkets (
  place_id, name, address, lat, lng, chain,
  has_halal_section, confidence_score, reasoning, source
) VALUES (
  'test_place_123',
  'Coles Lakemba',
  '1 Haldon St, Lakemba NSW 2195',
  -33.9200,
  151.0750,
  'Coles',
  true,
  0.95,
  'Multiple reviews mention extensive halal meat section and halal-certified products. Store confirmed via official response.',
  'Google Reviews + Website'
);
*/

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Function: Get supermarkets within radius (for location search)
CREATE OR REPLACE FUNCTION get_supermarkets_near(
  search_lat DECIMAL,
  search_lng DECIMAL,
  radius_km INTEGER DEFAULT 10,
  halal_only BOOLEAN DEFAULT false,
  min_confidence DECIMAL DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  lat DECIMAL,
  lng DECIMAL,
  chain TEXT,
  has_halal_section BOOLEAN,
  confidence_score DECIMAL,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.address,
    s.lat,
    s.lng,
    s.chain,
    s.has_halal_section,
    s.confidence_score,
    ROUND(
      (6371 * acos(
        cos(radians(search_lat)) * cos(radians(s.lat)) *
        cos(radians(s.lng) - radians(search_lng)) +
        sin(radians(search_lat)) * sin(radians(s.lat))
      ))::NUMERIC,
      2
    ) AS distance_km
  FROM supermarkets s
  WHERE s.is_active = true
    AND (NOT halal_only OR s.has_halal_section = true)
    AND (s.confidence_score IS NULL OR s.confidence_score >= min_confidence)
    AND (
      6371 * acos(
        cos(radians(search_lat)) * cos(radians(s.lat)) *
        cos(radians(s.lng) - radians(search_lng)) +
        sin(radians(search_lat)) * sin(radians(s.lat))
      )
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE supermarkets IS 'Stores supermarket locations and their halal section status';
COMMENT ON TABLE scrape_logs IS 'Tracks automated data collection runs for monitoring';
COMMENT ON COLUMN supermarkets.confidence_score IS 'AI confidence that halal section exists (0.0-1.0)';
COMMENT ON COLUMN supermarkets.reasoning IS 'AI explanation for halal section decision';
COMMENT ON COLUMN scrape_logs.cost_estimate IS 'Estimated API costs in USD for this run';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Tables created:';
  RAISE NOTICE '  - supermarkets';
  RAISE NOTICE '  - scrape_logs';
  RAISE NOTICE 'Views created:';
  RAISE NOTICE '  - halal_supermarkets_verified';
  RAISE NOTICE '  - recent_scrape_stats';
  RAISE NOTICE 'Function created:';
  RAISE NOTICE '  - get_supermarkets_near()';
END $$;
