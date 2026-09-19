import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Meilisearch, Index } from 'meilisearch';

export const MEILI_INDEX_HOTELS = 'hotels';
export const MEILI_INDEX_AIRPORTS = 'airports';
export const MEILI_INDEX_TRAIN_STATIONS = 'train_stations';

export interface MeiliHotelDoc {
  id: string;
  name: string;
  city_id: string;
  city: string;
  state?: string;
  address?: string;
  price: number;
  star_rating: number;
  rating?: number;
  amenities: string[];
  propertyType?: string;
  refundType?: string;
  imageUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
}

export interface MeiliAirportDoc {
  id: string;
  iata_code: string;
  airport_name: string;
  city: string;
  municipality?: string;
  iso_country: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
  keywords?: string;
}

export interface MeiliStationDoc {
  id: string;
  code: string;
  name: string;
  state?: string;
  zone?: string;
  address?: string;
  coordinates?: [number, number];
}

export interface HotelSearchFilters {
  q?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  amenities?: string[] | string;
  propertyType?: string;
  refundType?: string;
  sort?: string; // e.g. 'price:asc', 'price:desc', 'star_rating:desc'
  limit?: number;
  offset?: number;
}

export const MASTER_HOTELS_DATA: MeiliHotelDoc[] = [
  {
    id: 'HTL-BOM-001',
    name: 'The Taj Mahal Palace & Tower',
    city_id: 'BOM',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Apollo Bunder, Colaba, Mumbai 400001',
    price: 18500,
    star_rating: 5,
    rating: 4.9,
    amenities: ['Free Wi-Fi', 'Swimming Pool', 'Spa & Wellness', 'Fine Dining Bar', 'Airport Shuttle', 'Valet Parking'],
    propertyType: 'Heritage Luxury Palace',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 22 6665 3366',
    contactEmail: 'tajpalace.mumbai@tajhotels.com',
  },
  {
    id: 'HTL-BOM-002',
    name: 'Trident Hotel Nariman Point',
    city_id: 'BOM',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'CR 2 Nariman Point, Netaji Subhash Chandra Bose Road, Mumbai 400021',
    price: 11200,
    star_rating: 5,
    rating: 4.7,
    amenities: ['Sea View Rooms', 'Free Wi-Fi', 'Fitness Center', 'Outdoor Pool', '24/7 Room Service'],
    propertyType: 'Business Luxury Hotel',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 22 6632 4343',
    contactEmail: 'reservations@tridenthotels.com',
  },
  {
    id: 'HTL-DEL-001',
    name: 'The Leela Palace New Delhi',
    city_id: 'DEL',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Diplomatic Enclave, Chanakyapuri, New Delhi 110023',
    price: 16800,
    star_rating: 5,
    rating: 4.8,
    amenities: ['Rooftop Infinity Pool', 'Spa', 'Free Wi-Fi', 'Air Conditioned Rooms (AC)', 'Michelin Star Dining'],
    propertyType: 'Modern Palace',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 11 3933 1234',
    contactEmail: 'reservations.delhi@theleela.com',
  },
  {
    id: 'HTL-GOI-001',
    name: 'W Goa Resort & Spa',
    city_id: 'GOI',
    city: 'Goa',
    state: 'Goa',
    address: 'Vagator Beach, Bardez, Goa 403509',
    price: 14500,
    star_rating: 5,
    rating: 4.7,
    amenities: ['Beachfront Access', 'Private Villas', 'Rock Pool Bar', 'Free Wi-Fi', 'Pet Friendly'],
    propertyType: 'Beach Resort',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 832 671 8888',
    contactEmail: 'w.goa@whotels.com',
  },
  {
    id: 'HTL-ISK-001',
    name: 'Radisson Blu Hotel & Spa Nashik',
    city_id: 'ISK',
    city: 'Nashik',
    state: 'Maharashtra',
    address: 'Pathardi Phata, Mumbai-Agra Highway, Nashik 422010',
    price: 6400,
    star_rating: 5,
    rating: 4.6,
    amenities: ['Free Wi-Fi', 'Vineyard Tours', 'Swimming Pool', 'Luxury Spa', 'Conference Banquet'],
    propertyType: 'Boutique Hotel',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 253 664 4444',
    contactEmail: 'info.nashik@radissonblu.com',
  },
  {
    id: 'HTL-JAI-001',
    name: 'Rambagh Palace Jaipur',
    city_id: 'JAI',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Bhawani Singh Road, Jaipur 302005',
    price: 24000,
    star_rating: 5,
    rating: 4.9,
    amenities: ['Royal Gardens', 'Polo Bar', 'Indoor Heated Pool', 'Heritage Walk', 'Free Wi-Fi'],
    propertyType: 'Heritage Grand Palace',
    refundType: 'NON_REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 141 238 5700',
    contactEmail: 'rambagh.jaipur@tajhotels.com',
  },
  {
    id: 'HTL-BLR-001',
    name: 'The Oberoi Bengaluru',
    city_id: 'BLR',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '37-39 Mahatma Gandhi Road, Bengaluru 560001',
    price: 9800,
    star_rating: 5,
    rating: 4.8,
    amenities: ['Garden Balconies', 'Free Wi-Fi', 'Ayurvedic Spa', 'Outdoor Heated Pool', 'Business Center'],
    propertyType: 'Business Luxury Hotel',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 80 2558 5858',
    contactEmail: 'generalmanager.bangalore@oberoihotels.com',
  },
  {
    id: 'HTL-BOM-003',
    name: 'Hotel Suba Palace Colaba',
    city_id: 'BOM',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Apollo Bunder, Near Gateway of India, Mumbai 400039',
    price: 3900,
    star_rating: 3,
    rating: 4.2,
    amenities: ['Free Wi-Fi', 'Breakfast Included', 'Air Conditioned Rooms (AC)', 'Elevator'],
    propertyType: 'Budget Boutique Hotel',
    refundType: 'REFUNDABLE',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    contactPhone: '+91 22 2202 0636',
    contactEmail: 'subapalace@subahotels.com',
  },
];

class MeilisearchService {
  private client: Meilisearch | null = null;
  private host: string;
  private apiKey: string;
  private isInitialized = false;

  // Cached fallback dataset records
  private cachedAirports: MeiliAirportDoc[] | null = null;
  private cachedStations: MeiliStationDoc[] | null = null;

  constructor() {
    this.host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    this.apiKey = process.env.MEILISEARCH_API_KEY || 'masterKey1234567890RoutripoSecure';
  }

  public getClient(): Meilisearch {
    if (!this.client) {
      this.client = new Meilisearch({
        host: this.host,
        apiKey: this.apiKey,
      });
    }
    return this.client;
  }

  public async checkHealth(): Promise<{ healthy: boolean; host: string; message: string; stats?: any }> {
    try {
      const client = this.getClient();
      const health = await client.health();
      let stats = null;
      try {
        stats = await client.getStats();
      } catch (e) {
        /* stats optional */
      }

      return {
        healthy: health.status === 'available',
        host: this.host,
        message: 'Meilisearch engine is healthy and operational',
        stats,
      };
    } catch (err: any) {
      return {
        healthy: false,
        host: this.host,
        message: `Self-hosted Meilisearch unreachable at ${this.host}: ${err?.message || 'Connection refused'}. Run 'docker-compose up -d meilisearch' to start it.`,
      };
    }
  }

  /**
   * Initializes index settings (searchable, filterable, sortable attributes).
   */
  public async configureIndexSettings(): Promise<void> {
    const client = this.getClient();

    // 1. Hotels Index Setup
    const hotelsIndex = client.index(MEILI_INDEX_HOTELS);
    await hotelsIndex.updateSettings({
      searchableAttributes: ['name', 'city', 'state', 'address', 'amenities', 'propertyType'],
      filterableAttributes: ['price', 'star_rating', 'city_id', 'city', 'amenities', 'propertyType', 'refundType'],
      sortableAttributes: ['price', 'star_rating', 'rating'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    });

    // 2. Airports Index Setup
    const airportsIndex = client.index(MEILI_INDEX_AIRPORTS);
    await airportsIndex.updateSettings({
      searchableAttributes: ['iata_code', 'airport_name', 'city', 'municipality', 'country', 'keywords'],
      filterableAttributes: ['iata_code', 'city', 'iso_country', 'type'],
      sortableAttributes: ['airport_name', 'iata_code'],
      rankingRules: ['exactness', 'words', 'typo', 'proximity', 'attribute', 'sort'],
    });

    // 3. Train Stations Index Setup
    const stationsIndex = client.index(MEILI_INDEX_TRAIN_STATIONS);
    await stationsIndex.updateSettings({
      searchableAttributes: ['code', 'name', 'state', 'address', 'zone'],
      filterableAttributes: ['code', 'state', 'zone'],
      sortableAttributes: ['name', 'code'],
      rankingRules: ['exactness', 'words', 'typo', 'proximity', 'attribute', 'sort'],
    });

    this.isInitialized = true;
  }

  /**
   * Dynamic Hotel search with faceted filters
   */
  public async searchHotels(params: HotelSearchFilters) {
    try {
      const client = this.getClient();
      const index = client.index<MeiliHotelDoc>(MEILI_INDEX_HOTELS);

      const filterConditions: string[] = [];

      if (params.city && params.city.trim().length > 0) {
        filterConditions.push(`city = "${params.city.trim()}"`);
      }
      if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
        filterConditions.push(`price >= ${params.minPrice}`);
      }
      if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice)) {
        filterConditions.push(`price <= ${params.maxPrice}`);
      }
      if (typeof params.starRating === 'number' && !isNaN(params.starRating) && params.starRating > 0) {
        filterConditions.push(`star_rating >= ${params.starRating}`);
      }
      if (params.propertyType && params.propertyType.trim().length > 0) {
        filterConditions.push(`propertyType = "${params.propertyType.trim()}"`);
      }
      if (params.refundType && params.refundType.trim().length > 0) {
        filterConditions.push(`refundType = "${params.refundType.trim()}"`);
      }
      if (params.amenities) {
        const amenitiesList = Array.isArray(params.amenities)
          ? params.amenities
          : params.amenities.split(',').map((a) => a.trim()).filter(Boolean);

        amenitiesList.forEach((amenity) => {
          filterConditions.push(`amenities = "${amenity}"`);
        });
      }

      const filter = filterConditions.length > 0 ? filterConditions.join(' AND ') : undefined;
      const sort = params.sort ? [params.sort] : undefined;
      const limit = params.limit ? Math.min(Math.max(Number(params.limit), 1), 100) : 20;
      const offset = params.offset ? Math.max(Number(params.offset), 0) : 0;

      const searchResults = await index.search(params.q || '', {
        filter,
        sort,
        limit,
        offset,
        facets: ['star_rating', 'city', 'amenities', 'propertyType', 'refundType'],
      });

      return {
        ...searchResults,
        source: 'meilisearch-self-hosted',
      };
    } catch (err: any) {
      // Graceful local dataset fallback when Meilisearch is not started
      return this.fallbackSearchHotels(params);
    }
  }

  private fallbackSearchHotels(params: HotelSearchFilters) {
    let filtered = [...MASTER_HOTELS_DATA];

    if (params.q) {
      const qLower = params.q.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(qLower) ||
          h.city.toLowerCase().includes(qLower) ||
          h.address?.toLowerCase().includes(qLower) ||
          h.amenities.some((a) => a.toLowerCase().includes(qLower))
      );
    }

    if (params.city) {
      const cLower = params.city.toLowerCase();
      filtered = filtered.filter((h) => h.city.toLowerCase() === cLower);
    }
    if (typeof params.minPrice === 'number') {
      filtered = filtered.filter((h) => h.price >= params.minPrice!);
    }
    if (typeof params.maxPrice === 'number') {
      filtered = filtered.filter((h) => h.price <= params.maxPrice!);
    }
    if (typeof params.starRating === 'number') {
      filtered = filtered.filter((h) => h.star_rating >= params.starRating!);
    }
    if (params.propertyType) {
      filtered = filtered.filter((h) => h.propertyType?.toLowerCase() === params.propertyType!.toLowerCase());
    }

    // Sort
    if (params.sort === 'price:asc') filtered.sort((a, b) => a.price - b.price);
    else if (params.sort === 'price:desc') filtered.sort((a, b) => b.price - a.price);
    else if (params.sort === 'star_rating:desc') filtered.sort((a, b) => b.star_rating - a.star_rating);

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const hits = filtered.slice(offset, offset + limit);

    // Compute facet counts
    const cityFacets: Record<string, number> = {};
    const starFacets: Record<string, number> = {};
    filtered.forEach((h) => {
      cityFacets[h.city] = (cityFacets[h.city] || 0) + 1;
      starFacets[h.star_rating.toString()] = (starFacets[h.star_rating.toString()] || 0) + 1;
    });

    return {
      hits,
      totalHits: filtered.length,
      limit,
      offset,
      facetDistribution: {
        city: cityFacets,
        star_rating: starFacets,
      },
      source: 'local-dataset-fallback',
      notice: 'Meilisearch engine offline; serving from master cache. Start Meilisearch via docker-compose up -d for indexing.',
    };
  }

  /**
   * Fast Airport search / autocomplete by code, name or city
   */
  public async searchAirports(query: string, limit: number = 10) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    try {
      const client = this.getClient();
      const index = client.index<MeiliAirportDoc>(MEILI_INDEX_AIRPORTS);
      const results = await index.search(query, {
        limit: safeLimit,
        attributesToHighlight: ['iata_code', 'airport_name', 'city'],
      });
      return {
        ...results,
        source: 'meilisearch-self-hosted',
      };
    } catch (err) {
      return this.fallbackSearchAirports(query, safeLimit);
    }
  }

  private fallbackSearchAirports(query: string, limit: number) {
    if (!this.cachedAirports) {
      this.loadLocalAirports();
    }

    const qLower = query.toLowerCase().trim();
    const qUpper = query.toUpperCase().trim();
    const hits = (this.cachedAirports || [])
      .filter(
        (a) =>
          a.iata_code.toLowerCase() === qLower ||
          a.iata_code.toLowerCase().includes(qLower) ||
          a.airport_name.toLowerCase().includes(qLower) ||
          a.city.toLowerCase().includes(qLower)
      )
      .sort((a, b) => {
        if (a.iata_code === qUpper && b.iata_code !== qUpper) return -1;
        if (b.iata_code === qUpper && a.iata_code !== qUpper) return 1;
        return 0;
      })
      .slice(0, limit);

    return {
      hits,
      totalHits: hits.length,
      limit,
      source: 'local-dataset-fallback',
    };
  }

  private loadLocalAirports() {
    try {
      const csvPath = path.join(process.cwd(), 'public', 'data', 'airports.csv');
      if (fs.existsSync(csvPath)) {
        const raw = fs.readFileSync(csvPath, 'utf8');
        const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true });
        const rows: any[] = parsed.data as any[];
        const airports: MeiliAirportDoc[] = [];
        const seen = new Set<string>();

        for (const row of rows) {
          const iata = (row.iata_code || '').trim().toUpperCase();
          if (iata && iata.length === 3 && !seen.has(iata)) {
            seen.add(iata);
            airports.push({
              id: iata,
              iata_code: iata,
              airport_name: (row.name || '').replace(/['"]/g, '').trim(),
              city: (row.municipality || '').replace(/['"]/g, '').trim(),
              municipality: (row.municipality || '').replace(/['"]/g, '').trim(),
              iso_country: (row.iso_country || '').trim(),
              country: row.iso_country === 'IN' ? 'India' : (row.iso_country || ''),
              latitude: Number(row.latitude_deg || 0),
              longitude: Number(row.longitude_deg || 0),
              type: row.type || 'airport',
            });
          }
        }
        this.cachedAirports = airports;
      }
    } catch (e) {
      this.cachedAirports = [];
    }
  }

  /**
   * Fast Railway Station search / autocomplete by code or name
   */
  public async searchTrainStations(query: string, limit: number = 10) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    try {
      const client = this.getClient();
      const index = client.index<MeiliStationDoc>(MEILI_INDEX_TRAIN_STATIONS);
      const results = await index.search(query, {
        limit: safeLimit,
        attributesToHighlight: ['code', 'name', 'state'],
      });
      return {
        ...results,
        source: 'meilisearch-self-hosted',
      };
    } catch (err) {
      return this.fallbackSearchTrainStations(query, safeLimit);
    }
  }

  private fallbackSearchTrainStations(query: string, limit: number) {
    if (!this.cachedStations) {
      this.loadLocalTrainStations();
    }

    const qLower = query.toLowerCase().trim();
    const qUpper = query.toUpperCase().trim();
    const hits = (this.cachedStations || [])
      .filter(
        (s) =>
          s.code.toLowerCase() === qLower ||
          s.code.toLowerCase().includes(qLower) ||
          s.name.toLowerCase().includes(qLower) ||
          (s.state && s.state.toLowerCase().includes(qLower))
      )
      .sort((a, b) => {
        if (a.code === qUpper && b.code !== qUpper) return -1;
        if (b.code === qUpper && a.code !== qUpper) return 1;
        return 0;
      })
      .slice(0, limit);

    return {
      hits,
      totalHits: hits.length,
      limit,
      source: 'local-dataset-fallback',
    };
  }

  private loadLocalTrainStations() {
    try {
      const jsonPath = path.join(process.cwd(), 'public', 'data', 'stations.json');
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        const geojson = JSON.parse(raw);
        const features = Array.isArray(geojson.features) ? geojson.features : [];
        const stations: MeiliStationDoc[] = [];
        const seen = new Set<string>();

        for (const feat of features) {
          const props = feat.properties || {};
          const code = (props.code || '').trim().toUpperCase();
          const name = (props.name || '').trim();

          if (code && !code.startsWith('XX-') && !code.startsWith('YY-') && !seen.has(code)) {
            seen.add(code);
            stations.push({
              id: code,
              code,
              name: name || code,
              state: props.state || '',
              zone: props.zone || '',
              address: props.address || '',
            });
          }
        }
        this.cachedStations = stations;
      }
    } catch (e) {
      this.cachedStations = [];
    }
  }

  /**
   * Adds or updates documents in batch with chunking
   */
  public async addDocumentsInBatches<T extends Record<string, any>>(
    indexName: string,
    documents: T[],
    batchSize: number = 1000
  ) {
    const client = this.getClient();
    const index = client.index(indexName);

    const totalBatches = Math.ceil(documents.length / batchSize);
    console.log(`[Meilisearch] Queuing ${documents.length} docs to index '${indexName}' across ${totalBatches} batch(es)...`);

    for (let i = 0; i < documents.length; i += batchSize) {
      const chunk = documents.slice(i, i + batchSize);
      const task = await index.addDocuments(chunk);
      console.log(`[Meilisearch] Index '${indexName}' batch ${Math.floor(i / batchSize) + 1}/${totalBatches} queued. Enqueued Task UID: ${task.taskUid}`);
    }
  }

  public getLocalAirports(): MeiliAirportDoc[] {
    if (!this.cachedAirports) {
      this.loadLocalAirports();
    }
    return this.cachedAirports || [];
  }

  public getLocalTrainStations(): MeiliStationDoc[] {
    if (!this.cachedStations) {
      this.loadLocalTrainStations();
    }
    return this.cachedStations || [];
  }
}

export const meilisearchService = new MeilisearchService();

/**
 * Multi-Index Sync Function (Firestore to Meilisearch)
 * Syncs master_hotels -> hotels, master_airports -> airports, master_train_stations -> train_stations
 */
export async function syncAllVerticalsToMeilisearch(db?: any) {
  try {
    const client = meilisearchService.getClient();

    // 1. Hotels Index Sync
    let hotels: any[] = [];
    if (db) {
      try {
        const snap = await db.collection('master_hotels').get();
        if (!snap.empty) {
          hotels = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        /* fallback */
      }
    }
    if (hotels.length === 0) {
      hotels = MASTER_HOTELS_DATA;
    }
    await client.index(MEILI_INDEX_HOTELS).addDocuments(hotels);

    // 2. Airports Index Sync
    let airports: any[] = [];
    if (db) {
      try {
        const snap = await db.collection('master_airports').get();
        if (!snap.empty) {
          airports = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        /* fallback */
      }
    }
    if (airports.length === 0) {
      airports = meilisearchService.getLocalAirports();
    }
    if (airports.length > 0) {
      await meilisearchService.addDocumentsInBatches(MEILI_INDEX_AIRPORTS, airports, 1000);
    }

    // 3. Train Stations Index Sync
    let trains: any[] = [];
    if (db) {
      try {
        const snap = await db.collection('master_train_stations').get();
        if (!snap.empty) {
          trains = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        /* fallback */
      }
    }
    if (trains.length === 0) {
      trains = meilisearchService.getLocalTrainStations();
    }
    if (trains.length > 0) {
      await meilisearchService.addDocumentsInBatches(MEILI_INDEX_TRAIN_STATIONS, trains, 1000);
    }

    console.log('Successfully synced all verticals to Meilisearch indexes!');
    return {
      success: true,
      hotels: hotels.length,
      airports: airports.length,
      train_stations: trains.length,
    };
  } catch (error) {
    console.error('Error syncing to Meilisearch:', error);
    throw error;
  }
}
