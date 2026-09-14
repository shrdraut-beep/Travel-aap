import { Router, Request, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/auth';

interface AuthedRequest extends Request {
  user?: DecodedIdToken;
}

const RETENTION_EXEMPT_COLLECTIONS = [
  'checkout_orders', // Financial records required by GST
  'wallet_transactions' // Financial records required by RBI
];

export function createPrivacyRouter(adminDb: () => any) {
  const router = Router();

  // 1. Get user consent status
  router.get('/consent', async (req: AuthedRequest, res: Response) => {
    const db = adminDb();
    if (!db) return res.status(503).json({ error: 'DB offline' });
    
    try {
      const doc = await db.collection('user_consents').doc(req.user!.uid).get();
      if (!doc.exists) {
        return res.json({ consents: {} });
      }
      res.json({ consents: doc.data()?.purposes || {} });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch consent', details: err.message });
    }
  });

  // 2. Record/update consent
  router.post('/consent', async (req: AuthedRequest, res: Response) => {
    const { purpose, granted } = req.body;
    if (typeof purpose !== 'string' || typeof granted !== 'boolean') {
      return res.status(400).json({ error: 'Invalid consent payload' });
    }

    const db = adminDb();
    if (!db) return res.status(503).json({ error: 'DB offline' });

    try {
      const consentRef = db.collection('user_consents').doc(req.user!.uid);
      const auditRef = db.collection('consent_audit_logs').doc();

      await db.runTransaction(async (t: any) => {
        t.set(consentRef, {
          [`purposes.${purpose}`]: granted,
          lastUpdated: FieldValue.serverTimestamp()
        }, { merge: true });

        t.set(auditRef, {
          uid: req.user!.uid,
          purpose,
          granted,
          timestamp: FieldValue.serverTimestamp(),
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
      });

      res.json({ success: true, purpose, granted });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update consent', details: err.message });
    }
  });

  // 3. Queue delete request
  router.post('/delete-request', async (req: AuthedRequest, res: Response) => {
     const db = adminDb();
     if (!db) return res.status(503).json({ error: 'DB offline' });

     try {
       await db.collection('deletion_requests').doc(req.user!.uid).set({
         uid: req.user!.uid,
         email: req.user!.email,
         status: 'pending',
         requestedAt: FieldValue.serverTimestamp()
       });

       res.json({ 
         success: true, 
         message: 'Deletion request queued.',
         retainedCategories: RETENTION_EXEMPT_COLLECTIONS
       });
     } catch (err: any) {
       res.status(500).json({ error: 'Failed to queue deletion', details: err.message });
     }
  });

  // 4. Data portability export
  router.get('/export', async (req: AuthedRequest, res: Response) => {
     const db = adminDb();
     if (!db) return res.status(503).json({ error: 'DB offline' });

     try {
       const [profileDoc, consentsDoc] = await Promise.all([
         db.collection('users').doc(req.user!.uid).get(),
         db.collection('user_consents').doc(req.user!.uid).get()
       ]);

       res.json({
         profile: profileDoc.data() || {},
         consents: consentsDoc.data() || {},
         timestamp: new Date().toISOString()
       });
     } catch (err: any) {
       res.status(500).json({ error: 'Failed to export data', details: err.message });
     }
  });

  return router;
}
