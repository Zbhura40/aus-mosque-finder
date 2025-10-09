# Supabase Backend Implementation - 7 Day Plan

> **Goal:** Reduce Google API costs by 96% ($40 → $2/month) while improving search speed 5x
> **Status:** Day 1 Complete ✓ - Database Setup Done
> **Last Updated:** October 9, 2025

---

## 📊 Quick Overview

**The Strategy:**
- Build Supabase cache to store mosque data
- Check cache first, only call Google for fresh/missing data
- Weekly automated refresh keeps data current
- Zero impact on existing features (backward compatible)

**Expected Results:**
- 80-95% cache hit rate
- Search speed: 2.5s → 0.4s
- Monthly savings: $38
- API calls: 10,000 → 400/month

---

## 🗂️ Database Schema

### Table 1: `mosques_cache` (Main Data Store)
```sql
- id, google_place_id (unique), name, address
- location (geography), suburb, state
- phone_number, website, opening_hours (jsonb)
- google_rating, review_count, attributes (jsonb)
- last_fetched_from_google, created_at, updated_at
```

### Table 2: `search_cache` (Search Results)
```sql
- id, search_hash (unique), lat, lng, radius_km
- results (jsonb), expires_at (7 days), created_at
```

### Table 3: `google_api_logs` (Cost Tracking)
```sql
- id, api_type, request_params (jsonb)
- cost_estimate, cache_hit (boolean), created_at
```

---

## 🏗️ Data Flow Architecture

```
User Search → Frontend → Edge Function "get-mosque-details"
                              ↓
                         Check search_cache
                              ↓
                    Found & Fresh? → Return
                              ↓ No
                         Check mosques_cache
                              ↓
                    Found & Fresh? → Return
                              ↓ No
                    Call Google Places API
                              ↓
                    Save to both caches → Return
```

---

## 📅 7-Day Implementation Roadmap

### **Day 1: Database Setup**
- Create 3 new tables with RLS policies
- Set up indexes for performance
- Configure security rules (public read, service write)
- Test database connections

### **Day 2: Edge Function Development**
- Create `get-mosque-details` Edge Function
- Implement cache-check logic
- Add Google API fallback
- Log all API calls for cost tracking

### **Day 3: Shadow Mode Deployment**
- Deploy Edge Function (inactive)
- Add background data saving to existing flow
- No user-facing changes
- Build cache with real searches

### **Day 4: Frontend Integration**
- Create `mosqueDataService.ts` abstraction layer
- Add feature flag system (`VITE_USE_SUPABASE_CACHE=false`)
- Update MosqueLocator.tsx to use service layer
- Test locally with flag enabled

### **Day 5: Automation Setup**
- Create Supabase cron job: Weekly refresh (Sunday 2 AM)
- Create cron job: Daily cache cleanup (3 AM)
- Create cron job: Popular searches warm-up
- Test manual trigger of each job

### **Day 6: Testing & Optimization**
- Test cache hits vs misses
- Test stale data refresh
- Test Google fallback
- Optimize query performance
- Load test with 100 concurrent searches

### **Day 7: Production Rollout**
- 9 AM: Deploy with flag OFF (shadow mode)
- 11 AM: Enable flag for 10% traffic
- 2 PM: Enable for 50% traffic
- 5 PM: Enable for 100% traffic
- Monitor: Cache hit rate, errors, response times

---

## 🔄 Migration Strategy (Zero Downtime)

### Phase 1: Shadow Mode (Days 3-4)
- Old system: Active (users unaffected)
- New system: Passively saving data
- Safety: 100% backward compatible

### Phase 2: Hybrid Mode (Day 5)
- Both systems run simultaneously
- Show fastest response
- Fallback: Google always available

### Phase 3: Cache-First (Day 6-7)
- New system: Primary
- Old system: Fallback only
- Feature flag: Instant rollback if needed

---

## 🔒 Security Measures

- **RLS Policies:** Public SELECT, service-role only INSERT/UPDATE
- **API Keys:** Only accessed by Edge Functions (never client-side)
- **Rate Limiting:** 60 searches/hour per IP
- **Input Validation:** Sanitize all user inputs
- **Data Encryption:** HTTPS everywhere, at-rest encryption

---

## ⚙️ Automated Maintenance

### Weekly (Automated)
- Sunday 2 AM: Refresh all mosque data from Google
- Daily 3 AM: Clean expired search caches
- Sunday 3 AM: Pre-cache popular searches

### Cost: ~$8.50/week (500 mosques × $0.017)

---

## 📊 Success Metrics

**Week 1 Targets:**
- Cache hit rate: >80%
- Response time: <500ms
- Google API cost: <$12/week
- Zero increase in errors

**Month 1 Targets:**
- Cache hit rate: >90%
- Response time: <300ms
- Monthly cost: <$25
- Database size: <50MB

---

## ✅ Action Items

### Completed ✓
- [x] 7-day plan created
- [x] Database schema designed
- [x] Data flow architecture defined
- [x] Security strategy outlined
- [x] Migration strategy approved

### Completed - Day 1 ✓
- [x] Create `mosques_cache` table in Supabase
- [x] Create `search_cache` table in Supabase
- [x] Create `google_api_logs` table in Supabase
- [x] Configure RLS policies on all tables
- [x] Add database indexes (geospatial, lookups)
- [x] Test database queries locally
- [x] Enable PostGIS extension for geospatial queries
- [x] Create helper functions (cost tracking, cache stats)
- [x] Verify all triggers and functions work

### Pending - Day 2
- [ ] Create Edge Function: `get-mosque-details`
- [ ] Implement cache-check logic
- [ ] Implement Google API fallback
- [ ] Add API call logging
- [ ] Test Edge Function locally
- [ ] Deploy Edge Function to Supabase

### Pending - Day 3
- [ ] Enable shadow mode (background saving)
- [ ] Monitor data collection
- [ ] Verify data accuracy in database
- [ ] Check for errors in logs

### Pending - Day 4
- [ ] Create `src/services/mosqueDataService.ts`
- [ ] Add feature flag to `.env`
- [ ] Update `MosqueLocator.tsx`
- [ ] Update state pages (Sydney, Melbourne, etc.)
- [ ] Test locally with flag enabled
- [ ] Commit changes (flag OFF in production)

### Pending - Day 5
- [ ] Create weekly refresh cron job
- [ ] Create daily cleanup cron job
- [ ] Create popular search warm-up job
- [ ] Test each cron job manually
- [ ] Verify email notifications work

### Pending - Day 6
- [ ] Test cache hit scenario (same search twice)
- [ ] Test cache miss scenario (new search)
- [ ] Test stale data refresh
- [ ] Test Google fallback (disable Supabase)
- [ ] Load test (100 concurrent users)
- [ ] Optimize slow queries
- [ ] Fix any bugs found

### Pending - Day 7
- [ ] Deploy to production (flag OFF)
- [ ] Monitor for 2 hours (shadow mode)
- [ ] Enable flag for 10% traffic
- [ ] Monitor for 2 hours
- [ ] Enable flag for 50% traffic
- [ ] Monitor for 2 hours
- [ ] Enable flag for 100% traffic
- [ ] Monitor cache hit rate
- [ ] Monitor error rates
- [ ] Verify cost savings in Google Console
- [ ] Send summary report

### Post-Launch (Week 2)
- [ ] Daily monitoring for 7 days
- [ ] Review weekly cost report
- [ ] Gather user feedback
- [ ] Fix any issues discovered
- [ ] Document lessons learned
- [ ] Update project-notes.md
- [ ] Remove old code if stable

---

## 🔧 Files to Create/Modify

### New Files
- `supabase/migrations/20251009_create_mosques_cache.sql`
- `supabase/migrations/20251009_create_search_cache.sql`
- `supabase/migrations/20251009_create_api_logs.sql`
- `supabase/functions/get-mosque-details/index.ts`
- `src/services/mosqueDataService.ts`

### Modified Files
- `src/components/MosqueLocator.tsx`
- `src/pages/SydneyMosques.tsx` (and other state pages)
- `.env` (add feature flags)
- `.github/workflows/deploy.yml` (add new secrets)

### Configuration
- GitHub Secrets: No new secrets needed (reuse existing)
- Supabase Secrets: `GOOGLE_MAPS_API_KEY` (already configured)

---

## 🚨 Rollback Plan

**If issues arise:**
1. Set `VITE_USE_SUPABASE_CACHE=false` in `.env`
2. Redeploy (takes 2 minutes)
3. Site reverts to old system (Google direct)
4. Fix issues, redeploy when ready

**Fallback is automatic:** Edge Function errors → Google API

---

## 💰 Cost Comparison

| Item | Before | After | Savings |
|------|--------|-------|---------|
| Place Details | $51/mo | $8.50/mo | $42.50 |
| Geocoding | $10/mo | $0.50/mo | $9.50 |
| Autocomplete | $14/mo | $14/mo | $0 |
| **Total** | **$75/mo** | **$23/mo** | **$52/mo** |

---

## 📞 Next Steps

**Ready to start Day 1?** Say the word and I'll begin creating the database tables.

**Questions?** Ask about any step - I'll explain in simple terms.

**Need changes?** We can adjust the plan before starting.
