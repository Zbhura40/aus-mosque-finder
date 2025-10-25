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

async function testEmailExtraction() {
  console.log('🧪 Starting Apify Email Extraction Test (50 mosques)\n');
  console.log('📋 Step 1: Fetching 50 mosque Place IDs from database...\n');

  // Get 50 mosques with Place IDs
  const { data: mosques, error } = await supabase
    .from('marketing_prospects')
    .select('id, name, google_place_id, state, website')
    .not('google_place_id', 'is', null)
    .limit(50);

  if (error || !mosques) {
    console.error('❌ Error fetching mosques:', error);
    return;
  }

  console.log(`✅ Found ${mosques.length} mosques for testing:\n`);
  mosques.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.state})`);
    console.log(`      Place ID: ${m.google_place_id}`);
    console.log('');
  });

  // Format Place IDs for Apify
  const searchStrings = mosques.map(m => `place_id:${m.google_place_id}`);

  console.log('🚀 Step 2: Calling Apify actor (this may take 1-2 minutes)...\n');

  const input = {
    searchStringsArray: searchStrings,
    maxCrawledPlacesPerSearch: 1,
    language: 'en',
  };

  console.log('📤 Sending to Apify...');

  try {
    // Start the actor
    const run = await apifyClient.actor('lukaskrivka/google-maps-with-contact-details').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for results...\n');

    // Get results from dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Step 3: Results Summary\n');
    console.log(`Total results: ${items.length}`);

    let emailCount = 0;

    items.forEach((item: any, index: number) => {
      const mosque = mosques[index];
      console.log(`\n${index + 1}. ${item.title || mosque.name}`);
      console.log(`   📧 Email: ${item.email || '❌ Not found'}`);
      console.log(`   📞 Phone: ${item.phone || 'N/A'}`);
      console.log(`   🌐 Website: ${item.website || 'N/A'}`);
      console.log(`   📍 Place ID: ${item.placeId}`);

      if (item.email) emailCount++;
    });

    console.log(`\n✅ Emails found: ${emailCount}/${items.length} (${Math.round(emailCount/items.length*100)}%)`);
    console.log(`\n💰 Credits used: ~${items.length} place lookups`);

    console.log('\n✅ Test complete! Review results above.');
    console.log('\nNext step: If results look good, run for all 337 mosques?');

  } catch (error: any) {
    console.error('❌ Error calling Apify:', error.message);
    console.error('Full error:', error);
  }
}

testEmailExtraction().catch(console.error);
