# Supabase Database Setup Instructions

**Time Required:** 5 minutes
**Difficulty:** Easy - Just copy & paste!

---

## 🎯 What We're Doing

Creating two new tables in your Supabase database:
1. **supermarkets** - Stores supermarket data with halal section info
2. **scrape_logs** - Tracks automated updates

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Sign in with your account
3. Select your project: **Find My Mosque** (project ID: `mzqyswdfgimymxfhdyzw`)

### Step 2: Open SQL Editor

1. In the left sidebar, click **SQL Editor**
2. Click **+ New Query** button (top right)
3. You'll see an empty SQL editor

### Step 3: Copy the SQL

Open the file: `supabase/migrations/20251007_create_supermarkets_tables.sql`

**Or copy from below:**

```sql
-- Just copy everything from the migration file
-- It's about 300 lines of SQL
```

### Step 4: Run the Migration

1. Paste the SQL into the editor
2. Click **Run** button (or press `Ctrl/Cmd + Enter`)
3. Wait 2-3 seconds for execution
4. You should see: "Success. No rows returned"

### Step 5: Verify Tables Created

1. In left sidebar, click **Table Editor**
2. You should see two new tables:
   - ✅ `supermarkets`
   - ✅ `scrape_logs`
3. Click on `supermarkets` to see the columns

---

## ✅ Success Checklist

After running the SQL, verify:

- [ ] Table `supermarkets` exists
- [ ] Table `scrape_logs` exists
- [ ] No error messages in SQL Editor
- [ ] Can see table structure in Table Editor

---

## 🧪 Test the Database

Let's add a test supermarket to make sure everything works!

### Add Test Data

In SQL Editor, run this:

```sql
-- Insert a test supermarket
INSERT INTO supermarkets (
  place_id,
  name,
  address,
  lat,
  lng,
  chain,
  has_halal_section,
  confidence_score,
  reasoning,
  source,
  rating,
  user_ratings_total
) VALUES (
  'test_coles_lakemba_001',
  'Coles Lakemba',
  '1 Haldon St, Lakemba NSW 2195, Australia',
  -33.9200,
  151.0750,
  'Coles',
  true,
  0.95,
  'Multiple verified reviews mention extensive halal meat section. Store has dedicated halal-certified products aisle. Confirmed via Google reviews and social media posts.',
  'Google Reviews + Social Media',
  4.2,
  387
);

-- Verify it was added
SELECT * FROM supermarkets WHERE place_id = 'test_coles_lakemba_001';
```

**Expected Result:** You should see the test supermarket data!

---

## 🔍 Test the Search Function

Our database includes a smart function to find supermarkets near any location.

**Test it:**

```sql
-- Find supermarkets within 10km of Lakemba
-- (Lat: -33.9200, Lng: 151.0750)
SELECT
  name,
  address,
  chain,
  has_halal_section,
  confidence_score,
  distance_km
FROM get_supermarkets_near(
  -33.9200,  -- latitude
  151.0750,  -- longitude
  10,        -- radius in km
  true,      -- halal_only (true/false)
  0.7        -- minimum confidence
);
```

**Expected Result:** Should return the test Coles Lakemba (distance: 0.00 km)

---

## 📊 View the Helper Views

We created some handy views to make querying easier:

### View 1: Verified Halal Supermarkets

```sql
-- See all verified halal supermarkets (confidence ≥ 0.7)
SELECT * FROM halal_supermarkets_verified;
```

### View 2: Recent Scrape Stats

```sql
-- See automation run history (once we start running it)
SELECT * FROM recent_scrape_stats;
```

---

## 🎨 Explore Table Structure

In the **Table Editor**:

1. Click `supermarkets` table
2. See all the columns:
   - `id` - Unique identifier
   - `place_id` - Google Places ID
   - `name` - Supermarket name
   - `address` - Full address
   - `lat` / `lng` - Coordinates
   - `chain` - Brand (Coles, Woolworths, etc.)
   - `has_halal_section` - Boolean flag
   - `confidence_score` - AI confidence (0.0-1.0)
   - `reasoning` - Why AI thinks it has/doesn't have halal
   - `source` - Where info came from
   - And more...

---

## 🔐 Security - Row Level Security (RLS)

We enabled RLS policies to keep your data secure:

**What this means:**
- ✅ Anyone can **read** supermarket data (for your website)
- ❌ Only **service role** can write/update data (prevents tampering)
- ✅ Recent scrape logs are public (for transparency)
- ❌ Old scrape logs are hidden after 30 days

**Check RLS Policies:**
1. Go to **Authentication** > **Policies**
2. Select `supermarkets` table
3. You should see 2 policies:
   - "Public read access to supermarkets"
   - "Service role full access to supermarkets"

---

## 🧹 Clean Up Test Data (Optional)

If you want to remove the test supermarket:

```sql
-- Delete test data
DELETE FROM supermarkets WHERE place_id = 'test_coles_lakemba_001';

-- Verify it's gone
SELECT COUNT(*) FROM supermarkets;  -- Should return 0
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Meaning:** Tables were already created before

**Fix:** Either:
1. Drop the tables first:
   ```sql
   DROP TABLE IF EXISTS supermarkets CASCADE;
   DROP TABLE IF EXISTS scrape_logs CASCADE;
   ```
2. Then rerun the migration

**Or** skip this step if tables already exist!

### Error: "permission denied"

**Meaning:** Not logged in as correct user

**Fix:**
1. Make sure you're in the right Supabase project
2. Try logging out and back in
3. Check you have owner/admin access

### No tables showing up

**Check:**
1. Did you click "Run" in SQL Editor?
2. Look for any red error messages
3. Try refreshing the page
4. Check the **Table Editor** tab

---

## ✅ What's Next?

Once database is set up, you can:

### Option 1: Build the Data Pipeline
- Google Places API integration
- Claude AI halal detection
- Automated weekly updates

### Option 2: Build the Frontend
- Create "Supermarkets Offering Halal" page
- Add map with markers
- Add filters and search

### Option 3: Add More Test Data
- Manually add 5-10 supermarkets you know
- Test the search function
- See how it looks in queries

**Recommended:** Option 3 first (10 minutes) - This helps you visualize how the system will work!

---

## 📞 Need Help?

If you run into issues:

1. **Screenshot the error** - Send me the SQL error message
2. **Check the table** - Go to Table Editor and see what exists
3. **Ask me!** - I can help debug any issues

---

## 🎉 Success!

Once you see both tables in Table Editor, you're done!

**What you just accomplished:**
- ✅ Created production-ready database schema
- ✅ Set up security policies
- ✅ Added helper functions for searching
- ✅ Created views for easy querying
- ✅ Ready for data pipeline integration

**Database is now ready to receive supermarket data!** 🎊

---

**Estimated Time Taken:** 5-10 minutes
**Difficulty:** ⭐⭐☆☆☆ (Easy)
**Status:** Ready for you to complete!
