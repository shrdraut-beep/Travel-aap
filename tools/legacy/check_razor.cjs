Object.keys(process.env).forEach(k => {
  if (k.toLowerCase().includes('razor')) console.log(`${k} = length: ${process.env[k].length}`);
});
