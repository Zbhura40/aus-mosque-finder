import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function checkSupabaseCron() {
  console.log('\n🔍 Checking Supabase Cron Job Configuration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check if cron jobs are scheduled
    const { data: jobs, error: jobsError } = await supabase
      .rpc('cron_job_list' as any);

    if (jobsError) {
      console.log('⚠️  Unable to query cron.job table directly\n');
      console.log('This requires direct SQL access. Use Supabase Dashboard SQL Editor:\n');
      console.log('```sql');
      console.log('SELECT * FROM cron.job;');
      console.log('```\n');

      // Try alternative: Check edge functions
      console.log('🔍 Alternative: Checking Edge Functions status...\n');
      console.log('1. Go to: Supabase Dashboard → Edge Functions');
      console.log('2. Look for: refresh-cached-mosques');
      console.log('3. Check logs for recent executions\n');
    } else if (jobs) {
      console.log('✅ Cron Jobs Found:\n');
      console.log(JSON.stringify(jobs, null, 2));
    }

  } catch (error: any) {
    console.log('⚠️  Cannot access cron jobs via Supabase client\n');
    console.log('This is normal - cron jobs require direct PostgreSQL access.\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Manual Checks Required:\n');
  console.log('1. **Check if cron job is scheduled:**');
  console.log('   - Go to Supabase Dashboard');
  console.log('   - SQL Editor → New Query');
  console.log('   - Run: SELECT * FROM cron.job;\n');

  console.log('2. **Check if edge function exists:**');
  console.log('   - Edge Functions tab');
  console.log('   - Look for: refresh-cached-mosques\n');

  console.log('3. **Check cron execution history:**');
  console.log('   - SQL Editor → Run:');
  console.log('   ```sql');
  console.log('   SELECT * FROM cron.job_run_details');
  console.log('   ORDER BY start_time DESC');
  console.log('   LIMIT 10;');
  console.log('   ```\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🛠️  If Cron Job is NOT Scheduled:\n');
  console.log('Run this SQL in Supabase Dashboard:\n');
  console.log('```sql');
  console.log("SELECT cron.schedule(");
  console.log("  'weekly-mosque-cache-refresh',");
  console.log("  '0 2 * * 0',  -- Sunday at 2 AM");
  console.log("  $$");
  console.log("  SELECT");
  console.log("    net.http_post(");
  console.log("      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-cached-mosques',");
  console.log("      headers := jsonb_build_object(");
  console.log("        'Content-Type', 'application/json',");
  console.log("        'Authorization', 'Bearer YOUR_ANON_KEY'");
  console.log("      ),");
  console.log("      body := '{}'::jsonb");
  console.log("    );");
  console.log("  $$");
  console.log(");");
  console.log('```\n');

  console.log('Replace:');
  console.log('   - YOUR_PROJECT_REF with your Supabase project ref');
  console.log('   - YOUR_ANON_KEY with your anon key\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Check complete!\n');
}

checkSupabaseCron().catch(console.error);
