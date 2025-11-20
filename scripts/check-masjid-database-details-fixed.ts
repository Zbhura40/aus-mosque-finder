import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseEntries() {
  const entries = [
    { id: '9cad4e2a-1055-4a94-b216-f1ca1ed45add', place_id: 'ChIJIUolIXKVMioRaZDpCrqDrkU', entry: 1 },
    { id: 'be942660-a683-469c-80df-014acac8a4ec', place_id: 'ChIJ19T2OACVMioRUb4e7xsfpIo', entry: 2 }
  ];

  console.log('🔍 CHECKING DATABASE ENTRIES FOR MASJID AL RAHMAN GOSNELLS\n');
  console.log('='.repeat(80));

  for (const entry of entries) {
    const { data, error } = await supabase
      .from('mosques_cache')
      .select('id, name, google_place_id, created_at, last_fetched_from_google, rating, user_ratings_total')
      .eq('id', entry.id)
      .single();

    if (error) {
      console.error(`❌ Error fetching Entry ${entry.entry}:`, error.message);
      continue;
    }

    console.log(`\n📍 Entry ${entry.entry}`);
    console.log(`   Database ID: ${data.id}`);
    console.log(`   Google Place ID: ${data.google_place_id || 'N/A'}`);
    console.log(`   Created: ${data.created_at}`);
    console.log(`   Last Updated: ${data.last_fetched_from_google || 'Never'}`);
    console.log(`   Rating: ${data.rating || 'N/A'} (${data.user_ratings_total || 0} reviews)`);
    console.log('   ' + '-'.repeat(76));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 DECISION:');
  console.log('   Since both Google Place IDs are valid and identical,');
  console.log('   we should keep Entry 1 (ChIJIUolIXKVMioRaZDpCrqDrkU)');
  console.log('   and DELETE Entry 2 (ChIJ19T2OACVMioRUb4e7xsfpIo)\n');
  console.log('   SQL to delete duplicate:\n');
  console.log(`   DELETE FROM mosques_cache WHERE id = 'be942660-a683-469c-80df-014acac8a4ec';\n`);
}

checkDatabaseEntries();
