import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setPerthAirportPostGIS() {
  console.log('🔧 SETTING PERTH AIRPORT POSTGIS LOCATION POINT\n');
  console.log('='.repeat(60));

  const perthAirportId = '4007180d-81e7-40f0-895a-e9216c1e8c84';
  const latitude = -31.941307;
  const longitude = 115.9754918;

  console.log('\nExecuting SQL to set location point...\n');

  // Execute raw SQL using Supabase RPC
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `UPDATE mosques_cache SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326) WHERE id = '${perthAirportId}'`
  });

  if (error) {
    console.log('⚠️ RPC method not available, trying alternative...\n');

    // Alternative: Use a PostgreSQL function if it exists
    // Or we need to guide the user to run it manually

    console.log('Since we cannot run raw SQL from the API, please run this SQL in Supabase SQL Editor:\n');
    console.log('---');
    console.log(`UPDATE mosques_cache`);
    console.log(`SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`);
    console.log(`WHERE id = '${perthAirportId}';`);
    console.log('---\n');
    console.log('After running the SQL, the Perth Airport Prayer Room will appear in radius searches.\n');

    return;
  }

  console.log('✅ PostGIS location point set!\n');

  // Verify
  const { data: verified, error: verifyError } = await supabase
    .from('mosques_cache')
    .select('name, suburb, postcode, latitude, longitude, location')
    .eq('id', perthAirportId)
    .single();

  if (verifyError || !verified) {
    console.error('❌ Verification failed:', verifyError);
    return;
  }

  console.log('='.repeat(60));
  console.log('\n✅ VERIFICATION:\n');
  console.log(`   Name: ${verified.name}`);
  console.log(`   Suburb: ${verified.suburb}`);
  console.log(`   Postcode: ${verified.postcode}`);
  console.log(`   Latitude: ${verified.latitude}`);
  console.log(`   Longitude: ${verified.longitude}`);
  console.log(`   Location: ${verified.location ? '✅ SET' : '❌ NULL'}\n`);

  if (verified.location) {
    console.log('🎉 SUCCESS! Perth Airport Prayer Room will now appear in radius searches!\n');
  }

  console.log('='.repeat(60));
  console.log('\n');
}

setPerthAirportPostGIS().catch(console.error);
