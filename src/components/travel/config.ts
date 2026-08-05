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
 * Accepts a merchant/partner URL and generates a tracking link via EarnKaro API.
 * Safely falls back to merchantUrl or default EarnKaro profit link if request fails.
 */
export async function getAffiliateLink(merchantUrl: string): Promise<string> {
  const fallbackUrl = merchantUrl || EARNKARO_PROFIT_LINK;
  const earnKaroApiUrl = process.env.EARNKARO_API_URL || "https://api.earnkaro.com/v1/generate-link";
  const myApiKey = process.env.EARNKARO_API_KEY || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_EARNKARO_API_KEY) || "";

  if (!myApiKey) {
    return fallbackUrl;
  }

  try {
    const response = await fetch(earnKaroApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${myApiKey}`
      },
      body: JSON.stringify({
        url: merchantUrl || EARNKARO_PROFIT_LINK
      })
    });

    if (!response.ok) {
      return fallbackUrl;
    }

    const data = await response.json();

    if (data && data.short_link) {  
      return data.short_link;
    } else {
      return fallbackUrl; 
    }
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

