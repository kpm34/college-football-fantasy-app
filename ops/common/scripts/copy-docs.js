const fs = require('fs');
const path = require('path');

// This script copies docs to the public folder for Vercel deployment
const sourceDir = path.join(__dirname, '..', 'docs');
const targetDir = path.join(__dirname, '..', 'public', 'static-docs');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to copy files recursively
function copyRecursive(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Read source directory
  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // Recursively copy subdirectories
      copyRecursive(sourcePath, targetPath);
    } else if (file.endsWith('.md')) {
      // Copy markdown files
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${sourcePath} -> ${targetPath}`);
    }
  });
}

// Copy all markdown files from docs to public/static-docs
copyRecursive(sourceDir, targetDir);

console.log('✅ Documentation files copied to public/static-docs for Vercel deployment');
