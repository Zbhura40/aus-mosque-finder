#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Find My Mosque
 *
 * This script generates sitemap.xml automatically from the route configuration.
 * Run this script whenever you add new pages or update content.
 *
 * Usage:
 *   node scripts/generate-sitemap.js
 *   OR
 *   npm run generate-sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BASE_URL, routes } from './sitemap-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(route) {
  const lastmod = route.lastmod || getCurrentDate();
  const loc = `${BASE_URL}${route.path}`;

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
}

/**
 * Generate complete sitemap XML
 */
function generateSitemap() {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  const xmlFooter = `</urlset>`;

  // Group routes by type for better organization
  const mainPages = routes.filter(r => r.path === '/' || (r.path.startsWith('/') && !r.path.includes('?') && !r.path.includes('mosques-')));
  const cityPages = routes.filter(r => r.path.includes('mosques-'));
  const mosquePages = routes.filter(r => r.path.includes('?mosque='));

  const sections = [];

  // Add main pages
  if (mainPages.length > 0) {
    sections.push('  <!-- Main Pages -->');
    sections.push(...mainPages.map(generateUrlEntry));
  }

  // Add city-specific landing pages
  if (cityPages.length > 0) {
    sections.push('\n  <!-- City-Specific Landing Pages -->');
    sections.push(...cityPages.map(generateUrlEntry));
  }

  // Add individual mosque pages
  if (mosquePages.length > 0) {
    sections.push('\n  <!-- Individual Mosque Pages -->');
    sections.push(...mosquePages.map(generateUrlEntry));
  }

  const xmlContent = [
    xmlHeader,
    ...sections,
    xmlFooter
  ].join('\n');

  return xmlContent;
}

/**
 * Write sitemap to public directory
 */
function writeSitemap() {
  const sitemapContent = generateSitemap();
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  try {
    fs.writeFileSync(outputPath, sitemapContent, 'utf8');
    console.log('✅ Sitemap generated successfully!');
    console.log(`📄 Location: ${outputPath}`);
    console.log(`📊 Total URLs: ${routes.length}`);
    console.log(`🔗 Base URL: ${BASE_URL}`);
    console.log(`📅 Generated: ${getCurrentDate()}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Deploy your changes to production');
    console.log('   2. Submit sitemap to Google Search Console');
    console.log(`   3. URL: ${BASE_URL}/sitemap.xml\n`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

/**
 * Validate sitemap configuration
 */
function validateConfig() {
  const errors = [];

  // Check for duplicate paths
  const paths = routes.map(r => r.path);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate paths found: ${duplicates.join(', ')}`);
  }

  // Check for invalid priorities
  routes.forEach(route => {
    if (route.priority < 0 || route.priority > 1) {
      errors.push(`Invalid priority ${route.priority} for ${route.path} (must be 0.0-1.0)`);
    }
  });

  // Check for invalid changefreq values
  const validChangefreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  routes.forEach(route => {
    if (!validChangefreq.includes(route.changefreq)) {
      errors.push(`Invalid changefreq "${route.changefreq}" for ${route.path}`);
    }
  });

  if (errors.length > 0) {
    console.error('❌ Configuration errors found:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
}

// Main execution
console.log('🚀 Starting sitemap generation...\n');
validateConfig();
writeSitemap();
