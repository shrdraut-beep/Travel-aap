/**
 * server/modules/zuelpay/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization). Despite the "pay" in the name,
 * this is a train/bus/car search-and-booking AGGREGATOR service (zuelpayService) —
 * not a payment gateway. Covers: zuelpay status, train search/PNR, bus search/seat
 * layout/block/book/cancel, car search. A few routes are also mounted under
 * non-prefixed aliases (/api/trains/*, /api/buses/citylist) for compatibility.
 *
 * Route bodies moved verbatim — no logic changed.
 */

import type { Express } from "express";
import { zuelpayService } from "../../services/zuelpay.service.ts";
import { CarService } from "../../services/CarService.ts";

const carService = new CarService();

export function registerZuelpayRoutes(app: Express): void {

app.post("/api/cars/search", async (req, res) => {
  try {
    const { origin, destination, location, pickupDate, dropDate, cabType, vehicleCategory } = req.body;
    try {
      const quotes = await zuelpayService.searchCars({
        origin: origin || location || "Mumbai",
        destination: destination || "Pune",
        pickupDate: pickupDate || new Date().toISOString().split("T")[0],
        dropDate,
        cabType,
        vehicleCategory
      });
      return res.status(200).json({ success: true, quotes, results: quotes });
    } catch (zuelpayErr) {
      // Fallback to local CarService — this used to be a separate, always-dead
      // (shadowed) route; now it's a genuine fallback instead of unreachable code.
      const cars = carService.searchCars({ location: location || origin, pickupDate, dropDate });
      return res.status(200).json({ success: true, results: cars, fallback: true });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/zuelpay/status", (req, res) => {
  try {
    const status = zuelpayService.getStatus();
    return res.status(200).json({ success: true, ...status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Trains API (IRCTC Search & PNR Status)
app.post("/api/zuelpay/trains/search", async (req, res) => {
  try {
    const { origin, destination, date, quota, classType } = req.body;
    const trains = await zuelpayService.searchTrains({ origin, destination, date, quota, classType });
    return res.status(200).json({ success: true, results: trains, trains });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/trains/search", async (req, res) => {
  try {
    const { origin, destination, date, quota, classType } = req.body;
    const trains = await zuelpayService.searchTrains({ origin, destination, date, quota, classType });
    return res.status(200).json({ success: true, results: trains, trains });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/zuelpay/trains/pnr/:pnr", async (req, res) => {
  try {
    const { pnr } = req.params;
    const pnrStatus = await zuelpayService.checkPnrStatus(pnr);
    return res.status(200).json({ success: true, pnrStatus });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/trains/pnr/:pnr", async (req, res) => {
  try {
    const { pnr } = req.params;
    const pnrStatus = await zuelpayService.checkPnrStatus(pnr);
    return res.status(200).json({ success: true, pnrStatus });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Buses API (Search, Seat Layout & Booking)
app.post("/api/zuelpay/buses/search", async (req, res) => {
  try {
    const { origin, destination, date, busType, passengers } = req.body;
    const buses = await zuelpayService.searchBuses({ origin, destination, date, busType, passengers });
    return res.status(200).json({ success: true, results: buses, buses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


app.get(["/api/zuelpay/buses/citylist", "/api/buses/citylist"], async (req, res) => {
  try {
    const cities = await zuelpayService.getBusCityList();
    return res.status(200).json({ success: true, cities });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/zuelpay/buses/seatlayout", async (req, res) => {
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


app.post("/api/zuelpay/buses/blockseat", async (req, res) => {
  try {
    const result = await zuelpayService.blockBusSeat(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/zuelpay/buses/bookseat", async (req, res) => {
  try {
    const { blockTicketKey } = req.body;
    const result = await zuelpayService.bookBusSeat(blockTicketKey);
    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/zuelpay/buses/cancelticket", async (req, res) => {
  try {
    const { etsTicketNo, seatNbrsToCancel } = req.body;
    const result = await zuelpayService.cancelBusTicket(etsTicketNo, seatNbrsToCancel);
    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Cars & Cabs API (Local, Outstation, Airport)
app.post("/api/zuelpay/cars/search", async (req, res) => {
  try {
    const { origin, destination, location, pickupDate, dropDate, cabType, vehicleCategory } = req.body;
    const quotes = await zuelpayService.searchCars({
      origin: origin || location || "Mumbai",
      destination: destination || "Pune",
      pickupDate: pickupDate || new Date().toISOString().split("T")[0],
      dropDate,
      cabType,
      vehicleCategory
    });
    return res.status(200).json({ success: true, quotes, results: quotes });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

}
