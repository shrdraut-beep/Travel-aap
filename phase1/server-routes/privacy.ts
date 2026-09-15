/**
 * server/routes/privacy.ts
 *
 * DPDP Act (India) compliance endpoints:
 *  - POST /api/privacy/consent        record/update a user's consent choices
 *  - GET  /api/privacy/consent        read current consent state
 *  - POST /api/privacy/delete-request submit a right-to-erasure request (queued, not instant —
 *                                      bookings/payments have statutory retention periods)
 *  - GET  /api/privacy/export         data portability: dump the user's own data as JSON
 *
 * Mount in server.ts (adminDb() and requireAuth are the ones already defined there —
 * this file takes them as arguments instead of redefining/importing them, since they're
 * not currently exported):
 *
 *   import { createPrivacyRouter } from './server/routes/privacy.ts';
 *   app.use('/api/privacy', requireAuth, createPrivacyRouter(adminDb));
 *
 * `adminDb` is passed as a function (not the resolved value) so each request gets a
 * fresh lookup — matches how it's used elsewhere in server.ts.
 */

import express from "express";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";

interface AuthedRequest extends express.Request {
  user?: DecodedIdToken;
}

export function createPrivacyRouter(getDb: () => Firestore | null) {
  const router = express.Router();

  const CONSENT_PURPOSES = [
  "marketing_emails",
  "marketing_sms",
  "personalized_offers",
  "third_party_sharing_analytics",
  ] as const;
  type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

  // Data categories retained under statutory/contractual obligation even after a deletion request —
  // list these explicitly so the deletion job knows what to keep and why.
  const RETENTION_EXEMPT_COLLECTIONS: Record<string, string> = {
  bookings: "Retained per Income Tax Act / GST invoicing requirements (typically 8 years).",
  payment_records: "Retained per RBI/PCI record-keeping requirements.",
  webhook_events: "Retained for payment dispute resolution and audit trail.",
  };

  /**
   * GET /api/privacy/consent — current consent state for the logged-in user
   */
  router.get("/consent", async (req: AuthedRequest, res) => {
  const db = getDb();
  const uid = req.user?.uid;
  if (!db || !uid) return res.status(503).json({ error: "Not configured" });

  const doc = await db.collection("user_consent").doc(uid).get();
  return res.json({ success: true, consent: doc.exists ? doc.data() : {} });
  });

  /**
   * POST /api/privacy/consent
   * Body: { purpose: ConsentPurpose, granted: boolean }
   * Records an auditable, timestamped consent event — required under DPDP for demonstrating
   * consent was informed and specific per purpose (not one blanket checkbox).
   */
  router.post("/consent", express.json(), async (req: AuthedRequest, res) => {
  const db = getDb();
  const uid = req.user?.uid;
  if (!db || !uid) return res.status(503).json({ error: "Not configured" });

  const { purpose, granted } = req.body as { purpose?: ConsentPurpose; granted?: boolean };
  if (!purpose || !CONSENT_PURPOSES.includes(purpose) || typeof granted !== "boolean") {
    return res.status(400).json({
      error: `purpose must be one of ${CONSENT_PURPOSES.join(", ")}; granted must be boolean`,
    });
  }

  const consentRef = db.collection("user_consent").doc(uid);
  await consentRef.set(
    {
      [purpose]: {
        granted,
        updatedAt: FieldValue.serverTimestamp(),
        ip: req.ip,
      },
    },
    { merge: true }
  );

  // Immutable audit trail — separate from the mutable current-state doc above
  await db.collection("consent_audit_log").add({
    uid,
    purpose,
    granted,
    timestamp: FieldValue.serverTimestamp(),
    ip: req.ip,
    userAgent: req.headers["user-agent"] || null,
  });

  return res.json({ success: true });
  });

  /**
   * POST /api/privacy/delete-request
   * Queues a right-to-erasure request. Does NOT delete synchronously — a background job
   * should process `deletion_requests`, scrubbing everything except RETENTION_EXEMPT_COLLECTIONS,
   * and notify the user (email) once complete. DPDP requires acknowledging the request promptly
   * even if full erasure takes longer for legally-retained records.
   */
  router.post("/delete-request", async (req: AuthedRequest, res) => {
  const db = getDb();
  const uid = req.user?.uid;
  const email = req.user?.email;
  if (!db || !uid) return res.status(503).json({ error: "Not configured" });

  const existing = await db
    .collection("deletion_requests")
    .where("uid", "==", uid)
    .where("status", "in", ["pending", "processing"])
    .limit(1)
    .get();

  if (!existing.empty) {
    return res.status(409).json({ error: "A deletion request is already in progress." });
  }

  const ref = await db.collection("deletion_requests").add({
    uid,
    email: email || null,
    status: "pending",
    requestedAt: FieldValue.serverTimestamp(),
    retainedCategories: Object.keys(RETENTION_EXEMPT_COLLECTIONS),
  });

  return res.status(202).json({
    success: true,
    requestId: ref.id,
    message:
      "Your deletion request has been received. Data not subject to legal retention requirements will be erased within 30 days.",
    retainedCategories: RETENTION_EXEMPT_COLLECTIONS,
  });
  });

  /**
   * GET /api/privacy/export — data portability (DPDP right to access)
   * Returns the user's own profile + booking metadata as JSON. Extend the collections
   * list as your schema grows.
   */
  router.get("/export", async (req: AuthedRequest, res) => {
  const db = getDb();
  const uid = req.user?.uid;
  if (!db || !uid) return res.status(503).json({ error: "Not configured" });

  const [profile, bookings, consent] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("bookings").where("uid", "==", uid).get(),
    db.collection("user_consent").doc(uid).get(),
  ]);

  return res.json({
    success: true,
    exportedAt: new Date().toISOString(),
    profile: profile.exists ? profile.data() : null,
    bookings: bookings.docs.map((d) => d.data()),
    consent: consent.exists ? consent.data() : null,
  });
  });

  return router;
}
