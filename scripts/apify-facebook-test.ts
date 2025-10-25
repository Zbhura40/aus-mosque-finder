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

async function testFacebookScraper() {
  console.log('🧪 Starting Apify Facebook Scraper Test (50 mosques)\n');
  console.log('📋 Step 1: Fetching 50 mosques with Facebook pages...\n');

  // Get 50 mosques that have Facebook pages
  const { data: mosques, error } = await supabase
    .from('marketing_prospects')
    .select('id, name, facebook, state, phone, website')
    .not('facebook', 'is', null)
    .limit(50);

  if (error || !mosques) {
    console.error('❌ Error fetching mosques:', error);
    return;
  }

  console.log(`✅ Found ${mosques.length} mosques with Facebook pages:\n`);
  mosques.slice(0, 5).forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.state})`);
    console.log(`      Facebook: ${m.facebook}`);
    console.log('');
  });
  console.log(`   ... and ${mosques.length - 5} more\n`);

  // Prepare Facebook URLs for scraping
  const startUrls = mosques.map(m => m.facebook);

  console.log('🚀 Step 2: Calling Apify Facebook Page Contact Information...\n');

  const input = {
    startUrls: startUrls,
    maxPosts: 0, // We only want contact info, not posts
  };

  console.log('📤 Sending to Apify...');

  try {
    // Start the actor
    const run = await apifyClient.actor('apify/facebook-page-contact-information').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for results (this may take 3-5 minutes)...\n');

    // Get results from dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Step 3: Results Summary\n');
    console.log(`Total pages scraped: ${items.length}`);

    let emailCount = 0;
    const results: any[] = [];

    items.forEach((item: any) => {
      const mosque = mosques.find(m =>
        item.url && m.facebook && (
          item.url.includes(m.facebook) ||
          m.facebook.includes(item.url) ||
          (item.name && m.name.toLowerCase().includes(item.name.toLowerCase()))
        )
      );

      const contactInfo: any = {
        mosque: mosque?.name || item.name || 'Unknown',
        url: item.url,
        state: mosque?.state,
        emails: [],
        phone: null,
        website: null
      };

      // Check for email in various fields
      if (item.email) contactInfo.emails.push(item.email);
      if (item.emails && Array.isArray(item.emails)) contactInfo.emails.push(...item.emails);
      if (item.contactEmail) contactInfo.emails.push(item.contactEmail);

      // Get phone
      contactInfo.phone = item.phone || item.phoneNumber || null;

      // Get website
      contactInfo.website = item.website || item.websiteUrl || null;

      // Remove duplicates from emails
      contactInfo.emails = [...new Set(contactInfo.emails)];

      if (contactInfo.emails.length > 0) {
        emailCount++;
        results.push(contactInfo);
      }
    });

    console.log(`\n✅ Mosques with emails found: ${emailCount}/${items.length} (${Math.round(emailCount/items.length*100)}%)\n`);

    // Show results
    if (results.length > 0) {
      console.log('📧 Extracted contact information:\n');
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.mosque} (${result.state})`);
        console.log(`   📧 Emails: ${result.emails.join(', ')}`);
        if (result.phone) console.log(`   📞 Phone: ${result.phone}`);
        if (result.website) console.log(`   🌐 Website: ${result.website}`);
        console.log('');
      });
    } else {
      console.log('❌ No emails found in any of the scraped Facebook pages\n');
    }

    console.log(`💰 Credits used: ~${items.length} page scrapes`);
    console.log('\n✅ Test complete!');

    if (emailCount > 0) {
      console.log(`\n📈 Success rate: ${Math.round(emailCount/items.length*100)}%`);
      console.log('Next step: Run for all mosques with Facebook pages?');
    } else {
      console.log('\n⚠️  No emails found. Facebook pages may not have public contact info.');
    }

  } catch (error: any) {
    console.error('❌ Error calling Apify:', error.message);
    console.error('Full error:', error);
  }
}

testFacebookScraper().catch(console.error);
