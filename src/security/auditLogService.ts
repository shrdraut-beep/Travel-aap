import crypto from 'crypto';

/**
 * Immutable Cryptographic Bidding Audit Log Service
 * 
 * Implements a hash-chained audit trail for all reverse bidding actions
 * (Bid Placed, Undercut, Counter-Offer, Deal Accepted, Contract Escrow Locked).
 */

export interface BiddingAuditPayload {
  transactionId: string;
  sessionId: string;
  userId: string;
  vendorId: string;
  action: 'BID_SUBMITTED' | 'DEAL_ACCEPTED' | 'CONTRACT_LOCKED' | 'ESCROW_SETTLED';
  amount: number;
  currency?: string;
  timestamp: string;
  previousBlockHash?: string;
  metadata?: Record<string, any>;
}

export interface StoredAuditBlock {
  blockIndex: number;
  transactionId: string;
  sessionId: string;
  blockHash: string;
  previousBlockHash: string;
  payload: BiddingAuditPayload;
  timestamp: string;
  isImmutableVerified: boolean;
}

/**
 * Computes SHA-256 hash for a transaction block
 */
export function generateBlockSha256Hash(payload: BiddingAuditPayload, previousHash: string = 'GENESIS_BLOCK_BIDINN_000'): string {
  const content = `${previousHash}|${payload.transactionId}|${payload.sessionId}|${payload.userId}|${payload.vendorId}|${payload.action}|${payload.amount}|${payload.timestamp}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * In-memory / client-side verification helper to validate chain integrity
 */
export function verifyAuditChainIntegrity(chain: StoredAuditBlock[]): boolean {
  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];
    const prevHash = i === 0 ? 'GENESIS_BLOCK_BIDINN_000' : chain[i - 1].blockHash;

    if (current.previousBlockHash !== prevHash) {
      return false;
    }

    const calculatedHash = generateBlockSha256Hash(current.payload, prevHash);
    if (calculatedHash !== current.blockHash) {
      return false;
    }
  }
  return true;
}
