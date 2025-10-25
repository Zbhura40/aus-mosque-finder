import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN!,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function scrapeAllWebsiteEmails() {
  console.log('🚀 Email Extraction - Production Run (All 211 Mosques)\n');
  console.log('📋 Step 1: Fetching all mosques with websites...\n');

  // Get ALL mosques that have websites (211 mosques)
  const { data: mosques, error } = await supabase
    .from('marketing_prospects')
    .select('id, name, website, state, phone, suburb, address')
    .not('website', 'is', null);

  if (error || !mosques) {
    console.error('❌ Error fetching mosques:', error);
    return;
  }

  console.log(`✅ Found ${mosques.length} mosques with websites\n`);
  console.log('Sample (first 5):');
  mosques.slice(0, 5).forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.state})`);
    console.log(`      ${m.website}`);
  });
  console.log(`   ... and ${mosques.length - 5} more\n`);

  // Prepare URLs for scraping
  const startUrls = mosques.map(m => ({ url: m.website }));

  console.log('🚀 Step 2: Starting Apify Website Content Crawler...\n');
  console.log('⏰ Estimated time: 5-8 minutes');
  console.log('💰 Estimated cost: ~$1.90\n');

  const input = {
    startUrls: startUrls,
    maxCrawlDepth: 0, // Only scrape main page, don't follow links
    maxCrawlPages: mosques.length,
    crawlerType: 'cheerio', // Faster, lighter crawler
  };

  console.log('📤 Calling Apify actor...');

  try {
    const run = await apifyClient.actor('apify/website-content-crawler').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for scraping to complete...\n');

    // Get results from dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Step 3: Processing results and extracting emails\n');
    console.log(`Total pages scraped: ${items.length}\n`);

    // Email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    const results: any[] = [];
    let successCount = 0;

    // Process each scraped page
    items.forEach((item: any) => {
      // Find matching mosque by URL hostname
      const mosque = mosques.find(m => {
        try {
          const itemHost = new URL(item.url).hostname.replace('www.', '');
          const mosqueHost = new URL(m.website).hostname.replace('www.', '');
          return itemHost === mosqueHost;
        } catch {
          return false;
        }
      });

      if (!mosque) return;

      // Extract emails from text content
      const text = item.text || '';
      const emails = text.match(emailRegex);
      const uniqueEmails = emails ? ([...new Set(emails)] as string[]) : [];

      // Filter out common non-contact emails (spam, tracking, analytics)
      const filteredEmails = uniqueEmails.filter(email => {
        const lowerEmail = email.toLowerCase();
        return !lowerEmail.includes('example.com') &&
               !lowerEmail.includes('sentry.io') &&
               !lowerEmail.includes('google') &&
               !lowerEmail.includes('facebook') &&
               !lowerEmail.includes('wix.com') &&
               !lowerEmail.includes('wordpress.com') &&
               !lowerEmail.includes('analytics') &&
               !lowerEmail.includes('tracking');
      });

      // Store up to 3 emails (primary, secondary, tertiary)
      const email_primary = filteredEmails[0] || null;
      const email_secondary = filteredEmails[1] || null;
      const email_tertiary = filteredEmails[2] || null;

      if (email_primary) {
        successCount++;
      }

      results.push({
        id: mosque.id,
        name: mosque.name,
        website: item.url,
        state: mosque.state,
        suburb: mosque.suburb,
        phone: mosque.phone || '',
        email_primary,
        email_secondary,
        email_tertiary,
        emailCount: filteredEmails.length,
        extraction_status: email_primary ? 'completed' : 'completed', // 'completed' either way (scraped successfully)
        extraction_attempts: 1,
        last_extraction_attempt: new Date().toISOString(),
      });
    });

    const successRate = Math.round(successCount / results.length * 100);
    console.log(`✅ Mosques with emails found: ${successCount}/${results.length} (${successRate}%)\n`);

    // Show all mosques with emails
    const mosquesWithEmails = results.filter(r => r.email_primary);

    if (mosquesWithEmails.length > 0) {
      console.log('📧 All mosques with emails extracted:\n');
      mosquesWithEmails.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} (${r.state})`);
        console.log(`   📧 Primary: ${r.email_primary}`);
        if (r.email_secondary) console.log(`   📧 Secondary: ${r.email_secondary}`);
        if (r.email_tertiary) console.log(`   📧 Tertiary: ${r.email_tertiary}`);
        console.log(`   🌐 Website: ${r.website}`);
        if (r.phone) console.log(`   📞 Phone: ${r.phone}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No emails found in this batch\n');
    }

    console.log('💾 Step 4: Saving results to database...\n');

    // Update database - only update mosques that were scraped
    let updateCount = 0;
    let errorCount = 0;

    for (const result of results) {
      const { error: updateError } = await supabase
        .from('marketing_prospects')
        .update({
          email_primary: result.email_primary,
          email_secondary: result.email_secondary,
          email_tertiary: result.email_tertiary,
          extraction_status: result.extraction_status,
          extraction_attempts: result.extraction_attempts,
          last_extraction_attempt: result.last_extraction_attempt,
        })
        .eq('id', result.id);

      if (updateError) {
        console.error(`❌ Error updating ${result.name}:`, updateError.message);
        errorCount++;
      } else {
        updateCount++;
      }
    }

    console.log(`✅ Database updated: ${updateCount} records\n`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors: ${errorCount} records failed to update\n`);
    }

    // Create backup CSV
    console.log('💾 Step 5: Creating backup CSV file...\n');

    const csvHeaders = 'Mosque Name,Primary Email,Secondary Email,Tertiary Email,Website,State,Suburb,Phone,Email Count,Status\n';
    const csvRows = results.map(r =>
      `"${r.name}","${r.email_primary || ''}","${r.email_secondary || ''}","${r.email_tertiary || ''}","${r.website}","${r.state}","${r.suburb || ''}","${r.phone}","${r.emailCount}","${r.extraction_status}"`
    ).join('\n');

    const csvContent = csvHeaders + csvRows;
    const timestamp = new Date().toISOString().split('T')[0];
    const csvPath = `/Users/zubairbhura/Work/findmymosque/docs/email-extraction-${timestamp}.csv`;

    fs.writeFileSync(csvPath, csvContent);

    console.log(`✅ CSV backup created: docs/email-extraction-${timestamp}.csv\n`);

    // Final summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ EMAIL EXTRACTION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`   Total mosques processed: ${results.length}`);
    console.log(`   Pages scraped: ${items.length}`);
    console.log(`   ✅ Mosques with emails: ${successCount}`);
    console.log(`   ❌ No emails found: ${results.length - successCount}`);
    console.log(`   Success rate: ${successRate}%`);
    console.log(`   Total emails extracted: ${mosquesWithEmails.reduce((sum, m) => sum + m.emailCount, 0)}`);

    console.log('\n💰 Cost Analysis:');
    const actualCost = (items.length * 0.009).toFixed(2);
    console.log(`   Estimated cost: ~$${actualCost}`);

    console.log('\n📧 Email Breakdown:');
    console.log(`   Primary emails: ${results.filter(r => r.email_primary).length}`);
    console.log(`   Secondary emails: ${results.filter(r => r.email_secondary).length}`);
    console.log(`   Tertiary emails: ${results.filter(r => r.email_tertiary).length}`);

    console.log('\n📍 By State:');
    const stateStats: Record<string, number> = {};
    mosquesWithEmails.forEach(r => {
      stateStats[r.state] = (stateStats[r.state] || 0) + 1;
    });
    Object.entries(stateStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} mosques`);
      });

    console.log('\n🎯 Next Steps:');
    console.log('   1. Verify emails in Supabase marketing_prospects table');
    console.log('   2. Review CSV backup for quality check');
    console.log('   3. Set up cold email campaign with extracted contacts');
    console.log('   4. Consider phone outreach for mosques without emails');

    console.log('\n✅ All done! Check your Supabase database and CSV file.\n');

  } catch (error: any) {
    console.error('❌ Error running Apify scraper:', error.message);
    console.error('Full error:', error);
  }
}

scrapeAllWebsiteEmails().catch(console.error);
