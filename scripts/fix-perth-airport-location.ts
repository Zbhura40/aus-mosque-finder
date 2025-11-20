import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPerthAirportLocation() {
  console.log('🔧 FIXING PERTH AIRPORT PRAYER ROOM LOCATION DATA\n');
  console.log('='.repeat(60));

  const name = 'Perth Airport Prayer Room';

  // 1. Get current data
  console.log('\n1️⃣ Getting current data...\n');

  const { data: current, error: getError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', name)
    .single();

  if (getError || !current) {
    console.error('❌ Error getting current data:', getError);
    return;
  }

  console.log('Current data:');
  console.log(`   Suburb: ${current.suburb || 'NULL'}`);
  console.log(`   Postcode: ${current.postcode || 'NULL'}`);
  console.log(`   Latitude: ${current.latitude}`);
  console.log(`   Longitude: ${current.longitude}`);
  console.log(`   Location (PostGIS): ${current.location || 'NULL'}\n`);

  // 2. Update with correct data
  console.log('='.repeat(60));
  console.log('\n2️⃣ Updating location data...\n');

  // Create PostGIS point using ST_MakePoint
  // The location column in Supabase uses the geography type
  const { error: updateError } = await supabase.rpc('update_perth_airport_location', {
    prayer_room_id: current.id
  });

  // If the RPC doesn't exist, use direct SQL update
  if (updateError && updateError.message.includes('does not exist')) {
    console.log('   Using direct SQL update method...\n');

    // Use raw SQL to update the location
    const { error: sqlError } = await supabase
      .from('mosques_cache')
      .update({
        suburb: 'Perth Airport',
        postcode: '6105',
        // Create a PostGIS point - format: POINT(longitude latitude)
        location: `POINT(${current.longitude} ${current.latitude})`
      })
      .eq('id', current.id);

    if (sqlError) {
      console.error('❌ SQL update failed, trying alternative method:', sqlError);

      // Alternative: Update without the location field first, then add it
      const { error: updateErr } = await supabase
        .from('mosques_cache')
        .update({
          suburb: 'Perth Airport',
          postcode: '6105'
        })
        .eq('id', current.id);

      if (updateErr) {
        console.error('❌ Update failed:', updateErr);
        return;
      }

      console.log('✅ Updated suburb and postcode');
      console.log('⚠️ Location (PostGIS point) needs to be set via SQL migration\n');
    } else {
      console.log('✅ All fields updated successfully!\n');
    }
  } else if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  } else {
    console.log('✅ Updated via RPC function!\n');
  }

  // 3. Verify the update
  console.log('='.repeat(60));
  console.log('\n3️⃣ Verifying update...\n');

  const { data: updated, error: verifyError } = await supabase
    .from('mosques_cache')
    .select('*')
    .eq('name', name)
    .single();

  if (verifyError || !updated) {
    console.error('❌ Verification failed:', verifyError);
    return;
  }

  console.log('✅ Updated data:');
  console.log(`   Name: ${updated.name}`);
  console.log(`   Suburb: ${updated.suburb || 'NULL'}`);
  console.log(`   Postcode: ${updated.postcode || 'NULL'}`);
  console.log(`   Latitude: ${updated.latitude}`);
  console.log(`   Longitude: ${updated.longitude}`);
  console.log(`   Location (PostGIS): ${updated.location || 'NULL'}\n`);

  if (updated.location) {
    console.log('✅ PostGIS location point created successfully!');
  } else {
    console.log('⚠️ PostGIS location point still NULL - needs SQL migration');
    console.log('\n📝 To fix this, run this SQL in Supabase SQL Editor:\n');
    console.log(`UPDATE mosques_cache`);
    console.log(`SET location = ST_SetSRID(ST_MakePoint(${current.longitude}, ${current.latitude}), 4326)`);
    console.log(`WHERE id = '${current.id}';`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Update complete!\n');
}

fixPerthAirportLocation().catch(console.error);
