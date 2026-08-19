const Razorpay = require('razorpay');
const key_id = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.length > 5 ? process.env.RAZORPAY_KEY_ID : process.env.VITE_RAZORPAY_KEY_ID).trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.length > 5 ? process.env.RAZORPAY_KEY_SECRET : process.env.VITE_RAZORPAY_KEY_SECRET).trim();

const rzp = new Razorpay({ key_id, key_secret });

rzp.orders.create({ amount: 1000, currency: "INR", receipt: "test_receipt" })
  .then(order => console.log("SUCCESS:", order.id))
  .catch(err => console.error("ERROR:", err));
