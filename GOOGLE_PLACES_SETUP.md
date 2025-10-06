# Google Places API Setup Guide

This guide will help you set up the Google Places API to automatically fetch mosque data (ratings, hours, attributes) for your website.

## Why This Approach is Secure

We're using **Option 3: Pre-fetch and store** which means:
- ✅ Your API key is NEVER exposed to users
- ✅ No ongoing API costs during normal website use
- ✅ You control when data updates happen
- ✅ Fast page loads (data is already stored locally)
- ✅ API key only used when YOU run the script manually

## Step 1: Get Your Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable the **Places API** (New):
   - Go to "APIs & Services" > "Library"
   - Search for "Places API (New)"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### Important Security Settings

**Restrict your API key** to prevent unauthorized use:

1. Click on your API key in the Credentials page
2. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Places API (New)"
3. Under "Application restrictions" (optional but recommended):
   - Select "IP addresses"
   - Add your home/office IP address
   - This prevents anyone else from using your key

## Step 2: Add API Key to Your Project

1. Create a file called `.env.local` in the root of your project:
   ```bash
   touch .env.local
   ```

2. Add your API key to `.env.local`:
   ```
   VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. **IMPORTANT**: Never commit `.env.local` to GitHub
   - This file is already in `.gitignore`
   - Check by running: `git status` (should NOT show .env.local)

## Step 3: Run the Script to Fetch Mosque Data

Run this command to fetch fresh data from Google Places API:

```bash
npm run fetch-mosque-data
```

**What this does:**
1. Reads mosque addresses from the script
2. Searches Google Places API for each mosque
3. Fetches: ratings, opening hours, categories, attributes
4. Saves everything to `src/data/mosques-data.json`
5. Your website automatically uses this updated data

**When to run this:**
- Weekly or monthly to keep data fresh
- After adding new mosques
- When you notice outdated information

## Step 4: Verify It Worked

After running the script, you should see:
1. A success message showing how many mosques were processed
2. Updated file: `src/data/mosques-data.json`
3. Run `npm run dev` and check the Sydney page - you should see:
   - Opening hours for each mosque
   - "Open now" / "Closed now" status
   - Attributes (Wheelchair accessible, etc.)
   - Google ratings with "Verified on Google" badge

## Cost Information

**Google Places API Pricing:**
- Text Search: $0.032 per request
- Place Details: $0.017 per request
- For 16 mosques: ~$0.78 per run
- Running weekly: ~$3.12/month
- Running monthly: ~$0.78/month

**Free tier:**
- $200 free credit per month
- More than enough for this use case

## Troubleshooting

### Error: "VITE_GOOGLE_PLACES_API_KEY not found"
- Make sure `.env.local` exists in the project root
- Check that the variable name is exactly: `VITE_GOOGLE_PLACES_API_KEY`
- Restart your terminal after creating `.env.local`

### Error: "API key not valid"
- Make sure you enabled "Places API (New)" in Google Cloud
- Check that you copied the full API key
- Verify your IP is allowed (if you set IP restrictions)

### Some mosques return "Not found"
- The mosque address might not exist in Google Maps
- Try updating the address in `scripts/fetch-mosque-data.js`
- Some mosques might not have Google Business listings

### Rate limit errors
- The script includes 200ms delays between requests
- If you still get errors, increase the delay in the script

## Security Checklist

Before you commit/push to GitHub:
- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] API key is ONLY in `.env.local` (never in code)
- [ ] You've tested that `git status` doesn't show `.env.local`
- [ ] API key has restrictions set in Google Cloud Console

## Adding More Mosques

To add more mosques to the directory:

1. Edit `scripts/fetch-mosque-data.js`
2. Add the new mosque to the `mosques` array:
   ```javascript
   {
     name: "New Mosque Name",
     address: "Full address with postcode",
     phone: "(02) 1234 5678",
     website: "https://example.com/",
     region: "Western Sydney"  // or other region
   }
   ```
3. Run: `npm run fetch-mosque-data`
4. The new mosque will appear on the website automatically

## Questions?

- **What if Google doesn't have data for a mosque?** The script will still add it with basic info (name, address, phone)
- **Can I edit the data manually?** Yes! Edit `src/data/mosques-data.json` directly
- **Will this work for other cities?** Yes! Just create similar scripts for Melbourne, Brisbane, etc.

---

**Remember**: This approach keeps your API key secure and gives you full control over when data updates happen. You're doing great! 🎉
