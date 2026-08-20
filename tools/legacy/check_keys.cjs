Object.keys(process.env).forEach(k => {
  if (process.env[k].length >= 10 && process.env[k].length <= 40 && !k.startsWith('K_') && !k.startsWith('VITE_GOOGLE') && !k.startsWith('GOOGLE_MAPS')) {
    console.log(`${k} = ${process.env[k].substring(0, 4)}... length: ${process.env[k].length}`);
  }
});
