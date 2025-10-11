#!/usr/bin/env node
/**
 * Mosque Email Extraction - Main Orchestrator
 * ============================================
 * Complete pipeline for extracting and storing mosque email addresses
 *
 * Pipeline:
 * 1. Extract mosques from Google Maps (compass/google-maps-extractor)
 * 2. Scrape emails from websites (apify/website-content-crawler)
 * 3. Scrape emails from Facebook pages (fallback, optional)
 * 4. Validate all emails using DNS MX records
 * 5. Upload to Supabase mosques_emails table
 *
 * Usage:
 *   npm run extract-emails
 *   or
 *   node --loader tsx scripts/apify/run-extraction.ts
 */

import 'dotenv/config';
import { extractMosquesFromGoogleMaps } from './gmaps-scraper.js';
import { scrapeEmailsFromWebsites } from './website-scraper.js';
import { scrapeEmailsFromFacebook, isFacebookScraperAvailable } from './facebook-scraper.js';
import {
  combineDataSources,
  validateRecordEmails,
  uploadToSupabase,
  getUploadedDataStats,
} from './supabase-uploader.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Validate environment variables
 */
function validateEnv(): void {
  const required = [
    'APIFY_TOKEN',
    'VITE_SUPABASE_URL',
    'SUPABASE_SECRET_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease add them to your .env file and try again.\n');
    process.exit(1);
  }
}

/**
 * Save final report
 */
async function saveFinalReport(stats: {
  totalMosques: number;
  withWebsite: number;
  withFacebook: number;
  totalEmails: number;
  verifiedEmails: number;
  uploadSuccess: number;
  uploadFailed: number;
  duration: number;
}): Promise<void> {
  const reportPath = path.join(process.cwd(), 'scripts/apify/data/extraction-report.json');

  const report = {
    timestamp: new Date().toISOString(),
    stats,
    summary: `Extracted ${stats.totalMosques} mosques with ${stats.totalEmails} email addresses (${stats.verifiedEmails} verified). Successfully uploaded ${stats.uploadSuccess} records to Supabase.`,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n📄 Final report saved to: ${reportPath}\n`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const startTime = Date.now();

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║          MOSQUE EMAIL EXTRACTION SYSTEM                   ║');
  console.log('║                                                           ║');
  console.log('║  Purpose: Extract mosque emails for marketing campaigns   ║');
  console.log('║  Target:  300+ mosques across Australia                   ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Step 0: Validate environment
  console.log('🔐 Validating environment variables...\n');
  validateEnv();
  console.log('✅ Environment validated\n');

  try {
    // Step 1: Extract mosques from Google Maps
    console.log('\n📍 STEP 1: Extract mosques from Google Maps\n');
    const gmapsResults = await extractMosquesFromGoogleMaps();

    if (gmapsResults.length === 0) {
      throw new Error('No mosques found from Google Maps. Aborting.');
    }

    // Step 2: Scrape emails from websites
    console.log('\n\n🌐 STEP 2: Scrape emails from mosque websites\n');
    const websiteResults = await scrapeEmailsFromWebsites(gmapsResults);

    // Step 3: Scrape emails from Facebook (optional fallback)
    console.log('\n\n📘 STEP 3: Scrape emails from Facebook (fallback)\n');
    let facebookResults: any[] = [];

    const fbAvailable = await isFacebookScraperAvailable();

    if (fbAvailable) {
      facebookResults = await scrapeEmailsFromFacebook(gmapsResults);
    } else {
      console.log('⏭️  Skipping Facebook scraping (not available on your plan)\n');
    }

    // Step 4: Combine all data sources
    console.log('\n\n🔗 STEP 4: Combine data from all sources\n');
    const combinedRecords = combineDataSources(
      gmapsResults,
      websiteResults,
      facebookResults
    );

    // Step 5: Validate all emails
    console.log('\n\n✅ STEP 5: Validate email addresses\n');
    const validatedRecords = await validateRecordEmails(combinedRecords);

    // Step 6: Upload to Supabase
    console.log('\n\n📤 STEP 6: Upload to Supabase\n');
    const uploadResult = await uploadToSupabase(validatedRecords);

    // Step 7: Get final statistics
    console.log('\n\n📊 STEP 7: Final Statistics\n');
    await getUploadedDataStats();

    // Calculate statistics
    const totalEmails = validatedRecords.reduce((sum, r) => {
      let count = 0;
      if (r.email_primary) count++;
      if (r.email_secondary) count++;
      if (r.email_tertiary) count++;
      return sum + count;
    }, 0);

    const verifiedEmails = validatedRecords.filter(r => r.email_verified).length;
    const duration = Math.round((Date.now() - startTime) / 1000 / 60);

    // Save final report
    await saveFinalReport({
      totalMosques: gmapsResults.length,
      withWebsite: websiteResults.length,
      withFacebook: facebookResults.length,
      totalEmails,
      verifiedEmails,
      uploadSuccess: uploadResult.success,
      uploadFailed: uploadResult.failed,
      duration,
    });

    // Success message
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║                   ✅ EXTRACTION COMPLETE                  ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log(`  🕌 Total Mosques:      ${gmapsResults.length}`);
    console.log(`  📧 Total Emails:       ${totalEmails}`);
    console.log(`  ✅ Verified Emails:    ${verifiedEmails}`);
    console.log(`  📤 Uploaded Records:   ${uploadResult.success}`);
    console.log(`  ⏱️  Duration:           ${duration} minutes`);
    console.log('\n');
    console.log('  Next Steps:');
    console.log('  1. Check Supabase dashboard to view mosques_emails table');
    console.log('  2. Export verified emails for Make.com/n8n');
    console.log('  3. Start your email marketing campaign!');
    console.log('\n');

  } catch (error: any) {
    console.error('\n\n❌ EXTRACTION FAILED\n');
    console.error(`Error: ${error.message}\n`);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
