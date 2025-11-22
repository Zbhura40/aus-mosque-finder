import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkMelbourneAddresses() {
  const { data, error } = await supabase
    .from('mosques_cache')
    .select('name, address, suburb')
    .eq('state', 'VIC')
    .eq('is_active', true)
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n=== Sample Melbourne Mosques ===\n');
  data?.forEach((mosque: any) => {
    console.log(`Name: ${mosque.name}`);
    console.log(`Address: ${mosque.address}`);
    console.log(`Suburb field: ${mosque.suburb}`);
    console.log('---');
  });
}

checkMelbourneAddresses();
