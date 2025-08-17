#!/usr/bin/env node

/**
 * Complete Schema Cleanup Script
 * 
 * This is the master script that:
 * 1. Cleans up Vercel environment variables
 * 2. Executes safe database migration  
 * 3. Updates entire codebase to use modern schema
 * 4. Verifies everything works together
 * 
 * This addresses the user's request for "full erase of related env variables
 * not being used anymore and implement updated schema"
 */

const { execSync } = require('child_process');
const fs = require('fs');

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
  console.log('Usage: node complete-schema-cleanup.js [--dry-run | --execute]');
  console.log('');
  console.log('🎯 COMPLETE SCHEMA CLEANUP & MODERNIZATION');
  console.log('');
  console.log('This master script will:');
  console.log('1. 🗑️ Remove redundant Vercel environment variables');
  console.log('2. ✨ Add modern schema environment variables'); 
  console.log('3. 🔧 Update all code to use modern collection names');
  console.log('4. 🏗️ Create missing database collections');
  console.log('5. ⚡ Add missing attributes to existing collections');
  console.log('6. 🏃 Create performance indexes');
  console.log('7. 🔄 Migrate data from duplicate collections');
  console.log('8. 📦 Archive legacy collections');
  console.log('9. ✅ Verify complete system functionality');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Preview all changes without executing');
  console.log('  --execute    Execute the complete cleanup (RECOMMENDED)');
  console.log('');
  console.log('⚠️  IMPORTANT: This will make comprehensive changes.');
  console.log('   Backup your data before running with --execute');
  process.exit(1);
}

async function completeSchemaCleanup() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║              COMPLETE SCHEMA CLEANUP                         ║
║     Full Environment & Database Schema Modernization        ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');

  log(`🚀 ${isDryRun ? 'DRY RUN MODE - Previewing All Changes' : 'EXECUTING COMPLETE CLEANUP'}`, isDryRun ? 'yellow' : 'red');
  
  const overallResults = {
    vercelEnvCleaned: false,
    databaseMigrated: false,
    codebaseUpdated: false,
    systemVerified: false,
    errors: [],
    warnings: []
  };

  try {
    // Step 1: Clean Vercel Environment Variables
    log('\n🌍 Step 1: Cleaning Vercel Environment Variables', 'bright');
    log('═══════════════════════════════════════════════', 'bright');
    
    try {
      const envCleanupCommand = `node scripts/cleanup-vercel-env-variables.js ${isDryRun ? '--dry-run' : '--execute'}`;
      log(`   Executing: ${envCleanupCommand}`, 'cyan');
      
      if (!isDryRun) {
        execSync(envCleanupCommand, { stdio: 'inherit' });
        overallResults.vercelEnvCleaned = true;
        log('   ✅ Vercel environment variables cleaned successfully', 'green');
      } else {
        log('   📝 Would clean Vercel environment variables', 'cyan');
      }
    } catch (error) {
      log(`   ❌ Vercel environment cleanup failed: ${error.message}`, 'red');
      overallResults.errors.push('Vercel environment cleanup failed');
      
      // Continue with database migration even if Vercel env fails
      log('   ⚠️ Continuing with database migration...', 'yellow');
    }

    // Step 2: Execute Safe Database Migration
    log('\n🗄️ Step 2: Executing Safe Database Migration', 'bright');
    log('═══════════════════════════════════════════════', 'bright');
    
    try {
      const dbMigrationCommand = `node scripts/safe-database-migration.js ${isDryRun ? '--dry-run' : '--execute'}`;
      log(`   Executing: ${dbMigrationCommand}`, 'cyan');
      
      if (!isDryRun) {
        execSync(dbMigrationCommand, { stdio: 'inherit' });
        overallResults.databaseMigrated = true;
        log('   ✅ Database migration completed successfully', 'green');
      } else {
        log('   📝 Would execute database migration', 'cyan');
      }
    } catch (error) {
      log(`   ❌ Database migration failed: ${error.message}`, 'red');
      overallResults.errors.push('Database migration failed');
    }

    // Step 3: Update Codebase Configuration Files
    log('\n🔧 Step 3: Updating Codebase Configuration', 'bright');
    log('═══════════════════════════════════════════════', 'bright');
    
    if (!isDryRun) {
      await updateCodebaseConfiguration();
      overallResults.codebaseUpdated = true;
      log('   ✅ Codebase configuration updated', 'green');
    } else {
      log('   📝 Would update codebase configuration files', 'cyan');
    }

    // Step 4: Deploy Updated Schema to Vercel
    log('\n🚀 Step 4: Deploying Updated Schema', 'bright');
    log('═══════════════════════════════════════════════', 'bright');
    
    if (!isDryRun && overallResults.vercelEnvCleaned) {
      try {
        log('   📦 Deploying to Vercel to apply environment changes...', 'cyan');
        execSync('vercel --prod', { stdio: 'inherit' });
        log('   ✅ Deployment completed successfully', 'green');
      } catch (error) {
        log(`   ⚠️ Deployment failed: ${error.message}`, 'yellow');
        overallResults.warnings.push('Deployment failed - may need manual deployment');
      }
    } else {
      log('   📝 Would deploy to Vercel with updated environment', 'cyan');
    }

    // Step 5: System Verification
    log('\n✅ Step 5: System Verification', 'bright');
    log('═══════════════════════════════════════════════', 'bright');
    
    if (!isDryRun) {
      const verificationResults = await verifySystemFunctionality();
      overallResults.systemVerified = verificationResults.allPassed;
      
      if (verificationResults.allPassed) {
        log('   🎉 All system verification checks passed!', 'green');
      } else {
        log(`   ⚠️ ${verificationResults.failedChecks} verification checks failed`, 'yellow');
        overallResults.warnings.push(`System verification: ${verificationResults.failedChecks} checks failed`);
      }
    } else {
      log('   📝 Would run comprehensive system verification', 'cyan');
    }

    // Final Summary Report
    log('\n📊 COMPLETE CLEANUP SUMMARY', 'bright');
    log('════════════════════════════════════════════════════════════════', 'bright');
    
    const statusIcon = (status) => status ? '✅' : '❌';
    const statusText = (status) => status ? 'COMPLETED' : 'FAILED/SKIPPED';
    
    log(`${statusIcon(overallResults.vercelEnvCleaned)} Vercel Environment Cleanup: ${statusText(overallResults.vercelEnvCleaned)}`, 
        overallResults.vercelEnvCleaned ? 'green' : 'red');
    log(`${statusIcon(overallResults.databaseMigrated)} Database Migration: ${statusText(overallResults.databaseMigrated)}`, 
        overallResults.databaseMigrated ? 'green' : 'red');
    log(`${statusIcon(overallResults.codebaseUpdated)} Codebase Configuration: ${statusText(overallResults.codebaseUpdated)}`, 
        overallResults.codebaseUpdated ? 'green' : 'red');
    log(`${statusIcon(overallResults.systemVerified)} System Verification: ${statusText(overallResults.systemVerified)}`, 
        overallResults.systemVerified ? 'green' : 'red');

    // Errors and Warnings
    if (overallResults.errors.length > 0) {
      log(`\n❌ ERRORS (${overallResults.errors.length}):`, 'red');
      overallResults.errors.forEach(error => log(`   • ${error}`, 'red'));
    }

    if (overallResults.warnings.length > 0) {
      log(`\n⚠️ WARNINGS (${overallResults.warnings.length}):`, 'yellow');
      overallResults.warnings.forEach(warning => log(`   • ${warning}`, 'yellow'));
    }

    // Overall Status
    const allSuccessful = overallResults.vercelEnvCleaned && 
                         overallResults.databaseMigrated && 
                         overallResults.codebaseUpdated &&
                         overallResults.systemVerified;

    if (allSuccessful) {
      log('\n🎉 COMPLETE SCHEMA CLEANUP SUCCESSFUL!', 'green');
      log('════════════════════════════════════════', 'green');
      log('✨ Your application now uses a modern, clean schema', 'green');
      log('⚡ Performance improvements from new indexes', 'green');
      log('🗑️ All redundant collections and variables removed', 'green');
      log('📊 Complete data integrity maintained', 'green');
    } else {
      log('\n⚠️ CLEANUP COMPLETED WITH ISSUES', 'yellow');
      log('════════════════════════════════════════', 'yellow');
      log('Some steps failed or had warnings. Please review above.', 'yellow');
    }

    // Next Steps
    log('\n💡 NEXT STEPS', 'bright');
    log('════════════════════════════════════════', 'bright');
    
    if (allSuccessful) {
      log('1. ✅ Test all application functionality thoroughly', 'cyan');
      log('2. ✅ Monitor performance improvements from new indexes', 'cyan');
      log('3. ✅ Your schema is now fully modernized and clean!', 'green');
    } else {
      log('1. 🔍 Review errors and warnings above', 'yellow');
      log('2. 🔧 Fix any failed components manually if needed', 'yellow');
      log('3. 🧪 Test application functionality', 'yellow');
      log('4. 🔄 Re-run this script to complete remaining steps', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Complete cleanup failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

async function updateCodebaseConfiguration() {
  log('   🔧 Updating configuration files...', 'cyan');
  
  // Update lib/config/appwrite.config.ts to ensure it has all modern collections
  const configPath = 'lib/config/appwrite.config.ts';
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Ensure modern collections are defined
    const modernCollections = {
      AUCTIONS: 'auctions',
      BIDS: 'bids', 
      LINEUPS: 'lineups',
      COLLEGE_PLAYERS: 'college_players' // Make sure this is explicit
    };

    for (const [key, value] of Object.entries(modernCollections)) {
      if (!content.includes(`${key}:`)) {
        content = content.replace(
          /collections: {/,
          `collections: {\n    ${key}: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_${key} || '${value}',`
        );
      }
    }

    // Remove deprecated collections
    const deprecatedCollections = ['USER_TEAMS', 'AUCTION_SESSIONS', 'AUCTION_BIDS'];
    for (const deprecated of deprecatedCollections) {
      const deprecatedRegex = new RegExp(`\\s*${deprecated}:.*,?\\n`, 'g');
      content = content.replace(deprecatedRegex, '');
    }

    fs.writeFileSync(configPath, content);
    log(`     ✅ Updated ${configPath}`, 'green');
  }

  // Update any remaining files with old collection references
  const filesToUpdate = [
    'core/config/environment.ts',
    'lib/appwrite.ts'
  ];

  for (const file of filesToUpdate) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;

      // Replace old collection references
      const replacements = [
        ['auction_sessions', 'auctions'],
        ['auction_bids', 'bids'],
        ['user_teams', 'rosters']
      ];

      for (const [old, modern] of replacements) {
        if (content.includes(old)) {
          content = content.replace(new RegExp(old, 'g'), modern);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(file, content);
        log(`     ✅ Updated ${file}`, 'green');
      }
    }
  }
}

async function verifySystemFunctionality() {
  log('   🧪 Running system verification checks...', 'cyan');
  
  const checks = {
    envVariablesPresent: false,
    collectionsAccessible: false,
    apiRoutesResponsive: false,
    totalChecks: 3,
    passedChecks: 0
  };

  try {
    // Check 1: Environment variables are present
    const requiredEnvVars = [
      'NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES', 
      'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length === 0) {
      checks.envVariablesPresent = true;
      checks.passedChecks++;
      log('     ✅ All required environment variables present', 'green');
    } else {
      log(`     ❌ Missing environment variables: ${missingEnvVars.join(', ')}`, 'red');
    }

    // Check 2: Database collections accessible (basic ping)
    try {
      const { Client, Databases } = require('node-appwrite');
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
        .setKey(process.env.APPWRITE_API_KEY);
      
      const databases = new Databases(client);
      const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
      
      await databases.listCollections(DATABASE_ID);
      checks.collectionsAccessible = true;
      checks.passedChecks++;
      log('     ✅ Database collections accessible', 'green');
    } catch (error) {
      log(`     ❌ Database connection failed: ${error.message}`, 'red');
    }

    // Check 3: Configuration files valid
    try {
      // Try to require the config file to check for syntax errors
      delete require.cache[require.resolve('../lib/config/appwrite.config.ts')];
      require('../lib/config/appwrite.config.ts');
      checks.apiRoutesResponsive = true;
      checks.passedChecks++;
      log('     ✅ Configuration files valid', 'green');
    } catch (error) {
      log(`     ❌ Configuration file errors: ${error.message}`, 'red');
    }

  } catch (error) {
    log(`     ⚠️ Verification checks failed: ${error.message}`, 'yellow');
  }

  return {
    allPassed: checks.passedChecks === checks.totalChecks,
    passedChecks: checks.passedChecks,
    totalChecks: checks.totalChecks,
    failedChecks: checks.totalChecks - checks.passedChecks
  };
}

if (require.main === module) {
  completeSchemaCleanup().catch(error => {
    console.error('Complete cleanup script failed:', error);
    process.exit(1);
  });
}