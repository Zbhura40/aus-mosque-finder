import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  try {
    const { latitude, longitude, radius }: SearchRequest = await req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
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
    console.log('Google Places API response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('Google Places API error:', data);
      throw new Error(`Google Places API error: ${data.error?.message || 'Unknown error'}`);
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
        const photoReference = place.photos[0].name;
        // Construct photo URL using Places API
        photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
        console.log(`Found photo for ${place.displayName?.text}: ${photoUrl}`);
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
              const photoReference = detailsData.photos[0].name;
              photoUrl = `https://places.googleapis.com/v1/${photoReference}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
              console.log(`Found photo from details for ${place.displayName?.text}: ${photoUrl}`);
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