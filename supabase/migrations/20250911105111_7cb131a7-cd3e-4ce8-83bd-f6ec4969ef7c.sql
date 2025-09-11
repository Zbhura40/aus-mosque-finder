-- Enable pg_cron and pg_net extensions for automated scraping
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add new columns to prayer_times table for enhanced tracking
ALTER TABLE public.prayer_times 
ADD COLUMN IF NOT EXISTS source_format TEXT,
ADD COLUMN IF NOT EXISTS extraction_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parsing_notes TEXT,
ADD COLUMN IF NOT EXISTS last_scrape_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scrape_success BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_scraped BOOLEAN DEFAULT false;

-- Add index for better query performance on scraping
CREATE INDEX IF NOT EXISTS idx_prayer_times_scraping ON public.prayer_times (mosque_id, last_scrape_attempt, scrape_success);

-- Create a separate table to track scraping history and errors
CREATE TABLE IF NOT EXISTS public.scraping_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mosque_id TEXT NOT NULL,
  website_url TEXT NOT NULL,
  scrape_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false,
  source_format TEXT,
  extraction_confidence INTEGER DEFAULT 0,
  error_message TEXT,
  raw_content_preview TEXT,
  times_found JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for scraping logs
CREATE INDEX IF NOT EXISTS idx_scraping_logs_mosque ON public.scraping_logs (mosque_id, scrape_date DESC);

-- Add RLS policies for scraping logs
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scraping logs are publicly readable" 
ON public.scraping_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Prevent public inserts to scraping_logs" 
ON public.scraping_logs 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Prevent public updates to scraping_logs" 
ON public.scraping_logs 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent public deletes to scraping_logs" 
ON public.scraping_logs 
FOR DELETE 
USING (false);