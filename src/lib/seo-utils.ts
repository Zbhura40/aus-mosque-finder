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

export class SEOUtils {
  // Extract suburb/city from address
  static extractLocation(address: string): { suburb: string; city: string; state: string } {
    const parts = address.split(',').map(part => part.trim());
    const state = 'Australia';
    
    if (parts.length >= 2) {
      const suburb = parts[0] || '';
      const city = parts[1] || '';
      return { suburb, city, state };
    }
    
    return { suburb: parts[0] || '', city: '', state };
  }

  // Generate unique page title for mosque
  static generateMosquePageTitle(mosque: Mosque): string {
    const location = this.extractLocation(mosque.address);
    const cleanName = mosque.name.replace(/mosque/i, '').trim();
    
    if (location.suburb && location.city) {
      return `${cleanName} Mosque in ${location.suburb}, ${location.city} – Find My Mosque Australia`;
    } else if (location.suburb) {
      return `${cleanName} Mosque in ${location.suburb} – Find My Mosque Australia`;
    }
    
    return `${mosque.name} – Find Prayer Times & Directions | Find My Mosque Australia`;
  }

  // Generate meta description for mosque (145-160 chars)
  static generateMosqueMetaDescription(mosque: Mosque): string {
    const location = this.extractLocation(mosque.address);
    const amenities = this.getMosqueAmenities(mosque);
    const ratingText = mosque.rating ? ` Rated ${mosque.rating}/5.` : '';
    
    let description = `Visit ${mosque.name} in ${location.suburb || location.city}. Find prayer times, directions & facilities.${ratingText}`;
    
    if (amenities.length > 0 && description.length < 130) {
      const amenityText = ` ${amenities.slice(0, 2).join(', ')}.`;
      if ((description + amenityText).length <= 160) {
        description += amenityText;
      }
    }
    
    // Ensure it's within 145-160 characters
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    } else if (description.length < 145) {
      description += ' Contact details available.';
    }
    
    return description;
  }

  // Generate landing page title
  static generateLandingPageTitle(): string {
    return 'Find My Mosque Australia – Locate Prayer Times, Directions & Mosque Information';
  }

  // Generate landing page meta description
  static generateLandingPageMetaDescription(): string {
    return 'Discover mosques across Australia. Search by location to find prayer times, contact details, facilities & get directions. Free community platform.';
  }

  // Generate unique mosque description
  static generateMosqueDescription(mosque: Mosque): string {
    const location = this.extractLocation(mosque.address);
    const amenities = this.getMosqueAmenities(mosque);
    
    let description = `${mosque.name} is a welcoming Islamic center located in the heart of ${location.suburb || location.city}`;
    
    if (location.suburb && location.city) {
      description += `, serving the diverse Muslim community of ${location.city} and surrounding areas`;
    }
    
    description += '. This mosque provides a peaceful environment for daily prayers, Friday congregational prayers (Jummah), and various Islamic activities.';
    
    if (amenities.length > 0) {
      description += ` The facility features ${amenities.slice(0, 3).join(', ')}`;
      if (amenities.length > 3) {
        description += ' and additional community amenities';
      }
      description += '.';
    }
    
    if (mosque.rating && mosque.rating >= 4) {
      description += ' This highly-rated mosque is known for its active community engagement and spiritual atmosphere.';
    }
    
    return description;
  }

  // Get location context with nearby landmarks
  static getLocationContext(mosque: Mosque): string {
    const location = this.extractLocation(mosque.address);
    
    let context = `Located in ${location.suburb || location.city}`;
    
    if (location.suburb && location.city) {
      context += `, ${location.city}`;
    }
    
    context += ', this mosque is easily accessible by public transport and offers convenient parking facilities. ';
    context += `The surrounding area of ${location.suburb || location.city} is known for its multicultural community `;
    context += 'and variety of halal dining options and Islamic services nearby.';
    
    return context;
  }

  // Get mosque amenities based on available data
  static getMosqueAmenities(mosque: Mosque): string[] {
    const baseAmenities = [
      'Prayer hall',
      'Ablution facilities',
      'Parking available',
      'Wheelchair accessible',
      'Community library',
      'Islamic bookstore',
      'Educational programs',
      'Youth activities',
      'Women\'s prayer area',
      'Funeral services'
    ];
    
    // Return a subset based on mosque characteristics
    let amenities = ['Prayer hall', 'Ablution facilities', 'Parking available'];
    
    if (mosque.rating && mosque.rating >= 4) {
      amenities.push('Community programs', 'Educational classes');
    }
    
    if (mosque.website) {
      amenities.push('Online prayer times', 'Event calendar');
    }
    
    // Add accessibility if it's a well-rated mosque
    if (mosque.rating && mosque.rating >= 4.2) {
      amenities.push('Wheelchair accessible', 'Family facilities');
    }
    
    return amenities;
  }

  // Generate image alt text
  static generateImageAltText(mosque: Mosque, context: 'exterior' | 'interior' | 'community' = 'exterior'): string {
    const location = this.extractLocation(mosque.address);
    
    switch (context) {
      case 'exterior':
        return `${mosque.name} exterior view in ${location.suburb || location.city}, showing Islamic architecture and entrance`;
      case 'interior':
        return `Interior prayer hall of ${mosque.name} in ${location.suburb || location.city} with mihrab and prayer space`;
      case 'community':
        return `Community gathering at ${mosque.name} in ${location.suburb || location.city} showing diverse Muslim worshippers`;
      default:
        return `${mosque.name} mosque in ${location.suburb || location.city}, Australia - Islamic place of worship`;
    }
  }

  // Generate accessibility information
  static generateAccessibilityInfo(mosque: Mosque): string[] {
    const accessibility = [
      'Wheelchair accessible entrances and prayer areas',
      'Designated parking spaces for disabled visitors',
      'Audio assistance available during sermons',
      'Braille signage for visually impaired worshippers'
    ];
    
    if (mosque.rating && mosque.rating >= 4) {
      accessibility.push('Family prayer rooms and children\'s areas');
      accessibility.push('Elevator access to upper floors');
    }
    
    return accessibility.slice(0, 3); // Return top 3 accessibility features
  }

  // Update document head with SEO data
  static updateDocumentHead(title: string, description: string, url?: string): void {
    // Update title
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update canonical URL if provided
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
    }
    
    // Update Open Graph tags
    this.updateOpenGraphTags(title, description, url);
  }

  // Update Open Graph tags
  private static updateOpenGraphTags(title: string, description: string, url?: string): void {
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' }
    ];
    
    if (url) {
      ogTags.push({ property: 'og:url', content: url });
    }
    
    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
  }
}