-- ===========================================================================
-- Halal Supermarket Finder - Test Queries
-- Run these in Supabase SQL Editor to test your database
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- TEST 1: Insert Sample Supermarkets
-- ---------------------------------------------------------------------------

-- Insert Coles Lakemba (known halal section)
INSERT INTO supermarkets (
  place_id, name, address, lat, lng, chain,
  has_halal_section, confidence_score, reasoning, source,
  rating, user_ratings_total
) VALUES (
  'ChIJ_TEST_coles_lakemba',
  'Coles Lakemba',
  '1 Haldon St, Lakemba NSW 2195, Australia',
  -33.9200, 151.0750, 'Coles',
  true, 0.95,
  'Multiple verified reviews mention extensive halal meat section and certified products.',
  'Google Reviews + Social Media',
  4.2, 387
);

-- Insert Woolworths Auburn (known halal section)
INSERT INTO supermarkets (
  place_id, name, address, lat, lng, chain,
  has_halal_section, confidence_score, reasoning, source,
  rating, user_ratings_total
) VALUES (
  'ChIJ_TEST_woolworths_auburn',
  'Woolworths Auburn',
  '1 Auburn Rd, Auburn NSW 2144, Australia',
  -33.8496, 151.0328, 'Woolworths',
  true, 0.88,
  'Reviews confirm halal meat counter and dedicated halal products section.',
  'Google Reviews',
  4.0, 523
);

-- Insert IGA Punchbowl (halal section)
INSERT INTO supermarkets (
  place_id, name, address, lat, lng, chain,
  has_halal_section, confidence_score, reasoning, source,
  rating, user_ratings_total
) VALUES (
  'ChIJ_TEST_iga_punchbowl',
  'IGA Punchbowl',
  '1055 Canterbury Rd, Punchbowl NSW 2196, Australia',
  -33.9290, 151.0545, 'IGA',
  true, 0.92,
  'Store specializes in halal products with extensive halal meat and grocery range.',
  'Website + Google Reviews',
  4.5, 234
);

-- Insert Coles Bondi (NO halal section)
INSERT INTO supermarkets (
  place_id, name, address, lat, lng, chain,
  has_halal_section, confidence_score, reasoning, source,
  rating, user_ratings_total
) VALUES (
  'ChIJ_TEST_coles_bondi',
  'Coles Bondi Junction',
  '500 Oxford St, Bondi Junction NSW 2022, Australia',
  -33.8915, 151.2505, 'Coles',
  false, 0.85,
  'Multiple reviews confirm no dedicated halal section. Some halal products available but not a dedicated section.',
  'Google Reviews',
  3.9, 612
);

-- Insert Woolworths Parramatta (halal section)
INSERT INTO supermarkets (
  place_id, name, address, lat, lng, chain,
  has_halal_section, confidence_score, reasoning, source,
  rating, user_ratings_total
) VALUES (
  'ChIJ_TEST_woolworths_parramatta',
  'Woolworths Parramatta',
  '159-175 Church St, Parramatta NSW 2150, Australia',
  -33.8150, 151.0040, 'Woolworths',
  true, 0.80,
  'Recent reviews mention halal meat section. Smaller selection compared to other locations.',
  'Google Reviews',
  4.1, 441
);

-- ---------------------------------------------------------------------------
-- TEST 2: View All Supermarkets
-- ---------------------------------------------------------------------------

SELECT
  name,
  address,
  chain,
  has_halal_section,
  confidence_score,
  rating
FROM supermarkets
ORDER BY confidence_score DESC;

-- ---------------------------------------------------------------------------
-- TEST 3: View Only Halal Supermarkets (High Confidence)
-- ---------------------------------------------------------------------------

SELECT * FROM halal_supermarkets_verified;

-- ---------------------------------------------------------------------------
-- TEST 4: Search Near Lakemba (10km radius)
-- ---------------------------------------------------------------------------

SELECT
  name,
  address,
  chain,
  has_halal_section,
  confidence_score,
  distance_km
FROM get_supermarkets_near(
  -33.9200,  -- Lakemba latitude
  151.0750,  -- Lakemba longitude
  10,        -- 10km radius
  true,      -- halal_only = true
  0.7        -- min_confidence = 0.7
)
ORDER BY distance_km;

-- ---------------------------------------------------------------------------
-- TEST 5: Search Near Bondi (15km radius, all stores)
-- ---------------------------------------------------------------------------

SELECT
  name,
  address,
  has_halal_section,
  confidence_score,
  distance_km
FROM get_supermarkets_near(
  -33.8915,  -- Bondi latitude
  151.2505,  -- Bondi longitude
  15,        -- 15km radius
  false,     -- halal_only = false (show all)
  0.0        -- min_confidence = 0.0 (any)
)
ORDER BY distance_km;

-- ---------------------------------------------------------------------------
-- TEST 6: Count Supermarkets by Chain
-- ---------------------------------------------------------------------------

SELECT
  chain,
  COUNT(*) as total_stores,
  SUM(CASE WHEN has_halal_section THEN 1 ELSE 0 END) as with_halal,
  ROUND(
    AVG(CASE WHEN has_halal_section THEN confidence_score ELSE NULL END)::numeric,
    2
  ) as avg_confidence
FROM supermarkets
WHERE is_active = true
GROUP BY chain
ORDER BY with_halal DESC;

-- ---------------------------------------------------------------------------
-- TEST 7: Insert a Scrape Log Entry
-- ---------------------------------------------------------------------------

INSERT INTO scrape_logs (
  region,
  batch_size,
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
) VALUES (
  'Sydney Metro',
  50,
  50,
  50,
  15,
  5,
  10,
  100,
  50,
  4.85,
  'success',
  245
);

-- ---------------------------------------------------------------------------
-- TEST 8: View Recent Scrape Statistics
-- ---------------------------------------------------------------------------

SELECT * FROM recent_scrape_stats;

-- ---------------------------------------------------------------------------
-- TEST 9: Update a Supermarket
-- ---------------------------------------------------------------------------

-- Let's say we verify Bondi actually HAS a halal section now
UPDATE supermarkets
SET
  has_halal_section = true,
  confidence_score = 0.90,
  reasoning = 'Store recently added halal section as confirmed by manager and recent reviews.',
  source = 'Store Manager + Google Reviews',
  last_checked = NOW()
WHERE place_id = 'ChIJ_TEST_coles_bondi';

-- Verify the update
SELECT name, has_halal_section, confidence_score, last_checked
FROM supermarkets
WHERE place_id = 'ChIJ_TEST_coles_bondi';

-- ---------------------------------------------------------------------------
-- TEST 10: Delete Test Data (Clean Up)
-- ---------------------------------------------------------------------------

-- Run this when you're done testing
DELETE FROM supermarkets WHERE place_id LIKE 'ChIJ_TEST_%';
DELETE FROM scrape_logs WHERE region = 'Sydney Metro';

-- Verify clean up
SELECT COUNT(*) as remaining_supermarkets FROM supermarkets;
SELECT COUNT(*) as remaining_logs FROM scrape_logs;

-- ---------------------------------------------------------------------------
-- TEST 11: Test RLS Policies (Security)
-- ---------------------------------------------------------------------------

-- This should work (public read access)
SELECT COUNT(*) FROM supermarkets;

-- This should work (public read access to recent logs)
SELECT COUNT(*) FROM scrape_logs WHERE run_date > NOW() - INTERVAL '30 days';

-- ---------------------------------------------------------------------------
-- TEST 12: Geographic Distribution
-- ---------------------------------------------------------------------------

-- See which areas have most halal supermarkets
SELECT
  CASE
    WHEN lat > -33.8 THEN 'North Sydney'
    WHEN lat BETWEEN -33.9 AND -33.8 THEN 'Central Sydney'
    WHEN lat < -33.9 THEN 'South Sydney'
  END as area,
  COUNT(*) as total,
  SUM(CASE WHEN has_halal_section THEN 1 ELSE 0 END) as with_halal
FROM supermarkets
GROUP BY area;

-- ---------------------------------------------------------------------------
-- TEST 13: Confidence Score Distribution
-- ---------------------------------------------------------------------------

SELECT
  CASE
    WHEN confidence_score >= 0.9 THEN 'High (0.9-1.0)'
    WHEN confidence_score >= 0.8 THEN 'Good (0.8-0.89)'
    WHEN confidence_score >= 0.7 THEN 'Medium (0.7-0.79)'
    ELSE 'Low (<0.7)'
  END as confidence_level,
  COUNT(*) as count
FROM supermarkets
WHERE has_halal_section = true
GROUP BY confidence_level
ORDER BY MIN(confidence_score) DESC;

-- ===========================================================================
-- QUICK REFERENCE COMMANDS
-- ===========================================================================

-- Add a new supermarket:
-- INSERT INTO supermarkets (place_id, name, address, lat, lng, chain, has_halal_section, confidence_score, reasoning, source)
-- VALUES ('place_id', 'Name', 'Address', lat, lng, 'Chain', true/false, 0.XX, 'reasoning', 'source');

-- Search near location:
-- SELECT * FROM get_supermarkets_near(lat, lng, radius_km, halal_only, min_confidence);

-- View all halal stores:
-- SELECT * FROM halal_supermarkets_verified;

-- Count stores:
-- SELECT COUNT(*) FROM supermarkets WHERE has_halal_section = true;

-- Update store:
-- UPDATE supermarkets SET has_halal_section = true WHERE place_id = 'xxx';

-- Delete store:
-- DELETE FROM supermarkets WHERE place_id = 'xxx';

-- ===========================================================================
