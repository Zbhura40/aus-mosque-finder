# Find My Mosque - Project Notes

> **Last Updated:** October 10, 2025
> **Purpose:** Date-organized progress tracking and quick reference

---

## 📋 Project Overview

**Project:** Australian mosque directory (findmymosque.org)
**Tech Stack:** React + TypeScript, Vite, TailwindCSS, Supabase, Google Places API
**Status:** Live on GitHub Pages with 33+ mosques across 6 states

**Key Features:** Mosque finder, state landing pages, Halal Supermarket Finder, feedback form, SEO sitemap

📖 **References:**
- Detailed tech docs: [instructions.md](./instructions.md)
- Simple explanations: `project-notes-for-zbthedummy.txt`
- Backend plan: [SUPABASE_BACKEND_PLAN.md](./SUPABASE_BACKEND_PLAN.md)
- Marketing strategy: [marketing-strategy-project.md](./marketing-strategy-project.md)

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

## 🗂️ Database Schema (10 Tables)

### Public Tables
- `mosques` (2) - Legacy data
- `mosques_cache` (84) - Main cache
- `search_cache` - Query cache
- `supermarkets` (3) - Halal finder
- `feedback` - User submissions
- `prayer_times` - Scraping data

### Private Tables
- `mosques_emails` (2) - **Marketing only, no public access**
- `google_api_logs` - Cost tracking
- `scraping_logs` - Automation logs
- `scrape_logs` - Supermarket logs

📖 **Schema details:** [instructions.md#database-schema](./instructions.md)

---

## 🎯 Roadmap

### Immediate (Days 6-7)
1. ⏳ Monitor cache @ 10% (24-48h)
2. ⏳ Scale to 50% if successful
3. ⏳ Full 100% rollout (Day 7)
4. ⏳ Verify $77/month savings

### Marketing (Days 2-5)
1. ⏳ **Day 2:** Run full email extraction (300+ mosques)
2. ⏳ **Day 3:** Create email campaign (3-email sequence)
3. ⏳ **Day 4:** Launch campaign (50-100 emails/day)
4. ⏳ **Day 5:** Monitor & optimize

### Day 8 - Weekly Automation
**Prerequisite:** Day 7 @ 100% rollout with zero issues

Tasks: Edge Function for weekly mosque refresh, PostgreSQL cron (Sundays 2 AM), differential sync

**Expected:** ~$2.70/week to keep 84+ mosques fresh

### Medium-term (1-3 months)
- Halal Supermarket automation (Phases 2-4)
- User authentication
- Prayer times integration
- Mobile app consideration

---

## 💰 Cost Summary

**Current:** ~$1.25/month (domain only, Supabase free tier, GitHub Pages free)

**After Cache (Day 7):** ~$24/month
- Google Places: ~$23/month (with cache)
- Claude AI: ~$1-2/month
- **Savings:** $52/month vs no cache

**Marketing (One-time):** $25-30 for 300+ mosque emails

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
npm run extract-emails      # Marketing: Extract mosque emails
npm run lint                # TypeScript check
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
