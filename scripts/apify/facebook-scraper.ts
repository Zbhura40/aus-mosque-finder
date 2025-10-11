/**
 * Facebook Scraper Module (Optional)
 * ===================================
 * Extracts email addresses from Facebook pages for mosques without websites
 *
 * Note: Facebook scraping is less reliable and may have rate limits
 * Use only as fallback for mosques without websites
 */

import { ApifyClient } from 'apify-client';
import { extractEmailsFromText } from './email-validator.js';
import type { GoogleMapsResult } from './gmaps-scraper.js';

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export interface FacebookEmailResult {
  mosqueName: string;
  facebookUrl: string;
  emails: string[];
  phone?: string;
  success: boolean;
  error?: string;
}

/**
 * Extract Facebook page URL from Google Maps data
 */
function extractFacebookUrl(mosque: GoogleMapsResult): string | null {
  // Facebook URL might be in website field or a separate field
  if (mosque.website && mosque.website.includes('facebook.com')) {
    return mosque.website;
  }

  // Check if there's a facebook field (some actors provide this)
  if ((mosque as any).facebook) {
    return (mosque as any).facebook;
  }

  return null;
}

/**
 * Scrape a single Facebook page for emails
 */
async function scrapeFacebookPage(
  mosqueName: string,
  facebookUrl: string
): Promise<FacebookEmailResult> {
  console.log(`\n  📘 Scraping Facebook: ${mosqueName}`);
  console.log(`     URL: ${facebookUrl}`);

  try {
    // Run Facebook Pages Scraper
    const run = await client.actor('apify/facebook-pages-scraper').call({
      startUrls: [{ url: facebookUrl }],
      maxPosts: 0, // Don't scrape posts, just page info
      maxPostDate: undefined,
      maxReviews: 0,
      maxComments: 0,
    }, {
      timeout: 120, // 2 minute timeout
    });

    // Fetch results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items.length === 0) {
      throw new Error('No data returned from Facebook');
    }

    const pageData = items[0];

    // Extract emails from about text, description, etc.
    const textToSearch = [
      pageData.about || '',
      pageData.description || '',
      pageData.contactInfo || '',
      pageData.additionalInfo || '',
    ].join(' ');

    const emails = extractEmailsFromText(textToSearch);

    console.log(`     📧 Found ${emails.length} email(s)`);

    return {
      mosqueName,
      facebookUrl,
      emails,
      phone: pageData.phone,
      success: true,
    };

  } catch (error: any) {
    console.log(`     ❌ Error: ${error.message}`);

    return {
      mosqueName,
      facebookUrl,
      emails: [],
      success: false,
      error: error.message,
    };
  }
}

/**
 * Scrape emails from Facebook pages (fallback for mosques without websites)
 */
export async function scrapeEmailsFromFacebook(
  mosques: GoogleMapsResult[]
): Promise<FacebookEmailResult[]> {
  console.log('\n' + '='.repeat(60));
  console.log('  FACEBOOK EMAIL EXTRACTION (FALLBACK)');
  console.log('='.repeat(60));

  // Filter mosques WITHOUT websites but WITH Facebook pages
  const mosquesWithFacebook = mosques
    .filter(m => !m.website || !m.website.trim()) // No website
    .map(m => ({ mosque: m, fbUrl: extractFacebookUrl(m) }))
    .filter(({ fbUrl }) => fbUrl !== null);

  console.log(`\n📊 Mosques with Facebook (no website): ${mosquesWithFacebook.length}`);

  if (mosquesWithFacebook.length === 0) {
    console.log('\n⚠️  No Facebook pages to scrape. Skipping.\n');
    return [];
  }

  const results: FacebookEmailResult[] = [];

  // Process sequentially (Facebook scraping is sensitive to rate limits)
  for (let i = 0; i < mosquesWithFacebook.length; i++) {
    const { mosque, fbUrl } = mosquesWithFacebook[i];

    console.log(`\n[${i + 1}/${mosquesWithFacebook.length}]`);

    const result = await scrapeFacebookPage(mosque.title, fbUrl!);
    results.push(result);

    // Rate limiting: 5 seconds between requests
    if (i < mosquesWithFacebook.length - 1) {
      console.log('\n⏳ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Statistics
  const withEmails = results.filter(r => r.emails.length > 0).length;

  console.log('\n\n📈 FACEBOOK SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Pages scraped:       ${results.length}`);
  console.log(`  Pages with emails:   ${withEmails} (${Math.round(withEmails / results.length * 100)}%)`);
  console.log('='.repeat(60) + '\n');

  return results;
}

/**
 * Check if Facebook scraping is available
 * (Some Apify subscriptions may not include this actor)
 */
export async function isFacebookScraperAvailable(): Promise<boolean> {
  try {
    await client.actor('apify/facebook-pages-scraper').get();
    return true;
  } catch {
    console.log('\n⚠️  Facebook Pages Scraper not available on your Apify plan. Skipping.\n');
    return false;
  }
}
