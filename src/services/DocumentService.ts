/**
 * RoutTripo Dynamic Document Service
 * Handles fetching dynamic booking data from backend API and
 * exporting official A4 PDF Tickets and Tax Invoices for Flight, Hotel, Bus, and Car.
 */

import { exportElementToPdf } from '../utils/exportUtils';

export type TravelVertical = 'FLIGHT' | 'HOTEL' | 'BUS' | 'CAR';

export interface DynamicDocumentResponse {
  success: boolean;
  data: any;
  error?: string;
}

/**
 * Fetches dynamic, normalized document JSON from the server API
 */
export async function fetchBookingDocumentData(params: {
  bookingId?: string;
  vertical?: TravelVertical;
  rawBooking?: any;
}): Promise<any> {
  const payload = {
    bookingId: params.bookingId || params.rawBooking?.bookingId || params.rawBooking?.booking_id || params.rawBooking?.id,
    vertical: (params.vertical || params.rawBooking?.booking_type || 'FLIGHT').toUpperCase(),
    rawBooking: params.rawBooking || {}
  };

  try {
    const res = await fetch('/api/documents/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`);
    }

    const result: DynamicDocumentResponse = await res.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid document data received from server');
    }

    return result.data;
  } catch (error) {
    console.warn('[DocumentService] Failed to fetch from /api/documents/data, using local fallback:', error);
    // Return structured payload from rawBooking if offline
    return null;
  }
}

/**
 * Fetches rendered HTML string for Ticket or Invoice from the server
 */
export async function fetchDocumentHTML(data: any, type: 'ticket' | 'invoice'): Promise<string> {
  const res = await fetch('/api/documents/render-html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, type })
  });

  if (!res.ok) {
    throw new Error(`Failed to render document HTML: ${res.statusText}`);
  }

  const result = await res.json();
  if (!result.success || !result.html) {
    throw new Error(result.error || 'Failed to render document HTML');
  }

  return result.html;
}

/**
 * Downloads official A4 PDF Ticket for any vertical (Flight, Hotel, Bus, Car)
 */
export async function downloadTicketPDF(params: {
  bookingId?: string;
  vertical?: TravelVertical;
  rawBooking?: any;
}): Promise<void> {
  const docData = await fetchBookingDocumentData(params);
  if (!docData) {
    throw new Error('Unable to retrieve dynamic ticket data');
  }

  const html = await fetchDocumentHTML(docData, 'ticket');
  const filename = `ROUTRIPO_${docData.booking_type}_Ticket_${docData.ticket.pnr || docData.ticket.booking_id}.pdf`;

  await exportHTMLStringToPDF(html, filename);
}

/**
 * Downloads official A4 PDF Tax Invoice for any vertical (Flight, Hotel, Bus, Car)
 */
export async function downloadInvoicePDF(params: {
  bookingId?: string;
  vertical?: TravelVertical;
  rawBooking?: any;
}): Promise<void> {
  const docData = await fetchBookingDocumentData(params);
  if (!docData) {
    throw new Error('Unable to retrieve dynamic invoice data');
  }

  const html = await fetchDocumentHTML(docData, 'invoice');
  const filename = `ROUTRIPO_${docData.booking_type}_Tax_Invoice_${docData.invoice.no || docData.ticket.booking_id}.pdf`;

  await exportHTMLStringToPDF(html, filename);
}

/**
 * Opens a standalone preview in a new browser tab
 */
export async function openDocumentPreview(params: {
  bookingId?: string;
  vertical?: TravelVertical;
  rawBooking?: any;
  type: 'ticket' | 'invoice';
}): Promise<void> {
  const docData = await fetchBookingDocumentData(params);
  if (!docData) {
    throw new Error('Unable to retrieve document data for preview');
  }

  const html = await fetchDocumentHTML(docData, params.type);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * Helper to mount HTML string into temporary DOM element and invoke exportElementToPdf
 */
async function exportHTMLStringToPDF(htmlString: string, filename: string): Promise<void> {
  const container = document.createElement('div');
  container.id = `pdf-export-container-${Date.now()}`;
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 at 96 DPI
  container.style.background = '#ffffff';
  container.style.zIndex = '-1000';
  container.innerHTML = htmlString;

  document.body.appendChild(container);

  try {
    // Extract inner container if present to preserve exact layout
    const targetElement = (container.querySelector('.container') as HTMLElement) || container;
    await exportElementToPdf(targetElement, filename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
