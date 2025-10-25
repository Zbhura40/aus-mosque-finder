import { ApifyClient } from 'apify-client';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN!,
});

async function searchFacebookMosques() {
  console.log('🧪 Facebook Pages Scraper Test\n');
  console.log('🔍 Searching for mosques across Australia...\n');

  // Search terms for different Australian cities
  const searchQueries = [
    'mosque Sydney Australia',
    'mosque Melbourne Australia',
    'mosque Brisbane Australia',
    'mosque Perth Australia',
    'mosque Adelaide Australia',
    'masjid Sydney',
    'masjid Melbourne',
    'islamic centre Sydney',
    'islamic centre Melbourne',
  ];

  console.log('📋 Search queries:');
  searchQueries.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));
  console.log('');

  const input = {
    searchQueries: searchQueries,
    maxResults: 50, // Total limit of 50 results
    language: 'en',
  };

  console.log('🚀 Starting Facebook Pages Scraper...\n');
  console.log('📤 Calling Apify...');

  try {
    const run = await apifyClient.actor('apify/facebook-pages-scraper').call(input);

    console.log(`✅ Actor started! Run ID: ${run.id}`);
    console.log('⏳ Waiting for results (this may take 5-10 minutes)...\n');

    // Get results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log('📊 Results Summary\n');
    console.log(`Total pages found: ${items.length}\n`);

    // Process results
    const mosques: any[] = [];

    items.forEach((item: any) => {
      // Extract contact info
      const mosque = {
        name: item.name || item.title || 'Unknown',
        email: item.email || item.emails?.[0] || '',
        phone: item.phone || item.phoneNumber || '',
        website: item.website || item.websiteUrl || '',
        facebookUrl: item.url || '',
        likes: item.likes || 0,
        city: extractCity(item.address || item.location || ''),
        state: extractState(item.address || item.location || ''),
      };

      mosques.push(mosque);
    });

    // Filter for Australian mosques (check if location contains Australian states/cities)
    const australianMosques = mosques.filter(m =>
      isAustralian(m.city + ' ' + m.state + ' ' + m.name + ' ' + m.facebookUrl)
    );

    console.log(`✅ Australian mosques identified: ${australianMosques.length}\n`);

    // Count mosques with contact info
    const withEmail = australianMosques.filter(m => m.email).length;
    const withPhone = australianMosques.filter(m => m.phone).length;
    const withWebsite = australianMosques.filter(m => m.website).length;

    console.log('📧 Contact information breakdown:');
    console.log(`   With email: ${withEmail} (${Math.round(withEmail/australianMosques.length*100)}%)`);
    console.log(`   With phone: ${withPhone} (${Math.round(withPhone/australianMosques.length*100)}%)`);
    console.log(`   With website: ${withWebsite} (${Math.round(withWebsite/australianMosques.length*100)}%)`);
    console.log('');

    // Show sample results
    if (australianMosques.length > 0) {
      console.log('📝 Sample results (first 10):\n');
      australianMosques.slice(0, 10).forEach((m, i) => {
        console.log(`${i + 1}. ${m.name}`);
        console.log(`   📧 Email: ${m.email || 'Not found'}`);
        console.log(`   📞 Phone: ${m.phone || 'Not found'}`);
        console.log(`   🌐 Website: ${m.website || 'Not found'}`);
        console.log(`   📍 Location: ${m.city}, ${m.state}`);
        console.log('');
      });

      if (australianMosques.length > 10) {
        console.log(`   ... and ${australianMosques.length - 10} more\n`);
      }
    }

    // Create CSV
    console.log('💾 Creating CSV file...\n');

    const csvHeaders = 'Name,Email,Phone,Website,Facebook URL,City,State,Likes\n';
    const csvRows = australianMosques.map(m =>
      `"${m.name}","${m.email}","${m.phone}","${m.website}","${m.facebookUrl}","${m.city}","${m.state}","${m.likes}"`
    ).join('\n');

    const csvContent = csvHeaders + csvRows;

    fs.writeFileSync('/Users/zubairbhura/Work/findmymosque/docs/facebook_mosques_test.csv', csvContent);

    console.log('✅ CSV file created: docs/facebook_mosques_test.csv');
    console.log(`📊 Total records: ${australianMosques.length}\n`);

    console.log(`💰 Credits used: ~${items.length} page scrapes\n`);

    console.log('✅ TEST COMPLETE!\n');

    if (withEmail > 0) {
      console.log(`🎯 Success rate for emails: ${Math.round(withEmail/australianMosques.length*100)}%`);
      console.log('Next step: Review CSV file and decide if we should scale up?');
    } else {
      console.log('⚠️  No emails found. Facebook pages may not have public email addresses.');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Helper function to extract city from address
function extractCity(address: string): string {
  const cities = ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Hobart', 'Darwin',
                  'Newcastle', 'Wollongong', 'Gold Coast', 'Geelong', 'Townsville', 'Cairns'];

  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  return '';
}

// Helper function to extract state from address
function extractState(address: string): string {
  const states: Record<string, string> = {
    'NSW': 'NSW', 'New South Wales': 'NSW',
    'VIC': 'VIC', 'Victoria': 'VIC',
    'QLD': 'QLD', 'Queensland': 'QLD',
    'WA': 'WA', 'Western Australia': 'WA',
    'SA': 'SA', 'South Australia': 'SA',
    'TAS': 'TAS', 'Tasmania': 'TAS',
    'ACT': 'ACT', 'Australian Capital Territory': 'ACT',
    'NT': 'NT', 'Northern Territory': 'NT'
  };

  const addressLower = address.toLowerCase();
  for (const [key, value] of Object.entries(states)) {
    if (addressLower.includes(key.toLowerCase())) {
      return value;
    }
  }
  return '';
}

// Helper function to check if mosque is Australian
function isAustralian(text: string): boolean {
  const australianKeywords = [
    'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'hobart', 'darwin',
    'nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt',
    'australia', 'australian', '.au'
  ];

  const textLower = text.toLowerCase();
  return australianKeywords.some(keyword => textLower.includes(keyword));
}

searchFacebookMosques().catch(console.error);
