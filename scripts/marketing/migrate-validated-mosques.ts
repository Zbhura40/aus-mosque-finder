/**
 * Migrate Validated Mosques to Public Cache
 *
 * Migrates only the validated mosques from marketing_prospects to mosques_cache
 * Uses validation results to skip invalid/closed mosques
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('Required: VITE_SUPABASE_URL, SUPABASE_SECRET_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface ValidationResult {
    google_place_id: string;
    name: string;
    is_valid: boolean;
    error_reason?: string;
}

async function migrateMosques() {
    console.log('🚀 Starting migration of validated mosques...\n');

    try {
        // Load validation results
        console.log('📄 Loading validation results...');
        const validationPath = '/Users/zubairbhura/Work/findmymosque/scripts/marketing/validation-results.json';
        const validationData = JSON.parse(readFileSync(validationPath, 'utf-8')) as ValidationResult[];

        const validPlaceIds = validationData
            .filter(v => v.is_valid)
            .map(v => v.google_place_id);

        const invalidMosques = validationData.filter(v => !v.is_valid);

        console.log(`✅ Loaded ${validPlaceIds.length} valid place IDs`);
        console.log(`❌ Skipping ${invalidMosques.length} invalid mosques:\n`);

        invalidMosques.forEach(m => {
            console.log(`   - ${m.name}: ${m.error_reason}`);
        });
        console.log();

        // Get current cache count
        const { count: cacheBefore, error: countError } = await supabase
            .from('mosques_cache')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error checking mosques_cache:', countError);
            process.exit(1);
        }

        console.log(`📊 Current mosques_cache count: ${cacheBefore}`);

        // Fetch all valid mosques from marketing_prospects
        console.log('📥 Fetching valid mosques from marketing_prospects...');

        const { data: prospects, error: fetchError } = await supabase
            .from('marketing_prospects')
            .select('*')
            .in('google_place_id', validPlaceIds);

        if (fetchError) {
            console.error('❌ Error fetching prospects:', fetchError);
            process.exit(1);
        }

        console.log(`✅ Found ${prospects?.length || 0} valid mosques to migrate\n`);

        if (!prospects || prospects.length === 0) {
            console.log('⚠️  No mosques to migrate');
            process.exit(0);
        }

        // Check for existing place IDs in cache
        const { data: existingCache } = await supabase
            .from('mosques_cache')
            .select('google_place_id');

        const existingPlaceIds = new Set(existingCache?.map(m => m.google_place_id) || []);

        // Filter out duplicates
        const newMosques = prospects.filter(p => !existingPlaceIds.has(p.google_place_id));
        const duplicateCount = prospects.length - newMosques.length;

        console.log(`🔍 Duplicate check:`);
        console.log(`   - Already in cache: ${duplicateCount}`);
        console.log(`   - New to add: ${newMosques.length}\n`);

        if (newMosques.length === 0) {
            console.log('✅ All valid mosques already in cache!');
            console.log(`📊 Total mosques_cache count: ${cacheBefore}\n`);
            process.exit(0);
        }

        // Prepare data for insertion
        const mosquesToInsert = newMosques.map(m => ({
            google_place_id: m.google_place_id,
            name: m.name,
            address: m.address,
            suburb: m.suburb,
            state: m.state,
            phone_number: m.phone,
            website: m.website,
            latitude: m.latitude,
            longitude: m.longitude,
            // Create PostGIS geography point
            location: m.latitude && m.longitude
                ? `SRID=4326;POINT(${m.longitude} ${m.latitude})`
                : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        console.log('⏳ Inserting mosques into mosques_cache...');
        console.log(`   This will add ${mosquesToInsert.length} new mosques\n`);

        // Insert in batches
        const BATCH_SIZE = 50;
        let inserted = 0;
        let failed = 0;

        for (let i = 0; i < mosquesToInsert.length; i += BATCH_SIZE) {
            const batch = mosquesToInsert.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(mosquesToInsert.length / BATCH_SIZE);

            process.stdout.write(`   Batch ${batchNum}/${totalBatches}: Inserting ${batch.length} mosques... `);

            const { error: insertError } = await supabase
                .from('mosques_cache')
                .insert(batch);

            if (insertError) {
                console.log('❌ Failed');
                console.error('      Error:', insertError.message);
                failed += batch.length;
            } else {
                console.log('✅ Success');
                inserted += batch.length;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Get final count
        const { count: cacheAfter } = await supabase
            .from('mosques_cache')
            .select('*', { count: 'exact', head: true });

        console.log();
        console.log('========================================');
        console.log('📊 MIGRATION COMPLETE');
        console.log('========================================');
        console.log(`Before: ${cacheBefore} mosques`);
        console.log(`After: ${cacheAfter} mosques`);
        console.log(`Added: ${inserted} new mosques`);
        if (failed > 0) {
            console.log(`Failed: ${failed} mosques`);
        }
        console.log('========================================\n');

        // State breakdown
        const { data: stateStats } = await supabase
            .from('mosques_cache')
            .select('state');

        if (stateStats) {
            const breakdown = stateStats.reduce((acc, m) => {
                const state = m.state || 'Unknown';
                acc[state] = (acc[state] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            console.log('📍 Mosques by State:');
            Object.entries(breakdown)
                .sort((a, b) => b[1] - a[1])
                .forEach(([state, count]) => {
                    console.log(`   ${state}: ${count}`);
                });
            console.log();
        }

        console.log('✅ Migration successful!');
        console.log(`🎯 Your site now displays ${cacheAfter}+ mosques\n`);
        console.log('📝 Next steps:');
        console.log('   1. Update SEO tags to show new mosque count');
        console.log('   2. Test the site to ensure all mosques display correctly');
        console.log('   3. Deploy changes to production\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateMosques();
