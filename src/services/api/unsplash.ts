export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  creditName: string;
  creditLink: string;
}

export const fetchLocationImage = async (location: string): Promise<UnsplashImage | null> => {
  const fallbackUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  const fallbackImage: UnsplashImage = {
    id: 'fallback_' + Math.random().toString(36).substring(2, 9),
    url: fallbackUrl,
    thumb: fallbackUrl,
    creditName: 'Unsplash Travel Gallery',
    creditLink: 'https://unsplash.com',
  };

  if (!location) return fallbackImage;

  const url = `/api/pexels?location=${encodeURIComponent(location)}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (data && data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
        const img = data.photos[0];
        return {
          id: img.id?.toString() || 'pexels_' + Date.now(),
          url: img.src?.large || img.src?.medium || fallbackUrl,
          thumb: img.src?.small || img.src?.tiny || fallbackUrl,
          creditName: img.photographer || 'Pexels',
          creditLink: img.photographer_url || 'https://www.pexels.com',
        };
      }
    }
  } catch (error: any) {
    console.warn("Could not fetch location image from Pexels, using fallback:", url);
  }

  return fallbackImage;
};
