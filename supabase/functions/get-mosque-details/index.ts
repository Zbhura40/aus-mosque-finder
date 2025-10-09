import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

interface MosqueData {
  google_place_id: string;
  name: string;
  address: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  location: string; // PostGIS point format
  latitude: number;
  longitude: number;
  phone_number?: string;
  website?: string;
  email?: string;
  google_rating?: number;
  google_review_count?: number;
  opening_hours?: any;
  is_open_now?: boolean;
  photos?: any;
  formatted_address?: string;
  place_types?: string[];
  business_status?: string;
  editorial_summary?: string;
  last_fetched_from_google: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { latitude, longitude, radius }: SearchRequest = await req.json();

    // Validate inputs
    if (!latitude || !longitude || !radius) {
      throw new Error('Missing required parameters: latitude, longitude, radius');
    }

    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!googleApiKey) {
      throw new Error('Google Places API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    // Initialize Supabase client with service role key for full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Searching for mosques at (${latitude}, ${longitude}) within ${radius}m`);

    // STEP 1: Check cache first using PostGIS distance query
    console.log('STEP 1: Checking cache...');
    const { data: cachedMosques, error: cacheError } = await supabase.rpc(
      'get_mosques_within_radius',
      {
        search_lat: latitude,
        search_lng: longitude,
        radius_meters: radius,
        max_age_days: 30 // Only return mosques fetched within last 30 days
      }
    );

    if (cacheError) {
      console.error('Cache query error:', cacheError);
      // Continue to Google API fallback if cache fails
    }

    let mosques = [];
    let cacheHit = false;

    if (cachedMosques && cachedMosques.length > 0) {
      console.log(`✓ Cache HIT: Found ${cachedMosques.length} mosques in cache`);
      cacheHit = true;

      // Format cached mosques to match expected output format
      mosques = cachedMosques.map((mosque: any) => ({
        id: mosque.google_place_id,
        name: mosque.name,
        address: mosque.formatted_address || mosque.address,
        distance: `${mosque.distance_km.toFixed(1)}km`,
        rating: mosque.google_rating,
        isOpen: mosque.is_open_now,
        phone: mosque.phone_number,
        website: mosque.website,
        email: mosque.email,
        photoUrl: mosque.photos?.[0]?.url,
        latitude: mosque.latitude,
        longitude: mosque.longitude,
        editorial_summary: mosque.editorial_summary
      }));

      // Log cache hit (free operation!)
      await logApiCall(supabase, 'cache_hit', 0, true, Date.now() - startTime);

    } else {
      console.log('✗ Cache MISS: Fetching from Google API...');

      // STEP 2: Fall back to Google Places API
      const googleStartTime = Date.now();
      const placesUrl = `https://places.googleapis.com/v1/places:searchNearby`;

      const requestBody = {
        includedTypes: ["mosque"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius
          }
        },
        regionCode: "AU",
        languageCode: "en"
      };

      console.log('Calling Google Places API...');
      const response = await fetch(placesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleApiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.editorialSummary,places.photos,places.types,places.businessStatus'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      const googleResponseTime = Date.now() - googleStartTime;

      if (!response.ok) {
        console.error('Google Places API error:', data);
        await logApiCall(supabase, 'places_search_nearby', 0.032, false, googleResponseTime, JSON.stringify(data.error));
        throw new Error(`Google Places API error: ${data.error?.message || 'Unknown error'}`);
      }

      // Log successful Google API call (Nearby Search = $0.032 per call)
      const resultsCount = data.places?.length || 0;
      await logApiCall(supabase, 'places_search_nearby', 0.032, false, googleResponseTime);

      console.log(`Google API returned ${resultsCount} mosques`);

      // STEP 3: Process and save to cache
      mosques = await Promise.all((data.places || []).map(async (place: any) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          place.location.latitude,
          place.location.longitude
        );

        let website = place.websiteUri;
        let photoUrl = undefined;
        let photoReference = undefined;

        // Get photo URL if available
        if (place.photos && place.photos.length > 0) {
          photoReference = place.photos[0].name;
          if (photoReference) {
            photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=600&key=${googleApiKey}`;
          }
        }

        // Parse address components
        const addressParts = (place.formattedAddress || '').split(',').map((s: string) => s.trim());
        let suburb = undefined;
        let state = undefined;
        let postcode = undefined;

        if (addressParts.length >= 3) {
          suburb = addressParts[addressParts.length - 3];
          const statePostcode = addressParts[addressParts.length - 2];
          const match = statePostcode.match(/([A-Z]+)\s+(\d{4})/);
          if (match) {
            state = match[1];
            postcode = match[2];
          }
        }

        // Prepare mosque data for cache
        const mosqueData: MosqueData = {
          google_place_id: place.id,
          name: place.displayName?.text || 'Unknown Mosque',
          address: place.formattedAddress || 'Address not available',
          suburb,
          state,
          postcode,
          location: `POINT(${place.location.longitude} ${place.location.latitude})`,
          latitude: place.location.latitude,
          longitude: place.location.longitude,
          phone_number: place.nationalPhoneNumber || place.internationalPhoneNumber,
          website,
          google_rating: place.rating,
          google_review_count: place.userRatingCount,
          opening_hours: place.currentOpeningHours,
          is_open_now: place.currentOpeningHours?.openNow,
          photos: photoUrl ? [{ url: photoUrl, reference: photoReference }] : [],
          formatted_address: place.formattedAddress,
          place_types: place.types,
          business_status: place.businessStatus,
          editorial_summary: place.editorialSummary?.text,
          last_fetched_from_google: new Date().toISOString()
        };

        // Save to cache (upsert: update if exists, insert if new)
        const { error: cacheInsertError } = await supabase
          .from('mosques_cache')
          .upsert(mosqueData, {
            onConflict: 'google_place_id'
          });

        if (cacheInsertError) {
          console.error(`Error caching mosque ${mosqueData.name}:`, cacheInsertError);
        } else {
          console.log(`✓ Cached: ${mosqueData.name}`);
        }

        // Return formatted result
        return {
          id: place.id,
          name: place.displayName?.text || 'Unknown Mosque',
          address: place.formattedAddress || 'Address not available',
          distance: `${distance.toFixed(1)}km`,
          rating: place.rating,
          isOpen: place.currentOpeningHours?.openNow,
          phone: place.nationalPhoneNumber || place.internationalPhoneNumber,
          website,
          photoUrl,
          latitude: place.location.latitude,
          longitude: place.location.longitude,
          editorial_summary: place.editorialSummary?.text
        };
      }));
    }

    // Sort by distance
    mosques.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    const totalTime = Date.now() - startTime;
    console.log(`Total request time: ${totalTime}ms (Cache ${cacheHit ? 'HIT' : 'MISS'})`);

    return new Response(JSON.stringify({
      mosques,
      meta: {
        count: mosques.length,
        cacheHit,
        responseTime: totalTime
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-mosque-details function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        mosques: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Helper function to log API calls
async function logApiCall(
  supabase: any,
  apiType: string,
  costEstimate: number,
  cacheHit: boolean,
  responseTime: number,
  errorMessage?: string
) {
  try {
    const { error } = await supabase
      .from('google_api_logs')
      .insert({
        api_type: apiType,
        cost_estimate: costEstimate,
        cache_hit: cacheHit,
        response_time_ms: responseTime,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging API call:', error);
    }
  } catch (err) {
    console.error('Failed to log API call:', err);
  }
}
