import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAirportRoomsManually() {
  console.log('🕌 MANUALLY ADDING AIRPORT PRAYER ROOMS\n');
  console.log('='.repeat(60));

  // 1. Brisbane Domestic Airport Prayer Room
  console.log('\n1️⃣ Adding: Brisbane Domestic Airport Prayer Room\n');

  const brisbanePlaceId = 'MANUAL_BNE_DOMESTIC_PRAYER_ROOM';

  // Check if already exists
  const { data: existingBne, error: checkBneError } = await supabase
    .from('mosques_cache')
    .select('*')
    .or(`name.eq.Brisbane Domestic Airport Prayer Room,google_place_id.eq.${brisbanePlaceId}`)
    .maybeSingle();

  if (checkBneError) {
    console.error('❌ Error checking:', checkBneError);
  } else if (existingBne) {
    console.log('⚠️ Entry already exists!');
    console.log(`   Name: ${existingBne.name}`);
    console.log(`   Address: ${existingBne.formatted_address}\n`);
  } else {
    const { error: insertError } = await supabase
      .from('mosques_cache')
      .insert({
        google_place_id: brisbanePlaceId,
        name: 'Brisbane Domestic Airport Prayer Room',
        address: 'Domestic Terminal, Bribie Way, Brisbane Airport QLD 4008',
        formatted_address: 'Domestic Terminal, Bribie Way, Brisbane Airport QLD 4008',
        state: 'QLD',
        is_verified: false,
        is_active: true
      });

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
    } else {
      console.log('✅ Successfully added!');
      console.log('   Name: Brisbane Domestic Airport Prayer Room');
      console.log('   Address: Domestic Terminal, Bribie Way, Brisbane Airport QLD 4008');
      console.log('   State: QLD');
      console.log(`   Place ID: ${brisbanePlaceId} (manual entry)\n`);
    }
  }

  // 2. Adelaide Airport Prayer Room
  console.log('='.repeat(60));
  console.log('\n2️⃣ Adding: Adelaide Airport Prayer Room\n');

  const adelaidePlaceId = 'MANUAL_ADELAIDE_AIRPORT_PRAYER_ROOM';

  // Check if already exists
  const { data: existingAdl, error: checkAdlError } = await supabase
    .from('mosques_cache')
    .select('*')
    .or(`name.eq.Adelaide Airport Prayer Room,google_place_id.eq.${adelaidePlaceId}`)
    .maybeSingle();

  if (checkAdlError) {
    console.error('❌ Error checking:', checkAdlError);
  } else if (existingAdl) {
    console.log('⚠️ Entry already exists!');
    console.log(`   Name: ${existingAdl.name}`);
    console.log(`   Address: ${existingAdl.formatted_address}\n`);
  } else {
    const { error: insertError } = await supabase
      .from('mosques_cache')
      .insert({
        google_place_id: adelaidePlaceId,
        name: 'Adelaide Airport Prayer Room',
        address: 'Sir Richard Williams Ave, Adelaide Airport SA 5950',
        formatted_address: 'Sir Richard Williams Ave, Adelaide Airport SA 5950',
        state: 'SA',
        is_verified: false,
        is_active: true
      });

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
    } else {
      console.log('✅ Successfully added!');
      console.log('   Name: Adelaide Airport Prayer Room');
      console.log('   Address: Sir Richard Williams Ave, Adelaide Airport SA 5950');
      console.log('   State: SA');
      console.log(`   Place ID: ${adelaidePlaceId} (manual entry)\n`);
    }
  }

  // 3. Final verification
  console.log('='.repeat(60));
  console.log('\n📊 FINAL VERIFICATION - All Airport Prayer Rooms\n');

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

addAirportRoomsManually().catch(console.error);
