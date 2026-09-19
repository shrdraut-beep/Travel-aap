# Task Checklist: Unified Multi-Vertical Search, Channel Manager Webhook & Universal ID Architecture

**Feature ID**: `010-channel-manager-unified-search`  
**Status**: Ready to Execute  

---

## Phase 1: Universal ID Generator & Services
- [ ] **Task 1.1**: Implement `UniversalIdGenerator` in `server/services/universalIdService.ts` for HOTEL, FLIGHT, TRAIN, and CAR.
- [ ] **Task 1.2**: Implement `syncAllVerticalsToMeilisearch` and sync functions in `server/services/meilisearchService.ts`.

## Phase 2: Channel Manager Webhook Route
- [ ] **Task 2.1**: Create `server/routes/channelManager.ts` with:
  - `POST /webhook` (mounted under `/api/channel-manager/webhook`).
  - Strict `X-Idempotency-Key` validation.
  - Firestore `webhook_logs` deduplication check.
  - ARI update / Reservation handling and Master ID normalization.

## Phase 3: Unified Search & Sync Endpoints
- [ ] **Task 3.1**: Implement `POST /api/sync-search` in `server/routes/search.ts` (or `server.ts`).
- [ ] **Task 3.2**: Implement `GET /api/search` with multi-index support (`index=hotels|airports|train_stations|all`) and faceted filters.
- [ ] **Task 3.3**: Mount channel manager router and ensure `/api/search` is cleanly mounted in `server.ts`.
- [ ] **Task 3.4**: Clean up duplicate `/api/cars/search` in `server.ts`.

## Phase 4: Verification & Knowledge Graph
- [ ] **Task 4.1**: Run TypeScript compiler verification (`npx tsc --noEmit`).
- [ ] **Task 4.2**: Test webhook idempotency & search endpoints via curl.
- [ ] **Task 4.3**: Run `graphify update .`.
