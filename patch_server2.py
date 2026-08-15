import re

with open("server.ts", "r") as f:
    content = f.read()

replace_target = """
  try {
    const taxInfo = calculateRouTriOTaxes(bookingData as any);
    res.json({ success: true, status: "CONFIRMED", taxes: taxInfo });
  } catch(e: any) {
"""

replace_with = """
  try {
    const taxInfo = calculateRouTriOTaxes(bookingData as any);
    
    // Send email via NotificationService if email is provided in bookingData
    const customerEmail = bookingData.customerEmail || bookingData.email;
    if (customerEmail) {
       sendCustomerInvoiceEmail(customerEmail, {
          ...bookingData,
          totalAmount: bookingData.price || bookingData.totalAmount || 0
       }).catch(err => console.error("Failed to send manual invoice:", err));
    }

    res.json({ success: true, status: "CONFIRMED", taxes: taxInfo, emailSent: !!customerEmail });
  } catch(e: any) {
"""

content = content.replace(replace_target.strip(), replace_with.strip())

with open("server.ts", "w") as f:
    f.write(content)
