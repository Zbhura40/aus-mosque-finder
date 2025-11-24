import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MosqueToRefresh {
  google_place_id: string;
  name: string;
  last_fetched_from_google: string;
}

interface RefreshStats {
  totalMosques: number;
  updated: number;
  unchanged: number;
  errors: number;
  totalCost: number;
  duration: number;
}

/**
 * Weekly Mosque Cache Refresh Function
 *
 * This function runs weekly to keep mosque data fresh:
 * - Fetches all cached mosques older than 7 days
 * - Updates each mosque's details from Google Places API
 * - Only saves changes (differential sync)
 * - Logs all operations for cost tracking
 *
 * Expected cost: ~$2.70/week for 84 mosques
 * ($0.032 per Places Details API call)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let stats: RefreshStats = {
    totalMosques: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
    totalCost: 0,
    duration: 0
  };

  try {
    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!googleApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Required environment variables not configured');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting weekly mosque cache refresh...');

    // STEP 1: Get mosques that need refreshing (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: mosquesToRefresh, error: fetchError } = await supabase
      .from('mosques_cache')
      .select('google_place_id, name, last_fetched_from_google')
      .lt('last_fetched_from_google', sevenDaysAgo.toISOString())
      .order('last_fetched_from_google', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch mosques: ${fetchError.message}`);
    }

    if (!mosquesToRefresh || mosquesToRefresh.length === 0) {
      console.log('✓ All mosques are up to date (< 7 days old)');

      stats.duration = Date.now() - startTime;

      return new Response(JSON.stringify({
        message: 'All mosques are up to date',
        stats
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    stats.totalMosques = mosquesToRefresh.length;
    console.log(`📊 Found ${stats.totalMosques} mosques to refresh`);

    // STEP 2: Refresh each mosque (with rate limiting)
    for (const mosque of mosquesToRefresh) {
      try {
        console.log(`\n🔄 Refreshing: ${mosque.name}`);

        const refreshResult = await refreshMosque(
          supabase,
          mosque.google_place_id,
          googleApiKey
        );

        if (refreshResult.success) {
          if (refreshResult.hasChanges) {
            stats.updated++;
            console.log(`  ✓ Updated (changes detected)`);
          } else {
            stats.unchanged++;
            console.log(`  ✓ Unchanged (no updates needed)`);
          }
          stats.totalCost += 0.032; // Places Details API cost
        } else {
          stats.errors++;
          console.log(`  ✗ Error: ${refreshResult.error}`);
        }

        // Rate limiting: Wait 100ms between requests to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error refreshing ${mosque.name}:`, error);
        stats.errors++;
      }
    }

    stats.duration = Date.now() - startTime;

    console.log('\n✅ Weekly refresh completed!');
    console.log(`📊 Stats:`);
    console.log(`   - Total mosques: ${stats.totalMosques}`);
    console.log(`   - Updated: ${stats.updated}`);
    console.log(`   - Unchanged: ${stats.unchanged}`);
    console.log(`   - Errors: ${stats.errors}`);
    console.log(`   - Cost: $${stats.totalCost.toFixed(2)}`);
    console.log(`   - Duration: ${(stats.duration / 1000).toFixed(1)}s`);

    // Log the refresh operation
    await logRefreshOperation(supabase, stats);

    return new Response(JSON.stringify({
      message: 'Weekly refresh completed successfully',
      stats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in refresh function:', error);

    stats.duration = Date.now() - startTime;

    return new Response(JSON.stringify({
      error: error.message,
      stats
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Refresh a single mosque's data from Google Places API
 */
async function refreshMosque(
  supabase: any,
  placeId: string,
  googleApiKey: string
): Promise<{ success: boolean; hasChanges: boolean; error?: string }> {
  try {
    // Fetch updated details from Google Places API
    const placeDetailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(placeDetailsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,currentOpeningHours,nationalPhoneNumber,internationalPhoneNumber,websiteUri,editorialSummary,photos,types,businessStatus'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        hasChanges: false,
        error: errorData.error?.message || 'API request failed'
      };
    }

    const place = await response.json();

    // Get current cached data
    const { data: currentData, error: fetchError } = await supabase
      .from('mosques_cache')
      .select('*')
      .eq('google_place_id', placeId)
      .single();

    if (fetchError || !currentData) {
      return {
        success: false,
        hasChanges: false,
        error: 'Failed to fetch current cached data'
      };
    }

    // Prepare updated data
    let website = place.websiteUri;
    let photoUrl = undefined;
    let photoReference = undefined;

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

    const updatedData = {
      name: place.displayName?.text || currentData.name,
      address: place.formattedAddress || currentData.address,
      suburb,
      state,
      postcode,
      phone_number: place.nationalPhoneNumber || place.internationalPhoneNumber,
      website,
      google_rating: place.rating,
      google_review_count: place.userRatingCount,
      opening_hours: place.currentOpeningHours,
      is_open_now: place.currentOpeningHours?.openNow,
      photos: photoUrl ? [{ url: photoUrl, reference: photoReference }] : currentData.photos,
      formatted_address: place.formattedAddress,
      place_types: place.types,
      business_status: place.businessStatus,
      editorial_summary: place.editorialSummary?.text,
      last_fetched_from_google: new Date().toISOString()
    };

    // Check if there are meaningful changes (differential sync)
    const hasChanges =
      currentData.name !== updatedData.name ||
      currentData.address !== updatedData.address ||
      currentData.phone_number !== updatedData.phone_number ||
      currentData.website !== updatedData.website ||
      currentData.google_rating !== updatedData.google_rating ||
      currentData.google_review_count !== updatedData.google_review_count ||
      currentData.is_open_now !== updatedData.is_open_now ||
      currentData.business_status !== updatedData.business_status;

    // Always update last_fetched_from_google, but only update other fields if changed
    if (hasChanges) {
      const { error: updateError } = await supabase
        .from('mosques_cache')
        .update(updatedData)
        .eq('google_place_id', placeId);

      if (updateError) {
        return {
          success: false,
          hasChanges: false,
          error: `Update failed: ${updateError.message}`
        };
      }
    } else {
      // Just update the timestamp
      const { error: updateError } = await supabase
        .from('mosques_cache')
        .update({ last_fetched_from_google: updatedData.last_fetched_from_google })
        .eq('google_place_id', placeId);

      if (updateError) {
        return {
          success: false,
          hasChanges: false,
          error: `Timestamp update failed: ${updateError.message}`
        };
      }
    }

    return {
      success: true,
      hasChanges
    };

  } catch (error) {
    return {
      success: false,
      hasChanges: false,
      error: error.message
    };
  }
}

/**
 * Log the refresh operation for monitoring
 */
async function logRefreshOperation(supabase: any, stats: RefreshStats) {
  try {
    const { error } = await supabase
      .from('google_api_logs')
      .insert({
        api_type: 'weekly_cache_refresh',
        cost_estimate: stats.totalCost,
        cache_hit: false,
        response_status: stats.errors > 0 ? 'error' : 'success',
        response_time_ms: stats.duration,
        error_message: stats.errors > 0 ? `${stats.errors} errors occurred` : null,
        request_params: {
          total_mosques: stats.totalMosques,
          updated: stats.updated,
          unchanged: stats.unchanged,
          errors: stats.errors
        },
        edge_function_name: 'refresh-cached-mosques',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log refresh operation:', error);
    }
  } catch (err) {
    console.error('Error logging refresh:', err);
  }
}
