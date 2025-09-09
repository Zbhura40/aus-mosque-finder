import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Globe, Star, Clock, ExternalLink, Image as ImageIcon, Users, AccessibilityIcon } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-rose-dome/10 backdrop-blur-sm border border-golden-amber/30">
        <DialogHeader className="pb-6">
          <DialogTitle className="font-elegant text-2xl font-semibold text-architectural-shadow flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-golden-amber/25 flex items-center justify-center shadow-sm">
              <MapPin className="w-6 h-6 text-architectural-shadow" />
            </div>
            Mosque Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about the selected mosque including contact details and location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mosque Photo */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-marble-warm/40 border border-golden-amber/20">
            {mosque.photoUrl && !imageError ? (
              <img
                src={mosque.photoUrl}
                alt={SEOUtils.generateImageAltText(mosque, 'exterior')}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-marble-warm/20 to-rose-dome/15">
                  <img
                    src={mosquePlaceholder}
                    alt={SEOUtils.generateImageAltText(mosque, 'exterior')}
                    className="w-full h-full object-cover opacity-60"
                  />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-architectural-shadow/20">
                  <ImageIcon className="w-12 h-12 text-white/80 mb-2" />
                  <p className="text-white/80 font-body text-sm">Photo not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Mosque Name and Title */}
          <header className="text-center py-4 bg-marble-cream/50 rounded-xl border border-rose-dome/20">
            <h1 className="font-elegant text-3xl font-bold text-architectural-shadow leading-tight">
              {mosque.name}
            </h1>
            {(mosque.rating || mosque.isOpen !== undefined) && (
              <div className="flex items-center justify-center gap-4 mt-3">
                {mosque.rating && (
                  <div className="flex items-center gap-2 bg-golden-amber/20 px-4 py-2 rounded-full shadow-sm">
                    <Star className="w-4 h-4 text-golden-amber fill-golden-amber" />
                    <span className="font-body text-sm font-medium text-architectural-shadow">
                      {mosque.rating} rating
                    </span>
                  </div>
                )}
                {mosque.isOpen !== undefined && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm ${
                    mosque.isOpen 
                      ? 'bg-islamic-green/20 text-islamic-green border border-islamic-green/30' 
                      : 'bg-red-100 text-red-600 border border-red-200'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="font-body text-sm font-medium">
                      {mosque.isOpen ? 'Currently Open' : 'Currently Closed'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </header>

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
          </div>

          <Separator />

          {/* Mosque Description */}
          <section className="space-y-4 bg-warm-ivory/60 p-6 rounded-xl border border-golden-beige/40 shadow-sm">
            <h2 className="font-elegant text-xl font-semibold text-archway-black flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-burnt-ochre/20 flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-burnt-ochre" />
              </div>
              About {mosque.name}
            </h2>
            <p className="font-body text-base text-slate-blue leading-relaxed">
              {SEOUtils.generateMosqueDescription(mosque)}
            </p>
          </section>

          <Separator className="bg-stone-grey/40" />

          {/* Location Context */}
          <section className="space-y-4 bg-golden-beige/25 p-5 rounded-xl border border-burnt-ochre/30 shadow-sm">
            <h3 className="font-elegant text-lg font-semibold text-archway-black">Location & Accessibility</h3>
            <p className="font-body text-base text-slate-blue leading-relaxed">
              {SEOUtils.getLocationContext(mosque)}
            </p>
          </section>

          <Separator className="bg-stone-grey/40" />

          {/* Amenities */}
          <section className="space-y-4 bg-olive-green/15 p-5 rounded-xl border border-olive-green/30 shadow-sm">
            <h3 className="font-elegant text-lg font-semibold text-archway-black">Facilities & Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEOUtils.getMosqueAmenities(mosque).map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 font-body text-sm text-slate-blue">
                  <div className="w-2 h-2 bg-burnt-ochre rounded-full shadow-sm"></div>
                  {amenity}
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Accessibility Information */}
          <section className="space-y-4 bg-stone-grey/20 p-5 rounded-xl border border-stone-grey/40 shadow-sm">
            <h3 className="font-elegant text-lg font-semibold text-archway-black flex items-center gap-2">
              <AccessibilityIcon className="w-5 h-5 text-olive-green" />
              Accessibility Features
            </h3>
            <div className="space-y-2">
              {SEOUtils.generateAccessibilityInfo(mosque).map((feature, index) => (
                <div key={index} className="flex items-start gap-3 font-body text-sm text-slate-blue">
                  <div className="w-1.5 h-1.5 bg-olive-green rounded-full mt-2 flex-shrink-0"></div>
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <Separator className="bg-stone-grey/40" />

          {/* Distance Info */}
          <div className="bg-burnt-ochre/20 rounded-xl p-6 border border-burnt-ochre/40 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warm-ivory/80 flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-burnt-ochre" />
              </div>
              <div className="text-center">
                <p className="font-body text-sm text-slate-blue">Distance from your location</p>
                <p className="font-elegant text-xl font-semibold text-archway-black">
                  {mosque.distance}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button 
              onClick={onClose}
              className="w-full h-14 font-body text-lg font-medium bg-architectural-shadow hover:bg-architectural-shadow/80 text-white rounded-xl shadow-sm"
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