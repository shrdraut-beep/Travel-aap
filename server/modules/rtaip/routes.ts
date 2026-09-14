/**
 * server/modules/rtaip/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization). Covers the RTAIP AI Trip
 * Manager pipeline: bind-inventory, validate-timeline, bind-and-validate
 * (orchestrates the first two), and package-checkout.
 *
 * Route bodies moved verbatim. parseRtaipJsonSafe (a small local helper in the
 * original file) moved here too since it's only used by these four routes.
 */

import type { Express } from "express";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import type Razorpay from "razorpay";
import crypto from "crypto";
import {
  inventoryBindingAgent,
  validationDriftAgent,
  packageCheckoutAgent,
} from "../../services/rtaip/index.ts";

function parseRtaipJsonSafe(val: any) {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export interface RtaipModuleDeps {
  app: Express;
  razorpay: Razorpay;
  razorpayKeySecret: string;
  adminDb: () => Firestore | null;
  secureLogger: { warn: (...a: any[]) => void; error: (...a: any[]) => void };
}

export function registerRtaipRoutes(deps: RtaipModuleDeps): void {
  const { app, razorpay, razorpayKeySecret, adminDb, secureLogger } = deps;

app.post("/api/rtaip/bind-inventory", async (req, res) => {

  try {
    const { origin, destination, startDate, days, adults, transportMode, budget, lang, rawItinerary } = req.body;
    const response = await inventoryBindingAgent.execute({
      origin: origin || "Mumbai",
      destination: destination || "Goa",
      startDate: startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      days: days ? Number(days) : 3,
      adults: adults ? Number(adults) : 1,
      transportMode: transportMode || "flight",
      budget: budget ? Number(budget) : undefined,
      lang: lang || "en",
      rawItinerary: parseRtaipJsonSafe(rawItinerary) || {}
    });

    if (!response.success) {
      return res.status(400).json(response);
    }
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/rtaip/validate-timeline", async (req, res) => {
  try {
    const { boundItinerary, minimumTransitBufferMinutes } = req.body;
    const response = await validationDriftAgent.execute({
      boundItinerary: parseRtaipJsonSafe(boundItinerary),
      minimumTransitBufferMinutes: minimumTransitBufferMinutes ? Number(minimumTransitBufferMinutes) : 60
    });

    if (!response.success) {
      return res.status(400).json(response);
    }
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/rtaip/bind-and-validate", async (req, res) => {
  try {
    const { origin, destination, startDate, days, adults, transportMode, budget, lang, rawItinerary, minimumTransitBufferMinutes } = req.body;
    
    // Stage 2: Inventory Binding
    const bindRes = await inventoryBindingAgent.execute({
      origin: origin || "Mumbai",
      destination: destination || "Goa",
      startDate: startDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      days: days ? Number(days) : 3,
      adults: adults ? Number(adults) : 1,
      transportMode: transportMode || "flight",
      budget: budget ? Number(budget) : undefined,
      lang: lang || "en",
      rawItinerary: parseRtaipJsonSafe(rawItinerary) || {}
    });

    if (!bindRes.success || !bindRes.data) {
      return res.status(400).json(bindRes);
    }

    // Stage 3: Validation Drift & Auto-correction
    const valRes = await validationDriftAgent.execute({
      boundItinerary: bindRes.data.boundItinerary,
      minimumTransitBufferMinutes: minimumTransitBufferMinutes ? Number(minimumTransitBufferMinutes) : 60
    });

    if (!valRes.success || !valRes.data) {
      return res.status(400).json(valRes);
    }

    return res.status(200).json({
      success: true,
      stage: "Orchestration",
      boundItinerary: bindRes.data.boundItinerary,
      validatedPlan: valRes.data.validatedPlan,
      driftDetected: valRes.data.validatedPlan.driftDetected,
      drifts: valRes.data.validatedPlan.drifts,
      adjustments: valRes.data.validatedPlan.adjustments,
      holdExpiresAt: bindRes.data.holdExpiresAt
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/rtaip/package-checkout", async (req, res) => {
  try {
    const itineraryId = req.body.itineraryId || `pkg_${Date.now()}`;
    const validatedPlan = parseRtaipJsonSafe(req.body.validatedPlan);
    const passengers = parseRtaipJsonSafe(req.body.passengers) || [];
    const leadGuest = parseRtaipJsonSafe(req.body.leadGuest) || {};
    const sessionToken = req.body.sessionToken || `sess_${Date.now()}`;
    const sessionStartedAt = req.body.sessionStartedAt ? Number(req.body.sessionStartedAt) : Date.now();
    const rawPaymentDetails = parseRtaipJsonSafe(req.body.paymentDetails);

    // No more silent fake-PAID default — a missing/incomplete paymentDetails is a hard reject.
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = rawPaymentDetails || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing Razorpay payment verification fields (razorpay_order_id, razorpay_payment_id, razorpay_signature)." });
    }

    // 1. Signature check
    const hmac = crypto.createHmac('sha256', razorpayKeySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    const signatureValid =
      generatedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(generatedSignature, 'utf8'), Buffer.from(razorpay_signature, 'utf8'));

    if (!signatureValid) {
      return res.status(400).json({ success: false, error: "Invalid payment signature." });
    }

    const db = adminDb();
    if (!db) {
      return res.status(503).json({ success: false, error: "Database unavailable" });
    }

    // 2. Idempotency — one Razorpay order can confirm exactly one RTAIP package checkout
    const orderRef = db.collection("rtaip_checkout_orders").doc(razorpay_order_id);
    const existing = await orderRef.get();
    if (existing.exists && existing.data()?.status === "CONFIRMED") {
      return res.status(200).json({ success: true, alreadyProcessed: true, data: existing.data()?.result });
    }

    // 3. Re-fetch the order from Razorpay itself — authoritative status and amount,
    // never trust anything the client sent about how much was actually paid.
    let liveOrder;
    try {
      liveOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (err) {
      secureLogger.error('[rtaip/package-checkout] Failed to re-fetch order from Razorpay:', err);
      return res.status(502).json({ success: false, error: "Could not verify payment with Razorpay" });
    }
    if (liveOrder.status !== 'paid' || liveOrder.amount_paid < liveOrder.amount) {
      secureLogger.error(`[rtaip/package-checkout] Order ${razorpay_order_id} signature valid but Razorpay reports status=${liveOrder.status}.`);
      return res.status(400).json({ success: false, error: "Payment not confirmed by Razorpay" });
    }

    const verifiedPaymentDetails = {
      gateway: 'Razorpay' as const,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: Number(liveOrder.amount) / 100, // paise -> rupees, from Razorpay's own record
      currency: liveOrder.currency || 'INR',
      status: 'PAID' as const,
      verified: true, // only ever set here, after the checks above — never from client input
    };

    const response = await packageCheckoutAgent.execute({
      itineraryId,
      validatedPlan,
      passengers,
      leadGuest,
      sessionToken,
      sessionStartedAt,
      paymentDetails: verifiedPaymentDetails
    });

    if (!response.success) {
      return res.status(400).json(response);
    }

    await orderRef.set({
      status: "CONFIRMED",
      itineraryId,
      paymentId: razorpay_payment_id,
      result: response.data,
      confirmedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

}

