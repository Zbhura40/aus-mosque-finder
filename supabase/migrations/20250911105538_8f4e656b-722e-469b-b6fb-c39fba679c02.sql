-- Set up automated prayer time scraping every 2 days
-- This will call the update-prayer-times-daily function which in turn calls scrape-prayer-times
SELECT cron.schedule(
  'auto-scrape-prayer-times',
  '0 6 */2 * *', -- Run at 6 AM every 2 days
  $$
  SELECT
    net.http_post(
        url:='https://mzqyswdfgimymxfhdyzw.supabase.co/functions/v1/update-prayer-times-daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXlzd2RmZ2lteW14ZmhkeXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTQwNTcsImV4cCI6MjA3MDI3MDA1N30.qkkq3aONTPILxlBCy8byNFUYd93ufKNm68uawwxO6NI"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to get mosques needing scraping
CREATE OR REPLACE FUNCTION public.get_mosques_needing_scrape()
RETURNS TABLE (
  mosque_id TEXT,
  name TEXT,
  website TEXT,
  last_scrape TIMESTAMP WITH TIME ZONE,
  days_since_scrape INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.mosque_id,
    m.name,
    m.phone as website, -- Using phone field temporarily for website URLs
    pt.last_scrape_attempt,
    COALESCE(
      EXTRACT(days FROM (NOW() - pt.last_scrape_attempt))::INTEGER,
      999
    ) as days_since_scrape
  FROM public.mosques m
  LEFT JOIN (
    SELECT DISTINCT ON (mosque_id) 
      mosque_id, 
      last_scrape_attempt
    FROM public.prayer_times 
    WHERE last_scrape_attempt IS NOT NULL
    ORDER BY mosque_id, last_scrape_attempt DESC
  ) pt ON m.mosque_id = pt.mosque_id
  WHERE m.phone IS NOT NULL 
    AND m.phone LIKE 'http%'
    AND (
      pt.last_scrape_attempt IS NULL 
      OR pt.last_scrape_attempt < NOW() - INTERVAL '2 days'
    )
  ORDER BY days_since_scrape DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to mark old prayer times as not current
CREATE OR REPLACE FUNCTION public.update_prayer_times_currency()
RETURNS void AS $$
BEGIN
  -- Mark prayer times older than 7 days as not current
  UPDATE public.prayer_times 
  SET is_current = false
  WHERE date < CURRENT_DATE - INTERVAL '7 days'
    AND is_current = true;
END;
$$ LANGUAGE plpgsql;

-- Schedule the currency update to run daily
SELECT cron.schedule(
  'update-prayer-times-currency',
  '0 5 * * *', -- Run at 5 AM daily
  'SELECT public.update_prayer_times_currency();'
);