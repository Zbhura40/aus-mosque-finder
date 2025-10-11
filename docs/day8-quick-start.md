# Day 8: Weekly Cache Refresh - Quick Start

## 🚀 Quick Commands

### 1. Deploy Edge Function
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy refresh-cached-mosques
```

### 2. Test Manually
```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-cached-mosques' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 3. Schedule Weekly (Run in Supabase SQL Editor)
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'weekly-mosque-cache-refresh',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-cached-mosques',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer YOUR_ANON_KEY'),
    body := '{}'::jsonb
  );
  $$
);
```

Replace:
- `YOUR_PROJECT_REF` → Get from Supabase URL
- `YOUR_ANON_KEY` → Get from Settings → API

### 4. Verify Schedule
```sql
SELECT * FROM cron.job WHERE jobname = 'weekly-mosque-cache-refresh';
```

## 📊 Expected Results

- **Cost:** ~$2.70/week
- **Updates:** 84 mosques
- **Time:** ~8 seconds
- **Runs:** Every Sunday 2 AM

## 📝 Next Steps

1. Monitor logs after first Sunday
2. Check `google_api_logs` table for costs
3. All done! Fully automated ✅

See `weekly-cache-refresh-setup.md` for full documentation.
