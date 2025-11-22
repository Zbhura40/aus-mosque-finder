import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkMelbourneSuburbs() {
  const { data, error } = await supabase
    .from('mosques_cache')
    .select('suburb, name')
    .eq('state', 'VIC')
    .eq('is_active', true)
    .order('suburb');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Group by suburb
  const suburbCounts = new Map<string, number>();
  data?.forEach((mosque: any) => {
    const suburb = mosque.suburb || 'Unknown';
    suburbCounts.set(suburb, (suburbCounts.get(suburb) || 0) + 1);
  });

  // Sort by count
  const sorted = Array.from(suburbCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  console.log('\n=== Melbourne Suburbs in Database ===\n');
  sorted.forEach(([suburb, count]) => {
    console.log(`${suburb}: ${count} mosques`);
  });
  console.log(`\nTotal: ${data?.length} mosques in VIC`);
}

checkMelbourneSuburbs();
