export interface WhatsAppBookingDetails {
  bookingRef: string;
  guestName: string;
  title: string; // e.g. "Flight: IndiGo 6E-2045 (BOM ➔ DEL)" or "Hotel: The Taj Mahal Palace, Mumbai"
  date: string;
  amountPaid: number;
  phone?: string;
  type: 'flight' | 'hotel';
}

/**
 * Generates an official WhatsApp shareable message URL with complete ticket itinerary
 */
export function generateWhatsAppShareUrl(details: WhatsAppBookingDetails): string {
  const emoji = details.type === 'flight' ? '✈️' : '🏨';
  const typeLabel = details.type === 'flight' ? 'FLIGHT TICKET' : 'HOTEL BOOKING';

  const message = `🎉 *RoutTripo Confirmed ${typeLabel}*
━━━━━━━━━━━━━━━━━━━━
📌 *Booking Ref:* ${details.bookingRef}
👤 *Lead Guest:* ${details.guestName}
${emoji} *Itinerary:* ${details.title}
📅 *Date:* ${details.date}
💰 *Total Paid:* ₹${details.amountPaid.toLocaleString('en-IN')} (Incl. GST)
✅ *Status:* CONFIRMED (Travelport GDS Live)

📥 Download official PDF E-Ticket / Voucher directly in your RoutTripo app.
24/7 Support: support@routripo.com | 1800-ROUTRIPO
━━━━━━━━━━━━━━━━━━━━
_Thank you for choosing RoutTripo — Travel Smart & Split Seamlessly!_`;

  const encodedMessage = encodeURIComponent(message);
  
  if (details.phone && details.phone.trim().length >= 10) {
    const cleanPhone = details.phone.replace(/[^0-9]/g, '');
    const internationalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${internationalPhone}?text=${encodedMessage}`;
  }

  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Simulates real-time WhatsApp ticket delivery dispatch
 */
export async function sendWhatsAppConfirmation(details: WhatsAppBookingDetails): Promise<{ success: boolean; message: string }> {
  // In production this connects to WhatsApp Business Cloud API / Twilio WhatsApp Webhook
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    success: true,
    message: `WhatsApp confirmation dispatched to +91 ${details.phone || 'registered number'}`
  };
}
