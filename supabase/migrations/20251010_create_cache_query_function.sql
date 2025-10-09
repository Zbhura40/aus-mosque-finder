-- Create function to query mosques within radius using PostGIS
-- This function is called by the Edge Function to check cache before hitting Google API

CREATE OR REPLACE FUNCTION get_mosques_within_radius(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  radius_meters INTEGER,
  max_age_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  google_place_id TEXT,
  name TEXT,
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone_number TEXT,
  website TEXT,
  email TEXT,
  google_rating DECIMAL(2,1),
  google_review_count INTEGER,
  opening_hours JSONB,
  is_open_now BOOLEAN,
  photos JSONB,
  formatted_address TEXT,
  place_types TEXT[],
  business_status TEXT,
  editorial_summary TEXT,
  distance_km DOUBLE PRECISION,
  last_fetched_from_google TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.google_place_id,
    mc.name,
    mc.address,
    mc.suburb,
    mc.state,
    mc.postcode,
    mc.latitude,
    mc.longitude,
    mc.phone_number,
    mc.website,
    mc.email,
    mc.google_rating,
    mc.google_review_count,
    mc.opening_hours,
    mc.is_open_now,
    mc.photos,
    mc.formatted_address,
    mc.place_types,
    mc.business_status,
    mc.editorial_summary,
    -- Calculate distance in kilometers
    ST_Distance(
      mc.location::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    ) / 1000.0 AS distance_km,
    mc.last_fetched_from_google
  FROM mosques_cache mc
  WHERE
    -- Only return mosques within the search radius
    ST_DWithin(
      mc.location::geography,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
      radius_meters
    )
    -- Only return mosques that were fetched recently (fresh data)
    AND mc.last_fetched_from_google > NOW() - INTERVAL '1 day' * max_age_days
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment explaining the function
COMMENT ON FUNCTION get_mosques_within_radius IS
'Searches mosques_cache table for mosques within a given radius of a lat/lng point.
Only returns mosques that were fetched from Google API within the last max_age_days (default 30).
Used by get-mosque-details Edge Function to check cache before making expensive Google API calls.';
