export interface ParsedExpense {
  amount: number | null;
  currency: string;
  isPayment: boolean;
  matchedKeywords: string[];
  suggestedCategory: string;
}

export const parseExpenseNotification = (text: string, tripKeywords: string[]): ParsedExpense => {
  // Regex to extract currency amount (e.g., "Paid ₹500", "Rs. 500", "INR 500", "₹ 500.50", "Paid 500")
  const amountRegex = /(?:₹|Rs\.?|INR)?\s*([0-9,]+\.?[0-9]*)/i;
  const match = text.match(amountRegex);
  
  let amount = null;
  if (match && match[1]) {
    amount = parseFloat(match[1].replace(/,/g, ''));
  }

  const lowerText = text.toLowerCase();
  
  // Payment app keywords
  const paymentApps = ['gpay', 'phonepe', 'paytm', 'bhim', 'cred', 'amazon pay', 'paid', 'debited', 'sent to', 'payment'];
  const isPayment = paymentApps.some(app => lowerText.includes(app));

  // Category matching
  let suggestedCategory = 'other';
  if (lowerText.match(/hotel|agoda|makemytrip|oyos|airbnb|booking\.com|stay|room/)) suggestedCategory = 'hotels';
  else if (lowerText.match(/flight|indigo|air india|vistara|spicejet|airport|plane/)) suggestedCategory = 'transport';
  else if (lowerText.match(/train|irctc|railway|station/)) suggestedCategory = 'transport';
  else if (lowerText.match(/food|zomato|swiggy|restaurant|cafe|dinner|lunch/)) suggestedCategory = 'food';
  else if (lowerText.match(/uber|ola|rapido|cab|auto|taxi|toll/)) suggestedCategory = 'traveling';

  // Trip keywords matching
  const matchedKeywords = tripKeywords.filter(kw => lowerText.includes(kw.toLowerCase()));

  return {
    amount,
    currency: '₹',
    isPayment,
    matchedKeywords,
    suggestedCategory
  };
};
