/**
 * Script to fetch mosque data from Google Places API
 *
 * SECURITY: This script uses your Google Places API key from .env.local
 * The API key is NEVER committed to GitHub - only stored locally
 *
 * USAGE:
 * 1. Get a Google Places API key from: https://console.cloud.google.com/
 * 2. Add it to .env.local as: VITE_GOOGLE_PLACES_API_KEY=your_key_here
 * 3. Run: node scripts/fetch-mosque-data.js
 *
 * This will update src/data/mosques-data.json with fresh data
 * Run this script weekly or monthly to keep data current
 */

import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: VITE_GOOGLE_PLACES_API_KEY not found in .env.local');
  console.error('Please add your Google Places API key to .env.local');
  process.exit(1);
}

// List of mosques with their details
const mosques = [
  { name: "Lakemba Mosque", address: "71-75 Wangee Rd, Lakemba NSW 2195", phone: "(02) 9750 1988", website: "https://www.lakembamosque.org/", region: "South Sydney" },
  { name: "Auburn Gallipoli Mosque", address: "15-19 North Parade, Auburn NSW 2144", phone: "(02) 9646 5972", website: "https://gallipolimosque.org.au/", region: "Western Sydney" },
  { name: "Parramatta Mosque", address: "150 Marsden St, Parramatta NSW 2150", phone: "(02) 9630 9948", website: "https://parramattamosque.org.au/", region: "Western Sydney" },
  { name: "Masjid As-Sunnah Lakemba", address: "132-136 Haldon St, Lakemba NSW 2195", phone: "(02) 9740 0416", website: "https://www.aswj.com.au/", region: "South Sydney" },
  { name: "Bankstown Mosque (Masjid Abu Bakr)", address: "2 Winspear Ave, Bankstown NSW 2200", phone: "(02) 9707 4842", website: "https://www.facebook.com/BankstownMosque/", region: "South Sydney" },
  { name: "Liverpool Mosque (MIA)", address: "165 Bow St, Liverpool NSW 2170", phone: "(02) 9602 8277", website: "https://mialiverpool.com.au/", region: "Western Sydney" },
  { name: "Blacktown Mosque", address: "35 Flushcombe Rd, Blacktown NSW 2148", phone: "(02) 9622 9544", website: "https://www.facebook.com/BlacktownMosque/", region: "Western Sydney" },
  { name: "Fairfield Mosque", address: "2 Kenyon St, Fairfield NSW 2165", phone: "(02) 9724 4103", website: "https://www.facebook.com/FairfieldMosque/", region: "Western Sydney" },
  { name: "Penshurst Mosque", address: "447 Forest Rd, Penshurst NSW 2222", phone: "(02) 9580 3390", website: "https://penshurstmosque.com/", region: "South Sydney" },
  { name: "Green Valley Masjid", address: "264 Wilson Rd, Green Valley NSW 2168", phone: "(02) 9607 4074", website: "https://www.facebook.com/mlnsw/", region: "Western Sydney" },
  { name: "Dee Why Mosque", address: "12 South Creek Rd, Dee Why NSW 2099", phone: "(02) 9982 6102", website: "https://www.facebook.com/DeeWhyMosque/", region: "North Sydney" },
  { name: "Al-Azhar Mosque", address: "172B Burwood Rd, Belmore NSW 2192", phone: "(02) 9747 9614", website: "https://www.aswj.com.au/belmore", region: "Sydney CBD & Eastern Suburbs" },
  { name: "Masjid Abu Bakr Al-Siddeeq", address: "361 Chisholm Rd, Auburn NSW 2144", phone: "(02) 9738 7700", website: "https://www.facebook.com/MasjidAbuBakr/", region: "Western Sydney" },
  { name: "IHIC Earlwood", address: "6 Lang Rd, Earlwood NSW 2206", phone: "(02) 9558 1114", website: "https://www.ihic.org.au/", region: "Sydney CBD & Eastern Suburbs" },
  { name: "Masjid Al Hidayah Rockdale", address: "2 Frederick St, Rockdale NSW 2216", phone: "(02) 9567 6676", website: "https://www.facebook.com/alhidayah.rockdale/", region: "South Sydney" },
  { name: "Mt Druitt Anadolu Mosque", address: "52 Hythe St, Mount Druitt NSW 2770", phone: "(02) 9625 9900", website: "https://mtdruittmosque.org.au/", region: "Western Sydney" }
];

/**
 * Fetch place details from Google Places API using Text Search
 */
async function fetchPlaceData(mosque) {
  console.log(`\n🔍 Fetching data for: ${mosque.name}...`);

  try {
    // Step 1: Search for the place to get place_id
    const searchQuery = encodeURIComponent(`${mosque.name} ${mosque.address}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || searchData.results.length === 0) {
      console.log(`⚠️  Could not find place: ${mosque.name}`);
      return { ...mosque, rating: null, openingHours: null, categories: [], attributes: [] };
    }

    const placeId = searchData.results[0].place_id;

    // Step 2: Get detailed information using place_id
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,opening_hours,types,wheelchair_accessible_entrance,business_status&key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      console.log(`⚠️  Could not get details for: ${mosque.name}`);
      return { ...mosque, rating: null, openingHours: null, categories: [], attributes: [] };
    }

    const place = detailsData.result;

    // Extract relevant information
    const data = {
      ...mosque,
      rating: place.rating || null,
      verified: place.rating ? true : false,
      openingHours: place.opening_hours?.weekday_text || null,
      currentlyOpen: place.opening_hours?.open_now || null,
      categories: place.types || [],
      attributes: []
    };

    // Add attributes
    if (place.wheelchair_accessible_entrance !== undefined) {
      data.attributes.push(place.wheelchair_accessible_entrance ? 'Wheelchair accessible' : 'Not wheelchair accessible');
    }

    if (place.business_status) {
      data.attributes.push(place.business_status === 'OPERATIONAL' ? 'Operational' : place.business_status);
    }

    console.log(`✅ Successfully fetched data for: ${mosque.name}`);
    console.log(`   Rating: ${data.rating || 'N/A'}`);
    console.log(`   Hours: ${data.openingHours ? 'Available' : 'Not available'}`);
    console.log(`   Categories: ${data.categories.length} found`);

    return data;

  } catch (error) {
    console.error(`❌ Error fetching data for ${mosque.name}:`, error.message);
    return { ...mosque, rating: null, openingHours: null, categories: [], attributes: [] };
  }
}

/**
 * Main function to fetch all mosque data
 */
async function fetchAllMosqueData() {
  console.log('🚀 Starting to fetch mosque data from Google Places API...');
  console.log(`📊 Total mosques to process: ${mosques.length}\n`);

  const results = [];

  // Process mosques one by one to avoid rate limits
  for (const mosque of mosques) {
    const data = await fetchPlaceData(mosque);
    results.push(data);

    // Wait 200ms between requests to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Save results to JSON file
  const outputPath = join(__dirname, '..', 'src', 'data', 'mosques-data.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n✅ Successfully saved mosque data to:', outputPath);
  console.log(`📦 Total mosques processed: ${results.length}`);
  console.log(`⭐ Mosques with ratings: ${results.filter(m => m.rating).length}`);
  console.log(`🕐 Mosques with opening hours: ${results.filter(m => m.openingHours).length}`);
  console.log('\n💡 Remember to run this script periodically to keep data fresh!');
}

// Run the script
fetchAllMosqueData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
