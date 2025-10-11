/**
 * Validate Google Place IDs in Marketing Prospects
 *
 * Uses Google Places API to verify that all place IDs in marketing_prospects
 * are valid and still active in Google Maps.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!;
const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_MAPS_API_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('Required: VITE_SUPABASE_URL, SUPABASE_SECRET_KEY, VITE_GOOGLE_MAPS_API_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ValidationResult {
    google_place_id: string;
    name: string;
    is_valid: boolean;
    error_reason?: string;
    google_name?: string;
    types?: string[];
}

async function validatePlaceId(placeId: string): Promise<{ valid: boolean; reason?: string; name?: string; types?: string[] }> {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,types,business_status&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            const result = data.result;

            // Check if it's still operational
            if (result.business_status && result.business_status !== 'OPERATIONAL') {
                return {
                    valid: false,
                    reason: `Business status: ${result.business_status}`,
                    name: result.name,
                    types: result.types
                };
            }

            // Check if it's a mosque/religious place
            const isMosque = result.types?.some((type: string) =>
                ['mosque', 'place_of_worship', 'point_of_interest'].includes(type)
            );

            if (!isMosque) {
                return {
                    valid: false,
                    reason: `Not a mosque (types: ${result.types?.join(', ')})`,
                    name: result.name,
                    types: result.types
                };
            }

            return {
                valid: true,
                name: result.name,
                types: result.types
            };
        } else if (data.status === 'NOT_FOUND') {
            return { valid: false, reason: 'Place ID not found in Google Maps' };
        } else if (data.status === 'ZERO_RESULTS') {
            return { valid: false, reason: 'No results found' };
        } else {
            return { valid: false, reason: `API Error: ${data.status}` };
        }
    } catch (error) {
        return { valid: false, reason: `Network error: ${error}` };
    }
}

async function validateAllProspects() {
    console.log('🔍 Validating mosque place IDs with Google Places API...\n');

    try {
        // Fetch all prospects
        const { data: prospects, error } = await supabase
            .from('marketing_prospects')
            .select('google_place_id, name')
            .order('name');

        if (error) {
            console.error('❌ Error fetching prospects:', error);
            process.exit(1);
        }

        if (!prospects || prospects.length === 0) {
            console.log('⚠️  No prospects found in database');
            process.exit(0);
        }

        console.log(`📊 Found ${prospects.length} mosques to validate`);
        console.log('⏳ This will take a few minutes...\n');

        const results: ValidationResult[] = [];
        let validCount = 0;
        let invalidCount = 0;

        // Validate in batches to avoid rate limiting
        const BATCH_SIZE = 10;
        const DELAY_MS = 1000; // 1 second between batches

        for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
            const batch = prospects.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(prospects.length / BATCH_SIZE);

            process.stdout.write(`📍 Validating batch ${batchNum}/${totalBatches} (${batch.length} mosques)... `);

            const validationPromises = batch.map(async (prospect) => {
                const validation = await validatePlaceId(prospect.google_place_id);
                return {
                    google_place_id: prospect.google_place_id,
                    name: prospect.name,
                    is_valid: validation.valid,
                    error_reason: validation.reason,
                    google_name: validation.name,
                    types: validation.types
                };
            });

            const batchResults = await Promise.all(validationPromises);
            results.push(...batchResults);

            const batchValid = batchResults.filter(r => r.is_valid).length;
            validCount += batchValid;
            invalidCount += batchResults.length - batchValid;

            console.log(`✅ ${batchValid}/${batchResults.length} valid`);

            // Delay between batches to respect rate limits
            if (i + BATCH_SIZE < prospects.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }

        console.log('\n========================================');
        console.log('📊 VALIDATION RESULTS');
        console.log('========================================');
        console.log(`✅ Valid mosques: ${validCount} (${((validCount / prospects.length) * 100).toFixed(1)}%)`);
        console.log(`❌ Invalid mosques: ${invalidCount} (${((invalidCount / prospects.length) * 100).toFixed(1)}%)`);
        console.log('========================================\n');

        // Show invalid mosques if any
        const invalidMosques = results.filter(r => !r.is_valid);
        if (invalidMosques.length > 0) {
            console.log('⚠️  Invalid Mosques:\n');
            invalidMosques.slice(0, 20).forEach((mosque) => {
                console.log(`   ❌ ${mosque.name}`);
                console.log(`      Place ID: ${mosque.google_place_id}`);
                console.log(`      Reason: ${mosque.error_reason}\n`);
            });

            if (invalidMosques.length > 20) {
                console.log(`   ... and ${invalidMosques.length - 20} more\n`);
            }
        }

        // Show summary by state
        console.log('📊 Validation Summary:');
        console.log(`   Total tested: ${prospects.length}`);
        console.log(`   Valid: ${validCount}`);
        console.log(`   Invalid: ${invalidCount}`);
        console.log(`   Success rate: ${((validCount / prospects.length) * 100).toFixed(1)}%\n`);

        // Ask if user wants to proceed with migration
        if (validCount > 0) {
            console.log('✅ RECOMMENDATION:');
            console.log(`   Migrate ${validCount} valid mosques to mosques_cache`);
            console.log(`   Skip ${invalidCount} invalid entries\n`);
        }

        // Save results to file for reference
        const fs = await import('fs');
        const resultsPath = '/Users/zubairbhura/Work/findmymosque/scripts/marketing/validation-results.json';
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`💾 Full validation results saved to: ${resultsPath}\n`);

    } catch (error) {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    }
}

validateAllProspects();
