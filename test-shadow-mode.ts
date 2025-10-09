// Test Shadow Mode - Search for mosques in Sydney
// This should work exactly as before, but now also save to cache in background

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mzqyswdfgimymxfhdyzw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
  console.log('🧪 Testing Shadow Mode - Sydney search...\n');

  // Test coordinates: Sydney CBD
  const testData = {
    latitude: -33.8688,
    longitude: 151.2093,
    radius: 10000 // 10km
  };

  console.log(`📍 Searching at: (${testData.latitude}, ${testData.longitude})`);
  console.log(`📏 Radius: ${testData.radius / 1000}km\n`);

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('search-mosques', {
      body: testData
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error('❌ Search failed:', error);
      return;
    }

    console.log(`✅ Search successful! (${duration}ms)`);
    console.log(`📊 Found ${data.mosques?.length || 0} mosques\n`);

    if (data.mosques && data.mosques.length > 0) {
      console.log('First 3 results:');
      data.mosques.slice(0, 3).forEach((mosque: any, i: number) => {
        console.log(`${i + 1}. ${mosque.name} - ${mosque.distance}`);
      });
    }

    console.log('\n✨ Shadow mode is working! Search completed normally.');
    console.log('📝 Check Supabase logs to see background cache-saving in action.');

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testSearch();
