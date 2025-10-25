import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function logPhoneCall() {
  console.log('\n📞 Phone Call Logger\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get mosque name
  const mosqueName = await question('Mosque name: ');

  // Search for mosque
  const { data: mosques, error: searchError } = await supabase
    .from('marketing_prospects')
    .select('*')
    .ilike('name', `%${mosqueName}%`);

  if (!mosques || mosques.length === 0) {
    console.log('\n❌ No mosque found matching that name.');
    console.log('Try a shorter search term or check spelling.\n');
    rl.close();
    return;
  }

  if (mosques.length > 1) {
    console.log('\n🔍 Multiple mosques found:\n');
    mosques.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name} (${m.state})`);
    });
    const choice = await question('\nSelect mosque number: ');
    const selectedMosque = mosques[parseInt(choice) - 1];

    if (!selectedMosque) {
      console.log('Invalid selection.');
      rl.close();
      return;
    }

    await logCallDetails(selectedMosque);
  } else {
    await logCallDetails(mosques[0]);
  }

  rl.close();
}

async function logCallDetails(mosque: any) {
  console.log(`\n✅ Selected: ${mosque.name}\n`);

  // Get call outcome
  console.log('Call Outcome:');
  console.log('1. Interested - will partner');
  console.log('2. Maybe - needs committee approval');
  console.log('3. Interested - wants preview first');
  console.log('4. Not interested');
  console.log('5. No answer - left voicemail');
  console.log('6. No answer - will call back');
  console.log('7. Wrong number\n');

  const outcomeChoice = await question('Select outcome (1-7): ');

  const outcomes = [
    { status: 'responded', notes: 'Phone call - INTERESTED - Will partner', priority: 3 },
    { status: 'responded', notes: 'Phone call - MAYBE - Needs committee approval', priority: 2 },
    { status: 'responded', notes: 'Phone call - Wants preview page first', priority: 2 },
    { status: 'not_contacted', notes: 'Phone call - Not interested', priority: -1 },
    { status: 'not_contacted', notes: 'Phone call - Voicemail left', priority: 1 },
    { status: 'not_contacted', notes: 'Phone call - No answer, will retry', priority: 1 },
    { status: 'not_contacted', notes: 'Phone call - Wrong number', priority: -1 }
  ];

  const selectedOutcome = outcomes[parseInt(outcomeChoice) - 1];

  if (!selectedOutcome) {
    console.log('Invalid outcome selected.');
    return;
  }

  // Get additional notes
  const additionalNotes = await question('\nAdditional notes (optional): ');

  // Get email if they gave one
  const emailCollected = await question('Email collected (press Enter if none): ');

  // Prepare update data
  const today = new Date().toISOString();
  const updateData: any = {
    campaign_status: selectedOutcome.status,
    last_interaction_date: today,
    notes: selectedOutcome.notes + (additionalNotes ? ` - ${additionalNotes}` : ''),
    priority: selectedOutcome.priority,
    updated_at: today
  };

  // Add email if collected
  if (emailCollected && !mosque.email_primary) {
    updateData.email_primary = emailCollected;
    updateData.extraction_status = 'completed';
    console.log(`\n📧 Email added: ${emailCollected}`);
  }

  // Update database
  const { error: updateError } = await supabase
    .from('marketing_prospects')
    .update(updateData)
    .eq('id', mosque.id);

  if (updateError) {
    console.error('\n❌ Error updating database:', updateError.message);
  } else {
    console.log('\n✅ Phone call logged successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Summary:\n');
    console.log(`Mosque: ${mosque.name}`);
    console.log(`Status: ${selectedOutcome.status}`);
    console.log(`Priority: ${selectedOutcome.priority}`);
    console.log(`Notes: ${updateData.notes}`);
    if (emailCollected) console.log(`Email: ${emailCollected}`);
    console.log('\n🎯 Next Actions:\n');

    if (parseInt(outcomeChoice) === 1) {
      console.log('   [ ] Send partnership email with details');
      console.log('   [ ] Build featured page within 5 days');
      console.log('   [ ] Send preview for approval');
    } else if (parseInt(outcomeChoice) === 2) {
      console.log('   [ ] Send proposal email to share with committee');
      console.log('   [ ] Follow up in 7-10 days');
    } else if (parseInt(outcomeChoice) === 3) {
      console.log('   [ ] Build preview page within 3-5 days');
      console.log('   [ ] Send preview link for review');
    } else if (parseInt(outcomeChoice) === 5 || parseInt(outcomeChoice) === 6) {
      console.log('   [ ] Call back in 2-3 days');
    }
    console.log('   [ ] Update campaign-tracker.csv');
    console.log('');
  }
}

logPhoneCall().catch(console.error);
