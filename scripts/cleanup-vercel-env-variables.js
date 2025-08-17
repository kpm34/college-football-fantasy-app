#!/usr/bin/env node

/**
 * Cleanup Vercel Environment Variables Script
 * 
 * This script:
 * 1. Identifies redundant/unused environment variables in Vercel
 * 2. Updates environment variables to match modern schema
 * 3. Removes deprecated collection references
 * 4. Implements the updated schema across all environments
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
  console.log('Usage: node cleanup-vercel-env-variables.js [--dry-run | --execute]');
  console.log('');
  console.log('This script will:');
  console.log('1. List current Vercel environment variables');
  console.log('2. Identify redundant/unused variables');
  console.log('3. Update collection references to modern schema');
  console.log('4. Remove deprecated variables');
  console.log('5. Add missing modern collection variables');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run    Preview changes without executing');
  console.log('  --execute    Execute the cleanup and updates');
  process.exit(1);
}

async function cleanupVercelEnvironment() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║          Vercel Environment Variables Cleanup               ║
║      Removing Redundant Vars & Implementing New Schema      ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');

  log(`🚀 ${isDryRun ? 'DRY RUN MODE - No Changes Will Be Made' : 'EXECUTING CLEANUP'}`, isDryRun ? 'yellow' : 'red');

  const results = {
    currentVars: [],
    redundantVars: [],
    missingVars: [],
    updatedVars: [],
    removedVars: [],
    addedVars: [],
    errors: []
  };

  try {
    // Phase 1: Analyze Current Environment Variables
    log('\n🔍 Phase 1: Analyzing Current Vercel Environment Variables', 'cyan');
    
    try {
      const envOutput = execSync('vercel env ls', { encoding: 'utf8' });
      results.currentVars = parseVercelEnvOutput(envOutput);
      log(`   📊 Found ${results.currentVars.length} environment variables`, 'green');
    } catch (error) {
      log(`   ❌ Failed to list Vercel environment variables: ${error.message}`, 'red');
      log('   💡 Make sure you are logged in to Vercel CLI: vercel login', 'yellow');
      results.errors.push('Could not access Vercel environment variables');
      return;
    }

    // Phase 2: Identify Redundant/Deprecated Variables
    log('\n🗑️ Phase 2: Identifying Redundant Environment Variables', 'red');
    
    const deprecatedPatterns = [
      'AUCTION_SESSIONS', // Should be AUCTIONS
      'AUCTION_BIDS',     // Should be BIDS  
      'USER_TEAMS',       // Should use ROSTERS
      'DRAFT_PICKS',      // Legacy - not used in modern system
      'TRANSACTIONS',     // Legacy - not used
      'SCORING',          // Legacy - integrated into player_stats
    ];

    const duplicateCollections = [
      'PLAYERS', // We use COLLEGE_PLAYERS instead
    ];

    results.redundantVars = results.currentVars.filter(envVar => {
      return deprecatedPatterns.some(pattern => envVar.name.includes(pattern)) ||
             duplicateCollections.some(collection => envVar.name.includes(`COLLECTION_${collection}`) && !envVar.name.includes('COLLEGE_'));
    });

    if (results.redundantVars.length > 0) {
      log('   🚨 Redundant variables found:', 'red');
      results.redundantVars.forEach(envVar => {
        log(`     - ${envVar.name}: ${envVar.value}`, 'red');
      });
    } else {
      log('   ✅ No redundant variables found', 'green');
    }

    // Phase 3: Define Modern Schema Environment Variables
    log('\n✨ Phase 3: Defining Modern Schema Variables', 'green');
    
    const modernSchema = {
      // Core Database Collections (Required)
      'NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS': 'college_players',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS': 'teams',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES': 'leagues',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS': 'rosters',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES': 'games',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS': 'rankings',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_USERS': 'users',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS': 'player_stats',
      
      // New Collections (Added in cleanup)
      'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS': 'auctions',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS': 'bids',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS': 'lineups',
      
      // Optional Collections (Keep if they exist)
      'NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG': 'activity_log',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_WEEKLY': 'projections_weekly',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_YEARLY': 'projections_yearly',
      'NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS': 'model_inputs'
    };

    // Phase 4: Identify Missing Variables
    log('\n➕ Phase 4: Identifying Missing Modern Variables', 'yellow');
    
    const currentVarNames = results.currentVars.map(v => v.name);
    results.missingVars = Object.entries(modernSchema).filter(([key, value]) => 
      !currentVarNames.includes(key)
    );

    if (results.missingVars.length > 0) {
      log('   📝 Missing modern variables:', 'yellow');
      results.missingVars.forEach(([key, value]) => {
        log(`     + ${key}: ${value}`, 'yellow');
      });
    } else {
      log('   ✅ All modern variables present', 'green');
    }

    // Phase 5: Execute Changes
    if (!isDryRun) {
      log('\n🔧 Phase 5: Executing Environment Variable Updates', 'bright');
      
      // Remove redundant variables
      for (const envVar of results.redundantVars) {
        log(`   🗑️ Removing: ${envVar.name}`, 'red');
        try {
          execSync(`vercel env rm ${envVar.name} production --yes`, { stdio: 'pipe' });
          execSync(`vercel env rm ${envVar.name} preview --yes`, { stdio: 'pipe' });
          execSync(`vercel env rm ${envVar.name} development --yes`, { stdio: 'pipe' });
          results.removedVars.push(envVar.name);
          log(`     ✅ Removed: ${envVar.name}`, 'green');
        } catch (error) {
          log(`     ⚠️ Could not remove ${envVar.name} (may not exist in all environments)`, 'yellow');
        }
      }
      
      // Add missing variables
      for (const [key, value] of results.missingVars) {
        log(`   ➕ Adding: ${key} = ${value}`, 'green');
        try {
          execSync(`vercel env add ${key} production`, {
            input: value,
            stdio: ['pipe', 'pipe', 'pipe']
          });
          execSync(`vercel env add ${key} preview`, {
            input: value, 
            stdio: ['pipe', 'pipe', 'pipe']
          });
          execSync(`vercel env add ${key} development`, {
            input: value,
            stdio: ['pipe', 'pipe', 'pipe']
          });
          results.addedVars.push(key);
          log(`     ✅ Added: ${key}`, 'green');
        } catch (error) {
          log(`     ❌ Failed to add ${key}: ${error.message}`, 'red');
          results.errors.push(`Failed to add ${key}: ${error.message}`);
        }
      }

      // Update local .env files to match
      log('\n📝 Updating Local Environment Files', 'cyan');
      await updateLocalEnvFiles(modernSchema);

    } else {
      log('\n📋 Phase 5: Preview of Changes (Dry Run)', 'cyan');
      
      if (results.redundantVars.length > 0) {
        log('   🗑️ Would remove these variables:', 'red');
        results.redundantVars.forEach(envVar => {
          log(`     - ${envVar.name}`, 'red');
        });
      }
      
      if (results.missingVars.length > 0) {
        log('   ➕ Would add these variables:', 'green');
        results.missingVars.forEach(([key, value]) => {
          log(`     + ${key} = ${value}`, 'green');
        });
      }
    }

    // Phase 6: Verify Updated Schema
    log('\n✅ Phase 6: Verifying Updated Environment', 'bright');
    
    if (!isDryRun) {
      try {
        const updatedEnvOutput = execSync('vercel env ls', { encoding: 'utf8' });
        const updatedVars = parseVercelEnvOutput(updatedEnvOutput);
        
        log(`   📊 Environment now has ${updatedVars.length} variables`, 'green');
        
        // Verify all modern schema variables are present
        const missingAfterUpdate = Object.keys(modernSchema).filter(key => 
          !updatedVars.some(v => v.name === key)
        );
        
        if (missingAfterUpdate.length === 0) {
          log('   🎉 All modern schema variables confirmed present', 'green');
        } else {
          log(`   ⚠️ Still missing: ${missingAfterUpdate.join(', ')}`, 'yellow');
        }
        
      } catch (error) {
        log(`   ⚠️ Could not verify updated environment: ${error.message}`, 'yellow');
      }
    }

    // Summary Report
    log('\n📊 CLEANUP SUMMARY', 'bright');
    log('════════════════════════════════════════', 'bright');
    
    log(`🗑️ Redundant variables removed: ${results.removedVars.length}`, 'green');
    log(`➕ Modern variables added: ${results.addedVars.length}`, 'green');
    log(`📝 Local env files updated: ${isDryRun ? '0 (dry run)' : '2'}`, 'green');

    if (results.errors.length > 0) {
      log(`\n❌ ERRORS ENCOUNTERED: ${results.errors.length}`, 'red');
      results.errors.forEach(error => log(`   - ${error}`, 'red'));
    } else {
      log('\n🎉 ENVIRONMENT CLEANUP COMPLETED SUCCESSFULLY!', 'green');
    }

    // Next Steps
    log('\n💡 NEXT STEPS', 'bright');
    log('════════════════════════════════════════', 'bright');
    log('1. Deploy to apply new environment variables: vercel --prod', 'cyan');
    log('2. Test all functionality with updated environment', 'cyan');
    log('3. Verify collection references work correctly', 'cyan');
    log('4. Run database migration: node scripts/safe-database-migration.js --execute', 'yellow');

    return results;

  } catch (error) {
    log(`\n❌ Environment cleanup failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

function parseVercelEnvOutput(output) {
  const lines = output.split('\n');
  const envVars = [];
  
  // Parse the table output from vercel env ls
  for (const line of lines) {
    // Look for lines that contain environment variable data
    if (line.includes('production') || line.includes('preview') || line.includes('development')) {
      const parts = line.split('|').map(part => part.trim());
      if (parts.length >= 3) {
        const name = parts[0];
        const value = parts[1];
        const environments = parts.slice(2);
        
        if (name && !name.includes('Name') && !name.includes('---')) {
          envVars.push({
            name: name,
            value: value,
            environments: environments
          });
        }
      }
    }
  }
  
  // Remove duplicates (same var name)
  const uniqueVars = [];
  const seenNames = new Set();
  
  for (const envVar of envVars) {
    if (!seenNames.has(envVar.name)) {
      uniqueVars.push(envVar);
      seenNames.add(envVar.name);
    }
  }
  
  return uniqueVars;
}

async function updateLocalEnvFiles(modernSchema) {
  const envFiles = ['.env.local', '.env.production', '.env.production.local'];
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      log(`   📝 Updating ${envFile}`, 'cyan');
      
      let content = fs.readFileSync(envFile, 'utf8');
      let updated = false;
      
      // Remove deprecated variables
      const deprecatedPatterns = [
        /NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS=.*/g,
        /NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS=.*/g,
        /NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS=.*/g,
        /NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS=.*/g,
        /NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS=.*/g,
        /NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING=.*/g,
      ];
      
      for (const pattern of deprecatedPatterns) {
        if (pattern.test(content)) {
          content = content.replace(pattern, '');
          updated = true;
        }
      }
      
      // Add modern schema variables that are missing
      for (const [key, value] of Object.entries(modernSchema)) {
        if (!content.includes(key)) {
          // Add to collection section if it exists, otherwise add at end
          if (content.includes('# Collection Names')) {
            content = content.replace(
              /# Collection Names\n/,
              `# Collection Names\n${key}=${value}\n`
            );
          } else {
            content += `\n# Modern Collection Names\n${key}=${value}\n`;
          }
          updated = true;
        }
      }
      
      // Clean up extra blank lines
      content = content.replace(/\n\n\n+/g, '\n\n');
      
      if (updated) {
        fs.writeFileSync(envFile, content);
        log(`     ✅ Updated ${envFile}`, 'green');
      } else {
        log(`     ✅ ${envFile} already up to date`, 'green');
      }
    }
  }
}

if (require.main === module) {
  cleanupVercelEnvironment().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}