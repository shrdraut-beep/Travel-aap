/**
 * server/modules/payments/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization — payments module first,
 * since it's the highest-risk domain and where the CORS/HMAC/bookingId-binding
 * fixes already live).
 *
 * Covers: wallet balance/create-order/verify-payment, checkout validate-promo/
 * create-order, razorpay/verify, bookings confirm/cancel.
 *
 * Route bodies below are moved verbatim from server.ts — no logic changed as
 * part of this extraction. Only the wiring (imports + how shared state is
 * accessed) changed, from free variables to an explicit `deps` object.
 */

import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import type Razorpay from "razorpay";
import crypto from "crypto";
import { IdempotencyEngine } from "../../security/idempotency.ts";
import { calculateRoutTripoTaxes } from "../../../src/taxEngine.ts";
import { sendCustomerInvoiceEmail } from "../../../src/NotificationService.ts";

interface AuthedRequest extends Request {
  user?: DecodedIdToken;
}

export interface PaymentModuleDeps {
  app: Express;
  adminDb: () => Firestore | null;
  requireAuth: (req: any, res: any, next: any) => Promise<any> | any;
  razorpay: Razorpay;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  secureLogger: { warn: (...a: any[]) => void; error: (...a: any[]) => void; info?: (...a: any[]) => void };
  inMemoryAgentWallets: Map<string, number>;
  /** Local helper from server.ts (line ~2414) — pass the function reference directly, no import path exists for it yet. */
  parseApiError: (error: any) => string;
  isAdminUser: (user?: DecodedIdToken) => boolean;
}

export function registerPaymentRoutes(deps: PaymentModuleDeps): void {
  const {
    app,
    adminDb,
    requireAuth,
    razorpay,
    razorpayKeyId,
    razorpayKeySecret,
    secureLogger,
    inMemoryAgentWallets,
    parseApiError,
    isAdminUser,
  } = deps;

  // --- GET /api/wallet/balance ---
  app.get("/api/wallet/balance", requireAuth, async (req, res) => {
  const uid = (req as any).user?.uid || 'anon';
  let balance = inMemoryAgentWallets.get(uid) || 0;

  try {
    const db = adminDb();
    if (db) {
      const agentDoc = await db.collection("agents").doc(uid).get();
      if (agentDoc.exists) {
        balance = agentDoc.data()?.walletBalance || 0;
        inMemoryAgentWallets.set(uid, balance);
      }
    }
  } catch (error: any) {
    // Graceful fallback if Firebase Admin lacks Firestore permissions in runtime container
    console.warn(`[wallet] Database balance query for ${uid} unavailable: ${error?.message || error}. Serving cached balance (${balance}).`);
  }

  res.json({ balance });
  });

  // --- POST /api/wallet/create-order ---
  app.post("/api/wallet/create-order", requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `rcpt_wallet_${Date.now()}`
    };

    let order: any;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr: any) {
      console.warn("Razorpay live API order notice (using sandbox order):", rzpErr?.message || rzpErr?.error?.description);
      order = {
        id: `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entity: "order",
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    res.json({ ...order, keyId: razorpayKeyId, key: razorpayKeyId });
  } catch (error: any) {
    console.error("Error creating Razorpay order", error);
    const errorMessage = error?.error?.description || error.message || "Failed to create order";
    res.status(500).json({ error: errorMessage });
  }
  });

  // --- POST /api/checkout/validate-promo ---
  app.post("/api/checkout/validate-promo", async (req, res) => {
  try {
    const { promoCode, amount, deviceId, userId } = req.body;
    if (!promoCode || typeof promoCode !== 'string') {
      return res.status(400).json({ success: false, valid: false, error: "Promo code is required" });
    }

    const code = promoCode.trim().toUpperCase();
    const subtotal = Number(amount) || 0;
    const cleanDeviceId = (deviceId || '').trim();

    // Known coupons catalog
    const PROMO_CATALOG: Record<string, { type: 'flat' | 'percentage'; discount: number; minAmount: number; maxDiscount?: number; isNewUserOnly?: boolean; desc: string }> = {
      'WELCOME500': { type: 'flat', discount: 500, minAmount: 1000, isNewUserOnly: true, desc: 'Flat ₹500 off on your first booking' },
      'NEWUSER': { type: 'percentage', discount: 25, minAmount: 1200, maxDiscount: 1500, isNewUserOnly: true, desc: '25% off up to ₹1,500 for new users' },
      'FIRSTFLY': { type: 'flat', discount: 750, minAmount: 3000, isNewUserOnly: true, desc: 'Flat ₹750 off on first flight' },
      'SAVE20': { type: 'percentage', discount: 20, minAmount: 1500, maxDiscount: 2000, isNewUserOnly: false, desc: '20% off up to ₹2,000' },
      'ROUTRIPO10': { type: 'percentage', discount: 10, minAmount: 500, maxDiscount: 1500, isNewUserOnly: false, desc: '10% instant discount' },
      'FLYHIGH1000': { type: 'flat', discount: 1000, minAmount: 4000, isNewUserOnly: false, desc: 'Flat ₹1,000 off' },
      'SUMMERTRIP': { type: 'percentage', discount: 15, minAmount: 2000, maxDiscount: 3000, isNewUserOnly: false, desc: '15% off special' },
      'FESTIVE300': { type: 'flat', discount: 300, minAmount: 800, isNewUserOnly: false, desc: 'Flat ₹300 off' }
    };

    const promo = PROMO_CATALOG[code];
    if (!promo) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: `Coupon code '${code}' is invalid or expired.`
      });
    }

    if (subtotal < promo.minAmount) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: `Minimum booking value of ₹${promo.minAmount.toLocaleString('en-IN')} required for coupon '${code}'.`
      });
    }

    const db = adminDb();

    // 1. Anti-Promo Fraud Check: Device Fingerprint & Account Validation
    if (promo.isNewUserOnly && cleanDeviceId && db) {
      try {
        // Query device_promos collection to see if this Device ID has already redeemed a new-user discount
        const devicePromoSnap = await db.collection("device_promos")
          .where("deviceId", "==", cleanDeviceId)
          .where("promoCode", "in", Object.keys(PROMO_CATALOG).filter(k => PROMO_CATALOG[k].isNewUserOnly))
          .limit(1)
          .get();

        if (!devicePromoSnap.empty) {
          return res.status(403).json({
            success: false,
            valid: false,
            error: "This promo code is strictly valid for first-time bookings only and has already been redeemed on this device."
          });
        }

        // Also check if userId has previous completed bookings
        if (userId) {
          const userBookingSnap = await db.collection("bookings")
            .where("userId", "==", userId)
            .where("status", "in", ["CONFIRMED", "COMPLETED"])
            .limit(1)
            .get();

          if (!userBookingSnap.empty) {
            return res.status(403).json({
              success: false,
              valid: false,
              error: "This promo code is strictly valid for first-time users. Your account already has completed bookings."
            });
          }
        }
      } catch (checkErr) {
        console.warn("[Promo Fraud Check Notice]:", checkErr);
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.type === 'flat') {
      discountAmount = promo.discount;
    } else {
      discountAmount = Math.round((subtotal * promo.discount) / 100);
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    }

    discountAmount = Math.min(discountAmount, Math.max(0, subtotal - 1));
    const finalAmount = Math.max(1, subtotal - discountAmount);

    return res.json({
      success: true,
      valid: true,
      coupon: {
        code,
        type: promo.type,
        discount: promo.discount,
        minAmount: promo.minAmount,
        maxDiscount: promo.maxDiscount,
        description: promo.desc
      },
      discountAmount,
      finalAmount
    });
  } catch (error: any) {
    const parsedDetails = parseApiError(error);
    res.status(500).json({ success: false, valid: false, error: "Failed to validate promo code", details: parsedDetails });
  }
  });

  // --- POST /api/checkout/create-order ---
  app.post("/api/checkout/create-order", requireAuth, async (req, res) => {
  const userId = (req as any).user?.uid || 'guest';
  const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey || '';
  const db = adminDb();

  try {
    const { 
      itemType, 
      itemId, 
      packageId, 
      hotelId, 
      carId, 
      flightId, 
      quantity, 
      travelersCount, 
      amount: customAmount,
      promoCode, 
      deviceId,
      bookingId
    } = req.body;

    const resolvedItemId = itemId || packageId || hotelId || carId || flightId;
    const resolvedItemType = itemType || (packageId ? "package" : hotelId ? "hotel" : carId ? "car" : flightId ? "flight" : "package");
    const resolvedQuantity = quantity || travelersCount || 1;
    const cleanDeviceId = (deviceId || '').trim();

    // 1. Idempotency Check: Prevent double charges and network drop duplicates
    if (idempotencyKey) {
      const existingRecord = await IdempotencyEngine.checkKey(idempotencyKey, userId, db);
      if (existingRecord) {
        if (existingRecord.status === 'COMPLETED' && existingRecord.responsePayload) {
          res.setHeader('X-Idempotent-Replay', 'true');
          return res.status(existingRecord.httpStatus || 200).json(existingRecord.responsePayload);
        }
        if (existingRecord.status === 'PROCESSING') {
          return res.status(409).json({ 
            error: "Payment order is already being processed. Please do not submit duplicate requests." 
          });
        }
      }

      // Acquire lock for this key
      const locked = await IdempotencyEngine.acquireLock(idempotencyKey, userId, db);
      if (!locked) {
        return res.status(409).json({ 
          error: "Concurrent checkout detected for this idempotency key." 
        });
      }
    }

    if (!resolvedItemId && !customAmount) {
      if (idempotencyKey) await IdempotencyEngine.releaseOrFail(idempotencyKey, userId, db);
      return res.status(400).json({ error: "Item ID or Amount is required" });
    }
    if (resolvedQuantity <= 0) {
      if (idempotencyKey) await IdempotencyEngine.releaseOrFail(idempotencyKey, userId, db);
      return res.status(400).json({ error: "Quantity must be strictly greater than 0" });
    }

    let unitPrice = 0;

    try {
      if (resolvedItemType === "package" && resolvedItemId && db) {
        let pkgDoc = await db.collection("packages").doc(resolvedItemId).get();
        if (!pkgDoc.exists) {
          const defaultPackagesToSeed = [
            { id: "pkg_ratnagiri_1", title: "Ratnagiri Beach & Mango Tour", price: 3800, destination: "Ratnagiri" },
            { id: "pkg_goa_1", title: "Goa Coastal Escapade", price: 8900, destination: "Goa" },
            { id: "pkg_mahabaleshwar_1", title: "Mahabaleshwar Hills & Strawberry Farm Tour", price: 5500, destination: "Mahabaleshwar" },
            { id: "pkg_shirdi_1", title: "Shirdi Devotional Tour", price: 2500, destination: "Shirdi" }
          ];
          
          for (const p of defaultPackagesToSeed) {
            await db.collection("packages").doc(p.id).set({
              id: p.id,
              title: p.title,
              price: p.price,
              destination: p.destination,
              createdAt: FieldValue.serverTimestamp()
            });
          }
          pkgDoc = await db.collection("packages").doc(resolvedItemId).get();
        }
        
        if (pkgDoc.exists) {
          unitPrice = pkgDoc.data()?.price || 0;
        }
      } else if (resolvedItemType === "hotel" && resolvedItemId && db) {
        const hotelDoc = await db.collection("hotels").doc(resolvedItemId).get();
        if (hotelDoc.exists) {
          unitPrice = hotelDoc.data()?.price || hotelDoc.data()?.pricePerNight || 0;
        }
      } else if (resolvedItemType === "car" && resolvedItemId && db) {
        const carDoc = await db.collection("cars").doc(resolvedItemId).get();
        if (carDoc.exists) {
          unitPrice = carDoc.data()?.price || carDoc.data()?.ratePerDay || 0;
        }
      } else if (resolvedItemType === "flight" && resolvedItemId && db) {
        const flightDoc = await db.collection("flights").doc(resolvedItemId).get();
        if (flightDoc.exists) {
          unitPrice = flightDoc.data()?.price || 0;
        }
      }
    } catch {
      // Fall back to default catalog pricing
    }

    if (unitPrice === 0) {
      if (customAmount && Number(customAmount) > 0) {
        unitPrice = Number(customAmount) / resolvedQuantity;
      } else if (resolvedItemType === "package") {
        unitPrice = 5000;
      } else if (resolvedItemType === "hotel") {
        const fallbackHotels: Record<string, number> = {
          "hotel_taj_1": 12000,
          "hotel_royal_1": 2400,
          "hotel_grand_1": 3800
        };
        unitPrice = fallbackHotels[resolvedItemId] || 3500;
      } else if (resolvedItemType === "car") {
        const fallbackCars: Record<string, number> = {
          "car_sedan_1": 1500,
          "car_suv_1": 2500
        };
        unitPrice = fallbackCars[resolvedItemId] || 2000;
      } else if (resolvedItemType === "flight") {
        const fallbackFlights: Record<string, number> = {
          "flight_ai_101": 5500,
          "flight_6e_202": 4200
        };
        unitPrice = fallbackFlights[resolvedItemId] || 4800;
      } else {
        unitPrice = 2500;
      }
    }

    let totalAmount = Math.round(unitPrice * resolvedQuantity);

    // 2. Anti-Promo Fraud Check during order creation
    if (promoCode && cleanDeviceId && db) {
      const upperPromo = String(promoCode).trim().toUpperCase();
      if (['WELCOME500', 'NEWUSER', 'FIRSTFLY'].includes(upperPromo)) {
        try {
          const deviceUsed = await db.collection("device_promos")
            .where("deviceId", "==", cleanDeviceId)
            .where("promoCode", "==", upperPromo)
            .limit(1)
            .get();

          if (!deviceUsed.empty) {
            if (idempotencyKey) await IdempotencyEngine.releaseOrFail(idempotencyKey, userId, db);
            return res.status(403).json({
              error: "Promo code has already been redeemed on this device."
            });
          }
        } catch (e) {
          console.warn("Device promo check notice:", e);
        }
      }
    }

    if (totalAmount <= 0) {
      if (idempotencyKey) await IdempotencyEngine.releaseOrFail(idempotencyKey, userId, db);
      return res.status(400).json({ error: "Calculated payment amount must be strictly greater than 0" });
    }

    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      // Bind the order to a specific booking server-side, at creation time — this is what
      // /api/razorpay/verify checks against, so a paid order can't later be replayed against
      // a different (more expensive) bookingId.
      notes: bookingId ? { bookingId: String(bookingId) } : undefined
    };

    let order: any;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr: any) {
      console.warn("Razorpay live API order creation notice (using sandbox order):", rzpErr?.message || rzpErr?.error?.description);
      order = {
        id: `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        entity: "order",
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: "created",
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      };
    }
    
    if (db) {
      try {
        await db.collection("checkout_orders").doc(order.id).set({
          orderId: order.id,
          itemId: resolvedItemId || 'custom_item',
          itemType: resolvedItemType,
          quantity: resolvedQuantity,
          unitPrice,
          totalAmount,
          currency: "INR",
          userId,
          bookingId: bookingId ? String(bookingId) : null,
          deviceId: cleanDeviceId || 'unknown',
          promoCode: promoCode || null,
          idempotencyKey: idempotencyKey || null,
          status: "PENDING",
          createdAt: FieldValue.serverTimestamp()
        });

        // Record device promo usage if promoCode applied
        if (promoCode && cleanDeviceId) {
          await db.collection("device_promos").add({
            deviceId: cleanDeviceId,
            userId,
            promoCode: String(promoCode).toUpperCase(),
            orderId: order.id,
            timestamp: FieldValue.serverTimestamp()
          });
        }
      } catch {
        // Non-blocking database store
      }
    }

    const responsePayload = {
      success: true,
      order,
      keyId: razorpayKeyId,
      key: razorpayKeyId,
      calculatedAmount: totalAmount,
      itemId: resolvedItemId,
      itemType: resolvedItemType,
      idempotencyKey: idempotencyKey || null
    };

    // Commit response to Idempotency Engine
    if (idempotencyKey) {
      await IdempotencyEngine.commitResponse(idempotencyKey, userId, responsePayload, 200, db);
    }

    res.json(responsePayload);
  } catch (error: any) {
    if (idempotencyKey) {
      await IdempotencyEngine.releaseOrFail(idempotencyKey, userId, db);
    }
    const parsedDetails = parseApiError(error);
    res.status(500).json({ success: false, error: "Failed to create checkout order", details: parsedDetails });
  }
  });

  // --- POST /api/wallet/verify-payment ---
  app.post("/api/wallet/verify-payment", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount: clientAmount } = req.body;
    const uid = (req as any).user.uid;
    
    // Verify signature
    const secret = (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.length > 5 ? process.env.RAZORPAY_KEY_SECRET : (process.env.VITE_RAZORPAY_KEY_SECRET || 'dummysecret321')).trim();
    
    const generated_signature = crypto.createHmac('sha256', secret)
      .update((razorpay_order_id || "") + "|" + (razorpay_payment_id || ""))
      .digest('hex');
    
    if (razorpay_signature && generated_signature !== razorpay_signature && !razorpay_payment_id?.startsWith('pay_mock_') && !razorpay_payment_id?.startsWith('pay_sandbox_')) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Authoritative amount fetch with sandbox fallback
    let amount = Number(clientAmount) || 0;
    try {
      const payment: any = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment && payment.amount) {
        amount = Number(payment.amount) / 100; // paise to INR
      }
    } catch {
      // In sandbox/demo mode if fetch fails, use verified clientAmount
      if (!amount || amount <= 0) {
        amount = 500;
      }
    }
    
    const currentMemBalance = inMemoryAgentWallets.get(uid) || 0;
    const newMemBalance = currentMemBalance + amount;
    inMemoryAgentWallets.set(uid, newMemBalance);

    const db = adminDb();
    if (db) {
      try {
        await db.runTransaction(async (transaction) => {
          // Idempotency check
          const txRefQuery = db.collection("wallet_transactions").where("referenceId", "==", razorpay_payment_id);
          const existingTxs = await transaction.get(txRefQuery);
          if (!existingTxs.empty) {
              throw new Error("ALREADY_PROCESSED");
          }

          const agentRef = db.collection("agents").doc(uid);
          const agentDoc = await transaction.get(agentRef);
          
          const dbBalance = agentDoc.exists ? (agentDoc.data()?.walletBalance || 0) : 0;
          const updatedDbBalance = dbBalance + amount;
          inMemoryAgentWallets.set(uid, updatedDbBalance);
          
          if (!agentDoc.exists) {
             transaction.set(agentRef, { walletBalance: updatedDbBalance }, { merge: true });
          } else {
             transaction.update(agentRef, { walletBalance: updatedDbBalance });
          }
          
          const txRef = db.collection("wallet_transactions").doc();
          transaction.set(txRef, {
            agentId: uid,
            amount: amount,
            type: "CREDIT",
            purpose: "ADD_MONEY",
            referenceId: razorpay_payment_id,
            status: "SUCCESS",
            timestamp: FieldValue.serverTimestamp()
          });
        });
      } catch (dbError: any) {
          if (dbError.message === "ALREADY_PROCESSED") {
              return res.status(400).json({ error: "Transaction already processed" });
          }
          console.warn("[wallet] Could not persist to Firestore, maintained in-memory wallet:", dbError?.message || dbError);
      }
    }
    
    res.json({ success: true, message: "Wallet updated successfully" });
  } catch (error) {
    console.error("Error verifying payment", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
  });

  // --- POST /api/bookings/confirm ---
  app.post("/api/bookings/confirm", requireAuth, async (req: AuthedRequest, res) => {
  const bookingData = req.body;
  const uid = req.user?.uid;
  // Ensure booking is linked to authenticated user
  if (bookingData && typeof bookingData === 'object') {
    bookingData.userId = uid;
  }
  // Tax calculations based on the requested rules
  try {
    const taxInfo = calculateRoutTripoTaxes(bookingData as any);
    
    // Send email via NotificationService if email is provided in bookingData
    const customerEmail = bookingData.customerEmail || bookingData.email;
    if (customerEmail) {
       sendCustomerInvoiceEmail(customerEmail, {
          ...bookingData,
          totalAmount: bookingData.price || bookingData.totalAmount || 0
       }).catch(err => console.error("Failed to send manual invoice:", err));
    }

    res.json({ success: true, status: "CONFIRMED", taxes: taxInfo, emailSent: !!customerEmail });
  } catch(e: any) {
    res.status(400).json({ error: e.message });
  }
  });

  // --- POST /api/bookings/:id/cancel ---
  app.post("/api/bookings/:id/cancel", requireAuth, async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const uid = req.user?.uid;
  const db = adminDb();
  if (!db) return res.status(500).json({ error: "DB offline" });

  try {
    await db.runTransaction(async (t) => {
      const bookingRef = db.collection("bookings").doc(id);
      const bookingDoc = await t.get(bookingRef);
      if (!bookingDoc.exists) throw new Error("Booking not found");
      
      const data = bookingDoc.data();
      // IDOR Mitigation: Verify resource ownership or admin role
      if (data?.userId !== uid && !isAdminUser(req.user)) {
        throw new Error("Forbidden: You are not authorized to cancel this booking");
      }

      if (data?.status === 'CANCELLED') throw new Error("Already cancelled");

      // Generate Credit Note for reversed taxes
      const creditNoteId = `CN-${Date.now()}`;
      const cnRef = db.collection("credit_notes").doc(creditNoteId);
      t.set(cnRef, {
        originalBookingId: id,
        userId: data?.userId || uid,
        refundAmount: data?.amount || 0,
        taxReversed: true,
        issuedAt: FieldValue.serverTimestamp()
      });

      t.update(bookingRef, { status: "CANCELLED", creditNoteId });
    });

    res.json({ success: true, message: "Booking cancelled and tax reversed (Credit Note issued)." });
  } catch (error: any) {
    const isForbidden = error.message?.includes("Forbidden");
    res.status(isForbidden ? 403 : 400).json({ error: error.message });
  }
  });

  // --- POST /api/razorpay/verify ---
  app.post('/api/razorpay/verify', express.json(), async (req, res) => {
    console.log("DEBUG: /api/razorpay/verify called");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ error: 'Missing required verification fields' });
    }

    // 1. Signature check — proves this order_id + payment_id pair is a genuine Razorpay payment
    const hmac = crypto.createHmac('sha256', razorpayKeySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    const signatureValid =
      generated_signature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(generated_signature, 'utf8'), Buffer.from(razorpay_signature, 'utf8'));

    if (!signatureValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const db = adminDb();
    if (!db) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    // 2. Authoritative binding check — do NOT trust that the client-submitted bookingId
    // is the one this order was actually created for. Look up the server-side record
    // written at /api/checkout/create-order time instead.
    const orderRecordSnap = await db.collection("checkout_orders").doc(razorpay_order_id).get();
    if (!orderRecordSnap.exists) {
      secureLogger.warn(`[razorpay/verify] No checkout_orders record for order ${razorpay_order_id} — rejecting.`);
      return res.status(400).json({ error: 'Order not recognized' });
    }
    const orderRecord = orderRecordSnap.data() as any;

    if (orderRecord.bookingId && orderRecord.bookingId !== String(bookingId)) {
      secureLogger.error(
        `[razorpay/verify] bookingId mismatch: order ${razorpay_order_id} was created for booking ${orderRecord.bookingId}, but verify was called with ${bookingId}. Possible replay/substitution attempt.`
      );
      return res.status(400).json({ error: 'Order/booking mismatch' });
    }

    // 3. Idempotency — a retried client call shouldn't re-send the confirmation email/invoice
    if (orderRecord.status === "PAID") {
      return res.status(200).json({ success: true, alreadyProcessed: true });
    }

    // 4. Re-confirm against Razorpay's own record of the order (authoritative amount/status,
    // not anything the client sent) before marking anything Confirmed.
    try {
      const liveOrder = await razorpay.orders.fetch(razorpay_order_id);
      if (liveOrder.status !== 'paid' || Number(liveOrder.amount_paid) < Number(liveOrder.amount)) {
        secureLogger.error(`[razorpay/verify] Order ${razorpay_order_id} signature valid but Razorpay reports status=${liveOrder.status}.`);
        return res.status(400).json({ error: 'Payment not confirmed by Razorpay' });
      }
    } catch (err) {
      secureLogger.error('[razorpay/verify] Failed to re-fetch order from Razorpay:', err);
      return res.status(502).json({ error: 'Could not verify payment with Razorpay' });
    }

    // Mark PAID first (idempotency guard for concurrent retries) before side effects
    await db.collection("checkout_orders").doc(razorpay_order_id).set(
      { status: "PAID", paymentId: razorpay_payment_id, paidAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    const bookingService = await import('../../../src/services/shared/BookingService').then(s => s.bookingService);
    const invoiceService = await import('../../../src/services/shared/InvoiceService').then(s => s.invoiceService);
    const emailService = await import('../../../src/services/shared/EmailService').then(s => s.emailService);

    await bookingService.updateBookingStatus(bookingId, 'Confirmed');
    const booking = await bookingService.getBooking(bookingId) as any;
    if (booking) {
        const pdfBuffer = await invoiceService.generateInvoice(booking);
        await emailService.sendBookingConfirmation(booking.customer.email, pdfBuffer, bookingId);
    }
    res.status(200).json({ success: true });
  });

  // --- POST /api/bookings/cancel ---
  app.post('/api/bookings/cancel', express.json(), async (req, res) => {
    const { bookingId } = req.body;
    try {
        const bookingService = await import('../../../src/services/shared/BookingService').then(s => s.bookingService);
        const { calculateRefund } = await import('../../../src/utils/refundCalculator');
        
        const booking = await bookingService.getBooking(bookingId) as any;
        if (!booking || booking.status !== 'Confirmed') {
            return res.status(400).json({ error: 'Booking not eligible for cancellation' });
        }

        const refundDetails = calculateRefund(booking.totalAmount, booking.vertical);
        
        // Initiate refund via Razorpay
        const refund = await razorpay.payments.refund(booking.paymentId, {
            amount: Math.round(refundDetails.refundAmount * 100)
        });

        await bookingService.updateBookingWithRefundInfo(bookingId, 'Cancelled', refund.id, refundDetails.refundAmount);
        
        res.json({ success: true, refundDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Cancellation failed' });
    }
  });

}
