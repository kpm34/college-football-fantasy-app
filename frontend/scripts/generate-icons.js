#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = (() => {
  try {
    return require('canvas');
  } catch {
    return {};
  }
})();

// Create a simple placeholder icon as base64
const placeholderIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#667eea"/>
  <path d="M256 120C185.4 120 128 177.4 128 248C128 318.6 185.4 376 256 376C326.6 376 384 318.6 384 248C384 177.4 326.6 120 256 120ZM256 336C207.6 336 168 296.4 168 248C168 199.6 207.6 160 256 160C304.4 160 344 199.6 344 248C344 296.4 304.4 336 256 336Z" fill="white"/>
  <path d="M256 180C218.6 180 188 210.6 188 248C188 285.4 218.6 316 256 316C293.4 316 324 285.4 324 248C324 210.6 293.4 180 256 180Z" fill="white"/>
  <text x="256" y="270" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">CF</text>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('Creating icon directory...');
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Prefer generating true PNGs; fallback to copying if canvas is unavailable
const baseSvg = placeholderIcon.trim();
const generatePng = (size, targetPath) => {
  if (!createCanvas) return false;
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const svg = Buffer.from(
      baseSvg.replace('width="512"', `width="${size}"`).replace('height="512"', `height="${size}"`)
    );
    return loadImage('data:image/svg+xml;base64,' + svg.toString('base64')).then((img) => {
      ctx.drawImage(img, 0, 0, size, size);
      fs.writeFileSync(targetPath, canvas.toBuffer('image/png'));
      return true;
    });
  } catch {
    return false;
  }
};

async function ensureIcons() {
  for (const size of sizes) {
    const targetPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 500) continue;
    console.log(`Generating ${size}x${size} icon...`);
    const ok = await generatePng(size, targetPath);
    if (!ok) {
      // Fallback minimal valid PNG (1x1) if generation fails
      const emptyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9U/1QKIAAAAASUVORK5CYII=',
        'base64'
      );
      fs.writeFileSync(targetPath, emptyPng);
    }
  }
}

ensureIcons().then(() => {
  // Create shortcut icons
  const shortcuts = ['shortcut-create.png', 'shortcut-join.png', 'shortcut-draft.png'];
  shortcuts.forEach((shortcut) => {
    const targetPath = path.join(iconsDir, shortcut);
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(path.join(iconsDir, 'icon-144x144.png'), targetPath);
    }
  });
  console.log('Icon generation complete.');
});

// Create shortcut icons
const shortcuts = ['shortcut-create.png', 'shortcut-join.png', 'shortcut-draft.png'];
shortcuts.forEach(shortcut => {
  const targetPath = path.join(iconsDir, shortcut);
  if (!fs.existsSync(targetPath) && fs.existsSync(existingIcon)) {
    fs.copyFileSync(existingIcon, targetPath);
  }
});

console.log('Icon placeholders created! For production, replace these with properly sized icons.');
