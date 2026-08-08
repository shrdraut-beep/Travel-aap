import { fetchLiveFlights, fetchLiveTrains, getTravelCacheKey } from './LiveTravelAPI';
import flightSchedules from '../data/flightSchedules.json';
import trainNames from '../data/trainname.json';
import airports from '../data/airports.json';

export interface TripDetails {
  source: string;
  destination: string;
  days: number;
  budget: number;
  members: string;
  date: string;
  foodPreference: string; // उदा. शाकाहारी, मांसाहारी, जैन, सी-फूड
  transportMode: string;
}

export const generateMaharajaStyleTrip = async (tripDetails: TripDetails): Promise<string> => {
  try {
    // 5. Fetch Live Travel Data (with fallback to local data)
    let travelDataContext = "";
    const distanceData = await fetchDrivingDistanceAndTime(tripDetails.source, tripDetails.destination);
    
    // Find airport codes if mode is flight
    const sourceAirport = airports.find(a => a.city.toLowerCase().includes(tripDetails.source.toLowerCase()))?.code;
    const destAirport = airports.find(a => a.city.toLowerCase().includes(tripDetails.destination.toLowerCase()))?.code;

    if (tripDetails.transportMode.toLowerCase().includes('flight') && sourceAirport && destAirport) {
        const flights = (flightSchedules as any[]).filter(f => f.from === sourceAirport && f.to === destAirport);
        if (flights.length > 0) {
            travelDataContext = `
            REAL FLIGHT DATA:
            ${JSON.stringify(flights.slice(0, 5), null, 2)}
            USE THESE SPECIFIC FLIGHT SCHEDULES. START ITINERARY ARRIVAL AT AIRPORT 2 HOURS BEFORE DEPARTURE TIME.`;
        }
    } else if (tripDetails.transportMode.toLowerCase().includes('train')) {
        const trains = (trainNames as any[]).filter(t => t.trainName.toLowerCase().includes(tripDetails.destination.toLowerCase()) || t.trainName.toLowerCase().includes(tripDetails.source.toLowerCase()));
        if (trains.length > 0) {
            travelDataContext = `
            REAL TRAIN DATA:
            ${JSON.stringify(trains.slice(0, 5), null, 2)}
            USE THESE SPECIFIC TRAIN NAMES. START ITINERARY ARRIVAL AT STATION 1 HOUR BEFORE DEPARTURE TIME.`;
        }
    }

    if (!travelDataContext) {
        // Fallback to Live API
        const mode = tripDetails.transportMode.toLowerCase().includes('flight') ? 'flight' : 'train';
        const liveData = await fetchTravelDataFromAI(mode, {
            origin: tripDetails.source,
            destination: tripDetails.destination,
            date: tripDetails.date
        });
        
        if (liveData.data && (liveData.data.flights || liveData.data.trains)) {
            travelDataContext = `
            LIVE TRAVEL DATA:
            ${JSON.stringify(liveData.data.flights || liveData.data.trains, null, 2)}
            USE THIS DATA FOR SCHEDULING. START ITINERARY ACCORDINGLY.`;
        }
    }
    
    travelDataContext += `
    DISTANCE DATA: ${distanceData.distanceKm} KM, ${distanceData.totalTransitHours} HOURS.
    `;

    const SYSTEM_PROMPT = `You are a highly professional, expert AI Travel Consultant for the "Pravas Wataghati" app. Your exact task is to design a realistic, agency-grade travel quotation and itinerary strictly in the selected language of the application, adhering to real-world travel agency standards.

CRITICAL RULES FOR CALCULATION, ROUTING, AND TONE:
1. LANGUAGE & CURRENCY RULE:
   - The entire itinerary output MUST be strictly in the selected language of the application ONLY.
   - ALWAYS use the selected currency symbol for all prices and budgets.

2. FEASIBILITY & TRANSIT AWARENESS (CRITICAL WARNINGS):
   - SHORT DURATION FOR LONG DISTANCE: Calculate the total travel time. If the round-trip travel time consumes more than 40% to 50% of the total trip days (e.g., Goa to Manali in just 3 days), you MUST output a specific warning in your JSON response: "ही सहल इतक्या कमी दिवसांत करणे गैरसोयीचे आहे, कारण तुमचा ६०% पेक्षा जास्त वेळ फक्त प्रवासातच जाईल. कृपया दिवसांची संख्या वाढवा."
   - NO DIRECT CONNECTIVITY (LAST MILE ROUTING): If the destination lacks a direct airport/railway station, output a transit warning in JSON in the selected language: "[Destination Name] lacks direct airport/railway connectivity. Main transit will be to [Nearest Hub Name], followed by cab/taxi."
   - Ensure the JSON response includes an "awareness_warning" key.

8. WEATHER DATA EXCLUSION:
   - DO NOT generate or include any weather-related information, climate details, or clothing suggestions. Skip the weather section entirely.

3. TRANSPORT COST LOGIC (STRICT MATHEMATICAL CALCULATION):
   - First, determine the accurate distance in kilometers between the source and destination.
   - Determine the main mode of transport and calculate the ONE-WAY cost EXACTLY as follows:
       * For TRAIN: Cost = (Distance x ₹4) x Total number of people.
       * For FLIGHT: Cost = (Distance x ₹12) x Total number of people.
       * For BUS: Cost = (Distance x ₹3) x Total number of people.
       * For CAR/CAB: Cost = (Distance x ₹15 per km for the ENTIRE vehicle) + (Distance x ₹2 per km for estimated Toll Taxes). DO NOT multiply the car cost by the number of people.
   - Final Round-Trip Transport Cost = (Total One-Way Cost) x 2.
   - LOCAL SIGHTSEEING COST (IF MAIN TRANSPORT IS TRAIN OR FLIGHT): If the user travels by Train or Flight, they will need a local cab for sightseeing. Estimate a daily local travel distance (e.g., 50 km per day). Calculate the daily local cab cost: (Daily Distance x ₹15 per km). Multiply this daily cost by the total number of trip days and ADD it to the overall budget.
   - You MUST apply these costs to the 'costBreakdown.travel' and 'transportBreakdown' fields in your response.

4. STRICT TRAVEL TIME CALCULATION FORMULAS:
   - CAR/CAB: Travel Time = (Distance / 60 km/h). You MUST add a 30-minute break for every 4 hours of travel.
   - TRAIN: Travel Time = (Distance / 90 km/h). You MUST add exactly 2 hours to the total time as a buffer for delays.
   - FLIGHT: Travel Time = (Distance / 450 km/h). You MUST add exactly 3 hours to the total time for airport formalities (check-in/security).

5. NEAREST AIRPORT ROUTING (CRITICAL FOR FLIGHTS):
   - If "Flight" is selected, verify if the destination has a functional commercial airport.
   - If NO direct airport exists (e.g., Manali), route the flight to the nearest major airport (e.g., Chandigarh or Delhi).
   - The remaining journey from that airport to the final destination MUST be planned and priced via cab/bus.

6. STRICT ITINERARY THEME & TONE BASED ON TRIP TYPE:
   - "Solo": Focus on budget travel, backpacker hostels, public transport, and local street food.
   - "Friends": Focus on group fun, vibrant cafes, group activities, and shared accommodations.
   - "Adventure": MUST include trekking, mountain activities, or sports.
   - "Religious / Pilgrimage": STRICTLY focus on early morning temple visits (Darshan), peaceful environments, and pure vegetarian food. ABSOLUTELY DO NOT suggest clubs, pubs, partying, or alcohol-related locations.
   - "Family": Focus on high comfort, safety, minimum 3-star or 4-star luxury hotels, easy transport, and kid/senior-friendly relaxed schedules. Avoid exhausting treks.

7. REAL AGENCY STRUCTURE (PDF #3391439 MATCH):
   - Include Quote Reference ID.
   - Provide THREE Package Tier Options: Budget, Deluxe, Luxur    - Structure daily sightseeing plans based on highly popular, realistic, and practical routes. Avoid rushing; ensure geographical logic.

EXAMPLE FORMAT TO STRICTLY FOLLOW:
🚩 *[सुरुवातीचे ठिकाण] ते [पोहोचण्याचे ठिकाण] - [दिवस] दिवसांची महाराजा टूर कोटेशन (#PW-3391439)*
📅 प्रवासाची तारीख: [प्रवासाची तारीख] ([एकूण दिवस - १] रात्री / [एकूण दिवस] दिवस)
👥 प्रवासी: [सदस्य संख्या]
👤 ट्रॅव्हल कन्सल्टंट: Pravas Wataghati AI Desk (+91-9876543210)
--------------------------------------------------
💰 *३ विशेष पॅकेज पर्याय (Package Options)*:
1️⃣ **ऑप्शन १ (बजेट पर्याय)**: ₹[बजेट रक्कमेचा अंदाज] /- (करांशिवाय)
2️⃣ **ऑप्शन २ (डिलक्स पर्याय)**: ₹[मध्यम रक्कमेचा अंदाज] /- (करांशिवाय)
3️⃣ **ऑप्शन ३ (महाराजा प्रीमियम)**: ₹[प्रीमियम रक्कमेचा अंदाज] /- (करांशिवाय)

🏨 *हॉटेल व मुक्काम पर्याय (Hotel Accommodations)*:
• **मुक्काम रात १ व २ ([ठिकाण])**:
  - ऑप्शन १: [बजेट हॉटेल नाव] (Standard Room)
  - ऑप्शन २: [डिलक्स हॉटेल नाव] (Deluxe Room)
  - ऑप्शन ३: [प्रीमियम रिसॉर्ट नाव] (Executive Suite)
  - खोल्या: [खोल्यांची संख्या] x Double Sharing Rooms | CP Plan (नाश्ता समाविष्ट)

🚗 *वाहतूक व ऍक्टिव्हिटी तपशील (Transportation & Activities)*:
• **वाहतुकीचे साधन**: ${tripDetails.transportMode}
• **फेरी/बोट तिकिटे**: स्पेशल कॅटामारन/फेरी १ तास ३० मि. प्रवासी पास समाविष्ट
• **प्रवेश व परवाने**: सर्व प्रसिद्ध प्रेक्षणीय स्थळे, किल्ले व बीच प्रवेश तिकिटे समाविष्ट

--------------------------------------------------
📌 *दिवस १: [दिवसाची थीम - उदा. आगमन आणि ऐतिहासिक दर्शन]*
🌅 *सकाळ:* [०८:३० AM - १२:०० PM]: [आगमन, ${tripDetails.transportMode}ने हॉटेल चेक-इन आणि नाश्ता]
☀️ *दुपार:* [१२:३० PM - ०४:३० PM]: [प्रसिद्ध ऐतिहासिक ठिकाण भेट, प्रवेश तिकीट व जेवण - आवडीनुसार]
🌇 *संध्याकाळ:* [०५:०० PM - ०९:०० PM]: [समुद्रकिनारा/लाइट शो, फोटोग्राफी व संध्याकाळचे जेवण]
🏨 *मुक्काम:* [हॉटेल मुक्काम]

(अशाच प्रकारे सर्व दिवसांचे सविस्तर वेळापत्रक द्या.)
--------------------------------------------------
✅ *पॅकेज समाविष्ट (Inclusions)*:
• रोजचा नाश्ता (Daily Breakfast)
• वाहतूक साधन: ${tripDetails.transportMode}
• सर्व प्रवेश तिकिटे आणि फेरी पास (Entry Tickets & Ferry Passes)
• २४x७ एआय ट्रिप असिस्टंट आणि टूर मॅनेजर सहाय्य

❌ *पॅकेज वगळलेले (Exclusions)*:
• विमान/ट्रेन तिकीट (Airfare / Train fare)
• दुपारचे व रात्रीचे जेवण (Lunch & Dinner)
• वैयक्तिक खरेदी व वॉटर स्पोर्ट्स (Personal expenses & Water sports)
• GST (५%)
   - ITINERARY CONSTRAINTS:
     - ABSOLUTELY DO NOT suggest hotels in the itinerary for days when the user is primarily in transit (train, flight, long-distance car ride).
     - ABSOLUTELY DO NOT suggest hotel check-ins or hotel-specific activities on the last day of the trip, as the user will be returning home.
     - Hotel Suggestions: You MUST suggest concrete, popular hotel names if available in the destination, or specify the 'Type' (e.g., "Luxury Resort", "Budget Homestay", "3-star Business Hotel") if specific names are not known based on availability/area.
`;

    // ३. युजरने फॉर्ममध्ये भरलेला डेटा AI ला पाठवणे
    const userPrompt = `
    कृपया खालील माहितीच्या आधारे एक सविस्तर ट्रिप प्लॅन तयार करा:
    सुरुवातीचे ठिकाण: ${tripDetails.source}
    पोहोचण्याचे ठिकाण: ${tripDetails.destination}
    वाहतुकीचे साधन: ${tripDetails.transportMode}
    एकूण दिवस: ${tripDetails.days}
    बजेट: ₹${tripDetails.budget}
    प्रवासी सदस्य: ${tripDetails.members}
    प्रवासाची तारीख: ${tripDetails.date}
    जेवणाची आवड (Food Preference): ${tripDetails.foodPreference}
    ${travelDataContext}
    `;

    // ४. AI API ला कॉल (Server Proxy -> Gemini API)
    const url = "/api/generate-maharaja-trip";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        tripDetails
      })
    });

    if (response.status === 429) {
      console.error("API Rate Limit Hit for:", url);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.text) {
      return data.text;
    }

    throw new Error(data.error || "प्लॅन जनरेट झाला नाही");
    
  } catch (error) {
    console.error("API Rate Limit Hit for: /api/generate-maharaja-trip", error);
    throw new Error("प्लॅन बनवताना अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.");
  }
};

export interface DistanceMatrixResult {
  origin: string;
  destination: string;
  distanceKm: number;
  drivingDurationMinutes: number;
  drivingDurationHours: number;
  recommendedRestBreaks: number;
  totalBreakMinutes: number;
  totalTransitMinutes: number;
  totalTransitHours: number;
  isFullDayTransit: boolean;
  suggestedIntermediateHalt?: string;
}

export interface VerifiedPlace {
  name: string;
  formattedAddress: string;
  rating: number;
  userRatingsTotal: number;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface ProgressStep {
  id: string;
  text: string;
  status: 'loading' | 'success' | 'error' | 'pending';
}

/**
 * Queries the Distance Matrix API to get realistic driving distance, duration, and breaks.
 */
export async function fetchDrivingDistanceAndTime(origin: string, destination: string): Promise<DistanceMatrixResult> {
  try {
    const res = await fetch('/api/maps/distance-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
    });
    const data = await res.json();
    if (data.success) {
      return data;
    }
  } catch (e) {
    console.warn('Distance Matrix API endpoint notice:', e);
  }

  return {
    origin,
    destination,
    distanceKm: 250,
    drivingDurationMinutes: 300,
    drivingDurationHours: 5,
    recommendedRestBreaks: 1,
    totalBreakMinutes: 45,
    totalTransitMinutes: 345,
    totalTransitHours: 5.8,
    isFullDayTransit: false,
  };
}

/**
 * Queries the Places API to get operational tourist attractions and verified locations.
 */
export async function fetchVerifiedPlaces(destination: string, query?: string): Promise<VerifiedPlace[]> {
  try {
    const res = await fetch('/api/maps/places-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, query }),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.places)) {
      return data.places;
    }
  } catch (e) {
    console.warn('Places API endpoint notice:', e);
  }

  return [
    { name: `${destination} Main Shrine`, formattedAddress: destination, rating: 4.7, userRatingsTotal: 1500 },
    { name: `${destination} Heritage Fort & Viewpoint`, formattedAddress: destination, rating: 4.6, userRatingsTotal: 1200 },
  ];
}

export interface TravelAISearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  trainNumber?: string;
  cabinClass?: string;
  [key: string]: any;
}

export interface TravelAIResponse {
  data: {
    flights?: any[];
    buses?: any[];
    trains?: any[];
    status?: string;
    message?: string;
    [key: string]: any;
  };
  isCached: boolean;
  cacheKey: string;
  status?: string;
  message?: string;
}

export type TravelMode = 'flight' | 'bus' | 'train';

/**
 * Unified function to fetch live travel data from real APIs with 28-day cache
 */
export async function fetchTravelDataFromAI(
  mode: TravelMode,
  searchParams: TravelAISearchParams
): Promise<TravelAIResponse> {
  const origin = searchParams.origin || 'BOM';
  const destination = searchParams.destination || 'DEL';
  const date = searchParams.date || new Date().toISOString().split('T')[0];
  const cacheKey = getTravelCacheKey(mode, origin, destination, date);

  try {
    if (mode === 'flight') {
      const liveRes = await fetchLiveFlights(origin, destination, date);
      return {
        data: {
          flights: liveRes.data || [],
          status: liveRes.status,
          message: liveRes.message
        },
        isCached: !!liveRes.isCached,
        cacheKey,
        status: liveRes.status,
        message: liveRes.message
      };
    } else if (mode === 'train') {
      const liveRes = await fetchLiveTrains(origin, destination, date);
      return {
        data: {
          trains: liveRes.data || [],
          status: liveRes.status,
          message: liveRes.message
        },
        isCached: !!liveRes.isCached,
        cacheKey,
        status: liveRes.status,
        message: liveRes.message
      };
    } else {
      return {
        data: { buses: [], status: "NO_DATA", message: "Bus API integration required." },
        isCached: false,
        cacheKey,
        status: "NO_DATA",
        message: "Bus API integration required."
      };
    }
  } catch (error) {
    console.error(`Error fetching ${mode} data:`, error);
    return {
      data: { status: "ERROR", message: "Failed to fetch live data." },
      isCached: false,
      cacheKey,
      status: "ERROR",
      message: "Failed to fetch live data."
    };
  }
}

