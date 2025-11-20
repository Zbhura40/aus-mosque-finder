import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;
const googleApiKey = process.env.VITE_GOOGLE_PLACES_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface AirportPrayerRoom {
  name: string;
  address: string;
  state: string;
  searchQuery: string;
}

const airportPrayerRooms: AirportPrayerRoom[] = [
  {
    name: 'Brisbane Domestic Airport Prayer Room',
    address: 'Domestic Terminal, Bribie Way, Brisbane Airport QLD 4008',
    state: 'QLD',
    searchQuery: 'Brisbane Airport Domestic Terminal Prayer Room'
  },
  {
    name: 'Adelaide Airport Prayer Room',
    address: 'Sir Richard Williams Ave, Adelaide Airport SA 5950',
    state: 'SA',
    searchQuery: 'Adelaide Airport Prayer Room'
  }
];

async function searchGooglePlaces(query: string): Promise<any> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

async function findAndAddAirportPrayerRooms() {
  console.log('🔍 SEARCHING FOR AIRPORT PRAYER ROOMS ON GOOGLE PLACES API\n');
  console.log('='.repeat(60));

  for (const room of airportPrayerRooms) {
    console.log(`\n🔎 Searching: ${room.name}`);
    console.log(`   Query: "${room.searchQuery}"\n`);

    const result = await searchGooglePlaces(room.searchQuery);

    if (result.status === 'OK' && result.results.length > 0) {
      console.log(`✅ Found ${result.results.length} result(s):\n`);

      result.results.forEach((place: any, idx: number) => {
        console.log(`   ${idx + 1}. ${place.name}`);
        console.log(`      Address: ${place.formatted_address}`);
        console.log(`      Place ID: ${place.place_id}`);
        console.log(`      Types: ${place.types.join(', ')}\n`);
      });

      // Use the first result
      const bestMatch = result.results[0];

      console.log(`   📌 Using first result: ${bestMatch.name}`);
      console.log(`   Place ID: ${bestMatch.place_id}\n`);

      // Check if already exists
      const { data: existing, error: findError } = await supabase
        .from('mosques_cache')
        .select('*')
        .eq('google_place_id', bestMatch.place_id)
        .maybeSingle();

      if (findError) {
        console.error(`   ❌ Error checking for existing entry:`, findError);
        continue;
      }

      if (existing) {
        console.log(`   ⚠️ Already exists in database as: ${existing.name}\n`);
        continue;
      }

      // Insert into database
      const { error: insertError } = await supabase
        .from('mosques_cache')
        .insert({
          google_place_id: bestMatch.place_id,
          name: room.name,
          formatted_address: room.address,
          state: room.state,
          latitude: bestMatch.geometry?.location?.lat,
          longitude: bestMatch.geometry?.location?.lng,
          place_types: bestMatch.types || []
        });

      if (insertError) {
        console.error(`   ❌ Error inserting:`, insertError);
      } else {
        console.log(`   ✅ Successfully added to database!\n`);
      }

    } else if (result.status === 'ZERO_RESULTS') {
      console.log(`   ⚠️ No results found on Google Places API`);
      console.log(`   Status: ${result.status}\n`);
      console.log(`   ℹ️ Adding manually with a placeholder Place ID...\n`);

      // Create a unique placeholder Place ID
      const placeholderId = `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error: insertError } = await supabase
        .from('mosques_cache')
        .insert({
          google_place_id: placeholderId,
          name: room.name,
          formatted_address: room.address,
          state: room.state
        });

      if (insertError) {
        console.error(`   ❌ Error inserting:`, insertError);
      } else {
        console.log(`   ✅ Added with placeholder ID: ${placeholderId}\n`);
      }
    } else {
      console.log(`   ❌ API Error: ${result.status}`);
      if (result.error_message) {
        console.log(`   Message: ${result.error_message}\n`);
      }
    }

    // Small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Update BNE International Terminal address
  console.log('='.repeat(60));
  console.log('\n📝 Updating BNE International Terminal Prayer Room address...\n');

  const { error: updateError } = await supabase
    .from('mosques_cache')
    .update({
      formatted_address: 'Level 4, International Terminal, International Departures/32 Airport Dr, Brisbane Airport QLD 4008',
      state: 'QLD'
    })
    .eq('name', 'Prayer Room (BNE International Terminal)');

  if (updateError) {
    console.error('❌ Error updating:', updateError);
  } else {
    console.log('✅ Address updated!\n');
  }

  // Final verification
  console.log('='.repeat(60));
  console.log('📊 FINAL VERIFICATION\n');

  const allAirportRooms = [
    'Prayer Room (BNE International Terminal)',
    'Brisbane Domestic Airport Prayer Room',
    'Adelaide Airport Prayer Room'
  ];

  for (const name of allAirportRooms) {
    const { data, error } = await supabase
      .from('mosques_cache')
      .select('name, formatted_address, state, google_place_id')
      .eq('name', name)
      .maybeSingle();

    if (error || !data) {
      console.log(`❌ ${name}: NOT FOUND\n`);
    } else {
      console.log(`✅ ${name}`);
      console.log(`   📍 ${data.formatted_address}`);
      console.log(`   🏳️  ${data.state}`);
      console.log(`   🆔 ${data.google_place_id}\n`);
    }
  }

  // Get final count
  const { count, error: countError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log('='.repeat(60));
    console.log(`📈 Total locations in database: ${count}\n`);
  }

  console.log('✅ All done!\n');
}

findAndAddAirportPrayerRooms().catch(console.error);
