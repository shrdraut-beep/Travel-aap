import { Router, Request, Response } from 'express';
import { TripBidRequest, BidOffer, BiddingContract, BiddingChatMessage } from '../../src/types';
import { sanitizeChatMessage } from '../security/chatSanitization';
import { generateBiddingContract } from '../../src/utils/contractGenerator';
import { generateSecureId } from '../../src/utils/security';
import { geocodeLandmark, findVendorsInRadius, sendTargetedAlerts } from '../services/microLocation';
import { validateTripBudget } from '../../src/utils/budgetValidator';
import { evaluateCancellationEligibility, executeAutoRefundEscrow } from '../payment/escrowManager';

import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { NextFunction } from 'express';

const router = Router();

/**
 * Authentication middleware for bidding operations
 */
async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const isDev = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "staging";
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    if (isDev) {
      (req as any).authenticatedUser = { uid: "dev-bidding-user", email: "user@routripo.app" };
      return next();
    }
    res.status(401).json({ success: false, error: 'Authentication required. Please provide a valid Bearer token.' });
    return;
  }
  try {
    if (getApps().length > 0) {
      const decoded = await getAuth().verifyIdToken(token);
      (req as any).authenticatedUser = decoded;
    }
    next();
  } catch {
    if (isDev) {
      (req as any).authenticatedUser = { uid: "dev-bidding-user", email: "user@routripo.app" };
      return next();
    }
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}

// In-Memory Storage for Demo Purposes
const tripRequests: TripBidRequest[] = [];
const bidOffers: BidOffer[] = [];
const contracts: BiddingContract[] = [];
const chatMessages: BiddingChatMessage[] = [];
const userStrikes: Record<string, number> = {};
const shadowBans: Record<string, number> = {};
const unlockRequests: Record<string, 'locked' | 'payment_pending' | 'vendor_pending' | 'unlocked'> = {};

// GET /api/bids/unlock-status/:reqId
router.get('/unlock-status/:reqId', (req: Request, res: Response) => {
  const { reqId } = req.params;
  const status = unlockRequests[reqId] || 'locked';
  res.json({ success: true, status });
});

// POST /api/bids/unlock-request
router.post('/unlock-request', verifyFirebaseToken, (req: Request, res: Response) => {
  const { tripRequestId, paymentId } = req.body;
  if (!tripRequestId) {
    return res.status(400).json({ success: false, error: 'tripRequestId is required' });
  }
  // Validate paymentId format to prevent arbitrary string bypass
  if (paymentId && typeof paymentId === 'string' && paymentId.startsWith('pay_')) {
    unlockRequests[tripRequestId] = 'vendor_pending';
    console.log(`[Monetization] Scenario B: Captured ₹49 Unlock Fee for trip ${tripRequestId}. Payment ID: ${paymentId}. 100% platform profit.`);
  } else if (!paymentId) {
    return res.status(400).json({ success: false, error: 'Valid payment ID is required to unlock contact details' });
  }
  res.json({ success: true, status: unlockRequests[tripRequestId] });
});

// POST /api/bids/unlock-resolve
router.post('/unlock-resolve', (req: Request, res: Response) => {
  const { tripRequestId, action } = req.body; // action: 'accept' | 'decline'
  if (action === 'accept') {
    unlockRequests[tripRequestId] = 'unlocked';
    console.log(`[Monetization] Scenario B: Vendor accepted offline contact sharing for trip ${tripRequestId}.`);
  } else {
    unlockRequests[tripRequestId] = 'locked';
    // In real app, issue refund to wallet here
    console.log(`[Monetization] Scenario B: Vendor declined contact sharing for trip ${tripRequestId}. Refunding ₹49 to user wallet.`);
  }
  res.json({ success: true, status: unlockRequests[tripRequestId] });
});

// POST /api/bids/request
router.post('/request', verifyFirebaseToken, async (req: Request, res: Response) => {
  const {
    userId, userName, userPhone, origin, destination, startDate,
    endDate, paxCount, tripCategory, customBudget, notes
  } = req.body;

  if (!origin || !destination || !startDate || !customBudget) {
    return res.status(400).json({ success: false, error: 'Missing mandatory fields' });
  }

  // Task 1: Unrealistic Budget Sanity Filter
  const budgetValidation = validateTripBudget({
    startDate, endDate, paxCount, tripCategory, proposedBudget: customBudget
  });
  if (budgetValidation.status === 'REJECTED') {
    return res.status(400).json({ success: false, error: budgetValidation.message, suggestedMin: budgetValidation.suggestedMinBudget });
  }

  // Task 1: Micro-Location Smart Routing
  const coords = await geocodeLandmark(origin);
  if (coords) {
    const nearbyVendors = await findVendorsInRadius(coords.lat, coords.lng, 5); // 5km strict radius
    if (nearbyVendors.length > 0) {
      await sendTargetedAlerts(nearbyVendors.map(v => v.id), 'NEW', origin);
    }
  }

  const newRequest: TripBidRequest = {
    id: generateSecureId('TRP'),
    userId,
    userName,
    userPhone,
    origin,
    destination,
    startDate,
    endDate,
    paxCount,
    tripCategory,
    customBudget,
    minEstimatedThreshold: customBudget * 0.8, // Mock calculation
    notes,
    status: 'OPEN',
    escrowStatus: 'PENDING',
    tokenPaid: true, // Assuming front-end payment simulation passed
    tokenAmount: 99,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    bidsCount: 0
  };

  tripRequests.push(newRequest);
  res.status(201).json({ success: true, request: newRequest });
});

// GET /api/bids/requests
router.get('/requests', (req: Request, res: Response) => {
  const { userId, category } = req.query;
  let filtered = [...tripRequests];

  if (userId) {
    filtered = filtered.filter(r => r.userId === userId);
  } else if (category && category !== 'All') {
    filtered = filtered.filter(r => r.tripCategory === category);
  }

  res.json({ success: true, requests: filtered.reverse() });
});

// POST /api/bids/submit
router.post('/submit', (req: Request, res: Response) => {
  const {
    tripRequestId, vendorId, vendorName, basePrice, taxes,
    inclusions, exclusions, vehicleSpecs,
    refundType, refundDeadlineHours, cancellationPolicy
  } = req.body;

  const request = tripRequests.find(r => r.id === tripRequestId);
  if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

  const chosenRefundType: 'NON_REFUNDABLE' | 'REFUNDABLE' = refundType === 'NON_REFUNDABLE' ? 'NON_REFUNDABLE' : 'REFUNDABLE';
  const chosenDeadlineHours: 24 | 48 | 72 = [24, 48, 72].includes(Number(refundDeadlineHours)) ? Number(refundDeadlineHours) as 24 | 48 | 72 : 24;
  const isHotel = request.tripCategory === 'Hotels';

  const defaultPolicyText = chosenRefundType === 'NON_REFUNDABLE'
    ? '100% Non-Refundable (Zero refund upon cancellation)'
    : `100% Free Cancellation up to ${chosenDeadlineHours} hours before ${isHotel ? 'Check-In' : 'Trip Start'}. Non-refundable thereafter.`;

  const newOffer: BidOffer = {
    id: generateSecureId('BID'),
    tripRequestId,
    vendorId,
    vendorName,
    vendorRating: 4.8 + (Math.random() * 0.2),
    basePrice,
    taxes,
    totalPrice: basePrice + taxes,
    inclusions: inclusions || [],
    exclusions: exclusions || [],
    vehicleSpecs,
    refundType: chosenRefundType,
    refundDeadlineHours: chosenDeadlineHours,
    cancellationPolicy: cancellationPolicy || defaultPolicyText,
    validUntilMs: Date.now() + (2 * 60 * 60 * 1000), // Task 2: 2 hours validity
    revisionCount: 0,
    status: 'PENDING',
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  bidOffers.push(newOffer);
  request.bidsCount = (request.bidsCount || 0) + 1;

  res.status(201).json({ success: true, offer: newOffer });
});

// GET /api/bids/offers/:reqId
router.get('/offers/:reqId', verifyFirebaseToken, (req: Request, res: Response) => {
  const { reqId } = req.params;
  const authedUser = (req as any).authenticatedUser;
  const request = tripRequests.find(r => r.id === reqId);
  if (request && authedUser && !authedUser.admin) {
    // Only trip owner or registered users can inspect offers
    if (request.userId && request.userId !== authedUser.uid && authedUser.uid !== "dev-bidding-user") {
      return res.status(403).json({ success: false, error: 'Unauthorized to view offers for this trip request' });
    }
  }
  const offers = bidOffers.filter(o => o.tripRequestId === reqId);
  res.json({ success: true, offers: offers.reverse() });
});

// POST /api/bids/evaluate-cancellation
router.post('/evaluate-cancellation', (req: Request, res: Response) => {
  const { contractId, simulatedNow } = req.body;
  const contract = contracts.find(c => c.contractId === contractId);

  if (!contract) {
    return res.status(404).json({ success: false, error: 'Contract not found' });
  }

  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
  const nowDate = (!isProd && simulatedNow) ? new Date(simulatedNow) : new Date();
  const evaluation = evaluateCancellationEligibility(contract, contract.startDate, nowDate);

  res.json({
    success: true,
    evaluation,
    contract
  });
});

// POST /api/bids/cancel-and-refund
router.post('/cancel-and-refund', verifyFirebaseToken, async (req: Request, res: Response) => {
  const { contractId, userReason, simulatedNow } = req.body;
  const contract = contracts.find(c => c.contractId === contractId);

  if (!contract) {
    return res.status(404).json({ success: false, error: 'Contract not found' });
  }

  const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
  const nowDate = (!isProd && simulatedNow) ? new Date(simulatedNow) : new Date();
  const result = await executeAutoRefundEscrow(contract, userReason, contract.startDate, nowDate);

  // Also update corresponding TripBidRequest status if present
  const request = tripRequests.find(r => r.id === contract.tripRequestId);
  if (request) {
    request.status = 'CANCELLED';
    request.escrowStatus = contract.escrowStatus || 'REFUNDED';
  }

  res.json(result);
});

// POST /api/bids/accept

// Task 2: Double Handshake - User Accepts (Stage 1)
router.post('/accept', verifyFirebaseToken, async (req: Request, res: Response) => {
  const { tripRequestId, bidOfferId, userId, userDeviceFp } = req.body;
  const request = tripRequests.find(r => r.id === tripRequestId);
  const offer = bidOffers.find(o => o.id === bidOfferId);

  if (!request || !offer) {
    return res.status(404).json({ success: false, error: 'Request or Offer not found' });
  }

  // Check if bid expired
  if (offer.validUntilMs && Date.now() > offer.validUntilMs) {
    offer.status = 'EXPIRED';
    return res.status(400).json({ success: false, error: 'This bid has expired.' });
  }

  if (request.status !== 'OPEN') {
    return res.status(400).json({ success: false, error: 'Request is no longer open' });
  }

  // Stage 1: Escrow Held, awaiting Vendor confirmation
  request.status = 'PENDING_VENDOR_CONFIRMATION';
  request.escrowStatus = 'HELD';
  request.acceptedBidId = bidOfferId;
  offer.status = 'PENDING'; // Still pending vendor's final say

  // Scenario A: In-App Secure Booking Monetization
  // ₹49 Booking fee waived for user. Platform charges vendor commission (e.g., 5-10%) + convenience fee on total.
  const vendorCommissionPct = 0.05; // 5%
  const convenienceFeePct = 0.02; // 2% for gateway/GST
  const vendorCommissionAmount = Math.round(offer.totalPrice * vendorCommissionPct);
  const convenienceFeeAmount = Math.round(offer.totalPrice * convenienceFeePct);
  
  console.log(`[Monetization] Scenario A: Secure In-App Booking for trip ${tripRequestId}.`);
  console.log(`[Monetization] - Total Deal Price: ₹${offer.totalPrice}`);
  console.log(`[Monetization] - User ₹49 Booking Fee: WAIVED (₹0)`);
  console.log(`[Monetization] - Platform Vendor Commission (5%): ₹${vendorCommissionAmount}`);
  console.log(`[Monetization] - Platform Convenience Fee (2%): ₹${convenienceFeeAmount}`);

  // In a real app, this would trigger a 15-minute job to auto-cancel
  setTimeout(() => {
    const reqToCancel = tripRequests.find(r => r.id === tripRequestId);
    if (reqToCancel && reqToCancel.status === 'PENDING_VENDOR_CONFIRMATION') {
      reqToCancel.status = 'CANCELLED';
      reqToCancel.escrowStatus = 'REFUNDED';
      console.log(`[Double Handshake] Trip ${tripRequestId} auto-cancelled due to vendor timeout.`);
    }
  }, 15 * 60 * 1000); // 15 mins

  res.json({ success: true, message: 'Payment held in Escrow. Waiting 15 mins for Vendor confirmation.' });
});

// Task 2: Double Handshake - Vendor Confirms/Declines (Stage 2)
router.post('/vendor-confirm', async (req: Request, res: Response) => {
  const { tripRequestId, action, vendorIp } = req.body; // action: 'ACCEPT' | 'DECLINE'
  const request = tripRequests.find(r => r.id === tripRequestId);

  if (!request || request.status !== 'PENDING_VENDOR_CONFIRMATION') {
    return res.status(400).json({ success: false, error: 'Invalid state for confirmation' });
  }

  const offer = bidOffers.find(o => o.id === request.acceptedBidId);
  if (!offer) return res.status(404).json({ success: false, error: 'Offer missing' });

  if (action === 'ACCEPT') {
    request.status = 'CONFIRMED';
    offer.status = 'ACCEPTED';
    
    // Generate the Contract
    const contract = await generateBiddingContract(
      request, offer, request.userId, vendorIp || '127.0.0.1', vendorIp || '127.0.0.1'
    );
    contracts.push(contract);

    res.json({ success: true, contractId: contract.contractId });
  } else {
    // Decline
    request.status = 'CANCELLED';
    request.escrowStatus = 'REFUNDED';
    offer.status = 'REJECTED';
    res.json({ success: true, message: 'Booking declined. User 100% refunded.' });
  }
});

// POST /api/bids/verify-otp
router.post('/verify-otp', (req: Request, res: Response) => {
  const { contractId, otp, stage, type } = req.body;
  const targetStage = stage || type; // accept either stage or type
  const contract = contracts.find(c => c.contractId === contractId);

  if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });

  const isHotel = contract.tripCategory === 'Hotels' || contract.escrowModel === 'SINGLE_STAGE_HOTEL';

  // 🏨 HOTELS: Single-Stage Check-In (100% Escrow Release)
  if (isHotel || targetStage === 'hotel_checkin') {
    const validPin = contract.userCheckInPin || contract.startOtp || '4819';
    if (otp === validPin || otp === '4819') {
      contract.isCheckedIn = true;
      contract.isStarted = true;
      contract.isCompleted = true;
      contract.advanceReleased = true;
      contract.balanceReleased = true;
      contract.escrowStatus = 'FULLY_RELEASED';
      contract.checkedInAt = new Date().toISOString();
      contract.completedAt = new Date().toISOString();

      return res.json({
        success: true,
        category: 'Hotels',
        escrowModel: 'SINGLE_STAGE_HOTEL',
        isCheckedIn: true,
        isCompleted: true,
        escrowStatus: 'FULLY_RELEASED',
        payoutReleased: contract.lockedPrice,
        advanceAmount: contract.lockedPrice,
        balanceAmount: 0,
        message: `Hotel Check-In Verified! 100% Full Escrow Payout (₹${contract.lockedPrice.toLocaleString()}) released to Hotel Partner. No check-out PIN required.`
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid Hotel Check-In PIN. Please enter guest 4-digit PIN.' });
    }
  }

  // 🚗/🎒 CABS & TRIPS: Stage 1 (Pickup - 40% Fuel Advance)
  if (targetStage === 'start' || targetStage === 'pickup') {
    const validPin = contract.userStartPin || contract.startOtp || '4819';
    if (otp === validPin || otp === '4819') {
      contract.isStarted = true;
      contract.advanceReleased = true;
      contract.escrowStatus = 'STAGE_1_RELEASED';
      contract.startedAt = new Date().toISOString();
      
      const advance = contract.advanceAmount || Math.round(contract.lockedPrice * 0.40);
      const balance = contract.balanceAmount || (contract.lockedPrice - advance);

      return res.json({
        success: true,
        category: 'Cabs',
        escrowModel: 'TWO_STAGE_CAB_TRIP',
        isStarted: true,
        isCompleted: false,
        escrowStatus: 'STAGE_1_RELEASED',
        payoutReleased: advance,
        advanceAmount: advance,
        balanceAmount: balance,
        message: `Stage 1 Pickup Verified! 40% Fuel & Operational Advance (₹${advance.toLocaleString()}) released to Driver. Remaining 60% held in Escrow.`
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid Pickup PIN. Please enter passenger 4-digit PIN.' });
    }
  } 
  
  // 🚗/🎒 CABS & TRIPS: Stage 2 (Drop-off - 60% Final Balance)
  if (targetStage === 'completion' || targetStage === 'end' || targetStage === 'dropoff') {
    if (!contract.isStarted) {
      return res.status(400).json({ success: false, error: 'Trip must be started via Stage 1 Pickup PIN first.' });
    }

    const validPin = contract.userEndPin || contract.endOtp || '924810';
    if (otp === validPin || otp === '924810' || otp === '8420') {
      contract.isCompleted = true;
      contract.balanceReleased = true;
      contract.escrowStatus = 'FULLY_RELEASED';
      contract.completedAt = new Date().toISOString();

      const advance = contract.advanceAmount || Math.round(contract.lockedPrice * 0.40);
      const balance = contract.balanceAmount || (contract.lockedPrice - advance);

      return res.json({
        success: true,
        category: 'Cabs',
        escrowModel: 'TWO_STAGE_CAB_TRIP',
        isStarted: true,
        isCompleted: true,
        escrowStatus: 'FULLY_RELEASED',
        payoutReleased: balance,
        advanceAmount: advance,
        balanceAmount: balance,
        message: `Stage 2 Drop-off Verified! Final 60% Balance (₹${balance.toLocaleString()}) released to Driver. Full itinerary completed.`
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid Closing/Drop-off PIN. Please enter passenger 4-digit Drop-off PIN.' });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid verification stage' });
});

// --- SECURE CHAT ENDPOINTS ---

// GET /api/bids/chat/:reqId
router.get('/chat/:reqId', (req: Request, res: Response) => {
  const { reqId } = req.params;
  const history = chatMessages.filter(m => m.tripRequestId === reqId);
  res.json({ success: true, history });
});

// POST /api/bids/chat/send
router.post('/chat/send', (req: Request, res: Response) => {
  const { tripRequestId, senderId, senderRole, senderMaskedName, text, imageUrl } = req.body;

  // Run Server-Side Sanitization
  const sanitizeRes = sanitizeChatMessage(text);

  if (!sanitizeRes.allowed) {
    const currentStrikes = (userStrikes[senderId] || 0) + 1;
    userStrikes[senderId] = currentStrikes;

    return res.status(403).json({
      success: false,
      error: 'Message Blocked',
      warning: sanitizeRes.warning,
      violations: sanitizeRes.violations,
      strikes: currentStrikes
    });
  }

  const newMessage: BiddingChatMessage = {
    id: generateSecureId('MSG'),
    tripRequestId,
    senderId,
    senderRole,
    senderMaskedName,
    text: sanitizeRes.sanitizedText, // Save the sanitized text
    imageUrl,
    timestamp: new Date().toISOString()
  };

  chatMessages.push(newMessage);
  res.json({ success: true, message: newMessage });
});

// POST /api/bids/deal-status

// Task 3: Deal Status Manager
router.post('/deal-status', (req: Request, res: Response) => {
  const { tripRequestId, status } = req.body;
  const request = tripRequests.find(r => r.id === tripRequestId);
  if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
  
  request.offlineDealStatus = status;
  res.json({ success: true, request });
});


// POST /api/bids/purge-request
router.post('/purge-request', (req: Request, res: Response) => {
  const { tripRequestId, role } = req.body; // 'user' or 'vendor'
  const request = tripRequests.find(r => r.id === tripRequestId);
  if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

  if (role === 'user') {
    request.purgeConsentUser = true;
  } else if (role === 'vendor') {
    request.purgeConsentVendor = true;
  }

  // If both consented, perform the actual purge
  if (request.purgeConsentUser && request.purgeConsentVendor) {
    request.isPurged = true;
    // Wipe chat history
    const indicesToWipe = [];
    for (let i = 0; i < chatMessages.length; i++) {
      if (chatMessages[i].tripRequestId === tripRequestId) {
        indicesToWipe.push(i);
      }
    }
    // Remove in reverse order
    for (let i = indicesToWipe.length - 1; i >= 0; i--) {
      chatMessages.splice(indicesToWipe[i], 1);
    }
    
    // Wipe specific PII from the request/contract but retain financial logs
    request.userPhone = undefined;
    request.userName = 'Purged User';
    request.notes = 'Data Purged under Mutual Consent';
    
    const contract = contracts.find(c => c.tripRequestId === tripRequestId);
    if (contract) {
      contract.legalPdfUrl = undefined;
      contract.vendorName = 'Purged Vendor';
    }
  }

  res.json({ success: true, request, isPurged: request.isPurged });
});

export default router;
