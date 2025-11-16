import { validatePlaceOfWorship } from './validate-place-of-worship';

/**
 * Test the validation function with known cases
 */
function runValidationTests() {
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

// Run tests
runValidationTests();
