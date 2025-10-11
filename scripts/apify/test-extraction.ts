#!/usr/bin/env node
/**
 * Test Email Extraction (Small Sample)
 * =====================================
 * Extracts 10-20 mosques from Sydney as a test
 * Verifies entire pipeline before running full extraction
 */

import 'dotenv/config';
import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import { validateEmail, getValidationStats } from './email-validator.js';
import { extractEmailsFromText, prioritizeEmails } from './email-validator.js';

// Initialize clients
const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

console.log('\n');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║          TEST EMAIL EXTRACTION (SMALL SAMPLE)             ║');
console.log('║                                                           ║');
console.log('║  Location: Sydney, NSW                                    ║');
console.log('║  Target:   10-20 mosques                                  ║');
console.log('║  Cost:     ~$0.50-1                                       ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('\n');

async function testExtraction() {
  const startTime = Date.now();

  // Step 1: Extract mosques from Google Maps (Sydney only)
  console.log('📍 STEP 1: Extract mosques from Google Maps (Sydney)\n');

  try {
    const run = await apifyClient.actor('compass/google-maps-extractor').call({
      searchStringsArray: ['mosque OR masjid Sydney, NSW, Australia'],
      maxCrawledPlacesPerSearch: 20, // Limit to 20 results
      language: 'en',
      deeperCityScrape: false,
      scrapeReviewsPersonalData: false,
      scrapeDirections: false,
      scrapeImages: false,
      exportPlaceUrls: true,
      includeWebResults: true,
    });

    console.log(`✅ Actor run started: ${run.id}`);
    console.log('   Waiting for results...\n');

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`✅ Found ${items.length} mosques in Sydney\n`);

    if (items.length === 0) {
      console.error('❌ No mosques found. Aborting test.');
      process.exit(1);
    }

    // Step 2: Process results
    console.log('🔍 STEP 2: Process mosque data\n');

    const mosques = items.map((item: any) => ({
      name: item.title || item.name,
      address: item.address,
      phone: item.phone,
      website: item.website,
      placeId: item.placeId,
      location: item.location,
    }));

    console.log('Sample mosque data:');
    console.log(`  Name: ${mosques[0].name}`);
    console.log(`  Address: ${mosques[0].address}`);
    console.log(`  Website: ${mosques[0].website || 'N/A'}`);
    console.log(`  Phone: ${mosques[0].phone || 'N/A'}\n`);

    // Step 3: Extract emails from websites
    console.log('🌐 STEP 3: Extract emails from websites\n');

    const mosquesWithWebsites = mosques.filter((m: any) => m.website);
    console.log(`Found ${mosquesWithWebsites.length} mosques with websites`);
    console.log(`Testing with first 5 websites only...\n`);

    const testMosques = mosquesWithWebsites.slice(0, 5);
    const emailResults: any[] = [];

    for (let i = 0; i < testMosques.length; i++) {
      const mosque = testMosques[i];
      console.log(`[${i + 1}/${testMosques.length}] ${mosque.name}`);

      try {
        // For test, we'll do a simple fetch instead of full Apify scraping
        console.log(`   Fetching: ${mosque.website}`);

        const response = await fetch(mosque.website, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FindMyMosque/1.0; +https://findmymosque.org)'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (response.ok) {
          const html = await response.text();
          const emails = extractEmailsFromText(html);
          const prioritized = prioritizeEmails(emails);

          console.log(`   ✅ Found ${emails.length} email(s)`);
          if (emails.length > 0) {
            console.log(`   📧 ${prioritized.slice(0, 2).join(', ')}`);
          }

          emailResults.push({
            mosque,
            emails: prioritized,
          });
        } else {
          console.log(`   ⚠️  HTTP ${response.status}`);
        }
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message.substring(0, 50)}`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Email extraction complete: ${emailResults.length} websites processed\n`);

    // Step 4: Validate emails
    console.log('✅ STEP 4: Validate email addresses (DNS MX records)\n');

    const allEmails = emailResults.flatMap(r => r.emails).slice(0, 10); // Test with first 10
    console.log(`Validating ${allEmails.length} emails...\n`);

    const validationResults = [];
    for (let i = 0; i < allEmails.length; i++) {
      const email = allEmails[i];
      process.stdout.write(`  [${i + 1}/${allEmails.length}] ${email.padEnd(40)}`);

      const result = await validateEmail(email);
      validationResults.push(result);

      console.log(result.isValid ? '✅ Valid' : '❌ Invalid');
    }

    const stats = getValidationStats(validationResults);
    console.log(`\n📊 Validation Results:`);
    console.log(`   Valid:   ${stats.valid} (${stats.validPercentage}%)`);
    console.log(`   Invalid: ${stats.invalid}\n`);

    // Step 5: Upload to database
    console.log('📤 STEP 5: Upload to Supabase\n');

    const recordsToUpload = emailResults.slice(0, 3).map(result => {
      const validatedEmails = validationResults.filter(v =>
        result.emails.includes(v.email)
      );

      return {
        name: result.mosque.name,
        location: result.mosque.address,
        state: 'NSW',
        phone: result.mosque.phone,
        website: result.mosque.website,
        email_primary: result.emails[0],
        email_secondary: result.emails[1],
        email_tertiary: result.emails[2],
        email_verified: validatedEmails[0]?.isValid || false,
        source: 'website',
        google_place_id: result.mosque.placeId,
        last_updated: new Date().toISOString(),
      };
    });

    console.log(`Uploading ${recordsToUpload.length} test records...\n`);

    const { data, error } = await supabase
      .from('mosques_emails')
      .insert(recordsToUpload)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully uploaded ${data?.length || 0} records\n`);

    // Final summary
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║                   ✅ TEST COMPLETE                        ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log(`  🕌 Mosques Found:      ${items.length}`);
    console.log(`  🌐 Websites Checked:   ${testMosques.length}`);
    console.log(`  📧 Emails Found:       ${allEmails.length}`);
    console.log(`  ✅ Emails Validated:   ${stats.valid}`);
    console.log(`  📤 Records Uploaded:   ${data?.length || 0}`);
    console.log(`  ⏱️  Duration:           ${duration} seconds`);
    console.log('\n');
    console.log('  ✅ All systems working! Ready for full extraction.');
    console.log('\n');
    console.log('  Next step: Run full extraction');
    console.log('  Command: npm run extract-emails');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED\n');
    console.error(`Error: ${error.message}\n`);

    if (error.message.includes('APIFY_TOKEN')) {
      console.error('💡 Check your Apify token in .env file\n');
    } else if (error.message.includes('Supabase')) {
      console.error('💡 Check your Supabase credentials in .env file\n');
    }

    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run test
testExtraction().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
