-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.get_mosques_needing_scrape()
RETURNS TABLE (
  mosque_id TEXT,
  name TEXT,
  website TEXT,
  last_scrape TIMESTAMP WITH TIME ZONE,
  days_since_scrape INTEGER
) 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- Fix the update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_prayer_times_currency()
RETURNS void 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Mark prayer times older than 7 days as not current
  UPDATE public.prayer_times 
  SET is_current = false
  WHERE date < CURRENT_DATE - INTERVAL '7 days'
    AND is_current = true;
END;
$$;