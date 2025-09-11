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
    // First, try platform integrations (highest priority)
    console.log('Checking for platform integrations...');
    const platformResult = await detectAndExtractFromPlatforms(website);
    if (platformResult.success) {
      result.prayerTimes = platformResult.prayerTimes;
      result.confidence = platformResult.confidence;
      result.sourceFormat = platformResult.sourceFormat;
      result.notes.push(...platformResult.notes);
      result.success = true;
      return result;
    }
    result.notes.push(...platformResult.notes);

    // Scrape the main HTML content
    const htmlContent = await scrapePrayerTimes(website);
    if (!htmlContent) {
      result.notes.push('Failed to fetch website content');
      return result;
    }

    result.notes.push(`Fetched ${htmlContent.length} characters from website`);

    // Try downloadable documents first (high reliability)
    const downloadableLinks = findDownloadableTimelinks(htmlContent, website);
    for (const link of downloadableLinks) {
      try {
        const docResult = await extractFromDocument(link);
        if (docResult.success && docResult.confidence > result.confidence) {
          result.prayerTimes = docResult.prayerTimes;
          result.confidence = docResult.confidence;
          result.sourceFormat = docResult.sourceFormat;
          result.notes.push(...docResult.notes);
          result.success = true;
        }
      } catch (error) {
        result.notes.push(`Document extraction error for ${link}: ${error.message}`);
      }
    }

    // Try embedded widgets and iframes
    const embeddedSources = findEmbeddedSources(htmlContent, website);
    for (const source of embeddedSources) {
      try {
        const widgetResult = await extractFromWidget(source);
        if (widgetResult.success && widgetResult.confidence > result.confidence) {
          result.prayerTimes = widgetResult.prayerTimes;
          result.confidence = widgetResult.confidence;
          result.sourceFormat = widgetResult.sourceFormat;
          result.notes.push(...widgetResult.notes);
          result.success = true;
        }
      } catch (error) {
        result.notes.push(`Widget extraction error for ${source}: ${error.message}`);
      }
    }

    // Try multiple HTML extraction methods
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

    // Validate and enhance extracted data
    if (result.prayerTimes) {
      const validation = validateAndEnhanceData(result.prayerTimes, htmlContent);
      result.prayerTimes = validation.prayerTimes;
      result.confidence = Math.max(result.confidence, validation.confidence);
      result.notes.push(...validation.notes);
      
      // Flag for admin review if confidence is low but data exists
      if (result.confidence < 50) {
        result.notes.push('ADMIN_REVIEW_REQUIRED: Low confidence extraction');
      }
    }

    // Final success determination
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

function findDownloadableTimelinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']*\.(pdf|xls|xlsx|csv))[^"']*["'][^>]*>(.*?)<\/a>/gi;
  
  const matches = [...html.matchAll(linkRegex)];
  for (const match of matches) {
    let url = match[1];
    const linkText = (match[0] + ' ' + match[3]).toLowerCase();
    
    // Convert relative URLs to absolute
    if (url.startsWith('/')) {
      const baseUrlObj = new URL(baseUrl);
      url = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
    } else if (!url.startsWith('http')) {
      const baseUrlObj = new URL(baseUrl);
      url = `${baseUrlObj.protocol}//${baseUrlObj.host}/${baseUrlObj.pathname.split('/').slice(0, -1).join('/')}/${url}`;
    }
    
    // Check if link suggests it's a prayer timetable
    if (linkText.includes('prayer') || linkText.includes('timetable') || 
        linkText.includes('times') || linkText.includes('schedule') ||
        linkText.includes('salah') || linkText.includes('jamaat') ||
        linkText.includes('iqamah') || linkText.includes('namaz')) {
      links.push(url);
    }
  }
  
  return [...new Set(links)]; // Remove duplicates
}

function findEmbeddedSources(html: string, baseUrl: string): string[] {
  const sources: string[] = [];
  
  // Look for iframes (especially prayer time widgets)
  const iframeRegex = /<iframe[^>]*src=["']([^"']*?)["'][^>]*>/gi;
  const iframes = [...html.matchAll(iframeRegex)];
  for (const match of iframes) {
    let src = match[1];
    
    // Convert relative URLs to absolute
    if (src.startsWith('/')) {
      const baseUrlObj = new URL(baseUrl);
      src = `${baseUrlObj.protocol}//${baseUrlObj.host}${src}`;
    } else if (!src.startsWith('http') && !src.startsWith('//')) {
      const baseUrlObj = new URL(baseUrl);
      src = `${baseUrlObj.protocol}//${baseUrlObj.host}/${baseUrlObj.pathname.split('/').slice(0, -1).join('/')}/${src}`;
    }
    
    sources.push(src);
  }
  
  // Look for embedded scripts that might load prayer time widgets
  const scriptRegex = /<script[^>]*src=["']([^"']*?)["'][^>]*>/gi;
  const scripts = [...html.matchAll(scriptRegex)];
  for (const match of scripts) {
    const src = match[1];
    const scriptContent = match[0].toLowerCase();
    
    if (scriptContent.includes('prayer') || scriptContent.includes('masjid') || 
        scriptContent.includes('mosque') || scriptContent.includes('salah') ||
        scriptContent.includes('mawaqit') || scriptContent.includes('masjidbox')) {
      sources.push(src);
    }
  }
  
  // Look for div elements with data attributes that might indicate widget integration
  const widgetDivRegex = /<div[^>]*(?:data-[^>]*(?:prayer|masjid|mosque|mawaqit|masjidbox)[^>]*|class=["'][^"']*(?:prayer|widget|timetable)[^"']*["'])[^>]*>/gi;
  const widgetDivs = [...html.matchAll(widgetDivRegex)];
  for (const match of widgetDivs) {
    // Extract any data URLs or API endpoints
    const dataUrlMatch = match[0].match(/data-(?:url|src|api)=["']([^"']+)["']/i);
    if (dataUrlMatch) {
      sources.push(dataUrlMatch[1]);
    }
  }
  
  return [...new Set(sources)]; // Remove duplicates
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

// ==================== PLATFORM INTEGRATIONS ====================

async function detectAndExtractFromPlatforms(website: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: null,
    confidence: 0,
    sourceFormat: 'platform_integration',
    notes: [],
    success: false
  };

  try {
    // Fetch the main website to detect platform integrations
    const htmlContent = await scrapePrayerTimes(website);
    if (!htmlContent) {
      result.notes.push('Could not fetch website for platform detection');
      return result;
    }

    // Masjidbox detection and extraction
    const masjidboxResult = await extractFromMasjidbox(htmlContent, website);
    if (masjidboxResult.success) {
      result.notes.push('Successfully connected to Masjidbox platform');
      return masjidboxResult;
    }
    result.notes.push(...masjidboxResult.notes);

    // Mawaqit detection and extraction
    const mawaqitResult = await extractFromMawaqit(htmlContent, website);
    if (mawaqitResult.success) {
      result.notes.push('Successfully connected to Mawaqit platform');
      return mawaqitResult;
    }
    result.notes.push(...mawaqitResult.notes);

    // Prayers Connect detection and extraction
    const prayersConnectResult = await extractFromPrayersConnect(htmlContent, website);
    if (prayersConnectResult.success) {
      result.notes.push('Successfully connected to Prayers Connect platform');
      return prayersConnectResult;
    }
    result.notes.push(...prayersConnectResult.notes);

    // Generic Islamic calendar/timetable services
    const genericResult = await extractFromGenericServices(htmlContent, website);
    if (genericResult.success) {
      result.notes.push('Successfully connected to generic prayer time service');
      return genericResult;
    }
    result.notes.push(...genericResult.notes);

    result.notes.push('No platform integrations detected');
    return result;

  } catch (error) {
    result.notes.push(`Platform detection failed: ${error.message}`);
    return result;
  }
}

async function extractFromMasjidbox(html: string, website: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'masjidbox_platform',
    notes: [],
    success: false
  };

  try {
    // Look for Masjidbox indicators
    const masjidboxPatterns = [
      /masjidbox\.com/i,
      /data-masjidbox/i,
      /masjidbox-widget/i,
      /"masjidbox"/i
    ];

    const foundPattern = masjidboxPatterns.some(pattern => pattern.test(html));
    
    if (!foundPattern) {
      result.notes.push('No Masjidbox integration detected');
      return result;
    }

    // Extract Masjidbox mosque ID or widget configuration
    const idMatches = [
      html.match(/masjidbox\.com\/mosque\/([a-zA-Z0-9\-_]+)/i),
      html.match(/data-masjidbox-id=["']([^"']+)["']/i),
      html.match(/masjidbox_mosque_id['"]\s*:\s*["']([^"']+)["']/i)
    ];

    let mosqueId = null;
    for (const match of idMatches) {
      if (match && match[1]) {
        mosqueId = match[1];
        break;
      }
    }

    if (!mosqueId) {
      result.notes.push('Masjidbox detected but could not extract mosque ID');
      return result;
    }

    result.notes.push(`Found Masjidbox mosque ID: ${mosqueId}`);

    // Try to fetch prayer times from Masjidbox API
    const apiUrl = `https://masjidbox.com/api/mosque/${mosqueId}/prayer-times`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'MosqueLocator/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.prayer_times) {
          // Map Masjidbox format to our format
          const times = data.prayer_times;
          result.prayerTimes = {
            fajr_adhan: normalizeTime(times.fajr?.adhan),
            fajr_iqamah: normalizeTime(times.fajr?.iqamah),
            dhuhr_adhan: normalizeTime(times.dhuhr?.adhan),
            dhuhr_iqamah: normalizeTime(times.dhuhr?.iqamah),
            asr_adhan: normalizeTime(times.asr?.adhan),
            asr_iqamah: normalizeTime(times.asr?.iqamah),
            maghrib_adhan: normalizeTime(times.maghrib?.adhan),
            maghrib_iqamah: normalizeTime(times.maghrib?.iqamah),
            isha_adhan: normalizeTime(times.isha?.adhan),
            isha_iqamah: normalizeTime(times.isha?.iqamah),
            jumah_times: times.jumah ? [normalizeTime(times.jumah)] : undefined,
            date: data.date || getTodayDate()
          };
          
          result.confidence = 90; // High confidence for official API
          result.success = true;
          result.notes.push('Successfully extracted from Masjidbox API');
        }
      }
    } catch (apiError) {
      result.notes.push(`Masjidbox API error: ${apiError.message}`);
    }

    return result;

  } catch (error) {
    result.notes.push(`Masjidbox extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromMawaqit(html: string, website: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'mawaqit_platform',
    notes: [],
    success: false
  };

  try {
    // Look for Mawaqit indicators
    const mawaqitPatterns = [
      /mawaqit\.net/i,
      /data-mawaqit/i,
      /mawaqit-widget/i,
      /"mawaqit"/i,
      /mawaqit\.org/i
    ];

    const foundPattern = mawaqitPatterns.some(pattern => pattern.test(html));
    
    if (!foundPattern) {
      result.notes.push('No Mawaqit integration detected');
      return result;
    }

    // Extract Mawaqit mosque UUID or configuration
    const idMatches = [
      html.match(/mawaqit\.net\/([a-fA-F0-9\-]{36})/i),
      html.match(/data-mawaqit-uuid=["']([^"']+)["']/i),
      html.match(/mawaqit_uuid['"]\s*:\s*["']([^"']+)["']/i),
      html.match(/\/api\/2\.0\/mosque\/([a-fA-F0-9\-]{36})/i)
    ];

    let mosqueUuid = null;
    for (const match of idMatches) {
      if (match && match[1]) {
        mosqueUuid = match[1];
        break;
      }
    }

    if (!mosqueUuid) {
      result.notes.push('Mawaqit detected but could not extract mosque UUID');
      return result;
    }

    result.notes.push(`Found Mawaqit mosque UUID: ${mosqueUuid}`);

    // Try to fetch prayer times from Mawaqit API
    const apiUrl = `https://mawaqit.net/api/2.0/mosque/${mosqueUuid}/prayer-times`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'MosqueLocator/1.0',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.times) {
          // Map Mawaqit format to our format
          const times = data.times;
          result.prayerTimes = {
            fajr_adhan: normalizeTime(times.fajr),
            fajr_iqamah: normalizeTime(times.fajr_iqama),
            dhuhr_adhan: normalizeTime(times.dhuhr),
            dhuhr_iqamah: normalizeTime(times.dhuhr_iqama),
            asr_adhan: normalizeTime(times.asr),
            asr_iqamah: normalizeTime(times.asr_iqama),
            maghrib_adhan: normalizeTime(times.maghrib),
            maghrib_iqamah: normalizeTime(times.maghrib_iqama),
            isha_adhan: normalizeTime(times.isha),
            isha_iqamah: normalizeTime(times.isha_iqama),
            jumah_times: times.jumua ? [normalizeTime(times.jumua)] : undefined,
            date: data.date || getTodayDate()
          };
          
          result.confidence = 90; // High confidence for official API
          result.success = true;
          result.notes.push('Successfully extracted from Mawaqit API');
        }
      }
    } catch (apiError) {
      result.notes.push(`Mawaqit API error: ${apiError.message}`);
    }

    return result;

  } catch (error) {
    result.notes.push(`Mawaqit extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromPrayersConnect(html: string, website: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'prayers_connect_platform',
    notes: [],
    success: false
  };

  try {
    // Look for Prayers Connect indicators
    const prayersConnectPatterns = [
      /prayers\.connect/i,
      /prayersconnect/i,
      /data-prayers-connect/i,
      /"prayers.connect"/i
    ];

    const foundPattern = prayersConnectPatterns.some(pattern => pattern.test(html));
    
    if (!foundPattern) {
      result.notes.push('No Prayers Connect integration detected');
      return result;
    }

    // Extract Prayers Connect mosque ID
    const idMatches = [
      html.match(/prayers\.connect\/mosque\/([a-zA-Z0-9\-_]+)/i),
      html.match(/data-prayers-connect-id=["']([^"']+)["']/i),
      html.match(/prayers_connect_id['"]\s*:\s*["']([^"']+)["']/i)
    ];

    let mosqueId = null;
    for (const match of idMatches) {
      if (match && match[1]) {
        mosqueId = match[1];
        break;
      }
    }

    if (!mosqueId) {
      result.notes.push('Prayers Connect detected but could not extract mosque ID');
      return result;
    }

    result.notes.push(`Found Prayers Connect mosque ID: ${mosqueId}`);
    
    // Note: This is a placeholder for Prayers Connect API
    // In a real implementation, you would need the actual API endpoint and format
    result.notes.push('Prayers Connect platform detected but API integration needs implementation');
    
    return result;

  } catch (error) {
    result.notes.push(`Prayers Connect extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromGenericServices(html: string, website: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'generic_service',
    notes: [],
    success: false
  };

  try {
    // Look for other common prayer time services
    const servicePatterns = [
      { name: 'IslamicFinder', pattern: /islamicfinder\.org/i },
      { name: 'PrayerTimes.co.uk', pattern: /prayertimes\.co\.uk/i },
      { name: 'IslamicSociety', pattern: /islamic.*society.*prayer/i },
      { name: 'MyMasjid', pattern: /mymasjid/i },
      { name: 'SalahTimes', pattern: /salahtimes/i }
    ];

    for (const service of servicePatterns) {
      if (service.pattern.test(html)) {
        result.notes.push(`Detected ${service.name} integration`);
        
        // Try to find API endpoints or data attributes
        const apiMatches = html.match(/api[^"']*prayer[^"']*/gi);
        if (apiMatches) {
          result.notes.push(`Found potential API endpoints: ${apiMatches.slice(0, 3).join(', ')}`);
        }
        
        // For now, we'll fall back to HTML parsing
        result.notes.push(`${service.name} detected but requires custom integration`);
        break;
      }
    }

    return result;

  } catch (error) {
    result.notes.push(`Generic service extraction error: ${error.message}`);
    return result;
  }
}

// ==================== DOCUMENT PARSING ====================

async function extractFromDocument(documentUrl: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'document_file',
    notes: [],
    success: false
  };

  try {
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    result.notes.push(`Attempting to parse ${fileExtension} document: ${documentUrl}`);

    // Download the document
    const response = await fetch(documentUrl, {
      headers: {
        'User-Agent': 'MosqueLocator/1.0'
      }
    });

    if (!response.ok) {
      result.notes.push(`Failed to download document: ${response.status}`);
      return result;
    }

    const arrayBuffer = await response.arrayBuffer();
    
    switch (fileExtension) {
      case 'pdf':
        return await extractFromPDF(arrayBuffer, result);
      case 'csv':
        return await extractFromCSV(arrayBuffer, result);
      case 'xls':
      case 'xlsx':
        return await extractFromExcel(arrayBuffer, result);
      default:
        result.notes.push(`Unsupported document type: ${fileExtension}`);
        return result;
    }

  } catch (error) {
    result.notes.push(`Document extraction error: ${error.message}`);
    return result;
  }
}

async function extractFromPDF(arrayBuffer: ArrayBuffer, result: ExtractionResult): Promise<ExtractionResult> {
  try {
    // For now, we'll note that PDF parsing needs implementation
    // In a real implementation, you would use a PDF parsing library
    result.notes.push('PDF parsing detected but requires PDF.js or similar library implementation');
    result.sourceFormat = 'pdf_document';
    
    // Placeholder for PDF text extraction logic
    // const pdfText = await extractTextFromPDF(arrayBuffer);
    // return await extractFromPlainText(pdfText);
    
    return result;
  } catch (error) {
    result.notes.push(`PDF parsing error: ${error.message}`);
    return result;
  }
}

async function extractFromCSV(arrayBuffer: ArrayBuffer, result: ExtractionResult): Promise<ExtractionResult> {
  try {
    const text = new TextDecoder().decode(arrayBuffer);
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    result.notes.push(`Parsing CSV with ${lines.length} lines`);
    result.sourceFormat = 'csv_document';
    
    // Look for header row
    const headers = lines[0].split(',').map(h => h.toLowerCase().trim());
    const prayerColumns = {
      fajr: headers.findIndex(h => h.includes('fajr')),
      dhuhr: headers.findIndex(h => h.includes('dhuhr') || h.includes('zuhr')),
      asr: headers.findIndex(h => h.includes('asr')),
      maghrib: headers.findIndex(h => h.includes('maghrib')),
      isha: headers.findIndex(h => h.includes('isha'))
    };
    
    // Find today's date row or most recent
    const today = getTodayDate();
    let targetRow = null;
    
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',');
      const dateStr = cells[0];
      
      if (dateStr.includes(today.split('-')[2]) || // Day match
          dateStr.includes(today.split('-')[1])) { // Month match
        targetRow = cells;
        break;
      }
    }
    
    if (!targetRow) {
      targetRow = lines[1]?.split(','); // Use first data row as fallback
    }
    
    if (targetRow) {
      for (const [prayer, colIndex] of Object.entries(prayerColumns)) {
        if (colIndex >= 0 && targetRow[colIndex]) {
          const time = normalizeTime(targetRow[colIndex]);
          if (time) {
            result.prayerTimes![`${prayer}_adhan` as keyof PrayerTimes] = time;
            result.confidence += 15;
          }
        }
      }
      
      result.success = result.confidence > 30;
      result.notes.push(`Extracted ${Object.keys(result.prayerTimes!).length} prayer times from CSV`);
    }
    
    return result;
  } catch (error) {
    result.notes.push(`CSV parsing error: ${error.message}`);
    return result;
  }
}

async function extractFromExcel(arrayBuffer: ArrayBuffer, result: ExtractionResult): Promise<ExtractionResult> {
  try {
    // For now, we'll note that Excel parsing needs implementation
    // In a real implementation, you would use SheetJS or similar library
    result.notes.push('Excel parsing detected but requires SheetJS or similar library implementation');
    result.sourceFormat = 'excel_document';
    
    // Placeholder for Excel parsing logic
    // const workbook = XLSX.read(arrayBuffer);
    // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // const csvData = XLSX.utils.sheet_to_csv(worksheet);
    // return await extractFromCSV(new TextEncoder().encode(csvData), result);
    
    return result;
  } catch (error) {
    result.notes.push(`Excel parsing error: ${error.message}`);
    return result;
  }
}

// ==================== WIDGET EXTRACTION ====================

async function extractFromWidget(widgetUrl: string): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    prayerTimes: {},
    confidence: 0,
    sourceFormat: 'embedded_widget',
    notes: [],
    success: false
  };

  try {
    result.notes.push(`Extracting from widget: ${widgetUrl}`);
    
    // Fetch widget content
    const response = await fetch(widgetUrl, {
      headers: {
        'User-Agent': 'MosqueLocator/1.0',
        'Accept': 'text/html,application/json,*/*'
      }
    });
    
    if (!response.ok) {
      result.notes.push(`Widget fetch failed: ${response.status}`);
      return result;
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON API response
      const data = await response.json();
      return parseWidgetJSON(data, result);
    } else {
      // Handle HTML widget
      const html = await response.text();
      return await extractFromPlainText(html);
    }
    
  } catch (error) {
    result.notes.push(`Widget extraction error: ${error.message}`);
    return result;
  }
}

function parseWidgetJSON(data: any, result: ExtractionResult): ExtractionResult {
  try {
    // Try to parse various JSON formats that might contain prayer times
    const possibleKeys = ['prayer_times', 'times', 'prayers', 'salah', 'data'];
    
    let prayerData = null;
    for (const key of possibleKeys) {
      if (data[key]) {
        prayerData = data[key];
        break;
      }
    }
    
    if (!prayerData) {
      prayerData = data; // Try the root object
    }
    
    // Map common field names to our format
    const fieldMappings = {
      fajr_adhan: ['fajr', 'fajr_adhan', 'dawn', 'subh'],
      dhuhr_adhan: ['dhuhr', 'dhuhr_adhan', 'zuhr', 'noon'],
      asr_adhan: ['asr', 'asr_adhan', 'afternoon'],
      maghrib_adhan: ['maghrib', 'maghrib_adhan', 'sunset'],
      isha_adhan: ['isha', 'isha_adhan', 'night'],
    };
    
    for (const [ourField, possibleNames] of Object.entries(fieldMappings)) {
      for (const name of possibleNames) {
        if (prayerData[name]) {
          const time = normalizeTime(prayerData[name]);
          if (time) {
            result.prayerTimes![ourField as keyof PrayerTimes] = time;
            result.confidence += 15;
            break;
          }
        }
      }
    }
    
    result.success = result.confidence > 30;
    result.notes.push(`Parsed JSON widget data with ${result.confidence} confidence`);
    
    return result;
  } catch (error) {
    result.notes.push(`JSON widget parsing error: ${error.message}`);
    return result;
  }
}

// ==================== DATA VALIDATION AND ENHANCEMENT ====================

function validateAndEnhanceData(prayerTimes: PrayerTimes, html: string): { prayerTimes: PrayerTimes, confidence: number, notes: string[] } {
  const notes: string[] = [];
  let confidence = 0;
  
  try {
    // Validate prayer time ordering (Fajr should be earliest, Isha latest)
    const timeOrder = ['fajr_adhan', 'dhuhr_adhan', 'asr_adhan', 'maghrib_adhan', 'isha_adhan'];
    let previousTime = null;
    
    for (const field of timeOrder) {
      const time = prayerTimes[field as keyof PrayerTimes] as string;
      if (time) {
        const timeMinutes = timeToMinutes(time);
        if (previousTime !== null && timeMinutes < previousTime) {
          notes.push(`WARNING: Prayer time order validation failed for ${field}`);
        } else {
          confidence += 5; // Bonus for correct ordering
        }
        previousTime = timeMinutes;
      }
    }
    
    // Validate that we have core prayer times
    const corePrayers = ['fajr_adhan', 'dhuhr_adhan', 'asr_adhan', 'maghrib_adhan', 'isha_adhan'];
    const foundCorePrayers = corePrayers.filter(prayer => prayerTimes[prayer as keyof PrayerTimes]);
    
    if (foundCorePrayers.length >= 4) {
      confidence += 20; // High confidence for having most core prayers
      notes.push(`Found ${foundCorePrayers.length}/5 core prayer times`);
    } else if (foundCorePrayers.length >= 2) {
      confidence += 10;
      notes.push(`Found ${foundCorePrayers.length}/5 core prayer times - partial data`);
    }
    
    // Enhance with date validation
    const extractedDate = extractDateFromHTML(html);
    if (extractedDate) {
      prayerTimes.date = extractedDate;
      
      // Check if date is current (within last 7 days)
      const dateObj = new Date(extractedDate);
      const today = new Date();
      const daysDiff = Math.abs((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        confidence += 15; // High confidence for current date
        notes.push('Date validation: Current/recent date detected');
      } else if (daysDiff <= 7) {
        confidence += 5;
        notes.push(`Date validation: Date is ${Math.round(daysDiff)} days old`);
      } else {
        notes.push(`WARNING: Date is ${Math.round(daysDiff)} days old - may be outdated`);
      }
    }
    
    // Look for update frequency indicators
    const updateIndicators = [
      /updated?\s*(daily|today|yesterday)/i,
      /last\s*updated?\s*:\s*\d/i,
      /current\s*(week|month)/i
    ];
    
    for (const pattern of updateIndicators) {
      if (pattern.test(html)) {
        confidence += 5;
        notes.push('Found update frequency indicator');
        break;
      }
    }
    
    return { prayerTimes, confidence, notes };
    
  } catch (error) {
    notes.push(`Validation error: ${error.message}`);
    return { prayerTimes, confidence: 0, notes };
  }
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}