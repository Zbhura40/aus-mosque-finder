# Make.com Backend Automation Workflows

**Purpose:** Automate analytics tracking and data collection (NOT posting - you'll post manually)

**Cost:** Free tier (1,000 operations/month) is sufficient for Week 1

---

## 🎯 What We're Automating

✅ **Daily analytics data collection** (from Google Analytics to Sheets)
✅ **Manual post logging** (quick form to log posts you made)
✅ **Engagement metrics tracking** (check Reddit/Facebook for metrics)
✅ **Daily summary notifications** (email yourself end-of-day summary)
✅ **Comment reminders** (notify you of posts needing responses)

❌ **NOT automating:**
- Reddit posting (high ban risk)
- Facebook group posting (against rules)
- Comment replies (needs to be authentic)

---

## 📋 Prerequisites

**Before starting:**
1. [ ] Make.com account created (make.com/en/register)
2. [ ] Google account connected
3. [ ] Google Sheets tracking template set up (from previous doc)
4. [ ] Reddit account (for API access)
5. [ ] Your findmymosque.org website has Google Analytics installed

**Estimated setup time:** 2-3 hours (one-time)

---

## Workflow 1: Manual Post Logger (Quick Entry Form)

**Purpose:** Quickly log posts you made manually without opening Sheets

**How it works:**
1. You post to Reddit/Facebook manually
2. Click a bookmark or webhook link
3. Fill simple form (platform, community, link)
4. Auto-logs to your Google Sheet

### Setup Steps:

**Step 1: Create New Scenario**
1. Log into Make.com
2. Click "Create a new scenario"
3. Name it: "Post Logger - Quick Entry"

**Step 2: Add Webhook Trigger**
1. Click the "+" button
2. Search for "Webhooks"
3. Select "Webhooks" > "Custom webhook"
4. Click "Create a webhook"
5. Name it: "Manual Post Entry"
6. Copy the webhook URL (save it!)

**Step 3: Configure Webhook Response (Form)**
1. In webhook settings, click "Show advanced settings"
2. Add "Data structure" with these fields:
```json
{
  "platform": "text",
  "community": "text",
  "post_title": "text",
  "post_link": "text",
  "notes": "text"
}
```

**Step 4: Add Google Sheets Module**
1. Click "+" after webhook
2. Search "Google Sheets"
3. Select "Add a row"
4. Connect your Google account (follow prompts)
5. Choose your tracking spreadsheet
6. Select "Daily Posting Log" tab
7. Map fields:
   - Date: `{{now}}` (auto-fills today's date)
   - Platform: `{{1.platform}}`
   - Community/Subreddit: `{{1.community}}`
   - Post Title: `{{1.post_title}}`
   - Post Link: `{{1.post_link}}`
   - Time Posted: `{{formatDate(now; "h:mm A")}}`
   - Status: "Live" (default)
   - Notes: `{{1.notes}}`

**Step 5: Test the Workflow**
1. Click "Run once"
2. Click the webhook URL in browser
3. Fill the form that appears
4. Submit
5. Check your Google Sheet - row should appear!

**Step 6: Create Bookmark for Easy Access**

**Option A: Browser Bookmark**
1. Copy your webhook URL
2. Create bookmark in browser with:
   - Name: "📝 Log Post"
   - URL: `[your webhook URL]`

**Option B: Create HTML Form (Better)**
Create this file and save as `post-logger.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Quick Post Logger</title>
    <style>
        body { font-family: Arial; max-width: 500px; margin: 50px auto; padding: 20px; }
        input, select, textarea { width: 100%; padding: 10px; margin: 5px 0 15px 0; }
        button { background: #4CAF50; color: white; padding: 15px; border: none; width: 100%; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <h2>📝 Quick Post Logger</h2>
    <form id="postForm">
        <label>Platform:</label>
        <select id="platform" required>
            <option value="">Choose...</option>
            <option value="Reddit">Reddit</option>
            <option value="Facebook">Facebook</option>
            <option value="Quora">Quora</option>
        </select>

        <label>Community/Subreddit:</label>
        <input type="text" id="community" placeholder="e.g., r/australia" required>

        <label>Post Title:</label>
        <input type="text" id="post_title" placeholder="Built a free mosque directory..." required>

        <label>Post Link:</label>
        <input type="url" id="post_link" placeholder="https://reddit.com/..." required>

        <label>Notes (optional):</label>
        <textarea id="notes" rows="2" placeholder="Any additional notes..."></textarea>

        <button type="submit">✓ Log Post</button>
    </form>

    <script>
        document.getElementById('postForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                platform: document.getElementById('platform').value,
                community: document.getElementById('community').value,
                post_title: document.getElementById('post_title').value,
                post_link: document.getElementById('post_link').value,
                notes: document.getElementById('notes').value
            };

            await fetch('YOUR_WEBHOOK_URL_HERE', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            alert('✓ Post logged successfully!');
            document.getElementById('postForm').reset();
        });
    </script>
</body>
</html>
```

Replace `YOUR_WEBHOOK_URL_HERE` with your actual webhook URL.

**Step 7: Activate Scenario**
1. Click "Save" in Make.com
2. Toggle "Scheduling" to "ON" (leaves webhook active)

**Usage:**
- After posting to Reddit/Facebook manually, open the HTML form
- Fill it in (takes 30 seconds)
- Auto-logs to your tracking sheet!

---

## Workflow 2: Daily Google Analytics Export

**Purpose:** Auto-pull yesterday's traffic data into your tracking sheet daily

**Limitation:** Make.com's free Google Analytics integration is basic. You may need to enter manually OR use this workaround.

### Setup Steps:

**Step 1: Create Scenario**
1. Make.com > Create new scenario
2. Name: "Daily GA Export to Sheets"

**Step 2: Add Schedule Trigger**
1. Click "+" button
2. Search "Schedule"
3. Select "Schedule" > "Every day"
4. Set time: 9:00 AM (gets yesterday's data)
5. Timezone: Australia/Sydney

**Step 3: Add Google Analytics Module**
1. Click "+" after schedule
2. Search "Google Analytics"
3. Select "Make an API call"
4. Connect Google Analytics account
5. Configure request:
   - Property: [Select your findmymosque.org property]
   - Dimensions: `ga:source,ga:medium`
   - Metrics: `ga:users,ga:newUsers,ga:bounceRate,ga:avgSessionDuration,ga:pageviewsPerSession`
   - Start date: `{{addDays(now; -1)}}`
   - End date: `{{addDays(now; -1)}}`

**Alternative (Easier) - Manual Entry with Email Reminder:**

**Step 1: Create Scenario**
1. New scenario: "Daily GA Reminder"

**Step 2: Schedule Trigger**
1. Every day at 9:00 AM

**Step 3: Email Module**
1. Click "+"
2. Search "Email"
3. Select "Email" > "Send an email"
4. To: [your email]
5. Subject: "📊 Update GA Data in Tracking Sheet"
6. Body:
```
Good morning!

Reminder to update yesterday's Google Analytics data:

1. Go to Google Analytics
2. Check yesterday's stats ({{formatDate(addDays(now; -1); "MMM DD")}})
3. Update Tab 4 of your tracking sheet

Metrics needed:
- Total visitors
- New visitors
- Bounce rate
- Avg session duration
- Top traffic source

Takes 3 minutes!

- Your automated assistant
```

**This is simpler and more reliable than GA API for manual checking.**

---

## Workflow 3: Reddit Post Metrics Tracker

**Purpose:** Check your Reddit posts for new upvotes/comments every 6 hours

**Note:** Requires Reddit API access (free)

### Prerequisites:

**Get Reddit API Credentials:**
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - Name: "Find My Mosque Tracker"
   - Type: Select "script"
   - Description: "Track my posts"
   - Redirect URI: `http://localhost:8080`
4. Click "Create app"
5. Copy:
   - Client ID (under app name)
   - Secret (next to "secret")

### Setup Steps:

**Step 1: Create Scenario**
1. New scenario: "Reddit Metrics Tracker"

**Step 2: Add Schedule**
1. Trigger: Schedule > Every 6 hours
2. Or: Every day at 9 AM, 3 PM, 9 PM

**Step 3: Add Reddit Module**
1. Click "+"
2. Search "Reddit"
3. Select "Reddit" > "Make an API Call"
4. Add connection using your Client ID and Secret
5. Configure:
   - URL: `/user/[your_username]/submitted.json?limit=20`
   - Method: GET

**Step 4: Parse Reddit Data**
1. Click "+"
2. Add "Iterator" module
3. Array: `{{2.data.data.children}}`

**Step 5: Filter Recent Posts**
1. Add "Filter" module
2. Condition: `{{2.data.created_utc}}` is greater than `{{timestamp - 604800}}` (last 7 days)

**Step 6: Update Google Sheets**
1. Add "Google Sheets" > "Update a row"
2. Spreadsheet: Your tracking sheet
3. Sheet: "Engagement Metrics"
4. Row: Search by Post Link column matching `{{2.data.url}}`
5. Update:
   - Upvotes/Likes: `{{2.data.ups}}`
   - Comments: `{{2.data.num_comments}}`

**Step 7: Test**
1. Run once
2. Check if your sheet updates with current Reddit stats

**This runs automatically every 6 hours to keep metrics fresh!**

---

## Workflow 4: Daily Summary Email

**Purpose:** Get end-of-day summary of your marketing performance

### Setup Steps:

**Step 1: Create Scenario**
1. New scenario: "Daily Marketing Summary"

**Step 2: Schedule**
1. Every day at 8:00 PM (end of day)

**Step 3: Pull Google Sheets Data**
1. Add "Google Sheets" > "Search rows"
2. Sheet: "Daily Posting Log"
3. Filter: Date equals `{{formatDate(now; "MM/DD/YYYY")}}`

**Step 4: Get Today's Engagement**
1. Add another "Google Sheets" > "Search rows"
2. Sheet: "Engagement Metrics"
3. Filter: Date equals today

**Step 5: Count Comments**
1. Add "Google Sheets" > "Search rows"
2. Sheet: "Comment Tracker"
3. Filter: Date equals today AND Response Given = "No"

**Step 6: Compose Email**
1. Add "Email" > "Send an email"
2. To: [your email]
3. Subject: `📊 Daily Summary - {{formatDate(now; "MMM DD, YYYY")}}`
4. Body:
```
Hey!

Here's your marketing summary for {{formatDate(now; "MMMM DD, YYYY")}}:

📝 POSTS TODAY
• Total posts: {{length(3.bundle)}}
• Platforms: [List from bundle]

📊 ENGAGEMENT
• Total upvotes/likes: {{sum(4.bundle.Upvotes/Likes)}}
• Total comments: {{sum(4.bundle.Comments)}}
• Site clicks: {{sum(4.bundle.Site Clicks)}}

💬 COMMENTS NEEDING RESPONSE
• Pending replies: {{length(5.bundle)}}

🎯 ACTION ITEMS
{{if(length(5.bundle) > 0; "⚠️ You have unanswered comments! Check your posts."; "✓ All caught up on responses!")}}

---
Keep up the great work!

[Auto-generated summary from Make.com]
```

**Step 7: Activate**
1. Save and turn ON
2. You'll get daily summaries automatically!

---

## Workflow 5: Unanswered Comment Reminder

**Purpose:** Remind you to check posts with pending responses

### Setup Steps:

**Step 1: Create Scenario**
1. New scenario: "Comment Response Reminder"

**Step 2: Schedule**
1. Every day at 11 AM and 5 PM (twice daily check)

**Step 3: Search Unanswered Comments**
1. Add "Google Sheets" > "Search rows"
2. Sheet: "Comment Tracker"
3. Filter: Response Given = "No" OR "Pending"

**Step 4: Send Reminder (If Any Found)**
1. Add "Filter" module
2. Condition: `{{length(2.bundle)}}` greater than 0

**Step 5: Email Notification**
1. Add "Email" > "Send an email"
2. Subject: "⚠️ You have {{length(2.bundle)}} unanswered comments"
3. Body:
```
Hey!

You have {{length(2.bundle)}} comments waiting for responses:

{{range(1; length(2.bundle))}}
• Post: {{2.bundle[].Post Link}}
  Platform: {{2.bundle[].Platform}}
  Comment: {{2.bundle[].Comment Summary}}
{{end}}

Go respond to keep engagement high!

Tip: Aim to respond within 12 hours for best engagement.
```

**This keeps you accountable to respond quickly!**

---

## Workflow 6: Weekly Performance Report

**Purpose:** Get comprehensive weekly summary every Sunday

### Setup Steps:

**Step 1: Create Scenario**
1. New scenario: "Weekly Performance Report"

**Step 2: Schedule**
1. Every week on Sunday at 7:00 PM

**Step 3: Pull Weekly Data**
1. Add multiple "Google Sheets" > "Search rows" modules:
   - Daily Posting Log (last 7 days)
   - Engagement Metrics (last 7 days)
   - Site Traffic (sum of week)
   - Feedback Submissions (last 7 days)

**Step 4: Calculate Totals**
1. Add "Tools" > "Set variable" modules:
   - Total posts: `{{length(posts_bundle)}}`
   - Total engagement: `{{sum(engagement.Upvotes) + sum(engagement.Comments)}}`
   - Total traffic: `{{sum(traffic.Visitors)}}`
   - Total feedback: `{{length(feedback_bundle)}}`

**Step 5: Compose Report**
1. Add "Email" > "Send an email"
2. Subject: `📈 Week {{formatDate(now; "w")}} Performance Report`
3. Body:
```
WEEK IN REVIEW
{{formatDate(addDays(now; -7); "MMM DD")}} - {{formatDate(now; "MMM DD, YYYY")}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 KEY METRICS

Posts Published: {{total_posts}}
Total Engagement: {{total_engagement}}
Site Visitors: {{total_traffic}}
Feedback Received: {{total_feedback}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 BY PLATFORM

Reddit
• Posts: {{count_reddit}}
• Engagement: {{reddit_engagement}}

Facebook
• Posts: {{count_facebook}}
• Engagement: {{facebook_engagement}}

Quora
• Answers: {{count_quora}}
• Views: {{quora_views}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 GOALS PROGRESS

✓ Site Visitors: {{total_traffic}}/500 ({{(total_traffic/500)*100}}%)
✓ Feedback: {{total_feedback}}/20 ({{(total_feedback/20)*100}}%)
✓ Posts: {{total_posts}}/30 ({{(total_posts/30)*100}}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 TOP PERFORMERS

Best post: [Auto-detected from highest engagement]
Best platform: [Auto-detected]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NEXT WEEK FOCUS

Based on this week's data:
[Auto-suggestions based on performance]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep crushing it! 🚀
```

---

## 🎯 Quick Reference: All Workflows

| # | Workflow Name | Trigger | Purpose | Time Saved |
|---|---------------|---------|---------|------------|
| 1 | Post Logger | Webhook | Quick-log posts manually | 2 min/post |
| 2 | GA Reminder | Daily 9 AM | Remind to update analytics | Keeps on track |
| 3 | Reddit Tracker | Every 6h | Auto-update Reddit metrics | 10 min/day |
| 4 | Daily Summary | Daily 8 PM | End-of-day performance | 5 min/day |
| 5 | Comment Reminder | 2x daily | Remind to respond | Accountability |
| 6 | Weekly Report | Sunday 7 PM | Comprehensive week review | 30 min/week |

**Total time saved:** ~2 hours per week
**Cost:** $0 (free tier handles this easily)

---

## 🚀 Activation Checklist

**Before going live:**
- [ ] All 6 workflows created in Make.com
- [ ] Tested each workflow once (click "Run once")
- [ ] Verified Google Sheets updates correctly
- [ ] Email notifications working (check spam folder!)
- [ ] Reddit API connected (if using Workflow 3)
- [ ] Post logger bookmark/HTML form created
- [ ] All scenarios set to "ON" (scheduling enabled)

**Week 1 Ready:** You now have backend automation running!

---

## 📊 Expected Operations Usage (Free Tier)

**Make.com Free Tier:** 1,000 operations/month

**Your usage:**
- Workflow 1 (Post Logger): ~30-40 ops (manual triggers)
- Workflow 2 (GA Reminder): 7 ops/week = 28/month
- Workflow 3 (Reddit Tracker): 4 ops/day × 7 days = 28/month
- Workflow 4 (Daily Summary): 7 ops/week = 28/month
- Workflow 5 (Comment Reminder): 14 ops/week = 56/month
- Workflow 6 (Weekly Report): 4 ops/month

**Total:** ~200-250 operations/month
**Free tier:** 1,000 operations/month

**You're well within limits!** ✓

---

## 🔧 Troubleshooting

**Workflow not triggering:**
- Check scenario is "ON" (toggle in upper right)
- Verify schedule is in correct timezone
- Check "Execution history" for errors

**Google Sheets not updating:**
- Reconnect Google Sheets connection
- Check sheet name matches exactly (case-sensitive)
- Verify column headers match your mapping

**Email not arriving:**
- Check spam/junk folder
- Whitelist make@notifications.com
- Verify email address in workflow

**Reddit API errors:**
- Check credentials are correct
- Verify redirect URI is exactly: http://localhost:8080
- Ensure app type is "script"

**Data not matching:**
- Check date format in filters
- Verify timezone settings
- Test with sample data first

---

## 💡 Pro Tips

**Efficiency:**
1. **Run workflows manually first** before automating - ensures they work
2. **Start with 2-3 workflows**, add more as you get comfortable
3. **Check execution history** weekly to catch errors early

**Data Quality:**
1. **Standardize formats** - Always use same date format
2. **Test with sample data** before live data
3. **Back up your Google Sheet** weekly

**Optimization:**
1. **Monitor operations usage** - Make.com dashboard shows this
2. **Combine workflows** if hitting limits (unlikely)
3. **Turn off unused workflows** to save operations

---

## 🎓 Learning Resources

**Make.com Academy:**
- make.com/en/help - Official documentation
- make.com/en/templates - Pre-built templates

**Video Tutorials:**
- Search YouTube: "Make.com Google Sheets automation"
- Search YouTube: "Make.com Reddit integration"

**Community:**
- Make.com community forum
- Reddit: r/make (for Make.com platform)

---

## 📞 Next Steps After Setup

**Week 1:**
1. Use workflows daily to get comfortable
2. Adjust email times if needed (maybe 9 PM vs 8 PM?)
3. Add custom metrics as you discover what matters

**Week 2:**
4. Create mosque outreach workflows (will provide separately)
5. Add backlink tracking automation
6. Optimize based on Week 1 learnings

---

**Questions during setup?** Most common issues:
1. Google Sheets column names must match exactly
2. Date formats must be consistent
3. Webhook needs to be "active" (save scenario first)

**Ready to activate your automation system!** 🚀
