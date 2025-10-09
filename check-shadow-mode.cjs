// Check Shadow Mode - Query database to verify cache is being populated

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkShadowMode() {
  console.log('🔍 Checking Shadow Mode Status...\n');

  try {
    // Check mosques_cache table
    console.log('📊 Checking mosques_cache table:');
    const { data: mosques, error: mosquesError } = await supabase
      .from('mosques_cache')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (mosquesError) {
      console.error('❌ Error querying mosques_cache:', mosquesError);
    } else {
      console.log(`✅ Total mosques in cache: ${mosques?.length || 0}`);
      if (mosques && mosques.length > 0) {
        console.log('\nMost recently added mosques:');
        mosques.forEach((m, i) => {
          console.log(`${i + 1}. ${m.name} (added: ${new Date(m.created_at).toLocaleString()})`);
        });
      }
    }

    // Check google_api_logs table
    console.log('\n\n📈 Checking google_api_logs table:');
    const { data: logs, error: logsError } = await supabase
      .from('google_api_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ Error querying google_api_logs:', logsError);
    } else {
      console.log(`✅ Total API calls logged: ${logs?.length || 0}`);
      if (logs && logs.length > 0) {
        console.log('\nMost recent API calls:');
        logs.forEach((log, i) => {
          const cost = log.cost_estimate ? `$${log.cost_estimate.toFixed(3)}` : 'FREE';
          const time = `${log.response_time_ms}ms`;
          const type = log.cache_hit ? '💾 CACHE HIT' : '🌐 GOOGLE API';
          console.log(`${i + 1}. ${type} - ${log.api_type} (${cost}, ${time}) - ${new Date(log.created_at).toLocaleString()}`);
        });
      }
    }

    // Calculate total costs
    console.log('\n\n💰 Cost Summary:');
    const { data: costData, error: costError } = await supabase
      .from('google_api_logs')
      .select('cost_estimate, cache_hit');

    if (!costError && costData) {
      const totalCost = costData.reduce((sum, log) => sum + (log.cost_estimate || 0), 0);
      const cacheHits = costData.filter(log => log.cache_hit).length;
      const totalCalls = costData.length;
      const cacheHitRate = totalCalls > 0 ? ((cacheHits / totalCalls) * 100).toFixed(1) : 0;

      console.log(`Total API calls: ${totalCalls}`);
      console.log(`Cache hits: ${cacheHits} (${cacheHitRate}%)`);
      console.log(`Total cost: $${totalCost.toFixed(2)}`);
    }

    console.log('\n✨ Shadow mode check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkShadowMode();
