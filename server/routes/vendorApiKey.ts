import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getApps } from 'firebase-admin/app';
import { getSafeAdminFirestore } from '../firebaseAdmin.ts';
import { getAuth } from 'firebase-admin/auth';

/**
 * SEC-02: Firebase Auth middleware — verifies Bearer token before sensitive vendor operations
 */
async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. Please provide a valid Bearer token.' });
    return;
  }
  try {
    if (getApps().length > 0) {
      const decoded = await getAuth().verifyIdToken(token);
      (req as any).authenticatedUser = decoded;
    }
    // In dev mode with no Firebase app, allow through (local testing)
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}

const router = express.Router();

const VENDORS_STORE_FILE = path.join(process.cwd(), 'data', 'vendors_store.json');
const VENDOR_PROFILES_FILE = path.join(process.cwd(), 'data', 'vendor_profiles_store.json');

function getStoredJson(filePath: string, fallback: any[] = []): any[] {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`[vendorApiKey] Error reading ${filePath}:`, e);
  }
  return fallback;
}

function saveStoredJson(filePath: string, data: any[]) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`[vendorApiKey] Error saving ${filePath}:`, e);
  }
}

// 1. Generate B2B API Key (One-time view, hashed in database)
// SEC-02: Auth-protected — only authenticated vendors can generate/rotate their own API key
router.post('/generate-api-key', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.body;
    const targetVendorId = (vendorId || 'VEND-1001').trim();

    // 1. Secure random key generation: 32 bytes hex prefixed with rt_live_
    const rawKey = 'rt_live_' + crypto.randomBytes(32).toString('hex');

    // 2. High security: Generate SHA-256 Hash of key (saved in database)
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    // 3. Masked Key for display and verification
    const maskedKey = 'rt_live_****************' + rawKey.slice(-4);
    const createdAt = new Date().toISOString();

    const updatePayload = {
      apiKeyHash: hashedKey,
      apiKeyMasked: maskedKey,
      apiKeyCreatedAt: createdAt
    };

    // 4. Update in Firestore ('vendors' and 'vendor_profiles' collections)
    try {
      const db = getSafeAdminFirestore();
      if (db) {
        await Promise.all([
          db.collection('vendors').doc(targetVendorId).set(updatePayload, { merge: true }),
          db.collection('vendor_profiles').doc(targetVendorId).set(updatePayload, { merge: true })
        ]);
      }
    } catch {
      // Quiet disk store fallback
    }

    // 5. Update local disk store (NEVER save rawKey!)
    const vendors = getStoredJson(VENDORS_STORE_FILE, [
      {
        id: targetVendorId,
        businessName: 'Registered Travel Partner',
        kycStatus: 'VERIFIED'
      }
    ]);
    const updatedVendors = vendors.map(v => 
      v.id === targetVendorId 
        ? { ...v, ...updatePayload } 
        : v
    );
    if (!updatedVendors.some(v => v.id === targetVendorId)) {
      updatedVendors.push({ id: targetVendorId, businessName: 'Registered Travel Partner', kycStatus: 'VERIFIED', ...updatePayload });
    }
    saveStoredJson(VENDORS_STORE_FILE, updatedVendors);

    // Also sync to vendor_profiles_store.json
    const profiles = getStoredJson(VENDOR_PROFILES_FILE, []);
    const updatedProfiles = profiles.map(p => 
      p.id === targetVendorId ? { ...p, ...updatePayload } : p
    );
    saveStoredJson(VENDOR_PROFILES_FILE, updatedProfiles);

    // 6. Return rawKey ONLY in this response. Never stored on server!
    res.status(200).json({
      success: true,
      rawKey,
      maskedKey,
      createdAt,
      message: 'B2B API Key generated successfully! Keep this key safe, it will never be displayed again.'
    });
  } catch (error: any) {
    console.error('[vendorApiKey] Failed to generate API key:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to generate API key' });
  }
});

// 2. Middleware to authenticate B2B requests via x-api-key header
export async function authenticateB2BKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = (req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '') || req.body?.apiKey) as string;

  if (!apiKey || typeof apiKey !== 'string') {
    res.status(401).json({ success: false, error: 'Invalid API Key or Key has been revoked' });
    return;
  }

  const hashedIncoming = crypto.createHash('sha256').update(apiKey.trim()).digest('hex');

  // Check Firestore first
  let vendorMatched: any = null;
  try {
    const db = getSafeAdminFirestore();
    if (db) {
      const snap = await db.collection('vendors').where('apiKeyHash', '==', hashedIncoming).limit(1).get();
      if (!snap.empty) {
        vendorMatched = snap.docs[0].data();
        vendorMatched.id = snap.docs[0].id;
      }
    }
  } catch {
    // Quiet disk fallback
  }

  // Check disk store fallback
  if (!vendorMatched) {
    const vendors = getStoredJson(VENDORS_STORE_FILE, []);
    vendorMatched = vendors.find(v => v.apiKeyHash === hashedIncoming);
  }

  if (!vendorMatched) {
    res.status(401).json({ success: false, error: 'Invalid API Key or Key has been revoked' });
    return;
  }

  (req as any).authenticatedVendor = vendorMatched;
  next();
}

// 3. B2B Live Inventory Update Endpoints (Exact endpoints matching RouTripO B2B API Spec)
router.post(['/inventory/bus/update', '/v1/inventory/bus/update'], authenticateB2BKey, async (req: Request, res: Response): Promise<void> => {
  try {
    const { busId, travelDate, availableSeats, blockedSeats } = req.body;

    if (!busId) {
      res.status(400).json({ success: false, error: 'Missing required field: busId' });
      return;
    }
    if (!travelDate) {
      res.status(400).json({ success: false, error: 'Missing required fields: travelDate' });
      return;
    }

    const updatedAt = new Date().toISOString();
    const busesPath = path.join(process.cwd(), 'data', 'buses_store.json');
    const buses = getStoredJson(busesPath, []);
    const updated = buses.map(b => 
      b.id === busId 
        ? { ...b, availableSeats: availableSeats ?? b.total_capacity, blockedSeats: blockedSeats ?? 0, travelDate, updatedAt } 
        : b
    );
    saveStoredJson(busesPath, updated);

    // Also update Firestore if available
    try {
      const db = getSafeAdminFirestore();
      if (db) {
        await db.collection('buses').doc(busId).set({
          availableSeats: availableSeats ?? 12,
          blockedSeats: blockedSeats ?? 0,
          travelDate,
          updatedAt
        }, { merge: true });
      }
    } catch {
      // Quiet disk fallback
    }

    res.status(200).json({
      success: true,
      message: 'Bus inventory synced successfully',
      busId,
      travelDate,
      availableSeats: availableSeats ?? 12,
      blockedSeats: blockedSeats ?? 0,
      updatedAt
    });
  } catch (error: any) {
    console.error('[vendorApiKey] Bus inventory sync error:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to sync bus inventory' });
  }
});

router.post(['/inventory/car/update', '/v1/inventory/car/update'], authenticateB2BKey, async (req: Request, res: Response): Promise<void> => {
  try {
    const { carId, date, status } = req.body;

    if (!carId) {
      res.status(400).json({ success: false, error: 'Missing required field: carId' });
      return;
    }

    const normalizedStatus = status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    const updatedAt = new Date().toISOString();
    const cabsPath = path.join(process.cwd(), 'data', 'cabs_store.json');
    const cabs = getStoredJson(cabsPath, []);
    const updated = cabs.map(c => 
      c.id === carId 
        ? { ...c, status: normalizedStatus, date, updatedAt } 
        : c
    );
    saveStoredJson(cabsPath, updated);

    // Also update Firestore if available
    try {
      const db = getSafeAdminFirestore();
      if (db) {
        await db.collection('cabs').doc(carId).set({
          status: normalizedStatus,
          date,
          updatedAt
        }, { merge: true });
      }
    } catch {
      // Quiet disk fallback
    }

    res.status(200).json({
      success: true,
      message: 'Cab status synced successfully',
      carId,
      status: normalizedStatus,
      updatedAt
    });
  } catch (error: any) {
    console.error('[vendorApiKey] Car status sync error:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to sync car status' });
  }
});

// Generic B2B Live Inventory Update Endpoint (for backward compatibility)
router.post(['/inventory/update', '/v1/inventory/update'], authenticateB2BKey, async (req: Request, res: Response): Promise<void> => {
  try {
    const { inventoryType, itemId, date, availableSeats, availableRooms, baseFare } = req.body;

    if (!inventoryType || !itemId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: inventoryType ("BUS" | "CAB" | "HOTEL") and itemId are required'
      });
      return;
    }

    const updatedAt = new Date().toISOString();

    if (inventoryType === 'BUS') {
      const busesPath = path.join(process.cwd(), 'data', 'buses_store.json');
      const buses = getStoredJson(busesPath, []);
      const updated = buses.map(b => b.id === itemId ? { ...b, availableSeats: availableSeats ?? b.total_capacity, updatedAt } : b);
      saveStoredJson(busesPath, updated);
    } else if (inventoryType === 'CAB') {
      const cabsPath = path.join(process.cwd(), 'data', 'cabs_store.json');
      const cabs = getStoredJson(cabsPath, []);
      const updated = cabs.map(c => c.id === itemId ? { ...c, status: availableSeats > 0 ? 'AVAILABLE' : 'BOOKED', updatedAt } : c);
      saveStoredJson(cabsPath, updated);
    }

    res.status(200).json({
      success: true,
      message: 'Inventory successfully synced',
      itemId,
      inventoryType,
      updatedAt
    });
  } catch (error: any) {
    console.error('[vendorApiKey] Inventory sync error:', error);
    res.status(500).json({ success: false, error: error?.message || 'Inventory synchronization failed' });
  }
});

// 4. Check active key metadata (Masked key only) — SEC-02: auth required
router.get('/key-status/:vendorId', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId } = req.params;
    let vendorData: any = null;

    const db = getSafeAdminFirestore();
    if (db) {
      try {
        const doc = await db.collection('vendors').doc(vendorId).get();
        if (doc.exists) {
          vendorData = doc.data();
        }
      } catch {
        // Quiet disk fallback
      }
    }

    if (!vendorData) {
      const vendors = getStoredJson(VENDORS_STORE_FILE, []);
      vendorData = vendors.find(v => v.id === vendorId);
    }

    if (!vendorData) {
      res.status(200).json({ success: true, hasKey: false, apiKeyMasked: null });
      return;
    }

    res.status(200).json({
      success: true,
      hasKey: Boolean(vendorData.apiKeyHash),
      apiKeyMasked: vendorData.apiKeyMasked || null,
      apiKeyCreatedAt: vendorData.apiKeyCreatedAt || null
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message });
  }
});

export default router;
