import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { z } from 'zod';

const router = express.Router();

// --- Configuration & Stubs ---
// In a real production environment, use Redis for OTP storage.
// For this implementation, we use a simple in-memory store.
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Configure Nodemailer transporter (ensure you have environment variables set)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- Validation Schemas (Zod) ---

const SendOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, { message: 'OTP must be exactly 6 digits' }),
});

const VerifyPanGstinSchema = z.object({
  documentType: z.enum(['PAN', 'GSTIN']),
  documentNumber: z.string().min(10).max(15),
});

const VerifyBankSchema = z.object({
  accountNumber: z.string().min(5).max(30),
  ifscCode: z.string().length(11, { message: 'Invalid IFSC code length' }),
  beneficiaryName: z.string().optional(),
});

const VerifyVehicleSchema = z.object({
  registrationNumber: z.string().min(6).max(12),
});

// --- 1. Email OTP Verification ---

router.post('/send-email-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = SendOtpSchema.parse(req.body);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with a 10-minute expiration
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const mailOptions = {
      from: `"RouTriO Partner Onboarding" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your RouTriO Partner Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Welcome to RouTriO!</h2>
          <p>Please use the following 6-digit OTP to verify your email address. This OTP is valid for 10 minutes.</p>
          <h1 style="background-color: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    // If SMTP_USER is not configured, we'll just log it for development
    if (process.env.SMTP_USER) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully to registered email.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error('Error sending OTP:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
  }
});

router.post('/verify-email-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = VerifyOtpSchema.parse(req.body);

    const record = otpStore.get(email);

    if (!record) {
      res.status(400).json({ success: false, message: 'OTP not requested or expired.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      return;
    }

    if (record.otp !== otp) {
      res.status(400).json({ success: false, message: 'Invalid OTP.' });
      return;
    }

    // Clear the OTP once successfully verified
    otpStore.delete(email);

    // Proceed to mark email as verified in your database
    // await db.users.update({ where: { email }, data: { emailVerified: true } });

    res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
    }
  }
});

// --- 2. GSTIN / PAN Online Validation ---

router.post('/verify-gstin-pan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType, documentNumber } = VerifyPanGstinSchema.parse(req.body);

    // Example using Zoop API structure for PAN/GSTIN verification
    const ZOOP_API_KEY = process.env.ZOOP_API_KEY;
    const ZOOP_APP_ID = process.env.ZOOP_APP_ID;
    
    // Select the correct endpoint based on document type
    const endpoint = documentType === 'PAN' 
      ? 'https://api.zoop.one/in/identity/pan/advance'
      : 'https://api.zoop.one/in/identity/gstin/advance';

    // In a real app with real credentials, you'd execute this:
    /*
    const response = await axios.post(
      endpoint,
      { data: { customer_pan_number: documentNumber } }, // Adjust payload per Zoop/Signzy docs
      { headers: { 'app-id': ZOOP_APP_ID, 'api-key': ZOOP_API_KEY } }
    );
    const entityData = response.data;
    */

    // Simulated API response for demonstration
    const simulatedResponse = {
      success: true,
      documentType,
      documentNumber,
      verified: true,
      legalEntityName: documentType === 'PAN' ? 'ROUTRIP LOGISTICS PVT LTD' : 'ROUTRIP LOGISTICS PRIVATE LIMITED',
      registeredAddress: '123 Tech Park, Phase 1, Hinjewadi, Pune, MH 411057',
      status: 'Active',
    };

    res.status(200).json(simulatedResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error('Error verifying document:', error);
      res.status(500).json({ success: false, message: 'Document validation failed. External API error.' });
    }
  }
});

// --- 3. Bank Account 'Penny Drop' Verification ---

router.post('/verify-bank', async (req: Request, res: Response): Promise<void> => {
  try {
    const { accountNumber, ifscCode, beneficiaryName } = VerifyBankSchema.parse(req.body);

    // Example using Razorpay Fund Account Validation (Penny Drop)
    // Needs Razorpay API Key and Secret
    const RZP_KEY = process.env.RAZORPAY_KEY_ID;
    const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;
    
    /*
    const auth = Buffer.from(`${RZP_KEY}:${RZP_SECRET}`).toString('base64');
    const response = await axios.post(
      'https://api.razorpay.com/v1/fund_accounts/validations',
      {
        account_number: accountNumber,
        fund_account: {
          account_type: 'bank_account',
          bank_account: {
            name: beneficiaryName || 'Partner',
            ifsc: ifscCode,
            account_number: accountNumber,
          }
        },
        amount: 100, // INR 1.00 Penny drop
        currency: 'INR',
      },
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const bankData = response.data;
    */

    // Simulated API response
    const simulatedResponse = {
      success: true,
      accountNumber: `XXXXX${accountNumber.slice(-4)}`,
      ifscCode,
      verified: true,
      registeredNameAtBank: 'ROUTRIP LOGISTICS PVT LTD',
      matchScore: beneficiaryName ? 95 : null, // Name match percentage
      status: 'ACTIVE',
      message: 'Penny drop successful. Account verified.'
    };

    res.status(200).json(simulatedResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error('Error verifying bank account:', error);
      res.status(500).json({ success: false, message: 'Bank account verification failed.' });
    }
  }
});

// --- 4. Vehicle / RC Number Verification (For Cab Partners) ---

router.post('/verify-vehicle', async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationNumber } = VerifyVehicleSchema.parse(req.body);

    // Example using Zoop/Vahan API for RC Verification
    const ZOOP_API_KEY = process.env.ZOOP_API_KEY;
    const ZOOP_APP_ID = process.env.ZOOP_APP_ID;

    /*
    const response = await axios.post(
      'https://api.zoop.one/in/vehicle/rc/advance',
      { data: { vehicle_registration_number: registrationNumber } },
      { headers: { 'app-id': ZOOP_APP_ID, 'api-key': ZOOP_API_KEY } }
    );
    const rcData = response.data;
    */

    // Simulated API response based on common Vahan proxy providers
    const simulatedResponse = {
      success: true,
      registrationNumber: registrationNumber.toUpperCase(),
      verified: true,
      vehicleDetails: {
        ownerName: 'SHARAD RAUT',
        vehicleClass: 'Motor Car (LMV)',
        makerModel: 'MARUTI SUZUKI INDIA LTD / SWIFT DZIRE',
        fuelType: 'CNG',
        registrationDate: '2022-04-15',
        fitnessValidity: '2037-04-14',
        insuranceValidity: '2026-10-12',
        puccValidity: '2026-12-01',
        rcStatus: 'ACTIVE',
        blacklistStatus: 'CLEAN'
      }
    };

    // Business Logic Check: Fitness and Insurance should be valid
    const isFitnessValid = new Date(simulatedResponse.vehicleDetails.fitnessValidity) > new Date();
    const isInsuranceValid = new Date(simulatedResponse.vehicleDetails.insuranceValidity) > new Date();

    if (!isFitnessValid || !isInsuranceValid) {
      res.status(400).json({ 
        success: false, 
        message: 'Vehicle fitness or insurance has expired.',
        data: simulatedResponse
      });
      return;
    }

    res.status(200).json(simulatedResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, errors: error.issues });
    } else {
      console.error('Error verifying RC:', error);
      res.status(500).json({ success: false, message: 'Vehicle verification failed.' });
    }
  }
});

export default router;
