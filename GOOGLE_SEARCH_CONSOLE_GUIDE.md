# Google Search Console Setup Guide

Complete guide for setting up and monitoring your website's SEO performance with Google Search Console.

---

## Why Use Google Search Console?

Google Search Console (GSC) is a free tool that helps you:
- ✅ See which keywords people use to find your site
- ✅ Track your search rankings
- ✅ Get notified of technical issues
- ✅ Submit your sitemap for faster indexing
- ✅ Monitor site performance in search results

**Cost:** FREE forever

---

## Step 1: Create Google Search Console Account

### If You Don't Have a GSC Account:

1. **Visit Google Search Console**
   - Go to: https://search.google.com/search-console
   - Click "Start now"
   - Sign in with your Google account (use the same one as your Google Maps API)

2. **Choose Property Type**
   - Select "URL prefix" (not Domain)
   - Enter: `https://findmymosque.org`
   - Click "Continue"

### If You Already Have GSC:

1. Go to: https://search.google.com/search-console
2. Click the property dropdown (top left)
3. Click "+ Add property"
4. Select "URL prefix"
5. Enter: `https://findmymosque.org`
6. Click "Continue"

---

## Step 2: Verify Ownership

You need to prove you own the website. Here are your options:

### Option A: HTML File Upload (Recommended - Easiest)

1. **Download Verification File**
   - GSC will provide a file like: `google1234567890abcdef.html`
   - Download this file

2. **Upload to Your Site**
   - Place the file in: `/public/` directory of your project
   - Commit and push to GitHub
   - Wait 2-3 minutes for deployment

3. **Verify**
   - Go back to Google Search Console
   - Click "Verify"
   - You should see "Ownership verified" ✅

### Option B: HTML Tag Method

1. **Get Meta Tag**
   - GSC will show you a meta tag like:
   ```html
   <meta name="google-site-verification" content="abc123..." />
   ```

2. **Add to index.html**
   - Open: `/index.html`
   - Add the meta tag inside the `<head>` section
   - Commit and push to GitHub

3. **Verify**
   - Go back to GSC
   - Click "Verify"

### Option C: Google Analytics (If You Use It)

- If you already have Google Analytics on your site
- GSC can verify through that
- Just click "Verify with Google Analytics"

---

## Step 3: Submit Your Sitemap

Once verified, immediately submit your sitemap:

1. **Go to Sitemaps Section**
   - In GSC sidebar, click "Sitemaps"

2. **Add New Sitemap**
   - In the text box, enter: `sitemap.xml`
   - Click "Submit"

3. **Check Status**
   - Wait 1-2 days
   - Status should change to "Success"
   - You'll see how many URLs were discovered

---

## Step 4: Understanding Your Dashboard

### Overview Page

Shows:
- **Total Clicks:** How many people clicked your site in search results
- **Total Impressions:** How many times your site appeared in search
- **Average CTR:** Click-through rate (higher is better)
- **Average Position:** Your ranking position (lower number is better)

### Performance Report

**Most Important Tab!**

Shows:
- Which keywords people searched
- Which pages get the most traffic
- Your position for each keyword
- Mobile vs Desktop performance

**How to Read It:**
- Position 1-3: You're on top! 🎉
- Position 4-10: First page, doing well ✅
- Position 11-20: Second page, needs improvement
- Position 20+: Not ranking well, focus on SEO

### Coverage Report

Shows:
- Valid pages (indexed by Google) ✅
- Pages with errors ❌
- Pages excluded (not indexed)

**What to Do:**
- Fix any errors immediately
- Investigate excluded pages
- Aim for 100% valid pages

### URL Inspection

**Your Best Friend for Testing**

Use this to:
1. Check if a specific page is indexed
2. Request immediate indexing of new pages
3. See how Google sees your page

**How to Use:**
1. Paste any URL from your site
2. Click "Test Live URL"
3. See indexing status
4. Click "Request Indexing" for new pages

---

## Step 5: Weekly Monitoring Routine

### Every Monday (5 minutes):

1. **Check Performance**
   - Go to "Performance" tab
   - Look at last 7 days vs previous 7 days
   - Are clicks increasing? ✅
   - Are impressions increasing? ✅

2. **Check Coverage**
   - Go to "Coverage" tab
   - Any new errors? Fix them!
   - Any new excluded pages? Investigate why

3. **Top Keywords**
   - Go to "Performance" > "Queries" tab
   - What keywords are working?
   - What keywords need improvement?

### Monthly Deep Dive (30 minutes):

1. **Analyze Top Content**
   - Which mosque pages get the most traffic?
   - Which city pages perform best?
   - Create more content around successful topics

2. **Fix Technical Issues**
   - Check "Coverage" for errors
   - Check "Mobile Usability" for issues
   - Check "Core Web Vitals" for speed problems

3. **Keyword Research**
   - Export keyword data to CSV
   - Look for keywords ranking 11-20 (page 2)
   - Optimize those pages to get to page 1

---

## Step 6: Request Indexing of New Pages

Whenever you add a new city or mosque page:

1. **Use URL Inspection**
   - Paste the new URL
   - Click "Request Indexing"
   - Google will crawl it within 24-48 hours

2. **Or Wait for Automatic Crawl**
   - Your sitemap is auto-submitted on every build
   - Google will find new pages automatically
   - Usually takes 3-7 days

---

## Step 7: Set Up Email Alerts

Get notified of issues automatically:

1. **Go to Settings**
   - Click gear icon (⚙️) in GSC

2. **Email Notifications**
   - Enable "All issues" alerts
   - Enable "Critical issues only" (at minimum)

3. **Choose Email**
   - Use your primary email
   - You'll get alerts about:
     - Indexing issues
     - Security problems
     - Manual penalties
     - Core Web Vitals issues

---

## Understanding Key Metrics

### What's Good? What's Bad?

| Metric | Excellent | Good | Needs Work | Poor |
|--------|-----------|------|------------|------|
| **Average Position** | 1-3 | 4-10 | 11-20 | 20+ |
| **CTR (Click Rate)** | >10% | 5-10% | 2-5% | <2% |
| **Impressions Growth** | +50%/month | +20%/month | +5%/month | Flat |
| **Valid Pages** | 100% | >95% | 80-95% | <80% |

### Your Target Goals (3 Months):

- **Total Impressions:** 50,000/month
- **Total Clicks:** 1,000/month
- **Average Position:** 5-10 for mosque keywords
- **Indexed Pages:** All 10+ pages indexed

---

## Common Issues & Fixes

### Issue: "Page not indexed"

**Why:** Google hasn't found your page yet

**Fix:**
1. Check if it's in your sitemap
2. Use URL Inspection > Request Indexing
3. Add internal links to the page from other pages

### Issue: "Crawled but not indexed"

**Why:** Google found it but thinks it's not valuable

**Fix:**
1. Add more unique content (500+ words)
2. Improve page speed
3. Add structured data (you already have this!)
4. Get links from other pages

### Issue: "Soft 404 error"

**Why:** Page returns 200 but looks empty to Google

**Fix:**
1. Check if page loads properly
2. Ensure JavaScript loads content (React issue)
3. Add static content to the page

### Issue: "Mobile usability errors"

**Why:** Page doesn't work well on mobile

**Fix:**
1. Test on actual phone
2. Fix touch targets (buttons too small)
3. Fix text size issues
4. You already have responsive design, so this should be rare!

---

## Advanced: Track Specific Goals

### Goal 1: Rank for City Keywords

**Target Keywords:**
- "mosque in sydney"
- "mosque melbourne"
- "brisbane mosques"
- "find mosque near me"

**How to Track:**
1. Go to Performance > Queries
2. Filter by keyword
3. Watch position change over time
4. Goal: Position 1-5 for each city

### Goal 2: Increase Organic Traffic

**Current:** ~100 visitors/month (estimated)
**3-Month Goal:** 1,000 visitors/month
**6-Month Goal:** 5,000 visitors/month

**How to Track:**
1. Performance > Total Clicks
2. Compare month-over-month
3. Celebrate every 10% increase!

### Goal 3: Index All Content

**Current:** ~10 pages indexed
**Goal:** 15+ pages indexed (including all mosque pages)

**How to Track:**
1. Coverage tab
2. Look at "Valid" number
3. Request indexing for any missing pages

---

## Integration with Your Build Process

**Good news:** Your sitemap updates automatically!

Every time you run `npm run build`:
1. ✅ Sitemap regenerates with latest pages
2. ✅ Includes all your routes
3. ✅ Updates with current date
4. ✅ Google will discover new pages automatically

**Manual Sitemap Update:**
```bash
npm run generate-sitemap
```

**When to Manually Submit Sitemap:**
- After adding many new pages
- After major site updates
- When you want Google to re-crawl immediately

**How:**
1. Go to GSC > Sitemaps
2. Your sitemap: `https://findmymosque.org/sitemap.xml`
3. Click "Refresh" or re-submit

---

## Troubleshooting

### "Couldn't fetch sitemap"

**Fix:**
- Check if sitemap exists: https://findmymosque.org/sitemap.xml
- Make sure it's deployed to production
- Re-run `npm run build` and deploy

### "Sitemap contains errors"

**Fix:**
- Validate sitemap: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- Run `npm run generate-sitemap` to regenerate
- Check for duplicate URLs in `scripts/sitemap-config.js`

### "Not seeing any data"

**Fix:**
- Wait 2-3 days after verification
- Data takes time to populate
- Ensure you have organic traffic coming to site

---

## Resources

### Official Google Resources:
- **Search Console Help:** https://support.google.com/webmasters
- **SEO Starter Guide:** https://developers.google.com/search/docs/beginner/seo-starter-guide
- **Rich Results Test:** https://search.google.com/test/rich-results

### Tools for SEO:
- **Sitemap Validator:** https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PageSpeed Insights:** https://pagespeed.web.dev/

### Your Site URLs:
- **Website:** https://findmymosque.org
- **Sitemap:** https://findmymosque.org/sitemap.xml
- **Robots.txt:** https://findmymosque.org/robots.txt

---

## Next Steps After Setup

1. ✅ Verify ownership in GSC
2. ✅ Submit sitemap
3. ✅ Set up email alerts
4. ✅ Monitor weekly performance
5. ✅ Request indexing for important pages
6. ✅ Track keyword rankings
7. ✅ Fix any errors immediately

---

## Questions?

**Common Questions:**

**Q: How long until I see results?**
A: 2-3 days for data to appear, 2-3 months for SEO improvements to show in rankings

**Q: Do I need to pay for GSC?**
A: No! It's 100% free forever

**Q: How often should I check GSC?**
A: Weekly for quick review, monthly for deep dive

**Q: What if I see my rankings drop?**
A: Don't panic! Rankings fluctuate. Check for technical errors first, then review content quality.

**Q: Should I submit sitemap every time I update the site?**
A: No need! Google checks your sitemap automatically every few days. Only resubmit for major changes.

---

**Setup Time:** ~30 minutes
**Maintenance Time:** ~5 minutes/week
**Value:** Priceless for SEO success! 🚀
