-- Day 8 Monitoring Queries
-- Use these to monitor your weekly cache refresh automation

-- ========================================
-- 1. CHECK CRON JOB STATUS
-- ========================================
-- View your scheduled job details
SELECT
  jobid,
  jobname,
  schedule,
  active,
  created_at
FROM cron.job
WHERE jobname = 'weekly-mosque-cache-refresh';

-- Expected output:
-- jobname: weekly-mosque-cache-refresh
-- schedule: 0 2 * * 0 (Sunday at 2 AM)
-- active: true


-- ========================================
-- 2. VIEW CRON JOB EXECUTION HISTORY
-- ========================================
-- See when the job has run and if it succeeded
SELECT
  start_time,
  end_time,
  status,
  return_message,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job
  WHERE jobname = 'weekly-mosque-cache-refresh'
)
ORDER BY start_time DESC
LIMIT 10;

-- Status meanings:
-- 'succeeded' = Job ran successfully
-- 'failed' = Job encountered an error


-- ========================================
-- 3. VIEW REFRESH OPERATION LOGS
-- ========================================
-- See detailed stats from each refresh operation
SELECT
  created_at,
  cost_estimate,
  response_time_ms,
  metadata->>'total_mosques' as total_mosques,
  metadata->>'updated' as updated,
  metadata->>'unchanged' as unchanged,
  metadata->>'errors' as errors,
  error_message
FROM google_api_logs
WHERE api_type = 'weekly_cache_refresh'
ORDER BY created_at DESC
LIMIT 10;

-- This shows:
-- - When each refresh ran
-- - How much it cost
-- - How many mosques were updated
-- - Any errors that occurred


-- ========================================
-- 4. CHECK CACHE FRESHNESS
-- ========================================
-- See how old your cached data is
SELECT
  COUNT(*) as total_mosques,
  MIN(last_fetched_from_google) as oldest_fetch,
  MAX(last_fetched_from_google) as newest_fetch,
  ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - last_fetched_from_google))/86400), 1) as avg_age_days,
  COUNT(CASE WHEN last_fetched_from_google > NOW() - INTERVAL '7 days' THEN 1 END) as fresh_count,
  COUNT(CASE WHEN last_fetched_from_google <= NOW() - INTERVAL '7 days' THEN 1 END) as stale_count
FROM mosques_cache;

-- This shows:
-- - Total mosques in cache
-- - Oldest and newest data
-- - Average age in days
-- - How many are fresh (< 7 days) vs stale (> 7 days)


-- ========================================
-- 5. MONTHLY COST SUMMARY
-- ========================================
-- Calculate your total Google API costs for the month
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_calls,
  SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END) as cache_hits,
  SUM(CASE WHEN NOT cache_hit THEN 1 ELSE 0 END) as cache_misses,
  ROUND(SUM(cost_estimate)::numeric, 2) as total_cost,
  ROUND(AVG(response_time_ms)::numeric, 0) as avg_response_time_ms
FROM google_api_logs
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- This shows:
-- - Total API calls this month
-- - Cache hit rate
-- - Total cost
-- - Average response time


-- ========================================
-- 6. MANUALLY TRIGGER REFRESH (FOR TESTING)
-- ========================================
-- Run this to test the refresh immediately (don't wait for Sunday)
SELECT
  net.http_post(
    url := 'https://mzqyswdfgimymxfhdyzw.supabase.co/functions/v1/refresh-cached-mosques',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_HbYa3Gqb7o106RYax8Aiag_vLQ_Z6xP'
    ),
    body := '{}'::jsonb
  ) as response;

-- This will return the refresh results immediately


-- ========================================
-- 7. STOP/PAUSE THE AUTOMATION (IF NEEDED)
-- ========================================
-- Unschedule the job (stops it from running)
-- SELECT cron.unschedule('weekly-mosque-cache-refresh');

-- To reschedule it again, run the setup-cron-job.sql script


-- ========================================
-- 8. VIEW ALL SCHEDULED JOBS
-- ========================================
-- See all cron jobs in your database
SELECT
  jobid,
  jobname,
  schedule,
  active,
  created_at
FROM cron.job
ORDER BY jobname;
