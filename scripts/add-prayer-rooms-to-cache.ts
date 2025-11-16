import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// Place IDs to approve
const approvedPlaceIds = new Set([
  // 39 auto-approved (34 high + 5 medium confidence)
  'ChIJwUkaaw1bkWsRn0soKq2Xjpw', // Brisbane CBD Musallah
  'ChIJNcf0ahBakWsRgBhhLu0Q4ek', // QUT Muslim Prayer Room
  'ChIJd_y2EPSuEmsRGgcZlheW6bw', // North Sydney Musalla
  'ChIJ1ZPqstJC1moRx8iRGftqsE4', // Musalla - University of Melbourne Islamic Society
  'ChIJbR_8stJC1moRJdx8IdLrlFI', // University Of Melbourne Musalla (Prayer Rooms)
  'ChIJGSHufRiuEmsRavr31pUVh5s', // King Faisal Mosque
  'ChIJlWBQegBr1moRRckS-rQ55z8', // Monash Musallah Krongold
  'ChIJU-AcI_CkMioRlmQ7vrRTIBw', // UWA Mosque/ UWA Musalla
  'ChIJLbD9PhBakWsRO8Hok0cvIyY', // QUT Musalla
  'ChIJpTpyTkeuEmsRyk375nNkMEI', // Sydney CBD Masjid
  'ChIJhWXdXzFd1moRxkzrWzOG2iE', // Queen St Musallah (Mosque)
  'ChIJO5_fFKmP1moRXM8s9aT7ofk', // Melbourne Grand Mosque
  'ChIJ4VyDNxgU1moRXsNUnaWHMc8', // Emir Sultan Mosque (ICMG Dandenong)
  'ChIJ-W4FiuxB1moRbQfY128FDgA', // Deakin Muslim Prayer Hall
  'ChIJXVafHmf11moR3Mwkfrgf8j4', // Australian Bosnian Islamic Centre Deer Park
  'ChIJYYGN7oVa1moRUXzkO7ut9z8', // MyCentre Mosque
  'ChIJ1RGMIjBD1moRtqq3d6c57ig', // Albanian Australian Islamic Society
  'ChIJBzhct-Zd1moRTon-mcOnwrQ', // Maidstone Mosque
  'ChIJl-kSM6RE1moR82y0Z0sPwvc', // Coburg Islamic Centre (CIC)
  'ChIJFfupdgCvEmsRvTbh0G2xw0Q', // Castlereagh & Park St Musalla
  'ChIJIQ3KW7mVEmsRhlaSuTRVMIc', // MIA - Liverpool Islamic Centre
  'ChIJ-xGi1K6UEmsRzKuHXJU89MQ', // The Australian Islamic House Masjid
  'ChIJN43uGtS_EmsRwHUX3KqpKA0', // Daar Ibn Abbas Mosque
  'ChIJ-SGyXTG7EmsRT3CMD8ZEXGQ', // Darul Ulum Sydney Mosque
  'ChIJ2akzEbq8EmsR2Itc15gCjXs', // AICC, Omar Mosque - Auburn
  'ChIJ58DB8b67EmsRvaX8zYy47x8', // Lakemba Mosque
  'ChIJfRWUobC8EmsR_xkFJM0KTC4', // Auburn Islamic Community Centre & Mosque
  'ChIJgdAAeOa8EmsR6WGouBgKkJ8', // Masjid Al Noor
  'ChIJS8UyQ8GxEmsR2_oD3qg0Oco', // Zetland Mosque
  'ChIJZ9ttCeSnEmsRnd97QV8478M', // Epping Musallah & Quran Academy
  'ChIJ-avAtY2wEmsRuazetscn-uo', // Al Hijrah Mosque
  'ChIJ9YiysvevEmsR8Gtm11g6f84', // Harrington Mosque (Mushalla)
  'ChIJU34zbLth1moRcn9t8o-SdV4', // Australian Islamic Centre
  'ChIJS1n17e9E1moRNGVtG9J6Dqw', // Omar Bin Al Khattab Masjid Preston
  'ChIJwbfZEh9ZkWsRYrbtS_P-iUQ', // Prayer Room (BNE International Terminal)
  'ChIJYdQaJABZ1moRdK5WyYJP63s', // Prayer Room (Melbourne Airport)
  'ChIJnYvBcHhakWsRYi1sZZC-XgQ', // Multi-faith Chaplaincy (Building 38), UQ
  'ChIJ32lPqgi7EmsRRjzcSO36iec', // Canterbury Hospital Prayer Room
  'ChIJTTRvE3Jd1moRIRjCkYjdWws', // Royal Melbourne Hospital Prayer Room

  // 6 manually approved from "needs review"
  'ChIJd5XKtcKxEmsRFV78z2_ffPM', // Prayer Room (with Jumu'ah Prayer) - Sydney Airport
  'ChIJwZEaDxK5MioRlnM9wvvV_Ow', // Quiet Room - Perth Airport
  'ChIJzyD96yRNFmsRIZjnBgVN3eA', // AL-INAYA PRAYER ROOM FOR SISTERS
  'ChIJu-wHrAkFkWsRigdNS89bTgY', // Prayer Place Ground Floor
  'ChIJxW6TlEhd1moRWsU2crcvzXQ', // Islamic Council of Victoria (ICV)
  'ChIJV_Usudhb1moRUOq3m14sOxs', // Tullamarine Public Hall (Jumua'h only)

  // 18 from unclear list (recommended approve #11, #16-28)
  'ChIJtfNEJtNakWsR2HR0dxXBwyU', // Multi Faith Centre (N35) - Griffith
  'ChIJI_ADDxho1moRZJA38iQQ9xk', // The Alfred Spiritual Care
  'ChIJgYmE0g1d1moRcJF_hir3IMc', // MCEC Prayer Room
  'ChIJ10muOCZd1moRhuFqowBUbF0', // Prayer Room - Southern Cross Station
  'ChIJd-1cIVMR1moRwwoKTwJaQ6Q', // PGCC
  'ChIJ-_oYIrJC1moRQh_iqGoc-k4', // Melbourne Madinah
  'ChIJ7Zv6gWE41moR_pfsiGAgx34', // UMMA Centre
  'ChIJKVbLIXy6EmsRk7L9DT3K5Es', // IHIC
  'ChIJL4pkVbi-EmsRiO48W9DQqfw', // UMA CENTRE LIMITED
  'ChIJkXR7L_juEmsRIXL4vSrw_ZU', // Daar ibn Umar
  'ChIJKYkdUHbrEmsRlYBkZ7VdxEU', // Australian Muslim Welfare Centre
  'ChIJRSo6CyJd1moR0lfy0Cdijgs', // Australian Muslim Social Services Agency
]);

async function addPrayerRoomsToCache() {
  console.log('\n📥 ADDING PRAYER ROOMS TO MOSQUES CACHE\n');
  console.log('='.repeat(80));

  const data = JSON.parse(fs.readFileSync('docs/prayer-rooms-search-results.json', 'utf-8'));

  // Combine approved and needsReview
  const allPlaces = [...data.approved, ...data.needsReview];

  // Filter to only approved place IDs
  const placesToAdd = allPlaces.filter(p => approvedPlaceIds.has(p.place_id));

  console.log(`\n✅ Found ${placesToAdd.length} approved places to add\n`);

  // Check which ones are already in the database
  const { data: existingPlaces, error: fetchError } = await supabase
    .from('mosques_cache')
    .select('google_place_id')
    .in('google_place_id', placesToAdd.map(p => p.place_id));

  if (fetchError) {
    console.error('❌ Error checking existing places:', fetchError);
    return;
  }

  const existingPlaceIds = new Set(existingPlaces?.map(p => p.google_place_id) || []);
  const newPlaces = placesToAdd.filter(p => !existingPlaceIds.has(p.place_id));

  console.log(`📊 Status:`);
  console.log(`   Already in database: ${existingPlaceIds.size}`);
  console.log(`   New places to add: ${newPlaces.length}\n`);

  if (newPlaces.length === 0) {
    console.log('✅ All approved places are already in the database!\n');
    return;
  }

  // Helper function to extract state from address
  function extractState(address: string): string {
    const stateMatch = address.match(/\b(NSW|VIC|QLD|WA|SA|ACT|NT|TAS)\b/);
    return stateMatch ? stateMatch[1] : 'UNKNOWN';
  }

  // Helper function to extract suburb from address
  function extractSuburb(address: string): string {
    // Format: "123 Street Name, Suburb STATE 1234"
    const parts = address.split(',');
    if (parts.length >= 2) {
      // Get the second-to-last part (suburb is usually before state)
      const suburbPart = parts[parts.length - 2].trim();
      // Remove numbers at the end (postcodes)
      return suburbPart.replace(/\s+\d{4}$/, '').trim();
    }
    return address.split(',')[0]?.trim() || 'UNKNOWN';
  }

  // Prepare records for insertion
  const records = newPlaces.map(place => ({
    google_place_id: place.place_id,
    name: place.name,
    address: place.address,
    suburb: extractSuburb(place.address),
    state: extractState(place.address),
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    google_rating: place.rating || null,
    google_review_count: place.user_rating_count || null,
    phone_number: place.phone || null,
    website: place.website || null,
    opening_hours: null, // Will be filled by manual refresh
    last_fetched_from_google: new Date().toISOString(),
  }));

  console.log('🔄 Inserting new places into mosques_cache...\n');

  // Insert in batches of 50
  const batchSize = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error } = await supabase
      .from('mosques_cache')
      .insert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      errors += batch.length;
    } else {
      inserted += batch.length;
      console.log(`✅ Batch ${i / batchSize + 1}: Inserted ${batch.length} places`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 FINAL RESULTS:\n');
  console.log(`✅ Successfully inserted: ${inserted} places`);
  console.log(`❌ Failed to insert: ${errors} places`);
  console.log(`📍 Total approved: ${approvedPlaceIds.size} places`);
  console.log(`🗄️  Already existed: ${existingPlaceIds.size} places`);

  // Show breakdown by category
  console.log('\n📋 BREAKDOWN BY CATEGORY:\n');
  const categories = {
    mosque: newPlaces.filter(p => data.approved.find(a => a.place_id === p.place_id)?.category === 'mosque').length,
    prayer_room: newPlaces.filter(p => data.approved.find(a => a.place_id === p.place_id)?.category === 'prayer_room').length,
    islamic_center: newPlaces.filter(p => data.approved.find(a => a.place_id === p.place_id)?.category === 'islamic_center').length,
    unclear: newPlaces.filter(p => data.needsReview.find(n => n.place_id === p.place_id)).length,
  };

  console.log(`   Mosques: ${categories.mosque}`);
  console.log(`   Prayer Rooms: ${categories.prayer_room}`);
  console.log(`   Islamic Centers: ${categories.islamic_center}`);
  console.log(`   Other: ${categories.unclear}`);

  console.log('\n✅ Done!\n');
  console.log('💡 Next step: Run manual cache refresh to get full details (opening hours, etc.)\n');
}

addPrayerRoomsToCache().catch(console.error);
