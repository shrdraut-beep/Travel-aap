// ==========================================
// GLOBAL CONFIGURATION (AFFILIATE MARKER)
// ==========================================
// All API keys are securely managed server-side in environment variables (.env).
export const TRAVELPAYOUTS_MARKER = "554147";

/**
 * Dynamic Aviasales flight affiliate deep link generator
 * Format: https://search.aviasales.com/?origin_iata={origin}&destination_iata={destination}&depart_date={date}&adults={adults}&with_request=true&marker=${TRAVELPAYOUTS_MARKER}
 */
export const getFlightDeepLink = (
  origin: string,
  destination: string,
  date: string,
  adults: number = 1
): string => {
  return `https://bitli.in/1HdfW4l`;
};

/**
 * Dynamic MakeMyTrip hotel affiliate deep link generator
 */
export const getHotelDeepLink = (
  destination: string,
  checkIn: string,
  checkOut: string,
  adults: number = 1
): string => {
  return `https://bitli.in/1HdfW4l`;
};

/**
 * Official EarnKaro Profit Link for Flight Bookings
 */
export const EARNKARO_PROFIT_LINK = "https://bitli.in/1HdfW4l";

/**
 * EarnKaro Affiliate Link Generator
 * Generates a tracking link via the /api/affiliate-link backend proxy, which holds
 * the EarnKaro API key server-side so it is never exposed in the client bundle.
 * Safely falls back to merchantUrl or default EarnKaro profit link if request fails.
 */
export async function getAffiliateLink(merchantUrl: string): Promise<string> {
  const fallbackUrl = merchantUrl || EARNKARO_PROFIT_LINK;

  try {
    const response = await fetch('/api/affiliate-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: merchantUrl || EARNKARO_PROFIT_LINK
      })
    });

    if (!response.ok) {
      return fallbackUrl;
    }

    const data = await response.json();
    return data?.link || fallbackUrl;
  } catch (error) {
    console.error("Link generation failed:", error);
    return fallbackUrl;
  }
}

/**
 * Utility function to return EarnKaro Profit Link
 */
export const generateEarnKaroLink = (_partnerUrl?: string): string => {
  if (_partnerUrl && _partnerUrl.startsWith('http')) {
    return _partnerUrl;
  }
  return EARNKARO_PROFIT_LINK;
};

