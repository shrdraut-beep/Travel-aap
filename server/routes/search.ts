import express, { Request, Response } from 'express';
import { travelportService } from '../services/travelport.ts';
import { busLookupService } from '../services/busLookup.ts';
import { CarService } from '../services/CarService.ts';
import { getSafeAdminFirestore } from '../firebaseAdmin.ts';
import {
  meilisearchService,
  syncAllVerticalsToMeilisearch,
  type HotelSearchFilters,
} from '../services/meilisearchService.ts';
import { photonService } from '../services/photonService.ts';

const router = express.Router();
const carService = new CarService();

// ============================================================================
// UNIFIED SEARCH & SYNC ENDPOINTS (Hotels, Airports, Trains, Locations)
// ============================================================================

// 1. Unified Multi-Index Search API Endpoint (GET /api/search)
router.get(['/', '/unified'], async (req: Request, res: Response) => {
  try {
    const q = (req.query.q || req.query.query || '').toString().trim();
    const index = (req.query.index || 'cities').toString().toLowerCase();
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    // Strict 3-Character validation: Do not search or return results below 3 characters
    if (!q || q.length < 3) {
      return res.status(200).json({
        success: true,
        query: q,
        cities: [],
        hotels: [],
        airports: [],
        train_stations: [],
        totalHits: 0,
        message: 'Minimum 3 characters required for search',
      });
    }

    // Multi-Index Federated Search: Searches Master Cities, Hotels, Airports & Stations simultaneously
    if (index === 'all' || index === 'universal') {
      const [cities, hotels, airports, stations] = await Promise.all([
        meilisearchService.searchCities(q, Math.min(limit, 10)),
        meilisearchService.searchHotels({ q, limit }),
        meilisearchService.searchAirports(q, Math.min(limit, 10)),
        meilisearchService.searchTrainStations(q, Math.min(limit, 10)),
      ]);

      return res.status(200).json({
        success: true,
        query: q,
        cities: (cities as any)?.hits || [],
        hotels: (hotels as any)?.hits || [],
        airports: (airports as any)?.hits || [],
        train_stations: (stations as any)?.hits || [],
        totalHits: ((cities as any)?.totalHits || 0) + ((hotels as any)?.totalHits || 0) + ((airports as any)?.totalHits || 0) + ((stations as any)?.totalHits || 0),
        source: (cities as any)?.source || (hotels as any)?.source || 'meilisearch-self-hosted',
      });
    }

    // Specific Index Searches
    if (index === 'cities' || index === 'city') {
      const results = await meilisearchService.searchCities(q, limit);
      return res.status(200).json({ success: true, query: q, ...results });
    }

    if (index === 'airports' || index === 'flights') {
      const results = await meilisearchService.searchAirports(q, limit);
      return res.status(200).json({ success: true, query: q, ...results });
    }

    if (index === 'train_stations' || index === 'trains' || index === 'railways') {
      const results = await meilisearchService.searchTrainStations(q, limit);
      return res.status(200).json({ success: true, query: q, ...results });
    }

    if (index === 'locations' || index === 'places') {
      const results = await photonService.searchLocations(q, limit);
      return res.status(200).json({ success: true, query: q, ...results });
    }

    // Default: Hotels Search with full faceted filtering
    const searchFilters: HotelSearchFilters = {
      q,
      city: req.query.city ? req.query.city.toString() : undefined,
      minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
      starRating: req.query.starRating !== undefined ? Number(req.query.starRating) : undefined,
      amenities: req.query.amenities as string | string[] | undefined,
      propertyType: req.query.propertyType ? req.query.propertyType.toString() : undefined,
      refundType: req.query.refundType ? req.query.refundType.toString() : undefined,
      sort: req.query.sort ? req.query.sort.toString() : undefined,
      limit,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };

    const results = await meilisearchService.searchHotels(searchFilters);
    return res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error('[Search] Unified Search Error:', error);
    return res.status(500).json({ error: error?.message || 'Search failed' });
  }
});

// 2. Real-Time Firestore to Meilisearch Sync Endpoint (POST /api/sync-search)
router.post(['/sync-search', '/sync'], async (req: Request, res: Response) => {
  try {
    const { collectionName, indexName } = req.body || {};

    if (!collectionName || !indexName) {
      return res.status(400).json({
        error: 'Missing required parameters: collectionName and indexName',
        example: { collectionName: 'master_hotels', indexName: 'hotels' },
      });
    }

    let documents: any[] = [];
    const db = getSafeAdminFirestore();
    if (db) {
      try {
        const snapshot = await db.collection(collectionName).get();
        documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch {
        // Fallback to local
      }
    }

    // Fallback if local collections are empty
    if (documents.length === 0) {
      if (collectionName.includes('hotel') || indexName.includes('hotel')) {
        documents = meilisearchService['fallbackSearchHotels']({ limit: 100 }).hits;
      } else if (collectionName.includes('airport') || indexName.includes('airport')) {
        documents = meilisearchService.getLocalAirports();
      } else if (collectionName.includes('train') || indexName.includes('train')) {
        documents = meilisearchService.getLocalTrainStations();
      }
    }

    const client = meilisearchService.getClient();
    const index = client.index(indexName);
    await index.addDocuments(documents);

    return res.status(200).json({
      success: true,
      message: `Synced ${documents.length} docs from '${collectionName}' to Meilisearch index '${indexName}'`,
      count: documents.length,
      index: indexName,
    });
  } catch (error: any) {
    console.error('[Search] Sync Error:', error);
    return res.status(500).json({ error: error?.message || 'Sync Failed' });
  }
});

// 3. Multi-Vertical Full Sync Trigger (POST /api/sync-all)
router.post('/sync-all', async (_req: Request, res: Response) => {
  try {
    const db = getSafeAdminFirestore();
    const stats = await syncAllVerticalsToMeilisearch(db);
    return res.status(200).json({
      success: true,
      message: 'Successfully synced all verticals to Meilisearch indexes!',
      ...stats,
    });
  } catch (error: any) {
    console.error('[Search] Sync All Error:', error);
    return res.status(500).json({ error: error?.message || 'Sync All Failed' });
  }
});

// 4. Meilisearch Engine Health Check
router.get('/meili/health', async (_req: Request, res: Response) => {
  const health = await meilisearchService.checkHealth();
  res.status(health.healthy ? 200 : 503).json(health);
});

// 5. Hotels Search with Dynamic Facets (Price, Rating, Amenities, City)
router.all('/meili/hotels', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;

    const searchFilters: HotelSearchFilters = {
      q: typeof params.q === 'string' ? params.q : (params.destination || params.location || params.city || '').toString(),
      city: params.city ? params.city.toString() : undefined,
      minPrice: params.minPrice !== undefined ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice !== undefined ? Number(params.maxPrice) : undefined,
      starRating: params.starRating !== undefined ? Number(params.starRating) : undefined,
      amenities: params.amenities,
      propertyType: params.propertyType ? params.propertyType.toString() : undefined,
      refundType: params.refundType ? params.refundType.toString() : undefined,
      sort: params.sort ? params.sort.toString() : undefined,
      limit: params.limit ? Number(params.limit) : 20,
      offset: params.offset ? Number(params.offset) : 0,
    };

    const results = await meilisearchService.searchHotels(searchFilters);
    res.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    console.error('[Search] Meilisearch hotel search error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Meilisearch hotel query failed',
      hint: 'Ensure Meilisearch container is running at MEILISEARCH_HOST',
    });
  }
});

// 3. Airports Search & Instant IATA Autocomplete
router.all('/meili/airports', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const query = (params.q || params.query || params.search || '').toString().trim();
    const limit = params.limit ? Number(params.limit) : 10;

    if (!query) {
      return res.json({ success: true, hits: [], totalHits: 0 });
    }

    const results = await meilisearchService.searchAirports(query, limit);
    res.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    console.error('[Search] Meilisearch airport search error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Airport lookup failed',
    });
  }
});

// 4. Train Stations Search & Station Code Lookup
router.all('/meili/train-stations', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const query = (params.q || params.query || params.search || '').toString().trim();
    const limit = params.limit ? Number(params.limit) : 10;

    if (!query) {
      return res.json({ success: true, hits: [], totalHits: 0 });
    }

    const results = await meilisearchService.searchTrainStations(query, limit);
    res.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    console.error('[Search] Meilisearch train station search error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Train station lookup failed',
    });
  }
});

// 4b. Master Cities Search & City ID Lookup
router.all('/cities', async (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const query = (params.q || params.query || params.search || '').toString().trim();
    const limit = params.limit ? Number(params.limit) : 10;

    if (!query || query.length < 3) {
      return res.json({ success: true, hits: [], totalHits: 0, message: 'Minimum 3 characters required' });
    }

    const results = await meilisearchService.searchCities(query, limit);
    res.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    console.error('[Search] City search error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'City lookup failed',
    });
  }
});

// 5. Komoot Photon Location & City Autocomplete
router.get('/locations/autocomplete', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q || req.query.query || '').toString().trim();
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const lang = (req.query.lang || 'en').toString();

    const response = await photonService.searchLocations(query, limit, lang);
    res.json({
      success: true,
      ...response,
    });
  } catch (err: any) {
    console.error('[Search] Photon geocoding error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Location autocomplete failed',
    });
  }
});

// ============================================================================
// LEGACY & GDS VENDOR SEARCH ENDPOINTS
// ============================================================================

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

