/**
 * Cache Performance Monitor
 *
 * Run this script to see real-time cache performance and cost savings
 * Usage: npx tsx monitor-cache-performance.ts [days]
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DailyStats {
  date: string;
  total_calls: number;
  cache_hits: number;
  google_calls: number;
  total_cost: number;
  potential_cost: number;
  savings: number;
  cache_hit_rate: number;
  avg_response_time: number;
}

async function monitorPerformance(days: number = 7) {
  console.log('\n📊 CACHE PERFORMANCE MONITOR');
  console.log('='.repeat(80));
  console.log(`Analyzing last ${days} days...\n`);

  // Get date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch API logs
  const { data: logs, error } = await supabase
    .from('google_api_logs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching logs:', error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log('📭 No data found for this period.');
    console.log('💡 The cache system needs some real user searches to generate data.\n');
    return;
  }

  // Group by date
  const dailyStats: Map<string, DailyStats> = new Map();

  logs.forEach(log => {
    const date = log.created_at.split('T')[0];

    if (!dailyStats.has(date)) {
      dailyStats.set(date, {
        date,
        total_calls: 0,
        cache_hits: 0,
        google_calls: 0,
        total_cost: 0,
        potential_cost: 0,
        savings: 0,
        cache_hit_rate: 0,
        avg_response_time: 0
      });
    }

    const stats = dailyStats.get(date)!;
    stats.total_calls++;

    if (log.cache_hit) {
      stats.cache_hits++;
      stats.potential_cost += 0.032; // Cost we would have paid
    } else {
      stats.google_calls++;
      stats.total_cost += log.cost_estimate || 0;
    }

    stats.avg_response_time += log.response_time_ms || 0;
  });

  // Calculate final stats
  dailyStats.forEach(stats => {
    stats.savings = stats.potential_cost;
    stats.cache_hit_rate = stats.total_calls > 0
      ? (stats.cache_hits / stats.total_calls) * 100
      : 0;
    stats.avg_response_time = stats.total_calls > 0
      ? stats.avg_response_time / stats.total_calls
      : 0;
  });

  // Display daily breakdown
  console.log('📅 DAILY BREAKDOWN\n');
  console.log('Date       │ Total │ Cache │ Google │   Cost │ Savings │ Hit Rate │  Avg Speed');
  console.log('─'.repeat(80));

  let totalCalls = 0;
  let totalCacheHits = 0;
  let totalCost = 0;
  let totalSavings = 0;

  Array.from(dailyStats.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(stats => {
      totalCalls += stats.total_calls;
      totalCacheHits += stats.cache_hits;
      totalCost += stats.total_cost;
      totalSavings += stats.savings;

      console.log(
        `${stats.date} │ ${String(stats.total_calls).padStart(5)} │ ` +
        `${String(stats.cache_hits).padStart(5)} │ ` +
        `${String(stats.google_calls).padStart(6)} │ ` +
        `$${stats.total_cost.toFixed(3).padStart(5)} │ ` +
        `$${stats.savings.toFixed(3).padStart(6)} │ ` +
        `${stats.cache_hit_rate.toFixed(1).padStart(7)}% │ ` +
        `${Math.round(stats.avg_response_time).toString().padStart(6)}ms`
      );
    });

  console.log('─'.repeat(80));

  // Summary statistics
  const overallHitRate = totalCalls > 0 ? (totalCacheHits / totalCalls) * 100 : 0;
  const potentialCost = totalCost + totalSavings;

  console.log('\n💡 SUMMARY STATISTICS\n');
  console.log(`📊 Total API Calls:        ${totalCalls.toLocaleString()}`);
  console.log(`⚡ Cache Hits:             ${totalCacheHits.toLocaleString()} (${overallHitRate.toFixed(1)}%)`);
  console.log(`🌐 Google API Calls:       ${(totalCalls - totalCacheHits).toLocaleString()}`);
  console.log(`💰 Actual Cost:            $${totalCost.toFixed(2)}`);
  console.log(`💸 Cost Without Cache:     $${potentialCost.toFixed(2)}`);
  console.log(`✨ Total Savings:          $${totalSavings.toFixed(2)}`);

  if (potentialCost > 0) {
    const savingsPercent = (totalSavings / potentialCost) * 100;
    console.log(`📉 Cost Reduction:         ${savingsPercent.toFixed(1)}%`);
  }

  // Monthly projection
  const avgDailyCost = totalCost / days;
  const avgDailySavings = totalSavings / days;
  const monthlyProjection = {
    cost: avgDailyCost * 30,
    savings: avgDailySavings * 30,
    withoutCache: (avgDailyCost + avgDailySavings) * 30
  };

  console.log('\n📈 MONTHLY PROJECTION (based on current trends)\n');
  console.log(`Cost With Cache:           $${monthlyProjection.cost.toFixed(2)}/month`);
  console.log(`Cost Without Cache:        $${monthlyProjection.withoutCache.toFixed(2)}/month`);
  console.log(`Projected Savings:         $${monthlyProjection.savings.toFixed(2)}/month`);

  // Cache effectiveness
  console.log('\n🎯 CACHE EFFECTIVENESS\n');

  const { data: cacheSize } = await supabase
    .from('mosques_cache')
    .select('google_place_id', { count: 'exact', head: true });

  const totalMosques = cacheSize || 0;
  console.log(`Cached Mosques:            ${totalMosques} locations`);

  if (overallHitRate >= 80) {
    console.log(`Status:                    ✅ EXCELLENT (${overallHitRate.toFixed(1)}% hit rate)`);
  } else if (overallHitRate >= 50) {
    console.log(`Status:                    ⚠️  GOOD (${overallHitRate.toFixed(1)}% hit rate)`);
  } else if (overallHitRate > 0) {
    console.log(`Status:                    ⚠️  BUILDING UP (${overallHitRate.toFixed(1)}% hit rate)`);
  } else {
    console.log(`Status:                    📊 COLLECTING DATA...`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS\n');

  if (overallHitRate >= 80 && totalCalls >= 100) {
    console.log('✅ Cache is performing excellently!');
    console.log('   Consider increasing rollout to 50% or 100%');
  } else if (overallHitRate >= 50 && totalCalls >= 50) {
    console.log('✅ Cache is working well.');
    console.log('   Monitor for another 24-48 hours, then increase rollout');
  } else if (totalCalls < 50) {
    console.log('📊 Collecting more data...');
    console.log('   Wait for more user searches to get meaningful statistics');
  } else {
    console.log('⚠️  Cache hit rate is lower than expected.');
    console.log('   Check if users are searching in new areas not yet cached');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Get days from command line arg or default to 7
const days = parseInt(process.argv[2] || '7', 10);

monitorPerformance(days).catch(console.error);
