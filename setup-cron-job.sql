-- Day 8: Weekly Cache Refresh Automation
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Step 1: Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Schedule weekly refresh (Sundays at 2:00 AM)
SELECT cron.schedule(
  'weekly-mosque-cache-refresh',           -- Job name
  '0 2 * * 0',                             -- Every Sunday at 2 AM (cron format)
  $$
  SELECT
    net.http_post(
      url := 'https://mzqyswdfgimymxfhdyzw.supabase.co/functions/v1/refresh-cached-mosques',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer sb_publishable_HbYa3Gqb7o106RYax8Aiag_vLQ_Z6xP'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Step 3: Verify the job was created
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'weekly-mosque-cache-refresh';

-- Expected output:
-- jobname: weekly-mosque-cache-refresh
-- schedule: 0 2 * * 0
-- active: true

COMMENT ON EXTENSION pg_cron IS 'Job scheduler - runs weekly mosque cache refresh every Sunday at 2 AM';
