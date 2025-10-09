// Test script for the get-mosque-details Edge Function
// This will test both cache hit and cache miss scenarios

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Test location: Sydney CBD
const testLocation = {
  latitude: -33.8688,
  longitude: 151.2093,
  radius: 5000 // 5km radius
};

async function testEdgeFunction() {
  console.log('🧪 Testing get-mosque-details Edge Function\n');
  console.log(`📍 Test Location: Sydney CBD (${testLocation.latitude}, ${testLocation.longitude})`);
  console.log(`📏 Radius: ${testLocation.radius}m (${testLocation.radius/1000}km)\n`);

  const url = `${SUPABASE_URL}/functions/v1/get-mosque-details`;

  console.log('🔄 Test 1: First call (should be CACHE MISS - hits Google API)');
  console.log('─'.repeat(60));

  const start1 = Date.now();
  try {
    const response1 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testLocation)
    });

    const data1 = await response1.json();
    const time1 = Date.now() - start1;

    if (response1.ok) {
      console.log(`✅ Success! Found ${data1.mosques?.length || 0} mosques`);
      console.log(`⏱️  Response time: ${time1}ms`);
      console.log(`📊 Cache hit: ${data1.meta?.cacheHit ? 'YES (from cache)' : 'NO (from Google API)'}`);
      console.log(`💰 Cost: ${data1.meta?.cacheHit ? '$0.00 (FREE!)' : '$0.032'}\n`);

      if (data1.mosques && data1.mosques.length > 0) {
        console.log('📋 First 3 mosques found:');
        data1.mosques.slice(0, 3).forEach((mosque: any, i: number) => {
          console.log(`  ${i + 1}. ${mosque.name}`);
          console.log(`     Distance: ${mosque.distance}`);
          console.log(`     Rating: ${mosque.rating || 'N/A'}`);
        });
      }
    } else {
      console.error('❌ Error:', data1);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }

  // Wait 2 seconds before second test
  console.log('\n⏳ Waiting 2 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🔄 Test 2: Second call (should be CACHE HIT - instant!)');
  console.log('─'.repeat(60));

  const start2 = Date.now();
  try {
    const response2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testLocation)
    });

    const data2 = await response2.json();
    const time2 = Date.now() - start2;

    if (response2.ok) {
      console.log(`✅ Success! Found ${data2.mosques?.length || 0} mosques`);
      console.log(`⏱️  Response time: ${time2}ms`);
      console.log(`📊 Cache hit: ${data2.meta?.cacheHit ? 'YES (from cache) 🎉' : 'NO (from Google API)'}`);
      console.log(`💰 Cost: ${data2.meta?.cacheHit ? '$0.00 (FREE!)' : '$0.032'}`);
      console.log(`⚡ Speed improvement: ${((time1 / time2) * 100 - 100).toFixed(0)}% faster!\n`);
    } else {
      console.error('❌ Error:', data2);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Test Complete!');
  console.log('='.repeat(60));
}

// Check environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

testEdgeFunction();
