/**
 * Custom Bidding Rate Limiter & Paywall Utility (Bargaining Module)
 * 
 * Rules:
 * 1. Allow a maximum of 3 FREE "Post Custom Trip Requirement" submissions per user per 24 hours.
 * 2. On the 4th custom requirement submission, block it and display:
 *    "Daily limit reached. Pay ₹29 to post another custom bidding request."
 * 3. Wire this to Razorpay. On successful ₹29 payment, allow posting the requirement.
 */

export interface CustomBiddingLimitState {
  count: number;
  resetTimestamp: number;
  unlockedExtra: number;
}

const STORAGE_KEY = 'routripo_custom_bidding_rate_limit';
export const FREE_DAILY_CUSTOM_BID_LIMIT = 3;
export const CUSTOM_BID_UNLOCK_FEE_INR = 29;

/**
 * Reads state from localStorage, automatically resetting every 24 hours.
 */
export function getCustomBiddingRateLimit(): CustomBiddingLimitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (raw) {
      const parsed: CustomBiddingLimitState = JSON.parse(raw);
      if (now >= parsed.resetTimestamp) {
        const fresh: CustomBiddingLimitState = {
          count: 0,
          resetTimestamp: now + 24 * 60 * 60 * 1000,
          unlockedExtra: 0
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      return parsed;
    }

    const fresh: CustomBiddingLimitState = {
      count: 0,
      resetTimestamp: now + 24 * 60 * 60 * 1000,
      unlockedExtra: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  } catch (err) {
    console.error('Failed to read custom bidding rate limit:', err);
    return {
      count: 0,
      resetTimestamp: Date.now() + 24 * 60 * 60 * 1000,
      unlockedExtra: 0
    };
  }
}

/**
 * Checks whether the user can post another custom trip requirement.
 */
export function checkCustomBiddingAllowance(): {
  allowed: boolean;
  count: number;
  freeLimit: number;
  unlockedExtra: number;
  totalAllowed: number;
  remaining: number;
  resetTimestamp: number;
} {
  const state = getCustomBiddingRateLimit();
  const totalAllowed = FREE_DAILY_CUSTOM_BID_LIMIT + (state.unlockedExtra || 0);
  const remaining = Math.max(0, totalAllowed - state.count);
  const allowed = state.count < totalAllowed;

  return {
    allowed,
    count: state.count,
    freeLimit: FREE_DAILY_CUSTOM_BID_LIMIT,
    unlockedExtra: state.unlockedExtra || 0,
    totalAllowed,
    remaining,
    resetTimestamp: state.resetTimestamp
  };
}

/**
 * Records a successful custom trip requirement submission.
 */
export function recordCustomBiddingSubmission(): CustomBiddingLimitState {
  const state = getCustomBiddingRateLimit();
  state.count += 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to update submission count:', err);
  }
  return state;
}

/**
 * Unlocks an additional submission after ₹29 Razorpay microtransaction succeeds.
 */
export function unlockAdditionalBiddingRequest(): CustomBiddingLimitState {
  const state = getCustomBiddingRateLimit();
  state.unlockedExtra = (state.unlockedExtra || 0) + 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to record unlock payment:', err);
  }
  return state;
}

/**
 * Helper to display human-readable countdown until the 24h cycle resets.
 */
export function formatBiddingResetCountdown(resetTimestamp: number): string {
  const diff = Math.max(0, resetTimestamp - Date.now());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}
