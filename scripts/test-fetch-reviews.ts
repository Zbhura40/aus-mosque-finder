import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function testFetchReviews() {
  // Get one VIC mosque for testing
  const { data: mosques, error: fetchError } = await supabase
    .from('mosques_cache')
    .select('id, name, google_place_id')
    .eq('state', 'VIC')
    .not('google_place_id', 'is', null)
    .limit(1);

  if (fetchError || !mosques || mosques.length === 0) {
    console.error('Error fetching mosque:', fetchError);
    return;
  }

  const mosque = mosques[0];
  console.log('Testing with mosque:', mosque.name);
  console.log('Place ID:', mosque.google_place_id);
  console.log('');

  // Fetch reviews using Google Places API (New)
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  const placeId = mosque.google_place_id;

  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  console.log('Fetching reviews from Google Places API...\n');

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        'X-Goog-FieldMask': 'reviews'
      }
    });

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();

    if (data.reviews && data.reviews.length > 0) {
      console.log(`✓ Found ${data.reviews.length} reviews!\n`);

      // Show first review details
      const latestReview = data.reviews[0];
      console.log('Latest Review:');
      console.log('==============');
      console.log('Author:', latestReview.authorAttribution?.displayName || 'Anonymous');
      console.log('Rating:', latestReview.rating, '⭐');
      console.log('Time:', latestReview.relativePublishTimeDescription || latestReview.publishTime);
      console.log('Text:', latestReview.text?.text || latestReview.originalText?.text || 'No text');
      console.log('');

      // Show structure for saving
      console.log('Review structure to save:');
      console.log(JSON.stringify(latestReview, null, 2));

    } else {
      console.log('❌ No reviews found for this mosque');
    }

  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
}

testFetchReviews();
