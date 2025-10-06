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
        <div className="flex items-start gap-3 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
            <p className="text-sm text-gray-500">Not available</p>
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
      <div className="flex items-start gap-3 py-3">
        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {isLink ? (
            <a
              href={getHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 hover:text-teal-700 hover:underline transition-colors flex items-center gap-1"
            >
              {value}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <p className="text-sm text-gray-600">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-serif font-medium text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            Mosque Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about the selected mosque including contact details and location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mosque Photo */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            {mosque.photoUrl && !imageError ? (
              <img
                src={mosque.photoUrl}
                alt={SEOUtils.generateImageAltText(mosque, 'exterior')}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                  <img
                    src={mosquePlaceholder}
                    alt={SEOUtils.generateImageAltText(mosque, 'exterior')}
                    className="w-full h-full object-cover opacity-40"
                  />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Photo not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Mosque Name and Title */}
          <header className="text-center py-4 bg-gray-50 rounded-lg">
            <h1 className="text-2xl font-serif font-medium text-gray-900 mb-3">
              {mosque.name}
            </h1>
            {(mosque.rating || mosque.isOpen !== undefined) && (
              <div className="flex items-center justify-center gap-4 mt-3">
                {mosque.rating && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                    <Star className="w-4 h-4 text-teal-600 fill-teal-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {mosque.rating} rating
                    </span>
                  </div>
                )}
                {mosque.isOpen !== undefined && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                    mosque.isOpen
                      ? 'bg-teal-50 text-teal-700 border-teal-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {mosque.isOpen ? 'Currently Open' : 'Currently Closed'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </header>

          <Separator className="bg-gray-200" />

          {/* Contact Information */}
          <div className="space-y-2 bg-gray-50 p-5 rounded-lg">
            <h2 className="text-lg font-serif font-medium text-gray-900 mb-4">Contact Information</h2>
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
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Distance from your location</p>
                <p className="text-xl font-serif font-medium text-gray-900">
                  {mosque.distance}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button
              onClick={onClose}
              className="w-full h-12 text-base font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
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