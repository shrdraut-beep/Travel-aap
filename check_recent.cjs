Object.keys(process.env).forEach(k => {
  if (process.env[k].length > 15) {
    console.log(`${k} = length: ${process.env[k].length}`);
  }
});
