import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY!;

interface Mosque {
  id: string;
  google_place_id: string;
  name: string;
  last_fetched_from_google: string | null;
}

async function getPlaceDetails(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,currentOpeningHours,nationalPhoneNumber,websiteUri,photos,types'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

async function updateMosque(mosque: Mosque, placeData: any) {
  const { error } = await supabase
    .from('mosques_cache')
    .update({
      name: placeData.displayName?.text || mosque.name,
      address: placeData.formattedAddress || null,
      latitude: placeData.location?.latitude || null,
      longitude: placeData.location?.longitude || null,
      google_rating: placeData.rating || null,
      google_review_count: placeData.userRatingCount || null,
      phone_number: placeData.nationalPhoneNumber || null,
      website: placeData.websiteUri || null,
      opening_hours: placeData.currentOpeningHours || null,
      photos: placeData.photos || null,
      last_fetched_from_google: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', mosque.id);

  if (error) {
    throw error;
  }
}

async function refreshRemainingMosques() {
  console.log('\n🔄 REFRESHING REMAINING MOSQUES\n');
  console.log('='.repeat(80));

  // Get mosques that haven't been refreshed in the last hour
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const { data: mosquesToRefresh, error: fetchError } = await supabase
    .from('mosques_cache')
    .select('id, google_place_id, name, last_fetched_from_google')
    .or(`last_fetched_from_google.is.null,last_fetched_from_google.lt.${oneHourAgo.toISOString()}`)
    .order('last_fetched_from_google', { ascending: true, nullsFirst: true });

  if (fetchError) {
    console.error('❌ Error fetching mosques:', fetchError);
    return;
  }

  console.log(`\n📊 Found ${mosquesToRefresh.length} mosques to refresh\n`);

  if (mosquesToRefresh.length === 0) {
    console.log('✅ All mosques are up to date!\n');
    return;
  }

  let successful = 0;
  let failed = 0;
  let totalCost = 0;

  // Process in batches of 10 with delays to avoid rate limiting
  const batchSize = 10;

  for (let i = 0; i < mosquesToRefresh.length; i += batchSize) {
    const batch = mosquesToRefresh.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(mosquesToRefresh.length / batchSize);

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} mosques)`);

    for (const mosque of batch) {
      try {
        const placeData = await getPlaceDetails(mosque.google_place_id);
        await updateMosque(mosque, placeData);

        successful++;
        totalCost += 0.017; // Place Details API cost

        process.stdout.write(`   ✅ ${successful}/${mosquesToRefresh.length}: ${mosque.name}\r`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        failed++;
        console.log(`   ❌ Failed: ${mosque.name} - ${error.message}`);
      }
    }

    // Longer delay between batches
    if (i + batchSize < mosquesToRefresh.length) {
      console.log(`\n   ⏳ Pausing 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('\n📊 REFRESH COMPLETE\n');
  console.log(`✅ Successfully refreshed: ${successful} mosques`);
  console.log(`❌ Failed to refresh: ${failed} mosques`);
  console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);
  console.log(`\n⏱️  Time: ~${Math.ceil((successful * 0.1 + Math.floor(successful / batchSize) * 2) / 60)} minutes\n`);

  // Show final status
  const { data: stats } = await supabase
    .from('mosques_cache')
    .select('last_fetched_from_google')
    .gte('last_fetched_from_google', oneHourAgo.toISOString());

  console.log(`📈 Total refreshed in last hour: ${stats?.length || 0} mosques\n`);
}

refreshRemainingMosques().catch(console.error);
