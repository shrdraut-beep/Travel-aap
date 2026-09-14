import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface HotelVoucherData {
  bookingRef: string;
  hotelName: string;
  hotelAddress?: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomsCount?: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  paymentId?: string;
  paymentMethod?: string;
  pricing: {
    baseRate: number;
    taxes: number;
    platformFee?: number;
    gstAmount?: number;
    grandTotal: number;
    currency?: string;
  };
  businessGstin?: {
    gstin: string;
    companyName: string;
    companyAddress?: string;
  };
  specialRequest?: string;
}

/**
 * Generates an official, beautifully styled RoutTripo Hotel Booking Voucher (PDF)
 * with a dynamic verification QR Code and comprehensive tax breakdown.
 */
export async function generateHotelVoucherPDF(data: HotelVoucherData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const primaryBrand = [225, 29, 72]; // #E11D48 (Rose 600)
  const darkSlate = [15, 23, 42];     // #0F172A
  const lightSlate = [100, 116, 139]; // #64748B
  const bgCard = [248, 250, 252];     // #F8FAFC
  const borderCol = [226, 232, 240];  // #E2E8F0
  const emeraldSuccess = [5, 150, 105]; // #059669

  // --- 1. TOP HEADER BANNER ---
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RoutTripo', margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Pravas Wataghati · Official Hotel Confirmation Voucher', margin, 21);

  // Status Badge in Header
  doc.setFillColor(emeraldSuccess[0], emeraldSuccess[1], emeraldSuccess[2]);
  doc.roundedRect(pageWidth - margin - 42, 8, 42, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMED', pageWidth - margin - 21, 15.5, { align: 'center' });

  // --- 2. BOOKING SUMMARY & QR CODE STRIP ---
  let y = 36;
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 4, 4, 'FD');

  // Left details
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text('BOOKING REFERENCE (PNR)', margin + 6, y + 8);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
  doc.text(data.bookingRef, margin + 6, y + 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`Booking Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin + 6, y + 23);
  doc.text(`Payment ID: ${data.paymentId || 'N/A'} (Razorpay Verified)`, margin + 6, y + 29);

  // Right QR Code
  try {
    const qrData = `ROUTRIPO:HOTEL:${data.bookingRef}:${data.hotelName}:${data.checkInDate}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, { width: 100, margin: 1 });
    doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - 32, y + 3, 28, 28);
  } catch (err) {
    console.warn('QR Code generation failed, skipping:', err);
  }

  // --- 3. HOTEL PROPERTY DETAILS ---
  y += 40;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Property & Stay Information', margin, y);

  y += 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'FD');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(data.hotelName, margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text(data.hotelAddress || 'Goa, India', margin + 6, y + 16);

  // Check-In / Check-Out Grid inside Hotel Card
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.roundedRect(margin + 6, y + 21, contentWidth - 12, 12, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text('CHECK-IN', margin + 10, y + 26);
  doc.text('CHECK-OUT', margin + 65, y + 26);
  doc.text('DURATION / ROOMS', margin + 120, y + 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`${data.checkInDate} (2:00 PM)`, margin + 10, y + 31);
  doc.text(`${data.checkOutDate} (11:00 AM)`, margin + 65, y + 31);
  doc.text(`${data.nights} Night(s) · ${data.roomsCount || 1} Room(s)`, margin + 120, y + 31);

  // --- 4. GUEST & ROOM SELECTION DETAILS ---
  y += 44;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Guest & Room Details', margin, y);

  y += 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.roundedRect(margin, y, contentWidth, 32, 4, 4, 'FD');

  // Room Type
  doc.setFontSize(8);
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text('ROOM TYPE RESERVED', margin + 6, y + 8);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(data.roomName, margin + 6, y + 15);

  // Lead Guest
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text('PRIMARY GUEST', margin + 100, y + 8);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(data.guestName, margin + 100, y + 15);

  // Contact
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text(`Email: ${data.guestEmail || 'Registered Customer'} | Phone: ${data.guestPhone || 'On File'}`, margin + 6, y + 23);

  if (data.specialRequest) {
    doc.text(`Special Request: ${data.specialRequest}`, margin + 6, y + 28);
  }

  // --- 5. TAX INVOICE BREAKDOWN ---
  y += 38;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Official Payment & Tax Invoice', margin, y);

  y += 4;
  doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'FD');

  // Table header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text('ITEM DESCRIPTION', margin + 6, y + 8);
  doc.text('AMOUNT (INR)', pageWidth - margin - 6, y + 8, { align: 'right' });

  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.line(margin + 6, y + 10, pageWidth - margin - 6, y + 10);

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`Room Tariff (${data.nights} night(s))`, margin + 6, y + 16);
  doc.text(`₹${data.pricing.baseRate.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 16, { align: 'right' });

  doc.text('Hotel GST & Municipal Taxes', margin + 6, y + 22);
  doc.text(`₹${data.pricing.taxes.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 22, { align: 'right' });

  if (data.pricing.platformFee) {
    doc.text('RoutTripo Convenience Fee (5% incl. 18% GST)', margin + 6, y + 28);
    const feeWithGst = data.pricing.platformFee + (data.pricing.gstAmount || 0);
    doc.text(`₹${feeWithGst.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 28, { align: 'right' });
  }

  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.line(margin + 6, y + 31, pageWidth - margin - 6, y + 31);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryBrand[0], primaryBrand[1], primaryBrand[2]);
  doc.text('TOTAL PAID (PAID ONLINE)', margin + 6, y + 37);
  doc.text(`₹${data.pricing.grandTotal.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 37, { align: 'right' });

  // Optional GSTIN details
  if (data.businessGstin?.gstin) {
    y += 46;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(`Business GSTIN: ${data.businessGstin.gstin} | Company: ${data.businessGstin.companyName}`, margin, y);
  }

  // --- 6. CHECK-IN INSTRUCTIONS & HELPLINE FOOTER ---
  const footerY = pageHeight - 34;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, footerY, contentWidth, 24, 3, 3, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('IMPORTANT CHECK-IN GUIDELINES:', margin + 4, footerY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(lightSlate[0], lightSlate[1], lightSlate[2]);
  doc.text('1. Primary guest must present a valid government-issued photo ID (Aadhaar, Passport, Driving License) at check-in.', margin + 4, footerY + 11);
  doc.text('2. Standard hotel check-in time is 2:00 PM and check-out is 11:00 AM. Early check-in is subject to property availability.', margin + 4, footerY + 16);
  doc.text('3. Need help with your stay? Contact RoutTripo 24x7 Helpline: support@routripo.com | Call: +91 1800-ROUTRIPO', margin + 4, footerY + 21);

  // Save the document directly
  const safeFilename = `RoutTripo_Voucher_${data.bookingRef}.pdf`;
  doc.save(safeFilename);
}
