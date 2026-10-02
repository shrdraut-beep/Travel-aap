import { ClosedWalletService } from './ClosedWalletService';

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

export class WalletService {
  static getWalletData(): WalletData {
    const closed = ClosedWalletService.getAccount();
    return {
      balance: closed.totalBalance,
      currency: closed.currency,
      transactions: closed.transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.direction,
        description: t.description,
        timestamp: t.timestamp
      }))
    };
  }

  static getBalance(): number {
    return ClosedWalletService.getAccount().totalBalance;
  }

  static deductBalance(amount: number, description: string): boolean {
    const res = ClosedWalletService.payForBooking(`manual-${Date.now()}`, amount, description);
    return res.success;
  }

  static creditRefund(amount: number, bookingRef: string, withBonus: boolean = true): number {
    return ClosedWalletService.creditRefund(amount, bookingRef, withBonus);
  }

  static addFunds(amount: number, description: string = 'UPI Wallet Top Up'): number {
    const res = ClosedWalletService.topUp(amount, 'UPI');
    return res.newBalance;
  }
}
