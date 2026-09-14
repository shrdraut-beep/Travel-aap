export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: string;
}

export interface WalletData {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

const WALLET_KEY = 'routripo_user_wallet_data';

const INITIAL_WALLET: WalletData = {
  balance: 1500, // ₹1,500 Welcome Loyalty & Travel Balance
  currency: 'INR',
  transactions: [
    {
      id: 'tx-welcome-1',
      amount: 1500,
      type: 'credit',
      description: 'Welcome Promotional Travel Credits',
      timestamp: new Date().toISOString()
    }
  ]
};

export class WalletService {
  static getWalletData(): WalletData {
    try {
      const stored = localStorage.getItem(WALLET_KEY);
      if (!stored) {
        localStorage.setItem(WALLET_KEY, JSON.stringify(INITIAL_WALLET));
        return INITIAL_WALLET;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_WALLET;
    }
  }

  static getBalance(): number {
    return this.getWalletData().balance;
  }

  static deductBalance(amount: number, description: string): boolean {
    const data = this.getWalletData();
    if (data.balance < amount) return false;

    data.balance -= amount;
    data.transactions.unshift({
      id: `tx-debit-${Date.now()}`,
      amount,
      type: 'debit',
      description,
      timestamp: new Date().toISOString()
    });

    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to update wallet balance', e);
      return false;
    }
  }

  static creditRefund(amount: number, bookingRef: string, withBonus: boolean = true): number {
    const data = this.getWalletData();
    // 2% extra instant bonus if refunded to RoutTripo wallet instead of bank account!
    const finalAmount = withBonus ? Math.round(amount * 1.02) : amount;

    data.balance += finalAmount;
    data.transactions.unshift({
      id: `tx-credit-${Date.now()}`,
      amount: finalAmount,
      type: 'credit',
      description: `Instant Refund for ${bookingRef} ${withBonus ? '(Includes 2% Loyalty Bonus)' : ''}`.trim(),
      timestamp: new Date().toISOString()
    });

    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to credit wallet refund', e);
    }

    return finalAmount;
  }

  static addFunds(amount: number, description: string = 'UPI Wallet Top Up'): number {
    const data = this.getWalletData();
    data.balance += amount;
    data.transactions.unshift({
      id: `tx-topup-${Date.now()}`,
      amount,
      type: 'credit',
      description,
      timestamp: new Date().toISOString()
    });

    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to add funds to wallet', e);
    }
    return data.balance;
  }
}
