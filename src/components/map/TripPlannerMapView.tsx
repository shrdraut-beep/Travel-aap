import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '../../utils/polyline';

export interface MapMarkerItem {
  id: string;
  name: string;
  type: 'origin' | 'destination' | 'via' | 'transit_halt' | 'hotel' | 'food' | 'poi';
  lat: number;
  lng: number;
  description?: string;
  imageUrl?: string;
}

export interface RouteMapData {
  transportMode: string;
  polyline: [number, number][]; // [lat, lng]
  encodedPolyline?: string; // OSRM encoded geometry string
  markers: MapMarkerItem[];
  bounds?: [[number, number], [number, number]];
  center?: [number, number];
}

interface TripPlannerMapViewProps {
  routeData: RouteMapData;
  lang?: string;
}

// Fit bounds automatically when route changes
function AutoFitBounds({ bounds, polyline, markers }: { bounds?: [[number, number], [number, number]]; polyline: [number, number][]; markers: MapMarkerItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length === 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      return;
    }
    if (polyline && polyline.length > 0) {
      const lats = polyline.map(p => p[0]);
      const lngs = polyline.map(p => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [30, 30], maxZoom: 14 });
      return;
    }
    if (markers && markers.length > 0) {
      const lats = markers.map(m => m.lat);
      const lngs = markers.map(m => m.lng);
      map.fitBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]], { padding: [30, 30], maxZoom: 14 });
    }
  }, [map, bounds, polyline, markers]);

  return null;
}

// Marker icon generator
const getMarkerIcon = (type: MapMarkerItem['type'], label: string) => {
  let bg = '#4f46e5'; // pink
  let icon = '📍';

  if (type === 'origin') {
    bg = '#10b981'; // pink
    icon = '🟢';
  } else if (type === 'destination') {
    bg = '#e11d48'; // rose
    icon = '🎯';
  } else if (type === 'via') {
    bg = '#059669'; // rose
    icon = '🛣️';
  } else if (type === 'transit_halt') {
    bg = '#d97706'; // orange
    icon = '🛑';
  } else if (type === 'hotel') {
    bg = '#7c3aed'; // violet
    icon = '🏨';
  } else if (type === 'food') {
    bg = '#ea580c'; // orange
    icon = '🍛';
  } else if (type === 'poi') {
    bg = '#0284c7'; // sky blue
    icon = '🏛️';
  }

  return L.divIcon({
    className: 'trip-map-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: ${bg}; color: white; border: 2px solid white; border-radius: 9999px; padding: 4px 8px; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>${icon}</span>
          <span style="max-width: 90px; overflow: hidden; text-overflow: ellipsis;">${label}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${bg};"></div>
      </div>
    `,
    iconSize: [110, 34],
    iconAnchor: [55, 34],
    popupAnchor: [0, -32],
  });
};

export const TripPlannerMapView: React.FC<TripPlannerMapViewProps> = ({ routeData, lang = 'en' }) => {
  const mode = (routeData.transportMode || 'car').toLowerCase();
  const isFlight = mode.includes('flight') || mode.includes('विमान');
  const isTrain = mode.includes('train') || mode.includes('रेल्वे');
  const isBus = mode.includes('bus') || mode.includes('बस');

  // Decode OSRM encoded polyline if provided, with fallback to pre-populated polyline array
  const activePolyline = useMemo<[number, number][]>(() => {
    if (routeData.encodedPolyline && typeof routeData.encodedPolyline === 'string') {
      try {
        const decoded = decodePolyline(routeData.encodedPolyline);
        if (decoded && decoded.length > 1) {
          return decoded;
        }
      } catch (err) {
        console.warn('Failed to decode OSRM encodedPolyline, falling back to polyline points:', err);
      }
    }
    return routeData.polyline || [];
  }, [routeData.encodedPolyline, routeData.polyline]);

  // Center fallback
  const center: [number, number] = routeData.center || 
    (activePolyline.length > 0 ? activePolyline[0] : [18.5204, 73.8567]);

  // Polyline style based on transport mode
  const polylineColor = isFlight ? '#ec4899' : isTrain ? '#f59e0b' : isBus ? '#0284c7' : '#4f46e5';
  const dashArray = isFlight ? '8, 8' : isTrain ? '10, 10' : undefined;
  const weight = isFlight ? 4 : isTrain ? 4 : 5;

  return (
    <div className="w-full h-80 sm:h-96 rounded-[20px] overflow-hidden relative z-0 border-2 border-slate-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitBounds 
          bounds={routeData.bounds} 
          polyline={activePolyline} 
          markers={routeData.markers} 
        />

        {/* Route Polyline (OSRM Road for car/bus with exact road curves, Geodesic for flight, Rail line for train) */}
        {activePolyline && activePolyline.length > 1 && (
          <>
            {/* Subtle casing/shadow for road clarity */}
            {!isFlight && (
              <Polyline
                positions={activePolyline}
                pathOptions={{
                  color: '#1e1b4b',
                  weight: weight + 3,
                  opacity: 0.25,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
            <Polyline
              positions={activePolyline}
              pathOptions={{
                color: polylineColor,
                weight: weight,
                opacity: 0.92,
                dashArray: dashArray,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Map Markers for Origin, Destination, Halts, Hotels, Restaurants, and POIs */}
        {routeData.markers && routeData.markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={getMarkerIcon(marker.type, marker.name)}
          >
            <Popup className="trip-map-popup">
              <div className="p-1 text-slate-800 max-w-[200px] text-xs">
                {marker.imageUrl && (
                  <img
                    src={marker.imageUrl}
                    alt={marker.name}
                    crossOrigin="anonymous"
                    className="w-full h-24 object-cover rounded-lg mb-1.5 border border-slate-200"
                  />
                )}
                <div className="font-bold text-slate-900 text-sm">{marker.name}</div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  {marker.type === 'origin' ? (lang === 'mr' ? 'प्रारंभ स्थान' : 'Origin') :
                   marker.type === 'destination' ? (lang === 'mr' ? 'गंतव्य स्थान' : 'Destination') :
                   marker.type === 'via' ? (lang === 'mr' ? 'मार्गातील शहर' : 'Via-Point') :
                   marker.type === 'transit_halt' ? (lang === 'mr' ? 'रात्रीचा मुक्काम' : 'Overnight Transit Halt') :
                   marker.type === 'hotel' ? (lang === 'mr' ? 'हॉटेल / मुक्काम' : 'Hotel / Stay') :
                   marker.type === 'food' ? (lang === 'mr' ? 'स्थानिक खानावळ' : 'Food Spot') :
                   (lang === 'mr' ? 'ऐतिहासिक स्थळ' : 'Historical POI')}
                </div>
                {marker.description && (
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-3">
                    {marker.description}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Mode Badge in Corner */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-1.5">
        <span>{isFlight ? '✈️ Air Route' : isTrain ? '🚂 Train Route' : isBus ? '🚌 Bus Route' : '🚗 Road Route (OSRM)'}</span>
      </div>
    </div>
  );
};
