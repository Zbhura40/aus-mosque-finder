-- ============================================================================
-- STEP 1: CHECK ALL CRON JOBS
-- ============================================================================
-- Run this first to see what cron jobs exist

SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
ORDER BY jobid DESC;

-- What to look for:
-- - Is there a job named 'weekly-mosque-cache-refresh'?
-- - What is the jobid? (should be 6 based on your notes)
-- - Is active = true?


-- ============================================================================
-- STEP 2: CHECK CRON EXECUTION HISTORY
-- ============================================================================
-- See if the cron job has been trying to run

SELECT
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- What to look for:
-- - Any runs after Oct 25, 2025?
-- - Any errors in return_message?
-- - Status = 'succeeded' or 'failed'?


-- ============================================================================
-- STEP 3: CHECK LAST CACHE UPDATE
-- ============================================================================

SELECT
  MAX(last_updated) as last_update,
  COUNT(*) as total_mosques,
  ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(last_updated))) / 86400) as days_old
FROM mosques_cache;

-- What to look for:
-- - Should show how old your data is
-- - Currently expecting ~36 days old (Oct 11)


-- ============================================================================
-- STEP 4: CHECK IF PG_NET EXTENSION EXISTS
-- ============================================================================

SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- What to look for:
-- - Should show 1 row if extension is installed
-- - If empty, this is the problem!
