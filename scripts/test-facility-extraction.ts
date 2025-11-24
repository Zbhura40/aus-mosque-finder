import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

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
      'washing facilities'
    ],
    negative: [
      'no wudu', 'wudu unavailable', 'no ablution', 'limited wudu',
      'poor wudu facilities', 'wudu area closed'
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

function extractFacilities(reviews: any[]): string[] {
  const scores: Record<string, number> = {
    parking: 0,
    wudu: 0,
    womens_area: 0,
    wheelchair_access: 0
  };

  const matches: Record<string, string[]> = {
    parking: [],
    wudu: [],
    womens_area: [],
    wheelchair_access: []
  };

  // Analyze all reviews
  reviews.forEach(review => {
    const text = (review.text?.text || review.originalText?.text || '').toLowerCase();

    Object.entries(FACILITY_PATTERNS).forEach(([facility, patterns]) => {
      // Check positive patterns
      patterns.positive.forEach(pattern => {
        if (text.includes(pattern.toLowerCase())) {
          scores[facility]++;
          matches[facility].push(`✓ "${pattern}" in review by ${review.authorAttribution?.displayName}`);
        }
      });

      // Check negative patterns
      patterns.negative.forEach(pattern => {
        if (text.includes(pattern.toLowerCase())) {
          scores[facility]--;
          matches[facility].push(`✗ "${pattern}" in review by ${review.authorAttribution?.displayName}`);
        }
      });
    });
  });

  // Determine facilities (score >= 2)
  const facilities: string[] = [];
  const facilityNames = {
    parking: 'Parking',
    wudu: 'Wudu Area',
    womens_area: "Women's Prayer Area",
    wheelchair_access: 'Wheelchair Access'
  };

  console.log('\n  Facility Scores:');
  Object.entries(scores).forEach(([facility, score]) => {
    console.log(`  - ${facilityNames[facility as keyof typeof facilityNames]}: ${score > 0 ? '+' : ''}${score}`);

    if (matches[facility].length > 0) {
      console.log(`    Matches:`);
      matches[facility].forEach(match => {
        console.log(`      ${match}`);
      });
    }

    if (score >= 2) {
      facilities.push(facilityNames[facility as keyof typeof facilityNames]);
    }
  });

  return facilities;
}

async function testFacilityExtraction() {
  console.log('Testing Facility Extraction on 10 Melbourne Mosques');
  console.log('===================================================\n');

  // Get 10 mosques with reviews
  const { data: mosques, error } = await supabase
    .from('mosques_cache')
    .select('id, name, reviews')
    .eq('state', 'VIC')
    .not('reviews', 'is', null)
    .limit(10);

  if (error || !mosques) {
    console.error('Error fetching mosques:', error);
    return;
  }

  let totalExtracted = 0;

  mosques.forEach((mosque, index) => {
    console.log(`[${index + 1}/10] ${mosque.name}`);
    console.log('─'.repeat(60));

    const reviews = mosque.reviews || [];
    console.log(`  Reviews: ${reviews.length}`);

    const facilities = extractFacilities(reviews);

    console.log(`\n  ✓ Extracted Facilities: ${facilities.length > 0 ? facilities.join(', ') : 'None detected'}`);

    if (facilities.length > 0) {
      totalExtracted++;
    }

    console.log('\n');
  });

  console.log('═'.repeat(60));
  console.log(`Summary: ${totalExtracted}/10 mosques have detectable facilities`);
  console.log('═'.repeat(60));
}

testFacilityExtraction();
