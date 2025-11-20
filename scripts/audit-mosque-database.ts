import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditMosqueDatabase() {
  console.log('🔍 COMPREHENSIVE MOSQUE DATABASE AUDIT\n');
  console.log('='.repeat(60));

  const issues: any[] = [];

  // Get all mosques
  const { data: allMosques, error: fetchError } = await supabase
    .from('mosques_cache')
    .select('*')
    .order('name');

  if (fetchError || !allMosques) {
    console.error('❌ Error fetching mosques:', fetchError);
    return;
  }

  console.log(`\n📊 Total mosques in database: ${allMosques.length}\n`);
  console.log('='.repeat(60));

  // ============================================
  // 1. CHECK FOR DUPLICATE ENTRIES
  // ============================================
  console.log('\n1️⃣ CHECKING FOR DUPLICATE ENTRIES\n');

  // Check duplicate names
  const nameMap = new Map<string, any[]>();
  allMosques.forEach(m => {
    const normalizedName = m.name.toLowerCase().trim();
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, []);
    }
    nameMap.get(normalizedName)!.push(m);
  });

  const duplicateNames = Array.from(nameMap.entries())
    .filter(([_, mosques]) => mosques.length > 1);

  if (duplicateNames.length > 0) {
    console.log(`⚠️ Found ${duplicateNames.length} duplicate name(s):\n`);

    duplicateNames.forEach(([name, mosques]) => {
      console.log(`   "${name}" (${mosques.length} entries):`);
      mosques.forEach(m => {
        console.log(`   - ID: ${m.id}`);
        console.log(`     Address: ${m.formatted_address || m.address || 'NULL'}`);
        console.log(`     Place ID: ${m.google_place_id}`);
        console.log(`     State: ${m.state || 'NULL'}\n`);
      });

      issues.push({
        type: 'DUPLICATE_NAME',
        name,
        count: mosques.length,
        entries: mosques.map(m => ({
          id: m.id,
          address: m.formatted_address || m.address,
          place_id: m.google_place_id,
          state: m.state
        }))
      });
    });
  } else {
    console.log('✅ No duplicate names found\n');
  }

  // Check duplicate Google Place IDs
  const placeIdMap = new Map<string, any[]>();
  allMosques.forEach(m => {
    if (!placeIdMap.has(m.google_place_id)) {
      placeIdMap.set(m.google_place_id, []);
    }
    placeIdMap.get(m.google_place_id)!.push(m);
  });

  const duplicatePlaceIds = Array.from(placeIdMap.entries())
    .filter(([_, mosques]) => mosques.length > 1);

  if (duplicatePlaceIds.length > 0) {
    console.log(`⚠️ Found ${duplicatePlaceIds.length} duplicate Google Place ID(s):\n`);

    duplicatePlaceIds.forEach(([placeId, mosques]) => {
      console.log(`   Place ID: ${placeId} (${mosques.length} entries):`);
      mosques.forEach(m => {
        console.log(`   - ${m.name}`);
        console.log(`     ID: ${m.id}`);
        console.log(`     Address: ${m.formatted_address || m.address || 'NULL'}\n`);
      });

      issues.push({
        type: 'DUPLICATE_PLACE_ID',
        place_id: placeId,
        count: mosques.length,
        entries: mosques.map(m => ({
          id: m.id,
          name: m.name,
          address: m.formatted_address || m.address
        }))
      });
    });
  } else {
    console.log('✅ No duplicate Google Place IDs found\n');
  }

  // Check similar addresses (potential duplicates)
  const addressMap = new Map<string, any[]>();
  allMosques.forEach(m => {
    const address = (m.formatted_address || m.address || '').toLowerCase().trim();
    if (address) {
      if (!addressMap.has(address)) {
        addressMap.set(address, []);
      }
      addressMap.get(address)!.push(m);
    }
  });

  const duplicateAddresses = Array.from(addressMap.entries())
    .filter(([_, mosques]) => mosques.length > 1);

  if (duplicateAddresses.length > 0) {
    console.log(`⚠️ Found ${duplicateAddresses.length} duplicate address(es):\n`);

    duplicateAddresses.forEach(([address, mosques]) => {
      console.log(`   Address: ${address} (${mosques.length} entries):`);
      mosques.forEach(m => {
        console.log(`   - ${m.name} (ID: ${m.id})\n`);
      });

      issues.push({
        type: 'DUPLICATE_ADDRESS',
        address,
        count: mosques.length,
        entries: mosques.map(m => ({
          id: m.id,
          name: m.name,
          place_id: m.google_place_id
        }))
      });
    });
  } else {
    console.log('✅ No duplicate addresses found\n');
  }

  // ============================================
  // 2. CHECK FOR MISSING COORDINATES
  // ============================================
  console.log('='.repeat(60));
  console.log('\n2️⃣ CHECKING FOR MISSING COORDINATES\n');

  const missingCoords = allMosques.filter(m =>
    !m.latitude || !m.longitude
  );

  if (missingCoords.length > 0) {
    console.log(`⚠️ Found ${missingCoords.length} mosque(s) missing coordinates:\n`);

    missingCoords.forEach(m => {
      console.log(`   - ${m.name}`);
      console.log(`     ID: ${m.id}`);
      console.log(`     Address: ${m.formatted_address || m.address || 'NULL'}`);
      console.log(`     State: ${m.state || 'NULL'}`);
      console.log(`     Latitude: ${m.latitude || 'NULL'}`);
      console.log(`     Longitude: ${m.longitude || 'NULL'}\n`);

      issues.push({
        type: 'MISSING_COORDINATES',
        id: m.id,
        name: m.name,
        address: m.formatted_address || m.address,
        state: m.state,
        latitude: m.latitude,
        longitude: m.longitude
      });
    });
  } else {
    console.log('✅ All mosques have coordinates\n');
  }

  // ============================================
  // 3. CHECK FOR MISSING POSTGIS LOCATION
  // ============================================
  console.log('='.repeat(60));
  console.log('\n3️⃣ CHECKING FOR MISSING POSTGIS LOCATION POINTS\n');

  const missingPostGIS = allMosques.filter(m => !m.location);

  if (missingPostGIS.length > 0) {
    console.log(`⚠️ Found ${missingPostGIS.length} mosque(s) missing PostGIS location:\n`);

    missingPostGIS.forEach(m => {
      console.log(`   - ${m.name}`);
      console.log(`     ID: ${m.id}`);
      console.log(`     Address: ${m.formatted_address || m.address || 'NULL'}`);
      console.log(`     State: ${m.state || 'NULL'}`);
      console.log(`     Has Coords: ${m.latitude && m.longitude ? 'Yes' : 'No'}`);
      console.log(`     Latitude: ${m.latitude || 'NULL'}`);
      console.log(`     Longitude: ${m.longitude || 'NULL'}\n`);

      issues.push({
        type: 'MISSING_POSTGIS',
        id: m.id,
        name: m.name,
        address: m.formatted_address || m.address,
        state: m.state,
        has_coordinates: !!(m.latitude && m.longitude),
        latitude: m.latitude,
        longitude: m.longitude
      });
    });
  } else {
    console.log('✅ All mosques have PostGIS location points\n');
  }

  // ============================================
  // 4. CHECK FOR MISSING STATE
  // ============================================
  console.log('='.repeat(60));
  console.log('\n4️⃣ CHECKING FOR MISSING STATE\n');

  const missingState = allMosques.filter(m => !m.state || m.state === 'null');

  if (missingState.length > 0) {
    console.log(`⚠️ Found ${missingState.length} mosque(s) missing state:\n`);

    missingState.forEach(m => {
      console.log(`   - ${m.name}`);
      console.log(`     ID: ${m.id}`);
      console.log(`     Address: ${m.formatted_address || m.address || 'NULL'}`);
      console.log(`     State: ${m.state || 'NULL'}\n`);

      issues.push({
        type: 'MISSING_STATE',
        id: m.id,
        name: m.name,
        address: m.formatted_address || m.address,
        state: m.state
      });
    });
  } else {
    console.log('✅ All mosques have state assigned\n');
  }

  // ============================================
  // 5. CHECK FOR INACTIVE MOSQUES
  // ============================================
  console.log('='.repeat(60));
  console.log('\n5️⃣ CHECKING FOR INACTIVE MOSQUES\n');

  const inactiveMosques = allMosques.filter(m => !m.is_active);

  if (inactiveMosques.length > 0) {
    console.log(`ℹ️ Found ${inactiveMosques.length} inactive mosque(s):\n`);

    inactiveMosques.forEach(m => {
      console.log(`   - ${m.name}`);
      console.log(`     ID: ${m.id}`);
      console.log(`     State: ${m.state || 'NULL'}\n`);
    });
  } else {
    console.log('✅ All mosques are active\n');
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('='.repeat(60));
  console.log('\n📋 AUDIT SUMMARY\n');

  const issueTypes = {
    'DUPLICATE_NAME': issues.filter(i => i.type === 'DUPLICATE_NAME').length,
    'DUPLICATE_PLACE_ID': issues.filter(i => i.type === 'DUPLICATE_PLACE_ID').length,
    'DUPLICATE_ADDRESS': issues.filter(i => i.type === 'DUPLICATE_ADDRESS').length,
    'MISSING_COORDINATES': issues.filter(i => i.type === 'MISSING_COORDINATES').length,
    'MISSING_POSTGIS': issues.filter(i => i.type === 'MISSING_POSTGIS').length,
    'MISSING_STATE': issues.filter(i => i.type === 'MISSING_STATE').length
  };

  console.log(`Total Mosques: ${allMosques.length}`);
  console.log(`Total Issues Found: ${issues.length}\n`);

  Object.entries(issueTypes).forEach(([type, count]) => {
    const icon = count > 0 ? '⚠️' : '✅';
    console.log(`${icon} ${type.replace(/_/g, ' ')}: ${count}`);
  });

  if (issues.length === 0) {
    console.log('\n🎉 No issues found! Database is clean.\n');
  } else {
    console.log(`\n⚠️ Found ${issues.length} total issue(s) that need attention.\n`);

    // Create audit report file
    const report = {
      audit_date: new Date().toISOString(),
      total_mosques: allMosques.length,
      total_issues: issues.length,
      issue_summary: issueTypes,
      issues: issues
    };

    writeFileSync(
      '/Users/zubairbhura/Work/findmymosque/mosque-audit-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('📄 Detailed audit report saved to: mosque-audit-report.json\n');
  }

  console.log('='.repeat(60));
  console.log('\n');
}

auditMosqueDatabase().catch(console.error);
