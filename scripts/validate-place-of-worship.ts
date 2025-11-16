/**
 * Validates if a "place_of_worship" from Google Places is actually Islamic
 *
 * Uses 3-layer filtering:
 * - Layer 1: Name-based keyword detection
 * - Layer 2: Location/context analysis
 * - Layer 3: Manual review for unclear cases
 */

export interface ValidationResult {
  isIslamic: boolean | null; // null = needs manual review
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  category: 'mosque' | 'prayer_room' | 'islamic_center' | 'non_islamic' | 'unclear';
}

export function validatePlaceOfWorship(
  name: string,
  types: string[],
  address: string,
  formattedAddress?: string
): ValidationResult {
  const nameLower = name.toLowerCase();
  const addressLower = (address || formattedAddress || '').toLowerCase();

  // ============================================================================
  // LAYER 1: NAME-BASED FILTERING (Primary Defense)
  // ============================================================================

  // ISLAMIC KEYWORDS (High Confidence - Auto Approve)
  const islamicKeywords = [
    /\bmosque\b/i,
    /\bmasjid\b/i,
    /\bmusalla\b/i,
    /\bmusallah\b/i,
    /\bjamaat\b/i,
    /\bjama'?ah\b/i,
    /\bislamic\s+(center|centre)\b/i,
    /\bislamic\s+society\b/i,
    /\bislamic\s+community\b/i,
    /\bislamic\s+association\b/i,
    /\bmuslim\s+prayer\b/i,
    /\bmuslim\s+community\b/i,
  ];

  for (const keyword of islamicKeywords) {
    if (keyword.test(nameLower)) {
      return {
        isIslamic: true,
        confidence: 'high',
        reason: `Islamic keyword detected: "${name.match(keyword)?.[0]}"`,
        category: nameLower.includes('prayer') ? 'prayer_room' :
                  nameLower.includes('center') || nameLower.includes('centre') ? 'islamic_center' :
                  'mosque'
      };
    }
  }

  // NON-ISLAMIC KEYWORDS (High Confidence - Auto Reject)
  const nonIslamicKeywords = [
    /\bchurch\b/i,
    /\bchapel\b/i,
    /\bcathedral\b/i,
    /\btemple\b/i,
    /\bsynagogue\b/i,
    /\bgurdwara\b/i,
    /\bmandir\b/i,
    /\bpagoda\b/i,
    /\bshrine\b/i,
    /\babbey\b/i,
    /\bmonastery\b/i,
    /\bconvent\b/i,
    /\bbuddh(ist|a)\b/i,
    /\bhindu\b/i,
    /\bsikh\b/i,
    /\bjewish\b/i,
    /\bchristian\b/i,
    /\bcatholic\b/i,
    /\bprotestant\b/i,
    /\borthodox\s+church\b/i,
  ];

  for (const keyword of nonIslamicKeywords) {
    if (keyword.test(nameLower)) {
      return {
        isIslamic: false,
        confidence: 'high',
        reason: `Non-Islamic place detected: "${name.match(keyword)?.[0]}"`,
        category: 'non_islamic'
      };
    }
  }

  // ============================================================================
  // LAYER 2: LOCATION CONTEXT ANALYSIS (Secondary Defense)
  // ============================================================================

  // PRAYER ROOM at public facilities (Medium Confidence)
  if (nameLower.includes('prayer room') || nameLower.includes('prayer space')) {
    const publicFacilities = [
      { pattern: /airport/i, type: 'airport' },
      { pattern: /university|uni\b/i, type: 'university' },
      { pattern: /hospital/i, type: 'hospital' },
      { pattern: /shopping\s+(center|centre|mall)/i, type: 'shopping_centre' },
      { pattern: /campus/i, type: 'campus' },
      { pattern: /college/i, type: 'college' },
      { pattern: /medical\s+center/i, type: 'medical_center' },
    ];

    for (const facility of publicFacilities) {
      if (facility.pattern.test(nameLower) || facility.pattern.test(addressLower)) {
        return {
          isIslamic: true,
          confidence: 'medium',
          reason: `Prayer room at ${facility.type} (multi-faith, likely includes Islamic facilities)`,
          category: 'prayer_room'
        };
      }
    }

    // Generic prayer room without clear location context
    return {
      isIslamic: null,
      confidence: 'low',
      reason: 'Prayer room without clear facility context - needs manual review',
      category: 'unclear'
    };
  }

  // MULTI-FAITH SPACES (Medium Confidence)
  if (nameLower.includes('multi-faith') || nameLower.includes('interfaith')) {
    return {
      isIslamic: true,
      confidence: 'medium',
      reason: 'Multi-faith space (likely includes Islamic prayer facilities)',
      category: 'prayer_room'
    };
  }

  // COMMUNITY CENTER with Islamic indicators
  if (nameLower.includes('community') && addressLower.match(/arabic|halal|islamic/i)) {
    return {
      isIslamic: true,
      confidence: 'medium',
      reason: 'Community center in area with Islamic indicators',
      category: 'islamic_center'
    };
  }

  // ============================================================================
  // LAYER 3: MANUAL REVIEW (Final Safety Net)
  // ============================================================================

  // If we get here, it's a place_of_worship we can't confidently classify
  return {
    isIslamic: null,
    confidence: 'low',
    reason: `Unclear classification - Name: "${name}", Types: ${types.join(', ')}`,
    category: 'unclear'
  };
}

/**
 * Test the validation function with known cases
 */
export function runValidationTests() {
  const testCases = [
    // SHOULD PASS - High Confidence
    { name: 'Brisbane Domestic Airport Prayer Room', address: 'Brisbane Airport, QLD', shouldPass: true },
    { name: 'Lakemba Mosque', address: 'Lakemba, NSW', shouldPass: true },
    { name: 'Perth Masjid', address: 'Perth, WA', shouldPass: true },
    { name: 'Griffith University Musalla', address: 'Nathan, QLD', shouldPass: true },
    { name: 'Islamic Society of Tasmania', address: 'Hobart, TAS', shouldPass: true },
    { name: 'Muslim Prayer Room', address: 'Sydney, NSW', shouldPass: true },

    // SHOULD PASS - Medium Confidence
    { name: 'Airport Prayer Room', address: 'Melbourne Airport, VIC', shouldPass: true },
    { name: 'Multi-faith Prayer Space', address: 'University of Sydney, NSW', shouldPass: true },

    // SHOULD FAIL - High Confidence
    { name: "St Mary's Cathedral", address: 'Sydney, NSW', shouldPass: false },
    { name: 'Buddhist Temple', address: 'Melbourne, VIC', shouldPass: false },
    { name: 'Hindu Mandir', address: 'Perth, WA', shouldPass: false },
    { name: 'Great Synagogue', address: 'Sydney, NSW', shouldPass: false },
    { name: 'Hillsong Church', address: 'Sydney, NSW', shouldPass: false },

    // UNCLEAR - Needs Manual Review
    { name: 'Prayer Space', address: 'Unknown Location', shouldPass: null },
  ];

  console.log('\n🧪 VALIDATION TESTS\n');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  testCases.forEach((test, index) => {
    const result = validatePlaceOfWorship(test.name, ['place_of_worship'], test.address);
    const expected = test.shouldPass;
    const actual = result.isIslamic;

    let status = '';
    if (expected === null) {
      // Test case expects manual review
      status = actual === null ? '✅ CORRECT (needs review)' : '❌ WRONG (should need review)';
      actual === null ? passed++ : failed++;
    } else {
      // Test case has clear expectation
      status = actual === expected ? '✅ PASS' : '❌ FAIL';
      actual === expected ? passed++ : failed++;
    }

    console.log(`\n${index + 1}. ${test.name}`);
    console.log(`   ${status}`);
    console.log(`   Confidence: ${result.confidence} | Category: ${result.category}`);
    console.log(`   Reason: ${result.reason}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 RESULTS: ${passed}/${testCases.length} tests passed\n`);

  return { passed, failed, total: testCases.length };
}

