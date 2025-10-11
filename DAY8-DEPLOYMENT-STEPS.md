# 🚀 Day 8 Deployment - Step by Step

## What You're Deploying
A fully automated system that refreshes cached mosque data every Sunday at 2 AM, saving you $66/month while keeping data fresh!

---

## ⚡ Quick Deployment (3 Steps)

### Step 1: Deploy the Edge Function

Open your terminal and run:

```bash
cd /Users/zubairbhura/Work/findmymosque
./deploy-day8.sh
```

This will:
- Log you into Supabase
- Link to your project
- Deploy the `refresh-cached-mosques` function

**Expected output:**
```
✅ Deployment complete!
Function URL: https://wlzsnrqizimqctdiqjjv.supabase.co/functions/v1/refresh-cached-mosques
```

---

### Step 2: Test the Function Manually

First, get your Supabase anon key:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **Settings** → **API**
3. Copy the **anon/public** key

Then run the test:

```bash
# Set your anon key
export SUPABASE_ANON_KEY='your-anon-key-here'

# Run the test
./test-day8.sh
```

**Expected output:**
```
✅ Test successful!
📊 Stats:
   - Total mosques: 84
   - Updated: 12
   - Unchanged: 72
   - Errors: 0
   - Cost: $2.688
```

---

### Step 3: Set Up Weekly Automation

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **SQL Editor** → **New Query**
3. Paste this SQL:

```sql
-- Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly refresh (Sundays at 2 AM)
SELECT cron.schedule(
  'weekly-mosque-cache-refresh',
  '0 2 * * 0',
  $$
  SELECT
    net.http_post(
      url := 'https://wlzsnrqizimqctdiqjjv.supabase.co/functions/v1/refresh-cached-mosques',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_ANON_KEY_HERE'
      ),
      body := '{}'::jsonb
    );
  $$
);
```

4. **Replace** `YOUR_ANON_KEY_HERE` with your actual anon key
5. Click **Run**

---

### Step 4: Verify Schedule

Run this SQL to confirm the job is scheduled:

```sql
SELECT * FROM cron.job WHERE jobname = 'weekly-mosque-cache-refresh';
```

You should see:
- **jobname:** `weekly-mosque-cache-refresh`
- **schedule:** `0 2 * * 0`
- **active:** `true`

---

## ✅ You're Done!

Your weekly automation is now live! Here's what happens:

- **Every Sunday at 2 AM:** Function runs automatically
- **Updates:** Mosques older than 7 days
- **Cost:** ~$2.70 per week
- **Logs:** Saved to `google_api_logs` table

---

## 📊 Monitoring & Next Steps

### Check Refresh Logs

```sql
SELECT
  created_at,
  cost_estimate,
  metadata->>'total_mosques' as total,
  metadata->>'updated' as updated,
  metadata->>'unchanged' as unchanged,
  metadata->>'errors' as errors
FROM google_api_logs
WHERE api_type = 'weekly_cache_refresh'
ORDER BY created_at DESC
LIMIT 10;
```

### View Cron Job Execution History

```sql
SELECT
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job
  WHERE jobname = 'weekly-mosque-cache-refresh'
)
ORDER BY start_time DESC
LIMIT 10;
```

### Manually Trigger (for testing)

```sql
SELECT
  net.http_post(
    url := 'https://wlzsnrqizimqctdiqjjv.supabase.co/functions/v1/refresh-cached-mosques',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := '{}'::jsonb
  );
```

---

## 🎯 Summary

**What You Built:**
- ✅ Edge Function for smart refresh (differential sync)
- ✅ PostgreSQL cron job (weekly automation)
- ✅ Full logging and monitoring
- ✅ Cost tracking

**Expected Results:**
- **Total Cost:** ~$34/month (vs $100 without cache)
- **Savings:** $66/month (66% reduction!)
- **Data Freshness:** Never older than 7 days
- **Maintenance:** Zero (fully automated)

---

## 🆘 Troubleshooting

### Function not found?
```bash
# Redeploy
./deploy-day8.sh
```

### Test failing?
- Check your anon key is correct
- Verify function is deployed: Go to Dashboard → Edge Functions
- Check function logs in Supabase Dashboard

### Cron not running?
```sql
-- Check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- View all scheduled jobs
SELECT * FROM cron.job;

-- View recent executions
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Need help?
- Full docs: `docs/weekly-cache-refresh-setup.md`
- Quick ref: `docs/day8-quick-start.md`

---

## 🎉 Congratulations!

You've completed Day 8! Your mosque directory now has:
- ✅ 100% cache system (Day 7)
- ✅ Weekly automated refresh (Day 8)
- ✅ 66% cost savings
- ✅ Always fresh data

**Next: Monitor first Sunday execution and enjoy the savings!** 💰
