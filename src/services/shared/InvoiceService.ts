import PDFDocument from 'pdfkit';
import { calculateTotal } from '../../utils/taxCalculator';

export class InvoiceService {
  async generateInvoice(booking: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text('Booking Invoice', { align: 'center' });
      doc.moveDown();

      // Booking Details
      doc.fontSize(12).text(`Booking ID: ${booking.id}`);
      doc.text(`PNR: ${booking.PNR_Number}`);
      doc.moveDown();

      // Calculation
      const totals = calculateTotal(booking.baseFare, booking.apiTaxes, booking.convenienceFee);
      
      // Table
      doc.text('Description              Amount');
      doc.text('-----------------------------------');
      doc.text(`Base Fare              ₹${totals.baseFare.toFixed(2)}`);
      doc.text(`API Taxes              ₹${totals.apiTaxes.toFixed(2)}`);
      doc.text(`Convenience Fee        ₹${totals.convenienceFee.toFixed(2)}`);
      doc.text(`GST (18%)              ₹${totals.gstOnConvenience.toFixed(2)}`);
      doc.text('-----------------------------------');
      doc.fontSize(14).text(`Total:                 ₹${totals.total.toFixed(2)}`);

      doc.end();
    });
  }
}

export const invoiceService = new InvoiceService();
