-- Add columns for enhanced mosque data and contact info
ALTER TABLE public.mosques 
  ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS facilities jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_updated timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS platform_integration text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS platform_mosque_id text DEFAULT NULL;

-- Add columns for enhanced prayer times tracking
ALTER TABLE public.prayer_times
  ADD COLUMN IF NOT EXISTS platform_source text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS data_freshness_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS admin_review_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS facility_updates jsonb DEFAULT NULL;

-- Create index for faster platform integration lookups
CREATE INDEX IF NOT EXISTS idx_mosques_platform_integration 
ON public.mosques(platform_integration) WHERE platform_integration IS NOT NULL;

-- Create index for admin review filtering
CREATE INDEX IF NOT EXISTS idx_prayer_times_admin_review 
ON public.prayer_times(admin_review_required) WHERE admin_review_required = true;

-- Create function to update mosque facilities and contact info
CREATE OR REPLACE FUNCTION public.update_mosque_details(
  p_mosque_id text,
  p_contact_info jsonb DEFAULT NULL,
  p_facilities jsonb DEFAULT NULL,
  p_platform_integration text DEFAULT NULL,
  p_platform_mosque_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.mosques 
  SET 
    contact_info = COALESCE(p_contact_info, contact_info),
    facilities = COALESCE(p_facilities, facilities),
    platform_integration = COALESCE(p_platform_integration, platform_integration),
    platform_mosque_id = COALESCE(p_platform_mosque_id, platform_mosque_id),
    last_updated = now()
  WHERE mosque_id = p_mosque_id;
END;
$$;

-- Create function to flag prayer times for admin review
CREATE OR REPLACE FUNCTION public.flag_prayer_times_for_review(
  p_mosque_id text,
  p_confidence_threshold integer DEFAULT 50
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.prayer_times 
  SET admin_review_required = true
  WHERE mosque_id = p_mosque_id 
    AND extraction_confidence < p_confidence_threshold 
    AND is_current = true;
END;
$$;

-- Create function to get mosque platform integration status
CREATE OR REPLACE FUNCTION public.get_mosque_platform_status(p_mosque_id text)
RETURNS TABLE(
  mosque_id text,
  platform_integration text,
  platform_mosque_id text,
  last_successful_scrape timestamp with time zone,
  avg_confidence numeric,
  needs_review boolean
)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.mosque_id,
    m.platform_integration,
    m.platform_mosque_id,
    (SELECT MAX(pt.last_scrape_attempt) 
     FROM public.prayer_times pt 
     WHERE pt.mosque_id = m.mosque_id AND pt.scrape_success = true) as last_successful_scrape,
    (SELECT AVG(pt.extraction_confidence) 
     FROM public.prayer_times pt 
     WHERE pt.mosque_id = m.mosque_id AND pt.is_current = true) as avg_confidence,
    (SELECT EXISTS(
       SELECT 1 FROM public.prayer_times pt 
       WHERE pt.mosque_id = m.mosque_id 
         AND pt.admin_review_required = true 
         AND pt.is_current = true
     )) as needs_review
  FROM public.mosques m
  WHERE m.mosque_id = p_mosque_id;
END;
$$;