import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, type Firestore, type DocumentReference } from 'firebase-admin/firestore';
import { UniversalIdGenerator } from '../services/universalIdService.ts';
import { meilisearchService, MEILI_INDEX_HOTELS } from '../services/meilisearchService.ts';

const router = express.Router();

// Fallback in-memory store for idempotency in local development or when Firestore Admin is offline
const memoryWebhookLogs = new Set<string>();

/**
 * SEC-10: Optional HMAC-SHA256 Signature Verification for Channel Manager webhooks.
 * If CHANNEL_MANAGER_WEBHOOK_SECRET env var is set, the X-CM-Signature header is validated.
 * Backward-compatible: if secret is not configured, webhook passes through with a warning.
 */
function verifyChannelManagerSignature(req: Request, rawBody: string): boolean {
  const secret = process.env.CHANNEL_MANAGER_WEBHOOK_SECRET;
  if (!secret) {
    // Secret not configured — warn but allow (backward compat for existing partners)
    console.warn('[ChannelManager] CHANNEL_MANAGER_WEBHOOK_SECRET not set. Signature verification skipped. Configure this env var for full security.');
    return true;
  }
  const providedSig = req.headers['x-cm-signature'] as string | undefined;
  if (!providedSig) {
    console.warn('[ChannelManager] X-CM-Signature header missing. Rejecting unsigned webhook.');
    return false;
  }
  const expectedSig = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    const providedBuf = Buffer.from(providedSig, 'utf8');
    if (expectedBuf.length !== providedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

/**
 * CHANNEL MANAGER WEBHOOK ENDPOINT (ARI & Bookings)
 * Route: POST /api/channel-manager/webhook
 * Strictly enforces X-Idempotency-Key validation to prevent duplicate processing
 */
router.post(['/webhook', '/'], async (req: Request, res: Response): Promise<void> => {
  try {
    const rawKey = req.header('x-idempotency-key') || (req.headers['x-idempotency-key'] as string);
    const idempotencyKey = rawKey ? rawKey.trim() : '';
    const payload = req.body || {};

    // SEC-10: Verify HMAC signature if secret is configured
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    if (!verifyChannelManagerSignature(req, rawBody)) {
      res.status(401).json({ error: 'Invalid webhook signature. Check X-CM-Signature header.' });
      return;
    }

    if (!idempotencyKey) {
      res.status(400).json({ error: 'Missing Idempotency Key' });
      return;
    }

    // 1. Check idempotency in memory cache
    if (memoryWebhookLogs.has(idempotencyKey)) {
      res.status(200).json({ status: 'Already processed (Idempotent)' });
      return;
    }

    // 2. Check idempotency in Firestore (webhook_logs collection)
    let db: Firestore | null = null;
    try {
      if (getApps().length > 0) {
        db = getFirestore();
      }
    } catch (e) {
      /* ignore if not initialized in local dev */
    }

    let logRef: DocumentReference | null = null;
    if (db) {
      try {
        logRef = db.collection('webhook_logs').doc(idempotencyKey);
        const logDoc = await logRef.get();
        if (logDoc.exists) {
          memoryWebhookLogs.add(idempotencyKey);
          res.status(200).json({ status: 'Already processed (Idempotent)' });
          return;
        }
      } catch (err: any) {
        console.warn('[ChannelManager] Firestore webhook check skipped (dev mode):', err?.message);
      }
    }

    // Mark as processed in local cache
    memoryWebhookLogs.add(idempotencyKey);

    console.log('[ChannelManager] Processing Webhook Payload for Key:', idempotencyKey);

    // 3. Normalize Hotel Inventory from Channel Manager ARI push
    const hotelData = payload.hotel || payload.property || payload;
    let masterHotelId: string | null = null;

    if (hotelData && (hotelData.name || hotelData.propertyName)) {
      const state = hotelData.state || 'MAH';
      const city = hotelData.city || 'MUM';
      masterHotelId = hotelData.id || UniversalIdGenerator.generateId('HOTEL', state, city);

      const normalizedHotel = {
        id: masterHotelId,
        name: hotelData.name || hotelData.propertyName,
        city_id: (hotelData.city_id || city).toUpperCase(),
        city: hotelData.city || 'Mumbai',
        state: hotelData.state || 'Maharashtra',
        address: hotelData.address || '',
        price: Number(hotelData.price || hotelData.basePrice || hotelData.rate || 3500),
        star_rating: Number(hotelData.star_rating || hotelData.stars || 4),
        rating: Number(hotelData.rating || 4.5),
        amenities: Array.isArray(hotelData.amenities)
          ? hotelData.amenities
          : ['Free Wi-Fi', 'Air Conditioned Rooms (AC)', '24/7 Front Desk'],
        propertyType: hotelData.propertyType || 'Partner Hotel',
        refundType: hotelData.refundType || 'REFUNDABLE',
        inventoryCount: Number(hotelData.inventory || hotelData.roomsAvailable || 10),
        source: 'CHANNEL_MANAGER_ARI',
        updatedAt: new Date().toISOString(),
      };

      // Persist to Firestore master_hotels if available
      if (db) {
        try {
          await db.collection('master_hotels').doc(masterHotelId).set(normalizedHotel, { merge: true });
        } catch (e: any) {
          console.warn('[ChannelManager] Firestore master_hotels write failed:', e?.message);
        }
      }

      // Automatically update Meilisearch index in background
      try {
        await meilisearchService.addDocumentsInBatches(MEILI_INDEX_HOTELS, [normalizedHotel], 1);
      } catch (e: any) {
        /* Meilisearch offline in dev */
      }
    }

    // 4. Save audit log to ensure future idempotency
    if (logRef && db) {
      try {
        await logRef.set({
          processed_at: FieldValue.serverTimestamp(),
          idempotency_key: idempotencyKey,
          hotel_id: masterHotelId,
          payload: payload,
        });
      } catch (e: any) {
        console.warn('[ChannelManager] Firestore log write failed:', e?.message);
      }
    }

    const confirmation_id = UniversalIdGenerator.generateConfirmationId('CONF');

    res.status(200).json({
      status: 'Success',
      confirmation_id,
      hotel_id: masterHotelId || undefined,
      message: 'Channel Manager webhook processed successfully',
    });
  } catch (error: any) {
    console.error('[ChannelManager] Webhook Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * ICAL SYNC ENDPOINTS (Free Channel Manager alternative)
 * Reads external calendar links (Airbnb, Booking.com, Agoda) and blocks dates in Firestore.
 */
router.post(['/sync-ical', '/hotels/:id/sync-ical'], async (req: Request, res: Response): Promise<void> => {
  try {
    const hotelId = req.params.id || req.body.hotelId || req.body.hotel_id;
    const icalUrl = req.body.icalUrl || req.body.ical_url || req.body.url;

    if (!hotelId) {
      res.status(400).json({ success: false, error: 'hotelId parameter or body field is required' });
      return;
    }

    if (!icalUrl) {
      res.status(400).json({ success: false, error: 'icalUrl is required in request body' });
      return;
    }

    const { syncAndBlockDatesFromICal } = await import('../services/icalSyncService.ts');
    const result = await syncAndBlockDatesFromICal(hotelId, icalUrl);

    if (!result.success) {
      res.status(502).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error('[ChannelManager] iCal Sync Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to sync iCal' });
  }
});

/**
 * GET HOTEL ICAL CALENDAR FEED
 * RFC 5545 compliant .ics output for third-party OTAs (Airbnb, Agoda, Booking.com)
 * Route: GET /api/channel-manager/calendar/:hotelId.ics OR GET /api/channel-manager/hotels/:id/calendar.ics
 */
router.get(['/calendar/:hotelId.ics', '/hotels/:hotelId/calendar.ics', '/calendar/:hotelId'], async (req: Request, res: Response): Promise<void> => {
  try {
    const hotelId = req.params.hotelId || req.params.id;
    if (!hotelId) {
      res.status(400).send('Hotel ID is required');
      return;
    }

    const { generateHotelICalFeed } = await import('../services/icalSyncService.ts');
    const icsContent = await generateHotelICalFeed(hotelId);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${hotelId}-availability.ics"`);
    res.send(icsContent);
  } catch (err: any) {
    console.error('[ChannelManager] iCal Feed Generation Error:', err);
    res.status(500).send('Error generating calendar feed');
  }
});

/**
 * GET BLOCKED DATES FOR A HOTEL
 * Route: GET /api/channel-manager/hotels/:id/blocked-dates
 */
router.get('/hotels/:id/blocked-dates', async (req: Request, res: Response): Promise<void> => {
  try {
    const hotelId = req.params.id;
    const { getBlockedDatesForHotel } = await import('../services/icalSyncService.ts');
    const dates = await getBlockedDatesForHotel(hotelId);
    res.json({ success: true, hotelId, blockedDates: dates, total: dates.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

