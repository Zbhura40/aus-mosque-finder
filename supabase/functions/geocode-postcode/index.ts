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

    // Use Google Geocoding API to get coordinates for Australian postcode or suburb
    // Add 'components=country:AU' to restrict results to Australia for better accuracy
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&components=country:AU&key=${apiKey}`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (!response.ok || data.status !== 'OK') {
      console.error('Geocoding API error:', data);
      throw new Error(`Geocoding failed: ${data.error_message || data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for this location');
    }

    // Prioritize results that are localities (suburbs) over postal codes
    let result = data.results[0];

    // If there are multiple results, try to find the best match
    if (data.results.length > 1) {
      // Prefer locality results over postal_code results
      const localityResult = data.results.find((r: any) =>
        r.types.includes('locality') || r.types.includes('sublocality')
      );
      if (localityResult) {
        result = localityResult;
      }
    }

    const location = result.geometry.location;

    // Extract location name from address components
    let locationName = '';
    const addressComponents = result.address_components || [];

    // Find suburb/locality and state
    const locality = addressComponents.find((comp: any) =>
      comp.types.includes('locality')
    );
    const sublocality = addressComponents.find((comp: any) =>
      comp.types.includes('sublocality') || comp.types.includes('sublocality_level_1')
    );
    const postalCode = addressComponents.find((comp: any) =>
      comp.types.includes('postal_code')
    );
    const state = addressComponents.find((comp: any) =>
      comp.types.includes('administrative_area_level_1')
    );

    // Build location name with priority: locality > sublocality > postal code
    const placeName = locality?.long_name || sublocality?.long_name || postalCode?.long_name;

    if (placeName && state) {
      locationName = `${placeName}, ${state.short_name}`;
    } else if (placeName) {
      locationName = placeName;
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