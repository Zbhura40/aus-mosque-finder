/**
 * Website Email Scraper Module
 * =============================
 * Extracts email addresses from mosque websites using Apify's website-content-crawler
 *
 * Strategy:
 * - Visit contact, about, and home pages
 * - Extract all email addresses using regex
 * - Prioritize official emails over personal (Gmail, etc.)
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs/promises';
import path from 'path';
import { extractEmailsFromText, prioritizeEmails } from './email-validator.js';
import type { GoogleMapsResult } from './gmaps-scraper.js';

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export interface WebsiteEmailResult {
  mosqueName: string;
  websiteUrl: string;
  emails: string[];
  emailsPrioritized: string[];
  emailsCount: number;
  scrapedPages: number;
  success: boolean;
  error?: string;
}

/**
 * Generate URLs to scrape for a website (contact, about pages)
 */
function generateUrlsToScrape(baseUrl: string): string[] {
  try {
    const url = new URL(baseUrl);
    const base = url.origin;

    return [
      baseUrl, // Home page
      `${base}/contact`,
      `${base}/contact-us`,
      `${base}/about`,
      `${base}/about-us`,
      `${base}/get-in-touch`,
      `${base}/reach-us`,
    ];
  } catch {
    return [baseUrl]; // Fallback to just the base URL
  }
}

/**
 * Scrape a single website for email addresses
 */
async function scrapeWebsiteEmails(
  mosqueName: string,
  websiteUrl: string
): Promise<WebsiteEmailResult> {
  console.log(`\n  🌐 Scraping: ${mosqueName}`);
  console.log(`     URL: ${websiteUrl}`);

  try {
    const urlsToScrape = generateUrlsToScrape(websiteUrl);

    // Run the Website Content Crawler actor
    const run = await client.actor('apify/website-content-crawler').call({
      startUrls: urlsToScrape.map(url => ({ url })),
      maxCrawlDepth: 0, // Don't follow links, just scrape specified pages
      maxCrawlPages: 7, // Max 7 pages per mosque
      crawlerType: 'cheerio', // Fast HTML parser
      dynamicContentWaitSecs: 0, // No JavaScript execution needed
      htmlTransformer: 'readableText',
    }, {
      timeout: 120, // 2 minute timeout per mosque
    });

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`     ✅ Scraped ${items.length} pages`);

    // Extract emails from all pages
    const allEmails: string[] = [];

    items.forEach((item: any) => {
      const text = item.text || item.html || '';
      const emails = extractEmailsFromText(text);

      allEmails.push(...emails);
    });

    // Deduplicate
    const uniqueEmails = [...new Set(allEmails)];

    // Prioritize (official domains first)
    const prioritized = prioritizeEmails(uniqueEmails);

    console.log(`     📧 Found ${uniqueEmails.length} unique email(s)`);

    return {
      mosqueName,
      websiteUrl,
      emails: uniqueEmails,
      emailsPrioritized: prioritized,
      emailsCount: uniqueEmails.length,
      scrapedPages: items.length,
      success: true,
    };

  } catch (error: any) {
    console.log(`     ❌ Error: ${error.message}`);

    return {
      mosqueName,
      websiteUrl,
      emails: [],
      emailsPrioritized: [],
      emailsCount: 0,
      scrapedPages: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Scrape emails from all mosques with websites
 */
export async function scrapeEmailsFromWebsites(
  mosques: GoogleMapsResult[]
): Promise<WebsiteEmailResult[]> {
  console.log('\n' + '='.repeat(60));
  console.log('  WEBSITE EMAIL EXTRACTION');
  console.log('='.repeat(60));

  // Filter mosques with websites
  const mosquesWithWebsites = mosques.filter(m => m.website && m.website.trim());

  console.log(`\n📊 Mosques with websites: ${mosquesWithWebsites.length}/${mosques.length}`);

  if (mosquesWithWebsites.length === 0) {
    console.log('\n⚠️  No mosques with websites found. Skipping website scraping.\n');
    return [];
  }

  const results: WebsiteEmailResult[] = [];

  // Process in batches of 5 to avoid overwhelming Apify
  const BATCH_SIZE = 5;

  for (let i = 0; i < mosquesWithWebsites.length; i += BATCH_SIZE) {
    const batch = mosquesWithWebsites.slice(i, i + BATCH_SIZE);

    console.log(`\n[Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(mosquesWithWebsites.length / BATCH_SIZE)}] Processing ${batch.length} mosques...`);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(mosque =>
        scrapeWebsiteEmails(mosque.title, mosque.website!)
      )
    );

    results.push(...batchResults);

    // Rate limiting: 3 seconds between batches
    if (i + BATCH_SIZE < mosquesWithWebsites.length) {
      console.log('\n⏳ Waiting 3 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Save results
  await saveWebsiteEmailResults(results);

  // Statistics
  const successful = results.filter(r => r.success).length;
  const withEmails = results.filter(r => r.emailsCount > 0).length;
  const totalEmails = results.reduce((sum, r) => sum + r.emailsCount, 0);

  console.log('\n\n📈 WEBSITE SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Mosques processed:   ${results.length}`);
  console.log(`  Successful scrapes:  ${successful} (${Math.round(successful / results.length * 100)}%)`);
  console.log(`  Mosques with emails: ${withEmails} (${Math.round(withEmails / results.length * 100)}%)`);
  console.log(`  Total emails found:  ${totalEmails}`);
  console.log(`  Avg emails/mosque:   ${(totalEmails / withEmails || 0).toFixed(1)}`);
  console.log('='.repeat(60) + '\n');

  return results;
}

/**
 * Save website scraping results
 */
async function saveWebsiteEmailResults(results: WebsiteEmailResult[]): Promise<string> {
  const outputPath = path.join(process.cwd(), 'scripts/apify/data/processed/website-emails.json');

  await fs.writeFile(
    outputPath,
    JSON.stringify(results, null, 2),
    'utf-8'
  );

  console.log(`\n💾 Saved website scraping results to: ${outputPath}`);

  return outputPath;
}
