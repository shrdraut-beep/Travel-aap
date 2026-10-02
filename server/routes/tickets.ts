import express from 'express';

const router = express.Router();

export interface TicketPassenger {
  name: string;
  seat: string;
  meal?: string;
  coach?: string;
  berth?: string;
  age?: number;
  gender?: string;
}

export interface TicketPricing {
  baseFare: number;
  taxes: number;
  ancillary?: number;
  discount?: number;
  total: number;
}

export interface CancellationDetails {
  cancelledAt: string;
  cancellationReason: string;
  originalPaid: number;
  cancellationFee: number;
  gstOnFee: number;
  netRefundAmount: number;
  refundMethod: 'gateway' | 'wallet';
  refundDestinationName: string;
  refundArn: string;
  refundStatus: 'Settled' | 'Processing' | 'Initiated';
  settlementTimeline: string;
  cancellationReceiptId: string;
}

export interface BookingTicket {
  id: string;
  bookingId: string;
  pnr: string;
  title: string;
  titleMr?: string;
  vertical: 'flight' | 'train' | 'hotel' | 'bus' | 'cab';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  date: string; // ISO string
  travelTime: string;
  duration: string;
  provider: string;
  departureInfo: string;
  arrivalInfo: string;
  passengers: TicketPassenger[];
  baggage?: { checkin?: string; cabin?: string };
  hotelDetails?: { roomType: string; nights: number; checkIn: string; checkOut: string };
  pricing: TicketPricing;
  paymentDetails: {
    method: string;
    gateway: string;
    transactionId: string;
    accountMasked: string;
    paidAt: string;
  };
  cancellationDetails?: CancellationDetails;
}

// In-memory / seeded store
let ticketsStore: BookingTicket[] = [
  {
    id: 'tkt_flight_01',
    bookingId: 'RT-FL-9281745',
    pnr: 'KEEGKX',
    title: 'Mumbai (BOM) to New Delhi (DEL)',
    titleMr: 'मुंबई (BOM) ते नवी दिल्ली (DEL)',
    vertical: 'flight',
    status: 'Upcoming',
    date: new Date(Date.now() + 86400000 * 4).toISOString(),
    travelTime: '21:00 - 23:05',
    duration: '2h 05m',
    provider: 'IndiGo 6E-6636 · Airbus A321neo',
    departureInfo: "Chhatrapati Shivaji Maharaj Int'l Airport, Terminal 2",
    arrivalInfo: "Indira Gandhi Int'l Airport, Terminal 1",
    baggage: { checkin: '15 kg (1 Piece)', cabin: '7 kg Hand Baggage' },
    passengers: [
      { name: 'Aditi Sharma', seat: '14A (Window)', meal: 'Veg Sandwich Box', gender: 'Female', age: 28 },
      { name: 'Rahul Sharma', seat: '14B (Middle)', meal: 'Jain Meal Box', gender: 'Male', age: 31 }
    ],
    pricing: {
      baseFare: 8400,
      taxes: 1250,
      ancillary: 400,
      total: 10050
    },
    paymentDetails: {
      method: 'Razorpay UPI (Google Pay)',
      gateway: 'Razorpay PG',
      transactionId: 'pay_RZPY_FL_9812401',
      accountMasked: 'HDFC Bank A/c ending in ••••4210',
      paidAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  },
  {
    id: 'tkt_train_02',
    bookingId: 'RT-TR-4482910',
    pnr: '8249103847',
    title: 'Mumbai CSMT to Pune Jn',
    titleMr: 'मुंबई CSMT ते पुणे जंक्शन',
    vertical: 'train',
    status: 'Upcoming',
    date: new Date(Date.now() + 86400000 * 8).toISOString(),
    travelTime: '06:05 - 09:15',
    duration: '3h 10m',
    provider: 'Vande Bharat Express (22223) · Executive Chair (EC)',
    departureInfo: 'Mumbai Chhatrapati Shivaji Maharaj Terminus (Platform 8)',
    arrivalInfo: 'Pune Junction (Platform 1)',
    passengers: [
      { name: 'Aditi Sharma', seat: 'Seat 24 (Window)', coach: 'C3', meal: 'Morning Breakfast Tea & Snack', age: 28 }
    ],
    pricing: {
      baseFare: 1650,
      taxes: 85,
      total: 1735
    },
    paymentDetails: {
      method: 'Razorpay UPI (PhonePe)',
      gateway: 'Razorpay PG',
      transactionId: 'pay_RZPY_TR_4412098',
      accountMasked: 'SBI UPI ••••••43210',
      paidAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  },
  {
    id: 'tkt_hotel_03',
    bookingId: 'RT-HTL-8823190',
    pnr: 'VOUCHER-TAJ-7721',
    title: 'Taj Fort Aguada Resort & Spa, Goa',
    titleMr: 'ताज फोर्ट अगुआडा रिसॉर्ट आणि स्पा, गोवा',
    vertical: 'hotel',
    status: 'Completed',
    date: new Date(Date.now() - 86400000 * 15).toISOString(),
    travelTime: 'Check-in: 14:00 · Check-out: 11:00',
    duration: '3 Nights, 4 Days',
    provider: 'Luxury Sea View Villa with Balcony',
    departureInfo: 'Sinquerim, Candolim, Goa 403515',
    arrivalInfo: 'Verified Check-in & Escrow Settled',
    passengers: [
      { name: 'Aditi Sharma', seat: 'Primary Guest', age: 28 },
      { name: 'Rahul Sharma', seat: 'Guest 2', age: 31 }
    ],
    hotelDetails: {
      roomType: 'Sea-View Heritage King Room',
      nights: 3,
      checkIn: new Date(Date.now() - 86400000 * 18).toISOString().split('T')[0],
      checkOut: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0]
    },
    pricing: {
      baseFare: 28500,
      taxes: 3420,
      total: 31920
    },
    paymentDetails: {
      method: 'Razorpay NetBanking (HDFC Bank)',
      gateway: 'Razorpay PG',
      transactionId: 'pay_RZPY_HTL_7749102',
      accountMasked: 'HDFC NetBanking A/c ending in ••••4210',
      paidAt: new Date(Date.now() - 86400000 * 20).toISOString()
    }
  },
  {
    id: 'tkt_bus_04',
    bookingId: 'RT-BUS-1102948',
    pnr: 'BUS-PNE-GOA-77',
    title: 'Pune to Goa (Panaji)',
    titleMr: 'पुणे ते गोवा (पणजी)',
    vertical: 'bus',
    status: 'Cancelled',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    travelTime: '22:30 - 07:45',
    duration: '9h 15m',
    provider: 'IntrCity SmartBus · AC BharatBenz Sleeper (2+1)',
    departureInfo: 'Swargate Bus Stand, Pune',
    arrivalInfo: 'Panaji KTC Bus Stand, Goa',
    passengers: [
      { name: 'Aditi Sharma', seat: 'Upper Berth U4 (Single Window)', age: 28 }
    ],
    pricing: {
      baseFare: 1450,
      taxes: 75,
      total: 1525
    },
    paymentDetails: {
      method: 'Razorpay UPI (Google Pay)',
      gateway: 'Razorpay PG',
      transactionId: 'pay_RZPY_BUS_8819203',
      accountMasked: 'HDFC Bank UPI ••••••43210',
      paidAt: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    cancellationDetails: {
      cancelledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      cancellationReason: 'Passenger requested cancellation due to road work advisory',
      originalPaid: 1525,
      cancellationFee: 150,
      gstOnFee: 27,
      netRefundAmount: 1348,
      refundMethod: 'gateway',
      refundDestinationName: 'Original UPI Payment Source (HDFC Bank UPI ••••••43210)',
      refundArn: 'ARN-RZPY-2026-981240192',
      refundStatus: 'Settled',
      settlementTimeline: 'Refund credited to your original payment gateway account',
      cancellationReceiptId: 'CN-RT-2026-881920'
    }
  }
];

// GET /api/tickets - List all tickets with filtering
router.get('/', (req, res) => {
  const { status, vertical, search } = req.query;
  let list = [...ticketsStore];

  if (status && typeof status === 'string') {
    list = list.filter((t) => t.status.toLowerCase() === status.toLowerCase());
  }

  if (vertical && typeof vertical === 'string' && vertical !== 'All') {
    list = list.filter((t) => t.vertical.toLowerCase() === vertical.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.pnr.toLowerCase().includes(q) ||
      t.bookingId.toLowerCase().includes(q) ||
      t.provider.toLowerCase().includes(q) ||
      t.passengers.some((p) => p.name.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: list.length, tickets: list });
});

// GET /api/tickets/:id - Get single ticket details
router.get('/:id', (req, res) => {
  const ticket = ticketsStore.find((t) => t.id === req.params.id || t.bookingId === req.params.id || t.pnr === req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }
  res.json({ success: true, ticket });
});

// POST /api/tickets/:id/cancel - Cancel ticket & calculate gateway/wallet refund
router.post('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason = 'Personal schedule change', refundDestination = 'gateway' } = req.body;

  const idx = ticketsStore.findIndex((t) => t.id === id || t.bookingId === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  const t = ticketsStore[idx];
  if (t.status === 'Cancelled') {
    return res.status(400).json({ success: false, error: 'Ticket is already cancelled' });
  }

  // Vertical-based fee calculation
  let feeRate = 0.15;
  if (t.vertical === 'flight') feeRate = 0.20;
  if (t.vertical === 'train') feeRate = 0.10;
  if (t.vertical === 'hotel') feeRate = 0.12;

  const originalPaid = t.pricing.total;
  const cancellationFee = Math.round(originalPaid * feeRate);
  const gstOnFee = Math.round(cancellationFee * 0.18);
  const netRefundAmount = Math.max(0, originalPaid - (cancellationFee + gstOnFee));

  const now = new Date();
  const receiptId = `CN-RT-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const refundArn = `ARN-RZPY-${now.getFullYear()}-${Math.floor(100000000 + Math.random() * 900000000)}`;

  const isWallet = refundDestination === 'wallet';
  const refundDestinationName = isWallet
    ? 'RouTripo Closed Travel Wallet (Instant Credit + 2% Loyalty Bonus)'
    : `Original Payment Gateway Source: ${t.paymentDetails.method} (${t.paymentDetails.accountMasked})`;

  const cancellationDetails: CancellationDetails = {
    cancelledAt: now.toISOString(),
    cancellationReason: reason,
    originalPaid,
    cancellationFee,
    gstOnFee,
    netRefundAmount,
    refundMethod: refundDestination as any,
    refundDestinationName,
    refundArn,
    refundStatus: 'Settled',
    settlementTimeline: isWallet
      ? 'Instant credit reflected in your RouTripo Wallet balance'
      : 'Credited directly back to your original payment gateway account within 15-30 minutes',
    cancellationReceiptId: receiptId
  };

  const updatedTicket: BookingTicket = {
    ...t,
    status: 'Cancelled',
    cancellationDetails
  };

  ticketsStore[idx] = updatedTicket;

  res.json({
    success: true,
    message: isWallet
      ? `Ticket cancelled. ₹${netRefundAmount.toLocaleString('en-IN')} instantly credited to your RouTripo Wallet!`
      : `Ticket cancelled. ₹${netRefundAmount.toLocaleString('en-IN')} refund initiated to your payment gateway account.`,
    ticket: updatedTicket,
    cancellationDetails,
    refundAmount: netRefundAmount,
    receiptId
  });
});

// POST /api/tickets/:id/reschedule - Reschedule travel date
router.post('/:id/reschedule', (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;

  if (!newDate) {
    return res.status(400).json({ success: false, error: 'New travel date is required' });
  }

  const idx = ticketsStore.findIndex((t) => t.id === id || t.bookingId === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }

  const t = ticketsStore[idx];
  if (t.status === 'Cancelled') {
    return res.status(400).json({ success: false, error: 'Cannot reschedule a cancelled ticket' });
  }

  const updatedTicket: BookingTicket = {
    ...t,
    date: new Date(newDate).toISOString()
  };

  ticketsStore[idx] = updatedTicket;

  res.json({
    success: true,
    message: 'Travel date successfully rescheduled.',
    ticket: updatedTicket
  });
});

// GET /api/tickets/:id/receipt - Get cancellation receipt
router.get('/:id/receipt', (req, res) => {
  const ticket = ticketsStore.find((t) => t.id === req.params.id || t.bookingId === req.params.id);
  if (!ticket || !ticket.cancellationDetails) {
    return res.status(404).json({ success: false, error: 'Cancellation receipt not found' });
  }

  res.json({
    success: true,
    receipt: {
      receiptId: ticket.cancellationDetails.cancellationReceiptId,
      ticketTitle: ticket.title,
      pnr: ticket.pnr,
      bookingId: ticket.bookingId,
      cancelledAt: ticket.cancellationDetails.cancelledAt,
      breakdown: {
        originalPaid: ticket.cancellationDetails.originalPaid,
        cancellationFee: ticket.cancellationDetails.cancellationFee,
        gstOnFee: ticket.cancellationDetails.gstOnFee,
        netRefundAmount: ticket.cancellationDetails.netRefundAmount
      },
      settlement: {
        method: ticket.cancellationDetails.refundMethod,
        destination: ticket.cancellationDetails.refundDestinationName,
        arn: ticket.cancellationDetails.refundArn,
        status: ticket.cancellationDetails.refundStatus,
        timeline: ticket.cancellationDetails.settlementTimeline
      }
    }
  });
});

export default router;
