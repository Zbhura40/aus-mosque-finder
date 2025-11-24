import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function addReviewsColumn() {
  console.log('Adding reviews column to mosques_cache table...\n');

  const sql = fs.readFileSync('supabase/migrations/20251122_add_reviews_column.sql', 'utf-8');

  const { data, error } = await supabase.rpc('exec_sql' as any, { sql });

  if (error) {
    // Try alternative approach: use raw query
    const lines = sql.split(';').filter(line => line.trim());

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('--')) continue;

      console.log('Executing:', line.trim().substring(0, 50) + '...');

      const { error: queryError } = await supabase.rpc('exec_sql' as any, {
        query: line.trim() + ';'
      });

      if (queryError && !queryError.message?.includes('already exists')) {
        console.error('Error:', queryError);
      } else {
        console.log('✓ Success');
      }
    }
  } else {
    console.log('✓ Reviews column added successfully!');
  }

  console.log('\nVerifying column was added...');

  const { data: testData, error: testError } = await supabase
    .from('mosques_cache')
    .select('id, name, reviews')
    .limit(1);

  if (testError) {
    console.error('❌ Column verification failed:', testError);
  } else {
    console.log('✓ Column verified successfully!');
    console.log('Sample row:', testData);
  }
}

addReviewsColumn();
