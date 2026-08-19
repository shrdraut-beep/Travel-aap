// Let's search all environment variables for anything that looks like a Razorpay secret key
// Razorpay secret keys are typically random alphanumeric strings, usually around 15-40 characters
const keys = Object.keys(process.env);
console.log("Searching for potential Razorpay Secret Keys...");
keys.forEach(k => {
  const val = process.env[k];
  // Filter out known non-razorpay keys and very long/short strings
  if (val && val.length > 15 && val.length < 45 && 
      !k.startsWith('K_') && 
      !k.startsWith('VITE_GOOGLE') && 
      !k.startsWith('GOOGLE_MAPS') &&
      !k.includes('RAZORPAY_KEY_ID') &&
      !val.startsWith('http') &&
      !val.startsWith('sk-p') &&
      !val.startsWith('AIza')) {
    
    // We only print the first few characters to be safe, but note the name and length
    console.log(`Variable: ${k} = length: ${val.length}, starts with: ${val.substring(0, 4)}`);
  }
});
