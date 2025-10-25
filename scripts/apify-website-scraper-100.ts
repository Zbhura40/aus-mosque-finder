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

async function scrapeWebsites100() {
  console.log('🧪 Website Scraper Test (100 mosques)\n');
  console.log('📋 Step 1: Fetching 100 mosques with websites...\n');

  // Get 100 mosques that have websites
  const { data: mosques, error } = await supabase
    .from('marketing_prospects')
    .select('id, name, website, state, phone')
    .not('website', 'is', null)
    .limit(100);

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

  console.log('🚀 Step 2: Starting website scraper...\n');

  const input = {
    startUrls: startUrls,
    maxCrawlDepth: 0, // Only main page
    maxCrawlPages: 100,
    crawlerType: 'cheerio', // Faster
  };

  console.log('📤 Calling Apify website-content-crawler...');

  try {
    const run = await apifyClient.actor('apify/website-content-crawler').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for results (3-5 minutes)...\n');

    // Get results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Step 3: Extracting emails from content\n');
    console.log(`Total pages scraped: ${items.length}\n`);

    // Extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const results: any[] = [];

    items.forEach((item: any) => {
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
      const uniqueEmails = emails ? [...new Set(emails)] : [];

      // Filter out common non-contact emails
      const filteredEmails = uniqueEmails.filter(email =>
        !email.toLowerCase().includes('example.com') &&
        !email.toLowerCase().includes('sentry.io') &&
        !email.toLowerCase().includes('google') &&
        !email.toLowerCase().includes('facebook') &&
        !email.toLowerCase().includes('wix.com')
      );

      results.push({
        name: mosque.name,
        emails: filteredEmails,
        website: item.url,
        state: mosque.state,
        phone: mosque.phone || '',
        emailCount: filteredEmails.length
      });
    });

    // Count mosques with emails
    const withEmails = results.filter(r => r.emailCount > 0).length;

    console.log(`✅ Mosques with emails: ${withEmails}/${results.length} (${Math.round(withEmails/results.length*100)}%)\n`);

    // Show results with emails
    const mosquesWithEmails = results.filter(r => r.emailCount > 0);

    if (mosquesWithEmails.length > 0) {
      console.log('📧 Mosques with emails found:\n');
      mosquesWithEmails.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} (${r.state})`);
        console.log(`   📧 Emails: ${r.emails.join(', ')}`);
        console.log(`   🌐 Website: ${r.website}`);
        if (r.phone) console.log(`   📞 Phone: ${r.phone}`);
        console.log('');
      });
    } else {
      console.log('❌ No emails found\n');
    }

    // Create CSV
    console.log('💾 Creating CSV file...\n');

    const csvHeaders = 'Mosque Name,Email(s),Website,State,Phone,Email Count\n';
    const csvRows = results.map(r =>
      `"${r.name}","${r.emails.join('; ')}","${r.website}","${r.state}","${r.phone}","${r.emailCount}"`
    ).join('\n');

    const csvContent = csvHeaders + csvRows;

    fs.writeFileSync('/Users/zubairbhura/Work/findmymosque/docs/website_emails_test.csv', csvContent);

    console.log('✅ CSV file created: docs/website_emails_test.csv');
    console.log(`📊 Total records: ${results.length}\n`);

    console.log(`💰 Credits used: ~${items.length} page scrapes\n`);

    console.log('✅ TEST COMPLETE!\n');
    console.log('📈 Summary:');
    console.log(`   - Total mosques tested: ${mosques.length}`);
    console.log(`   - Pages scraped: ${items.length}`);
    console.log(`   - Mosques with emails: ${withEmails}`);
    console.log(`   - Success rate: ${Math.round(withEmails/results.length*100)}%`);
    console.log(`   - Total emails found: ${mosquesWithEmails.reduce((sum, m) => sum + m.emailCount, 0)}`);

    // Projection
    console.log('\n🎯 Projection for all 211 mosques:');
    const projectedEmails = Math.round(211 * withEmails / results.length);
    const projectedCost = (211 * 0.009).toFixed(2);
    console.log(`   - Expected mosques with emails: ~${projectedEmails}`);
    console.log(`   - Estimated cost: ~$${projectedCost}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

scrapeWebsites100().catch(console.error);
