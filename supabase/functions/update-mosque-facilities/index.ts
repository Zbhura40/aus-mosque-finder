import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  types: string[];
  accessibility_options?: {
    wheelchair_accessible_entrance?: boolean;
    wheelchair_accessible_restroom?: boolean;
    wheelchair_accessible_seating?: boolean;
    wheelchair_accessible_parking?: boolean;
  };
  amenities?: {
    restroom?: boolean;
    wifi?: boolean;
    accepts_cash?: boolean;
    accepts_credit_cards?: boolean;
    accepts_debit_cards?: boolean;
    accepts_nfc?: boolean;
  };
  parking_options?: {
    free_parking_lot?: boolean;
    paid_parking_lot?: boolean;
    free_street_parking?: boolean;
    paid_street_parking?: boolean;
    free_garage_parking?: boolean;
    paid_garage_parking?: boolean;
  };
  payment_options?: {
    accepts_cash?: boolean;
    accepts_credit_cards?: boolean;
    accepts_debit_cards?: boolean;
    accepts_nfc?: boolean;
  };
  outdoor_seating?: boolean;
  live_music?: boolean;
  serves_breakfast?: boolean;
  serves_lunch?: boolean;
  serves_dinner?: boolean;
  serves_beer?: boolean;
  serves_wine?: boolean;
  serves_vegetarian_food?: boolean;
  serves_halal_food?: boolean;
  allowsChildren?: boolean;
  goodForChildren?: boolean;
  allowsDogs?: boolean;
  delivery?: boolean;
  dine_in?: boolean;
  takeout?: boolean;
  curbside_pickup?: boolean;
  reservable?: boolean;
  serves_cocktails?: boolean;
  serves_coffee?: boolean;
  serves_dessert?: boolean;
  serves_happy_hour_food?: boolean;
}

interface ProcessedFacilities {
  accessibility: {
    wheelchairAccessible: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
    wheelchairAccessibleParking?: boolean;
  };
  parking: {
    available: boolean;
    types: string[];
    free?: boolean;
    paid?: boolean;
  };
  amenities: {
    restrooms: boolean;
    wifi?: boolean;
    childrenWelcome?: boolean;
    womensPrayerArea?: boolean; // Inferred from place types
    communityHall?: boolean; // Inferred from place types
    halalFood?: boolean;
    cafe?: boolean;
    playArea?: boolean; // Inferred from children amenities
  };
  services: {
    takeout?: boolean;
    delivery?: boolean;
    dineIn?: boolean;
    reservations?: boolean;
  };
  payment: {
    acceptsCash?: boolean;
    acceptsCards?: boolean;
    acceptsContactless?: boolean;
  };
  googlePlaceTypes: string[];
  lastUpdated: string;
  dataSource: 'google_places_api';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

  if (!supabaseUrl || !supabaseServiceKey || !googleApiKey) {
    console.error('Missing required environment variables');
    return new Response(JSON.stringify({
      success: false,
      error: 'Server configuration error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const requestBody = req.method === 'POST' ? await req.json() : {};
    const { mosqueId, forceRefresh = false } = requestBody;
    
    if (req.method === 'POST' && mosqueId) {
      // Update facilities for a specific mosque
      console.log(`Updating facilities for mosque: ${mosqueId}`);
      
      const result = await updateMosqueFacilities(mosqueId, googleApiKey, supabase, forceRefresh);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Update facilities for all mosques (bulk update)
      console.log('Starting bulk mosque facilities update');
      
      const { data: mosques, error: fetchError } = await supabase
        .from('mosques')
        .select('mosque_id, name, last_updated, facilities')
        .order('name');

      if (fetchError) {
        console.error('Error fetching mosques:', fetchError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to fetch mosques'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const results = [];
      const maxConcurrent = 3; // Limit concurrent API calls
      
      for (let i = 0; i < mosques.length; i += maxConcurrent) {
        const batch = mosques.slice(i, i + maxConcurrent);
        console.log(`Processing batch ${Math.floor(i / maxConcurrent) + 1} with ${batch.length} mosques`);
        
        const batchPromises = batch.map(async (mosque) => {
          // Only update if facilities are older than 7 days or don't exist
          const needsUpdate = !mosque.last_updated || 
            !mosque.facilities ||
            new Date(mosque.last_updated) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
          if (!needsUpdate && !forceRefresh) {
            return {
              mosque_id: mosque.mosque_id,
              name: mosque.name,
              success: true,
              message: 'Facilities data is recent, skipping update'
            };
          }
          
          return await updateMosqueFacilities(mosque.mosque_id, googleApiKey, supabase, forceRefresh);
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`Error processing ${batch[j].name}:`, result.reason);
            results.push({
              mosque_id: batch[j].mosque_id,
              name: batch[j].name,
              success: false,
              error: result.reason?.message || 'Processing failed'
            });
          }
        }
        
        // Delay between batches to respect API rate limits
        if (i + maxConcurrent < mosques.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`Facilities update complete: ${successCount} successful, ${failureCount} failed`);

      return new Response(JSON.stringify({
        success: true,
        message: 'Bulk facilities update completed',
        totalProcessed: results.length,
        successful: successCount,
        failed: failureCount,
        results: results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in update-mosque-facilities function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update mosque facilities',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function updateMosqueFacilities(
  mosqueId: string, 
  googleApiKey: string, 
  supabase: any,
  forceRefresh: boolean = false
): Promise<any> {
  try {
    console.log(`Fetching Google Places details for: ${mosqueId}`);
    
    // Google Places API (New) - Place Details
    const fieldsToRequest = [
      'id',
      'displayName',
      'types',
      'accessibilityOptions',
      'parkingOptions',
      'paymentOptions',
      'outdoorSeating',
      'liveMusic',
      'servesBreakfast',
      'servesLunch',
      'servesDinner',
      'servesBeer',
      'servesWine',
      'servesVegetarianFood',
      'allowsChildren',
      'goodForChildren',
      'allowsDogs',
      'delivery',
      'dineIn',
      'takeout',
      'curbsidePickup',
      'reservable',
      'servesCocktails',
      'servesCoffee',
      'servesDessert',
      'servesHappyHourFood',
      'restroom',
      'wifi'
    ].join(',');
    
    const placeDetailsUrl = `https://places.googleapis.com/v1/places/${mosqueId}?fields=${fieldsToRequest}&key=${googleApiKey}`;
    
    const response = await fetch(placeDetailsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Places API error ${response.status}: ${errorText}`);
      
      return {
        mosque_id: mosqueId,
        success: false,
        error: `Google Places API error: ${response.status}`
      };
    }

    const placeDetails: GooglePlaceDetails = await response.json();
    console.log(`Retrieved place details for: ${placeDetails.displayName || mosqueId}`);
    
    // Process the raw Google data into our structured format
    const processedFacilities = processFacilitiesData(placeDetails);
    
    // Update the mosque record in Supabase
    const { error: updateError } = await supabase
      .from('mosques')
      .update({
        facilities: processedFacilities,
        last_updated: new Date().toISOString()
      })
      .eq('mosque_id', mosqueId);

    if (updateError) {
      console.error(`Database update error for ${mosqueId}:`, updateError);
      return {
        mosque_id: mosqueId,
        success: false,
        error: 'Failed to update database'
      };
    }

    console.log(`Successfully updated facilities for: ${placeDetails.displayName || mosqueId}`);
    
    return {
      mosque_id: mosqueId,
      name: placeDetails.displayName,
      success: true,
      facilities: processedFacilities,
      message: 'Facilities updated successfully'
    };

  } catch (error) {
    console.error(`Error updating facilities for ${mosqueId}:`, error);
    return {
      mosque_id: mosqueId,
      success: false,
      error: error.message
    };
  }
}

function processFacilitiesData(placeDetails: GooglePlaceDetails): ProcessedFacilities {
  const facilities: ProcessedFacilities = {
    accessibility: {
      wheelchairAccessible: false
    },
    parking: {
      available: false,
      types: []
    },
    amenities: {
      restrooms: false
    },
    services: {},
    payment: {},
    googlePlaceTypes: placeDetails.types || [],
    lastUpdated: new Date().toISOString(),
    dataSource: 'google_places_api'
  };

  // Process accessibility options
  if (placeDetails.accessibility_options) {
    const access = placeDetails.accessibility_options;
    facilities.accessibility = {
      wheelchairAccessible: !!(
        access.wheelchair_accessible_entrance ||
        access.wheelchair_accessible_restroom ||
        access.wheelchair_accessible_seating ||
        access.wheelchair_accessible_parking
      ),
      wheelchairAccessibleEntrance: access.wheelchair_accessible_entrance,
      wheelchairAccessibleRestroom: access.wheelchair_accessible_restroom,
      wheelchairAccessibleSeating: access.wheelchair_accessible_seating,
      wheelchairAccessibleParking: access.wheelchair_accessible_parking
    };
  }

  // Process parking options
  if (placeDetails.parking_options) {
    const parking = placeDetails.parking_options;
    const parkingTypes = [];
    let hasFree = false;
    let hasPaid = false;

    if (parking.free_parking_lot) { parkingTypes.push('Free Parking Lot'); hasFree = true; }
    if (parking.paid_parking_lot) { parkingTypes.push('Paid Parking Lot'); hasPaid = true; }
    if (parking.free_street_parking) { parkingTypes.push('Free Street Parking'); hasFree = true; }
    if (parking.paid_street_parking) { parkingTypes.push('Paid Street Parking'); hasPaid = true; }
    if (parking.free_garage_parking) { parkingTypes.push('Free Garage Parking'); hasFree = true; }
    if (parking.paid_garage_parking) { parkingTypes.push('Paid Garage Parking'); hasPaid = true; }

    facilities.parking = {
      available: parkingTypes.length > 0,
      types: parkingTypes,
      free: hasFree,
      paid: hasPaid
    };
  }

  // Process amenities
  facilities.amenities.restrooms = placeDetails.restroom || false;
  facilities.amenities.wifi = placeDetails.wifi;
  facilities.amenities.childrenWelcome = placeDetails.allowsChildren || placeDetails.goodForChildren;
  facilities.amenities.halalFood = placeDetails.serves_halal_food;
  
  // Infer amenities from place types
  const types = placeDetails.types || [];
  facilities.amenities.womensPrayerArea = types.includes('place_of_worship') || types.includes('mosque');
  facilities.amenities.communityHall = types.includes('community_center') || types.includes('event_venue');
  facilities.amenities.cafe = types.includes('cafe') || types.includes('restaurant') || placeDetails.serves_coffee;
  facilities.amenities.playArea = placeDetails.goodForChildren && placeDetails.allowsChildren;

  // Process services
  facilities.services.takeout = placeDetails.takeout;
  facilities.services.delivery = placeDetails.delivery;
  facilities.services.dineIn = placeDetails.dine_in;
  facilities.services.reservations = placeDetails.reservable;

  // Process payment options
  if (placeDetails.payment_options) {
    const payment = placeDetails.payment_options;
    facilities.payment = {
      acceptsCash: payment.accepts_cash,
      acceptsCards: payment.accepts_credit_cards || payment.accepts_debit_cards,
      acceptsContactless: payment.accepts_nfc
    };
  }

  return facilities;
}