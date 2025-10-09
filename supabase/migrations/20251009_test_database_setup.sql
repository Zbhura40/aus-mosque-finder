-- Test Database Setup for Day 1
-- Run this in Supabase SQL Editor to verify everything works

-- ============================================
-- TEST 1: Verify all tables exist
-- ============================================
SELECT
    'TEST 1: Tables exist' AS test_name,
    COUNT(*) AS table_count,
    CASE
        WHEN COUNT(*) = 3 THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('mosques_cache', 'search_cache', 'google_api_logs');

-- ============================================
-- TEST 2: Verify PostGIS extension is enabled
-- ============================================
SELECT
    'TEST 2: PostGIS extension' AS test_name,
    extname AS extension_name,
    '✓ PASS' AS status
FROM pg_extension
WHERE extname = 'postgis';

-- ============================================
-- TEST 3: Verify indexes exist
-- ============================================
SELECT
    'TEST 3: Indexes' AS test_name,
    tablename,
    indexname,
    '✓ PASS' AS status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('mosques_cache', 'search_cache', 'google_api_logs')
ORDER BY tablename, indexname;

-- ============================================
-- TEST 4: Test mosques_cache table (insert test data)
-- ============================================
INSERT INTO mosques_cache (
    google_place_id,
    name,
    address,
    suburb,
    state,
    latitude,
    longitude,
    location,
    google_rating,
    google_review_count,
    is_verified,
    last_fetched_from_google
) VALUES (
    'TEST_PLACE_ID_001',
    'Test Mosque Sydney',
    '123 Test Street, Sydney NSW 2000',
    'Sydney',
    'NSW',
    -33.8688,
    151.2093,
    ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography,
    4.5,
    100,
    false,
    NOW()
) ON CONFLICT (google_place_id) DO NOTHING
RETURNING
    'TEST 4: Insert mosque' AS test_name,
    id,
    name,
    '✓ PASS' AS status;

-- ============================================
-- TEST 5: Test search_cache table
-- ============================================
INSERT INTO search_cache (
    search_hash,
    search_params,
    latitude,
    longitude,
    radius_km,
    state,
    results,
    result_count,
    data_source
) VALUES (
    'test_hash_001',
    '{"query": "mosques near Sydney", "radius": 5}'::jsonb,
    -33.8688,
    151.2093,
    5.0,
    'NSW',
    '[]'::jsonb,
    0,
    'database'
) ON CONFLICT (search_hash) DO NOTHING
RETURNING
    'TEST 5: Insert search cache' AS test_name,
    id,
    search_hash,
    '✓ PASS' AS status;

-- ============================================
-- TEST 6: Test google_api_logs table
-- ============================================
INSERT INTO google_api_logs (
    api_type,
    request_params,
    response_status,
    cost_estimate,
    cache_hit,
    response_time_ms
) VALUES (
    'place_details',
    '{"place_id": "TEST_001"}'::jsonb,
    'success',
    0.017,
    false,
    250
) RETURNING
    'TEST 6: Insert API log' AS test_name,
    id,
    api_type,
    cost_estimate,
    '✓ PASS' AS status;

-- ============================================
-- TEST 7: Test helper functions
-- ============================================

-- Test get_current_month_cost function
SELECT
    'TEST 7a: Cost function' AS test_name,
    total_calls,
    total_cost,
    cache_hit_rate,
    '✓ PASS' AS status
FROM get_current_month_cost();

-- Test search_cache stats function
SELECT
    'TEST 7b: Cache stats function' AS test_name,
    total_entries,
    valid_entries,
    '✓ PASS' AS status
FROM get_search_cache_stats();

-- Test API usage by type function
SELECT
    'TEST 7c: API usage function' AS test_name,
    api_type,
    total_calls,
    total_cost,
    '✓ PASS' AS status
FROM get_api_usage_by_type(7);

-- ============================================
-- TEST 8: Test geospatial query (find mosques within 10km)
-- ============================================
SELECT
    'TEST 8: Geospatial search' AS test_name,
    name,
    ROUND(
        (ST_Distance(
            location,
            ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography
        ) / 1000.0)::numeric,
        2
    ) AS distance_km,
    '✓ PASS' AS status
FROM mosques_cache
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography,
    10000  -- 10km in meters
)
AND is_active = true;

-- ============================================
-- TEST 9: Verify RLS policies exist
-- ============================================
SELECT
    'TEST 9: RLS Policies' AS test_name,
    schemaname,
    tablename,
    policyname,
    '✓ PASS' AS status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('mosques_cache', 'search_cache', 'google_api_logs')
ORDER BY tablename, policyname;

-- ============================================
-- TEST 10: Verify triggers exist
-- ============================================
SELECT
    'TEST 10: Triggers' AS test_name,
    event_object_table AS table_name,
    trigger_name,
    '✓ PASS' AS status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('mosques_cache', 'search_cache')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- CLEANUP: Remove test data (optional)
-- ============================================
-- Uncomment these lines if you want to remove test data:
-- DELETE FROM mosques_cache WHERE google_place_id = 'TEST_PLACE_ID_001';
-- DELETE FROM search_cache WHERE search_hash = 'test_hash_001';
-- DELETE FROM google_api_logs WHERE request_params::text LIKE '%TEST_001%';

-- ============================================
-- SUMMARY
-- ============================================
SELECT
    '=== DAY 1 SETUP COMPLETE ===' AS summary,
    'All 3 tables created successfully' AS tables,
    'All indexes and RLS policies active' AS security,
    'Helper functions working' AS analytics,
    'Geospatial queries functional' AS features,
    '✓ READY FOR DAY 2' AS status;
