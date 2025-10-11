-- Cleanup Test Data from Production Database
-- This script identifies and removes all test/placeholder data

-- ========================================
-- 1. FIND TEST DATA IN MOSQUES_CACHE
-- ========================================
SELECT
  google_place_id,
  name,
  address,
  suburb,
  state,
  postcode,
  last_fetched_from_google
FROM mosques_cache
WHERE
  name ILIKE '%test%'
  OR name ILIKE '%placeholder%'
  OR name ILIKE '%example%'
  OR name ILIKE '%demo%'
  OR name ILIKE '%dummy%'
  OR address ILIKE '%test%'
  OR address ILIKE '%123%'
ORDER BY name;

-- Expected: This will show "Test Mosque Sydney" and any other test entries


-- ========================================
-- 2. DELETE TEST DATA FROM MOSQUES_CACHE
-- ========================================
DELETE FROM mosques_cache
WHERE
  name ILIKE '%test%'
  OR name ILIKE '%placeholder%'
  OR name ILIKE '%example%'
  OR name ILIKE '%demo%'
  OR name ILIKE '%dummy%'
  OR (name ILIKE '%mosque%' AND address ILIKE '%123 test%');

-- This removes all test entries


-- ========================================
-- 3. FIND TEST DATA IN MOSQUES TABLE (LEGACY)
-- ========================================
SELECT
  id,
  name,
  address,
  suburb,
  state
FROM mosques
WHERE
  name ILIKE '%test%'
  OR name ILIKE '%placeholder%'
  OR name ILIKE '%example%'
  OR name ILIKE '%mosque name%'
  OR address ILIKE '%123 street%'
ORDER BY name;


-- ========================================
-- 4. DELETE TEST DATA FROM MOSQUES TABLE
-- ========================================
DELETE FROM mosques
WHERE
  name ILIKE '%test%'
  OR name ILIKE '%placeholder%'
  OR name ILIKE '%example%'
  OR name ILIKE '%mosque name%'
  OR address ILIKE '%123 street%';


-- ========================================
-- 5. CHECK SUPERMARKETS FOR TEST DATA
-- ========================================
SELECT
  id,
  name,
  address,
  suburb
FROM supermarkets
WHERE
  name ILIKE '%test%'
  OR name ILIKE '%placeholder%'
  OR address ILIKE '%123%';


-- ========================================
-- 6. DELETE TEST SUPERMARKETS
-- ========================================
DELETE FROM supermarkets
WHERE
  name ILIKE '%test%'
  OR name ILIKE '%placeholder%'
  OR address ILIKE '%123%';


-- ========================================
-- 7. VERIFY CLEANUP - CHECK REMAINING DATA
-- ========================================

-- Check mosques_cache
SELECT
  COUNT(*) as total_mosques_cache,
  MIN(name) as first_mosque,
  MAX(name) as last_mosque
FROM mosques_cache;

-- Check mosques (legacy)
SELECT
  COUNT(*) as total_mosques_legacy
FROM mosques;

-- Check supermarkets
SELECT
  COUNT(*) as total_supermarkets
FROM supermarkets;


-- ========================================
-- 8. VIEW SAMPLE OF CLEAN DATA
-- ========================================

-- Sample mosques in Sydney
SELECT
  name,
  address,
  suburb,
  postcode,
  google_rating
FROM mosques_cache
WHERE
  suburb ILIKE '%sydney%'
  OR postcode IN ('2000', '2010', '2017', '2020')
ORDER BY name
LIMIT 10;
