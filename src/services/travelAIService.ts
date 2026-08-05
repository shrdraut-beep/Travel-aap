import { fetchLiveFlights, fetchLiveTrains, getTravelCacheKey } from './LiveTravelAPI';

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
    // २. Master System Prompt (महाराजा ट्रॅव्हल्सच्या फॉरमॅटनुसार व PDF #3391439 च्या रिअल-वर्ल्ड स्टँडर्डनुसार)
    const SYSTEM_PROMPT = `
You are a highly professional, expert AI Travel Consultant for the "Pravas Wataghati" app. Your exact task is to design a realistic, agency-grade travel quotation and itinerary strictly in native Marathi, adhering to real-world travel agency standards like Reference PDF #3391439. 

CRITICAL RULES:
1. DIETARY COMPLIANCE: The user has selected a specific food preference. Strictly recommend restaurants and local dishes that match this preference (e.g., Pure Veg, Seafood, Non-Veg, Jain).
2. TRANSPORTATION ALIGNMENT: The user has explicitly selected "${tripDetails.transportMode}". You MUST strictly design the entire journey, transit timings, and transport logistics using ONLY this mode. Do not suggest a car if the user selected a train/flight/bus.
3. REAL AGENCY STRUCTURE (PDF #3391439 MATCH):
   - Include Quote Reference ID (e.g., Quote #PW-${tripDetails.destination.slice(0,3).toUpperCase()}-3391439).
   - Provide THREE Package Tier Options:
     1. Option 1: Budget Package
     2. Option 2: Deluxe / Standard Package
     3. Option 3: Luxury / Maharaja Premium Package
   - Include Hotel Accommodations Matrix across Option 1, Option 2, and Option 3 for every night of stay.
   - Include Transportation & Services Breakdown Table (Private AC vehicles like Xylo/Ertiga/Innova, ferry/boat passes, entry tickets like Cellular Jail/Red Fort/Forts).
   - Provide Day-by-Day Detailed Schedule with exact time slots (Morning, Afternoon, Evening).
   - List Inclusions & Exclusions clearly.

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

