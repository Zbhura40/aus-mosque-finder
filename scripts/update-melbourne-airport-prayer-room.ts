import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateMelbourneAirportPrayerRoom() {
  console.log('🔍 UPDATING MELBOURNE AIRPORT PRAYER ROOM\n');
  console.log('='.repeat(60));

  // 1. Search for "Prayer Room" in Melbourne/VIC
  console.log('\n1️⃣ Searching for "Prayer Room" entries in Melbourne (VIC)...\n');

  const { data: prayerRooms, error: searchError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', 'Prayer Room')
    .eq('state', 'VIC');

  if (searchError) {
    console.error('❌ Error searching:', searchError);
    return;
  }

  if (!prayerRooms || prayerRooms.length === 0) {
    console.log('ℹ️ No "Prayer Room" entry found in VIC\n');
  } else {
    console.log(`✅ Found ${prayerRooms.length} "Prayer Room" entry(ies) in VIC:\n`);

    prayerRooms.forEach((room, idx) => {
      console.log(`   ${idx + 1}. ${room.name}`);
      console.log(`      ID: ${room.id}`);
      console.log(`      Address: ${room.formatted_address || 'null'}`);
      console.log(`      Place ID: ${room.google_place_id}`);
      console.log(`      State: ${room.state}\n`);
    });

    // 2. Delete the Prayer Room entry
    console.log('='.repeat(60));
    console.log('\n2️⃣ Deleting "Prayer Room" entry...\n');

    for (const room of prayerRooms) {
      const { error: deleteError } = await supabase
        .from('mosques_cache')
        .delete()
        .eq('id', room.id);

      if (deleteError) {
        console.error(`❌ Error deleting entry ${room.id}:`, deleteError);
      } else {
        console.log(`✅ Deleted: ${room.name} (ID: ${room.id})`);
        console.log(`   Previous address: ${room.formatted_address || 'null'}\n`);
      }
    }
  }

  // 3. Create new Melbourne Airport Prayer Room entry
  console.log('='.repeat(60));
  console.log('\n3️⃣ Creating new "Melbourne Airport Prayer Room" entry...\n');

  const melbournePlaceId = 'MANUAL_MELBOURNE_AIRPORT_PRAYER_ROOM';
  const name = 'Melbourne Airport Prayer Room';
  const address = 'Melbourne Tullamarine Airport Tullamarine Freeway Terminal 2 International, Departure Dr, Melbourne Airport VIC 3045';

  // Details for the modal/description
  const details = `There are two 24/7 multi-denominational prayer rooms which are located:
* On the ground floor between Terminal 2 and 3
* In Terminal 2 (International Terminal), after security (opposite Cafe Sol)`;

  // Check if it already exists
  const { data: existingMelb, error: checkError } = await supabase
    .from('mosques_cache')
    .select('*')
    .or(`name.eq.${name},google_place_id.eq.${melbournePlaceId}`)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Error checking for existing entry:', checkError);
  } else if (existingMelb) {
    console.log('⚠️ Melbourne Airport Prayer Room already exists!');
    console.log(`   Name: ${existingMelb.name}`);
    console.log(`   Address: ${existingMelb.formatted_address}\n`);
  } else {
    const { error: insertError } = await supabase
      .from('mosques_cache')
      .insert({
        google_place_id: melbournePlaceId,
        name: name,
        address: address,
        formatted_address: address,
        state: 'VIC',
        suburb: 'Melbourne Airport',
        postcode: '3045',
        editorial_summary: details,
        is_verified: false,
        is_active: true
      });

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
    } else {
      console.log('✅ Successfully created new entry!');
      console.log(`   Name: ${name}`);
      console.log(`   Address: ${address}`);
      console.log(`   State: VIC`);
      console.log(`   Suburb: Melbourne Airport`);
      console.log(`   Postcode: 3045`);
      console.log(`   Place ID: ${melbournePlaceId} (manual entry)`);
      console.log(`\n   Details:\n   ${details.split('\n').join('\n   ')}\n`);
    }
  }

  // 4. Final verification
  console.log('='.repeat(60));
  console.log('\n📊 VERIFICATION - Melbourne Airport Prayer Room\n');

  const { data: finalCheck, error: finalError } = await supabase
    .from('mosques_cache')
    .select('name, formatted_address, state, google_place_id, editorial_summary')
    .eq('name', name)
    .maybeSingle();

  if (finalError || !finalCheck) {
    console.log('❌ Melbourne Airport Prayer Room: NOT FOUND\n');
  } else {
    console.log(`✅ ${finalCheck.name}`);
    console.log(`   📍 ${finalCheck.formatted_address}`);
    console.log(`   🏳️  ${finalCheck.state}`);
    console.log(`   🆔 ${finalCheck.google_place_id}`);
    if (finalCheck.editorial_summary) {
      console.log(`   📝 Details: ${finalCheck.editorial_summary}\n`);
    }
  }

  // 5. Get final count
  const { count, error: countError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log('='.repeat(60));
    console.log(`📈 Total locations in database: ${count}\n`);
  }

  console.log('✅ All done!\n');
}

updateMelbourneAirportPrayerRoom().catch(console.error);
