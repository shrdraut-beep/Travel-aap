export async function getSunriseSunset(lat: number, lng: number) {
  try {
    const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.warn("Sunrise-Sunset API notice:", err);
    return null;
  }
}

export async function getCountryDetails(countryName: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`, {
          headers: {
              "User-Agent": "Routripo/1.0"
          }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const country = data[0];
          return {
            flag: country.flag,
            currencies: country.currencies,
            languages: country.languages,
            name: country.name.common,
            lat: country.latlng ? country.latlng[0] : null,
            lng: country.latlng ? country.latlng[1] : null,
          };
        }
      }
    } catch (err) {
      if (i === retries) console.warn("Rest Countries API failed after retries:", countryName);
    }
  }
  return null;
}

export async function geocodeDestination(destination: string) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`, {
        headers: {
            "User-Agent": "Routripo/1.0"
        }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            country: data[0].display_name.split(',').pop()?.trim() || ''
        };
    }
    return null;
  } catch(err) {
      console.warn("Geocoding destination notice:", err);
      return null;
  }
}
