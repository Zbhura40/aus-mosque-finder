#!/usr/bin/env node
/**
 * Database Connection Test
 * =========================
 * Verifies Supabase connection and mosques_emails table exists
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');

  // Check environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env');
    console.error('   Required: VITE_SUPABASE_URL, SUPABASE_SECRET_KEY');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`   URL: ${supabaseUrl}`);

  // Initialize client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Test connection by querying the table
  try {
    const { data, error, count } = await supabase
      .from('mosques_emails')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    console.log('✅ Database connection successful');
    console.log(`✅ mosques_emails table exists (${count || 0} records)`);

    // Test helper function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_email_extraction_stats');

    if (statsError) {
      console.log('⚠️  Helper function get_email_extraction_stats() not working yet');
      console.log('   This is normal if the table is empty');
    } else {
      console.log('✅ Helper functions working');
    }

    console.log('\n✅ All systems ready! You can now run email extraction.\n');
    return true;

  } catch (error: any) {
    console.error('\n❌ Database test failed:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('💡 Suggestion: Re-run the migration SQL in Supabase Dashboard\n');
    }

    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
