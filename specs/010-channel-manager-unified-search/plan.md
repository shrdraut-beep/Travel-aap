# Implementation Plan: Unified Multi-Vertical Search, Channel Manager Webhook & Universal ID Architecture

**Feature ID**: `010-channel-manager-unified-search`  
**Status**: Planned / Ready for Execution  
**Created**: September 19, 2026  

---

## 1. Architectural Design

```
                       [ Channel Manager / ARI Push ]
                                     │
                                     ▼ (Strict X-Idempotency-Key Header)
                      [ POST /api/channel-manager/webhook ]
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                           ▼
              [ Firestore Logs ]          [ UniversalIdGenerator ]
              (webhook_logs)             (HTL-[State]-[City]-[Rand])
                                                   │
                                                   ▼
                                         [ Firestore Master Data ]
                                             (master_hotels)
                                                   │
                                                   ▼
                                        [ POST /api/sync-search ]
                                        [ syncAllVerticals...() ]
                                                   │
                                                   ▼
                                     [ Self-Hosted Meilisearch ]
                                       ├── hotels
                                       ├── airports
                                       └── train_stations
                                                   ▲
                                                   │
                                         [ GET /api/search ]
                                                   ▲
                                                   │
                                     [ Client Search / Autocomplete ]
```

---

## 2. File Manifest & Execution Steps

### 2.1 Universal ID Generator
- Create `server/services/universalIdService.ts`:
  - Implements `UniversalIdGenerator`:
    - `generateId(vertical: 'HOTEL' | 'FLIGHT' | 'TRAIN' | 'CAR', param1: string, param2?: string): string`
  - Helper functions for normalization.

### 2.2 Channel Manager Webhook Route
- In `server/routes/channelManager.ts` (NEW):
  - Handle `POST /api/channel-manager/webhook`
  - Check `req.headers['x-idempotency-key']` (reject with 400 if missing)
  - Firestore idempotency check: `webhook_logs/{idempotencyKey}`
  - Process ARI (Availability, Rates & Inventory) or Reservation push
  - Generate Master Hotel ID if new hotel property
  - Save log in `webhook_logs` with timestamp
  - Return `{ status: 'Success', confirmation_id: 'CONF-XXXXX' }`

### 2.3 Multi-Index Sync Function & Endpoint
- Update `server/services/meilisearchService.ts`:
  - Add `syncAllVerticalsToMeilisearch(db)`
- Add `POST /api/sync-search` to handle on-demand sync by collection and index name.

### 2.4 Unified Search Endpoint
- Update `server/routes/search.ts` & mount in `server.ts`:
  - `GET /api/search`:
    - supports `index='hotels' | 'airports' | 'train_stations' | 'all'`
    - faceted filtering (price, star rating, city, codes)
    - multi-index aggregation when `index='all'`
- Code Cleanup: Remove redundant duplicate `/api/cars/search` at line 4463 in `server.ts`.

---

## 3. Verification Plan
- `npx tsc --noEmit` check.
- Test `POST /api/channel-manager/webhook` with and without `X-Idempotency-Key`.
- Test idempotency replay prevention.
- Test `GET /api/search?index=all&q=Mumbai`.
- Test `POST /api/sync-search`.
- Update `graphify update .`.
