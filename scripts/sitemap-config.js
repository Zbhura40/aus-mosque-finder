/**
 * Sitemap Configuration
 *
 * This file defines all routes and their SEO properties for automatic sitemap generation.
 * Update this file when adding new pages to your site.
 */

const BASE_URL = 'https://findmymosque.org';

/**
 * Route configuration
 *
 * @typedef {Object} RouteConfig
 * @property {string} path - The URL path (e.g., "/faq")
 * @property {number} priority - SEO priority (0.0 to 1.0)
 * @property {string} changefreq - How often the page changes (always, hourly, daily, weekly, monthly, yearly, never)
 * @property {string} [lastmod] - Last modification date (ISO format). If not provided, uses current date.
 */

const routes = [
  // Homepage - Highest priority
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily',
  },

  // Main pages
  {
    path: '/faq',
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/imam-profiles',
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/feedback',
    priority: 0.8,
    changefreq: 'monthly',
  },

  // City-specific landing pages - High priority for local SEO
  {
    path: '/mosques-sydney',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/mosques-melbourne',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/mosques-brisbane',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/mosques-perth',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/mosques-adelaide',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/mosques-tasmania',
    priority: 0.9,
    changefreq: 'weekly',
  },

  // Individual mosque pages (query parameters)
  // Lower priority as they're dynamic content
  {
    path: '/?mosque=lakemba-mosque',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=preston-mosque',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=auburn-gallipoli-mosque',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=islamic-society-of-south-australia',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=perth-mosque',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=islamic-council-of-queensland',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=hobart-islamic-centre',
    priority: 0.6,
    changefreq: 'weekly',
  },
  {
    path: '/?mosque=darwin-islamic-society',
    priority: 0.6,
    changefreq: 'weekly',
  },
];

export { BASE_URL, routes };
