import paymentRouter from '../server/routes/payment.ts';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/api/razorpay', paymentRouter);

const server = app.listen(0, async () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3001;
  console.log('Test server listening on port', port);

  try {
    const res = await fetch('http://127.0.0.1:' + port + '/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierBaseFare: 10000,
        supplierTaxes: 1800,
        serviceType: 'vendor_commission',
        buyerState: 'MH'
      })
    });
    const data = await res.json();
    console.log('Test order creation response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Request error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
