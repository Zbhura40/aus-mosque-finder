import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY!;

// Facility detection patterns
const FACILITY_PATTERNS = {
  parking: {
    positive: [
      'parking available', 'has parking', 'plenty of parking', 'free parking',
      'ample parking', 'parking space', 'car park', 'parking lot',
      'easy to park', 'sufficient parking', 'good parking'
    ],
    negative: [
      'no parking', 'limited parking', 'parking unavailable', 'lack of parking',
      'difficult to park', 'hard to find parking', 'parking is limited',
      'insufficient parking', 'no car park'
    ]
  },
  wudu: {
    positive: [
      'wudu area', 'wudu facilities', 'ablution area', 'ablution facilities',
      'wudu available', 'has wudu', 'clean wudu', 'good wudu facilities',
      'washing facilities', 'restroom', 'bathroom', 'toilet'
    ],
    negative: [
      'no wudu', 'wudu unavailable', 'no ablution', 'limited wudu',
      'poor wudu facilities', 'wudu area closed', 'no restroom'
    ]
  },
  womens_area: {
    positive: [
      "women's section", "women's area", "ladies prayer", "female prayer area",
      "separate area for women", "women prayer hall", "ladies section",
      "women's prayer room", "female section", "womens prayer space"
    ],
    negative: [
      "no women's section", "no ladies area", "men only",
      "no separate area for women", "women not allowed"
    ]
  },
  wheelchair_access: {
    positive: [
      'wheelchair accessible', 'wheelchair access', 'ramp available',
      'disabled access', 'accessible entrance', 'wheelchair friendly',
      'disability access', 'ramp for wheelchair', 'accessible'
    ],
    negative: [
      'no wheelchair access', 'not wheelchair accessible', 'no ramp',
      'no disabled access', 'stairs only', 'not accessible'
    ]
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

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.accessibilityOptions || null;
}

function extractFromReviews(reviews: any[]): Record<string, number> {
  const scores: Record<string, number> = {
    parking: 0,
    wudu: 0,
    womens_area: 0,
    wheelchair_access: 0
  };

  reviews.forEach(review => {
    const text = (review.text?.text || review.originalText?.text || '').toLowerCase();

    Object.entries(FACILITY_PATTERNS).forEach(([facility, patterns]) => {
      patterns.positive.forEach(pattern => {
        if (text.includes(pattern.toLowerCase())) {
          scores[facility]++;
        }
      });

      patterns.negative.forEach(pattern => {
        if (text.includes(pattern.toLowerCase())) {
          scores[facility]--;
        }
      });
    });
  });

  return scores;
}

async function extractFacilitiesHybrid(
  reviews: any[],
  placeId: string
): Promise<string[]> {
  const facilities: string[] = [];

  // Step 1: Get Google accessibility data
  const accessibilityData = await fetchAccessibilityData(placeId);

  // Step 2: Get review scores
  const reviewScores = extractFromReviews(reviews);

  // Step 3: Combine both sources

  // PARKING: Google has parking data OR reviews mention it >= 2 times
  if (accessibilityData?.wheelchairAccessibleParking || reviewScores.parking >= 2) {
    facilities.push('Parking');
  }

  // WHEELCHAIR ACCESS: Google confirms OR reviews mention it >= 2 times
  if (accessibilityData?.wheelchairAccessibleEntrance || reviewScores.wheelchair_access >= 2) {
    facilities.push('Wheelchair Access');
  }

  // WUDU AREA: Google has restroom OR reviews mention it >= 2 times
  if (accessibilityData?.wheelchairAccessibleRestroom || reviewScores.wudu >= 2) {
    facilities.push('Wudu Area');
  }

  // WOMEN'S AREA: Only from reviews (Google doesn't provide this)
  if (reviewScores.womens_area >= 2) {
    facilities.push("Women's Prayer Area");
  }

  return facilities;
}

async function testHybridExtraction() {
  console.log('Testing Hybrid Facility Extraction (Google API + Reviews)');
  console.log('=========================================================\n');

  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('id, name, google_place_id, reviews')
    .eq('state', 'VIC')
    .not('google_place_id', 'is', null)
    .not('reviews', 'is', null)
    .limit(10);

  if (error || !mosques) {
    console.error('Error:', error);
    return;
  }

  let totalWithFacilities = 0;

  for (let i = 0; i < mosques.length; i++) {
    const mosque = mosques[i];
    console.log(`[${i + 1}/10] ${mosque.name}`);
    console.log('─'.repeat(60));

    const facilities = await extractFacilitiesHybrid(
      mosque.reviews || [],
      mosque.google_place_id
    );

    console.log(`✓ Facilities: ${facilities.length > 0 ? facilities.join(', ') : 'None'}`);

    if (facilities.length > 0) {
      totalWithFacilities++;
    }

    console.log('');

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('═'.repeat(60));
  console.log(`Summary: ${totalWithFacilities}/10 mosques have facilities`);
  console.log('═'.repeat(60));
}

testHybridExtraction();
