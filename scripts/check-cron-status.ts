import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function checkCronStatus() {
  console.log('🔍 Checking Auto-Refresh Cron Job Status\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check google_api_logs for recent refresh activity
  const { data: logs, error } = await supabase
    .from('google_api_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15);

  if (error) {
    console.error('❌ Error fetching logs:', error.message);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('⚠️  No API logs found in database\n');
    console.log('This could mean:');
    console.log('   1. Cron job was never set up');
    console.log('   2. google_api_logs table is empty');
    console.log('   3. Database connection issue\n');
    return;
  }

  console.log('📊 Recent Google API Activity (Last 15 operations):\n');

  logs.forEach((log, i) => {
    const date = new Date(log.created_at);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const hoursAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    const timeAgo = daysAgo > 0 ? `${daysAgo} days ago` : `${hoursAgo} hours ago`;

    console.log(`${i + 1}. ${date.toLocaleString()}`);
    console.log(`   ⏰ ${timeAgo}`);
    console.log(`   Type: ${log.operation_type || 'N/A'}`);
    console.log(`   Cost: $${(log.estimated_cost || 0).toFixed(4)}`);
    if (log.mosque_count) console.log(`   Mosques: ${log.mosque_count}`);
    if (log.notes) console.log(`   Notes: ${log.notes}`);
    console.log('');
  });

  // Analyze refresh pattern
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📅 Auto-Refresh Analysis:\n');

  const mostRecent = logs[0];
  const lastRefreshDate = new Date(mostRecent.created_at);
  const now = new Date();
  const daysSinceLastRefresh = Math.floor((now.getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60 * 24));
  const hoursSinceLastRefresh = Math.floor((now.getTime() - lastRefreshDate.getTime()) / (1000 * 60 * 60));

  console.log(`   Last refresh: ${lastRefreshDate.toLocaleString()}`);
  console.log(`   Time since: ${daysSinceLastRefresh} days (${hoursSinceLastRefresh} hours)`);
  console.log(`   Operation: ${mostRecent.operation_type || 'Unknown'}`);
  console.log('');

  // Check for weekly refresh pattern
  const weeklyRefreshes = logs.filter(log => {
    const operation = log.operation_type || '';
    return operation.toLowerCase().includes('refresh') ||
           operation.toLowerCase().includes('weekly') ||
           operation.toLowerCase().includes('auto');
  });

  if (weeklyRefreshes.length > 0) {
    console.log(`   ✅ Found ${weeklyRefreshes.length} auto-refresh operations in recent logs\n`);
    console.log('   Recent auto-refreshes:');
    weeklyRefreshes.slice(0, 5).forEach((refresh, i) => {
      const date = new Date(refresh.created_at);
      const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`      ${i + 1}. ${date.toLocaleDateString()} (${daysAgo} days ago)`);
    });
    console.log('');
  } else {
    console.log('   ⚠️  No auto-refresh operations found in recent logs\n');
  }

  // Check if refresh is overdue
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (daysSinceLastRefresh > 7) {
    console.log('⚠️  WARNING: Auto-refresh appears to be OVERDUE!\n');
    console.log(`   Expected: Weekly (every 7 days)`);
    console.log(`   Actual: Last activity was ${daysSinceLastRefresh} days ago\n`);
    console.log('🔧 Possible Issues:\n');
    console.log('   1. Cron job not configured in hosting platform');
    console.log('   2. Cron job credentials/secrets missing or expired');
    console.log('   3. Cron job failing silently (check error logs)');
    console.log('   4. Vercel cron job disabled or quota exceeded');
    console.log('   5. API endpoint not responding\n');
    console.log('🛠️  Next Steps:\n');
    console.log('   1. Check Vercel dashboard for cron job status');
    console.log('   2. Check Vercel logs for cron execution errors');
    console.log('   3. Test refresh endpoint manually');
    console.log('   4. Run manual refresh if needed\n');
  } else if (daysSinceLastRefresh >= 5) {
    console.log('⚠️  NOTICE: Refresh due soon\n');
    console.log(`   Last refresh: ${daysSinceLastRefresh} days ago`);
    console.log('   Next expected: Within 2 days\n');
  } else {
    console.log('✅ Auto-refresh is WORKING CORRECTLY\n');
    console.log(`   Last refresh: ${daysSinceLastRefresh} days ago (${hoursSinceLastRefresh} hours)`);
    console.log('   Status: Within expected 7-day window\n');
  }

  // Calculate total API costs
  const totalCost = logs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💰 Cost Summary (Last 15 operations):\n');
  console.log(`   Total cost: $${totalCost.toFixed(4)}`);
  console.log(`   Average per operation: $${(totalCost / logs.length).toFixed(4)}\n`);

  // Check mosques_cache last update
  const { data: cacheStats, error: cacheError } = await supabase
    .from('mosques_cache')
    .select('last_updated')
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();

  if (cacheStats && cacheStats.last_updated) {
    const cacheDate = new Date(cacheStats.last_updated);
    const daysSinceCacheUpdate = Math.floor((now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💾 Cache Status:\n');
    console.log(`   Last cache update: ${cacheDate.toLocaleString()}`);
    console.log(`   Days since update: ${daysSinceCacheUpdate}\n`);

    if (daysSinceCacheUpdate > 7) {
      console.log('   ⚠️  Cache is stale (>7 days old)\n');
    } else {
      console.log('   ✅ Cache is fresh (<7 days old)\n');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Check complete!\n');
}

checkCronStatus().catch(console.error);
