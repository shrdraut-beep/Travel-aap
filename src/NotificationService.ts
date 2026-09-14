import nodemailer from 'nodemailer';
import { getMessaging } from 'firebase-admin/messaging';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// -------------------------------------------------------------------------
// 1. Setup Nodemailer Transporter
// -------------------------------------------------------------------------
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'contact@routripo.com',
      pass: process.env.SMTP_PASS, // The app password or SMTP password
    },
  });
};

// -------------------------------------------------------------------------
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Helper: Generate PDF Invoice in-memory
// -------------------------------------------------------------------------
async function generateInvoicePDF(bookingDetails: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  
  page.drawText('RoutTripo - Tax Invoice & Booking Confirmation', {
      x: 50,
      y: 350,
      size: 18,
      color: rgb(0.1, 0.1, 0.4),
  });

  page.drawText(`Booking ID: ${bookingDetails.id || 'N/A'}`, { x: 50, y: 310, size: 12 });
  page.drawText(`Destination: ${bookingDetails.destination || 'N/A'}`, { x: 50, y: 290, size: 12 });
  page.drawText(`Total Paid: INR ${bookingDetails.totalAmount || '0'}`, { x: 50, y: 270, size: 12 });
  page.drawText(`GST / Tax Included (ECO Compliance)`, { x: 50, y: 230, size: 10, color: rgb(0.5, 0.5, 0.5) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// -------------------------------------------------------------------------
// Main Functions
// -------------------------------------------------------------------------

/**
 * Sends a push notification via Firebase Cloud Messaging (FCM).
 */

/**
 * Sends a confirmation email with a dynamically generated PDF invoice.
 */
export async function sendCustomerInvoiceEmail(customerEmail: string, bookingDetails: any) {
  try {
    const transporter = createTransporter();
    const pdfBuffer = await generateInvoicePDF(bookingDetails);

    const mailOptions = {
      from: `"RoutTripo Notifications" <${process.env.SMTP_USER || 'contact@routripo.com'}>`,
      to: customerEmail,
      subject: `Your RoutTripo Booking is Confirmed! (ID: ${bookingDetails.id})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1a56db;">Your booking is confirmed! 🎉</h2>
          <p>Hi <strong>${bookingDetails.name || 'Traveler'}</strong>,</p>
          <p>Thank you for choosing RoutTripo. We're thrilled to confirm your booking for <strong>${bookingDetails.destination || 'your upcoming trip'}</strong>.</p>
          <p>Please find your official invoice attached to this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">If you have any questions, feel free to reply to this email.</p>
          <p style="font-size: 12px; color: #888;">Safe travels,<br>The RoutTripo Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `RoutTripo_Invoice_${bookingDetails.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Confirmation sent to ${customerEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] Failed to send invoice to ${customerEmail}:`, error);
    throw error;
  }
}

export async function sendPushNotification(userDeviceToken: string, bookingDetails: any) {
  try {
    if (!userDeviceToken) {
      console.warn('[FCM] Device token missing. Skipping push notification.');
      return;
    }

    const message = {
      notification: {
        title: '🎉 Booking Confirmed!',
        body: `Your trip to ${bookingDetails.destination || 'your destination'} is confirmed. Check your email for the invoice.`,
      },
      token: userDeviceToken,
    };

    const response = await getMessaging().send(message);
    console.log(`[FCM] Push notification sent successfully: ${response}`);
    return response;
  } catch (error) {
    console.error(`[FCM] Failed to send push notification:`, error);
    throw error;
  }
}
