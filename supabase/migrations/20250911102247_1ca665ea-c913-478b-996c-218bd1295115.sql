-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily prayer times update at 3 AM Australian time
SELECT cron.schedule(
  'daily-prayer-times-update',
  '0 3 * * *', -- Every day at 3 AM
  $$
  SELECT
    net.http_post(
        url:='https://mzqyswdfgimymxfhdyzw.supabase.co/functions/v1/update-prayer-times-daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXlzd2RmZ2lteW14ZmhkeXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTQwNTcsImV4cCI6MjA3MDI3MDA1N30.qkkq3aONTPILxlBCy8byNFUYd93ufKNm68uawwxO6NI"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);