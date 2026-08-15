import re

with open("src/NotificationService.ts", "r") as f:
    content = f.read()

# Replace generateInvoicePDF logic
old_generate = "async function generateInvoicePDF"
new_generate_pdf = """
async function generateInvoicePDF(bookingDetails: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  
  page.drawText('RouTriO - Tax Invoice & Booking Confirmation', {
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
"""

content = re.sub(r'async function generateInvoicePDF.*?return Buffer\.from\(pdfBytes\);\n\}', new_generate_pdf.strip(), content, flags=re.DOTALL)

# Replace sendCustomerInvoiceEmail logic
new_send = """
export async function sendCustomerInvoiceEmail(customerEmail: string, bookingDetails: any) {
  try {
    const transporter = createTransporter();
    const pdfBuffer = await generateInvoicePDF(bookingDetails);

    const mailOptions = {
      from: `"RouTriO Bookings" <${process.env.SMTP_USER || 'contact@routripo.com'}>`,
      to: customerEmail,
      subject: `🎉 Your Trip to ${bookingDetails.destination || 'your destination'} is Confirmed! (RouTriO)`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff3366;">RouTriO - Booking Confirmed!</h2>
            <p>Hi <b>${bookingDetails.name || bookingDetails.customerName || 'Traveler'}</b>,</p>
            <p>Your booking to <b>${bookingDetails.destination || 'your destination'}</b> has been successfully locked in.</p>
            <p>We have attached your official GST Tax Invoice (PDF) to this email for your records.</p>
            <br>
            <p>Safe Travels,<br><b>Team RouTriO</b></p>
        </div>
      `,
      attachments: [
        {
          filename: `RouTriO-Invoice-${bookingDetails.id || 'booking'}.pdf`,
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
"""

content = re.sub(r'export async function sendCustomerInvoiceEmail.*?throw error;\n\}', new_send.strip(), content, flags=re.DOTALL)

with open("src/NotificationService.ts", "w") as f:
    f.write(content)
