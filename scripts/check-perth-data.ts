import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkPerthData() {
  const { data, error, count } = await supabase
    .from('mosques_cache')
    .select('id, name, google_rating, google_review_count, photos, reviews, facilities, opening_hours', { count: 'exact' })
    .eq('state', 'WA')
    .eq('is_active', true);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total WA Mosques: ${count || 0}`);
  console.log(`\nSample data for first mosque:`);
  if (data && data.length > 0) {
    const first = data[0];
    console.log('- Name:', first.name);
    console.log('- Has Rating:', !!first.google_rating);
    console.log('- Has Reviews:', first.reviews?.length || 0);
    console.log('- Has Photos:', first.photos?.length || 0);
    console.log('- Has Facilities:', first.facilities?.length || 0);
    console.log('- Has Opening Hours:', !!first.opening_hours);
  }

  // Count with data
  let withPhotos = 0;
  let withReviews = 0;
  let withFacilities = 0;
  let withRating = 0;

  data?.forEach(m => {
    if (m.photos?.length > 0) withPhotos++;
    if (m.reviews?.length > 0) withReviews++;
    if (m.facilities?.length > 0) withFacilities++;
    if (m.google_rating) withRating++;
  });

  console.log(`\nData completeness:`);
  console.log(`- With Photos: ${withPhotos}`);
  console.log(`- With Reviews: ${withReviews}`);
  console.log(`- With Facilities: ${withFacilities}`);
  console.log(`- With Rating: ${withRating}`);
}

checkPerthData();
