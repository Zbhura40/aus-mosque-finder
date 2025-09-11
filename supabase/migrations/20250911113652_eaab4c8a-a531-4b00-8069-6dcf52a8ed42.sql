-- Create a cron job to update mosque facilities weekly
SELECT cron.schedule(
  'update-mosque-facilities-weekly',
  '0 6 * * 0',  -- Every Sunday at 6 AM
  $$
  SELECT
    net.http_post(
        url:='https://mzqyswdfgimymxfhdyzw.supabase.co/functions/v1/update-mosque-facilities',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXlzd2RmZ2lteW14ZmhkeXp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY5NDA1NywiZXhwIjoyMDcwMjcwMDU3fQ.CR1RahB1KuP9LuPLarXm2EeKNWavjGGv4oGp-LoFgK0"}'::jsonb,
        body:=concat('{"forceRefresh": false, "automated": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);