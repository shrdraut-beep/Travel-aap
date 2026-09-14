import { Member, Expense, Deposit, Category, CalculationMode } from "./types";

export const getLanguageFullName = (langCode: string = 'mr'): string => {
  const map: Record<string, string> = {
    mr: 'Marathi',
    en: 'English',
    hi: 'Hindi',
    gu: 'Gujarati',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    bn: 'Bengali',
    pa: 'Punjabi',
    ml: 'Malayalam',
    or: 'Odia',
    as: 'Assamese',
    ur: 'Urdu',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    ja: 'Japanese'
  };
  return map[langCode] || 'Marathi';
};

/**
 * Calculates the net balances of all members and generates the optimal settlement transfers
 * (who owes whom how much) to clear all debts.
 * 
 * Formula for a member's net balance:
 *   Balance = (Deposited to Common Pool) + (Paid Out-of-Pocket for Expenses) - (Share of Expenses Owed)
 */
export interface Transfer {
  from: string; // Member Name
  fromId: string; // Member ID
  to: string;   // Member Name
  toId: string;   // Member ID
  amount: number;
}

export function getUniqueMembers(members: Member[] = []): Member[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const unique: Member[] = [];
  for (const m of members) {
    if (!m) continue;
    const idKey = m.id ? String(m.id).trim() : '';
    const nameKey = m.name ? String(m.name).trim().toLowerCase() : '';
    
    if (idKey && seenIds.has(idKey)) continue;
    if (nameKey && seenNames.has(nameKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);
    unique.push(m);
  }
  return unique;
}

export function calculateSettlements(
  rawMembers: Member[] = [],
  expenses: Expense[] = [],
  deposits: Deposit[] = [],
  adminId?: string,
  calculationMode: CalculationMode = 'individual_split'
): {
  balances: { [memberId: string]: number };
  transfers: Transfer[];
} {
  const members = getUniqueMembers(rawMembers);
  const balances: { [memberId: string]: number } = {};

  // Initialize balances with 0
  members.forEach((m) => {
    balances[m.id] = 0;
  });

  const effectiveAdminId = adminId || (members.length > 0 ? members[0].id : undefined);

  // 1. Add deposits to their balance
  deposits.forEach((dep) => {
    if (calculationMode === 'admin_pooled') {
      // In Admin Pooled, money goes to Admin. 
      // Depositor is + (lent money to pool), Admin is - (holds the money/debt to pool)
      if (effectiveAdminId && dep.memberId !== effectiveAdminId) {
        if (balances[dep.memberId] !== undefined) balances[dep.memberId] += dep.amount;
        if (balances[effectiveAdminId] !== undefined) balances[effectiveAdminId] -= dep.amount;
      }
    } else {
      // In Individual Split, deposits are usually just repayments or initial fund.
      // We'll treat it as credit to the member.
      if (balances[dep.memberId] !== undefined) balances[dep.memberId] += dep.amount;
    }
  });

  // 2. Add out-of-pocket expenses and subtract shared splits
  expenses.forEach((exp) => {
    // Add full amount to the payer's balance (they spent their own cash)
    const effectivePayer = exp.paidBy === "pool" && effectiveAdminId ? effectiveAdminId : exp.paidBy;
    if (effectivePayer !== "pool" && balances[effectivePayer] !== undefined) {
      balances[effectivePayer] += exp.amount;
    }

    // Split amount among recipients
    const splitCount = exp.splitWith.length;
    if (splitCount > 0) {
      const share = exp.amount / splitCount;
      exp.splitWith.forEach((memberId) => {
        if (balances[memberId] !== undefined) {
          balances[memberId] -= share;
        }
      });
    }
  });

  // Calculate transfers using a greedy approach matching debtors and creditors
  const membersList = members.map((m) => ({
    id: m.id,
    name: m.name,
    balance: Math.round((balances[m.id] || 0) * 100) / 100,
  }));

  const transfers: Transfer[] = [];

  // Separate into debtors (negative balance) and creditors (positive balance)
  let debtors = membersList
    .filter((m) => m.balance < -0.05)
    .sort((a, b) => a.balance - b.balance); // Most negative first
  let creditors = membersList
    .filter((m) => m.balance > 0.05)
    .sort((a, b) => b.balance - a.balance); // Most positive first

  let maxIterations = 100; // Prevent infinite loop
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length && maxIterations > 0) {
    maxIterations--;
    const debtor = debtors[i];
    const creditor = creditors[j];

    // Amount to transfer is the minimum of what debtor owes vs what creditor gets
    const debitAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;
    const transferAmount = Math.min(debitAmount, creditAmount);

    if (transferAmount > 0.05) {
      transfers.push({
        from: debtor.name,
        fromId: debtor.id,
        to: creditor.name,
        toId: creditor.id,
        amount: Math.round(transferAmount * 100) / 100,
      });
    }

    // Update balances
    debtor.balance += transferAmount;
    creditor.balance -= transferAmount;

    if (Math.abs(debtor.balance) < 0.05) {
      i++;
    }
    if (Math.abs(creditor.balance) < 0.05) {
      j++;
    }
  }

  return {
    balances,
    transfers,
  };
}

export function calculateFamilySettlements(
  members: Member[],
  expenses: Expense[],
  deposits: Deposit[],
  splitMode: 'person' | 'family',
  adminId?: string
): {
  balances: { [familyName: string]: number };
  transfers: Transfer[];
} {
  const familyBalances: { [familyName: string]: number } = {};

  // Map memberId to familyName
  const memberFamily: { [memberId: string]: string } = {};
  members.forEach((m) => {
    const fam = m.familyName?.trim() || m.name.trim();
    memberFamily[m.id] = fam;
    familyBalances[fam] = 0;
  });

  // 1. Add deposits to family balance
  deposits.forEach((dep) => {
    const fam = memberFamily[dep.memberId];
    const adminFam = adminId ? memberFamily[adminId] : null;
    if (fam && adminFam && fam !== adminFam) {
      if (familyBalances[fam] !== undefined) familyBalances[fam] += dep.amount;
      if (familyBalances[adminFam] !== undefined) familyBalances[adminFam] -= dep.amount;
    }
  });

  // 2. Add expenses and subtract shared splits
  expenses.forEach((exp) => {
    const effectivePayer = exp.paidBy === "pool" && adminId ? adminId : exp.paidBy;
    if (effectivePayer !== "pool") {
      const payerFam = memberFamily[effectivePayer];
      if (payerFam && familyBalances[payerFam] !== undefined) {
        familyBalances[payerFam] += exp.amount;
      }
    }

    if (splitMode === 'family') {
      // Split mode: family (equal share per family represented)
      const uniqueFamList = Array.from(new Set(exp.splitWith.map(sid => memberFamily[sid]).filter(Boolean)));
      const splitCount = uniqueFamList.length;
      if (splitCount > 0) {
        const share = exp.amount / splitCount;
        uniqueFamList.forEach((fam) => {
          if (familyBalances[fam] !== undefined) {
            familyBalances[fam] -= share;
          }
        });
      }
    } else {
      // Split mode: person (equal share per person, summed up by family)
      const splitCount = exp.splitWith.length;
      if (splitCount > 0) {
        const share = exp.amount / splitCount;
        exp.splitWith.forEach((memberId) => {
          const fam = memberFamily[memberId];
          if (fam && familyBalances[fam] !== undefined) {
            familyBalances[fam] -= share;
          }
        });
      }
    }
  });

  // Calculate family-wise transfers using greedy approach
  const familiesList = Object.keys(familyBalances).map((famName) => ({
    id: famName,
    name: famName,
    balance: Math.round(familyBalances[famName] * 100) / 100,
  }));

  const transfers: Transfer[] = [];
  let debtors = familiesList
    .filter((f) => f.balance < -0.05)
    .sort((a, b) => a.balance - b.balance);
  let creditors = familiesList
    .filter((f) => f.balance > 0.05)
    .sort((a, b) => b.balance - a.balance);

  let maxIterations = 100;
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length && maxIterations > 0) {
    maxIterations--;
    const debtor = debtors[i];
    const creditor = creditors[j];

    const debitAmount = Math.abs(debtor.balance);
    const creditAmount = creditor.balance;
    const transferAmount = Math.min(debitAmount, creditAmount);

    if (transferAmount > 0.05) {
      transfers.push({
        from: debtor.name,
        fromId: debtor.id,
        to: creditor.name,
        toId: creditor.id,
        amount: Math.round(transferAmount * 100) / 100,
      });
    }

    debtor.balance += transferAmount;
    creditor.balance -= transferAmount;

    if (Math.abs(debtor.balance) < 0.05) {
      i++;
    }
    if (Math.abs(creditor.balance) < 0.05) {
      j++;
    }
  }

  return {
    balances: familyBalances,
    transfers,
  };
}

// Color palette for member avatars
export const AVATAR_COLORS = [
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
];

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function getCurrencySymbol(currencyCode?: string): string {
  switch (currencyCode) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'AED': return 'AED ';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'INR':
    default: return '₹';
  }
}

/**
 * Formats a date string, Date object, or timestamp into 'DD/MM/YYYY' format.
 * Falls back gracefully if invalid.
 */
export function formatDate(dateInput?: string | Date | number | null): string {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateInput);
  }
}

/**
 * Formats currency amount with symbol and local number formatting.
 * e.g., formatCurrency(1250, 'INR') -> "₹1,250"
 */
export function formatCurrency(amount?: number | string | null, currencyCode: string = 'INR'): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const safeNum = isNaN(num) ? 0 : num;
  const symbol = getCurrencySymbol(currencyCode);
  const formattedNumber = safeNum.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  return `${symbol}${formattedNumber}`;
}

export const CATEGORY_STYLES: {
  [key in Category]: { color: string; bgColor: string; labelMr: string; labelEn: string };
} = {
  food: {
    color: "text-orange-600",
    bgColor: "bg-orange-50 border border-orange-200",
    labelMr: "जेवण",
    labelEn: "Food",
  },
  traveling: {
    color: "text-rose-600",
    bgColor: "bg-rose-50 border border-rose-200",
    labelMr: "प्रवास",
    labelEn: "Traveling",
  },
  personal: {
    color: "text-rose-600",
    bgColor: "bg-rose-50 border border-rose-200",
    labelMr: "वैयक्तिक",
    labelEn: "Personal",
  },
  restaurant: {
    color: "text-orange-800",
    bgColor: "bg-orange-100 border border-orange-300",
    labelMr: "उपाहारगृह / रेस्टॉरंट",
    labelEn: "Restaurant",
  },
  tips: {
    color: "text-orange-600",
    bgColor: "bg-orange-50 border border-orange-200",
    labelMr: "बक्षीस / टीप",
    labelEn: "Tips",
  },
  transport: {
    color: "text-orange-600",
    bgColor: "bg-orange-50 border border-orange-200",
    labelMr: "वाहतूक",
    labelEn: "Transport",
  },
  fuel: {
    color: "text-pink-700",
    bgColor: "bg-pink-50 border border-pink-200",
    labelMr: "इंधन / डिझेल-पेट्रोल",
    labelEn: "Fuel",
  },
  fun: {
    color: "text-pink-600",
    bgColor: "bg-pink-50 border border-pink-200",
    labelMr: "मनोरंजन",
    labelEn: "Fun",
  },
  highway: {
    color: "text-slate-600",
    bgColor: "bg-slate-100 border border-slate-200",
    labelMr: "हायवे टोल / टोल नाका",
    labelEn: "Highway & Toll",
  },
  hotels: {
    color: "text-pink-600",
    bgColor: "bg-pink-50 border border-pink-200",
    labelMr: "हॉटेल्स",
    labelEn: "Hotels",
  },
  other: {
    color: "text-purple-600",
    bgColor: "bg-purple-50 border border-purple-200",
    labelMr: "इतर",
    labelEn: "Other",
  },
};

/**
 * Safely copies text to clipboard, catching "Document is not focused" errors in iframe environments
 * and falling back to hidden textarea execCommand copy.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard if supported
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed or document not focused, attempting fallback:', err);
    }
  }

  // 2. Fallback using temporary HTML textarea element
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('Fallback execCommand copy failed:', fallbackErr);
    return false;
  }
}
