// Check if mosques were saved to cache
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCache() {
  console.log('🔍 Checking mosques_cache table...\n');

  // Check how many mosques are in the cache
  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error querying cache:', error);
    return;
  }

  console.log(`✅ Found ${mosques?.length || 0} mosques in cache\n`);

  if (mosques && mosques.length > 0) {
    console.log('📋 Sample mosque data:');
    mosques.forEach((mosque, i) => {
      console.log(`\n${i + 1}. ${mosque.name}`);
      console.log(`   Google Place ID: ${mosque.google_place_id}`);
      console.log(`   Location: ${mosque.latitude}, ${mosque.longitude}`);
      console.log(`   Last fetched: ${mosque.last_fetched_from_google}`);
      console.log(`   Created: ${mosque.created_at}`);
    });
  }

  // Now test the database function
  console.log('\n\n🧪 Testing get_mosques_within_radius function...\n');

  const { data: nearbyMosques, error: rpcError } = await supabase.rpc(
    'get_mosques_within_radius',
    {
      search_lat: -33.8688,
      search_lng: 151.2093,
      radius_meters: 5000,
      max_age_days: 30
    }
  );

  if (rpcError) {
    console.error('❌ Error calling function:', rpcError);
    return;
  }

  console.log(`✅ Function returned ${nearbyMosques?.length || 0} mosques\n`);

  if (nearbyMosques && nearbyMosques.length > 0) {
    console.log('📋 Nearby mosques:');
    nearbyMosques.slice(0, 3).forEach((mosque: any, i: number) => {
      console.log(`\n${i + 1}. ${mosque.name}`);
      console.log(`   Distance: ${mosque.distance_km.toFixed(1)}km`);
      console.log(`   Rating: ${mosque.google_rating || 'N/A'}`);
    });
  } else {
    console.log('⚠️  No mosques found nearby. This might be why cache isn\'t hitting!');
  }
}

checkCache();
