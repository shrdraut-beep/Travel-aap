import crypto from "crypto";
import express from "express";
import { Firestore, FieldValue } from "firebase-admin/firestore";
import { secureLogger } from "./logger.ts";
import { sendCustomerInvoiceEmail, sendPushNotification } from "../../src/NotificationService.ts";

/**
 * MODULE 1: IRONCLAD PAYMENT CHECKOUT FLOW & SERVER-SIDE FULFILLMENT
 * 
 * Directives:
 * 1. Strict Webhook Verification (HMAC): Cryptographically verify webhook payload using gateway secrets.
 * 2. Server-Side Fulfillment: ONLY update Firestore (e.g. mark as 'PAID', credit wallet) inside this verified webhook.
 * 3. Environment Lock & 3D Secure: In production, strictly reject test keys and enforce 3DS requirements.
 */

export function isTestKeyRejectedInProd(key: string | undefined): boolean {
  if (process.env.NODE_ENV === "production" && key) {
    const isTest = key.startsWith("rzp_test_") || key.startsWith("tok_test_") || key.startsWith("sk_test_");
    return isTest;
  }
  return false;
}

export function verifyRazorpayWebhookSignature(rawBody: string | Buffer, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
}

export function verifyStripeWebhookSignature(rawBody: string | Buffer, header: string, secret: string): boolean {
  if (!header || !secret) return false;
  try {
    const parts = header.split(",").reduce((acc: Record<string, string>, item) => {
      const [k, v] = item.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    const timestamp = parts["t"];
    const signature = parts["v1"];
    if (!timestamp || !signature) return false;

    // Reject timestamps older than 5 minutes to prevent replay attacks
    const toleranceSec = 300;
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - parseInt(timestamp, 10)) > toleranceSec) {
      secureLogger.warn("[Stripe Webhook] Timestamp outside tolerance window");
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody.toString()}`;
    const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  } catch (err) {
    secureLogger.error("[Stripe Webhook] Verification error:", err);
    return false;
  }
}

/**
 * Handles Razorpay Webhook with Server-Side Fulfillment and Replay Protection
 */
export async function handleRazorpayWebhook(req: express.Request, res: express.Response, db: Firestore | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (process.env.NODE_ENV === "production" && !secret) {
    secureLogger.error("CRITICAL SECURITY ERROR: RAZORPAY_WEBHOOK_SECRET is missing in production environment. Webhook verification will fail closed.");
  }

  const resolvedSecret = secret || (process.env.NODE_ENV === "production" ? "" : "dev_razorpay_webhook_secret_2026");
  const signature = req.headers["x-razorpay-signature"] as string;
  const eventId = req.headers["x-razorpay-event-id"] as string || (req.body?.event_id);

  if (!signature || !resolvedSecret) {
    secureLogger.warn("[Payment Webhook] Missing signature or secret configured");
    return res.status(400).send("Missing authentication signature");
  }

  // Raw body or stringified body check
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const isValid = verifyRazorpayWebhookSignature(rawBody, signature, resolvedSecret);

  if (!isValid) {
    secureLogger.warn("[Payment Webhook] Invalid HMAC signature detected!");
    return res.status(400).send("Cryptographic signature verification failed");
  }

  if (!db) {
    return res.status(500).send("Database offline");
  }

  const resolvedEventId = eventId || `rzp_evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const eventRef = db.collection("webhook_events").doc(resolvedEventId);

  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(eventRef);
      if (doc.exists) {
        throw new Error("ALREADY_PROCESSED");
      }

      // Record event idempotency
      t.set(eventRef, {
        provider: "razorpay",
        eventId: resolvedEventId,
        eventType: req.body.event,
        processedAt: FieldValue.serverTimestamp(),
        payload: req.body
      });

      const eventType = req.body.event;

      // 1. Payment Captured -> Server-side fulfillment
      if (eventType === "payment.captured" || eventType === "order.paid") {
        const payment = req.body.payload?.payment?.entity || {};
        const orderId = payment.order_id || req.body.payload?.order?.entity?.id;
        const amount = (payment.amount || 0) / 100; // convert paise to INR
        const notes = payment.notes || {};

        // A. If checkout order exists, fulfill and mark as PAID
        if (orderId) {
          const checkoutOrderRef = db.collection("checkout_orders").doc(orderId);
          const checkoutDoc = await t.get(checkoutOrderRef);
          if (checkoutDoc.exists) {
            t.update(checkoutOrderRef, {
              status: "PAID",
              paymentId: payment.id,
              fulfilledAt: FieldValue.serverTimestamp(),
              paymentMethod: payment.method || "card_3ds",
              gatewayFee: payment.fee ? payment.fee / 100 : 0
            });
          }
        }

        // B. If wallet topup, credit agent wallet atomically
        if (notes.purpose === "ADD_MONEY" || notes.type === "WALLET_CREDIT") {
          const agentId = notes.agentId || notes.userId;
          if (agentId) {
            const agentRef = db.collection("agents").doc(agentId);
            const agentDoc = await t.get(agentRef);
            const currentBal = agentDoc.exists ? (agentDoc.data()?.walletBalance || 0) : 0;
            
            t.set(agentRef, { walletBalance: currentBal + amount }, { merge: true });

            const txRef = db.collection("wallet_transactions").doc();
            t.set(txRef, {
              agentId,
              amount,
              type: "CREDIT",
              purpose: "ADD_MONEY",
              referenceId: payment.id,
              status: "SUCCESS",
              source: "VERIFIED_GATEWAY_WEBHOOK",
              timestamp: FieldValue.serverTimestamp()
            });
          }
        }
      }
    });

    // Asynchronous notification handling after transactional fulfillment
    const eventType = req.body.event;
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = req.body.payload?.payment?.entity || {};
      const customerEmail = payment.email || payment.notes?.email;
      const customerPhone = payment.contact || payment.notes?.phone;

      const bookingDetails = {
        id: payment.id || resolvedEventId,
        name: payment.notes?.customer_name || "Valued Traveler",
        destination: payment.notes?.destination || "RoutTripo Booking",
        baseAmount: (payment.amount || 0) / 100 * 0.82,
        gstAmount: (payment.amount || 0) / 100 * 0.18,
        totalAmount: (payment.amount || 0) / 100
      };

      Promise.allSettled([
        customerEmail ? sendCustomerInvoiceEmail(customerEmail, bookingDetails) : Promise.resolve(),
        customerPhone ? sendPushNotification(customerPhone, bookingDetails) : Promise.resolve()
      ]).catch(err => secureLogger.error("[Webhook Notification Error]:", err));
    }

    return res.status(200).json({ status: "ok", fulfilled: true });
  } catch (err: any) {
    if (err.message === "ALREADY_PROCESSED") {
      secureLogger.info(`[Payment Webhook] Duplicate event ${resolvedEventId} ignored.`);
      return res.status(200).send("Already processed");
    }
    secureLogger.error("[Payment Webhook Error]:", err);
    return res.status(500).send("Webhook processing error");
  }
}
