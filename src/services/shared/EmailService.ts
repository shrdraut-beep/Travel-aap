import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendBookingConfirmation(email: string, pdfBuffer: Buffer, bookingId: string) {
    await this.transporter.sendMail({
      from: '"RouTripO" <noreply@routrip.com>',
      to: email,
      subject: `Booking Confirmed - ${bookingId}`,
      text: 'Your booking is confirmed. Please find the attached invoice.',
      attachments: [
        {
          filename: `invoice_${bookingId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }
}

export const emailService = new EmailService();
