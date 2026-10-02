// Generate PNG icon files for the Chrome extension
// Uses the canvas API in Node.js (no external deps needed for this approach)

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 48, 128];

// Generate a simple colored PNG using raw binary data
// This creates a valid PNG file with a gradient-colored phone icon silhouette
function createPNG(size) {
  // We'll create a minimal valid PNG with RGBA pixel data
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Normalized coordinates
      const nx = x / size;
      const ny = y / size;

      // Rounded rectangle check (background)
      const radius = 0.22;
      const inRoundedRect = isInRoundedRect(nx, ny, 0, 0, 1, 1, radius);

      if (!inRoundedRect) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Gradient background: indigo → violet → purple
      const t = (nx + ny) / 2;
      let r, g, b;
      if (t < 0.5) {
        const lt = t * 2;
        r = Math.round(99 + (139 - 99) * lt);
        g = Math.round(102 + (92 - 102) * lt);
        b = Math.round(241 + (246 - 241) * lt);
      } else {
        const lt = (t - 0.5) * 2;
        r = Math.round(139 + (192 - 139) * lt);
        g = Math.round(92 + (132 - 92) * lt);
        b = Math.round(246 + (252 - 246) * lt);
      }

      // Phone rectangle outline
      const phoneX = 0.3, phoneY = 0.14, phoneW = 0.4, phoneH = 0.72;
      const borderW = 0.05;
      const inPhone = nx >= phoneX && nx <= phoneX + phoneW && ny >= phoneY && ny <= phoneY + phoneH;
      const inPhoneInner = nx >= phoneX + borderW && nx <= phoneX + phoneW - borderW &&
                           ny >= phoneY + borderW && ny <= phoneY + phoneH - borderW;

      if (inPhone && !inPhoneInner) {
        // Phone border — white
        r = 255; g = 255; b = 255;
      } else if (inPhoneInner) {
        // Phone screen — slightly lighter
        const screenY = phoneY + 0.1;
        const screenH = phoneH * 0.6;
        if (ny >= screenY && ny <= screenY + screenH) {
          r = Math.min(255, r + 30);
          g = Math.min(255, g + 30);
          b = Math.min(255, b + 30);
        }
      }

      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = 255;
    }
  }

  return encodePNG(size, size, pixels);
}

function isInRoundedRect(x, y, rx, ry, rw, rh, radius) {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return false;

  // Check corners
  const corners = [
    [rx + radius, ry + radius],
    [rx + rw - radius, ry + radius],
    [rx + radius, ry + rh - radius],
    [rx + rw - radius, ry + rh - radius]
  ];

  for (const [cx, cy] of corners) {
    const dx = Math.abs(x - cx);
    const dy = Math.abs(y - cy);
    if (dx > 0 && dy > 0) {
      // In corner region
      if ((x < rx + radius || x > rx + rw - radius) &&
          (y < ry + radius || y > ry + rh - radius)) {
        if (dx * dx + dy * dy > radius * radius) return false;
      }
    }
  }

  return true;
}

// Minimal PNG encoder (no compression for simplicity, IDAT with store blocks)
function encodePNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data with filter bytes
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter: none
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rawData.push(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]);
    }
  }

  const rawBuf = Buffer.from(rawData);

  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawBuf);

  // Build chunks
  const chunks = [
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([len, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
sizes.forEach(size => {
  const png = createPNG(size);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`✓ Generated ${filePath} (${png.length} bytes)`);
});

console.log('\nAll icons generated successfully!');
