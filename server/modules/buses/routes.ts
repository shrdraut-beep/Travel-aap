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

export function registerBusRoutes(app: Express): void {

app.post("/api/buses/search", async (req, res) => {
  const { origin, destination, date, busType, passengers } = req.body;
  const vendorBuses = getVendorMatchingBuses(origin, destination, date);

  try {
    const buses = await zuelpayService.searchBuses({ origin, destination, date, busType, passengers });
    const combined = [...vendorBuses, ...(Array.isArray(buses) ? buses : [])];
    return res.status(200).json({ success: true, results: combined, buses: combined });
  } catch (err: any) {
    try {
      const fallbackBuses = busLookupService.searchBuses({ origin: req.body.origin, destination: req.body.destination, date: req.body.date });
      const combined = [...vendorBuses, ...(Array.isArray(fallbackBuses) ? fallbackBuses : [])];
      return res.status(200).json({ success: true, results: combined, buses: combined });
    } catch (e: any) {
      if (vendorBuses.length > 0) {
        return res.status(200).json({ success: true, results: vendorBuses, buses: vendorBuses });
      }
      return res.status(500).json({ success: false, error: err.message });
    }
  }
});
app.post("/api/buses/seatlayout", async (req, res) => {
  try {
    const { busId, origin, destination, date, inventoryType, routeScheduleId } = req.body;
    const layout = await zuelpayService.getBusSeatLayout({
      busId: busId || routeScheduleId,
      origin,
      destination,
      date,
      inventoryType,
      routeScheduleId,
    });
    return res.status(200).json({ success: true, layout });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

}
