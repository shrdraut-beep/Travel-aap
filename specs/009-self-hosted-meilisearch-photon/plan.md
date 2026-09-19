# Implementation Plan: Self-Hosted Meilisearch & Komoot Photon Search Architecture

**Feature ID**: `009-self-hosted-meilisearch-photon`  
**Status**: Planned / Ready for Execution  
**Created**: September 19, 2026  

---

## 1. Architectural Overview

```
                          [ Client Application (Vite / Capacitor / Web) ]
                                                │
                                                ▼
                                    [ Express Backend API ]
                                   (server.ts / search.ts)
                                       │              │
                    ┌──────────────────┴──┐           └───► [ Komoot Photon ]
                    ▼                     ▼                 (Port 2322 / Geocoding)
          [ Meilisearch Service ]    [ Firestore ]
              (Port 7700)                 │
           ├── hotels                     │ (Realtime Sync &
           ├── airports                   │  Initial Batch Script)
           └── train_stations             ▼
                              [ scripts/syncMeilisearch.ts ]
```

---

## 2. Technical Stack & File Manifest

### 2.1 Dependencies
- `meilisearch`: Official JS SDK for node environments (`^0.44.0`+).
- `papaparse`: CSV parsing for airports master dataset (`public/data/airports.csv`).
- `axios`: HTTP client for Photon proxying with failover.
- `firebase-admin`: Firestore collection query engine.

### 2.2 Files to Create / Modify
1. **`docker-compose.yml`** (NEW):
   - Service `meilisearch`: Image `getmeili/meilisearch:v1.12`, port `7700:7700`, persistent volume `meili_data`, environment variables for production performance.
   - Service `photon`: Image `komoot/photon:latest`, port `2322:2322`, persistent volume `photon_data`.
2. **`server/services/meilisearchService.ts`** (NEW):
   - Meilisearch client wrapper with healthcheck, index initialization, facet configuration, and unified search methods.
   - Circuit breaker / connection fallback.
3. **`server/services/photonService.ts`** (NEW):
   - Geocoding and location autocomplete provider querying local Photon (`http://localhost:2322`) with automatic fallback to public Photon (`https://photon.komoot.io`).
4. **`scripts/syncMeilisearch.ts`** (NEW):
   - Multi-index synchronization CLI script.
   - Connects to Firestore (`master_hotels`, `airports`, `train_stations`).
   - Parses local master CSV/JSON fallback if Firestore is empty or running without cloud credentials.
   - Sets index settings (searchable, filterable, sortable attributes).
   - Batch chunks documents and updates Meilisearch.
5. **`server/routes/search.ts`** (MODIFY):
   - Add routes:
     - `GET /api/search/meili/hotels`
     - `GET /api/search/meili/airports`
     - `GET /api/search/meili/train-stations`
     - `GET /api/search/meili/health`
     - `GET /api/search/locations/autocomplete`
6. **`server.ts`** (MODIFY):
   - Mount `app.use('/api/search', searchRouter)`.
7. **`.env.example`** (MODIFY):
   - Add `MEILISEARCH_HOST=http://localhost:7700`, `MEILISEARCH_API_KEY=masterKey1234567890RoutripoSecure`, `PHOTON_HOST=http://localhost:2322`.

---

## 3. Data Schemas

### 3.1 Hotel Document Schema (`hotels` index)
```typescript
interface MeiliHotelDocument {
  id: string; // e.g. "HTL-100234"
  name: string;
  city_id: string;
  city: string;
  state: string;
  address: string;
  price: number; // Base price per night (INR)
  star_rating: number; // 1 to 5
  rating: number; // User rating e.g. 4.5
  amenities: string[]; // ["Free Wi-Fi", "Swimming Pool", "Breakfast Included", "AC"]
  propertyType: string; // "Boutique Hotel", "Resort", "Business Hotel"
  refundType: string; // "REFUNDABLE" | "NON_REFUNDABLE"
  imageUrl?: string;
}
```

### 3.2 Airport Document Schema (`airports` index)
```typescript
interface MeiliAirportDocument {
  id: string; // IATA code or unique ident e.g. "BOM"
  iata_code: string; // "BOM"
  airport_name: string; // "Chhatrapati Shivaji Maharaj International Airport"
  city: string; // "Mumbai"
  municipality: string;
  iso_country: string; // "IN"
  country: string; // "India"
  latitude: number;
  longitude: number;
  keywords?: string;
}
```

### 3.3 Train Station Document Schema (`train_stations` index)
```typescript
interface MeiliStationDocument {
  id: string; // Station code e.g. "CSMT"
  code: string; // "CSMT"
  name: string; // "Chhatrapati Shivaji Maharaj Terminus"
  state: string; // "Maharashtra"
  zone: string; // "CR"
  address: string;
  coordinates?: [number, number]; // [longitude, latitude]
}
```

---

## 4. Verification & Testing
1. Compile and typecheck with `npx tsc --noEmit`.
2. Run `syncMeilisearch.ts` with `--dry-run` or against a local mock/instance to ensure index settings and batches execute cleanly.
3. Test Express endpoints (`/api/search/meili/hotels`, `/api/search/meili/airports`, `/api/search/meili/train-stations`, `/api/search/locations/autocomplete`).
4. Validate `docker-compose.yml` configuration and verify syntax.
