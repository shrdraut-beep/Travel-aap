// SVG mock receipts encoded as base64 strings so that Gemini API can scan them directly!
// This provides a fully working demo environment for the user.

export interface DemoReceipt {
  id: string;
  nameKey: 'demoReceipt1' | 'demoReceipt2' | 'demoReceipt3';
  title: string;
  amount: number;
  category: 'food' | 'traveling' | 'hotels' | 'other';
  payer: string;
  svgString: string;
  base64Data: string;
}

// Helper to convert plain SVG to a base64 Data URL
const svgToDataUrl = (svg: string): string => {
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};

const foodSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="100%" height="100%" fill="#FDFBF7" stroke="#E2E8F0" stroke-width="4" rx="10" />
  <!-- Receipt header -->
  <text x="200" y="50" font-family="Courier, monospace" font-size="22" font-weight="bold" text-anchor="middle" fill="#1A202C">ROYAL DURBAR HOTEL</text>
  <text x="200" y="75" font-family="Courier, monospace" font-size="12" text-anchor="middle" fill="#4A5568">Lonavala Square, Pune Highway</text>
  <text x="200" y="90" font-family="Courier, monospace" font-size="11" text-anchor="middle" fill="#718096">Tel: 02114-274000</text>
  
  <!-- Divider -->
  <line x1="30" y1="110" x2="370" y2="110" stroke="#4A5568" stroke-width="2" stroke-dasharray="6,4" />
  
  <!-- Metadata -->
  <text x="30" y="135" font-family="Courier, monospace" font-size="12" font-weight="bold" fill="#2D3748">Date: 2026-07-15</text>
  <text x="30" y="155" font-family="Courier, monospace" font-size="12" fill="#4A5568">Bill No: #FT-98431</text>
  <text x="30" y="175" font-family="Courier, monospace" font-size="12" fill="#2D3748">PAID BY: Amit</text>
  
  <line x1="30" y1="190" x2="370" y2="190" stroke="#4A5568" stroke-width="1" stroke-dasharray="6,4" />
  
  <!-- Table Header -->
  <text x="30" y="215" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="#1A202C">Item Description</text>
  <text x="250" y="215" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="#1A202C">Qty</text>
  <text x="370" y="215" font-family="Courier, monospace" font-size="13" font-weight="bold" text-anchor="end" fill="#1A202C">Amount</text>
  
  <line x1="30" y1="225" x2="370" y2="225" stroke="#4A5568" stroke-width="1" />
  
  <!-- Items -->
  <text x="30" y="250" font-family="Courier, monospace" font-size="13" fill="#2D3748">Special Chicken Thali</text>
  <text x="255" y="250" font-family="Courier, monospace" font-size="13" fill="#2D3748">3</text>
  <text x="370" y="250" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">1,650.00</text>
  
  <text x="30" y="275" font-family="Courier, monospace" font-size="13" fill="#2D3748">Paneer Butter Masala</text>
  <text x="255" y="275" font-family="Courier, monospace" font-size="13" fill="#2D3748">2</text>
  <text x="370" y="275" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">720.00</text>
  
  <text x="30" y="300" font-family="Courier, monospace" font-size="13" fill="#2D3748">Butter Naan Basket</text>
  <text x="255" y="300" font-family="Courier, monospace" font-size="13" fill="#2D3748">2</text>
  <text x="370" y="300" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">380.00</text>
  
  <text x="30" y="325" font-family="Courier, monospace" font-size="13" fill="#2D3748">Mineral Water Bottle</text>
  <text x="255" y="325" font-family="Courier, monospace" font-size="13" fill="#2D3748">6</text>
  <text x="370" y="325" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">120.00</text>
  
  <text x="30" y="350" font-family="Courier, monospace" font-size="13" fill="#2D3748">Cold Drinks Platter</text>
  <text x="255" y="350" font-family="Courier, monospace" font-size="13" fill="#2D3748">1</text>
  <text x="370" y="350" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">280.00</text>
  
  <line x1="30" y1="375" x2="370" y2="375" stroke="#4A5568" stroke-width="1" stroke-dasharray="4,4" />
  
  <!-- Taxes / Service -->
  <text x="30" y="395" font-family="Courier, monospace" font-size="12" fill="#718096">CGST &amp; SGST (5%)</text>
  <text x="370" y="395" font-family="Courier, monospace" font-size="12" text-anchor="end" fill="#718096">157.50</text>
  
  <text x="30" y="415" font-family="Courier, monospace" font-size="12" fill="#718096">Service Charge (4%)</text>
  <text x="370" y="415" font-family="Courier, monospace" font-size="12" text-anchor="end" fill="#718096">142.50</text>
  
  <line x1="30" y1="435" x2="370" y2="435" stroke="#4A5568" stroke-width="2" />
  
  <!-- Grand Total -->
  <text x="30" y="460" font-family="Courier, monospace" font-size="18" font-weight="bold" fill="#1A202C">GRAND TOTAL</text>
  <text x="370" y="460" font-family="Courier, monospace" font-size="20" font-weight="bold" text-anchor="end" fill="#E53E3E">₹3,450.00</text>
  
  <!-- Footer -->
  <text x="200" y="485" font-family="Courier, monospace" font-size="11" text-anchor="middle" fill="#718096">*** Thank You! Visit Again ***</text>
</svg>
`;

const travelSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="100%" height="100%" fill="#F7FAFC" stroke="#CBD5E0" stroke-width="4" rx="10" />
  <!-- Ticket Header -->
  <rect x="20" y="20" width="360" height="70" fill="#2B6CB0" rx="5" />
  <text x="200" y="50" font-family="Courier, monospace" font-size="20" font-weight="bold" text-anchor="middle" fill="#FFFFFF">MSRTC SHIVNERI BOOKING</text>
  <text x="200" y="75" font-family="Courier, monospace" font-size="11" text-anchor="middle" fill="#EBF8FF">Maharashtra State Road Transport</text>
  
  <!-- Divider -->
  <line x1="30" y1="110" x2="370" y2="110" stroke="#718096" stroke-width="2" stroke-dasharray="6,4" />
  
  <!-- Ticket Info -->
  <text x="30" y="140" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="#2D3748">Service: PUNE to LONAVALA (A/C)</text>
  <text x="30" y="165" font-family="Courier, monospace" font-size="12" fill="#4A5568">Journey Date: 2026-07-14</text>
  <text x="30" y="185" font-family="Courier, monospace" font-size="12" fill="#4A5568">Departure: 08:30 AM (Swargate)</text>
  <text x="30" y="205" font-family="Courier, monospace" font-size="12" fill="#2D3748">PASSENGER NAME: Snehal &amp; Group</text>
  <text x="30" y="225" font-family="Courier, monospace" font-size="12" fill="#2D3748">PAID BY: Snehal</text>
  
  <line x1="30" y1="245" x2="370" y2="245" stroke="#718096" stroke-width="1" stroke-dasharray="4,4" />
  
  <!-- Seat Details -->
  <text x="30" y="275" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="#1A202C">Fare Details</text>
  <text x="30" y="300" font-family="Courier, monospace" font-size="13" fill="#4A5568">Base Fare (₹200 x 5 Seats)</text>
  <text x="370" y="300" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">1,000.00</text>
  
  <text x="30" y="325" font-family="Courier, monospace" font-size="13" fill="#4A5568">Reservation Charges</text>
  <text x="370" y="325" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">100.00</text>
  
  <text x="30" y="350" font-family="Courier, monospace" font-size="13" fill="#4A5568">Gst &amp; Safety Cess</text>
  <text x="370" y="350" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">100.00</text>
  
  <line x1="30" y1="380" x2="370" y2="380" stroke="#718096" stroke-width="2" />
  
  <!-- Total -->
  <text x="30" y="415" font-family="Courier, monospace" font-size="16" font-weight="bold" fill="#1A202C">TOTAL AMOUNT PAID</text>
  <text x="370" y="415" font-family="Courier, monospace" font-size="18" font-weight="bold" text-anchor="end" fill="#2B6CB0">₹1,200.00</text>
  
  <rect x="30" y="440" width="340" height="35" fill="#EDF2F7" rx="3" />
  <text x="200" y="462" font-family="Courier, monospace" font-size="12" text-anchor="middle" fill="#4A5568">PNR: SL983100552 | Happy Journey!</text>
</svg>
`;

const hotelSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <rect width="100%" height="100%" fill="#FCFFF9" stroke="#CCD6C4" stroke-width="4" rx="10" />
  <!-- Hotel logo / header -->
  <text x="200" y="50" font-family="Courier, monospace" font-size="20" font-weight="bold" text-anchor="middle" fill="#2C5E3B">VALLEY VIEW LUXURY RESORT</text>
  <text x="200" y="70" font-family="Courier, monospace" font-size="11" text-anchor="middle" fill="#4A5568">Near Tiger Point, Lonavala</text>
  
  <line x1="30" y1="95" x2="370" y2="95" stroke="#2C5E3B" stroke-width="2" stroke-dasharray="5,3" />
  
  <!-- Booking Dates -->
  <text x="30" y="125" font-family="Courier, monospace" font-size="12" fill="#2D3748">Guest Name: Rahul &amp; friends</text>
  <text x="30" y="145" font-family="Courier, monospace" font-size="12" fill="#2D3748">Check-In:  2026-07-16 11:00 AM</text>
  <text x="30" y="165" font-family="Courier, monospace" font-size="12" fill="#2D3748">Check-Out: 2026-07-17 10:00 AM</text>
  <text x="30" y="185" font-family="Courier, monospace" font-size="12" fill="#4A5568">Room No: Villa #104 (Deluxe)</text>
  <text x="30" y="205" font-family="Courier, monospace" font-size="12" fill="#2D3748">PAID BY: Rahul</text>
  
  <line x1="30" y1="220" x2="370" y2="220" stroke="#2C5E3B" stroke-width="1" stroke-dasharray="5,3" />
  
  <!-- Charges detail -->
  <text x="30" y="245" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#1A202C">Bill Summary</text>
  
  <text x="30" y="275" font-family="Courier, monospace" font-size="13" fill="#4A5568">Room Tariff (1 Night stay)</text>
  <text x="370" y="275" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">7,200.00</text>
  
  <text x="30" y="300" font-family="Courier, monospace" font-size="13" fill="#4A5568">Extra Beds &amp; Blankets (2x)</text>
  <text x="370" y="300" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">600.00</text>
  
  <text x="30" y="325" font-family="Courier, monospace" font-size="13" fill="#4A5568">Local Tourism Levy</text>
  <text x="370" y="325" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">200.00</text>
  
  <text x="30" y="350" font-family="Courier, monospace" font-size="13" fill="#4A5568">GST (12% Special Hospitality)</text>
  <text x="370" y="350" font-family="Courier, monospace" font-size="13" text-anchor="end" fill="#2D3748">500.00</text>
  
  <line x1="30" y1="380" x2="370" y2="380" stroke="#2C5E3B" stroke-width="2" />
  
  <!-- Grand Total -->
  <text x="30" y="415" font-family="Courier, monospace" font-size="18" font-weight="bold" fill="#1A202C">TOTAL PAYABLE</text>
  <text x="370" y="415" font-family="Courier, monospace" font-size="20" font-weight="bold" text-anchor="end" fill="#2C5E3B">₹8,500.00</text>
  
  <text x="200" y="465" font-family="Courier, monospace" font-size="11" text-anchor="middle" fill="#718096">Paid in Full via UPI. Thank You!</text>
</svg>
`;

export const demoReceipts: DemoReceipt[] = [
  {
    id: 'demo-food',
    nameKey: 'demoReceipt1',
    title: 'Royal Durbar Hotel',
    amount: 3450,
    category: 'food',
    payer: 'Amit',
    svgString: foodSvg,
    base64Data: svgToDataUrl(foodSvg)
  },
  {
    id: 'demo-travel',
    nameKey: 'demoReceipt2',
    title: 'MSRTC Shivneri Bus',
    amount: 1200,
    category: 'traveling',
    payer: 'Snehal',
    svgString: travelSvg,
    base64Data: svgToDataUrl(travelSvg)
  },
  {
    id: 'demo-hotel',
    nameKey: 'demoReceipt3',
    title: 'Valley View Luxury Resort',
    amount: 8500,
    category: 'hotels',
    payer: 'Rahul',
    svgString: hotelSvg,
    base64Data: svgToDataUrl(hotelSvg)
  }
];
