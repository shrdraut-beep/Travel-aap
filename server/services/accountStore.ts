import fs from "fs";
import path from "path";
import type { Firestore } from "firebase-admin/firestore";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "agent" | "admin";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  tripsCount: number;
  totalSpent: number;
  joinedDate: string;
}

export interface AccountVendor {
  id: string;
  agencyName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  category: "Tour Operator" | "Hotel Partner" | "Cab Fleet" | "Activity Provider";
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  kycBadge: "VERIFIED" | "PENDING" | "SUBMITTED";
  pennyDrop: "VERIFIED" | "PENDING";
  vahanStatus: "VALID_COMMERCIAL_RC" | "NOT_REQUIRED" | "PENDING";
  appliedDate: string;
  fleetSize?: number;
  hotelRooms?: number;
  rejectionReason?: string;
}

export interface AccountPayout {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  bankAccount: string;
  ifsc: string;
  cycle: string;
  status: "PENDING" | "RELEASED" | "FAILED";
  requestedDate: string;
  releasedDate?: string;
  transactionRef?: string;
}

export interface AccountTicket {
  id: string;
  user: string;
  email: string;
  subject: string;
  type: "REFUND" | "BOOKING_ISSUE" | "DISPUTE" | "GENERAL";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface PartnerTransaction {
  id: string;
  label: string;
  amount: number;
  type: "credit" | "debit" | "escrow";
  date: string;
  status: string;
}

export interface PartnerAccountData {
  balance: number;
  pending: number;
  lifetime: number;
  commissionRate: string;
  transactions: PartnerTransaction[];
}

interface StoreSchema {
  users: AccountUser[];
  vendors: AccountVendor[];
  payouts: AccountPayout[];
  tickets: AccountTicket[];
  partnerData: Record<string, PartnerAccountData>;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "account_store.json");

function ensureDirSync(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadStore(): StoreSchema {
  try {
    ensureDirSync(DATA_DIR);
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[accountStore] Error reading store file:", err);
  }

  // Initial clean empty store structure
  const initial: StoreSchema = {
    users: [],
    vendors: [],
    payouts: [],
    tickets: [],
    partnerData: {}
  };
  saveStore(initial);
  return initial;
}

function saveStore(data: StoreSchema) {
  try {
    ensureDirSync(DATA_DIR);
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[accountStore] Error saving store file:", err);
  }
}

// In-memory cache synced with disk
let cachedStore: StoreSchema = loadStore();

/* =========================================================================
   Admin Metrics
   ========================================================================= */
export async function getAdminMetrics(db?: Firestore | null) {
  let usersCount = cachedStore.users.length;
  let activeBookings = 0;
  let packagesCount = 0;

  if (db) {
    try {
      const uSnap = await db.collection("users").count().get();
      usersCount = uSnap.data().count || usersCount;
      const bSnap = await db.collection("bookings").count().get();
      activeBookings = bSnap.data().count || activeBookings;
      const pSnap = await db.collection("packages").count().get();
      packagesCount = pSnap.data().count || packagesCount;
    } catch {
      // ignore
    }
  }

  const grossRevenue = cachedStore.users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
  const pendingPayouts = cachedStore.payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);
  const commission = Math.round(grossRevenue * 0.07);

  return {
    grossRevenue,
    commission,
    usersCount,
    packagesCount,
    activeBookings,
    pendingPayouts,
    trend: [
      { month: "Jan", amount: Math.round(grossRevenue * 0.1) },
      { month: "Feb", amount: Math.round(grossRevenue * 0.2) },
      { month: "Mar", amount: Math.round(grossRevenue * 0.3) },
      { month: "Apr", amount: Math.round(grossRevenue * 0.4) }
    ]
  };
}

/* =========================================================================
   Admin Vendors
   ========================================================================= */
export async function getAdminVendors(db?: Firestore | null): Promise<AccountVendor[]> {
  if (db) {
    try {
      const snap = await db.collection("vendors").limit(100).get();
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountVendor));
      }
    } catch {
      // fallback to store
    }
  }
  return cachedStore.vendors;
}

export async function reviewAdminVendor(
  vendorId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
  db?: Firestore | null
) {
  const v = cachedStore.vendors.find((item) => item.id === vendorId);
  if (v) {
    v.status = status;
    if (status === "REJECTED" && rejectionReason) {
      v.rejectionReason = rejectionReason;
    }
    saveStore(cachedStore);
  }

  if (db) {
    try {
      await db.collection("vendors").doc(vendorId).set(
        {
          status,
          rejectionReason: rejectionReason || null,
          reviewedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("[accountStore] Firestore update vendor failed:", e);
    }
  }
  return v;
}

/* =========================================================================
   Admin Payouts
   ========================================================================= */
export async function getAdminPayouts(db?: Firestore | null): Promise<AccountPayout[]> {
  if (db) {
    try {
      const snap = await db.collection("payouts").limit(100).get();
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountPayout));
      }
    } catch {
      // fallback to store
    }
  }
  return cachedStore.payouts;
}

export async function releaseAdminPayout(payoutId: string, db?: Firestore | null) {
  const p = cachedStore.payouts.find((item) => item.id === payoutId);
  if (p) {
    p.status = "RELEASED";
    p.releasedDate = new Date().toISOString();
    p.transactionRef = `IMPS-${Date.now().toString().slice(-8)}`;
    saveStore(cachedStore);
  }

  if (db) {
    try {
      await db.collection("payouts").doc(payoutId).set(
        {
          status: "RELEASED",
          releasedDate: new Date().toISOString(),
          transactionRef: `IMPS-${Date.now().toString().slice(-8)}`
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("[accountStore] Firestore update payout failed:", e);
    }
  }
  return p;
}

/* =========================================================================
   Admin Users
   ========================================================================= */
export async function getAdminUsers(db?: Firestore | null): Promise<AccountUser[]> {
  if (db) {
    try {
      const snap = await db.collection("users").limit(100).get();
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountUser));
      }
    } catch {
      // fallback to store
    }
  }
  return cachedStore.users;
}

export async function updateAdminUser(
  userId: string,
  role?: "user" | "agent" | "admin",
  status?: "ACTIVE" | "SUSPENDED" | "PENDING",
  db?: Firestore | null
) {
  let u = cachedStore.users.find((item) => item.id === userId);
  if (!u) {
    u = {
      id: userId,
      name: "User " + userId.slice(0, 5),
      email: `${userId}@routripo.app`,
      role: role || "user",
      status: status || "ACTIVE",
      tripsCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().substring(0, 10)
    };
    cachedStore.users.push(u);
  }
  if (role) u.role = role;
  if (status) u.status = status;
  saveStore(cachedStore);

  if (db) {
    try {
      await db.collection("users").doc(userId).set({ role, status }, { merge: true });
    } catch (e) {
      console.warn("[accountStore] Firestore update user failed:", e);
    }
  }
  return u;
}

/* =========================================================================
   Admin Tickets
   ========================================================================= */
export async function getAdminTickets(db?: Firestore | null): Promise<AccountTicket[]> {
  if (db) {
    try {
      const snap = await db.collection("tickets").limit(100).get();
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountTicket));
      }
    } catch {
      // fallback to store
    }
  }
  return cachedStore.tickets;
}

export async function resolveAdminTicket(
  ticketId: string,
  resolution: string,
  db?: Firestore | null
) {
  const t = cachedStore.tickets.find((item) => item.id === ticketId);
  if (t) {
    t.status = "RESOLVED";
    t.resolvedAt = new Date().toISOString();
    t.resolution = resolution;
    saveStore(cachedStore);
  }

  if (db) {
    try {
      await db.collection("tickets").doc(ticketId).set(
        {
          status: "RESOLVED",
          resolvedAt: new Date().toISOString(),
          resolution
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("[accountStore] Firestore update ticket failed:", e);
    }
  }
  return t;
}

/* =========================================================================
   Partner / Agent Earnings
   ========================================================================= */
export function getPartnerEarnings(partnerKey = "default"): PartnerAccountData {
  if (!cachedStore.partnerData[partnerKey]) {
    cachedStore.partnerData[partnerKey] = {
      balance: 0,
      pending: 0,
      lifetime: 0,
      commissionRate: "7.5%",
      transactions: []
    };
    saveStore(cachedStore);
  }
  return cachedStore.partnerData[partnerKey];
}

export function withdrawPartnerEarnings(
  amount: number,
  destination: string,
  partnerKey = "default"
) {
  const current = getPartnerEarnings(partnerKey);
  const newBalance = Math.max(0, current.balance - amount);
  current.balance = newBalance;
  current.transactions.unshift({
    id: `TX-${Date.now().toString().slice(-6)}`,
    label: `Withdrawal to ${destination}`,
    amount: -amount,
    type: "debit",
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    status: "PROCESSING"
  });
  saveStore(cachedStore);
  return { newBalance, current };
}

export function releasePartnerEscrow(
  bookingId: string,
  checkInOtp: string,
  partnerKey = "default"
) {
  const current = getPartnerEarnings(partnerKey);
  // Unhold escrow and credit to balance
  const releasedAmount = 13800;
  current.balance += releasedAmount;
  current.lifetime += releasedAmount;
  current.pending = Math.max(0, current.pending - releasedAmount);
  current.transactions.unshift({
    id: `ESC-${Date.now().toString().slice(-6)}`,
    label: `Escrow Released · Booking #${bookingId}`,
    amount: releasedAmount,
    type: "credit",
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    status: "RELEASED"
  });
  saveStore(cachedStore);
  return { releasedAmount, current };
}
