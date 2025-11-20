import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigatePerthAirportSearch() {
  console.log('🔍 INVESTIGATING PERTH AIRPORT PRAYER ROOM SEARCH ISSUE\n');
  console.log('='.repeat(60));

  // 1. Get Perth Airport Prayer Room details
  console.log('\n1️⃣ Checking Perth Airport Prayer Room data...\n');

  const { data: perthAirport, error: perthError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', 'Perth Airport Prayer Room')
    .single();

  if (perthError || !perthAirport) {
    console.error('❌ Perth Airport Prayer Room not found:', perthError);
    return;
  }

  console.log('✅ Found: Perth Airport Prayer Room\n');
  console.log('Current data:');
  console.log(`   Name: ${perthAirport.name}`);
  console.log(`   Address: ${perthAirport.formatted_address || perthAirport.address}`);
  console.log(`   Suburb: ${perthAirport.suburb || 'NULL ❌'}`);
  console.log(`   State: ${perthAirport.state}`);
  console.log(`   Postcode: ${perthAirport.postcode || 'NULL ❌'}`);
  console.log(`   Latitude: ${perthAirport.latitude || 'NULL ❌'}`);
  console.log(`   Longitude: ${perthAirport.longitude || 'NULL ❌'}`);
  console.log(`   Location (PostGIS): ${perthAirport.location || 'NULL ❌'}`);
  console.log(`   Place ID: ${perthAirport.google_place_id}`);
  console.log(`   Active: ${perthAirport.is_active}`);
  console.log(`   Verified: ${perthAirport.is_verified}\n`);

  // 2. Check other mosques/prayer rooms near Perth Airport
  console.log('='.repeat(60));
  console.log('\n2️⃣ Checking other locations in Perth Airport area...\n');

  const { data: nearbyLocations, error: nearbyError } = await supabase
    .from('mosques_cache')
    .select('name, suburb, latitude, longitude, location')
    .eq('state', 'WA')
    .or('suburb.ilike.%Perth Airport%,suburb.ilike.%Airport%,name.ilike.%Airport%');

  if (nearbyError) {
    console.error('❌ Error finding nearby locations:', nearbyError);
  } else if (nearbyLocations && nearbyLocations.length > 0) {
    console.log(`✅ Found ${nearbyLocations.length} location(s) with "Airport" in name/suburb:\n`);
    nearbyLocations.forEach((loc, idx) => {
      console.log(`   ${idx + 1}. ${loc.name}`);
      console.log(`      Suburb: ${loc.suburb || 'NULL'}`);
      console.log(`      Lat/Lng: ${loc.latitude || 'NULL'}, ${loc.longitude || 'NULL'}`);
      console.log(`      Location: ${loc.location || 'NULL'}\n`);
    });
  } else {
    console.log('ℹ️ No other airport locations found\n');
  }

  // 3. Check if coordinates are missing
  console.log('='.repeat(60));
  console.log('\n3️⃣ Diagnosis...\n');

  const issues: string[] = [];

  if (!perthAirport.latitude || !perthAirport.longitude) {
    issues.push('❌ CRITICAL: Missing latitude/longitude coordinates');
    console.log('   ⚠️ This is why it\'s not showing in radius searches!');
  }

  if (!perthAirport.location) {
    issues.push('❌ CRITICAL: Missing PostGIS location point');
    console.log('   ⚠️ The location column is used for geographic searches');
  }

  if (!perthAirport.suburb || perthAirport.suburb !== 'Perth Airport') {
    issues.push('⚠️ Suburb not set to "Perth Airport"');
  }

  if (!perthAirport.postcode || perthAirport.postcode !== '6105') {
    issues.push('⚠️ Postcode not set to "6105"');
  }

  if (issues.length === 0) {
    console.log('\n✅ All location data looks good!\n');
    console.log('   The issue might be with the search query or filters.');
  } else {
    console.log('\n🔧 Issues found:\n');
    issues.forEach(issue => console.log(`   ${issue}`));
  }

  // 4. Get Perth Airport coordinates (known coordinates)
  console.log('\n' + '='.repeat(60));
  console.log('\n4️⃣ Perth Airport coordinates reference...\n');

  const perthAirportCoords = {
    lat: -31.9385,
    lng: 115.9672,
    suburb: 'Perth Airport',
    postcode: '6105'
  };

  console.log(`   Perth Airport (T1 International):`);
  console.log(`   Latitude: ${perthAirportCoords.lat}`);
  console.log(`   Longitude: ${perthAirportCoords.lng}`);
  console.log(`   Suburb: ${perthAirportCoords.suburb}`);
  console.log(`   Postcode: ${perthAirportCoords.postcode}\n`);

  // 5. Recommendation
  console.log('='.repeat(60));
  console.log('\n💡 RECOMMENDATION\n');

  if (!perthAirport.latitude || !perthAirport.longitude || !perthAirport.location) {
    console.log('   The Perth Airport Prayer Room is missing geographic coordinates.');
    console.log('   This prevents it from appearing in radius-based searches.\n');
    console.log('   Solution: Update the entry with:');
    console.log(`   - Latitude: ${perthAirportCoords.lat}`);
    console.log(`   - Longitude: ${perthAirportCoords.lng}`);
    console.log(`   - Suburb: ${perthAirportCoords.suburb}`);
    console.log(`   - Postcode: ${perthAirportCoords.postcode}`);
    console.log('   - Location (PostGIS point)\n');
  }

  console.log('='.repeat(60));
  console.log('\n');
}

investigatePerthAirportSearch().catch(console.error);
