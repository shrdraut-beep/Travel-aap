import express from 'express';
import Razorpay from 'razorpay';
import { calculateServerTax, ServiceType } from './taxEngine';

const router = express.Router();
const razorpay = new Razorpay({ 
  key_id: process.env.RZP_KEY || process.env.VITE_RAZORPAY_KEY_ID || '', 
  key_secret: process.env.RZP_SECRET || '' 
});

router.post('/create-order', express.json(), async (req, res) => {
  try {
    const { supplierBaseFare, supplierTaxes, baseAmount, amount, serviceType, buyerState, vendorAccountId } = req.body;

    const actualBaseFare = supplierBaseFare ?? baseAmount ?? amount ?? 0;
    const actualTaxes = supplierTaxes ?? 0;

    if (!actualBaseFare || actualBaseFare <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid base amount' });
    }

    // १. सर्व्हरवर टॅक्स कॅल्क्युलेट करणे (App कडून आलेले आकडे न वापरता)
    const pricing = await calculateServerTax(
      actualBaseFare,
      actualTaxes,
      (serviceType as ServiceType) || 'direct_app_booking',
      buyerState || 'MH'
    );

    // २. Razorpay Payload तयार करणे
    const payload: any = {
      amount: Math.round(pricing.customerPays * 100), // पैसे (Paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    // ३. व्हेंडर कमिशन असल्यास Route Split लावणे
    if (serviceType === 'vendor_commission' && vendorAccountId) {
      payload.transfers = [{
        account: vendorAccountId,
        amount: Math.round(pricing.vendorPayout * 100),
        currency: "INR",
        notes: { info: "Vendor Payout" }
      }];
    }

    // ४. Razorpay कडून Order बनवणे
    const order = await razorpay.orders.create(payload);

    // ५. ॲपला Order ID आणि ब्रेकअप परत पाठवणे (Invoice दाखवण्यासाठी)
    res.json({
      success: true,
      orderId: order.id,
      amountToPay: pricing.customerPays,
      taxBreakup: pricing 
    });

  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error creating secure order", details: error?.message });
  }
});

export default router;
