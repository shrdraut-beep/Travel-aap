/**
 * server/modules/otaip/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization). Covers the OTAIP AI Trip
 * Manager pipeline: bind-inventory, validate-timeline, bind-and-validate
 * (orchestrates the first two), and package-checkout.
 *
 * Route bodies moved verbatim. parseOtaipJsonSafe (a small local helper in the
 * original file) moved here too since it's only used by these four routes.
 */

import type { Express } from "express";
import {
  inventoryBindingAgent,
  validationDriftAgent,
  packageCheckoutAgent,
} from "../../services/otaip/index.ts";

function parseOtaipJsonSafe(val: any) {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

export function registerOtaipRoutes(app: Express): void {

app.post("/api/otaip/bind-inventory", async (req, res) => {

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
      rawItinerary: parseOtaipJsonSafe(rawItinerary) || {}
    });

    if (!response.success) {
      return res.status(400).json(response);
    }
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/otaip/validate-timeline", async (req, res) => {
  try {
    const { boundItinerary, minimumTransitBufferMinutes } = req.body;
    const response = await validationDriftAgent.execute({
      boundItinerary: parseOtaipJsonSafe(boundItinerary),
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
app.post("/api/otaip/bind-and-validate", async (req, res) => {
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
      rawItinerary: parseOtaipJsonSafe(rawItinerary) || {}
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
app.post("/api/otaip/package-checkout", async (req, res) => {
  try {
    const itineraryId = req.body.itineraryId || `pkg_${Date.now()}`;
    const validatedPlan = parseOtaipJsonSafe(req.body.validatedPlan);
    const passengers = parseOtaipJsonSafe(req.body.passengers) || [];
    const leadGuest = parseOtaipJsonSafe(req.body.leadGuest) || {};
    const sessionToken = req.body.sessionToken || `sess_${Date.now()}`;
    const sessionStartedAt = req.body.sessionStartedAt ? Number(req.body.sessionStartedAt) : Date.now();
    const paymentDetails = parseOtaipJsonSafe(req.body.paymentDetails) || { gateway: 'Test', paymentId: `pay_${Date.now()}`, amount: 0, currency: 'INR', status: 'PAID' };

    const response = await packageCheckoutAgent.execute({
      itineraryId,
      validatedPlan,
      passengers,
      leadGuest,
      sessionToken,
      sessionStartedAt,
      paymentDetails
    });

    if (!response.success) {
      return res.status(400).json(response);
    }
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

}
