import { validatePlaceOfWorship, type ValidationResult } from './validate-place-of-worship';
import * as dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY!;

interface PlaceResult {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  types: string[];
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: any;
}

interface SearchResult {
  place: PlaceResult;
  validation: ValidationResult;
}

// Search queries to find Islamic prayer facilities
const SEARCH_QUERIES = [
  // Airport prayer rooms
  'Brisbane Airport prayer room',
  'Sydney Airport prayer room',
  'Melbourne Airport prayer room',
  'Perth Airport prayer room',
  'Adelaide Airport prayer room',
  'Canberra Airport prayer room',
  'Gold Coast Airport prayer room',
  'Cairns Airport prayer room',

  // University prayer rooms / musallas
  'University of Queensland musalla',
  'University of Sydney musalla',
  'University of Melbourne musalla',
  'UNSW musalla',
  'Monash University musalla',
  'UWA musalla',
  'Griffith University musalla',
  'QUT musalla',

  // Hospital prayer rooms
  'Royal Brisbane Hospital prayer room',
  'Sydney Hospital prayer room',
  'Melbourne Hospital prayer room',

  // Generic searches
  'Muslim prayer room Brisbane',
  'Muslim prayer room Sydney',
  'Muslim prayer room Melbourne',
  'Islamic prayer space Brisbane',
  'Islamic prayer space Sydney',
  'Islamic prayer space Melbourne',
];

async function searchByText(query: string): Promise<PlaceResult[]> {
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const requestBody = {
    textQuery: query,
    regionCode: "AU",
    languageCode: "en"
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`   ❌ API Error for "${query}":`);
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Error:`, JSON.stringify(errorData, null, 2));
      return [];
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error(`   ❌ Error searching "${query}":`, error);
    return [];
  }
}

async function main() {
  console.log('\n🔍 SEARCHING FOR ISLAMIC PRAYER FACILITIES ACROSS AUSTRALIA\n');
  console.log('='.repeat(80));
  console.log(`\n📋 Running ${SEARCH_QUERIES.length} targeted text searches\n`);

  const allResults: SearchResult[] = [];
  const seenPlaceIds = new Set<string>();
  let totalCost = 0;

  for (const query of SEARCH_QUERIES) {
    console.log(`\n🔍 "${query}"`);

    const places = await searchByText(query);

    // Cost: $0.032 per Text Search
    totalCost += 0.032;

    console.log(`   Found ${places.length} places`);

    for (const place of places) {
      // Skip duplicates
      if (seenPlaceIds.has(place.id)) {
        console.log(`   ⏭️  Skipping duplicate: ${place.displayName.text}`);
        continue;
      }

      seenPlaceIds.add(place.id);

      const validation = validatePlaceOfWorship(
        place.displayName.text,
        place.types,
        place.formattedAddress
      );

      allResults.push({ place, validation });

      // Only log Islamic places and unclear cases
      if (validation.isIslamic === true || validation.isIslamic === null) {
        const emoji = validation.confidence === 'high' ? '✅' :
                      validation.confidence === 'medium' ? '⚠️' : '❓';
        console.log(`   ${emoji} ${place.displayName.text} (${validation.category})`);
        console.log(`      ${validation.reason}`);
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SEARCH COMPLETE\n');

  // Categorize results
  const highConfidence = allResults.filter(r => r.validation.isIslamic === true && r.validation.confidence === 'high');
  const mediumConfidence = allResults.filter(r => r.validation.isIslamic === true && r.validation.confidence === 'medium');
  const needsReview = allResults.filter(r => r.validation.isIslamic === null);
  const rejected = allResults.filter(r => r.validation.isIslamic === false);

  console.log(`Total unique places found: ${allResults.length}`);
  console.log(`\n✅ HIGH CONFIDENCE (auto-approve): ${highConfidence.length}`);
  console.log(`⚠️  MEDIUM CONFIDENCE (auto-approve): ${mediumConfidence.length}`);
  console.log(`❓ NEEDS MANUAL REVIEW: ${needsReview.length}`);
  console.log(`❌ REJECTED (non-Islamic): ${rejected.length}`);
  console.log(`\n💰 Total cost: $${totalCost.toFixed(2)}`);

  // Show all approved results
  const approved = [...highConfidence, ...mediumConfidence];
  if (approved.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ ALL APPROVED ISLAMIC PLACES:\n');
    approved.forEach((result, index) => {
      const emoji = result.validation.confidence === 'high' ? '✅' : '⚠️';
      console.log(`${index + 1}. ${emoji} ${result.place.displayName.text}`);
      console.log(`   📍 ${result.place.formattedAddress}`);
      console.log(`   🆔 Place ID: ${result.place.id}`);
      console.log(`   📋 Category: ${result.validation.category} (${result.validation.confidence} confidence)`);
      console.log(`   🏷️  Google Types: ${result.place.types.join(', ')}`);
      if (result.place.nationalPhoneNumber) {
        console.log(`   📞 ${result.place.nationalPhoneNumber}`);
      }
      if (result.place.websiteUri) {
        console.log(`   🌐 ${result.place.websiteUri}`);
      }
      if (result.place.rating) {
        console.log(`   ⭐ ${result.place.rating} (${result.place.userRatingCount} reviews)`);
      }
      console.log(`   💬 ${result.validation.reason}\n`);
    });
  }

  // Show places needing manual review
  if (needsReview.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('\n❓ NEEDS MANUAL REVIEW:\n');
    needsReview.forEach((result, index) => {
      console.log(`${index + 1}. ${result.place.displayName.text}`);
      console.log(`   📍 ${result.place.formattedAddress}`);
      console.log(`   🆔 Place ID: ${result.place.id}`);
      console.log(`   🏷️  Types: ${result.place.types.join(', ')}`);
      console.log(`   💬 ${result.validation.reason}\n`);
    });
  }

  // Export results to JSON
  const exportData = {
    searchDate: new Date().toISOString(),
    totalSearched: allResults.length,
    approved: approved.map(r => ({
      name: r.place.displayName.text,
      address: r.place.formattedAddress,
      place_id: r.place.id,
      types: r.place.types,
      category: r.validation.category,
      confidence: r.validation.confidence,
      phone: r.place.nationalPhoneNumber,
      website: r.place.websiteUri,
      rating: r.place.rating,
      user_rating_count: r.place.userRatingCount,
      location: r.place.location
    })),
    needsReview: needsReview.map(r => ({
      name: r.place.displayName.text,
      address: r.place.formattedAddress,
      place_id: r.place.id,
      types: r.place.types,
      reason: r.validation.reason,
      phone: r.place.nationalPhoneNumber,
      website: r.place.websiteUri,
      rating: r.place.rating,
      location: r.place.location
    }))
  };

  const fs = await import('fs');
  fs.writeFileSync(
    'docs/prayer-rooms-search-results.json',
    JSON.stringify(exportData, null, 2)
  );

  console.log('📄 Results exported to: docs/prayer-rooms-search-results.json');
  console.log('\n✅ Search complete!\n');
}

main().catch(console.error);
