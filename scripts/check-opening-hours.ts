import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkReviewData() {
  // Get sample of 5 VIC mosques with reviews
  const { data, error } = await supabase
    .from('mosques_cache')
    .select('name, reviews, state')
    .eq('state', 'VIC')
    .not('reviews', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample of 5 VIC mosques with reviews:');
  console.log('=====================================\n');

  data?.forEach((mosque: any) => {
    console.log('Mosque:', mosque.name);
    console.log('Reviews Data:', JSON.stringify(mosque.reviews, null, 2));
    console.log('---\n');
  });

  // Count how many have reviews
  const { count } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true })
    .eq('state', 'VIC')
    .not('reviews', 'is', null);

  console.log(`Total VIC mosques with reviews data: ${count}`);
}

checkReviewData();
