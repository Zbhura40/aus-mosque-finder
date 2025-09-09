import { useEffect } from 'react';
import { SEOUtils } from '@/lib/seo-utils';

interface Mosque {
  id: string;
  name: string;
  address: string;
  distance?: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export const useSEO = (type: 'landing' | 'mosque', mosque?: Mosque | null) => {
  useEffect(() => {
    if (type === 'landing') {
      const title = SEOUtils.generateLandingPageTitle();
      const description = SEOUtils.generateLandingPageMetaDescription();
      const url = window.location.href;
      
      SEOUtils.updateDocumentHead(title, description, url);
    } else if (type === 'mosque' && mosque) {
      const title = SEOUtils.generateMosquePageTitle(mosque);
      const description = SEOUtils.generateMosqueMetaDescription(mosque);
      const url = `${window.location.origin}/?mosque=${mosque.id}`;
      
      SEOUtils.updateDocumentHead(title, description, url);
    }
  }, [type, mosque]);
};