const keys = Object.keys(process.env).filter(k => k.toLowerCase().includes('razorpay'));
keys.forEach(k => console.log(k, "=> length:", process.env[k].length, "=> start:", process.env[k].substring(0, 4)));
