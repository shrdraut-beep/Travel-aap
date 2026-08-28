/**
 * Unrealistic Budget Sanity Filter (Anti-Spam Threshold)
 * Prevents trolling/spam bids (e.g., "7 days, 7 persons for ₹1,000").
 */

export interface BudgetValidationRequest {
  startDate: string;
  endDate: string;
  paxCount: number;
  tripCategory: 'Hotels' | 'Cabs' | 'Packages';
  proposedBudget: number;
}

export interface BudgetValidationResult {
  status: 'VALID' | 'WARNING' | 'REJECTED';
  minEstimatedThreshold: number;
  message: string;
  suggestedMinBudget: number;
}

/**
 * Calculates number of days between two date strings (minimum 1 day)
 */
export function calculateDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  if (isNaN(start) || isNaN(end)) return 1;
  const diffTime = Math.abs(end - start);
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

/**
 * Validates user proposed budget against dynamic minimum threshold formulas
 */
export function validateTripBudget(req: BudgetValidationRequest): BudgetValidationResult {
  const days = calculateDays(req.startDate, req.endDate);
  const pax = Math.max(1, req.paxCount || 1);

  let minDailyCostPerHead = 600; // Base per day per head
  let baseTransitCost = 1000;

  if (req.tripCategory === 'Cabs') {
    // Road travel fuel + toll + driver allowance
    minDailyCostPerHead = 300;
    baseTransitCost = days * 1800; // ~150-200 km daily cab charge minimum
  } else if (req.tripCategory === 'Hotels') {
    // Room stay minimum
    minDailyCostPerHead = 700;
    baseTransitCost = 500;
  } else if (req.tripCategory === 'Packages') {
    // Complete hotel + cab + food
    minDailyCostPerHead = 1200;
    baseTransitCost = 1500;
  }

  // MinBudget Formula = (Days * Pax * MinDailyCostPerHead) + BaseTransitCost
  const minEstimatedThreshold = Math.round((days * pax * minDailyCostPerHead) + baseTransitCost);
  const budgetRatio = req.proposedBudget / minEstimatedThreshold;

  if (budgetRatio < 0.5) {
    return {
      status: 'REJECTED',
      minEstimatedThreshold,
      suggestedMinBudget: Math.round(minEstimatedThreshold * 0.85),
      message: `Unrealistic budget! Proposed ₹${req.proposedBudget.toLocaleString()} for ${days} days (${pax} travellers). The calculated minimum realistic threshold for this trip is ₹${minEstimatedThreshold.toLocaleString()}.`
    };
  }

  if (budgetRatio >= 0.5 && budgetRatio < 0.8) {
    return {
      status: 'WARNING',
      minEstimatedThreshold,
      suggestedMinBudget: Math.round(minEstimatedThreshold * 0.85),
      message: `Your budget of ₹${req.proposedBudget.toLocaleString()} is below typical market rates (Estimated ₹${minEstimatedThreshold.toLocaleString()}). Local partners may take longer or require revisions to respond.`
    };
  }

  return {
    status: 'VALID',
    minEstimatedThreshold,
    suggestedMinBudget: minEstimatedThreshold,
    message: `Budget looks realistic and ready for sealed partner bidding!`
  };
}
