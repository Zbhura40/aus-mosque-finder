import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily prayer times update...');

    // Get all mosques with websites
    const { data: mosques, error: mosquesError } = await supabase
      .from('mosques')
      .select('mosque_id, name, phone')
      .not('phone', 'is', null); // Use phone field as website for now

    if (mosquesError) {
      console.error('Error fetching mosques:', mosquesError);
      throw mosquesError;
    }

    console.log(`Found ${mosques?.length || 0} mosques to update`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Update prayer times for each mosque
    for (const mosque of mosques || []) {
      try {
        // Skip if no website URL in phone field (temporary until we add website field)
        if (!mosque.phone?.startsWith('http')) {
          console.log(`Skipping ${mosque.name} - no website URL`);
          continue;
        }

        console.log(`Updating prayer times for ${mosque.name}...`);

        // Call the scrape-prayer-times function
        const scrapeResponse = await fetch(`${supabaseUrl}/functions/v1/scrape-prayer-times`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mosqueId: mosque.mosque_id,
            website: mosque.phone // Using phone field as website temporarily
          })
        });

        const scrapeResult = await scrapeResponse.json();

        if (scrapeResult.success) {
          console.log(`✓ Successfully updated prayer times for ${mosque.name}`);
          results.successful++;
        } else {
          console.log(`✗ Failed to update prayer times for ${mosque.name}: ${scrapeResult.error}`);
          results.failed++;
          results.errors.push(`${mosque.name}: ${scrapeResult.error}`);
        }

        // Add a small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error updating ${mosque.name}:`, error);
        results.failed++;
        results.errors.push(`${mosque.name}: ${error.message}`);
      }
    }

    console.log('Daily prayer times update completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Daily prayer times update completed',
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Daily update error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});