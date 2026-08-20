const keys = Object.keys(process.env);
keys.forEach(k => {
  if (process.env[k] && process.env[k].length > 15 && process.env[k].length < 45) {
    console.log(k, "=> length:", process.env[k].length, "=> value prefix:", process.env[k].substring(0, 4));
  }
});
