# Find My Mosque - Project Notes

> **Last Updated:** October 7, 2025
> **Purpose:** Concise reference for Cursor AI to generate accurate, context-aware code

---

## 📋 Quick Summary (300 tokens)

**Project:** Australian mosque directory helping Muslims find mosques by location/suburb search.

**Tech Stack:** React + TypeScript, Next.js (considering), Vite, TailwindCSS, Supabase (backend/database), Google Places API, Claude AI

**Key Features:**
- Mosque finder with radius/suburb autocomplete search
- 6 state-specific landing pages (NSW, VIC, QLD, WA, SA, TAS)
- Halal Supermarket Finder with confidence scoring
- Imam profiles directory
- FAQ and feedback pages
- Mobile-responsive with hamburger menu
- Automated SEO sitemap generation

**Current Status:**
- ✅ All city pages live with 33+ mosques
- ✅ Mobile navigation optimized
- ✅ SEO Week 4 complete (automated sitemap)
- ✅ Halal Supermarket Finder Phase 1 live
- ✅ Suburb autocomplete working
- 🚧 Halal Supermarket automation pending (Phase 2-4)

**Priority:** Security first, then SEO optimization for Google first-page ranking.

**User Profile:** Non-technical founder. Explain concepts simply, present options with pros/cons, wait for approval on major decisions.

**Critical Rules:**
- Keep API keys in `.env` (never commit to Git)
- Use Supabase Edge Functions for sensitive operations
- Maintain Row Level Security (RLS) on all database tables
- Test all features before marking complete
- Update sitemap when adding new pages

📖 **For detailed instructions:** See [instructions.md](./instructions.md)
📖 **For plain-English notes:** See `project-notes-for-zbthedummy.txt`

---

## 🎯 Current Features

### 1. Mosque Finder (Homepage)
- **Location:** `/`
- **Features:**
  - Search by postcode or suburb (autocomplete)
  - Search by current location (geolocation)
  - Radius-based search (1-50km)
  - Google Maps integration
  - Mosque detail modals with hours, attributes, ratings
- **Backend:** Supabase Edge Functions for geocoding
- **API:** Google Places API (secured via Supabase)

### 2. State-Specific Pages
- **URLs:** `/mosques-sydney`, `/mosques-melbourne`, `/mosques-brisbane`, `/mosques-perth`, `/mosques-adelaide`, `/mosques-tasmania`
- **Features:**
  - Region filtering (North, South, West, CBD, Eastern Suburbs)
  - Opening hours with expandable schedule
  - Google ratings with "Verified on Google" badge
  - Mosque attributes (wheelchair accessible, parking, women's prayer area)
  - Popular searches section (city-specific terms)
- **Data:** Currently placeholder data (33 mosques total)
- **Design:** Clean white/gray/teal color scheme

### 3. Halal Supermarket Finder
- **Location:** `/halal-supermarkets`
- **Features:**
  - Confidence scoring (0-100% how sure halal section exists)
  - Chain filtering (Coles, Woolworths, IGA, ALDI)
  - AI reasoning display (why we think they have halal)
  - Google ratings integration
  - Distance-based search (future)
  - Statistics dashboard
- **Database:** `supermarkets` table with RLS
- **Status:** Phase 1 complete (3 test supermarkets)
- **Phase 2-4:** Google Places API automation pending (~$42/month)

### 4. Other Pages
- **Imam Profiles:** `/imam-profiles` - Directory of Islamic leaders
- **FAQ:** `/faq` - Common questions about mosques
- **Feedback:** `/feedback` - Contact form to add mosques

---

## 🔧 Tech Stack Details

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast HMR, code splitting)
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **Routing:** React Router DOM

### Backend
- **Database:** Supabase (PostgreSQL)
- **Edge Functions:** 3 deployed
  - `autocomplete-suburb` - Suburb suggestions
  - `geocode-place` - Place details from place_id
  - `validate-postcode` - Australian postcode validation
- **Authentication:** Supabase Auth (not yet implemented)

### APIs
- **Google Places API:** Suburb autocomplete, mosque details
- **Google Geocoding:** Postcode to coordinates
- **Claude AI:** Review analysis for halal detection (Phase 3)

### Deployment
- **Hosting:** TBD (currently local development)
- **Domain:** findmymosque.org (configured)
- **SSL:** Required for production

---

## 🗂️ Database Schema

### Tables

#### `supermarkets`
```sql
- id (uuid, primary key)
- name (text) - e.g., "Coles Lakemba"
- address (text)
- location (geography point) - PostGIS for distance queries
- chain (text) - Coles, Woolworths, IGA, ALDI, Other
- has_halal_section (boolean)
- confidence_score (numeric 0-1)
- reasoning (text) - AI-generated explanation
- source (text) - "Google Places + Claude AI"
- google_rating (numeric)
- google_review_count (integer)
- last_verified (timestamp)
- created_at (timestamp)
```

**RLS Policies:**
- Public: SELECT (read-only)
- Authenticated only: INSERT, UPDATE, DELETE

#### `scrape_logs`
```sql
- id (uuid, primary key)
- started_at (timestamp)
- completed_at (timestamp)
- status (text) - running, completed, failed
- supermarkets_processed (integer)
- errors (jsonb)
```

**RLS Policies:**
- Service role only (admin access)

---

## 🔒 Security Best Practices

### Environment Variables
```bash
# .env (NEVER commit to Git)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
GOOGLE_MAPS_API_KEY=xxx (stored in Supabase secrets)
```

### Row Level Security (RLS)
- Always enable RLS on new tables
- Public read access for directories (mosques, supermarkets)
- Authenticated write access only
- Admin operations via service role

### API Key Security
- Google Maps API key stored in Supabase secrets
- Edge Functions use `Deno.env.get('GOOGLE_MAPS_API_KEY')`
- Never expose keys in client-side code
- Restrict API key to specific domains in Google Cloud Console

---

## 🚀 SEO Implementation

### Automated Sitemap Generation
- **Script:** `scripts/generate-sitemap.js`
- **Config:** `scripts/sitemap-config.js` (18 routes)
- **Trigger:** Runs automatically on `npm run build` (prebuild hook)
- **Output:** `public/sitemap.xml`
- **Validation:** Checks for duplicates, valid priorities (0-1), valid changefreq

### robots.txt
```txt
Sitemap: https://findmymosque.org/sitemap.xml
Crawl-delay: 1
User-agent: Googlebot
Crawl-delay: 0
```

### Meta Tags
- Page-specific titles and descriptions
- Open Graph tags for social sharing
- Canonical URLs
- Mobile viewport meta tag

### Structured Data (JSON-LD)
- Organization schema
- LocalBusiness schema for mosques
- BreadcrumbList for navigation

📖 **Full SEO guide:** [instructions.md#seo-optimization](./instructions.md#seo-optimization)

---

## 📱 Mobile Optimization

### Responsive Navigation
- **Desktop:** Horizontal navigation bar with dropdown
- **Mobile:** Hamburger menu (≡) with slide-down menu
- **Breakpoint:** 768px (tablet size)
- **Implementation:** `TransparentNavbar.tsx` with click-outside detection

### Touch Targets
- Buttons ≥44px height (Apple guidelines)
- Full-width mobile menu items
- Large tap areas for filters and cards

### Responsive Grid
- **Desktop:** 3 columns (mosque/supermarket cards)
- **Tablet:** 2 columns
- **Mobile:** 1 column (stacked)

---

## 🐛 Known Issues & Solutions

### Issue: Suburb Autocomplete Not Working
**Fix:** Deploy Edge Functions to Supabase, enable Google Places API
**Status:** ✅ Resolved (Oct 7, 2025)

### Issue: Dropdown Menu Not Closing
**Fix:** Add useRef + useEffect with click-outside detection
**Status:** ✅ Resolved (Oct 6, 2025)

### Issue: ES Module vs CommonJS Conflict
**Fix:** Convert scripts to ES modules (`import`/`export` instead of `require`/`module.exports`)
**Status:** ✅ Resolved (Oct 7, 2025)

---

## 💰 Cost Breakdown

### Current (Phase 1)
- **Supabase:** $0/month (free tier)
- **Hosting:** $0/month (GitHub Pages or similar)
- **Domain:** ~$15/year
- **Total:** ~$1.25/month

### Future (Phase 2-4 with Automation)
- **Google Places API:** ~$40/month (10,000 initial searches, then ~$5/month for weekly updates)
- **Claude AI:** ~$1-2/month (review analysis)
- **Total:** ~$42/month (within $45 budget)

---

## 📝 Adding New Pages Checklist

### 1. Create Page Component
```tsx
// src/pages/NewPage.tsx
import React from 'react';

export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### 2. Add Route
```tsx
// src/App.tsx
import NewPage from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

### 3. Update Sitemap Config
```javascript
// scripts/sitemap-config.js
{
  path: '/new-page',
  priority: 0.8,
  changefreq: 'weekly',
}
```

### 4. Build & Deploy
```bash
npm run build  # Sitemap auto-updates
git add .
git commit -m "Add new page"
git push
```

---

## 🔄 Weekly Automation Tasks (When Phase 2-4 Complete)

### Supermarket Data Updates
- **Frequency:** Weekly (Sunday 2 AM)
- **Process:**
  1. Fetch supermarkets from Google Places API
  2. Analyze reviews with Claude AI
  3. Calculate confidence scores
  4. Update database with new findings
- **Cost:** ~$5/week

### SEO Monitoring
- **Frequency:** Weekly (Monday morning)
- **Tasks:**
  - Check Google Search Console for errors
  - Review keyword rankings
  - Monitor click-through rates
  - Fix any indexing issues

📖 **Automation setup guide:** [instructions.md#automation](./instructions.md#automation)

---

## 📊 Success Metrics

### SEO Goals (6 months)
- **Indexed Pages:** 40+ (currently ~18)
- **Organic Visitors:** 2,000-5,000/month
- **Keywords Ranking:** 100+ (currently ~5-10)
- **First Page Rankings:** 25-40 (currently 2-3)
- **Average Position:** 5-10 for "mosque near me" queries

### User Engagement
- **Bounce Rate:** <40%
- **Session Duration:** >2 minutes
- **Pages per Session:** >2.5
- **Mobile Users:** 60-70%

---

## 🧪 Testing Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:8080)

# Build
npm run build                  # Generate sitemap + build production

# Sitemap
npm run generate-sitemap       # Manually generate sitemap

# Lint
npm run lint                   # Check TypeScript errors
```

---

## 📂 Important Files

### Core Application
- `src/App.tsx` - Main app with routes
- `src/components/TransparentNavbar.tsx` - Navigation (mobile + desktop)
- `src/components/MosqueLocator.tsx` - Homepage search
- `src/components/MosqueDetailsModal.tsx` - Mosque popup details

### State Pages
- `src/pages/SydneyMosques.tsx`
- `src/pages/MelbourneMosques.tsx`
- `src/pages/BrisbaneMosques.tsx`
- `src/pages/PerthMosques.tsx`
- `src/pages/AdelaideMosques.tsx`
- `src/pages/TasmaniaMosques.tsx`

### Halal Supermarket Finder
- `src/pages/HalalSupermarkets.tsx` - Main page component
- `supabase/migrations/` - Database setup

### Configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration
- `scripts/sitemap-config.js` - SEO sitemap routes
- `scripts/generate-sitemap.js` - Sitemap generator

### Documentation
- `CLAUDE.md` - Instructions for Cursor AI
- `project-notes.md` - This file (concise reference)
- `instructions.md` - Detailed technical instructions
- `project-notes-for-zbthedummy.txt` - Plain-English version
- `GOOGLE_SEARCH_CONSOLE_GUIDE.md` - GSC setup guide
- `WEEK4_SEO_COMPLETION_SUMMARY.md` - SEO completion details

---

## 🎯 Next Steps (Priority Order)

### Immediate
1. ✅ Test all features on live site
2. ✅ Set up Google Search Console
3. ✅ Submit sitemap to GSC
4. ⏳ Add more mosque data to state pages

### Short-term (Next 2-4 weeks)
1. ⏳ Decide on hosting provider (Vercel, Netlify, or custom)
2. ⏳ Deploy to production
3. ⏳ Set up SSL certificate
4. ⏳ Configure domain DNS

### Medium-term (Next 1-3 months)
1. ⏳ Build Halal Supermarket Phase 2 (Google Places integration)
2. ⏳ Build Phase 3 (Claude AI review analysis)
3. ⏳ Build Phase 4 (weekly automation)
4. ⏳ Add user authentication (for mosque managers)

### Long-term (3-6 months)
1. ⏳ Prayer times integration
2. ⏳ Mosque photo uploads
3. ⏳ User reviews and ratings
4. ⏳ Email notifications for new mosques

---

## 📞 Communication Guidelines

### When Presenting Options
- Always provide 2-3 options with clear pros/cons
- Explain which option you recommend and why
- Wait for explicit approval before implementing
- Use simple, non-technical language

### When Explaining Technical Concepts
- Use everyday analogies
- Explain the "why" behind decisions
- Show how it impacts the business/users
- Provide links to beginner-friendly resources

### Progress Updates
- Regular updates during long tasks
- Explain both successes and challenges
- Be transparent about time estimates
- Celebrate small wins

---

**For detailed implementation guides, troubleshooting, and technical deep-dives, see [instructions.md](./instructions.md)**
