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
    const { input, country = 'au' } = await req.json()

    if (!input || input.trim().length < 2) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Use Google Places Autocomplete API with specific types for better accuracy
    const autocompleteUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
    autocompleteUrl.searchParams.append('input', input)
    autocompleteUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY!)
    autocompleteUrl.searchParams.append('components', `country:${country}`)
    autocompleteUrl.searchParams.append('types', '(regions)') // Focus on regions (suburbs, cities, etc.)

    const response = await fetch(autocompleteUrl.toString())
    const data = await response.json()

    if (data.status === 'OK' && data.predictions) {
      // Return all predictions with full description (includes state info)
      const predictions = data.predictions.map((prediction: any) => ({
        description: prediction.description,
        place_id: prediction.place_id,
        // Add structured formatting for better display
        main_text: prediction.structured_formatting?.main_text || '',
        secondary_text: prediction.structured_formatting?.secondary_text || ''
      }))

      return new Response(
        JSON.stringify({ predictions }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ predictions: [] }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Autocomplete error:', error)
    return new Response(
      JSON.stringify({ error: error.message, predictions: [] }),
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
