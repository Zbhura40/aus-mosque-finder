import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { place_id } = await req.json()

    if (!place_id) {
      return new Response(
        JSON.stringify({ error: 'place_id is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Use Google Place Details API to get location details
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    detailsUrl.searchParams.append('place_id', place_id)
    detailsUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY!)
    detailsUrl.searchParams.append('fields', 'geometry,formatted_address,name,address_components')

    const response = await fetch(detailsUrl.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.result) {
      const result = data.result

      return new Response(
        JSON.stringify({
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          name: result.name,
          address_components: result.address_components
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Place not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Geocode place error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
