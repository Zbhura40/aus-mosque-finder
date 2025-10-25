import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; // Use secret key for accessing private table

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmailCount() {
  console.log('📧 Checking email extraction status...\n');

  // Get total mosques with emails
  const { data: emailData, error: emailError } = await supabase
    .from('mosques_emails')
    .select('name, email_primary, email_secondary, email_tertiary, source, state, email_verified, website');

  if (emailError) {
    console.error('❌ Error fetching email data:', emailError);
    return;
  }

  const totalWithEmails = emailData?.length || 0;
  console.log(`📊 Total mosques with contact info: ${totalWithEmails}`);

  // Count emails by type
  const withPrimary = emailData?.filter(m => m.email_primary).length || 0;
  const withSecondary = emailData?.filter(m => m.email_secondary).length || 0;
  const withTertiary = emailData?.filter(m => m.email_tertiary).length || 0;
  const verified = emailData?.filter(m => m.email_verified).length || 0;

  console.log('\n📧 Email breakdown:');
  console.log(`   Primary emails: ${withPrimary}`);
  console.log(`   Secondary emails: ${withSecondary}`);
  console.log(`   Tertiary emails: ${withTertiary}`);
  console.log(`   ✅ Verified emails: ${verified}`);

  // Count by source (extraction method)
  const sourceCounts: Record<string, number> = {};
  emailData?.forEach((record) => {
    const source = record.source || 'Unknown';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  console.log('\n🔍 Breakdown by source:');
  Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`   ${source}: ${count} mosques`);
    });

  // Count by state
  const stateCounts: Record<string, number> = {};
  emailData?.forEach((record) => {
    const state = record.state || 'Unknown';
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  console.log('\n📍 Breakdown by state:');
  Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([state, count]) => {
      console.log(`   ${state}: ${count} mosques`);
    });

  // Get total mosques from cache
  const { count: totalMosques, error: mosqueError } = await supabase
    .from('mosques_cache')
    .select('*', { count: 'exact', head: true });

  if (!mosqueError && totalMosques !== null) {
    const percentage = ((totalWithEmails / totalMosques) * 100).toFixed(1);
    console.log(`\n📈 Coverage: ${totalWithEmails}/${totalMosques} mosques (${percentage}%)`);
    console.log(`❌ Missing contact info: ${totalMosques - totalWithEmails} mosques`);
  }

  // Show some sample emails (first 5)
  if (emailData && emailData.length > 0) {
    console.log('\n📝 Sample mosques with emails (first 5):');
    emailData.slice(0, 5).forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.name}`);
      console.log(`      Primary: ${record.email_primary || 'N/A'}`);
      if (record.email_secondary) console.log(`      Secondary: ${record.email_secondary}`);
      console.log(`      Source: ${record.source} | Verified: ${record.email_verified ? '✅' : '❌'}`);
      console.log('');
    });
  }

  console.log('✅ Check complete!');
}

checkEmailCount().catch(console.error);
