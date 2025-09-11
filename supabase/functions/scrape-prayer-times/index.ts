import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrayerTimes {
  fajr_adhan?: string;
  fajr_iqamah?: string;
  dhuhr_adhan?: string;
  dhuhr_iqamah?: string;
  asr_adhan?: string;
  asr_iqamah?: string;
  maghrib_adhan?: string;
  maghrib_iqamah?: string;
  isha_adhan?: string;
  isha_iqamah?: string;
  jumah_times?: string[];
  date?: string;
}

interface ScrapeRequest {
  mosqueId: string;
  website: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const { mosqueId, website }: ScrapeRequest = await req.json();
      
      console.log(`Starting prayer time scraping for mosque ${mosqueId} from ${website}`);
      
      // Scrape the mosque website for prayer times
      const scrapedData = await scrapePrayerTimes(website);
      
      if (scrapedData) {
        // Store the scraped data in the database
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('prayer_times')
          .upsert({
            mosque_id: mosqueId,
            date: scrapedData.date || today,
            fajr_adhan: scrapedData.fajr_adhan,
            fajr_iqamah: scrapedData.fajr_iqamah,
            dhuhr_adhan: scrapedData.dhuhr_adhan,
            dhuhr_iqamah: scrapedData.dhuhr_iqamah,
            asr_adhan: scrapedData.asr_adhan,
            asr_iqamah: scrapedData.asr_iqamah,
            maghrib_adhan: scrapedData.maghrib_adhan,
            maghrib_iqamah: scrapedData.maghrib_iqamah,
            isha_adhan: scrapedData.isha_adhan,
            isha_iqamah: scrapedData.isha_iqamah,
            jumah_times: scrapedData.jumah_times || [],
            source_url: website,
            is_current: true,
            scraped_at: new Date().toISOString()
          })
          .select();

        if (error) {
          console.error('Database error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to store prayer times' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log(`Successfully scraped and stored prayer times for mosque ${mosqueId}`);
        return new Response(JSON.stringify({ 
          success: true, 
          data: data[0],
          prayerTimes: scrapedData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.log(`No prayer times found for mosque ${mosqueId} at ${website}`);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Could not extract prayer times from website' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET request - fetch stored prayer times for a mosque
    const url = new URL(req.url);
    const mosqueId = url.searchParams.get('mosqueId');
    
    if (!mosqueId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Mosque ID is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('prayer_times')
      .select('*')
      .eq('mosque_id', mosqueId)
      .eq('date', today)
      .eq('is_current', true)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch prayer times' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: data || null 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function scrapePrayerTimes(website: string): Promise<PrayerTimes | null> {
  try {
    console.log(`Fetching website: ${website}`);
    
    const response = await fetch(website, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MosqueLocator/1.0; +https://mosquelocator.com/bot)'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch website: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters from ${website}`);
    
    // Extract prayer times using various patterns and heuristics
    return extractPrayerTimesFromHtml(html);
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

function extractPrayerTimesFromHtml(html: string): PrayerTimes | null {
  const prayerTimes: PrayerTimes = {};
  
  // Convert to lowercase for case-insensitive matching
  const lowerHtml = html.toLowerCase();
  
  // Common prayer names and their variations
  const prayerPatterns = {
    fajr: /(?:fajr|fair|fajar|dawn)[^\d]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
    dhuhr: /(?:dhuhr|zuhr|dhur|noon)[^\d]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
    asr: /(?:asr|asar)[^\d]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
    maghrib: /(?:maghrib|magrib|sunset)[^\d]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
    isha: /(?:isha|isya|esha)[^\d]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi
  };

  // Extract each prayer time
  for (const [prayer, pattern] of Object.entries(prayerPatterns)) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      // Take the first match for adhan time
      const timeStr = matches[0][1];
      prayerTimes[`${prayer}_adhan` as keyof PrayerTimes] = normalizeTime(timeStr);
      
      // Look for iqamah time nearby (usually follows adhan)
      const iqamahPattern = new RegExp(`${matches[0][0]}[\\s\\S]{0,100}?(?:iqamah|jamaat|jama)[^\\d]*?(\\d{1,2}:\\d{2}(?:\\s*[ap]m)?)`, 'gi');
      const iqamahMatch = html.match(iqamahPattern);
      if (iqamahMatch) {
        const iqamahTimeMatch = iqamahMatch[0].match(/(\d{1,2}:\d{2}(?:\s*[ap]m)?)$/i);
        if (iqamahTimeMatch) {
          prayerTimes[`${prayer}_iqamah` as keyof PrayerTimes] = normalizeTime(iqamahTimeMatch[1]);
        }
      }
    }
  }

  // Extract Jumah times
  const jumahPattern = /(?:jum[aá]h|friday)[^\d]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi;
  const jumahMatches = [...html.matchAll(jumahPattern)];
  if (jumahMatches.length > 0) {
    prayerTimes.jumah_times = jumahMatches.map(match => normalizeTime(match[1]));
  }

  // Try to extract the date this timetable is for
  const datePatterns = [
    /(?:today|date)[^\d]*?(\d{1,2}\/\d{1,2}\/\d{4})/gi,
    /(?:updated|current)[^\d]*?(\d{1,2}\/\d{1,2}\/\d{4})/gi,
    /(\d{1,2}\/\d{1,2}\/\d{4})/g // Any date pattern
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = html.match(pattern);
    if (dateMatch) {
      prayerTimes.date = formatDateFromString(dateMatch[1]);
      break;
    }
  }

  // Check if we found any prayer times
  const foundAnyPrayer = Object.keys(prayerTimes).some(key => 
    key.includes('_adhan') && prayerTimes[key as keyof PrayerTimes]
  );

  if (!foundAnyPrayer) {
    console.log('No prayer times found in HTML');
    return null;
  }

  console.log('Extracted prayer times:', prayerTimes);
  return prayerTimes;
}

function normalizeTime(timeStr: string): string {
  // Remove extra spaces and normalize format
  let normalized = timeStr.trim().replace(/\s+/g, ' ');
  
  // Convert to 24-hour format if needed
  const match = normalized.match(/(\d{1,2}):(\d{2})(?:\s*(am|pm))?/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3]?.toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'am' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  return normalized;
}

function formatDateFromString(dateStr: string): string {
  try {
    // Try to parse various date formats and convert to YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  
  // Return today's date as fallback
  return new Date().toISOString().split('T')[0];
}