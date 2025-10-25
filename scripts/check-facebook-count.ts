import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function checkFacebookCount() {
  const { count } = await supabase
    .from('marketing_prospects')
    .select('*', { count: 'exact', head: true })
    .not('facebook', 'is', null);

  console.log(`Mosques with Facebook pages: ${count}`);
}

checkFacebookCount().catch(console.error);
