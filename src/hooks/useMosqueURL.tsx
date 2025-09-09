import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

export const useMosqueURL = (mosque: Mosque | null, isOpen: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen && mosque) {
      // Update URL to include mosque ID for better SEO
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('mosque', mosque.id);
      const newURL = `${location.pathname}?${searchParams.toString()}`;
      
      // Update URL without triggering navigation
      window.history.replaceState({}, '', newURL);
    } else if (!isOpen) {
      // Remove mosque parameter when modal closes
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('mosque');
      const newURL = searchParams.toString() 
        ? `${location.pathname}?${searchParams.toString()}`
        : location.pathname;
      
      window.history.replaceState({}, '', newURL);
    }
  }, [isOpen, mosque, location.pathname, location.search]);

  return {
    getMosqueURL: (mosqueId: string) => `${location.pathname}?mosque=${mosqueId}`
  };
};