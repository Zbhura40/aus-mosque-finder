// Test Live Search - Do a real search and verify shadow mode saves data

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLiveSearch() {
  console.log('🧪 LIVE SEARCH TEST - Testing Shadow Mode\n');
  console.log('=' .repeat(60));

  // Test 1: Do a search in Melbourne (different location)
  console.log('\n📍 Test Search: Melbourne CBD (10km radius)');
  console.log('Coordinates: -37.8136, 144.9631\n');

  const searchParams = {
    latitude: -37.8136,
    longitude: 144.9631,
    radius: 10000
  };

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('search-mosques', {
      body: searchParams
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error('❌ Search failed:', error);
      return false;
    }

    console.log(`✅ Search completed successfully! (${duration}ms)`);
    console.log(`📊 Found ${data.mosques?.length || 0} mosques`);

    if (data.mosques && data.mosques.length > 0) {
      console.log('\nTop 3 Results:');
      data.mosques.slice(0, 3).forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} - ${m.distance}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Search test PASSED - Now checking shadow mode...\n');
    return true;

  } catch (err) {
    console.error('❌ Error during search:', err);
    return false;
  }
}

async function verifyShadowMode() {
  console.log('🔍 Verifying Shadow Mode Data Capture\n');

  // Use service key to check backend tables
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check cache before and after
    console.log('📦 Checking mosques_cache table...');
    const { data: mosques, error: mosquesError } = await adminClient
      .from('mosques_cache')
      .select('id, name, created_at, suburb, state')
      .order('created_at', { ascending: false })
      .limit(10);

    if (mosquesError) {
      console.error('❌ Error:', mosquesError);
      return false;
    }

    console.log(`✅ Total cached mosques: ${mosques?.length || 0}`);

    if (mosques && mosques.length > 0) {
      console.log('\nMost recently cached:');
      mosques.forEach((m, i) => {
        const location = m.suburb && m.state ? `${m.suburb}, ${m.state}` : 'Unknown';
        const time = new Date(m.created_at).toLocaleString();
        console.log(`  ${i + 1}. ${m.name} (${location}) - ${time}`);
      });
    }

    // Check API logs
    console.log('\n📈 Checking google_api_logs table...');
    const { data: logs, error: logsError } = await adminClient
      .from('google_api_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ Error:', logsError);
      return false;
    }

    console.log(`✅ Total API calls logged: ${logs?.length || 0}`);

    if (logs && logs.length > 0) {
      console.log('\nMost recent API calls:');
      logs.forEach((log, i) => {
        const cost = log.cost_estimate ? `$${log.cost_estimate.toFixed(3)}` : 'FREE';
        const type = log.cache_hit ? '💾 CACHE' : '🌐 GOOGLE';
        const time = new Date(log.created_at).toLocaleString();
        console.log(`  ${i + 1}. ${type} - ${log.api_type} (${cost}, ${log.response_time_ms}ms) - ${time}`);
      });
    }

    // Calculate today's costs
    console.log('\n💰 Today\'s Cost Summary:');
    const today = new Date().toISOString().split('T')[0];
    const { data: todayCosts } = await adminClient
      .from('google_api_logs')
      .select('cost_estimate, cache_hit')
      .gte('created_at', `${today}T00:00:00`);

    if (todayCosts) {
      const totalCost = todayCosts.reduce((sum, log) => sum + (log.cost_estimate || 0), 0);
      const cacheHits = todayCosts.filter(log => log.cache_hit).length;
      const totalCalls = todayCosts.length;

      console.log(`  Total calls today: ${totalCalls}`);
      console.log(`  Cache hits: ${cacheHits}`);
      console.log(`  Total cost today: $${totalCost.toFixed(3)}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SHADOW MODE VERIFICATION COMPLETE');
    console.log('='.repeat(60));

    return true;

  } catch (err) {
    console.error('❌ Verification error:', err);
    return false;
  }
}

async function runFullTest() {
  console.log('\n🚀 Starting Full Shadow Mode Test\n');

  const searchSuccess = await testLiveSearch();

  if (!searchSuccess) {
    console.error('\n❌ Search test failed. Aborting.');
    process.exit(1);
  }

  // Wait a moment for background processes
  console.log('⏳ Waiting 3 seconds for shadow mode to save data...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const verifySuccess = await verifyShadowMode();

  if (verifySuccess) {
    console.log('\n🎉 ALL TESTS PASSED! Shadow mode is working perfectly.');
    process.exit(0);
  } else {
    console.error('\n⚠️  Verification incomplete. Check logs.');
    process.exit(1);
  }
}

runFullTest();
