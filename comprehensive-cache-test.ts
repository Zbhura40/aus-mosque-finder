// Comprehensive cache test to verify the system is working correctly

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

interface TestResult {
  location: string;
  callNumber: number;
  mosqueCount: number;
  cacheHit: boolean;
  responseTime: number;
  cost: number;
}

const testLocations = [
  { name: "Sydney CBD", lat: -33.8688, lng: 151.2093, radius: 5000 },
  { name: "Brisbane CBD", lat: -27.4698, lng: 153.0251, radius: 5000 },
];

async function testCache() {
  console.log('🧪 COMPREHENSIVE CACHE SYSTEM TEST\n');
  console.log('='.repeat(70));

  const results: TestResult[] = [];
  let totalSavings = 0;

  for (const location of testLocations) {
    console.log(`\n📍 Testing: ${location.name}`);
    console.log('-'.repeat(70));

    // Test 1: First call (should MISS cache)
    console.log('\n🔄 Call #1: First request (expect CACHE MISS)');
    const start1 = Date.now();

    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/get-mosque-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY!
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        radius: location.radius
      })
    });

    const data1 = await response1.json();
    const time1 = Date.now() - start1;

    results.push({
      location: location.name,
      callNumber: 1,
      mosqueCount: data1.meta.count,
      cacheHit: data1.meta.cacheHit,
      responseTime: data1.meta.responseTime,
      cost: data1.meta.cacheHit ? 0 : 0.032
    });

    console.log(`   ✓ Found: ${data1.meta.count} mosques`);
    console.log(`   ✓ Cache Hit: ${data1.meta.cacheHit ? '✅ YES' : '❌ NO (expected)'}`);
    console.log(`   ✓ Response Time: ${data1.meta.responseTime}ms`);
    console.log(`   ✓ Cost: $${data1.meta.cacheHit ? '0.00 (FREE)' : '0.032'}`);

    if (data1.meta.cacheHit) {
      console.log('   ⚠️  WARNING: Expected cache MISS on first call!');
    }

    // Wait 2 seconds
    console.log('\n⏳ Waiting 2 seconds before second call...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Second call (should HIT cache)
    console.log('\n🔄 Call #2: Same location (expect CACHE HIT)');
    const start2 = Date.now();

    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/get-mosque-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY!
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        radius: location.radius
      })
    });

    const data2 = await response2.json();
    const time2 = Date.now() - start2;

    results.push({
      location: location.name,
      callNumber: 2,
      mosqueCount: data2.meta.count,
      cacheHit: data2.meta.cacheHit,
      responseTime: data2.meta.responseTime,
      cost: data2.meta.cacheHit ? 0 : 0.032
    });

    console.log(`   ✓ Found: ${data2.meta.count} mosques`);
    console.log(`   ✓ Cache Hit: ${data2.meta.cacheHit ? '✅ YES (expected!)' : '❌ NO'}`);
    console.log(`   ✓ Response Time: ${data2.meta.responseTime}ms`);
    console.log(`   ✓ Cost: $${data2.meta.cacheHit ? '0.00 (FREE)' : '0.032'}`);

    if (!data2.meta.cacheHit) {
      console.log('   ❌ ERROR: Expected cache HIT on second call!');
    } else {
      const speedup = (data1.meta.responseTime / data2.meta.responseTime).toFixed(1);
      console.log(`   🚀 Speed improvement: ${speedup}x faster!`);
      totalSavings += 0.032;
    }

    // Test 3: Third call (should also HIT cache)
    console.log('\n🔄 Call #3: Same location again (expect CACHE HIT)');

    const response3 = await fetch(`${SUPABASE_URL}/functions/v1/get-mosque-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY!
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        radius: location.radius
      })
    });

    const data3 = await response3.json();

    results.push({
      location: location.name,
      callNumber: 3,
      mosqueCount: data3.meta.count,
      cacheHit: data3.meta.cacheHit,
      responseTime: data3.meta.responseTime,
      cost: data3.meta.cacheHit ? 0 : 0.032
    });

    console.log(`   ✓ Found: ${data3.meta.count} mosques`);
    console.log(`   ✓ Cache Hit: ${data3.meta.cacheHit ? '✅ YES' : '❌ NO'}`);
    console.log(`   ✓ Response Time: ${data3.meta.responseTime}ms`);
    console.log(`   ✓ Cost: $${data3.meta.cacheHit ? '0.00 (FREE)' : '0.032'}`);

    if (data3.meta.cacheHit) {
      totalSavings += 0.032;
    }

    console.log('\n' + '-'.repeat(70));
  }

  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('='.repeat(70));

  const totalCalls = results.length;
  const cacheHits = results.filter(r => r.cacheHit).length;
  const cacheMisses = results.filter(r => !r.cacheHit).length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const expectedCost = totalCalls * 0.032; // If no cache
  const actualSavings = expectedCost - totalCost;

  console.log(`\nTotal API calls made: ${totalCalls}`);
  console.log(`Cache HITs: ${cacheHits} ✅`);
  console.log(`Cache MISSes: ${cacheMisses} 💸`);
  console.log(`Cache hit rate: ${((cacheHits/totalCalls)*100).toFixed(1)}%`);
  console.log(`\nCost without cache: $${expectedCost.toFixed(3)}`);
  console.log(`Cost WITH cache: $${totalCost.toFixed(3)}`);
  console.log(`Savings: $${actualSavings.toFixed(3)} (${((actualSavings/expectedCost)*100).toFixed(0)}% reduction)`);

  // Detailed results table
  console.log('\n📋 Detailed Results:');
  console.log('-'.repeat(70));
  console.log('Location          | Call | Mosques | Cache Hit | Time(ms) | Cost');
  console.log('-'.repeat(70));

  results.forEach(r => {
    const hit = r.cacheHit ? 'YES ✅' : 'NO  ❌';
    const cost = r.cost === 0 ? 'FREE' : '$0.032';
    console.log(
      `${r.location.padEnd(17)} | #${r.callNumber}   | ${String(r.mosqueCount).padEnd(7)} | ${hit.padEnd(9)} | ${String(r.responseTime).padEnd(8)} | ${cost}`
    );
  });

  console.log('-'.repeat(70));

  // Validation
  console.log('\n✅ VALIDATION CHECKS:');

  const firstCallsAreMisses = results.filter(r => r.callNumber === 1).every(r => !r.cacheHit);
  const secondCallsAreHits = results.filter(r => r.callNumber === 2).every(r => r.cacheHit);
  const thirdCallsAreHits = results.filter(r => r.callNumber === 3).every(r => r.cacheHit);

  console.log(`   ${firstCallsAreMisses ? '✅' : '❌'} First calls are cache MISSES`);
  console.log(`   ${secondCallsAreHits ? '✅' : '❌'} Second calls are cache HITS`);
  console.log(`   ${thirdCallsAreHits ? '✅' : '❌'} Third calls are cache HITS`);

  const allTestsPassed = firstCallsAreMisses && secondCallsAreHits && thirdCallsAreHits;

  console.log('\n' + '='.repeat(70));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Cache system is working correctly! 🎉');
  } else {
    console.log('❌ SOME TESTS FAILED! Cache system needs debugging.');
  }
  console.log('='.repeat(70));
}

// Check environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

testCache();
