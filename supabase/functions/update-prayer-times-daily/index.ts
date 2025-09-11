import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MosqueToScrape {
  mosque_id: string;
  name: string;
  website: string;
  last_scrape: string | null;
  days_since_scrape: number;
}

interface ScrapeResult {
  mosque_id: string;
  name: string;
  website: string;
  success: boolean;
  error?: string;
  confidence?: number;
  sourceFormat?: string;
  timesFound?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return new Response(JSON.stringify({
      success: false,
      error: 'Server configuration error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const requestBody = req.method === 'POST' ? await req.json() : {};
    const isAutomated = requestBody.automated || false;
    
    console.log(`Starting ${isAutomated ? 'automated' : 'manual'} prayer times update process`);

    // First, update currency of existing prayer times
    console.log('Updating prayer times currency...');
    const { error: currencyError } = await supabase.rpc('update_prayer_times_currency');
    if (currencyError) {
      console.error('Failed to update prayer times currency:', currencyError);
    } else {
      console.log('Prayer times currency updated successfully');
    }

    // Get mosques that need scraping
    console.log('Fetching mosques that need scraping...');
    const { data: mosquesToScrape, error: fetchError } = await supabase
      .rpc('get_mosques_needing_scrape');

    if (fetchError) {
      console.error('Error fetching mosques to scrape:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch mosques for scraping',
        details: fetchError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!mosquesToScrape || mosquesToScrape.length === 0) {
      console.log('No mosques need scraping at this time');
      return new Response(JSON.stringify({
        success: true,
        message: 'No mosques need scraping at this time',
        processedMosques: 0,
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${mosquesToScrape.length} mosques that need scraping`);

    const results: ScrapeResult[] = [];
    const maxConcurrent = isAutomated ? 3 : 5; // Limit concurrent requests for automated runs
    
    // Process mosques in batches to avoid overwhelming the system
    for (let i = 0; i < mosquesToScrape.length; i += maxConcurrent) {
      const batch = mosquesToScrape.slice(i, i + maxConcurrent);
      console.log(`Processing batch ${Math.floor(i / maxConcurrent) + 1} with ${batch.length} mosques`);
      
      const batchPromises = batch.map(async (mosque: MosqueToScrape) => {
        return await processSingleMosque(mosque, supabase);
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process batch results
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const mosque = batch[j];
        
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            console.log(`✓ Successfully updated ${mosque.name} (confidence: ${result.value.confidence})`);
          } else {
            console.log(`✗ Failed to update ${mosque.name}: ${result.value.error}`);
          }
        } else {
          console.error(`✗ Error processing ${mosque.name}:`, result.reason);
          results.push({
            mosque_id: mosque.mosque_id,
            name: mosque.name,
            website: mosque.website,
            success: false,
            error: result.reason?.message || 'Processing failed'
          });
        }
      }
      
      // Add delay between batches to be respectful to websites
      if (i + maxConcurrent < mosquesToScrape.length) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Generate summary
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const highConfidence = results.filter(r => r.success && (r.confidence || 0) >= 70).length;
    const mediumConfidence = results.filter(r => r.success && (r.confidence || 0) >= 40 && (r.confidence || 0) < 70).length;
    const lowConfidence = results.filter(r => r.success && (r.confidence || 0) < 40).length;

    console.log(`
Prayer Times Update Complete:
- Total mosques processed: ${results.length}
- Successful updates: ${successCount}
- Failed updates: ${failureCount}
- High confidence (≥70%): ${highConfidence}
- Medium confidence (40-69%): ${mediumConfidence}
- Low confidence (<40%): ${lowConfidence}
    `);

    // Log summary to scraping_logs for tracking
    await supabase.from('scraping_logs').insert({
      mosque_id: 'BATCH_SUMMARY',
      website_url: 'automated_update',
      success: successCount > failureCount,
      source_format: 'batch_update',
      extraction_confidence: Math.round((successCount / results.length) * 100),
      error_message: failureCount > 0 ? `${failureCount} mosques failed` : null,
      raw_content_preview: `Processed ${results.length} mosques`,
      times_found: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        high_confidence: highConfidence,
        medium_confidence: mediumConfidence,
        low_confidence: lowConfidence,
        automated: isAutomated
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Prayer times update completed`,
      processedMosques: results.length,
      successfulUpdates: successCount,
      failedUpdates: failureCount,
      confidenceBreakdown: {
        high: highConfidence,
        medium: mediumConfidence,
        low: lowConfidence
      },
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-prayer-times-daily function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update prayer times',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processSingleMosque(mosque: MosqueToScrape, supabase: any): Promise<ScrapeResult> {
  try {
    console.log(`Processing ${mosque.name} (${mosque.website})`);
    console.log(`Last scraped: ${mosque.last_scrape || 'Never'}, Days since: ${mosque.days_since_scrape}`);

    // Call the enhanced scrape-prayer-times function
    const scrapeUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-prayer-times`;
    
    const response = await fetch(scrapeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        mosqueId: mosque.mosque_id,
        website: mosque.website
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error ${response.status} for ${mosque.name}: ${errorText}`);
      
      return {
        mosque_id: mosque.mosque_id,
        name: mosque.name,
        website: mosque.website,
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        mosque_id: mosque.mosque_id,
        name: mosque.name,
        website: mosque.website,
        success: true,
        confidence: result.confidence,
        sourceFormat: result.sourceFormat,
        timesFound: result.data
      };
    } else {
      return {
        mosque_id: mosque.mosque_id,
        name: mosque.name,
        website: mosque.website,
        success: false,
        error: result.error || result.details || 'Unknown scraping error'
      };
    }

  } catch (error) {
    console.error(`Error processing ${mosque.name}:`, error);
    return {
      mosque_id: mosque.mosque_id,
      name: mosque.name,
      website: mosque.website,
      success: false,
      error: error.message
    };
  }
}