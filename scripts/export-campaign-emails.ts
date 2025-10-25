import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function exportCampaignEmails() {
  console.log('📧 Exporting Campaign-Ready Emails\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get all mosques with emails
  const { data: prospects, error } = await supabase
    .from('marketing_prospects')
    .select('*')
    .not('email_primary', 'is', null)
    .eq('is_active', true)
    .order('state', { ascending: true })
    .order('name', { ascending: true });

  if (error || !prospects) {
    console.error('❌ Error fetching prospects:', error);
    return;
  }

  console.log(`✅ Found ${prospects.length} mosques with emails\n`);

  // Create detailed CSV for campaign management
  const csvHeaders = [
    'Mosque Name',
    'Primary Email',
    'Secondary Email',
    'Tertiary Email',
    'Phone',
    'Website',
    'Address',
    'Suburb',
    'State',
    'Google Maps URL',
    'Campaign Status',
    'Priority',
    'Notes'
  ].join(',') + '\n';

  const csvRows = prospects.map(p => {
    return [
      `"${p.name}"`,
      `"${p.email_primary || ''}"`,
      `"${p.email_secondary || ''}"`,
      `"${p.email_tertiary || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.website || ''}"`,
      `"${p.address || ''}"`,
      `"${p.suburb || ''}"`,
      `"${p.state || ''}"`,
      `"${p.google_maps_url || ''}"`,
      `"${p.campaign_status || 'not_contacted'}"`,
      `"${p.priority || 0}"`,
      `"${p.notes || ''}"`
    ].join(',');
  }).join('\n');

  const csvContent = csvHeaders + csvRows;
  const csvPath = '/Users/zubairbhura/Work/findmymosque/docs/campaign-emails-ready.csv';

  fs.writeFileSync(csvPath, csvContent);

  console.log('💾 CSV Export Complete!\n');
  console.log(`📄 File: docs/campaign-emails-ready.csv`);
  console.log(`📊 Total emails: ${prospects.length}\n`);

  // Create simple email-only list for quick copy-paste
  const emailListPath = '/Users/zubairbhura/Work/findmymosque/docs/campaign-email-list.txt';
  const emailList = prospects.map(p => {
    return `${p.name} <${p.email_primary}>`;
  }).join('\n');

  fs.writeFileSync(emailListPath, emailList);

  console.log('📋 Email List Created!\n');
  console.log(`📄 File: docs/campaign-email-list.txt`);
  console.log(`   (Simple format for email tools)\n`);

  // Show breakdown
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Campaign Breakdown:\n');

  const byState: Record<string, any[]> = {};
  prospects.forEach(p => {
    const state = p.state || 'Unknown';
    if (!byState[state]) byState[state] = [];
    byState[state].push(p);
  });

  Object.entries(byState)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([state, mosques]) => {
      console.log(`${state}: ${mosques.length} mosques`);
      mosques.forEach(m => {
        console.log(`   • ${m.name}`);
        console.log(`     ${m.email_primary}`);
        if (m.phone) console.log(`     📞 ${m.phone}`);
      });
      console.log('');
    });

  // Campaign readiness check
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Campaign Readiness Check:\n');

  const withPhone = prospects.filter(p => p.phone).length;
  const withWebsite = prospects.filter(p => p.website).length;
  const withAddress = prospects.filter(p => p.address).length;

  console.log(`📧 Emails ready: ${prospects.length}/${prospects.length} (100%)`);
  console.log(`📞 Phone numbers: ${withPhone}/${prospects.length} (${Math.round(withPhone/prospects.length*100)}%)`);
  console.log(`🌐 Websites: ${withWebsite}/${prospects.length} (${Math.round(withWebsite/prospects.length*100)}%)`);
  console.log(`📍 Addresses: ${withAddress}/${prospects.length} (${Math.round(withAddress/prospects.length*100)}%)`);

  console.log('\n🎯 Recommended Approach:\n');
  console.log('   1. Start with 5-10 emails (test your message)');
  console.log('   2. Wait 3-5 days for responses');
  console.log('   3. Adjust template based on feedback');
  console.log('   4. Send to remaining mosques');
  console.log('   5. Follow up after 7 days if no response\n');

  // Create test batch (first 5 mosques)
  const testBatch = prospects.slice(0, 5);
  const testBatchPath = '/Users/zubairbhura/Work/findmymosque/docs/campaign-test-batch.csv';
  const testBatchContent = csvHeaders + testBatch.map(p => {
    return [
      `"${p.name}"`,
      `"${p.email_primary || ''}"`,
      `"${p.email_secondary || ''}"`,
      `"${p.email_tertiary || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.website || ''}"`,
      `"${p.address || ''}"`,
      `"${p.suburb || ''}"`,
      `"${p.state || ''}"`,
      `"${p.google_maps_url || ''}"`,
      `"${p.campaign_status || 'not_contacted'}"`,
      `"${p.priority || 0}"`,
      `"Test Batch - Send First"`
    ].join(',');
  }).join('\n');

  fs.writeFileSync(testBatchPath, testBatchContent);

  console.log('🧪 Test Batch Created!\n');
  console.log(`📄 File: docs/campaign-test-batch.csv`);
  console.log(`📊 Test batch size: ${testBatch.length} mosques\n`);

  console.log('Test Batch Mosques:');
  testBatch.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.state})`);
    console.log(`      ${m.email_primary}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Export Complete!\n');
  console.log('📁 Files created:');
  console.log('   1. campaign-emails-ready.csv (full list with details)');
  console.log('   2. campaign-email-list.txt (simple email list)');
  console.log('   3. campaign-test-batch.csv (first 5 for testing)\n');

  console.log('🚀 Next Steps:');
  console.log('   1. Review email templates');
  console.log('   2. Personalize messages for test batch');
  console.log('   3. Send first 5 emails');
  console.log('   4. Track responses and refine\n');
}

exportCampaignEmails().catch(console.error);
