import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!  // Use secret key for write operations
);

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY!;

async function fetchMosqueReviews(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'reviews'
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.reviews || [];
}

async function fetchAllMelbourneReviews() {
  console.log('Fetching Melbourne mosque reviews...\n');

  // Get all VIC mosques
  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('id, name, google_place_id')
    .eq('state', 'VIC')
    .not('google_place_id', 'is', null);

  if (error || !mosques) {
    console.error('Error fetching mosques:', error);
    return;
  }

  console.log(`Found ${mosques.length} mosques to process\n`);

  let successCount = 0;
  let failCount = 0;
  let noReviewsCount = 0;

  for (let i = 0; i < mosques.length; i++) {
    const mosque = mosques[i];

    try {
      // Fetch reviews
      const reviews = await fetchMosqueReviews(mosque.google_place_id);

      if (reviews.length > 0) {
        // Save reviews to database
        const { error: updateError } = await supabase
          .from('mosques_cache')
          .update({ reviews })
          .eq('id', mosque.id);

        if (updateError) {
          console.error(`❌ Error saving reviews for ${mosque.name}:`, updateError);
          failCount++;
        } else {
          console.log(`✓ [${i + 1}/${mosques.length}] ${mosque.name} - ${reviews.length} reviews saved`);
          successCount++;
        }
      } else {
        console.log(`○ [${i + 1}/${mosques.length}] ${mosque.name} - No reviews`);
        noReviewsCount++;
      }

      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ [${i + 1}/${mosques.length}] Error for ${mosque.name}:`, error);
      failCount++;
    }
  }

  console.log('\n=================');
  console.log('Summary:');
  console.log('=================');
  console.log(`✓ Success: ${successCount} mosques`);
  console.log(`○ No reviews: ${noReviewsCount} mosques`);
  console.log(`❌ Failed: ${failCount} mosques`);
  console.log(`Total: ${mosques.length} mosques`);
}

fetchAllMelbourneReviews();
