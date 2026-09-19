# Feature Specification: Unified Multi-Vertical Search, Channel Manager Webhook & Universal ID Architecture

**Feature ID**: `010-channel-manager-unified-search`  
**Status**: Specified / In Implementation  
**Created**: September 19, 2026  
**Authors**: Antigravity AI Agent & Team  

---

## 1. Executive Summary & Context

RouTripO is an OTA super-app (incorporating capabilities like MakeMyTrip, Agoda, and Ixigo) built with Capacitor, Vite, React, Node.js/Express, Firebase Firestore, and Self-Hosted Meilisearch + Komoot Photon.

This specification formalizes three core architectural pillars:
1. **Channel Manager Webhook Pipeline (`/api/channel-manager/webhook`)**:
   - Ingests real-time ARI (Availability, Rates & Inventory) and booking pushes from Channel Managers.
   - Enforces strict `X-Idempotency-Key` validation and stores transaction logs in Firestore (`webhook_logs`) to eliminate double-booking / duplicate update hazards.
2. **Universal ID Generation & Normalization (`UniversalIdGenerator`)**:
   - Unifies ID creation across:
     - Hotels: `HTL-[State]-[City]-[RandomNum]`
     - Flights: `FLT-[Origin]-[Destination]`
     - Trains: `TRN-[Code/Station]`
     - Cars: `CAR-[Origin]-[Destination]-[RandomNum]`
   - Harmonizes multi-source hotel inventory (Direct Vendors, Channel Managers, and Third-Party GDS/APIs).
3. **Unified Multi-Index Search & Sync (`GET /api/search` & `POST /api/sync-search`)**:
   - `POST /api/sync-search` and `syncAllVerticalsToMeilisearch()`: syncs Firestore master collections (`master_hotels`, `master_airports`, `master_train_stations`) into Meilisearch indexes (`hotels`, `airports`, `train_stations`).
   - `GET /api/search`: queries Meilisearch indexes dynamically based on user search text, supporting faceted filters (`price`, `star_rating`, `city`, `codes`), with Komoot Photon geocoding.
   - Cleans up legacy/duplicate search endpoints in `server.ts`.

---

## 2. Detailed Functional Requirements

### 2.1 Universal ID Generator (`UniversalIdGenerator`)
Class in `server/services/universalIdService.ts` (or exported from `server/services/meilisearchService.ts`):
```typescript
export class UniversalIdGenerator {
  static generateId(vertical: 'HOTEL' | 'FLIGHT' | 'TRAIN' | 'CAR', param1: string, param2?: string): string
}
```
- `HOTEL`: `HTL-${param1.toUpperCase()}-${(param2 || 'GEN').toUpperCase()}-${randomNum}`
- `FLIGHT`: `FLT-${param1.toUpperCase()}-${(param2 || 'DST').toUpperCase()}`
- `TRAIN`: `TRN-${param1.toUpperCase()}`
- `CAR`: `CAR-${param1.toUpperCase()}-${(param2 || 'CITY').toUpperCase()}-${randomNum}`

### 2.2 Channel Manager Webhook (`POST /api/channel-manager/webhook`)
- Headers:
  - `X-Idempotency-Key` (Required): String UUID or unique hash.
  - If missing: HTTP 400 `{ error: 'Missing Idempotency Key' }`.
- Processing:
  - Firestore collection `webhook_logs`, document ID = `idempotencyKey`.
  - If document exists: HTTP 200 `{ status: 'Already processed (Idempotent)' }`.
  - If new:
    - Ingest ARI (rates, rooms, inventory) or reservation payload.
    - If hotel details provided, normalize and map to Master ID using `UniversalIdGenerator.generateId('HOTEL', state, city)`.
    - Persist/update in Firestore `master_hotels`.
    - Record log in `webhook_logs` with `processed_at: serverTimestamp()` and payload.
    - Return HTTP 200 `{ status: 'Success', confirmation_id: 'CONF-XXXXX' }`.

### 2.3 Multi-Index Sync API & Background Sync
- Function `syncAllVerticalsToMeilisearch()`:
  - Pulls `master_hotels`, `master_airports`, `master_train_stations` (with fallbacks).
  - Pushes to Meilisearch indexes: `hotels`, `airports`, `train_stations`.
- Endpoint `POST /api/sync-search`:
  - Body: `{ collectionName: string, indexName: string }`
  - Fetches collection and updates index.
  - Returns `{ message: 'Synced X docs to indexName' }`.

### 2.4 Unified Search Route (`GET /api/search`)
- Query parameters:
  - `q`: Search query string.
  - `index`: `'hotels' | 'airports' | 'train_stations' | 'all'` (defaults to `'hotels'`).
  - `filter`: Filter expression or individual facet filters (`city`, `minPrice`, `maxPrice`, `starRating`, `amenities`).
  - `limit`: Result limit (default 20).
- If `index === 'all'`:
  - Executes parallel searches across `hotels`, `airports`, and `train_stations`.
  - Returns unified payload `{ success: true, hotels, airports, train_stations, query: q }`.

### 2.5 Code Cleanup in `server.ts`
- Remove duplicate `app.post("/api/cars/search")` around line 4463.
- Integrate the unified search and channel manager webhook routes cleanly.
