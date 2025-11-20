import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateAirportSearchFiltering() {
  console.log('🔍 INVESTIGATING AIRPORT SEARCH FILTERING ISSUE\n');
  console.log('='.repeat(60));

  const airportNames = [
    'Adelaide Airport Prayer Room',
    'Melbourne Airport Prayer Room',
    'Brisbane Domestic Airport Prayer Room',
    'Prayer Room (BNE International Terminal)'
  ];

  console.log('\n📊 DETAILED COMPARISON\n');
  console.log('Working: Brisbane International ✅');
  console.log('Not Working: Adelaide, Melbourne, Brisbane Domestic ❌\n');
  console.log('='.repeat(60));

  const allData: any[] = [];

  for (const name of airportNames) {
    console.log(`\n📍 ${name}\n`);

    const { data, error } = await supabase
      .from('mosques_cache')
      .select('*')
      .eq('name', name)
      .single();

    if (error || !data) {
      console.log('   ❌ NOT FOUND\n');
      continue;
    }

    allData.push(data);

    const working = name === 'Prayer Room (BNE International Terminal)';

    console.log(`   Status: ${working ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`\n   Core Fields:`);
    console.log(`   - ID: ${data.id}`);
    console.log(`   - Name: ${data.name}`);
    console.log(`   - Address: ${data.formatted_address || data.address}`);
    console.log(`   - Suburb: ${data.suburb || 'NULL'}`);
    console.log(`   - State: ${data.state || 'NULL'}`);
    console.log(`   - Postcode: ${data.postcode || 'NULL'}`);

    console.log(`\n   Location Data:`);
    console.log(`   - Latitude: ${data.latitude || 'NULL'}`);
    console.log(`   - Longitude: ${data.longitude || 'NULL'}`);
    console.log(`   - Location (PostGIS): ${data.location ? 'SET ✅' : 'NULL ❌'}`);

    console.log(`\n   Status Flags:`);
    console.log(`   - is_active: ${data.is_active} ${data.is_active ? '✅' : '❌'}`);
    console.log(`   - is_verified: ${data.is_verified}`);

    console.log(`\n   Google Data:`);
    console.log(`   - google_place_id: ${data.google_place_id}`);
    console.log(`   - google_rating: ${data.google_rating || 'NULL'}`);
    console.log(`   - google_review_count: ${data.google_review_count || 'NULL'}`);
    console.log(`   - last_fetched_from_google: ${data.last_fetched_from_google || 'NULL'}`);

    console.log(`\n   Other Fields:`);
    console.log(`   - phone_number: ${data.phone_number || 'NULL'}`);
    console.log(`   - website: ${data.website || 'NULL'}`);
    console.log(`   - opening_hours: ${data.opening_hours ? 'SET' : 'NULL'}`);
    console.log(`   - place_types: ${data.place_types?.length > 0 ? data.place_types.join(', ') : 'NULL'}`);
    console.log(`   - business_status: ${data.business_status || 'NULL'}`);
    console.log('');
  }

  // Find differences
  console.log('='.repeat(60));
  console.log('\n🔬 DIFFERENCES ANALYSIS\n');

  const working = allData.find(d => d.name === 'Prayer Room (BNE International Terminal)');
  const notWorking = allData.filter(d => d.name !== 'Prayer Room (BNE International Terminal)');

  if (!working) {
    console.log('❌ Could not find working example for comparison\n');
    return;
  }

  console.log('Comparing Brisbane International (working) vs others:\n');

  const fieldsToCheck = [
    'is_active',
    'is_verified',
    'google_place_id',
    'google_rating',
    'google_review_count',
    'last_fetched_from_google',
    'phone_number',
    'website',
    'opening_hours',
    'place_types',
    'business_status',
    'data_quality_score',
    'fetch_count'
  ];

  const differences: any = {};

  for (const field of fieldsToCheck) {
    const workingValue = working[field];
    const notWorkingValues = notWorking.map(d => d[field]);

    const allSame = notWorkingValues.every(v => {
      if (Array.isArray(v) && Array.isArray(workingValue)) {
        return JSON.stringify(v) === JSON.stringify(workingValue);
      }
      return v === workingValue;
    });

    if (!allSame) {
      differences[field] = {
        working: workingValue,
        notWorking: notWorkingValues
      };
    }
  }

  if (Object.keys(differences).length === 0) {
    console.log('✅ No differences found in standard fields\n');
    console.log('⚠️ The issue might be in the search query or frontend filtering\n');
  } else {
    console.log('🔍 Differences found:\n');
    for (const [field, values] of Object.entries(differences)) {
      console.log(`   ${field}:`);
      console.log(`   - Working (Brisbane Int): ${JSON.stringify(values.working)}`);
      console.log(`   - Not Working: ${JSON.stringify(values.notWorking)}\n`);
    }
  }

  // Check if the issue is is_active
  const inactiveCount = notWorking.filter(d => !d.is_active).length;
  if (inactiveCount > 0) {
    console.log('='.repeat(60));
    console.log('\n⚠️ CRITICAL ISSUE FOUND!\n');
    console.log(`${inactiveCount} airport(s) have is_active = false\n`);
    console.log('The search likely filters out inactive entries.\n');
    console.log('Fixing now...\n');

    for (const airport of notWorking) {
      if (!airport.is_active) {
        const { error: updateError } = await supabase
          .from('mosques_cache')
          .update({ is_active: true })
          .eq('id', airport.id);

        if (updateError) {
          console.log(`❌ Failed to activate ${airport.name}:`, updateError.message);
        } else {
          console.log(`✅ Activated: ${airport.name}`);
        }
      }
    }
  }

  // Check manual place IDs
  console.log('\n='.repeat(60));
  console.log('\n🆔 GOOGLE PLACE IDs CHECK\n');

  for (const airport of allData) {
    const isManual = airport.google_place_id?.startsWith('MANUAL_');
    const working = airport.name === 'Prayer Room (BNE International Terminal)';

    console.log(`${working ? '✅' : '❌'} ${airport.name}`);
    console.log(`   Place ID: ${airport.google_place_id}`);
    console.log(`   Type: ${isManual ? 'MANUAL (⚠️ not a real Google Place)' : 'Real Google Place ID'}\n`);
  }

  console.log('='.repeat(60));
  console.log('\n💡 RECOMMENDATION\n');

  const manualCount = notWorking.filter(d => d.google_place_id?.startsWith('MANUAL_')).length;

  if (manualCount > 0) {
    console.log(`⚠️ ${manualCount} airport(s) have MANUAL place IDs (not real Google Places)\n`);
    console.log('This might cause issues if your search function:');
    console.log('- Validates against Google Places API');
    console.log('- Filters out entries without valid Google data');
    console.log('- Requires certain Google-specific fields\n');
    console.log('Consider either:');
    console.log('1. Finding the real Google Place IDs for these airports');
    console.log('2. Modifying your search to accept manual entries\n');
  }

  console.log('='.repeat(60));
  console.log('\n');
}

investigateAirportSearchFiltering().catch(console.error);
