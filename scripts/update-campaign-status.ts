import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function updateCampaignStatus() {
  console.log('📧 Updating Campaign Status in Supabase\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const today = new Date().toISOString();

  // Mosques contacted via EMAIL
  const emailedMosques = [
    { name: 'Al Madinah Mosque', email: 'info@almadinahmasjid.org.au' },
    { name: 'Artarmon Mosque', email: 'info@aiccentre.org.au' },
  ];

  // Note: Islamic Society of Darra doesn't have email in our database yet
  // We'll add it manually

  console.log('📧 Updating mosques contacted via EMAIL:\n');

  for (const mosque of emailedMosques) {
    const { data, error } = await supabase
      .from('marketing_prospects')
      .update({
        campaign_status: 'email_sent',
        email_sent_date: today,
        last_interaction_date: today,
        notes: 'Email sent - Template 1 (Featured Mosque Partnership)',
        priority: 1, // Mark as high priority for follow-up
        updated_at: today
      })
      .eq('email_primary', mosque.email)
      .select();

    if (error) {
      console.error(`   ❌ Error updating ${mosque.name}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`   ✅ ${mosque.name} - Status updated to "email_sent"`);
    } else {
      console.log(`   ⚠️  ${mosque.name} - Not found in database`);
    }
  }

  // Add Islamic Society of Darra (new mosque not in database)
  console.log('\n📝 Adding Islamic Society of Darra:\n');

  const { data: darraData, error: darraError } = await supabase
    .from('marketing_prospects')
    .select('*')
    .ilike('name', '%Darra%')
    .single();

  if (darraData) {
    // Update existing record with new email
    const { error: updateError } = await supabase
      .from('marketing_prospects')
      .update({
        email_primary: 'secretary@isd.org.au',
        campaign_status: 'email_sent',
        email_sent_date: today,
        last_interaction_date: today,
        notes: 'Email sent - Template 1 (Featured Mosque Partnership)',
        priority: 1,
        extraction_status: 'completed', // Mark as successfully extracted
        updated_at: today
      })
      .eq('id', darraData.id);

    if (updateError) {
      console.error(`   ❌ Error updating Islamic Society of Darra:`, updateError.message);
    } else {
      console.log(`   ✅ Islamic Society of Darra - Email added and status updated`);
    }
  } else {
    console.log(`   ⚠️  Islamic Society of Darra not found - may need manual check`);
  }

  // Mosques to be contacted via PHONE (mark for follow-up)
  console.log('\n📞 Marking mosques for PHONE contact:\n');

  const phoneContactMosques = [
    'Holland Park Mosque',
    'Preston Mosque' // Note: Need to find exact name in database
  ];

  for (const mosqueName of phoneContactMosques) {
    const { data, error } = await supabase
      .from('marketing_prospects')
      .update({
        campaign_status: 'not_contacted', // Still not contacted, but prioritized
        priority: 2, // High priority for phone outreach
        notes: 'Scheduled for phone call + email outreach',
        updated_at: today
      })
      .ilike('name', `%${mosqueName.split(' ')[0]}%${mosqueName.split(' ')[1]}%`)
      .select();

    if (error) {
      console.error(`   ❌ Error updating ${mosqueName}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`   ✅ ${mosqueName} - Marked for phone outreach (Priority 2)`);
      data.forEach(m => console.log(`      Found: ${m.name}`));
    } else {
      console.log(`   ⚠️  ${mosqueName} - Not found, may need manual search`);
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Campaign Status Summary:\n');

  const { data: stats, error: statsError } = await supabase
    .from('marketing_prospects')
    .select('campaign_status, priority')
    .not('email_primary', 'is', null);

  if (stats) {
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    stats.forEach(s => {
      const status = s.campaign_status || 'not_contacted';
      const priority = s.priority || 0;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });

    console.log('Campaign Status:');
    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const emoji = status === 'email_sent' ? '📧' :
                     status === 'responded' ? '✅' :
                     status === 'opened' ? '👀' : '⏸️';
        console.log(`   ${emoji} ${status}: ${count} mosques`);
      });

    console.log('\nPriority Breakdown:');
    Object.entries(priorityCounts)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
      .forEach(([priority, count]) => {
        const label = priority === '2' ? 'High (Phone)' :
                     priority === '1' ? 'High (Email Sent)' :
                     priority === '0' ? 'Normal' : 'Low';
        console.log(`   Priority ${priority} (${label}): ${count} mosques`);
      });
  }

  console.log('\n✅ Database Update Complete!\n');

  console.log('🎯 Next Steps:\n');
  console.log('   1. Wait 3-5 days for email responses');
  console.log('   2. Call Holland Park and Preston Mosque');
  console.log('   3. Track responses in campaign tracker');
  console.log('   4. Send follow-up emails after 7 days if no response');
  console.log('   5. Continue outreach to remaining mosques\n');

  console.log('📁 Don\'t forget to update your campaign-tracker CSV too!\n');
}

updateCampaignStatus().catch(console.error);
