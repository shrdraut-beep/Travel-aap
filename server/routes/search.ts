import express, { Request, Response } from 'express';
import { travelportService } from '../services/travelport.ts';
import { busLookupService } from '../services/busLookup.ts';
import { CarService } from '../services/CarService.ts';

const router = express.Router();
const carService = new CarService();

// Hotels Search (GET & POST)
router.all('/hotels', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const dest = (params.destination || params.location || params.city || 'Mumbai').toString();
    const cIn = params.checkIn || params.checkInDate;
    const cOut = params.checkOut || params.checkOutDate;
    const adults = params.adults ? Number(params.adults) : 2;
    const rooms = params.rooms ? Number(params.rooms) : 1;

    const hotels = await travelportService.searchHotels({
      destination: dest,
      checkInDate: cIn,
      checkOutDate: cOut,
      adults,
      rooms
    });
    res.json({ success: true, results: hotels });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Hotel search failed' });
  }
});

// Buses Search (GET & POST)
router.all('/buses', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const origin = (params.origin || 'Mumbai').toString();
    const destination = (params.destination || 'Goa').toString();
    const date = (params.date || new Date().toISOString().split('T')[0]).toString();

    const buses = busLookupService.searchBuses({ origin, destination, date });
    res.json({ success: true, results: buses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Bus search failed' });
  }
});

// Cars Search (GET & POST)
router.all('/cars', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const location = (params.location || 'Mumbai').toString();
    const pickupDate = params.pickupDate;
    const dropDate = params.dropDate;

    const cars = carService.searchCars({ location, pickupDate, dropDate });
    res.json({ success: true, results: cars });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Car search failed' });
  }
});

// Flights Search (GET & POST)
router.all('/flights', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const origin = (params.origin || 'BOM').toString().toUpperCase();
    const destination = (params.destination || 'DEL').toString().toUpperCase();
    const departDate = params.departDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const returnDate = params.returnDate;
    const adults = params.adults ? Number(params.adults) : 1;
    const cabinClass = params.cabinClass || 'Economy';

    const flights = await travelportService.searchFlights({
      origin,
      destination,
      departDate,
      returnDate,
      adults,
      cabinClass
    });

    res.json({
      success: true,
      flights: flights && flights.length > 0 ? flights : travelportService.generateFallbackFlights({
        origin,
        destination,
        departDate,
        adults,
        cabinClass
      })
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Flight search failed' });
  }
});

export default router;
