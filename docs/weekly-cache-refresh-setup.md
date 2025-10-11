# Weekly Cache Refresh Setup Guide (Day 8)

## Overview
This automation keeps your cached mosque data fresh by automatically updating it every Sunday at 2 AM. It will save you approximately **$75/month** compared to having no cache, while keeping data no more than 7 days old.

## What It Does
- **Runs:** Every Sunday at 2:00 AM
- **Updates:** Mosques cached more than 7 days ago
- **Cost:** ~$2.70/week ($0.032 × 84 mosques)
- **Smart:** Only saves changes (differential sync)

## Step-by-Step Setup

### Step 1: Deploy the Edge Function

1. **Login to Supabase CLI:**
   ```bash
   supabase login
   ```

2. **Link to your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   To find your project ref:
   - Go to Supabase Dashboard
   - Look at your URL: `https://XXXXXX.supabase.co`
   - The `XXXXXX` is your project ref

3. **Deploy the function:**
   ```bash
   supabase functions deploy refresh-cached-mosques
   ```

4. **Verify deployment:**
   - Go to Supabase Dashboard → Edge Functions
   - You should see `refresh-cached-mosques` listed

### Step 2: Test the Function Manually

Before setting up automation, let's test it works:

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-cached-mosques' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Expected response:**
```json
{
  "message": "Weekly refresh completed successfully",
  "stats": {
    "totalMosques": 84,
    "updated": 12,
    "unchanged": 72,
    "errors": 0,
    "totalCost": 2.688,
    "duration": 8400
  }
}
```

### Step 3: Set Up pg_cron (Automatic Scheduling)

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly refresh (Sundays at 2 AM)
SELECT cron.schedule(
  'weekly-mosque-cache-refresh',
  '0 2 * * 0',  -- Sunday at 2 AM
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-cached-mosques',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY'
      ),
      body := '{}'::jsonb
    );
  $$
);
```

3. **Replace:**
   - `YOUR_PROJECT_REF` with your actual project ref
   - `YOUR_SUPABASE_ANON_KEY` with your anon key (from Settings → API)

**Option B: Using Migration File**

1. Update the migration file with your credentials:
   ```bash
   # Edit: supabase/migrations/20251012_setup_weekly_cache_refresh.sql
   # Replace placeholders with your actual values
   ```

2. Run the migration:
   ```bash
   supabase db push
   ```

### Step 4: Verify Cron Job is Scheduled

Run this SQL to see all scheduled jobs:

```sql
SELECT * FROM cron.job;
```

You should see:
- **jobname:** `weekly-mosque-cache-refresh`
- **schedule:** `0 2 * * 0`
- **active:** `true`

### Step 5: Monitor the Automation

**Check Logs After First Run:**

1. Go to Supabase Dashboard → Edge Functions → `refresh-cached-mosques`
2. Click "Logs" tab
3. Look for the weekly execution

**Check Cost Tracking:**

```sql
SELECT
  api_type,
  cost_estimate,
  metadata,
  created_at
FROM google_api_logs
WHERE api_type = 'weekly_cache_refresh'
ORDER BY created_at DESC
LIMIT 10;
```

## Cost Breakdown

### Weekly Cost
- **84 mosques** × $0.032 = **$2.69 per week**
- **Monthly:** ~$10.75
- **Yearly:** ~$140

### Total Monthly Costs (with 100% cache)
- Google API (cache misses): ~$23/month
- Weekly refresh: ~$11/month
- **Total: ~$34/month**

### Comparison
- **No cache:** ~$100/month
- **With cache + weekly refresh:** ~$34/month
- **Savings:** $66/month (66% reduction!)

## Troubleshooting

### Job Not Running?

Check if pg_cron is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

### View Job Execution History

```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job
  WHERE jobname = 'weekly-mosque-cache-refresh'
)
ORDER BY start_time DESC
LIMIT 10;
```

### Manually Trigger Refresh (for testing)

```sql
SELECT
  net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-cached-mosques',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SUPABASE_ANON_KEY'
    ),
    body := '{}'::jsonb
  );
```

### Stop/Unschedule the Job

```sql
SELECT cron.unschedule('weekly-mosque-cache-refresh');
```

### Reschedule with Different Time

```sql
-- Unschedule old job
SELECT cron.unschedule('weekly-mosque-cache-refresh');

-- Schedule with new time (e.g., Saturdays at 3 AM)
SELECT cron.schedule(
  'weekly-mosque-cache-refresh',
  '0 3 * * 6',  -- Saturday at 3 AM
  $$ ... $$  -- Same SQL as before
);
```

## How It Works

### Differential Sync (Smart Updates)

The function only updates data that has **actually changed**:

1. Fetches current cached data
2. Gets fresh data from Google
3. Compares the two
4. Only saves if there are differences

**Checked fields:**
- Name
- Address
- Phone number
- Website
- Rating
- Review count
- Opening status
- Business status

**Always updated:**
- `last_fetched_from_google` timestamp

### Rate Limiting

To avoid hitting Google's API limits:
- Waits 100ms between each mosque
- For 84 mosques: ~8.4 seconds total
- Well within Google's rate limits

## Advanced Configuration

### Change Refresh Frequency

**More frequent (e.g., every 3 days):**

```sql
-- Update the SQL query in the cron job to:
-- lt('last_fetched_from_google', threeDaysAgo.toISOString())
```

**Less frequent (e.g., every 14 days):**

```sql
-- Update to: lt('last_fetched_from_google', fourteenDaysAgo.toISOString())
```

### Batch Processing (for more mosques)

If you have more than 100 mosques, consider:

```typescript
// In refresh-cached-mosques/index.ts
const BATCH_SIZE = 50;
const batches = chunk(mosquesToRefresh, BATCH_SIZE);

for (const batch of batches) {
  await Promise.all(batch.map(mosque => refreshMosque(...)));
}
```

## Security Notes

- ✅ Uses service role key in Edge Function (secure)
- ✅ Anon key in cron job (safe for scheduled tasks)
- ✅ All API keys stored in Supabase environment variables
- ✅ No sensitive data exposed in logs

## Next Steps

Once setup is complete:

1. ✅ Monitor first execution (check logs)
2. ✅ Verify costs in dashboard (should be ~$2.70)
3. ✅ Check cached data is updating
4. ✅ Review weekly cost reports

## Questions?

- **Is data too old?** → Reduce refresh interval to 3-4 days
- **Costs too high?** → Increase interval to 14 days
- **Some mosques failing?** → Check error logs for specific place IDs
- **Want to add more mosques?** → Cache automatically grows as users search

---

**Status:** Ready to deploy! 🚀
**Expected Savings:** $66/month
**Maintenance:** Zero (fully automated)
