import axios from 'axios';

export interface PhotonLocationResult {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  formatted: string;
  lat: number;
  lon: number;
  type?: string;
  osm_key?: string;
  osm_value?: string;
}

const TOP_INDIAN_DESTINATIONS: PhotonLocationResult[] = [
  { id: 'loc-bom', name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', country: 'India', formatted: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777, type: 'city' },
  { id: 'loc-del', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', country: 'India', formatted: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.2090, type: 'city' },
  { id: 'loc-blr', name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', country: 'India', formatted: 'Bengaluru, Karnataka, India', lat: 12.9716, lon: 77.5946, type: 'city' },
  { id: 'loc-goa', name: 'Goa', city: 'Panaji', state: 'Goa', country: 'India', formatted: 'Goa, India', lat: 15.2993, lon: 74.1240, type: 'state' },
  { id: 'loc-jai', name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', country: 'India', formatted: 'Jaipur, Rajasthan, India', lat: 26.9124, lon: 75.7873, type: 'city' },
  { id: 'loc-pun', name: 'Pune', city: 'Pune', state: 'Maharashtra', country: 'India', formatted: 'Pune, Maharashtra, India', lat: 18.5204, lon: 73.8567, type: 'city' },
  { id: 'loc-isk', name: 'Nashik', city: 'Nashik', state: 'Maharashtra', country: 'India', formatted: 'Nashik, Maharashtra, India', lat: 19.9975, lon: 73.7898, type: 'city' },
  { id: 'loc-hyd', name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', country: 'India', formatted: 'Hyderabad, Telangana, India', lat: 17.3850, lon: 78.4867, type: 'city' },
  { id: 'loc-maa', name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', formatted: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707, type: 'city' },
  { id: 'loc-ccu', name: 'Kolkata', city: 'Kolkata', state: 'West Bengal', country: 'India', formatted: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639, type: 'city' },
  { id: 'loc-vns', name: 'Varanasi', city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', formatted: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lon: 82.9739, type: 'city' },
  { id: 'loc-agr', name: 'Agra', city: 'Agra', state: 'Uttar Pradesh', country: 'India', formatted: 'Agra, Uttar Pradesh, India', lat: 27.1767, lon: 78.0081, type: 'city' },
  { id: 'loc-uda', name: 'Udaipur', city: 'Udaipur', state: 'Rajasthan', country: 'India', formatted: 'Udaipur, Rajasthan, India', lat: 24.5854, lon: 73.7125, type: 'city' },
  { id: 'loc-man', name: 'Manali', city: 'Manali', state: 'Himachal Pradesh', country: 'India', formatted: 'Manali, Himachal Pradesh, India', lat: 32.2432, lon: 77.1892, type: 'town' },
  { id: 'loc-cok', name: 'Kochi', city: 'Kochi', state: 'Kerala', country: 'India', formatted: 'Kochi, Kerala, India', lat: 9.9312, lon: 76.2673, type: 'city' },
];

class PhotonService {
  private localHost: string;
  private publicHost: string = 'https://photon.komoot.io';

  constructor() {
    this.localHost = process.env.PHOTON_HOST || 'http://localhost:2322';
  }

  /**
   * Autocomplete places/cities using self-hosted Photon with transparent public fallback & offline dictionary
   */
  public async searchLocations(
    query: string,
    limit: number = 10,
    lang: string = 'en'
  ): Promise<{ results: PhotonLocationResult[]; source: 'self-hosted' | 'upstream-public' | 'offline-cache' }> {
    if (!query || query.trim().length === 0) {
      return { results: [], source: 'self-hosted' };
    }

    const cleanQuery = encodeURIComponent(query.trim());
    const safeLimit = Math.min(Math.max(limit, 1), 30);
    const headers = { 'User-Agent': 'RoutTripo-Travel-App/1.0 (contact@routtripo.com)' };

    // 1. First attempt: Self-hosted local/VPS Photon container (sub-20ms)
    try {
      const localUrl = `${this.localHost}/api/?q=${cleanQuery}&limit=${safeLimit}&lang=${lang}`;
      const response = await axios.get(localUrl, { timeout: 1500, headers });
      if (response.data && Array.isArray(response.data.features) && response.data.features.length > 0) {
        return {
          results: this.transformPhotonFeatures(response.data.features),
          source: 'self-hosted',
        };
      }
    } catch (localErr) {
      // Local container not running or timed out, seamlessly fallback to upstream
    }

    // 2. Second attempt: Upstream public Komoot Photon instance
    try {
      const publicUrl = `${this.publicHost}/api/?q=${cleanQuery}&limit=${safeLimit}&lang=${lang}`;
      const response = await axios.get(publicUrl, { timeout: 6000, headers });
      if (response.data && Array.isArray(response.data.features) && response.data.features.length > 0) {
        return {
          results: this.transformPhotonFeatures(response.data.features),
          source: 'upstream-public',
        };
      }
    } catch (pubErr: any) {
      console.warn(`[Photon] Upstream geocoding call failed/delayed: ${pubErr?.message || pubErr}`);
    }

    // 3. Third attempt: Instant curated offline dictionary fallback (Zero failure guarantee)
    const lowerQ = query.trim().toLowerCase();
    const matched = TOP_INDIAN_DESTINATIONS.filter(
      (dest) =>
        dest.name.toLowerCase().includes(lowerQ) ||
        (dest.city && dest.city.toLowerCase().includes(lowerQ)) ||
        (dest.state && dest.state.toLowerCase().includes(lowerQ))
    ).slice(0, safeLimit);

    return {
      results: matched,
      source: 'offline-cache',
    };
  }

  private transformPhotonFeatures(features: any[]): PhotonLocationResult[] {
    return features.map((feat, idx) => {
      const props = feat.properties || {};
      const coords = feat.geometry?.coordinates || [0, 0];
      const name = props.name || props.city || props.street || 'Unknown Location';
      const city = props.city || props.town || props.village || props.county || '';
      const state = props.state || '';
      const country = props.country || '';

      const parts = [name];
      if (city && city !== name) parts.push(city);
      if (state) parts.push(state);
      if (country) parts.push(country);

      const formatted = parts.filter(Boolean).join(', ');

      return {
        id: `loc-${props.osm_id || idx}-${Date.now()}`,
        name,
        city,
        state,
        country,
        formatted,
        lat: coords[1],
        lon: coords[0],
        type: props.type || props.osm_value || 'locality',
        osm_key: props.osm_key,
        osm_value: props.osm_value,
      };
    });
  }
}

export const photonService = new PhotonService();
