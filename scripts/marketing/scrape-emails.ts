/**
 * Puppeteer Email Scraper
 *
 * Scrapes email addresses from mosque websites using Puppeteer
 * Free alternative to Apify website scraper
 */

import { createClient } from '@supabase/supabase-js';
import puppeteer, { Browser, Page } from 'puppeteer';
import dotenv from 'dotenv';
import {
    extractEmailsFromText,
    validateEmail,
    prioritizeEmails,
    EmailValidationResult
} from '../apify/email-validator.js';

// Load environment variables
dotenv.config();

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SECRET_KEY');
    process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Scraping configuration
const CONFIG = {
    batchSize: 10, // Process 10 websites at a time
    timeout: 30000, // 30 seconds per website
    delayBetweenRequests: 3000, // 3 seconds between requests (respectful)
    maxRetries: 2, // Max retry attempts per website
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};

interface Prospect {
    id: string;
    name: string;
    website: string;
    state: string;
    extraction_attempts: number;
}

interface ScrapeResult {
    id: string;
    name: string;
    website: string;
    success: boolean;
    emails: string[];
    verifiedEmails: string[];
    error?: string;
}

/**
 * Extract emails from a single website using Puppeteer
 */
async function scrapeWebsite(
    page: Page,
    prospect: Prospect
): Promise<ScrapeResult> {
    const result: ScrapeResult = {
        id: prospect.id,
        name: prospect.name,
        website: prospect.website,
        success: false,
        emails: [],
        verifiedEmails: []
    };

    try {
        // Set timeout
        page.setDefaultTimeout(CONFIG.timeout);

        // Navigate to website
        const response = await page.goto(prospect.website, {
            waitUntil: 'networkidle2',
            timeout: CONFIG.timeout
        });

        if (!response || !response.ok()) {
            result.error = `HTTP ${response?.status() || 'unknown'}: Failed to load page`;
            return result;
        }

        // Wait a bit for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract page text (body only, skip header/footer noise)
        const pageText = await page.evaluate(() => {
            // Try to get main content area first
            const mainContent = document.querySelector('main, article, .content, #content, .main, #main');
            if (mainContent) {
                return mainContent.textContent || '';
            }
            // Fallback to body
            return document.body.textContent || '';
        });

        // Extract emails from text
        const foundEmails = extractEmailsFromText(pageText);

        if (foundEmails.length === 0) {
            result.error = 'No emails found on page';
            result.success = true; // Not an error, just no emails
            return result;
        }

        // Prioritize emails (official domains first)
        const prioritizedEmails = prioritizeEmails(foundEmails);

        // Validate top 3 emails
        const emailsToValidate = prioritizedEmails.slice(0, 3);
        const validatedEmails: EmailValidationResult[] = [];

        for (const email of emailsToValidate) {
            try {
                const validation = await validateEmail(email);
                validatedEmails.push(validation);
                // Small delay between validations
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`   ⚠️  Validation error for ${email}:`, error);
            }
        }

        // Filter verified emails
        result.emails = foundEmails;
        result.verifiedEmails = validatedEmails
            .filter(v => v.isValid)
            .map(v => v.email);
        result.success = true;

    } catch (error: any) {
        // Handle specific errors
        if (error.name === 'TimeoutError') {
            result.error = 'Timeout: Page took too long to load';
        } else if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
            result.error = 'Domain not found (DNS error)';
        } else if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
            result.error = 'Connection refused';
        } else if (error.message?.includes('ERR_CERT')) {
            result.error = 'SSL certificate error';
        } else {
            result.error = error.message || 'Unknown error';
        }
    }

    return result;
}

/**
 * Update database with scrape results
 */
async function updateProspect(result: ScrapeResult): Promise<void> {
    try {
        const status = result.success
            ? (result.verifiedEmails.length > 0 ? 'completed' : 'completed')
            : 'failed';

        // First, get current attempt count
        const { data: currentData } = await supabase
            .from('marketing_prospects')
            .select('extraction_attempts')
            .eq('id', result.id)
            .single();

        const updateData: any = {
            extraction_status: status,
            extraction_attempts: (currentData?.extraction_attempts || 0) + 1,
            last_extraction_attempt: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Add emails if found
        if (result.verifiedEmails.length > 0) {
            updateData.email_primary = result.verifiedEmails[0] || null;
            updateData.email_secondary = result.verifiedEmails[1] || null;
            updateData.email_tertiary = result.verifiedEmails[2] || null;
            updateData.email_verified = true;
        }

        // Add error message if failed
        if (!result.success && result.error) {
            updateData.extraction_error = result.error;
        }

        // Update database
        const { error } = await supabase
            .from('marketing_prospects')
            .update(updateData)
            .eq('id', result.id);

        if (error) {
            console.error(`   ❌ Database update failed for ${result.name}:`, error.message);
        }

    } catch (error) {
        console.error(`   ❌ Error updating prospect ${result.id}:`, error);
    }
}

/**
 * Main scraping function
 */
async function scrapeEmails() {
    console.log('🤖 Puppeteer Email Scraper Starting...\n');

    let browser: Browser | null = null;

    try {
        // Launch Puppeteer browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent(CONFIG.userAgent);

        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        console.log('✅ Browser ready\n');

        // Get total pending count
        const { count: totalPending } = await supabase
            .from('marketing_prospects')
            .select('*', { count: 'exact', head: true })
            .eq('extraction_status', 'pending')
            .not('website', 'is', null);

        console.log(`📊 Total pending websites: ${totalPending}\n`);

        if (!totalPending || totalPending === 0) {
            console.log('✅ No pending websites to process');
            return;
        }

        // Statistics
        let processed = 0;
        let successful = 0;
        let emailsFound = 0;
        let failed = 0;

        // Process in batches
        let hasMore = true;

        while (hasMore) {
            // Fetch next batch
            const { data: prospects, error } = await supabase
                .from('marketing_prospects')
                .select('id, name, website, state, extraction_attempts')
                .eq('extraction_status', 'pending')
                .not('website', 'is', null)
                .lt('extraction_attempts', CONFIG.maxRetries)
                .order('extraction_attempts', { ascending: true })
                .order('created_at', { ascending: true })
                .limit(CONFIG.batchSize);

            if (error) {
                console.error('❌ Error fetching prospects:', error.message);
                break;
            }

            if (!prospects || prospects.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`📦 Processing batch of ${prospects.length} websites...\n`);

            // Process each website in the batch
            for (const prospect of prospects) {
                processed++;

                console.log(`[${processed}/${totalPending}] ${prospect.name}`);
                console.log(`   🔗 ${prospect.website}`);

                // Scrape website
                const result = await scrapeWebsite(page, prospect as Prospect);

                // Update database
                await updateProspect(result);

                // Log result
                if (result.success) {
                    if (result.verifiedEmails.length > 0) {
                        console.log(`   ✅ Found ${result.verifiedEmails.length} verified email(s): ${result.verifiedEmails.join(', ')}`);
                        successful++;
                        emailsFound += result.verifiedEmails.length;
                    } else {
                        console.log(`   ⚠️  No emails found`);
                        successful++;
                    }
                } else {
                    console.log(`   ❌ Failed: ${result.error}`);
                    failed++;
                }

                console.log();

                // Respectful delay between requests
                await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
            }

            // Show progress
            console.log('📊 Progress Update:');
            console.log(`   Processed: ${processed}/${totalPending}`);
            console.log(`   Successful: ${successful}`);
            console.log(`   Emails found: ${emailsFound}`);
            console.log(`   Failed: ${failed}`);
            console.log();
        }

        // Final statistics
        console.log('✅ Scraping complete!\n');
        console.log('📊 Final Statistics:');
        console.log(`   Total processed: ${processed}`);
        console.log(`   Successful: ${successful}`);
        console.log(`   Emails found: ${emailsFound}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Success rate: ${((successful / processed) * 100).toFixed(1)}%`);
        console.log();

        // Query extraction stats from database
        const { data: stats } = await supabase.rpc('get_extraction_stats');

        if (stats && stats.length > 0) {
            const s = stats[0];
            console.log('📈 Database Statistics:');
            console.log(`   Total prospects: ${s.total_prospects}`);
            console.log(`   With website: ${s.with_website}`);
            console.log(`   With email: ${s.with_email}`);
            console.log(`   Verified emails: ${s.verified_emails}`);
            console.log(`   Pending: ${s.pending_extraction}`);
            console.log(`   Completed: ${s.completed_extraction}`);
            console.log(`   Failed: ${s.failed_extraction}`);
            console.log();
        }

        console.log('🎯 Next Steps:');
        console.log('   1. Review results in Supabase Dashboard');
        console.log('   2. Re-run scraper for failed attempts (automatic retry)');
        console.log('   3. Query campaign-ready prospects: SELECT * FROM get_campaign_ready_prospects()');
        console.log();

    } catch (error) {
        console.error('❌ Scraping failed:', error);
        process.exit(1);
    } finally {
        // Close browser
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

// Run scraper
scrapeEmails();
