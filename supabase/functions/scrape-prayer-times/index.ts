import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

interface ExtractionResult {
  prayerTimes: PrayerTimes | null;
  confidence: number;
  sourceFormat: string;
  notes: string[];
  success: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (req.method === 'POST') {
      const { mosqueId, website } = await req.json();
      
      if (!mosqueId || !website) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing mosqueId or website' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Starting enhanced prayer time scraping for mosque ${mosqueId} from ${website}`);
      
      // Log scrape attempt
      await logScrapeAttempt(supabase, mosqueId, website, 'started', '');

      const extractionResult = await comprehensiveExtraction(website);
      
      if (extractionResult.success && extractionResult.prayerTimes) {
        // Store the prayer times
        const upsertData = {
          mosque_id: mosqueId,
          date: extractionResult.prayerTimes.date || getTodayDate(),
          fajr_adhan: extractionResult.prayerTimes.fajr_adhan,
          fajr_iqamah: extractionResult.prayerTimes.fajr_iqamah,
          dhuhr_adhan: extractionResult.prayerTimes.dhuhr_adhan,
          dhuhr_iqamah: extractionResult.prayerTimes.dhuhr_iqamah,
          asr_adhan: extractionResult.prayerTimes.asr_adhan,
          asr_iqamah: extractionResult.prayerTimes.asr_iqamah,
          maghrib_adhan: extractionResult.prayerTimes.maghrib_adhan,
          maghrib_iqamah: extractionResult.prayerTimes.maghrib_iqamah,
          isha_adhan: extractionResult.prayerTimes.isha_adhan,
          isha_iqamah: extractionResult.prayerTimes.isha_iqamah,
          jumah_times: extractionResult.prayerTimes.jumah_times,
          source_url: website,
          source_format: extractionResult.sourceFormat,
          extraction_confidence: extractionResult.confidence,
          parsing_notes: extractionResult.notes.join('; '),
          last_scrape_attempt: new Date().toISOString(),
          scrape_success: true,
          auto_scraped: true,
          is_current: true,
        };

        const { error: upsertError } = await supabase
          .from('prayer_times')
          .upsert(upsertData, { 
            onConflict: 'mosque_id,date',
            ignoreDuplicates: false 
          });

        if (upsertError) {
          console.error('Database upsert error:', upsertError);
          await logScrapeAttempt(supabase, mosqueId, website, 'database_error', upsertError.message);
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Database error',
            details: upsertError.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Log successful scrape
        await logScrapeAttempt(supabase, mosqueId, website, 'success', '', extractionResult);

        console.log(`Successfully updated prayer times for mosque ${mosqueId}`);
        return new Response(JSON.stringify({
          success: true,
          data: extractionResult.prayerTimes,
          confidence: extractionResult.confidence,
          sourceFormat: extractionResult.sourceFormat,
          notes: extractionResult.notes
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Log failed scrape
        await logScrapeAttempt(supabase, mosqueId, website, 'parsing_failed', extractionResult.notes.join('; '));
        
        return new Response(JSON.stringify({
          success: false,
          error: "Could not extract prayer times from website",
          details: extractionResult.notes.join('; '),
          confidence: extractionResult.confidence,
          sourceFormat: extractionResult.sourceFormat
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'GET') {
      // Handle GET requests for testing and retrieving today's prayer times
      const url = new URL(req.url);
      const testUrl = url.searchParams.get('testUrl');
      const mosqueId = url.searchParams.get('mosqueId');

      if (testUrl) {
        console.log(`Testing extraction for URL: ${testUrl}`);
        const result = await comprehensiveExtraction(testUrl);
        
        return new Response(JSON.stringify({
          success: result.success,
          extractedData: result.prayerTimes,
          confidence: result.confidence,
          sourceFormat: result.sourceFormat,
          notes: result.notes
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (mosqueId) {
        const { data, error } = await supabase
          .from('prayer_times')
          .select('*')
          .eq('mosque_id', mosqueId)
          .eq('is_current', true)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: false, error: 'Missing parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error in scrape-prayer-times function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function comprehensiveExtraction(website: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: null,
    confidence: 0,
    sourceFormat: 'unknown',
    notes: [],
    success: false
  };

  try {
    // First, try to scrape the HTML
    const htmlContent = await scrapePrayerTimes(website);
    if (!htmlContent) {
      result.notes.push('Failed to fetch website content');
      return result;
    }

    result.notes.push(`Fetched ${htmlContent.length} characters from website`);

    // Try multiple extraction methods in order of reliability
    const extractors = [
      () => extractFromHTMLTables(htmlContent),
      () => extractFromLists(htmlContent),
      () => extractFromStructuredText(htmlContent),
      () => extractFromPlainText(htmlContent)
    ];

    for (const extractor of extractors) {
      try {
        const extraction = await extractor();
        if (extraction.success && extraction.confidence > result.confidence) {
          result.prayerTimes = extraction.prayerTimes;
          result.confidence = extraction.confidence;
          result.sourceFormat = extraction.sourceFormat;
          result.notes.push(...extraction.notes);
          result.success = extraction.success;
        }
      } catch (error) {
        result.notes.push(`Extraction error: ${error.message}`);
      }
    }

    // Check for downloadable timetables (PDFs, Excel files)
    const downloadableLinks = findDownloadableTimelinks(htmlContent);
    if (downloadableLinks.length > 0) {
      result.notes.push(`Found ${downloadableLinks.length} downloadable timetables: ${downloadableLinks.join(', ')}`);
      // TODO: Implement PDF/Excel parsing in future iteration
    }

    // Check for embedded widgets or iframes
    const embeddedSources = findEmbeddedSources(htmlContent);
    if (embeddedSources.length > 0) {
      result.notes.push(`Found ${embeddedSources.length} embedded sources: ${embeddedSources.join(', ')}`);
      // TODO: Implement widget parsing in future iteration
    }

    // If we have any prayer times, consider it a success if confidence > 30
    if (result.prayerTimes && result.confidence > 30) {
      result.success = true;
    } else if (result.prayerTimes) {
      result.notes.push('Low confidence extraction - flagged for manual review');
    } else {
      result.notes.push('No prayer times could be extracted from any format');
    }

    return result;

  } catch (error) {
    result.notes.push(`Comprehensive extraction failed: ${error.message}`);
    return result;
  }
}

async function extractFromHTMLTables(html: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'html_table',
    notes: [],
    success: false
  };

  try {
    // Parse HTML and find table elements
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables = [...html.matchAll(tableRegex)];
    
    result.notes.push(`Found ${tables.length} table(s)`);

    for (let i = 0; i < tables.length; i++) {
      const tableContent = tables[i][1];
      
      // Extract rows
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const rows = [...tableContent.matchAll(rowRegex)];
      
      if (rows.length < 2) continue; // Need at least header + data row
      
      result.notes.push(`Processing table ${i + 1} with ${rows.length} rows`);
      
      // Parse each row to find prayer times
      for (const row of rows) {
        const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
        const cells = [...row[1].matchAll(cellRegex)];
        
        if (cells.length >= 2) {
          const cleanCells = cells.map(cell => 
            cell[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          );
          
          // Try to match prayer names and times
          const extraction = matchPrayerTimesFromCells(cleanCells);
          if (extraction.found > 0) {
            Object.assign(result.prayerTimes!, extraction.times);
            result.confidence = Math.max(result.confidence, extraction.found * 15);
            result.notes.push(`Found ${extraction.found} prayer times in table row`);
          }
        }
      }
    }

    // Look for date information in table headers or captions
    const dateInfo = extractDateFromHTML(html);
    if (dateInfo) {
      result.prayerTimes!.date = dateInfo;
      result.confidence += 10;
      result.notes.push(`Extracted date: ${dateInfo}`);
    }

    result.success = result.confidence > 30;
    return result;

  } catch (error) {
    result.notes.push(`HTML table extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromLists(html: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'html_list',
    notes: [],
    success: false
  };

  try {
    // Find ul and ol elements
    const listRegex = /<[uo]l[^>]*>([\s\S]*?)<\/[uo]l>/gi;
    const lists = [...html.matchAll(listRegex)];
    
    result.notes.push(`Found ${lists.length} list(s)`);

    for (let i = 0; i < lists.length; i++) {
      const listContent = lists[i][1];
      
      // Extract list items
      const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      const items = [...listContent.matchAll(itemRegex)];
      
      result.notes.push(`Processing list ${i + 1} with ${items.length} items`);
      
      for (const item of items) {
        const cleanText = item[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const extraction = extractPrayerTimeFromText(cleanText);
        
        if (extraction.prayer && extraction.time) {
          const field = `${extraction.prayer}_adhan` as keyof PrayerTimes;
          result.prayerTimes![field] = extraction.time;
          result.confidence += 15;
          result.notes.push(`Found ${extraction.prayer}: ${extraction.time}`);
        }
      }
    }

    result.success = result.confidence > 30;
    return result;

  } catch (error) {
    result.notes.push(`HTML list extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromStructuredText(html: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'structured_text',
    notes: [],
    success: false
  };

  try {
    // Look for div, span, p elements that might contain prayer times
    const blockRegex = /<(div|span|p)[^>]*>([\s\S]*?)<\/\1>/gi;
    const blocks = [...html.matchAll(blockRegex)];
    
    result.notes.push(`Found ${blocks.length} text block(s)`);

    for (const block of blocks) {
      const cleanText = block[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Skip if text is too short or too long (likely not prayer times)
      if (cleanText.length < 10 || cleanText.length > 500) continue;
      
      // Look for prayer time patterns
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      
      for (const prayer of prayers) {
        const prayerRegex = new RegExp(
          `(${prayer}|${prayer.charAt(0).toUpperCase() + prayer.slice(1)})\\s*:?\\s*([0-9]{1,2}:[0-9]{2}\\s*(?:am|pm|AM|PM)?)`,
          'gi'
        );
        
        const matches = cleanText.match(prayerRegex);
        if (matches) {
          for (const match of matches) {
            const timeMatch = match.match(/([0-9]{1,2}:[0-9]{2})\s*(am|pm|AM|PM)?/);
            if (timeMatch) {
              const normalizedTime = normalizeTime(timeMatch[0]);
              if (normalizedTime) {
                const field = `${prayer}_adhan` as keyof PrayerTimes;
                result.prayerTimes![field] = normalizedTime;
                result.confidence += 15;
                result.notes.push(`Found ${prayer}: ${normalizedTime} in structured text`);
              }
            }
          }
        }
      }
    }

    result.success = result.confidence > 30;
    return result;

  } catch (error) {
    result.notes.push(`Structured text extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromPlainText(html: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'plain_text',
    notes: [],
    success: false
  };

  try {
    // Remove all HTML tags and get plain text
    const plainText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    result.notes.push(`Processing ${plainText.length} characters of plain text`);

    // Enhanced prayer time patterns
    const patterns = {
      fajr: [
        /(?:fajr|fair|fajar|dawn)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi,
        /([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)\s*(?:fajr|fair|fajar|dawn)/gi
      ],
      dhuhr: [
        /(?:dhuhr|zuhr|dhur|noon|dhohr)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi,
        /([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)\s*(?:dhuhr|zuhr|dhur|noon|dhohr)/gi
      ],
      asr: [
        /(?:asr|asar|afternoon)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi,
        /([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)\s*(?:asr|asar|afternoon)/gi
      ],
      maghrib: [
        /(?:maghrib|magrib|sunset|maghreb)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi,
        /([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)\s*(?:maghrib|magrib|sunset|maghreb)/gi
      ],
      isha: [
        /(?:isha|isya|esha|night)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi,
        /([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)\s*(?:isha|isya|esha|night)/gi
      ]
    };

    for (const [prayer, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        const matches = [...plainText.matchAll(regex)];
        if (matches.length > 0) {
          const timeStr = matches[0][1];
          const normalizedTime = normalizeTime(timeStr);
          if (normalizedTime) {
            const field = `${prayer}_adhan` as keyof PrayerTimes;
            result.prayerTimes![field] = normalizedTime;
            result.confidence += 12;
            result.notes.push(`Found ${prayer}: ${normalizedTime} in plain text`);
            break; // Found a match, try next prayer
          }
        }
      }
    }

    // Look for Jumu'ah times
    const jumahRegex = /(?:jum[aá]h|friday|jummah)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi;
    const jumahMatches = [...plainText.matchAll(jumahRegex)];
    if (jumahMatches.length > 0) {
      const jumahTimes = jumahMatches
        .map(match => normalizeTime(match[1]))
        .filter(time => time !== null);
      
      if (jumahTimes.length > 0) {
        result.prayerTimes!.jumah_times = jumahTimes;
        result.confidence += 10;
        result.notes.push(`Found Jumu'ah times: ${jumahTimes.join(', ')}`);
      }
    }

    result.success = result.confidence > 30;
    return result;

  } catch (error) {
    result.notes.push(`Plain text extraction error: ${error.message}`);
    return result;
  }
}

function matchPrayerTimesFromCells(cells: string[]): { times: Partial<PrayerTimes>, found: number } {
  const times: Partial<PrayerTimes> = {};
  let found = 0;

  // Common table patterns: [Prayer Name, Time] or [Prayer Name, Adhan, Iqamah]
  for (let i = 0; i < cells.length - 1; i++) {
    const prayerCell = cells[i].toLowerCase();
    const timeCell = cells[i + 1];
    
    // Check if this cell contains a prayer name
    const prayerMatch = prayerCell.match(/(fajr|dhuhr|asr|maghrib|isha|jumah|friday)/);
    if (prayerMatch) {
      const prayer = prayerMatch[1] === 'friday' ? 'jumah' : prayerMatch[1];
      const timeMatch = timeCell.match(/([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/);
      
      if (timeMatch) {
        const normalizedTime = normalizeTime(timeMatch[1]);
        if (normalizedTime) {
          if (prayer === 'jumah') {
            times.jumah_times = [normalizedTime];
          } else {
            times[`${prayer}_adhan` as keyof PrayerTimes] = normalizedTime;
          }
          found++;
          
          // Check for iqamah in next cell
          if (i + 2 < cells.length) {
            const iqamahCell = cells[i + 2];
            const iqamahMatch = iqamahCell.match(/([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/);
            if (iqamahMatch) {
              const normalizedIqamah = normalizeTime(iqamahMatch[1]);
              if (normalizedIqamah && prayer !== 'jumah') {
                times[`${prayer}_iqamah` as keyof PrayerTimes] = normalizedIqamah;
                found++;
              }
            }
          }
        }
      }
    }
  }

  return { times, found };
}

function extractPrayerTimeFromText(text: string): { prayer: string | null, time: string | null } {
  const prayerRegex = /(fajr|dhuhr|asr|maghrib|isha|jumah|friday)\s*[:\-\s]*([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/gi;
  const match = text.match(prayerRegex);
  
  if (match) {
    const timeMatch = match[0].match(/([0-9]{1,2}:[0-9]{2}\s*(?:am|pm|AM|PM)?)/);
    const prayerMatch = match[0].match(/(fajr|dhuhr|asr|maghrib|isha|jumah|friday)/i);
    
    if (timeMatch && prayerMatch) {
      const prayer = prayerMatch[1].toLowerCase();
      const normalizedTime = normalizeTime(timeMatch[1]);
      return { 
        prayer: prayer === 'friday' ? 'jumah' : prayer, 
        time: normalizedTime 
      };
    }
  }
  
  return { prayer: null, time: null };
}

function findDownloadableTimelinks(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']*\.(pdf|xls|xlsx|csv))[^"']*["'][^>]*>/gi;
  
  const matches = [...html.matchAll(linkRegex)];
  for (const match of matches) {
    const url = match[1];
    const linkText = match[0].toLowerCase();
    
    // Check if link text suggests it's a prayer timetable
    if (linkText.includes('prayer') || linkText.includes('timetable') || 
        linkText.includes('times') || linkText.includes('schedule')) {
      links.push(url);
    }
  }
  
  return links;
}

function findEmbeddedSources(html: string): string[] {
  const sources: string[] = [];
  
  // Look for iframes
  const iframeRegex = /<iframe[^>]*src=["']([^"']*?)["'][^>]*>/gi;
  const iframes = [...html.matchAll(iframeRegex)];
  sources.push(...iframes.map(match => match[1]));
  
  // Look for embedded scripts that might load prayer time widgets
  const scriptRegex = /<script[^>]*src=["']([^"']*prayer[^"']*?)["'][^>]*>/gi;
  const scripts = [...html.matchAll(scriptRegex)];
  sources.push(...scripts.map(match => match[1]));
  
  return sources;
}

function extractDateFromHTML(html: string): string | null {
  // Look for date patterns in HTML
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{2,4}/gi,
    /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{2,4}/gi
  ];
  
  const cleanText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  for (const pattern of datePatterns) {
    const matches = cleanText.match(pattern);
    if (matches && matches.length > 0) {
      const dateStr = matches[0];
      const formatted = formatDateFromString(dateStr);
      if (formatted !== getTodayDate()) {
        return formatted;
      }
    }
  }
  
  return null;
}

async function scrapePrayerTimes(website: string): Promise<string | null> {
  try {
    console.log(`Fetching website: ${website}`);
    
    const response = await fetch(website, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 MosqueLocator/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters from ${website}`);
    
    return html;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

function normalizeTime(timeStr: string): string | null {
  if (!timeStr) return null;
  
  try {
    // Clean the time string
    const cleanTime = timeStr.trim().toLowerCase();
    
    // Extract time pattern
    const timeMatch = cleanTime.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
    
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3];
    
    // Validate minutes
    if (minutes >= 60) return null;
    
    // Handle 12-hour to 24-hour conversion
    if (period) {
      if (period === 'am' && hours === 12) {
        hours = 0;
      } else if (period === 'pm' && hours !== 12) {
        hours += 12;
      }
    }
    
    // Validate hours
    if (hours >= 24) return null;
    
    // Format as HH:MM
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error normalizing time:', error);
    return null;
  }
}

function formatDateFromString(dateStr: string): string {
  try {
    // Handle various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // Try parsing DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1]);
      const month = parseInt(ddmmyyyy[2]);
      let year = parseInt(ddmmyyyy[3]);
      
      if (year < 100) year += 2000;
      
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    return getTodayDate();
  } catch (error) {
    return getTodayDate();
  }
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

async function logScrapeAttempt(
  supabase: any,
  mosqueId: string,
  website: string,
  status: string,
  errorMessage: string,
  extractionResult?: ExtractionResult
): Promise<void> {
  try {
    const logData = {
      mosque_id: mosqueId,
      website_url: website,
      success: status === 'success',
      source_format: extractionResult?.sourceFormat || null,
      extraction_confidence: extractionResult?.confidence || 0,
      error_message: errorMessage || null,
      raw_content_preview: status === 'success' ? 'Success' : `Status: ${status}`,
      times_found: extractionResult?.prayerTimes || null
    };

    await supabase
      .from('scraping_logs')
      .insert(logData);
  } catch (error) {
    console.error('Failed to log scrape attempt:', error);
  }
}