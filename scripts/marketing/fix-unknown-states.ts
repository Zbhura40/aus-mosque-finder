/**
 * Fix Unknown States in Mosques Cache
 *
 * Extracts state information from address field for mosques with missing state data
 */

import { createClient } from '@supabase/supabase-js';
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

// Australian state/territory codes
const STATE_PATTERNS = [
    { code: 'NSW', pattern: /\bNSW\b/i },
    { code: 'VIC', pattern: /\bVIC\b/i },
    { code: 'QLD', pattern: /\bQLD\b/i },
    { code: 'WA', pattern: /\bWA\b/i },
    { code: 'SA', pattern: /\bSA\b/i },
    { code: 'TAS', pattern: /\bTAS\b/i },
    { code: 'NT', pattern: /\bNT\b/i },
    { code: 'ACT', pattern: /\bACT\b/i },
    // Full names as fallback
    { code: 'NSW', pattern: /New South Wales/i },
    { code: 'VIC', pattern: /Victoria/i },
    { code: 'QLD', pattern: /Queensland/i },
    { code: 'WA', pattern: /Western Australia/i },
    { code: 'SA', pattern: /South Australia/i },
    { code: 'TAS', pattern: /Tasmania/i },
    { code: 'NT', pattern: /Northern Territory/i },
    { code: 'ACT', pattern: /Australian Capital Territory/i }
];

function extractStateFromAddress(address: string): string | null {
    if (!address) return null;

    // Try each pattern
    for (const { code, pattern } of STATE_PATTERNS) {
        if (pattern.test(address)) {
            return code;
        }
    }

    return null;
}

async function fixUnknownStates() {
    console.log('🔧 Fixing unknown states in mosques_cache...\n');

    try {
        // Fetch mosques with unknown/null states
        console.log('📥 Fetching mosques with missing state data...');

        const { data: mosques, error: fetchError } = await supabase
            .from('mosques_cache')
            .select('id, name, address, state')
            .or('state.is.null,state.eq.,state.eq.Unknown');

        if (fetchError) {
            console.error('❌ Error fetching mosques:', fetchError);
            process.exit(1);
        }

        if (!mosques || mosques.length === 0) {
            console.log('✅ No mosques with unknown states found!\n');
            process.exit(0);
        }

        console.log(`📊 Found ${mosques.length} mosques with unknown states\n`);

        // Process each mosque
        const updates: { id: string; name: string; address: string; oldState: string | null; newState: string | null }[] = [];
        let fixed = 0;
        let notFound = 0;

        console.log('🔍 Extracting states from addresses...\n');

        for (const mosque of mosques) {
            const extractedState = extractStateFromAddress(mosque.address);

            if (extractedState) {
                updates.push({
                    id: mosque.id,
                    name: mosque.name,
                    address: mosque.address,
                    oldState: mosque.state,
                    newState: extractedState
                });
                fixed++;
            } else {
                console.log(`⚠️  Could not extract state: ${mosque.name}`);
                console.log(`   Address: ${mosque.address}\n`);
                notFound++;
            }
        }

        console.log('========================================');
        console.log('📊 EXTRACTION RESULTS');
        console.log('========================================');
        console.log(`✅ Successfully extracted: ${fixed}`);
        console.log(`❌ Could not extract: ${notFound}`);
        console.log('========================================\n');

        if (fixed === 0) {
            console.log('⚠️  No states could be extracted. Exiting...\n');
            process.exit(0);
        }

        // Show sample of updates
        console.log('📝 Sample updates (first 10):\n');
        updates.slice(0, 10).forEach(u => {
            console.log(`   ${u.name}`);
            console.log(`   Old: ${u.oldState || 'NULL'} → New: ${u.newState}`);
            console.log(`   Address: ${u.address}\n`);
        });

        if (updates.length > 10) {
            console.log(`   ... and ${updates.length - 10} more\n`);
        }

        // Apply updates
        console.log('⏳ Updating database...\n');

        let updated = 0;
        let failed = 0;

        for (const update of updates) {
            const { error: updateError } = await supabase
                .from('mosques_cache')
                .update({
                    state: update.newState,
                    updated_at: new Date().toISOString()
                })
                .eq('id', update.id);

            if (updateError) {
                console.error(`❌ Failed to update: ${update.name}`);
                console.error(`   Error: ${updateError.message}`);
                failed++;
            } else {
                updated++;
            }
        }

        console.log('========================================');
        console.log('📊 UPDATE RESULTS');
        console.log('========================================');
        console.log(`✅ Successfully updated: ${updated}`);
        if (failed > 0) {
            console.log(`❌ Failed: ${failed}`);
        }
        console.log('========================================\n');

        // Show final state breakdown
        const { data: stateStats } = await supabase
            .from('mosques_cache')
            .select('state');

        if (stateStats) {
            const breakdown = stateStats.reduce((acc, m) => {
                const state = m.state || 'Unknown';
                acc[state] = (acc[state] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            console.log('📍 Final Mosques by State:');
            Object.entries(breakdown)
                .sort((a, b) => b[1] - a[1])
                .forEach(([state, count]) => {
                    console.log(`   ${state}: ${count}`);
                });
            console.log();
        }

        console.log('✅ State fix complete!\n');

    } catch (error) {
        console.error('❌ Process failed:', error);
        process.exit(1);
    }
}

fixUnknownStates();
