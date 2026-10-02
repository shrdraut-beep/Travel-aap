// Ticket & Cancellation Management Service for RouTripo
import { ClosedWalletService } from './ClosedWalletService';

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

const STORAGE_KEY = 'routripo_user_tickets_v2';

const INITIAL_SEEDED_TICKETS: BookingTicket[] = [
  // 1. Upcoming Flight (Mumbai to Delhi)
  {
    id: 'tkt_flight_01',
    bookingId: 'RT-FL-9281745',
    pnr: 'KEEGKX',
    title: 'Mumbai (BOM) to New Delhi (DEL)',
    titleMr: 'मुंबई (BOM) ते नवी दिल्ली (DEL)',
    vertical: 'flight',
    status: 'Upcoming',
    date: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
    travelTime: '21:00 - 23:05',
    duration: '2h 05m',
    provider: 'IndiGo 6E-6636 • Airbus A321neo',
    departureInfo: 'Chhatrapati Shivaji Maharaj Int\'l Airport, Terminal 2',
    arrivalInfo: 'Indira Gandhi Int\'l Airport, Terminal 1',
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
      accountMasked: 'HDFC Bank A/c ending in ••4210',
      paidAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  },
  // 2. Upcoming Train (Mumbai CSMT to Pune Jn Vande Bharat)
  {
    id: 'tkt_train_02',
    bookingId: 'RT-TR-4482910',
    pnr: '8249103847',
    title: 'Mumbai CSMT to Pune Jn',
    titleMr: 'मुंबई CSMT ते पुणे जंक्शन',
    vertical: 'train',
    status: 'Upcoming',
    date: new Date(Date.now() + 86400000 * 8).toISOString(), // 8 days from now
    travelTime: '06:05 - 09:15',
    duration: '3h 10m',
    provider: 'Vande Bharat Express (22223) • Executive Chair (EC)',
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
      accountMasked: 'SBI UPI •••••43210',
      paidAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  },
  // 3. Completed Hotel Stay (Goa Fort Aguada)
  {
    id: 'tkt_hotel_03',
    bookingId: 'RT-HTL-8823190',
    pnr: 'VOUCHER-TAJ-7721',
    title: 'Taj Fort Aguada Resort & Spa, Goa',
    titleMr: 'ताज फोर्ट अगुआडा रिसॉर्ट अँड स्पा, गोवा',
    vertical: 'hotel',
    status: 'Completed',
    date: new Date(Date.now() - 86400000 * 15).toISOString(),
    travelTime: 'Check-in: 14:00 • Check-out: 11:00',
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
      accountMasked: 'HDFC NetBanking A/c ending in ••4210',
      paidAt: new Date(Date.now() - 86400000 * 20).toISOString()
    }
  },
  // 4. Cancelled Bus Ticket (Pune to Goa Sleeper with Refund Proof)
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
    provider: 'IntrCity SmartBus • AC BharatBenz Sleeper (2+1)',
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
      accountMasked: 'HDFC Bank UPI •••••43210',
      paidAt: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    cancellationDetails: {
      cancelledAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      cancellationReason: 'Change in personal travel schedule',
      originalPaid: 1525,
      cancellationFee: 200,
      gstOnFee: 36,
      netRefundAmount: 1289,
      refundMethod: 'gateway',
      refundDestinationName: 'Razorpay UPI (HDFC Bank A/c ending in ••4210)',
      refundArn: 'ARN-RZPY-2026-981742091',
      refundStatus: 'Settled',
      settlementTimeline: 'Credited directly via UPI IMPS in 14 minutes',
      cancellationReceiptId: 'CN-RT-2026-0814'
    }
  }
];

type TicketListener = (tickets: BookingTicket[]) => void;
const listeners: Set<TicketListener> = new Set();

function loadTickets(): BookingTicket[] {
  if (typeof window === 'undefined') return INITIAL_SEEDED_TICKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_TICKETS));
      return INITIAL_SEEDED_TICKETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tickets from localStorage', e);
    return INITIAL_SEEDED_TICKETS;
  }
}

function saveTickets(tickets: BookingTicket[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Error saving tickets to localStorage', e);
  }
  listeners.forEach((fn) => fn(tickets));
}

export const TicketService = {
  getTickets(): BookingTicket[] {
    return loadTickets();
  },

  subscribe(listener: TicketListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Cancel an active ticket, calculate refund, and route money back to source gateway or wallet.
   */
  cancelTicket(
    ticketId: string,
    reason: string,
    refundDestination: 'gateway' | 'wallet'
  ): { success: boolean; ticket: BookingTicket; refundAmount: number; receiptId: string } {
    const current = loadTickets();
    const idx = current.findIndex((t) => t.id === ticketId);
    if (idx === -1) {
      throw new Error('Ticket not found');
    }

    const t = current[idx];
    if (t.status === 'Cancelled') {
      throw new Error('Ticket is already cancelled');
    }

    // Cancellation Fee Calculation (based on vertical & official cancellation rules)
    let feeRate = 0.15; // 15% default standard cancellation
    if (t.vertical === 'flight') feeRate = 0.20; // 20% airline fee
    if (t.vertical === 'train') feeRate = 0.10; // IRCTC standard clerkage fee
    if (t.vertical === 'hotel') feeRate = 0.12;

    const originalPaid = t.pricing.total;
    const cancellationFee = Math.round(originalPaid * feeRate);
    const gstOnFee = Math.round(cancellationFee * 0.18);
    const totalDeductions = cancellationFee + gstOnFee;
    const netRefundAmount = Math.max(0, originalPaid - totalDeductions);

    const now = new Date();
    const receiptId = `CN-RT-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const refundArn = `ARN-RZPY-${now.getFullYear()}-${Math.floor(100000000 + Math.random() * 900000000)}`;

    let refundDestinationName = '';
    if (refundDestination === 'wallet') {
      refundDestinationName = 'RouTripo Closed Travel Wallet (Instant Credit)';
      // Instant wallet credit
      ClosedWalletService.addCashbackOrCredit(
        netRefundAmount,
        `Refund for Cancelled ${t.vertical.toUpperCase()} (${t.bookingId})`
      );
    } else {
      refundDestinationName = `Original Payment Gateway: ${t.paymentDetails.method} (${t.paymentDetails.accountMasked})`;
    }

    const cancellationDetails: CancellationDetails = {
      cancelledAt: now.toISOString(),
      cancellationReason: reason || 'Requested by passenger',
      originalPaid,
      cancellationFee,
      gstOnFee,
      netRefundAmount,
      refundMethod: refundDestination,
      refundDestinationName,
      refundArn,
      refundStatus: 'Settled',
      settlementTimeline: refundDestination === 'wallet' 
        ? 'Instant credit reflected in your RouTripo Wallet balance'
        : 'Credited directly back to your original payment gateway account within 15-30 minutes',
      cancellationReceiptId: receiptId
    };

    const updatedTicket: BookingTicket = {
      ...t,
      status: 'Cancelled',
      cancellationDetails
    };

    current[idx] = updatedTicket;
    saveTickets(current);

    return {
      success: true,
      ticket: updatedTicket,
      refundAmount: netRefundAmount,
      receiptId
    };
  },

  /**
   * Reschedule / Change Date for an active booking.
   */
  rescheduleTicket(
    ticketId: string,
    newDateIso: string,
    newTravelTime?: string
  ): { success: boolean; ticket: BookingTicket } {
    const current = loadTickets();
    const idx = current.findIndex((t) => t.id === ticketId);
    if (idx === -1) {
      throw new Error('Ticket not found');
    }

    const t = current[idx];
    if (t.status === 'Cancelled') {
      throw new Error('Cannot reschedule a cancelled ticket');
    }

    const updatedTicket: BookingTicket = {
      ...t,
      date: newDateIso,
      travelTime: newTravelTime || t.travelTime
    };

    current[idx] = updatedTicket;
    saveTickets(current);

    return { success: true, ticket: updatedTicket };
  }
};
