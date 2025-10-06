# Deploy Geocode Fix - Accurate Suburb Display

## What Was Fixed

The small text under the search box was showing **inaccurate suburb names**. For example:
- Typing "fairfield" showed wrong suburbs like "Rockville, QLD"
- The function was returning the first random match instead of the most relevant one

## Changes Made

Updated `supabase/functions/geocode-postcode/index.ts` to:
1. **Use `components=country:AU`** instead of appending " Australia" to search
2. **Prioritize locality results** (actual suburbs) over postal code results
3. **Better address parsing** that correctly extracts suburb and state names

## How to Deploy

### Option 1: Supabase Dashboard (Easiest - 2 minutes)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/project/mzqyswdfgimymxfhdyzw
   - Click "Edge Functions" in left sidebar

2. **Find `geocode-postcode` function**
   - Look for existing "geocode-postcode" in the list
   - Click on it to edit

3. **Update the code**
   - Delete all existing code
   - Copy the entire content from: `/supabase/functions/geocode-postcode/index.ts`
   - Paste into the editor
   - Click "Deploy" or "Save"

4. **Done!** The fix is now live

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase functions deploy geocode-postcode
```

## Testing After Deployment

1. Go to: https://findmymosque.org
2. Click "Enter Postcode or Suburb"
3. Type "fairfield" (or any suburb name)
4. Check the small text below the input box
5. It should now show the **correct suburb name with state** (e.g., "Fairfield, NSW")

## What Changed in the Code

**Before:**
```typescript
// Old code appended " Australia" which caused wrong results
const geocodeUrl = `...address=${postcode + ' Australia'}...`;
```

**After:**
```typescript
// New code uses components=country:AU for better accuracy
const geocodeUrl = `...address=${postcode}&components=country:AU...`;

// Plus, now prioritizes locality (suburb) results:
const localityResult = data.results.find(r =>
  r.types.includes('locality') || r.types.includes('sublocality')
);
```

## Important Note

This fix improves accuracy but still has limitations:
- **Duplicate suburb names** (like Fairfield NSW vs Fairfield QLD) will still show just the first match
- For **perfect accuracy with dropdown selection**, you'll need to deploy the autocomplete functions later (see `DEPLOY_AUTOCOMPLETE_FUNCTIONS.md`)

**Current fix:** Better than before, shows more accurate results
**Future fix (autocomplete):** Perfect accuracy with dropdown to choose exact suburb

## Troubleshooting

**Still showing wrong suburbs?**
- Clear browser cache (Ctrl+Shift+Delete)
- Make sure you deployed the updated function
- Check Supabase logs for any errors
- Verify `GOOGLE_PLACES_API_KEY` is set correctly

**"No results found" error?**
- The suburb name might be too vague
- Try adding more characters
- Or wait for autocomplete feature deployment

---

**Status:** ✅ Code is ready - Just needs deployment to Supabase
