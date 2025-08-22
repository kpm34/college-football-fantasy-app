#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// PWA icon sizes required
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...\n');

// Create a simple football-themed SVG icon
const createSVG = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#8C1818"/>
  
  <!-- Football shape -->
  <ellipse cx="${size/2}" cy="${size/2}" rx="${size*0.35}" ry="${size*0.25}" fill="#D2691E" stroke="#8B4513" stroke-width="${size*0.02}"/>
  
  <!-- Football laces -->
  <line x1="${size/2}" y1="${size*0.35}" x2="${size/2}" y2="${size*0.65}" stroke="#FFFFFF" stroke-width="${size*0.015}"/>
  <line x1="${size*0.45}" y1="${size*0.45}" x2="${size*0.55}" y2="${size*0.45}" stroke="#FFFFFF" stroke-width="${size*0.015}"/>
  <line x1="${size*0.45}" y1="${size*0.5}" x2="${size*0.55}" y2="${size*0.5}" stroke="#FFFFFF" stroke-width="${size*0.015}"/>
  <line x1="${size*0.45}" y1="${size*0.55}" x2="${size*0.55}" y2="${size*0.55}" stroke="#FFFFFF" stroke-width="${size*0.015}"/>
  
  <!-- CFB text -->
  <text x="${size/2}" y="${size*0.85}" font-family="Arial, sans-serif" font-size="${size*0.12}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CFB</text>
</svg>`;
};

// Generate icons
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`✅ Generated ${size}x${size} icon`);
});

// Create a maskable icon (with safe area padding)
const createMaskableSVG = (size) => {
  const padding = size * 0.1; // 10% padding for safe area
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with safe area -->
  <rect width="${size}" height="${size}" fill="#8C1818"/>
  
  <!-- Inner content (80% of total size) -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Football shape -->
    <ellipse cx="${innerSize/2}" cy="${innerSize/2}" rx="${innerSize*0.35}" ry="${innerSize*0.25}" fill="#D2691E" stroke="#8B4513" stroke-width="${innerSize*0.02}"/>
    
    <!-- Football laces -->
    <line x1="${innerSize/2}" y1="${innerSize*0.35}" x2="${innerSize/2}" y2="${innerSize*0.65}" stroke="#FFFFFF" stroke-width="${innerSize*0.015}"/>
    <line x1="${innerSize*0.45}" y1="${innerSize*0.45}" x2="${innerSize*0.55}" y2="${innerSize*0.45}" stroke="#FFFFFF" stroke-width="${innerSize*0.015}"/>
    <line x1="${innerSize*0.45}" y1="${innerSize*0.5}" x2="${innerSize*0.55}" y2="${innerSize*0.5}" stroke="#FFFFFF" stroke-width="${innerSize*0.015}"/>
    <line x1="${innerSize*0.45}" y1="${innerSize*0.55}" x2="${innerSize*0.55}" y2="${innerSize*0.55}" stroke="#FFFFFF" stroke-width="${innerSize*0.015}"/>
    
    <!-- CFB text -->
    <text x="${innerSize/2}" y="${innerSize*0.85}" font-family="Arial, sans-serif" font-size="${innerSize*0.12}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CFB</text>
  </g>
</svg>`;
};

// Generate maskable versions for key sizes
[192, 512].forEach(size => {
  const svg = createMaskableSVG(size);
  const filename = path.join(iconsDir, `icon-maskable-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`✅ Generated maskable ${size}x${size} icon`);
});

// Create badge icon (for notifications)
const badgeSVG = `<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="36" fill="#8C1818"/>
  <text x="36" y="45" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CFB</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'badge-72x72.svg'), badgeSVG);
console.log('✅ Generated badge icon');

// Create shortcut icons
const shortcuts = [
  { name: 'dashboard', icon: '📊' },
  { name: 'join', icon: '➕' }
];

shortcuts.forEach(({ name, icon }) => {
  const svg = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" rx="20" fill="#8C1818"/>
    <text x="48" y="60" font-size="48" text-anchor="middle">${icon}</text>
  </svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `${name}-96x96.svg`), svg);
  console.log(`✅ Generated ${name} shortcut icon`);
});

console.log('\n🎉 PWA icons generated successfully!');
console.log('\n💡 Note: These are SVG placeholders. For production:');
console.log('   1. Convert SVGs to PNGs using a tool like sharp or canvas');
console.log('   2. Or create custom icons in a design tool');
console.log('   3. Ensure maskable icons have proper safe areas');
console.log('\n📱 Test your PWA at: https://maskable.app/editor');
