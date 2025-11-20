import * as dotenv from 'dotenv';

dotenv.config();

async function searchSouthernCross() {
  const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google Maps API key not found');
    return;
  }

  // Use Text Search API to find Southern Cross Railway Station
  const query = 'Southern Cross Railway Station Spencer Street Melbourne';
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      console.log('✅ FOUND SOUTHERN CROSS RAILWAY STATION\n');
      console.log('Name:', result.name);
      console.log('Address:', result.formatted_address);
      console.log('Place ID:', result.place_id);
      console.log('Latitude:', result.geometry.location.lat);
      console.log('Longitude:', result.geometry.location.lng);
      console.log('\n📝 SQL to fix:\n');
      console.log(`UPDATE mosques_cache`);
      console.log(`SET latitude = ${result.geometry.location.lat},`);
      console.log(`    longitude = ${result.geometry.location.lng},`);
      console.log(`    location = ST_SetSRID(ST_MakePoint(${result.geometry.location.lng}, ${result.geometry.location.lat}), 4326),`);
      console.log(`    last_fetched_from_google = NOW()`);
      console.log(`WHERE id = '0d168fd3-ea04-41a8-be3c-d2637fe9408b';`);
    } else {
      console.error(`❌ Search failed: ${data.status}`);
      console.log('Results:', data.results);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

searchSouthernCross();
