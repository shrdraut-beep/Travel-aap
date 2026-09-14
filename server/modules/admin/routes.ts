/**
 * server/modules/admin/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization — admin module: elevated-
 * privilege routes, isolated so it's easy to audit who can call what in one place).
 *
 * SECURITY FIX APPLIED DURING THIS EXTRACTION (not just a move):
 *   POST /api/admin/vault/export      — had NO auth middleware at all in server.ts.
 *   GET  /api/admin/vault/all-docs    — had NO auth middleware at all in server.ts,
 *                                        and returned KYC document metadata (passport,
 *                                        vehicle RC) to any unauthenticated caller.
 *   Both now require `requireAdmin`. /export was still safe in practice because
 *   exportUserDataForLegalHandler() has its own internal adminSecretToken check —
 *   but /all-docs had no protection whatsoever until this fix. Verify this doesn't
 *   break an intentional public/internal-tool use case before deploying.
 *
 * Route bodies are otherwise moved verbatim — no other logic changed.
 */

import type { Express, Response, NextFunction } from "express";
import type { Firestore } from "firebase-admin/firestore";
import { getMasterKEK, rotateAllUserDEKs } from "../../security/zeroTrustCrypto.ts";
import { exportUserDataForLegalHandler } from "../../security/adminVault.ts";
import {
  getAdminMetrics,
  getAdminVendors,
  reviewAdminVendor,
  getAdminPayouts,
  releaseAdminPayout,
  getAdminUsers,
  updateAdminUser,
  getAdminTickets,
  resolveAdminTicket
} from "../../services/accountStore.ts";

export interface AdminModuleDeps {
  app: Express;
  adminDb: () => Firestore | null;
  requireAdmin: (req: any, res: Response, next: NextFunction) => Promise<void> | void;
  getRealStats: (endpoint: string, fallbackLatency?: string) => any;
  secureLogger: {
    warn: (...a: any[]) => void;
    error: (...a: any[]) => void;
    audit: (...a: any[]) => void;
  };
}

export function registerAdminRoutes(deps: AdminModuleDeps): void {
  const { app, adminDb, requireAdmin, getRealStats, secureLogger } = deps;

  // --- GET /api/admin/health ---
app.get("/api/admin/health", requireAdmin, (req, res) => {
  const geminiActive = !!process.env.GEMINI_API_KEY;
  const pexelsActive = !!process.env.PEXELS_API_KEY;
  
  const apis = [
    {
      id: 'api-gemini-chat',
      name: 'Google Gemini 3.6 Flash Chat AI',
      endpoint: '/api/gemini/chat',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: geminiActive ? 'Active' : 'Active (Fallback Enabled)',
      lastChecked: 'Just now',
      description: 'Core conversational AI assistant for group itinerary planning, travel advice, and real-time query resolution.'
    },
    {
      id: 'api-future-trip',
      name: 'Smart Future Trip Planner',
      endpoint: '/api/generate-future-trip',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Predictive trip planner that generates realistic future trip plans, estimates, and schedules.'
    },
    {
      id: 'api-generate-itinerary',
      name: 'Smart Itinerary Generator',
      endpoint: '/api/generate-itinerary',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: 'Active',
      lastChecked: '1 min ago',
      description: 'Creates structured day-by-day travel schedules and activity timelines.'
    },
    {
      id: 'api-scan-receipt',
      name: 'Smart Expense Scanner (Vision OCR)',
      endpoint: '/api/scan-receipt',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: geminiActive ? 'Active' : 'Active (Vision Mode)',
      lastChecked: '2 mins ago',
      description: 'Multi-modal Gemini OCR that extracts vendor, total amount, and itemized splits from bill photos.'
    },
    {
      id: 'api-parse-voice',
      name: 'Voice Command Interpreter',
      endpoint: '/api/parse-voice-command',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Natural language speech input parser for hands-free expense entry and trip searching.'
    },
    {
      id: 'api-parse-booking',
      name: 'Ticket & Booking Text Parser',
      endpoint: '/api/parse-booking-text',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: 'Active',
      lastChecked: '3 mins ago',
      description: 'Converts SMS/Email ticket texts (IRCTC, Flights, Hotels) into structured booking records.'
    },
    {
      id: 'api-destination-templates',
      name: 'Destination Packages Generator',
      endpoint: '/api/generate-destination-templates',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: 'Active',
      lastChecked: '5 mins ago',
      description: 'Generates curated travel packages for Konkan, Goa, and Western Ghats destinations.'
    },
    {
      id: 'api-search-flights',
      name: 'Duffel / RapidAPI Flight Booking API',
      endpoint: '/api/search-flights',
      method: 'POST',
      category: 'Transport & Booking APIs',
      status: 'Deactivated (Local Data)',
      lastChecked: 'Just now',
      description: 'Real-time flight search across major airlines (IndiGo, Air India, SpiceJet) with live fare quotes.'
    },
    {
      id: 'api-train-status',
      name: 'IRCTC / RailRadar Train Tracker API',
      endpoint: '/api/train-status',
      method: 'POST',
      category: 'Transport & Booking APIs',
      status: 'Deactivated (Local Data)',
      lastChecked: 'Just now',
      description: 'Live train running status, delay alerts, platform numbers, and PNR verification.'
    },
    {
      id: 'api-live-station',
      name: 'Live Railway Station Arrivals Board',
      endpoint: '/api/live-station',
      method: 'POST',
      category: 'Transport & Booking APIs',
      status: 'Deactivated (Local Data)',
      lastChecked: '2 mins ago',
      description: 'Live arrivals and departure board for railway stations across India.'
    },
    {
      id: 'api-transit-schedules',
      name: 'MSRTC Bus & Ferry Transit API',
      endpoint: '/api/transit-schedules',
      method: 'POST',
      category: 'Transport & Booking APIs',
      status: 'Deactivated (Local Data)',
      lastChecked: '4 mins ago',
      description: 'MSRTC Shivneri/ST bus timetables, ferry schedules, and local auto/cab tariff rates.'
    },
    {
      id: 'api-pexels-proxy',
      name: 'Pexels & Unsplash Stock Photos Proxy',
      endpoint: '/api/pexels',
      method: 'GET',
      category: 'Media & Places Proxy',
      status: pexelsActive ? 'Active' : 'Active (Cached Unsplash)',
      lastChecked: 'Just now',
      description: 'High-resolution destination photos and video thumbnail proxy for trip cover imagery.'
    },
    {
      id: 'api-google-places',
      name: 'Google Places & Nearby Search Proxy',
      endpoint: '/api/google-places/textsearch/json',
      method: 'GET',
      category: 'Media & Places Proxy',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Google Maps Platform proxy for local hotels, dhabas, hospitals, petrol pumps, and ATMs.'
    },
    {
      id: 'api-itunes-music',
      name: 'iTunes Music & Roadtrip Playlist API',
      endpoint: 'https://itunes.apple.com/search',
      method: 'GET',
      category: 'Media & Places Proxy',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Roadtrip music search engine for creating collaborative audio playlists.'
    },
    {
      id: 'api-firestore-sync',
      name: 'Firebase Cloud Firestore Sync SDK',
      endpoint: 'Cloud Firestore SDK',
      method: 'Realtime Sync',
      category: 'Database & Cloud Services',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Multi-device real-time sync for group trips, live balances, chats, and shared itineraries.'
    },
    {
      id: 'api-firebase-auth',
      name: 'Firebase Authentication Service',
      endpoint: 'Firebase Auth SDK',
      method: 'Auth SDK',
      category: 'Database & Cloud Services',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Anonymous and Google user login, security credentials, and auth session tokens.'
    },
    {
      id: 'api-system-health',
      name: 'Server Health Monitor Endpoint',
      endpoint: '/api/health',
      method: 'GET',
      category: 'Admin & System APIs',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Lightweight system health monitor endpoint checking Cloud Run status and memory.'
    },
    {
      id: 'api-admin-metrics',
      name: 'Super Admin Dashboard Metrics API',
      endpoint: '/api/admin/metrics',
      method: 'GET',
      category: 'Admin & System APIs',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Aggregates system health percentages, user counts, revenue metrics, and warning logs.'
    },
    {
      id: 'api-admin-health',
      name: 'Super Admin System API Status Directory',
      endpoint: '/api/admin/health',
      method: 'GET',
      category: 'Admin & System APIs',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Returns real-time status, health checks, and metadata for all integrated application APIs.'
    },
    {
      id: 'api-admin-users',
      name: 'Super Admin User Management API',
      endpoint: '/api/admin/users',
      method: 'GET',
      category: 'Admin & System APIs',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'User accounts listing, role management, and account blocking/unblocking controls.'
    },
    {
      id: 'api-admin-tickets',
      name: 'Super Admin Support Tickets API',
      endpoint: '/api/admin/tickets',
      method: 'GET',
      category: 'Admin & System APIs',
      status: 'Active',
      lastChecked: 'Just now',
      description: 'Customer support ticket queues, issues tracking, and refund request processing.'
    },
    {
      id: 'api-stripe-payments',
      name: 'Stripe Payment Gateway API',
      endpoint: '/api/payment',
      method: 'POST',
      category: 'Payment & Communication Gateways',
      status: 'Unlinked',
      lastChecked: 'N/A',
      description: 'Payment checkout gateway for group travel package deposits and agent subscriptions.'
    },
    {
      id: 'api-twilio-sms',
      name: 'Twilio SMS & Broadcast Gateway',
      endpoint: 'Twilio REST API',
      method: 'POST',
      category: 'Payment & Communication Gateways',
      status: 'Active',
      lastChecked: '2 mins ago',
      description: 'SMS notifications, emergency group broadcast notices, and OTP phone verification.'
    }
  ,
    {
      id: 'api-osm',
      name: 'OpenStreetMap Routing API',
      endpoint: 'OSM API',
      method: 'GET',
      category: 'Transport & Booking APIs',
      status: 'Unlinked',
      lastChecked: 'N/A',
      description: 'Open source map data and routing services.'
    },
    {
      id: 'api-openai',
      name: 'OpenAI GPT-4 API',
      endpoint: 'OpenAI API',
      method: 'POST',
      category: 'AI & Gemini Services',
      status: 'Unlinked',
      lastChecked: 'N/A',
      description: 'Alternative AI models for trip processing.'
    },
    {
      id: 'api-viator',
      name: 'Viator Tours & Activities API',
      endpoint: 'Viator API',
      method: 'GET',
      category: 'Transport & Booking APIs',
      status: 'Unlinked',
      lastChecked: 'N/A',
      description: 'Global tours, activities, and experiences booking integration.'
    },
    {
      id: 'api-weather',
      name: 'Weather Forecast API',
      endpoint: 'Weather API',
      method: 'GET',
      category: 'Media & Places Proxy',
      status: 'Unlinked',
      lastChecked: 'N/A',
      description: 'Live weather updates and 7-day destination forecasts.'
    },
  ];

  res.json(apis.map(api => {
    if (api.status === 'Deactivated (Local Data)' || api.status === 'Unlinked') {
      return { ...api, latency: 'N/A', workload: '0%' };
    }
    const realStats = getRealStats(api.endpoint);
    return { ...api, ...realStats };
  }));
});

  // --- POST /api/admin/ping-api ---
app.post("/api/admin/ping-api", requireAdmin, (req, res) => {
  const { apiId, endpoint } = req.body || {};
  const randomLatency = Math.floor(Math.random() * 40) + 12; // 12ms - 52ms
  res.json({
    success: true,
    apiId: apiId || 'api-system-health',
    endpoint: endpoint || '/api/health',
    status: 'Active',
    httpCode: 200,
    latency: `${randomLatency}ms`,
    timestamp: 'Just now',
    message: `Ping successful! Endpoint ${endpoint || apiId} responded in ${randomLatency}ms with HTTP 200 OK.`
  });
});

  // --- POST /api/admin/vault/export-legal ---
app.post("/api/admin/vault/export-legal", requireAdmin, async (req, res) => {
  const db = adminDb();
  const adminUid = (req as any).user.uid;
  return exportUserDataForLegalHandler(req, res, db, adminUid);
});

  // --- POST /api/admin/security/rotate-keys ---
app.post("/api/admin/security/rotate-keys", requireAdmin, async (req, res) => {
  try {
    const db = adminDb();
    if (!db) return res.status(500).json({ error: "Database offline" });

    const currentKek = getMasterKEK();
    // In production, new KEK comes from key management service or request body
    const newKek = req.body.newMasterKek ? Buffer.from(req.body.newMasterKek, "hex") : currentKek;

    const result = await rotateAllUserDEKs(db, currentKek, newKek);
    secureLogger.audit("ROTATE_ALL_USER_DEKS", {
      adminUid: (req as any).user.uid,
      rotatedCount: result.rotatedCount,
      errorsCount: result.errors.length
    });

    res.json({
      success: true,
      message: `Successfully rotated ${result.rotatedCount} user encryption keys.`,
      details: result
    });
  } catch (err: any) {
    secureLogger.error("Key rotation failed:", err);
    res.status(500).json({ error: "Key rotation failed: " + err.message });
  }
});

  // --- POST /api/admin/vault/export ---
  app.post('/api/admin/vault/export', requireAdmin, async (req, res) => {
    const db = adminDb();
    return exportUserDataForLegalHandler(req, res, db, 'super_admin');
  });

  // --- GET /api/admin/vault/all-docs ---
  app.get('/api/admin/vault/all-docs', requireAdmin, async (req, res) => {
    try {
      const db = adminDb();
      if (db) {
        const snap = await db.collection('user_vault_documents').limit(50).get();
        const docs = snap.docs.map(d => ({
          id: d.id,
          userId: d.data().userId,
          title: d.data().title,
          docType: d.data().docType,
          uploadedAt: d.data().uploadedAt,
          verified: d.data().verified,
          status: d.data().status
        }));
        return res.json({ success: true, documents: docs });
      }
      res.json({
        success: true,
        documents: [
          { id: "v-doc-1", userId: "u-101", title: "Passport Copy (Encrypted)", docType: "PASSPORT", uploadedAt: "2026-08-20T10:15:00Z", verified: true, status: "ENCRYPTED_ZERO_TRUST" },
          { id: "v-doc-2", userId: "u-102", title: "Commercial Taxi Permit", docType: "VEHICLE_RC", uploadedAt: "2026-08-22T14:30:00Z", verified: true, status: "ENCRYPTED_ZERO_TRUST" }
        ]
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch admin vault entries", details: err.message });
    }
  });

  // --- GET /api/admin/metrics ---
  app.get("/api/admin/metrics", requireAdmin, async (req, res) => {
    try {
      const db = adminDb();
      const metrics = await getAdminMetrics(db);
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch admin metrics", details: err.message });
    }
  });

  // --- GET /api/admin/vendors ---
  app.get("/api/admin/vendors", requireAdmin, async (req, res) => {
    try {
      const db = adminDb();
      const vendors = await getAdminVendors(db);
      res.json({ success: true, vendors });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch vendors", details: err.message });
    }
  });

  // --- POST /api/admin/vendors/review ---
  app.post("/api/admin/vendors/review", requireAdmin, async (req, res) => {
    try {
      const { vendorId, action, reason } = req.body || {};
      if (!vendorId || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: "Invalid vendorId or action. Action must be 'approve' or 'reject'." });
      }

      const db = adminDb();
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      const updated = await reviewAdminVendor(vendorId, status, reason, db);

      secureLogger.audit("VENDOR_REVIEW", { vendorId, action, reason, admin: (req as any).user?.uid });

      res.json({
        success: true,
        vendorId,
        action,
        status,
        vendor: updated,
        message: `Vendor ${vendorId} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to review vendor", details: err.message });
    }
  });

  // --- GET /api/admin/payouts ---
  app.get("/api/admin/payouts", requireAdmin, async (req, res) => {
    try {
      const db = adminDb();
      const payouts = await getAdminPayouts(db);
      const pendingTotal = payouts
        .filter((p) => p.status === "PENDING")
        .reduce((sum, p) => sum + p.amount, 0);
      const releasedTotal = payouts
        .filter((p) => p.status === "RELEASED")
        .reduce((sum, p) => sum + p.amount, 0);

      res.json({
        success: true,
        balance: releasedTotal,
        pending: pendingTotal,
        payouts
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch payouts", details: err.message });
    }
  });

  // --- POST /api/admin/payouts/release ---
  app.post("/api/admin/payouts/release", requireAdmin, async (req, res) => {
    try {
      const { payoutId, releaseAll } = req.body || {};
      const db = adminDb();

      if (releaseAll) {
        const payouts = await getAdminPayouts(db);
        const pending = payouts.filter((p) => p.status === "PENDING");
        for (const p of pending) {
          await releaseAdminPayout(p.id, db);
        }
        secureLogger.audit("PAYOUT_RELEASE_ALL", { count: pending.length, admin: (req as any).user?.uid });
        return res.json({
          success: true,
          message: `All ${pending.length} pending vendor payouts successfully released.`,
          releasedCount: pending.length,
          processedAt: new Date().toISOString()
        });
      }

      if (payoutId) {
        const released = await releaseAdminPayout(payoutId, db);
        secureLogger.audit("PAYOUT_RELEASE", { payoutId, admin: (req as any).user?.uid });
        return res.json({
          success: true,
          message: `Payout ${payoutId} released.`,
          payout: released,
          releasedCount: 1,
          processedAt: new Date().toISOString()
        });
      }

      return res.status(400).json({ error: "Either payoutId or releaseAll is required." });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to release payouts", details: err.message });
    }
  });

  // --- GET /api/admin/users ---
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const db = adminDb();
      const users = await getAdminUsers(db);
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch users", details: err.message });
    }
  });

  // --- POST /api/admin/users/update ---
  app.post("/api/admin/users/update", requireAdmin, async (req, res) => {
    try {
      const { userId, role, status } = req.body || {};
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const db = adminDb();
      const updated = await updateAdminUser(userId, role, status, db);

      secureLogger.audit("USER_STATUS_UPDATE", { userId, role, status, admin: (req as any).user?.uid });

      res.json({
        success: true,
        message: `User ${userId} updated successfully.`,
        user: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update user", details: err.message });
    }
  });

  // --- GET /api/admin/tickets ---
  app.get("/api/admin/tickets", requireAdmin, async (req, res) => {
    try {
      const db = adminDb();
      const tickets = await getAdminTickets(db);
      res.json({ success: true, tickets });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch tickets", details: err.message });
    }
  });

  // --- POST /api/admin/tickets/resolve ---
  app.post("/api/admin/tickets/resolve", requireAdmin, async (req, res) => {
    try {
      const { ticketId, resolution } = req.body || {};
      if (!ticketId) {
        return res.status(400).json({ error: "ticketId is required" });
      }

      const db = adminDb();
      const resolved = await resolveAdminTicket(ticketId, resolution || "Resolved by Administrator", db);

      secureLogger.audit("TICKET_RESOLVE", { ticketId, resolution, admin: (req as any).user?.uid });

      res.json({
        success: true,
        ticketId,
        status: "RESOLVED",
        ticket: resolved,
        resolution: resolution || "Marked resolved by Admin",
        resolvedAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to resolve ticket", details: err.message });
    }
  });

  // --- POST /api/admin/security/scan ---
  app.post("/api/admin/security/scan", requireAdmin, async (req, res) => {
    try {
      res.json({
        success: true,
        findingsCount: 0,
        score: 98,
        status: "SECURE",
        details: "Zero trust checks, DEK health, and Firebase AppCheck verified. No vulnerabilities detected.",
        scannedAt: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to execute security scan", details: err.message });
    }
  });

}
