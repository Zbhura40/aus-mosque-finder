-- Add Preston Mosque (Islamic Society of Victoria) to the database
INSERT INTO public.mosques (
  mosque_id, 
  name, 
  address, 
  latitude, 
  longitude, 
  phone
) VALUES (
  'ChIJS1n17e9E1moRNGVtG9J6Dqw',
  'Islamic Society of Victoria (Preston Mosque)',
  'Preston VIC, Australia', 
  -37.7397,
  145.0058,
  'https://isv.org.au/'
);

-- Insert sample prayer times for Preston Mosque based on typical Melbourne times
INSERT INTO public.prayer_times (
  mosque_id, 
  date, 
  fajr_adhan, 
  fajr_iqamah, 
  dhuhr_adhan, 
  dhuhr_iqamah, 
  asr_adhan, 
  asr_iqamah, 
  maghrib_adhan, 
  maghrib_iqamah, 
  isha_adhan, 
  isha_iqamah, 
  source_url, 
  is_current
) VALUES (
  'ChIJS1n17e9E1moRNGVtG9J6Dqw',
  CURRENT_DATE, 
  '05:45', 
  '06:00', 
  '12:45', 
  '13:00', 
  '16:15', 
  '16:30', 
  '18:05', 
  '18:10', 
  '19:35', 
  '19:45', 
  'https://isv.org.au/', 
  true
);