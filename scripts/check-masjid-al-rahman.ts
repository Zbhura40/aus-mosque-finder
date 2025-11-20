import * as dotenv from 'dotenv';

dotenv.config();

async function checkBothPlaceIds() {
  const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google Maps API key not found');
    return;
  }

  const placeIds = [
    { id: 'ChIJIUolIXKVMioRaZDpCrqDrkU', entry: 1 },
    { id: 'ChIJ19T2OACVMioRUb4e7xsfpIo', entry: 2 }
  ];

  console.log('🔍 CHECKING MASJID AL RAHMAN GOSNELLS PLACE IDs\n');
  console.log('='.repeat(80));

  for (const place of placeIds) {
    console.log(`\n📍 Entry ${place.entry} - Place ID: ${place.id}\n`);

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.id}&fields=place_id,name,formatted_address,rating,user_ratings_total,business_status,geometry&key=${googleApiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const result = data.result;
        console.log(`   ✅ Status: ${result.business_status || 'OPERATIONAL'}`);
        console.log(`   Name: ${result.name}`);
        console.log(`   Address: ${result.formatted_address}`);
        console.log(`   Rating: ${result.rating || 'N/A'} (${result.user_ratings_total || 0} reviews)`);
        console.log(`   Coordinates: ${result.geometry?.location?.lat}, ${result.geometry?.location?.lng}`);
      } else {
        console.log(`   ❌ Status: ${data.status}`);
        console.log(`   Error: Place ID may be invalid or deleted`);
      }
    } catch (error) {
      console.error(`   ❌ Error fetching:`, error);
    }

    console.log('   ' + '-'.repeat(76));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 RECOMMENDATION:');
  console.log('   - Keep the entry with OPERATIONAL status and more reviews');
  console.log('   - Delete the entry with invalid/closed status or fewer reviews\n');
}

checkBothPlaceIds();
