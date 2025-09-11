import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, 
  Car, 
  Wifi, 
  Baby, 
  Users, 
  Coffee, 
  Utensils,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface ProcessedFacilities {
  accessibility: {
    wheelchairAccessible: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
    wheelchairAccessibleParking?: boolean;
  };
  parking: {
    available: boolean;
    types: string[];
    free?: boolean;
    paid?: boolean;
  };
  amenities: {
    restrooms: boolean;
    wifi?: boolean;
    childrenWelcome?: boolean;
    womensPrayerArea?: boolean;
    communityHall?: boolean;
    halalFood?: boolean;
    cafe?: boolean;
    playArea?: boolean;
  };
  services: {
    takeout?: boolean;
    delivery?: boolean;
    dineIn?: boolean;
    reservations?: boolean;
  };
  payment: {
    acceptsCash?: boolean;
    acceptsCards?: boolean;
    acceptsContactless?: boolean;
  };
  googlePlaceTypes: string[];
  lastUpdated: string;
  dataSource: 'google_places_api';
}

interface MosqueFacilitiesProps {
  facilities: ProcessedFacilities | null;
  mosqueName: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const MosqueFacilities: React.FC<MosqueFacilitiesProps> = ({ 
  facilities, 
  mosqueName, 
  onRefresh,
  isLoading = false 
}) => {
  if (!facilities) {
    return (
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Facilities & Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Sorry, full amenities details are not available for this mosque. 
              Please contact the masjid directly for more information.
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="mt-3 text-xs text-primary hover:underline disabled:opacity-50"
            >
              {isLoading ? 'Checking for updates...' : 'Try to fetch amenities'}
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Updated today';
    if (diffInDays === 1) return 'Updated yesterday';
    if (diffInDays < 7) return `Updated ${diffInDays} days ago`;
    if (diffInDays < 30) return `Updated ${Math.floor(diffInDays / 7)} weeks ago`;
    return `Updated ${Math.floor(diffInDays / 30)} months ago`;
  };

  const AccessibilitySection = () => (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Accessibility className="h-4 w-4" />
        Accessibility
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          {facilities.accessibility.wheelchairAccessible ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <X className="h-3 w-3 text-red-600" />
          )}
          <span className={facilities.accessibility.wheelchairAccessible ? 'text-green-700' : 'text-muted-foreground'}>
            Wheelchair Accessible
          </span>
        </div>
        {facilities.accessibility.wheelchairAccessibleEntrance !== undefined && (
          <div className="flex items-center gap-2">
            {facilities.accessibility.wheelchairAccessibleEntrance ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <X className="h-3 w-3 text-red-600" />
            )}
            <span className={facilities.accessibility.wheelchairAccessibleEntrance ? 'text-green-700' : 'text-muted-foreground'}>
              Accessible Entrance
            </span>
          </div>
        )}
        {facilities.accessibility.wheelchairAccessibleRestroom !== undefined && (
          <div className="flex items-center gap-2">
            {facilities.accessibility.wheelchairAccessibleRestroom ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <X className="h-3 w-3 text-red-600" />
            )}
            <span className={facilities.accessibility.wheelchairAccessibleRestroom ? 'text-green-700' : 'text-muted-foreground'}>
              Accessible Restroom
            </span>
          </div>
        )}
        {facilities.accessibility.wheelchairAccessibleParking !== undefined && (
          <div className="flex items-center gap-2">
            {facilities.accessibility.wheelchairAccessibleParking ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <X className="h-3 w-3 text-red-600" />
            )}
            <span className={facilities.accessibility.wheelchairAccessibleParking ? 'text-green-700' : 'text-muted-foreground'}>
              Accessible Parking
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const ParkingSection = () => (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Car className="h-4 w-4" />
        Parking
      </h4>
      {facilities.parking.available ? (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {facilities.parking.types.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            {facilities.parking.free && <span>Free options available</span>}
            {facilities.parking.free && facilities.parking.paid && <span>•</span>}
            {facilities.parking.paid && <span>Paid options available</span>}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No parking information available</p>
      )}
    </div>
  );

  const AmenitiesSection = () => (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Users className="h-4 w-4" />
        Amenities
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          {facilities.amenities.restrooms ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <X className="h-3 w-3 text-red-600" />
          )}
          <span className={facilities.amenities.restrooms ? 'text-green-700' : 'text-muted-foreground'}>
            Restroom Facilities
          </span>
        </div>
        
        {facilities.amenities.wifi !== undefined && (
          <div className="flex items-center gap-2">
            <Wifi className="h-3 w-3" />
            {facilities.amenities.wifi ? (
              <span className="text-green-700">WiFi Available</span>
            ) : (
              <span className="text-muted-foreground">No WiFi</span>
            )}
          </div>
        )}
        
        {facilities.amenities.childrenWelcome !== undefined && (
          <div className="flex items-center gap-2">
            <Baby className="h-3 w-3" />
            {facilities.amenities.childrenWelcome ? (
              <span className="text-green-700">Children Welcome</span>
            ) : (
              <span className="text-muted-foreground">Children Policy Unknown</span>
            )}
          </div>
        )}
        
        {facilities.amenities.womensPrayerArea && (
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-green-600" />
            <span className="text-green-700">Women's Prayer Area</span>
          </div>
        )}
        
        {facilities.amenities.communityHall && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-green-600" />
            <span className="text-green-700">Community Hall</span>
          </div>
        )}
        
        {facilities.amenities.halalFood && (
          <div className="flex items-center gap-2">
            <Utensils className="h-3 w-3 text-green-600" />
            <span className="text-green-700">Halal Food Available</span>
          </div>
        )}
        
        {facilities.amenities.cafe && (
          <div className="flex items-center gap-2">
            <Coffee className="h-3 w-3 text-green-600" />
            <span className="text-green-700">Café/Food Service</span>
          </div>
        )}
        
        {facilities.amenities.playArea && (
          <div className="flex items-center gap-2">
            <Baby className="h-3 w-3 text-green-600" />
            <span className="text-green-700">Children's Play Area</span>
          </div>
        )}
      </div>
    </div>
  );

  const PaymentSection = () => {
    const hasPaymentInfo = facilities.payment.acceptsCash !== undefined || 
                          facilities.payment.acceptsCards !== undefined || 
                          facilities.payment.acceptsContactless !== undefined;
    
    if (!hasPaymentInfo) return null;

    return (
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Options
        </h4>
        <div className="flex flex-wrap gap-2">
          {facilities.payment.acceptsCash && (
            <Badge variant="outline" className="text-xs">Cash</Badge>
          )}
          {facilities.payment.acceptsCards && (
            <Badge variant="outline" className="text-xs">Cards</Badge>
          )}
          {facilities.payment.acceptsContactless && (
            <Badge variant="outline" className="text-xs">Contactless</Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Facilities & Amenities
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatLastUpdated(facilities.lastUpdated)}
            </Badge>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Refresh'}
              </button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AccessibilitySection />
        <ParkingSection />
        <AmenitiesSection />
        <PaymentSection />
        
        {facilities.googlePlaceTypes.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Google Place Categories:</p>
            <div className="flex flex-wrap gap-1">
              {facilities.googlePlaceTypes.slice(0, 5).map((type, index) => (
                <Badge key={index} variant="outline" className="text-xs capitalize">
                  {type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Data sourced from Google Places API • Verified amenities and accessibility information
          </p>
        </div>
      </CardContent>
    </Card>
  );
};