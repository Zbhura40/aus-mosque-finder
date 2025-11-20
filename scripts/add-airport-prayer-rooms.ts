import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAirportPrayerRooms() {
  console.log('🕌 ADDING/UPDATING AIRPORT PRAYER ROOMS\n');
  console.log('='.repeat(60));

  // First, let's check the schema to see what columns exist
  console.log('\n📋 Checking database schema...\n');

  const { data: existingData, error: schemaError } = await supabase
    .from('mosques_cache')
    .select('*')
    .limit(1);

  if (schemaError) {
    console.error('Error checking schema:', schemaError);
    return;
  }

  if (existingData && existingData.length > 0) {
    console.log('Available columns:', Object.keys(existingData[0]).join(', '));
    console.log('');
  }

  // 1. Update existing BNE International Terminal Prayer Room
  console.log('='.repeat(60));
  console.log('1️⃣ UPDATING: Prayer Room (BNE International Terminal)\n');

  const { data: bneIntl, error: findError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', 'Prayer Room (BNE International Terminal)')
    .single();

  if (findError) {
    console.error('❌ Error finding BNE International prayer room:', findError);
  } else if (bneIntl) {
    console.log('✅ Found existing entry');
    console.log(`   Current address: ${bneIntl.formatted_address || 'null'}`);

    const newAddress = 'Level 4, International Terminal, International Departures/32 Airport Dr, Brisbane Airport QLD 4008';

    const { error: updateError } = await supabase
      .from('mosques_cache')
      .update({
        formatted_address: newAddress,
        state: 'QLD'
      })
      .eq('name', 'Prayer Room (BNE International Terminal)');

    if (updateError) {
      console.error('❌ Error updating address:', updateError);
    } else {
      console.log('✅ Address updated successfully!');
      console.log(`   New address: ${newAddress}`);
      console.log(`   State: QLD\n`);
    }
  } else {
    console.log('❌ Prayer room not found in database\n');
  }

  // 2. Add Brisbane Domestic Airport Prayer Room
  console.log('='.repeat(60));
  console.log('2️⃣ ADDING: Brisbane Domestic Airport Prayer Room\n');

  // First check if it already exists
  const { data: bneDomstic, error: findDomesticError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', 'Brisbane Domestic Airport Prayer Room')
    .maybeSingle();

  if (findDomesticError) {
    console.error('❌ Error checking for existing entry:', findDomesticError);
  } else if (bneDomstic) {
    console.log('⚠️ Entry already exists!');
    console.log(`   Current address: ${bneDomstic.formatted_address}`);
  } else {
    const { error: insertError } = await supabase
      .from('mosques_cache')
      .insert({
        name: 'Brisbane Domestic Airport Prayer Room',
        formatted_address: 'Domestic Terminal, Bribie Way, Brisbane Airport QLD 4008',
        state: 'QLD'
      });

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
    } else {
      console.log('✅ Successfully added!');
      console.log('   Name: Brisbane Domestic Airport Prayer Room');
      console.log('   Address: Domestic Terminal, Bribie Way, Brisbane Airport QLD 4008');
      console.log('   State: QLD\n');
    }
  }

  // 3. Add Adelaide Airport Prayer Room
  console.log('='.repeat(60));
  console.log('3️⃣ ADDING: Adelaide Airport Prayer Room\n');

  // First check if it already exists
  const { data: adelaideAirport, error: findAdelaideError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', 'Adelaide Airport Prayer Room')
    .maybeSingle();

  if (findAdelaideError) {
    console.error('❌ Error checking for existing entry:', findAdelaideError);
  } else if (adelaideAirport) {
    console.log('⚠️ Entry already exists!');
    console.log(`   Current address: ${adelaideAirport.formatted_address}`);
  } else {
    const { error: insertError } = await supabase
      .from('mosques_cache')
      .insert({
        name: 'Adelaide Airport Prayer Room',
        formatted_address: 'Sir Richard Williams Ave, Adelaide Airport SA 5950',
        state: 'SA'
      });

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
    } else {
      console.log('✅ Successfully added!');
      console.log('   Name: Adelaide Airport Prayer Room');
      console.log('   Address: Sir Richard Williams Ave, Adelaide Airport SA 5950');
      console.log('   State: SA\n');
    }
  }

  // 4. Verify all changes
  console.log('='.repeat(60));
  console.log('📊 VERIFICATION - All Airport Prayer Rooms\n');

  const airportPrayerRooms = [
    'Prayer Room (BNE International Terminal)',
    'Brisbane Domestic Airport Prayer Room',
    'Adelaide Airport Prayer Room'
  ];

  for (const name of airportPrayerRooms) {
    const { data, error } = await supabase
      .from('mosques_cache')
      .select('name, formatted_address, state')
      .eq('name', name)
      .single();

    if (error) {
      console.log(`❌ ${name}: NOT FOUND`);
    } else {
      console.log(`✅ ${name}`);
      console.log(`   📍 ${data.formatted_address}`);
      console.log(`   🏳️  ${data.state}\n`);
    }
  }

  // 5. Get final count
  const { count, error: countError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log('='.repeat(60));
    console.log(`📈 Total mosques in database: ${count}\n`);
  }

  console.log('✅ Done!\n');
}

addAirportPrayerRooms().catch(console.error);
