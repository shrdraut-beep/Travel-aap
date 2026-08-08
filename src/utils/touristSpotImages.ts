export interface TouristSpot {
  title: string;
  url: string;
  keywords: string[];
  location?: string;
  subtitle?: string;
}

// Destination-aware image resolver for Indian & Global travel
const resolveDestinationImage = (destName: string, category: 'hero' | 'beach' | 'fort' | 'temple' | 'market' | 'hill'): string => {
  const query = `${destName} ${category}`.replace(/\s+/g, '+');
  // Use a more stable placeholder service
  return `https://picsum.photos/seed/${query}/600/400`;
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
        title: `${capDest} स्थानिक बाजारपेठ व खरेदी`,
        url: resolveDestinationImage(destClean, 'market'),
        keywords: ['market', 'bazaar'],
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
      title: `${capDest} Local Cultural Bazaar`,
      url: resolveDestinationImage(destClean, 'market'),
      keywords: ['market', 'shopping', 'bazaar'],
      location: `${capDest} Main Market`
    }
  ];
};

export const getSpotsForDay = (
  dayNum: number,
  dayText: string,
  destinationName: string = '',
  tripTitle: string = '',
  isMr: boolean = false
): TouristSpot[] => {
  const cleanD = destinationName || tripTitle.split(' ')[0] || 'Destination';
  const capD = cleanD.charAt(0).toUpperCase() + cleanD.slice(1);

  if (isMr) {
    return [
      {
        title: `${capD} मुख्य पर्यटन केंद्र (दिवस ${dayNum})`,
        url: resolveDestinationImage(`${cleanD} ${dayText}`, 'beach'),
        keywords: ['spot', 'sightseeing'],
        location: `${capD}`
      },
      {
        title: `${capD} ऐतिहासिक वास्तू (दिवस ${dayNum})`,
        url: resolveDestinationImage(`${cleanD} ${dayText}`, 'fort'),
        keywords: ['heritage', 'culture'],
        location: `${capD}`
      }
    ];
  }

  return [
    {
      title: `${capD} Key Attraction - Day ${dayNum}`,
      url: resolveDestinationImage(`${cleanD} ${dayText}`, 'beach'),
      keywords: ['spot', 'sightseeing'],
      location: `${capD}`
    },
    {
      title: `${capD} Heritage Site - Day ${dayNum}`,
      url: resolveDestinationImage(`${cleanD} ${dayText}`, 'fort'),
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

