/**
 * server/modules/buses/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization).
 *
 * BUG FIXED DURING THIS EXTRACTION (not just a move):
 *   server.ts had /api/buses/search and /api/buses/seatlayout defined TWICE.
 *   The first definition (using busLookupService only, no zuelpayService, no
 *   fallback) was registered first, which in Express means it always won —
 *   the second, better definition (zuelpayService with a busLookupService
 *   fallback on error) was 100% dead code, silently unreachable since it was
 *   added.
 *   This file keeps only the zuelpayService+fallback version — the one that
 *   was actually intended to run. If bus search results looked wrong/limited
 *   in testing, this is almost certainly why.
 */

import fs from 'fs';
import path from 'path';
import type { Express } from "express";
import { zuelpayService } from "../../services/zuelpay.service.ts";
import { busLookupService, type VerifiedBus } from "../../services/busLookup.ts";

function getVendorMatchingBuses(origin: string, destination: string, date?: string): VerifiedBus[] {
  try {
    const storePath = path.join(process.cwd(), 'data', 'buses_store.json');
    if (!fs.existsSync(storePath)) return [];
    const content = fs.readFileSync(storePath, 'utf8');
    const stored = JSON.parse(content);
    if (!Array.isArray(stored)) return [];

    const origLower = (origin || '').trim().toLowerCase();
    const destLower = (destination || '').trim().toLowerCase();
    const journeyDate = date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayOfWeek = new Date(journeyDate).getDay(); // 0 is Sun, 5 is Fri, 6 is Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

    const matched = stored.filter((b: any) => {
      if (b.status === 'INACTIVE') return false;
      const bSrc = (b.route?.source || '').toLowerCase();
      const bDst = (b.route?.destination || '').toLowerCase();
      if (!origLower || !destLower) return true;
      return (bSrc.includes(origLower) || origLower.includes(bSrc)) &&
             (bDst.includes(destLower) || destLower.includes(bDst));
    });

    return matched.map((vb: any, idx: number) => {
      const depTime = vb.points?.boarding?.[0]?.time || '21:30';
      const arrTime = vb.points?.dropping?.[0]?.time || '05:30';
      const price = isWeekend && vb.pricing?.weekend_price
        ? Number(vb.pricing.weekend_price)
        : Number(vb.pricing?.selling_price || 800);

      const amenitiesList: string[] = [];
      if (vb.amenities?.ac) amenitiesList.push('AC');
      if (vb.amenities?.wifi) amenitiesList.push('High-Speed Wi-Fi');
      if (vb.amenities?.waterBottle) amenitiesList.push('Water Bottle');
      if (vb.women_protection) amenitiesList.push('Women Passenger Seat Protection');
      if (vb.dinner_halt) amenitiesList.push(`Halt: ${vb.dinner_halt}`);

      return {
        id: vb.id,
        searchTokenId: `v_tok_${vb.id}`,
        resultIndex: idx + 1,
        operatorName: `${vb.operator_name} (RouTripO Verified Partner)`,
        busType: vb.bus_layout || vb.bus_type || '2x1 AC Sleeper',
        origin: vb.route?.source || origin,
        destination: vb.route?.destination || destination,
        departureTime: `${journeyDate}T${depTime}:00`,
        arrivalTime: `${journeyDate}T${arrTime}:00`,
        duration: '8h 00m',
        price,
        seatsAvailable: vb.total_capacity || 30,
        rating: 4.9,
        amenities: amenitiesList,
        boardingPoints: (vb.points?.boarding || []).map((bp: any, bIdx: number) => ({
          id: `v_bp_${vb.id}_${bIdx}`,
          location: `${bp.location}${bp.landmark ? ` (${bp.landmark})` : ''}`,
          time: bp.time
        })),
        droppingPoints: (vb.points?.dropping || []).map((dp: any, dIdx: number) => ({
          id: `v_dp_${vb.id}_${dIdx}`,
          location: dp.location,
          time: dp.time
        })),
        cancellationPolicy: 'Free cancellation up to 6 hours before departure',
        provider: 'ROUTRIPO_VENDOR_FLEET'
      };
    });
  } catch (err) {
    console.warn('[buses/routes] Failed to load vendor buses:', err);
    return [];
  }
}

function normalizeBus(bus: any, defaultOrigin: string, defaultDestination: string): any {
  const origin = bus.origin || defaultOrigin || 'Mumbai';
  const destination = bus.destination || defaultDestination || 'Goa';
  const operatorName = bus.operatorName || bus.name || 'Express Bus Service';
  const busType = bus.busType || bus.type || '2x1 AC Sleeper';
  const price = Number(bus.price || bus.fare || 850);
  const seatsAvailable = Number(bus.seatsAvailable || bus.availableSeats || 18);
  const rating = Number(bus.rating || 4.6);

  let depTime = '21:30';
  let arrTime = '06:00';
  if (bus.departure?.time) {
    depTime = bus.departure.time;
  } else if (bus.departureTime) {
    const parts = String(bus.departureTime).split('T');
    depTime = parts[1] ? parts[1].slice(0, 5) : parts[0];
  }

  if (bus.arrival?.time) {
    arrTime = bus.arrival.time;
  } else if (bus.arrivalTime) {
    const parts = String(bus.arrivalTime).split('T');
    arrTime = parts[1] ? parts[1].slice(0, 5) : parts[0];
  }

  const amenities = Array.isArray(bus.amenities) && bus.amenities.length > 0
    ? bus.amenities
    : ['AC', 'High-Speed Wi-Fi', 'Water Bottle', 'Charging Point'];

  return {
    ...bus,
    id: bus.id || `bus_${Math.random().toString(36).substring(2, 9)}`,
    operatorName,
    name: operatorName,
    busType,
    type: busType,
    origin,
    destination,
    departureTime: bus.departureTime || `${new Date().toISOString().split('T')[0]}T${depTime}:00`,
    arrivalTime: bus.arrivalTime || `${new Date().toISOString().split('T')[0]}T${arrTime}:00`,
    departure: {
      time: depTime,
      station: bus.departure?.station || bus.boardingPoints?.[0]?.location || `${origin} Main Bus Station`
    },
    arrival: {
      time: arrTime,
      station: bus.arrival?.station || bus.droppingPoints?.[0]?.location || `${destination} Central Depot`
    },
    price,
    fare: price,
    seatsAvailable,
    availableSeats: seatsAvailable,
    rating,
    amenities,
    boardingPoints: bus.boardingPoints || [
      { id: 'bp_1', location: `${origin} Main Bus Terminal`, time: depTime }
    ],
    droppingPoints: bus.droppingPoints || [
      { id: 'dp_1', location: `${destination} Central Bus Stand`, time: arrTime }
    ],
    duration: bus.duration || '8h 30m'
  };
}

export function registerBusRoutes(app: Express): void {

app.post("/api/buses/search", async (req, res) => {
  const { origin = 'Mumbai', destination = 'Goa', date, busType, passengers } = req.body || {};
  const vendorBuses = getVendorMatchingBuses(origin, destination, date);

  try {
    const buses = await zuelpayService.searchBuses({ origin, destination, date, busType, passengers });
    const combined = [...vendorBuses, ...(Array.isArray(buses) ? buses : [])];
    const normalized = combined.map(b => normalizeBus(b, origin, destination));
    return res.status(200).json({ success: true, results: normalized, buses: normalized });
  } catch (err: any) {
    try {
      const fallbackBuses = busLookupService.searchBuses({ origin, destination, date });
      const combined = [...vendorBuses, ...(Array.isArray(fallbackBuses) ? fallbackBuses : [])];
      const normalized = combined.map(b => normalizeBus(b, origin, destination));
      return res.status(200).json({ success: true, results: normalized, buses: normalized });
    } catch (e: any) {
      if (vendorBuses.length > 0) {
        const normalized = vendorBuses.map(b => normalizeBus(b, origin, destination));
        return res.status(200).json({ success: true, results: normalized, buses: normalized });
      }
      return res.status(500).json({ success: false, error: err.message });
    }
  }
});

app.post("/api/buses/seatlayout", async (req, res) => {
  try {
    const { busId, origin, destination, date, inventoryType, routeScheduleId } = req.body || {};
    let layout = await zuelpayService.getBusSeatLayout({
      busId: busId || routeScheduleId,
      origin,
      destination,
      date,
      inventoryType,
      routeScheduleId,
    });

    const normalizeSeats = (seats: any[] = []) => {
      return seats.map((s, idx) => ({
        id: String(s.id || s.seat || s.seatNumber || `S${idx + 1}`),
        seatNumber: String(s.seatNumber || s.seat || s.id || `S${idx + 1}`),
        seat: String(s.seat || s.seatNumber || s.id || `S${idx + 1}`),
        row: s.row || Math.floor(idx / 3) + 1,
        col: s.col || (idx % 3) + 1,
        column: s.column || (idx % 3) + 1,
        isAvailable: typeof s.isAvailable === 'boolean' ? s.isAvailable : !s.isBooked,
        isBooked: typeof s.isBooked === 'boolean' ? s.isBooked : !s.isAvailable,
        type: s.type || 'seater',
        price: Number(s.price || s.fare || 850)
      }));
    };

    if (layout) {
      if (Array.isArray(layout.lowerDeck)) {
        layout.lowerDeck = normalizeSeats(layout.lowerDeck);
      }
      if (Array.isArray(layout.upperDeck)) {
        layout.upperDeck = normalizeSeats(layout.upperDeck);
      }
    }

    return res.status(200).json({ success: true, layout });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.all(["/api/buses/points", "/api/buses/:busId/points"], async (req, res) => {
  try {
    const busId = req.params?.busId || req.body?.busId || req.query?.busId || 'bus_default';
    const origin = (req.body?.origin || req.query?.origin || 'Mumbai').toString();
    const destination = (req.body?.destination || req.query?.destination || 'Goa').toString();

    const boardingPoints = [
      {
        id: "bp_1",
        name: `${origin} (Borivali East)`,
        location: "National Park Bridge, Western Express Highway",
        landmark: "Near Highway Express Bus Bay",
        time: "20:30",
        isOriginStop: true,
        coordinates: { lat: 19.2288, lng: 72.8541 }
      },
      {
        id: "bp_2",
        name: `${origin} (Andheri East)`,
        location: "Gundavali Metro Station Flyover, WEH",
        landmark: "Below Gundavali Foot Over Bridge",
        time: "21:15",
        isOriginStop: false,
        coordinates: { lat: 19.1197, lng: 72.8464 }
      },
      {
        id: "bp_3",
        name: `${origin} (Sion Circle)`,
        location: "Opposite Cinemax / SIES College Gate",
        landmark: "Sion West Bus Shelter",
        time: "22:00",
        isOriginStop: false,
        coordinates: { lat: 19.0434, lng: 72.8624 }
      },
      {
        id: "bp_4",
        name: `${origin} (Vashi Plaza)`,
        location: "Sector 17, Below Vashi Highway Flyover",
        landmark: "Near Vashi Bus Terminus",
        time: "22:45",
        isOriginStop: false,
        coordinates: { lat: 19.0771, lng: 72.9986 }
      }
    ];

    const droppingPoints = [
      {
        id: "dp_1",
        name: `${destination} (Mapusa Circle)`,
        location: "Mapusa Bypass Circle, Kadamba Stand",
        landmark: "Near Taxi Stand & Hotel Green Gate",
        time: "06:45",
        isFinalStop: false,
        coordinates: { lat: 15.5937, lng: 73.8144 }
      },
      {
        id: "dp_2",
        name: `${destination} (Panaji KTC Stand)`,
        location: "KTC Bus Terminal, Platform 3",
        landmark: "Mondovi River Ferry Jetty Exit",
        time: "07:30",
        isFinalStop: false,
        coordinates: { lat: 15.4989, lng: 73.8278 }
      },
      {
        id: "dp_3",
        name: `${destination} (Madgaon / Margao)`,
        location: "Kadamba Central Bus Stand, Margao",
        landmark: "Opposite Madgaon Railway Junction Rd",
        time: "08:30",
        isFinalStop: true,
        coordinates: { lat: 15.2736, lng: 73.9582 }
      }
    ];

    return res.status(200).json({
      success: true,
      busId,
      origin,
      destination,
      boardingPoints,
      droppingPoints
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/buses/addons", async (_req, res) => {
  const addons = [
    {
      id: "addon_water_snack",
      name: "Mineral Water & Snack Kit",
      subtitle: "1L sealed water + premium nut mix",
      price: 99,
      veg: true,
      icon: "water_bottle",
      image: "https://lh3.googleusercontent.com/aida/AEtjO1Uy64bpohWL7p11MIcMD4ArPBKUs_jEjqLznv7_mifeyrGZR1Sm0H6EEUdQs3aF-_Kjgv8KfNwYV8cWkpGb-QBTPhb9J_o21gwMBb4ajOZIqkm2oumxDrnpECwuf9MhRuDIp4xfvs-6NmOOlRIwvR98XjUJfCB8NJBUjb6IENbOlFFE5LfmloWgCbNWLgsn0W5Odu8krZ2yhtBQ6zgwdFiTEaLL-Q7KxHMlM4OmPzNyblNM8t5HcuGFsjg"
    },
    {
      id: "addon_chai",
      name: "Hot Masala Chai Flask (500ml)",
      subtitle: "Freshly brewed ginger-cardamom chai",
      price: 69,
      veg: true,
      icon: "coffee",
      image: "https://lh3.googleusercontent.com/aida/AEtjO1WepGAt-vcxx7x5jYVzC4dsneH9QJNsAX6dzuq06sY-CDrw3lE7PfZc93KtNv9d_tJuFlf1hPqsKeU6XpzFVQ81RZyFNqN6xD3uKnN1tS4-itNAEJiPTLWTZY16dRx49BNyMHkAxt2W9recZ_nQYGstgqnaOCLl0QAzYbVCLwaN1ChB9Xj5Zp6p0EGNzCpXLspWmt6NWNw8cb8oEzjTZywxT_kv3uo2H5T8PPwnwMdu0jYVDKW8qCa6OA"
    },
    {
      id: "addon_veg_meal",
      name: "Veg Dum Biryani Executive Box",
      subtitle: "Aromatic dum biryani with raita & gulab jamun",
      price: 189,
      veg: true,
      icon: "restaurant",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80"
    },
    {
      id: "addon_linen",
      name: "Sanitised Linen & Blanket Kit",
      subtitle: "Sealed fresh fleece blanket & pillow cover",
      price: 49,
      veg: true,
      icon: "bed",
      image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&q=80"
    },
    {
      id: "addon_insurance",
      name: "RouTripo TravelShield Insurance",
      subtitle: "Accidental hospitalization up to ₹5,00,000",
      price: 29,
      veg: true,
      icon: "verified_user",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&q=80"
    }
  ];

  return res.status(200).json({ success: true, addons });
});

app.post("/api/buses/book", async (req, res) => {
  try {
    const { bus, busId, seats, leadPassenger, passengers, boardingPoint, droppingPoint, addons, gst, totalAmount, amount } = req.body || {};
    const bookingPnr = "BUS" + Math.floor(100000 + Math.random() * 900000);
    return res.status(200).json({
      success: true,
      bookingPnr,
      pnr: bookingPnr,
      ticketNumber: "TKT-" + Math.floor(1000000 + Math.random() * 9000000),
      status: "CONFIRMED",
      message: "Bus ticket reserved successfully",
      details: {
        busId: busId || bus?.id,
        operatorName: bus?.operatorName || bus?.name || "IntrCity SmartBus",
        busType: bus?.busType || "Volvo 9600 AC Sleeper",
        seats: seats || [],
        leadPassenger: leadPassenger || passengers?.[0] || { name: "Rohan Deshmukh" },
        passengers: passengers || [leadPassenger],
        boardingPoint: boardingPoint || { name: "Borivali East", time: "20:30" },
        droppingPoint: droppingPoint || { name: "Mapusa Circle", time: "06:45" },
        addons: addons || [],
        gst: gst || null,
        amount: totalAmount || amount || 4800,
        bookedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Bus booking failed" });
  }
});

}
