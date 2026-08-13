import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TripPlan, TripGroup, MemberLocation } from '../../types';
import { getUniqueMembers } from '../../utils';
import { 
  Search, 
  MapPin, 
  Navigation, 
  UserCircle, 
  ExternalLink, 
  Share2, 
  Compass, 
  MessageCircle, 
  LocateFixed, 
  Route as RouteIcon, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';

interface TripMapProps {
  trip: TripGroup;
  lang: string;
  userId?: string;
  isSharingLocation?: boolean;
  onToggleLocationShare?: (sharing: boolean) => void;
  onUpdateTrip?: (trip: TripGroup) => void;
}

interface QueueItem {
  query: string;
  id: string;
}

// Leaflet custom icons
const createSearchedIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-marker-searched',
    html: `<div style="width: 42px; height: 42px; background: #ef4444; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.5);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
  });

const createItineraryIcon = (color: string, index: number) =>
  L.divIcon({
    className: 'custom-leaflet-marker-itinerary',
    html: `<div style="width: 36px; height: 36px; background: ${color}; border: 3px solid white; border-radius: 12px; transform: rotate(45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
      <div style="transform: rotate(-45deg); color: white; font-weight: 900; font-size: 13px;">${index}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });

const createMemberIcon = (member: any, isSharing: boolean, isSelected: boolean) =>
  L.divIcon({
    className: 'custom-leaflet-marker-member',
    html: `<div style="position: relative; width: 48px; height: 48px; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: all 0.3s ease;">
      <div style="width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.35); background: ${member.color || '#6366f1'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px;">
        ${member.avatar ? `<img src="${member.avatar}" style="width: 100%; height: 100%; object-fit: cover;" />` : member.name.charAt(0).toUpperCase()}
      </div>
      <div style="position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%); background: #0f172a; color: white; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 8px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);">
        📍 ${member.name.split(' ')[0]}
      </div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

const createSosIcon = (memberName: string) =>
  L.divIcon({
    className: 'custom-leaflet-marker-sos',
    html: `<div style="position: relative; width: 50px; height: 50px;">
      <div style="width: 50px; height: 50px; background: #e11d48; border-radius: 16px; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(225,29,72,0.6);">
        <span style="font-size: 24px;">🚨</span>
      </div>
      <div style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: #e11d48; color: white; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 8px; white-space: nowrap; border: 1px solid white;">
        SOS: ${memberName}
      </div>
    </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });

function MapCameraController({ focusPos }: { focusPos: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (focusPos) {
      map.flyTo([focusPos.lat, focusPos.lng], 14, { duration: 1.2 });
    }
  }, [map, focusPos]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) {
    return `${Math.round(d * 1000)} m`;
  }
  return `${d.toFixed(1)} km`;
}

export const TripMap: React.FC<TripMapProps> = ({ 
  trip, 
  lang, 
  userId, 
  isSharingLocation, 
  onToggleLocationShare, 
  onUpdateTrip 
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [focusedPosition, setFocusedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [searchedPlace, setSearchedPlace] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // OSRM Route State
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: string; durationMin: string } | null>(null);

  // Nominatim Queue State & Refs
  const searchQueueRef = useRef<QueueItem[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const [queueStatus, setQueueStatus] = useState<{ total: number; currentQuery: string } | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const themeColor = trip.themeColor || '#6366f1';
  const isMr = lang === 'mr';

  const defaultCenter = { lat: 18.5204, lng: 73.8567 };

  const memberLocations = trip.memberLocations || [];
  const myLoc = memberLocations.find(l => l.memberId === (userId || "guest"));

  // Process Nominatim Search Queue (2-sec delay enforcement)
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    while (searchQueueRef.current.length > 0) {
      const nextItem = searchQueueRef.current[0];
      setQueueStatus({
        total: searchQueueRef.current.length,
        currentQuery: nextItem.query,
      });

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nextItem.query)}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'TravelPlannerApp/1.0',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const top = data[0];
            const lat = parseFloat(top.lat);
            const lng = parseFloat(top.lon);
            const name = top.display_name;

            setSearchedPlace({ lat, lng, name });
            setFocusedPosition({ lat, lng });
            setSearchMessage(null);

            // If an itinerary plan is selected, assign this location to it
            if (selectedPlanId && onUpdateTrip) {
              const newItinerary = trip.itinerary.map(plan => {
                if (plan.id === selectedPlanId) {
                  return {
                    ...plan,
                    location: { lat, lng, name },
                  };
                }
                return plan;
              });
              onUpdateTrip({ ...trip, itinerary: newItinerary });
            }
          } else {
            setSearchMessage(isMr ? `"${nextItem.query}" साठी कोणतेही ठिकाण सापडले नाही.` : `No location found for "${nextItem.query}".`);
          }
        } else {
          setSearchMessage(isMr ? 'शोध सेवा सध्या व्यस्त आहे, कृपया थोड्या वेळाने प्रयत्न करा.' : 'Geocoding service busy. Please try again shortly.');
        }
      } catch (err) {
        console.error('Nominatim Queue fetch error:', err);
        setSearchMessage(isMr ? 'शोधादरम्यान त्रुटी आली.' : 'Error performing search.');
      }

      // Shift item out of queue
      searchQueueRef.current.shift();

      // Enforce 2000ms delay before processing next queue item to respect Fair Use Policy
      if (searchQueueRef.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    isProcessingRef.current = false;
    setQueueStatus(null);
  }, [selectedPlanId, onUpdateTrip, trip, isMr]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const queryStr = searchQuery.trim();
    searchQueueRef.current.push({ query: queryStr, id: Date.now().toString() });
    setSearchMessage(null);
    setSearchQuery('');
    
    setQueueStatus({
      total: searchQueueRef.current.length,
      currentQuery: queryStr,
    });

    processQueue();
  };

  // OSRM Route Fetcher
  const fetchOSRMRoute = useCallback(async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates;
          const leafletCoords: [number, number][] = coords.map(([lng, lat]: [number, number]) => [lat, lng]);
          setRouteCoords(leafletCoords);

          const distKm = (route.distance / 1000).toFixed(1);
          const durMin = Math.round(route.duration / 60).toString();
          setRouteInfo({ distanceKm: distKm, durationMin: durMin });
        }
      }
    } catch (err) {
      console.error('OSRM fetch error:', err);
    }
  }, []);

  // Update Route when focusedPosition or myLoc changes
  useEffect(() => {
    if (focusedPosition && myLoc && myLoc.isSharing) {
      fetchOSRMRoute({ lat: myLoc.lat, lng: myLoc.lng }, focusedPosition);
    } else if (searchedPlace && myLoc && myLoc.isSharing) {
      fetchOSRMRoute({ lat: myLoc.lat, lng: myLoc.lng }, { lat: searchedPlace.lat, lng: searchedPlace.lng });
    } else {
      const validMarkers = trip.itinerary.filter(p => p.location);
      if (validMarkers.length >= 2) {
        const start = validMarkers[0].location!;
        const end = validMarkers[validMarkers.length - 1].location!;
        fetchOSRMRoute(start, end);
      } else {
        setRouteCoords([]);
        setRouteInfo(null);
      }
    }
  }, [focusedPosition, searchedPlace, myLoc, trip.itinerary, fetchOSRMRoute]);

  const handleLocateMember = (memId: string, lat: number, lng: number) => {
    setSelectedFriendId(memId);
    setFocusedPosition({ lat, lng });
  };

  const handleAskShareLocation = (memName: string) => {
    const text = isMr
      ? `नमस्कार ${memName}! 📍 ${trip.name} च्या प्रवासात मला नकाशावर तुमचे लाईव्ह लोकेशन पाहायचे आहे. कृपया प्रवासाचे अ‍ॅप उघडून लाईव्ह लोकेशन ऑन करा.`
      : `Hey ${memName}! 📍 Turn on your live location on the ${trip.name} map in Routripo so we can spot each other!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSearchedPlace({
      lat,
      lng,
      name: isMr ? 'निवडलेले ठिकाण' : 'Selected Map Location',
    });
    setFocusedPosition({ lat, lng });

    if (selectedPlanId && onUpdateTrip) {
      const newItinerary = trip.itinerary.map(plan => {
        if (plan.id === selectedPlanId) {
          return {
            ...plan,
            location: {
              lat,
              lng,
              name: isMr ? 'नकाशावरील ठिकाण' : 'Map Pin Location',
            },
          };
        }
        return plan;
      });
      onUpdateTrip({ ...trip, itinerary: newItinerary });
    }
  };

  const itineraryMarkers = trip.itinerary.filter(p => p.location);

  return (
    <div className="space-y-6">
      {/* Live Location Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-5 rounded-[28px] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className={`w-12 h-12 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center transition-all ${isSharingLocation ? 'ring-4 ring-emerald-400/50' : ''}`}
          >
            <Navigation className={`w-6 h-6 ${isSharingLocation ? 'animate-pulse text-emerald-300' : 'text-white'}`} />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider leading-tight flex items-center gap-2">
              {isMr ? 'दोस्त नक्शा (OpenStreetMap)' : 'Dost Nakasha (OpenStreetMap)'}
              {isSharingLocation && (
                <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                  {isMr ? 'लाईव्ह सुरु' : 'Live On'}
                </span>
              )}
            </h3>
            <p className="text-xs text-indigo-100 font-medium mt-1">
              {isSharingLocation 
                ? (isMr ? 'तुमचे लाईव्ह लोकेशन मित्रांना दिसत आहे.' : 'Your live location is visible to trip friends.') 
                : (isMr ? 'दोस्तांना नकाशावर शोधण्यासाठी लाईव्ह लोकेशन सुरू करा.' : 'Turn on live location to see each other on OpenStreetMap.')}
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => onToggleLocationShare?.(!isSharingLocation)}
          className={`w-full md:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            isSharingLocation 
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30' 
              : 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 shadow-emerald-400/30'
          }`}
        >
          <LocateFixed className="w-4 h-4" />
          <span>{isSharingLocation ? (isMr ? 'लोकेशन थांबवा' : 'Stop Sharing') : (isMr ? 'लोकेशन सुरू करा' : 'Start Sharing')}</span>
        </button>
      </div>

      {/* Friends Live Status Cards - Horizontal Scrollable Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
            <UserCircle className="w-4 h-4 text-indigo-600" />
            {isMr ? 'प्रवासातील सोबती' : 'Trip Friends'} ({trip.members.length})
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            {memberLocations.filter(l => l.isSharing).length} {isMr ? 'लाईव्ह' : 'sharing live'}
          </span>
        </div>

        <div className="flex flex-row overflow-x-auto gap-3 py-3 px-3 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm scrollbar-none snap-x">
          {getUniqueMembers(trip.members || []).map((member, idx) => {
            const loc = memberLocations.find(l => l.memberId === member.id && l.isSharing);
            const isMe = member.id === (userId || 'guest');
            const isSelected = selectedFriendId === member.id;
            const firstName = member.name.trim().split(' ')[0];
            
            let distText = '';
            if (loc && myLoc && !isMe) {
              distText = calculateDistance(myLoc.lat, myLoc.lng, loc.lat, loc.lng);
            }

            return (
              <div 
                key={`${member.id}-${idx}`}
                className="flex flex-col items-center gap-1.5 shrink-0 snap-start cursor-pointer group select-none"
                onClick={() => {
                  if (loc) {
                    handleLocateMember(member.id, loc.lat, loc.lng);
                  } else {
                    handleAskShareLocation(member.name);
                  }
                }}
              >
                <div className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 transition-all duration-300 ${
                  isSelected 
                    ? 'ring-3 ring-indigo-600 scale-105 shadow-md' 
                    : 'ring-2 ring-slate-200/80 group-hover:ring-indigo-400'
                }`}>
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full rounded-full object-cover shadow-sm" 
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center font-black text-white text-base shadow-sm uppercase" 
                      style={{ backgroundColor: member.color || '#6366f1' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}

                  {/* Status Indicator Badge */}
                  {loc ? (
                    <span 
                      className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse shadow-xs" 
                      title={distText ? `${distText} away` : 'Live'} 
                    />
                  ) : (
                    <span 
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-300 border-2 border-white rounded-full shadow-xs" 
                      title="Location Off" 
                    />
                  )}
                </div>

                {/* Member First Name */}
                <div className="text-center max-w-[68px]">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {firstName}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 truncate leading-none mt-0.5">
                    {isMe ? (
                      <span className="text-indigo-600 font-bold">({isMr ? 'तुम्ही' : 'You'})</span>
                    ) : loc ? (
                      <span className="text-emerald-600 font-bold">{distText || (isMr ? 'लाईव्ह' : 'Live')}</span>
                    ) : (
                      <span className="text-slate-400">{isMr ? 'लोकेशन बंद' : 'Off'}</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itinerary Filter Chips */}
      {trip.itinerary.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {trip.itinerary.map(plan => (
            <button
              key={plan.id}
              type="button"
              onClick={() => {
                setSelectedPlanId(plan.id);
                if (plan.location) {
                  setFocusedPosition({ lat: plan.location.lat, lng: plan.location.lng });
                }
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border cursor-pointer ${
                selectedPlanId === plan.id 
                  ? 'text-white shadow-md' 
                  : 'bg-white text-slate-700 border-slate-200/60 hover:bg-slate-50'
              }`}
              style={selectedPlanId === plan.id ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
            >
              <MapPin className="w-3.5 h-3.5" />
              {plan.title}
            </button>
          ))}
        </div>
      )}

      {/* Map Container with Leaflet & Overlays */}
      <div className="relative w-full h-[520px] rounded-[32px] overflow-hidden shadow-2xl border border-white ring-1 ring-slate-200/50">
        
        {/* Floating Top Search Bar with Nominatim 2-Sec Queue Status */}
        <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMr ? 'नकाशावर ठिकाण शोधा (OpenStreetMap)...' : 'Search place on OpenStreetMap...'}
                className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
              />
            </div>
            <button 
              type="submit" 
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 border border-indigo-500 flex items-center gap-1.5 shrink-0 text-xs uppercase tracking-wider cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{isMr ? 'शोधा' : 'Search'}</span>
            </button>
          </form>

          {/* Queue Status Feedback Banner */}
          {queueStatus && (
            <div className="mt-2 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-pulse w-fit">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>
                {isMr 
                  ? `शोधत आहे: "${queueStatus.currentQuery}" (रांगेत १/${queueStatus.total})`
                  : `Searching: "${queueStatus.currentQuery}" (In queue: 1/${queueStatus.total})`}
              </span>
            </div>
          )}

          {/* Search Error Message Feedback */}
          {searchMessage && !queueStatus && (
            <div className="mt-2 px-3.5 py-1.5 bg-rose-900/90 backdrop-blur-md text-white text-xs font-bold rounded-xl shadow-lg border border-rose-700 flex items-center gap-2 w-fit">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              <span>{searchMessage}</span>
            </div>
          )}
        </div>

        {/* OSRM Route Badge Overlay */}
        {routeInfo && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-300">
              <RouteIcon className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                {isMr ? 'OSRM ओएसआरएम ड्रायव्हिंग मार्ग' : 'OSRM Driving Route'}
              </p>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <span>{routeInfo.distanceKm} km</span>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <Clock className="w-3 h-3" />
                  ~{routeInfo.durationMin} mins
                </span>
              </p>
            </div>
          </div>
        )}

        {/* React Leaflet Map Container */}
        <MapContainer
          center={
            itineraryMarkers.length > 0 && itineraryMarkers[0].location 
              ? [itineraryMarkers[0].location.lat, itineraryMarkers[0].location.lng]
              : [defaultCenter.lat, defaultCenter.lng]
          }
          zoom={itineraryMarkers.length > 0 ? 12 : 10}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCameraController focusPos={focusedPosition} />
          <MapClickHandler onClick={handleMapClick} />

          {/* Searched Location Marker */}
          {searchedPlace && (
            <Marker 
              position={[searchedPlace.lat, searchedPlace.lng]} 
              icon={createSearchedIcon()}
            >
              <Popup>
                <div className="p-1 text-center font-bold text-xs text-slate-800">
                  <p className="text-indigo-600 font-extrabold uppercase text-[10px]">📍 {isMr ? 'शोधलेले ठिकाण' : 'Searched Location'}</p>
                  <p className="mt-1">{searchedPlace.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Itinerary Markers */}
          {itineraryMarkers.map((plan, idx) => (
            plan.location && (
              <Marker
                key={plan.id}
                position={[plan.location.lat, plan.location.lng]}
                icon={createItineraryIcon(themeColor, idx + 1)}
                eventHandlers={{
                  click: () => setSelectedPlanId(plan.id),
                }}
              >
                <Popup>
                  <div className="p-1 font-bold text-xs text-slate-800">
                    <p className="text-indigo-600 font-extrabold text-[10px] uppercase">Plan #{idx + 1}</p>
                    <p className="text-sm font-black">{plan.title}</p>
                    {plan.location.name && <p className="text-[11px] text-slate-500 font-medium">{plan.location.name}</p>}
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Member Markers */}
          {memberLocations.map(loc => {
            const member = trip.members.find(m => m.id === loc.memberId);
            if (!member || !loc.isSharing) return null;
            const isSelected = selectedFriendId === loc.memberId;

            return (
              <Marker
                key={loc.memberId}
                position={[loc.lat, loc.lng]}
                icon={createMemberIcon(member, loc.isSharing, isSelected)}
                eventHandlers={{
                  click: () => setSelectedFriendId(loc.memberId),
                }}
              >
                <Popup>
                  <div className="p-1 text-center font-bold text-xs text-slate-800">
                    <p className="text-emerald-600 font-extrabold text-[10px] uppercase">📍 {isMr ? 'लाईव्ह लोकेशन' : 'Live Friend'}</p>
                    <p className="text-sm font-black">{member.name}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* SOS Markers */}
          {(trip.sosAlerts || []).filter(a => !a.isResolved).map(alert => (
            <Marker
              key={alert.id}
              position={[alert.lat, alert.lng]}
              icon={createSosIcon(alert.memberName)}
            >
              <Popup>
                <div className="p-1 text-center font-black text-rose-600 text-xs">
                  <p className="uppercase text-[10px]">🚨 Emergency Alert</p>
                  <p className="text-sm font-black text-rose-700">{alert.memberName}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* OSRM Route Polyline */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: themeColor,
                weight: 5,
                opacity: 0.85,
                dashArray: '8, 8',
              }}
            />
          )}
        </MapContainer>
      </div>

      {selectedPlanId && (
        <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200/50">
          <p className="text-xs font-bold text-slate-800 text-center uppercase tracking-widest leading-relaxed">
            {isMr ? 'नकाशावर क्लिक करून पिन ठेवा किंवा ठिकाण शोधा.' : 'Tap map to drop pin or search location'}
          </p>
        </div>
      )}
    </div>
  );
};
