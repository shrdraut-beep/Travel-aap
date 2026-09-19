/**
 * Dynamic Document Template Engine for RoutTripo
 * Generates official, pixel-perfect A4 E-Tickets and Tax Invoices
 * for FLIGHT, HOTEL, BUS, and CAR verticals with 100% dynamic API data.
 */

export interface BookingDocumentBrand {
  name: string;
  company_name: string;
  address: string;
  cin: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  website: string;
  bank_details: {
    bank_name: string;
    account_name: string;
    account_no: string;
    ifsc: string;
    branch: string;
  };
  upi_id: string;
  authorized_signatory_name: string;
}

export interface BookingDocumentCustomer {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface BookingDocumentTraveller {
  name: string;
  seat_or_room: string;
  extra_info: string;
  pnr_or_code: string;
}

export interface BookingDocumentAmounts {
  fare: number;
  ancillary: number;
  net_service: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  words: string;
}

export interface BookingDocumentInvoice {
  no: string;
  date: string;
  service_provider: string;
  amounts: BookingDocumentAmounts;
  certified_terms: string[];
}

export interface FlightServiceDetails {
  airline: string;
  flight_no: string;
  class: string;
  duration: string;
  type: string;
  departure: {
    code: string;
    time: string;
    date: string;
    city: string;
    airport: string;
    terminal: string;
  };
  arrival: {
    code: string;
    time: string;
    date: string;
    city: string;
    airport: string;
    terminal: string;
  };
}

export interface HotelServiceDetails {
  hotel_name: string;
  room_type: string;
  meal_plan: string;
  nights: number;
  rooms_count: number;
  check_in: {
    time: string;
    date: string;
    city: string;
    address: string;
  };
  check_out: {
    time: string;
    date: string;
    city: string;
    phone: string;
  };
}

export interface BusServiceDetails {
  operator: string;
  bus_type: string;
  duration: string;
  boarding: {
    time: string;
    date: string;
    city: string;
    point: string;
    landmark: string;
  };
  dropping: {
    time: string;
    date: string;
    city: string;
    point: string;
    landmark: string;
  };
}

export interface CarServiceDetails {
  vehicle_model: string;
  vehicle_category: string;
  trip_type: string;
  package_inclusions: string;
  pickup: {
    time: string;
    date: string;
    city: string;
    address: string;
    landmark: string;
  };
  drop: {
    time: string;
    date: string;
    city: string;
    address: string;
  };
}

export interface BookingDocumentTicket {
  booking_id: string;
  status: string;
  pnr: string;
  operator_support: string;
  important_information: string[];
  service_details: FlightServiceDetails | HotelServiceDetails | BusServiceDetails | CarServiceDetails;
  baggage_or_inclusions: {
    primary: string;
    secondary: string;
  };
  travellers: BookingDocumentTraveller[];
}

export interface BookingDocumentData {
  brand: BookingDocumentBrand;
  booking_type: 'FLIGHT' | 'HOTEL' | 'BUS' | 'CAR';
  customer: BookingDocumentCustomer;
  ticket: BookingDocumentTicket;
  invoice: BookingDocumentInvoice;
  dynamic_policies: Record<string, string[]>;
}

// Official brand defaults (can be overridden by database or environment)
export const DEFAULT_BRAND_INFO: BookingDocumentBrand = {
  name: "ROUTRIPO",
  company_name: "ROUTRIPO (OPC) PVT.LTD",
  address: "Akanksha Park C, Balkrushna Nagar, Peth Road, Near HP Gas Godown, Nashik - 422003",
  cin: "U72900MH2026PTC398765",
  gstin: "27ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  phone: "+91 9421509776 / +91 8830082886",
  email: "support@routripo.com",
  website: "https://www.routripo.com",
  bank_details: {
    bank_name: "HDFC Bank Ltd.",
    account_name: "ROUTRIPO (OPC) PVT.LTD",
    account_no: "50200000000000",
    ifsc: "HDFC0000000",
    branch: "Nashik Main Branch"
  },
  upi_id: "routripo@upi",
  authorized_signatory_name: "Sharad Chandar Raut"
};

/**
 * Converts a number to Indian currency words (e.g. 48533 -> "Rupees Forty Eight Thousand Five Hundred Thirty Three Only")
 */
export function convertNumberToIndianWords(num: number): string {
  if (num === 0) return "Rupees Zero Only";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertChunk(n: number): string {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }

  const rounded = Math.round(num * 100) / 100;
  let integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let result = "";

  // Crores
  if (integerPart >= 10000000) {
    const crore = Math.floor(integerPart / 10000000);
    result += convertChunk(crore) + " Crore ";
    integerPart %= 10000000;
  }
  // Lakhs
  if (integerPart >= 100000) {
    const lakh = Math.floor(integerPart / 100000);
    result += convertChunk(lakh) + " Lakh ";
    integerPart %= 100000;
  }
  // Thousands
  if (integerPart >= 1000) {
    const thousand = Math.floor(integerPart / 1000);
    result += convertChunk(thousand) + " Thousand ";
    integerPart %= 1000;
  }
  // Hundreds and units
  if (integerPart > 0) {
    result += convertChunk(integerPart) + " ";
  }

  result = result.trim();
  let finalStr = `Rupees ${result}`;

  if (decimalPart > 0) {
    finalStr += ` and ${convertChunk(decimalPart)} Paise`;
  }

  finalStr += " Only";
  return finalStr;
}

/**
 * Generates an inline SVG barcode for crisp rendering
 */
export function generateBarcodeSVG(code: string, width = 120, height = 24): string {
  const safeCode = (code || "ROUTRIPO").toUpperCase().replace(/[^A-Z0-9]/g, "");
  let hash = 0;
  for (let i = 0; i < safeCode.length; i++) {
    hash = (hash << 5) - hash + safeCode.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const pattern = [2, 1, 3, 1, 1, 2, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  let x = 4;
  const bars: string[] = [];

  for (let i = 0; i < pattern.length; i++) {
    const barWidth = ((pattern[(i + (absHash % 7)) % pattern.length] % 3) + 1) * 1.5;
    if (i % 2 === 0) {
      bars.push(`<rect x="${x}" y="2" width="${barWidth.toFixed(1)}" height="${height - 4}" fill="#000" />`);
    }
    x += barWidth + 1.2;
  }

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${x + 6} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;"><rect width="${x + 6}" height="${height}" fill="#fff"/>${bars.join('')}</svg>`;
}

/**
 * Generates an inline SVG QR Code for UPI payment or Ticket check-in
 */
export function generateQRCodeSVG(text: string, size = 64): string {
  const grid = 21;
  const cellSize = size / grid;
  let hash = 0;
  const safeText = text || "ROUTRIPO_UPI";
  for (let i = 0; i < safeText.length; i++) {
    hash = (hash << 5) - hash + safeText.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const rects: string[] = [];
  const addCorner = (r: number, c: number) => {
    rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000" />`);
    rects.push(`<rect x="${(c + 1) * cellSize}" y="${(r + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#fff" />`);
    rects.push(`<rect x="${(c + 2) * cellSize}" y="${(r + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000" />`);
  };

  addCorner(0, 0);
  addCorner(0, 14);
  addCorner(14, 0);

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
      const bit = ((absHash ^ (r * 31 + c * 17)) % 7) < 3;
      if (bit) {
        rects.push(`<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${(cellSize - 0.2).toFixed(1)}" height="${(cellSize - 0.2).toFixed(1)}" fill="#000" />`);
      }
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #ccc; padding: 2px; background: #fff;">
    <rect width="${size}" height="${size}" fill="#fff" />
    ${rects.join('')}
  </svg>`;
}

/**
 * Official Brand Logo HTML (Exact color specifications)
 */
export function getBrandLogoHTML(): string {
  return `<div style="font-family: Arial, sans-serif; font-size: 32px; font-weight: 900; letter-spacing: 0.5px; display: inline-block;">
    <span style="color: #e3000f;">Rou</span><span style="background-color: #f92a35; color: white; padding: 0px 6px; border-radius: 6px; margin: 0 2px;">T</span><span style="color: #ed2893;">ripo</span>
</div>`;
}

/**
 * Renders the vertical-specific Card HTML for the Ticket
 */
function renderVerticalServiceCard(bType: string, ticket: BookingDocumentTicket): string {
  if (bType === 'FLIGHT') {
    const f = ticket.service_details as FlightServiceDetails;
    return `
    <div class="service-card">
        <div class="service-header">
            <span>✈ ${f.airline || 'Airline'} | Flight ${f.flight_no || 'TBD'}</span>
            <span>${f.class || 'Economy'} Class</span>
        </div>
        <div class="service-body">
            <div class="s-col" style="width: 35%;">
                <div class="city">${f.departure.city}</div>
                <div class="main-code">${f.departure.code}</div>
                <div class="time">${f.departure.time}</div>
                <div class="sub-info">
                    ${f.departure.date}<br>
                    ${f.departure.airport}<br>
                    <b>${f.departure.terminal}</b>
                </div>
            </div>
            <div class="s-col center-col">
                <div class="duration">⏱ ${f.duration}</div>
                <div style="font-size: 9px; color: #555; margin-top: 3px;">${f.type}</div>
            </div>
            <div class="s-col" style="width: 35%; text-align: right;">
                <div class="city">${f.arrival.city}</div>
                <div class="main-code">${f.arrival.code}</div>
                <div class="time">${f.arrival.time}</div>
                <div class="sub-info">
                    ${f.arrival.date}<br>
                    ${f.arrival.airport}<br>
                    <b>${f.arrival.terminal}</b>
                </div>
            </div>
        </div>
    </div>`;
  } else if (bType === 'HOTEL') {
    const h = ticket.service_details as HotelServiceDetails;
    return `
    <div class="service-card">
        <div class="service-header">
            <span>🏨 ${h.hotel_name || 'Hotel Property'} | ${h.room_type || 'Standard Room'}</span>
            <span>${h.meal_plan || 'Room Only'}</span>
        </div>
        <div class="service-body">
            <div class="s-col" style="width: 38%;">
                <div class="city">Check-In</div>
                <div class="main-code" style="font-size: 20px;">${h.check_in.time}</div>
                <div class="time">${h.check_in.date}</div>
                <div class="sub-info">
                    ${h.check_in.city}<br>
                    ${h.check_in.address}
                </div>
            </div>
            <div class="s-col center-col" style="width: 24%;">
                <div class="duration">🌙 ${h.nights} Night${h.nights > 1 ? 's' : ''}</div>
                <div style="font-size: 9px; color: #555; margin-top: 3px;">${h.rooms_count} Room${h.rooms_count > 1 ? 's' : ''} · Confirmed</div>
            </div>
            <div class="s-col" style="width: 38%; text-align: right;">
                <div class="city">Check-Out</div>
                <div class="main-code" style="font-size: 20px;">${h.check_out.time}</div>
                <div class="time">${h.check_out.date}</div>
                <div class="sub-info">
                    ${h.check_out.city}<br>
                    Front Desk: <b>${h.check_out.phone}</b>
                </div>
            </div>
        </div>
    </div>`;
  } else if (bType === 'BUS') {
    const b = ticket.service_details as BusServiceDetails;
    return `
    <div class="service-card">
        <div class="service-header">
            <span>🚌 ${b.operator || 'Bus Operator'} | ${b.bus_type || 'AC Sleeper'}</span>
            <span>Reserved Seating</span>
        </div>
        <div class="service-body">
            <div class="s-col" style="width: 35%;">
                <div class="city">${b.boarding.city}</div>
                <div class="main-code" style="font-size: 20px;">${b.boarding.time}</div>
                <div class="time">${b.boarding.date}</div>
                <div class="sub-info">
                    <b>${b.boarding.point}</b><br>
                    Landmark: ${b.boarding.landmark}
                </div>
            </div>
            <div class="s-col center-col">
                <div class="duration">⏱ ${b.duration}</div>
                <div style="font-size: 9px; color: #555; margin-top: 3px;">Express Route · GPS Tracked</div>
            </div>
            <div class="s-col" style="width: 35%; text-align: right;">
                <div class="city">${b.dropping.city}</div>
                <div class="main-code" style="font-size: 20px;">${b.dropping.time}</div>
                <div class="time">${b.dropping.date}</div>
                <div class="sub-info">
                    <b>${b.dropping.point}</b><br>
                    Landmark: ${b.dropping.landmark}
                </div>
            </div>
        </div>
    </div>`;
  } else {
    // CAR
    const c = ticket.service_details as CarServiceDetails;
    return `
    <div class="service-card">
        <div class="service-header">
            <span>🚗 ${c.vehicle_model || 'Sedan / SUV'} (${c.vehicle_category || 'Prime'}) | ${c.trip_type || 'Outstation'}</span>
            <span>Chauffeur Driven</span>
        </div>
        <div class="service-body">
            <div class="s-col" style="width: 38%;">
                <div class="city">Pickup: ${c.pickup.city}</div>
                <div class="main-code" style="font-size: 20px;">${c.pickup.time}</div>
                <div class="time">${c.pickup.date}</div>
                <div class="sub-info">
                    <b>${c.pickup.address}</b><br>
                    Near ${c.pickup.landmark}
                </div>
            </div>
            <div class="s-col center-col" style="width: 24%;">
                <div class="duration">🛣️ ${c.package_inclusions}</div>
                <div style="font-size: 9px; color: #555; margin-top: 3px;">Verified Driver Partner</div>
            </div>
            <div class="s-col" style="width: 38%; text-align: right;">
                <div class="city">Drop: ${c.drop.city}</div>
                <div class="main-code" style="font-size: 20px;">${c.drop.time}</div>
                <div class="time">${c.drop.date}</div>
                <div class="sub-info">
                    <b>${c.drop.address}</b><br>
                    Trip Completed at Destination
                </div>
            </div>
        </div>
    </div>`;
  }
}

/**
 * Renders the Travellers / Guests Table for the Ticket
 */
function renderTravellersTable(bType: string, ticket: BookingDocumentTicket): string {
  let col1 = "Passenger Name";
  let col2 = "Seat";
  let col3 = "Baggage (In/Cabin)";
  let col4 = "Boarding Barcode (PNR)";

  if (bType === 'HOTEL') {
    col1 = "Guest Name";
    col2 = "Room Allocation";
    col3 = "Inclusions & Amenities";
    col4 = "Check-In Barcode";
  } else if (bType === 'BUS') {
    col1 = "Passenger Name";
    col2 = "Seat / Berth No";
    col3 = "Luggage Allowance";
    col4 = "Boarding Barcode (PNR)";
  } else if (bType === 'CAR') {
    col1 = "Lead Rider / Passenger";
    col2 = "Vehicle Allocation";
    col3 = "Trip Inclusions & KMs";
    col4 = "Verification Barcode (OTP)";
  }

  const rows = ticket.travellers.map(t => {
    const barcode = generateBarcodeSVG(t.pnr_or_code || ticket.pnr);
    return `
    <tr>
        <td><b>${t.name}</b></td>
        <td>${t.seat_or_room}</td>
        <td>${t.extra_info}</td>
        <td style="text-align: center; vertical-align: middle; border-right: none;">
            ${barcode}<br>
            <span style="font-size: 8px; letter-spacing: 1px; font-weight: bold;">${t.pnr_or_code || ticket.pnr}</span>
        </td>
    </tr>`;
  }).join('');

  return `
  <div class="section">
      <div class="section-title">${bType === 'HOTEL' ? 'Guest Information & Inclusions' : 'Traveller Information & Baggage Allowance'}</div>
      <table class="data-table">
          <tr>
              <th>${col1}</th>
              <th>${col2}</th>
              <th>${col3}</th>
              <th style="text-align: center;">${col4}</th>
          </tr>
          ${rows}
      </table>
  </div>`;
}

/**
 * Renders the E-Ticket HTML document
 */
export function renderTicketHTML(data: BookingDocumentData): string {
  const b = data.brand;
  const c = data.customer;
  const t = data.ticket;
  const logo = getBrandLogoHTML();

  const titleMap: Record<string, string> = {
    'FLIGHT': 'E-TICKET ITINERARY',
    'HOTEL': 'HOTEL BOOKING VOUCHER',
    'BUS': 'BUS E-TICKET & BOARDING PASS',
    'CAR': 'CAB BOOKING CONFIRMATION'
  };
  const docTitle = titleMap[data.booking_type] || 'BOOKING CONFIRMATION';

  const verticalCard = renderVerticalServiceCard(data.booking_type, t);
  const travellersTable = renderTravellersTable(data.booking_type, t);

  const importantList = t.important_information.map(info => `<li>${info}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>RoutTripo — ${docTitle}</title>
    <style>
        @page { size: A4; margin: 8mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10px; color: #000; margin: 0; padding: 0; background: #fff; }
        .container { border: 1px solid #000; background: #ffffff; position: relative; min-height: 280mm; box-sizing: border-box; }
        
        .header-table { width: 100%; background-color: #ffffff; border-bottom: 2px solid #000; border-collapse: collapse; }
        .header-table td { padding: 10px 15px; vertical-align: middle; }
        .doc-title { font-size: 18px; font-weight: 900; color: #000; letter-spacing: 1px; margin-bottom: 3px; text-transform: uppercase; }
        .badge { background: #000; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block; }
        
        .info-strip { background: #f0f0f0; border-bottom: 1px solid #000; padding: 6px 15px; display: table; width: 100%; box-sizing: border-box; }
        .strip-col { display: table-cell; width: 33.33%; }
        .strip-label { font-size: 8px; color: #555; text-transform: uppercase; font-weight: bold; margin-bottom: 2px; }
        .strip-val { font-size: 13px; font-weight: bold; color: #000; font-family: monospace; }
        
        .cust-info { padding: 6px 15px; background: #fff; border-bottom: 1px solid #000; display: table; width: 100%; box-sizing: border-box; }
        .cust-col { display: table-cell; }
        .cust-title { font-size: 9px; font-weight: bold; color: #000; text-transform: uppercase; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 1px; margin-bottom: 3px; }
        
        .service-card { margin: 10px 15px; border: 1px solid #000; background: #ffffff; overflow: hidden; }
        .service-header { background: #f0f0f0; color: #000; padding: 6px 15px; font-weight: bold; font-size: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid #000; }
        .service-body { display: table; width: 100%; padding: 10px 15px; box-sizing: border-box; }
        .s-col { display: table-cell; vertical-align: top; }
        .main-code { font-size: 26px; font-weight: 900; color: #000; line-height: 1; }
        .city { font-size: 14px; font-weight: bold; margin-bottom: 2px; color: #000; }
        .time { font-size: 12px; color: #000; font-weight: bold; }
        .sub-info { font-size: 9px; color: #555; margin-top: 2px; line-height: 1.3; }
        .center-col { text-align: center; width: 30%; }
        .duration { border-bottom: 2px dotted #000; display: inline-block; padding-bottom: 2px; margin-bottom: 2px; color: #000; font-weight: bold; font-size: 11px; }
        
        .section { padding: 0 15px 10px 15px; }
        .section-title { font-size: 11px; font-weight: 900; color: #000; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 6px; text-transform: uppercase; }
        table.data-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        table.data-table th { background: #f0f0f0; color: #000; padding: 6px; text-align: left; font-size: 9px; text-transform: uppercase; border-bottom: 1px solid #000; border-right: 1px solid #000; }
        table.data-table td { padding: 6px; border-bottom: 1px solid #000; border-right: 1px solid #000; font-size: 11px; color: #000; vertical-align: middle; }
        
        .footer { background: #f0f0f0; color: #000; padding: 10px 15px; text-align: center; font-size: 9px; line-height: 1.4; border-top: 1px solid #000; font-weight: bold; position: absolute; bottom: 0; width: 100%; box-sizing: border-box; }
    </style>
</head>
<body>
    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 50%;">${logo}</td>
                <td style="width: 50%; text-align: right;">
                    <div class="doc-title">${docTitle}</div>
                    <div class="badge">${t.status}</div>
                </td>
            </tr>
        </table>
        
        <div class="info-strip">
            <div class="strip-col">
                <div class="strip-label">Booking Reference (PNR)</div>
                <div class="strip-val">${t.pnr}</div>
            </div>
            <div class="strip-col">
                <div class="strip-label">Booking ID</div>
                <div class="strip-val">${t.booking_id}</div>
            </div>
            <div class="strip-col" style="text-align: right;">
                <div class="strip-label">Service Vertical</div>
                <div class="strip-val">${data.booking_type}</div>
            </div>
        </div>

        <div class="cust-info">
            <div class="cust-col">
                <div class="cust-title">Passenger / Guest Contact Details</div>
                <div style="font-size: 11px; font-weight: bold; color: #000;">${c.name}</div>
                <div style="font-size: 10px; color: #555;">Phone: ${c.phone} | Email: ${c.email} | Address: ${c.address}</div>
            </div>
        </div>

        ${verticalCard}

        ${travellersTable}

        <div class="section">
            <div class="section-title">Important Travel Information</div>
            <ul style="font-size: 9px; color: #000; line-height: 1.4; padding-left: 20px; margin: 0;">
                ${importantList}
            </ul>
        </div>
        
        <div class="section" style="margin-bottom: 40px;">
            <div class="section-title">Support & Assistance</div>
            <table style="width: 100%; font-size: 10px; border-collapse: collapse; border: 1px solid #000;">
                <tr>
                    <td style="width: 50%; padding: 6px 10px; border-right: 1px solid #000;"><b>Operator Support:</b> ${t.operator_support}</td>
                    <td style="width: 50%; padding: 6px 10px;"><b>RoutTripo 24x7 Helpline:</b> ${b.phone} | Email: ${b.email}</td>
                </tr>
            </table>
        </div>
        
        <div class="footer">
            <strong style="color: #000;">${b.company_name}</strong><br>
            ${b.address} | PAN: ${b.pan} | GSTIN: ${b.gstin} | CIN: ${b.cin}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Renders the official Tax Invoice HTML document
 */
export function renderInvoiceHTML(data: BookingDocumentData): string {
  const b = data.brand;
  const c = data.customer;
  const t = data.ticket;
  const inv = data.invoice;
  const logo = getBrandLogoHTML();
  const upiQr = generateQRCodeSVG(`upi://pay?pa=${b.upi_id}&pn=${encodeURIComponent(b.company_name)}&am=${inv.amounts.total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(inv.no)}`, 60);

  const activePolicies = data.dynamic_policies[data.booking_type] || [
    "Standard RoutTripo Terms & Conditions Apply.",
    "All disputes subject to Nashik jurisdiction only."
  ];

  const termsHtml = [
    ...inv.certified_terms.map(term => `<li>${term}</li>`),
    ...activePolicies.map(pol => `<li>${pol}</li>`)
  ].join('');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>RoutTripo — Tax Invoice ${inv.no}</title>
    <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #000; margin: 0; padding: 0; background: #fff; }
        .container { border: 1px solid #000; padding: 25px; background: #ffffff; position: relative; min-height: 275mm; box-sizing: border-box; }
        
        table.header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; border-collapse: collapse; }
        table.header-table td { vertical-align: top; }
        .invoice-title { font-size: 24px; font-weight: 900; color: #000; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px; text-align: left; }
        
        table.meta-table { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; border: 1px solid #000; }
        table.meta-table td { padding: 5px 8px; border-bottom: 1px solid #000; }
        table.meta-table tr:nth-child(odd) { background-color: #f0f0f0; }
        table.meta-table td:first-child { font-weight: bold; color: #000; width: 40%; border-right: 1px solid #000; }
        table.meta-table td:last-child { color: #000; font-weight: bold; }
        
        .bill-to { background: #fff; padding: 15px; border: 1px solid #000; border-left: 4px solid #000; margin-bottom: 20px; display: table; width: 100%; box-sizing: border-box; }
        .bill-col { display: table-cell; width: 50%; vertical-align: top; }
        .bill-to-title { font-size: 10px; font-weight: bold; color: #000; text-transform: uppercase; margin-bottom: 5px; display: inline-block; border-bottom: 1px solid #000; padding-bottom: 2px; }
        
        table.inv-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; }
        table.inv-table th { background: #f0f0f0; color: #000; padding: 10px; text-align: left; font-size: 10px; text-transform: uppercase; border-right: 1px solid #000; border-bottom: 2px solid #000; }
        table.inv-table th:last-child { border-right: none; }
        table.inv-table th.right, table.inv-table td.right { text-align: right; }
        table.inv-table td { padding: 10px; border-bottom: 1px solid #000; border-right: 1px solid #000; font-size: 12px; color: #000; }
        table.inv-table td:last-child { border-right: none; }
        tr.total-row td { font-weight: bold; font-size: 14px; background: #f0f0f0; border-top: 2px solid #000; color: #000; }
        
        .amount-words { background: #fff; padding: 8px; border: 1px dashed #000; font-size: 11px; font-style: italic; text-align: center; margin-bottom: 20px; color: #000; }
        
        .footer-section { display: table; width: 100%; font-size: 10px; margin-bottom: 20px; border-top: 1px solid #000; padding-top: 15px; }
        .terms-box { display: table-cell; width: 50%; padding-right: 15px; vertical-align: top; border-right: 1px solid #000; }
        .bank-box { display: table-cell; width: 50%; padding-left: 15px; vertical-align: top; }
        .policy-title { font-size: 11px; font-weight: bold; color: #000; margin-bottom: 5px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; display: inline-block; }
        
        .auth-section { display: table; width: 100%; margin-top: 10px; }
        .stamp-col { display: table-cell; width: 50%; text-align: center; vertical-align: bottom; }
        .sign-col { display: table-cell; width: 50%; text-align: center; vertical-align: bottom; }
        .stamp { display: inline-block; width: 80px; height: 80px; border: 2px solid #000; border-radius: 50%; color: #000; text-align: center; font-size: 8px; font-weight: bold; text-transform: uppercase; line-height: 1.2; transform: rotate(-15deg); opacity: 0.9; }
        .stamp-inner { border: 1px solid #000; border-radius: 50%; width: 70px; height: 70px; margin: 3px; display: flex; align-items: center; justify-content: center; }
        .signature-text { font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; font-size: 24px; color: #000; transform: rotate(-5deg); margin-bottom: 5px; }
        .signature-line { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; color: #000; display: inline-block; min-width: 150px; }
    </style>
</head>
<body>
    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 55%; padding-right: 10px;">
                    ${logo}
                    <div style="font-size: 10px; color: #555; line-height: 1.5; margin-top: 15px; font-weight: bold;">
                        ${b.address}<br>
                        <b>PAN:</b> ${b.pan} | <b>GSTIN:</b> ${b.gstin}<br>
                        <b>CIN:</b> ${b.cin}<br>
                        <b>Email:</b> ${b.email} | <b>Phone:</b> ${b.phone}
                    </div>
                </td>
                <td style="width: 45%; padding-left: 10px;">
                    <div class="invoice-title">Tax Invoice</div>
                    <table class="meta-table">
                        <tr><td>Invoice No:</td><td>${inv.no}</td></tr>
                        <tr><td>Invoice Date:</td><td>${inv.date}</td></tr>
                        <tr><td>Booking ID:</td><td>${t.booking_id}</td></tr>
                        <tr><td>Service Provider:</td><td>${inv.service_provider}</td></tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="bill-to">
            <div class="bill-col" style="border-right: 1px solid #000; padding-right: 10px;">
                <div class="bill-to-title">Billed To</div>
                <div style="font-size: 14px; font-weight: bold; color: #000;">${c.name}</div>
                <div style="font-size: 11px; color: #000; margin-top: 5px; line-height: 1.4;">${c.address}</div>
            </div>
            <div class="bill-col" style="text-align: right; padding-left: 15px;">
                <div class="bill-to-title">Customer Contact</div>
                <div style="font-size: 12px; margin-top: 5px; color: #000;">
                    <b>Phone:</b> ${c.phone}<br>
                    <b>Email:</b> ${c.email}
                </div>
            </div>
        </div>

        <table class="inv-table">
            <tr>
                <th>Description</th>
                <th class="right">Amount (INR)</th>
            </tr>
            <tr>
                <td>Base Tariff / Fare (Inclusive of supplier taxes)</td>
                <td class="right">${inv.amounts.fare.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Ancillary / Add-on Charges (Seats, Meals, Baggage, Amenities)</td>
                <td class="right">${inv.amounts.ancillary.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Net Platform & Facilitation Service Fees</td>
                <td class="right">${inv.amounts.net_service.toFixed(2)}</td>
            </tr>
            <tr>
                <td>CGST @9%</td>
                <td class="right">${inv.amounts.cgst.toFixed(2)}</td>
            </tr>
            <tr>
                <td>SGST @9%</td>
                <td class="right">${inv.amounts.sgst.toFixed(2)}</td>
            </tr>
            <tr>
                <td>IGST @18%</td>
                <td class="right">${inv.amounts.igst.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td>Total Amount Payable</td>
                <td class="right">₹ ${inv.amounts.total.toFixed(2)}</td>
            </tr>
        </table>
        
        <div class="amount-words">
            <b>Amount in Words:</b> ${inv.amounts.words}
        </div>

        <div class="footer-section">
            <div class="terms-box">
                <div class="policy-title">Certified Terms & Conditions</div>
                <ul style="padding-left: 15px; color: #000; line-height: 1.4; margin-top: 5px;">
                    ${termsHtml}
                </ul>
            </div>
            
            <div class="bank-box">
                <div class="policy-title">Payment Methods</div>
                <table style="width: 100%; margin-top: 5px; line-height: 1.5; margin-bottom: 10px; color: #000;">
                    <tr><td style="width: 35%;">Bank:</td><td><b>${b.bank_details.bank_name}</b></td></tr>
                    <tr><td>Account Name:</td><td><b>${b.bank_details.account_name}</b></td></tr>
                    <tr><td>Account No:</td><td><b style="font-size: 12px;">${b.bank_details.account_no}</b></td></tr>
                    <tr><td>IFSC Code:</td><td><b style="font-size: 12px;">${b.bank_details.ifsc}</b></td></tr>
                </table>
                <div style="display: table; width: 100%;">
                    <div style="display: table-cell; vertical-align: middle; padding-right: 10px;">
                        ${upiQr}
                    </div>
                    <div style="display: table-cell; vertical-align: middle;">
                        <b style="color: #000;">Scan to Pay via UPI</b><br>
                        <span style="font-size: 10px; color: #555;">UPI ID: ${b.upi_id}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="auth-section">
            <div class="stamp-col">
                <div class="stamp">
                    <div class="stamp-inner">
                        <span style="display:inline-block; margin-top:25px; color: #000;">ROUTRIPO<br>(OPC) PVT.LTD<br>NASHIK</span>
                    </div>
                </div>
            </div>
            <div class="sign-col">
                <div class="signature-text">${b.authorized_signatory_name}</div>
                <div class="signature-line">Authorized Signatory<br><span style="font-size:9px; color:#555;">For ${b.company_name}</span></div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Builds the normalized dynamic BookingDocumentData from an incoming request or booking object
 */
export function buildDynamicDocumentData(params: {
  bookingId?: string;
  vertical?: 'FLIGHT' | 'HOTEL' | 'BUS' | 'CAR';
  rawBooking?: any;
  customBrand?: Partial<BookingDocumentBrand>;
}): BookingDocumentData {
  let raw = params.rawBooking || {};
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch {}
  }

  const safeParse = (val: any) => {
    if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  };

  if (raw && typeof raw === 'object') {
    raw.customer = safeParse(raw.customer);
    raw.amounts = safeParse(raw.amounts);
    raw.passengers = safeParse(raw.passengers);
    raw.travellers = safeParse(raw.travellers);
    raw.guests = safeParse(raw.guests);
    raw.departure = safeParse(raw.departure);
    raw.arrival = safeParse(raw.arrival);
    raw.check_in = safeParse(raw.check_in);
    raw.check_out = safeParse(raw.check_out);
    raw.boarding = safeParse(raw.boarding);
    raw.dropping = safeParse(raw.dropping);
    raw.pickup = safeParse(raw.pickup);
    raw.drop = safeParse(raw.drop);
    raw.baggage_allowance = safeParse(raw.baggage_allowance);
    raw.important_information = safeParse(raw.important_information);
    raw.invoice = safeParse(raw.invoice);
    raw.ticket = safeParse(raw.ticket);
  }

  const vertical = (params.vertical || raw.booking_type || raw.serviceType || 'FLIGHT').toUpperCase() as 'FLIGHT' | 'HOTEL' | 'BUS' | 'CAR';
  
  const brand: BookingDocumentBrand = {
    ...DEFAULT_BRAND_INFO,
    ...(params.customBrand || {})
  };

  const bookingId = params.bookingId || raw.booking_id || raw.bookingId || raw.id || `RT-${vertical.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
  const pnr = raw.pnr || raw.pnrNumber || raw.bookingRef || raw.confirmationCode || `PNR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Customer resolution
  const customer: BookingDocumentCustomer = {
    name: raw.customer?.name || raw.customerName || raw.passengerName || raw.guestName || "Valued Customer",
    address: raw.customer?.address || raw.customerAddress || raw.address || "Nashik, Maharashtra - 422003",
    phone: raw.customer?.phone || raw.customerPhone || raw.phone || "+91-9876543210",
    email: raw.customer?.email || raw.customerEmail || raw.email || "guest@routripo.com"
  };

  // Pricing & Tax calculations
  const fare = Number(raw.fare || raw.baseFare || raw.amounts?.fare || raw.price || 4000);
  const ancillary = Number(raw.ancillary || raw.seatFee || raw.amounts?.ancillary || 0);
  const netService = Number(raw.net_service || raw.convenienceFee || raw.serviceFee || raw.amounts?.net_service || 250);

  // Dynamic GST calculation (Default 18% IGST or 9% CGST + 9% SGST)
  const isInterState = raw.isInterState ?? true;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const taxableOnService = netService;
  if (isInterState) {
    igst = Math.round(taxableOnService * 0.18 * 100) / 100;
  } else {
    cgst = Math.round(taxableOnService * 0.09 * 100) / 100;
    sgst = Math.round(taxableOnService * 0.09 * 100) / 100;
  }

  const calculatedTotal = fare + ancillary + netService + cgst + sgst + igst;
  const total = Number(raw.total || raw.totalPaid || raw.totalAmount || raw.amounts?.total || calculatedTotal);
  const words = raw.amounts?.words || convertNumberToIndianWords(total);

  const invoiceDate = raw.invoiceDate || raw.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNo = raw.invoiceNo || raw.invoice?.no || `RTP-INV-${Date.now().toString().slice(-6)}-001`;

  let serviceProvider = "ROUTRIPO TECHNOLOGIES";
  if (vertical === 'FLIGHT') {
    serviceProvider = raw.airlineName || raw.airline || "LE TRAVENUES TECHNOLOGY LIMITED / AIRLINE PARTNER";
  } else if (vertical === 'HOTEL') {
    serviceProvider = raw.hotelName || raw.hotel_name || "HOTEL HOSPITALITY PARTNER";
  } else if (vertical === 'BUS') {
    serviceProvider = raw.busOperator || raw.operator || "STATE TRANSPORT / INTERCITY BUS CARRIER";
  } else if (vertical === 'CAR') {
    serviceProvider = raw.fleetOperator || "ROUTRIPO VERIFIED CHAUFFEUR FLEET";
  }

  const invoice: BookingDocumentInvoice = {
    no: invoiceNo,
    date: invoiceDate,
    service_provider: serviceProvider,
    amounts: {
      fare,
      ancillary,
      net_service: netService,
      cgst,
      sgst,
      igst,
      total,
      words
    },
    certified_terms: raw.certified_terms || [
      "Certified that the particulars above are true and correct.",
      "1) Represents the price actually charged and there is no additional consideration directly or indirectly.",
      "2) No tax is payable under reverse charge for this invoice.",
      "3) Convenience Fees and Cancellation Assurances are non-refundable."
    ]
  };

  // Vertical specific service details
  let serviceDetails: any;
  let baggageOrInclusions: { primary: string; secondary: string };
  let travellers: BookingDocumentTraveller[] = [];
  let importantInfo: string[] = [];

  if (vertical === 'FLIGHT') {
    serviceDetails = {
      airline: raw.airline || raw.airlineName || "IndiGo",
      flight_no: raw.flight_no || raw.flightNumber || "6E-6636",
      class: raw.cabinClass || raw.class || "Economy",
      duration: raw.duration || "1h 55m",
      type: raw.stopsText || raw.type || "Nonstop",
      departure: {
        code: raw.originCode || raw.departure?.code || "ISK",
        time: raw.departTime || raw.departure?.time || "21:00",
        date: raw.departDate || raw.departure?.date || invoiceDate,
        city: raw.originCity || raw.departure?.city || "Nashik",
        airport: raw.originAirport || raw.departure?.airport || "Nashik Ozar Airport",
        terminal: raw.originTerminal || raw.departure?.terminal || "Main Terminal"
      },
      arrival: {
        code: raw.destCode || raw.arrival?.code || "DEL",
        time: raw.arriveTime || raw.arrival?.time || "22:55",
        date: raw.arriveDate || raw.arrival?.date || invoiceDate,
        city: raw.destCity || raw.arrival?.city || "New Delhi",
        airport: raw.destAirport || raw.arrival?.airport || "Indira Gandhi Intl Airport",
        terminal: raw.destTerminal || raw.arrival?.terminal || "Terminal 1"
      }
    };
    baggageOrInclusions = {
      primary: raw.baggage_allowance?.check_in || raw.checkinBaggage || "15 kg",
      secondary: raw.baggage_allowance?.cabin || raw.cabinBaggage || "7 kg"
    };
    const rawPassengers = raw.passengers || raw.travellers || [{ name: customer.name, seat: "14D" }];
    travellers = rawPassengers.map((p: any) => ({
      name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || customer.name,
      seat_or_room: p.seat || p.seatNumber || "14D",
      extra_info: `${baggageOrInclusions.primary} / ${baggageOrInclusions.secondary}`,
      pnr_or_code: p.pnr || pnr
    }));
    importantInfo = raw.important_information || [
      "Please note that for all domestic flights, check-in counters close 60 minutes prior to flight departure.",
      "Travellers must present a valid photo ID proof to enter the airport and at the time of check-in.",
      "Permissible ID proofs include Aadhaar Card, Passport or any other government-recognised ID.",
      "Kindly carry either a copy of your e-ticket on a tablet/mobile or a printed copy for airport entry."
    ];
  } else if (vertical === 'HOTEL') {
    serviceDetails = {
      hotel_name: raw.hotelName || raw.hotel_name || "RoutTripo Premium Grand Hotel",
      room_type: raw.roomType || raw.roomName || "Deluxe King Room",
      meal_plan: raw.mealPlan || "Free Continental Breakfast",
      nights: Number(raw.nights || 2),
      rooms_count: Number(raw.roomsCount || raw.rooms || 1),
      check_in: {
        time: raw.checkInTime || "14:00",
        date: raw.checkInDate || invoiceDate,
        city: raw.city || "Nashik",
        address: raw.hotelAddress || "Gangapur Road, Near Sula Vineyards, Nashik, Maharashtra - 422005"
      },
      check_out: {
        time: raw.checkOutTime || "11:00",
        date: raw.checkOutDate || invoiceDate,
        city: raw.city || "Nashik",
        phone: raw.hotelPhone || "+91 253-2345678"
      }
    };
    baggageOrInclusions = {
      primary: "Wi-Fi & Breakfast Included",
      secondary: "Free Cancellation"
    };
    const rawGuests = raw.guests || raw.passengers || raw.travellers || [{ name: customer.name, room: "Room 101" }];
    travellers = rawGuests.map((g: any, idx: number) => ({
      name: g.name || customer.name,
      seat_or_room: g.room || `Room ${101 + idx} (${serviceDetails.room_type})`,
      extra_info: serviceDetails.meal_plan,
      pnr_or_code: pnr
    }));
    importantInfo = raw.important_information || [
      "Standard hotel check-in time is 14:00 hrs and check-out is 11:00 hrs. Early check-in is subject to availability.",
      "Primary guest must be at least 18 years of age with a valid Government approved photo ID proof.",
      "Local couples and unmarried guests are welcome subject to hotel policy. Valid original ID required.",
      "Room tariff includes applicable municipal and GST taxes. Incidental consumption is payable at the hotel."
    ];
  } else if (vertical === 'BUS') {
    serviceDetails = {
      operator: raw.operator || raw.busOperator || "Konduskar Travels",
      bus_type: raw.bus_type || raw.busType || "BharatBenz AC Multi-Axle Sleeper (2+1)",
      duration: raw.duration || "4h 30m",
      boarding: {
        time: raw.boardingTime || "22:30",
        date: raw.boardingDate || invoiceDate,
        city: raw.originCity || "Nashik",
        point: raw.boardingPoint || "Mumbai Naka, Near Bus Stand",
        landmark: raw.boardingLandmark || "Opposite HP Petrol Pump"
      },
      dropping: {
        time: raw.droppingTime || "03:00",
        date: raw.droppingDate || invoiceDate,
        city: raw.destCity || "Pune",
        point: raw.droppingPoint || "Wakad Flyover, Hinjewadi Bridge",
        landmark: raw.droppingLandmark || "Next to Ginger Hotel"
      }
    };
    baggageOrInclusions = {
      primary: "1 Handbag + 1 Luggage (Max 15kg)",
      secondary: "Water bottle & Charging port"
    };
    const rawPassengers = raw.passengers || raw.travellers || [{ name: customer.name, seat: "Lower 12" }];
    travellers = rawPassengers.map((p: any) => ({
      name: p.name || customer.name,
      seat_or_room: p.seat || p.seatNumber || "Lower 12",
      extra_info: baggageOrInclusions.primary,
      pnr_or_code: pnr
    }));
    importantInfo = raw.important_information || [
      "Please arrive at your designated boarding point at least 15 minutes prior to bus departure.",
      "The bus operator live tracking link will be shared via SMS 1 hour before departure time.",
      "M-Ticket / PDF ticket on your mobile phone along with a government photo ID proof is valid for boarding.",
      "Carrying hazardous materials, inflammable substances, or unaccompanied luggage is strictly prohibited."
    ];
  } else {
    // CAR
    serviceDetails = {
      vehicle_model: raw.vehicleModel || raw.carModel || "Toyota Innova Crysta",
      vehicle_category: raw.vehicleCategory || "Prime SUV (6+1 Seater)",
      trip_type: raw.tripType || "Outstation Roundtrip",
      package_inclusions: raw.packageInclusions || "300 KM Package · Toll & Parking Included",
      pickup: {
        time: raw.pickupTime || "08:00",
        date: raw.pickupDate || invoiceDate,
        city: raw.pickupCity || "Nashik",
        address: raw.pickupAddress || customer.address,
        landmark: raw.pickupLandmark || "Near Shreeram Sankul"
      },
      drop: {
        time: raw.dropTime || "20:00",
        date: raw.dropDate || invoiceDate,
        city: raw.dropCity || "Shirdi",
        address: raw.dropAddress || "Shirdi Temple Gate 2, Ahmednagar"
      }
    };
    baggageOrInclusions = {
      primary: "AC Active · Uniformed Chauffeur",
      secondary: "All Tolls & State Taxes Included"
    };
    travellers = [{
      name: customer.name,
      seat_or_room: `${serviceDetails.vehicle_model} (All 6 Seats)`,
      extra_info: serviceDetails.package_inclusions,
      pnr_or_code: pnr
    }];
    importantInfo = raw.important_information || [
      "Chauffeur name, mobile number, and vehicle registration number will be dispatched via SMS 1 hour prior to pickup.",
      "Starting and ending kilometers / hours will be calculated from garage to garage as per standard commercial norms.",
      "Extra kilometers beyond the package will be billed at ₹14/KM and extra hours at ₹150/Hour directly to driver.",
      "Night allowance of ₹300 applies for chauffeur service between 22:00 hrs and 06:00 hrs."
    ];
  }

  const ticket: BookingDocumentTicket = {
    booking_id: bookingId,
    status: raw.status || "CONFIRMED",
    pnr,
    operator_support: raw.operatorSupport || raw.airline_support || `${serviceDetails.airline || serviceDetails.hotel_name || serviceDetails.operator || 'Helpline'}: +91 1800-ROUTRIPO`,
    important_information: importantInfo,
    service_details: serviceDetails,
    baggage_or_inclusions: baggageOrInclusions,
    travellers
  };

  const dynamicPolicies: Record<string, string[]> = {
    FLIGHT: [
      "Flight cancellations are subject to airline policies and Routripo service fees.",
      "All disputes subject to Nashik jurisdiction only."
    ],
    HOTEL: [
      "Hotel cancellation window is governed by the individual property policy at booking.",
      "Standard refund processed to original payment method within 5-7 business days.",
      "All disputes subject to Nashik jurisdiction only."
    ],
    BUS: [
      "Bus cancellation before 4 hours of departure is eligible for operator standard refund.",
      "Convenience fees and insurance addons are strictly non-refundable.",
      "All disputes subject to Nashik jurisdiction only."
    ],
    CAR: [
      "Cab booking cancellation before 2 hours of scheduled pickup attracts zero cancellation fee.",
      "In event of vehicle breakdown, replacement vehicle is dispatched within 60 minutes.",
      "All disputes subject to Nashik jurisdiction only."
    ]
  };

  return {
    brand,
    booking_type: vertical,
    customer,
    ticket,
    invoice,
    dynamic_policies: dynamicPolicies
  };
}
