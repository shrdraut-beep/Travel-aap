# Feature Specification: Self-Hosted Meilisearch & Komoot Photon Search Architecture

**Feature ID**: `009-self-hosted-meilisearch-photon`  
**Status**: Specified / In Implementation  
**Created**: September 19, 2026  
**Authors**: Antigravity AI Agent & Team  

---

## 1. Executive Summary & Context

To support high-concurrency, instantaneous, typo-tolerant search across millions of travel inventory items (like MakeMyTrip, Agoda, and Ixigo), RoutTripo requires a **100% self-hosted, free, and open-source search and geocoding stack**:
1. **Meilisearch**: Blazing fast (sub-50ms), typo-tolerant, multi-faceted search engine running strictly self-hosted via Docker (Local & VPS). No cloud-hosted dependency or paid third-party search SaaS.
2. **Komoot Photon**: OpenStreetMap-based geocoding engine for lightning-fast location, city, and airport/station locality autocomplete with multi-lingual and typo tolerance.
3. **Firestore Multi-Index Synchronization Engine**: Automated Node.js pipeline synchronizing `master_hotels`, `airports`, and `train_stations` collections from Firestore into dedicated Meilisearch indexes with fallback to local master records.
4. **Search API Gateway**: Express.js REST API endpoints dynamically querying Meilisearch with faceted filtering (price ranges, star ratings, amenities, city, IATA codes, railway station codes).

---

## 2. Core Functional Requirements

### 2.1 Self-Hosted Docker Deployment (`docker-compose.yml`)
- Run `getmeili/meilisearch:v1.12` with persistent disk volume mount (`meili_data`).
- Environment configuration: `MEILI_MASTER_KEY`, `MEILI_ENV=production`, `MEILI_NO_ANALYTICS=true`, `MEILI_MAX_INDEXING_MEMORY=2Gb`.
- Healthcheck configuration (`/health`) and port forwarding on `7700`.
- Photon container configuration for OpenStreetMap geocoding on port `2322` with persistent data volume (`photon_data`).
- VPS and local production-ready compose configuration with network isolation and automatic restart policy (`unless-stopped`).

### 2.2 Multi-Index Synchronization Engine (`scripts/syncMeilisearch.ts`)
- Script runnable on command (`npx tsx scripts/syncMeilisearch.ts` or via node).
- Index Definitions:
  1. **`hotels` Index**:
     - Synced from Firestore `master_hotels` (and fallback to sample/registered properties).
     - Searchable Attributes: `name`, `city`, `state`, `address`, `amenities`, `propertyType`.
     - Filterable Attributes: `price`, `star_rating`, `city_id`, `city`, `amenities`, `propertyType`, `refundType`.
     - Sortable Attributes: `price`, `star_rating`, `rating`.
  2. **`airports` Index**:
     - Synced from Firestore `airports` collection or local master `public/data/airports.csv`.
     - Searchable Attributes: `iata_code`, `airport_name`, `city`, `municipality`, `country`, `keywords`.
     - Filterable Attributes: `iata_code`, `city`, `iso_country`, `type`.
     - Sortable Attributes: `name`, `iata_code`.
  3. **`train_stations` Index**:
     - Synced from Firestore `train_stations` collection or local master `public/data/stations.json`.
     - Searchable Attributes: `code`, `name`, `state`, `address`, `zone`.
     - Filterable Attributes: `code`, `state`, `zone`.
     - Sortable Attributes: `name`, `code`.
- Schema configuration (setting searchable, filterable, and sortable attributes on Meilisearch) before batch inserting documents with automatic chunking (batches of 1,000 to prevent payload exhaustion).

### 2.3 Search API Endpoints (`server/routes/search.ts` & `server/services/meilisearchService.ts`)
- **`GET /api/search/meili/hotels`**:
  - Query parameters: `q` (search text), `city`, `minPrice`, `maxPrice`, `starRating`, `amenities` (comma separated), `sort` (`price:asc`, `price:desc`, `star_rating:desc`), `limit`, `offset`.
  - Response: Total hits, faceted distribution, search processing time, matching hotel records.
- **`GET /api/search/meili/airports`**:
  - Query parameters: `q` (city name or IATA code, e.g. "BOM", "Mumbai", "Delhi"), `limit`.
  - Response: Instant autocomplete hits with IATA code, airport name, municipality, and country.
- **`GET /api/search/meili/train-stations`**:
  - Query parameters: `q` (station code or name, e.g. "CSTM", "PUNE", "New Delhi"), `limit`.
  - Response: Instant matching railway stations with station code, full name, zone, and state.
- **`GET /api/search/locations/autocomplete`**:
  - Query parameters: `q` (location name or query), `limit`.
  - Proxies to self-hosted Photon (`http://localhost:2322/api/?q=...`) with seamless fallback to public Photon endpoint (`https://photon.komoot.io/api/?q=...`) to ensure 100% uptime.

---

## 3. Non-Functional Requirements & Security
- **Strictly Self-Hosted**: No Meilisearch Cloud URLs or external hosted search subscription keys.
- **Circuit Breakers & Graceful Degradation**: If Meilisearch engine is temporarily offline during syncing or search, APIs return clear diagnostic status and fallback gracefully to database or master data rather than crashing.
- **Type Safety**: Strictly typed TypeScript with validation via Zod schemas.
