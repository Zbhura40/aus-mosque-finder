-- Comprehensive Database Audit Query
-- Run this in Supabase SQL Editor to get complete audit information

-- ============================================================================
-- 1. List all tables in public schema
-- ============================================================================
SELECT
  'TABLES' as category,
  table_name,
  NULL as detail
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. Check RLS status for each table
-- ============================================================================
SELECT
  'RLS_STATUS' as category,
  tablename as table_name,
  CASE
    WHEN rowsecurity = true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as detail
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 3. List all RLS policies
-- ============================================================================
SELECT
  'RLS_POLICIES' as category,
  schemaname || '.' || tablename as table_name,
  policyname || ' (' || cmd || ')' as detail
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 4. Check table columns for key tables
-- ============================================================================
SELECT
  'COLUMNS' as category,
  table_name,
  column_name || ' (' || data_type || ')' as detail
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('mosques', 'prayer_times', 'feedback', 'supermarkets', 'scraping_logs', 'scrape_logs')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- 5. Check indexes
-- ============================================================================
SELECT
  'INDEXES' as category,
  tablename as table_name,
  indexname as detail
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 6. Check views
-- ============================================================================
SELECT
  'VIEWS' as category,
  table_name,
  NULL as detail
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 7. Check functions
-- ============================================================================
SELECT
  'FUNCTIONS' as category,
  routine_name as table_name,
  routine_type as detail
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================================================
-- 8. Row counts for each table
-- ============================================================================
SELECT
  'ROW_COUNTS' as category,
  'mosques' as table_name,
  COUNT(*)::text as detail
FROM mosques
UNION ALL
SELECT
  'ROW_COUNTS' as category,
  'prayer_times' as table_name,
  COUNT(*)::text as detail
FROM prayer_times
UNION ALL
SELECT
  'ROW_COUNTS' as category,
  'feedback' as table_name,
  COUNT(*)::text as detail
FROM feedback
UNION ALL
SELECT
  'ROW_COUNTS' as category,
  'supermarkets' as table_name,
  COUNT(*)::text as detail
FROM supermarkets
UNION ALL
SELECT
  'ROW_COUNTS' as category,
  'scraping_logs' as table_name,
  COUNT(*)::text as detail
FROM scraping_logs
UNION ALL
SELECT
  'ROW_COUNTS' as category,
  'scrape_logs' as table_name,
  COUNT(*)::text as detail
FROM scrape_logs
ORDER BY table_name;
