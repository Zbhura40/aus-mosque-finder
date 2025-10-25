# Apify Email Extraction Plan

> **Goal:** Extract email addresses for 337 mosques using Apify's Google Maps Email Extractor
> **Actor:** lukaskrivka/google-maps-with-contact-details
> **Budget:** Using existing Apify membership
> **Timeline:** 1-2 hours for full extraction

---

## Plan Overview

### Phase 1: Preparation (15 minutes)
1. ✅ Verify Apify API token works
2. ✅ Export all Google Place IDs from marketing_prospects table
3. ✅ Create Apify API integration script
4. ✅ Test with 5 mosques first

### Phase 2: Small Test Run (10 minutes)
1. Run extraction for 5 mosques
2. Verify email extraction works
3. Check data quality
4. Estimate total cost/credits

### Phase 3: Full Extraction (30-60 minutes)
1. Run extraction for all 337 mosques
2. Monitor progress
3. Handle any errors

### Phase 4: Database Update (15 minutes)
1. Parse Apify results
2. Update marketing_prospects table with emails
3. Mark extraction status

---

## Technical Details

### Input Format for Place IDs

According to Apify documentation, you can use Place IDs directly:

```json
{
  "searchStringsArray": [
    "place_id:ChIJ8_JBApXMDUcRDzXcYUPTGUY",
    "place_id:ChIJN1t_tDeuEmsRUsoyG83frY4"
  ],
  "maxCrawledPlacesPerSearch": 1
}
```

### Expected Output Fields

The actor should return:
- `email` - Primary email address
- `phone` - Phone number
- `website` - Website URL
- `title` - Business name
- `placeId` - Google Place ID
- Additional social media contacts

---

## Cost Estimation

**Pricing:** ~$9 per 1,000 results (with subscription)
**Our needs:** 337 mosques
**Estimated cost:** ~$3-4 worth of credits
**Time:** ~30-60 minutes total

---

## Step-by-Step Execution

### Step 1: Get Place IDs from Database
```typescript
// Export all Place IDs to JSON file
const placeIds = await supabase
  .from('marketing_prospects')
  .select('id, name, google_place_id, state')
  .not('google_place_id', 'is', null);
```

### Step 2: Format for Apify Input
```typescript
const searchStrings = placeIds.map(m => `place_id:${m.google_place_id}`);

const apifyInput = {
  searchStringsArray: searchStrings,
  maxCrawledPlacesPerSearch: 1,
  language: "en",
  includeWebsiteEmails: true, // Scrape website for emails if available
  includeEmails: true
};
```

### Step 3: Call Apify API
```typescript
// Start the actor
const run = await apifyClient.actor('lukaskrivka/google-maps-with-contact-details')
  .call(apifyInput);

// Wait for completion
await apifyClient.run(run.id).waitForFinish();

// Get results
const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
```

### Step 4: Update Database
```typescript
// Update marketing_prospects with extracted emails
for (const result of items) {
  if (result.email) {
    await supabase
      .from('marketing_prospects')
      .update({
        email_primary: result.email,
        extraction_status: 'success',
        last_extraction_attempt: new Date()
      })
      .eq('google_place_id', result.placeId);
  }
}
```

---

## Risk Mitigation

### Batch Processing
- Start with 5 mosques (test batch)
- Then run 50 mosques (small batch)
- Finally run remaining 282 mosques (full batch)

### Error Handling
- Log failed extractions
- Retry failed place IDs separately
- Track extraction attempts in database

### Cost Control
- Check Apify credits before starting
- Monitor costs during extraction
- Stop if costs exceed budget

---

## Alternative: Enrich Existing Data

If the email extractor is expensive, consider:

**Option A:** Use `compass/enrich-google-maps-dataset-with-contacts`
- Takes existing Google Maps data as input
- Enriches with contact details including emails
- May be cheaper than full scraper

**Option B:** Use website scraping for 211 websites
- Custom Puppeteer script (already built)
- $0 cost but slower
- Extract emails directly from mosque websites

---

## Success Metrics

**Minimum Success:**
- Extract emails for 100+ mosques (30% success rate)
- Cost under $10
- No API errors

**Strong Success:**
- Extract emails for 200+ mosques (60% success rate)
- Cost under $5
- Clean, verified email addresses

---

## Next Steps

1. ✅ Get approval from you to proceed
2. ✅ Create Apify integration script
3. ✅ Run test with 5 mosques
4. ✅ Review results and costs
5. ✅ Run full extraction if test successful
6. ✅ Update database with results

---

**Ready to proceed?** Let me know and I'll build the script!
