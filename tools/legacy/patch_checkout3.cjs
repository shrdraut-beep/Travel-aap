const fs = require('fs');
let content = fs.readFileSync('src/components/travel/UniversalBookingCheckoutModal.tsx', 'utf8');

const importStatement = `import { apiClient } from '../../utils/apiClient';\n`;
if(!content.includes("import { apiClient }")) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + importStatement);
}

const replacement = `
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let orderId = \`ORD_\${Date.now()}_\${Math.random().toString(36).substring(2, 7).toUpperCase()}\`;
      let docId = '';

      if (paymentMethod === 'razorpay') {
        try {
          const res = await apiClient.authedFetch('/api/checkout/create-order', {
            method: 'POST',
            body: JSON.stringify({
              itemType: item.vertical,
              itemId: item.id,
              quantity: quantity
            })
          });
          const data = await res.json();
          
          if (!data.success) {
            throw new Error(data.error || "Failed to create order");
          }

          const rzpOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123',
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'RoutripO',
            description: item.title,
            order_id: data.order.id,
            handler: async function (response: any) {
              setProcessingTicket(true);
              setIsProcessing(false);
              
              const newDocRef = await addDoc(collection(db, 'bookings'), {
                bookingId: orderId,
                orderId,
                itemId: item.id,
                itemTitle: item.title,
                type: item.vertical,
                date: travelDate,
                quantity,
                totalAmount: finalDiscountedPayable,
                status: 'Confirmed',
                paymentId: response.razorpay_payment_id,
                customer: { name: custName, email: custEmail, phone: custPhone },
                PNR_Number: Math.random().toString(36).substring(2, 10).toUpperCase()
              });
              setBookingDocId(newDocRef.id);
              
              setTimeout(() => {
                setCompletedBooking({
                  id: newDocRef.id,
                  bookingId: orderId,
                  status: 'Confirmed',
                  ...item
                } as any);
                setProcessingTicket(false);
                if (onBookingSuccess) onBookingSuccess(data);
              }, 2000);
            },
            prefill: {
              name: custName,
              email: custEmail,
              contact: custPhone
            },
            theme: { color: '#0f172a' }
          };

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => {
            const rzp = new (window as any).Razorpay(rzpOptions);
            rzp.on('payment.failed', function (response: any) {
              alert("Payment failed: " + response.error.description);
              setIsProcessing(false);
            });
            rzp.open();
          };
          document.body.appendChild(script);

          return; // Exit here, let Razorpay handler continue the flow

        } catch (apiError) {
          console.error("Razorpay API Error:", apiError);
          alert("Could not connect to Razorpay API. Check server logs. Falling back to dummy ticket.");
        }
      }

      // Fallback Dummy Flow
      const newDocRef = await addDoc(collection(db, 'bookings'), {
        bookingId: orderId,
        orderId,
        itemId: item.id,
        itemTitle: item.title,
        type: item.vertical,
        date: travelDate,
        quantity,
        totalAmount: finalDiscountedPayable,
        status: 'Confirmed',
        customer: { name: custName, email: custEmail, phone: custPhone },
        PNR_Number: Math.random().toString(36).substring(2, 10).toUpperCase()
      });
      docId = newDocRef.id;
      setBookingDocId(docId);
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setProcessingTicket(true);
      setIsProcessing(false);
      
      setTimeout(() => {
        setProcessingTicket(false);
        setCompletedBooking({
           id: docId,
           bookingId: orderId,
           status: 'Confirmed',
           ...item
        } as any);
        if (onBookingSuccess) onBookingSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Payment Error', error);
      setIsProcessing(false);
    }
  };
`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('const handleProceedToPayment = async'));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.trim() === '};' && lines[idx+2] && lines[idx+2].includes('const getVerticalIcon'));

if(startIdx !== -1 && endIdx !== -1) {
  content = lines.slice(0, startIdx).join('\n') + '\n' + replacement.trim() + '\n' + lines.slice(endIdx+1).join('\n');
  fs.writeFileSync('src/components/travel/UniversalBookingCheckoutModal.tsx', content);
  console.log("Patched successfully");
} else {
  console.log("Could not find bounds", startIdx, endIdx);
}
