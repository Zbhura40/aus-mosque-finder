# Halal Supermarket Finder - Project Documentation

**Project Goal:** Build a cost-effective, automated system to detect which Australian supermarkets have halal sections.

**Status:** In Development
**Start Date:** October 7, 2025

---

## 📋 Project Overview

### What We're Building

An automated data pipeline that:
1. Fetches supermarket data from Google Places API
2. Uses AI (Claude) to analyze if they have halal sections
3. Stores verified results in Supabase database
4. Updates automatically every week
5. Displays results on your website with map integration

### Why This Matters

- Helps Muslim community find halal groceries easily
- Complements your mosque finder perfectly
- Automated = low maintenance
- Cost-optimized = affordable to run

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS WEBSITE                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js/React)                            │
│  • Map view with supermarket markers                             │
│  • Filter: Halal only, by confidence level                       │
│  • Search by location/suburb                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼ (reads from)
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE DATABASE                                   │
│  Tables:                                                         │
│  • supermarkets (main data)                                      │
│  • scrape_logs (update history)                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▲ (updated by)
                      │
┌─────────────────────────────────────────────────────────────────┐
│         AUTOMATED PIPELINE (Runs Weekly)                         │
│                                                                  │
│  Step 1: Google Places API                                       │
│  ├─ Fetch supermarkets by region                                │
│  └─ Get reviews, ratings, place details                          │
│                                                                  │
│  Step 2: Claude AI Analysis                                      │
│  ├─ Analyze text for halal mentions                             │
│  ├─ Check reviews, descriptions                                  │
│  └─ Calculate confidence score                                   │
│                                                                  │
│  Step 3: Data Processing                                         │
│  ├─ Deduplicate results                                          │
│  ├─ Filter by confidence ≥ 0.7                                   │
│  └─ Update Supabase database                                     │
│                                                                  │
│  Step 4: Logging & Monitoring                                    │
│  └─ Track API costs, success rate                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Table: `supermarkets`

```sql
CREATE TABLE supermarkets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  chain TEXT,  -- e.g., "Coles", "Woolworths", "IGA"
  has_halal_section BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3, 2),  -- 0.00 to 1.00
  reasoning TEXT,  -- AI explanation
  source TEXT,  -- Where info came from
  user_ratings_total INTEGER,
  last_checked TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_has_halal ON supermarkets(has_halal_section);
CREATE INDEX idx_confidence ON supermarkets(confidence_score);
CREATE INDEX idx_place_id ON supermarkets(place_id);
```

### Table: `scrape_logs`

```sql
CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_date TIMESTAMP DEFAULT NOW(),
  region TEXT,
  supermarkets_found INTEGER,
  supermarkets_processed INTEGER,
  halal_stores_found INTEGER,
  api_calls_used INTEGER,
  cost_estimate DECIMAL(10, 2),
  status TEXT,  -- 'success', 'partial', 'failed'
  error_message TEXT,
  duration_seconds INTEGER
);
```

---

## 💰 Cost Optimization Strategy

### Google Places API Pricing

**Our Strategy:**
- Text Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests

**Weekly Budget:**
- 200 supermarkets × 1 text search = 200 requests = $6.40
- 200 supermarkets × 1 place details = 200 requests = $3.40
- **Total per week: ~$9.80**
- **Monthly cost: ~$40**

**Cost Reduction Tactics:**
1. ✅ Cache results - don't re-fetch unchanged data
2. ✅ Batch by region - query once per city, not per store
3. ✅ Only fetch new/changed reviews
4. ✅ Use fields parameter to limit data returned
5. ✅ Run weekly, not daily

### Claude API Pricing

**Our Strategy:**
- Analyze only new/unverified entries
- Use cached summaries instead of full reviews
- Batch multiple analyses together

**Estimate:**
- ~200 analyses per week
- ~500 tokens per analysis = 100K tokens
- Claude Sonnet: $3 per 1M input tokens
- **Cost: ~$0.30/week or $1.20/month**

### Total Monthly Cost: ~$45

---

## 🎯 Accuracy Rules

### Verification Levels

**High Confidence (0.9-1.0):**
- Halal mentioned in official website
- Multiple recent reviews confirm halal section
- Store responds to "halal" queries

**Medium Confidence (0.7-0.89):**
- 2+ reviews mention halal products
- Social media posts show halal section
- Place description includes "halal"

**Low Confidence (<0.7):**
- Single mention only
- Outdated information
- Conflicting reports
- **ACTION: Don't display, needs manual verification**

### Data Acceptance Rule

Data is only accepted if found in **at least one** of:
1. Official website mentions halal
2. ≥2 consistent Google reviews mention halal
3. Recent Facebook/social posts show halal section
4. Store manager confirmation (future feature)

---

## 🔄 Automation Workflow

### Weekly Cron Job (Every Monday 2 AM AEST)

```
1. Check last run from scrape_logs
2. Fetch supermarkets from Google Places API
   ├─ Query by major cities (Sydney, Melbourne, Brisbane, etc.)
   ├─ Filter for major chains (Coles, Woolworths, IGA, Aldi, FoodWorks)
   └─ Limit to 200 results per run
3. For each supermarket:
   ├─ Check if place_id exists in database
   ├─ If exists: Only process if reviews updated
   └─ If new: Full analysis
4. Analyze with Claude:
   ├─ Input: Name, description, reviews (last 10)
   ├─ Output: has_halal_section, confidence, reasoning
   └─ Only accept if confidence ≥ 0.7
5. Update database:
   ├─ Insert new supermarkets
   ├─ Update changed halal status
   └─ Update last_checked timestamp
6. Log results to scrape_logs
7. Send email notification (optional)
```

---

## 🛠️ Technical Stack

### Backend
- **Google Places API** - Supermarket data
- **Claude AI (via MCP)** - Halal detection
- **Supabase** - Database & Edge Functions
- **Node.js** - Scripts & automation

### Frontend
- **React** - UI components
- **Google Maps API** - Map display
- **TailwindCSS** - Styling
- **Supabase Client** - Data fetching

### Tools
- **Apify** (optional) - Website scraping for official data
- **Cron-job.org** - Trigger weekly updates
- **Supabase Edge Functions** - Serverless execution

---

## 📁 Project Structure

```
/findmymosque
├── supabase/
│   ├── migrations/
│   │   └── 20251007_create_supermarkets_tables.sql
│   └── functions/
│       ├── fetch-supermarkets/
│       │   └── index.ts
│       ├── analyze-halal/
│       │   └── index.ts
│       └── update-supermarkets/
│           └── index.ts
├── scripts/
│   ├── supermarket-pipeline/
│   │   ├── 1-fetch-places.js
│   │   ├── 2-analyze-halal.js
│   │   ├── 3-update-database.js
│   │   └── config.js
│   └── run-weekly-update.js
├── src/
│   ├── pages/
│   │   └── HalalSupermarkets.tsx
│   └── components/
│       ├── SupermarketMap.tsx
│       └── SupermarketCard.tsx
├── .env.example
└── HALAL_SUPERMARKET_PROJECT.md (this file)
```

---

## 🔐 Environment Variables

### Required API Keys

```bash
# Google Places API
VITE_GOOGLE_PLACES_API_KEY=your_key_here

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Claude AI (for MCP)
ANTHROPIC_API_KEY=your_claude_key

# Optional: Apify for scraping
APIFY_API_KEY=your_apify_key
```

---

## 📈 Success Metrics

### Phase 1 (Weeks 1-4)
- ✅ 200+ supermarkets in database
- ✅ 50+ verified halal sections (confidence ≥ 0.8)
- ✅ Weekly automation running successfully
- ✅ Frontend page live and functional

### Phase 2 (Months 2-3)
- 500+ supermarkets covered
- 100+ verified halal sections
- User feedback system integrated
- API costs under $50/month

### Phase 3 (Months 4-6)
- 1,000+ supermarkets
- Cover all major Australian cities
- Community contributions enabled
- Mobile app considerations

---

## 🚨 Risk Mitigation

### Technical Risks

**Risk:** Google API costs spiral
**Mitigation:** Set billing alerts at $50, implement rate limiting

**Risk:** False positives (showing non-halal stores)
**Mitigation:** Only display confidence ≥ 0.7, show confidence score to users

**Risk:** Claude API changes pricing
**Mitigation:** Design to swap AI provider, cache all analyses

### Data Quality Risks

**Risk:** Outdated information (store removed halal section)
**Mitigation:** Weekly updates, user reporting system, "last verified" dates

**Risk:** Regional variations (one Coles has halal, another doesn't)
**Mitigation:** Track by individual store location, not chain-wide

---

## 🎨 Frontend Features

### Main Page: "Supermarkets Offering Halal"

**Header:**
- Page title: "Find Halal-Friendly Supermarkets"
- Subtitle: "Discover supermarkets with dedicated halal sections near you"

**Map View:**
- Google Maps with supermarket markers
- Green pin = Halal section confirmed
- Color intensity = Confidence level
- Click marker → Show details card

**Filters:**
- ☑️ Show halal only
- Confidence level slider (0.7 - 1.0)
- Supermarket chain filter (Coles, Woolworths, IGA, etc.)
- Distance radius (5km, 10km, 20km, 50km)

**List View:**
- Supermarket cards with:
  - Name & address
  - Chain logo
  - Confidence badge (High/Medium/Low)
  - Last verified date
  - "Get Directions" button
  - Halal section details (if available)

**Search:**
- Enter suburb or postcode
- "Use my location" button
- Results update map + list

---

## 📝 Implementation Phases

### Phase 1: Foundation (Week 1) ← We start here
- [x] Create project documentation
- [ ] Set up Supabase database tables
- [ ] Create Google Places API integration
- [ ] Build Claude halal detection script
- [ ] Test pipeline with 10 test stores

### Phase 2: Automation (Week 2)
- [ ] Create Supabase Edge Function
- [ ] Set up weekly cron job
- [ ] Add logging and monitoring
- [ ] Test full automation cycle

### Phase 3: Frontend (Week 3)
- [ ] Create HalalSupermarkets.tsx page
- [ ] Build map component with markers
- [ ] Add filters and search
- [ ] Design supermarket cards
- [ ] Add to navigation

### Phase 4: Testing & Launch (Week 4)
- [ ] Test with real data (100 stores)
- [ ] Verify accuracy of halal detection
- [ ] Optimize API costs
- [ ] Deploy to production
- [ ] Announce feature to users

---

## 🎓 How It Works (Simple Explanation)

### For You (Non-Technical)

**Think of it like a robot assistant that:**

1. **Searches Google** for all supermarkets in Australian cities
   - Like you typing "supermarkets near me" but automatically

2. **Reads reviews** to find halal mentions
   - Like reading hundreds of reviews manually
   - But the AI does it in seconds

3. **Stores the results** in your database
   - Remembers which stores have halal sections
   - Keeps track of confidence level

4. **Updates weekly** automatically
   - Checks for new stores
   - Verifies old information still accurate
   - Runs while you sleep!

5. **Shows results** on your website
   - Beautiful map with pins
   - Click any pin to see details
   - Filter by confidence level

---

## 💡 Future Enhancements

### Planned Features
- User contributions: "Report halal section"
- Photo uploads: Community-verified images
- Product categories: Halal meat, snacks, frozen foods
- Store hours: When halal counter is open
- Price comparison: Where to find best halal deals
- Notifications: Alert when new halal store opens nearby

### Integration Opportunities
- Link to nearby mosques (you already have this data!)
- Prayer times correlation (shop after Jummah)
- Ramadan specials: Track iftar items availability
- Community ratings: Users rate halal selection quality

---

## 📞 Support & Maintenance

### Weekly Tasks (Automated)
- ✅ Cron job runs automatically
- ✅ Updates database with new data
- ✅ Logs all activity

### Monthly Tasks (5 minutes)
- Check scrape_logs for any errors
- Review API costs in Google/Claude dashboards
- Verify accuracy of a few random stores

### As Needed
- Respond to user reports of incorrect data
- Add new supermarket chains to search
- Adjust confidence thresholds based on feedback

---

## 🎯 Key Performance Indicators (KPIs)

| Metric | Target | Current |
|--------|--------|---------|
| **Supermarkets Tracked** | 200+ | 0 (starting) |
| **Halal Stores Found** | 50+ | 0 (starting) |
| **Accuracy Rate** | >90% | TBD |
| **Monthly API Cost** | <$50 | $0 (not started) |
| **User Searches/Month** | 100+ | 0 (not launched) |
| **Weekly Update Success** | 100% | TBD |

---

**Last Updated:** October 7, 2025
**Next Review:** After Phase 1 completion
**Project Status:** 🟢 In Development
