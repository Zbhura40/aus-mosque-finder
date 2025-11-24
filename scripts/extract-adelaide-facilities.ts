import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SECRET_KEY || ''
);

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || '';

const FACILITY_PATTERNS = {
  parking: {
    positive: ['parking available', 'has parking', 'plenty of parking', 'free parking', 'ample parking', 'parking space', 'car park', 'parking lot', 'easy to park', 'sufficient parking', 'good parking'],
    negative: ['no parking', 'limited parking', 'parking unavailable', 'lack of parking', 'difficult to park', 'hard to find parking', 'parking is limited', 'insufficient parking', 'no car park']
  },
  wudu: {
    positive: ['wudu area', 'wudu facilities', 'ablution area', 'ablution facilities', 'wudu available', 'has wudu', 'clean wudu', 'good wudu facilities', 'washing facilities', 'restroom', 'bathroom', 'toilet'],
    negative: ['no wudu', 'wudu unavailable', 'no ablution', 'limited wudu', 'poor wudu facilities', 'wudu area closed', 'no restroom']
  },
  womens_area: {
    positive: ["women's section", "women's area", "ladies prayer", "female prayer area", "separate area for women", "women prayer hall", "ladies section", "women's prayer room", "female section", "womens prayer space"],
    negative: ["no women's section", "no ladies area", "men only", "no separate area for women", "women not allowed"]
  },
  wheelchair_access: {
    positive: ['wheelchair accessible', 'wheelchair access', 'ramp available', 'disabled access', 'accessible entrance', 'wheelchair friendly', 'disability access', 'ramp for wheelchair', 'accessible'],
    negative: ['no wheelchair access', 'not wheelchair accessible', 'no ramp', 'no disabled access', 'stairs only', 'not accessible']
  }
};

async function fetchAccessibilityData(placeId: string) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'accessibilityOptions'
    }
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.accessibilityOptions || null;
}

function extractFromReviews(reviews: any[]): Record<string, number> {
  const scores: Record<string, number> = { parking: 0, wudu: 0, womens_area: 0, wheelchair_access: 0 };
  reviews.forEach(review => {
    const text = (review.text?.text || review.originalText?.text || '').toLowerCase();
    Object.entries(FACILITY_PATTERNS).forEach(([facility, patterns]) => {
      patterns.positive.forEach(pattern => { if (text.includes(pattern.toLowerCase())) scores[facility]++; });
      patterns.negative.forEach(pattern => { if (text.includes(pattern.toLowerCase())) scores[facility]--; });
    });
  });
  return scores;
}

async function extractFacilitiesHybrid(reviews: any[], placeId: string): Promise<string[]> {
  const facilities: string[] = [];
  const accessibilityData = await fetchAccessibilityData(placeId);
  const reviewScores = extractFromReviews(reviews);

  if (accessibilityData?.wheelchairAccessibleParking || reviewScores.parking >= 2) facilities.push('Parking');
  if (accessibilityData?.wheelchairAccessibleEntrance || reviewScores.wheelchair_access >= 2) facilities.push('Wheelchair Access');
  if (accessibilityData?.wheelchairAccessibleRestroom || reviewScores.wudu >= 2) facilities.push('Wudu Area');
  if (reviewScores.womens_area >= 2) facilities.push("Women's Prayer Area");

  return facilities;
}

async function extractAdelaideFacilities() {
  console.log('Extracting Facilities for Adelaide (SA) Mosques');
  console.log('================================================\n');

  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('id, name, google_place_id, reviews')
    .eq('state', 'SA')
    .eq('is_active', true)
    .not('google_place_id', 'is', null);

  if (error || !mosques) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${mosques.length} mosques to process\n`);

  let successCount = 0, failCount = 0, totalFacilities = 0;

  for (let i = 0; i < mosques.length; i++) {
    const mosque = mosques[i];
    try {
      const facilities = await extractFacilitiesHybrid(mosque.reviews || [], mosque.google_place_id);
      const { error: updateError } = await supabase.from('mosques_cache').update({ facilities }).eq('id', mosque.id);

      if (updateError) {
        console.error(`❌ [${i + 1}/${mosques.length}] ${mosque.name}: Error saving`);
        failCount++;
      } else {
        console.log(`✓ [${i + 1}/${mosques.length}] ${mosque.name}: ${facilities.length} facilities`);
        successCount++;
        totalFacilities += facilities.length;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ [${i + 1}/${mosques.length}] ${mosque.name}: Error -`, error);
      failCount++;
    }
  }

  console.log('\n=================');
  console.log('Summary:');
  console.log('=================');
  console.log(`✓ Success: ${successCount} mosques`);
  console.log(`❌ Failed: ${failCount} mosques`);
  console.log(`📊 Total facilities extracted: ${totalFacilities}`);
  console.log(`📈 Average: ${(totalFacilities / successCount).toFixed(1)} facilities per mosque`);
}

extractAdelaideFacilities();
