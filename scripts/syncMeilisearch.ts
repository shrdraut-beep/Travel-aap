import * as dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Papa from 'papaparse';
import {
  meilisearchService,
  MEILI_INDEX_HOTELS,
  MEILI_INDEX_AIRPORTS,
  MEILI_INDEX_TRAIN_STATIONS,
  MASTER_HOTELS_DATA,
  type MeiliHotelDoc,
  type MeiliAirportDoc,
  type MeiliStationDoc,
} from '../server/services/meilisearchService.ts';

// -----------------------------------------------------------------------------
// 1. Firebase Admin Initialization (Safe & Non-Crashing)
// -----------------------------------------------------------------------------
function getAdminFirestoreInstance() {
  try {
    const apps = getApps();
    let app = apps.length > 0 ? apps[0] : null;
    if (!app) {
      let firebaseConfig: any = {};
      try {
        firebaseConfig = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8')
        );
      } catch (e) {
        // config optional
      }

      app = initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'ai-studio-grouptravelplann-f077e851',
      });
    }

    const dbId = process.env.FIREBASE_DATABASE_ID || '(default)';
    return getFirestore(app);
  } catch (err: any) {
    console.warn(`[Sync] Firebase Admin SDK unavailable in current environment: ${err?.message || err}. Falling back to local master datasets.`);
    return null;
  }
}

// -----------------------------------------------------------------------------
// 2. Sync Functions
// -----------------------------------------------------------------------------

async function syncHotels(db: any): Promise<number> {
  console.log('\n[Sync] 1/3 Starting Hotels Index Synchronization...');
  let hotelDocs: MeiliHotelDoc[] = [];

  if (db) {
    try {
      const snap = await db.collection('master_hotels').get();
      if (!snap.empty) {
        snap.forEach((doc: any) => {
          const data = doc.data();
          hotelDocs.push({
            id: doc.id,
            name: data.name || data.propertyName || 'Hotel Property',
            city_id: data.city_id || data.cityCode || 'BOM',
            city: data.city || 'Mumbai',
            state: data.state || '',
            address: data.address || '',
            price: Number(data.price || data.basePrice || 2500),
            star_rating: Number(data.star_rating || data.stars || 3),
            rating: Number(data.rating || 4.2),
            amenities: Array.isArray(data.amenities) ? data.amenities : ['Free Wi-Fi', 'Air Conditioned Rooms (AC)'],
            propertyType: data.propertyType || 'Hotel',
            refundType: data.refundType || 'REFUNDABLE',
            imageUrl: data.imageUrl || data.photos?.[0] || '',
            contactPhone: data.contactPhone || data.phone || '',
            contactEmail: data.contactEmail || data.email || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        console.log(`[Sync] Retrieved ${hotelDocs.length} hotel records from Firestore 'master_hotels'.`);
      }
    } catch (e: any) {
      console.warn(`[Sync] Firestore read for 'master_hotels' failed: ${e?.message}. Utilizing master sample fallback.`);
    }
  }

  // Fallback to sample hotels if empty
  if (hotelDocs.length === 0) {
    console.log(`[Sync] Using curated sample hotel inventory (${MASTER_HOTELS_DATA.length} properties).`);
    hotelDocs = MASTER_HOTELS_DATA;
  }

  await meilisearchService.addDocumentsInBatches(MEILI_INDEX_HOTELS, hotelDocs, 500);
  return hotelDocs.length;
}

async function syncAirports(db: any): Promise<number> {
  console.log('\n[Sync] 2/3 Starting Airports Index Synchronization...');
  let airportDocs: MeiliAirportDoc[] = [];

  // Check Firestore first
  if (db) {
    try {
      const snap = await db.collection('airports').limit(2000).get();
      if (!snap.empty) {
        snap.forEach((doc: any) => {
          const data = doc.data();
          if (data.iata_code) {
            airportDocs.push({
              id: doc.id || data.iata_code,
              iata_code: data.iata_code.toUpperCase(),
              airport_name: data.airport_name || data.name || 'Airport',
              city: data.city || data.municipality || '',
              municipality: data.municipality || data.city || '',
              iso_country: data.iso_country || 'IN',
              country: data.country || 'India',
              latitude: Number(data.latitude || data.latitude_deg || 0),
              longitude: Number(data.longitude || data.longitude_deg || 0),
              type: data.type || 'medium_airport',
            });
          }
        });
        console.log(`[Sync] Loaded ${airportDocs.length} airports from Firestore 'airports'.`);
      }
    } catch (e: any) {
      console.warn(`[Sync] Firestore read for 'airports' failed: ${e?.message}. Falling back to CSV dataset.`);
    }
  }

  // Fallback to public/data/airports.csv
  if (airportDocs.length === 0) {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'airports.csv');
    if (fs.existsSync(csvPath)) {
      console.log(`[Sync] Parsing airport master records from: ${csvPath}`);
      const csvRaw = fs.readFileSync(csvPath, 'utf8');
      const parsed = Papa.parse(csvRaw, {
        header: true,
        skipEmptyLines: true,
      });

      const rows: any[] = parsed.data as any[];
      const seenIata = new Set<string>();

      for (const row of rows) {
        const iata = (row.iata_code || '').trim().toUpperCase();
        const type = (row.type || '').trim();

        // Index airports with valid 3-letter IATA code or major commercial airports
        if (iata && iata.length === 3 && !seenIata.has(iata)) {
          seenIata.add(iata);
          airportDocs.push({
            id: iata,
            iata_code: iata,
            airport_name: (row.name || '').replace(/['"]/g, '').trim(),
            city: (row.municipality || '').replace(/['"]/g, '').trim(),
            municipality: (row.municipality || '').replace(/['"]/g, '').trim(),
            iso_country: (row.iso_country || '').trim(),
            country: row.iso_country === 'IN' ? 'India' : (row.iso_country || ''),
            latitude: Number(row.latitude_deg || 0),
            longitude: Number(row.longitude_deg || 0),
            type: type,
            keywords: (row.keywords || '').replace(/['"]/g, '').trim(),
          });
        }
      }
      console.log(`[Sync] Successfully extracted ${airportDocs.length} active commercial airports with IATA codes.`);
    } else {
      console.warn(`[Sync] airports.csv not found at ${csvPath}`);
    }
  }

  await meilisearchService.addDocumentsInBatches(MEILI_INDEX_AIRPORTS, airportDocs, 1000);
  return airportDocs.length;
}

async function syncTrainStations(db: any): Promise<number> {
  console.log('\n[Sync] 3/3 Starting Train Stations Index Synchronization...');
  let stationDocs: MeiliStationDoc[] = [];

  // Check Firestore first
  if (db) {
    try {
      const snap = await db.collection('train_stations').limit(3000).get();
      if (!snap.empty) {
        snap.forEach((doc: any) => {
          const data = doc.data();
          if (data.code) {
            stationDocs.push({
              id: data.code.toUpperCase(),
              code: data.code.toUpperCase(),
              name: data.name || data.station_name || '',
              state: data.state || '',
              zone: data.zone || '',
              address: data.address || '',
            });
          }
        });
        console.log(`[Sync] Loaded ${stationDocs.length} stations from Firestore 'train_stations'.`);
      }
    } catch (e: any) {
      console.warn(`[Sync] Firestore read for 'train_stations' failed: ${e?.message}. Falling back to stations.json.`);
    }
  }

  // Fallback to public/data/stations.json
  if (stationDocs.length === 0) {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'stations.json');
    if (fs.existsSync(jsonPath)) {
      console.log(`[Sync] Reading railway stations GeoJSON from: ${jsonPath}`);
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const geojson = JSON.parse(raw);
      const features = Array.isArray(geojson.features) ? geojson.features : [];

      const seenCodes = new Set<string>();

      for (const feat of features) {
        const props = feat.properties || {};
        const code = (props.code || '').trim().toUpperCase();
        const name = (props.name || '').trim();

        // Filter out dummy/invalid codes (e.g. starts with XX- or YY-)
        if (code && !code.startsWith('XX-') && !code.startsWith('YY-') && !seenCodes.has(code)) {
          seenCodes.add(code);
          const coords = feat.geometry?.coordinates;
          stationDocs.push({
            id: code,
            code,
            name: name || code,
            state: props.state || '',
            zone: props.zone || '',
            address: props.address || '',
            coordinates: Array.isArray(coords) && coords.length === 2 ? [coords[0], coords[1]] : undefined,
          });
        }
      }
      console.log(`[Sync] Successfully extracted ${stationDocs.length} valid Indian Railways stations.`);
    } else {
      console.warn(`[Sync] stations.json not found at ${jsonPath}`);
    }
  }

  await meilisearchService.addDocumentsInBatches(MEILI_INDEX_TRAIN_STATIONS, stationDocs, 1000);
  return stationDocs.length;
}

// -----------------------------------------------------------------------------
// 4. Master Sync Runner
// -----------------------------------------------------------------------------
async function runSynchronization() {
  const startTime = Date.now();
  console.log('========================================================================');
  console.log('       ROUTRIPO MULTI-INDEX MEILISEARCH SYNCHRONIZATION PIPELINE        ');
  console.log('========================================================================');

  // Verify Meilisearch connectivity
  const health = await meilisearchService.checkHealth();
  if (!health.healthy) {
    console.error(`[Sync] ❌ ERROR: Meilisearch is not reachable at ${health.host}!`);
    console.error(`[Sync] 💡 Solution: Start Meilisearch via Docker before running this script:`);
    console.error(`       docker-compose up -d meilisearch`);
    console.error(`       Or run locally: meilisearch --master-key="masterKey1234567890RoutripoSecure"`);
    process.exit(1);
  }

  console.log(`[Sync] Meilisearch status: HEALTHY at ${health.host}`);

  // Configure index settings first
  console.log('[Sync] Configuring Searchable, Filterable, and Sortable Index Settings...');
  await meilisearchService.configureIndexSettings();
  console.log('[Sync] Index schemas and settings configured.');

  // Initialize DB instance
  const db = getAdminFirestoreInstance();

  // Run synchronization across all 3 indexes
  const totalHotels = await syncHotels(db);
  const totalAirports = await syncAirports(db);
  const totalStations = await syncTrainStations(db);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n========================================================================');
  console.log('                 SYNCHRONIZATION COMPLETED SUCCESSFULLY                 ');
  console.log('========================================================================');
  console.log(`  - Hotels Indexed        : ${totalHotels} properties`);
  console.log(`  - Airports Indexed      : ${totalAirports} airports`);
  console.log(`  - Train Stations Indexed: ${totalStations} railway stations`);
  console.log(`  - Execution Time        : ${durationSec}s`);
  console.log('========================================================================\n');
}

// Execute if run directly
runSynchronization().catch((err) => {
  console.error('[Sync] Fatal synchronization error:', err);
  process.exit(1);
});
