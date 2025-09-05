import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  postcode: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postcode }: GeocodeRequest = await req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    // Use Google Geocoding API to get coordinates for Australian postcode
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode + ' Australia')}&key=${apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (!response.ok || data.status !== 'OK') {
      console.error('Geocoding API error:', data);
      throw new Error(`Geocoding failed: ${data.error_message || data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for this postcode');
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract location name from address components
    let locationName = '';
    const addressComponents = result.address_components || [];
    
    // Find suburb/locality and state
    const suburb = addressComponents.find((comp: any) => 
      comp.types.includes('locality') || comp.types.includes('sublocality')
    );
    const state = addressComponents.find((comp: any) => 
      comp.types.includes('administrative_area_level_1')
    );
    
    if (suburb && state) {
      locationName = `${suburb.long_name}, ${state.short_name}`;
    } else {
      // Fallback to formatted address
      locationName = result.formatted_address.replace(', Australia', '');
    }

    return new Response(JSON.stringify({
      latitude: location.lat,
      longitude: location.lng,
      locationName,
      formattedAddress: result.formatted_address
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in geocode-postcode function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});