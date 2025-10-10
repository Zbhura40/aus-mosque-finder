/**
 * Test Day 4 Results - Verify Cache and Cost Savings
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables. Make sure .env file exists.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDay4Results() {
  console.log('📊 Day 4 Results - Cache System Test\n');
  console.log('=' .repeat(60));

  // 1. Check how many mosques are cached
  const { data: cachedMosques, error: cacheError } = await supabase
    .from('mosques_cache')
    .select('google_place_id, name, state, last_fetched_from_google')
    .order('last_fetched_from_google', { ascending: false });

  if (cacheError) {
    console.error('❌ Error fetching cache:', cacheError);
  } else {
    console.log(`\n✅ MOSQUES IN CACHE: ${cachedMosques?.length || 0}`);

    // Group by state
    const byState = cachedMosques?.reduce((acc: any, m: any) => {
      const state = m.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    console.log('\nBreakdown by State:');
    Object.entries(byState || {}).forEach(([state, count]) => {
      console.log(`  ${state}: ${count} mosques`);
    });
  }

  // 2. Check API cost logs from today
  const today = new Date().toISOString().split('T')[0];
  const { data: apiLogs, error: logsError } = await supabase
    .from('google_api_logs')
    .select('api_type, cost_estimate, cache_hit, response_time_ms, created_at')
    .gte('created_at', today)
    .order('created_at', { ascending: false });

  if (logsError) {
    console.error('❌ Error fetching API logs:', logsError);
  } else {
    console.log(`\n📈 API CALLS TODAY: ${apiLogs?.length || 0}`);

    const cacheHits = apiLogs?.filter(l => l.cache_hit).length || 0;
    const googleCalls = apiLogs?.filter(l => !l.cache_hit).length || 0;
    const totalCost = apiLogs?.reduce((sum, l) => sum + (l.cost_estimate || 0), 0) || 0;
    const avgResponseTime = apiLogs?.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / (apiLogs?.length || 1);

    console.log(`  Cache Hits: ${cacheHits} (FREE! 🎉)`);
    console.log(`  Google API Calls: ${googleCalls} ($${totalCost.toFixed(3)})`);
    console.log(`  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  Total Cost Today: $${totalCost.toFixed(3)}`);

    // Calculate potential savings
    const potentialCost = (cacheHits * 0.032); // If we had called Google instead
    const actualSavings = potentialCost;

    if (cacheHits > 0) {
      console.log(`\n💰 COST SAVINGS:`);
      console.log(`  Without Cache: $${(potentialCost + totalCost).toFixed(3)}`);
      console.log(`  With Cache: $${totalCost.toFixed(3)}`);
      console.log(`  Saved: $${actualSavings.toFixed(3)} (${((actualSavings / (potentialCost + totalCost)) * 100).toFixed(1)}% reduction)`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Day 4 Testing Complete!\n');
}

checkDay4Results().catch(console.error);
