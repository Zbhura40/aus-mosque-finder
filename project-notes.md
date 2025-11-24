# Find My Mosque - Project Notes

> **Last Updated:** November 25, 2025
> **Purpose:** Date-organized progress tracking and quick reference

---

## 📋 Project Overview

**Project:** Australian mosque directory (findmymosque.org)
**Tech Stack:** React + TypeScript, Vite, TailwindCSS, Supabase, Google Places API
**Status:** Live with **397 Islamic locations** (mosques, prayer rooms, musallas)

**Key Features:** Mosque finder, prayer room directory, city landing pages, featured mosque pages

📖 **References:**
- Detailed tech docs: [instructions.md](./instructions.md)
- Marketing strategy: [marketing-strategy-project.md](./marketing-strategy-project.md)
- Bullseye framework: [docs/bullseye-marketing-strategy.md](./docs/bullseye-marketing-strategy.md)

---

## 📅 November 25, 2025

### ✅ City Pages UX Improvements + Cron Job Investigation

**Geolocation Enhancement:**
- Fixed "Find Mosques Near Me" to filter within 10km radius (not just sort)
- Added "Near You (X)" dropdown when location active
- Smart reset: "All Suburbs" option restores full city results
- Fallback: Shows all mosques sorted by distance if none within 10km
- Applied to all 5 city pages: Brisbane, Melbourne, Sydney, Adelaide, Perth

**Mobile Navigation Fix:**
- Fixed navbar z-index issue (z-50 → z-[100])
- "Browse by City" dropdown now appears above page filters on mobile

**Cron Job Diagnosis:**
- ✅ Cron runs successfully every Sunday at 2 AM (confirmed via pg_cron logs)
- ✅ Updates 272 mosques per run (68% of database)
- ❌ Logging to `google_api_logs` was failing silently
- Root cause: Edge Function returned early when no refresh needed (all < 7 days old)
- Fix deployed: Added logging for all scenarios (success, no-op, errors)
- Added `weekly_cache_refresh` to allowed api_types in database

**Git Status:**
- Commits: `7283e28`, `fa1dda4`, `68694af`
- Deployed: Navbar fix, geolocation improvements, cron logging fixes

📖 **Technical details:** See instructions.md#cron-job-logging-fix

---

## 📅 November 24, 2025

### ✅ City Pages Complete - 5 Cities Live on Main Branch

**Achievement:** Completed and deployed 4 additional city pages (Brisbane, Sydney, Adelaide, Perth) plus Melbourne enhancements

**City Pages Deployed:**
1. **Melbourne** - 110 mosques (VIC)
2. **Brisbane** - 41 mosques (QLD)
3. **Sydney** - 149 mosques (NSW)
4. **Adelaide** - 28 mosques (SA)
5. **Perth** - 54 mosques (WA)

**Total:** 382 mosques across 5 major cities

**Features Implemented:**
- Collapsible facilities section (icons + checkmarks, collapsed by default)
- Photo alignment fix (gray background for mosques without photos)
- Suburb filtering + geolocation ("Find Mosques Near Me")
- Google Maps integration with dynamic centering
- Opening hours + "Open Now" status badges
- Google reviews display (latest review on each card)
- Hybrid facility extraction (Google API + review text analysis)
- SEO-optimized JSON-LD schemas per city

**Facilities Detected:**
- Brisbane: 81 facilities (2.0 avg/mosque)
- Sydney: 273 facilities (1.8 avg/mosque)
- Adelaide: 53 facilities (1.9 avg/mosque)
- Perth: 120 facilities (2.2 avg/mosque)
- Categories: Parking, Wheelchair Access, Wudu Area, Women's Prayer Area

**Navigation Updates:**
- Replaced "Browse by State" with "Browse by City" (5 major cities)
- Removed "Prayer Times" link from navbar
- Updated all internal city page links to new `/city/` routes
- Cross-linking between all city pages and homepage

**Data Enrichment:**
- Fetched reviews: Brisbane (170), Sydney (639), Adelaide (127), Perth (~250)
- Created data enrichment scripts for review fetching and facility extraction
- Average 5 reviews stored per mosque

**Git Status:**
- Branch: `feature/city-pages` merged to `main`
- Commit: `5d042b4` - "Add Brisbane, Sydney, Adelaide, Perth city pages with collapsible facilities"
- Files: 30 files changed, 5,518 insertions, 66 deletions
- Status: 🟢 Live on production

**Routes Added:**
- `/city/melbourne`
- `/city/brisbane`
- `/city/sydney`
- `/city/adelaide`
- `/city/perth`

📖 **Technical details:** See instructions.md#city-landing-pages

---

## 📅 November 22, 2025

### ✅ Melbourne City Page - Initial Implementation (Nov 22)

**Achievement:** Built first city-specific landing page with photos, reviews, and facilities

**Features:** Photos (96% coverage), opening hours (76%), reviews (98%), hybrid facility extraction (100%)

**Database:** Added `reviews` (JSONB) and `facilities` (TEXT[]) columns with GIN indexes

**Cost:** ~$11 for accessibility data (110 API calls)

📖 **Technical details:** See instructions.md#city-landing-pages

---

## 📅 November 20, 2025

### ✅ Database Cleanup + Holland Park Prayer Clock

**Database Fixes:** Fixed 25 data issues (missing coordinates, PostGIS points, state assignments, 1 duplicate)
- Southern Cross Railway Station + 14 university/hospital prayer rooms now searchable
- All 394 locations have proper coordinates

**Holland Park:** Prayer times clock with live countdown (1400×600px landscape format)

**Git:** Committed 24 files, added `*.sql` to .gitignore

📖 **Details:** See instructions.md#database-cleanup-nov-20

---

## 📅 November 16, 2025

### ✅ Prayer Facilities Search System + Database Refresh

**Validation System:** Found 75 places, added 16 new locations (airports, universities, hospitals, railway stations). Cost: $0.80

**Cron Job Fix:** Fixed broken weekly refresh (JWT line breaks), now runs Sundays at 2 AM

**Database Refresh:** 391/392 mosques updated with fresh Google data. Cost: $6.64

**Airport Prayer Rooms:** Fixed 5 airport prayer rooms not appearing in searches (PostGIS + timestamp issues)

**Database Audit:** 394 total locations, found 46 issues for future cleanup (duplicates, missing data)

📖 **Details:** See instructions.md#place-of-worship-validation

---

## 📅 October 25, 2025

### ✅ Cold Email Campaign System + Cron Job Fix

**Email Extraction:** 21 emails from 211 websites (8% success). Cost: $1.52. Campaign system built (templates, trackers, phone scripts)

**Campaign Activity:** Sent 3 emails, marked 2 for phone outreach. Goal: 15-20 contacts over 2 weeks

**Cron Job Fix:** Fixed broken weekly refresh (wrong auth token, URL line breaks). Now runs Sundays at 2 AM

**Git Security:** Protected 21 mosque emails in .gitignore, committed 54 files (+10,870 lines) - marketing docs only

📖 **Details:** See instructions.md#cron-job-fix

---

## 📅 October 24, 2025

### ✅ Email Extraction Testing

Tested 4 Apify actors. Winner: Website Content Crawler (5% success, $0.72/100 sites). Found 7 emails from 4 mosques. Projected: ~11 emails from 211 websites for $1.90.

---

## 📅 October 21, 2025

### ✅ Removed Halal Supermarkets Feature

Simplified navigation by removing Halal Markets page. Streamlined focus on mosque directory.

---

## 📅 October 20, 2025

### ✅ Navbar Redesign + Homepage Reorganization

Solid white navbar with auto-hide, site name added, simplified homepage (removed hero animation, moved search to top). Holland Park demo finalized with real data.

---

## 📅 October 19, 2025

### ✅ Holland Park Demo + Mobile Nav Fix

Professional demo page with verified content (4.9★ reviews, custom maps, real Imam photos). Fixed mobile navigation for state pages.

📖 **Details:** See instructions.md#mobile-navigation-bug-fixes

---

## 📅 October 18, 2025
- ✅ Backlink strategy (30-50 links, 8-week plan) + Value exchange framework (service-first partnerships)

## 📅 October 17, 2025
- ✅ Bullseye Framework (Traction book methodology, 7 priority channels identified)

## 📅 October 16, 2025
- ✅ Database security audit (26/31 issues fixed, security_invoker + search_path)

## 📅 October 12, 2025
- ✅ 342 verified mosques migrated + SEO Phase 1 (meta tags, Schema.org, Search Console)
- ✅ Make.com automation + marketing infrastructure (tracking system, Google Sheets templates)

## 📅 October 6-11, 2025
- ✅ Cache system (100% rollout, $66/month savings)
- ✅ Email scraper (Puppeteer-based)
- ✅ Dynamic sitemap, 6 state pages, mobile hamburger menu

## 📅 September 2025
- ✅ Site deployed, domain configured, Supabase + Google Places API integrated

---

## 🗂️ Database Schema (12 Tables)

### Public Tables
- `mosques_cache` (394) - Main cache with verified, state-tagged mosques
  - New columns: `reviews` (JSONB), `facilities` (TEXT[])
- `search_cache` - Query results cache (7-day expiry)
- `supermarkets` (3) - Halal finder (deprecated, not linked in UI)
- `feedback` - User submissions
- `prayer_times` - Scraping data

### Private Tables (Marketing & Analytics)
- `mosques_emails` (2) - Email addresses extracted (deprecated - now using marketing_prospects)
- `marketing_prospects` (337) - Marketing data: 232 phones, 211 websites, **21 emails extracted**
- `google_api_logs` - Cost tracking & refresh history
- `scraping_logs` - Automation logs

📖 **Schema details:** [instructions.md#database-schema](./instructions.md)

---

## 🎯 Current Status & Roadmap

### Completed ✅
- ✅ 394 locations live with Google API validation
- ✅ 100% cache system ($66/month savings)
- ✅ Auto-refresh cron job fixed (runs every Sunday at 2 AM)
- ✅ SEO Phases 1-2 (meta tags, Schema, Search Console)
- ✅ Database security hardened (26/31 issues fixed)
- ✅ Holland Park Mosque demo MVP (4 pages with verified data)
- ✅ Holland Park prayer times clock - landscape format with live countdown (Nov 20)
- ✅ Navbar redesign (solid white, auto-hide, responsive layouts)
- ✅ Homepage reorganization (search-first, animation backed up)
- ✅ Removed Halal Supermarkets feature (streamlined navigation)
- ✅ Email extraction complete - 21 emails from 211 websites ($1.52)
- ✅ Cold email campaign system built (templates, trackers, scripts)
- ✅ Airport prayer rooms searchable (Nov 16)
- ✅ Database audit complete - 46 issues identified (Nov 16)
- ✅ 5 city pages live - 382 mosques with collapsible facilities, reviews, photos (Nov 24)
- ✅ Navigation updated - "Browse by City" replaces "Browse by State" (Nov 24)

---

## 📋 Pending Actions

### Immediate (Nov 25)
- [ ] **Test cron job logging** - Run 3 SQL queries to verify logging works (instructions in instructions.md#cron-job-logging-fix)

### City Pages - Next Steps
- [ ] Create suburb pages for each city (Melbourne, Sydney, Brisbane, Perth, Adelaide)
- [ ] Create reusable city page template component (reduce code duplication)
- [ ] Consider Google Maps JavaScript API upgrade for custom markers

### Marketing & Outreach
- [ ] Continue cold email campaign to 21 mosques
- [ ] Send Holland Park demo partnership pitch

### Database & Features
- [ ] Review 17 duplicate addresses (34 entries) - determine if same org or different
- [ ] Build Prayer Times feature page (route pending)
- [ ] Verify TAS/NT mosque data (currently 0 mosques in database)

📖 **See:** `docs/seo-action-plan.md` and `marketing-strategy-project.md`

---

## 💰 Cost Summary

**Production System (Oct 12):**
- Monthly: **$34** (Google Places ~$23 + Weekly refresh ~$11)
- **Savings:** $66/month vs $100 baseline (66% reduction)
- **Yearly savings:** $792

**Breakdown:**
- Cache hits: $0 (most searches)
- Cache misses: ~$23/month
- Weekly refresh: ~$2.70/week (~$11/month)

---

## 🔒 Security

**Critical Rules:**
- API keys in `.env` only (never commit)
- RLS enabled on all tables
- `mosques_emails` table: NO public access
- All views use `security_invoker=true`
- All functions have `SET search_path = public, pg_temp`

📖 **See:** [instructions.md#security](./instructions.md) for environment variables and setup

---

## 🚀 Quick Commands

```bash
npm run dev                 # Dev server (localhost:8080)
npm run build               # Production build + sitemap
npm run lint                # TypeScript check

# Mosque Management
npm run validate-mosques    # Validate place IDs with Google Places API
npm run migrate-mosques     # Migrate validated mosques to cache
npm run fix-states          # Fix unknown state values

# Marketing Commands
npm run import-prospects    # Import 337 mosques to database
npm run scrape-emails       # Email scraper (Puppeteer-based)
```

---

## 📞 Communication Style

**For Non-Technical Founder:**
- Explain concepts in simple terms using analogies
- Present 2-3 options with pros/cons
- Wait for approval on major decisions
- Show business impact of technical choices

**Priority:** Security first, then SEO

---

**For detailed guides, see [instructions.md](./instructions.md)**
