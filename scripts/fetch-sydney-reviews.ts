import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SECRET_KEY || ''
);

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

async function fetchPlaceDetails(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'reviews'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.reviews || [];
}

async function fetchSydneyReviews() {
  console.log('Fetching Reviews for Sydney (NSW) Mosques');
  console.log('=========================================\n');

  // Fetch all NSW mosques with google_place_id
  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('id, name, google_place_id')
    .eq('state', 'NSW')
    .eq('is_active', true)
    .not('google_place_id', 'is', null);

  if (error || !mosques) {
    console.error('Error fetching mosques:', error);
    return;
  }

  console.log(`Found ${mosques.length} Sydney mosques to process\n`);

  let successCount = 0;
  let failCount = 0;
  let totalReviews = 0;

  for (let i = 0; i < mosques.length; i++) {
    const mosque = mosques[i];

    try {
      console.log(`[${i + 1}/${mosques.length}] Fetching reviews for: ${mosque.name}`);

      const reviews = await fetchPlaceDetails(mosque.google_place_id);

      // Update the mosque with reviews
      const { error: updateError } = await supabase
        .from('mosques_cache')
        .update({ reviews })
        .eq('id', mosque.id);

      if (updateError) {
        console.error(`  ❌ Error updating database:`, updateError);
        failCount++;
      } else {
        console.log(`  ✓ Saved ${reviews.length} reviews`);
        successCount++;
        totalReviews += reviews.length;
      }

      // Rate limiting - 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`  ❌ Error:`, error);
      failCount++;
    }
  }

  console.log('\n===================');
  console.log('Summary:');
  console.log('===================');
  console.log(`✓ Success: ${successCount} mosques`);
  console.log(`❌ Failed: ${failCount} mosques`);
  console.log(`📊 Total reviews fetched: ${totalReviews}`);
  console.log(`📈 Average: ${(totalReviews / successCount).toFixed(1)} reviews per mosque`);
}

fetchSydneyReviews();
