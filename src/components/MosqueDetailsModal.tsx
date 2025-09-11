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
import { MapPin, Phone, Globe, Star, Clock, ExternalLink, Image as ImageIcon, Users } from "lucide-react";
import mosquePlaceholder from "@/assets/mosque-placeholder.jpg";
import { generateMosqueSchema } from "@/lib/json-ld-schema";
import { useJsonLdSchema } from "@/hooks/useJsonLdSchema";
import { SEOUtils } from "@/lib/seo-utils";
import { useSEO } from "@/hooks/useSEO";
import { useMosqueURL } from "@/hooks/useMosqueURL";

interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
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

  // SEO, URL management and JSON-LD schema for the mosque when modal is open
  useSEO('mosque', mosque && isOpen ? mosque : null);
  useMosqueURL(mosque, isOpen);
  const mosqueSchema = mosque && isOpen ? generateMosqueSchema(mosque, window.location.href) : null;
  useJsonLdSchema(mosqueSchema);

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
        <div className="flex items-start gap-4 py-4">
          <div className="w-12 h-12 rounded-full bg-stone-grey/15 flex items-center justify-center border border-golden-beige/40">
            <Icon className="w-6 h-6 text-slate-blue" />
          </div>
          <div className="flex-1">
            <p className="font-body text-base font-semibold text-archway-black mb-2">{label}</p>
            <p className="font-body text-lg text-slate-blue">Not available</p>
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
      <div className="flex items-start gap-4 py-4">
        <div className="w-12 h-12 rounded-full bg-burnt-ochre/15 flex items-center justify-center border border-golden-beige/50">
          <Icon className="w-6 h-6 text-burnt-ochre" />
        </div>
        <div className="flex-1">
          <p className="font-body text-base font-semibold text-archway-black mb-2">{label}</p>
          {isLink ? (
            <a 
              href={getHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-lg text-olive-green hover:text-olive-green/80 hover:underline transition-colors flex items-center gap-2"
            >
              {value}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="font-body text-lg text-slate-blue">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-warm-ivory backdrop-blur-sm border-2 border-golden-beige/60 shadow-2xl">
        <DialogHeader className="pb-8">
          <DialogTitle className="font-elegant text-3xl font-bold text-archway-black flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-burnt-ochre/20 flex items-center justify-center shadow-lg border-2 border-golden-beige/60">
              <MapPin className="w-7 h-7 text-burnt-ochre" />
            </div>
            Mosque Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about the selected mosque including contact details and location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Mosque Photo */}
          <div className="relative w-full h-72 rounded-xl overflow-hidden bg-warm-ivory border-2 border-golden-beige/40 shadow-lg">
            {mosque.photoUrl && !imageError ? (
              <img
                src={mosque.photoUrl}
                alt={SEOUtils.generateImageAltText(mosque, 'exterior')}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-warm-ivory to-golden-beige/20">
                  <img
                    src={mosquePlaceholder}
                    alt={SEOUtils.generateImageAltText(mosque, 'exterior')}
                    className="w-full h-full object-cover opacity-60"
                  />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-blue/20">
                  <ImageIcon className="w-14 h-14 text-white/90 mb-3" />
                  <p className="text-white/90 font-body text-base font-medium">Photo not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Mosque Name and Title */}
          <header className="text-center py-6 bg-warm-ivory rounded-xl border-2 border-golden-beige/50 shadow-sm">
            <h1 className="font-elegant text-4xl font-bold text-archway-black leading-tight mb-4">
              {mosque.name}
            </h1>
            {(mosque.rating || mosque.isOpen !== undefined) && (
              <div className="flex items-center justify-center gap-6 mt-4">
                {mosque.rating && (
                  <div className="flex items-center gap-3 bg-burnt-ochre/15 px-6 py-3 rounded-full shadow-sm border border-golden-beige/60">
                    <Star className="w-5 h-5 text-burnt-ochre fill-burnt-ochre" />
                    <span className="font-body text-base font-semibold text-archway-black">
                      {mosque.rating} rating
                    </span>
                  </div>
                )}
                {mosque.isOpen !== undefined && (
                  <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-sm border-2 ${
                    mosque.isOpen 
                      ? 'bg-olive-green/15 text-olive-green border-olive-green/40' 
                      : 'bg-red-100 text-red-600 border-red-200'
                  }`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-body text-base font-semibold">
                      {mosque.isOpen ? 'Currently Open' : 'Currently Closed'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </header>

          <Separator className="bg-golden-beige/60 h-px" />

          {/* Contact Information */}
          <div className="space-y-4 bg-warm-ivory p-6 rounded-xl border-2 border-golden-beige/50 shadow-sm">
            <h2 className="font-elegant text-2xl font-bold text-archway-black mb-6">Contact Information</h2>
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
          </div>


          {/* Distance Info */}
          <div className="bg-warm-ivory rounded-xl p-8 border-2 border-golden-beige/60 shadow-sm">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-burnt-ochre/15 flex items-center justify-center shadow-sm border border-golden-beige/60">
                <MapPin className="w-6 h-6 text-burnt-ochre" />
              </div>
              <div className="text-center">
                <p className="font-body text-base text-slate-blue mb-2">Distance from your location</p>
                <p className="font-elegant text-2xl font-bold text-archway-black">
                  {mosque.distance}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-6">
            <Button 
              onClick={onClose}
              className="w-full h-16 font-body text-xl font-semibold bg-burnt-ochre hover:bg-burnt-ochre/80 text-white rounded-xl shadow-lg border-2 border-golden-beige/40 transition-all duration-300"
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