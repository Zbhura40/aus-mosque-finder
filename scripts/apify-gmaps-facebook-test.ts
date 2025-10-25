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

async function testGoogleMapsFacebookExtraction() {
  console.log('🧪 2-Step Test: Google Maps → Facebook URLs → Emails\n');
  console.log('📋 Step 1: Fetching 50 mosque Place IDs...\n');

  // Get 50 mosques
  const { data: mosques, error } = await supabase
    .from('marketing_prospects')
    .select('id, name, google_place_id, state')
    .not('google_place_id', 'is', null)
    .limit(50);

  if (error || !mosques) {
    console.error('❌ Error fetching mosques:', error);
    return;
  }

  console.log(`✅ Found ${mosques.length} mosques\n`);

  // Format Place IDs for scraper
  const searchStrings = mosques.map(m => `place_id:${m.google_place_id}`);

  console.log('🚀 Step 2: Extracting Facebook URLs from Google Maps...\n');
  console.log('Using: compass/crawler-google-places\n');

  const input = {
    searchStringsArray: searchStrings,
    maxCrawledPlacesPerSearch: 1,
    language: 'en',
  };

  try {
    console.log('📤 Calling Apify...');

    // Use compass/crawler-google-places - it extracts social media
    const run = await apifyClient.actor('compass/crawler-google-places').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for results (2-3 minutes)...\n');

    // Get results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Step 3: Analyzing Results\n');
    console.log(`Total places scraped: ${items.length}\n`);

    // Extract Facebook URLs
    const facebookUrls: any[] = [];

    items.forEach((item: any) => {
      const mosque = mosques.find(m => m.google_place_id === item.placeId);

      // Check for Facebook in various fields
      let fbUrl = null;

      if (item.url && item.url.includes('facebook.com')) {
        fbUrl = item.url;
      } else if (item.website && item.website.includes('facebook.com')) {
        fbUrl = item.website;
      } else if (item.socialMedia?.facebook) {
        fbUrl = item.socialMedia.facebook;
      } else if (item.additionalInfo?.socialMedia?.facebook) {
        fbUrl = item.additionalInfo.socialMedia.facebook;
      }

      if (fbUrl) {
        facebookUrls.push({
          mosque: mosque?.name || item.title,
          state: mosque?.state,
          placeId: item.placeId,
          facebookUrl: fbUrl,
          phone: item.phone,
          website: item.website
        });
      }
    });

    console.log(`✅ Found Facebook URLs: ${facebookUrls.length}/${items.length} (${Math.round(facebookUrls.length/items.length*100)}%)\n`);

    if (facebookUrls.length > 0) {
      console.log('📱 Mosques with Facebook pages:\n');
      facebookUrls.slice(0, 10).forEach((m, i) => {
        console.log(`${i + 1}. ${m.mosque} (${m.state})`);
        console.log(`   Facebook: ${m.facebookUrl}`);
        console.log('');
      });

      if (facebookUrls.length > 10) {
        console.log(`   ... and ${facebookUrls.length - 10} more\n`);
      }

      console.log(`💰 Credits used so far: ~${items.length} place lookups\n`);
      console.log('─────────────────────────────────────────────────\n');

      // Step 4: Now scrape Facebook pages for emails
      console.log('🚀 Step 4: Scraping Facebook pages for emails...\n');

      const fbInput = {
        startUrls: facebookUrls.map(m => m.facebookUrl),
        maxPosts: 0, // Only want contact info
      };

      console.log('📤 Calling Facebook scraper...');

      const fbRun = await apifyClient.actor('apify/facebook-page-contact-information').call(fbInput);

      console.log(`✅ Actor started! Run ID: ${fbRun.id}`);
      console.log('⏳ Waiting for results (3-5 minutes)...\n');

      const { items: fbItems } = await apifyClient.dataset(fbRun.defaultDatasetId).listItems();

      console.log('📊 Step 5: Final Results\n');
      console.log(`Facebook pages scraped: ${fbItems.length}\n`);

      // Extract emails
      let emailCount = 0;
      const results: any[] = [];

      fbItems.forEach((item: any) => {
        const mosque = facebookUrls.find(m =>
          item.url && (
            item.url.includes(m.facebookUrl) ||
            m.facebookUrl.includes(item.url)
          )
        );

        const emails: string[] = [];

        if (item.email) emails.push(item.email);
        if (item.emails && Array.isArray(item.emails)) emails.push(...item.emails);
        if (item.contactEmail) emails.push(item.contactEmail);

        const uniqueEmails = [...new Set(emails)];

        if (uniqueEmails.length > 0) {
          emailCount++;
          results.push({
            mosque: mosque?.mosque || item.name,
            state: mosque?.state,
            facebookUrl: item.url,
            emails: uniqueEmails,
            phone: item.phone || mosque?.phone,
            website: item.website || mosque?.website
          });
        }
      });

      console.log(`✅ Emails found: ${emailCount}/${fbItems.length} (${Math.round(emailCount/fbItems.length*100)}%)\n`);

      if (results.length > 0) {
        console.log('📧 FINAL RESULTS - Mosques with emails:\n');
        results.forEach((r, i) => {
          console.log(`${i + 1}. ${r.mosque} (${r.state})`);
          console.log(`   📧 Emails: ${r.emails.join(', ')}`);
          if (r.phone) console.log(`   📞 Phone: ${r.phone}`);
          if (r.website) console.log(`   🌐 Website: ${r.website}`);
          console.log(`   📱 Facebook: ${r.facebookUrl}`);
          console.log('');
        });

        console.log(`\n💰 Total credits used: ~${items.length + fbItems.length} (Google Maps + Facebook)\n`);
        console.log('✅ TEST COMPLETE!\n');
        console.log(`📈 Overall success rate: ${emailCount}/${mosques.length} mosques = ${Math.round(emailCount/mosques.length*100)}%`);
        console.log('\n🎯 Projection for all 337 mosques:');
        console.log(`   - Expected Facebook URLs: ~${Math.round(337 * facebookUrls.length/items.length)}`);
        console.log(`   - Expected emails: ~${Math.round(337 * emailCount/mosques.length)}`);
        console.log(`   - Estimated cost: ~$${((337 + 337 * facebookUrls.length/items.length) * 0.009).toFixed(2)}`);
      } else {
        console.log('❌ No emails found from Facebook pages\n');
      }

    } else {
      console.log('❌ No Facebook URLs found in Google Maps data\n');
      console.log('This might mean:');
      console.log('1. Mosques don\'t link Facebook in their Google Maps listings');
      console.log('2. We need to try a different Google Maps scraper');
      console.log('3. Facebook URLs might be in a different field\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testGoogleMapsFacebookExtraction().catch(console.error);
