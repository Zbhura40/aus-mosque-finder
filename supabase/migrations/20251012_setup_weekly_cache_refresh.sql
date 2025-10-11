-- Weekly Cache Refresh Automation (Day 8)
-- This migration sets up automatic weekly refreshing of cached mosque data
-- Runs every Sunday at 2:00 AM Australian Eastern Time (AEST/AEDT)

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the weekly cache refresh
-- Cron format: minute hour day_of_month month day_of_week
-- '0 2 * * 0' = Every Sunday at 2:00 AM

SELECT cron.schedule(
  'weekly-mosque-cache-refresh',           -- Job name
  '0 2 * * 0',                             -- Every Sunday at 2 AM
  $$
  SELECT
    net.http_post(
      url := 'https://XXXXXX.supabase.co/functions/v1/refresh-cached-mosques',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- To manually unschedule the job (if needed):
-- SELECT cron.unschedule('weekly-mosque-cache-refresh');

-- To manually trigger the refresh (for testing):
-- SELECT
--   net.http_post(
--     url := 'https://XXXXXX.supabase.co/functions/v1/refresh-cached-mosques',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY'
--     ),
--     body := '{}'::jsonb
--   );

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - used for weekly mosque cache refresh';
