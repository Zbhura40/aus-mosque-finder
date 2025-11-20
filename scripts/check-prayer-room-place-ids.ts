import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlaceIds() {
  console.log('🔍 Checking google_place_id for existing prayer rooms...\n');

  const { data, error } = await supabase
    .from('mosques_cache')
    .select('name, google_place_id, formatted_address')
    .or('name.ilike.%prayer room%,name.ilike.%musalla%')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  data?.forEach((room, idx) => {
    console.log(`${idx + 1}. ${room.name}`);
    console.log(`   google_place_id: ${room.google_place_id}`);
    console.log(`   address: ${room.formatted_address || 'null'}\n`);
  });
}

checkPlaceIds().catch(console.error);
