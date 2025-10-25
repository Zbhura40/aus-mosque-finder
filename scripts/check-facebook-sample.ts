import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function checkFacebook() {
  // Get sample records to see what's in facebook column
  const { data, error } = await supabase
    .from('marketing_prospects')
    .select('name, facebook, website')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample records:\n');
  data?.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   Facebook: ${m.facebook || 'NULL'}`);
    console.log(`   Website: ${m.website || 'NULL'}`);
    console.log('');
  });

  // Check if any have facebook
  const withFacebook = data?.filter(m => m.facebook && m.facebook !== null);
  console.log(`Records with Facebook in sample: ${withFacebook?.length || 0}/10`);
}

checkFacebook().catch(console.error);
