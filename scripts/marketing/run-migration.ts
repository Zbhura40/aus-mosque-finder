/**
 * Run Database Migration
 *
 * Applies the marketing_prospects table migration to Supabase
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

async function runMigration() {
    console.log('🚀 Starting database migration...\n');

    try {
        // Read migration file
        const migrationPath = join(__dirname, '../../supabase/migrations/20251011_create_marketing_prospects_table.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf-8');

        console.log('📄 Migration file loaded successfully');
        console.log(`📦 File size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

        // Execute migration
        console.log('⏳ Executing migration...');

        const { error } = await supabase.rpc('exec_sql', {
            sql_query: migrationSQL
        });

        if (error) {
            // If exec_sql function doesn't exist, try direct execution
            // Split into individual statements and execute them
            console.log('⚠️  exec_sql not available, trying direct execution...\n');

            // Split SQL into statements (basic split by semicolon)
            const statements = migrationSQL
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement) {
                    try {
                        const { error: stmtError } = await supabase.rpc('exec_sql', {
                            sql_query: statement + ';'
                        });

                        if (stmtError) {
                            console.error(`❌ Error on statement ${i + 1}/${statements.length}:`);
                            console.error(stmtError);
                        } else {
                            console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
                        }
                    } catch (e) {
                        console.error(`❌ Exception on statement ${i + 1}:`, e);
                    }
                }
            }
        } else {
            console.log('✅ Migration executed successfully!\n');
        }

        // Verify table was created
        console.log('🔍 Verifying table creation...');
        const { count, error: countError } = await supabase
            .from('marketing_prospects')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error verifying table:', countError.message);
            console.log('\n⚠️  Migration may need to be run manually in Supabase SQL Editor');
            console.log('📝 Copy the SQL from: supabase/migrations/20251011_create_marketing_prospects_table.sql');
            process.exit(1);
        }

        console.log('✅ Table created successfully!');
        console.log(`📊 Current record count: ${count}\n`);

        console.log('✨ Migration complete!');
        console.log('🎯 Next step: Import mosque data from JSON');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.log('\n💡 Manual migration required:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Open: supabase/migrations/20251011_create_marketing_prospects_table.sql');
        console.log('3. Copy and paste the SQL');
        console.log('4. Click "Run"');
        process.exit(1);
    }
}

// Run migration
runMigration();
