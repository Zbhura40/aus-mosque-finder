# Find My Mosque - Project Notes

> **Last Updated:** October 12, 2025
> **Purpose:** Date-organized progress tracking and quick reference

---

## 📋 Project Overview

**Project:** Australian mosque directory (findmymosque.org)
**Tech Stack:** React + TypeScript, Vite, TailwindCSS, Supabase, Google Places API
**Status:** Live with 342 verified mosques, 100% cache system, weekly automation

**Key Features:** Mosque finder, state landing pages, Halal Supermarket Finder, feedback form, SEO sitemap

📖 **References:**
- Detailed tech docs: [instructions.md](./instructions.md)
- Simple explanations: `project-notes-for-zbthedummy.txt`
- Marketing strategy: [marketing-strategy-project.md](./marketing-strategy-project.md)

---

## 📅 October 12, 2025

### ✅ Major Update: 342 Verified Mosques + Phase 1 SEO Complete

**Achievements:** Migrated 259 new mosques (83→342), validated all with Google API, completed Phase 1 SEO optimization

#### Mosque Migration & Validation ✅
- **Validated** 337 mosques with Google Places API (99.1% success rate: 334 valid, 3 invalid)
- **Migrated** 259 new mosques from `marketing_prospects` → `mosques_cache`
- **Fixed** 83 mosques with unknown states (extracted from addresses)
- **Result:** 342 total mosques, all with proper state tags

**State Breakdown:**
NSW: 126 | VIC: 101 | WA: 48 | QLD: 34 | SA: 23 | ACT: 6 | NT: 3 | TAS: 1

#### SEO Phase 1 Complete ✅
- Updated meta tags: "83+" → "340+ verified mosques"
- Removed "prayer times" claims (feature not available yet)
- Enhanced Schema.org markup (5 types: WebSite, Organization, Service, FAQPage, BreadcrumbList)
- Added ACT & NT to Schema FAQ answers

#### Scripts & Tools Added ✅
- `validate-google-places.ts` - Google API validation
- `migrate-validated-mosques.ts` - Migration with duplicate checking
- `fix-unknown-states.ts` - State extraction from addresses
- `validation-results.json` - Full validation report

#### Google Business Profile Discovery ❌
- Researched GBP eligibility → **Not eligible** (online-only businesses excluded)
- Created correct SEO plan: `docs/seo-action-plan.md` (6-phase strategy)
- Completed Phase 2: Google Search Console setup & sitemap submission

**Files:**
- SEO plan: `docs/seo-action-plan.md`
- Marketing scripts: `scripts/marketing/` (7 new scripts)

**Status:** 🟢 342 mosques live, SEO optimized, ready for Phase 3 (city landing pages)

### Earlier (Days 7-8): Cache & Automation ✅
- Cache scaled to 100% rollout
- Weekly auto-refresh deployed (Sundays 2 AM)
- Cost savings: $66/month (66% reduction)
- Performance: 700ms cache hits (58% faster)

---

## 📅 October 11, 2025

### ✅ Cache System - Scaled to 50% Rollout

**Achievement:** Successfully scaled cache from 10% → 50% and deployed to production

**Updates:**
- ✅ Updated `featureFlags.ts`: 10% → 50% rollout
- ✅ Tested locally: Both cache and legacy systems working
- ✅ Deployed to production (commit 4bac213)
- ✅ Verified live: Random assignment working correctly

**Performance Confirmed:**
- Session 0-49: Fast cache (700ms, $0 cost)
- Session 50-99: Legacy Google API (1,700ms, $0.032)
- Expected savings: ~$38/month at 50% rollout

**Status:** 🟢 Live at findmymosque.org, monitoring for 24-48h before 100% rollout

**Next:** Scale to 100% if no issues detected (projected $77/month savings)

### ✅ Free Email Scraper - Day 2b COMPLETE

**Achievement:** Built $0 alternative to Apify, extracted all emails

**What Was Built:**
- ✅ `marketing_prospects` table (337 mosques with full data)
- ✅ Puppeteer email scraper (free, open source)
- ✅ Import script (JSON → Supabase)
- ✅ Test script (validated on 5 websites)
- ✅ Full extraction running (211 websites, 2-3 hours)

**Test Results (5 websites):**
- Success rate: 60% (3/5 accessible)
- Emails found: 1 verified
- Expected full results: 40-70 verified emails

**Files Created:**
- `supabase/migrations/20251011_create_marketing_prospects_table.sql`
- `scripts/marketing/import-prospects.ts`
- `scripts/marketing/scrape-emails.ts`
- `scripts/marketing/test-scraper.ts`
- Dependencies: puppeteer, puppeteer-extra

**Status:** 🔄 Full extraction running in background

**Cost:** $0 (vs $49/month Apify upgrade)

**Next:** Review results when complete, export campaign-ready emails

📖 **Technical setup:** See [marketing-strategy-project.md](./marketing-strategy-project.md#alternative-approach-free-puppeteer-email-scraper)

---

## 📅 October 10, 2025

### ✅ Marketing System - Day 1 Complete

**Achievement:** Email extraction system built and tested successfully!

**What Was Built:**
- 7 TypeScript modules for email extraction pipeline
- Supabase `mosques_emails` table (private, RLS-protected)
- Google Maps → Website → Facebook scraping chain
- DNS MX email validation (free, 95% accuracy)
- Test extraction verified (20 mosques, 1 verified email)

**Files Created:**
- `supabase/migrations/20251010_create_mosques_emails_table.sql`
- `scripts/apify/` - 7 modules (validator, scrapers, uploader, orchestrator)
- `marketing-strategy-project.md` - 5-day execution plan
- Dependencies: apify-client, tsx

**Test Results:**
- Duration: 32 seconds
- Mosques found: 20 (Sydney)
- Emails found: 1
- Verified: 100%
- Cost: ~$0.20

**Status:** ✅ System ready for full extraction (300+ mosques, ~$25-30)

**Next:** Run full extraction when ready (`npm run extract-emails`)

📖 **See:** [instructions.md#mosque-email-extraction-system](./instructions.md)

---

## 📅 October 9, 2025

### Backend Cache System (Days 4-5)

**Achievement:** Cache deployed at 10% rollout, saving costs and improving speed

**Performance:**
- Cache hits: 700ms (58% faster)
- Google API: 1,700ms
- Cost: $0 (cache) vs $0.032 (Google)
- 84 mosques cached

**Files:**
- `src/config/featureFlags.ts` - Rollout control
- `src/services/mosqueService.ts` - Cache-first routing
- `src/components/MosqueLocator.tsx` - Frontend integration

**Status:** 10% rollout active, monitoring for 24-48h before scaling to 50%

**Expected Savings:** $77/month at 100% rollout

### Database Tables Added

**`mosques_cache`** - Main cache (public read, 84 records)
**`search_cache`** - Query results cache (7-day expiry)
**`google_api_logs`** - Cost tracking

**RLS Fixed:** Anonymous feedback submissions now working

---

## 📅 Previous Work Summary

### October 7, 2025
- ✅ SEO Week 4: Dynamic sitemap automation
- ✅ Halal Supermarket Finder Phase 1 (3 test records)
- ✅ Mobile hamburger menu + favicon

### October 6, 2025
- ✅ 6 state landing pages (NSW, VIC, QLD, WA, SA, TAS)
- ✅ 33 placeholder mosques added
- ✅ Region filtering + popular searches

### September 2025
- ✅ Site deployed to GitHub Pages
- ✅ Domain configured (findmymosque.org)
- ✅ Supabase integration
- ✅ Google Places API setup

---

## 🗂️ Database Schema (12 Tables)

### Public Tables
- `mosques_cache` (342) - Main cache with verified, state-tagged mosques
- `search_cache` - Query results cache (7-day expiry)
- `supermarkets` (3) - Halal finder
- `feedback` - User submissions
- `prayer_times` - Scraping data

### Private Tables (Marketing & Analytics)
- `mosques_emails` - Email addresses
- `marketing_prospects` (337) - Source data for mosque migration
- `google_api_logs` - Cost tracking & refresh history
- `scraping_logs` - Automation logs

📖 **Schema details:** [instructions.md#database-schema](./instructions.md)

---

## 🎯 Roadmap

### Completed ✅
- ✅ Cache system at 100% rollout
- ✅ Weekly auto-refresh automation
- ✅ 342 mosques validated & migrated (Google API verified)
- ✅ SEO Phase 1 & 2 complete (meta tags, Schema, Google Search Console)
- ✅ All mosques have proper state tags

### Current Focus (Phase 3 - SEO)
1. **City Landing Pages** - Sydney, Melbourne, Brisbane, Perth, Adelaide, Canberra
2. **Backlink Strategy** - Contact 340 mosques, Islamic organizations
3. **Content Marketing** - Blog posts, guides

**See:** `docs/seo-action-plan.md` for full 6-phase strategy

### Medium-term (2-4 months)
- Complete SEO Phases 4-6 (social media, content, local optimization)
- Marketing email campaign
- Halal Supermarket automation

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
- Service role keys for scripts only

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
APIFY_TOKEN=apify_api_xxx
GOOGLE_MAPS_API_KEY=xxx  # In Supabase secrets
```

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
