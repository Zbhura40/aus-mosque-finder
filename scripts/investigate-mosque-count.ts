import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateMosqueCount() {
  console.log('🔍 INVESTIGATING MOSQUE COUNT VARIANCE\n');
  console.log('='.repeat(60));

  // 1. Get total count from mosques_cache
  const { count: totalCount, error: countError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error getting count:', countError);
    return;
  }

  console.log(`\n📊 Total mosques in database: ${totalCount}`);

  // 2. Get count by type (mosque vs prayer room)
  const { data: byType, error: typeError } = await supabase
    .from('mosques_cache')
    .select('name');

  if (typeError) {
    console.error('Error getting by type:', typeError);
    return;
  }

  const mosques = byType.filter(m =>
    m.name.toLowerCase().includes('mosque') ||
    m.name.toLowerCase().includes('masjid')
  );

  const prayerRooms = byType.filter(m =>
    m.name.toLowerCase().includes('prayer room') ||
    m.name.toLowerCase().includes('musalla') ||
    m.name.toLowerCase().includes('islamic center')
  );

  const other = byType.filter(m => {
    const name = m.name.toLowerCase();
    return !name.includes('mosque') &&
           !name.includes('masjid') &&
           !name.includes('prayer room') &&
           !name.includes('musalla') &&
           !name.includes('islamic center');
  });

  console.log(`\n📋 Breakdown by type:`);
  console.log(`   - Mosques/Masjids: ${mosques.length}`);
  console.log(`   - Prayer Rooms/Musallas/Islamic Centers: ${prayerRooms.length}`);
  console.log(`   - Other: ${other.length}`);

  // 3. Check for specific airport prayer rooms
  console.log('\n' + '='.repeat(60));
  console.log('🔍 SEARCHING FOR SPECIFIC AIRPORT PRAYER ROOMS\n');

  const airportSearchTerms = [
    'Adelaide Airport',
    'Brisbane Domestic Airport',
    'Brisbane International',
    'BNE International'
  ];

  for (const term of airportSearchTerms) {
    console.log(`\nSearching for: "${term}"`);
    const { data, error } = await supabase
      .from('mosques_cache')
      .select('name, formatted_address, place_id, state')
      .ilike('name', `%${term}%`);

    if (error) {
      console.error(`Error searching for ${term}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      console.log(`✅ FOUND ${data.length} result(s):`);
      data.forEach((mosque, idx) => {
        console.log(`\n   ${idx + 1}. Name: ${mosque.name}`);
        console.log(`      Address: ${mosque.formatted_address}`);
        console.log(`      State: ${mosque.state}`);
        console.log(`      Place ID: ${mosque.place_id}`);
      });
    } else {
      console.log(`❌ NOT FOUND`);
    }
  }

  // 4. Get all prayer rooms to see what we have
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ALL PRAYER ROOMS IN DATABASE\n');

  const { data: allPrayerRooms, error: prayerError } = await supabase
    .from('mosques_cache')
    .select('name, formatted_address, state')
    .or('name.ilike.%prayer room%,name.ilike.%musalla%')
    .order('state', { ascending: true });

  if (prayerError) {
    console.error('Error getting prayer rooms:', prayerError);
    return;
  }

  console.log(`Found ${allPrayerRooms?.length || 0} prayer rooms/musallas:\n`);
  allPrayerRooms?.forEach((room, idx) => {
    console.log(`${idx + 1}. ${room.name}`);
    console.log(`   📍 ${room.formatted_address}`);
    console.log(`   🏳️  ${room.state}\n`);
  });

  // 5. Check for duplicates
  console.log('='.repeat(60));
  console.log('🔍 CHECKING FOR DUPLICATE ENTRIES\n');

  const { data: allMosques, error: allError } = await supabase
    .from('mosques_cache')
    .select('name, formatted_address, place_id');

  if (allError) {
    console.error('Error getting all mosques:', allError);
    return;
  }

  // Check for duplicate place_ids
  const placeIdMap = new Map();
  allMosques?.forEach(m => {
    if (placeIdMap.has(m.place_id)) {
      placeIdMap.get(m.place_id).push(m);
    } else {
      placeIdMap.set(m.place_id, [m]);
    }
  });

  const duplicatePlaceIds = Array.from(placeIdMap.entries()).filter(([_, mosques]) => mosques.length > 1);

  if (duplicatePlaceIds.length > 0) {
    console.log(`⚠️ Found ${duplicatePlaceIds.length} duplicate place_id(s):\n`);
    duplicatePlaceIds.forEach(([placeId, mosques]) => {
      console.log(`Place ID: ${placeId}`);
      mosques.forEach(m => {
        console.log(`   - ${m.name} (${m.formatted_address})`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicate place_ids found');
  }

  // Check for duplicate names
  const nameMap = new Map();
  allMosques?.forEach(m => {
    const normalizedName = m.name.toLowerCase().trim();
    if (nameMap.has(normalizedName)) {
      nameMap.get(normalizedName).push(m);
    } else {
      nameMap.set(normalizedName, [m]);
    }
  });

  const duplicateNames = Array.from(nameMap.entries()).filter(([_, mosques]) => mosques.length > 1);

  if (duplicateNames.length > 0) {
    console.log(`\n⚠️ Found ${duplicateNames.length} duplicate name(s):\n`);
    duplicateNames.forEach(([name, mosques]) => {
      console.log(`Name: ${name}`);
      mosques.forEach(m => {
        console.log(`   - ${m.formatted_address} (${m.place_id})`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicate names found');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Investigation complete!\n');
}

investigateMosqueCount().catch(console.error);
