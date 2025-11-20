import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseEntries() {
  const ids = [
    '9cad4e2a-1055-4a94-b216-f1ca1ed45add', // Entry 1
    'be942660-a683-469c-80df-014acac8a4ec'  // Entry 2
  ];

  console.log('🔍 CHECKING DATABASE ENTRIES FOR MASJID AL RAHMAN GOSNELLS\n');
  console.log('='.repeat(80));

  for (const id of ids) {
    const { data, error } = await supabase
      .from('mosques_cache')
      .select('id, name, place_id, created_at, last_fetched_from_google, rating, user_ratings_total')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`❌ Error fetching ${id}:`, error);
      continue;
    }

    console.log(`\n📍 Entry ID: ${id}`);
    console.log(`   Place ID: ${data.place_id}`);
    console.log(`   Created: ${data.created_at}`);
    console.log(`   Last Updated: ${data.last_fetched_from_google}`);
    console.log(`   Rating: ${data.rating || 'N/A'} (${data.user_ratings_total || 0} reviews)`);
    console.log('   ' + '-'.repeat(76));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 RECOMMENDATION:');
  console.log('   Keep the OLDER entry (created first)');
  console.log('   Delete the newer duplicate\n');
}

checkDatabaseEntries();
