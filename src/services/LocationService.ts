export const checkRestrictedZones = (destination: string): boolean => {
  if (!destination) return false;
  const restricted = ['goa', 'sikkim', 'andaman'];
  const lowerDest = destination.toLowerCase();
  return restricted.some(zone => lowerDest.includes(zone));
};

export const getCurrentLocation = (): Promise<{lat: number, lng: number, address?: string}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          resolve({
            lat: latitude,
            lng: longitude,
            address: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
        } catch (e) {
          resolve({ lat: latitude, lng: longitude });
        }
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
};
