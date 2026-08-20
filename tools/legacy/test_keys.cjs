// Quick check to see if the user updated the keys in the environment
const kid = process.env.VITE_RAZORPAY_KEY_ID || '';
const ksec = process.env.RAZORPAY_KEY_SECRET || '';
const s_kid = process.env.RAZORPAY_KEY_ID || '';

console.log("VITE_RAZORPAY_KEY_ID length:", kid.length);
console.log("RAZORPAY_KEY_SECRET length:", ksec.length);
console.log("RAZORPAY_KEY_ID length:", s_kid.length);
