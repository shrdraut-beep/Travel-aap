const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Administrator\\Downloads\\MODULE';
const dest = path.join(process.cwd(), 'data', 'module_exports');
fs.mkdirSync(dest, { recursive: true });

['BUS', 'CAR', 'FLIGHT', 'HOTEL'].forEach(name => {
  const out = path.join(dest, name);
  fs.mkdirSync(out, { recursive: true });
  const zipFile = path.join(src, `${name}.zip`);
  console.log(`Extracting ${zipFile} to ${out}...`);
  execSync(`tar -xf "${zipFile}" -C "${out}"`);
  console.log(`Extracted ${name} successfully!`);
});
