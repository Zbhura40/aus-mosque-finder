/**
 * Google Maps Scraper Module
 * ===========================
 * Extracts mosque data from Google Maps using Apify's compass/google-maps-extractor
 *
 * Searches:
 * - 6 major cities (Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra)
 * - 4 regional areas (Gold Coast, Newcastle, Hobart, Darwin)
 * - Target: 300+ mosques across Australia
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs/promises';
import path from 'path';

// Initialize Apify client
const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export interface GoogleMapsResult {
  title: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  website?: string;
  url?: string; // Google Maps URL
  placeId?: string;
  categories?: string[];
  state?: string;
  suburb?: string;
}

// Search queries for comprehensive coverage (300+ mosques)
const SEARCH_QUERIES = [
  // Major Cities (Tier 1)
  'mosque OR masjid OR "Islamic centre" Sydney, NSW, Australia',
  'mosque OR masjid OR "Islamic centre" Melbourne, VIC, Australia',
  'mosque OR masjid OR "Islamic centre" Brisbane, QLD, Australia',
  'mosque OR masjid OR "Islamic centre" Perth, WA, Australia',
  'mosque OR masjid OR "Islamic centre" Adelaide, SA, Australia',
  'mosque OR masjid OR "Islamic centre" Canberra, ACT, Australia',

  // Regional Areas (Tier 2)
  'mosque OR masjid OR "Islamic centre" Gold Coast, QLD, Australia',
  'mosque OR masjid OR "Islamic centre" Newcastle, NSW, Australia',
  'mosque OR masjid OR "Islamic centre" Hobart, TAS, Australia',
  'mosque OR masjid OR "Islamic centre" Darwin, NT, Australia',

  // Additional terms for better coverage
  'Islamic center Sydney, Australia',
  'Islamic center Melbourne, Australia',
  'prayer hall Sydney, Australia',
  'prayer hall Melbourne, Australia',
  'Muslim community centre Sydney, Australia',
  'Muslim community centre Melbourne, Australia',
];

/**
 * Extract state abbreviation from address
 */
function extractState(address: string): string | undefined {
  if (!address) return undefined;

  const stateMap: Record<string, string> = {
    'NSW': 'NSW',
    'VIC': 'VIC',
    'QLD': 'QLD',
    'WA': 'WA',
    'SA': 'SA',
    'TAS': 'TAS',
    'ACT': 'ACT',
    'NT': 'NT',
    'New South Wales': 'NSW',
    'Victoria': 'VIC',
    'Queensland': 'QLD',
    'Western Australia': 'WA',
    'South Australia': 'SA',
    'Tasmania': 'TAS',
    'Australian Capital Territory': 'ACT',
    'Northern Territory': 'NT',
  };

  for (const [key, value] of Object.entries(stateMap)) {
    if (address.includes(key)) {
      return value;
    }
  }

  return undefined;
}

/**
 * Extract suburb from address (before state)
 */
function extractSuburb(address: string): string | undefined {
  if (!address) return undefined;

  try {
    // Address format: "123 Street, Suburb, STATE 1234, Australia"
    const parts = address.split(',').map(p => p.trim());

    if (parts.length >= 3) {
      // Suburb is usually the second-to-last part before STATE
      return parts[parts.length - 3];
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Run Google Maps extraction for all search queries
 */
export async function runGoogleMapsExtraction(): Promise<GoogleMapsResult[]> {
  console.log('\n🗺️  Starting Google Maps Extraction...\n');
  console.log(`📍 Searching ${SEARCH_QUERIES.length} locations for mosques\n`);

  const allResults: GoogleMapsResult[] = [];

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const query = SEARCH_QUERIES[i];

    console.log(`\n[${i + 1}/${SEARCH_QUERIES.length}] Searching: ${query}`);

    try {
      // Run the Actor
      const run = await client.actor('compass/google-maps-extractor').call({
        searchStringsArray: [query],
        maxCrawledPlacesPerSearch: 100, // Get up to 100 results per search
        language: 'en',
        deeperCityScrape: false, // Faster extraction
        scrapeReviewsPersonalData: false, // Don't need personal data
        scrapeDirections: false,
        scrapeImages: false,
        exportPlaceUrls: true,
        includeWebResults: true, // Important for getting websites
      });

      console.log(`  ⏳ Actor run: ${run.id}`);

      // Fetch results from the run's dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      console.log(`  ✅ Found ${items.length} results`);

      // Transform and add to results
      items.forEach((item: any) => {
        const result: GoogleMapsResult = {
          title: item.title || item.name,
          address: item.address,
          location: item.location,
          phone: item.phone,
          website: item.website,
          url: item.url,
          placeId: item.placeId,
          categories: item.categories,
          state: extractState(item.address || ''),
          suburb: extractSuburb(item.address || ''),
        };

        allResults.push(result);
      });

      // Rate limiting: wait 2 seconds between searches
      if (i < SEARCH_QUERIES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      console.error(`  ❌ Error searching "${query}":`, error.message);
    }
  }

  console.log(`\n\n📊 Total results collected: ${allResults.length}`);

  return allResults;
}

/**
 * Deduplicate results (same mosque might appear in multiple searches)
 */
export function deduplicateResults(results: GoogleMapsResult[]): GoogleMapsResult[] {
  const unique = new Map<string, GoogleMapsResult>();

  results.forEach(result => {
    // Use placeId as primary key, fallback to title + address
    const key = result.placeId || `${result.title}_${result.address}`;

    if (!unique.has(key)) {
      unique.set(key, result);
    }
  });

  console.log(`\n🔄 Deduplicated: ${results.length} → ${unique.size} unique mosques`);

  return Array.from(unique.values());
}

/**
 * Filter out non-mosque results (sometimes Google returns Islamic bookstores, etc.)
 */
export function filterMosquesOnly(results: GoogleMapsResult[]): GoogleMapsResult[] {
  const mosqueKeywords = [
    'mosque',
    'masjid',
    'islamic centre',
    'islamic center',
    'prayer hall',
    'muslim community',
    'jamaat',
    'jama\'at',
  ];

  const filtered = results.filter(result => {
    const title = result.title.toLowerCase();
    const categories = (result.categories || []).join(' ').toLowerCase();

    return mosqueKeywords.some(keyword =>
      title.includes(keyword) || categories.includes(keyword)
    );
  });

  console.log(`\n🕌 Filtered mosques: ${results.length} → ${filtered.length}`);

  return filtered;
}

/**
 * Save results to JSON file
 */
export async function saveGoogleMapsResults(results: GoogleMapsResult[]): Promise<string> {
  const outputPath = path.join(process.cwd(), 'scripts/apify/data/raw/gmaps-results.json');

  await fs.writeFile(
    outputPath,
    JSON.stringify(results, null, 2),
    'utf-8'
  );

  console.log(`\n💾 Saved ${results.length} results to: ${outputPath}`);

  return outputPath;
}

/**
 * Main function to run complete Google Maps extraction
 */
export async function extractMosquesFromGoogleMaps(): Promise<GoogleMapsResult[]> {
  console.log('\n' + '='.repeat(60));
  console.log('  GOOGLE MAPS MOSQUE EXTRACTION');
  console.log('='.repeat(60));

  // Step 1: Extract data
  const rawResults = await runGoogleMapsExtraction();

  // Step 2: Deduplicate
  const uniqueResults = deduplicateResults(rawResults);

  // Step 3: Filter mosques only
  const mosques = filterMosquesOnly(uniqueResults);

  // Step 4: Save to file
  await saveGoogleMapsResults(mosques);

  // Step 5: Statistics
  const withWebsite = mosques.filter(m => m.website).length;
  const withPhone = mosques.filter(m => m.phone).length;

  console.log('\n\n📈 EXTRACTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Total Mosques:     ${mosques.length}`);
  console.log(`  With Website:      ${withWebsite} (${Math.round(withWebsite / mosques.length * 100)}%)`);
  console.log(`  With Phone:        ${withPhone} (${Math.round(withPhone / mosques.length * 100)}%)`);
  console.log(`  By State:`);

  const byState = mosques.reduce((acc, m) => {
    const state = m.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byState)
    .sort(([, a], [, b]) => b - a)
    .forEach(([state, count]) => {
      console.log(`    ${state.padEnd(10)} ${count}`);
    });

  console.log('='.repeat(60) + '\n');

  return mosques;
}
