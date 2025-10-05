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

export const generateMosqueSchema = (mosque: Mosque, currentUrl: string) => {
  const baseUrl = window.location.origin;
  
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // Main Place/Mosque Schema
      {
        "@type": ["Place", "ReligiousOrganization"],
        "@id": `${currentUrl}#mosque`,
        "name": mosque.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": mosque.address,
          "addressCountry": "AU"
        },
        "geo": mosque.latitude && mosque.longitude ? {
          "@type": "GeoCoordinates",
          "latitude": mosque.latitude,
          "longitude": mosque.longitude
        } : undefined,
        "image": mosque.photoUrl || `${baseUrl}/src/assets/mosque-placeholder.jpg`,
        "telephone": mosque.phone,
        "url": mosque.website,
        "description": `${mosque.name} is a mosque located in ${mosque.address}. Find prayer times, contact information, and directions.`,
        "amenityFeature": [
          { "@type": "LocationFeatureSpecification", "name": "Prayer Hall", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Ablution Facilities", "value": true },
          { "@type": "LocationFeatureSpecification", "name": "Parking Available", "value": true }
        ],
        "additionalType": "https://en.wikipedia.org/wiki/Mosque"
      },
      
      // LocalBusiness Schema
      {
        "@type": "LocalBusiness",
        "@id": `${currentUrl}#business`,
        "name": mosque.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": mosque.address,
          "addressCountry": "AU"
        },
        "telephone": mosque.phone,
        "url": mosque.website,
        "priceRange": "Free",
        "sameAs": mosque.website ? [mosque.website] : []
      },
      
      // AggregateRating (if rating exists)
      ...(mosque.rating ? [{
        "@type": "AggregateRating",
        "@id": `${currentUrl}#rating`,
        "ratingValue": mosque.rating,
        "bestRating": 5,
        "worstRating": 1,
        "ratingCount": Math.floor(mosque.rating * 10) // Estimated review count
      }] : []),
      
      // OpeningHoursSpecification
      {
        "@type": "OpeningHoursSpecification",
        "@id": `${currentUrl}#hours`,
        "dayOfWeek": [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
        ],
        "opens": "05:00",
        "closes": "22:00",
        "description": "Prayer times vary daily. Please contact the mosque for current prayer schedules."
      },
      
      // FAQPage
      {
        "@type": "FAQPage",
        "@id": `${currentUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What are the prayer times?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Prayer times change daily based on sunrise and sunset. Please contact the mosque directly or check their website for current prayer schedules."
            }
          },
          {
            "@type": "Question", 
            "name": "Is parking available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most mosques provide parking facilities for worshippers. Please contact the specific mosque to confirm parking availability."
            }
          },
          {
            "@type": "Question",
            "name": "Are visitors welcome?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, mosques welcome visitors. Please dress modestly and remove shoes before entering the prayer hall. It's recommended to contact the mosque in advance."
            }
          },
          {
            "@type": "Question",
            "name": "What facilities are available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Facilities typically include prayer halls, ablution areas, and parking. Some mosques may offer additional amenities like libraries or community halls."
            }
          }
        ]
      },
      
      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "@id": `${currentUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Mosque Directory",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": mosque.name,
            "item": currentUrl
          }
        ]
      }
    ]
  };

  // Remove undefined values from the schema
  return JSON.parse(JSON.stringify(schema));
};

export const generateLandingPageSchema = () => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}#website`,
        "name": "Mosque Finder Australia",
        "alternateName": "Find Mosques Near You",
        "description": "Find mosques near you across Australia. Search by location and radius to discover prayer times, directions, and mosque information.",
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${baseUrl}?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        "name": "Mosque Finder Australia",
        "description": "Australia's comprehensive mosque directory helping Muslims find nearby mosques and prayer facilities.",
        "url": baseUrl,
        "logo": `${baseUrl}/src/assets/mosque-hero.png`,
        "sameAs": []
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Mosque Finder Australia",
            "item": baseUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I find mosques near me?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can use our location-based search to find mosques near your current location or enter a specific postcode. Select your preferred search radius to customize your results."
            }
          },
          {
            "@type": "Question",
            "name": "Is the mosque information up to date?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We regularly update our mosque directory with current information including contact details, addresses, and facilities. If you notice outdated information, please use our feedback form."
            }
          },
          {
            "@type": "Question",
            "name": "Can I get directions to mosques?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, click the 'Get Directions' button on any mosque listing to open turn-by-turn directions in your preferred maps application."
            }
          }
        ]
      }
    ]
  };
};

export const generateCityPageSchema = (cityName: string, cityUrl: string) => {
  const baseUrl = window.location.origin;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${cityUrl}#webpage`,
        "url": cityUrl,
        "name": `Find Mosques in ${cityName} | Masjid Directory`,
        "description": `Find mosques in ${cityName} with addresses, phone numbers, and directions. Ad-free, community-built mosque directory.`,
        "isPartOf": {
          "@id": `${baseUrl}#website`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${cityUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": `${cityName} Mosques`,
            "item": cityUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${cityUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How do I find the nearest mosque in ${cityName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Use our search feature to locate mosques within your preferred radius in ${cityName}. Enter your suburb or postcode to see nearby options with addresses and contact details.`
            }
          },
          {
            "@type": "Question",
            "name": `Are there Friday prayers available in ${cityName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes, most ${cityName} mosques offer Friday (Jummah) prayers. Contact the mosque directly for specific prayer times.`
            }
          }
        ]
      }
    ]
  };
};

export const injectJsonLdSchema = (schema: object) => {
  // Remove existing schema if present
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
};