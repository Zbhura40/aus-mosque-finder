# Deploying Autocomplete Functions to Supabase

## What We Fixed

The autocomplete feature on the homepage had 3 issues:
1. **Wrong results** - Searching for "Fairfield" showed "Rockville, QLD"
2. **No duplicate handling** - Didn't distinguish between "Fairfield, NSW" and "Fairfield, QLD"
3. **No dropdown options** - Users couldn't see suggestions while typing

## What's Changed

### New Files Created:
1. `supabase/functions/autocomplete-suburb/index.ts` - Gets suburb suggestions from Google Places
2. `supabase/functions/geocode-place/index.ts` - Converts place_id to coordinates
3. Updated `src/components/MosqueLocator.tsx` - Fixed autocomplete logic

### How It Works Now:
- User types 2+ characters → Shows dropdown with Australian suburbs
- Each suggestion shows full location (e.g., "Fairfield NSW, Australia" and "Fairfield QLD, Australia")
- User clicks a suggestion → Gets accurate coordinates for that exact location
- Search finds mosques near the correct location

## Deployment Steps

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/project/mzqyswdfgimymxfhdyzw
   - Navigate to "Edge Functions" in the left sidebar

2. **Deploy autocomplete-suburb function**
   - Click "New Function"
   - Name: `autocomplete-suburb`
   - Copy content from: `/supabase/functions/autocomplete-suburb/index.ts`
   - Paste into editor
   - Click "Deploy"

3. **Deploy geocode-place function**
   - Click "New Function"
   - Name: `geocode-place`
   - Copy content from: `/supabase/functions/geocode-place/index.ts`
   - Paste into editor
   - Click "Deploy"

4. **Add Environment Variable**
   - Go to "Settings" → "Edge Functions"
   - Add new secret:
     - Name: `GOOGLE_MAPS_API_KEY`
     - Value: Your Google Maps API key (the same one used for mosque search)

### Option 2: Using Supabase CLI (For Advanced Users)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref mzqyswdfgimymxfhdyzw

# Deploy the functions
supabase functions deploy autocomplete-suburb
supabase functions deploy geocode-place

# Set the API key secret
supabase secrets set GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Option 3: Ask Your Developer

If you're not comfortable with the above steps, you can ask someone with Supabase access to:
1. Deploy the two new Edge Functions
2. Ensure the `GOOGLE_MAPS_API_KEY` environment variable is set

## Testing After Deployment

1. **Go to homepage**: https://findmymosque.org
2. **Click**: "Enter Postcode or Suburb"
3. **Type**: "fair" (2+ characters)
4. **You should see**: A dropdown with suburbs like:
   - Fairfield NSW, Australia
   - Fairfield QLD, Australia
   - Fairfield VIC, Australia
5. **Click one**: Input fills with your selection
6. **Click "Find Mosques"**: Should search the correct location

## Troubleshooting

### Dropdown doesn't appear:
- Check browser console (F12) for errors
- Verify functions are deployed in Supabase dashboard
- Check `GOOGLE_MAPS_API_KEY` is set correctly

### Wrong locations still showing:
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito/private browsing mode
- Check that you deployed the updated MosqueLocator.tsx component

### "Unable to find location" error:
- Verify `GOOGLE_MAPS_API_KEY` is set in Supabase Edge Functions settings
- Check API key has "Places API (New)" enabled in Google Cloud Console
- Check API key restrictions aren't blocking Supabase

## Cost Estimate

**Google Places API costs:**
- Autocomplete: $2.83 per 1000 requests
- Place Details: $17 per 1000 requests

**Estimated monthly cost:**
- 100 searches/day = ~3000/month
- Autocomplete: 3000 × $0.00283 = **$8.49**
- Place Details: 3000 × $0.017 = **$51**
- **Total: ~$60/month** for 100 daily searches

To reduce costs:
- Google Cloud offers $200 free credit for new users
- First 1000 autocomplete requests/month are often free

## Security Notes

✅ **Secure Implementation:**
- API key stored in Supabase (server-side) - never exposed to users
- Functions verify requests come from your domain
- No client-side API key exposure

## Files Modified

- ✅ `supabase/functions/autocomplete-suburb/index.ts` (new)
- ✅ `supabase/functions/geocode-place/index.ts` (new)
- ✅ `src/components/MosqueLocator.tsx` (updated)
- ✅ `supabase/config.toml` (added new functions)

## Next Steps

1. Deploy the two functions using one of the options above
2. Test the autocomplete on the live site
3. Monitor usage in Google Cloud Console
4. Adjust as needed based on user feedback

---

**Need Help?** Check the Supabase docs: https://supabase.com/docs/guides/functions
