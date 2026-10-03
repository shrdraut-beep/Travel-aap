import express, { Request, Response } from 'express';
import { 
  buildDynamicDocumentData, 
  renderTicketHTML, 
  renderInvoiceHTML, 
  BookingDocumentData 
} from '../services/documentTemplateEngine.ts';
import { getSafeAdminFirestore } from '../firebaseAdmin.ts';

export const documentsRouter = express.Router();

const getDb = () => {
  return getSafeAdminFirestore();
};

/**
 * POST /api/documents/data
 * Builds dynamic document JSON for any vertical and booking payload
 */
documentsRouter.post('/data', express.json(), async (req: Request, res: Response) => {
  try {
    let { bookingId, vertical, rawBooking, customBrand } = req.body;
    if (typeof rawBooking === 'string') {
      try {
        rawBooking = JSON.parse(rawBooking);
      } catch {}
    }
    if (typeof customBrand === 'string') {
      try {
        customBrand = JSON.parse(customBrand);
      } catch {}
    }
    const resolvedRaw = rawBooking || req.body;
    const documentData = buildDynamicDocumentData({
      bookingId: bookingId || resolvedRaw?.bookingId || resolvedRaw?.booking_id,
      vertical: (vertical || resolvedRaw?.booking_type || 'FLIGHT').toUpperCase(),
      rawBooking: resolvedRaw,
      customBrand
    });
    res.json({ success: true, data: documentData });
  } catch (error: any) {
    console.error('[DocumentAPI] Error building document data:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to generate document data' });
  }
});

/**
 * GET /api/documents/data/:bookingId
 * Looks up booking from Firestore (or builds from query params) and returns dynamic JSON
 */
documentsRouter.get('/data/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const verticalQuery = (req.query.vertical as string || req.query.type as string || 'FLIGHT').toUpperCase() as any;
    
    let rawBooking: any = null;
    const db = getDb();
    if (db && bookingId) {
      try {
        const collections = ['bookings', 'checkout_orders', 'rtaip_checkout_orders', 'tickets'];
        for (const col of collections) {
          const snap = await db.collection(col).doc(bookingId).get();
          if (snap.exists) {
            rawBooking = snap.data();
            break;
          }
        }
      } catch (dbErr) {
        console.warn('[DocumentAPI] Notice querying Firestore for bookingId:', dbErr);
      }
    }

    const documentData = buildDynamicDocumentData({
      bookingId,
      vertical: verticalQuery,
      rawBooking: rawBooking || { booking_id: bookingId }
    });

    res.json({ success: true, data: documentData });
  } catch (error: any) {
    console.error('[DocumentAPI] Error fetching document data:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch document data' });
  }
});

/**
 * GET /api/documents/ticket/:bookingId/html
 * Renders standalone HTML for the E-Ticket / Voucher
 */
documentsRouter.get('/ticket/:bookingId/html', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const vertical = (req.query.vertical as string || req.query.type as string || 'FLIGHT').toUpperCase() as any;
    
    const documentData = buildDynamicDocumentData({
      bookingId,
      vertical
    });

    const html = renderTicketHTML(documentData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`<h3>Error generating ticket HTML: ${error?.message}</h3>`);
  }
});

/**
 * GET /api/documents/invoice/:bookingId/html
 * Renders standalone HTML for the Tax Invoice
 */
documentsRouter.get('/invoice/:bookingId/html', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const vertical = (req.query.vertical as string || req.query.type as string || 'FLIGHT').toUpperCase() as any;
    
    const documentData = buildDynamicDocumentData({
      bookingId,
      vertical
    });

    const html = renderInvoiceHTML(documentData);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`<h3>Error generating invoice HTML: ${error?.message}</h3>`);
  }
});

/**
 * POST /api/documents/render-html
 * Accepts full dynamic JSON and returns rendered HTML for ticket and invoice
 */
documentsRouter.post('/render-html', express.json(), (req: Request, res: Response) => {
  try {
    let { data, type } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing document data' });
    }

    const safeParse = (val: any) => {
      if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };

    data = safeParse(data);
    if (data && typeof data === 'object') {
      data.brand = safeParse(data.brand);
      data.customer = safeParse(data.customer);
      data.ticket = safeParse(data.ticket);
      data.invoice = safeParse(data.invoice);
      data.dynamic_policies = safeParse(data.dynamic_policies);
      if (data.ticket && typeof data.ticket === 'object') {
        data.ticket.service_details = safeParse(data.ticket.service_details);
        data.ticket.travellers = safeParse(data.ticket.travellers);
        data.ticket.important_information = safeParse(data.ticket.important_information);
        data.ticket.baggage_or_inclusions = safeParse(data.ticket.baggage_or_inclusions);
      }
      if (data.invoice && typeof data.invoice === 'object') {
        data.invoice.amounts = safeParse(data.invoice.amounts);
        data.invoice.certified_terms = safeParse(data.invoice.certified_terms);
      }
    }

    const documentType = (type || 'ticket').toLowerCase();
    const html = documentType === 'invoice' ? renderInvoiceHTML(data) : renderTicketHTML(data);
    res.json({ success: true, html });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to render HTML' });
  }
});

export default documentsRouter;
