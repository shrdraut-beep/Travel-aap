/**
 * Polyline Encoding and Decoding Utilities
 * Conforms to Google Maps / OSRM standard 5-decimal precision format.
 */

export function decodePolyline(encoded: string, precision = 5): [number, number][] {
  if (!encoded || typeof encoded !== 'string') return [];
  const factor = Math.pow(10, precision);
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([
      Math.round((lat / factor) * 100000) / 100000,
      Math.round((lng / factor) * 100000) / 100000
    ]);
  }

  return coordinates;
}

export function encodePolyline(points: [number, number][], precision = 5): string {
  if (!points || !Array.isArray(points) || points.length === 0) return '';
  const factor = Math.pow(10, precision);
  let output = '';
  let prevLat = 0;
  let prevLng = 0;

  const encodeSigned = (num: number): string => {
    let sgn = num < 0 ? ~(num << 1) : num << 1;
    let s = '';
    while (sgn >= 0x20) {
      s += String.fromCharCode((0x20 | (sgn & 0x1f)) + 63);
      sgn >>= 5;
    }
    s += String.fromCharCode(sgn + 63);
    return s;
  };

  for (const [lat, lng] of points) {
    const latVal = Math.round(lat * factor);
    const lngVal = Math.round(lng * factor);

    const dLat = latVal - prevLat;
    const dLng = lngVal - prevLng;

    prevLat = latVal;
    prevLng = lngVal;

    output += encodeSigned(dLat) + encodeSigned(dLng);
  }

  return output;
}
