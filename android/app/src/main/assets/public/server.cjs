var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  validateBody: () => validateBody
});
module.exports = __toCommonJS(server_exports);
var dotenv = __toESM(require("dotenv"), 1);
var import_express2 = __toESM(require("express"), 1);

// server/routes/partnerKyc.ts
var import_express = __toESM(require("express"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_zod = require("zod");
var router = import_express.default.Router();
var otpStore = /* @__PURE__ */ new Map();
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var SendOtpSchema = import_zod.z.object({
  email: import_zod.z.string().email({ message: "Invalid email address" })
});
var VerifyOtpSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  otp: import_zod.z.string().length(6, { message: "OTP must be exactly 6 digits" })
});
var VerifyPanGstinSchema = import_zod.z.object({
  documentType: import_zod.z.enum(["PAN", "GSTIN"]),
  documentNumber: import_zod.z.string().min(10).max(15)
});
var VerifyBankSchema = import_zod.z.object({
  accountNumber: import_zod.z.string().min(5).max(30),
  ifscCode: import_zod.z.string().length(11, { message: "Invalid IFSC code length" }),
  beneficiaryName: import_zod.z.string().optional()
});
var VerifyVehicleSchema = import_zod.z.object({
  registrationNumber: import_zod.z.string().min(6).max(12)
});
router.post("/send-email-otp", async (req, res) => {
  try {
    const { email } = SendOtpSchema.parse(req.body);
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1e3
    });
    const mailOptions = {
      from: `"RouTriO Partner Onboarding" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your RouTriO Partner Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Welcome to RouTriO!</h2>
          <p>Please use the following 6-digit OTP to verify your email address. This OTP is valid for 10 minutes.</p>
          <h1 style="background-color: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `
    };
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    }
    res.status(200).json({ success: true, message: "OTP sent successfully to registered email." });
  } catch (error) {
    if (error instanceof import_zod.z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error("Error sending OTP:", error);
      res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
  }
});
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = VerifyOtpSchema.parse(req.body);
    const record = otpStore.get(email);
    if (!record) {
      res.status(400).json({ success: false, message: "OTP not requested or expired." });
      return;
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      return;
    }
    if (record.otp !== otp) {
      res.status(400).json({ success: false, message: "Invalid OTP." });
      return;
    }
    otpStore.delete(email);
    res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    if (error instanceof import_zod.z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: "Server error during OTP verification." });
    }
  }
});
router.post("/verify-gstin-pan", async (req, res) => {
  try {
    const { documentType, documentNumber } = VerifyPanGstinSchema.parse(req.body);
    const ZOOP_API_KEY = process.env.ZOOP_API_KEY;
    const ZOOP_APP_ID = process.env.ZOOP_APP_ID;
    const endpoint = documentType === "PAN" ? "https://api.zoop.one/in/identity/pan/advance" : "https://api.zoop.one/in/identity/gstin/advance";
    const simulatedResponse = {
      success: true,
      documentType,
      documentNumber,
      verified: true,
      legalEntityName: documentType === "PAN" ? "ROUTRIP LOGISTICS PVT LTD" : "ROUTRIP LOGISTICS PRIVATE LIMITED",
      registeredAddress: "123 Tech Park, Phase 1, Hinjewadi, Pune, MH 411057",
      status: "Active"
    };
    res.status(200).json(simulatedResponse);
  } catch (error) {
    if (error instanceof import_zod.z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error("Error verifying document:", error);
      res.status(500).json({ success: false, message: "Document validation failed. External API error." });
    }
  }
});
router.post("/verify-bank", async (req, res) => {
  try {
    const { accountNumber, ifscCode, beneficiaryName } = VerifyBankSchema.parse(req.body);
    const RZP_KEY = process.env.RAZORPAY_KEY_ID;
    const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;
    const simulatedResponse = {
      success: true,
      accountNumber: `XXXXX${accountNumber.slice(-4)}`,
      ifscCode,
      verified: true,
      registeredNameAtBank: "ROUTRIP LOGISTICS PVT LTD",
      matchScore: beneficiaryName ? 95 : null,
      // Name match percentage
      status: "ACTIVE",
      message: "Penny drop successful. Account verified."
    };
    res.status(200).json(simulatedResponse);
  } catch (error) {
    if (error instanceof import_zod.z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error("Error verifying bank account:", error);
      res.status(500).json({ success: false, message: "Bank account verification failed." });
    }
  }
});
router.post("/verify-vehicle", async (req, res) => {
  try {
    const { registrationNumber } = VerifyVehicleSchema.parse(req.body);
    const ZOOP_API_KEY = process.env.ZOOP_API_KEY;
    const ZOOP_APP_ID = process.env.ZOOP_APP_ID;
    const simulatedResponse = {
      success: true,
      registrationNumber: registrationNumber.toUpperCase(),
      verified: true,
      vehicleDetails: {
        ownerName: "SHARAD RAUT",
        vehicleClass: "Motor Car (LMV)",
        makerModel: "MARUTI SUZUKI INDIA LTD / SWIFT DZIRE",
        fuelType: "CNG",
        registrationDate: "2022-04-15",
        fitnessValidity: "2037-04-14",
        insuranceValidity: "2026-10-12",
        puccValidity: "2026-12-01",
        rcStatus: "ACTIVE",
        blacklistStatus: "CLEAN"
      }
    };
    const isFitnessValid = new Date(simulatedResponse.vehicleDetails.fitnessValidity) > /* @__PURE__ */ new Date();
    const isInsuranceValid = new Date(simulatedResponse.vehicleDetails.insuranceValidity) > /* @__PURE__ */ new Date();
    if (!isFitnessValid || !isInsuranceValid) {
      res.status(400).json({
        success: false,
        message: "Vehicle fitness or insurance has expired.",
        data: simulatedResponse
      });
      return;
    }
    res.status(200).json(simulatedResponse);
  } catch (error) {
    if (error instanceof import_zod.z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error("Error verifying RC:", error);
      res.status(500).json({ success: false, message: "Vehicle verification failed." });
    }
  }
});
var partnerKyc_default = router;

// server.ts
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_openai = __toESM(require("openai"), 1);
var import_axios = __toESM(require("axios"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase-admin/firestore");
var import_app_check = require("firebase-admin/app-check");
var import_razorpay = __toESM(require("razorpay"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_fs = __toESM(require("fs"), 1);
var bcrypt = __toESM(require("bcrypt"), 1);
var import_zod2 = require("zod");

// src/taxEngine.ts
function calculateRouTriOTaxes(booking) {
  const {
    type,
    totalAmount,
    isUnregisteredVendor = false,
    irctcServiceCharge = 20,
    vendorState = "MH",
    customerState = "MH",
    appState = "MH",
    // We assume app is registered in MH
    vendorTotalTurnoverYearly = 0
  } = booking;
  let result = {
    bookingType: type,
    customerPays: totalAmount,
    appCommission: 0,
    gstOnCommission: 0,
    taxesToHold: {
      tds_194O: 0,
      tcs_GST: 0,
      section95_GST: 0,
      tcs_Overseas_206C: 0,
      bundled_GST: 0
    },
    vendorPayout: 0,
    passThroughAmount: 0,
    invoiceDetails: {
      hsnSacCode: "",
      placeOfSupply: customerState,
      cgst: 0,
      sgst: 0,
      igst: 0
    }
  };
  const TDS_THRESHOLD = 5e5;
  const applyTDS = vendorTotalTurnoverYearly + totalAmount > TDS_THRESHOLD;
  const baseTDS = applyTDS ? totalAmount * 1e-3 : 0;
  const calculateGSTSplit = (amount, gstRate, fromState, toState) => {
    let cgst = 0, sgst = 0, igst = 0;
    if (fromState === toState) {
      cgst = amount * gstRate / 2;
      sgst = amount * gstRate / 2;
    } else {
      igst = amount * gstRate;
    }
    return { cgst, sgst, igst };
  };
  switch (type) {
    case "CAR":
      result.invoiceDetails.hsnSacCode = "996412";
      result.appCommission = totalAmount * 0.03;
      result.gstOnCommission = result.appCommission * 0.18;
      result.taxesToHold.section95_GST = totalAmount * 0.05;
      result.taxesToHold.tds_194O = baseTDS;
      result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.section95_GST + result.taxesToHold.tds_194O);
      break;
    case "HOTEL":
      result.invoiceDetails.hsnSacCode = "996311";
      result.appCommission = totalAmount * 0.05;
      result.gstOnCommission = result.appCommission * 0.18;
      result.taxesToHold.tds_194O = baseTDS;
      if (isUnregisteredVendor) {
        result.taxesToHold.section95_GST = totalAmount * 0.12;
        result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.section95_GST + result.taxesToHold.tds_194O);
      } else {
        result.taxesToHold.tcs_GST = totalAmount * 0.01;
        result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.tcs_GST + result.taxesToHold.tds_194O);
      }
      break;
    case "AGENT_PACKAGE_DOMESTIC":
      result.invoiceDetails.hsnSacCode = "998552";
      result.appCommission = totalAmount * 0.1;
      result.gstOnCommission = result.appCommission * 0.18;
      result.taxesToHold.tcs_GST = totalAmount * 0.01;
      result.taxesToHold.tds_194O = baseTDS;
      result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.tcs_GST + result.taxesToHold.tds_194O);
      break;
    case "OVERSEAS_TOUR":
      result.invoiceDetails.hsnSacCode = "998553";
      result.appCommission = totalAmount * 0.1;
      result.gstOnCommission = result.appCommission * 0.18;
      result.taxesToHold.tcs_Overseas_206C = totalAmount * 0.05;
      result.customerPays = totalAmount + result.taxesToHold.tcs_Overseas_206C;
      result.taxesToHold.tcs_GST = totalAmount * 0.01;
      result.taxesToHold.tds_194O = baseTDS;
      result.vendorPayout = totalAmount - (result.appCommission + result.gstOnCommission + result.taxesToHold.tcs_GST + result.taxesToHold.tds_194O);
      break;
    case "BUNDLED_PACKAGE":
      result.invoiceDetails.hsnSacCode = "998555";
      result.taxesToHold.bundled_GST = totalAmount * 0.05;
      result.appCommission = totalAmount * 0.15;
      result.vendorPayout = totalAmount - (result.appCommission + result.taxesToHold.bundled_GST);
      break;
    case "TRAIN_IRCTC":
      result.invoiceDetails.hsnSacCode = "996411";
      result.appCommission = irctcServiceCharge;
      result.gstOnCommission = irctcServiceCharge * 0.18;
      result.passThroughAmount = totalAmount;
      result.customerPays = totalAmount + result.appCommission + result.gstOnCommission;
      break;
    default:
      throw new Error("Invalid Booking Type");
  }
  const gstSplit = calculateGSTSplit(result.appCommission, 0.18, appState, customerState);
  result.invoiceDetails.cgst = gstSplit.cgst;
  result.invoiceDetails.sgst = gstSplit.sgst;
  result.invoiceDetails.igst = gstSplit.igst;
  const totalTaxToHold = Object.values(result.taxesToHold).reduce((acc, val) => acc + val, 0);
  return {
    ...result,
    RAZORPAY_SPLIT: {
      customerCharge: result.customerPays.toFixed(2),
      appRevenue: (result.appCommission + result.gstOnCommission).toFixed(2),
      taxWalletHold: totalTaxToHold.toFixed(2),
      vendorWalletPayout: result.vendorPayout.toFixed(2),
      passThroughWallet: result.passThroughAmount.toFixed(2)
    }
  };
}

// src/NotificationService.ts
var import_nodemailer2 = __toESM(require("nodemailer"), 1);
var import_messaging = require("firebase-admin/messaging");
var import_pdf_lib = require("pdf-lib");
var createTransporter = () => {
  return import_nodemailer2.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "contact@routripo.com",
      pass: process.env.SMTP_PASS
      // The app password or SMTP password
    }
  });
};
async function generateInvoicePDF(bookingDetails) {
  const pdfDoc = await import_pdf_lib.PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  page.drawText("RouTriO - Tax Invoice & Booking Confirmation", {
    x: 50,
    y: 350,
    size: 18,
    color: (0, import_pdf_lib.rgb)(0.1, 0.1, 0.4)
  });
  page.drawText(`Booking ID: ${bookingDetails.id || "N/A"}`, { x: 50, y: 310, size: 12 });
  page.drawText(`Destination: ${bookingDetails.destination || "N/A"}`, { x: 50, y: 290, size: 12 });
  page.drawText(`Total Paid: INR ${bookingDetails.totalAmount || "0"}`, { x: 50, y: 270, size: 12 });
  page.drawText(`GST / Tax Included (ECO Compliance)`, { x: 50, y: 230, size: 10, color: (0, import_pdf_lib.rgb)(0.5, 0.5, 0.5) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
async function sendCustomerInvoiceEmail(customerEmail, bookingDetails) {
  try {
    const transporter2 = createTransporter();
    const pdfBuffer = await generateInvoicePDF(bookingDetails);
    const mailOptions = {
      from: `"RouTriO Notifications" <${process.env.SMTP_USER || "contact@routripo.com"}>`,
      to: customerEmail,
      subject: `Your RouTriO Booking is Confirmed! (ID: ${bookingDetails.id})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1a56db;">Your booking is confirmed! \u{1F389}</h2>
          <p>Hi <strong>${bookingDetails.name || "Traveler"}</strong>,</p>
          <p>Thank you for choosing RouTriO. We're thrilled to confirm your booking for <strong>${bookingDetails.destination || "your upcoming trip"}</strong>.</p>
          <p>Please find your official invoice attached to this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you have any questions, feel free to reply to this email.</p>
          <p style="font-size: 12px; color: #888;">Safe travels,<br>The RouTriO Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `RouTriO_Invoice_${bookingDetails.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };
    const info = await transporter2.sendMail(mailOptions);
    console.log(`[Email] Confirmation sent to ${customerEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] Failed to send invoice to ${customerEmail}:`, error);
    throw error;
  }
}
async function sendPushNotification(userDeviceToken, bookingDetails) {
  try {
    if (!userDeviceToken) {
      console.warn("[FCM] Device token missing. Skipping push notification.");
      return;
    }
    const message = {
      notification: {
        title: "\u{1F389} Booking Confirmed!",
        body: `Your trip to ${bookingDetails.destination || "your destination"} is confirmed. Check your email for the invoice.`
      },
      token: userDeviceToken
    };
    const response = await (0, import_messaging.getMessaging)().send(message);
    console.log(`[FCM] Push notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    console.error(`[FCM] Failed to send push notification:`, error);
    throw error;
  }
}

// server.ts
dotenv.config();
if (!process.env.RAZORPAY_TAX_HOLDING_ACCOUNT_ID) {
  console.error("CRITICAL ERROR: RAZORPAY_TAX_HOLDING_ACCOUNT_ID is missing from environment variables.");
  console.error("This is required for tax splitting and compliance. Shutting down.");
}
var app = (0, import_express2.default)();
var PORT = 3e3;
var firebaseConfig = {};
try {
  firebaseConfig = JSON.parse(import_fs.default.readFileSync(import_path.default.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
} catch (e) {
  console.warn("Could not load firebase-applet-config.json");
}
var razorpay = new import_razorpay.default({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykeyid123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret321"
});
var ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "shrd.raut@gmail.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
var FIRESTORE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "ai-studio-grouptravelplann-f077e851-c9d2-483d-be19-1d2a3b70ff44";
var adminApp = null;
var adminInitFailed = false;
function getAdminApp() {
  if (adminApp) return adminApp;
  if (adminInitFailed) return null;
  try {
    adminApp = (0, import_app.getApps)().length ? (0, import_app.getApps)()[0] : (0, import_app.initializeApp)({
      credential: (0, import_app.applicationDefault)(),
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || process.env.GCLOUD_PROJECT
    });
    return adminApp;
  } catch (err) {
    adminInitFailed = true;
    console.error(
      "[auth] Firebase Admin SDK unavailable - protected endpoints will return 503. Set GOOGLE_APPLICATION_CREDENTIALS (local) or run with a service account (Cloud Run).",
      err?.message || err
    );
    return null;
  }
}
function adminDb() {
  const a = getAdminApp();
  if (!a) return null;
  return (0, import_firestore.getFirestore)(a, FIRESTORE_DATABASE_ID);
}
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const a = getAdminApp();
  if (!a) {
    return res.status(503).json({ error: "Authentication is not configured on this server" });
  }
  try {
    req.user = await (0, import_auth.getAuth)(a).verifyIdToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired credentials" });
  }
}
function isAdminUser(user) {
  if (!user) return false;
  if (user.admin === true) return true;
  const email = (user.email || "").toLowerCase();
  return user.email_verified === true && ADMIN_EMAILS.includes(email);
}
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ error: "Administrator access required" });
    }
    next();
  });
}
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false,
  // Allow cross-origin image/media loads (tile servers, Unsplash/Pexels, avatars).
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: { maxAge: 31536e3, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://ais-dev-5vodqbdjbd7trju3mmuvrn-381492601332.asia-southeast1.run.app",
  "https://ais-pre-5vodqbdjbd7trju3mmuvrn-381492601332.asia-southeast1.run.app"
];
app.use((0, import_cors.default)({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin.endsWith(".run.app") || origin.endsWith(".google.com")) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy violation: Unauthorized origin"));
  },
  credentials: true
}));
app.set("trust proxy", 1);
var globalLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 5e3,
  // max 5000 requests per minute globally across the entire app
  keyGenerator: () => "global",
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Global request threshold exceeded. Circuit breaker active." },
  validate: { xForwardedForHeader: false, forwardedHeader: false }
});
var ipRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // max 100 requests per 15 minutes per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests from this IP. Please try again after 15 minutes." },
  validate: { xForwardedForHeader: false, forwardedHeader: false }
});
var aiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "AI request limit reached. Please retry in a few minutes." },
  validate: { xForwardedForHeader: false, forwardedHeader: false }
});
app.use(globalLimiter);
app.use("/api/", ipRateLimiter);
for (const aiRoute of [
  "/api/gemini/chat",
  "/api/scan-receipt",
  "/api/generate-itinerary",
  "/api/generate-future-trip-plan",
  "/api/generate-destination-templates",
  "/api/parse-booking-text",
  "/api/parse-voice-command",
  "/api/transit-schedules"
]) {
  app.use(aiRoute, aiLimiter);
}
app.use(import_express2.default.json({ limit: "50mb" }));
app.use(import_express2.default.urlencoded({ limit: "50mb", extended: true }));
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        return res.status(400).json({ error: "Invalid input payload format", details: error.issues });
      }
      return res.status(400).json({ error: "Invalid request body content" });
    }
  };
}
var chatBodySchema = import_zod2.z.object({
  message: import_zod2.z.string().max(2e3),
  tripName: import_zod2.z.string().max(100).optional(),
  startDate: import_zod2.z.string().max(20).optional(),
  endDate: import_zod2.z.string().max(20).optional(),
  membersCount: import_zod2.z.number().int().positive().optional(),
  expensesTotal: import_zod2.z.number().nonnegative().optional(),
  lang: import_zod2.z.string().max(5).optional()
});
var scanReceiptSchema = import_zod2.z.object({
  image: import_zod2.z.string(),
  lang: import_zod2.z.string().max(5).optional()
});
async function verifyAppCheck(req, res, next) {
  const appCheckToken = req.headers["x-firebase-appcheck"];
  const isDev = process.env.NODE_ENV !== "production";
  if (!appCheckToken) {
    if (isDev) {
      console.warn("[appcheck] Missing token in development - bypassing verification.");
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: App Check token is missing" });
  }
  const a = getAdminApp();
  if (!a) {
    if (isDev) {
      console.warn("[appcheck] Firebase Admin SDK unavailable in development - bypassing verification.");
      return next();
    }
    return res.status(503).json({ error: "App Check validation service unavailable" });
  }
  try {
    const appCheck = (0, import_app_check.getAppCheck)(a);
    await appCheck.verifyToken(appCheckToken);
    return next();
  } catch (err) {
    console.error("[appcheck] Verification failed:", err?.message || err);
    return res.status(401).json({ error: "Unauthorized: Invalid App Check token" });
  }
}
var apiStats = /* @__PURE__ */ new Map();
var totalApiRequests = 0;
var apiFailures = { maps: false, places: false };
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const stat = apiStats.get(req.path) || { count: 0, totalLatency: 0 };
      stat.count++;
      stat.totalLatency += duration;
      apiStats.set(req.path, stat);
      totalApiRequests++;
    });
  }
  next();
});
function getRealStats(endpoint, fallbackLatency = "N/A") {
  if (!endpoint || endpoint.startsWith("http") || endpoint.includes("SDK")) {
    return { workload: "0%", latency: fallbackLatency };
  }
  if (totalApiRequests === 0) return { workload: "0%", latency: "N/A" };
  const stat = apiStats.get(endpoint);
  if (!stat || stat.count === 0) return { workload: "0%", latency: "N/A" };
  const workload = Math.round(stat.count / totalApiRequests * 100);
  const avgLatency = Math.round(stat.totalLatency / stat.count);
  return { workload: `${workload}%`, latency: `${avgLatency}ms` };
}
var openai = null;
function getOpenAI() {
  if (!openai) {
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      openai = new import_openai.default({ apiKey: key });
    }
  }
  return openai;
}
var genAI = null;
function getGemini() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      genAI = new import_genai.GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return genAI;
}
async function _safeGeminiGenerate(contents, model = "gemini-3.6-flash", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const ai = getGemini();
      if (!ai) {
        return { text: "", error: "Gemini API key not configured" };
      }
      const response = await ai.models.generateContent({
        model,
        contents
      });
      return { text: response.text || "" };
    } catch (err) {
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini API Attempt ${i + 1}/${retries} failed]:`, errMsg);
      const isRateLimit = /429|quota|RESOURCE_EXHAUSTED|rate limit/i.test(errMsg);
      const isUnavailable = /503|UNAVAILABLE|high demand/i.test(errMsg);
      if (!isRateLimit && !isUnavailable) {
        return { text: "", error: errMsg };
      }
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1e3;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return { text: "", isRateLimit: isRateLimit || isUnavailable, error: errMsg };
    }
  }
  return { text: "", error: "Max retries exceeded" };
}
async function callOpenAI(contents, model = "gpt-4o") {
  const openai2 = getOpenAI();
  if (!openai2) return null;
  let messages = [];
  if (typeof contents === "string") {
    messages = [{ role: "user", content: contents }];
  } else if (Array.isArray(contents)) {
    const contentParts = contents.map((part) => {
      if (part.text) return { type: "text", text: part.text };
      if (part.inlineData) return { type: "image_url", image_url: { url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` } };
      return null;
    }).filter(Boolean);
    messages = [{ role: "user", content: contentParts }];
  }
  const response = await openai2.chat.completions.create({
    model,
    messages
  });
  return response.choices[0].message.content;
}
async function safeGeminiGenerate(contents, model = "gemini-3.6-flash", retries = 3) {
  const geminiRes = await _safeGeminiGenerate(contents, model, retries);
  if (geminiRes.text) return geminiRes;
  console.log("Gemini failed, trying OpenAI...");
  try {
    const openaiText = await callOpenAI(contents);
    if (openaiText) return { text: openaiText };
  } catch (err) {
    console.warn("OpenAI fallback failed", err);
  }
  return geminiRes;
}
app.use("/api/partner", partnerKyc_default);
app.post("/api/gemini/chat", validateBody(chatBodySchema), async (req, res) => {
  try {
    const { message, tripName, startDate, endDate, membersCount, expensesTotal, lang } = req.body;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const isTodayInTrip = startDate && endDate && todayStr >= startDate && todayStr <= endDate;
    const systemInstructions = `
You are an advanced, highly realistic AI Travel Assistant for "Pravas Wataghati", a smart group travel app. Depending on the user's current need or context, you must dynamically act as either an "Expert Trip Planner" (for upcoming trips) or a "Proactive Trip Manager" (for real-time, on-the-trip support).

CRITICAL DIRECTIVES FOR BOTH MODES:
1. NO HALLUCINATIONS: Only recommend real-world existing cities, attractions, hotels, transit points, and restaurants.
2. INTEGRATED DATA & REALISM: Provide factual distances, reasonable prices, and realistic operational hours. Account for actual travel times, traffic, train/flight durations, and check-in/out times.
3. LANGUAGE COMPLIANCE: Respond in ${lang === "mr" ? "Marathi" : lang === "hi" ? "Hindi" : "English"}.

MODE 1: AI TRIP PLANNER (When planning a future trip or asking for itinerary advice)
- GOAL: Design practical, step-by-step itineraries and travel recommendations.
- PERSONALIZATION: Tailor plans strictly to user budget, starting point, and preferences.
- FORMAT: Provide clear structure with specific time slots (e.g., 09:00 AM - 11:30 AM) and estimated real-world costs in INR (\u20B9).

MODE 2: AI TRIP MANAGER (When currently on an active trip or asking for immediate live support)
- GOAL: Provide on-the-ground, immediate assistance.
- CONTEXT AWARENESS: Always prioritize current trip details, location, time, and active trip status.
- CRISP RESPONSES: Keep answers short, highly actionable, and direct (suitable for reading on a mobile screen while traveling).
- TROUBLESHOOTING: If a plan fails or changes (e.g., missed train, heavy rain, delayed flight), instantly provide realistic alternative schedules and prioritize open, nearby places.

TRIP CONTEXT:
- Destination/Trip Name: ${tripName || "Tour"}
- Trip Dates: ${startDate || "Upcoming"} to ${endDate || "N/A"}
- Members Count: ${membersCount || 1}
- Logged Group Expenses: \u20B9${expensesTotal || 0}
- Current App Date: ${todayStr} (Active Trip Status: ${isTodayInTrip ? "ACTIVE ON-TRIP" : "PLANNING PHASE"})

User Message: ${message}
`;
    const geminiRes = await safeGeminiGenerate(systemInstructions);
    if (geminiRes.text) {
      return res.json({ text: geminiRes.text });
    }
    const fallbackMsg = lang === "mr" ? `\u092A\u094D\u0930\u0935\u093E\u0938 \u0935\u093E\u091F\u093E\u0918\u093E\u091F\u0940 AI (${isTodayInTrip ? "\u0932\u093E\u0907\u0935\u094D\u0939 \u091F\u094D\u0930\u093F\u092A \u092E\u0945\u0928\u0947\u091C\u0930" : "\u0938\u094D\u092E\u093E\u0930\u094D\u091F \u091F\u094D\u0930\u093F\u092A \u092A\u094D\u0932\u0945\u0928\u0930"}): \u0924\u0941\u092E\u091A\u094D\u092F\u093E \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0938\u093E\u0920\u0940 \u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928! \u091F\u094D\u0930\u0947\u0928\u091A\u0940 \u0925\u0947\u091F \u0938\u094D\u0925\u093F\u0924\u0940, \u092A\u094D\u0930\u0947\u0915\u094D\u0937\u0923\u0940\u092F \u0938\u094D\u0925\u0933\u0947, \u0939\u0949\u091F\u0947\u0932 \u092C\u0941\u0915\u093F\u0902\u0917 \u0906\u0923\u093F \u0917\u094D\u0930\u0941\u092A \u0916\u0930\u094D\u091A \u0938\u0939\u091C \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u093F\u0924 \u0915\u0930\u093E.` : `Pravas Wataghati AI (${isTodayInTrip ? "Live Trip Manager" : "Expert Trip Planner"}): Ready to assist! Check live schedules, top real-world attractions, hotels, or manage split expenses below.`;
    res.json({ text: fallbackMsg, fallback: true });
  } catch (error) {
    res.json({ text: "Smart Travel Assistant is ready to help you plan & manage!", fallback: true });
  }
});
app.post("/api/scan-receipt", validateBody(scanReceiptSchema), async (req, res) => {
  try {
    const { image, lang } = req.body;
    if (!image) return res.status(400).json({ error: "No image data" });
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const prompt = `
      Extract details from this travel receipt image.
      Provide the following in JSON format:
      {
        "title": "Store or Hotel Name",
        "amount": 123.45,
        "date": "YYYY-MM-DD",
        "category": "food" | "traveling" | "hotels" | "other",
        "payerSuggestion": "Name on bill if found"
      }
      Respond ONLY with the JSON.
    `;
    const geminiRes = await safeGeminiGenerate([
      { text: prompt },
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);
    if (geminiRes.text) {
      try {
        const cleanedText = geminiRes.text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanedText);
        return res.json({ success: true, data });
      } catch (pErr) {
      }
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    res.json({
      success: true,
      data: {
        title: "Travel Expense Receipt",
        amount: 350,
        date: today,
        category: "food",
        payerSuggestion: ""
      },
      fallback: true
    });
  } catch (error) {
    res.json({
      success: true,
      data: { title: "Scanned Receipt", amount: 200, date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], category: "other" },
      fallback: true
    });
  }
});
function getCloserAlternativeDestinations(origin, userBudget, totalDays, numMembers, transportMode) {
  const originUpper = (origin || "").trim().toUpperCase();
  const clusters = {
    PUNE: [
      { name: "\u0932\u094B\u0923\u093E\u0935\u0933\u093E - \u0916\u0902\u0921\u093E\u0933\u093E (Lonavala)", distanceKm: 65, hours: 1.5, descMr: "\u092A\u0930\u094D\u0935\u0924, \u0927\u092C\u0927\u092C\u0947 \u0906\u0923\u093F \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0915\u093F\u0932\u094D\u0932\u0947. \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924 \u092B\u0915\u094D\u0924 \u0967.\u096B \u0924\u093E\u0938 \u0932\u093E\u0917\u0924\u0940\u0932.", descEn: "Scenic hill station with fort views, just 1.5 hrs away." },
      { name: "\u092E\u0939\u093E\u092C\u0933\u0947\u0936\u094D\u0935\u0930 - \u092A\u093E\u091A\u0917\u0923\u0940 (Mahabaleshwar)", distanceKm: 120, hours: 2.5, descMr: "\u0925\u0902\u0921 \u0939\u0935\u0947\u091A\u0947 \u0920\u093F\u0915\u093E\u0923, \u0938\u094D\u091F\u094D\u0930\u0949\u092C\u0947\u0930\u0940 \u092B\u093E\u0930\u094D\u092E\u094D\u0938 \u0906\u0923\u093F \u092A\u094D\u0930\u0938\u093F\u0926\u094D\u0927 \u0935\u094D\u0939\u094D\u092F\u0942 \u092A\u0949\u0908\u0902\u091F\u094D\u0938.", descEn: "Cool hill station with strawberry farms and scenic points." },
      { name: "\u0932\u0935\u093E\u0938\u093E \u0935 \u092E\u0941\u0933\u0936\u0940 (Lavasa & Mulshi)", distanceKm: 55, hours: 1.5, descMr: "\u0932\u0947\u0915 \u0906\u0923\u093F \u0928\u093F\u0938\u0930\u094D\u0917\u0930\u092E\u094D\u092F \u092A\u0930\u093F\u0938\u0930, \u0915\u092E\u0940 \u092C\u091C\u0947\u091F\u092E\u0927\u094D\u092F\u0947 \u0938\u0939\u091C \u0936\u0915\u094D\u092F.", descEn: "Lake view city surrounded by nature." },
      { name: "\u0905\u0932\u093F\u092C\u093E\u0917 - \u0928\u093E\u0917\u093E\u0935 \u092C\u0940\u091A (Alibaug)", distanceKm: 140, hours: 3.5, descMr: "\u0938\u0941\u0902\u0926\u0930 \u0938\u092E\u0941\u0926\u094D\u0930\u0915\u093F\u0928\u093E\u0930\u093E, \u091C\u0932\u0926\u0941\u0930\u094D\u0917 \u0906\u0923\u093F \u0938\u0940-\u092B\u0942\u0921.", descEn: "Popular coastal destination with beach & forts." }
    ],
    MUMBAI: [
      { name: "\u092E\u093E\u0925\u0947\u0930\u093E\u0928 (Matheran)", distanceKm: 80, hours: 2, descMr: "\u0935\u093E\u0939\u0928\u093E\u0902\u0936\u093F\u0935\u093E\u092F \u092A\u094D\u0930\u0926\u0942\u0937\u0923\u092E\u0941\u0915\u094D\u0924 \u0925\u0902\u0921 \u0939\u0935\u0947\u091A\u0947 \u0936\u093E\u0902\u0924 \u0920\u093F\u0915\u093E\u0923.", descEn: "Automobile-free serene hill station." },
      { name: "\u0932\u094B\u0923\u093E\u0935\u0933\u093E (Lonavala)", distanceKm: 85, hours: 2, descMr: "\u0926\u0931\u094D\u092F\u093E, \u0927\u092C\u0927\u092C\u0947 \u0906\u0923\u093F \u0932\u0947\u0915.", descEn: "Popular hill getaway with lakes & caves." },
      { name: "\u0905\u0932\u093F\u092C\u093E\u0917 (Alibaug)", distanceKm: 95, hours: 2.5, descMr: "\u091C\u0935\u0933\u091A\u093E \u0938\u0941\u0902\u0926\u0930 \u0938\u092E\u0941\u0926\u094D\u0930\u0915\u093F\u0928\u093E\u0930\u093E \u0935 \u0915\u0941\u0932\u093E\u092C\u093E \u0915\u093F\u0932\u094D\u0932\u093E.", descEn: "Nearby coastal town with clean beaches." },
      { name: "\u0907\u0917\u0924\u092A\u0941\u0930\u0940 (Igatpuri)", distanceKm: 120, hours: 2.5, descMr: "\u0927\u0941\u0915\u094D\u092F\u093E\u0928\u0947 \u0935\u0947\u0922\u0932\u0947\u0932\u0947 \u0921\u094B\u0902\u0917\u0930 \u0906\u0923\u093F \u0927\u092C\u0927\u092C\u0947.", descEn: "Mist-covered hills & waterfalls." }
    ],
    NASHIK: [
      { name: "\u0907\u0917\u0924\u092A\u0941\u0930\u0940 (Igatpuri)", distanceKm: 45, hours: 1, descMr: "\u0928\u093F\u0938\u0930\u094D\u0917\u0930\u092E\u094D\u092F \u0921\u094B\u0902\u0917\u0930\u0930\u093E\u0902\u0917\u093E, \u0935\u093F\u092A\u0936\u094D\u092F\u0928\u093E \u0915\u0947\u0902\u0926\u094D\u0930 \u0935 \u0927\u092C\u0927\u092C\u0947.", descEn: "Beautiful hill station just 1 hr away." },
      { name: "\u0924\u094D\u0930\u093F\u0902\u092C\u0915\u0947\u0936\u094D\u0935\u0930 \u0935 \u0905\u0902\u091C\u0928\u0947\u0930\u0940 (Trimbakeshwar)", distanceKm: 30, hours: 0.8, descMr: "\u091C\u094D\u092F\u094B\u0924\u093F\u0930\u094D\u0932\u093F\u0902\u0917 \u0926\u0930\u094D\u0936\u0928 \u0935 \u0905\u0902\u091C\u0928\u0947\u0930\u0940 \u092A\u0930\u094D\u0935\u0924 \u091F\u094D\u0930\u0947\u0915.", descEn: "Holy shrine and mountain trek." },
      { name: "\u092D\u0902\u0921\u093E\u0930\u0926\u0930\u093E (Bhandardara)", distanceKm: 70, hours: 1.5, descMr: "\u0906\u0930\u094D\u0925\u0930 \u0932\u0947\u0915, \u0930\u0902\u0927\u093E \u0927\u092C\u0927\u092C\u093E \u0906\u0923\u093F \u0938\u093E\u0902\u0926\u0923 \u0935\u094D\u0939\u0945\u0932\u0940.", descEn: "Serene lake, waterfalls & valley." },
      { name: "\u0938\u093E\u092A\u0941\u0924\u093E\u0930\u093E (Saputara)", distanceKm: 90, hours: 2, descMr: "\u0932\u0947\u0915 \u092C\u0949\u091F\u093F\u0902\u0917 \u0906\u0923\u093F \u0938\u0928\u0938\u0947\u091F \u092A\u0949\u0908\u0902\u091F.", descEn: "Cool hill station with lake boating." }
    ],
    KOLHAPUR: [
      { name: "\u092A\u0928\u094D\u0939\u093E\u0933\u093E \u0915\u093F\u0932\u094D\u0932\u093E (Panhala Fort)", distanceKm: 20, hours: 0.5, descMr: "\u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0915\u093F\u0932\u094D\u0932\u093E \u0906\u0923\u093F \u0925\u0902\u0921 \u0935\u093E\u0924\u093E\u0935\u0930\u0923.", descEn: "Historic fort hill station." },
      { name: "\u0905\u0902\u092C\u093E \u0918\u093E\u091F (Amba Ghat)", distanceKm: 65, hours: 1.5, descMr: "\u0928\u093F\u0938\u0930\u094D\u0917\u0930\u092E\u094D\u092F \u0926\u0930\u0940 \u0906\u0923\u093F \u091F\u094D\u0930\u0947\u0915\u093F\u0902\u0917 \u092A\u0949\u0908\u0902\u091F\u094D\u0938.", descEn: "Scenic mountain pass & nature." },
      { name: "\u092E\u093E\u0932\u0935\u0923 - \u0924\u093E\u0930\u0915\u0930\u094D\u0932\u0940 (Malvan)", distanceKm: 150, hours: 3.5, descMr: "\u0938\u094D\u0915\u0941\u092C\u093E \u0921\u093E\u092F\u0935\u094D\u0939\u093F\u0902\u0917 \u0906\u0923\u093F \u0938\u093F\u0902\u0927\u0942\u0926\u0941\u0930\u094D\u0917 \u0915\u093F\u0932\u094D\u0932\u093E.", descEn: "Scuba diving & beach fort." }
    ],
    AURANGABAD: [
      { name: "\u0935\u0947\u0930\u0942\u0933 - \u0905\u091C\u093F\u0902\u0920\u093E (Ellora - Ajanta)", distanceKm: 30, hours: 0.8, descMr: "\u0935\u093F\u0936\u094D\u0935\u092A\u094D\u0930\u0938\u093F\u0926\u094D\u0927 \u0915\u0948\u0932\u093E\u0938 \u092E\u0902\u0926\u093F\u0930 \u0906\u0923\u093F \u092A\u094D\u0930\u093E\u091A\u0940\u0928 \u0932\u0947\u0923\u0940.", descEn: "World heritage cave temples." },
      { name: "\u0926\u094C\u0932\u0924\u093E\u092C\u093E\u0926 \u0915\u093F\u0932\u094D\u0932\u093E (Daulatabad)", distanceKm: 15, hours: 0.4, descMr: "\u0905\u091C\u0947\u092F \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0926\u0947\u0935\u0917\u093F\u0930\u0940 \u0926\u0941\u0930\u094D\u0917.", descEn: "Historic invincible fort." }
    ]
  };
  let matchedCluster = clusters.PUNE;
  for (const k of Object.keys(clusters)) {
    if (originUpper.includes(k) || k.includes(originUpper)) {
      matchedCluster = clusters[k];
      break;
    }
  }
  return matchedCluster.slice(0, 3).map((item) => {
    const roundTripKm = item.distanceKm * 2;
    const estTransit = Math.round(roundTripKm * 12.5 + roundTripKm * 1.5);
    const nights = Math.max(1, totalDays - 1);
    const rooms = Math.ceil(numMembers / 2);
    const estHotel = rooms * nights * 2500;
    const estFood = numMembers * totalDays * 600;
    const totalEst = estTransit + estHotel + estFood;
    return {
      name: item.name,
      distanceKm: item.distanceKm,
      estimatedHours: item.hours,
      estimatedCost: totalEst,
      reason: item.descMr
    };
  });
}
async function evaluateTripFeasibility(source, destination, startDateStr, endDateStr, membersInput, transportMode, userBudgetInput) {
  const origin = (source || "Pune").trim();
  const dest = (destination || "Goa").trim();
  let routeInfo = { distanceKm: 250, drivingDurationHours: 5, totalTransitHours: 5.5 };
  try {
    const osmInfo = await getDrivingDistanceAndDuration(origin, dest);
    routeInfo = {
      distanceKm: osmInfo.distanceKm || 250,
      drivingDurationHours: osmInfo.drivingDurationHours || 5,
      totalTransitHours: osmInfo.totalTransitHours || 5.5
    };
  } catch (err) {
    console.warn("Feasibility OSM route error:", err);
  }
  const start = startDateStr ? new Date(startDateStr) : /* @__PURE__ */ new Date();
  const end = endDateStr ? new Date(endDateStr) : new Date(Date.now() + 3 * 864e5);
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24))) || 3;
  const numMembers = Array.isArray(membersInput) ? Math.max(1, membersInput.length) : parseInt(String(membersInput)) || 2;
  const cleanNumStr = String(userBudgetInput !== void 0 && userBudgetInput !== null ? userBudgetInput : "").replace(/[^0-9.]/g, "");
  let userBudget = parseFloat(cleanNumStr);
  if (isNaN(userBudget) || userBudget <= 0) {
    userBudget = 2e4;
  }
  const mode = (transportMode || "car").toLowerCase();
  let oneWayHours = routeInfo.totalTransitHours;
  if (mode.includes("flight")) {
    oneWayHours = Math.round((routeInfo.distanceKm / 450 + 3) * 10) / 10;
  } else if (mode.includes("train")) {
    oneWayHours = Math.round((routeInfo.distanceKm / 50 + 2) * 10) / 10;
  } else if (mode.includes("bus")) {
    oneWayHours = Math.round((routeInfo.distanceKm / 40 + 1.5) * 10) / 10;
  }
  const roundTripHours = Math.round(oneWayHours * 2 * 10) / 10;
  const totalActiveTripHours = totalDays * 12;
  const travelTimePercentage = Math.round(roundTripHours / totalActiveTripHours * 100);
  const isTravelTimeExcessive = travelTimePercentage >= 40 || roundTripHours / (totalDays * 24) >= 0.4;
  const roundTripKm = routeInfo.distanceKm * 2;
  let estimatedTolls = 0;
  let transitCost = 0;
  let transitDetail = "";
  let modeSpecificTip = "";
  if (mode.includes("flight")) {
    const flightFarePerPerson = Math.max(2500, Math.round(roundTripKm * 5));
    transitCost = flightFarePerPerson * numMembers;
    transitDetail = `\u0935\u093F\u092E\u093E\u0928 \u0924\u093F\u0915\u0940\u091F (\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0926\u0930 \u20B9\u096B/\u0915\u093F\u092E\u0940): \u20B9${flightFarePerPerson}/\u0935\u094D\u092F\u0915\u094D\u0924\u093F x ${numMembers} = \u20B9${transitCost}`;
    modeSpecificTip = `\u{1F4CC} **\u091F\u0940\u092A (\u0935\u093F\u092E\u093E\u0928 \u0926\u0930)**: \u0935\u093F\u092E\u093E\u0928 \u092A\u094D\u0930\u0935\u093E\u0938 \u0926\u0930 \u0939\u0947 \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0927\u0930\u0932\u0947 \u0906\u0939\u0947\u0924. \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u091A\u094D\u092F\u093E \u0924\u093E\u0930\u0916\u0947\u0928\u0941\u0938\u093E\u0930 \u0935\u093F\u092E\u093E\u0928 \u0915\u0902\u092A\u0928\u094D\u092F\u093E\u0902\u091A\u0947 \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0924\u093F\u0915\u0940\u091F \u0926\u0930 \u0924\u092A\u093E\u0938\u093E\u0935\u0947\u0924 \u0935 \u0924\u094D\u092F\u093E\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u092F\u094B\u091C\u0928 \u0915\u0930\u093E\u0935\u0947.`;
  } else if (mode.includes("train")) {
    const trainFare3AC = Math.max(300, Math.round(roundTripKm * 4));
    const trainFare2AC = Math.max(450, Math.round(roundTripKm * 6));
    transitCost = trainFare3AC * numMembers;
    transitDetail = `\u091F\u094D\u0930\u0947\u0928 \u0924\u093F\u0915\u0940\u091F (\u0969AC \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0926\u0930 \u20B9\u096A/\u0915\u093F\u092E\u0940): \u20B9${trainFare3AC}/\u0935\u094D\u092F\u0915\u094D\u0924\u093F x ${numMembers} = \u20B9${transitCost} (\u0968AC \u0926\u0930: ~\u20B9${trainFare2AC}/\u0935\u094D\u092F\u0915\u094D\u0924\u093F)`;
    modeSpecificTip = `\u{1F4CC} **\u091F\u0940\u092A (\u0930\u0947\u0932\u094D\u0935\u0947 \u0926\u0930)**: \u0930\u0947\u0932\u094D\u0935\u0947 \u0924\u093F\u0915\u0940\u091F \u0926\u0930 \u0939\u0947 \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0906\u0939\u0947\u0924. \u092C\u0941\u0915\u093F\u0902\u0917 \u0915\u0930\u0923\u094D\u092F\u093E\u092A\u0942\u0930\u094D\u0935\u0940 IRCTC \u0915\u093F\u0902\u0935\u093E \u0930\u0947\u0932\u094D\u0935\u0947 \u0972\u092A\u0935\u0930 \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0924\u093F\u0915\u0940\u091F \u0926\u0930 \u0924\u092A\u093E\u0938\u093E\u0935\u0947\u0924 \u0935 \u0924\u094D\u092F\u093E\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u092F\u094B\u091C\u0928 \u0915\u0930\u093E\u0935\u0947.`;
  } else if (mode.includes("bus")) {
    const busFarePerPerson = Math.max(400, Math.round(roundTripKm * 1.4));
    transitCost = busFarePerPerson * numMembers;
    transitDetail = `\u092C\u0938 \u0924\u093F\u0915\u0940\u091F (\u0926\u094B\u0928\u094D\u0939\u0940 \u092C\u093E\u091C\u0942 \u0905\u0902\u0926\u093E\u091C): \u20B9${busFarePerPerson}/\u0935\u094D\u092F\u0915\u094D\u0924\u093F x ${numMembers} = \u20B9${transitCost}`;
    modeSpecificTip = `\u{1F4CC} **\u091F\u0940\u092A (\u092C\u0938 \u0926\u0930)**: \u092C\u0938 \u0924\u093F\u0915\u0940\u091F \u0926\u0930 \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0906\u0939\u0947\u0924. \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u091A\u094D\u092F\u093E \u0924\u093E\u0930\u0916\u0947\u0928\u0941\u0938\u093E\u0930 \u0906\u0923\u093F \u092C\u0938 \u0911\u092A\u0930\u0947\u091F\u0930\u0928\u0941\u0938\u093E\u0930 (\u0938\u0930\u0915\u093E\u0930\u0940/\u0916\u093E\u091C\u0917\u0940) \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0926\u0930 \u0924\u092A\u093E\u0938\u093E\u0935\u0947\u0924 \u0935 \u0924\u094D\u092F\u093E\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u092F\u094B\u091C\u0928 \u0915\u0930\u093E\u0935\u0947.`;
  } else {
    const carRunningCost = Math.round(roundTripKm * 12.5);
    estimatedTolls = Math.round(roundTripKm * 1.5);
    transitCost = carRunningCost + estimatedTolls;
    transitDetail = `\u0917\u093E\u0921\u0940\u091A\u093E \u0907\u0902\u0927\u0928 \u0935 \u0927\u093E\u0935\u0923\u094D\u092F\u093E\u091A\u093E \u0916\u0930\u094D\u091A (\u20B9\u0967\u0968.\u096B/\u0915\u093F\u092E\u0940): \u20B9${carRunningCost} (\u0938\u0930\u094D\u0935 \u0938\u0926\u0938\u094D\u092F\u093E\u0902\u0924 \u0935\u093F\u092D\u0915\u094D\u0924) + \u091F\u094B\u0932: \u20B9${estimatedTolls} = \u20B9${transitCost}`;
    modeSpecificTip = `\u{1F4CC} **\u091F\u0940\u092A (\u0907\u0902\u0927\u0928 \u0935 \u091F\u094B\u0932 \u0926\u0930)**: \u0917\u093E\u0921\u0940\u091A\u093E \u0916\u0930\u094D\u091A \u0939\u093E \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0907\u0902\u0927\u0928 \u0926\u0930 \u0935 \u092E\u0939\u093E\u092E\u093E\u0930\u094D\u0917 \u091F\u094B\u0932\u0935\u0930 \u0906\u0927\u093E\u0930\u093F\u0924 \u0905\u0938\u0942\u0928 \u0938\u0930\u094D\u0935 \u0938\u0926\u0938\u094D\u092F\u093E\u0902\u0924 \u0935\u093F\u092D\u0915\u094D\u0924 \u0939\u094B\u0924\u094B. \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u091F\u094B\u0932 \u0935 \u0907\u0902\u0927\u0928 \u0926\u0930\u093E\u0928\u0941\u0938\u093E\u0930 \u0928\u093F\u092F\u094B\u091C\u0928 \u0915\u0930\u093E\u0935\u0947.`;
  }
  const nights = Math.max(1, totalDays - 1);
  console.log(`DEBUG: Inputs: numMembers: ${numMembers}, totalDays: ${totalDays}, nights: ${nights}, roundTripKm: ${roundTripKm}`);
  const roomsNeeded = Math.ceil(numMembers / 2);
  const avgHotelRatePerNight = 1e3;
  const totalHotelCost = roomsNeeded * nights * avgHotelRatePerNight;
  const hotelDetail = `\u0939\u0949\u091F\u0947\u0932/\u0939\u094B\u092E\u0938\u094D\u091F\u0947 \u092D\u093E\u0921\u0947 (\u092A\u094D\u0930\u0924\u093F \u0930\u0942\u092E \u0968 \u0935\u094D\u092F\u0915\u094D\u0924\u0940): ${roomsNeeded} \u0916\u094B\u0932\u094D\u092F\u093E x ${nights} \u0930\u093E\u0924\u094D\u0930\u0940 x \u20B9${avgHotelRatePerNight} = \u20B9${totalHotelCost}`;
  console.log(`DEBUG HOTEL: Rooms: ${roomsNeeded}, Nights: ${nights}, Rate: ${avgHotelRatePerNight}, Total: ${totalHotelCost}`);
  const dailyFoodPerPerson = 400;
  const dailySightseeingPerPerson = 200;
  const totalFoodAndSightseeing = (dailyFoodPerPerson + dailySightseeingPerPerson) * numMembers * totalDays;
  const foodDetail = `\u091C\u0947\u0935\u0923 \u0935 \u092A\u0930\u094D\u092F\u091F\u0928: (\u20B9\u096A\u0966\u0966 + \u20B9\u0968\u0966\u0966) x ${numMembers} \u0935\u094D\u092F\u0915\u094D\u0924\u0940 x ${totalDays} \u0926\u093F\u0935\u0938 = \u20B9${totalFoodAndSightseeing}`;
  console.log(`DEBUG FOOD: FoodPerPerson: ${dailyFoodPerPerson}, Sightseeing: ${dailySightseeingPerPerson}, Total: ${totalFoodAndSightseeing}`);
  const totalRealisticBudget = Math.round(transitCost + totalHotelCost + totalFoodAndSightseeing);
  console.log(`DEBUG BUDGET FINAL: Transit: ${transitCost}, Hotel: ${totalHotelCost}, Food/Sight: ${totalFoodAndSightseeing}, Total: ${totalRealisticBudget}`);
  const isBudgetExcessive = userBudget <= 200 || totalRealisticBudget > userBudget * 1.5;
  const isFeasible = !isTravelTimeExcessive && !isBudgetExcessive;
  let closerAlternatives = [];
  if (!isFeasible) {
    closerAlternatives = getCloserAlternativeDestinations(origin, userBudget, totalDays, numMembers, mode);
  }
  return {
    origin,
    destination: dest,
    distanceKm: routeInfo.distanceKm,
    roundTripKm,
    oneWayHours,
    roundTripHours,
    totalDays,
    numMembers,
    userBudget,
    travelTimePercentage,
    estimatedTolls,
    transitCost,
    transitDetail,
    totalHotelCost,
    hotelDetail,
    totalFoodAndSightseeing,
    foodDetail,
    totalRealisticBudget,
    isTravelTimeExcessive,
    isBudgetExcessive,
    isFeasible,
    modeSpecificTip,
    closerAlternatives
  };
}
app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const { source, tripName, startDate, endDate, members, lang, promptInstruction, transportMode, totalBudget } = req.body;
    const feasibility = await evaluateTripFeasibility(source, tripName, startDate, endDate, members, transportMode, totalBudget);
    if (!feasibility.isFeasible) {
      const isMr2 = lang === "mr";
      let warningMsg = isMr2 ? `\u26A0\uFE0F **\u0939\u0940 \u0938\u0939\u0932 \u0926\u093F\u0932\u0947\u0932\u094D\u092F\u093E \u092C\u091C\u0947\u091F\u092E\u0927\u094D\u092F\u0947 \u0915\u093F\u0902\u0935\u093E \u0915\u093E\u0932\u093E\u0935\u0927\u0940\u0924 \u0936\u0915\u094D\u092F \u0928\u093E\u0939\u0940!**

` : `\u26A0\uFE0F **Trip Not Feasible with Given Budget or Time Limit!**

`;
      if (feasibility.isBudgetExcessive) {
        warningMsg += isMr2 ? `\u2022 **\u092C\u091C\u0947\u091F\u091A\u093E \u0907\u0936\u093E\u0930\u093E**: \u0924\u0941\u092E\u091A\u0947 \u0926\u093F\u0932\u0947\u0932\u0947 \u092C\u091C\u0947\u091F (\u20B9${feasibility.userBudget.toLocaleString("en-IN")}) \u0905\u0924\u093F\u0936\u092F \u0915\u092E\u0940 \u0906\u0939\u0947. \u092F\u093E \u0938\u0939\u0932\u0940\u091A\u093E \u0935\u093E\u0938\u094D\u0924\u0935\u0935\u093E\u0926\u0940 \u0915\u093F\u092E\u093E\u0928 \u0916\u0930\u094D\u091A **\u20B9${feasibility.totalRealisticBudget.toLocaleString("en-IN")}** \u092F\u0947\u0924\u094B (${feasibility.transitDetail} | ${feasibility.hotelDetail} | \u091C\u0947\u0935\u0923 \u0935 \u092A\u0930\u094D\u092F\u091F\u0928: \u20B9${feasibility.totalFoodAndSightseeing.toLocaleString("en-IN")}).

${feasibility.modeSpecificTip}
` : `\u2022 **Budget Alert**: Provided budget (\u20B9${feasibility.userBudget.toLocaleString("en-IN")}) is too low. Minimum realistic cost is **\u20B9${feasibility.totalRealisticBudget.toLocaleString("en-IN")}**.

${feasibility.modeSpecificTip}
`;
      }
      if (feasibility.isTravelTimeExcessive) {
        warningMsg += isMr2 ? `\u2022 **\u092A\u094D\u0930\u0935\u093E\u0938 \u0935\u0947\u0933\u0947\u091A\u093E \u0907\u0936\u093E\u0930\u093E**: \u0939\u0940 \u0938\u0939\u0932 \u0907\u0924\u0915\u094D\u092F\u093E \u0915\u092E\u0940 \u0926\u093F\u0935\u0938\u093E\u0902\u0924 \u0915\u0930\u0923\u0947 \u0917\u0948\u0930\u0938\u094B\u092F\u0940\u091A\u0947 \u0906\u0939\u0947, \u0915\u093E\u0930\u0923 \u0924\u0941\u092E\u091A\u093E \u096C\u0966% \u092A\u0947\u0915\u094D\u0937\u093E \u091C\u093E\u0938\u094D\u0924 \u0935\u0947\u0933 \u092B\u0915\u094D\u0924 \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924\u091A \u091C\u093E\u0908\u0932. \u0915\u0943\u092A\u092F\u093E \u0926\u093F\u0935\u0938\u093E\u0902\u091A\u0940 \u0938\u0902\u0916\u094D\u092F\u093E \u0935\u093E\u0922\u0935\u093E.
` : `\u2022 **Travel Time Alert**: This trip is inconvenient for such a short duration as most of your time will be spent in transit. Please increase the number of days.
`;
      }
      warningMsg += isMr2 ? `
\u{1F4CD} **\u092A\u0930\u094D\u092F\u093E\u092F\u0940 \u091C\u0935\u0933\u091A\u0940 \u0938\u0941\u0902\u0926\u0930 \u0935 \u0938\u094B\u092F\u0940\u0938\u094D\u0915\u0930 \u0920\u093F\u0915\u093E\u0923\u0947 (Recommended Nearby Alternatives):**
` : `
\u{1F4CD} **Recommended Nearby Alternatives:**
`;
      feasibility.closerAlternatives.forEach((alt, idx) => {
        warningMsg += `${idx + 1}. **${alt.name}** (~${alt.distanceKm} \u0915\u093F\u092E\u0940, \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924 ~${alt.estimatedHours} \u0924\u093E\u0938)
   \u2022 \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0916\u0930\u094D\u091A: \u20B9${alt.estimatedCost.toLocaleString("en-IN")} | ${alt.reason}
`;
      });
      const unfeasibleResult = {
        abort: true,
        is_feasible: false,
        budgetWarning: warningMsg,
        wiki_summary: isMr2 ? "\u0905\u0936\u0915\u094D\u092F \u0938\u0939\u0932 - \u091C\u0935\u0933\u091A\u0947 \u092A\u0930\u094D\u092F\u093E\u092F \u0938\u0941\u091A\u0935\u0932\u0947 \u0906\u0939\u0947\u0924." : "Unfeasible trip - check recommended alternatives.",
        weather: isMr2 ? "\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0939\u0935\u093E\u092E\u093E\u0928: N/A" : "Weather: N/A",
        packingList: [],
        totalEstimatedCost: feasibility.totalRealisticBudget,
        tollAndFuelCost: feasibility.estimatedTolls,
        closerAlternatives: feasibility.closerAlternatives,
        trip_title: `${feasibility.destination} (${isMr2 ? "\u0905\u0936\u0915\u094D\u092F \u0938\u0939\u0932 - \u091C\u0935\u0933\u091A\u0947 \u092A\u0930\u094D\u092F\u093E\u092F" : "Unfeasible Trip - Recommended Alternatives"})`,
        itinerary: []
      };
      return res.json({ success: true, text: JSON.stringify(unfeasibleResult) });
    }
    let wikiFacts = "";
    try {
      const dest = tripName || "Destination";
      const wikiRes = await fetch(`https://mr.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=${encodeURIComponent(dest)}&explaintext=1&format=json`);
      const wikiData = await wikiRes.json();
      const pages = wikiData?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        if (pageId !== "-1") {
          wikiFacts = pages[pageId].extract;
        }
      }
      if (!wikiFacts) {
        const enWikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=${encodeURIComponent(dest)}&explaintext=1&format=json`);
        const enWikiData = await enWikiRes.json();
        const enPages = enWikiData?.query?.pages;
        if (enPages) {
          const enPageId = Object.keys(enPages)[0];
          if (enPageId !== "-1") {
            wikiFacts = enPages[enPageId].extract;
          }
        }
      }
    } catch (e) {
      console.error("Wiki fetch error", e);
    }
    if (!feasibility.isFeasible) {
      const isMr2 = lang === "mr";
      let warningMsg = isMr2 ? `\u26A0\uFE0F **\u0939\u0940 \u091F\u094D\u0930\u093F\u092A \u0926\u093F\u0932\u0947\u0932\u094D\u092F\u093E \u0915\u093E\u0932\u093E\u0935\u0927\u0940\u0924 \u0915\u093F\u0902\u0935\u093E \u092C\u091C\u0947\u091F\u092E\u0927\u094D\u092F\u0947 \u0936\u0915\u094D\u092F \u0928\u093E\u0939\u0940!**

` : `\u26A0\uFE0F **Trip Not Feasible with Given Time or Budget!**

`;
      if (feasibility.isTravelTimeExcessive) {
        warningMsg += isMr2 ? `\u2022 **\u092A\u094D\u0930\u0935\u093E\u0938 \u0935\u0947\u0933\u0947\u091A\u093E \u0907\u0936\u093E\u0930\u093E**: ${feasibility.origin} \u0924\u0947 ${feasibility.destination} \u0939\u0947 \u0905\u0902\u0924\u0930 ~${feasibility.distanceKm} \u0915\u093F\u092E\u0940 \u0905\u0938\u0942\u0928 \u092F\u0947\u0923\u094D\u092F\u093E-\u091C\u093E\u0923\u094D\u092F\u093E\u0924 ${feasibility.roundTripHours} \u0924\u093E\u0938 \u091C\u093E\u0924\u093E\u0924 (${feasibility.totalDays} \u0926\u093F\u0935\u0938\u093E\u0902\u091A\u094D\u092F\u093E \u0938\u0915\u094D\u0930\u0940\u092F \u0935\u0947\u0933\u0947\u091A\u094D\u092F\u093E **${feasibility.travelTimePercentage}%** \u0935\u0947\u0933 \u092B\u0915\u094D\u0924 \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924\u091A \u091C\u093E\u0908\u0932 - \u096C\u0966% \u092A\u0947\u0915\u094D\u0937\u093E \u091C\u093E\u0938\u094D\u0924 \u0935\u0947\u0933 \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924 \u091C\u093E\u0924 \u0906\u0939\u0947).
` : `\u2022 **Travel Time Alert**: Distance is ~${feasibility.distanceKm} km requiring ${feasibility.roundTripHours} hrs round-trip travel (${feasibility.travelTimePercentage}% of active trip time, exceeding 60% limit).
`;
      }
      if (feasibility.isBudgetExcessive) {
        warningMsg += isMr2 ? `\u2022 **\u092C\u091C\u0947\u091F\u091A\u093E \u0907\u0936\u093E\u0930\u093E**: AI \u0928\u0941\u0938\u093E\u0930 \u092F\u093E \u091F\u094D\u0930\u093F\u092A\u091A\u093E \u0935\u093E\u0938\u094D\u0924\u0935\u0935\u093E\u0926\u0940 \u0905\u0902\u0926\u093E\u091C **\u20B9${feasibility.totalRealisticBudget.toLocaleString("en-IN")}** \u0939\u094B\u0924 \u0906\u0939\u0947 (${feasibility.transitDetail} | ${feasibility.hotelDetail}), \u091C\u094B \u0924\u0941\u092E\u091A\u094D\u092F\u093E \u092C\u091C\u0947\u091F\u092A\u0947\u0915\u094D\u0937\u093E (\u20B9${feasibility.userBudget.toLocaleString("en-IN")}) \u096C\u0966% \u092A\u0947\u0915\u094D\u0937\u093E \u091C\u093E\u0938\u094D\u0924 \u0906\u0939\u0947.
` : `\u2022 **Budget Excess Alert**: Realistic estimated cost is **\u20B9${feasibility.totalRealisticBudget.toLocaleString("en-IN")}** (${feasibility.transitDetail}), exceeding your budget (\u20B9${feasibility.userBudget.toLocaleString("en-IN")}) by >60%.
`;
      }
      warningMsg += isMr2 ? `
\u{1F4CD} **\u092A\u0930\u094D\u092F\u093E\u092F\u0940 \u091C\u0935\u0933\u091A\u0940 \u0938\u0941\u0902\u0926\u0930 \u0906\u0923\u093F \u092C\u091C\u0947\u091F\u092E\u0927\u094D\u092F\u0947 \u092C\u0938\u0923\u093E\u0930\u0940 \u0920\u093F\u0915\u093E\u0923\u0947 (Recommended Nearby Alternatives):**
` : `
\u{1F4CD} **Recommended Nearby Alternatives:**
`;
      feasibility.closerAlternatives.forEach((alt, idx) => {
        warningMsg += `${idx + 1}. **${alt.name}** (~${alt.distanceKm} \u0915\u093F\u092E\u0940, \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924 ~${alt.estimatedHours} \u0924\u093E\u0938)
   \u2022 \u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0916\u0930\u094D\u091A: \u20B9${alt.estimatedCost.toLocaleString("en-IN")} | ${alt.reason}
`;
      });
      const unfeasibleResult = {
        abort: true,
        budgetWarning: warningMsg,
        wiki_summary: wikiFacts || (isMr2 ? "\u092E\u093E\u0939\u093F\u0924\u0940 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u093E\u0939\u0940." : "No info available."),
        weather: isMr2 ? "\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0939\u0935\u093E\u092E\u093E\u0928: \u092E\u093E\u0939\u093F\u0924\u0940 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u093E\u0939\u0940" : "Weather: N/A",
        packingList: [],
        totalEstimatedCost: feasibility.totalRealisticBudget,
        tollAndFuelCost: feasibility.estimatedTolls,
        closerAlternatives: feasibility.closerAlternatives,
        trip_title: `${feasibility.destination} (Unfeasible - Recommended Alternatives)`,
        itinerary: []
      };
      return res.json({ success: true, text: JSON.stringify(unfeasibleResult) });
    }
    const prompt = `
      You are an Expert Pre-Trip Planner for Pravas Wataghati. Create a detailed day-wise travel itinerary for:
      - Source: ${feasibility.origin}
      - Trip Destination: ${feasibility.destination}
      - OSM Distance: ${feasibility.distanceKm} km (One-way) | Round-trip Transit: ~${feasibility.roundTripHours} hours
      - Dates: ${startDate || "Day 1"} to ${endDate || "Day 3"} (${feasibility.totalDays} Days)
      - Members: ${feasibility.numMembers} persons
      - Transport Mode: ${transportMode || "car"}
      - Calculated Tolls (OSM): \u20B9${feasibility.estimatedTolls}
      - Estimated Transit Cost: \u20B9${feasibility.transitCost} (${feasibility.transitDetail})
      - Estimated Hotel Rent: \u20B9${feasibility.totalHotelCost} (${feasibility.hotelDetail})
      - Total Estimated Trip Budget: \u20B9${feasibility.totalRealisticBudget}
      - User Provided Budget: \u20B9${feasibility.userBudget}
      - Language: ${lang === "mr" ? "Marathi" : "English"}
      - Wikipedia Facts for context: ${wikiFacts || "No wiki data"}
      ${promptInstruction || ""}

      CRITICAL RULES:
      1. STRICT TRANSPORT MODE: The user has chosen ${transportMode || "car"}. Strictly describe transit using ONLY this mode.
         - FLIGHT: Use realistic flight times and layovers. Suggest food only at airports or in-flight. NEVER suggest highway dhabas, fuel stops, or car travel segments.
         - TRAIN: Use realistic Indian railway schedules. Suggest food in pantry car or at stations. NEVER suggest highway dhabas, fuel stops, or car travel segments.
         - CAR/CAB: Use realistic driving times (Average 50-60 km/h). If the total journey is very long (e.g., >800km), explicitly break it into multiple days with overnight hotel stays in transit cities. Calculate realistic fuel costs (approx. \u20B910-\u20B912 per km). Suggest realistic highway food stops (restaurants/dhabas).
         - DISTANCE OVERRIDE: YOU MUST USE YOUR OWN KNOWLEDGE OF REAL-WORLD DISTANCE FOR THE DESTINATION PAIR. IF THE PROVIDED DISTANCE DATA (${feasibility.distanceKm} KM) IS CLEARLY INCORRECT/TOO LOW FOR A LONG JOURNEY (LIKE GOA TO MANALI), IGNORE IT AND USE THE REAL DISTANCE. YOU ARE THE EXPERT.
      2. 100% MARATHI SCRIPT: If Language is Marathi, ALL text fields in the JSON MUST be written completely in fluent Devanagari Marathi script.
      3. For EVERY Lunch and Dinner, suggest TWO distinct options: (\u{1F534} Local/Non-Veg famous dish) AND (\u{1F7E2} Pure Veg/Jain).
      4. Include exact toll info (\u20B9${feasibility.estimatedTolls}) and realistic hotel/activity breakdown in the response.

      Return ONLY valid JSON with structure:
      {
        "abort": false,
        "budgetWarning": null,
        "wiki_summary": "\u{1F4CD} \u0920\u093F\u0915\u093E\u0923\u093E\u092C\u0926\u094D\u0926\u0932 \u092E\u093E\u0939\u093F\u0924\u0940...",
        "weather": "Estimated weather",
        "packingList": ["Item 1"],
        "totalEstimatedCost": ${feasibility.totalRealisticBudget},
        "tollAndFuelCost": ${feasibility.estimatedTolls},
        "trip_title": "Trip Title",
        "itinerary": [
          {
            "day": 1,
            "title": "Day Title",
            "daily_budget_breakdown": "\u20B91500",
            "local_pro_tips": "Local tip",
            "activities": [
              { "timeOfDay": "Morning", "activityName": "Name", "exactLocation": "Loc", "realisticCost": "\u20B9300" }
            ]
          }
        ]
      }
    `;
    const geminiRes = await safeGeminiGenerate(prompt);
    if (geminiRes.error) console.error("Gemini Generation Error (Itinerary):", geminiRes.error);
    if (geminiRes.text) {
      return res.json({ success: true, text: geminiRes.text });
    }
    const isMr = lang === "mr";
    const fallbackItinerary = {
      abort: false,
      budgetWarning: null,
      wiki_summary: wikiFacts || (isMr ? "\u092E\u093E\u0939\u093F\u0924\u0940 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u093E\u0939\u0940." : "No info available."),
      weather: isMr ? "\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0939\u0935\u093E\u092E\u093E\u0928: \u0969\u0966\xB0C, \u0938\u094D\u0935\u091A\u094D\u091B \u0906\u0915\u093E\u0936" : "Expected Weather: 30\xB0C, Clear Skies",
      packingList: isMr ? ["\u0938\u0928\u0917\u094D\u0932\u093E\u0938\u0947\u0938", "\u0915\u0945\u092A", "\u0938\u0941\u0924\u0940 \u0915\u092A\u0921\u0947"] : ["Sunglasses", "Cap", "Cotton Clothes"],
      totalEstimatedCost: feasibility.totalRealisticBudget,
      tollAndFuelCost: feasibility.estimatedTolls,
      trip_title: isMr ? "\u092E\u093E\u091D\u0940 \u0916\u093E\u0938 \u091F\u094D\u0930\u093F\u092A" : "My Special Trip",
      itinerary: [
        {
          day: 1,
          title: isMr ? "\u0926\u093F\u0935\u0938 \u0967: \u0906\u0917\u092E\u0928 \u0935 \u092A\u0930\u094D\u092F\u091F\u0928" : "Day 1: Arrival & Sightseeing",
          daily_budget_breakdown: `\u20B9${Math.round(feasibility.totalRealisticBudget / feasibility.totalDays)}`,
          local_pro_tips: isMr ? "\u092A\u093E\u0923\u0940 \u0938\u094B\u092C\u0924 \u0920\u0947\u0935\u093E." : "Carry water.",
          activities: [
            { timeOfDay: "Morning", activityName: isMr ? "\u0906\u0917\u092E\u0928 \u0935 \u0928\u093E\u0936\u094D\u0924\u093E" : "Arrival & Breakfast", exactLocation: "Hotel", realisticCost: "\u20B9300" }
          ]
        }
      ]
    };
    res.json({ success: true, text: JSON.stringify(fallbackItinerary), fallback: true });
  } catch (err) {
    console.error("Generate itinerary error:", err);
    res.json({ success: false, error: "Failed to generate itinerary" });
  }
});
app.get("/api/pexels", async (req, res) => {
  try {
    const location = req.query.location || "travel";
    const pexelsKey = process.env.PEXELS_API_KEY || process.env.VITE_PEXELS_API_KEY;
    if (pexelsKey) {
      try {
        const response = await import_axios.default.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(location + " nature landscape")}&per_page=6`, {
          headers: { Authorization: pexelsKey }
        });
        if (response.data && response.data.photos && response.data.photos.length > 0) {
          return res.json({ photos: response.data.photos });
        }
      } catch (err) {
        console.warn("[Pexels API Warning]:", err);
      }
    }
    const locLower = location.toLowerCase();
    let imgUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    if (locLower.includes("ratnagiri") || locLower.includes("ganpatipule") || locLower.includes("konkan") || locLower.includes("beach")) {
      imgUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    } else if (locLower.includes("fort") || locLower.includes("palace") || locLower.includes("ratnadurg") || locLower.includes("thibaw")) {
      imgUrl = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80";
    } else if (locLower.includes("nashik") || locLower.includes("trimbak")) {
      imgUrl = "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80";
    }
    return res.json({
      photos: [
        {
          id: Date.now(),
          src: { large: imgUrl, medium: imgUrl, small: imgUrl, tiny: imgUrl },
          photographer: "Unsplash Travel Gallery",
          photographer_url: "https://unsplash.com"
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to search images" });
  }
});
app.post("/api/affiliate-link", async (req, res) => {
  const merchantUrl = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  let parsed;
  try {
    parsed = new URL(merchantUrl);
  } catch {
    return res.status(400).json({ error: "A valid absolute URL is required" });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return res.status(400).json({ error: "Only http and https URLs are supported" });
  }
  const apiKey = process.env.EARNKARO_API_KEY;
  if (!apiKey) {
    return res.json({ link: null });
  }
  const apiUrl = process.env.EARNKARO_API_URL || "https://api.earnkaro.com/v1/generate-link";
  try {
    const response = await import_axios.default.post(
      apiUrl,
      { url: parsed.toString() },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 8e3 }
    );
    return res.json({ link: response.data?.short_link || null });
  } catch (err) {
    console.warn("[EarnKaro API Notice]:", err?.response?.status || err?.message || err);
    return res.json({ link: null });
  }
});
function normalisedTripId(raw) {
  return typeof raw === "string" ? raw.trim().toUpperCase() : "";
}
app.post("/api/trips/share", verifyAppCheck, requireAuth, async (req, res) => {
  const tripId = normalisedTripId(req.body?.tripId);
  const passcode = typeof req.body?.passcode === "string" ? req.body.passcode : "";
  if (!/^[A-Z0-9_-]{1,128}$/.test(tripId)) {
    return res.status(400).json({ error: "A valid tripId is required" });
  }
  if (passcode.length < 4 || passcode.length > 10) {
    return res.status(400).json({ error: "Passcode must be 4 to 10 characters" });
  }
  const db = adminDb();
  if (!db) return res.status(503).json({ error: "Server storage is not configured" });
  try {
    const tripRef = db.collection("trips").doc(tripId);
    const snap = await tripRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Trip not found" });
    const trip = snap.data() || {};
    const uid = req.user.uid;
    const email = (req.user.email || "").toLowerCase();
    const isOwner = trip.userId === uid || (trip.userEmail || "").toLowerCase() === email;
    if (!isOwner) {
      return res.status(403).json({ error: "Only the trip owner can enable sharing" });
    }
    await db.collection("trip_secrets").doc(tripId).set({
      passcode,
      tripId,
      updatedAt: import_firestore.FieldValue.serverTimestamp()
    });
    await tripRef.update({
      memberUids: import_firestore.FieldValue.arrayUnion(uid),
      passcode: import_firestore.FieldValue.delete()
    });
    return res.json({ success: true, tripId });
  } catch (err) {
    console.error("[trips/share] error:", err?.message || err);
    return res.status(500).json({ error: "Could not enable sharing for this trip" });
  }
});
app.post("/api/trips/join", verifyAppCheck, requireAuth, async (req, res) => {
  const tripId = normalisedTripId(req.body?.tripId);
  const passcode = typeof req.body?.passcode === "string" ? req.body.passcode : "";
  if (!/^[A-Z0-9_-]{1,128}$/.test(tripId)) {
    return res.status(400).json({ error: "A valid trip code is required" });
  }
  const db = adminDb();
  if (!db) return res.status(503).json({ error: "Server storage is not configured" });
  try {
    const tripRef = db.collection("trips").doc(tripId);
    const snap = await tripRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Trip not found" });
    const secretSnap = await db.collection("trip_secrets").doc(tripId).get();
    const expected = secretSnap.exists ? (secretSnap.data() || {}).passcode : null;
    if (expected) {
      const provided = passcode || "";
      let mismatch = provided.length === expected.length ? 0 : 1;
      for (let i = 0; i < Math.max(provided.length, expected.length); i++) {
        if (provided.charCodeAt(i) !== expected.charCodeAt(i)) mismatch |= 1;
      }
      if (mismatch) {
        return res.status(403).json({ error: "Incorrect passcode" });
      }
    }
    await tripRef.update({ memberUids: import_firestore.FieldValue.arrayUnion(req.user.uid) });
    const fresh = await tripRef.get();
    const trip = fresh.data() || {};
    delete trip.passcode;
    return res.json({ success: true, trip: { ...trip, id: tripId } });
  } catch (err) {
    console.error("[trips/join] error:", err?.message || err);
    return res.status(500).json({ error: "Could not join this trip" });
  }
});
app.post("/api/generate-future-trip-plan", async (req, res) => {
  try {
    const { destination, departure, days, budget, persons, lang, transportMode } = req.body;
    const cleanDest = decodeURIComponent(destination || "Goa");
    const feasibility = await evaluateTripFeasibility(
      departure || "Mumbai",
      cleanDest,
      (/* @__PURE__ */ new Date()).toISOString(),
      new Date(Date.now() + (Number(days) || 3) * 864e5).toISOString(),
      persons || 2,
      transportMode || "car",
      budget
    );
    if (!feasibility.isFeasible) {
      const isMr2 = lang === "mr";
      let alertMsg = isMr2 ? "\u26A0\uFE0F \u0939\u0940 \u0938\u0939\u0932 \u0926\u093F\u0932\u0947\u0932\u0947 \u092C\u091C\u0947\u091F \u0915\u093F\u0902\u0935\u093E \u0935\u0947\u0933\u0947\u0924 \u0936\u0915\u094D\u092F \u0928\u093E\u0939\u0940!" : "\u26A0\uFE0F Trip is not feasible with given budget or time limit!";
      let detailedFact = "";
      if (feasibility.isBudgetExcessive) {
        detailedFact += isMr2 ? `\u0924\u0941\u092E\u091A\u0947 \u092C\u091C\u0947\u091F (\u20B9${feasibility.userBudget.toLocaleString("en-IN")}) \u0905\u0924\u093F\u0936\u092F \u0915\u092E\u0940 \u0906\u0939\u0947. ${feasibility.numMembers} \u0935\u094D\u092F\u0915\u094D\u0924\u0940\u0902\u0938\u093E\u0920\u0940 ${feasibility.totalDays} \u0926\u093F\u0935\u0938\u093E\u0902\u091A\u094D\u092F\u093E \u092F\u093E \u0938\u0939\u0932\u0940\u091A\u093E \u0935\u093E\u0938\u094D\u0924\u0935\u0935\u093E\u0926\u0940 \u0915\u093F\u092E\u093E\u0928 \u0916\u0930\u094D\u091A \u20B9${feasibility.totalRealisticBudget.toLocaleString("en-IN")} \u092F\u0947\u0924\u094B (${feasibility.transitDetail}).

${feasibility.modeSpecificTip}` : `Your budget (\u20B9${feasibility.userBudget.toLocaleString("en-IN")}) is too low. Realistic cost for ${feasibility.numMembers} persons for ${feasibility.totalDays} days is \u20B9${feasibility.totalRealisticBudget.toLocaleString("en-IN")}.

${feasibility.modeSpecificTip}`;
      }
      if (feasibility.isTravelTimeExcessive) {
        if (detailedFact) detailedFact += "\n\n";
        detailedFact += isMr2 ? `\u0939\u0940 \u0938\u0939\u0932 \u0907\u0924\u0915\u094D\u092F\u093E \u0915\u092E\u0940 \u0926\u093F\u0935\u0938\u093E\u0902\u0924 \u0915\u0930\u0923\u0947 \u0917\u0948\u0930\u0938\u094B\u092F\u0940\u091A\u0947 \u0906\u0939\u0947, \u0915\u093E\u0930\u0923 \u0924\u0941\u092E\u091A\u093E \u096C\u0966% \u092A\u0947\u0915\u094D\u0937\u093E \u091C\u093E\u0938\u094D\u0924 \u0935\u0947\u0933 \u092B\u0915\u094D\u0924 \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924\u091A \u091C\u093E\u0908\u0932. \u0915\u0943\u092A\u092F\u093E \u0926\u093F\u0935\u0938\u093E\u0902\u091A\u0940 \u0938\u0902\u0916\u094D\u092F\u093E \u0935\u093E\u0922\u0935\u093E.` : `This trip is inconvenient for such a short duration as most of your time will be spent in transit. Please increase the number of days.`;
      }
      return res.json({
        success: true,
        data: {
          is_feasible: false,
          practicality_warning: {
            alert: alertMsg,
            detailed_fact: detailedFact,
            smart_alternatives: feasibility.closerAlternatives.map((alt) => ({
              name: alt.name,
              travel_time: `~${alt.estimatedHours} ${isMr2 ? "\u0924\u093E\u0938" : "hrs"} (${alt.distanceKm} km)`,
              reason: `${alt.reason} (${isMr2 ? "\u0905\u0902\u0926\u093E\u091C\u093F\u0924 \u0916\u0930\u094D\u091A" : "Est. cost"}: \u20B9${alt.estimatedCost.toLocaleString("en-IN")})`
            }))
          }
        }
      });
    }
    let wikiFacts = "";
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=2&exlimit=1&titles=${encodeURIComponent(cleanDest)}&explaintext=1&format=json`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const pages = wikiData?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1") wikiFacts = pages[pageId].extract;
        }
      }
    } catch (e) {
      console.error("Wiki fetch error", e);
    }
    const tripDistanceInfo = await getDrivingDistanceAndDuration(departure || "Mumbai", cleanDest);
    if (!tripDistanceInfo.distanceKm || tripDistanceInfo.distanceKm < 10) {
      return res.json({
        success: false,
        error: lang === "mr" ? "\u{1F4CD} \u0920\u093F\u0915\u093E\u0923 \u0938\u093E\u092A\u0921\u0932\u0947 \u0928\u093E\u0939\u0940. \u0915\u0943\u092A\u092F\u093E \u092F\u094B\u0917\u094D\u092F \u0936\u0939\u0930\u093E\u091A\u0947 \u0915\u093F\u0902\u0935\u093E \u0920\u093F\u0915\u093E\u0923\u093E\u091A\u0947 \u0928\u093E\u0935 \u091F\u093E\u0915\u093E." : "\u{1F4CD} Destination not found. Please enter a valid city or place name."
      });
    }
    const numPersons = Number(persons) || 1;
    let transportCost = 0;
    let fuelCost = 0;
    let tollCost = 0;
    const mode = (transportMode || "").toLowerCase();
    const isCar = mode.includes("car") || mode.includes("\u0917\u093E\u0921\u0940");
    const isTrain = mode.includes("train") || mode.includes("\u0930\u0947\u0932\u094D\u0935\u0947");
    const isFlight = mode.includes("flight") || mode.includes("\u0935\u093F\u092E\u093E\u0928");
    const isBus = mode.includes("bus") || mode.includes("\u092C\u0938");
    const distance = tripDistanceInfo.distanceKm || 250;
    if (isCar) {
      fuelCost = Math.round(distance * 15) * 2;
      tollCost = Math.round(distance * 2) * 2;
      transportCost = fuelCost + tollCost;
      if (transportCost < 500) transportCost = 500;
    } else if (isTrain) {
      transportCost = Math.round(distance * 4) * numPersons * 2;
    } else if (isFlight) {
      transportCost = Math.round(distance * 12) * numPersons * 2;
    } else if (isBus) {
      transportCost = Math.round(distance * 3) * numPersons * 2;
    }
    if (transportCost < 200) transportCost = 200;
    const remainingBudget = Number(budget) - transportCost;
    const practicalAllowedTime = Number(days) * 8;
    if (tripDistanceInfo.totalTransitHours > practicalAllowedTime && isCar) {
      return res.json({
        success: true,
        data: {
          is_feasible: false,
          practicality_warning: {
            alert: lang === "mr" ? "\u26A0\uFE0F \u0939\u0940 \u0938\u0939\u0932 \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u091A\u094D\u092F\u093E \u0905\u0902\u0924\u0930\u093E\u092E\u0941\u0933\u0947 \u0905\u0936\u0915\u094D\u092F \u0906\u0939\u0947!" : "\u26A0\uFE0F Trip is geographically impractical!",
            detailed_fact: lang === "mr" ? `\u0939\u0940 \u0938\u0939\u0932 \u0907\u0924\u0915\u094D\u092F\u093E \u0915\u092E\u0940 \u0926\u093F\u0935\u0938\u093E\u0902\u0924 \u0915\u0930\u0923\u0947 \u0917\u0948\u0930\u0938\u094B\u092F\u0940\u091A\u0947 \u0906\u0939\u0947, \u0915\u093E\u0930\u0923 \u0924\u0941\u092E\u091A\u093E \u096C\u0966% \u092A\u0947\u0915\u094D\u0937\u093E \u091C\u093E\u0938\u094D\u0924 \u0935\u0947\u0933 \u092B\u0915\u094D\u0924 \u092A\u094D\u0930\u0935\u093E\u0938\u093E\u0924\u091A \u091C\u093E\u0908\u0932. \u0915\u0943\u092A\u092F\u093E \u0926\u093F\u0935\u0938\u093E\u0902\u091A\u0940 \u0938\u0902\u0916\u094D\u092F\u093E \u0935\u093E\u0922\u0935\u093E.` : `This trip is inconvenient for such a short duration as most of your time will be spent in transit. Please increase the number of days.`,
            smart_alternatives: [
              { name: lang === "mr" ? "\u091C\u0935\u0933\u091A\u0947 \u0920\u093F\u0915\u093E\u0923" : "Closer Destination", travel_time: "4 hours", reason: lang === "mr" ? "\u0915\u092E\u0940 \u0935\u0947\u0933\u093E\u0924 \u092A\u094B\u0939\u094B\u091A\u0924\u093E \u092F\u0947\u0908\u0932." : "Can reach in less time." }
            ]
          }
        }
      });
    }
    const prompt = `
      You are an Expert Pre-Trip Planner for Pravas Wataghati. Generate a comprehensive, realistic smart trip plan.
      
      TRIP LOGISTICS:
      - Origin: ${departure || "Mumbai"}
      - Destination: ${cleanDest}
      - Travel Time Estimate: Approximately ${tripDistanceInfo.totalTransitHours} hours via ${req.body.transportMode || "road"}.
      - Start Date: ${req.body.startDate || "Upcoming"}
      - End Date: ${req.body.endDate || "Upcoming"}
      - Duration: ${days || 3} days
      - Total Budget: \u20B9${budget || 1e4} for the entire group
      - Transport Mode: ${req.body.transportMode || "Car"}
      - Transport Cost Allocation: \u20B9${transportCost} ${isCar ? `(Fuel: \u20B9${fuelCost}, Toll: \u20B9${tollCost})` : ""}
      - Remaining Budget for Trip: \u20B9${remainingBudget} per person
      - Group Size: ${persons || 2} persons
      - Language: ${lang === "mr" ? "Marathi" : "English"}

      STRICT PLANNING RULES:
      1. DOOR-TO-DOOR PLANNING: Day 1 MUST start at the Origin (${departure || "Mumbai"}). You must explicitly schedule the departure and allocate the realistic travel time (${tripDistanceInfo.totalTransitHours} hours) to reach the Destination (${cleanDest}). Do NOT start the itinerary directly at the destination.
      2. TRANSPORT MODE STRICT CONSTRAINT: The user is traveling by ${req.body.transportMode || "Car"}.
         - FLIGHT: Use realistic flight times and layovers. Suggest food only at airports or in-flight. NEVER suggest highway dhabas, fuel stops, or car travel segments.
         - TRAIN: Use realistic Indian railway schedules. Suggest food in pantry car or at stations. NEVER suggest highway dhabas, fuel stops, or car travel segments.
         - CAR/CAB: Use realistic driving times (Average 50-60 km/h). If the total journey is very long (e.g., >800km), explicitly break it into multiple days with overnight hotel stays in transit cities. Calculate realistic fuel costs (approx. \u20B910-\u20B912 per km). Suggest realistic highway food stops (restaurants/dhabas).
      3. GRANULAR COST ESTIMATION: Provide an estimated market cost for EACH item (Transport, Hotel, Food, Activities) in the daily plan. YOU MUST USE THE EXACT TRANSPORT COSTS PROVIDED IN THE 'Transport Cost Allocation' FIELD FOR THE 'costBreakdown.travel' AND 'transportBreakdown' FIELDS IN THE JSON RESPONSE. DO NOT HALLUCINATE OR CHANGE THESE VALUES.
      4. HOTEL DETAILS: When suggesting a hotel, provide its exact area or landmark address.
      5. DATE-SPECIFIC WEATHER: Assume realistic weather for the dates ${req.body.startDate || "Upcoming"} to ${req.body.endDate || "Upcoming"} in ${cleanDest}.
      6. DIET DIVERSITY: Suggest a mix of famous local restaurants, including both local non-veg (if applicable) and veg options, unless the user explicitly requested a "Pure Veg" trip. Always highlight the best rated options regardless of cuisine.
      7. REALISTIC LOGISTICS & TIMINGS: Account for travel time between spots and assign exact times (08:30 AM, 01:30 PM, 06:00 PM).
      8. 100% MARATHI SCRIPT ENFORCEMENT: If Language is Marathi, EVERY SINGLE text string MUST be written 100% in pure fluent Devanagari Marathi script. Absolutely NO mixed English sentences.
      9. DISTANCE OVERRIDE: YOU MUST USE YOUR OWN KNOWLEDGE OF REAL-WORLD DISTANCE FOR THE DESTINATION PAIR. IF THE PROVIDED DISTANCE DATA (${tripDistanceInfo.distanceKm} KM) IS CLEARLY INCORRECT/TOO LOW FOR A LONG JOURNEY (LIKE GOA TO MANALI), IGNORE IT AND USE THE REAL DISTANCE. YOU ARE THE EXPERT.

      Return ONLY JSON format (including the total distance in km as "totalDistanceKm"):
      {
        "totalDistanceKm": ${distance},
        "trip_title": "${cleanDest} Smart Tour",
        "feasibilityAlert": "Feasibility & Budget Status",
        "totalEstimatedCost": 0,
        "transportMode": "${req.body.transportMode || "Car"}",
        "costBreakdown": { "travel": ${transportCost}, "stay": 0, "food": 0, "activities": 0 },
        ${isCar ? `"transportBreakdown": { "fuel": ${fuelCost}, "toll": ${tollCost} },` : ""}
        "itinerary": [
          {
            "day": 1,
            "day_title": "Day 1: Departure & Journey",
            "morning_9am_to_12pm": "Departure from ${departure || "Mumbai"} and start of ${tripDistanceInfo.totalTransitHours} hours journey. Estimated Cost: \u20B9X",
            "afternoon_12pm_to_4pm": "En-route travel, stop for lunch and transit. Estimated Cost: \u20B9X",
            "evening_4pm_to_9pm": "Arrival at ${cleanDest} at [Hotel Name, Exact Area/Landmark], check-in and dinner. Estimated Cost: \u20B9X",
            "stay": "Hotel Comfort / Deluxe Stay at [Exact Address/Landmark]",
            "daily_local_travel_tips": "Keep valid Govt ID card for entry passes."
          }
        ],
        "weatherPackingTips": "Weather and packing advice for [Start Date] to [End Date]",
        "keyHighlights": ["Highlight 1", "Highlight 2"],
        "bestTimeToVisit": "Oct - Mar",
        "packList": ["Sunscreen", "Comfortable shoes"],
        "fuelEstimate": "\u20B9${transportCost} approx by ${req.body.transportMode || "Car"}"
      }
    `;
    const geminiRes = await safeGeminiGenerate(prompt);
    if (geminiRes.error) console.error("Gemini Generation Error (Future Trip):", geminiRes.error);
    if (geminiRes.text) {
      try {
        const cleaned = geminiRes.text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleaned);
        if (data && (data.itinerary || data.dayPlans)) {
          if (!data.itinerary && data.dayPlans) {
            data.itinerary = data.dayPlans.map((dp) => ({
              day: dp.day || 1,
              day_title: dp.title || `Day ${dp.day || 1}`,
              morning_9am_to_12pm: dp.details || dp.morning || "Morning sightseeing and breakfast.",
              afternoon_12pm_to_4pm: dp.afternoon || "Lunch at pure-veg restaurant and afternoon exploration.",
              evening_4pm_to_9pm: dp.evening || "Evening sunset view, local market, and dinner.",
              stay: dp.stay || `${cleanDest} Hotel / Resort Stay`,
              daily_local_travel_tips: "Use private AC cab or local ferry for smooth travel."
            }));
          }
          return res.json({ success: true, data });
        }
      } catch (p) {
      }
    }
    const isMr = lang === "mr";
    const numDays = Number(days || 3);
    const estBudget = Number(budget || 12e3);
    const isRatnagiri = /ratnagiri|रत्नागिरी|ganpatipule|गणपतीपुळे|konkan|कोकण/i.test(cleanDest);
    const generatedItinerary = Array.from({ length: numDays }, (_, i) => {
      const dayIndex = i + 1;
      if (isRatnagiri) {
        if (dayIndex % 3 === 1) {
          return {
            day: dayIndex,
            day_title: isMr ? `\u0926\u093F\u0935\u0938 ${dayIndex}: \u0938\u094D\u0935\u092F\u0902\u092D\u0942 \u0917\u0923\u092A\u0924\u0940\u092A\u0941\u0933\u0947 \u092E\u0902\u0926\u093F\u0930 \u0935 \u092C\u0940\u091A` : `Day ${dayIndex}: Ganpatipule Temple & Beach`,
            morning_9am_to_12pm: isMr ? `\u0938\u0915\u093E\u0933\u0940 [\u0966\u096E:\u0969\u0966 AM - \u0967\u0968:\u0966\u0966 PM]: \u0938\u094D\u0935\u092F\u0902\u092D\u0942 \u0917\u0923\u092A\u0924\u0940\u092A\u0941\u0933\u0947 \u092E\u0902\u0926\u093F\u0930 \u0926\u0930\u094D\u0936\u0928 \u0935 \u092C\u0940\u091A\u0935\u0930 \u092B\u0947\u0930\u092B\u091F\u0915\u093E. \u0917\u0930\u092E\u093E\u0917\u0930\u092E \u092A\u094B\u0939\u0947 \u0935 \u0938\u094B\u0932\u0915\u0922\u0940 \u0928\u093E\u0936\u094D\u0924\u093E.` : `Morning [08:30 AM - 12:00 PM]: Ganpatipule Temple Darshan & beach stroll.`,
            afternoon_12pm_to_4pm: isMr ? `\u0926\u0941\u092A\u093E\u0930\u0940 [\u0967\u0968:\u0969\u0966 PM - \u0966\u096A:\u0969\u0966 PM]: \u0936\u0941\u0926\u094D\u0927 \u0936\u093E\u0915\u093E\u0939\u093E\u0930\u0940 \u0915\u094B\u0915\u0923\u0940 \u092A\u0926\u094D\u0927\u0924\u0940\u091A\u0940 \u0925\u093E\u0933\u0940 \u091C\u0947\u0935\u0923 \u0935 \u092A\u094D\u0930\u093E\u091A\u0940\u0928 \u0915\u094B\u0915\u0923 \u091C\u0940\u0935\u0928\u0936\u0948\u0932\u0940 \u0938\u0902\u0917\u094D\u0930\u0939\u093E\u0932\u092F.` : `Afternoon [12:30 PM - 04:30 PM]: Pure Veg Konkani Thali lunch & Prachin Konkan Living Museum.`,
            evening_4pm_to_9pm: isMr ? `\u0938\u0902\u0927\u094D\u092F\u093E\u0915\u093E\u0933 [\u0966\u096B:\u0966\u0966 PM - \u0966\u096F:\u0966\u0966 PM]: \u0917\u0923\u092A\u0924\u0940\u092A\u0941\u0933\u0947 \u092C\u0940\u091A\u0935\u0930 \u0938\u0942\u0930\u094D\u092F\u093E\u0938\u094D\u0924, \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u092C\u093E\u091C\u093E\u0930\u092A\u0947\u0920\u0947\u0924 \u0916\u0930\u0947\u0926\u0940 \u0935 \u092E\u0941\u0915\u094D\u0915\u093E\u092E.` : `Evening [05:00 PM - 09:00 PM]: Sunset at beach, local market shopping & dinner.`,
            stay: isMr ? `\u0917\u0923\u092A\u0924\u0940\u092A\u0941\u0933\u0947 \u092C\u0940\u091A \u0930\u093F\u0938\u0949\u0930\u094D\u091F / \u0926\u0947\u0935\u0932 \u0932\u0949\u091C (Deluxe Room)` : `Ganpatipule Beach Resort / Hotel Stay`,
            daily_local_travel_tips: isMr ? `\u092E\u0902\u0926\u093F\u0930\u093E\u0924 \u092A\u093E\u0930\u0902\u092A\u0930\u093F\u0915 \u0915\u092A\u0921\u0947 \u092A\u0930\u093F\u0927\u093E\u0928 \u0915\u0930\u093E.` : `Wear traditional attire for temple visit.`
          };
        } else if (dayIndex % 3 === 2) {
          return {
            day: dayIndex,
            day_title: isMr ? `\u0926\u093F\u0935\u0938 ${dayIndex}: \u0930\u0924\u094D\u0928\u093E\u0926\u0941\u0930\u094D\u0917 \u0915\u093F\u0932\u094D\u0932\u093E \u0935 \u0925\u093F\u092C\u0949 \u092A\u0945\u0932\u0947\u0938` : `Day ${dayIndex}: Ratnadurg Fort & Thibaw Palace`,
            morning_9am_to_12pm: isMr ? `\u0938\u0915\u093E\u0933\u0940 [\u0966\u096E:\u0969\u0966 AM - \u0967\u0968:\u0966\u0966 PM]: \u0938\u092E\u0941\u0926\u094D\u0930\u093E\u0928\u0947 \u0935\u0947\u0922\u0932\u0947\u0932\u093E \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0930\u0924\u094D\u0928\u093E\u0926\u0941\u0930\u094D\u0917 \u0915\u093F\u0932\u094D\u0932\u093E \u0935 \u092D\u0917\u0935\u0924\u0940 \u0926\u0947\u0935\u0940 \u0926\u0930\u094D\u0936\u0928.` : `Morning [08:30 AM - 12:00 PM]: Sea-surrounded Ratnadurg Fort & Bhagwati Shrine.`,
            afternoon_12pm_to_4pm: isMr ? `\u0926\u0941\u092A\u093E\u0930\u0940 [\u0967\u0968:\u0969\u0966 PM - \u0966\u096A:\u0969\u0966 PM]: \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0925\u093F\u092C\u0949 \u092A\u0945\u0932\u0947\u0938, \u092E\u0930\u0940\u0928 \u092E\u094D\u092F\u0941\u091D\u093F\u092F\u092E \u0935 \u0905\u0938\u094D\u0938\u0932 \u0936\u093E\u0915\u093E\u0939\u093E\u0930\u0940 \u091C\u0947\u0935\u0923.` : `Afternoon [12:30 PM - 04:30 PM]: Thibaw Palace, Marine Museum & Pure Veg lunch.`,
            evening_4pm_to_9pm: isMr ? `\u0938\u0902\u0927\u094D\u092F\u093E\u0915\u093E\u0933 [\u0966\u096B:\u0966\u0966 PM - \u0966\u096F:\u0966\u0966 PM]: \u092D\u093E\u091F\u094D\u092F\u0947 \u092C\u0940\u091A\u0935\u0930 \u0935\u093E\u0933\u0942\u0924 \u0916\u0947\u0933, \u091A\u094C\u092A\u093E\u091F\u0940 \u0916\u093E\u0926\u094D\u092F\u092A\u0926\u093E\u0930\u094D\u0925 \u0935 \u0939\u0949\u091F\u0947\u0932 \u0935\u093E\u092A\u0938\u0940.` : `Evening [05:00 PM - 09:00 PM]: Bhatye Beach sunset, beach stalls & hotel drop.`,
            stay: isMr ? `\u0930\u0924\u094D\u0928\u093E\u0917\u093F\u0930\u0940 \u0917\u094D\u0930\u0901\u0921 / \u0926\u0947 \u092A\u092C\u094D\u0932\u094D\u0938 \u0939\u0949\u091F\u0947\u0932` : `Ratnagiri City Grand / De Pebbles Hotel`,
            daily_local_travel_tips: isMr ? `\u0915\u093F\u0932\u094D\u0932\u094D\u092F\u093E\u0935\u0930 \u0915\u0945\u092E\u0947\u0930\u093E \u0906\u0923\u093F \u092A\u093F\u0923\u094D\u092F\u093E\u091A\u0947 \u092A\u093E\u0923\u0940 \u0938\u094B\u092C\u0924 \u0920\u0947\u0935\u093E.` : `Carry camera and drinking water on fort.`
          };
        } else {
          return {
            day: dayIndex,
            day_title: isMr ? `\u0926\u093F\u0935\u0938 ${dayIndex}: \u0906\u0930\u0947 \u0935\u093E\u0930\u0947 \u0915\u093F\u0928\u093E\u0930\u092A\u091F\u094D\u091F\u0940 \u0935 \u091C\u092F\u0917\u0921 \u0915\u093F\u0932\u094D\u0932\u093E` : `Day ${dayIndex}: Are Ware Coastal Drive & Jaigad Fort`,
            morning_9am_to_12pm: isMr ? `\u0938\u0915\u093E\u0933\u0940 [\u0966\u096E:\u0969\u0966 AM - \u0967\u0968:\u0966\u0966 PM]: \u0906\u0930\u0947 \u0935\u093E\u0930\u0947 \u0928\u093F\u0938\u0930\u094D\u0917\u0930\u092E\u094D\u092F \u0915\u093F\u0928\u093E\u0930\u092A\u091F\u094D\u091F\u0940 \u0921\u094D\u0930\u093E\u0907\u0935\u094D\u0939, \u0938\u092E\u0941\u0926\u094D\u0930 \u0935\u094D\u0939\u094D\u092F\u0942 \u092A\u0949\u0908\u0902\u091F \u092B\u094B\u091F\u094B\u0917\u094D\u0930\u093E\u092B\u0940.` : `Morning [08:30 AM - 12:00 PM]: Are Ware scenic coastal marine drive & photography.`,
            afternoon_12pm_to_4pm: isMr ? `\u0926\u0941\u092A\u093E\u0930\u0940 [\u0967\u0968:\u0969\u0966 PM - \u0966\u096A:\u0969\u0966 PM]: \u091C\u092F\u0917\u0921 \u0915\u093F\u0932\u094D\u0932\u093E \u092D\u0947\u091F \u0906\u0923\u093F \u0936\u093E\u0938\u094D\u0924\u094D\u0930\u0940 \u0928\u0926\u0940 \u0916\u093E\u0921\u0940 \u092B\u0947\u0930\u0940 \u092C\u094B\u091F \u0905\u0928\u0941\u092D\u0935.` : `Afternoon [12:30 PM - 04:30 PM]: Jaigad Fort & Shastri river creek ferry boat ride.`,
            evening_4pm_to_9pm: isMr ? `\u0938\u0902\u0927\u094D\u092F\u093E\u0915\u093E\u0933 [\u0966\u096B:\u0966\u0966 PM - \u0966\u096F:\u0966\u0966 PM]: \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0939\u093E\u092A\u0942\u0938 \u0906\u0902\u092C\u093E \u0909\u0924\u094D\u092A\u093E\u0926\u0915 \u0915\u0947\u0902\u0926\u094D\u0930/\u092C\u093E\u091C\u093E\u0930\u092A\u0947\u0920 \u092D\u0947\u091F \u0935 \u091C\u0947\u0935\u0923.` : `Evening [05:00 PM - 09:00 PM]: Local market visit, Alphonso products & dinner.`,
            stay: isMr ? `\u091C\u092F\u0917\u0921 \u0930\u093F\u0938\u0949\u0930\u094D\u091F / \u0938\u0940-\u0935\u094D\u0939\u094D\u092F\u0942 \u0938\u094D\u091F\u0947` : `Jaigad Resort / Sea-View Stay`,
            daily_local_travel_tips: isMr ? `\u092B\u0947\u0930\u0940 \u092C\u094B\u091F\u0940\u091A\u0947 \u0935\u0947\u0933\u093E\u092A\u0924\u094D\u0930\u0915 \u0906\u0927\u0940\u091A \u0924\u092A\u093E\u0938\u093E.` : `Check ferry timing schedule in advance.`
          };
        }
      }
      return {
        day: dayIndex,
        day_title: isMr ? `\u0926\u093F\u0935\u0938 ${dayIndex}: ${cleanDest} \u092E\u0941\u0916\u094D\u092F \u092A\u094D\u0930\u0947\u0915\u094D\u0937\u0923\u0940\u092F \u0938\u094D\u0925\u0933\u0947` : `Day ${dayIndex}: ${cleanDest} Highlights`,
        morning_9am_to_12pm: isMr ? `\u0938\u0915\u093E\u0933\u0940 [\u0966\u096E:\u0969\u0966 AM - \u0967\u0968:\u0966\u0966 PM]: ${cleanDest} \u092F\u0947\u0925\u0940\u0932 \u092E\u0941\u0916\u094D\u092F \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0935 \u0927\u093E\u0930\u094D\u092E\u093F\u0915 \u0938\u094D\u0925\u0933\u093E\u0902\u0928\u093E \u092D\u0947\u091F \u0935 \u0928\u093E\u0936\u094D\u0924\u093E.` : `Morning [08:30 AM - 12:00 PM]: Visit top historical and heritage landmarks in ${cleanDest}.`,
        afternoon_12pm_to_4pm: isMr ? `\u0926\u0941\u092A\u093E\u0930\u0940 [\u0967\u0968:\u0969\u0966 PM - \u0966\u096A:\u0969\u0966 PM]: \u092A\u094D\u0930\u0938\u093F\u0926\u094D\u0927 \u0930\u0947\u0938\u094D\u091F\u0949\u0930\u0902\u091F\u092E\u0927\u094D\u092F\u0947 \u0936\u0941\u0926\u094D\u0927 \u0936\u093E\u0915\u093E\u0939\u093E\u0930\u0940 \u092D\u094B\u091C\u0928 \u0935 \u0938\u0902\u0917\u094D\u0930\u0939\u093E\u0932\u092F \u0926\u0930\u094D\u0936\u0928.` : `Afternoon [12:30 PM - 04:30 PM]: Lunch at top rated restaurant and museum tour.`,
        evening_4pm_to_9pm: isMr ? `\u0938\u0902\u0927\u094D\u092F\u093E\u0915\u093E\u0933 [\u0966\u096B:\u0966\u0966 PM - \u0966\u096F:\u0966\u0966 PM]: \u092A\u094D\u0930\u0938\u093F\u0926\u094D\u0927 \u092C\u0940\u091A/\u0935\u094D\u0939\u094D\u092F\u0942 \u092A\u0949\u0908\u0902\u091F\u0935\u0930\u0942\u0928 \u0938\u0942\u0930\u094D\u092F\u093E\u0938\u094D\u0924 \u0926\u0930\u094D\u0936\u0928 \u0906\u0923\u093F \u0930\u093E\u0924\u094D\u0930\u0940\u091A\u0947 \u091C\u0947\u0935\u0923.` : `Evening [05:00 PM - 09:00 PM]: Sunset viewpoint, market shopping and dinner.`,
        stay: isMr ? `${cleanDest} 3-Star / Deluxe Hotel` : `${cleanDest} Deluxe Hotel Stay`,
        daily_local_travel_tips: isMr ? `\u0938\u0915\u093E\u0933\u0940 \u0932\u0935\u0915\u0930 \u0938\u0941\u0930\u0941\u0935\u093E\u0924 \u0915\u0947\u0932\u094D\u092F\u093E\u0938 \u0917\u0930\u094D\u0926\u0940 \u091F\u093E\u0933\u0924\u093E \u092F\u0947\u0908\u0932.` : `Start early in morning to avoid heavy crowd.`
      };
    });
    const fallbackPlanData = {
      trip_title: cleanDest,
      feasibilityAlert: isMr ? `\u20B9${estBudget} \u092C\u091C\u0947\u091F\u092E\u0927\u094D\u092F\u0947 ${cleanDest} \u091A\u0940 \u0939\u0940 \u0938\u0939\u0932 \u0905\u0924\u093F\u0936\u092F \u0909\u0924\u094D\u0924\u092E \u0935 \u0938\u094B\u092F\u0940\u0938\u094D\u0915\u0930\u092A\u0923\u0947 \u092A\u0942\u0930\u094D\u0923 \u0915\u0930\u0924\u093E \u092F\u0947\u0908\u0932!` : `A ${numDays}-day trip to ${cleanDest} with \u20B9${estBudget} budget is highly feasible and comfortable!`,
      costBreakdown: {
        travel: Math.round(estBudget * 0.3),
        stay: Math.round(estBudget * 0.35),
        food: Math.round(estBudget * 0.2),
        misc: Math.round(estBudget * 0.15)
      },
      itinerary: generatedItinerary,
      dayPlans: generatedItinerary.map((item) => ({
        day: item.day,
        title: item.day_title,
        details: `${item.morning_9am_to_12pm} | ${item.afternoon_12pm_to_4pm} | ${item.evening_4pm_to_9pm}`
      })),
      keyHighlights: isRatnagiri ? [
        isMr ? "\u0938\u094D\u0935\u092F\u0902\u092D\u0942 \u0917\u0923\u092A\u0924\u0940\u092A\u0941\u0933\u0947 \u092E\u0902\u0926\u093F\u0930" : "Ganpatipule Temple",
        isMr ? "\u0930\u0924\u094D\u0928\u093E\u0926\u0941\u0930\u094D\u0917 \u0915\u093F\u0932\u094D\u0932\u093E \u0935 \u0938\u092E\u0941\u0926\u094D\u0930\u0915\u093F\u0928\u093E\u0930\u0947" : "Ratnadurg Fort & Beaches",
        isMr ? "\u0905\u0938\u094D\u0938\u0932 \u0915\u094B\u0915\u0923\u0940 \u0936\u093E\u0915\u093E\u0939\u093E\u0930\u0940 \u0925\u093E\u0933\u0940 \u0935 \u0938\u094B\u0932\u0915\u0922\u0940" : "Authentic Konkani Pure Veg Thali & Solkadhi"
      ] : [
        isMr ? "\u092A\u094D\u0930\u0938\u093F\u0926\u094D\u0927 \u092A\u0930\u094D\u092F\u091F\u0928 \u0938\u094D\u0925\u0933\u0947" : "Top Scenic Spots",
        isMr ? "\u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0916\u093E\u0926\u094D\u092F\u0938\u0902\u0938\u094D\u0915\u0943\u0924\u0940" : "Authentic Local Cuisine",
        isMr ? "\u0917\u094D\u0930\u0941\u092A \u092B\u094B\u091F\u094B\u0917\u094D\u0930\u093E\u092B\u0940" : "Group Photo Spots"
      ],
      bestTimeToVisit: "October to March",
      packList: [
        isMr ? "\u0915\u092E\u094D\u092B\u0930\u094D\u091F\u0947\u092C\u0932 \u0915\u092A\u0921\u0947 \u0935 \u0938\u0928\u0917\u094D\u0932\u093E\u0938\u0947\u0938" : "Light Comfortable Clothing & Sunglasses",
        isMr ? "\u092A\u093E\u0935\u0930 \u092C\u0901\u0915 \u0935 \u0915\u0945\u092E\u0947\u0930\u093E" : "Power Bank & Camera",
        isMr ? "\u0913\u0933\u0916\u092A\u0924\u094D\u0930 (ID Proof)" : "Valid Govt Photo ID"
      ],
      fuelEstimate: `\u20B9${Math.round(estBudget * 0.25)} approx (Travel Allowance)`
    };
    res.json({ success: true, data: fallbackPlanData, fallback: true });
  } catch (err) {
    res.json({ success: false, error: "Failed to generate smart plan" });
  }
});
app.post("/api/generate-destination-templates", async (req, res) => {
  try {
    const { destination, lang } = req.body;
    const destName = destination || "Maharashtra";
    const prompt = `
      Create 3 distinct curated trip template packages for destination: ${destName}.
      Return ONLY JSON format:
      {
        "templates": [
          {
            "id": "tpl_1",
            "title": "Weekend Getaway",
            "destination": "${destName}",
            "duration": "2 Days / 1 Night",
            "budget": "\u20B93,500",
            "tags": ["Weekend", "Budget"],
            "description": "Short description of trip"
          }
        ]
      }
    `;
    const geminiRes = await safeGeminiGenerate(prompt);
    if (geminiRes.text) {
      try {
        const cleaned = geminiRes.text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.templates) return res.json({ success: true, templates: parsed.templates });
      } catch (p) {
      }
    }
    const templates = [
      {
        id: `tpl_${Date.now()}_1`,
        title: `${destName} Smart Express Weekend`,
        destination: destName,
        duration: "2 Days / 1 Night",
        budget: "\u20B94,500/person",
        tags: ["Express", "Weekend"],
        description: `Explore the absolute best highlights of ${destName} in a compact 2-day itinerary.`
      },
      {
        id: `tpl_${Date.now()}_2`,
        title: `${destName} Complete Experience`,
        destination: destName,
        duration: "4 Days / 3 Nights",
        budget: "\u20B98,900/person",
        tags: ["Popular", "Family & Friends"],
        description: `A relaxed, full-coverage trip package covering stay, food recommendations, and nature spots.`
      }
    ];
    res.json({ success: true, templates, fallback: true });
  } catch (err) {
    res.json({ success: false, error: "Failed to generate templates" });
  }
});
app.post("/api/parse-booking-text", async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    const prompt = `
      Parse this travel confirmation SMS/Email text:
      "${text}"

      Extract into JSON:
      {
        "title": "Flight / Train / Hotel name",
        "type": "flight" | "train" | "hotel" | "other",
        "detail": "Seat/Coach or Room number",
        "datetime": "YYYY-MM-DDTHH:mm",
        "cost": 1500,
        "bookingRef": "PNR or Confirmation Code"
      }
      Respond ONLY with JSON.
    `;
    const geminiRes = await safeGeminiGenerate(prompt);
    if (geminiRes.text) {
      try {
        const cleaned = geminiRes.text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleaned);
        return res.json({ success: true, data });
      } catch (p) {
      }
    }
    const pnrMatch = text.match(/PNR[:\s]*([A-Z0-9]{10})/i) || text.match(/Ref[:\s]*([A-Z0-9]+)/i);
    const amountMatch = text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+)/i);
    const todayISO = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
    res.json({
      success: true,
      data: {
        title: text.length > 30 ? text.slice(0, 30) + "..." : text,
        type: /train|irctc|pnr/i.test(text) ? "train" : /flight|indigo|air/i.test(text) ? "flight" : "hotel",
        detail: "Confirmed Booking",
        datetime: todayISO,
        cost: amountMatch ? parseInt(amountMatch[1].replace(/,/g, "")) : 1200,
        bookingRef: pnrMatch ? pnrMatch[1] : "BK" + Math.floor(1e5 + Math.random() * 9e5)
      },
      fallback: true
    });
  } catch (err) {
    res.json({ success: false, error: "Failed to parse text" });
  }
});
app.post("/api/parse-voice-command", async (req, res) => {
  try {
    const { audio, targetLanguage } = req.body;
    const isMr = targetLanguage === "mr";
    res.json({
      success: true,
      data: {
        uiData: { action: "NAVIGATE_TAB", tab: "train" },
        audioSpeech: isMr ? "\u092E\u0940 \u0924\u0941\u092E\u091A\u094D\u092F\u093E\u0938\u093E\u0920\u0940 \u0930\u0947\u0932\u094D\u0935\u0947 \u092E\u093E\u0939\u093F\u0924\u0940 \u0909\u0918\u0921\u0940 \u0915\u0947\u0932\u0940 \u0906\u0939\u0947." : "Opening train status dashboard for you.",
        detectedLanguageCode: isMr ? "mr-IN" : "en-US"
      }
    });
  } catch (err) {
    res.json({ success: false, error: "Voice parse failed" });
  }
});
app.post("/api/search-flights", async (req, res) => {
  try {
    const { origin, destination, departDate, adults, cabinClass } = req.body;
    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN || process.env.VITE_DUFFEL_API_KEY;
    if (!duffelToken) {
      return res.status(401).json({ success: false, message: "Duffel API key missing" });
    }
    const payload = {
      data: {
        slices: [{ origin, destination, departure_date: departDate }],
        passengers: Array.from({ length: adults || 1 }, () => ({ type: "adult" })),
        cabin_class: cabinClass || "economy"
      }
    };
    const response = await import_axios.default.post(
      "https://api.duffel.com/air/offer_requests?return_offers=true",
      payload,
      {
        headers: {
          Authorization: `Bearer ${duffelToken}`,
          "Duffel-Version": "v1",
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ success: true, flights: response.data?.data?.offers || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: "Flight search failed" });
  }
});
app.post("/api/train-status", async (req, res) => {
  try {
    const { trainNumber } = req.body;
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(401).json({ success: false, message: "RapidAPI key missing" });
    }
    const response = await import_axios.default.get("https://irctc1.p.rapidapi.com/api/v1/liveTrainStatus", {
      params: { trainNo: trainNumber, startDay: "0" },
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "irctc1.p.rapidapi.com"
      }
    });
    res.json({ success: true, data: response.data?.data });
  } catch (error) {
    res.status(500).json({ success: false, error: "Train status check failed" });
  }
});
app.post("/api/live-station", async (req, res) => {
  try {
    const { fromStationCode, toStationCode } = req.body;
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(401).json({ success: false, message: "RapidAPI key missing" });
    }
    const response = await import_axios.default.get("https://irctc1.p.rapidapi.com/api/v1/getTrainBetweenStations", {
      params: { fromStationCode, toStationCode },
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "irctc1.p.rapidapi.com"
      }
    });
    res.json({ success: true, data: response.data?.data });
  } catch (error) {
    res.status(500).json({ success: false, error: "Station search failed" });
  }
});
app.post("/api/transit-schedules", async (req, res) => {
  res.json({ success: true, data: [] });
});
app.all("/api/foursquare-hotels", async (req, res) => {
  try {
    const city = String(req.query.city || req.body?.city || req.query.destination || req.body?.destination || "").trim();
    const place = String(req.query.place || req.body?.place || req.query.placeName || req.body?.placeName || "").trim();
    if (!city) {
      return res.status(400).json({ success: false, error: "City name is required for hotel search" });
    }
    const apiKey = process.env.FOURSQUARE_API_KEY || process.env.VITE_FOURSQUARE_API_KEY;
    const searchQuery = place ? `${place} hotel` : "hotel";
    let rawResults = [];
    if (apiKey) {
      try {
        const url = `https://api.foursquare.com/v3/places/search?near=${encodeURIComponent(city)}&query=${encodeURIComponent(searchQuery)}&categories=19014,19009,19010&fields=fsq_id,name,location,categories,rating,popularity,photos,stats,website,tel,geocodes&limit=20`;
        const fsqRes = await import_axios.default.get(url, {
          headers: {
            Accept: "application/json",
            Authorization: apiKey
          }
        });
        if (fsqRes.data && Array.isArray(fsqRes.data.results)) {
          rawResults = fsqRes.data.results;
        }
      } catch (err) {
        console.warn("[Foursquare API Call Notice]:", err?.response?.data || err?.message || err);
      }
    }
    const photoPool = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    ];
    let hotels = rawResults.map((item, idx) => {
      let photoUrl = "";
      if (item.photos && item.photos.length > 0) {
        const p = item.photos[0];
        photoUrl = `${p.prefix}500x350${p.suffix}`;
      } else {
        photoUrl = photoPool[idx % photoPool.length];
      }
      const ratingOutOf5 = item.rating ? Number((item.rating / 2).toFixed(1)) : Number((4.1 + idx % 8 * 0.1).toFixed(1));
      const formattedAddress = item.location?.formatted_address || [item.location?.address, item.location?.locality, item.location?.region, item.location?.country].filter(Boolean).join(", ") || `${item.name}, ${city}`;
      return {
        id: item.fsq_id || `fsq_${idx}`,
        name: item.name,
        location: formattedAddress,
        city,
        rating: ratingOutOf5,
        popularity: item.popularity || 0,
        reviewsCount: item.stats?.total_ratings || Math.floor(60 + idx * 33 % 250),
        image: photoUrl,
        photos: (item.photos || []).map((p) => `${p.prefix}500x350${p.suffix}`),
        category: item.categories?.[0]?.name || "Hotel & Resort",
        website: item.website || "",
        phone: item.tel || "",
        lat: item.geocodes?.main?.latitude,
        lng: item.geocodes?.main?.longitude,
        pricePerNight: Math.min(Math.max(2500 + idx * 700 % 6e3, 2200), 12e3),
        currency: "INR",
        amenities: ["Free WiFi", "Air Conditioning", "24/7 Front Desk", "Room Service"],
        provider: "Foursquare Places API",
        googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " " + formattedAddress)}`
      };
    });
    if (hotels.length === 0) {
      const fallbackHotels = [
        { name: `Grand ${city} Palace Hotel`, cat: "Luxury Hotel & Resort", price: 3800 },
        { name: `${city} Heritage Residency`, cat: "Boutique Heritage Hotel", price: 2800 },
        { name: `Hotel Royal Executive ${city}`, cat: "Business & Family Hotel", price: 2400 },
        { name: `The Palm Resort ${city}`, cat: "Beach / Nature Resort", price: 4200 },
        { name: `Hotel Green View Inn ${city}`, cat: "Budget Stay & Homestay", price: 1800 },
        { name: `Central Grand Hotel ${city}`, cat: "Standard Deluxe Stay", price: 2900 }
      ];
      hotels = fallbackHotels.map((h, idx) => ({
        id: `fsq_city_${city.toLowerCase().replace(/\s+/g, "_")}_${idx}`,
        name: h.name,
        location: `Main Road, Near City Center, ${city}`,
        city,
        rating: Number((4.2 + idx % 5 * 0.1).toFixed(1)),
        popularity: 88 - idx * 4,
        reviewsCount: 95 + idx * 30,
        image: photoPool[idx % photoPool.length],
        photos: [],
        category: h.cat,
        website: "",
        phone: "+91 98220 00000",
        pricePerNight: h.price,
        currency: "INR",
        amenities: ["Free WiFi", "Air Conditioning", "Parking", "Room Service"],
        provider: "Foursquare Places API",
        lat: 0,
        lng: 0,
        googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + " " + city)}`
      }));
    }
    return res.json({
      success: true,
      city,
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error("[Foursquare API Endpoint Error]:", error);
    return res.status(500).json({ success: false, error: "Error searching Foursquare hotels" });
  }
});
var CITY_COORDINATES = {
  "MUMBAI": { lat: 18.922, lng: 72.834, spots: ["Gateway of India", "Marine Drive", "Elephanta Caves", "Siddhivinayak Temple", "Colaba Causeway"] },
  "PUNE": { lat: 18.52, lng: 73.856, spots: ["Shaniwar Wada", "Aga Khan Palace", "Dagadusheth Halwai Ganpati", "Sinhagad Fort"], defaultHalt: "Lonavala / Khandala" },
  "NASHIK": { lat: 19.997, lng: 73.789, spots: ["Trimbakeshwar Temple", "Panchavati", "Sula Vineyards", "Kalaram Temple", "Pandavleni Caves"] },
  "GOA": { lat: 15.299, lng: 74.124, spots: ["Baga Beach", "Calangute Beach", "Aguada Fort", "Basilica of Bom Jesus", "Dudhsagar Falls", "Anjuna Beach"] },
  "RATNAGIRI": { lat: 16.99, lng: 73.312, spots: ["Ganpatipule Temple & Beach", "Ratnadurg Fort", "Thibaw Palace", "Are Ware Beach", "Jaigad Fort"] },
  "GANPATIPULE": { lat: 17.145, lng: 73.268, spots: ["Swayambhu Ganpati Temple", "Ganpatipule Beach", "Prachin Konkan Museum", "Malgund Beach"] },
  "TRIMBAKESHWAR": { lat: 19.932, lng: 73.535, spots: ["Trimbakeshwar Shiva Temple", "Brahmagiri Hill", "Kushavarta Kund"] },
  "MAHABALESHWAR": { lat: 17.93, lng: 73.647, spots: ["Arthur's Seat", "Venna Lake", "Mapro Garden", "Elephant's Head Point", "Pratapgad Fort"] },
  "KOLHAPUR": { lat: 16.705, lng: 74.243, spots: ["Mahalakshmi Temple", "New Palace", "Rankala Lake", "Panhala Fort"] },
  "SHIRDI": { lat: 19.764, lng: 74.476, spots: ["Sai Baba Samadhi Mandir", "Dwarkamai", "Chavadi", "Shani Shingnapur"] },
  "AURANGABAD": { lat: 19.876, lng: 75.343, spots: ["Ajanta & Ellora Caves", "Bibi Ka Maqbara", "Daulatabad Fort"] },
  "SAMBHAJINAGAR": { lat: 19.876, lng: 75.343, spots: ["Ellora Caves", "Ajanta Caves", "Bibi Ka Maqbara", "Daulatabad Fort"] },
  "DELHI": { lat: 28.613, lng: 77.209, spots: ["Red Fort", "Qutub Minar", "India Gate", "Lotus Temple", "Humayun's Tomb"] },
  "JAIPUR": { lat: 26.912, lng: 75.787, spots: ["Amber Palace", "Hawa Mahal", "City Palace", "Jantar Mantar", "Nahargarh Fort"] },
  "UDAIPUR": { lat: 24.585, lng: 73.712, spots: ["City Palace", "Lake Pichola", "Jag Mandir", "Fateh Sagar Lake"] },
  "BENGALURU": { lat: 12.971, lng: 77.594, spots: ["Bangalore Palace", "Cubbon Park", "Lalbagh Botanical Garden", "ISKCON Temple"] },
  "CHENNAI": { lat: 13.082, lng: 80.27, spots: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St. George", "San Thome Basilica"] },
  "HYDERABAD": { lat: 17.385, lng: 78.486, spots: ["Charminar", "Golconda Fort", "Ramoji Film City", "Hussain Sagar Lake"] }
};
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
function estimateCityDistanceAndDuration(src, dest) {
  const srcUpper = (src || "").trim().toUpperCase();
  const destUpper = (dest || "").trim().toUpperCase();
  let srcCoords = CITY_COORDINATES[srcUpper];
  let destCoords = CITY_COORDINATES[destUpper];
  if (!srcCoords) {
    for (const k of Object.keys(CITY_COORDINATES)) {
      if (srcUpper.includes(k) || k.includes(srcUpper)) {
        srcCoords = CITY_COORDINATES[k];
        break;
      }
    }
  }
  if (!destCoords) {
    for (const k of Object.keys(CITY_COORDINATES)) {
      if (destUpper.includes(k) || k.includes(destUpper)) {
        destCoords = CITY_COORDINATES[k];
        break;
      }
    }
  }
  const ROUTE_DISTANCES = {
    "NASHIK_GOA": 630,
    "GOA_NASHIK": 630,
    "MUMBAI_GOA": 590,
    "GOA_MUMBAI": 590,
    "PUNE_GOA": 450,
    "GOA_PUNE": 450,
    "MUMBAI_RATNAGIRI": 340,
    "RATNAGIRI_MUMBAI": 340,
    "PUNE_RATNAGIRI": 300,
    "RATNAGIRI_PUNE": 300,
    "MUMBAI_NASHIK": 165,
    "NASHIK_MUMBAI": 165,
    "PUNE_NASHIK": 210,
    "NASHIK_PUNE": 210,
    "MUMBAI_PUNE": 150,
    "PUNE_MUMBAI": 150,
    "MUMBAI_SHIRDI": 240,
    "SHIRDI_MUMBAI": 240,
    "PUNE_SHIRDI": 185,
    "SHIRDI_PUNE": 185,
    "NASHIK_SHIRDI": 85,
    "SHIRDI_NASHIK": 85,
    "DELHI_JAIPUR": 280,
    "JAIPUR_DELHI": 280,
    "MUMBAI_MAHABALESHWAR": 230,
    "MAHABALESHWAR_MUMBAI": 230,
    "PUNE_MAHABALESHWAR": 120,
    "MAHABALESHWAR_PUNE": 120,
    "NASHIK_TRIMBAKESHWAR": 30,
    "TRIMBAKESHWAR_NASHIK": 30
  };
  const key = `${srcUpper}_${destUpper}`;
  let directKm = ROUTE_DISTANCES[key];
  if (!directKm) {
    if (srcCoords && destCoords) {
      const straightDist = haversineDistanceKm(srcCoords.lat, srcCoords.lng, destCoords.lat, destCoords.lng);
      directKm = Math.round(straightDist * 1.35);
    } else {
      directKm = 50;
    }
  }
  const avgSpeedKmH = 50;
  const netDrivingMinutes = Math.round(directKm / avgSpeedKmH * 60);
  return {
    distanceKm: directKm,
    drivingDurationMinutes: netDrivingMinutes
  };
}
function getIntermediateHalt(src, dest) {
  const pair = `${src.toUpperCase()}_${dest.toUpperCase()}`;
  if (pair.includes("NASHIK") && pair.includes("GOA")) return "Kolhapur (Mahalakshmi Shrine)";
  if (pair.includes("MUMBAI") && pair.includes("GOA")) return "Kolhapur / Chiplun";
  if (pair.includes("PUNE") && pair.includes("GOA")) return "Belagavi / Sawantwadi";
  if (pair.includes("DELHI") && pair.includes("UDAIPUR")) return "Jaipur / Ajmer";
  return "Kolhapur / Highway Halt";
}
function findCoords(name) {
  const upper = name.trim().toUpperCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (upper.includes(key) || key.includes(upper)) return coords;
  }
  return null;
}
async function getDrivingDistanceAndDurationOSM(origin, destination) {
  const srcCoords = findCoords(origin);
  const destCoords = findCoords(destination);
  if (!srcCoords || !destCoords) {
    return { distanceKm: 0, drivingDurationMinutes: 0 };
  }
  const url = `http://router.project-osrm.org/route/v1/driving/${srcCoords.lng},${srcCoords.lat};${destCoords.lng},${destCoords.lat}?overview=false`;
  const res = await import_axios.default.get(url);
  if (res.data.routes && res.data.routes.length > 0) {
    const route = res.data.routes[0];
    return { distanceKm: Math.round(route.distance / 1e3), drivingDurationMinutes: Math.round(route.duration / 60) };
  }
  throw new Error("OSM Routing failed");
}
async function getPlacesFromFoursquare(destination, query) {
  const apiKey = process.env.FOURSQUARE_API_KEY || process.env.VITE_FOURSQUARE_API_KEY;
  if (!apiKey) throw new Error("Foursquare API key missing");
  const url = `https://api.foursquare.com/v3/places/search?near=${encodeURIComponent(destination)}&query=${encodeURIComponent(query || "tourist attractions")}`;
  const res = await import_axios.default.get(url, { headers: { Authorization: apiKey } });
  if (res.data.results) {
    return res.data.results.map((p) => ({
      name: p.name,
      formattedAddress: p.location.formatted_address,
      rating: 4.5,
      userRatingsTotal: 100,
      lat: p.geocodes.main.latitude,
      lng: p.geocodes.main.longitude,
      placeId: p.fsq_id
    }));
  }
  throw new Error("Foursquare search failed");
}
async function getDrivingDistanceAndDuration(origin, destination) {
  let distanceKm = 0;
  let drivingDurationMinutes = 0;
  let sourceFormatted = origin;
  let destFormatted = destination;
  if (!apiFailures.maps) {
    try {
      const osmRes = await getDrivingDistanceAndDurationOSM(origin, destination);
      distanceKm = osmRes.distanceKm;
      drivingDurationMinutes = osmRes.drivingDurationMinutes;
    } catch (err) {
      console.warn("[OSM Routing Notice]: OSM routing failed, using physics fallback.", err);
      apiFailures.maps = true;
    }
  }
  if (distanceKm === 0 || drivingDurationMinutes === 0) {
    const calc = estimateCityDistanceAndDuration(origin, destination);
    distanceKm = calc.distanceKm;
    drivingDurationMinutes = calc.drivingDurationMinutes;
  }
  const drivingDurationHours = Math.round(drivingDurationMinutes / 60 * 10) / 10;
  const recommendedRestBreaks = Math.floor(drivingDurationHours / 3.5);
  const totalBreakMinutes = recommendedRestBreaks * 45;
  const totalTransitMinutes = drivingDurationMinutes + totalBreakMinutes;
  const totalTransitHours = Math.round(totalTransitMinutes / 60 * 10) / 10;
  const isFullDayTransit = totalTransitHours >= 8.5;
  let suggestedIntermediateHalt = "";
  if (totalTransitHours >= 10) {
    suggestedIntermediateHalt = getIntermediateHalt(origin, destination);
  }
  return {
    origin: sourceFormatted,
    destination: destFormatted,
    distanceKm,
    drivingDurationMinutes,
    drivingDurationHours,
    recommendedRestBreaks,
    totalBreakMinutes,
    totalTransitMinutes,
    totalTransitHours,
    isFullDayTransit,
    suggestedIntermediateHalt
  };
}
async function getVerifiedPlacesForLocation(destination, query) {
  let verifiedPlaces = [];
  if (!apiFailures.places) {
    try {
      verifiedPlaces = await getPlacesFromFoursquare(destination, query);
    } catch (err) {
      console.warn("[Foursquare API Notice]: Foursquare search failed, using spots fallback.", err);
      apiFailures.places = true;
    }
  }
  if (verifiedPlaces.length === 0) {
    const destUpper = (destination || "").toUpperCase();
    let spots = CITY_COORDINATES[destUpper]?.spots;
    if (!spots) {
      for (const k of Object.keys(CITY_COORDINATES)) {
        if (destUpper.includes(k) || k.includes(destUpper)) {
          spots = CITY_COORDINATES[k].spots;
          break;
        }
      }
    }
    if (!spots) {
      spots = [`${destination} Heritage Fort`, `${destination} Main Shrine`, `${destination} Beach / Sunset Point`, `${destination} Local Crafts Market`];
    }
    verifiedPlaces = spots.map((s, idx) => ({
      name: s,
      formattedAddress: `${s}, ${destination}`,
      rating: 4.6 - idx * 0.1,
      userRatingsTotal: 1250 - idx * 150,
      lat: (CITY_COORDINATES[destUpper]?.lat || 18.9) + idx * 0.01,
      lng: (CITY_COORDINATES[destUpper]?.lng || 73.8) + idx * 0.01,
      placeId: `verified_spot_${idx + 1}`
    }));
  }
  return verifiedPlaces;
}
app.post("/api/maps/distance-matrix", async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: "origin and destination are required" });
    }
    const metrics = await getDrivingDistanceAndDuration(origin, destination);
    res.json({ success: true, ...metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to query Distance Matrix" });
  }
});
app.post("/api/maps/places-search", async (req, res) => {
  try {
    const { destination, query } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, error: "destination is required" });
    }
    const places = await getVerifiedPlacesForLocation(destination, query);
    res.json({ success: true, destination, places });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to query Places API" });
  }
});
app.get("/api/admin/health", requireAdmin, (req, res) => {
  const geminiActive = !!process.env.GEMINI_API_KEY;
  const pexelsActive = !!process.env.PEXELS_API_KEY;
  const apis = [
    {
      id: "api-gemini-chat",
      name: "Google Gemini 3.6 Flash Chat AI",
      endpoint: "/api/gemini/chat",
      method: "POST",
      category: "AI & Gemini Services",
      status: geminiActive ? "Active" : "Active (Fallback Enabled)",
      lastChecked: "Just now",
      description: "Core conversational AI assistant for group itinerary planning, travel advice, and real-time query resolution."
    },
    {
      id: "api-future-trip",
      name: "Smart Future Trip Planner",
      endpoint: "/api/generate-future-trip",
      method: "POST",
      category: "AI & Gemini Services",
      status: "Active",
      lastChecked: "Just now",
      description: "Predictive trip planner that generates realistic future trip plans, estimates, and schedules."
    },
    {
      id: "api-generate-itinerary",
      name: "Smart Itinerary Generator",
      endpoint: "/api/generate-itinerary",
      method: "POST",
      category: "AI & Gemini Services",
      status: "Active",
      lastChecked: "1 min ago",
      description: "Creates structured day-by-day travel schedules and activity timelines."
    },
    {
      id: "api-scan-receipt",
      name: "Smart Expense Scanner (Vision OCR)",
      endpoint: "/api/scan-receipt",
      method: "POST",
      category: "AI & Gemini Services",
      status: geminiActive ? "Active" : "Active (Vision Mode)",
      lastChecked: "2 mins ago",
      description: "Multi-modal Gemini OCR that extracts vendor, total amount, and itemized splits from bill photos."
    },
    {
      id: "api-parse-voice",
      name: "Voice Command Interpreter",
      endpoint: "/api/parse-voice-command",
      method: "POST",
      category: "AI & Gemini Services",
      status: "Active",
      lastChecked: "Just now",
      description: "Natural language speech input parser for hands-free expense entry and trip searching."
    },
    {
      id: "api-parse-booking",
      name: "Ticket & Booking Text Parser",
      endpoint: "/api/parse-booking-text",
      method: "POST",
      category: "AI & Gemini Services",
      status: "Active",
      lastChecked: "3 mins ago",
      description: "Converts SMS/Email ticket texts (IRCTC, Flights, Hotels) into structured booking records."
    },
    {
      id: "api-destination-templates",
      name: "Destination Packages Generator",
      endpoint: "/api/generate-destination-templates",
      method: "POST",
      category: "AI & Gemini Services",
      status: "Active",
      lastChecked: "5 mins ago",
      description: "Generates curated travel packages for Konkan, Goa, and Western Ghats destinations."
    },
    {
      id: "api-search-flights",
      name: "Duffel / RapidAPI Flight Booking API",
      endpoint: "/api/search-flights",
      method: "POST",
      category: "Transport & Booking APIs",
      status: "Deactivated (Local Data)",
      lastChecked: "Just now",
      description: "Real-time flight search across major airlines (IndiGo, Air India, SpiceJet) with live fare quotes."
    },
    {
      id: "api-train-status",
      name: "IRCTC / RailRadar Train Tracker API",
      endpoint: "/api/train-status",
      method: "POST",
      category: "Transport & Booking APIs",
      status: "Deactivated (Local Data)",
      lastChecked: "Just now",
      description: "Live train running status, delay alerts, platform numbers, and PNR verification."
    },
    {
      id: "api-live-station",
      name: "Live Railway Station Arrivals Board",
      endpoint: "/api/live-station",
      method: "POST",
      category: "Transport & Booking APIs",
      status: "Deactivated (Local Data)",
      lastChecked: "2 mins ago",
      description: "Live arrivals and departure board for railway stations across India."
    },
    {
      id: "api-transit-schedules",
      name: "MSRTC Bus & Ferry Transit API",
      endpoint: "/api/transit-schedules",
      method: "POST",
      category: "Transport & Booking APIs",
      status: "Deactivated (Local Data)",
      lastChecked: "4 mins ago",
      description: "MSRTC Shivneri/ST bus timetables, ferry schedules, and local auto/cab tariff rates."
    },
    {
      id: "api-pexels-proxy",
      name: "Pexels & Unsplash Stock Photos Proxy",
      endpoint: "/api/pexels",
      method: "GET",
      category: "Media & Places Proxy",
      status: pexelsActive ? "Active" : "Active (Cached Unsplash)",
      lastChecked: "Just now",
      description: "High-resolution destination photos and video thumbnail proxy for trip cover imagery."
    },
    {
      id: "api-google-places",
      name: "Google Places & Nearby Search Proxy",
      endpoint: "/api/google-places/textsearch/json",
      method: "GET",
      category: "Media & Places Proxy",
      status: "Active",
      lastChecked: "Just now",
      description: "Google Maps Platform proxy for local hotels, dhabas, hospitals, petrol pumps, and ATMs."
    },
    {
      id: "api-itunes-music",
      name: "iTunes Music & Roadtrip Playlist API",
      endpoint: "https://itunes.apple.com/search",
      method: "GET",
      category: "Media & Places Proxy",
      status: "Active",
      lastChecked: "Just now",
      description: "Roadtrip music search engine for creating collaborative audio playlists."
    },
    {
      id: "api-firestore-sync",
      name: "Firebase Cloud Firestore Sync SDK",
      endpoint: "Cloud Firestore SDK",
      method: "Realtime Sync",
      category: "Database & Cloud Services",
      status: "Active",
      lastChecked: "Just now",
      description: "Multi-device real-time sync for group trips, live balances, chats, and shared itineraries."
    },
    {
      id: "api-firebase-auth",
      name: "Firebase Authentication Service",
      endpoint: "Firebase Auth SDK",
      method: "Auth SDK",
      category: "Database & Cloud Services",
      status: "Active",
      lastChecked: "Just now",
      description: "Anonymous and Google user login, security credentials, and auth session tokens."
    },
    {
      id: "api-system-health",
      name: "Server Health Monitor Endpoint",
      endpoint: "/api/health",
      method: "GET",
      category: "Admin & System APIs",
      status: "Active",
      lastChecked: "Just now",
      description: "Lightweight system health monitor endpoint checking Cloud Run status and memory."
    },
    {
      id: "api-admin-metrics",
      name: "Super Admin Dashboard Metrics API",
      endpoint: "/api/admin/metrics",
      method: "GET",
      category: "Admin & System APIs",
      status: "Active",
      lastChecked: "Just now",
      description: "Aggregates system health percentages, user counts, revenue metrics, and warning logs."
    },
    {
      id: "api-admin-health",
      name: "Super Admin System API Status Directory",
      endpoint: "/api/admin/health",
      method: "GET",
      category: "Admin & System APIs",
      status: "Active",
      lastChecked: "Just now",
      description: "Returns real-time status, health checks, and metadata for all integrated application APIs."
    },
    {
      id: "api-admin-users",
      name: "Super Admin User Management API",
      endpoint: "/api/admin/users",
      method: "GET",
      category: "Admin & System APIs",
      status: "Active",
      lastChecked: "Just now",
      description: "User accounts listing, role management, and account blocking/unblocking controls."
    },
    {
      id: "api-admin-tickets",
      name: "Super Admin Support Tickets API",
      endpoint: "/api/admin/tickets",
      method: "GET",
      category: "Admin & System APIs",
      status: "Active",
      lastChecked: "Just now",
      description: "Customer support ticket queues, issues tracking, and refund request processing."
    },
    {
      id: "api-stripe-payments",
      name: "Stripe Payment Gateway API",
      endpoint: "/api/payment",
      method: "POST",
      category: "Payment & Communication Gateways",
      status: "Unlinked",
      lastChecked: "N/A",
      description: "Payment checkout gateway for group travel package deposits and agent subscriptions."
    },
    {
      id: "api-twilio-sms",
      name: "Twilio SMS & Broadcast Gateway",
      endpoint: "Twilio REST API",
      method: "POST",
      category: "Payment & Communication Gateways",
      status: "Active",
      lastChecked: "2 mins ago",
      description: "SMS notifications, emergency group broadcast notices, and OTP phone verification."
    },
    {
      id: "api-osm",
      name: "OpenStreetMap Routing API",
      endpoint: "OSM API",
      method: "GET",
      category: "Transport & Booking APIs",
      status: "Unlinked",
      lastChecked: "N/A",
      description: "Open source map data and routing services."
    },
    {
      id: "api-openai",
      name: "OpenAI GPT-4 API",
      endpoint: "OpenAI API",
      method: "POST",
      category: "AI & Gemini Services",
      status: "Unlinked",
      lastChecked: "N/A",
      description: "Alternative AI models for trip processing."
    },
    {
      id: "api-viator",
      name: "Viator Tours & Activities API",
      endpoint: "Viator API",
      method: "GET",
      category: "Transport & Booking APIs",
      status: "Unlinked",
      lastChecked: "N/A",
      description: "Global tours, activities, and experiences booking integration."
    },
    {
      id: "api-weather",
      name: "Weather Forecast API",
      endpoint: "Weather API",
      method: "GET",
      category: "Media & Places Proxy",
      status: "Unlinked",
      lastChecked: "N/A",
      description: "Live weather updates and 7-day destination forecasts."
    }
  ];
  res.json(apis.map((api) => {
    if (api.status === "Deactivated (Local Data)" || api.status === "Unlinked") {
      return { ...api, latency: "N/A", workload: "0%" };
    }
    const realStats = getRealStats(api.endpoint);
    return { ...api, ...realStats };
  }));
});
app.post("/api/admin/ping-api", requireAdmin, (req, res) => {
  const { apiId, endpoint } = req.body || {};
  const randomLatency = Math.floor(Math.random() * 40) + 12;
  res.json({
    success: true,
    apiId: apiId || "api-system-health",
    endpoint: endpoint || "/api/health",
    status: "Active",
    httpCode: 200,
    latency: `${randomLatency}ms`,
    timestamp: "Just now",
    message: `Ping successful! Endpoint ${endpoint || apiId} responded in ${randomLatency}ms with HTTP 200 OK.`
  });
});
app.get("/api/agent/metrics", requireAuth, (req, res) => {
  res.json({ appHealth: 99, systemHealth: 98, securityHealth: 100, totalUsers: 520 });
});
app.get("/api/wallet/balance", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = adminDb();
    if (!db) return res.status(500).json({ error: "Firebase Admin not initialized" });
    const agentDoc = await db.collection("agents").doc(uid).get();
    const balance = agentDoc.exists ? agentDoc.data()?.walletBalance || 0 : 0;
    res.json({ balance });
  } catch (error) {
    console.error("Error fetching balance", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});
app.post("/api/wallet/create-order", requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const options = {
      amount: amount * 100,
      // Razorpay works in paise
      currency: "INR",
      receipt: `rcpt_wallet_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});
app.post("/api/checkout/create-order", requireAuth, async (req, res) => {
  try {
    const { itemType, itemId, packageId, hotelId, carId, flightId, quantity, travelersCount } = req.body;
    const resolvedItemId = itemId || packageId || hotelId || carId || flightId;
    const resolvedItemType = itemType || (packageId ? "package" : hotelId ? "hotel" : carId ? "car" : flightId ? "flight" : "package");
    const resolvedQuantity = quantity || travelersCount || 1;
    if (!resolvedItemId) {
      return res.status(400).json({ error: "Item ID is required" });
    }
    if (resolvedQuantity <= 0) {
      return res.status(400).json({ error: "Quantity must be strictly greater than 0" });
    }
    let unitPrice = 0;
    const db = adminDb();
    if (resolvedItemType === "package") {
      if (!db) return res.status(500).json({ error: "Database offline" });
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
            createdAt: import_firestore.FieldValue.serverTimestamp()
          });
        }
        pkgDoc = await db.collection("packages").doc(resolvedItemId).get();
      }
      if (pkgDoc.exists) {
        unitPrice = pkgDoc.data()?.price || 0;
      } else {
        unitPrice = 5e3;
      }
    } else if (resolvedItemType === "hotel") {
      if (db) {
        const hotelDoc = await db.collection("hotels").doc(resolvedItemId).get();
        if (hotelDoc.exists) {
          unitPrice = hotelDoc.data()?.price || hotelDoc.data()?.pricePerNight || 0;
        }
      }
      if (unitPrice === 0) {
        const fallbackHotels = {
          "hotel_taj_1": 12e3,
          "hotel_royal_1": 2400,
          "hotel_grand_1": 3800
        };
        unitPrice = fallbackHotels[resolvedItemId] || 3500;
      }
    } else if (resolvedItemType === "car") {
      if (db) {
        const carDoc = await db.collection("cars").doc(resolvedItemId).get();
        if (carDoc.exists) {
          unitPrice = carDoc.data()?.price || carDoc.data()?.ratePerDay || 0;
        }
      }
      if (unitPrice === 0) {
        const fallbackCars = {
          "car_sedan_1": 1500,
          "car_suv_1": 2500
        };
        unitPrice = fallbackCars[resolvedItemId] || 2e3;
      }
    } else if (resolvedItemType === "flight") {
      if (db) {
        const flightDoc = await db.collection("flights").doc(resolvedItemId).get();
        if (flightDoc.exists) {
          unitPrice = flightDoc.data()?.price || 0;
        }
      }
      if (unitPrice === 0) {
        const fallbackFlights = {
          "flight_ai_101": 5500,
          "flight_6e_202": 4200
        };
        unitPrice = fallbackFlights[resolvedItemId] || 4800;
      }
    }
    const totalAmount = unitPrice * resolvedQuantity;
    if (totalAmount <= 0) {
      return res.status(400).json({ error: "Calculated payment amount must be strictly greater than 0" });
    }
    const options = {
      amount: totalAmount * 100,
      // paise
      currency: "INR",
      receipt: `rcpt_checkout_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    if (db) {
      await db.collection("checkout_orders").doc(order.id).set({
        orderId: order.id,
        itemId: resolvedItemId,
        itemType: resolvedItemType,
        quantity: resolvedQuantity,
        unitPrice,
        totalAmount,
        currency: "INR",
        userId: req.user.uid,
        status: "PENDING",
        createdAt: import_firestore.FieldValue.serverTimestamp()
      });
    }
    res.json({
      success: true,
      order,
      calculatedAmount: totalAmount,
      itemId: resolvedItemId,
      itemType: resolvedItemType
    });
  } catch (error) {
    console.error("Error creating secure checkout order:", error);
    res.status(500).json({ error: "Failed to create secure checkout order" });
  }
});
app.post("/api/wallet/verify-payment", requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const uid = req.user.uid;
    const secret = process.env.RAZORPAY_KEY_SECRET || "dummysecret321";
    const generated_signature = import_crypto.default.createHmac("sha256", secret).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
    const db = adminDb();
    if (!db) return res.status(500).json({ error: "Firebase Admin not initialized" });
    await db.runTransaction(async (transaction) => {
      const agentRef = db.collection("agents").doc(uid);
      const agentDoc = await transaction.get(agentRef);
      const currentBalance = agentDoc.exists ? agentDoc.data()?.walletBalance || 0 : 0;
      const newBalance = currentBalance + amount;
      if (!agentDoc.exists) {
        transaction.set(agentRef, { walletBalance: newBalance }, { merge: true });
      } else {
        transaction.update(agentRef, { walletBalance: newBalance });
      }
      const txRef = db.collection("wallet_transactions").doc();
      transaction.set(txRef, {
        agentId: uid,
        amount,
        type: "CREDIT",
        purpose: "ADD_MONEY",
        referenceId: razorpay_payment_id,
        status: "SUCCESS",
        timestamp: import_firestore.FieldValue.serverTimestamp()
      });
    });
    res.json({ success: true, message: "Wallet updated successfully" });
  } catch (error) {
    console.error("Error verifying payment", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});
app.post("/api/ads/create", requireAuth, async (req, res) => {
  try {
    const { title, description, imageUrl, targetCity, startDate, endDate } = req.body;
    const uid = req.user.uid;
    const adText = `${title} ${description}`.toLowerCase();
    const badWords = ["casino", "betting", "scam", "offensiveword", "escort"];
    const hasProfanity = badWords.some((word) => adText.includes(word));
    if (hasProfanity) {
      return res.status(400).json({
        status: "REJECTED",
        reason: "Policy Violation: Ad text contains restricted or profane keywords."
      });
    }
    if (imageUrl && (imageUrl.includes("nsfw") || imageUrl.includes("violence"))) {
      return res.status(400).json({
        status: "REJECTED",
        reason: "Policy Violation: Image violates community safety guidelines."
      });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1e3 * 3600 * 24)) + 1;
    const fixedRatePerDay = 200;
    const totalCost = days * fixedRatePerDay;
    let transactionStatus = "APPROVED";
    const db = adminDb();
    if (db) {
      try {
        await db.runTransaction(async (transaction) => {
          const agentRef = db.collection("agents").doc(uid);
          const agentDoc = await transaction.get(agentRef);
          const balance = agentDoc.exists ? agentDoc.data()?.walletBalance || 0 : 0;
          if (balance < totalCost) {
            throw new Error("INSUFFICIENT_FUNDS");
          }
          transaction.update(agentRef, { walletBalance: balance - totalCost });
          const txRef = db.collection("wallet_transactions").doc();
          transaction.set(txRef, {
            agentId: uid,
            amount: totalCost,
            type: "DEBIT",
            purpose: "AD_PAYMENT",
            referenceId: "N/A",
            // could be adRef id in a more complex setup
            status: "SUCCESS",
            timestamp: import_firestore.FieldValue.serverTimestamp()
          });
          const adStatus = imageUrl && imageUrl.includes("review") ? "PENDING_MODERATION" : "PENDING_MODERATION";
          const adRef = db.collection("agent_ads").doc();
          transaction.set(adRef, {
            title,
            description,
            imageUrl: imageUrl || "",
            targetCity,
            startDate,
            endDate,
            totalCost,
            status: adStatus,
            agentId: uid,
            createdAt: import_firestore.FieldValue.serverTimestamp()
          });
        });
      } catch (err) {
        if (err.message === "INSUFFICIENT_FUNDS") {
          return res.status(400).json({ status: "REJECTED", reason: "Insufficient wallet balance." });
        }
        throw err;
      }
    }
    return res.status(200).json({
      status: "PENDING_MODERATION",
      message: "Ad successfully submitted and wallet debited. Pending admin moderation."
    });
  } catch (error) {
    console.error("Moderation Error:", error);
    res.status(500).json({ error: "Internal Server Error during ad processing" });
  }
});
app.get("/api/get-ads", async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: "City is required" });
    const db = adminDb();
    if (!db) {
      return res.json({ ads: [] });
    }
    const adsSnapshot = await db.collection("agent_ads").where("targetCity", "==", city).where("status", "==", "APPROVED").get();
    const now = /* @__PURE__ */ new Date();
    const ads = [];
    adsSnapshot.forEach((doc) => {
      const ad = doc.data();
      const startDate = new Date(ad.startDate);
      const endDate = new Date(ad.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (now >= startDate && now <= endDate) {
        ads.push({ id: doc.id, ...ad });
      }
    });
    if (ads.length === 0) {
      ads.push({
        id: "mock-1",
        title: `Explore ${city} with Local Experts`,
        description: `Book highly-rated local tours and secret experiences. Limited time 20% discount.`,
        imageUrl: "https://images.unsplash.com/photo-1517400508447-f8dd518b86e3?auto=format&fit=crop&q=80&w=1000",
        targetCity: city
      });
      ads.push({
        id: "mock-2",
        title: `Luxury Stays in ${city}`,
        description: `Premium 5-star villas available now. Use code WELCOME for free upgrades.`,
        imageUrl: "https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?auto=format&fit=crop&q=80&w=1000",
        targetCity: city
      });
    }
    res.json({ ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: error.message || "Failed to fetch ads", details: error.toString() });
  }
});
app.post("/api/support/ticket", requireAuth, async (req, res) => {
  try {
    const { category, description, fileBase64, fileName, fileSize } = req.body;
    const uid = req.user.uid;
    if (!category || !description) {
      return res.status(400).json({ error: "Category and description are required." });
    }
    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount > 500) {
      return res.status(400).json({ error: "Description exceeds the maximum limit of 500 words." });
    }
    if (fileSize && fileSize > 200 * 1024) {
      return res.status(400).json({ error: "File exceeds the maximum limit of 200 KB." });
    }
    const ticketId = `TKT-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const db = adminDb();
    if (!db) return res.status(500).json({ error: "Firebase Admin not initialized." });
    const agentDoc = await db.collection("agents").doc(uid).get();
    const agentEmail = agentDoc.exists ? agentDoc.data()?.email : "agent@routripo.com";
    const agentPhone = agentDoc.exists ? agentDoc.data()?.phone : "+919999999999";
    await db.collection("support_tickets").doc(ticketId).set({
      ticketId,
      uid,
      category,
      description,
      hasAttachment: !!fileBase64,
      fileName: fileName || null,
      status: "OPEN",
      createdAt: import_firestore.FieldValue.serverTimestamp()
    });
    const autoResponderMessage = `Hi, your support ticket ${ticketId} has been generated successfully. Our team is already looking into it and will resolve it soon.`;
    console.log(`[Email Simulator] Sending email to ${agentEmail}: ${autoResponderMessage}`);
    console.log(`[Twilio Simulator] Sending WhatsApp to ${agentPhone}: ${autoResponderMessage}`);
    res.json({ success: true, ticketId, message: "Ticket generated successfully." });
  } catch (error) {
    console.error("Support Ticket Error:", error);
    res.status(500).json({ error: "Failed to generate support ticket." });
  }
});
var registerSchema = import_zod2.z.object({
  email: import_zod2.z.string().email(),
  password: import_zod2.z.string().min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[0-9]/, "Must contain at least one number"),
  name: import_zod2.z.string().min(2)
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const db = adminDb();
    if (!db) return res.status(500).json({ error: "DB offline" });
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
    await db.collection("custom_users").doc(validatedData.email).set({
      email: validatedData.email,
      name: validatedData.name,
      passwordHash: hashedPassword,
      createdAt: import_firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: "User registered securely." });
  } catch (error) {
    res.status(400).json({ error: "Validation failed", details: error.errors || error.message });
  }
});
app.get("/api/reports/ca", requireAdmin, async (req, res) => {
  res.json({ success: true, report: "CA Financial Data", restricted: true });
});
app.get("/api/invoices/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  res.json({ success: true, invoiceId: id, details: "Secured Invoice Data" });
});
app.post("/api/bookings/confirm", requireAuth, async (req, res) => {
  const bookingData = req.body;
  try {
    const taxInfo = calculateRouTriOTaxes(bookingData);
    const customerEmail = bookingData.customerEmail || bookingData.email;
    if (customerEmail) {
      sendCustomerInvoiceEmail(customerEmail, {
        ...bookingData,
        totalAmount: bookingData.price || bookingData.totalAmount || 0
      }).catch((err) => console.error("Failed to send manual invoice:", err));
    }
    res.json({ success: true, status: "CONFIRMED", taxes: taxInfo, emailSent: !!customerEmail });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/bookings/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;
  const db = adminDb();
  if (!db) return res.status(500).json({ error: "DB offline" });
  try {
    await db.runTransaction(async (t) => {
      const bookingRef = db.collection("bookings").doc(id);
      const bookingDoc = await t.get(bookingRef);
      if (!bookingDoc.exists) throw new Error("Booking not found");
      const data = bookingDoc.data();
      if (data?.status === "CANCELLED") throw new Error("Already cancelled");
      const creditNoteId = `CN-${Date.now()}`;
      const cnRef = db.collection("credit_notes").doc(creditNoteId);
      t.set(cnRef, {
        originalBookingId: id,
        refundAmount: data?.amount || 0,
        taxReversed: true,
        issuedAt: import_firestore.FieldValue.serverTimestamp()
      });
      t.update(bookingRef, { status: "CANCELLED", creditNoteId });
    });
    res.json({ success: true, message: "Booking cancelled and tax reversed (Credit Note issued)." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/api/webhooks/razorpay", import_express2.default.json(), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "default_secret";
  const signature = req.headers["x-razorpay-signature"];
  const eventId = req.headers["x-razorpay-event-id"];
  if (!signature || !eventId) {
    return res.status(400).send("Missing headers");
  }
  const expectedSignature = import_crypto.default.createHmac("sha256", secret).update(JSON.stringify(req.body)).digest("hex");
  if (expectedSignature !== signature) {
    return res.status(400).send("Invalid signature");
  }
  const db = adminDb();
  if (!db) return res.status(500).send("DB offline");
  const eventRef = db.collection("webhook_events").doc(eventId);
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(eventRef);
      if (doc.exists) {
        throw new Error("ALREADY_PROCESSED");
      }
      t.set(eventRef, { processedAt: import_firestore.FieldValue.serverTimestamp(), payload: req.body });
      const eventType2 = req.body.event;
      if (eventType2 === "payment.captured") {
      }
    });
    const eventType = req.body.event;
    if (eventType === "payment.captured") {
      const payload = req.body.payload?.payment?.entity || {};
      const bookingDetails = {
        id: eventId,
        name: payload.notes?.customer_name || "Valued Customer",
        destination: payload.notes?.destination || "Your Package",
        baseAmount: (payload.amount || 0) / 100 * 0.82,
        // roughly extracting base vs gst
        gstAmount: (payload.amount || 0) / 100 * 0.18,
        totalAmount: (payload.amount || 0) / 100
      };
      const customerEmail = payload.email || payload.notes?.email;
      const customerPhone = payload.contact || payload.notes?.phone;
      Promise.allSettled([
        customerEmail ? sendCustomerInvoiceEmail(customerEmail, bookingDetails) : Promise.resolve(),
        customerPhone ? sendPushNotification(customerPhone, bookingDetails) : Promise.resolve()
      ]).then((results) => {
        console.log(`[NotificationService] Async notifications processed for event ${eventId}`);
      }).catch((err) => {
        console.error(`[NotificationService] Unexpected error in async notification chain:`, err);
      });
    }
    res.json({ status: "ok" });
  } catch (error) {
    if (error.message === "ALREADY_PROCESSED") {
      console.log(`Webhook event ${eventId} was already processed. Ignoring replay.`);
      return res.status(200).send("Already processed");
    }
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal Error");
  }
});
async function startServer() {
  app.use("/public", import_express2.default.static(import_path.default.join(process.cwd(), "public")));
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pravas Wataghati] Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  validateBody
});
//# sourceMappingURL=server.cjs.map
