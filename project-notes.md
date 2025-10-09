# Find My Mosque - Project Notes

> **Last Updated:** October 10, 2025
> **Purpose:** Concise reference for AI assistants to generate accurate, context-aware code

---

## 📋 Quick Summary

**Project:** Australian mosque directory helping Muslims find mosques by location/suburb search.

**Tech Stack:** React + TypeScript, Vite, TailwindCSS, Supabase, Google Places API, Claude AI

**Key Features:**
- Mosque finder with radius/suburb autocomplete search
- 6 state-specific landing pages (NSW, VIC, QLD, WA, SA, TAS)
- Halal Supermarket Finder with confidence scoring
- Feedback form, FAQ, Imam profiles
- Mobile-responsive with hamburger menu
- Automated SEO sitemap generation

**Current Status:**
- ✅ Site live on GitHub Pages (findmymosque.org)
- ✅ 33+ mosques across 6 state pages
- ✅ SEO Week 4 complete (automated sitemap)
- ✅ Feedback form working (RLS fixed Oct 9)
- ✅ **Backend Cache System Day 1-3 complete** (database + Edge Function + Shadow Mode)
- 🚧 Backend Cache System Day 4-7 (frontend integration, automation, rollout)
- 🚧 Halal Supermarket automation pending

**Priority:** Security first, then SEO optimization.

**User Profile:** Non-technical founder. Explain concepts simply, present options with pros/cons, wait for approval on major decisions.

📖 **Detailed instructions:** See [instructions.md](./instructions.md)
📖 **Plain-English notes:** See `project-notes-for-zbthedummy.txt`
📖 **Backend plan:** See [SUPABASE_BACKEND_PLAN.md](./SUPABASE_BACKEND_PLAN.md)

---

## 🎉 Latest Update (Oct 10, 2025)

### Backend Cache System - Day 3 Complete ✅

**Achievement:** Shadow Mode deployed and fully operational in production!

**What is Shadow Mode?**
Modified existing `search-mosques` function to save mosque data to cache in background while maintaining 100% backward compatibility. Users see zero changes.

**Verified Results:**
- ✅ Searches work perfectly (no user impact)
- ✅ 31+ mosques automatically cached from real searches
- ✅ API cost logging working ($0.049 tracked today)
- ✅ Background cache-saving functioning silently

**Files Modified:**
- `supabase/functions/search-mosques/index.ts` - Added shadow mode logic
- Bug fixed: API logging now includes required fields (request_params, response_status)

**Key Learning:** Test thoroughly before deploying. Found and fixed API logging bug (missing required database fields).

**Current Performance:**
- Cache growing automatically with each search
- Zero user-facing changes
- All searches logged for cost tracking
- Production-ready for Day 4 frontend integration

**Next:** Day 4 - Frontend integration to switch from `search-mosques` to `get-mosque-details` function

---

## 🗂️ Database Schema

**Status:** All 9 tables working with proper RLS (Oct 9, 2025)

### Existing Tables
- `mosques` (2 records) - Legacy mosque data
- `prayer_times` - Prayer time scraping
- `scraping_logs` - Scraping history
- `feedback` - User feedback form (RLS: anon INSERT, auth SELECT/UPDATE/DELETE)
- `supermarkets` (3 records) - Halal supermarket finder
- `scrape_logs` - Supermarket scraping logs

### New Backend Cache Tables (Oct 9, 2025)

#### `mosques_cache`
- **Purpose:** Main mosque directory cache to reduce Google API costs
- **Key Fields:** google_place_id (unique), name, address, location (geography), opening_hours (jsonb), google_rating, last_fetched_from_google
- **RLS:** Public SELECT, Authenticated INSERT/UPDATE, Service role full access
- **Indexes:** Geospatial (GIST), state, suburb, last_fetched

#### `search_cache`
- **Purpose:** Cache search results to avoid repeated queries
- **Key Fields:** search_hash (unique), search_params (jsonb), results (jsonb), expires_at (7 days), hit_count
- **RLS:** Public SELECT (valid only), Service role INSERT/UPDATE/DELETE
- **Functions:** `cleanup_expired_search_cache()`, `get_search_cache_stats()`

#### `google_api_logs`
- **Purpose:** Track every API call for cost monitoring
- **Key Fields:** api_type, cost_estimate, cache_hit (boolean), response_time_ms
- **RLS:** Service role INSERT, Authenticated SELECT
- **Functions:** `get_daily_api_costs(days)`, `get_current_month_cost()`, `get_api_usage_by_type(days)`

📖 **Full schema details:** See [instructions.md#database-schema](./instructions.md)

---

## 🔧 Tech Stack

### Frontend
- React 18 + TypeScript, Vite, TailwindCSS, Lucide React, React Router DOM

### Backend
- Supabase (PostgreSQL + PostGIS)
- Edge Functions: `get-mosque-details` (with cache), `autocomplete-suburb`, `geocode-place`
- Google Places API (secured via Supabase secrets)

### Deployment
- GitHub Pages (auto-deploy on push to main)
- Domain: findmymosque.org (SSL enabled)
- CI/CD: `.github/workflows/deploy.yml`

---

## 🔒 Security Rules

**Critical:**
- Keep API keys in `.env` (never commit to Git)
- Update GitHub Secrets when changing API keys
- Always enable RLS on new tables
- RLS policies must explicitly allow `anon` role for public access
- Test features before marking complete
- Google Maps API key stored in Supabase secrets only

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx  # New key format (Sept 2025)
SUPABASE_SECRET_KEY=sb_secret_xxx
SUPABASE_ACCESS_TOKEN=sbp_xxx
GOOGLE_MAPS_API_KEY=xxx  # Stored in Supabase secrets
```

**Note:** Supabase legacy JWT keys disabled Sept 23, 2025. All projects now use `sb_publishable_` and `sb_secret_` format.

---

## 🚀 SEO Implementation

- **Sitemap:** Auto-generated on `npm run build` (18 routes)
- **robots.txt:** Configured with Googlebot optimization
- **Meta Tags:** Page-specific titles, descriptions, Open Graph
- **Structured Data:** Organization, LocalBusiness, BreadcrumbList schemas
- **Mobile:** Responsive navigation, ≥44px touch targets

📖 **Full SEO guide:** [instructions.md#seo-optimization](./instructions.md)

---

## 💰 Cost Breakdown

### Current (Phase 1)
- **Supabase:** $0/month (free tier)
- **Hosting:** $0/month (GitHub Pages)
- **Domain:** ~$15/year
- **Total:** ~$1.25/month

### Future (With Backend Cache - Day 7)
- **Google Places API:** ~$23/month (with 80-95% cache hit rate)
- **Claude AI:** ~$1-2/month (halal review analysis)
- **Total:** ~$24/month (saves $52/month!)

---

## 🧪 Testing Commands

```bash
npm run dev                    # Start dev server (localhost:8080)
npm run build                  # Generate sitemap + build production
npm run generate-sitemap       # Manually generate sitemap
npm run lint                   # Check TypeScript errors
```

---

## 📂 Important Files

**Core App:** `src/App.tsx`, `src/components/TransparentNavbar.tsx`, `src/components/MosqueLocator.tsx`

**State Pages:** `src/pages/SydneyMosques.tsx` (+ Melbourne, Brisbane, Perth, Adelaide, Tasmania)

**Backend:** `supabase/migrations/` (database setup), `supabase/functions/` (Edge Functions)

**Deployment:** `.github/workflows/deploy.yml`, GitHub Secrets

**Docs:** `CLAUDE.md`, `project-notes.md`, `instructions.md`, `SUPABASE_BACKEND_PLAN.md`, `DAY1_COMPLETION_SUMMARY.md`

---

## 🎯 Next Steps

### Immediate (Day 4)
1. ⏳ Frontend integration - Create service layer to switch between functions
2. ⏳ Add feature flag system for gradual rollout
3. ⏳ Update MosqueLocator.tsx to use `get-mosque-details` function
4. ⏳ Test locally with cache-first approach

### Short-term (Days 5-7)
1. ⏳ Automation setup (weekly cache refresh, daily cleanup)
2. ⏳ Production rollout (gradual 10% → 50% → 100%)
3. ⏳ Cost monitoring dashboard
4. ⏳ Performance verification and optimization

### Medium-term (Next 1-3 months)
1. ⏳ Expand mosque database
2. ⏳ Halal Supermarket Phase 2-4 (automation)
3. ⏳ User authentication
4. ⏳ Prayer times integration

---

## 📞 Communication Guidelines

**When Presenting Options:**
- Provide 2-3 options with clear pros/cons
- Explain recommendation and why
- Wait for explicit approval before implementing
- Use simple, non-technical language

**When Explaining:**
- Use everyday analogies
- Explain the "why" behind decisions
- Show business/user impact
- Provide beginner-friendly resources

**Progress Updates:**
- Regular updates during long tasks
- Explain successes and challenges
- Be transparent about time estimates
- Celebrate small wins

---

**For detailed implementation guides, troubleshooting, and technical deep-dives, see [instructions.md](./instructions.md)**
