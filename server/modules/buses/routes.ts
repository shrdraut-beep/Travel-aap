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

import type { Express } from "express";
import { zuelpayService } from "../../services/zuelpay.service.ts";
import { busLookupService } from "../../services/busLookup.ts";

export function registerBusRoutes(app: Express): void {

app.post("/api/buses/search", async (req, res) => {
  try {
    const { origin, destination, date, busType, passengers } = req.body;
    const buses = await zuelpayService.searchBuses({ origin, destination, date, busType, passengers });
    return res.status(200).json({ success: true, results: buses, buses });
  } catch (err: any) {
    try {
      const fallbackBuses = busLookupService.searchBuses({ origin: req.body.origin, destination: req.body.destination, date: req.body.date });
      return res.status(200).json({ success: true, results: fallbackBuses, buses: fallbackBuses });
    } catch (e: any) {
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
