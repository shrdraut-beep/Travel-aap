# Task Checklist: Self-Hosted Meilisearch & Komoot Photon Search Architecture

**Feature ID**: `009-self-hosted-meilisearch-photon`  
**Status**: Completed  

---

## Phase 1: Environment & Docker Architecture
- [x] **Task 1.1**: Create `docker-compose.yml` with Meilisearch engine (`getmeili/meilisearch:v1.12`) and Komoot Photon geocoding engine with persistent volumes and healthchecks.
- [x] **Task 1.2**: Update `.env.example` and load environment variables for `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, and `PHOTON_HOST`.

## Phase 2: Core Services Implementation
- [x] **Task 2.1**: Implement `server/services/meilisearchService.ts` encapsulating Meilisearch client, index creation, faceted search querying, and fallback handling.
- [x] **Task 2.2**: Implement `server/services/photonService.ts` for location and city autocomplete with local-first and upstream-fallback strategy.

## Phase 3: Multi-Index Synchronization Engine
- [x] **Task 3.1**: Create `scripts/syncMeilisearch.ts` to sync Firestore collections (`master_hotels`, `airports`, `train_stations`) into Meilisearch indexes:
  - Configure searchable, filterable, and sortable attributes for `hotels`, `airports`, `train_stations`.
  - Include graceful seeding fallback using local `public/data/airports.csv`, `public/data/stations.json`, and hotel inventory if Firestore is offline.
  - Add batch chunking (1,000 items/batch) for high performance.

## Phase 4: Search API Endpoints & Route Mounting
- [x] **Task 4.1**: Update `server/routes/search.ts` with Meilisearch endpoints:
  - `GET /api/search/meili/hotels` (with `q`, `city`, `minPrice`, `maxPrice`, `starRating`, `amenities`, `sort`, `limit`, `offset`).
  - `GET /api/search/meili/airports` (with `q`, `limit`).
  - `GET /api/search/meili/train-stations` (with `q`, `limit`).
  - `GET /api/search/meili/health` (engine connectivity and index document counts).
  - `GET /api/search/locations/autocomplete` (Photon location autocomplete).
- [x] **Task 4.2**: Mount `app.use('/api/search', searchRouter)` in `server.ts`.

## Phase 5: Verification & Knowledge Graph
- [x] **Task 5.1**: Run TypeScript typecheck (`npx tsc --noEmit`) to verify zero compiler errors.
- [x] **Task 5.2**: Test sync script and search endpoint responses.
- [x] **Task 5.3**: Run `graphify update .` to keep knowledge graph up to date.
