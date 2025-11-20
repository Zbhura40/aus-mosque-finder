# Find My Mosque - Project Notes

> **Last Updated:** November 20, 2025
> **Purpose:** Date-organized progress tracking and quick reference

---

## 📋 Project Overview

**Project:** Australian mosque directory (findmymosque.org)
**Tech Stack:** React + TypeScript, Vite, TailwindCSS, Supabase, Google Places API
**Status:** Live with **394 Islamic locations** (mosques, prayer rooms, musallas)

**Key Features:** Mosque finder, prayer room directory, state landing pages, featured mosque pages

📖 **References:**
- Detailed tech docs: [instructions.md](./instructions.md)
- Marketing strategy: [marketing-strategy-project.md](./marketing-strategy-project.md)
- Bullseye framework: [docs/bullseye-marketing-strategy.md](./docs/bullseye-marketing-strategy.md)

---

## 📅 November 20, 2025

### ✅ Database Cleanup - Fixed 25 Data Issues (Afternoon)

**Achievement:** Fixed all high-priority database issues from Nov 16 audit

**Issues Fixed:**
1. ✅ **Southern Cross Railway Station** - Added missing coordinates (-37.81839, 144.9525) + PostGIS point
2. ✅ **14 mosques missing PostGIS** - Added location points (universities, hospitals, prayer rooms)
3. ✅ **10 mosques missing states** - Assigned NSW (9) and QLD (1) based on addresses
4. ✅ **1 duplicate mosque** - Deleted duplicate Masjid Al Rahman Gosnells entry

**Locations Now Searchable:**
- Southern Cross Railway Station Prayer Room (Melbourne)
- University musallas: QUT, UQ, Griffith, Monash
- Hospital prayer rooms: Canterbury, Alfred, MCEC
- Brisbane Airport musalla

**Impact:** All 394 locations now have proper coordinates, PostGIS points, and state assignments

📖 **Technical details:** See instructions.md#database-cleanup-nov-20 for SQL queries and verification steps

---

### ✅ UI Enhancement - Prayer Times Navigation Button

**Addition:** Added "Prayer Times" button to navbar (desktop + mobile)

**Purpose:** Preparing for future Prayer Times feature page

**Status:** 🟡 UI ready, `/prayer-times` route to be built later

---

### ✅ Git Repository Updates (Afternoon)

**Commits:**
- `2820389` - "Fix database issues and add diagnostic tools" (24 files, +3,551 lines)
- `61164bd` - "Add SQL files to gitignore"

**Files Committed:**
- Documentation: todo.txt, duplicate-names-review.md, mosque-audit-report.json
- Diagnostic scripts: 19 TypeScript troubleshooting tools
- UI: TransparentNavbar.tsx (Prayer Times button)

**Security:** Added `*.sql` to .gitignore (excludes one-time database fix files from repo)

---

### ✅ Holland Park Mosque - Prayer Times Clock Integration (Morning)

**Achievement:** Completed side-by-side prayer times display with live clock

**Features:** Live countdown, analog clock, full prayer schedule, Islamic date display

**Layout:** Landscape format (1400px wide × 600px tall) - clock left, schedule right

📖 **Technical details:** See instructions.md#holland-park-clock-integration

**Status:** 🟢 Complete

---

## 📅 November 16, 2025

### ✅ Place of Worship Search & Validation System

**Achievement:** Built smart validation system to find Islamic prayer facilities beyond traditional mosques

**What We Built:**
- ✅ 3-layer validation system (name keywords → location context → manual review)
- ✅ Targeted text search for 25 specific queries (airports, universities, hospitals)
- ✅ Found **75 places**, validated **57**, approved **45** (39 auto + 6 manual)
- ✅ Successfully added **16 NEW locations** to database (mosques_cache)

**New Locations Include:**
- Airport prayer rooms: Brisbane, Sydney, Melbourne, Perth
- University musallas: QUT, University of Melbourne, Monash, UWA
- Hospital prayer rooms: Royal Melbourne, Canterbury
- Railway stations: Southern Cross Station Melbourne
- Islamic centers and welfare organizations

**Cost:** $0.80 for search

📖 **Technical details:** See instructions.md#place-of-worship-validation for algorithm details

---

### ✅ Cron Job Fix - Permanently Resolved

**Issue:** Cron job created on Oct 25 (jobid 6) had line breaks in JWT token, failing every Sunday

**Solution:**
1. ✅ Deleted broken cron job (jobid 6)
2. ✅ Created new cron job (jobid 7) using `jsonb_build_object()` to prevent line breaks
3. ✅ Verified working in test run

**Result:** Weekly auto-refresh now works correctly (runs every Sunday at 2 AM UTC)

📖 **Technical fix:** See instructions.md#cron-job-troubleshooting for SQL commands

---

### ✅ Full Database Refresh - 391 Mosques Updated

**Challenge:** Edge Function timeout when refreshing 392 mosques at once (stopped at 162/392)

**Solution:** Created batch refresh script (`scripts/refresh-remaining-mosques.ts`)
- Processes 10 mosques per batch with 2-second delays
- Refreshed remaining **229 mosques** successfully
- **1 mosque failed** (invalid Google Place ID - needs removal)

**Results:**
- ✅ **391 out of 392 mosques** now have fresh Google data
- ✅ Updated: prayer times, ratings, opening hours, photos, contact info
- ✅ Data age: <1 hour (previously 36 days old)

**Cost:** $6.64 total ($2.75 first attempt + $3.89 batch refresh)

📖 **Batch refresh details:** See instructions.md#batch-refresh-strategy

---

### ✅ Git Repository Security & Commit

**Achievement:** Committed today's work while protecting sensitive data

**Protected (added to .gitignore):**
- SQL files with hardcoded service role keys (3 files)
- Ensures secrets never pushed to public GitHub

**Committed (14 files, +2,878 lines):**
- Validation system scripts (8 TypeScript files)
- Search result data (3 JSON/CSV files)
- Documentation updates
- Diagnostic tools

**Commit:** `892227e` - "Add place of worship search and validation system"

---

### ✅ Airport Prayer Rooms - Search Fix & Database Cleanup

**Achievement:** Fixed 5 airport prayer rooms not appearing in radius searches + comprehensive database audit

**Prayer Rooms Fixed:**
- ✅ Perth Airport Prayer Room - Fixed PostGIS location, now searchable
- ✅ Adelaide Airport Prayer Room - Added missing coordinates + PostGIS
- ✅ Melbourne Airport Prayer Room - Added coordinates + PostGIS
- ✅ Brisbane Domestic Airport Prayer Room - Added coordinates + PostGIS
- ✅ Brisbane International Prayer Room - Updated address

**Root Cause Found:**
- Search function filters mosques by `last_fetched_from_google > 30 days`
- Manual entries had NULL timestamp → filtered out
- **Solution:** Set `last_fetched_from_google = NOW()` for manual entries

**Database Status:** 394 total locations (was 392, added 2 airports, restored 1 railway station)

**Database Audit Results:**
- ✅ Comprehensive audit completed
- ⚠️ Found 46 total issues (flagged for future fixes):
  - 4 duplicate names (22 entries)
  - 17 duplicate addresses (34 entries)
  - 1 missing coordinates (Southern Cross Railway Station)
  - 14 missing PostGIS location points
  - 10 missing state assignments

📖 **Technical details:** See instructions.md#airport-prayer-room-search-fix for PostGIS setup and search function logic

---

## 📅 October 25, 2025

### ✅ Email Extraction Production Run + Cold Email Campaign Setup

**Achievement:** Scraped all 211 mosque websites, extracted 21 emails, and built complete cold email campaign system

**Email Extraction Results:**
- ✅ Ran Apify Website Content Crawler on all 211 websites
- ✅ Successfully extracted **21 emails** from **20 mosques** (8% success rate, up from 5% in testing)
- ✅ Cost: $1.52 (under budget of $1.90)
- ✅ Added Islamic Society of Darra email manually (secretary@isd.org.au)
- ✅ All emails stored in `marketing_prospects.email_primary/secondary/tertiary`

**Emails by State:**
- NSW: 10 mosques
- VIC: 5 mosques
- WA: 4 mosques
- ACT: 1 mosque
- QLD: 1 mosque

**Cold Email Campaign System Built:**
1. ✅ Export scripts - 3 CSV files created (full list, test batch, email-only list)
2. ✅ Email templates - 3 templates + 2 follow-up sequences ([docs/campaign-email-templates.md](docs/campaign-email-templates.md))
3. ✅ Phone outreach guide - Scripts, objection handling, tracking ([docs/phone-outreach-guide.md](docs/phone-outreach-guide.md))
4. ✅ Campaign tracker - Spreadsheet template ([docs/campaign-tracker-template.csv](docs/campaign-tracker-template.csv))
5. ✅ Launch checklist - 60-day timeline ([docs/campaign-launch-checklist.md](docs/campaign-launch-checklist.md))
6. ✅ Phone call logger - Interactive CLI tool (`scripts/log-phone-call.ts`)

**Campaign Activity (User-initiated):**
- ✅ Sent 3 emails: Al Madinah, Artarmon, Islamic Society of Darra
- ✅ Database updated with campaign status for contacted mosques
- ✅ Holland Park & Preston mosques marked for phone outreach (Priority 2)
- 📞 Plan: Phone calls + emails for next 2 weeks

**Campaign Goals (Next 2 weeks):**
- Target: 15-20 total contacts (email + phone)
- Expected: 3-5 positive responses
- Realistic: 1-2 backlinks earned

**Files Created:**
- `docs/campaign-emails-ready.csv` - All 21 mosques
- `docs/campaign-email-list.txt` - Email addresses only
- `docs/campaign-test-batch.csv` - First 5 mosques
- `docs/campaign-email-templates.md` - 3 templates + follow-ups
- `docs/phone-outreach-guide.md` - Complete phone scripts
- `docs/campaign-launch-checklist.md` - Step-by-step guide
- `docs/campaign-tracker-template.csv` - Progress tracker
- `scripts/export-campaign-emails.ts` - Email export tool
- `scripts/update-campaign-status.ts` - Database updater
- `scripts/log-phone-call.ts` - Interactive call logger

📖 **Technical details:** See instructions.md for database constraint fixes and Apify integration

---

### ✅ Auto-Refresh Cron Job - FIXED (Evening)

**Issue:** Weekly cache refresh hadn't run for 14 days (last: Oct 11, 2025) - cache was stale

**Root Cause:** Existing cron job (jobid 5) had broken configuration:
- Wrong authorization token (publishable key instead of service role)
- URL had line breaks causing syntax errors
- Job was failing silently every week

**Solution (15 mins):**
1. ✅ Deleted broken cron job (jobid 5)
2. ✅ Created new working cron job (jobid 6) with correct credentials
3. ✅ Manually triggered cache refresh (request_id: 73)
4. ✅ Auto-refresh now scheduled for every Sunday at 2 AM

**Impact:** 347 mosques refreshed with current prayer times, Google ratings, hours

**Next Step:** Verify tomorrow that cache refresh completed successfully

📖 **Technical details:** See instructions.md#cron-job-fix for SQL commands and troubleshooting

---

### ✅ Git Repository Cleanup (Evening)

**Achievement:** Protected private mosque data and committed 4 days of work to GitHub

**Security Updates:**
- ✅ Added 5 private email files to `.gitignore` (21 mosque contacts protected)
- ✅ Verified no mosque contact data in commit history
- Files protected: campaign emails CSV, email lists, extraction results

**Committed to GitHub (54 files, +10,870 lines):**
- Marketing strategy docs: Backlink campaign, Bullseye framework, value exchange strategy
- Campaign tools: Email templates, phone scripts, progress trackers
- Testing scripts: 17 Apify/database monitoring tools
- Database: Security fix migration (Oct 16)
- Assets: Holland Park demo files, Traction book references

**Commit:** `376e34a` - "Add marketing strategy documentation and campaign tools"

**Impact:** Documentation preserved, no live site changes (docs only, no application code)

📖 **Files committed:** See git log for full list

---

## 📅 October 24, 2025

### ✅ Email Extraction Testing - Apify Actor Evaluation

**Achievement:** Comprehensive testing of 4 Apify actors to extract mosque contact information

**Database Audit:**
- ✅ Verified mosque count: **347 mosques** in `mosques_cache` (updated from 342)
- ✅ Contact data: 337 mosques in `marketing_prospects` (232 phones, 211 websites, 0 emails extracted)
- ✅ Email table status: Only 2 mosques in `mosques_emails` (manual entries)

**Apify Testing Results:**
1. **Google Maps Email Extractor** (`lukaskrivka/google-maps-with-contact-details`)
   - Test: 50 mosques | Result: 0 emails (0% success)
   - Finding: Google Maps listings don't contain email addresses

2. **Website Content Crawler** (`apify/website-content-crawler`) ✅ **WINNER**
   - Test 1: 50 mosques | Result: 2 emails (5% success)
   - Test 2: 100 mosques | Result: 4 mosques, 7 emails (5% success)
   - Cost: $0.72 for 100 websites
   - **Emails found:** PGCC, Australia Light Foundation, Masjid Darul IMAAN, Indonesia Community (4 emails)

3. **Google Maps → Facebook → Email** (2-step process)
   - Test: 50 mosques | Result: 2 Facebook URLs found (4%), 0 emails extracted
   - Finding: Most mosques don't link Facebook in Google Maps

4. **Facebook Pages Scraper** (`apify/facebook-pages-scraper`)
   - Test: General search for Australian mosques | Result: 1 page found, 0 emails
   - Issue: Requires Facebook login credentials (security risk)

**Key Learnings:**
- Website scraping is the ONLY viable method for email extraction
- 5% success rate = ~11 emails expected from 211 total websites
- Projected cost: $1.90 for all 211 mosques
- Facebook scraping blocked without login (not recommended for security)
- Google Maps data lacks email addresses

**Files Created:**
- `docs/website_emails_test.csv` - 100 mosques tested, 4 with emails
- `docs/facebook_mosques_test.csv` - Empty (Facebook test failed)
- `docs/apify-email-extraction-plan.md` - Testing strategy documentation

**Status:** 🟡 Email extraction possible but low yield (5% success). Alternative: Use 232 phone numbers for outreach

📖 **Technical details:** See instructions.md for Apify actor comparisons and regex email extraction methods

---

## 📅 October 21, 2025

### ✅ Removed Halal Supermarkets Feature

**Achievement:** Simplified navigation by removing Halal Markets page and all related links

**Changes:**
- ✅ Removed `/halal-supermarkets` route from App.tsx
- ✅ Removed "Halal Markets" button from desktop navbar
- ✅ Removed "Halal Markets" button from mobile hamburger menu
- ✅ Removed Store icon import from navbar component

**Deployment:**
- ✅ Commit b1275a1: "Remove Halal Supermarkets page and navigation links"
- ✅ 2 files changed: 1 insertion, 27 deletions
- ✅ Pushed to GitHub main branch, live on production

**Rationale:** Streamlined user experience to focus on core mosque directory functionality

**Status:** 🟢 Navigation simplified - cleaner focus on mosque finder features

---

## 📅 October 20, 2025

### ✅ Navbar Redesign & Homepage Reorganization (Evening)

**Achievement:** Complete UI overhaul - solid white navbar with auto-hide + simplified homepage

**Navbar Changes:**
- ✅ Converted transparent navbar to solid white with shadow
- ✅ Added site name "findmymosque.org" (with bold "findmymosque") to navbar left
- ✅ Auto-hide on scroll down functionality (shows on scroll up or near top)
- ✅ Swapped FAQ and Imams link positions in nav
- ✅ Separate desktop/mobile layouts: Desktop = horizontal, Mobile = site name on top, hamburger below
- ✅ All text changed from warm-ivory to gray-900 (black), hover states to teal-600

**Homepage Changes:**
- ✅ Removed hero section with interactive mobile animation (saved to `src/components/backup-animations/`)
- ✅ Removed trust cards section from homepage
- ✅ Changed main heading from "Find Mosques Near You" → "Find any Mosque in Australia"
- ✅ Search section moved to top of page (removed 2-inch spacing below)

**FAQ Page:**
- ✅ Added trust cards (100% Free, Community Built, No Ads Ever) below page title

**Deployment:**
- ✅ Commit b30bcc1: "Redesign navbar and reorganize homepage layout"
- ✅ 9 files changed: +892 insertions, -304 deletions
- ✅ Pushed to GitHub main branch, live on production

**Files Modified:** `TransparentNavbar.tsx`, `MosqueLocator.tsx`, `FAQ.tsx`, `vite-env.d.ts`, `sitemap.xml`

**Status:** 🟢 Major UI refresh complete - cleaner, more professional design

📖 **Technical details:** See instructions.md for navbar structure and mobile layout implementation

---

### ✅ Holland Park Demo - Events & Partnerships Updated (Morning)

**Achievement:** Finalized Holland Park featured pages with 100% verified real data only

**Events Page Updates:**
- ✅ Replaced 8 mock events with 4 real verified events scraped from Facebook
- ✅ Real attendee counts: Usman Khawaja session (32), Ramis Ansari (11), Khatam ul Quran (24), Model Building (6)
- ✅ Changed default tab from 'upcoming' to 'past' (no upcoming events currently)
- ✅ Updated hero section: "Community Events" instead of "Upcoming Events"

**Partnerships Page Updates:**
- ✅ Reduced from 8 partnerships to 3 verified partnerships (MVP approach)
- ✅ Verified partnerships: SBS documentary, ISA Collective (2022 Master Builders Award), Brisbane Heritage (2003)
- ✅ Removed all placeholder logo images and simplified stats section

**Deployment:**
- ✅ Created PR #1, merged to main, all changes live on production

**Status:** 🟢 Holland Park demo MVP complete - ready for partnership pitch

📖 **Web scraping details:** See instructions.md for Chrome DevTools MCP usage

---

## 📅 October 19, 2025

### ✅ Holland Park Mosque Demo - Professional Content & Design

**Achievement:** Transformed demo page with 100% verified content and professional imagery

**Key Updates:**
- ✅ Real Google Reviews (4.9-star, 560 reviews) + live prayer times iframe
- ✅ Custom Google Maps with site logo as marker pin
- ✅ Verified contact info, directions, and professional photos (ISA Collective)
- ✅ Removed all unverified content (mock events, placeholder stats)
- ✅ Added real Imam Uzair photo to Religious Leadership section

**Verification:** Used Chrome DevTools MCP to scrape hollandparkmosque.org.au and Google Maps

**Status:** 🟢 Demo ready for partnership pitch

📖 **Technical details:** See instructions.md for Google Maps API integration and iframe embedding

---

### ✅ Mobile Navigation Fix - Browse by State

**Problem:** Mobile users couldn't access state pages - dropdown clicks failed

**Solution:** Dedicated teal "Browse by State" button in mobile navbar (separate from hamburger menu)

**Result:** All 6 state pages now accessible on mobile, dropdown positioning fixed

**Deployed:** Commit f66ba00 (~3 hours debugging/testing)

📖 **Full details:** instructions.md#mobile-navigation-bug-fixes

---

## 📅 October 18, 2025

### ✅ Backlink Building Strategy - 2-Month Campaign Plan

**Achievement:** Created 8-week SEO strategy targeting 30-50 quality backlinks ($0 budget, 4-5 hrs/week)

**Timeline:** Week 1-2: Islamic/business directories (15-20 links) → Week 3-4: Content + Holland Park (2-5) → Week 5-6: Featured mosques + universities (8-12) → Week 7-8: Scale mosque outreach (10-15)

**Resources Built:**
- Target lists: 8 Islamic directories, 50+ business directories, 15 universities, 342 mosques (211 with websites)
- 5 email templates for different outreach scenarios
- Weekly progress tracker

**Success Metrics:** 30+ backlinks (min) to 50+ (strong), 20-50% traffic increase, Top 3 ranking "mosque directory Australia"

📖 **Full strategy:** docs/backlink-strategy.md

---

### ✅ Value Exchange Strategy - Service-First Partnerships

**Achievement:** Built framework to earn backlinks through genuine value delivery (30-80% success vs 5-10% traditional)

**Core:** Lead with service (verified profiles, badges, analytics, featured pages) → backlink request comes AFTER

**5 Ideas:** Verified Profile + Badge (30-40% success) | Partner Integration Hub (2-3 links/mosque) | Digital Presence Upgrade (70-80% success) | Featured Showcase (Holland Park model) | Volunteer Campaigns

**Next:** Design badges, create mosque profile template, build analytics reports, email Holland Park with demo

📖 **Full strategy:** docs/value-exchange-strategy.md

---

## 📅 October 17, 2025

### ✅ Bullseye Framework Implementation

**Achievement:** Implemented Traction book's Bullseye framework for systematic channel testing

**Built:** 5 strategy docs, testing spreadsheet, 7 priority channels identified (Reddit/FB, Google Ads, Mosque Emails, etc.)

**Key Insight:** Test cheaply ($1K max), quickly (1 month), find ONE channel that works, then focus 80% effort on it

**Files:** `docs/bullseye-marketing-strategy.md`, `docs/bullseye-flexible-template.csv`

**Status:** 🟢 Framework ready for Week 1 launch

📖 **Full strategy:** [docs/bullseye-marketing-strategy.md](./docs/bullseye-marketing-strategy.md)

---

## 📅 October 16, 2025

### ✅ Supabase Security Audit - 26 of 31 Issues Fixed

**Achievement:** Fixed 5 SECURITY DEFINER views + 21 function search_path warnings

**Fixed:** All views now use `security_invoker=true` (respects RLS), functions have `SET search_path = public, pg_temp` (prevents injection)

**Files:** `supabase/migrations/20251016_fix_security_definer_issues.sql`

**Status:** 🟢 84% of issues resolved, database security hardened

📖 **Technical details:** See [instructions.md#database-security](./instructions.md)

---

## 📅 October 12, 2025

### ✅ Make.com Automation + Marketing Infrastructure

**Achievement:** Built complete tracking system for community engagement campaign

**Built:** Post Logger (form → webhook → Google Sheet in 30s) | Google Sheets template (8 tabs, auto-formulas) | 15 platform-specific scripts | Apps Script auto-setup

**Status:** 🟢 Week 1 campaign ready to launch

📖 **Full strategy:** marketing-strategy-project.md

---

### ✅ 342 Verified Mosques + SEO Phase 1

**Achievement:** Migrated 259 new mosques (83→342), validated with Google API

**Breakdown:** NSW: 126, VIC: 101, WA: 48, QLD: 34, SA: 23, ACT: 6, NT: 3, TAS: 1 (99.1% validation success)

**SEO:** Updated meta tags "83+" → "340+", enhanced Schema.org (5 types), completed Search Console setup

**Fix:** All 6 state pages now fetch from database dynamically (removed 870 lines hardcoded data)

**Deployed:** Commit e6a539f

---

## 📅 October 11, 2025
- ✅ Cache system 100% rollout (700ms, $0 per search, $66/month savings)
- ✅ Email scraper built (Puppeteer, $0 vs $49/month Apify)

## 📅 October 10, 2025
- ✅ Email extraction pipeline (7 modules, `mosques_emails` table)

## 📅 October 9, 2025
- ✅ Backend cache deployed (10% rollout, 3 tables, RLS policies)

## 📅 October 7, 2025
- ✅ Dynamic sitemap automation, Halal Supermarket Finder Phase 1, mobile hamburger menu

## 📅 October 6, 2025
- ✅ 6 state landing pages, 33 mosques, region filtering

## 📅 September 2025
- ✅ Site deployed, domain configured, Supabase + Google Places API integrated

---

## 🗂️ Database Schema (12 Tables)

### Public Tables
- `mosques_cache` (347) - Main cache with verified, state-tagged mosques
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

### Pending Actions
- [ ] Review 17 duplicate addresses (34 entries) - determine if same org or different (see mosque-audit-report.json)
- [ ] Build Prayer Times feature page (navbar button ready, route pending)
- [ ] Cold Email Campaign - continue outreach to mosques
- [ ] Holland Park Demo - send partnership pitch to mosque

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
