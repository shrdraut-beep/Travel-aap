const kid1 = process.env.VITE_RAZORPAY_KEY_ID || '';
const kid2 = process.env.RAZORPAY_KEY_ID || '';
const ksec = process.env.RAZORPAY_KEY_SECRET || '';

console.log("VITE_RAZORPAY_KEY_ID length:", kid1.length);
console.log("RAZORPAY_KEY_ID length:", kid2.length);
console.log("RAZORPAY_KEY_SECRET length:", ksec.length);
