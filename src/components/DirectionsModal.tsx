import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Loader } from '@googlemaps/js-api-loader';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosque: {
    id: string;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  userPostcode?: string;
}

const DirectionsModal = ({ 
  isOpen, 
  onClose, 
  mosque, 
  userLocation, 
  userPostcode 
}: DirectionsModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) {
      console.log('DirectionsModal: Not opening - isOpen:', isOpen, 'mapRef.current:', mapRef.current);
      return;
    }

    const initializeMap = async () => {
      try {
        console.log('DirectionsModal: Starting map initialization');
        setIsLoading(true);
        
        const loader = new Loader({
          apiKey: 'AIzaSyCZK5ztF6qOSQ_4kKW6fnLYloj0VqfuFdg',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        console.log('DirectionsModal: Loading Google Maps API');
        await loader.load();
        console.log('DirectionsModal: Google Maps API loaded successfully');

        const mapInstance = new google.maps.Map(mapRef.current!, {
          zoom: 13,
          center: { 
            lat: mosque.latitude || -27.4698, 
            lng: mosque.longitude || 153.0251 
          },
          styles: [
            {
              featureType: 'poi.place_of_worship',
              elementType: 'geometry',
              stylers: [{ color: '#10b981' }]
            },
            {
              featureType: 'poi.place_of_worship',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#10b981' }]
            }
          ]
        });

        console.log('DirectionsModal: Map instance created', mapInstance);

        const directionsServiceInstance = new google.maps.DirectionsService();
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#10b981',
            strokeWeight: 5,
            strokeOpacity: 0.8
          }
        });

        console.log('DirectionsModal: Directions service and renderer created');

        directionsRendererInstance.setMap(mapInstance);

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);

        console.log('DirectionsModal: Starting route calculation');
        // Calculate and display route
        await calculateRoute(directionsServiceInstance, directionsRendererInstance);
        
        console.log('DirectionsModal: Map initialization complete');
        setIsLoading(false);
      } catch (error) {
        console.error('DirectionsModal: Error initializing map:', error);
        toast({
          variant: 'destructive',
          title: 'Map Error',
          description: 'Failed to load Google Maps. Please check your connection and try again.'
        });
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [isOpen, mosque, userLocation, userPostcode]);

  const calculateRoute = async (
    directionsService: google.maps.DirectionsService,
    directionsRenderer: google.maps.DirectionsRenderer
  ) => {
    try {
      console.log('DirectionsModal: Starting route calculation with userLocation:', userLocation, 'userPostcode:', userPostcode);
      let origin: string | google.maps.LatLng;

      if (userLocation) {
        origin = new google.maps.LatLng(userLocation.latitude, userLocation.longitude);
        console.log('DirectionsModal: Using user location as origin:', origin);
      } else if (userPostcode) {
        origin = `${userPostcode}, Australia`;
        console.log('DirectionsModal: Using postcode as origin:', origin);
      } else {
        throw new Error('No origin location available');
      }

      const destination = mosque.latitude && mosque.longitude
        ? new google.maps.LatLng(mosque.latitude, mosque.longitude)
        : mosque.address;
      
      console.log('DirectionsModal: Destination:', destination);

      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        region: 'AU'
      };

      console.log('DirectionsModal: Making directions request:', request);
      const result = await directionsService.route(request);
      console.log('DirectionsModal: Directions result:', result);
      directionsRenderer.setDirections(result);

      // Add custom markers
      const route = result.routes[0];
      if (route) {
        // Origin marker
        new google.maps.Marker({
          position: route.legs[0].start_location,
          map: map,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });

        // Destination marker
        new google.maps.Marker({
          position: route.legs[0].end_location,
          map: map,
          title: mosque.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 40C16 40 32 24 32 16C32 7.163 24.837 0 16 0S0 7.163 0 16C0 24 16 40 16 40Z" fill="#10b981"/>
                <circle cx="16" cy="16" r="8" fill="white"/>
                <circle cx="16" cy="16" r="4" fill="#10b981"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40)
          }
        });
      }

    } catch (error) {
      console.error('DirectionsModal: Error calculating route:', error);
      toast({
        variant: 'destructive',
        title: 'Route Error',
        description: 'Unable to calculate route. Please try again.'
      });
    }
  };

  const openInGoogleMaps = () => {
    let origin: string;
    
    if (userLocation) {
      origin = `${userLocation.latitude},${userLocation.longitude}`;
    } else if (userPostcode) {
      origin = encodeURIComponent(`${userPostcode}, Australia`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Location Error',
        description: 'No origin location available'
      });
      return;
    }

    const destination = mosque.latitude && mosque.longitude
      ? `${mosque.latitude},${mosque.longitude}`
      : encodeURIComponent(mosque.address);

    const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation Error',
        description: 'Geolocation is not supported by this browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        if (directionsService && directionsRenderer) {
          calculateRoute(directionsService, directionsRenderer);
        }
        
        toast({
          title: 'Location Updated',
          description: 'Route updated with your current location'
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          variant: 'destructive',
          title: 'Location Error',  
          description: 'Unable to get your current location. Please check permissions.'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-islamic-green/10 to-islamic-navy/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-islamic-green/20 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-islamic-green" />
              </div>
              <div>
                <DialogTitle className="font-elegant text-2xl text-islamic-navy">
                  Directions to {mosque.name}
                </DialogTitle>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {mosque.address}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-islamic-green mx-auto mb-3" />
                <p className="font-body text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full" />
          
          <div className="absolute bottom-4 left-4 right-4 flex gap-3 justify-center">
            <Button
              onClick={getCurrentLocation}
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-islamic-green text-islamic-green hover:bg-islamic-green/10 font-body"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Update Location
            </Button>
            
            <Button
              onClick={openInGoogleMaps}
              className="bg-islamic-green hover:bg-islamic-green-dark text-white font-body"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Open in Google Maps
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectionsModal;