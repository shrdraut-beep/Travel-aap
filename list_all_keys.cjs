const keys = Object.keys(process.env).sort();
console.log("ALL ENVIRONMENT VARIABLES:");
keys.forEach(k => {
  const v = process.env[k] || '';
  if (!k.startsWith('npm_') && !k.startsWith('K_') && !k.startsWith('XDG_') && k !== 'PATH' && !k.startsWith('DEBIAN') && !k.startsWith('VITE_GOOGLE') && !k.startsWith('GOOGLE_MAPS') && !k.startsWith('VITE_FIREBASE') && !k.startsWith('VITE_OPENAI') && !k.startsWith('OPENAI')) {
    console.log(`- ${k} (${v.length} chars)`);
  }
});
