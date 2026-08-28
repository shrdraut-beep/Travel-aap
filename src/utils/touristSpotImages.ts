export interface TouristSpot {
  title: string;
  url: string;
  keywords: string[];
  location?: string;
  subtitle?: string;
  category?: string;
}

// Curated high-resolution, reliable travel & historical photography catalogue
const CURATED_DESTINATION_PHOTOS: Record<string, { hero: string; fort?: string; beach?: string; temple?: string; market?: string; nature?: string; food?: string }> = {
  ganpatipule: {
    hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    beach: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80'
  },
  ratnagiri: {
    hero: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    beach: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80'
  },
  goa: {
    hero: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
    market: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=80'
  },
  manali: {
    hero: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=80'
  },
  mahabaleshwar: {
    hero: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80'
  },
  lonavala: {
    hero: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80'
  },
  alibaug: {
    hero: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    beach: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=80'
  },
  shirdi: {
    hero: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80'
  },
  udaipur: {
    hero: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80'
  },
  jaipur: {
    hero: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
    market: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'
  },
  kerala: {
    hero: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80'
  },
  kashmir: {
    hero: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1000&q=80',
    nature: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1000&q=80',
    temple: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80'
  }
};

// Fallback category images
const CATEGORY_FALLBACKS: Record<string, string> = {
  fort: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
  heritage: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
  temple: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
  mandir: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1000&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  sea: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80',
  market: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  food: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=1000&q=80',
  nature: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
  mountain: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  hero: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80'
};

export const resolveDestinationImage = (destName: string = '', category: 'hero' | 'beach' | 'fort' | 'temple' | 'market' | 'nature' | 'food' = 'hero'): string => {
  const norm = (destName || '').toLowerCase().trim();
  
  for (const [key, mapping] of Object.entries(CURATED_DESTINATION_PHOTOS)) {
    if (norm.includes(key) || key.includes(norm)) {
      if (category === 'hero' && mapping.hero) return mapping.hero;
      if (category === 'fort' && (mapping.fort || mapping.hero)) return mapping.fort || mapping.hero;
      if (category === 'beach' && (mapping.beach || mapping.hero)) return mapping.beach || mapping.hero;
      if (category === 'temple' && (mapping.temple || mapping.hero)) return mapping.temple || mapping.hero;
      if (category === 'nature' && (mapping.nature || mapping.hero)) return mapping.nature || mapping.hero;
      if (category === 'food' && (mapping.food || mapping.hero)) return mapping.food || mapping.hero;
      if (category === 'market' && (mapping.market || mapping.hero)) return mapping.market || mapping.hero;
      return mapping.hero || CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.hero;
    }
  }

  // Check text content keywords
  if (norm.includes('fort') || norm.includes('किल्ला') || norm.includes('दुर्ग') || norm.includes('mahal') || norm.includes('palace')) {
    return CATEGORY_FALLBACKS.fort;
  }
  if (norm.includes('temple') || norm.includes('मंदिर') || norm.includes('देवस्थान') || norm.includes('shirdi') || norm.includes('ganpati')) {
    return CATEGORY_FALLBACKS.temple;
  }
  if (norm.includes('beach') || norm.includes('समुद्र') || norm.includes('किनारा') || norm.includes('sea') || norm.includes('water')) {
    return CATEGORY_FALLBACKS.beach;
  }
  if (norm.includes('food') || norm.includes('जेवण') || norm.includes('थाळी') || norm.includes('मोदक') || norm.includes('dish') || norm.includes('lunch') || norm.includes('dinner')) {
    return CATEGORY_FALLBACKS.food;
  }
  if (norm.includes('mountain') || norm.includes('पर्वत') || norm.includes('घाट') || norm.includes('point') || norm.includes('hill')) {
    return CATEGORY_FALLBACKS.mountain;
  }

  return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.hero;
};

export const getFeaturedSpotsForTrip = (
  destinationName: string = '',
  tripTitle: string = '',
  itineraryText: string = '',
  isMr: boolean = false
): TouristSpot[] => {
  const destClean = destinationName || tripTitle.split(' ')[0] || 'Destination';
  const capDest = destClean.charAt(0).toUpperCase() + destClean.slice(1);
  
  if (isMr) {
    return [
      {
        title: `${capDest} ऐतिहासिक किल्ला व वास्तू`,
        url: resolveDestinationImage(destClean, 'fort'),
        keywords: ['fort', 'heritage'],
        location: `${capDest}`
      },
      {
        title: `${capDest} निसर्गरम्य व्ह्यू पॉईंट`,
        url: resolveDestinationImage(destClean, 'beach'),
        keywords: ['scenic', 'viewpoint'],
        location: `${capDest}`
      },
      {
        title: `${capDest} प्रसिद्ध मंदिर व परिसर`,
        url: resolveDestinationImage(destClean, 'temple'),
        keywords: ['temple', 'mandir'],
        location: `${capDest}`
      },
      {
        title: `${capDest} स्थानिक खाद्य व संस्कृती`,
        url: resolveDestinationImage(destClean, 'food'),
        keywords: ['food', 'cuisine'],
        location: `${capDest}`
      }
    ];
  }

  return [
    {
      title: `${capDest} Heritage Fort & Monument`,
      url: resolveDestinationImage(destClean, 'fort'),
      keywords: ['heritage', 'fort', 'monument'],
      location: `${capDest} Center`
    },
    {
      title: `${capDest} Scenic Viewpoint & Promenade`,
      url: resolveDestinationImage(destClean, 'beach'),
      keywords: ['viewpoint', 'scenic', 'sunset'],
      location: `${capDest} Scenic Area`
    },
    {
      title: `${capDest} Sacred Temple & Complex`,
      url: resolveDestinationImage(destClean, 'temple'),
      keywords: ['temple', 'shrine', 'mandir'],
      location: `${capDest} Heritage Zone`
    },
    {
      title: `${capDest} Authentic Food & Culture`,
      url: resolveDestinationImage(destClean, 'food'),
      keywords: ['food', 'dining', 'bazaar'],
      location: `${capDest} Food Hub`
    }
  ];
};

export const getSpotsForDay = (
  dayNum: number,
  dayText: string = '',
  destinationName: string = '',
  tripTitle: string = '',
  isMr: boolean = false
): TouristSpot[] => {
  const cleanD = destinationName || tripTitle.split(' ')[0] || 'Destination';
  const capD = cleanD.charAt(0).toUpperCase() + cleanD.slice(1);
  const textLower = (dayText || '').toLowerCase();

  // Smart detection from the day text
  let cat1: 'fort' | 'beach' | 'temple' | 'nature' | 'food' = 'nature';
  let cat2: 'fort' | 'beach' | 'temple' | 'nature' | 'food' = 'fort';

  if (textLower.includes('fort') || textLower.includes('किल्ला') || textLower.includes('दुर्ग') || textLower.includes('mahal')) {
    cat1 = 'fort';
    cat2 = textLower.includes('temple') || textLower.includes('मंदिर') ? 'temple' : 'nature';
  } else if (textLower.includes('temple') || textLower.includes('मंदिर') || textLower.includes('दर्शन') || textLower.includes('देवस्थान')) {
    cat1 = 'temple';
    cat2 = textLower.includes('beach') || textLower.includes('समुद्र') ? 'beach' : 'fort';
  } else if (textLower.includes('beach') || textLower.includes('समुद्र') || textLower.includes('किनारा')) {
    cat1 = 'beach';
    cat2 = 'fort';
  }

  return [
    {
      title: isMr ? `${capD} मुख्य प्रेक्षणीय स्थळ (दिवस ${dayNum})` : `${capD} Key Sightseeing (Day ${dayNum})`,
      url: resolveDestinationImage(`${cleanD} ${dayText}`, cat1),
      keywords: ['spot', 'sightseeing'],
      location: `${capD}`
    },
    {
      title: isMr ? `${capD} ऐतिहासिक/नैसर्गिक केंद्र (दिवस ${dayNum})` : `${capD} Heritage & Nature (Day ${dayNum})`,
      url: resolveDestinationImage(`${cleanD} ${dayText}`, cat2),
      keywords: ['heritage', 'culture'],
      location: `${capD}`
    }
  ];
};

export const getSpotImageForText = (text: string, defaultIndex: number = 0, isMr: boolean = false): TouristSpot => {
  return {
    title: isMr ? 'प्रमुख प्रेक्षणीय स्थळ' : 'Top Sightseeing Spot',
    url: resolveDestinationImage(text, 'beach'),
    keywords: [],
    location: isMr ? 'स्थानिक परिसर' : 'Local Viewpoint'
  };
};

export const getBrochureHeroContent = (
  destinationName: string = '',
  tripTitle: string = '',
  itineraryText: string = '',
  isMr: boolean = false
) => {
  const cleanDest = destinationName || tripTitle.split(' ')[0] || 'Tour';
  const cleanTitle = cleanDest.charAt(0).toUpperCase() + cleanDest.slice(1);
  return {
    url: resolveDestinationImage(cleanDest, 'hero'),
    title: isMr ? `${cleanTitle} अधिकृत प्रेक्षणीय सहल पत्रक` : `${cleanTitle} Official Heritage & Sightseeing Tour`,
    subtitle: isMr ? 'दिवसनिहाय नियोजन, प्रसिद्ध स्थळे व सांस्कृतिक माहिती' : 'Day-by-Day Itinerary, Famous Local Spots & Cultural Highlights'
  };
};

export const getBannerImageForTrip = getBrochureHeroContent;
