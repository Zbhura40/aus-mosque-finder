import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePerthAirportPrayerRoom() {
  console.log('🔍 SEARCHING FOR QUIET ROOM FOR PRAYER AND QUIET CONTEMPLATION\n');
  console.log('='.repeat(60));

  const oldName = 'Quiet Room for Prayer and Quiet Contemplation';
  const expectedAddress = 'T1 International, Perth Airport WA 6105';
  const newName = 'Perth Airport Prayer Room';

  // 1. Search for the entry
  console.log(`\n1️⃣ Searching for: "${oldName}"\n`);

  const { data: entries, error: searchError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', oldName);

  if (searchError) {
    console.error('❌ Error searching:', searchError);
    return;
  }

  if (!entries || entries.length === 0) {
    console.log('❌ Entry not found in database\n');
    console.log('ℹ️ Let me search for similar entries...\n');

    // Try partial search
    const { data: partialEntries, error: partialError } = await supabase
      .from('mosques_cache')
      .select('*')
      .ilike('name', '%Quiet Room%');

    if (partialError) {
      console.error('❌ Error in partial search:', partialError);
      return;
    }

    if (partialEntries && partialEntries.length > 0) {
      console.log(`✅ Found ${partialEntries.length} entry(ies) with "Quiet Room" in the name:\n`);
      partialEntries.forEach((entry, idx) => {
        console.log(`   ${idx + 1}. ${entry.name}`);
        console.log(`      Address: ${entry.formatted_address || entry.address || 'null'}`);
        console.log(`      State: ${entry.state}\n`);
      });
    } else {
      console.log('❌ No entries found with "Quiet Room" in the name\n');
    }
    return;
  }

  console.log(`✅ Found ${entries.length} entry(ies):\n`);

  entries.forEach((entry, idx) => {
    console.log(`   ${idx + 1}. ${entry.name}`);
    console.log(`      ID: ${entry.id}`);
    console.log(`      Address: ${entry.formatted_address || entry.address || 'null'}`);
    console.log(`      State: ${entry.state}`);
    console.log(`      Place ID: ${entry.google_place_id}\n`);
  });

  // 2. Check if address matches
  console.log('='.repeat(60));
  console.log('\n2️⃣ Verifying address...\n');

  const matchingEntry = entries.find(entry => {
    const address = entry.formatted_address || entry.address || '';
    return address.includes('T1 International') &&
           address.includes('Perth Airport') &&
           address.includes('WA 6105');
  });

  if (!matchingEntry) {
    console.log('❌ No entry found with the expected address');
    console.log(`   Expected: ${expectedAddress}\n`);

    console.log('   Actual addresses found:');
    entries.forEach((entry, idx) => {
      console.log(`   ${idx + 1}. ${entry.formatted_address || entry.address || 'null'}\n`);
    });
    return;
  }

  console.log('✅ Address match found!');
  console.log(`   Current name: ${matchingEntry.name}`);
  console.log(`   Current address: ${matchingEntry.formatted_address || matchingEntry.address}`);
  console.log(`   New name: ${newName}\n`);

  // 3. Update the name only
  console.log('='.repeat(60));
  console.log('\n3️⃣ Updating name to "Perth Airport Prayer Room"...\n');

  const { error: updateError } = await supabase
    .from('mosques_cache')
    .update({ name: newName })
    .eq('id', matchingEntry.id);

  if (updateError) {
    console.error('❌ Error updating:', updateError);
    return;
  }

  console.log('✅ Name updated successfully!\n');

  // 4. Verification
  console.log('='.repeat(60));
  console.log('\n📊 VERIFICATION\n');

  const { data: verified, error: verifyError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('id', matchingEntry.id)
    .single();

  if (verifyError || !verified) {
    console.log('❌ Could not verify update\n');
  } else {
    console.log(`✅ ${verified.name}`);
    console.log(`   📍 ${verified.formatted_address || verified.address}`);
    console.log(`   🏳️  ${verified.state}`);
    console.log(`   🆔 ${verified.google_place_id}`);
    console.log(`   📞 ${verified.phone_number || 'N/A'}`);
    console.log(`   🌐 ${verified.website || 'N/A'}`);
    console.log(`   ⭐ ${verified.google_rating || 'N/A'}`);
    console.log(`   ✅ Verified: ${verified.is_verified}`);
    console.log(`   🟢 Active: ${verified.is_active}\n`);
  }

  console.log('='.repeat(60));
  console.log('✅ Update complete!\n');
}

updatePerthAirportPrayerRoom().catch(console.error);
