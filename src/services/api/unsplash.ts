export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  creditName: string;
  creditLink: string;
}

export const fetchLocationImage = async (location: string): Promise<UnsplashImage | null> => {
  const url = `/api/pexels?location=${encodeURIComponent(location)}`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.photos && data.photos.length > 0) {
        const img = data.photos[0];
        return {
          id: img.id?.toString() || 'pexels_' + Date.now(),
          url: img.src?.large || img.src?.medium,
          thumb: img.src?.small || img.src?.tiny,
          creditName: img.photographer || 'Pexels',
          creditLink: img.photographer_url || 'https://www.pexels.com',
        };
      }
    }
  } catch (error: any) {
    console.error("Error fetching Pexels image:", url, error);
  }

  return null;
};
