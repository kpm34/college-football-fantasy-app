#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing API route imports...\n');

// Find all route.ts files in the api directory
const apiDir = path.join(process.cwd(), 'app/api');
const routeFiles = glob.sync('**/route.ts', { cwd: apiDir });

let fixedCount = 0;
let errors = [];

for (const file of routeFiles) {
  const filePath = path.join(apiDir, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Fix databases import
    if (content.includes("import { databases") && content.includes("from '@/lib/appwrite-server'")) {
      content = content.replace(
        /import\s*{\s*databases\s*,/g,
        'import { serverDatabases as databases,'
      );
      hasChanges = true;
    }
    
    // Fix getDraftablePlayers import  
    if (content.includes("import { getDraftablePlayers") && content.includes("from '@/lib/appwrite-server'")) {
      // This function doesn't exist in appwrite-server, so remove the import
      // The functionality should be moved to the route itself
      content = content.replace(
        /import\s*{\s*getDraftablePlayers\s*}\s*from\s*['"]@\/lib\/appwrite-server['"]\s*;?\s*\n?/g,
        ''
      );
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    errors.push({ file, error: error.message });
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Fixed ${fixedCount} files`);
console.log(`   Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(({ file, error }) => {
    console.log(`   ${file}: ${error}`);
  });
}

console.log('\n💡 Next steps:');
console.log('   1. Run "npm run build" to verify the fixes');
console.log('   2. Deploy to Vercel with "vercel --prod"');
