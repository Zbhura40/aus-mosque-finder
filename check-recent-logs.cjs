// Check for very recent API logs (last few minutes)

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentLogs() {
  console.log('🔍 Checking for logs in the last 10 minutes...\n');

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: recentLogs, error } = await supabase
      .from('google_api_logs')
      .select('*')
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`Found ${recentLogs?.length || 0} API calls in last 10 minutes:`);

    if (recentLogs && recentLogs.length > 0) {
      recentLogs.forEach((log, i) => {
        const cost = log.cost_estimate ? `$${log.cost_estimate.toFixed(3)}` : 'FREE';
        const type = log.cache_hit ? '💾 CACHE' : '🌐 GOOGLE';
        const time = new Date(log.created_at).toLocaleString();
        console.log(`\n${i + 1}. ${type} - ${log.api_type}`);
        console.log(`   Cost: ${cost}`);
        console.log(`   Response time: ${log.response_time_ms}ms`);
        console.log(`   Time: ${time}`);
        if (log.error_message) {
          console.log(`   ⚠️  Error: ${log.error_message}`);
        }
      });
    } else {
      console.log('\n⚠️  No API logs found in the last 10 minutes.');
      console.log('This might mean:');
      console.log('  1. API logging is not working');
      console.log('  2. Or no searches have been performed');
    }

    // Also check all mosques added in last 10 minutes
    console.log('\n\n📦 Checking mosques added in last 10 minutes:');
    const { data: recentMosques, error: mosquesError } = await supabase
      .from('mosques_cache')
      .select('name, suburb, state, created_at')
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false });

    if (!mosquesError && recentMosques) {
      console.log(`Found ${recentMosques.length} mosques:`);
      recentMosques.forEach((m, i) => {
        const location = m.suburb && m.state ? `${m.suburb}, ${m.state}` : 'Unknown';
        console.log(`  ${i + 1}. ${m.name} (${location}) - ${new Date(m.created_at).toLocaleString()}`);
      });
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkRecentLogs();
