import nodemailer from 'nodemailer';
import { PDFDocument, rgb } from 'pdf-lib';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true, 
    auth: {
        user: process.env.SMTP_USER || 'contact@routripo.com',
        pass: process.env.SMTP_PASS || ''
    }
});

export async function generatePDFInvoice(bookingDetails: any): Promise<Buffer> {
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

export async function sendCustomerInvoiceEmail(customerEmail: string, bookingDetails: any): Promise<boolean> {
    try {
        if (!process.env.SMTP_PASS) {
            console.error('❌ Error sending email: SMTP_PASS is missing from environment variables.');
            return false;
        }

        const pdfBuffer = await generatePDFInvoice(bookingDetails);

        const mailOptions = {
            from: `"RoutTripo Bookings" <${process.env.SMTP_USER || 'contact@routripo.com'}>`,
            to: customerEmail,
            subject: `🎉 Your Trip to ${bookingDetails.destination} is Confirmed! (RoutTripo)`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #ff3366;">RoutTripo - Booking Confirmed!</h2>
                    <p>Hi <b>${bookingDetails.customerName || 'Customer'}</b>,</p>
                    <p>Your booking to <b>${bookingDetails.destination || 'your destination'}</b> has been successfully locked in.</p>
                    <p>We have attached your official GST Tax Invoice (PDF) to this email for your records.</p>
                    <br>
                    <p>Safe Travels,<br><b>Team RoutTripo</b></p>
                </div>
            `,
            attachments: [
                {
                    filename: `RoutTripo-Invoice-${bookingDetails.id || 'booking'}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}
