import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY!;

async function fetchAccessibilityData(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'accessibilityOptions'
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.accessibilityOptions || null;
}

async function testGoogleAccessibility() {
  console.log('Testing Google Places API - Accessibility Data');
  console.log('==============================================\n');

  // Get 5 mosques to test
  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('id, name, google_place_id')
    .eq('state', 'VIC')
    .not('google_place_id', 'is', null)
    .limit(5);

  if (error || !mosques) {
    console.error('Error fetching mosques:', error);
    return;
  }

  let foundCount = 0;

  for (const mosque of mosques) {
    console.log(`${mosque.name}`);
    console.log('─'.repeat(60));

    try {
      const accessibilityData = await fetchAccessibilityData(mosque.google_place_id);

      if (accessibilityData) {
        console.log('✓ Accessibility Data Found:');
        console.log(JSON.stringify(accessibilityData, null, 2));
        foundCount++;
      } else {
        console.log('○ No accessibility data available');
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.log('✗ Error:', error);
    }

    console.log('\n');
  }

  console.log('═'.repeat(60));
  console.log(`Summary: ${foundCount}/5 mosques have Google accessibility data`);
  console.log('═'.repeat(60));
}

testGoogleAccessibility();
