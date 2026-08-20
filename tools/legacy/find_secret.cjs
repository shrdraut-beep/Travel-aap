const sysPrefixes = ['K_', 'npm_', 'XDG_', 'NODE_', 'PWD', 'HOME', 'PATH', 'SHLVL', 'HOSTNAME', 'DEBIAN', 'PORT', 'TERM'];
Object.keys(process.env).forEach(k => {
  if (!sysPrefixes.some(p => k.startsWith(p))) {
    console.log(`${k} = length: ${process.env[k].length}, start: ${process.env[k].substring(0, 4)}`);
  }
});
