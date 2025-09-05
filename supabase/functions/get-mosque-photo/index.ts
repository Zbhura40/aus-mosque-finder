import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoRequest {
  mosqueName: string;
  placeId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mosqueName, placeId }: PhotoRequest = await req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    let photoUrl = null;

    // Try to get photo from Google Places API if we have a place ID
    if (placeId) {
      try {
        const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
        const detailsResponse = await fetch(detailsUrl, {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'photos'
          }
        });
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          console.log(`Photo details for ${mosqueName}:`, JSON.stringify(detailsData, null, 2));
          
          if (detailsData.photos && detailsData.photos.length > 0) {
            const photoReference = detailsData.photos[0].name;
            // Use the correct photo URL format for Places API v1
            photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
            console.log(`Constructed photo URL: ${photoUrl}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching Google photo for ${mosqueName}:`, error);
      }
    }

    // If still no photo, try a web search for mosque images
    if (!photoUrl) {
      try {
        // Use a simple web search approach to find mosque images
        const searchQuery = `${mosqueName} mosque exterior building photo`;
        console.log(`Searching web for: ${searchQuery}`);
        
        // For now, we'll return null and let the frontend show placeholder
        // In a production app, you'd integrate with a web search API here
        photoUrl = null;
      } catch (error) {
        console.error(`Error in web search for ${mosqueName}:`, error);
      }
    }

    return new Response(JSON.stringify({ 
      photoUrl,
      mosqueName 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-mosque-photo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        photoUrl: null
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});