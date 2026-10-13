import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Table for CRC32 calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image raster
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * (isMaskable ? 0.48 : 0.45);
  const innerR = width * 0.28;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      // Background: Deep navy #0a0f1d
      let r = 10;
      let g = 15;
      let b = 29;
      let a = 255;

      if (!isMaskable && dist > outerR) {
        // Transparent border for non-maskable rounded icon
        r = 0;
        g = 0;
        b = 0;
        a = 0;
      } else {
        // Outer ring glow: Cyan / Blue #06b6d4 to #3b82f6
        if (dist >= innerR * 0.95 && dist <= innerR * 1.25) {
          r = 6;
          g = 182;
          b = 212;
        } else if (dist < innerR * 0.95) {
          // Central emblem: Bluetooth earbud core
          // Simple geometric Bluetooth / headphone cross pattern
          const inVerticalStalk = Math.abs(dx) < width * 0.04 && Math.abs(dy) < height * 0.26;
          const inUpperChevron = Math.abs(dx - dy * 0.7) < width * 0.04 && dy < 0 && dy > -height * 0.26;
          const inLowerChevron = Math.abs(dx + dy * 0.7) < width * 0.04 && dy > 0 && dy < height * 0.26;

          if (inVerticalStalk || inUpperChevron || inLowerChevron) {
            r = 240;
            g = 249;
            b = 255; // Crisp White/Cyan
          } else {
            // Navy core
            r = 15;
            g = 23;
            b = 42;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write PNGs
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('Successfully generated PWA PNG icons!');
