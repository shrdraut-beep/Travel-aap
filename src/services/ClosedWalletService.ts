/**
 * RouTripo Closed-Loop Travel Wallet Service
 * 
 * Regulated under Reserve Bank of India (RBI) Master Directions on
 * Issuance and Operation of Prepaid Payment Instruments (PPIs) - Closed System PPIs.
 * 
 * Regulatory Rules Implemented:
 * 1. Closed-System PPI: Exclusively redeemable for travel bookings (flights, stays, cabs, packages) on RouTripo.
 * 2. Non-Withdrawable: Under RBI rules, cash withdrawals, ATM disbursements, and remittances to bank accounts are strictly prohibited.
 * 3. Permitted Loading: Reloadable via UPI, NetBanking, Debit/Credit Cards.
 * 4. Merged Loyalty Coins: Promotional RouTripo Coins (10 Coins = ₹1) are automatically merged into the wallet's spendable balance.
 * 5. Instant Refunds: Booking cancellation refunds are credited back to the closed wallet with optional loyalty bonuses.
 */

export interface ClosedWalletTransaction {
  id: string;
  type: 'topup' | 'booking_payment' | 'coin_bonus' | 'refund' | 'coin_merge';
  direction: 'credit' | 'debit';
  amount: number;
  description: string;
  source: 'UPI' | 'Card' | 'NetBanking' | 'Coins_Reward' | 'Booking_Refund' | 'Travel_Checkout';
  bookingId?: string;
  timestamp: string;
  status: 'completed' | 'failed';
  referenceId: string;
}

export interface ClosedWalletAccount {
  id: string;
  userId: string;
  currency: 'INR';
  totalBalance: number;       // Total spendable: topUpBalance + coinValueInRupees
  topUpBalance: number;       // Cash loaded via UPI/Card
  coinBalance: number;        // Loyalty coins (e.g. 3,420)
  coinValueInRupees: number;  // 10 coins = ₹1 (e.g. ₹342)
  isClosedPPI: true;          // Regulatory indicator
  rbiLicenseType: 'CLOSED_SYSTEM_PPI';
  rbiCircularRef: 'RBI/DPSS/2017-18/PPI-CLOSED-SEC-2.1';
  lastUpdated: string;
  transactions: ClosedWalletTransaction[];
}

const STORAGE_KEY = 'routripo_closed_wallet_account';
const COIN_CONVERSION_RATE = 10; // 10 RouTripo Coins = ₹1 INR

const INITIAL_CLOSED_WALLET: ClosedWalletAccount = {
  id: 'cw-act-9842',
  userId: 'user_default',
  currency: 'INR',
  totalBalance: 2842, // ₹2,500 Cash Top-Up + ₹342 Merged Coins
  topUpBalance: 2500,
  coinBalance: 3420,
  coinValueInRupees: 342,
  isClosedPPI: true,
  rbiLicenseType: 'CLOSED_SYSTEM_PPI',
  rbiCircularRef: 'RBI/DPSS/2017-18/PPI-CLOSED-SEC-2.1',
  lastUpdated: new Date().toISOString(),
  transactions: [
    {
      id: 'tx-init-topup',
      type: 'topup',
      direction: 'credit',
      amount: 2500,
      description: 'UPI Instant Top-Up (Google Pay)',
      source: 'UPI',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'completed',
      referenceId: 'UPI-RRR-90482103'
    },
    {
      id: 'tx-coin-merge',
      type: 'coin_merge',
      direction: 'credit',
      amount: 342,
      description: 'Merged 3,420 RouTripo Coins (10 Coins = ₹1)',
      source: 'Coins_Reward',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      referenceId: 'COIN-REWARD-3420'
    },
    {
      id: 'tx-cashback',
      type: 'coin_bonus',
      direction: 'credit',
      amount: 250,
      description: 'Domestic Flight Cashback (BOM-DEL)',
      source: 'Booking_Refund',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'completed',
      referenceId: 'RT-CB-84920'
    }
  ]
};

type WalletListener = (account: ClosedWalletAccount) => void;
const listeners = new Set<WalletListener>();

export class ClosedWalletService {
  /**
   * Retrieves the current closed wallet account
   */
  static getAccount(): ClosedWalletAccount {
    if (typeof window === 'undefined') return INITIAL_CLOSED_WALLET;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLOSED_WALLET));
        return INITIAL_CLOSED_WALLET;
      }
      const parsed: ClosedWalletAccount = JSON.parse(saved);
      // Ensure recalculation of totalBalance = topUpBalance + coinValueInRupees
      parsed.coinValueInRupees = Math.floor(parsed.coinBalance / COIN_CONVERSION_RATE);
      parsed.totalBalance = parsed.topUpBalance + parsed.coinValueInRupees;
      return parsed;
    } catch (e) {
      console.error('Failed to parse ClosedWalletAccount', e);
      return INITIAL_CLOSED_WALLET;
    }
  }

  /**
   * Subscribe to wallet changes for real-time reactivity
   */
  static subscribe(listener: WalletListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  private static notifyListeners(account: ClosedWalletAccount) {
    listeners.forEach((listener) => {
      try {
        listener(account);
      } catch (err) {
        console.error('Error in wallet listener', err);
      }
    });
  }

  private static saveAccount(account: ClosedWalletAccount): void {
    if (typeof window === 'undefined') return;
    try {
      account.coinValueInRupees = Math.floor(account.coinBalance / COIN_CONVERSION_RATE);
      account.totalBalance = account.topUpBalance + account.coinValueInRupees;
      account.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      this.notifyListeners(account);
    } catch (e) {
      console.error('Failed to save ClosedWalletAccount', e);
    }
  }

  /**
   * Top-Up Wallet (Permitted by RBI PPI Regulations)
   */
  static topUp(amount: number, method: 'UPI' | 'Card' | 'NetBanking' = 'UPI'): {
    success: boolean;
    newBalance: number;
    transaction: ClosedWalletTransaction;
  } {
    if (amount <= 0) throw new Error('Invalid top-up amount');

    const account = this.getAccount();
    const tx: ClosedWalletTransaction = {
      id: `tx-topup-${Date.now()}`,
      type: 'topup',
      direction: 'credit',
      amount,
      description: `${method} Instant Wallet Top-Up`,
      source: method,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `${method}-REF-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    account.topUpBalance += amount;
    account.transactions.unshift(tx);
    this.saveAccount(account);

    return {
      success: true,
      newBalance: account.totalBalance,
      transaction: tx
    };
  }

  /**
   * Merge or Credit RouTripo Loyalty Coins into the wallet
   */
  static creditCoins(coinsToAdd: number, reason: string = 'Voyager Loyalty Reward'): {
    success: boolean;
    newTotalBalance: number;
    newCoinBalance: number;
  } {
    if (coinsToAdd <= 0) return { success: false, newTotalBalance: 0, newCoinBalance: 0 };

    const account = this.getAccount();
    account.coinBalance += coinsToAdd;
    const addedRupeeValue = Math.floor(coinsToAdd / COIN_CONVERSION_RATE);

    const tx: ClosedWalletTransaction = {
      id: `tx-coins-${Date.now()}`,
      type: 'coin_bonus',
      direction: 'credit',
      amount: addedRupeeValue,
      description: `${reason} (+${coinsToAdd.toLocaleString()} Coins)`,
      source: 'Coins_Reward',
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `COIN-${Date.now().toString(36).toUpperCase()}`
    };

    account.transactions.unshift(tx);
    this.saveAccount(account);

    return {
      success: true,
      newTotalBalance: account.totalBalance,
      newCoinBalance: account.coinBalance
    };
  }

  /**
   * Debit funds for booking payment (Exclusively permitted on RouTripo)
   */
  static payForBooking(bookingId: string, amount: number, serviceName: string): {
    success: boolean;
    newBalance: number;
    error?: string;
  } {
    const account = this.getAccount();
    if (account.totalBalance < amount) {
      return {
        success: false,
        newBalance: account.totalBalance,
        error: `Insufficient wallet balance. Total available: ₹${account.totalBalance.toLocaleString('en-IN')}`
      };
    }

    // Debit prioritized: first from coins value, then from topUp cash
    let remainingDebit = amount;
    if (account.coinValueInRupees > 0) {
      const coinDebit = Math.min(account.coinValueInRupees, remainingDebit);
      account.coinBalance -= coinDebit * COIN_CONVERSION_RATE;
      remainingDebit -= coinDebit;
    }
    if (remainingDebit > 0) {
      account.topUpBalance -= remainingDebit;
    }

    const tx: ClosedWalletTransaction = {
      id: `tx-pay-${Date.now()}`,
      type: 'booking_payment',
      direction: 'debit',
      amount,
      description: `Travel Booking Payment for ${serviceName}`,
      source: 'Travel_Checkout',
      bookingId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `BK-PAY-${bookingId}`
    };

    account.transactions.unshift(tx);
    this.saveAccount(account);

    return {
      success: true,
      newBalance: account.totalBalance
    };
  }

  /**
   * Credit Instant Refund to Closed Wallet with optional 2% loyalty bonus
   */
  static creditRefund(amount: number, bookingId: string, withBonus: boolean = true): number {
    const account = this.getAccount();
    const finalCredit = withBonus ? Math.round(amount * 1.02) : amount;

    account.topUpBalance += finalCredit;
    const tx: ClosedWalletTransaction = {
      id: `tx-ref-${Date.now()}`,
      type: 'refund',
      direction: 'credit',
      amount: finalCredit,
      description: `Instant Refund for ${bookingId} ${withBonus ? '(Includes 2% Loyalty Bonus)' : ''}`.trim(),
      source: 'Booking_Refund',
      bookingId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `RFND-${bookingId}`
    };

    account.transactions.unshift(tx);
    this.saveAccount(account);
    return finalCredit;
  }

  /**
   * Add general cashback or direct credit
   */
  static addCashbackOrCredit(amount: number, description: string): number {
    const account = this.getAccount();
    account.topUpBalance += amount;
    const tx: ClosedWalletTransaction = {
      id: `tx-cred-${Date.now()}`,
      type: 'refund',
      direction: 'credit',
      amount: amount,
      description: description,
      source: 'Booking_Refund',
      timestamp: new Date().toISOString(),
      status: 'completed',
      referenceId: `CRED-${Date.now()}`
    };
    account.transactions.unshift(tx);
    this.saveAccount(account);
    return amount;
  }

  /**
   * Attempt Withdrawal / Cash-out
   * STRICTLY BLOCKED as per Reserve Bank of India (RBI) Closed-Loop PPI Regulations.
   */
  static attemptWithdrawal(amountRequested: number): {
    allowed: false;
    reasonMr: string;
    reasonEn: string;
    rbiRuleTitle: string;
    rbiCircularRef: string;
  } {
    return {
      allowed: false,
      rbiRuleTitle: 'RBI Master Directions on Closed System PPIs (Prepaid Payment Instruments)',
      rbiCircularRef: 'RBI/DPSS/2017-18/PPI-CLOSED-SEC-2.1',
      reasonEn: 'Under Reserve Bank of India (RBI) PPI Guidelines, funds in this Closed-Loop Travel Wallet are exclusively redeemable for travel bookings (flights, stays, cabs) on RouTripo. Cash withdrawals, ATM dispensations, and transfers to bank accounts are legally prohibited.',
      reasonMr: 'भारतीय रिझर्व्ह बँक (RBI) च्या क्लोज्ड-सिस्टम वॉलेट (Closed PPI) नियमांनुसार, हे वॉलेट केवळ RouTripo वरील ट्रॅव्हल बुकिंगसाठी वापरता येते. यातील रक्कम बँकेत काढणे (Withdrawal) किंवा कॅश करणे कायद्यानुसार पूर्णपणे प्रतिबंधित आहे.'
    };
  }
}
