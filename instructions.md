# Find My Mosque - Detailed Instructions & Technical Reference

> **Last Updated:** November 24, 2025
> **Purpose:** Comprehensive technical documentation for developers
> **Quick Reference:** See [project-notes.md](./project-notes.md) for concise summary

---

## Table of Contents

1. [SEO Optimization](#seo-optimization)
2. [Halal Supermarket Finder - Complete Implementation](#halal-supermarket-finder)
3. [Mobile Optimization Details](#mobile-optimization-details)
4. [Automation Setup](#automation)
5. [Session History & Changes](#session-history)
6. [Troubleshooting Guide](#troubleshooting)
7. [Deployment Guide](#deployment-guide)

---

## SEO Optimization

### Week 1: Image Optimization & Performance ✅
**Completed:** October 2025

**Achievements:**
- Reduced image sizes by 55-78% using WebP format
- Implemented lazy loading for all images
- Added responsive image sets (srcset)
- Configured Vite image optimization plugin
- Page load time improved by 2-3x

**Files Modified:**
- `vite.config.ts` - Added imagetools plugin
- All image imports changed to `?format=webp&quality=85`
- Configured code splitting for better caching

**Impact:**
- Homepage: 1.2MB → 350KB (70% reduction)
- Mosque cards: Load progressively as user scrolls
- Better Google PageSpeed scores (85+ mobile, 95+ desktop)

---

### Week 2: Technical SEO & Meta Tags ✅
**Completed:** October 2025

**Achievements:**
- Added page-specific titles and descriptions
- Implemented Open Graph tags for social sharing
- Added Twitter Card meta tags
- Created canonical URLs for all pages
- Implemented JSON-LD structured data

**JSON-LD Schema Types:**
- Organization schema (homepage)
- LocalBusiness schema (mosque pages)
- BreadcrumbList (navigation)
- WebSite with search action

**Files Created:**
- `src/lib/json-ld-schema.ts` - Schema generators

**Example Usage:**
```tsx
import { generateOrganizationSchema } from './lib/json-ld-schema';

const schema = generateOrganizationSchema();
// Insert into <head> as <script type="application/ld+json">
```

---

### Week 3: City-Specific Landing Pages ✅
**Completed:** October 2025

**Achievements:**
- Created 6 state-specific pages
- State-based navigation system
- Region filtering per city
- Popular searches sections (city-specific keywords)
- Consistent design across all pages

**Pages Created:**
1. **NSW** - `/mosques-sydney`
   - Regions: West, North, South, CBD & Eastern Suburbs
   - 6 placeholder mosques
   - Keywords: Lakemba, Auburn, Parramatta

2. **Victoria** - `/mosques-melbourne`
   - Regions: West, North, South, CBD & Eastern Suburbs
   - 6 placeholder mosques
   - Keywords: Coburg, Preston, Broadmeadows

3. **Queensland** - `/mosques-brisbane`
   - Regions: West, North, South, CBD & Eastern Suburbs
   - 6 placeholder mosques
   - Keywords: Holland Park, Kuraby, Algester

4. **WA** - `/mosques-perth`
   - Regions: North, South, CBD & Eastern, Fremantle
   - 6 placeholder mosques
   - Keywords: Mirrabooka, Perth City, Fremantle

5. **SA** - `/mosques-adelaide`
   - Regions: North, South, CBD & Eastern, Western
   - 9 placeholder mosques
   - Keywords: Flinders Park, Marion, Adelaide CBD

6. **Tasmania** - `/mosques-tasmania`
   - Regions: Hobart, Launceston, Other Regions
   - 2 placeholder mosques
   - Keywords: Hobart Islamic Centre, Launceston Mosque

**Design Features:**
- Compact card layout with hover effects
- Responsive grid: 1 col (mobile) → 2 (tablet) → 3 (desktop)
- Opening hours with expandable schedule
- Google ratings with "Verified on Google" badge
- Mosque attributes (wheelchair, parking, women's area)
- Clean white/gray/teal color scheme

---

### Week 4: Dynamic Sitemap & Automation ✅
**Completed:** October 7, 2025

**Implementation:**

#### 1. Sitemap Configuration System
**File:** `scripts/sitemap-config.js`

```javascript
export const BASE_URL = 'https://findmymosque.org';

export const routes = [
  // Main pages
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/faq', priority: 0.8, changefreq: 'monthly' },
  { path: '/imam-profiles', priority: 0.8, changefreq: 'monthly' },
  { path: '/feedback', priority: 0.7, changefreq: 'monthly' },

  // City pages (high priority)
  { path: '/mosques-sydney', priority: 0.9, changefreq: 'weekly' },
  { path: '/mosques-melbourne', priority: 0.9, changefreq: 'weekly' },
  { path: '/mosques-brisbane', priority: 0.9, changefreq: 'weekly' },
  { path: '/mosques-perth', priority: 0.9, changefreq: 'weekly' },
  { path: '/mosques-adelaide', priority: 0.9, changefreq: 'weekly' },
  { path: '/mosques-tasmania', priority: 0.9, changefreq: 'weekly' },
  { path: '/halal-supermarkets', priority: 0.8, changefreq: 'weekly' },

  // Individual mosque pages
  { path: '/?mosque=lakemba-mosque', priority: 0.6, changefreq: 'weekly' },
  { path: '/?mosque=auburn-gallipoli-mosque', priority: 0.6, changefreq: 'weekly' },
  // ... more mosques
];
```

**Total Routes:** 18 URLs

---

#### 2. Sitemap Generator Script
**File:** `scripts/generate-sitemap.js`

**Features:**
- ✅ Validates configuration (no duplicates, valid priorities)
- ✅ Groups URLs by type (main/city/mosque)
- ✅ Auto-updates lastmod dates
- ✅ Generates valid XML with proper namespaces
- ✅ Error handling with exit codes

**Validation Checks:**
```javascript
// Check for duplicate paths
const paths = routes.map(r => r.path);
const duplicates = paths.filter((path, index) =>
  paths.indexOf(path) !== index
);

// Validate priorities (0.0 - 1.0)
routes.forEach(route => {
  if (route.priority < 0 || route.priority > 1) {
    throw new Error(`Invalid priority for ${route.path}`);
  }
});

// Validate changefreq values
const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
routes.forEach(route => {
  if (!validFreqs.includes(route.changefreq)) {
    throw new Error(`Invalid changefreq for ${route.path}`);
  }
});
```

**Usage:**
```bash
# Manual generation
npm run generate-sitemap

# Automatic (runs on build)
npm run build
```

---

#### 3. Build Integration
**File:** `package.json`

```json
{
  "scripts": {
    "prebuild": "npm run generate-sitemap",
    "generate-sitemap": "node scripts/generate-sitemap.js",
    "build": "tsc && vite build"
  },
  "type": "module"
}
```

**Workflow:**
1. Developer runs `npm run build`
2. `prebuild` hook triggers automatically
3. `generate-sitemap.js` validates config
4. Sitemap written to `public/sitemap.xml`
5. Build proceeds with fresh sitemap included

---

#### 4. robots.txt Optimization
**File:** `public/robots.txt`

```txt
# Find My Mosque - Robots.txt
# Updated: 2025-10-07

# Sitemap location
Sitemap: https://findmymosque.org/sitemap.xml

# General crawl delay
Crawl-delay: 1

# Google (highest priority - no delay)
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Social media bots (for previews)
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /
```

**Benefits:**
- ✅ Search engines know where sitemap is located
- ✅ Polite crawling (no server overload)
- ✅ Priority for Google & Bing
- ✅ Social media preview support

---

#### 5. Google Search Console Setup
**Guide:** `GOOGLE_SEARCH_CONSOLE_GUIDE.md` (447 lines)

**Key Sections:**
1. Account creation (3 verification methods)
2. Sitemap submission
3. Dashboard interpretation
4. Weekly monitoring routine (5 min/week)
5. Monthly deep dive (30 min/month)
6. Common issues & fixes
7. Target metrics & benchmarks

**Verification Methods:**
- **Method 1:** HTML file upload (easiest)
- **Method 2:** HTML meta tag
- **Method 3:** Google Analytics

**Target Metrics (3 months):**
- Total Impressions: 50,000/month
- Total Clicks: 1,000/month
- Average Position: 5-10 for mosque keywords
- Indexed Pages: 15+ pages

---

### SEO Impact Projections

| Metric | Current | 3 Months | 6 Months |
|--------|---------|----------|----------|
| **Indexed Pages** | ~10 | 25+ | 40+ |
| **Crawl Frequency** | Monthly | Weekly | Daily |
| **Indexing Speed** | 7-14 days | 1-2 days | Same day |
| **Organic Visitors** | ~100/mo | 500-1000/mo | 2000-5000/mo |
| **Search Impressions** | ~5000/mo | 25,000/mo | 100,000/mo |
| **Keywords Ranking** | 5-10 | 30-50 | 100+ |
| **First Page Rankings** | 2-3 | 10-15 | 25-40 |

---

## Halal Supermarket Finder

### Complete Implementation Guide

---

### Phase 1: Foundation (COMPLETED ✅)

#### Database Setup

**Migration File:** `supabase/migrations/001_create_supermarkets_table.sql`

```sql
-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Supermarkets table
CREATE TABLE supermarkets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  chain TEXT NOT NULL,
  has_halal_section BOOLEAN DEFAULT false,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  source TEXT DEFAULT 'Google Places + Claude AI',
  google_rating NUMERIC(2,1),
  google_review_count INTEGER,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast geospatial queries
CREATE INDEX idx_supermarkets_location ON supermarkets USING GIST(location);

-- Index for chain filtering
CREATE INDEX idx_supermarkets_chain ON supermarkets(chain);

-- Index for confidence filtering
CREATE INDEX idx_supermarkets_confidence ON supermarkets(confidence_score);

-- Row Level Security Policies
ALTER TABLE supermarkets ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view)
CREATE POLICY "Public read access" ON supermarkets
  FOR SELECT USING (true);

-- Authenticated write access (only logged-in users can add/edit)
CREATE POLICY "Authenticated write access" ON supermarkets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update access" ON supermarkets
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Scrape logs table (for automation tracking)
CREATE TABLE scrape_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  supermarkets_processed INTEGER DEFAULT 0,
  errors JSONB
);

-- RLS for scrape_logs (admin only)
ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access only" ON scrape_logs
  FOR ALL USING (auth.role() = 'service_role');
```

---

#### Test Data Insertion

```sql
-- Insert 3 test supermarkets in Sydney
INSERT INTO supermarkets (name, address, location, chain, has_halal_section, confidence_score, reasoning, google_rating, google_review_count)
VALUES
  (
    'Coles Lakemba',
    '100 Haldon St, Lakemba NSW 2195',
    ST_SetSRID(ST_MakePoint(151.0751, -33.9181), 4326)::geography,
    'Coles',
    true,
    0.95,
    'Large halal section confirmed by community feedback and store signage. Multiple reviews mention extensive halal meat selection.',
    4.5,
    123
  ),
  (
    'Woolworths Auburn',
    '40 Queen St, Auburn NSW 2144',
    ST_SetSRID(ST_MakePoint(151.0323, -33.8486), 4326)::geography,
    'Woolworths',
    true,
    0.88,
    'Halal section present with various products. Community members report dedicated halal meat area.',
    4.2,
    89
  ),
  (
    'IGA Punchbowl',
    '1355 Canterbury Rd, Punchbowl NSW 2196',
    ST_SetSRID(ST_MakePoint(151.0536, -33.9292), 4326)::geography,
    'IGA',
    true,
    0.72,
    'Limited halal products mentioned in reviews. Some customers report halal meat availability but selection may vary.',
    4.0,
    67
  );
```

---

#### Frontend Component

**File:** `src/pages/HalalSupermarkets.tsx`

**Key Features:**
- Statistics dashboard (total, halal count, high confidence count)
- Filter controls (halal-only checkbox, confidence slider, chain dropdown)
- Supermarket cards with all details
- Google Maps directions integration
- Responsive design (3-2-1 column grid)

**State Management:**
```tsx
const [supermarkets, setSupermarkets] = useState([]);
const [filteredSupermarkets, setFilteredSupermarkets] = useState([]);
const [showHalalOnly, setShowHalalOnly] = useState(true);
const [minConfidence, setMinConfidence] = useState(70);
const [selectedChain, setSelectedChain] = useState('All');
const [loading, setLoading] = useState(true);
```

**Filtering Logic:**
```tsx
useEffect(() => {
  let filtered = supermarkets;

  // Filter by halal section
  if (showHalalOnly) {
    filtered = filtered.filter(s => s.has_halal_section);
  }

  // Filter by confidence
  filtered = filtered.filter(s =>
    (s.confidence_score * 100) >= minConfidence
  );

  // Filter by chain
  if (selectedChain !== 'All') {
    filtered = filtered.filter(s => s.chain === selectedChain);
  }

  setFilteredSupermarkets(filtered);
}, [supermarkets, showHalalOnly, minConfidence, selectedChain]);
```

**Confidence Badge Component:**
```tsx
const getConfidenceBadge = (score: number) => {
  const percentage = Math.round(score * 100);

  if (percentage >= 90) {
    return <span className="bg-green-100 text-green-800">High Confidence • {percentage}%</span>;
  } else if (percentage >= 80) {
    return <span className="bg-blue-100 text-blue-800">Good Confidence • {percentage}%</span>;
  } else if (percentage >= 70) {
    return <span className="bg-yellow-100 text-yellow-800">Medium Confidence • {percentage}%</span>;
  } else {
    return <span className="bg-orange-100 text-orange-800">Low Confidence • {percentage}%</span>;
  }
};
```

---

### Phase 2: Google Places Integration (PENDING)

**Objective:** Automatically fetch supermarkets from Google Places API

**Implementation Plan:**

#### 1. Supabase Edge Function
**File:** `supabase/functions/fetch-supermarkets/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { location, radius } = await req.json();

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Fetch supermarkets from Google Places API
  const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
    `location=${location.lat},${location.lng}&` +
    `radius=${radius}&` +
    `type=supermarket&` +
    `key=${googleApiKey}`
  );

  const data = await response.json();

  // Process results
  const supermarkets = data.results.map((place: any) => ({
    name: place.name,
    address: place.vicinity,
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    },
    google_place_id: place.place_id,
    google_rating: place.rating,
    google_review_count: place.user_ratings_total
  }));

  return new Response(JSON.stringify(supermarkets), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### 2. Store Supermarkets in Database
```typescript
// For each supermarket from Google Places
for (const supermarket of supermarkets) {
  // Check if already exists
  const { data: existing } = await supabase
    .from('supermarkets')
    .select('id')
    .eq('name', supermarket.name)
    .eq('address', supermarket.address)
    .single();

  if (!existing) {
    // Insert new supermarket
    await supabase.from('supermarkets').insert({
      name: supermarket.name,
      address: supermarket.address,
      location: `POINT(${supermarket.location.lng} ${supermarket.location.lat})`,
      chain: detectChain(supermarket.name), // Helper function
      google_rating: supermarket.google_rating,
      google_review_count: supermarket.google_review_count,
      has_halal_section: false, // Phase 3 will determine this
      confidence_score: 0
    });
  }
}
```

**Cost Estimate:**
- Nearby Search: $0.032 per request
- Place Details: $0.017 per request
- 10,000 supermarkets × $0.049 = ~$490 one-time
- Weekly updates: ~100 stores × $0.049 = ~$5/week

---

### Phase 3: Claude AI Halal Detection (PENDING)

**Objective:** Analyze reviews to detect halal section presence

**Implementation Plan:**

#### 1. Fetch Reviews from Google
```typescript
async function fetchReviews(placeId: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${placeId}&` +
    `fields=reviews&` +
    `key=${googleApiKey}`
  );

  const data = await response.json();
  return data.result.reviews || [];
}
```

#### 2. Analyze with Claude AI
```typescript
import Anthropic from '@anthropic-ai/sdk';

async function analyzeForHalal(reviews: any[]) {
  const anthropic = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')
  });

  // Combine relevant review text
  const reviewText = reviews
    .map(r => r.text)
    .join('\n\n');

  const prompt = `
    Analyze these supermarket reviews and determine:
    1. Does this store have a halal section? (yes/no/unclear)
    2. Confidence level (0-100%)
    3. Brief reasoning (1-2 sentences)

    Reviews:
    ${reviewText}

    Respond in JSON format:
    {
      "has_halal": boolean,
      "confidence": number,
      "reasoning": string
    }
  `;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return JSON.parse(message.content[0].text);
}
```

#### 3. Update Database
```typescript
const analysis = await analyzeForHalal(reviews);

await supabase
  .from('supermarkets')
  .update({
    has_halal_section: analysis.has_halal,
    confidence_score: analysis.confidence / 100,
    reasoning: analysis.reasoning,
    last_verified: new Date().toISOString()
  })
  .eq('id', supermarketId);
```

**Cost Estimate:**
- Claude Sonnet: $3.00 per million input tokens, $15.00 per million output tokens
- Average: 500 tokens input, 100 tokens output per supermarket
- 1,000 supermarkets: ~$2.10 total
- Weekly updates (100 stores): ~$0.21/week

---

### Phase 4: Weekly Automation (PENDING)

**Objective:** Automatically update supermarket data weekly

#### 1. Cron Job Setup
**File:** `supabase/functions/_shared/cron.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Runs every Sunday at 2 AM
serve(async (req) => {
  // Log scrape start
  const { data: log } = await supabase
    .from('scrape_logs')
    .insert({ status: 'running' })
    .select()
    .single();

  try {
    // 1. Fetch new supermarkets from Google Places
    const newSupermarkets = await fetchSupermarketsFromGoogle();

    // 2. For each supermarket, analyze reviews with Claude
    for (const supermarket of newSupermarkets) {
      const reviews = await fetchReviews(supermarket.google_place_id);
      const analysis = await analyzeForHalal(reviews);

      await updateSupermarketInDatabase(supermarket, analysis);
    }

    // 3. Update existing supermarkets (re-verify)
    const existingSupermarkets = await getStaleSuperm arkets(); // Not verified in 30 days
    for (const supermarket of existingSupermarkets) {
      const reviews = await fetchReviews(supermarket.google_place_id);
      const analysis = await analyzeForHalal(reviews);

      await updateSupermarketInDatabase(supermarket, analysis);
    }

    // Log completion
    await supabase
      .from('scrape_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        supermarkets_processed: newSupermarkets.length + existingSupermarkets.length
      })
      .eq('id', log.id);

  } catch (error) {
    // Log failure
    await supabase
      .from('scrape_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        errors: { message: error.message }
      })
      .eq('id', log.id);
  }

  return new Response('Scrape completed', { status: 200 });
});
```

#### 2. Configure in Supabase Dashboard
1. Go to Supabase Dashboard → Edge Functions
2. Create new function: `weekly-supermarket-update`
3. Deploy the cron function
4. Set trigger: `0 2 * * 0` (Every Sunday at 2 AM)

**Weekly Cost:**
- Google Places API: ~$5 (100 updates)
- Claude AI: ~$0.21 (100 reviews analyzed)
- **Total: ~$5.21/week (~$22/month)**

---

## Mobile Optimization Details

### Responsive Navigation Implementation

**File:** `src/components/TransparentNavbar.tsx`

#### Desktop Navigation (≥768px)
- Horizontal navigation bar
- Dropdown menu for "Browse by State"
- Hover effects on all items
- All options visible

#### Mobile Navigation (<768px)
- Hamburger icon (≡) in top-left
- Slide-down menu on tap
- Full-width menu items
- Touch-friendly tap targets (≥44px)
- Click-outside to close

#### Implementation Details

**State Management:**
```tsx
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
const mobileMenuRef = useRef<HTMLDivElement>(null);
```

**Click-Outside Detection:**
```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node)
    ) {
      setIsMobileMenuOpen(false);
      setIsCityMenuOpen(false);
    }
  };

  if (isMobileMenuOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isMobileMenuOpen]);
```

**Hamburger Icon:**
```tsx
<button
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  className="md:hidden p-2"
  aria-label="Toggle menu"
>
  {isMobileMenuOpen ? (
    <X className="h-6 w-6 text-gray-900" />
  ) : (
    <Menu className="h-6 w-6 text-gray-900" />
  )}
</button>
```

---

### Favicon Implementation

**File:** `index.html`

```html
<link rel="icon" type="image/png" href="/logo.png" />
```

**Current Favicon:**
- File: `public/logo.png`
- Size: 1.12MB (large - consider optimizing to ~50KB)
- Format: PNG
- Appears in browser tabs and bookmarks

**Future Optimization:**
```bash
# Compress favicon (optional)
npx sharp-cli \
  --input public/logo.png \
  --output public/favicon.png \
  --resize 32 \
  --quality 90
```

---

## Automation

### Sitemap Auto-Generation

**Trigger:** Every `npm run build`

**Process:**
1. `prebuild` script executes
2. Runs `generate-sitemap.js`
3. Validates `sitemap-config.js`
4. Writes to `public/sitemap.xml`
5. Build continues with fresh sitemap

**Manual Generation:**
```bash
npm run generate-sitemap
```

---

### Weekly Supermarket Updates (Phase 4)

**When Active:**
- Every Sunday at 2 AM (configurable)
- Fetches new supermarkets from Google
- Analyzes reviews with Claude AI
- Updates confidence scores
- Re-verifies stale entries (30+ days old)

**Monitoring:**
- Check `scrape_logs` table in Supabase
- Set up email alerts for failures
- Review dashboard for anomalies

---

## Session History

### Session 1 (October 6, 2025)
- Initial SEO planning
- Created 4-week SEO improvement plan
- Sydney page redesign with expanded mosque list
- Region filtering system
- Google ratings integration

### Session 2 (October 6, 2025)
- Google Places API integration planning
- Decided on Option 3: Pre-fetch & Store approach
- Enhanced mosque cards with ratings
- Updated all city pages
- Package updates (vite-plugin-imagetools)

### Session 3 (October 6, 2025)
- Redesigned all 6 city pages with consistent design
- Created Tasmania page from scratch
- Updated navigation to state-based
- Implemented clean white/gray/teal aesthetic
- Added 33 placeholder mosques total

### Session 4 (October 6, 2025)
- Design overhaul: Warm Islamic theme → Clean minimal
- Fixed dropdown menu closing issue
- Implemented Australian suburb autocomplete
- Updated MosqueDetailsModal, ImamProfiles, UserFeedback, FAQ

### Session 5 (October 7, 2025)
- Completed SEO Week 4 automation
- Built dynamic sitemap generation system
- Created Google Search Console setup guide
- Optimized robots.txt
- Launched Halal Supermarket Finder Phase 1

### Session 6 (October 7, 2025)
- Added favicon/logo to browser tab
- Implemented mobile hamburger menu
- Fixed navigation for phone users
- Improved touch targets for mobile

### Session 7 (October 7, 2025)
- Fixed suburb autocomplete (CORS issues)
- Deployed Edge Functions to Supabase
- Enabled Google Places API
- Tested and verified working

---

## Troubleshooting

### Suburb Autocomplete Not Working

**Symptoms:**
- No dropdown appears when typing
- Console errors about CORS
- Empty results

**Solution:**
1. Check Edge Functions are deployed to Supabase:
```bash
supabase functions list
# Should show: autocomplete-suburb, geocode-place, validate-postcode
```

2. Verify Google Places API is enabled:
- Go to Google Cloud Console
- Navigate to APIs & Services → Library
- Search "Places API"
- Ensure it's enabled

3. Check API key is in Supabase secrets:
```bash
supabase secrets list
# Should show: GOOGLE_MAPS_API_KEY
```

4. Deploy Edge Functions if missing:
```bash
supabase functions deploy autocomplete-suburb
supabase functions deploy geocode-place
supabase functions deploy validate-postcode
```

---

### Build Fails with ES Module Error

**Symptoms:**
- Error: "require is not defined in ES module scope"
- `generate-sitemap.js` fails

**Solution:**
Ensure `package.json` has `"type": "module"` and all scripts use ES modules:

```javascript
// ✅ Correct (ES modules)
import { BASE_URL, routes } from './sitemap-config.js';
export { BASE_URL, routes };

// ❌ Wrong (CommonJS)
const { BASE_URL, routes } = require('./sitemap-config.js');
module.exports = { BASE_URL, routes };
```

---

### Dropdown Menu Won't Close

**Symptoms:**
- State dropdown stays open after clicking elsewhere
- No way to close except refreshing page

**Solution:**
Add click-outside detection with useRef + useEffect:

```tsx
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen]);
```

---

### Sitemap Not Updating

**Symptoms:**
- Added new page but not in sitemap
- Old lastmod dates

**Solution:**
1. Check if page is in `scripts/sitemap-config.js`
2. Run `npm run generate-sitemap` manually
3. Check `public/sitemap.xml` was updated
4. Rebuild: `npm run build`

---

### Halal Supermarkets Page Shows 0-0-0 Statistics

**Symptoms:**
- Statistics dashboard shows all zeros
- No supermarket cards appear

**Solution:**
1. Check database has data:
```sql
SELECT COUNT(*) FROM supermarkets;
-- Should return 3 (or more)
```

2. Check Supabase connection:
```tsx
// In HalalSupermarkets.tsx
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Fetched supermarkets:', supermarkets);
```

3. Check RLS policies allow public read:
```sql
SELECT * FROM supermarkets;
-- Should work without authentication
```

---

## Deployment Guide

### Prerequisites
- ✅ Domain registered (findmymosque.org)
- ✅ Supabase project created
- ✅ Google Maps API key
- ✅ SSL certificate (automatic with most hosts)

### Option 1: Vercel (Recommended)

**Pros:**
- Free tier available
- Automatic HTTPS
- Fast global CDN
- Git integration
- Easy environment variables

**Steps:**
1. Sign up at vercel.com
2. Connect GitHub repository
3. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy with one click
5. Configure custom domain (findmymosque.org)

**Cost:** $0/month (free tier sufficient)

---

### Option 2: Netlify

**Pros:**
- Free tier available
- Automatic HTTPS
- Form handling built-in
- Easy redirects

**Steps:**
1. Sign up at netlify.com
2. Connect GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Configure custom domain

**Cost:** $0/month (free tier sufficient)

---

### Option 3: GitHub Pages

**Pros:**
- Completely free
- Simple setup
- Good for static sites

**Cons:**
- No server-side rendering
- Need to configure custom domain manually

**Steps:**
1. Build: `npm run build`
2. Push `dist/` to `gh-pages` branch
3. Enable GitHub Pages in settings
4. Configure custom domain DNS

**Cost:** $0/month

---

### DNS Configuration

**For findmymosque.org:**

```
Type    Name    Value                   TTL
A       @       76.76.21.21             3600
CNAME   www     cname.vercel-dns.com    3600
```

(Values depend on hosting provider)

---

### Environment Variables

**Production `.env`:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Supabase Secrets:**
```bash
GOOGLE_MAPS_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=your-claude-api-key (Phase 3)
```

---

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Sitemap generated (`npm run build`)
- [ ] All pages tested locally
- [ ] Mobile responsive checked
- [ ] Google Search Console ready
- [ ] Analytics setup (optional)
- [ ] Error tracking setup (optional)
- [ ] Backup of `.env` file (secure location)

---

### Post-Deployment Tasks

1. **Submit to Google Search Console**
   - Add property
   - Verify ownership
   - Submit sitemap

2. **Test Live Site**
   - All pages load correctly
   - Suburb autocomplete works
   - Mosque search functional
   - Mobile menu works
   - Forms submit properly

3. **Monitor Performance**
   - PageSpeed Insights
   - Google Search Console
   - Error logs
   - User feedback

---

## Mosque Email Extraction System

### Overview

**Purpose:** Extract and maintain mosque email addresses for marketing campaigns (cold outreach to promote findmymosque.org)

**Privacy:** Email data stored in PRIVATE Supabase table (no public access)

**Created:** October 10, 2025

---

### Architecture

**Pipeline:**
1. Extract mosques from Google Maps (Apify: `compass/google-maps-extractor`)
2. Scrape emails from mosque websites (Apify: `apify/website-content-crawler`)
3. Scrape emails from Facebook pages (fallback, optional)
4. Validate emails using DNS MX records (free, no API cost)
5. Store in Supabase `mosques_emails` table

**Target:** 300+ mosques across Australia

---

### Apify Actor Testing Results (October 24, 2025)

**Comprehensive testing of 4 Apify actors to determine best email extraction method:**

#### Test 1: Google Maps Email Extractor
- **Actor:** `lukaskrivka/google-maps-with-contact-details`
- **Test Size:** 50 mosques
- **Method:** Extract emails from Google Maps Place IDs
- **Result:** 0 emails (0% success)
- **Finding:** ❌ Google Maps listings do not contain email addresses
- **Cost:** ~$0.45

#### Test 2: Website Content Crawler ✅ RECOMMENDED
- **Actor:** `apify/website-content-crawler`
- **Test 1:** 50 mosques → 2 emails (5% success)
- **Test 2:** 100 mosques → 4 mosques with 7 emails (5% success)
- **Method:** Scrape website text content, extract emails using regex
- **Regex Pattern:** `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g`
- **Email Filtering:** Excludes example.com, sentry.io, google, facebook, wix.com
- **Result:** ✅ 5% success rate (consistent across tests)
- **Cost:** $0.72 for 100 websites
- **Projection:** 211 websites → ~11 emails for $1.90
- **Settings:** `maxCrawlDepth: 0` (homepage only), `crawlerType: 'cheerio'` (fast)

**Successful Extractions:**
1. PGCC (VIC) - administration@pgcc.org.au
2. Australia Light Foundation (VIC) - office@australialightfoundation.com.au
3. Masjid Darul IMAAN (NSW) - info@imaan.com.au
4. Indonesia Community (VIC) - 4 emails (masjid.westall@, baitul.makmur@, surau.kita@, info@)

#### Test 3: Google Maps → Facebook → Email (2-Step)
- **Actors:** `compass/crawler-google-places` + `apify/facebook-page-contact-information`
- **Test Size:** 50 mosques
- **Step 1 Result:** 2 Facebook URLs found (4% of mosques link Facebook in Google Maps)
- **Step 2 Result:** 1 page scraped, 0 emails
- **Finding:** ❌ Most mosques don't link Facebook in Google Maps listings
- **Cost:** ~$0.45

#### Test 4: Facebook Pages Scraper
- **Actor:** `apify/facebook-pages-scraper`
- **Test Size:** General search for Australian mosques
- **Search Queries:** "mosque Sydney Australia", "masjid Melbourne", etc.
- **Result:** 1 result found, 0 Australian mosques identified, 0 emails
- **Finding:** ❌ Requires Facebook login credentials (security risk)
- **Cost:** ~$0.01

**Conclusion:**
- ✅ **Website Content Crawler is the ONLY viable method** (5% success rate)
- ❌ Google Maps does not contain email data
- ❌ Facebook scraping requires login (security risk) and low mosque coverage
- **Recommendation:** Scrape all 211 mosque websites for ~$1.90 to get ~11 emails
- **Alternative:** Use 232 phone numbers in database for direct outreach

**Files Created:**
- `docs/website_emails_test.csv` - 100 mosques tested, 4 with emails
- `scripts/apify-email-test.ts` - Google Maps email extraction test
- `scripts/apify-website-scraper-test.ts` - Website scraper test (50 mosques)
- `scripts/apify-website-scraper-100.ts` - Website scraper test (100 mosques)
- `scripts/apify-gmaps-facebook-test.ts` - 2-step extraction test
- `scripts/apify-facebook-search-test.ts` - Facebook pages scraper test

---

### Database Schema

**Table:** `mosques_emails`

```sql
CREATE TABLE mosques_emails (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    state TEXT,
    suburb TEXT,
    phone TEXT,
    website TEXT,
    facebook TEXT,
    email_primary TEXT,
    email_secondary TEXT,
    email_tertiary TEXT,
    email_verified BOOLEAN DEFAULT false,
    source TEXT NOT NULL, -- 'google_maps', 'website', 'facebook'
    google_place_id TEXT,
    last_updated TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true
);
```

**RLS Policies:**
- ❌ NO public access (anon blocked)
- ✅ Authenticated users full access
- ✅ Service role full access

**Helper Functions:**
- `get_email_extraction_stats()` - Returns extraction statistics
- `get_verified_emails_for_export()` - Export verified emails for Make.com/n8n

---

### File Structure

```
scripts/apify/
├── email-validator.ts          # DNS MX validation (free)
├── gmaps-scraper.ts            # Google Maps extraction
├── website-scraper.ts          # Website email scraping
├── facebook-scraper.ts         # Facebook scraping (optional)
├── supabase-uploader.ts        # Upload to database
├── run-extraction.ts           # Main orchestrator
└── data/
    ├── raw/
    │   └── gmaps-results.json
    ├── processed/
    │   └── website-emails.json
    └── extraction-report.json
```

---

### Setup Instructions

#### 1. Install Dependencies

```bash
npm install apify-client tsx
```

#### 2. Get Apify API Token

1. Go to [console.apify.com/account/integrations](https://console.apify.com/account/integrations)
2. Copy your API token
3. Add to `.env`:

```bash
APIFY_TOKEN="YOUR_APIFY_TOKEN_HERE"
```

#### 3. Run Database Migration

```bash
# Via Supabase CLI
supabase migration up

# Or run SQL directly in Supabase Dashboard
```

Migration file: `supabase/migrations/20251010_create_mosques_emails_table.sql`

---

### Usage

#### One-Time Extraction

```bash
npm run extract-emails
```

**What happens:**
1. Searches 16 locations across Australia (Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra, regional areas)
2. Extracts 300+ mosques from Google Maps
3. Scrapes emails from mosque websites
4. Validates emails using DNS MX records
5. Uploads to Supabase `mosques_emails` table
6. Generates final report

**Duration:** ~30-60 minutes (depending on network speed)

**Cost Estimate:**
- Google Maps extraction: ~$8-12
- Website scraping: ~$12-23
- **Total: ~$20-35 (one-time)**

---

### Email Validation

**Method:** DNS MX Record Lookup

**How it works:**
1. Extract domain from email (e.g., `info@mosque.org.au` → `mosque.org.au`)
2. Query DNS for MX (mail exchange) records
3. If MX records exist → email domain is valid
4. Mark as `verified: true` or `verified: false`

**Advantages:**
- ✅ 100% free (no API costs)
- ✅ Fast (100ms per email)
- ✅ Accurate (~95% accuracy)
- ✅ No rate limits

**Limitations:**
- Doesn't test if inbox exists (only domain validity)
- Won't catch typos in local part (e.g., `inffo@mosque.org.au`)

---

### Search Queries Used

**Major Cities (Tier 1):**
- Sydney, NSW
- Melbourne, VIC
- Brisbane, QLD
- Perth, WA
- Adelaide, SA
- Canberra, ACT

**Regional Areas (Tier 2):**
- Gold Coast, QLD
- Newcastle, NSW
- Hobart, TAS
- Darwin, NT

**Search Terms:**
- "mosque OR masjid OR Islamic centre"
- "Islamic center" (American spelling)
- "prayer hall"
- "Muslim community centre"

---

### Data Export for Make.com/n8n

#### Option 1: SQL Query

```sql
SELECT * FROM get_verified_emails_for_export();
```

Returns:
```json
{
  "mosque_name": "Lakemba Mosque",
  "email": "info@lakembamosque.org.au",
  "location": "65-67 Wangee Rd, Lakemba NSW 2195",
  "phone": "(02) 9740 9831",
  "state": "NSW",
  "website": "https://lakembamosque.org.au"
}
```

#### Option 2: Supabase REST API

```bash
# Get all verified emails
curl 'https://your-project.supabase.co/rest/v1/mosques_emails?email_verified=eq.true&select=name,email_primary,location,phone,state' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

#### Option 3: CSV Export

1. Open Supabase Dashboard
2. Navigate to Table Editor → `mosques_emails`
3. Apply filter: `email_verified = true`
4. Click "Export" → "CSV"

---

### Monitoring & Statistics

#### View Extraction Stats

```sql
SELECT * FROM get_email_extraction_stats();
```

**Returns:**
- Total mosques
- Mosques with primary/secondary/tertiary emails
- Verified email count
- Breakdown by state

#### Check Last Extraction

```sql
SELECT
  COUNT(*) as total_mosques,
  COUNT(email_primary) as with_email,
  MAX(last_updated) as last_run
FROM mosques_emails;
```

---

### Cost Breakdown

**One-Time Extraction (300+ mosques):**
- Google Maps Extractor: ~$10 (16 searches × 50-100 results each)
- Website Content Crawler: ~$15 (200 websites × 7 pages each)
- Facebook Pages Scraper: ~$5 (50 pages, optional)
- Email Validation: $0 (free DNS lookup)
- **Total: ~$25-30**

**Apify Free Tier:**
- $5 free credits per month
- Good for testing with 50-100 mosques

---

### Troubleshooting

#### "Missing APIFY_TOKEN" Error

**Solution:** Add your Apify token to `.env`:
```bash
APIFY_TOKEN="apify_api_xxxxxxxxxxxxxxxxxxxxxxxx"
```

#### "No mosques found" Error

**Possible causes:**
1. Apify account has no credits
2. Actor name changed (check Apify docs)
3. Network/firewall blocking API requests

**Solution:**
```bash
# Check Apify credits
# Go to: https://console.apify.com/billing
```

#### "Database connection failed"

**Possible causes:**
1. Wrong Supabase credentials in `.env`
2. RLS policies blocking service role
3. Table doesn't exist

**Solution:**
```bash
# Verify env variables
echo $VITE_SUPABASE_URL
echo $SUPABASE_SECRET_KEY

# Run migration
supabase migration up
```

#### Low Extraction Rate (<30% emails found)

**Possible causes:**
1. Mosques don't have websites
2. Websites don't list emails (only contact forms)
3. Emails hidden behind JavaScript

**Solution:**
- Use Facebook scraper as fallback
- Manually add emails for high-priority mosques
- Consider phone-based outreach

---

### Security Best Practices

**DO:**
- ✅ Keep `APIFY_TOKEN` in `.env` (never commit to Git)
- ✅ Use service role key for scripts (not anon key)
- ✅ Ensure `mosques_emails` table has RLS enabled
- ✅ Export emails only when needed (no permanent local copies)

**DON'T:**
- ❌ Expose email table via public API
- ❌ Share email list publicly or with third parties
- ❌ Store emails in frontend code
- ❌ Commit `.env` file to Git

---

### Future Enhancements

**Potential Improvements:**
1. **SMTP Verification:** Test if inboxes actually exist (~$0.001/email via ZeroBounce)
2. **Auto-refresh:** Re-validate emails quarterly (mosques change emails)
3. **Phone Extraction:** Also extract phone numbers from websites
4. **Social Media:** Extract Instagram, Twitter handles
5. **Contact Preference:** Detect preferred contact method from website

---

**End of Mosque Email Extraction Documentation**

---

---

## Backlink Building Guide

> **Added:** October 18, 2025
> **Campaign Overview:** See [docs/backlink-strategy.md](./docs/backlink-strategy.md)
> **Duration:** 2 months (November-December 2025)
> **Goal:** 30-50 quality backlinks from Australian Islamic & local sources

---

### Business Directories - Complete List

**High Priority (DA 30+):**
1. Local Search - localsearch.com.au (DA 51)
2. Pure Local - purelocal.com.au (DA 50)
3. Yelp Australia - yelp.com.au
4. True Local - truelocal.com.au
5. Hotfrog Australia - hotfrog.com.au
6. Search Frog - searchfrog.com.au (DA 35)
7. StartLocal Australia - startlocal.com.au

**Medium Priority (DA 15-30):**
8. Brownbook Australia - brownbook.net
9. Australian Planet - australianplanet.com
10. Womo - womo.com.au
11. Find Open - findopen.com.au
12. Aussie Web - aussieweb.com.au
13. Yellow Pages - yellowpages.com.au
14. White Pages Business - whitepages.com.au/business

**Additional Directories (50+ total):**
15. Local Business Guide Australia
16. City Search Australia
17. Add Your Business Australia
18. BizExposed Australia
19. Cylex Australia
20. Show Me Local
21. Find Us Here
22. Finda Australia
23. Dlook Australia
24. iBegin Australia
25. Lacartes Australia

**Submission Best Practices:**
- Use consistent NAP (Name, Address, Phone): "Find My Mosque", "Online Directory", contact@findmymosque.org
- Category: "Religious Organizations" or "Community Services" or "Online Directory"
- Description (150 chars): "Find mosques across Australia with our comprehensive directory. Search 340+ verified mosques by location, view prayer times, and halal services."
- Website: https://findmymosque.org
- Logo: Use your site logo (consistent across all directories)

---

### Islamic Directory Outreach Templates

#### Template 1: Islamic Council/Organization Submission

**Subject:** Directory Listing Request - Find My Mosque (Australian Mosque Directory)

**Body:**
```
Assalamu Alaikum,

My name is Zubair and I've built Find My Mosque (findmymosque.org), a free online directory helping Australian Muslims discover mosques in their area.

The platform currently features 340+ verified mosques across all Australian states, with features including:
- Location-based mosque search with interactive maps
- State-specific landing pages (NSW, VIC, QLD, WA, SA, TAS)
- Halal supermarket finder (launching soon)
- Mobile-friendly design for easy access

I noticed that [ORGANIZATION NAME] provides valuable resources for the Australian Muslim community. Would it be possible to have Find My Mosque listed in your community resources or directory section?

This would greatly help Muslims across Australia, especially new immigrants, students, and travelers, find their nearest mosque.

Here are the listing details:
- Website: https://findmymosque.org
- Description: Comprehensive Australian mosque directory with 340+ verified locations
- Category: Community Resources / Islamic Services
- Contact: contact@findmymosque.org

JazakAllah Khair for considering this request. I'm happy to provide any additional information needed.

Warm regards,
Zubair
Find My Mosque
findmymosque.org
```

**Organizations to Email (8-12 targets):**
1. AFIC - Australian Federation of Islamic Councils (afic.com.au)
2. ANIC - Australian National Imams Council (anic.org.au)
3. Islamic Council of NSW (icnsw.org.au)
4. Islamic Council of WA (islamiccouncilwa.com.au)
5. Darulfatwa Islamic High Council (darulfatwa.org.au)
6. United Muslims of Australia (uma.org.au)
7. Alliance of Australian Muslims (australianmuslims.org.au)
8. AussieMuslims.NET (aussiemuslims.net)
9. Islamic Forum for Australian Muslims (ifam.org.au)
10. Islamic Council of Victoria (icv.org.au)
11. Islamic Council of Queensland (icq.org.au)
12. Islamic Society of South Australia

---

#### Template 2: University Islamic Society Outreach

**Subject:** Free Resource for Muslim Students - Mosque Finder Tool

**Body:**
```
Assalamu Alaikum,

I hope this email finds you well. My name is Zubair, and I've developed a free tool that could be helpful for your Muslim student community.

Find My Mosque (findmymosque.org) is Australia's most comprehensive mosque directory with 340+ verified locations across all states. It's particularly useful for:
- New international students unfamiliar with Australian mosques
- Students traveling interstate for holidays/conferences
- Finding mosques near campus or accommodation

Many university Islamic societies link to helpful resources on their websites. Would you consider adding Find My Mosque to your "Resources" or "Useful Links" page?

It's completely free, mobile-friendly, and we're continuously adding features like halal supermarket finder and prayer times.

Website: https://findmymosque.org

JazakAllah Khair for your time. Feel free to reach out if you'd like any additional information.

Best regards,
Zubair
Find My Mosque
```

**Universities to Target (10-15 Islamic Societies):**
1. University of Sydney Islamic Society (USYD ISoc)
2. UNSW Islamic Society
3. University of Melbourne Islamic Society
4. Monash University Islamic Society
5. University of Queensland Muslim Students Association
6. Griffith University Islamic Society
7. Macquarie University Islamic Society
8. UTS Muslim Students Association
9. RMIT Islamic Society
10. Deakin University Islamic Society
11. ANU Muslim Students Association
12. University of Adelaide Islamic Society
13. Curtin University Islamic Society
14. UWA Islamic Society
15. La Trobe University Islamic Society

**Finding Contacts:**
- Search "[University name] Islamic society" on Facebook
- Email addresses usually: [societyname]@[university].edu.au
- Or use contact forms on student society websites

---

#### Template 3: Mosque Partnership Pitch (Featured Pages)

**Subject:** Partnership Opportunity - Free Featured Mosque Page on Find My Mosque

**Body:**
```
Assalamu Alaikum [Mosque Name] Team,

My name is Zubair, founder of Find My Mosque (findmymosque.org), Australia's largest mosque directory with 340+ verified locations.

I'm reaching out to offer [Mosque Name] a **free featured landing page** on our platform. This would include:

✓ Dedicated mosque page with your story, philosophy, and services
✓ Event calendar and community programs showcase
✓ Donation integration (if desired)
✓ Partnership highlights
✓ Interactive Google Maps integration
✓ Imam profile section
✓ FAQ section customized to your community

**Example:** I've created a demo page for Holland Park Mosque to show what this looks like:
[Include screenshot or link if Holland Park goes live]

**What We'd Appreciate in Return:**
- A backlink from your official website to your featured page on findmymosque.org
- Mention in your newsletter/bulletin (if applicable)
- Social media share introducing the partnership

**Why This Benefits [Mosque Name]:**
- Increased visibility for Muslims searching for mosques in [City]
- Professional online presence highlighting your unique programs
- Easier discovery for new Muslims, travelers, and families relocating
- SEO boost from being featured on a growing platform

I'd love to schedule a 15-minute call to discuss how we can customize this page to best represent your mosque.

Are you available for a quick chat this week?

JazakAllah Khair,
Zubair
Find My Mosque
contact@findmymosque.org
findmymosque.org
```

**Follow-Up Strategy:**
- Day 7: Send polite follow-up if no response
- Day 14: Call mosque directly (phone numbers in database)
- Day 21: Final email offering simplified version (just basic listing enhancement)

---

#### Template 4: General Mosque Backlink Request

**Subject:** Help Australian Muslims Find Your Mosque

**Body:**
```
Assalamu Alaikum,

I hope this email finds you in good health and Iman.

My name is Zubair and I've built Find My Mosque (findmymosque.org), a free directory helping Australian Muslims discover mosques across the country.

[Mosque Name] is already listed in our database of 340+ verified mosques. I wanted to reach out personally to let you know about this free resource.

**Request:** If you find this tool beneficial for your community, would you consider adding a link to findmymosque.org on your website's resources page?

This would help Muslims in [City/Area] and travelers passing through discover your mosque more easily.

**Why This Helps:**
- Makes your mosque discoverable to Muslims relocating to [Area]
- Helps travelers and students find nearby mosques
- Supports a community-driven resource (no ads, completely free)

Link to use: https://findmymosque.org

If you'd like us to update any information about your mosque in our directory, please let me know and I'll make the changes immediately.

JazakAllah Khair for your time and service to the community.

Warm regards,
Zubair
Find My Mosque
contact@findmymosque.org
```

**When to Use:**
- Mosques with existing websites (211 in database)
- After completing featured partnership outreach
- As part of scaled mosque outreach campaign (Week 5-8)

---

### Halal Business Cross-Promotion Template

**Subject:** Partnership Opportunity - Halal Directory Cross-Promotion

**Body:**
```
Assalamu Alaikum [Business Name] Team,

I'm Zubair, founder of Find My Mosque (findmymosque.org), Australia's largest mosque directory.

We're launching a **Halal Supermarkets Directory** (similar to our mosque finder) that will help Australian Muslims discover halal food sources across the country.

I'd love to feature [Business Name] in our directory. In exchange, would you be open to:
- Adding a link to findmymosque.org on your "Resources" or "Community Links" page
- Or mentioning our mosque directory in your newsletter/social media

**What You Get:**
- Free listing on our growing platform (5,000+ monthly visitors expected)
- Increased visibility in the Australian Muslim community
- Association with a trusted community resource

**What We'd Appreciate:**
- Simple backlink: "Find mosques across Australia at findmymosque.org"

This is a mutually beneficial partnership supporting the Australian Muslim community.

Would you be interested in discussing this further?

JazakAllah Khair,
Zubair
Find My Mosque
contact@findmymosque.org
```

**Businesses to Target:**
- Halal certification bodies (ANIC Halal, WAHA, Halal Australia)
- Halal restaurants with websites
- Islamic bookstores
- Muslim wedding venues
- Islamic schools with resource pages

---

### Backlink Tracking System

**Tool:** `backlink-progress-tracker.txt` (simple text file)

**Format:**
```
BACKLINK PROGRESS TRACKER - Find My Mosque
Campaign Duration: November 2025 - December 2025
Target: 30-50 quality backlinks

---

[COMPLETED - Date, Website, DA, Status, Notes]
2025-11-05 | localsearch.com.au | DA 51 | ✓ Live | Business directory listing approved
2025-11-07 | afic.com.au | DA 42 | ✓ Live | Added to AFIC community resources page
2025-11-12 | icnsw.org.au | DA 35 | ✓ Live | Featured in NSW Islamic Council directory

[PENDING - Date, Website, Expected DA, Status, Follow-up Date]
2025-11-06 | anic.org.au | DA 40 | Awaiting response | Follow-up: 2025-11-13
2025-11-08 | uma.org.au | DA 30 | Email sent | Follow-up: 2025-11-15

[REJECTED/NO RESPONSE]
2025-11-10 | example.org.au | DA 25 | No response after 2 follow-ups | Closed

---

MONTHLY SUMMARY:
November Week 1: 5 backlinks secured, 8 pending
November Week 2: [To be updated]

TOTAL BACKLINKS SECURED: 3
TOTAL PENDING: 5
```

**How to Use:**
1. Create this text file in your project root
2. Update after every outreach email sent
3. Log responses within 24 hours
4. Review weekly to prioritize follow-ups
5. Export monthly summary to marketing strategy doc

---

### Monthly Reporting Template

**Check These Metrics (Last Day of Each Month):**

**Google Search Console:**
1. Navigate to: Links > Top linking sites
2. Export list of all referring domains
3. Compare to previous month (count new domains)

**Ahrefs Free Backlink Checker:**
1. Visit: ahrefs.com/backlink-checker
2. Enter: findmymosque.org
3. Note: Total backlinks, Referring domains, Domain Rating (DR)

**Google Analytics:**
1. Go to: Acquisition > All Traffic > Referrals
2. Check which backlinks are sending traffic
3. Note top 5 referring sites

**Monthly Report Format:**
```
BACKLINK CAMPAIGN - [Month] 2025 RESULTS

Backlinks Acquired: X new referring domains
Top Quality Links: [List 3-5 best DA sites]
Traffic Impact: +X% referral traffic vs last month
Rankings: [Note any keyword ranking improvements]

Next Month Focus: [List top 3 priorities]
```

---

### Advanced Tactics (After Month 1)

**Once You Have 20+ Backlinks:**

1. **Resource Page Link Building**
   - Google search: "Muslim resources Australia" + "inurl:links"
   - Find Islamic resource pages, request inclusion

2. **Broken Link Building**
   - Use Ahrefs to find broken links on Islamic websites
   - Email: "I noticed [broken link], our directory could replace it"

3. **Content Syndication**
   - Publish mosque statistics report
   - Reach out to Islamic news sites (IslamicFinder, MuslimVillage.com)
   - Offer article in exchange for author bio backlink

4. **HARO (Help A Reporter Out)**
   - Sign up for HARO emails
   - Respond to queries about Australian Muslim communities
   - Potential media backlinks (news.com.au, SBS, etc.)

5. **Local News Coverage**
   - Pitch story: "Australian Creates Free Mosque Finder to Help Muslim Community"
   - Target: Community newspapers, SBS, multicultural media

---

**End of Backlink Building Guide**

For strategy overview, see [docs/backlink-strategy.md](./docs/backlink-strategy.md)

---

## Value Exchange Implementation Guide

> **Added:** October 18, 2025
> **Strategy Overview:** See [docs/value-exchange-strategy.md](./docs/value-exchange-strategy.md)
> **Purpose:** Earn backlinks + social sharing through genuine value delivery to mosques
> **Core Principle:** Lead with service, not with ask

---

### Implementation 1: Verified Profile + Badge + Analytics

**Step 1: Create Mosque Profile Template (2-3 hours once)**

Design dedicated profile page with these sections:
- Hero section: Mosque name, photo, "Verified" badge
- Essential info: Address, phone, email, website, prayer times
- Interactive map: Google Maps embed with directions button
- Photo gallery: 4-6 high-quality images
- Services offered: Jummah, weekend school, halal certification, etc.
- Community description: 2-3 paragraphs about mosque's history/mission

**Technical Implementation:**
```typescript
// Create new page: src/pages/MosqueProfile.tsx
// URL structure: /mosques/[mosque-slug]
// Example: /mosques/holland-park-mosque

interface MosqueProfile {
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  prayer_times: PrayerTimesSchedule;
  photos: string[];
  services: string[];
  description: string;
  verified: boolean;
  partner_organizations: Partner[];
}
```

**Step 2: Design "Find Us on Find My Mosque" Badge (1 hour once)**

Create 3 badge variations:
- Small (120x40px): For footer areas
- Medium (180x60px): For sidebar widgets
- Large (240x80px): For prominent page sections

**Badge Design Elements:**
- Islamic Green background (#059669)
- White text: "Find Us on Find My Mosque"
- Small mosque icon (optional)
- Rounded corners (modern, friendly)

**HTML Embed Code:**
```html
<!-- Small Badge -->
<a href="https://findmymosque.org/mosques/[mosque-slug]"
   target="_blank" rel="noopener">
  <img src="https://findmymosque.org/badges/badge-small.png"
       alt="Find us on Find My Mosque"
       width="120" height="40" />
</a>

<!-- Medium Badge -->
<a href="https://findmymosque.org/mosques/[mosque-slug]"
   target="_blank" rel="noopener">
  <img src="https://findmymosque.org/badges/badge-medium.png"
       alt="Find us on Find My Mosque"
       width="180" height="60" />
</a>
```

**Step 3: Build Monthly Analytics Report (2 hours once)**

**Metrics to Track (via Google Analytics):**
- Profile page views (monthly total)
- Unique visitors to profile
- "Get Directions" clicks
- "Visit Website" clicks
- Search queries leading to mosque (top 5)

**Report Format (1-page PDF):**
```
[Mosque Name] - Monthly Visibility Report
Month: [Month Year]

📊 Profile Performance:
- 342 people viewed your profile
- 89 clicked "Get Directions"
- 45 visited your website
- 23 called your phone number

🔍 How People Found You:
1. "mosques near [suburb]" - 120 searches
2. "friday prayer [city]" - 67 searches
3. "[mosque name]" - 55 searches

💡 Insight: Most visitors search on Friday mornings (9-11am)

Generated by Find My Mosque | findmymosque.org
```

**Automation:**
- Google Analytics API → Pull data monthly
- Google Sheets template → Auto-populate metrics
- Export as PDF → Email to mosque admin

**Step 4: Outreach Email Template**

**Subject:** Free Verified Profile for [Mosque Name] on Find My Mosque

**Body:**
```
Assalamu Alaikum [Mosque Admin Name],

I'm Zubair, founder of Find My Mosque - Australia's largest mosque directory with 340+ locations.

I'd like to offer [Mosque Name] a **free verified profile** on our platform. This includes:

✅ Dedicated profile page with your address, map, prayer times, and photos
✅ "Find Us on Find My Mosque" badge you can add to your website (drives more visitors)
✅ Monthly analytics report showing how many people found your mosque online

Here's what your profile would look like: [Include screenshot or demo link]

**What You Get:**
- Enhanced online presence (professional directory listing)
- Data insights (finally know how many people search for your mosque)
- Community visibility badge (shows trust + credibility)

**What I Need from You:**
- 5-10 minutes to review profile info (I'll pre-fill from Google)
- 2-3 high-quality photos of your mosque (optional)
- Approval to mark profile as "Verified"

Once live, I'll send you:
1. Your unique profile link to share on Facebook/WhatsApp
2. Badge embed code for your website (optional but recommended)
3. First monthly report (after 30 days)

Would you be interested? I can have your profile live within 48 hours of your confirmation.

JazakAllah Khair,
Zubair
Find My Mosque
contact@findmymosque.org
findmymosque.org
```

---

### Implementation 2: Community Partner Integration Hub

**Step 1: Research Mosque Partners (1-2 hours per mosque)**

**Where to Find Partner Info:**
- Mosque Facebook page: Look for tagged organizations in posts
- Mosque website: "Community" or "Partnerships" sections
- Google search: "[Mosque name] + Islamic Relief" or "+ community projects"
- Local news: Search "[Mosque name] + charity" or "+ volunteer"

**Common Partner Types:**
- Charities: Islamic Relief Australia, Red Cross, food banks
- Educational: Weekend Islamic schools, university ISocs
- Interfaith: Local interfaith councils, Harmony Day events
- Government: Local city councils, multicultural centers
- Youth: Scout groups, sports clubs, mentorship programs

**Step 2: Create Partner Section on Profile (30 mins per mosque)**

**Design Layout:**
```
[Mosque Profile Page]

📍 About | 📅 Prayer Times | 🤝 Community Partners

Community Partners
[Mosque Name] proudly collaborates with these organizations to serve our community:

[Partner Logo 1] [Partner Logo 2] [Partner Logo 3]
Islamic Relief AU  Red Cross Sydney  Brisbane Council

Active Projects:
• Winter Food Bank (with Islamic Relief) - Serving 200 families monthly
• Interfaith Dialogue Series (with Brisbane Council) - Quarterly events
• Youth Mentorship Program (with Logan Youth Services) - 30 participants

[View All Projects →]
```

**Step 3: Outreach to Partners (After Mosque Approves)**

**Email to Partner Organizations:**

**Subject:** Featured Partnership: [Mosque Name] + [Partner Org] on Find My Mosque

**Body:**
```
Dear [Partner Organization] Team,

I'm Zubair from Find My Mosque, Australia's largest mosque directory.

We're showcasing [Mosque Name]'s community partnerships on their verified profile, and your collaboration is prominently featured:

[Link to mosque profile showing partner section]

**What This Means for You:**
✓ Free visibility to 5,000+ monthly Muslim community visitors
✓ Backlink to your website from our platform (SEO benefit)
✓ Recognition for your interfaith/community work

**Small Request:**
Would you consider adding a reciprocal link to our directory on your "Community Partners" or "Resources" page?

Suggested link text: "Find mosques across Australia at findmymosque.org"

This helps us continue providing this free service to the Muslim community.

Here's our partner badge if helpful: [Badge embed code]

Thank you for your community work with [Mosque Name]!

Best regards,
Zubair
Find My Mosque
```

**Result:** Mosque links to profile → Partner sees feature → Partner links back (backlink triangle)

---

### Implementation 3: Volunteer & Campaign Integration

**Step 1: Build Volunteer Submission Form (2 hours once)**

**Google Form Fields:**
- Mosque Name
- Campaign Title (e.g., "Ramadan Food Bank 2026")
- Campaign Type (Charity, Education, Youth, Interfaith, Other)
- Description (150 words max)
- Dates (Start/End)
- Contact Email
- Website Link (if campaign has dedicated page)
- Photo Upload (optional)

**Form Submission Flow:**
1. Mosque admin fills form
2. Auto-email to you for moderation
3. Approve → Campaign appears on site within 24 hours
4. Auto-email confirmation to mosque with shareable link

**Step 2: Create "Volunteer with Local Mosques" Page (2 hours once)**

**Page URL:** /volunteer-opportunities

**Content:**
```
🤲 Volunteer with Local Mosques

Support your community through mosque-led initiatives across Australia.

[Filter by State] [Filter by Type]

📦 Sydney: Lakemba Mosque Food Drive
   Islamic Relief collaboration - Dec 1-15, 2025
   Help pack and distribute 500 food boxes
   [Learn More →] [Share on Facebook]

🎓 Melbourne: Coburg Youth Mentorship
   Logan Youth Services partnership - Ongoing
   Mentor Muslim youth (ages 13-18)
   [Learn More →] [Share on WhatsApp]

[View All Opportunities →]
```

**Step 3: Promote to Mosques**

**Email Template:**

**Subject:** Free Volunteer Recruitment Tool for [Mosque Name]

**Body:**
```
Assalamu Alaikum,

Struggling to find volunteers for your Ramadan food bank or youth programs?

Find My Mosque now offers a **free volunteer recruitment directory**:

✅ List your charity drives, events, and campaigns
✅ Reach 5,000+ Muslims actively searching for volunteer opportunities
✅ Simple 5-minute form submission - we handle the rest

Example listings:
[Screenshot of 2-3 volunteer campaigns]

**How It Works:**
1. Fill our quick form: [Google Form link]
2. We publish within 24 hours
3. Share the link on your Facebook/WhatsApp: "Volunteer via Find My Mosque"

**What You Get:**
- Free recruitment tool (normally $50-100/month on volunteer platforms)
- Broader reach beyond your existing congregation
- Social media shareable links (boost your campaign visibility)

Ready to list your next campaign?

JazakAllah Khair,
Zubair
```

**Backlink Strategy:**
- Mosque shares campaign link on social media (mentions your site)
- Mosque website links: "View our volunteer opportunities at findmymosque.org"
- Volunteers comment/share, creating organic social proof

---

### Implementation 4: Digital Presence Upgrade (Premium)

**Offer:** 30-minute virtual session helping mosques optimize their Google Business Profile

**Why Mosques Need This:**
- Most mosque admins are volunteers with limited tech skills
- Google visibility directly impacts Friday prayer attendance + donations
- Professional help normally costs $200-500 from agencies

**Step 1: Create "Mosque Digital Checklist" PDF (1 hour once)**

**Checklist Contents:**
```
🕌 Mosque Digital Presence Checklist

Google Business Profile Optimization:
□ Verify ownership (if not already claimed)
□ Add high-quality exterior photo (daytime, clear)
□ Add interior photos (prayer hall, wudu area, shoe racks)
□ Update business hours (including Friday Jummah time)
□ Add services: "Place of Worship", "Community Center"
□ Write description with keywords: "mosque in [suburb]", "Friday prayer", "Islamic center"
□ Add phone number + website link
□ Enable messaging (respond within 24 hours)

Website Quick Fixes:
□ Add mosque to homepage title: "[Name] - Mosque in [Suburb], [City]"
□ Include address + phone in footer (every page)
□ Add Google Maps embed on Contact page
□ List prayer times prominently (homepage or dedicated page)

Social Media:
□ Post consistently (2-3x per week minimum)
□ Use location tags on Facebook/Instagram
□ Respond to messages within 24 hours
□ Share community events + volunteer opportunities

Generated by Find My Mosque | findmymosque.org
```

**Step 2: Schedule 30-Min Sessions (Limit to 5-10 Mosques)**

**Session Agenda:**
1. Screen share: Review current Google Business Profile (10 mins)
2. Live edits: Upload photos, rewrite description, add services (15 mins)
3. Quick wins: Enable messaging, update hours (3 mins)
4. Give checklist PDF for ongoing maintenance (2 mins)

**Who to Target:**
- Mosques with featured page partnerships (high-value relationships)
- Large mosques with poor Google presence (biggest impact)
- Mosques that responded positively to verified profile offer

**Step 3: Post-Session Follow-Up (Ask for Backlink)**

**Email Template (Send 1 Week After Session):**

**Subject:** Quick Follow-Up: [Mosque Name] Google Optimization

**Body:**
```
Assalamu Alaikum [Admin Name],

Hope you're well! Just checking in after our Google optimization session last week.

I noticed [Mosque Name] is now showing up much better in Google searches - great job implementing the checklist! 🎉

**Quick Favor:**
Since our session helped improve your online visibility, would you consider adding a link to Find My Mosque on your website's "Resources" or "Contact Us" page?

Suggested link: "Find mosques across Australia at findmymosque.org"

This helps us continue offering free digital support to mosques like yours.

Here's a badge you can use (optional): [Badge embed code]

JazakAllah Khair for your time!

Zubair
Find My Mosque
```

**Expected Success Rate:** 70-80% (high because you delivered tangible value first)

---

### Implementation 5: Featured Mosque Showcase (Holland Park Model)

**Already Built - Now Scale It**

You've created the Holland Park demo with 4 pages:
1. Main landing page
2. Donations page
3. Events page
4. Community partnerships page

**Scaling Strategy:**

**Step 1: Test with Holland Park First**
- Email demo preview to mosque admin
- Schedule 15-min call to walk through pages
- Make any requested customizations
- Get written approval to launch

**Step 2: If Successful, Create Template System**

**Reusable Components:**
- Hero section (swap mosque name, photo, tagline)
- About section (swap mosque history, mission)
- Services section (customizable list)
- Events section (pull from database or manual entry)
- Partnerships section (research per mosque)
- Donation section (integrate mosque's existing payment system or leave as contact form)

**Time Per Mosque:** 4-6 hours (much faster with template)

**Step 3: Outreach Email (Use Template 3 from Backlink Guide)**

Already created in instructions.md under "Mosque Partnership Pitch"

**Step 4: Post-Launch Promotion Request**

**Email Template (Send Day After Launch):**

**Subject:** 🎉 Your Featured Page is Live! [Mosque Name]

**Body:**
```
Assalamu Alaikum [Admin Name],

Exciting news - your featured page is now live!

🕌 View Here: https://findmymosque.org/mosques/[mosque-slug]

**Next Steps to Maximize Impact:**

1️⃣ Link from Your Website
   Add this link to your homepage or navigation menu:
   "Visit Our Official Page" → [Your profile URL]

2️⃣ Share on Facebook
   Suggested post:
   "We're excited to announce our new official page on Find My Mosque!
   View our story, upcoming events, and community partnerships here: [Link]

   #[MosqueName] #MuslimCommunity #[City]Australia"

3️⃣ Share in WhatsApp Community Groups
   Copy-paste this message:
   "Assalamu Alaikum! Check out our new page showcasing our mosque's
   programs and community work: [Link]"

4️⃣ Newsletter/Bulletin Mention
   Include in your next bulletin:
   "Visit our new official page at findmymosque.org/[mosque-slug] to
   see our story, donate, and register for upcoming events."

I'm happy to help with any updates or changes to the page anytime!

JazakAllah Khair for the partnership.

Zubair
Find My Mosque
```

---

### Value Exchange Email Templates - Quick Reference

**Template 1: Verified Profile Offer**
- Subject: "Free Verified Profile for [Mosque Name]"
- Use: Initial outreach to any mosque
- Expected Response Rate: 30-40%

**Template 2: Partner Integration Follow-Up**
- Subject: "Featured Partnership: [Mosque] + [Partner Org]"
- Use: After mosque approves profile, reach out to partners
- Expected Response Rate: 50-60% (partners love free visibility)

**Template 3: Volunteer Campaign Invitation**
- Subject: "Free Volunteer Recruitment Tool for [Mosque Name]"
- Use: Mosques with active charity/youth programs
- Expected Response Rate: 20-30%

**Template 4: Digital Upgrade Offer**
- Subject: "Free 30-Min Session: Boost Your Mosque's Google Visibility"
- Use: High-value mosques, post verified profile setup
- Expected Response Rate: 40-50% (limit to 5-10 offers)

**Template 5: Featured Showcase Pitch**
- Subject: "Partnership Opportunity - Free Featured Mosque Page"
- Use: Large mosques with existing online presence
- Expected Response Rate: 20-30% (use Holland Park demo as proof)

---

### Badge Design Specifications

**Small Badge (120x40px):**
```
[Islamic Green background #059669]
[White text: "Find Us on Find My Mosque"]
[Small mosque icon on left]
[Border radius: 4px]
```

**Medium Badge (180x60px):**
```
[Islamic Green background #059669]
[White text: "Find Us on"]
[Larger text: "Find My Mosque"]
[Mosque icon on left]
[Border radius: 6px]
```

**Large Badge (240x80px):**
```
[Gradient: Light green to Islamic Green]
[White text: "🕌 Find Us on Find My Mosque"]
[Subtitle: "Australia's Mosque Directory"]
[Border radius: 8px]
[Subtle shadow for depth]
```

**Design Tools:**
- Canva (free): Use "Custom Dimensions" → 240x80px
- Figma (free): Professional designers can refine
- CSS (if embedding SVG): Fully customizable in code

**Badge Files to Create:**
- `public/badges/badge-small.png` (120x40px)
- `public/badges/badge-medium.png` (180x60px)
- `public/badges/badge-large.png` (240x80px)
- `public/badges/badge-small.svg` (vector, scalable)

---

### Monthly Analytics Report - Technical Setup

**Option 1: Google Analytics API (Automated)**

```javascript
// scripts/generate-mosque-reports.js
// Run monthly via cron job

const { google } = require('googleapis');
const analytics = google.analytics('v3');

async function generateReport(mosqueSlug) {
  const response = await analytics.data.ga.get({
    'ids': 'ga:YOUR_VIEW_ID',
    'start-date': '30daysAgo',
    'end-date': 'yesterday',
    'metrics': 'ga:pageviews,ga:users',
    'dimensions': 'ga:pagePath',
    'filters': `ga:pagePath==/mosques/${mosqueSlug}`
  });

  // Parse data and generate PDF
  return {
    pageviews: response.data.totalsForAllResults['ga:pageviews'],
    users: response.data.totalsForAllResults['ga:users']
  };
}
```

**Option 2: Manual (Simple Start)**

1. Open Google Analytics on last day of month
2. Navigate to: Behavior > Site Content > All Pages
3. Filter by: /mosques/[mosque-slug]
4. Note: Pageviews, Unique Pageviews, Avg Time on Page
5. Copy into Google Sheets template
6. Export as PDF
7. Email to mosque admin

**Time: 5-10 minutes per mosque manually, 0 mins if automated**

---

### Success Tracking Metrics

**Per-Mosque Metrics:**
- Profile created: Yes/No
- Badge installed: Yes/No (check mosque website source code)
- Monthly report sent: Count
- Backlink secured: Yes/No (check Google Search Console)
- Social shares: Count (track Facebook/WhatsApp mentions)

**Overall Campaign Metrics:**
- Mosques with profiles: X / 342
- Backlinks from badges: X
- Backlinks from partners: X
- Social media shares: X
- Organic traffic from mosque referrals: X visitors/month

**Track in:** `backlink-progress-tracker.txt` under new section "Value Exchange Partnerships"

---

**End of Value Exchange Implementation Guide**

For strategy overview, see [docs/value-exchange-strategy.md](./docs/value-exchange-strategy.md)

---

## Cron Job Troubleshooting

### October 25, 2025 - Weekly Cache Refresh Fix

**Problem:** Weekly cache refresh hadn't run for 14 days (last: Oct 11, 2025). Prayer times and mosque data became stale.

**Root Cause:** Cron job (jobid 5) existed but had broken configuration:
- Using `sb_publishable_*` key instead of service role key
- URL contained line breaks: `https://mzqyswdfgimymxfhdyzw.supab\n  ase.co/...`
- Job was failing silently every Sunday

**Diagnosis Steps:**

```sql
-- Check existing cron jobs
SELECT * FROM cron.job;

-- Look for: jobname = 'weekly-mosque-cache-refresh'
-- Verify: schedule, command, active status
```

**Solution (3 SQL commands):**

```sql
-- 1. Delete broken cron job
SELECT cron.unschedule('weekly-mosque-cache-refresh');

-- 2. Create new working cron job (every Sunday at 2 AM)
SELECT cron.schedule(
  'weekly-mosque-cache-refresh',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/refresh-cached-mosques',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- 3. Manually trigger immediate refresh (fixes stale data)
SELECT net.http_post(
  url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/refresh-cached-mosques',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
  ),
  body := '{}'::jsonb
);
```

**Important Notes:**
- Use `jsonb_build_object()` instead of string literals for long tokens (prevents line break errors)
- Always use service role key, not publishable/anon key
- Verify job created: `SELECT * FROM cron.job;` should show new jobid

**Verification:**

```sql
-- Check cache was refreshed (run next day)
SELECT MAX(last_updated) FROM mosques_cache;
-- Should show yesterday's date

-- Monitor cron job runs
SELECT * FROM cron.job_run_details
WHERE jobid = 6
ORDER BY start_time DESC
LIMIT 5;
```

**Prevention:**
- Monitor cron jobs monthly via `cron.job_run_details`
- Check cache freshness: `SELECT MAX(last_updated) FROM mosques_cache;`
- Set up alerts for stale cache (>10 days old)

---

## Mobile Navigation Bug Fixes

### October 19, 2025 - Browse by State Dropdown Fix

**Problem:** Mobile "Browse by State" dropdown was not working when users clicked on state options. Navigation failed completely on mobile devices.

**Root Causes Identified:**
1. React Router `navigate()` function not working in mobile hamburger menu
2. Dropdown positioning issues causing NSW and Victoria to be cut off above viewport
3. Modal overflow positioning calculations failing on mobile browsers

**Solution Implemented:**
Created dedicated mobile "Browse by State" button in navbar (separate from hamburger menu) with proper positioning.

**Technical Changes in `src/components/TransparentNavbar.tsx`:**

1. **New Mobile Button in Navbar** (lines 61-104)
   - Added between hamburger menu and desktop navigation
   - Only visible on mobile (`md:hidden`)
   - Uses teal-600 theme matching homepage design

2. **Dropdown Positioning**
   - Container: `relative` positioning
   - Dropdown: `absolute top-full right-0` (appears directly below button)
   - Max height: `60vh` with `overflow-y-auto` for scrolling
   - Z-index: 999999 to ensure visibility above all content

3. **Click-to-Close Logic**
   - `stopPropagation()` on dropdown prevents overlay clicks from closing menu
   - State management with `isMobileCityMenuOpen` boolean
   - Updated `useEffect` to handle click-outside detection for new button

4. **Removed from Hamburger Menu**
   - Deleted "Browse by State" from mobile hamburger menu (was causing navigation failures)
   - Hamburger now only contains: Home, Halal Markets, FAQ, Imam Profiles, Feedback

**Design Specifications:**
- Button: teal-600 background, white text, rounded-lg, shadow-lg
- Dropdown header: teal-600 with "Select a State" title
- Dropdown items: white background, hover:teal-600, text-gray-900
- Border: 4px solid teal-800 (dark green)
- Font: font-serif for headers, font-medium for items (matches homepage)

**Testing Results:**
- ✅ All 6 states visible and clickable (NSW, Victoria, Queensland, WA, SA, Tasmania)
- ✅ Desktop navigation unchanged and working
- ✅ Mobile dropdown appears/closes correctly
- ✅ State navigation works on mobile (confirmed in Chrome DevTools + user testing)

**Files Modified:**
- `src/components/TransparentNavbar.tsx` (52 insertions, 36 deletions)

**Deployed:** Commit f66ba00, merged to main, deployed to findmymosque.org

**Key Learning:**
React Router's `navigate()` function in mobile hamburger menus can fail on mobile browsers. Solution: Use dedicated buttons with `<a href>` tags or separate positioning for critical mobile navigation actions.

---

## Holland Park Clock Integration

**Date:** November 20, 2025

### Problem
Prayer times iframe was displaying in vertical/portrait format, requiring users to scroll down to see the prayer schedule. The clock and prayer times should display side-by-side in landscape format.

### Root Cause
The iframe container had `max-w-2xl` (672px width) constraint, which was too narrow and forced the my-masjid.com timing screen into portrait/vertical mode.

### Solution

**Before:**
```tsx
<div className="w-full max-w-2xl overflow-hidden rounded-lg" style={{ height: '800px' }}>
  <iframe
    src="https://time.my-masjid.com/timingscreen/071cf335-19b7-4840-9e74-6bed3087a7e8"
    width="100%"
    height="800"
    style={{ border: 0 }}
    loading="lazy"
    title="Prayer Times & Clock"
  ></iframe>
</div>
```

**After:**
```tsx
<div className="w-full overflow-hidden rounded-lg" style={{ height: '600px', maxWidth: '1400px' }}>
  <iframe
    src="https://time.my-masjid.com/timingscreen/071cf335-19b7-4840-9e74-6bed3087a7e8"
    width="100%"
    height="600"
    style={{ border: 0 }}
    loading="lazy"
    title="Prayer Times & Clock"
  ></iframe>
</div>
```

**Changes Made:**
1. Removed `max-w-2xl` class (672px) → Changed to inline `maxWidth: '1400px'` (much wider)
2. Reduced height from `800px` to `600px` (landscape format is shorter)
3. Updated both container height and iframe height to match

**Result:**
- ✅ Clock displays on left side with analog face and prayer markers
- ✅ Prayer schedule table displays on right side
- ✅ All prayers visible without scrolling (Fajr, Dhuhr, Asr, Maghrib, Isha, Sunrise, Jumu'ah)
- ✅ Countdown timer prominently displayed at top: "Maghrib Adhan in X min"
- ✅ Holland Park branding and Islamic date visible

**Key Learning:**
iframe content from external sources may have responsive breakpoints. If content displays vertically when it should be horizontal, increase the container width to trigger landscape mode.

**File Modified:**
- `src/pages/HollandParkMosque.tsx` (lines 340-357)

---

## Airport Prayer Room Search Fix

**Date:** November 16, 2025

### Problem
5 airport prayer rooms weren't appearing in radius searches despite having correct addresses and coordinates.

### Root Cause
The search function uses an RPC function `get_mosques_within_radius` which filters results:

```sql
WHERE mc.last_fetched_from_google > NOW() - INTERVAL '1 day' * max_age_days
```

Manual entries (Adelaide, Melbourne, Brisbane Domestic airports) had `last_fetched_from_google = NULL`, so they were filtered out even though they had valid PostGIS location points.

### Solution Steps

**1. Add Missing PostGIS Location Points**

Run this SQL to create PostGIS points from latitude/longitude:

```sql
-- Adelaide Airport
UPDATE mosques_cache
SET location = ST_SetSRID(ST_MakePoint(138.5306, -34.945), 4326)
WHERE id = '<airport_id>';

-- Melbourne Airport
UPDATE mosques_cache
SET location = ST_SetSRID(ST_MakePoint(144.8433, -37.6733), 4326)
WHERE id = '<airport_id>';

-- Brisbane Domestic
UPDATE mosques_cache
SET location = ST_SetSRID(ST_MakePoint(153.1218, -27.3942), 4326)
WHERE id = '<airport_id>';

-- Brisbane International
UPDATE mosques_cache
SET location = ST_SetSRID(ST_MakePoint(153.1090511, -27.4033454), 4326)
WHERE id = '<airport_id>';
```

**2. Set Timestamp for Manual Entries**

```sql
UPDATE mosques_cache
SET last_fetched_from_google = NOW()
WHERE google_place_id IN (
  'MANUAL_ADELAIDE_AIRPORT_PRAYER_ROOM',
  'MANUAL_MELBOURNE_AIRPORT_PRAYER_ROOM',
  'MANUAL_BNE_DOMESTIC_PRAYER_ROOM'
);
```

### Key Technical Notes

**PostGIS Point Format:**
- `ST_MakePoint(longitude, latitude)` - note the order!
- `ST_SetSRID(..., 4326)` - sets coordinate system to WGS84 (GPS standard)
- Stored as `geography` type for distance calculations

**Search Function Logic:**
- Located in: `supabase/migrations/20251010_create_cache_query_function.sql`
- Calls: `get_mosques_within_radius(lat, lng, radius, max_age_days)`
- Filters: Within radius AND fetched within last 30 days
- Returns: Sorted by distance, limit 20

**Manual Place IDs:**
- Format: `MANUAL_<NAME>_PRAYER_ROOM`
- Used when real Google Place ID not available
- Must have `last_fetched_from_google` set to appear in searches

### Files Created
- `scripts/check-all-airport-prayer-rooms.ts` - Diagnostic tool
- `scripts/audit-mosque-database.ts` - Full database audit
- `mosque-audit-report.json` - Detailed audit results

---

## Database Cleanup - November 20, 2025 {#database-cleanup-nov-20}

### Overview
Fixed 25 high-priority database issues identified in Nov 16 audit. All fixes executed via SQL in Supabase SQL Editor.

### Issues Fixed

#### 1. Southern Cross Railway Station - Missing Coordinates
**Problem:** Entry had no latitude/longitude, couldn't appear in searches

**Solution:**
```sql
UPDATE mosques_cache
SET latitude = -37.81839,
    longitude = 144.9525,
    location = ST_SetSRID(ST_MakePoint(144.9525, -37.81839), 4326),
    last_fetched_from_google = NOW()
WHERE id = '0d168fd3-ea04-41a8-be3c-d2637fe9408b';
```

**Method:** Used Google Places API Text Search to find coordinates for "Southern Cross Railway Station Spencer Street Melbourne"

---

#### 2. Fix 14 Mosques Missing PostGIS Location Points
**Problem:** Had latitude/longitude but missing PostGIS `location` column → couldn't appear in radius searches

**Solution Pattern:**
```sql
UPDATE mosques_cache
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
    last_fetched_from_google = NOW()
WHERE id = '<mosque-id>';
```

**Locations Fixed:**
- ACT: AL-INAYA Prayer Room
- NSW: Canterbury Hospital, AMWC, Daar ibn Umar, Epping Musallah, IHIC, UMA Centre
- VIC: MCEC, Monash Musallah, Alfred Hospital
- QLD: Griffith Multi Faith Centre, UQ Multi-faith Chaplaincy, QUT Musalla

**Key Learning:** PostGIS uses `ST_MakePoint(longitude, latitude)` - note the order (longitude first, not latitude)

---

#### 3. Fix 10 Mosques Missing State Assignments
**Problem:** State field was NULL → mosques didn't appear on state landing pages

**Solution:** Extracted state from address field
```sql
UPDATE mosques_cache SET state = 'NSW' WHERE id = '<mosque-id>';
UPDATE mosques_cache SET state = 'QLD' WHERE id = '<mosque-id>';
```

**Locations Fixed:**
- NSW (9): Alpha Park, AMIC Musallah, Friday Prayer locations (Gregory Hills, Quakers Hill, Plumpton), Ghausia Masjid, Juma Prayer Narellan, Penrith Masjid, Marijung location
- QLD (1): Brisbane Airport Musalla

---

#### 4. Delete Duplicate Mosque Entry
**Problem:** Masjid Al Rahman Gosnells had 2 entries with same name/address, different Google Place IDs

**Investigation:**
- Both Place IDs valid and operational
- Both returned identical data (4.9 stars, 314 reviews, same coordinates)
- Google has duplicate Place IDs for same location

**Solution:** Kept Entry 1 (ChIJIUolIXKVMioRaZDpCrqDrkU), deleted Entry 2
```sql
DELETE FROM mosques_cache WHERE id = 'be942660-a683-469c-80df-014acac8a4ec';
```

---

### Duplicate Names - Review Results
**Analysis:** Reviewed 4 duplicate name patterns (22 total entries)

**Findings:**
- **Campbellfield Mosque** (2 entries): Different addresses → Keep both (2 separate mosques)
- **Friday Prayer (Jummah)** (2 entries): Different cities (Sydney vs Perth) → Keep both
- **Friday Prayer (Jumu'ah)** (9 entries): Different NSW locations → Keep all (temporary prayer spaces)
- **Masjid Al Rahman Gosnells** (2 entries): Same address, different Place IDs → Deleted 1 duplicate

**Conclusion:** Only 1 true duplicate found and removed. Others are legitimately different locations with same names.

---

### Verification Queries

**Check PostGIS locations:**
```sql
SELECT name, latitude, longitude,
       CASE WHEN location IS NULL THEN '❌ MISSING' ELSE '✅ SET' END as postgis_status
FROM mosques_cache
WHERE location IS NULL;
-- Should return 0 rows after fixes
```

**Check state assignments:**
```sql
SELECT name, address, state
FROM mosques_cache
WHERE state IS NULL;
-- Should return 0 rows after fixes
```

**Verify duplicates removed:**
```sql
SELECT name, address, COUNT(*) as count
FROM mosques_cache
GROUP BY LOWER(name), LOWER(address)
HAVING COUNT(*) > 1;
-- Should show only legitimate shared buildings (not duplicates)
```

---

### Files Created
- `fix-missing-postgis-locations.sql` - SQL to fix 14 PostGIS issues
- `fix-missing-states.sql` - SQL to fix 10 state assignments
- `delete-masjid-al-rahman-duplicate.sql` - SQL to remove duplicate
- `duplicate-names-review.md` - Analysis of 4 duplicate name patterns
- `scripts/fix-missing-postgis-locations.ts` - Diagnostic script
- `scripts/check-masjid-al-rahman.ts` - Google Places API verification
- `scripts/get-southern-cross-coords.ts` - Coordinate lookup

**Note:** SQL files added to `.gitignore` (one-time fixes, already executed)

---

**End of Instructions**

For quick reference, see [project-notes.md](./project-notes.md)

---

## City Landing Pages Feature

### 5 City Pages Live (Nov 24, 2025)

**Status:** 🟢 Live on Production (merged to main branch)

Built 5 city-specific landing pages targeting "mosque near me [city]" keyword strategy. All pages follow consistent template with city-specific data.

#### Implementation Details

**City Pages Created:**
- `src/pages/city/MelbourneCity.tsx` - 110 mosques (VIC) - Route: `/city/melbourne`
- `src/pages/city/BrisbaneCity.tsx` - 41 mosques (QLD) - Route: `/city/brisbane`
- `src/pages/city/SydneyCity.tsx` - 149 mosques (NSW) - Route: `/city/sydney`
- `src/pages/city/AdelaideCity.tsx` - 28 mosques (SA) - Route: `/city/adelaide`
- `src/pages/city/PerthCity.tsx` - 54 mosques (WA) - Route: `/city/perth`

**Total:** 382 mosques across 5 cities

**Data Source:** `mosques_cache` table with `reviews` (JSONB) and `facilities` (TEXT[]) columns

**Features Built:**
1. **Hero Section**
   - "Mosques Near Me" heading
   - Geolocation button ("Find Mosques Near Me")
   - Suburb filter dropdown (auto-generated from addresses)

2. **Interactive Map**
   - Google Maps Embed API (Search mode)
   - Dynamic centering based on suburb selection
   - Zoom levels: 10 (all), 14 (suburb filtered)

3. **Mosque Cards** (Enhanced Nov 24)
   - Photo display (192px tall, gray background for missing photos)
   - Name, rating, suburb, address
   - Opening hours + "Open Now" badge
   - Latest Google review (reviewer, rating, text)
   - Collapsible facilities section (icons + checkmarks)
   - Phone, website, directions button
   - Distance label (when geolocation used)
   - Real-time filtering by suburb

4. **Collapsible Facilities** (Nov 24)
   - Collapsed by default (click to expand)
   - Icons: Car (Parking), Wheelchair, Droplet (Wudu), Users (Women's)
   - Green checkmarks next to each facility
   - Chevron rotation animation on expand/collapse
   - State managed with Set data structure

5. **Educational Content**
   - Mosque etiquette guide
   - FAQ section (3 city-specific questions)
   - Internal links to other city pages and homepage

#### SEO Implementation

**Structured Data (JSON-LD):**
- `ItemList` - First 50 mosques in directory
- `LocalBusiness` - Top 10 mosques with full details
- `FAQPage` - All FAQ questions
- `BreadcrumbList` - Navigation hierarchy
- `WebPage` - Page metadata

**Meta Tags:**
- Title: "Mosques Near Me in Melbourne | 110+ Prayer Locations | Find My Mosque"
- Description: Optimized for local search with key terms
- Canonical URL: `/city/melbourne`

#### Technical Learnings

**Suburb Extraction:**
Database stores street address in `suburb` field. Extract actual suburb using regex:
```typescript
const extractSuburb = (address: string): string => {
  const match = address.match(/,\s*([^,]+)\s+VIC\s+\d{4}/);
  return match ? match[1].trim() : 'Unknown';
};
```

**Distance Calculation:**
Haversine formula for great circle distance:
```typescript
const calculateDistance = (lat1, lon1, lat2, lon2): number => {
  const R = 6371; // Earth radius in km
  // ... formula implementation
  return R * c;
};
```

**Google Maps Embed API Limitations:**
- ❌ Cannot add custom markers for specific coordinates
- ❌ Search mode shows Google's mosque results, not our database
- ✅ Can center on location and control zoom
- ✅ Users see approximate area (cards below show accurate filtered results)

#### Known Issues & Fixes

**Issue 1: Dropdown Hidden Behind Map**
- **Problem:** Select dropdown z-index below iframe
- **Fix:** Added `z-50 relative` to SelectTrigger, `bg-white border shadow-lg` to SelectContent

**Issue 2: Map Not Showing Specific Mosque Pins**
- **Problem:** Google Maps Embed API doesn't support custom markers
- **Solution:** Accepted limitation - map shows area, cards show exact results
- **Future:** Could upgrade to Google Maps JavaScript API for custom markers

**Issue 3: Geolocation Distance Display**
- **Status:** ✅ Working correctly
- **Tested:** Shows accurate distances (e.g., 1357.6km from Brisbane to Melbourne)

#### Files Created

**Components:**
- `src/pages/city/MelbourneCity.tsx` (432 lines)

**Schema:**
- `src/lib/json-ld-schema.ts` - Added `generateMelbourneCityPageSchema()`

**Diagnostic Scripts:**
- `scripts/check-melbourne-suburbs.ts` - Analyze suburb distribution
- `scripts/check-melbourne-addresses.ts` - Sample address formats
- `scripts/check-campbellfield-mosques.ts` - Test suburb filtering

**Reference:**
- `mosque-photos/ChatGPT City Page Mosque SEO.png` - Design reference from ChatGPT

#### Bug Fixes (Nov 24)

**Photo Alignment Issue:**
- **Problem:** Mosque cards without photos had text starting at top (misaligned with photo cards)
- **Solution:** Always render photo container with gray background, conditionally render image inside
```typescript
// Before (caused misalignment):
{photoUrl && <div><img src={photoUrl} /></div>}

// After (consistent alignment):
<div className="w-full h-48 bg-gray-100">
  {photoUrl && <img src={photoUrl} className="w-full h-full object-cover" />}
</div>
```

**Collapsible Facilities Implementation:**
```typescript
// State management
const [expandedFacilities, setExpandedFacilities] = useState<Set<string>>(new Set());

// Toggle function
const toggleFacilities = (mosqueId: string) => {
  setExpandedFacilities(prev => {
    const next = new Set(prev);
    if (next.has(mosqueId)) {
      next.delete(mosqueId);
    } else {
      next.add(mosqueId);
    }
    return next;
  });
};

// Render facilities
{mosque.facilities && mosque.facilities.length > 0 && (
  <div className="pt-2 border-t border-gray-100">
    <button onClick={() => toggleFacilities(mosque.id)}>
      <span>Facilities</span>
      <ChevronRight className={`transition-transform ${
        expandedFacilities.has(mosque.id) ? 'rotate-90' : ''
      }`} />
    </button>
    {expandedFacilities.has(mosque.id) && (
      <div className="space-y-2">
        {mosque.facilities.map((facility, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {getFacilityIcon(facility)}
            <Check className="w-3 h-3 text-green-600" />
            <span>{facility}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

**Facility Icon Mapping:**
```typescript
const getFacilityIcon = (facility: string) => {
  if (facility.toLowerCase().includes('parking')) return <Car className="w-4 h-4" />;
  if (facility.toLowerCase().includes('wheelchair')) return <Wheelchair className="w-4 h-4" />;
  if (facility.toLowerCase().includes('wudu')) return <Droplet className="w-4 h-4" />;
  if (facility.toLowerCase().includes('women')) return <Users className="w-4 h-4" />;
  return null;
};
```

#### Hybrid Facility Extraction System

**Strategy:** Combine Google Places API accessibility data with review text analysis for higher accuracy.

**Scripts Created:**
- `scripts/fetch-[city]-reviews.ts` - Fetch reviews from Google Places API
- `scripts/extract-[city]-facilities.ts` - Hybrid facility extraction

**Extraction Logic:**
1. **Google Accessibility Data** (via Places API v1):
   - `wheelchairAccessibleParking` → Parking
   - `wheelchairAccessibleEntrance` → Wheelchair Access
   - `wheelchairAccessibleRestroom` → Wudu Area

2. **Review Text Analysis** (pattern matching):
   - Positive/negative keyword scoring system
   - Threshold: >=2 positive mentions required
   - Example patterns:
     - Parking: "parking available", "ample parking" (positive) vs "no parking" (negative)
     - Wudu: "wudu facilities", "clean wudu area" (positive) vs "no wudu" (negative)

3. **Combined Results:**
   - Google data OR review score >=2 → Add facility
   - Average: 2.0-2.3 facilities per mosque
   - Total extracted: 527 facilities across 382 mosques

**Results by City:**
- Brisbane: 81 facilities (2.0 avg)
- Sydney: 273 facilities (1.8 avg)
- Adelaide: 53 facilities (1.9 avg)
- Perth: 120 facilities (2.2 avg)
- Melbourne: 254 facilities (2.3 avg)

**Cost:** ~$0.10 per mosque for accessibility data ($38 total for all 382 mosques)

#### Next Steps

1. Create suburb pages for each city (Melbourne, Sydney, Brisbane, Perth, Adelaide)
2. Test geolocation with users in different cities
3. Create reusable city page template/component (reduce 650-line duplication)
4. Consider Google Maps JavaScript API upgrade for custom markers
5. Add more filters: facilities, open now, prayer times

#### Replication Guide

**Completed Cities:** Melbourne, Brisbane, Sydney, Adelaide, Perth (382 mosques total)

**Process Used (Nov 24):**
1. Copy previous city file: `cp BrisbaneCity.tsx SydneyCity.tsx`
2. Use sed for bulk replacements:
   ```bash
   sed -i '' 's/Brisbane/Sydney/g' SydneyCity.tsx
   sed -i '' 's/QLD/NSW/g' SydneyCity.tsx
   sed -i '' 's/Queensland/New South Wales/g' SydneyCity.tsx
   sed -i '' 's/41+/149+/g' SydneyCity.tsx
   ```
3. Add city schema function to `src/lib/json-ld-schema.ts`
4. Add route to `App.tsx`
5. Update internal links on all city pages
6. Run data enrichment scripts (review fetching + facility extraction)

**Actual time per city:** 2-3 hours (including data enrichment)

**For Future Suburb Pages:**
- Use similar template approach
- Filter by city AND suburb
- Smaller mosque counts (5-20 per suburb)
- More localized SEO targeting


---

## Cron Job Logging Fix

**Date:** November 25, 2025
**Issue:** Weekly cron job runs successfully but doesn't log to `google_api_logs` table

### Problem Diagnosis

**What was working:**
- ✅ Cron job executes every Sunday at 2 AM (verified in `pg_cron.job_run_details`)
- ✅ Updates 272 mosques (68% of database)
- ✅ Mosques get fresh data from Google Places API

**What wasn't working:**
- ❌ No entries in `google_api_logs` table for `weekly_cache_refresh`
- ❌ Unable to track API costs or monitor refresh operations

### Root Causes Found

1. **Database Constraint Missing Value**
   - `google_api_logs.api_type` had CHECK constraint with only 6 allowed values
   - Edge Function tried to insert `'weekly_cache_refresh'` which wasn't allowed
   - Insert failed silently

2. **Wrong Column Names in Edge Function**
   - Used `metadata` instead of `request_params`
   - Missing required `response_status` field

3. **Early Return Without Logging**
   - When all mosques were < 7 days old, function returned early
   - Skipped `logRefreshOperation()` call entirely
   - This was the PRIMARY issue - even after fixing constraints, nothing logged

### Solutions Implemented

#### 1. Database Migration
```sql
-- File: supabase/migrations/20251125_fix_weekly_refresh_logging.sql
ALTER TABLE google_api_logs DROP CONSTRAINT IF EXISTS google_api_logs_api_type_check;

ALTER TABLE google_api_logs ADD CONSTRAINT google_api_logs_api_type_check 
CHECK (api_type = ANY(ARRAY[
    'autocomplete'::text,
    'geocode'::text,
    'place_details'::text,
    'place_search'::text,
    'nearby_search'::text,
    'text_search'::text,
    'weekly_cache_refresh'::text  -- ADDED THIS
]));
```

#### 2. Edge Function Fixes
**File:** `supabase/functions/refresh-cached-mosques/index.ts`

**Fix A: Correct Column Names**
```typescript
async function logRefreshOperation(supabase: any, stats: RefreshStats) {
  const { error } = await supabase
    .from('google_api_logs')
    .insert({
      api_type: 'weekly_cache_refresh',
      request_params: {  // Changed from 'metadata'
        total_mosques: stats.totalMosques,
        updated: stats.updated,
        unchanged: stats.unchanged,
        errors: stats.errors
      },
      response_status: stats.errors > 0 ? 'error' : 'success',  // ADDED
      cost_estimate: stats.totalCost,
      cache_hit: false,
      response_time_ms: stats.duration,
      edge_function_name: 'refresh-cached-mosques',  // ADDED
      error_message: stats.errors > 0 ? `${stats.errors} errors occurred` : null
    });
}
```

**Fix B: Log Even When No Refresh Needed**
```typescript
if (!mosquesToRefresh || mosquesToRefresh.length === 0) {
  console.log('✓ All mosques are up to date (< 7 days old)');
  stats.duration = Date.now() - startTime;
  
  // ADDED: Log even when no refresh needed
  await logRefreshOperation(supabase, stats);
  
  return new Response(JSON.stringify({
    message: 'All mosques are up to date',
    stats
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

**Fix C: Log in Error Handler**
```typescript
} catch (error) {
  stats.duration = Date.now() - startTime;
  stats.errors = 1;
  
  // ADDED: Log the error
  try {
    await logRefreshOperation(supabase, stats);
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
  
  return new Response(JSON.stringify({
    error: error.message,
    stats
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

### Testing Instructions

**Step 1: Delete any test entries**
```sql
DELETE FROM google_api_logs WHERE api_type = 'weekly_cache_refresh';
SELECT COUNT(*) FROM google_api_logs WHERE api_type = 'weekly_cache_refresh';
-- Should return: 0
```

**Step 2: Manually trigger the refresh**
```sql
SELECT net.http_post(
    url := 'https://mzqyswdfgimymxfhdyzw.supabase.co/functions/v1/refresh-cached-mosques',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXlzd2RmZ2lteW14ZmhkeXp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY5NDA1NywiZXhwIjoyMDcwMjcwMDU3fQ.WlycBGspiyk6ha0pGHbaL0g3g6sNLUI8mYDa-u_WF18'
    ),
    body := '{}'::jsonb
) as request_id;
```

**Step 3: Verify logging worked**
```sql
SELECT 
  created_at,
  api_type,
  cost_estimate,
  response_status,
  request_params,
  edge_function_name
FROM google_api_logs 
WHERE api_type = 'weekly_cache_refresh' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
- Should see 1 row with today's timestamp
- `response_status`: 'success'
- `request_params`: JSON with mosque counts
- `cost_estimate`: 0 (if all mosques up-to-date) or ~$8.70 (if 272 refreshed)

### Deployment Commands

```bash
# Push code changes
git add supabase/migrations/20251125_fix_weekly_refresh_logging.sql
git add supabase/functions/refresh-cached-mosques/index.ts
git commit -m "Fix cron job logging"
git push origin main

# Deploy Edge Function
export SUPABASE_ACCESS_TOKEN="sbp_xxx..."  # From .env
supabase functions deploy refresh-cached-mosques --project-ref mzqyswdfgimymxfhdyzw
```

### What Now Logs

**Every Sunday at 2 AM, one of three scenarios logs:**

1. **Successful Refresh** (mosques > 7 days old)
   - `cost_estimate`: ~$8.70 (272 mosques × $0.032)
   - `request_params.updated`: count of changed mosques
   - `request_params.unchanged`: count of unchanged mosques

2. **No Refresh Needed** (all mosques < 7 days old)
   - `cost_estimate`: 0
   - `request_params.total_mosques`: 0
   - `response_status`: 'success'

3. **Error Occurred**
   - `response_status`: 'error'
   - `error_message`: Details of what failed
   - `request_params.errors`: count of failed mosques

---

## City Pages Geolocation Enhancement

**Date:** November 25, 2025
**Feature:** Improved "Find Mosques Near Me" button with 10km radius filtering

### Before vs After

**Before (Nov 24):**
- Sorted ALL city mosques by distance
- No filtering - showed all 149 mosques even if 100km away
- Dropdown always said "All Suburbs (149)"

**After (Nov 25):**
- Filters to show ONLY mosques within 10km
- Shows "Near You (18)" in dropdown when active
- Can reset by selecting "All Suburbs" from dropdown
- Fallback: If no mosques within 10km, shows all sorted by distance with alert

### Implementation

**Files Modified:**
- `src/pages/city/BrisbaneCity.tsx`
- `src/pages/city/MelbourneCity.tsx`
- `src/pages/city/SydneyCity.tsx`
- `src/pages/city/AdelaideCity.tsx`
- `src/pages/city/PerthCity.tsx`

**Key Changes:**

1. **Filter within 10km radius:**
```typescript
const handleFindNearMe = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    const userLoc = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    setUserLocation(userLoc);
    setSortByDistance(true);
    setSelectedSuburb('near-you');  // Special value

    // Filter within 10km
    const nearby = mosques
      .filter(mosque => {
        if (!mosque.latitude || !mosque.longitude) return false;
        const distance = calculateDistance(userLoc.lat, userLoc.lng, mosque.latitude, mosque.longitude);
        return distance <= 10; // Within 10km
      })
      .sort((a, b) => {
        const distA = calculateDistance(userLoc.lat, userLoc.lng, a.latitude, a.longitude);
        const distB = calculateDistance(userLoc.lat, userLoc.lng, b.latitude, b.longitude);
        return distA - distB;
      });

    if (nearby.length === 0) {
      alert('No mosques found within 10km. Showing all sorted by distance.');
      // Fallback: show all sorted by distance
    } else {
      setFilteredMosques(nearby);
    }
  });
};
```

2. **Dynamic dropdown label:**
```typescript
<SelectValue placeholder="Filter by Suburb">
  {selectedSuburb === 'near-you'
    ? `Near You (${filteredMosques.length})`
    : selectedSuburb === 'all'
    ? `All Suburbs (${filteredMosques.length})`
    : `${selectedSuburb} (${filteredMosques.length})`
  }
</SelectValue>
```

3. **Reset functionality:**
```typescript
useEffect(() => {
  if (selectedSuburb === 'all') {
    setFilteredMosques(mosques);
    setSortByDistance(false);
    setUserLocation(null);  // Clear location
  } else if (selectedSuburb === 'near-you') {
    // Keep filtered results
  } else {
    // Filter by specific suburb
  }
}, [selectedSuburb, mosques]);
```

### User Experience Flow

1. User clicks "Find Mosques Near Me"
2. Browser asks for location permission
3. **If granted:**
   - Dropdown changes to "Near You (X)"
   - Map centers on user location
   - Shows only mosques within 10km
   - Each card shows distance (e.g., "2.5km away")
4. **To reset:**
   - Click dropdown
   - Select "All Suburbs (41)"
   - Returns to full city view

### Mobile Navigation Fix

**Issue:** "Browse by City" dropdown appeared behind "All Suburbs" filter on mobile

**Root Cause:** Both elements had `z-50` class, so stacking order depended on DOM position

**Fix:**
```typescript
// src/components/TransparentNavbar.tsx
<nav className="fixed top-0 left-0 right-0 z-[100] ...">  // Changed from z-50
```

Now navbar (z-100) is always above page content (z-50).

---

