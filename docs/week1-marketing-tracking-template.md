# Week 1 Marketing Tracking Template - Google Sheets Setup

## 📊 Complete Google Sheets Structure

Create a new Google Sheet called: **"Find My Mosque - Week 1 Marketing Tracker"**

---

## Tab 1: Daily Posting Log

**Column Headers (Row 1):**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Platform | Community/Subreddit | Post Title | Post Link | Time Posted | Status | Notes |

**Example Data (Row 2):**
```
10/13/2025 | Reddit | r/australia | Built a free mosque directory... | https://reddit.com/... | 8:30 AM | Live | Great engagement! |
```

**Formulas to Add:**

**Cell I1:** `Platform Summary`
**Cell I2:** `=COUNTIF(B:B,"Reddit")`
**Cell I3:** `=COUNTIF(B:B,"Facebook")`
**Cell I4:** `=COUNTIF(B:B,"Quora")`

**Cell J1:** `Total Posts`
**Cell J2:** `=COUNTA(B2:B100)-COUNTBLANK(B2:B100)`

**Conditional Formatting:**
- Column G (Status):
  - "Live" = Green background
  - "Pending" = Yellow background
  - "Removed" = Red background

---

## Tab 2: Engagement Metrics

**Column Headers (Row 1):**

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Date | Post Link | Platform | Community | Upvotes/Likes | Comments | Shares | Site Clicks | Conversion Rate |

**Example Data (Row 2):**
```
10/13/2025 | [link] | Reddit | r/australia | 45 | 12 | 3 | 78 | 5.1% |
```

**Formulas:**

**Cell I2 (Conversion Rate):**
```
=IF(E2>0, (H2/E2)*100, 0)
```
This calculates what % of people who engaged actually clicked to your site.

**Summary Section (Cells K1:L10):**

| K | L |
|---|---|
| **Total Engagement** | `=SUM(E:E)+SUM(F:F)+SUM(G:G)` |
| **Total Site Clicks** | `=SUM(H:H)` |
| **Avg Conversion Rate** | `=AVERAGE(I2:I100)` |
| **Best Performing Post** | `=INDEX(D:D,MATCH(MAX(E:E),E:E,0))` |
| **Reddit Total Engagement** | `=SUMIF(C:C,"Reddit",E:E)` |
| **Facebook Total Engagement** | `=SUMIF(C:C,"Facebook",E:E)` |
| **Quora Total Engagement** | `=SUMIF(C:C,"Quora",E:E)` |

**Conditional Formatting:**
- Column E (Upvotes/Likes):
  - 0-10 = Red
  - 11-30 = Yellow
  - 31+ = Green
- Column H (Site Clicks):
  - 0-20 = Red
  - 21-50 = Yellow
  - 51+ = Green

---

## Tab 3: Comment Tracker

**Column Headers (Row 1):**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Post Link | Platform | Commenter | Comment Summary | Response Given? | Feature Request? | Action Taken |

**Example Data (Row 2):**
```
10/13/2025 | [link] | Reddit | user123 | Loves the idea, wants prayer times | Yes | Prayer times | Added to roadmap |
```

**Data Validation (Column F & G):**
- Column F: Dropdown = `Yes, No, Pending`
- Column G: Dropdown = `Prayer times, Events, Mobile app, Directions, Other, None`

**Summary Section (Cells J1:K10):**

| J | K |
|---|---|
| **Total Comments** | `=COUNTA(D2:D1000)` |
| **Responses Given** | `=COUNTIF(F:F,"Yes")` |
| **Response Rate** | `=(K2/K1)*100` |
| **Feature Requests** | `=COUNTIF(G:G,"Prayer times")+COUNTIF(G:G,"Events")+COUNTIF(G:G,"Mobile app")` |

**Feature Request Breakdown:**
- Prayer times: `=COUNTIF(G:G,"Prayer times")`
- Events: `=COUNTIF(G:G,"Events")`
- Mobile app: `=COUNTIF(G:G,"Mobile app")`
- Directions: `=COUNTIF(G:G,"Directions")`
- Other: `=COUNTIF(G:G,"Other")`

---

## Tab 4: Site Traffic (Manual Entry from Google Analytics)

**Column Headers (Row 1):**

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Total Visitors | New Visitors | Returning Visitors | Bounce Rate | Avg Session Duration | Pages/Session | Traffic Source |

**Example Data (Row 2):**
```
10/13/2025 | 156 | 142 | 14 | 68% | 2:34 | 3.2 | Reddit |
```

**Summary Section (Cells J1:K10):**

| J | K |
|---|---|
| **Week Total Visitors** | `=SUM(B:B)` |
| **Week New Visitors** | `=SUM(C:C)` |
| **Avg Bounce Rate** | `=AVERAGE(E2:E8)` |
| **Avg Session Duration** | `=AVERAGE(F2:F8)` |
| **Top Traffic Source** | `=INDEX(H:H,MATCH(MAX(B:B),B:B,0))` |

**Traffic by Source (Cells M1:N10):**

| M | N |
|---|---|
| **Reddit Traffic** | `=SUMIF(H:H,"Reddit",B:B)` |
| **Facebook Traffic** | `=SUMIF(H:H,"Facebook",B:B)` |
| **Quora Traffic** | `=SUMIF(H:H,"Quora",B:B)` |
| **Direct Traffic** | `=SUMIF(H:H,"Direct",B:B)` |
| **Google Search** | `=SUMIF(H:H,"Organic Search",B:B)` |

---

## Tab 5: Feedback Submissions

**Column Headers (Row 1):**

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Date | Source | Feedback Type | Feedback Summary | Priority | Status | Action Taken |

**Example Data (Row 2):**
```
10/13/2025 | Reddit | Feature Request | Add prayer times for each mosque | High | In Progress | Researching API |
```

**Data Validation:**
- Column C: Dropdown = `Feature Request, Bug Report, General Feedback, Complaint, Praise`
- Column E: Dropdown = `High, Medium, Low`
- Column F: Dropdown = `Backlog, In Progress, Completed, Won't Fix`

**Summary Section (Cells I1:J10):**

| I | J |
|---|---|
| **Total Feedback** | `=COUNTA(C2:C1000)` |
| **Feature Requests** | `=COUNTIF(C:C,"Feature Request")` |
| **Bug Reports** | `=COUNTIF(C:C,"Bug Report")` |
| **High Priority** | `=COUNTIF(E:E,"High")` |
| **Completed** | `=COUNTIF(F:F,"Completed")` |

**Conditional Formatting:**
- Column E (Priority):
  - High = Red background
  - Medium = Yellow background
  - Low = Green background
- Column F (Status):
  - Backlog = Gray
  - In Progress = Yellow
  - Completed = Green
  - Won't Fix = Red

---

## Tab 6: Weekly Summary Dashboard

**Create a visual dashboard with these metrics:**

### Week at a Glance (Cells A1:B15)

| Metric | Value |
|--------|-------|
| **Total Posts Published** | `='Daily Posting Log'!J2` |
| **Total Engagement** | `='Engagement Metrics'!L1` |
| **Total Site Visitors** | `='Site Traffic'!K1` |
| **Total Feedback Received** | `='Feedback Submissions'!J1` |
| **Comments Received** | `='Comment Tracker'!K1` |
| **Response Rate** | `='Comment Tracker'!K3` |
| **Feature Requests** | `='Comment Tracker'!K4` |
| **Bugs Fixed** | `='Feedback Submissions'!J3` |
| | |
| **Best Platform** | `=IF('Engagement Metrics'!L5>MAX('Engagement Metrics'!L6,'Engagement Metrics'!L7),"Reddit",IF('Engagement Metrics'!L6>='Engagement Metrics'!L7,"Facebook","Quora"))` |
| **Best Performing Post** | `='Engagement Metrics'!L4` |
| **Avg Conversion Rate** | `='Engagement Metrics'!L3` |

### Goals vs Actual (Cells D1:F10)

| Goal | Target | Actual | Status |
|------|--------|--------|--------|
| Site Visitors | 500 | `='Site Traffic'!K1` | `=IF(F2>=E2,"✓ Met","✗ Not Met")` |
| Feedback Submissions | 20 | `='Feedback Submissions'!J1` | `=IF(F3>=E3,"✓ Met","✗ Not Met")` |
| Total Posts | 30 | `='Daily Posting Log'!J2` | `=IF(F4>=E4,"✓ Met","✗ Not Met")` |
| Engagement | 200 | `='Engagement Metrics'!L1` | `=IF(F5>=E5,"✓ Met","✗ Not Met")` |
| Response Rate | 90% | `='Comment Tracker'!K3` | `=IF(F6>=E6,"✓ Met","✗ Not Met")` |

**Conditional Formatting:**
- Column G (Status):
  - "✓ Met" = Green background
  - "✗ Not Met" = Red background

### Daily Progress Chart (Cells H1:K8)

| Day | Posts | Engagement | Visitors |
|-----|-------|------------|----------|
| Mon | `=COUNTIF('Daily Posting Log'!A:A,"10/13/2025")` | [manual] | [from GA] |
| Tue | `=COUNTIF('Daily Posting Log'!A:A,"10/14/2025")` | [manual] | [from GA] |
| Wed | `=COUNTIF('Daily Posting Log'!A:A,"10/15/2025")` | [manual] | [from GA] |
| Thu | `=COUNTIF('Daily Posting Log'!A:A,"10/16/2025")` | [manual] | [from GA] |
| Fri | `=COUNTIF('Daily Posting Log'!A:A,"10/17/2025")` | [manual] | [from GA] |
| Sat | `=COUNTIF('Daily Posting Log'!A:A,"10/18/2025")` | [manual] | [from GA] |
| Sun | `=COUNTIF('Daily Posting Log'!A:A,"10/19/2025")` | [manual] | [from GA] |

**Create a chart:**
1. Select cells H1:K8
2. Insert > Chart > Line chart
3. Title: "Week 1 Daily Progress"
4. Shows trend over 7 days

---

## Tab 7: Top Performing Content

**Column Headers (Row 1):**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Rank | Post Title | Platform | Total Engagement | Site Clicks | Engagement Rate |

**How to populate:**
1. Copy all posts from "Engagement Metrics" tab
2. Sort by "Total Engagement" (Upvotes + Comments + Shares)
3. Show top 10 posts
4. Use conditional formatting to highlight top 3 (gold, silver, bronze)

**Formula for Engagement Rate (Column F):**
```
=(D2/[impressions if you have it])*100
```
Or simply use total engagement as proxy.

---

## Tab 8: Action Items

**Column Headers (Row 1):**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Priority | Action Item | Source | Due Date | Status | Notes |

**Example Data (Row 2):**
```
High | Add prayer times feature | Reddit feedback | 10/20/2025 | In Progress | Researching APIs |
```

**Data Validation:**
- Column A: Dropdown = `High, Medium, Low`
- Column E: Dropdown = `Not Started, In Progress, Completed, Blocked`

**Filter views:**
- Create filter: "High Priority Only" (Column A = High)
- Create filter: "In Progress" (Column E = In Progress)
- Create filter: "Due This Week" (Column D = within 7 days)

---

## 🎨 Formatting & Design

### Color Scheme
- **Header row:** Dark blue background (#1a237e), white text, bold
- **Summary sections:** Light blue background (#e3f2fd)
- **Formulas:** Light gray background (#f5f5f5)
- **Important metrics:** Bold, larger font (12pt)

### Fonts
- Headers: Arial Bold, 11pt
- Data: Arial Regular, 10pt
- Summaries: Arial Bold, 11pt

### Freeze Panes
- Freeze Row 1 (headers) on all tabs
- Freeze Column A on wider tables

### Conditional Formatting Rules

**Apply to all tabs:**
1. Dates: Highlight weekends (Sat/Sun) in light gray
2. Empty cells in required fields: Red border
3. Duplicates: Yellow highlight (for post links)

---

## 📱 Mobile Access Setup

**To access on phone:**
1. Install Google Sheets app
2. Log in with same Google account
3. Pin this sheet to "Starred" for quick access
4. Enable offline access (Settings > Offline)

**Quick mobile updates:**
- Use "+" button to add rows quickly
- Voice typing for comment summaries
- Copy/paste links directly from Reddit/Facebook apps

---

## 🔄 Daily Update Routine

### Morning (5 minutes)
1. Check Tab 6 (Weekly Summary Dashboard)
2. Review yesterday's performance
3. Note any urgent action items

### After Each Post (2 minutes)
1. Tab 1: Log post details
2. Tab 2: Add initial engagement (0s)
3. Set reminder to check in 6 hours

### Evening (10 minutes)
1. Tab 2: Update engagement metrics
2. Tab 3: Log all comments received
3. Tab 4: Pull Google Analytics data
4. Tab 5: Add any feedback submissions
5. Tab 8: Update action items status

### Weekly (30 minutes)
1. Review Tab 6 dashboard
2. Analyze top performing content (Tab 7)
3. Export summary for records
4. Archive or start fresh for Week 2

---

## 📊 How to Pull Data from Google Analytics

**Daily Traffic Data:**
1. Go to Google Analytics
2. Reports > Acquisition > All Traffic > Source/Medium
3. Set date range to "Today" or "Yesterday"
4. Export as CSV or manually enter:
   - Visitors
   - Bounce rate
   - Avg session duration
   - Pages/session
   - Traffic source

**Alternative - Use GA Dashboard:**
1. Create custom dashboard in GA
2. Add widgets for:
   - Real-time visitors
   - Traffic sources
   - Bounce rate
   - Session duration
3. Check daily and manually log to Sheet

---

## 🚨 Alerts & Notifications (Optional)

**Set up Google Sheets notifications:**

1. **For new comments/engagement:**
   - Tools > Notification rules
   - "Notify me when: Any changes are made"
   - Set for Tab 3 (Comment Tracker)

2. **For weekly summaries:**
   - Create a separate tab with email template
   - Use Apps Script to send yourself weekly summary
   - Or manually review Tab 6 every Sunday

3. **For goal tracking:**
   - Tools > Conditional formatting
   - Color-code cells when targets are met/missed
   - Visual cue to stay on track

---

## 💡 Pro Tips

### Efficiency Hacks
1. **Keep sheet open all week** - Pin the browser tab
2. **Use keyboard shortcuts:**
   - `Ctrl+;` = Insert current date
   - `Ctrl+:` = Insert current time
   - `Ctrl+D` = Fill down (copy cell above)
3. **Create templates** - Duplicate Row 2 for consistent formatting
4. **Use "Filter views"** - See different slices without changing sheet for others

### Data Integrity
1. **Daily backups:** File > Make a copy (weekly)
2. **Version history:** File > Version history (if you mess up)
3. **Protect ranges:** Right-click > Protect range (for formula cells)

### Collaboration
1. **Share with yourself on different devices** - Access from phone/tablet
2. **Comment on cells** - Right-click > Comment (note to self)
3. **Named ranges** - Use for important cells (easier formulas)

---

## 📥 Import Instructions

**Option 1: Create Manually**
1. Create new Google Sheet
2. Follow structure above tab-by-tab
3. Copy formulas exactly as written
4. Apply formatting and conditional rules

**Option 2: Template (I can create)**
If you want, I can create a downloadable template with all formulas pre-built.

**Time to set up:** 45-60 minutes (one-time investment)

---

## ✅ Checklist: Setup Complete When...

- [ ] All 8 tabs created and labeled
- [ ] Column headers match exactly
- [ ] All formulas tested and working
- [ ] Conditional formatting applied
- [ ] Data validation dropdowns working
- [ ] Dashboard shows "0" values (not errors)
- [ ] Sheet accessible on mobile device
- [ ] First test entry works in all tabs
- [ ] You understand how to update each tab
- [ ] Freeze panes applied for easy scrolling

---

**Questions while setting up?** Let me know which tab or formula needs clarification!
