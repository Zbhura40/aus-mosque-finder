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
      
      if (!website || !website.startsWith('http')) {
        console.error('Invalid website URL:', website);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid website URL provided' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Scrape the mosque website for prayer times
      const scrapedData = await scrapePrayerTimes(website);
      
      if (scrapedData) {
        console.log('Successfully scraped prayer times:', scrapedData);
        
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
            error: 'Failed to store prayer times in database',
            details: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log(`Successfully stored prayer times for mosque ${mosqueId}`);
        return new Response(JSON.stringify({ 
          success: true, 
          data: data[0],
          prayerTimes: scrapedData,
          message: 'Prayer times successfully scraped and stored'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.log(`No prayer times found for mosque ${mosqueId} at ${website}`);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Could not extract prayer times from website',
          details: 'The website content does not contain recognizable prayer time formats'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET request - fetch stored prayer times for a mosque OR test scraping
    const url = new URL(req.url);
    const mosqueId = url.searchParams.get('mosqueId');
    const testUrl = url.searchParams.get('testUrl');
    
    // Test endpoint - scrape a URL without storing
    if (testUrl) {
      console.log(`Testing prayer time scraping for URL: ${testUrl}`);
      
      try {
        const scrapedData = await scrapePrayerTimes(testUrl);
        
        return new Response(JSON.stringify({ 
          success: !!scrapedData, 
          data: scrapedData || null,
          message: scrapedData ? 'Successfully extracted prayer times' : 'No prayer times found',
          testUrl: testUrl
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Test scraping error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message,
          testUrl: testUrl
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (!mosqueId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Mosque ID or test URL is required' 
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
  
  console.log('HTML content length:', html.length);
  console.log('HTML preview:', html.substring(0, 500));
  
  // Remove HTML tags for better text extraction
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // Enhanced prayer patterns with more variations and flexible matching
  const prayerPatterns = {
    fajr: [
      /(?:fajr|fair|fajar|dawn)\s*[:\-\s]*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(?:fajr|fair|fajar|dawn)[^0-9]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(\d{1,2}:\d{2}(?:\s*[ap]m)?)[^0-9]*?(?:fajr|fair|fajar|dawn)/gi
    ],
    dhuhr: [
      /(?:dhuhr|zuhr|dhur|noon|dhohr)\s*[:\-\s]*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(?:dhuhr|zuhr|dhur|noon|dhohr)[^0-9]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(\d{1,2}:\d{2}(?:\s*[ap]m)?)[^0-9]*?(?:dhuhr|zuhr|dhur|noon|dhohr)/gi
    ],
    asr: [
      /(?:asr|asar|afternoon)\s*[:\-\s]*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(?:asr|asar|afternoon)[^0-9]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(\d{1,2}:\d{2}(?:\s*[ap]m)?)[^0-9]*?(?:asr|asar|afternoon)/gi
    ],
    maghrib: [
      /(?:maghrib|magrib|sunset|maghreb)\s*[:\-\s]*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(?:maghrib|magrib|sunset|maghreb)[^0-9]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(\d{1,2}:\d{2}(?:\s*[ap]m)?)[^0-9]*?(?:maghrib|magrib|sunset|maghreb)/gi
    ],
    isha: [
      /(?:isha|isya|esha|night)\s*[:\-\s]*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(?:isha|isya|esha|night)[^0-9]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
      /(\d{1,2}:\d{2}(?:\s*[ap]m)?)[^0-9]*?(?:isha|isya|esha|night)/gi
    ]
  };

  // Extract each prayer time using multiple patterns
  for (const [prayer, patterns] of Object.entries(prayerPatterns)) {
    console.log(`Looking for ${prayer} prayer times...`);
    
    for (const pattern of patterns) {
      const matches = [...textContent.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`Found ${prayer} matches:`, matches.map(m => m[1] || m[0]));
        
        // Take the first valid time match
        const timeStr = matches[0][1] || matches[0][0];
        if (timeStr && /\d{1,2}:\d{2}/.test(timeStr)) {
          prayerTimes[`${prayer}_adhan` as keyof PrayerTimes] = normalizeTime(timeStr);
          console.log(`Set ${prayer} adhan:`, normalizeTime(timeStr));
          break; // Found a match, stop trying other patterns for this prayer
        }
      }
    }
    
    // Look for iqamah times in table format or structured data
    if (prayerTimes[`${prayer}_adhan` as keyof PrayerTimes]) {
      const iqamahPatterns = [
        new RegExp(`(?:${prayer})[\\s\\S]{0,200}?(?:iqamah|jamaat|jama|congregation)[\\s\\S]{0,50}?(\\d{1,2}:\\d{2}(?:\\s*[ap]m)?)`, 'gi'),
        new RegExp(`(?:iqamah|jamaat|jama|congregation)[\\s\\S]{0,50}?(?:${prayer})[\\s\\S]{0,50}?(\\d{1,2}:\\d{2}(?:\\s*[ap]m)?)`, 'gi')
      ];
      
      for (const iqPattern of iqamahPatterns) {
        const iqamahMatch = textContent.match(iqPattern);
        if (iqamahMatch && iqamahMatch[1]) {
          prayerTimes[`${prayer}_iqamah` as keyof PrayerTimes] = normalizeTime(iqamahMatch[1]);
          console.log(`Set ${prayer} iqamah:`, normalizeTime(iqamahMatch[1]));
          break;
        }
      }
    }
  }

  // Enhanced Jumah extraction
  const jumahPatterns = [
    /(?:jum[aá]h|friday|jummah)\s*[:\-\s]*(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
    /(?:friday\s*prayer|juma\s*prayer)[^0-9]*?(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi,
    /(\d{1,2}:\d{2}(?:\s*[ap]m)?)[^0-9]*?(?:jum[aá]h|friday|jummah)/gi
  ];
  
  const allJumahTimes = [];
  for (const pattern of jumahPatterns) {
    const matches = [...textContent.matchAll(pattern)];
    for (const match of matches) {
      const timeStr = match[1] || match[0];
      if (timeStr && /\d{1,2}:\d{2}/.test(timeStr)) {
        allJumahTimes.push(normalizeTime(timeStr));
      }
    }
  }
  
  if (allJumahTimes.length > 0) {
    // Remove duplicates
    prayerTimes.jumah_times = [...new Set(allJumahTimes)];
    console.log('Found Jumah times:', prayerTimes.jumah_times);
  }

  // Enhanced date extraction
  const datePatterns = [
    /(?:today|date|updated|current)[^0-9]*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/gi,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)[^0-9]*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/gi
  ];
  
  for (const pattern of datePatterns) {
    const dateMatch = textContent.match(pattern);
    if (dateMatch && dateMatch[1]) {
      prayerTimes.date = formatDateFromString(dateMatch[1]);
      console.log('Found date:', prayerTimes.date);
      break;
    }
  }

  // Fallback: look for any time patterns that might be prayer times
  if (Object.keys(prayerTimes).filter(k => k.includes('_adhan')).length === 0) {
    console.log('No specific prayer times found, looking for any time patterns...');
    
    const allTimeMatches = [...textContent.matchAll(/\b(\d{1,2}:\d{2}(?:\s*[ap]m)?)\b/gi)];
    console.log('All time matches found:', allTimeMatches.map(m => m[1]));
    
    // If we find exactly 5 times, assume they are the 5 daily prayers
    if (allTimeMatches.length >= 5) {
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const uniqueTimes = [...new Set(allTimeMatches.map(m => normalizeTime(m[1])))];
      
      if (uniqueTimes.length >= 5) {
        console.log('Assuming 5 times are daily prayers:', uniqueTimes.slice(0, 5));
        prayers.forEach((prayer, index) => {
          if (uniqueTimes[index]) {
            prayerTimes[`${prayer}_adhan` as keyof PrayerTimes] = uniqueTimes[index];
          }
        });
      }
    }
  }

  // Check if we found any prayer times
  const foundAnyPrayer = Object.keys(prayerTimes).some(key => 
    key.includes('_adhan') && prayerTimes[key as keyof PrayerTimes]
  );

  if (!foundAnyPrayer) {
    console.log('No prayer times found in HTML');
    console.log('Text content preview:', textContent.substring(0, 1000));
    return null;
  }

  console.log('Final extracted prayer times:', prayerTimes);
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
    console.log('Formatting date string:', dateStr);
    
    // Remove any non-date characters
    const cleanDate = dateStr.replace(/[^\d\/\-\.]/g, '');
    
    // Try to parse various date formats and convert to YYYY-MM-DD
    const separators = ['//', '-', '.'];
    for (const sep of separators) {
      if (cleanDate.includes(sep)) {
        const parts = cleanDate.split(sep);
        if (parts.length === 3) {
          let day, month, year;
          
          // Handle different year formats
          if (parts[2].length === 4) {
            // DD/MM/YYYY or MM/DD/YYYY
            day = parts[0].padStart(2, '0');
            month = parts[1].padStart(2, '0');
            year = parts[2];
          } else if (parts[0].length === 4) {
            // YYYY/MM/DD
            year = parts[0];
            month = parts[1].padStart(2, '0');
            day = parts[2].padStart(2, '0');
          } else {
            // DD/MM/YY - assume 20YY
            day = parts[0].padStart(2, '0');
            month = parts[1].padStart(2, '0');
            year = `20${parts[2]}`;
          }
          
          const formatted = `${year}-${month}-${day}`;
          console.log('Formatted date:', formatted);
          return formatted;
        }
      }
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  
  // Return today's date as fallback
  const today = new Date().toISOString().split('T')[0];
  console.log('Using fallback date:', today);
  return today;
}