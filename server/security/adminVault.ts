import crypto from "crypto";
import express from "express";
import { Firestore, FieldValue } from "firebase-admin/firestore";
import { getOrCreateUserDEK, decryptObjectPII } from "./zeroTrustCrypto.ts";
import { secureLogger } from "./logger.ts";

/**
 * ZERO-TRUST ADMIN VAULT (LEGAL DATA EXPORT) MODULE
 * 
 * Directives:
 * - Admin-Only verification via RBAC.
 * - Constant-Time Verification of `adminSecretToken` against `ADMIN_MASTER_TOKEN` using `crypto.timingSafeEqual`.
 * - Immutable Audit Logging to `system_audit_logs` collection.
 * - Decrypts sensitive user data on-the-fly for legitimate law enforcement / legal writs.
 */

/**
 * Constant-time string comparison to prevent side-channel timing attacks
 */
export function verifySecretTokenConstantTime(providedToken: string | undefined, expectedToken: string | undefined): boolean {
  if (!providedToken || !expectedToken) return false;

  const bufProvided = Buffer.from(providedToken, "utf8");
  const bufExpected = Buffer.from(expectedToken, "utf8");

  // timingSafeEqual requires buffers to have exact equal length
  if (bufProvided.length !== bufExpected.length) {
    // Perform dummy timingSafeEqual to avoid timing leak on length mismatch
    const dummy = Buffer.alloc(bufExpected.length);
    crypto.timingSafeEqual(dummy, bufExpected);
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function exportUserDataForLegalHandler(
  req: express.Request,
  res: express.Response,
  db: Firestore | null,
  adminUid: string
) {
  const { targetUid, legalWritId, adminSecretToken } = req.body || {};

  // 1. Validate required payload parameters
  if (!targetUid || !legalWritId || !adminSecretToken) {
    return res.status(400).json({
      error: "Missing required parameters. Required: targetUid, legalWritId, adminSecretToken"
    });
  }

  // 2. Fetch expected master token
  const expectedMasterToken = process.env.ADMIN_MASTER_TOKEN || (
    process.env.NODE_ENV === "production" ? null : "routripo-master-legal-vault-token-2026"
  );

  if (!expectedMasterToken) {
    secureLogger.error("ADMIN_MASTER_TOKEN is not configured on server.");
    return res.status(500).json({ error: "Legal Vault token is not configured on this server." });
  }

  // 3. Constant-Time Verification
  const isTokenValid = verifySecretTokenConstantTime(adminSecretToken, expectedMasterToken);

  if (!isTokenValid) {
    // Log Unauthorized Attempt to Immutable Audit Logs
    if (db) {
      try {
        await db.collection("system_audit_logs").add({
          action: "UNAUTHORIZED_ADMIN_DECRYPT_ATTEMPT",
          adminUid,
          targetUid,
          legalWritId,
          ip: req.ip || req.socket.remoteAddress || "UNKNOWN",
          userAgent: req.headers["user-agent"] || "UNKNOWN",
          timestamp: FieldValue.serverTimestamp(),
          status: "DENIED"
        });
      } catch (logErr) {
        secureLogger.error("Failed to write unauthorized audit log:", logErr);
      }
    }

    secureLogger.warn(`Unauthorized Admin Decrypt Attempt for user ${targetUid} with writ ${legalWritId}`);
    return res.status(401).json({
      error: "Access Denied: Invalid Master Secret Token for Legal Vault access."
    });
  }

  if (!db) {
    return res.status(503).json({ error: "Database offline. Cannot fetch legal export." });
  }

  try {
    // 4. Fetch Target User Data
    const userDoc = await db.collection("users").doc(targetUid).get();
    const agentDoc = await db.collection("agents").doc(targetUid).get();
    const bookingsSnapshot = await db.collection("bookings").where("userId", "==", targetUid).get();
    const tripsSnapshot = await db.collection("trips").where("ownerId", "==", targetUid).get();
    const ticketsSnapshot = await db.collection("support_tickets").where("uid", "==", targetUid).get();

    // 5. Unwrap target user's Data Encryption Key (DEK)
    const userDek = await getOrCreateUserDEK(targetUid, db);

    // 6. Decrypt user profile and sensitive PII
    let rawUserData: any = userDoc.exists ? userDoc.data() : (agentDoc.exists ? agentDoc.data() : { id: targetUid });
    const decryptedUserData = decryptObjectPII(rawUserData, userDek);

    const decryptedBookings = bookingsSnapshot.docs.map(doc => decryptObjectPII({ id: doc.id, ...doc.data() }, userDek));
    const decryptedTrips = tripsSnapshot.docs.map(doc => decryptObjectPII({ id: doc.id, ...doc.data() }, userDek));
    const decryptedTickets = ticketsSnapshot.docs.map(doc => decryptObjectPII({ id: doc.id, ...doc.data() }, userDek));

    // 7. Write Successful Immutable Audit Log
    const auditRef = await db.collection("system_audit_logs").add({
      action: "DECRYPT_FOR_LEA",
      adminUid,
      targetUid,
      legalWritId,
      exportedCollections: ["users/agents", "bookings", "trips", "support_tickets"],
      ip: req.ip || req.socket.remoteAddress || "UNKNOWN",
      userAgent: req.headers["user-agent"] || "UNKNOWN",
      timestamp: FieldValue.serverTimestamp(),
      status: "SUCCESS"
    });

    secureLogger.audit("DECRYPT_FOR_LEA", {
      auditId: auditRef.id,
      adminUid,
      targetUid,
      legalWritId
    });

    // 8. Return comprehensive legal compliance payload
    return res.json({
      success: true,
      legalWritId,
      auditLogId: auditRef.id,
      timestamp: new Date().toISOString(),
      subject: {
        uid: targetUid,
        profile: decryptedUserData,
        bookings: decryptedBookings,
        trips: decryptedTrips,
        supportTickets: decryptedTickets
      },
      complianceStandard: "DPDPA 2023 / Section 69 IT Act (Legal Data Warrant Compliance)",
      notice: "This decrypted dossier is strictly intended for official legal authorities pursuant to legal writ."
    });

  } catch (error: any) {
    secureLogger.error("Error executing legal data export:", error);
    return res.status(500).json({ error: "Failed to compile legal data export: " + error.message });
  }
}
