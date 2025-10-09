import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const sql = readFileSync('./supabase/migrations/20251010_create_cache_query_function.sql', 'utf-8');

    console.log('Running migration: 20251010_create_cache_query_function.sql');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Migration error:', error);

      // Try direct execution
      console.log('Trying direct execution via REST API...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('REST API error:', errorText);
        process.exit(1);
      }

      console.log('Migration successful via REST API!');
    } else {
      console.log('Migration successful!');
      console.log('Result:', data);
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

runMigration();
