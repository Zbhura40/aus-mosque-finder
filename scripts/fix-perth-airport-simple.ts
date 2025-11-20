import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPerthAirportSimple() {
  console.log('🔧 FIXING PERTH AIRPORT PRAYER ROOM\n');
  console.log('='.repeat(60));

  const name = 'Perth Airport Prayer Room';

  // 1. Get current ID and coordinates
  const { data: current, error: getError } = await supabase
    .from('mosques_cache')
    .select('id, latitude, longitude, suburb, postcode, location')
    .eq('name', name)
    .single();

  if (getError || !current) {
    console.error('❌ Error:', getError);
    return;
  }

  console.log('\nCurrent data:');
  console.log(`   ID: ${current.id}`);
  console.log(`   Latitude: ${current.latitude}`);
  console.log(`   Longitude: ${current.longitude}`);
  console.log(`   Suburb: ${current.suburb || 'NULL'}`);
  console.log(`   Postcode: ${current.postcode || 'NULL'}`);
  console.log(`   Location: ${current.location || 'NULL'}\n`);

  // 2. Update suburb and postcode
  console.log('='.repeat(60));
  console.log('\nUpdating suburb and postcode...\n');

  const { error: updateError } = await supabase
    .from('mosques_cache')
    .update({
      suburb: 'Perth Airport',
      postcode: '6105'
    })
    .eq('id', current.id);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  }

  console.log('✅ Suburb and postcode updated!\n');

  // 3. Create SQL migration file for the PostGIS point
  console.log('='.repeat(60));
  console.log('\n📝 Creating SQL migration for PostGIS location...\n');

  const migrationSQL = `-- Fix Perth Airport Prayer Room location point
-- Run this in Supabase SQL Editor

UPDATE mosques_cache
SET location = ST_SetSRID(ST_MakePoint(${current.longitude}, ${current.latitude}), 4326)
WHERE id = '${current.id}';

-- Verify the update
SELECT
  name,
  suburb,
  postcode,
  latitude,
  longitude,
  ST_AsText(location) as location_text,
  ST_X(location::geometry) as lng,
  ST_Y(location::geometry) as lat
FROM mosques_cache
WHERE id = '${current.id}';
`;

  const migrationPath = '/Users/zubairbhura/Work/findmymosque/fix-perth-airport-location.sql';

  writeFileSync(migrationPath, migrationSQL);

  console.log(`✅ SQL migration created: fix-perth-airport-location.sql\n`);
  console.log('To complete the fix, run this SQL in Supabase SQL Editor:\n');
  console.log('---');
  console.log(migrationSQL);
  console.log('---\n');

  // 4. Verify suburb/postcode update
  const { data: verified, error: verifyError } = await supabase
    .from('mosques_cache')
    .select('name, suburb, postcode, latitude, longitude, location')
    .eq('id', current.id)
    .single();

  if (verifyError || !verified) {
    console.error('❌ Verification failed:', verifyError);
    return;
  }

  console.log('='.repeat(60));
  console.log('\n✅ Current status:\n');
  console.log(`   Name: ${verified.name}`);
  console.log(`   Suburb: ${verified.suburb} ✅`);
  console.log(`   Postcode: ${verified.postcode} ✅`);
  console.log(`   Latitude: ${verified.latitude} ✅`);
  console.log(`   Longitude: ${verified.longitude} ✅`);
  console.log(`   Location (PostGIS): ${verified.location || 'NULL - needs SQL update ⚠️'}\n`);

  console.log('='.repeat(60));
  console.log('\n');
}

fixPerthAirportSimple().catch(console.error);
