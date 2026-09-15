# RoutTripo — Phase 1 Implementation Guide
### Security & Compliance Hardening (CI Scanning + Secrets + DPDP + Observability)

This is a single reference for everything needed to wire in the 5 files delivered:
- `.github/workflows/security-scan.yml`
- `server/config/secrets.ts`
- `server/config/observability.ts`
- `src/observability.ts` (client)
- `server/routes/privacy.ts`

---

## 0. Install dependencies

```bash
npm install @google-cloud/secret-manager @sentry/node @sentry/profiling-node @sentry/react
```

No install needed for the GitHub Actions workflow — it runs on GitHub's infra.

---

## 1. CI Dependency & Security Scanning

**File:** `security-scan.yml` → place at `.github/workflows/security-scan.yml`

**What it does:**
- `npm audit --audit-level=high` on every push/PR to `main`/`develop`, plus a weekly Monday run to catch newly-disclosed CVEs in dependencies you haven't touched
- CodeQL static analysis (JS/TS) — flags injection, unsafe regex, prototype pollution, etc.
- Gitleaks — scans commit history for leaked keys/tokens before they reach production

**Setup steps:**
1. Copy the file into `.github/workflows/security-scan.yml` in your repo.
2. No secrets needed for `npm audit` or CodeQL — they work out of the box.
3. Gitleaks uses the default `GITHUB_TOKEN`, already available in Actions — no extra setup.
4. Push to a branch and open a PR — you'll see three checks appear: `dependency-audit`, `codeql`, `secret-scan`.
5. Go to **Settings → Branches → Branch protection rules** for `main` and require these three checks to pass before merge.

**Tuning:** if `npm audit --audit-level=high` blocks a merge for a vulnerability you can't fix yet (no patch available upstream), temporarily lower to `critical` in the workflow, but track the item and revert once patched.

---

## 2. Secrets Management (Google Secret Manager)

**File:** `secrets.ts` → place at `server/config/secrets.ts`

**Why:** Your `.env`/`.env.local` currently hold live Travelport, Razorpay, Firebase, and SMTP credentials in plaintext. In production, secrets should never live in a file that can be zipped/committed/copied by mistake (as happened once already).

**Setup steps:**

1. **Enable the API** (one-time per GCP project):
   ```bash
   gcloud services enable secretmanager.googleapis.com --project=YOUR_PROJECT_ID
   ```

2. **Create one secret per credential currently in `.env`.** Example for Razorpay:
   ```bash
   gcloud secrets create RAZORPAY_KEY_ID --replication-policy="automatic"
   printf "your-actual-key-id" | gcloud secrets versions add RAZORPAY_KEY_ID --data-file=-

   gcloud secrets create RAZORPAY_KEY_SECRET --replication-policy="automatic"
   printf "your-actual-key-secret" | gcloud secrets versions add RAZORPAY_KEY_SECRET --data-file=-
   ```
   Repeat for every name in `REQUIRED_SECRETS` inside `secrets.ts` (Razorpay, Travelport, SMTP, Firebase admin key, webhook secret, etc.) — edit that list first to exactly match your real `.env` keys.

3. **Grant your Cloud Run service account access:**
   ```bash
   gcloud secrets add-iam-policy-binding RAZORPAY_KEY_SECRET \
     --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```
   Repeat per secret, or grant the role at the project level if you have many.

4. **Set the project ID env var** in your Cloud Run service config:
   ```
   GOOGLE_CLOUD_PROJECT=your-project-id
   NODE_ENV=production
   ```

5. **Wire it into `server.ts`** — add near the very top, before any code reads `process.env.RAZORPAY_*` etc.:
   ```ts
   import { loadSecrets, REQUIRED_SECRETS } from "./server/config/secrets.ts";
   await loadSecrets(REQUIRED_SECRETS);
   ```
   In development (`NODE_ENV !== "production"`), this is a no-op — your local `.env` keeps working unchanged via `dotenv`.

6. **Once confirmed working in production**, remove the real secret values from `.env`/`.env.local` on your deploy machine and rotate every key that was previously exposed in the shared zip.

---

## 3. DPDP Compliance Endpoints

**File:** `privacy.ts` → place at `server/routes/privacy.ts`

**Endpoints it adds:**
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/privacy/consent` | Read current per-purpose consent state |
| POST | `/api/privacy/consent` | Record/update consent (`{purpose, granted}`), with immutable audit log |
| POST | `/api/privacy/delete-request` | Queue a right-to-erasure request |
| GET | `/api/privacy/export` | Data portability — user's own profile/bookings/consent as JSON |

**Setup steps:**

1. Place the file at `server/routes/privacy.ts`.
2. In `server.ts`, mount it using your existing `requireAuth` and `adminDb`:
   ```ts
   import { createPrivacyRouter } from './server/routes/privacy.ts';
   app.use('/api/privacy', requireAuth, createPrivacyRouter(adminDb));
   ```
3. **Frontend work needed (not included here):**
   - A consent-preferences screen in Profile/Settings calling `GET`/`POST /api/privacy/consent`
   - A "Delete my account" flow in Settings calling `POST /api/privacy/delete-request`, showing the `retainedCategories` explanation returned in the response
   - A "Download my data" button calling `GET /api/privacy/export`
4. **Backend work needed (not included here):** a scheduled job (e.g. `node-cron`, already a dependency) that processes `deletion_requests` where `status == "pending"` — scrub everything except the collections listed in `RETENTION_EXEMPT_COLLECTIONS`, then set `status: "completed"` and email the user.
5. Edit `RETENTION_EXEMPT_COLLECTIONS` in the file to match your actual Firestore collection names and real retention justifications before going live — the ones included are placeholders based on typical GST/RBI retention periods, not verified for your specific setup.

---

## 4. Observability (Sentry)

**Files:**
- `observability.ts` → `server/config/observability.ts` (backend)
- `observability-client.ts` → `src/observability.ts` (frontend — rename when copying)

**Setup steps:**

1. Create a free Sentry project at sentry.io (one for backend, one for frontend — or one project with both, your call).
2. Add the backend DSN as a secret (`SENTRY_DSN`) via the same Secret Manager process as Section 2, or as a plain env var if you're not fully migrated yet.
3. Add the frontend DSN as a build-time env var: `VITE_SENTRY_DSN=https://...` in your `.env`/CI build config (this one is safe to expose client-side — it's a public DSN, not a secret).
4. **Wire the backend** in `server.ts`, as early as possible:
   ```ts
   import { initObservability, sentryErrorHandler } from "./server/config/observability.ts";
   initObservability(app);
   // ... all existing routes ...
   app.use(sentryErrorHandler); // must be after routes, before your own error handler
   ```
5. **Wire the frontend** in your app entrypoint (e.g. `src/main.tsx`), before rendering `<App />`:
   ```ts
   import { initClientObservability } from "./observability.ts";
   initClientObservability();
   ```
6. **Optional:** call `reportBoundaryError(error, info.componentStack)` inside `ErrorBoundary.tsx`'s `componentDidCatch` so React crashes also reach Sentry.
7. Verify: throw a test error in a dev build and confirm it shows up in the Sentry dashboard within a minute.

---

## Rollout order (recommended)

1. CI scanning first — zero risk, catches issues before anything else changes.
2. Secrets Manager — do this before rotating the previously-exposed credentials, so the rotation lands directly in the new system.
3. Observability — wire this in before the DPDP endpoints so you have visibility if the new routes misbehave.
4. DPDP endpoints — ship last since they need the small frontend screens to actually be usable by end users.

---

*Questions on any single step — expand that section further before moving to the next one.*
