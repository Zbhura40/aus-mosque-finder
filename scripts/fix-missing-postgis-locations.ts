import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// From audit report: 14 mosques with coordinates but missing PostGIS
const mosquesNeedingPostGIS = [
  {
    id: '5667c202-aeee-4bca-8c5e-8f400c80c192',
    name: 'AL-INAYA PRAYER ROOM FOR SISTERS',
    latitude: -35.2815171,
    longitude: 149.1197927
  },
  {
    id: 'bc1b221a-aa07-40ae-abb3-8de357a7ed51',
    name: 'Australian Muslim Welfare Centre Incorporated (AMWC)',
    latitude: -34.0195731,
    longitude: 150.8674356
  },
  {
    id: '531b27f4-a473-47e6-b3df-ad1ca3cc4dbd',
    name: 'Canterbury Hospital Prayer Room',
    latitude: -33.9197427,
    longitude: 151.0982732
  },
  {
    id: '60463853-72c8-4d86-a45c-a20684688605',
    name: 'Daar ibn Umar',
    latitude: -34.064615,
    longitude: 150.8164183
  },
  {
    id: 'a506bb10-99c3-4711-82a5-dede9847756b',
    name: 'Epping Musallah & Quran Academy',
    latitude: -33.7731441,
    longitude: 151.0827727
  },
  {
    id: 'cb511485-4a7e-403f-a960-1d215fa89de1',
    name: 'IHIC',
    latitude: -33.9147531,
    longitude: 151.1342464
  },
  {
    id: '5ee7797d-a4c5-43ce-b0bb-89eb05464682',
    name: 'MCEC Prayer Room',
    latitude: -37.8255448,
    longitude: 144.9522081
  },
  {
    id: 'ec4d0b8e-1ff5-44a8-b113-124d8a212c35',
    name: 'Monash Musallah Krongold',
    latitude: -37.9137489,
    longitude: 145.1343935
  },
  {
    id: '3c5a0359-c78b-447d-aea2-e3075f593967',
    name: 'Multi Faith Centre (N35)',
    latitude: -27.555565,
    longitude: 153.053271
  },
  {
    id: '7cc26b8e-a46e-493c-abd9-e869d8d803a9',
    name: 'Multi-faith Chaplaincy (Building 38), UQ',
    latitude: -27.496117,
    longitude: 153.0152112
  },
  {
    id: 'aca5c9ab-505a-427f-a282-97b2d4576f91',
    name: 'QUT Musalla',
    latitude: -27.4766847,
    longitude: 153.0278205
  },
  {
    id: '86e053fe-a40e-4393-9a04-5d0f43c4c9a3',
    name: 'The Alfred Spiritual Care',
    latitude: -37.8465588,
    longitude: 144.9827216
  },
  {
    id: '09b90ad6-3ade-4226-973a-5a72b426ebfd',
    name: 'UMA CENTRE LIMITED',
    latitude: -33.94389,
    longitude: 151.0326076
  }
];

// Southern Cross Railway Station - needs coordinates first
const southernCrossId = '0d168fd3-ea04-41a8-be3c-d2637fe9408b';

async function getSouthernCrossCoordinates() {
  console.log('🔍 FETCHING COORDINATES FOR SOUTHERN CROSS RAILWAY STATION\n');
  console.log('='.repeat(80));

  const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google Maps API key not found in environment variables');
    return null;
  }

  // Get place details using Google Places API
  const placeId = 'ChIJF5nqO0JC1moR4PXrMAmu-hE'; // Southern Cross Station Place ID
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address&key=${googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result.geometry) {
      const { lat, lng } = data.result.geometry.location;
      console.log(`✅ Found coordinates: ${lat}, ${lng}`);
      console.log(`   Address: ${data.result.formatted_address}\n`);
      return { latitude: lat, longitude: lng };
    } else {
      console.error(`❌ Google API error: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching coordinates:', error);
    return null;
  }
}

async function generateSQL() {
  console.log('\n📝 GENERATING SQL STATEMENTS\n');
  console.log('='.repeat(80));

  let sqlStatements: string[] = [];

  // 1. Get Southern Cross coordinates
  const southernCrossCoords = await getSouthernCrossCoordinates();

  if (southernCrossCoords) {
    // Add Southern Cross to the list
    const southernCross = {
      id: southernCrossId,
      name: 'Southern Cross Railway Station Prayer Room',
      latitude: southernCrossCoords.latitude,
      longitude: southernCrossCoords.longitude
    };

    // First update coordinates for Southern Cross
    sqlStatements.push(
      `-- Fix Southern Cross Railway Station Prayer Room (add coordinates + PostGIS)\n` +
      `UPDATE mosques_cache\n` +
      `SET latitude = ${southernCross.latitude},\n` +
      `    longitude = ${southernCross.longitude},\n` +
      `    location = ST_SetSRID(ST_MakePoint(${southernCross.longitude}, ${southernCross.latitude}), 4326),\n` +
      `    last_fetched_from_google = NOW()\n` +
      `WHERE id = '${southernCross.id}';\n`
    );

    mosquesNeedingPostGIS.push(southernCross);
  } else {
    console.log('⚠️  Could not fetch Southern Cross coordinates. Will generate SQL for 14 mosques only.\n');
  }

  // 2. Generate SQL for all mosques needing PostGIS (now 13, Southern Cross handled above)
  const mosquesForPostGIS = southernCrossCoords
    ? mosquesNeedingPostGIS.slice(0, -1) // Exclude Southern Cross as it's already handled
    : mosquesNeedingPostGIS;

  for (const mosque of mosquesForPostGIS) {
    sqlStatements.push(
      `-- Fix ${mosque.name}\n` +
      `UPDATE mosques_cache\n` +
      `SET location = ST_SetSRID(ST_MakePoint(${mosque.longitude}, ${mosque.latitude}), 4326),\n` +
      `    last_fetched_from_google = NOW()\n` +
      `WHERE id = '${mosque.id}';\n`
    );
  }

  return { sqlStatements, totalCount: mosquesForPostGIS.length + (southernCrossCoords ? 1 : 0) };
}

async function main() {
  console.log('🔧 FIX MISSING POSTGIS LOCATIONS\n');
  console.log('='.repeat(80));
  console.log('This script will:\n');
  console.log('1. Fetch coordinates for Southern Cross Railway Station (currently missing)');
  console.log('2. Generate SQL to fix PostGIS for 14 mosques with coordinates');
  console.log('3. Output SQL file for manual execution in Supabase\n');
  console.log('='.repeat(80));

  const { sqlStatements, totalCount } = await generateSQL();

  console.log('\n='.repeat(80));
  console.log(`\n✅ Generated SQL for ${totalCount} locations\n`);
  console.log('📋 SQL TO RUN IN SUPABASE SQL EDITOR:\n');
  console.log('='.repeat(80));
  console.log('');
  console.log(sqlStatements.join('\n'));
  console.log('='.repeat(80));
  console.log('\n📝 Instructions:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to Supabase Dashboard → SQL Editor');
  console.log('3. Paste and run the SQL');
  console.log('4. Verify with: SELECT name, latitude, longitude, location FROM mosques_cache WHERE location IS NULL;\n');
}

main().catch(console.error);
