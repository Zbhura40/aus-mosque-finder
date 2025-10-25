import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMosqueCount() {
  console.log('🔍 Checking mosque count in Supabase...\n');

  // Get total count of mosques
  const { count: totalCount, error: totalError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('❌ Error fetching total count:', totalError);
    return;
  }

  console.log(`📊 Total mosques in cache: ${totalCount}`);

  // Get count by state
  const { data: stateData, error: stateError } = await supabase
    .from('mosques_cache')
    .select('state');

  if (stateError) {
    console.error('❌ Error fetching state data:', stateError);
    return;
  }

  // Count by state
  const stateCounts: Record<string, number> = {};
  stateData?.forEach((mosque) => {
    const state = mosque.state || 'Unknown';
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  console.log('\n📍 Breakdown by state:');
  Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([state, count]) => {
      console.log(`   ${state}: ${count} mosques`);
    });

  // Get recent additions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: recentCount, error: recentError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (!recentError && recentCount !== null) {
    console.log(`\n📅 Mosques added in last 30 days: ${recentCount}`);
  }

  console.log('\n✅ Check complete!');
}

checkMosqueCount().catch(console.error);
