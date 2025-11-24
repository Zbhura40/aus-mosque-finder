import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkTasNTData() {
  // Check Tasmania
  const { data: tasData, error: tasError, count: tasCount } = await supabase
    .from('mosques_cache')
    .select('id, name, city, suburb, google_rating, photos, reviews, facilities', { count: 'exact' })
    .eq('state', 'TAS')
    .eq('is_active', true);

  console.log('===================');
  console.log('TASMANIA (TAS)');
  console.log('===================');
  console.log(`Total Mosques: ${tasCount || 0}\n`);

  if (tasData && tasData.length > 0) {
    console.log('Mosques:');
    tasData.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} - ${m.city || m.suburb || 'Unknown location'}`);
      console.log(`   - Rating: ${m.google_rating || 'N/A'}`);
      console.log(`   - Photos: ${m.photos?.length || 0}`);
      console.log(`   - Reviews: ${m.reviews?.length || 0}`);
      console.log(`   - Facilities: ${m.facilities?.length || 0}`);
    });
  }

  // Check Northern Territory
  const { data: ntData, error: ntError, count: ntCount } = await supabase
    .from('mosques_cache')
    .select('id, name, city, suburb, google_rating, photos, reviews, facilities', { count: 'exact' })
    .eq('state', 'NT')
    .eq('is_active', true);

  console.log('\n===================');
  console.log('NORTHERN TERRITORY (NT)');
  console.log('===================');
  console.log(`Total Mosques: ${ntCount || 0}\n`);

  if (ntData && ntData.length > 0) {
    console.log('Mosques:');
    ntData.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} - ${m.city || m.suburb || 'Unknown location'}`);
      console.log(`   - Rating: ${m.google_rating || 'N/A'}`);
      console.log(`   - Photos: ${m.photos?.length || 0}`);
      console.log(`   - Reviews: ${m.reviews?.length || 0}`);
      console.log(`   - Facilities: ${m.facilities?.length || 0}`);
    });
  }

  console.log('\n===================');
  console.log('SUMMARY');
  console.log('===================');
  console.log(`Tasmania: ${tasCount || 0} mosques`);
  console.log(`Northern Territory: ${ntCount || 0} mosques`);
  console.log(`Combined: ${(tasCount || 0) + (ntCount || 0)} mosques`);
}

checkTasNTData();
