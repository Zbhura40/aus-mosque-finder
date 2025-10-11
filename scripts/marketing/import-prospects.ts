/**
 * Import Marketing Prospects
 *
 * Imports mosque data from Google Maps JSON into marketing_prospects table
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SECRET_KEY');
    process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

interface GoogleMapsMosque {
    title: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    phone?: string;
    website?: string;
    url: string;
    placeId: string;
    categories: string[];
    state: string;
    suburb: string;
}

interface MarketingProspect {
    name: string;
    address: string;
    state: string;
    suburb: string;
    latitude: number;
    longitude: number;
    phone: string | null;
    website: string | null;
    google_place_id: string;
    google_maps_url: string;
    categories: string[];
    extraction_status: string;
}

async function importProspects() {
    console.log('🚀 Starting mosque import to marketing_prospects table...\n');

    try {
        // Read JSON file
        const jsonPath = join(__dirname, '../apify/data/raw/gmaps-results.json');
        const jsonData = readFileSync(jsonPath, 'utf-8');
        const mosques: GoogleMapsMosque[] = JSON.parse(jsonData);

        console.log(`📄 Loaded ${mosques.length} mosques from gmaps-results.json\n`);

        // Transform data
        const prospects: MarketingProspect[] = mosques.map(mosque => ({
            name: mosque.title,
            address: mosque.address,
            state: mosque.state || 'Unknown',
            suburb: mosque.suburb || '',
            latitude: mosque.location.lat,
            longitude: mosque.location.lng,
            phone: mosque.phone || null,
            website: mosque.website || null,
            google_place_id: mosque.placeId,
            google_maps_url: mosque.url,
            categories: mosque.categories,
            extraction_status: mosque.website ? 'pending' : 'no_website'
        }));

        // Count statistics
        const withWebsite = prospects.filter(p => p.website).length;
        const withPhone = prospects.filter(p => p.phone).length;
        const stateBreakdown = prospects.reduce((acc, p) => {
            acc[p.state] = (acc[p.state] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log('📊 Import Statistics:');
        console.log(`   Total mosques: ${prospects.length}`);
        console.log(`   With website: ${withWebsite} (${((withWebsite / prospects.length) * 100).toFixed(1)}%)`);
        console.log(`   With phone: ${withPhone} (${((withPhone / prospects.length) * 100).toFixed(1)}%)`);
        console.log('\n   By state:');
        Object.entries(stateBreakdown)
            .sort((a, b) => b[1] - a[1])
            .forEach(([state, count]) => {
                console.log(`   - ${state}: ${count}`);
            });
        console.log();

        // Check if table exists and is empty
        console.log('🔍 Checking marketing_prospects table...');
        const { count, error: countError } = await supabase
            .from('marketing_prospects')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error: marketing_prospects table not found!');
            console.error('   Message:', countError.message);
            console.log('\n💡 Please run the migration first:');
            console.log('   1. Open Supabase Dashboard → SQL Editor');
            console.log('   2. Copy SQL from: supabase/migrations/20251011_create_marketing_prospects_table.sql');
            console.log('   3. Paste and run the SQL');
            console.log('   4. Run this script again\n');
            process.exit(1);
        }

        console.log(`✅ Table exists with ${count} records\n`);

        if (count && count > 0) {
            console.log('⚠️  Table contains existing data');
            console.log(`   Current records: ${count}`);
            console.log('   Will use UPSERT to add missing records\n');
        }

        // Import in batches (Supabase limit is 1000 per batch)
        const BATCH_SIZE = 100;
        let imported = 0;
        let failed = 0;

        console.log('⏳ Importing mosques...');

        for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
            const batch = prospects.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(prospects.length / BATCH_SIZE);

            process.stdout.write(`   Batch ${batchNum}/${totalBatches}: Importing ${batch.length} records... `);

            const { data, error } = await supabase
                .from('marketing_prospects')
                .upsert(batch, {
                    onConflict: 'google_place_id',
                    ignoreDuplicates: true
                })
                .select('id');

            if (error) {
                console.log('❌ Failed');
                console.error('   Error:', error.message);
                failed += batch.length;
            } else {
                console.log('✅ Success');
                imported += batch.length;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log();
        console.log('📊 Import Results:');
        console.log(`   ✅ Successfully imported: ${imported}`);
        if (failed > 0) {
            console.log(`   ❌ Failed: ${failed}`);
        }
        console.log();

        // Verify final count
        const { count: finalCount } = await supabase
            .from('marketing_prospects')
            .select('*', { count: 'exact', head: true });

        console.log('✅ Import complete!');
        console.log(`📊 Total records in database: ${finalCount}\n`);

        // Show extraction statistics
        const { data: stats } = await supabase.rpc('get_extraction_stats');

        if (stats && stats.length > 0) {
            const s = stats[0];
            console.log('🎯 Next Steps:');
            console.log(`   - Pending extraction: ${s.pending_extraction} mosques with websites`);
            console.log(`   - Ready to scrape: ${s.with_website} websites`);
            console.log(`   - Run: npm run scrape-emails\n`);
        }

    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

// Run import
importProspects();
