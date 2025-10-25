import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!; // Use secret key for accessing private table

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMarketingProspects() {
  console.log('🔍 Checking marketing_prospects table...\n');

  // Get all records
  const { data: prospects, error: prospectsError } = await supabase
    .from('marketing_prospects')
    .select('*');

  if (prospectsError) {
    console.error('❌ Error fetching prospects:', prospectsError);
    return;
  }

  const total = prospects?.length || 0;
  console.log(`📊 Total records in marketing_prospects: ${total}`);

  if (total === 0) {
    console.log('\n⚠️  No data found in marketing_prospects table');
    return;
  }

  // Analyze the data
  const withEmail = prospects?.filter(p => p.email_primary).length || 0;
  const withPhone = prospects?.filter(p => p.phone).length || 0;
  const withWebsite = prospects?.filter(p => p.website).length || 0;
  const withFacebook = prospects?.filter(p => p.facebook).length || 0;

  console.log('\n📧 Contact information breakdown:');
  console.log(`   With emails: ${withEmail}`);
  console.log(`   With phone numbers: ${withPhone}`);
  console.log(`   With websites: ${withWebsite}`);
  console.log(`   With Facebook: ${withFacebook}`);

  // Count by state
  const stateCounts: Record<string, number> = {};
  prospects?.forEach((prospect) => {
    const state = prospect.state || 'Unknown';
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  console.log('\n📍 Breakdown by state:');
  Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([state, count]) => {
      console.log(`   ${state}: ${count} mosques`);
    });

  // Show sample records with emails
  const withEmails = prospects?.filter(p => p.email_primary) || [];
  if (withEmails.length > 0) {
    console.log('\n📝 Sample mosques with emails (first 5):');
    withEmails.slice(0, 5).forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.name}`);
      console.log(`      Email: ${record.email_primary}`);
      if (record.email_secondary) console.log(`      Email 2: ${record.email_secondary}`);
      if (record.email_tertiary) console.log(`      Email 3: ${record.email_tertiary}`);
      console.log(`      Phone: ${record.phone || 'N/A'}`);
      console.log(`      Website: ${record.website || 'N/A'}`);
      console.log(`      State: ${record.state || 'Unknown'}`);
      console.log('');
    });
  }

  // Show sample records with websites but no email
  const withWebsiteNoEmail = prospects?.filter(p => p.website && !p.email_primary) || [];
  if (withWebsiteNoEmail.length > 0) {
    console.log(`\n🌐 Mosques with websites but NO email: ${withWebsiteNoEmail.length}`);
    console.log('Sample (first 3):');
    withWebsiteNoEmail.slice(0, 3).forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.name}`);
      console.log(`      Website: ${record.website}`);
      console.log(`      State: ${record.state || 'Unknown'}`);
      console.log('');
    });
  }

  // Check for Google Place IDs
  const withPlaceId = prospects?.filter(p => p.google_place_id).length || 0;
  console.log(`\n🗺️  Records with Google Place IDs: ${withPlaceId}`);

  // Check table structure (show first record's keys)
  if (prospects && prospects.length > 0) {
    console.log('\n📋 Table columns:');
    Object.keys(prospects[0]).forEach(key => {
      console.log(`   - ${key}`);
    });
  }

  console.log('\n✅ Check complete!');
}

checkMarketingProspects().catch(console.error);
