import { createClient } from '@supabase/supabase-js';
import { validatePlaceOfWorship, type ValidationResult } from './validate-place-of-worship';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

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

// Major Australian cities and their coordinates
const SEARCH_LOCATIONS = [
  // NSW
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, radius: 50000 },
  { name: 'Newcastle', lat: -32.9267, lng: 151.7789, radius: 30000 },
  { name: 'Wollongong', lat: -34.4278, lng: 150.8931, radius: 25000 },

  // VIC
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631, radius: 50000 },
  { name: 'Geelong', lat: -38.1499, lng: 144.3617, radius: 25000 },

  // QLD
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251, radius: 50000 },
  { name: 'Gold Coast', lat: -28.0167, lng: 153.4000, radius: 30000 },
  { name: 'Sunshine Coast', lat: -26.6500, lng: 153.0667, radius: 25000 },
  { name: 'Townsville', lat: -19.2590, lng: 146.8169, radius: 25000 },
  { name: 'Cairns', lat: -16.9186, lng: 145.7781, radius: 20000 },

  // WA
  { name: 'Perth', lat: -31.9505, lng: 115.8605, radius: 50000 },

  // SA
  { name: 'Adelaide', lat: -34.9285, lng: 138.6007, radius: 40000 },

  // ACT
  { name: 'Canberra', lat: -35.2809, lng: 149.1300, radius: 30000 },

  // TAS
  { name: 'Hobart', lat: -42.8821, lng: 147.3272, radius: 25000 },
  { name: 'Launceston', lat: -41.4332, lng: 147.1441, radius: 20000 },

  // NT
  { name: 'Darwin', lat: -12.4634, lng: 130.8456, radius: 25000 },
];

async function searchPlacesOfWorship(location: typeof SEARCH_LOCATIONS[0]): Promise<PlaceResult[]> {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const requestBody = {
    includedTypes: ['place_of_worship'], // Only place_of_worship, not mosque
    maxResultCount: 20, // Max allowed by API
    locationRestriction: {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng
        },
        radius: location.radius
      }
    },
    regionCode: "AU", // Restrict to Australia
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
      console.error(`   ❌ API Error for ${location.name}:`);
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Error:`, JSON.stringify(errorData, null, 2));
      return [];
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error(`   ❌ Error searching ${location.name}:`, error);
    return [];
  }
}

async function main() {
  console.log('\n🔍 SEARCHING FOR PLACES OF WORSHIP ACROSS AUSTRALIA\n');
  console.log('='.repeat(80));
  console.log('\n📍 Searching', SEARCH_LOCATIONS.length, 'major cities/regions\n');

  const allResults: SearchResult[] = [];
  let totalPlaces = 0;
  let totalCost = 0;

  for (const location of SEARCH_LOCATIONS) {
    console.log(`\n🔍 Searching ${location.name}...`);

    const places = await searchPlacesOfWorship(location);
    totalPlaces += places.length;

    // Cost: $0.032 per Nearby Search
    totalCost += 0.032;

    console.log(`   Found ${places.length} places of worship`);

    for (const place of places) {
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
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SEARCH COMPLETE\n');

  // Categorize results
  const highConfidence = allResults.filter(r => r.validation.isIslamic === true && r.validation.confidence === 'high');
  const mediumConfidence = allResults.filter(r => r.validation.isIslamic === true && r.validation.confidence === 'medium');
  const needsReview = allResults.filter(r => r.validation.isIslamic === null);
  const rejected = allResults.filter(r => r.validation.isIslamic === false);

  console.log(`Total places found: ${totalPlaces}`);
  console.log(`\n✅ HIGH CONFIDENCE (auto-approve): ${highConfidence.length}`);
  console.log(`⚠️  MEDIUM CONFIDENCE (auto-approve): ${mediumConfidence.length}`);
  console.log(`❓ NEEDS MANUAL REVIEW: ${needsReview.length}`);
  console.log(`❌ REJECTED (non-Islamic): ${rejected.length}`);
  console.log(`\n💰 Total cost: $${totalCost.toFixed(2)}`);

  // Show high confidence results
  if (highConfidence.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ HIGH CONFIDENCE ISLAMIC PLACES:\n');
    highConfidence.forEach((result, index) => {
      console.log(`${index + 1}. ${result.place.displayName.text}`);
      console.log(`   📍 ${result.place.formattedAddress}`);
      console.log(`   📋 Category: ${result.validation.category}`);
      console.log(`   💬 ${result.validation.reason}\n`);
    });
  }

  // Show medium confidence results
  if (mediumConfidence.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('\n⚠️  MEDIUM CONFIDENCE (multi-faith prayer rooms):\n');
    mediumConfidence.forEach((result, index) => {
      console.log(`${index + 1}. ${result.place.displayName.text}`);
      console.log(`   📍 ${result.place.formattedAddress}`);
      console.log(`   📋 Category: ${result.validation.category}`);
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
      console.log(`   🏷️  Types: ${result.place.types.join(', ')}`);
      console.log(`   💬 ${result.validation.reason}\n`);
    });
  }

  // Export results to JSON for review
  const exportData = {
    searchDate: new Date().toISOString(),
    totalSearched: totalPlaces,
    highConfidence: highConfidence.map(r => ({
      name: r.place.displayName.text,
      address: r.place.formattedAddress,
      place_id: r.place.id,
      types: r.place.types,
      category: r.validation.category,
      confidence: r.validation.confidence,
      phone: r.place.nationalPhoneNumber,
      website: r.place.websiteUri,
      rating: r.place.rating,
      location: r.place.location
    })),
    mediumConfidence: mediumConfidence.map(r => ({
      name: r.place.displayName.text,
      address: r.place.formattedAddress,
      place_id: r.place.id,
      types: r.place.types,
      category: r.validation.category,
      confidence: r.validation.confidence,
      phone: r.place.nationalPhoneNumber,
      website: r.place.websiteUri,
      rating: r.place.rating,
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
    'docs/place-of-worship-search-results.json',
    JSON.stringify(exportData, null, 2)
  );

  console.log('\n📄 Results exported to: docs/place-of-worship-search-results.json');
  console.log('\n✅ Search complete!\n');
}

main().catch(console.error);
