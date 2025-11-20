import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreSouthernCrossPrayerRoom() {
  console.log('🔄 RESTORING SOUTHERN CROSS RAILWAY STATION PRAYER ROOM\n');
  console.log('='.repeat(60));

  const name = 'Southern Cross Railway Station Prayer Room';
  const address = '122-Southern Cross Railway Station, Spencer St, Docklands VIC 3008, Australia';
  const placeId = 'ChIJ10muOCZd1moRhuFqowBUbF0'; // Original Google Place ID

  console.log(`\n📝 Creating entry: ${name}\n`);

  // Check if it already exists
  const { data: existing, error: checkError } = await supabase
    .from('mosques_cache')
    .select('*')
    .or(`name.eq.${name},google_place_id.eq.${placeId}`)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Error checking for existing entry:', checkError);
    return;
  }

  if (existing) {
    console.log('⚠️ Entry already exists!');
    console.log(`   Name: ${existing.name}`);
    console.log(`   Address: ${existing.formatted_address}`);
    console.log(`   Place ID: ${existing.google_place_id}\n`);
  } else {
    const { error: insertError } = await supabase
      .from('mosques_cache')
      .insert({
        google_place_id: placeId,
        name: name,
        address: address,
        formatted_address: address,
        state: 'VIC',
        suburb: 'Docklands',
        postcode: '3008',
        is_verified: false,
        is_active: true
      });

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
    } else {
      console.log('✅ Successfully restored!');
      console.log(`   Name: ${name}`);
      console.log(`   Address: ${address}`);
      console.log(`   State: VIC`);
      console.log(`   Suburb: Docklands`);
      console.log(`   Postcode: 3008`);
      console.log(`   Place ID: ${placeId}\n`);
    }
  }

  // Verification
  console.log('='.repeat(60));
  console.log('\n📊 VERIFICATION\n');

  const { data: verified, error: verifyError } = await supabase
    .from('mosques_cache')
    .select('name, formatted_address, state, google_place_id')
    .eq('name', name)
    .maybeSingle();

  if (verifyError || !verified) {
    console.log('❌ Entry not found after insert\n');
  } else {
    console.log(`✅ ${verified.name}`);
    console.log(`   📍 ${verified.formatted_address}`);
    console.log(`   🏳️  ${verified.state}`);
    console.log(`   🆔 ${verified.google_place_id}\n`);
  }

  // Get final count
  const { count, error: countError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log('='.repeat(60));
    console.log(`📈 Total locations in database: ${count}\n`);
  }

  console.log('✅ Done!\n');
}

restoreSouthernCrossPrayerRoom().catch(console.error);
