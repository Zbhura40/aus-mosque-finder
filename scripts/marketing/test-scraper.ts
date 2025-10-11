/**
 * Test Puppeteer Email Scraper
 *
 * Tests the scraper on a small sample before full extraction
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const CONFIG = {
    testSize: 5, // Only test 5 websites
    timeout: 30000,
    delayBetweenRequests: 3000,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};

interface Prospect {
    id: string;
    name: string;
    website: string;
    state: string;
}

async function testScraper() {
    console.log('🧪 Testing Puppeteer Email Scraper...\n');

    let browser: Browser | null = null;

    try {
        // Get test sample
        const { data: prospects, error } = await supabase
            .from('marketing_prospects')
            .select('id, name, website, state')
            .eq('extraction_status', 'pending')
            .not('website', 'is', null)
            .limit(CONFIG.testSize);

        if (error || !prospects || prospects.length === 0) {
            console.error('❌ No test prospects available');
            return;
        }

        console.log(`📋 Testing with ${prospects.length} websites:\n`);
        prospects.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name}`);
            console.log(`      ${p.website}\n`);
        });

        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent(CONFIG.userAgent);
        await page.setViewport({ width: 1920, height: 1080 });
        console.log('✅ Browser ready\n');

        // Test each website
        let successful = 0;
        let emailsFound = 0;

        for (let i = 0; i < prospects.length; i++) {
            const prospect = prospects[i];
            console.log(`[${i + 1}/${prospects.length}] ${prospect.name}`);
            console.log(`   🔗 ${prospect.website}`);

            try {
                // Navigate
                page.setDefaultTimeout(CONFIG.timeout);
                const response = await page.goto(prospect.website, {
                    waitUntil: 'networkidle2',
                    timeout: CONFIG.timeout
                });

                if (!response || !response.ok()) {
                    console.log(`   ❌ Failed: HTTP ${response?.status() || 'unknown'}\n`);
                    continue;
                }

                // Wait for content
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Extract text
                const pageText = await page.evaluate(() => {
                    const mainContent = document.querySelector('main, article, .content, #content, .main, #main');
                    if (mainContent) {
                        return mainContent.textContent || '';
                    }
                    return document.body.textContent || '';
                });

                // Extract emails
                const foundEmails = extractEmailsFromText(pageText);

                if (foundEmails.length === 0) {
                    console.log(`   ⚠️  No emails found\n`);
                    successful++;
                    continue;
                }

                // Validate top email
                const prioritized = prioritizeEmails(foundEmails);
                const topEmail = prioritized[0];

                const validation = await validateEmail(topEmail);

                if (validation.isValid) {
                    console.log(`   ✅ Found verified email: ${topEmail}`);
                    emailsFound++;
                    successful++;
                } else {
                    console.log(`   ⚠️  Found email but validation failed: ${topEmail}`);
                    console.log(`      Reason: ${validation.error}`);
                    successful++;
                }

                console.log();

                // Delay
                await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));

            } catch (error: any) {
                if (error.name === 'TimeoutError') {
                    console.log(`   ❌ Timeout\n`);
                } else {
                    console.log(`   ❌ Error: ${error.message}\n`);
                }
            }
        }

        // Results
        console.log('📊 Test Results:');
        console.log(`   Processed: ${prospects.length}`);
        console.log(`   Successful: ${successful}`);
        console.log(`   Emails found: ${emailsFound}`);
        console.log(`   Success rate: ${((successful / prospects.length) * 100).toFixed(1)}%`);
        console.log(`   Email rate: ${((emailsFound / prospects.length) * 100).toFixed(1)}%\n`);

        if (emailsFound > 0) {
            console.log('✅ Test passed! Scraper is working correctly.');
            console.log('🎯 Ready to run full extraction: npm run scrape-emails\n');
        } else {
            console.log('⚠️  No emails found in test sample.');
            console.log('   This might be normal - not all websites have emails.');
            console.log('   Review the results and decide if you want to proceed.\n');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

testScraper();
