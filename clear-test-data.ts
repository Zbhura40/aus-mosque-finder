// Clear test mosque data from cache
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearTestData() {
  console.log('🧹 Clearing test data from mosques_cache...\n');

  // Delete the test mosque
  const { error: deleteError } = await supabase
    .from('mosques_cache')
    .delete()
    .eq('google_place_id', 'TEST_PLACE_ID_001');

  if (deleteError) {
    console.error('❌ Error deleting test data:', deleteError);
    return;
  }

  console.log('✅ Test data cleared!');
  console.log('Now run the comprehensive test again for accurate results.\n');
}

clearTestData();
