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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { latitude, longitude, radius }: SearchRequest = await req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    // Initialize Supabase client for background cache-saving (shadow mode)
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log('✓ Shadow mode enabled - will save to cache in background');
    } else {
      console.log('⚠ Shadow mode disabled - Supabase credentials not found');
    }

    // Use Google Places API (New) to search for mosques
    const placesUrl = `https://places.googleapis.com/v1/places:searchNearby`;
    
    const requestBody = {
      includedTypes: ["mosque"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude
          },
          radius
        }
      },
      regionCode: "AU", // Restrict to Australia
      languageCode: "en"
    };

    console.log('Searching for mosques with request:', JSON.stringify(requestBody));

    const response = await fetch(placesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.editorialSummary,places.photos'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const googleResponseTime = Date.now() - startTime;
    console.log('Google Places API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Google Places API error:', data);
      // Log failed API call (shadow mode)
      if (supabase) {
        logApiCall(supabase, 'nearby_search', 0.032, false, googleResponseTime, requestBody, 'error', JSON.stringify(data.error)).catch(err =>
          console.error('Failed to log API error:', err)
        );
      }
      throw new Error(`Google Places API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Log successful API call (shadow mode) - Nearby Search = $0.032 per call
    if (supabase) {
      const resultsCount = data.places?.length || 0;
      console.log(`📊 Logging API call: $0.032 (${resultsCount} results, ${googleResponseTime}ms)`);
      logApiCall(supabase, 'nearby_search', 0.032, false, googleResponseTime, requestBody, 'success').catch(err =>
        console.error('Failed to log API call:', err)
      );
    }

    // Calculate distances and format results
    const mosques = await Promise.all((data.places || []).map(async (place: any) => {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        place.location.latitude, 
        place.location.longitude
      );

      console.log(`Processing mosque: ${place.displayName?.text}`);
      console.log(`Initial website from searchNearby: ${place.websiteUri}`);

      // Try to get more detailed information including website
      let website = place.websiteUri;
      let email = undefined;
      let photoUrl = undefined;

      // Get photo URL from Google Places Photos API
      if (place.photos && place.photos.length > 0) {
        // Log the photo data structure to debug
        console.log(`Photo data for ${place.displayName?.text}:`, JSON.stringify(place.photos[0], null, 2));
        
        const photoReference = place.photos[0].name;
        if (photoReference) {
          // Use the correct format for Google Places API v1 photos
          photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
          console.log(`Constructed photo URL for ${place.displayName?.text}: ${photoUrl}`);
        }
      } else {
        console.log(`No photos found for ${place.displayName?.text}`);
      }

      // If no website from searchNearby, try Place Details API
      if (!website && place.id) {
        try {
          console.log(`Fetching details for place ID: ${place.id}`);
          const detailsUrl = `https://places.googleapis.com/v1/places/${place.id}`;
          const detailsResponse = await fetch(detailsUrl, {
            headers: {
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'websiteUri,editorialSummary,internationalPhoneNumber,photos'
            }
          });
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            console.log(`Details API response for ${place.displayName?.text}:`, JSON.stringify(detailsData, null, 2));
            website = detailsData.websiteUri || website;
            
            // Get photo from details if not found in search
            if (!photoUrl && detailsData.photos && detailsData.photos.length > 0) {
              console.log(`Photo details data:`, JSON.stringify(detailsData.photos[0], null, 2));
              
              const photoReference = detailsData.photos[0].name;
              if (photoReference) {
                photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
                console.log(`Constructed photo URL from details for ${place.displayName?.text}: ${photoUrl}`);
              }
            }
          } else {
            console.log(`Details API failed with status: ${detailsResponse.status}`);
          }
        } catch (error) {
          console.log(`Could not fetch details for ${place.displayName?.text}:`, error);
        }
      }

      // For specific known mosques, add manual overrides if needed
      const mosqueName = place.displayName?.text?.toLowerCase() || '';
      if (mosqueName.includes('holland park') && !website) {
        website = 'https://www.hollandparkmosque.org.au';
        console.log(`Applied manual override for Holland Park Mosque`);
      }

      const result = {
        id: place.id,
        name: place.displayName?.text || 'Unknown Mosque',
        address: place.formattedAddress || 'Address not available',
        distance: `${distance.toFixed(1)}km`,
        rating: place.rating || undefined,
        isOpen: place.currentOpeningHours?.openNow,
        phone: place.nationalPhoneNumber || undefined,
        website: website || undefined,
        email: email || undefined,
        photoUrl: photoUrl || undefined,
        latitude: place.location.latitude,
        longitude: place.location.longitude
      };

      console.log(`Final result for ${result.name}:`, JSON.stringify(result, null, 2));

      // SHADOW MODE: Save to cache in background (don't wait for completion)
      if (supabase) {
        saveMosqueToCache(supabase, place, result).catch(err =>
          console.error(`⚠ Cache save failed for ${result.name}:`, err.message)
        );
      }

      return result;
    }));

    // Sort by distance
    mosques.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    return new Response(JSON.stringify({ mosques }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-mosques function:', error);
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

// SHADOW MODE: Helper function to save mosque to cache (runs in background)
async function saveMosqueToCache(
  supabase: any,
  place: any,
  result: any
): Promise<void> {
  try {
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

    // Get photo reference if available
    let photoReference = undefined;
    if (place.photos && place.photos.length > 0) {
      photoReference = place.photos[0].name;
    }

    // Prepare mosque data for cache
    const mosqueData = {
      google_place_id: place.id,
      name: result.name,
      address: result.address,
      suburb,
      state,
      postcode,
      location: `POINT(${place.location.longitude} ${place.location.latitude})`,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      phone_number: result.phone,
      website: result.website,
      email: result.email,
      google_rating: result.rating,
      google_review_count: place.userRatingCount,
      opening_hours: place.currentOpeningHours,
      is_open_now: result.isOpen,
      photos: result.photoUrl ? [{ url: result.photoUrl, reference: photoReference }] : [],
      formatted_address: place.formattedAddress,
      place_types: place.types,
      business_status: place.businessStatus,
      editorial_summary: place.editorialSummary?.text,
      last_fetched_from_google: new Date().toISOString()
    };

    // Save to cache (upsert: update if exists, insert if new)
    const { error } = await supabase
      .from('mosques_cache')
      .upsert(mosqueData, {
        onConflict: 'google_place_id'
      });

    if (error) {
      throw error;
    }

    console.log(`✓ SHADOW MODE: Cached ${result.name}`);
  } catch (error) {
    console.error(`✗ SHADOW MODE: Failed to cache mosque:`, error);
    throw error;
  }
}

// SHADOW MODE: Helper function to log API calls for cost tracking
async function logApiCall(
  supabase: any,
  apiType: string,
  costEstimate: number,
  cacheHit: boolean,
  responseTime: number,
  requestParams: any,
  responseStatus: string,
  errorMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('google_api_logs')
      .insert({
        api_type: apiType,
        request_params: requestParams,
        response_status: responseStatus,
        cost_estimate: costEstimate,
        cache_hit: cacheHit,
        response_time_ms: responseTime,
        error_message: errorMessage,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Log insert error:', error);
      throw error;
    }
    console.log(`✓ SHADOW MODE: Logged ${apiType} call ($${costEstimate})`);
  } catch (err) {
    console.error('Failed to log API call:', err);
    throw err;
  }
}