import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Globe, Mail, Star, Clock, ExternalLink, Image as ImageIcon } from "lucide-react";
import mosquePlaceholder from "@/assets/mosque-placeholder.jpg";

interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  email?: string;
  photoUrl?: string;
}

interface MosqueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mosque: Mosque | null;
}

const MosqueDetailsModal: React.FC<MosqueDetailsModalProps> = ({
  isOpen,
  onClose,
  mosque,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!mosque) return null;

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value, 
    isLink = false, 
    linkType = 'external' 
  }: { 
    icon: any, 
    label: string, 
    value: string | undefined,
    isLink?: boolean,
    linkType?: 'external' | 'tel' | 'mailto'
  }) => {
    if (!value) {
      return (
        <div className="flex items-start gap-4 py-3">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-body text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="font-body text-base text-muted-foreground">Not available</p>
          </div>
        </div>
      );
    }

    const getHref = () => {
      switch (linkType) {
        case 'tel': return `tel:${value}`;
        case 'mailto': return `mailto:${value}`;
        case 'external': return value.startsWith('http') ? value : `https://${value}`;
        default: return value;
      }
    };

    return (
      <div className="flex items-start gap-4 py-3">
        <div className="w-10 h-10 rounded-full bg-islamic-green/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-islamic-green" />
        </div>
        <div className="flex-1">
          <p className="font-body text-sm font-medium text-muted-foreground mb-1">{label}</p>
          {isLink ? (
            <a 
              href={getHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-base text-islamic-green hover:text-islamic-green-dark hover:underline transition-colors flex items-center gap-2"
            >
              {value}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="font-body text-base text-foreground">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="font-elegant text-2xl font-semibold text-islamic-navy flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-islamic-green/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-islamic-green" />
            </div>
            Mosque Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about the selected mosque including contact details and location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mosque Photo */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-muted">
            {mosque.photoUrl && !imageError ? (
              <img
                src={mosque.photoUrl}
                alt={`Photo of ${mosque.name}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-islamic-green/5 to-islamic-green/10">
                <img
                  src={mosquePlaceholder}
                  alt="Mosque placeholder"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                  <ImageIcon className="w-12 h-12 text-white/80 mb-2" />
                  <p className="text-white/80 font-body text-sm">Photo not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Mosque Name */}
          <div className="text-center py-4">
            <h2 className="font-elegant text-3xl font-bold text-islamic-navy leading-tight">
              {mosque.name}
            </h2>
            {(mosque.rating || mosque.isOpen !== undefined) && (
              <div className="flex items-center justify-center gap-4 mt-3">
                {mosque.rating && (
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-body text-sm font-medium text-amber-700">
                      {mosque.rating} rating
                    </span>
                  </div>
                )}
                {mosque.isOpen !== undefined && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    mosque.isOpen 
                      ? 'bg-islamic-green/15 text-islamic-green' 
                      : 'bg-red-50 text-red-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-body text-sm font-medium">
                      {mosque.isOpen ? 'Currently Open' : 'Currently Closed'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-2">
            <InfoRow 
              icon={MapPin} 
              label="Address" 
              value={mosque.address}
            />
            
            <InfoRow 
              icon={Phone} 
              label="Phone" 
              value={mosque.phone}
              isLink={true}
              linkType="tel"
            />
            
            <InfoRow 
              icon={Globe} 
              label="Website" 
              value={mosque.website}
              isLink={true}
              linkType="external"
            />
            
            <InfoRow 
              icon={Mail} 
              label="Email" 
              value={mosque.email}
              isLink={true}
              linkType="mailto"
            />
          </div>

          <Separator />

          {/* Distance Info */}
          <div className="bg-islamic-green/5 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-islamic-green/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-islamic-green" />
              </div>
              <div className="text-center">
                <p className="font-body text-sm text-muted-foreground">Distance from your location</p>
                <p className="font-elegant text-xl font-semibold text-islamic-green">
                  {mosque.distance}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button 
              onClick={onClose}
              className="w-full h-14 font-body text-lg font-medium bg-islamic-green hover:bg-islamic-green-dark text-white rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MosqueDetailsModal;