import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface PrayerTime {
  id: string;
  mosque_id: string;
  date: string;
  fajr_adhan?: string | null;
  fajr_iqamah?: string | null;
  dhuhr_adhan?: string | null;
  dhuhr_iqamah?: string | null;
  asr_adhan?: string | null;
  asr_iqamah?: string | null;
  maghrib_adhan?: string | null;
  maghrib_iqamah?: string | null;
  isha_adhan?: string | null;
  isha_iqamah?: string | null;
  jumah_times?: any; // JSON field from database
  source_url?: string | null;
  scraped_at: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

interface PrayerTimesProps {
  mosqueId: string;
  mosqueName: string;
  mosqueWebsite?: string;
}

const PrayerTimes: React.FC<PrayerTimesProps> = ({ mosqueId, mosqueName, mosqueWebsite }) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPrayerTimes();
  }, [mosqueId]);

  const fetchPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('prayer_times')
        .select('*')
        .eq('mosque_id', mosqueId)
        .eq('is_current', true)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setPrayerTimes(data);
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError('Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  };

  const refreshPrayerTimes = async () => {
    if (!mosqueWebsite || updating) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await supabase.functions.invoke('scrape-prayer-times', {
        body: {
          mosqueId,
          website: mosqueWebsite
        }
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.success) {
        await fetchPrayerTimes();
      } else {
        throw new Error(response.data?.error || 'Failed to update prayer times');
      }
    } catch (err) {
      console.error('Error refreshing prayer times:', err);
      setError('Failed to refresh prayer times');
    } finally {
      setUpdating(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return 'N/A';
    
    try {
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const PrayerRow = ({ 
    label, 
    adhanTime, 
    iqamahTime 
  }: { 
    label: string; 
    adhanTime?: string; 
    iqamahTime?: string; 
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-golden-beige/30 last:border-b-0">
      <div className="font-body text-base font-semibold text-archway-black">
        {label}
      </div>
      <div className="text-right">
        <div className="font-body text-sm text-slate-blue">
          Adhan: <span className="font-semibold text-burnt-ochre">{formatTime(adhanTime)}</span>
        </div>
        {iqamahTime && (
          <div className="font-body text-sm text-slate-blue">
            Iqamah: <span className="font-semibold text-olive-green">{formatTime(iqamahTime)}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 bg-warm-ivory p-8 rounded-xl border-2 border-golden-beige/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burnt-ochre/15 flex items-center justify-center shadow-sm border border-golden-beige/60">
            <Clock className="w-5 h-5 text-burnt-ochre animate-pulse" />
          </div>
          <h3 className="font-elegant text-xl font-bold text-archway-black">Prayer Times</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-slate-blue mx-auto mb-3 animate-spin" />
          <p className="font-body text-base text-slate-blue">Loading prayer times...</p>
        </div>
      </div>
    );
  }

  if (error || !prayerTimes) {
    return (
      <div className="space-y-6 bg-warm-ivory p-8 rounded-xl border-2 border-golden-beige/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burnt-ochre/15 flex items-center justify-center shadow-sm border border-golden-beige/60">
            <Clock className="w-5 h-5 text-burnt-ochre" />
          </div>
          <h3 className="font-elegant text-xl font-bold text-archway-black">Prayer Times</h3>
        </div>
        
        <Alert className="bg-warm-ivory border-golden-beige/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-body text-base text-slate-blue">
            {error || 'Sorry, please contact the masjid directly for prayer times.'}
          </AlertDescription>
        </Alert>

        {mosqueWebsite && (
          <div className="text-center">
            <Button
              onClick={refreshPrayerTimes}
              disabled={updating}
              variant="outline"
              className="bg-burnt-ochre/10 border-burnt-ochre/50 hover:bg-burnt-ochre/20"
            >
              {updating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Try to fetch prayer times
            </Button>
          </div>
        )}
      </div>
    );
  }

  const currentDate = prayerTimes.date;
  const isCurrentDay = isToday(currentDate);

  return (
    <div className="space-y-6 bg-warm-ivory p-8 rounded-xl border-2 border-golden-beige/60 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-burnt-ochre/15 flex items-center justify-center shadow-sm border border-golden-beige/60">
            <Clock className="w-5 h-5 text-burnt-ochre" />
          </div>
          <h3 className="font-elegant text-xl font-bold text-archway-black">Prayer Times</h3>
        </div>
        
        {mosqueWebsite && (
          <Button
            onClick={refreshPrayerTimes}
            disabled={updating}
            size="sm"
            variant="outline"
            className="bg-burnt-ochre/10 border-burnt-ochre/50 hover:bg-burnt-ochre/20"
          >
            {updating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-3 p-4 bg-golden-beige/20 rounded-lg border border-golden-beige/50">
        <Calendar className="w-5 h-5 text-burnt-ochre" />
        <div>
          <p className="font-body text-sm text-slate-blue">Prayer times for</p>
          <p className="font-elegant text-lg font-semibold text-archway-black">
            {formatDate(currentDate)}
          </p>
          {!isCurrentDay && (
            <p className="font-body text-xs text-red-600 font-medium">
              ⚠️ Times may be outdated
            </p>
          )}
        </div>
      </div>

      <Separator className="bg-golden-beige/60 h-px" />

      {/* Prayer Times */}
      <div className="space-y-1">
        <PrayerRow 
          label="Fajr" 
          adhanTime={prayerTimes.fajr_adhan} 
          iqamahTime={prayerTimes.fajr_iqamah} 
        />
        <PrayerRow 
          label="Dhuhr" 
          adhanTime={prayerTimes.dhuhr_adhan} 
          iqamahTime={prayerTimes.dhuhr_iqamah} 
        />
        <PrayerRow 
          label="Asr" 
          adhanTime={prayerTimes.asr_adhan} 
          iqamahTime={prayerTimes.asr_iqamah} 
        />
        <PrayerRow 
          label="Maghrib" 
          adhanTime={prayerTimes.maghrib_adhan} 
          iqamahTime={prayerTimes.maghrib_iqamah} 
        />
        <PrayerRow 
          label="Isha" 
          adhanTime={prayerTimes.isha_adhan} 
          iqamahTime={prayerTimes.isha_iqamah} 
        />
      </div>

      {/* Jumah Times */}
      {prayerTimes.jumah_times && Array.isArray(prayerTimes.jumah_times) && prayerTimes.jumah_times.length > 0 && (
        <>
          <Separator className="bg-golden-beige/60 h-px" />
          <div className="space-y-3">
            <h4 className="font-elegant text-lg font-semibold text-archway-black">
              Jumu'ah (Friday Prayer)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prayerTimes.jumah_times.map((time: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-olive-green/10 rounded-lg border border-olive-green/30">
                  <Clock className="w-4 h-4 text-olive-green" />
                  <span className="font-body text-base font-semibold text-archway-black">
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Source Info */}
      {prayerTimes.source_url && (
        <div className="text-center pt-4 border-t border-golden-beige/30">
          <p className="font-body text-xs text-slate-blue">
            Last updated: {new Date(prayerTimes.scraped_at).toLocaleDateString('en-AU')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;