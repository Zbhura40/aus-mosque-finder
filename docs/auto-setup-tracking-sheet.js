/**
 * Find My Mosque - Week 1 Marketing Tracker
 * Auto-Setup Script for Google Sheets
 *
 * INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any code you see
 * 4. Copy-paste this entire script
 * 5. Click Save (disk icon)
 * 6. Click Run (play icon)
 * 7. Grant permissions when prompted
 * 8. Wait 30-60 seconds - your sheet will be ready!
 */

function setupMarketingTracker() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Rename the spreadsheet
  ss.rename("Find My Mosque - Week 1 Marketing Tracker");

  // Delete default sheet if it exists
  var sheets = ss.getSheets();
  if (sheets.length === 1 && sheets[0].getName() === "Sheet1") {
    // We'll replace it, so keep it for now
  }

  Logger.log("Creating tabs...");

  // Create all tabs
  createDailyPostingLog(ss);
  createEngagementMetrics(ss);
  createCommentTracker(ss);
  createSiteTraffic(ss);
  createFeedbackSubmissions(ss);
  createWeeklySummary(ss);
  createTopPerforming(ss);
  createActionItems(ss);

  // Delete the original Sheet1 if it still exists
  try {
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1) ss.deleteSheet(sheet1);
  } catch(e) {
    // Sheet1 already deleted or doesn't exist
  }

  // Set active sheet to Weekly Summary Dashboard
  ss.setActiveSheet(ss.getSheetByName("Weekly Summary"));

  Logger.log("✓ Setup complete! Your tracking sheet is ready.");
  SpreadsheetApp.getUi().alert('✓ Setup Complete!\n\nYour marketing tracking sheet is ready to use.\n\nStart with the "Weekly Summary" tab to see your dashboard.');
}

// ============================================
// TAB 1: DAILY POSTING LOG
// ============================================
function createDailyPostingLog(ss) {
  var sheet = ss.insertSheet("Daily Posting Log", 0);

  // Headers
  var headers = [
    ["Date", "Platform", "Community/Subreddit", "Post Title", "Post Link", "Time Posted", "Status", "Notes"]
  ];
  sheet.getRange("A1:H1").setValues(headers);

  // Formatting
  formatHeaders(sheet, "A1:H1");

  // Sample data row
  var today = new Date();
  var sampleData = [
    [today, "Reddit", "r/australia", "Built a free mosque directory...", "https://reddit.com/...", "8:30 AM", "Live", "Great engagement!"]
  ];
  sheet.getRange("A2:H2").setValues(sampleData);

  // Summary section
  sheet.getRange("J1").setValue("Platform Summary");
  sheet.getRange("J2").setValue("Reddit Posts:");
  sheet.getRange("K2").setFormula('=COUNTIF(B:B,"Reddit")');
  sheet.getRange("J3").setValue("Facebook Posts:");
  sheet.getRange("K3").setFormula('=COUNTIF(B:B,"Facebook")');
  sheet.getRange("J4").setValue("Quora Posts:");
  sheet.getRange("K4").setFormula('=COUNTIF(B:B,"Quora")');

  sheet.getRange("J6").setValue("Total Posts:");
  sheet.getRange("K6").setFormula('=COUNTA(B2:B1000)');
  sheet.getRange("K6").setFontWeight("bold");

  // Conditional formatting for Status column
  var statusRange = sheet.getRange("G2:G1000");
  var liveRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Live")
    .setBackground("#d9ead3")
    .setRanges([statusRange])
    .build();
  var pendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Pending")
    .setBackground("#fff2cc")
    .setRanges([statusRange])
    .build();
  var rules = sheet.getConditionalFormatRules();
  rules.push(liveRule, pendingRule);
  sheet.setConditionalFormatRules(rules);

  // Column widths
  sheet.setColumnWidth(1, 100); // Date
  sheet.setColumnWidth(2, 100); // Platform
  sheet.setColumnWidth(3, 180); // Community
  sheet.setColumnWidth(4, 300); // Title
  sheet.setColumnWidth(5, 250); // Link
  sheet.setColumnWidth(6, 100); // Time
  sheet.setColumnWidth(7, 80);  // Status
  sheet.setColumnWidth(8, 200); // Notes

  // Freeze header row
  sheet.setFrozenRows(1);
}

// ============================================
// TAB 2: ENGAGEMENT METRICS
// ============================================
function createEngagementMetrics(ss) {
  var sheet = ss.insertSheet("Engagement Metrics", 1);

  // Headers
  var headers = [
    ["Date", "Post Link", "Platform", "Community", "Upvotes/Likes", "Comments", "Shares", "Site Clicks", "Conversion Rate"]
  ];
  sheet.getRange("A1:I1").setValues(headers);
  formatHeaders(sheet, "A1:I1");

  // Sample data
  var today = new Date();
  var sampleData = [
    [today, "https://reddit.com/...", "Reddit", "r/australia", 45, 12, 3, 78, ""]
  ];
  sheet.getRange("A2:I2").setValues(sampleData);

  // Conversion rate formula
  sheet.getRange("I2").setFormula('=IF(E2>0, (H2/E2)*100, 0)');
  sheet.getRange("I2").setNumberFormat("0.0%");

  // Summary section
  sheet.getRange("K1").setValue("Summary");
  sheet.getRange("K1").setFontWeight("bold");

  sheet.getRange("K2").setValue("Total Engagement:");
  sheet.getRange("L2").setFormula('=SUM(E:E)+SUM(F:F)+SUM(G:G)');

  sheet.getRange("K3").setValue("Total Site Clicks:");
  sheet.getRange("L3").setFormula('=SUM(H:H)');

  sheet.getRange("K4").setValue("Avg Conversion Rate:");
  sheet.getRange("L4").setFormula('=AVERAGE(I2:I1000)');
  sheet.getRange("L4").setNumberFormat("0.0%");

  sheet.getRange("K6").setValue("Reddit Engagement:");
  sheet.getRange("L6").setFormula('=SUMIF(C:C,"Reddit",E:E)');

  sheet.getRange("K7").setValue("Facebook Engagement:");
  sheet.getRange("L7").setFormula('=SUMIF(C:C,"Facebook",E:E)');

  sheet.getRange("K8").setValue("Quora Engagement:");
  sheet.getRange("L8").setFormula('=SUMIF(C:C,"Quora",E:E)');

  // Conditional formatting for engagement levels
  var engagementRange = sheet.getRange("E2:E1000");
  var lowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(10)
    .setBackground("#f4cccc")
    .setRanges([engagementRange])
    .build();
  var medRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(11, 30)
    .setBackground("#fff2cc")
    .setRanges([engagementRange])
    .build();
  var highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(31)
    .setBackground("#d9ead3")
    .setRanges([engagementRange])
    .build();
  var rules = sheet.getConditionalFormatRules();
  rules.push(lowRule, medRule, highRule);
  sheet.setConditionalFormatRules(rules);

  // Column widths
  sheet.setColumnWidths(1, 9, 120);

  sheet.setFrozenRows(1);
}

// ============================================
// TAB 3: COMMENT TRACKER
// ============================================
function createCommentTracker(ss) {
  var sheet = ss.insertSheet("Comment Tracker", 2);

  // Headers
  var headers = [
    ["Date", "Post Link", "Platform", "Commenter", "Comment Summary", "Response Given?", "Feature Request?", "Action Taken"]
  ];
  sheet.getRange("A1:H1").setValues(headers);
  formatHeaders(sheet, "A1:H1");

  // Sample data
  var today = new Date();
  var sampleData = [
    [today, "https://reddit.com/...", "Reddit", "user123", "Loves the idea, wants prayer times", "Yes", "Prayer times", "Added to roadmap"]
  ];
  sheet.getRange("A2:H2").setValues(sampleData);

  // Data validation for Response Given
  var responseRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No', 'Pending'], true)
    .build();
  sheet.getRange("F2:F1000").setDataValidation(responseRule);

  // Data validation for Feature Request
  var featureRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Prayer times', 'Events', 'Mobile app', 'Directions', 'Other', 'None'], true)
    .build();
  sheet.getRange("G2:G1000").setDataValidation(featureRule);

  // Summary section
  sheet.getRange("J1").setValue("Summary");
  sheet.getRange("J1").setFontWeight("bold");

  sheet.getRange("J2").setValue("Total Comments:");
  sheet.getRange("K2").setFormula('=COUNTA(D2:D1000)');

  sheet.getRange("J3").setValue("Responses Given:");
  sheet.getRange("K3").setFormula('=COUNTIF(F:F,"Yes")');

  sheet.getRange("J4").setValue("Response Rate:");
  sheet.getRange("K4").setFormula('=IF(K2>0, (K3/K2)*100, 0)&"%"');

  sheet.getRange("J6").setValue("Feature Requests:");
  sheet.getRange("K6").setFormula('=COUNTA(G2:G1000)-COUNTIF(G:G,"None")');

  sheet.getRange("J8").setValue("Top Requests:");
  sheet.getRange("J9").setValue("Prayer times:");
  sheet.getRange("K9").setFormula('=COUNTIF(G:G,"Prayer times")');
  sheet.getRange("J10").setValue("Events:");
  sheet.getRange("K10").setFormula('=COUNTIF(G:G,"Events")');
  sheet.getRange("J11").setValue("Mobile app:");
  sheet.getRange("K11").setFormula('=COUNTIF(G:G,"Mobile app")');

  // Column widths
  sheet.setColumnWidths(1, 8, 150);
  sheet.setColumnWidth(5, 300); // Comment summary wider

  sheet.setFrozenRows(1);
}

// ============================================
// TAB 4: SITE TRAFFIC
// ============================================
function createSiteTraffic(ss) {
  var sheet = ss.insertSheet("Site Traffic", 3);

  // Headers
  var headers = [
    ["Date", "Total Visitors", "New Visitors", "Returning Visitors", "Bounce Rate", "Avg Session Duration", "Pages/Session", "Traffic Source"]
  ];
  sheet.getRange("A1:H1").setValues(headers);
  formatHeaders(sheet, "A1:H1");

  // Sample data
  var today = new Date();
  var sampleData = [
    [today, 156, 142, 14, "68%", "2:34", 3.2, "Reddit"]
  ];
  sheet.getRange("A2:H2").setValues(sampleData);

  // Summary section
  sheet.getRange("J1").setValue("Week Summary");
  sheet.getRange("J1").setFontWeight("bold");

  sheet.getRange("J2").setValue("Total Visitors:");
  sheet.getRange("K2").setFormula('=SUM(B:B)');
  sheet.getRange("K2").setFontWeight("bold");

  sheet.getRange("J3").setValue("New Visitors:");
  sheet.getRange("K3").setFormula('=SUM(C:C)');

  sheet.getRange("J4").setValue("Avg Bounce Rate:");
  sheet.getRange("K4").setValue("Manual calc");

  sheet.getRange("J5").setValue("Avg Session Duration:");
  sheet.getRange("K5").setValue("Manual calc");

  sheet.getRange("J7").setValue("Traffic by Source:");
  sheet.getRange("J8").setValue("Reddit:");
  sheet.getRange("K8").setFormula('=SUMIF(H:H,"Reddit",B:B)');
  sheet.getRange("J9").setValue("Facebook:");
  sheet.getRange("K9").setFormula('=SUMIF(H:H,"Facebook",B:B)');
  sheet.getRange("J10").setValue("Quora:");
  sheet.getRange("K10").setFormula('=SUMIF(H:H,"Quora",B:B)');
  sheet.getRange("J11").setValue("Direct:");
  sheet.getRange("K11").setFormula('=SUMIF(H:H,"Direct",B:B)');
  sheet.getRange("J12").setValue("Organic Search:");
  sheet.getRange("K12").setFormula('=SUMIF(H:H,"Organic Search",B:B)');

  // Column widths
  sheet.setColumnWidths(1, 8, 140);

  sheet.setFrozenRows(1);
}

// ============================================
// TAB 5: FEEDBACK SUBMISSIONS
// ============================================
function createFeedbackSubmissions(ss) {
  var sheet = ss.insertSheet("Feedback Submissions", 4);

  // Headers
  var headers = [
    ["Date", "Source", "Feedback Type", "Feedback Summary", "Priority", "Status", "Action Taken"]
  ];
  sheet.getRange("A1:G1").setValues(headers);
  formatHeaders(sheet, "A1:G1");

  // Sample data
  var today = new Date();
  var sampleData = [
    [today, "Reddit", "Feature Request", "Add prayer times for each mosque", "High", "In Progress", "Researching API"]
  ];
  sheet.getRange("A2:G2").setValues(sampleData);

  // Data validation
  var typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Feature Request', 'Bug Report', 'General Feedback', 'Complaint', 'Praise'], true)
    .build();
  sheet.getRange("C2:C1000").setDataValidation(typeRule);

  var priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['High', 'Medium', 'Low'], true)
    .build();
  sheet.getRange("E2:E1000").setDataValidation(priorityRule);

  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Backlog', 'In Progress', 'Completed', "Won't Fix"], true)
    .build();
  sheet.getRange("F2:F1000").setDataValidation(statusRule);

  // Conditional formatting for Priority
  var priorityRange = sheet.getRange("E2:E1000");
  var highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("High")
    .setBackground("#f4cccc")
    .setRanges([priorityRange])
    .build();
  var medRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Medium")
    .setBackground("#fff2cc")
    .setRanges([priorityRange])
    .build();
  var lowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Low")
    .setBackground("#d9ead3")
    .setRanges([priorityRange])
    .build();

  // Conditional formatting for Status
  var statusRange = sheet.getRange("F2:F1000");
  var completedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Completed")
    .setBackground("#d9ead3")
    .setRanges([statusRange])
    .build();
  var progressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("In Progress")
    .setBackground("#fff2cc")
    .setRanges([statusRange])
    .build();

  var rules = sheet.getConditionalFormatRules();
  rules.push(highRule, medRule, lowRule, completedRule, progressRule);
  sheet.setConditionalFormatRules(rules);

  // Summary section
  sheet.getRange("I1").setValue("Summary");
  sheet.getRange("I1").setFontWeight("bold");

  sheet.getRange("I2").setValue("Total Feedback:");
  sheet.getRange("J2").setFormula('=COUNTA(C2:C1000)');

  sheet.getRange("I3").setValue("Feature Requests:");
  sheet.getRange("J3").setFormula('=COUNTIF(C:C,"Feature Request")');

  sheet.getRange("I4").setValue("Bug Reports:");
  sheet.getRange("J4").setFormula('=COUNTIF(C:C,"Bug Report")');

  sheet.getRange("I5").setValue("High Priority:");
  sheet.getRange("J5").setFormula('=COUNTIF(E:E,"High")');

  sheet.getRange("I6").setValue("Completed:");
  sheet.getRange("J6").setFormula('=COUNTIF(F:F,"Completed")');

  // Column widths
  sheet.setColumnWidths(1, 7, 150);
  sheet.setColumnWidth(4, 300); // Feedback summary wider

  sheet.setFrozenRows(1);
}

// ============================================
// TAB 6: WEEKLY SUMMARY DASHBOARD
// ============================================
function createWeeklySummary(ss) {
  var sheet = ss.insertSheet("Weekly Summary", 5);

  // Title
  sheet.getRange("A1").setValue("📊 WEEK 1 MARKETING DASHBOARD");
  sheet.getRange("A1").setFontSize(16).setFontWeight("bold");

  // Week at a Glance
  sheet.getRange("A3").setValue("WEEK AT A GLANCE");
  sheet.getRange("A3").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");

  var metrics = [
    ["Metric", "Value"],
    ["Total Posts Published", "='Daily Posting Log'!K6"],
    ["Total Engagement", "='Engagement Metrics'!L2"],
    ["Total Site Visitors", "='Site Traffic'!K2"],
    ["Total Feedback Received", "='Feedback Submissions'!J2"],
    ["Comments Received", "='Comment Tracker'!K2"],
    ["Response Rate", "='Comment Tracker'!K4"],
    ["Feature Requests", "='Comment Tracker'!K6"]
  ];

  sheet.getRange("A4:B11").setValues(metrics);
  sheet.getRange("A4:B4").setFontWeight("bold").setBackground("#cfe2f3");
  sheet.getRange("B5:B11").setFontWeight("bold");

  // Goals vs Actual
  sheet.getRange("D3").setValue("GOALS PROGRESS");
  sheet.getRange("D3").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");

  var goals = [
    ["Goal", "Target", "Actual", "Status"],
    ["Site Visitors", 500, "='Site Traffic'!K2", ""],
    ["Feedback Submissions", 20, "='Feedback Submissions'!J2", ""],
    ["Total Posts", 30, "='Daily Posting Log'!K6", ""],
    ["Engagement", 200, "='Engagement Metrics'!L2", ""]
  ];

  sheet.getRange("D4:G8").setValues(goals);
  sheet.getRange("D4:G4").setFontWeight("bold").setBackground("#cfe2f3");

  // Status formulas
  sheet.getRange("G5").setFormula('=IF(F5>=E5,"✓ Met","✗ Not Met")');
  sheet.getRange("G6").setFormula('=IF(F6>=E6,"✓ Met","✗ Not Met")');
  sheet.getRange("G7").setFormula('=IF(F7>=E7,"✓ Met","✗ Not Met")');
  sheet.getRange("G8").setFormula('=IF(F8>=E8,"✓ Met","✗ Not Met")');

  // Platform breakdown
  sheet.getRange("A13").setValue("PLATFORM BREAKDOWN");
  sheet.getRange("A13").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");

  var platforms = [
    ["Platform", "Posts", "Engagement", "Traffic"],
    ["Reddit", "='Daily Posting Log'!K2", "='Engagement Metrics'!L6", "='Site Traffic'!K8"],
    ["Facebook", "='Daily Posting Log'!K3", "='Engagement Metrics'!L7", "='Site Traffic'!K9"],
    ["Quora", "='Daily Posting Log'!K4", "='Engagement Metrics'!L8", "='Site Traffic'!K10"]
  ];

  sheet.getRange("A14:D17").setValues(platforms);
  sheet.getRange("A14:D14").setFontWeight("bold").setBackground("#cfe2f3");

  // Quick Actions
  sheet.getRange("A19").setValue("QUICK ACTIONS");
  sheet.getRange("A19").setFontWeight("bold").setBackground("#4a86e8").setFontColor("white");

  var actions = [
    ["✓ Check 'Comment Tracker' for unanswered comments"],
    ["✓ Review 'Top Performing' tab to see what works"],
    ["✓ Update 'Site Traffic' with today's Google Analytics data"],
    ["✓ Check 'Action Items' tab for pending tasks"]
  ];

  sheet.getRange("A20:A23").setValues(actions);

  // Column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 80);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
}

// ============================================
// TAB 7: TOP PERFORMING CONTENT
// ============================================
function createTopPerforming(ss) {
  var sheet = ss.insertSheet("Top Performing", 6);

  // Headers
  sheet.getRange("A1").setValue("📈 TOP PERFORMING CONTENT");
  sheet.getRange("A1").setFontSize(14).setFontWeight("bold");

  sheet.getRange("A3").setValue("Instructions: Copy posts from 'Engagement Metrics' tab, paste here, and sort by Total Engagement");
  sheet.getRange("A3").setFontStyle("italic");

  var headers = [
    ["Rank", "Post Title", "Platform", "Community", "Total Engagement", "Site Clicks", "Conversion Rate"]
  ];
  sheet.getRange("A5:G5").setValues(headers);
  formatHeaders(sheet, "A5:G5");

  // Sample data
  var sampleData = [
    [1, "Built a free mosque directory...", "Reddit", "r/australia", 60, 78, "77%"],
    [2, "Sydney mosque finder tool", "Reddit", "r/sydney", 42, 56, "75%"],
    [3, "Find mosques across Australia", "Facebook", "Aus Muslim Community", 35, 45, "78%"]
  ];
  sheet.getRange("A6:G8").setValues(sampleData);

  // Highlight top 3
  sheet.getRange("A6:G6").setBackground("#ffd966"); // Gold
  sheet.getRange("A7:G7").setBackground("#d9d9d9"); // Silver
  sheet.getRange("A8:G8").setBackground("#f4cccc"); // Bronze

  // Column widths
  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidths(3, 5, 130);

  sheet.setFrozenRows(5);
}

// ============================================
// TAB 8: ACTION ITEMS
// ============================================
function createActionItems(ss) {
  var sheet = ss.insertSheet("Action Items", 7);

  // Headers
  var headers = [
    ["Priority", "Action Item", "Source", "Due Date", "Status", "Notes"]
  ];
  sheet.getRange("A1:F1").setValues(headers);
  formatHeaders(sheet, "A1:F1");

  // Sample data
  var today = new Date();
  var dueDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
  var sampleData = [
    ["High", "Add prayer times feature", "Reddit feedback", dueDate, "In Progress", "Researching APIs"],
    ["Medium", "Fix mobile menu bug", "Facebook comment", today, "Not Started", "User reported issue"],
    ["Low", "Add mosque photos", "Quora answer", dueDate, "Backlog", "Nice to have"]
  ];
  sheet.getRange("A2:F4").setValues(sampleData);

  // Data validation
  var priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['High', 'Medium', 'Low'], true)
    .build();
  sheet.getRange("A2:A1000").setDataValidation(priorityRule);

  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Not Started', 'In Progress', 'Completed', 'Blocked'], true)
    .build();
  sheet.getRange("E2:E1000").setDataValidation(statusRule);

  // Conditional formatting
  var priorityRange = sheet.getRange("A2:A1000");
  var highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("High")
    .setBackground("#f4cccc")
    .setRanges([priorityRange])
    .build();
  var medRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Medium")
    .setBackground("#fff2cc")
    .setRanges([priorityRange])
    .build();
  var lowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Low")
    .setBackground("#d9ead3")
    .setRanges([priorityRange])
    .build();

  var statusRange = sheet.getRange("E2:E1000");
  var completedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Completed")
    .setBackground("#d9ead3")
    .setRanges([statusRange])
    .build();
  var progressRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("In Progress")
    .setBackground("#fff2cc")
    .setRanges([statusRange])
    .build();
  var blockedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Blocked")
    .setBackground("#f4cccc")
    .setRanges([statusRange])
    .build();

  var rules = sheet.getConditionalFormatRules();
  rules.push(highRule, medRule, lowRule, completedRule, progressRule, blockedRule);
  sheet.setConditionalFormatRules(rules);

  // Column widths
  sheet.setColumnWidth(1, 80);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 250);

  sheet.setFrozenRows(1);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatHeaders(sheet, range) {
  var headerRange = sheet.getRange(range);
  headerRange.setBackground("#1a237e");
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
}
