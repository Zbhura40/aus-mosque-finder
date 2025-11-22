import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkCampbellfieldMosques() {
  const { data, error } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('state', 'VIC')
    .eq('is_active', true)
    .ilike('address', '%Campbellfield%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== Campbellfield Mosques ===\n');
  console.log(`Found ${data?.length} mosques\n`);

  data?.forEach((mosque: any, index: number) => {
    console.log(`Mosque ${index + 1}:`);
    console.log(`  Name: ${mosque.name}`);
    console.log(`  Address: ${mosque.address}`);
    console.log(`  Latitude: ${mosque.latitude}`);
    console.log(`  Longitude: ${mosque.longitude}`);
    console.log(`  Google Place ID: ${mosque.google_place_id}`);
    console.log('---');
  });
}

checkCampbellfieldMosques();
