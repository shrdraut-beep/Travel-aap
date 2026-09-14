=======================================================================
Routripo Travelport Tax Engine & Razorpay Payment Module
=======================================================================

फाइल्स यादी (Files Included):
1. taxEngine.ts       - Server-side Zero-Trust Tax calculation engine using Firestore
2. paymentRoute.ts    - Express server Razorpay /create-order API with Route Split & Payouts
3. clientCheckout.ts  - Client-side React/TypeScript checkout handler invoking Razorpay gateway

वैशिष्ट्ये (Key Features):
- Firestore वरील dynamic GST tax configuration
- Travelport supplierBaseFare + supplierTaxes चे अचूक विभाजन
- Routripo 5% Platform fee वर स्वतंत्र १८% GST कॅल्क्युलेशन
- B2B (vendor_commission) आणि B2C (direct_app_booking) सेवेनुसार पेआउट/पेमेंट विभागणी
- राज्यानुसार CGST / SGST / IGST वर्गीकरण
- Razorpay Route Split transfers द्वारे vendorAccountId ला थेट सुरक्षित पेआउट

वापर (Usage):
1. taxEngine.ts फाईल server/payment/ फोल्डरमध्ये ठेवा.
2. paymentRoute.ts फाईल server मध्ये mount करा (app.use('/api/payment', paymentRouter)).
3. clientCheckout.ts फ्रंटएन्ड कंपोनंटमध्ये वापरून Razorpay पेमेंट सुरु करा.
=======================================================================
