-- Create prayer_times table to store scraped prayer times
CREATE TABLE public.prayer_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mosque_id TEXT NOT NULL,
  date DATE NOT NULL,
  fajr_adhan TIME,
  fajr_iqamah TIME,
  dhuhr_adhan TIME,
  dhuhr_iqamah TIME,
  asr_adhan TIME,
  asr_iqamah TIME,
  maghrib_adhan TIME,
  maghrib_iqamah TIME,
  isha_adhan TIME,
  isha_iqamah TIME,
  jumah_times JSONB, -- Array of Friday prayer times
  source_url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mosque_id, date)
);

-- Enable RLS
ALTER TABLE public.prayer_times ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Prayer times are publicly readable" 
ON public.prayer_times 
FOR SELECT 
USING (true);

-- Prevent unauthorized writes
CREATE POLICY "Prevent public inserts to prayer_times" 
ON public.prayer_times 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Prevent public updates to prayer_times" 
ON public.prayer_times 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent public deletes to prayer_times" 
ON public.prayer_times 
FOR DELETE 
USING (false);

-- Create indexes for better performance
CREATE INDEX idx_prayer_times_mosque_date ON public.prayer_times(mosque_id, date);
CREATE INDEX idx_prayer_times_current ON public.prayer_times(is_current, date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_prayer_times_updated_at
BEFORE UPDATE ON public.prayer_times
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();