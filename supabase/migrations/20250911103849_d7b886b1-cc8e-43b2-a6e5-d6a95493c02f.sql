-- Update Holland Park Mosque with correct prayer times from website
UPDATE public.prayer_times 
SET 
  fajr_adhan = '04:33',
  fajr_iqamah = NULL,
  dhuhr_adhan = '11:45', 
  dhuhr_iqamah = NULL,
  asr_adhan = '15:59',
  asr_iqamah = NULL,
  maghrib_adhan = '17:39',
  maghrib_iqamah = NULL,
  isha_adhan = '18:52',
  isha_iqamah = NULL,
  jumah_times = NULL,
  updated_at = now()
WHERE mosque_id = 'ChIJqw6QwA9bkWsRSI-exvQ5R2I' 
  AND date = CURRENT_DATE;