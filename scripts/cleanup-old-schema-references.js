#!/usr/bin/env node

/**
 * Cleanup Old Schema References
 * 
 * This script finds and replaces ALL old schema references throughout the codebase
 * to use the new canonical schema from schema/schema.ts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const isDryRun = process.argv.includes('--dry-run');
const shouldExecute = process.argv.includes('--execute');

if (!isDryRun && !shouldExecute) {
  console.log('Usage: node cleanup-old-schema-references.js [--dry-run | --execute]');
  console.log('');
  console.log('🎯 COMPREHENSIVE OLD SCHEMA CLEANUP');
  console.log('');
  console.log('This script will:');
  console.log('1. 🔍 Find all old collection references in code');
  console.log('2. 🔄 Replace with canonical schema references'); 
  console.log('3. 🗑️ Remove deprecated configuration files');
  console.log('4. ⚡ Update import statements to use generated types');
  console.log('5. 🧹 Clean up unused route handlers');
  console.log('6. 📝 Update environment variable references');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Preview all changes without executing');
  console.log('  --execute    Execute the comprehensive cleanup');
  process.exit(1);
}

async function cleanupOldSchemaReferences() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║              Old Schema References Cleanup                  ║
║           Migrating to Single Source of Truth               ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');

  log(`🚀 ${isDryRun ? 'DRY RUN MODE - Previewing All Changes' : 'EXECUTING COMPREHENSIVE CLEANUP'}`, isDryRun ? 'yellow' : 'red');
  
  const cleanupResults = {
    filesUpdated: 0,
    collectionsReplaced: 0,
    importsUpdated: 0,
    routesRemoved: 0,
    configFilesRemoved: 0,
    errors: []
  };

  try {
    // Step 1: Replace Old Collection References
    log('\n🔄 Step 1: Replacing Old Collection References', 'bright');
    log('═══════════════════════════════════════════════════', 'bright');
    
    const collectionReplacements = [
      // Old duplicates → Modern canonical
      { old: 'auction_sessions', new: 'auctions', description: 'Auction session references' },
      { old: 'auction_bids', new: 'bids', description: 'Auction bid references' },
      { old: 'user_teams', new: 'rosters', description: 'User team references' },
      { old: 'AUCTION_SESSIONS', new: 'AUCTIONS', description: 'Constant auction session references' },
      { old: 'AUCTION_BIDS', new: 'BIDS', description: 'Constant auction bid references' },
      { old: 'USER_TEAMS', new: 'ROSTERS', description: 'Constant user team references' },
      
      // Ensure consistent player collection naming
      { old: '\\.PLAYERS', new: '.COLLEGE_PLAYERS', description: 'Player collection constants', isRegex: true },
      { old: 'COLLECTION_PLAYERS', new: 'COLLECTION_COLLEGE_PLAYERS', description: 'Player collection env vars' },
      
      // Update any remaining inconsistent references
      { old: "'players'", new: "'college_players'", description: 'String player collection references' },
      { old: '"players"', new: '"college_players"', description: 'Double-quoted player references' },
    ];

    for (const replacement of collectionReplacements) {
      log(`   🔍 Replacing: ${replacement.old} → ${replacement.new}`, 'cyan');
      
      if (!isDryRun) {
        const updatedFiles = await replaceInFiles(replacement.old, replacement.new, replacement.isRegex);
        cleanupResults.filesUpdated += updatedFiles;
        cleanupResults.collectionsReplaced++;
        log(`     ✅ Updated ${updatedFiles} files`, 'green');
      } else {
        log(`     📝 Would replace ${replacement.description}`, 'cyan');
      }
    }

    // Step 2: Update Import Statements
    log('\n📦 Step 2: Updating Import Statements', 'bright');
    log('═══════════════════════════════════════════════════', 'bright');
    
    const importUpdates = [
      {
        old: "from '../lib/config/appwrite.config'",
        new: "from '../lib/appwrite-generated'",
        description: 'Appwrite config imports'
      },
      {
        old: "from '../../lib/config/appwrite.config'", 
        new: "from '../../lib/appwrite-generated'",
        description: 'Nested Appwrite config imports'
      },
      {
        old: "from './config/appwrite.config'",
        new: "from './appwrite-generated'", 
        description: 'Local Appwrite config imports'
      },
      {
        old: 'import.*types.*from.*types/.*',
        new: "import { COLLECTIONS } from '../lib/appwrite-generated';\nimport type * from '../types/generated';",
        description: 'Type imports',
        isRegex: true
      }
    ];

    for (const update of importUpdates) {
      log(`   🔍 Updating: ${update.description}`, 'cyan');
      
      if (!isDryRun) {
        const updatedFiles = await replaceInFiles(update.old, update.new, update.isRegex);
        cleanupResults.importsUpdated += updatedFiles;
        log(`     ✅ Updated ${updatedFiles} files`, 'green');
      } else {
        log(`     📝 Would update ${update.description}`, 'cyan');
      }
    }

    // Step 3: Remove Deprecated Configuration Files  
    log('\n🗑️ Step 3: Removing Deprecated Configuration Files', 'bright');
    log('═══════════════════════════════════════════════════', 'bright');
    
    const deprecatedFiles = [
      'lib/config/appwrite.config.ts', // Replaced by generated config
      'core/config/appwrite.config.ts', // Duplicate config
      'lib/appwrite-client-fix.ts', // Legacy fix file
      'types/appwrite.ts', // Manual types replaced by generated
      'config/collections.ts', // Old collection definitions
      'src/config/database.ts' // Legacy database config
    ];

    for (const filePath of deprecatedFiles) {
      if (fs.existsSync(filePath)) {
        log(`   🗑️ Removing: ${filePath}`, 'red');
        
        if (!isDryRun) {
          // Create backup before removing
          const backupPath = `${filePath}.backup`;
          fs.copyFileSync(filePath, backupPath);
          fs.unlinkSync(filePath);
          cleanupResults.configFilesRemoved++;
          log(`     ✅ Removed ${filePath} (backup created)`, 'green');
        } else {
          log(`     📝 Would remove ${filePath}`, 'cyan');
        }
      }
    }

    // Step 4: Remove/Update Deprecated API Routes
    log('\n🛤️ Step 4: Cleaning Up Deprecated API Routes', 'bright');
    log('═══════════════════════════════════════════════════', 'bright');
    
    // Find API routes that reference old collections
    const deprecatedRoutes = await findDeprecatedRoutes();
    
    for (const route of deprecatedRoutes) {
      log(`   🔍 Checking route: ${route.path}`, 'cyan');
      
      if (route.needsRemoval) {
        log(`   🗑️ Removing deprecated route: ${route.path}`, 'red');
        
        if (!isDryRun) {
          fs.unlinkSync(route.fullPath);
          cleanupResults.routesRemoved++;
          log(`     ✅ Removed ${route.path}`, 'green');
        } else {
          log(`     📝 Would remove ${route.path}`, 'cyan');
        }
      } else if (route.needsUpdate) {
        log(`   🔄 Updating route: ${route.path}`, 'yellow');
        
        if (!isDryRun) {
          await updateRouteFile(route.fullPath);
          cleanupResults.filesUpdated++;
          log(`     ✅ Updated ${route.path}`, 'green');
        } else {
          log(`     📝 Would update ${route.path}`, 'cyan');
        }
      }
    }

    // Step 5: Clean Up Environment Variable References
    log('\n🌍 Step 5: Cleaning Environment Variable References', 'bright');
    log('═══════════════════════════════════════════════════', 'bright');
    
    const envCleanup = [
      {
        pattern: 'process\\.env\\.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS',
        replacement: 'process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS',
        description: 'Auction session env var references'
      },
      {
        pattern: 'process\\.env\\.NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS', 
        replacement: 'process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS',
        description: 'Auction bid env var references'
      },
      {
        pattern: 'process\\.env\\.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS',
        replacement: 'process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS', 
        description: 'User team env var references'
      },
      {
        pattern: 'process\\.env\\.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS',
        replacement: 'process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS',
        description: 'Player env var references'
      }
    ];

    for (const cleanup of envCleanup) {
      log(`   🔍 Updating: ${cleanup.description}`, 'cyan');
      
      if (!isDryRun) {
        const updatedFiles = await replaceInFiles(cleanup.pattern, cleanup.replacement, true);
        cleanupResults.filesUpdated += updatedFiles;
        log(`     ✅ Updated ${updatedFiles} files`, 'green');
      } else {
        log(`     📝 Would update ${cleanup.description}`, 'cyan');
      }
    }

    // Step 6: Update Package.json Scripts
    log('\n📜 Step 6: Updating Package.json Scripts', 'bright');
    log('═══════════════════════════════════════════════════', 'bright');
    
    if (!isDryRun) {
      await updatePackageJsonScripts();
      log('     ✅ Updated package.json scripts', 'green');
    } else {
      log('     📝 Would update package.json with new generation scripts', 'cyan');
    }

    // Summary Report
    log('\n📊 CLEANUP SUMMARY', 'bright');
    log('════════════════════════════════════════════════════════════════', 'bright');
    
    log(`🔄 Files updated: ${cleanupResults.filesUpdated}`, 'green');
    log(`📦 Collection references replaced: ${cleanupResults.collectionsReplaced}`, 'green');
    log(`📦 Import statements updated: ${cleanupResults.importsUpdated}`, 'green');
    log(`🛤️ Routes removed/updated: ${cleanupResults.routesRemoved}`, 'green');
    log(`🗑️ Config files removed: ${cleanupResults.configFilesRemoved}`, 'green');

    if (cleanupResults.errors.length > 0) {
      log(`\n❌ ERRORS ENCOUNTERED: ${cleanupResults.errors.length}`, 'red');
      cleanupResults.errors.forEach(error => log(`   - ${error}`, 'red'));
    } else {
      log('\n🎉 ALL OLD SCHEMA REFERENCES CLEANED SUCCESSFULLY!', 'green');
    }

    // Next Steps
    log('\n💡 NEXT STEPS', 'bright');
    log('════════════════════════════════════════════════════════════════', 'bright');
    log('1. Generate new schema files: npm run generate:all', 'cyan');
    log('2. Test all functionality thoroughly', 'cyan');
    log('3. Deploy updated codebase: vercel --prod', 'cyan');
    log('4. Verify everything works with single source of truth', 'green');

  } catch (error) {
    log(`\n❌ Cleanup failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

async function replaceInFiles(searchPattern, replacement, isRegex = false) {
  let updatedFiles = 0;
  
  try {
    const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
    const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
    
    // Find files to search
    let findCommand = 'find . -type f \\(';
    fileExtensions.forEach((ext, index) => {
      if (index > 0) findCommand += ' -o ';
      findCommand += `-name "*${ext}"`;
    });
    findCommand += '\\)';
    
    // Exclude directories
    excludeDirs.forEach(dir => {
      findCommand += ` -not -path "./${dir}/*"`;
    });
    
    const files = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    
    for (const file of files) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      let newContent;
      
      if (isRegex) {
        const regex = new RegExp(searchPattern, 'g');
        newContent = content.replace(regex, replacement);
      } else {
        newContent = content.split(searchPattern).join(replacement);
      }
      
      if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        updatedFiles++;
      }
    }
  } catch (error) {
    console.warn(`Error replacing in files: ${error.message}`);
  }
  
  return updatedFiles;
}

async function findDeprecatedRoutes() {
  const deprecatedRoutes = [];
  
  try {
    // Look for API routes
    const apiRoutes = execSync('find app/api -name "*.ts" -o -name "*.js"', { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
    
    for (const routePath of apiRoutes) {
      if (!fs.existsSync(routePath)) continue;
      
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Check if route uses deprecated collections
      const usesDeprecated = content.includes('auction_sessions') ||
                           content.includes('auction_bids') ||
                           content.includes('user_teams') ||
                           content.includes('AUCTION_SESSIONS') ||
                           content.includes('AUCTION_BIDS') ||
                           content.includes('USER_TEAMS');
      
      if (usesDeprecated) {
        deprecatedRoutes.push({
          path: routePath,
          fullPath: path.resolve(routePath),
          needsUpdate: true,
          needsRemoval: false // We'll update rather than remove
        });
      }
    }
  } catch (error) {
    console.warn(`Error finding deprecated routes: ${error.message}`);
  }
  
  return deprecatedRoutes;
}

async function updateRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  let newContent = content
    .replace(/auction_sessions/g, 'auctions')
    .replace(/auction_bids/g, 'bids')  
    .replace(/user_teams/g, 'rosters')
    .replace(/AUCTION_SESSIONS/g, 'AUCTIONS')
    .replace(/AUCTION_BIDS/g, 'BIDS')
    .replace(/USER_TEAMS/g, 'ROSTERS');
  
  fs.writeFileSync(filePath, newContent);
}

async function updatePackageJsonScripts() {
  const packageJsonPath = 'package.json';
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add new generation scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'generate:types': 'node schema/generators/types.ts',
      'generate:appwrite': 'node schema/generators/appwrite.ts',
      'generate:env': 'node schema/generators/env.ts', 
      'generate:all': 'npm run generate:types && npm run generate:appwrite && npm run generate:env',
      'seed:appwrite': 'node schema/generators/seed-appwrite.ts',
      'cleanup:schema': 'node scripts/cleanup-old-schema-references.js'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

if (require.main === module) {
  cleanupOldSchemaReferences().catch(error => {
    console.error('Cleanup script failed:', error);
    process.exit(1);
  });
}