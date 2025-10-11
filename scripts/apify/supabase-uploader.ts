/**
 * Supabase Uploader Module
 * =========================
 * Uploads mosque email data to Supabase mosques_emails table
 *
 * Features:
 * - Combines data from Google Maps, Website, and Facebook scraping
 * - Validates emails using DNS MX records
 * - Deduplicates entries
 * - Bulk insert with error handling
 */

import { createClient } from '@supabase/supabase-js';
import type { GoogleMapsResult } from './gmaps-scraper.js';
import type { WebsiteEmailResult } from './website-scraper.js';
import type { FacebookEmailResult } from './facebook-scraper.js';
import { validateEmailsBulk, getValidationStats, type EmailValidationResult } from './email-validator.js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface MosqueEmailRecord {
  name: string;
  location?: string;
  state?: string;
  suburb?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  email_primary?: string;
  email_secondary?: string;
  email_tertiary?: string;
  email_verified: boolean;
  source: string;
  google_place_id?: string;
  notes?: string;
  last_updated: string;
}

/**
 * Combine all data sources into final records
 */
export function combineDataSources(
  gmapsResults: GoogleMapsResult[],
  websiteResults: WebsiteEmailResult[],
  facebookResults: FacebookEmailResult[]
): MosqueEmailRecord[] {
  console.log('\n' + '='.repeat(60));
  console.log('  COMBINING DATA SOURCES');
  console.log('='.repeat(60));

  const records: MosqueEmailRecord[] = [];

  // Create a map for quick lookup
  const websiteMap = new Map(websiteResults.map(r => [r.mosqueName, r]));
  const facebookMap = new Map(facebookResults.map(r => [r.mosqueName, r]));

  gmapsResults.forEach(gmaps => {
    const websiteData = websiteMap.get(gmaps.title);
    const facebookData = facebookMap.get(gmaps.title);

    // Collect all emails
    const allEmails = [
      ...(websiteData?.emailsPrioritized || []),
      ...(facebookData?.emails || []),
    ];

    // Take up to 3 unique emails
    const uniqueEmails = [...new Set(allEmails)].slice(0, 3);

    // Determine source
    let source = 'google_maps';
    if (websiteData && websiteData.emailsCount > 0) {
      source = 'website';
    } else if (facebookData && facebookData.emails.length > 0) {
      source = 'facebook';
    }

    // Create record
    const record: MosqueEmailRecord = {
      name: gmaps.title,
      location: gmaps.address,
      state: gmaps.state,
      suburb: gmaps.suburb,
      phone: gmaps.phone,
      website: gmaps.website,
      facebook: facebookData?.facebookUrl,
      email_primary: uniqueEmails[0],
      email_secondary: uniqueEmails[1],
      email_tertiary: uniqueEmails[2],
      email_verified: false, // Will be updated after validation
      source,
      google_place_id: gmaps.placeId,
      last_updated: new Date().toISOString(),
    };

    records.push(record);
  });

  console.log(`\n✅ Combined ${records.length} mosque records`);
  console.log(`   - With primary email: ${records.filter(r => r.email_primary).length}`);
  console.log(`   - With secondary email: ${records.filter(r => r.email_secondary).length}`);
  console.log(`   - With tertiary email: ${records.filter(r => r.email_tertiary).length}`);

  return records;
}

/**
 * Validate all emails in records
 */
export async function validateRecordEmails(
  records: MosqueEmailRecord[]
): Promise<MosqueEmailRecord[]> {
  console.log('\n' + '='.repeat(60));
  console.log('  EMAIL VALIDATION (DNS MX RECORDS)');
  console.log('='.repeat(60));

  // Collect all unique emails
  const allEmails: string[] = [];
  records.forEach(r => {
    if (r.email_primary) allEmails.push(r.email_primary);
    if (r.email_secondary) allEmails.push(r.email_secondary);
    if (r.email_tertiary) allEmails.push(r.email_tertiary);
  });

  const uniqueEmails = [...new Set(allEmails)];

  console.log(`\n📧 Validating ${uniqueEmails.length} unique emails...\n`);

  // Validate in bulk
  const validationResults = await validateEmailsBulk(
    uniqueEmails,
    (current, total, email) => {
      if (current % 10 === 0 || current === total) {
        process.stdout.write(`\r  Progress: ${current}/${total} (${Math.round(current / total * 100)}%)`);
      }
    }
  );

  console.log('\n');

  // Create validation map
  const validationMap = new Map(
    validationResults.map(r => [r.email, r.isValid])
  );

  // Update records with validation status
  const validatedRecords = records.map(record => {
    // Mark verified if primary email is valid
    const isPrimaryValid = record.email_primary
      ? validationMap.get(record.email_primary) || false
      : false;

    return {
      ...record,
      email_verified: isPrimaryValid,
    };
  });

  // Statistics
  const stats = getValidationStats(validationResults);

  console.log('\n📊 VALIDATION RESULTS:');
  console.log(`   Total emails:     ${stats.total}`);
  console.log(`   Valid:            ${stats.valid} (${stats.validPercentage}%)`);
  console.log(`   Invalid:          ${stats.invalid}`);

  if (Object.keys(stats.invalidReasons).length > 0) {
    console.log('\n   Invalid reasons:');
    Object.entries(stats.invalidReasons)
      .sort(([, a], [, b]) => b - a)
      .forEach(([reason, count]) => {
        console.log(`     - ${reason}: ${count}`);
      });
  }

  return validatedRecords;
}

/**
 * Upload records to Supabase
 */
export async function uploadToSupabase(
  records: MosqueEmailRecord[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('\n' + '='.repeat(60));
  console.log('  UPLOADING TO SUPABASE');
  console.log('='.repeat(60));

  console.log(`\n📤 Uploading ${records.length} records to mosques_emails table...\n`);

  const errors: string[] = [];
  let success = 0;
  let failed = 0;

  // Upload in batches of 50 to avoid timeout
  const BATCH_SIZE = 50;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)}: Uploading ${batch.length} records...`);

    try {
      const { data, error } = await supabase
        .from('mosques_emails')
        .insert(batch)
        .select();

      if (error) {
        throw error;
      }

      success += batch.length;
      console.log(`    ✅ Success: ${batch.length} records uploaded`);

    } catch (error: any) {
      failed += batch.length;
      const errorMsg = `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`;
      errors.push(errorMsg);
      console.log(`    ❌ Failed: ${errorMsg}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('  UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`  ✅ Successful:  ${success}`);
  console.log(`  ❌ Failed:      ${failed}`);

  if (errors.length > 0) {
    console.log('\n  Errors:');
    errors.forEach(err => console.log(`    - ${err}`));
  }

  console.log('='.repeat(60) + '\n');

  return { success, failed, errors };
}

/**
 * Get statistics from uploaded data
 */
export async function getUploadedDataStats(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('  DATABASE STATISTICS');
  console.log('='.repeat(60));

  try {
    // Get stats using the helper function
    const { data, error } = await supabase.rpc('get_email_extraction_stats');

    if (error) throw error;

    if (data && data.length > 0) {
      const stats = data[0];

      console.log(`\n  Total mosques:         ${stats.total_mosques}`);
      console.log(`  With primary email:    ${stats.with_email_primary}`);
      console.log(`  With secondary email:  ${stats.with_email_secondary}`);
      console.log(`  With tertiary email:   ${stats.with_email_tertiary}`);
      console.log(`  Verified emails:       ${stats.verified_emails}`);

      console.log('\n  By State:');
      if (stats.by_state) {
        Object.entries(stats.by_state as Record<string, number>)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .forEach(([state, count]) => {
            console.log(`    ${state.padEnd(10)} ${count}`);
          });
      }
    }

  } catch (error: any) {
    console.log(`\n  ⚠️  Could not fetch stats: ${error.message}`);
  }

  console.log('='.repeat(60) + '\n');
}
