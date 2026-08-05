import sys

with open('src/components/travel/HotelSearchTab.tsx', 'r') as f:
    content = f.read()

old_block = """    try {
      const fetchHotelsData = async (searchCity: string) => {
        const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
        if (!googleApiKey) {
          console.warn('Google Places API key is missing. Please configure VITE_GOOGLE_PLACES_API_KEY in .env');
        }

        const queryStr = `Hotels, Resorts, Airbnb, and Homestays in ${searchCity}`;
        
        let targetUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&key=${encodeURIComponent(googleApiKey)}`;
        let proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
        
        const res = await fetch(proxyUrl);
        if (!res.ok) {
           throw new Error(`Google Places API returned status ${res.status}`);
        }
        
        return await res.json();
      };

      const data = await fetchHotelsData(destination);
      setRawData(data);
      
      const results = data.results || [];
      console.log(`[HotelSearchTab] API returned ${results.length} results`);
      
      if (results.length === 0) {
        setHotels([]);
      } else {
        const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
        
        const mappedHotels = results.map((item: any, idx: number) => {
          let image = '';
          const photoRef = item.photos?.[0]?.photo_reference;
          if (photoRef && googleApiKey) {
            const photoTarget = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${googleApiKey}`;
            image = `https://corsproxy.io/?${encodeURIComponent(photoTarget)}`;
          }
          
          return {
            id: item.place_id || `hotel_${idx}`,
            name: item.name,
            location: item.formatted_address || item.vicinity || destination,
            rating: typeof item.rating === 'number' ? Number(item.rating.toFixed(1)) : 4.4,
            reviewsCount: item.user_ratings_total || 0,
            image,
            pricePerNight: Math.min(Math.max(4500 + (idx * 850) % 7500, 4500), 12000),
            currency: 'INR',
            amenities: ['Free WiFi', 'Air Conditioning', 'Room Service', 'Breakfast Included'],
            provider: 'Google Places API',
            deepLink: 'https://bitli.in/1HdfW4l',
          };
        });
        setHotels(mappedHotels);
      }
    } catch (error: any) {
      console.warn("[HotelSearchTab] API Fetch Error:", error);
      setHotels([]);
    }"""

new_block = """    try {
      const fetchHotelsData = async (searchCity: string) => {
        const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
        const queryStr = `Hotels, Resorts, Airbnb, and Homestays in ${searchCity}`;
        
        // Try local backend proxy first to avoid CORS issues
        const localProxyUrl = `/api/google-places/textsearch/json?query=${encodeURIComponent(queryStr)}${googleApiKey ? `&key=${encodeURIComponent(googleApiKey)}` : ''}`;
        let res = await fetch(localProxyUrl);
        
        if (!res.ok) {
           console.warn(`Local proxy returned ${res.status}, trying corsproxy as fallback...`);
           if (googleApiKey) {
              const targetUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&key=${encodeURIComponent(googleApiKey)}`;
              let proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
              res = await fetch(proxyUrl);
           }
        }
        
        if (!res.ok) {
           throw new Error(`Google Places API returned status ${res.status}`);
        }
        
        return await res.json();
      };

      const data = await fetchHotelsData(destination);
      setRawData(data);
      
      const results = data.results || [];
      console.log(`[HotelSearchTab] API returned ${results.length} results`);
      
      if (results.length === 0) {
        setHotels([]);
      } else {
        const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';
        
        const mappedHotels = results.map((item: any, idx: number) => {
          let image = '';
          const photoRef = item.photos?.[0]?.photo_reference;
          if (photoRef) {
            image = `/api/google-places/photo?photo_reference=${photoRef}${googleApiKey ? `&key=${encodeURIComponent(googleApiKey)}` : ''}`;
          }
          
          return {
            id: item.place_id || `hotel_${idx}`,
            name: item.name,
            location: item.formatted_address || item.vicinity || destination,
            rating: typeof item.rating === 'number' ? Number(item.rating.toFixed(1)) : 4.4,
            reviewsCount: item.user_ratings_total || 0,
            image,
            pricePerNight: Math.min(Math.max(4500 + (idx * 850) % 7500, 4500), 12000),
            currency: 'INR',
            amenities: ['Free WiFi', 'Air Conditioning', 'Room Service', 'Breakfast Included'],
            provider: 'Google Places API',
            deepLink: 'https://bitli.in/1HdfW4l',
          };
        });
        setHotels(mappedHotels);
      }
    } catch (error: any) {
      console.warn("[HotelSearchTab] API Fetch Error:", error);
      setHotels([]);
    }"""

content = content.replace(old_block, new_block)

with open('src/components/travel/HotelSearchTab.tsx', 'w') as f:
    f.write(content)
