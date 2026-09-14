const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('D-DIN.woff2')) {
  html = html.replace(
    '</title>',
    '</title>\n    <link rel="preload" href="/fonts/D-DIN-Bold.woff2" as="font" type="font/woff2" crossorigin="anonymous" />\n    <link rel="preload" href="/fonts/D-DIN.woff2" as="font" type="font/woff2" crossorigin="anonymous" />'
  );
  fs.writeFileSync('index.html', html);
  console.log("Added preload to index.html");
}
