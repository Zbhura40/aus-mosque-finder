-- Fix: Add 'weekly_cache_refresh' to allowed api_types
-- This allows the weekly cron job to log its operations properly

-- Drop the existing CHECK constraint
ALTER TABLE google_api_logs
DROP CONSTRAINT IF EXISTS google_api_logs_api_type_check;

-- Add new CHECK constraint with 'weekly_cache_refresh' included
ALTER TABLE google_api_logs
ADD CONSTRAINT google_api_logs_api_type_check
CHECK (api_type IN (
    'autocomplete',
    'geocode',
    'place_details',
    'place_search',
    'nearby_search',
    'text_search',
    'weekly_cache_refresh'
));

COMMENT ON CONSTRAINT google_api_logs_api_type_check ON google_api_logs
IS 'Allowed API types including weekly_cache_refresh for cron job logging';
