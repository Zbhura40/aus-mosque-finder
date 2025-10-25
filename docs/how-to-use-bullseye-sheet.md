# How to Use Your Bullseye Testing Spreadsheet

## 🚀 Quick Setup (5 minutes)

### Step 1: Import to Google Sheets
1. Open Google Sheets (sheets.google.com)
2. Click **File → Import**
3. Upload `bullseye-flexible-template.csv`
4. Import location: **Replace spreadsheet**
5. Click **Import data**

### Step 2: The Formulas Will Auto-Calculate
The spreadsheet has built-in formulas that automatically calculate:
- **TOTAL USERS** = Traffic × CTR% × Conversion%
- **COST PER USER** = Cost ÷ Total Users
- **TOTALS ROW** = Sums everything up

**You don't need to do any math!** Just enter your data in these columns:
- SOURCE NAME
- TRAFFIC
- CTR %
- CONVERSION %
- COST $
- TIME HRS
- CONFIRMED? (Yes/No)
- CONFIRMED USERS (real results after testing)

---

## 📝 How to Customize Channels

### Example: Choosing Your Reddit Forums

**BEFORE (Generic):**
```
REDDIT | Reddit Forum 1 | 50000 | 2 | 15 | ...
REDDIT | Reddit Forum 2 | 30000 | 3 | 20 | ...
```

**AFTER (Your Choices):**
```
REDDIT | r/australia     | 50000 | 2 | 15 | ...
REDDIT | r/perth         | 20000 | 3 | 20 | ...
REDDIT | r/brisbane      | 15000 | 3 | 18 | ...
REDDIT | r/islamicstudies| 40000 | 5 | 25 | ...
```

**Just replace the "Reddit Forum 1" text with your actual subreddit name!**

Same for:
- Facebook Groups → Enter actual group names
- News Sites → Enter site names (The Muslim Vibe, etc.)
- Bloggers → Enter blogger names
- YouTube → Enter channel names

---

## 🎯 How to Fill In Each Column

### **Column A: CHANNEL TYPE**
Pre-filled categories to organize your tests:
- REDDIT
- FACEBOOK
- QUORA
- PAID ADS
- OUTREACH
- ORGANIC
- VIDEO
- COMMUNITY
- PARTNERSHIPS
- TOOLS

### **Column B: SOURCE NAME**
✏️ **YOU EDIT THIS** - Replace generic names with actual channels
- "Reddit Forum 1" → "r/australia"
- "Facebook Group 1" → "Australian Muslims Sydney"
- "News Site 1" → "The Muslim Vibe"

### **Column C: TRAFFIC**
Expected number of people who will see your content
- Reddit sub subscribers
- Facebook group members
- Website monthly visitors
- Ad impressions

**Where to find this:**
- Reddit: Check subreddit sidebar (e.g., r/australia = 1.2M members)
- Facebook: Group "About" page
- News sites: Ask editor or use SimilarWeb

### **Column D: CTR %**
Click-through rate - % who click your link

**Typical ranges:**
- Reddit posts: 1-5%
- Facebook posts: 2-6%
- Google Ads: 5-10%
- Email: 10-20%
- Personal outreach: 15-40%

**Start with estimates, update with real data after testing**

### **Column E: CONVERSION %**
% of visitors who do something valuable (search for mosque, submit feedback)

**Typical ranges:**
- Cold traffic (ads): 10-20%
- Warm traffic (community posts): 20-30%
- Hot traffic (direct referrals): 30-50%

### **Column F: TOTAL USERS**
✅ **AUTO-CALCULATED** - Don't edit this!
Formula: `=C3*D3/100*E3/100`

### **Column G: COST $**
Money you spent on this test
- Reddit posts: $0
- Google Ads: $150
- Facebook Ads: $100
- Flyers: $50

**Just type the number** (e.g., "150" not "$150")

### **Column H: COST PER USER**
✅ **AUTO-CALCULATED** - Don't edit this!
Formula: `=IF(H3>0,G3/H3,0)`

### **Column I: TIME HRS**
Hours you invested
- Writing Reddit post: 1-2 hrs
- Email outreach: 10-20 hrs
- Running ads: 3-5 hrs

### **Column J: STATUS**
How you're getting this traffic:
- **Friend** - Asking favors, free posts
- **Coordinated** - Planned campaigns
- **Emailing** - Email outreach
- **Bought** - Paid ads
- **Self** - Organic (SEO, content)

### **Column K: CONFIRMED?**
Did you actually test this yet?
- **No** = Still a projection
- **Yes** = You've tested it

### **Column L: CONFIRMED USERS**
Real results after testing
- Leave blank until you test
- After testing, enter actual engaged users
- Compare to Column F (projected)

### **Column M: NOTES**
Your observations:
- "Top post in r/australia for 6 hours"
- "Admin removed post - try different approach"
- "Great engagement, low bounce rate"

---

## 📊 Example: Testing r/australia

**BEFORE TESTING (Projection):**
```
REDDIT | r/australia | 50000 | 2 | 15 | 150 | $0 | $0 | 2 | Friend | No | [blank] | "Post feedback request"
```

**AFTER TESTING (Real Results):**
```
REDDIT | r/australia | 50000 | 2 | 15 | 150 | $0 | $0 | 2 | Friend | Yes | 245 | "Got 500 upvotes! Front page for 8 hrs"
```

**Analysis:**
- Projected: 150 users
- Actual: 245 users
- **64% better than expected!** 🎉
- Cost per user: $0
- **Decision: This channel works - test more subreddits**

---

## 🔄 Weekly Update Process

**Every Friday at 5pm:**

1. **Update "CONFIRMED USERS" column** with real data from Google Analytics
   - Go to Analytics → Acquisition → All Traffic → Source/Medium
   - Find reddit.com traffic, count engaged users (searched for mosque or submitted feedback)

2. **Compare Projected vs Actual**
   - Projected (Column F) vs Confirmed (Column L)
   - Which channels beat expectations?
   - Which underperformed?

3. **Add Notes** about what worked and what didn't

4. **Calculate Cost Per User** (auto-calculated, but verify)
   - Free channels: $0 per user (but consider your time!)
   - Paid channels: Did you stay under $1.00 per user?

5. **Decide Next Week's Tests**
   - Double down on what's working
   - Pause what's not working
   - Add 1-2 new channel tests

---

## 🎯 Decision Framework (Week 5)

After 4 weeks, **sort your spreadsheet** by different metrics:

### **Sort by: COST PER USER (Low to High)**
Cheapest channels to acquire users

### **Sort by: TOTAL USERS (High to Low)**
Which channels deliver most volume?

### **Compare: Confirmed Users vs TIME HRS**
Which channels give best ROI for your time?

### **Your Core Channel =**
- ✅ Lowest cost per user
- ✅ Highest quality users (check bounce rate in Analytics)
- ✅ Most scalable (can you 10x it?)
- ✅ Fits your resources (time, money, skills)

---

## 🎨 Pro Tips

### Color Code Your Tests
In Google Sheets, highlight rows:
- 🟢 **Green** = Tested and working (keep doing)
- 🟡 **Yellow** = Testing in progress
- 🔴 **Red** = Tested and failed (pause or rethink)
- ⚪ **White** = Not tested yet

### Add More Rows
Need to test more channels?
1. Right-click on a row
2. Insert row below
3. Copy formulas from row above
4. Edit channel name

### Create a Pivot
After 4 weeks, create a summary:
1. Select all data
2. Data → Pivot table
3. Rows = CHANNEL TYPE
4. Values = SUM of TOTAL USERS, SUM of COST
5. See which channel types perform best overall

---

## 📞 Quick Reference

**What to track:** Traffic, CTR, Conversion, Cost, Time
**How often:** Update weekly (every Friday)
**When to decide:** After 4 weeks of testing
**Decision criteria:** Lowest cost per quality user + scalability

**Files:**
- Template: `bullseye-flexible-template.csv`
- Strategy: `bullseye-marketing-strategy.md`
- Quick guide: `bullseye-quick-reference.md`

---

**Now go make a copy in Google Sheets and start testing! 🚀**
