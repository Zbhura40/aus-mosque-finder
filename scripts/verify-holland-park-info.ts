/**
 * Script to verify Holland Park Mosque information using Google Places API
 * This will fetch: parking, transit, popular times, and other verified details
 */

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
const HOLLAND_PARK_ADDRESS = "309 Nursery Road, Holland Park QLD 4121, Australia";

interface PlaceDetails {
  parking?: string;
  transit?: string[];
  popularTimes?: any;
  travelTime?: string;
  reviews?: any[];
}

async function getPlaceId(): Promise<string | null> {
  // Try searching by name and location
  const query = encodeURIComponent("Holland Park Mosque Brisbane");
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log('API Response:', JSON.stringify(data, null, 2));

  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].place_id;
  }
  return null;
}

async function getPlaceDetails(placeId: string): Promise<any> {
  const fields = [
    'name',
    'formatted_address',
    'geometry',
    'opening_hours',
    'reviews',
    'rating',
    'user_ratings_total',
    'website',
    'formatted_phone_number',
    'business_status'
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.result;
}

async function getNearbyTransit(lat: number, lng: number): Promise<any[]> {
  // Get nearby transit stations
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=transit_station&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results || [];
}

async function getDirectionsFromCBD(lat: number, lng: number): Promise<any> {
  // Brisbane CBD coordinates (approximate)
  const cbdLat = -27.4698;
  const cbdLng = 153.0251;

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${cbdLat},${cbdLng}&destination=${lat},${lng}&mode=driving&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.routes?.[0]?.legs?.[0];
}

async function main() {
  console.log('🔍 Verifying Holland Park Mosque Information...\n');

  // Step 1: Get Place ID
  console.log('📍 Step 1: Getting Place ID...');
  const placeId = await getPlaceId();

  if (!placeId) {
    console.error('❌ Could not find place ID for Holland Park Mosque');
    process.exit(1);
  }

  console.log(`✅ Place ID: ${placeId}\n`);

  // Step 2: Get Place Details
  console.log('📋 Step 2: Fetching Place Details...');
  const details = await getPlaceDetails(placeId);

  console.log('✅ Place Details Retrieved:\n');
  console.log('Name:', details.name);
  console.log('Address:', details.formatted_address);
  console.log('Phone:', details.formatted_phone_number);
  console.log('Website:', details.website);
  console.log('Rating:', details.rating, `(${details.user_ratings_total} reviews)`);
  console.log('Business Status:', details.business_status);
  console.log('\n');

  // Step 3: Get Nearby Transit
  console.log('🚌 Step 3: Checking Nearby Transit...');
  const lat = details.geometry.location.lat;
  const lng = details.geometry.location.lng;
  const transitStops = await getNearbyTransit(lat, lng);

  console.log(`✅ Found ${transitStops.length} nearby transit stops:\n`);
  transitStops.slice(0, 5).forEach((stop, index) => {
    console.log(`${index + 1}. ${stop.name}`);
    console.log(`   Type: ${stop.types.join(', ')}`);
    console.log(`   Vicinity: ${stop.vicinity}\n`);
  });

  // Step 4: Get Directions from CBD
  console.log('🚗 Step 4: Checking Travel Time from Brisbane CBD...');
  const directions = await getDirectionsFromCBD(lat, lng);

  if (directions) {
    console.log('✅ Driving Directions:');
    console.log('Distance:', directions.distance.text);
    console.log('Duration:', directions.duration.text);
    console.log('\n');
  }

  // Step 5: Analyze Reviews for Transport Info
  console.log('💬 Step 5: Analyzing Reviews for Parking/Transport Info...');
  if (details.reviews && details.reviews.length > 0) {
    console.log(`✅ Found ${details.reviews.length} reviews\n`);

    const parkingMentions = details.reviews.filter((r: any) =>
      r.text.toLowerCase().includes('parking') ||
      r.text.toLowerCase().includes('park')
    );

    const transitMentions = details.reviews.filter((r: any) =>
      r.text.toLowerCase().includes('bus') ||
      r.text.toLowerCase().includes('train') ||
      r.text.toLowerCase().includes('transport')
    );

    if (parkingMentions.length > 0) {
      console.log('🅿️ Parking Mentions:');
      parkingMentions.slice(0, 3).forEach((review: any) => {
        const snippet = review.text.substring(0, 150);
        console.log(`- "${snippet}..."`);
      });
      console.log('\n');
    }

    if (transitMentions.length > 0) {
      console.log('🚌 Transit Mentions:');
      transitMentions.slice(0, 3).forEach((review: any) => {
        const snippet = review.text.substring(0, 150);
        console.log(`- "${snippet}..."`);
      });
      console.log('\n');
    }
  }

  // Summary
  console.log('📊 VERIFICATION SUMMARY:');
  console.log('========================');
  console.log('✅ Phone Number Verified:', details.formatted_phone_number || 'NOT AVAILABLE');
  console.log('✅ Travel Time from CBD:', directions?.duration.text || 'NOT AVAILABLE');
  console.log('✅ Nearby Transit Stops:', transitStops.length > 0 ? 'YES' : 'NO');
  console.log('✅ Parking Info in Reviews:', details.reviews?.some((r: any) => r.text.toLowerCase().includes('parking')) ? 'YES' : 'NO');
  console.log('\n');

  // Export data
  const verifiedData = {
    name: details.name,
    address: details.formatted_address,
    phone: details.formatted_phone_number,
    website: details.website,
    coordinates: {
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng
    },
    travelTimeFromCBD: directions?.duration.text,
    distanceFromCBD: directions?.distance.text,
    nearbyTransit: transitStops.slice(0, 5).map(stop => ({
      name: stop.name,
      type: stop.types,
      vicinity: stop.vicinity
    })),
    rating: details.rating,
    totalReviews: details.user_ratings_total,
    parkingInfo: details.reviews?.filter((r: any) =>
      r.text.toLowerCase().includes('parking')
    ).slice(0, 3).map((r: any) => r.text),
    transitInfo: details.reviews?.filter((r: any) =>
      r.text.toLowerCase().includes('bus') || r.text.toLowerCase().includes('transport')
    ).slice(0, 3).map((r: any) => r.text)
  };

  console.log('💾 Saving verified data to file...');
  const fs = require('fs');
  fs.writeFileSync(
    './holland-park-verified-data.json',
    JSON.stringify(verifiedData, null, 2)
  );
  console.log('✅ Data saved to holland-park-verified-data.json');
}

main().catch(console.error);
