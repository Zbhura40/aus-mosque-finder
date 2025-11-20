import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface AirportInfo {
  name: string;
  expectedSuburb: string;
  expectedPostcode: string;
  expectedLat?: number;
  expectedLng?: number;
}

const airports: AirportInfo[] = [
  {
    name: 'Adelaide Airport Prayer Room',
    expectedSuburb: 'Adelaide Airport',
    expectedPostcode: '5950',
    expectedLat: -34.945,
    expectedLng: 138.5306
  },
  {
    name: 'Melbourne Airport Prayer Room',
    expectedSuburb: 'Melbourne Airport',
    expectedPostcode: '3045',
    expectedLat: -37.6733,
    expectedLng: 144.8433
  },
  {
    name: 'Brisbane Domestic Airport Prayer Room',
    expectedSuburb: 'Brisbane Airport',
    expectedPostcode: '4008',
    expectedLat: -27.3942,
    expectedLng: 153.1218
  },
  {
    name: 'Prayer Room (BNE International Terminal)',
    expectedSuburb: 'Brisbane Airport',
    expectedPostcode: '4008',
    expectedLat: -27.3942,
    expectedLng: 153.1218
  }
];

async function checkAllAirportPrayerRooms() {
  console.log('🔍 CHECKING ALL AIRPORT PRAYER ROOMS\n');
  console.log('='.repeat(60));

  const issuesFound: any[] = [];
  const sqlUpdates: string[] = [];

  for (const airport of airports) {
    console.log(`\n📍 ${airport.name}\n`);

    const { data, error } = await supabase
      .from('mosques_cache')
      .select('*')
      .eq('name', airport.name)
      .maybeSingle();

    if (error || !data) {
      console.log(`   ❌ NOT FOUND in database\n`);
      issuesFound.push({
        name: airport.name,
        issue: 'NOT FOUND'
      });
      continue;
    }

    console.log(`   ✅ Found in database`);
    console.log(`   ID: ${data.id}`);
    console.log(`   Suburb: ${data.suburb || 'NULL ❌'} (expected: ${airport.expectedSuburb})`);
    console.log(`   Postcode: ${data.postcode || 'NULL ❌'} (expected: ${airport.expectedPostcode})`);
    console.log(`   Latitude: ${data.latitude || 'NULL ❌'}`);
    console.log(`   Longitude: ${data.longitude || 'NULL ❌'}`);
    console.log(`   Location (PostGIS): ${data.location ? '✅ SET' : 'NULL ❌'}`);

    // Check for issues
    const issues: string[] = [];
    const updates: any = {};

    if (!data.suburb || data.suburb !== airport.expectedSuburb) {
      issues.push('Suburb incorrect/missing');
      updates.suburb = airport.expectedSuburb;
    }

    if (!data.postcode || data.postcode !== airport.expectedPostcode) {
      issues.push('Postcode incorrect/missing');
      updates.postcode = airport.expectedPostcode;
    }

    if (!data.latitude || !data.longitude) {
      issues.push('Coordinates missing');
      if (airport.expectedLat && airport.expectedLng) {
        updates.latitude = airport.expectedLat;
        updates.longitude = airport.expectedLng;
      }
    }

    if (!data.location) {
      issues.push('PostGIS location missing');
    }

    if (issues.length > 0) {
      console.log(`\n   ⚠️ Issues: ${issues.join(', ')}\n`);
      issuesFound.push({
        name: airport.name,
        id: data.id,
        issues,
        updates,
        currentLat: data.latitude,
        currentLng: data.longitude
      });
    } else {
      console.log(`\n   ✅ All data correct!\n`);
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 SUMMARY\n');

  if (issuesFound.length === 0) {
    console.log('✅ All airport prayer rooms have correct location data!\n');
    return;
  }

  console.log(`Found issues in ${issuesFound.length} airport prayer room(s):\n`);

  for (const issue of issuesFound) {
    if (issue.issue === 'NOT FOUND') {
      console.log(`❌ ${issue.name}: NOT FOUND IN DATABASE\n`);
      continue;
    }

    console.log(`📍 ${issue.name}`);
    console.log(`   Issues: ${issue.issues.join(', ')}`);
    console.log(`   ID: ${issue.id}\n`);

    // Apply updates if needed
    if (Object.keys(issue.updates).length > 0) {
      console.log(`   🔧 Applying updates...`);

      const { error: updateError } = await supabase
        .from('mosques_cache')
        .update(issue.updates)
        .eq('id', issue.id);

      if (updateError) {
        console.log(`   ❌ Update failed:`, updateError.message);
      } else {
        console.log(`   ✅ Updated: ${Object.keys(issue.updates).join(', ')}`);
      }
    }

    // Generate SQL for PostGIS location
    if (issue.issues.includes('PostGIS location missing')) {
      const lat = issue.updates.latitude || issue.currentLat;
      const lng = issue.updates.longitude || issue.currentLng;

      if (lat && lng) {
        const sql = `-- ${issue.name}\nUPDATE mosques_cache\nSET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)\nWHERE id = '${issue.id}';\n`;
        sqlUpdates.push(sql);
      }
    }

    console.log('');
  }

  // Create SQL migration file
  if (sqlUpdates.length > 0) {
    console.log('='.repeat(60));
    console.log('\n📝 Creating SQL migration file...\n');

    const migrationSQL = `-- Fix Airport Prayer Rooms - PostGIS Location Points
-- Run this in Supabase SQL Editor

${sqlUpdates.join('\n')}

-- Verify all updates
SELECT
  name,
  suburb,
  postcode,
  latitude,
  longitude,
  ST_AsText(location) as location_text
FROM mosques_cache
WHERE name IN (
  'Adelaide Airport Prayer Room',
  'Melbourne Airport Prayer Room',
  'Brisbane Domestic Airport Prayer Room',
  'Prayer Room (BNE International Terminal)'
)
ORDER BY name;
`;

    writeFileSync('/Users/zubairbhura/Work/findmymosque/fix-all-airport-locations.sql', migrationSQL);

    console.log('✅ SQL migration created: fix-all-airport-locations.sql\n');
    console.log('To complete the fix, run this SQL in Supabase SQL Editor:\n');
    console.log('---');
    console.log(migrationSQL);
    console.log('---\n');
  }

  console.log('='.repeat(60));
  console.log('\n');
}

checkAllAirportPrayerRooms().catch(console.error);
