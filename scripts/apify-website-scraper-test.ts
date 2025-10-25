import { ApifyClient } from 'apify-client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN!,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function testWebsiteScraper() {
  console.log('🧪 Starting Apify Website Scraper Test (50 mosques)\n');
  console.log('📋 Step 1: Fetching 50 mosques with websites...\n');

  // Get 50 mosques that have websites
  const { data: mosques, error } = await supabase
    .from('marketing_prospects')
    .select('id, name, website, state, google_place_id')
    .not('website', 'is', null)
    .limit(50);

  if (error || !mosques) {
    console.error('❌ Error fetching mosques:', error);
    return;
  }

  console.log(`✅ Found ${mosques.length} mosques with websites:\n`);
  mosques.slice(0, 5).forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.state})`);
    console.log(`      Website: ${m.website}`);
    console.log('');
  });
  console.log(`   ... and ${mosques.length - 5} more\n`);

  // Prepare URLs for scraping
  const startUrls = mosques.map(m => ({ url: m.website }));

  console.log('🚀 Step 2: Calling Apify Website Content Crawler...\n');

  const input = {
    startUrls: startUrls,
    maxCrawlDepth: 0, // Only scrape the main page, don't follow links
    maxCrawlPages: 50,
    crawlerType: 'cheerio', // Faster, lighter crawler
  };

  console.log('📤 Sending to Apify...');

  try {
    // Start the actor
    const run = await apifyClient.actor('apify/website-content-crawler').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for results (this may take 2-3 minutes)...\n');

    // Get results from dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Step 3: Results Summary\n');
    console.log(`Total pages scraped: ${items.length}`);

    // Extract emails from text content
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    let emailCount = 0;
    const results: any[] = [];

    items.forEach((item: any, index: number) => {
      const mosque = mosques.find(m => item.url.includes(new URL(m.website).hostname));

      // Extract emails from the page text content
      const text = item.text || '';
      const emails = text.match(emailRegex);
      const uniqueEmails = emails ? [...new Set(emails)] : [];

      if (uniqueEmails.length > 0) {
        emailCount++;
        results.push({
          mosque: mosque?.name || 'Unknown',
          url: item.url,
          emails: uniqueEmails,
          state: mosque?.state
        });
      }
    });

    console.log(`\n✅ Mosques with emails found: ${emailCount}/${items.length} (${Math.round(emailCount/items.length*100)}%)\n`);

    // Show results
    if (results.length > 0) {
      console.log('📧 Extracted emails (showing all):\n');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.mosque} (${result.state})`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Emails found: ${result.emails.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('❌ No emails found in any of the scraped websites\n');
    }

    console.log(`💰 Credits used: ~${items.length} page scrapes`);
    console.log('\n✅ Test complete!');

    if (emailCount > 0) {
      console.log(`\n📈 Success rate: ${Math.round(emailCount/items.length*100)}%`);
      console.log('Next step: Run for all 211 mosques with websites?');
    } else {
      console.log('\n⚠️  No emails found. May need to adjust scraping strategy.');
    }

  } catch (error: any) {
    console.error('❌ Error calling Apify:', error.message);
    console.error('Full error:', error);
  }
}

testWebsiteScraper().catch(console.error);
