#!/usr/bin/env node

/**
 * Collection Usage Analysis Script
 * 
 * This script analyzes the entire codebase to find which collections
 * and attributes are actively being used before cleanup.
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

// Collections we found in the database
const ALL_COLLECTIONS = [
  'activity_log', 'auction_bids', 'auction_sessions', 'college_players', 
  'draft_picks', 'drafts', 'games', 'leagues', 'players', 'player_stats',
  'rankings', 'rosters', 'scoring', 'teams', 'transactions', 'user_teams', 'users'
];

// Collections we want to clean up
const CLEANUP_CANDIDATES = {
  duplicate: {
    'players': 'college_players',
    'user_teams': 'rosters', 
    'auction_sessions': 'auctions',
    'auction_bids': 'bids'
  },
  legacy: ['drafts', 'draft_picks', 'transactions', 'scoring']
};

function analyzeCollectionUsage() {
  log(`
╔══════════════════════════════════════════════════════════════╗
║              Collection Usage Analysis                       ║
║         Analyzing Active Usage Before Cleanup               ║
╚══════════════════════════════════════════════════════════════╝
  `, 'bright');

  const usageReport = {
    collections: {},
    riskAssessment: {},
    safeToCleanup: [],
    requiresCodeUpdate: [],
    highRisk: []
  };

  // Search patterns for each collection
  for (const collection of ALL_COLLECTIONS) {
    log(`\n🔍 Analyzing usage of: ${collection}`, 'cyan');
    
    const usage = findCollectionUsage(collection);
    usageReport.collections[collection] = usage;
    
    // Assess risk level
    const riskLevel = assessRiskLevel(collection, usage);
    usageReport.riskAssessment[collection] = riskLevel;
    
    // Categorize based on risk
    if (riskLevel.level === 'SAFE') {
      usageReport.safeToCleanup.push(collection);
    } else if (riskLevel.level === 'MEDIUM') {
      usageReport.requiresCodeUpdate.push(collection);
    } else if (riskLevel.level === 'HIGH') {
      usageReport.highRisk.push(collection);
    }
  }

  // Generate detailed report
  generateUsageReport(usageReport);
  
  // Generate migration strategy
  generateMigrationStrategy(usageReport);
  
  return usageReport;
}

function findCollectionUsage(collection) {
  const usage = {
    apiRoutes: [],
    components: [],
    types: [],
    configFiles: [],
    totalReferences: 0
  };

  try {
    // Search in API routes
    const apiSearch = execSync(`grep -r "${collection}" app/api/ --include="*.ts" --include="*.js" 2>/dev/null || true`, { encoding: 'utf8' });
    usage.apiRoutes = parseGrepResults(apiSearch);
    
    // Search in components
    const componentSearch = execSync(`grep -r "${collection}" components/ --include="*.tsx" --include="*.ts" 2>/dev/null || true`, { encoding: 'utf8' });
    usage.components = parseGrepResults(componentSearch);
    
    // Search in frontend app directory
    const frontendSearch = execSync(`grep -r "${collection}" app/ --include="*.tsx" --include="*.ts" --exclude-dir=api 2>/dev/null || true`, { encoding: 'utf8' });
    usage.frontend = parseGrepResults(frontendSearch);
    
    // Search in types
    const typesSearch = execSync(`grep -r "${collection}" types/ --include="*.ts" 2>/dev/null || true`, { encoding: 'utf8' });
    usage.types = parseGrepResults(typesSearch);
    
    // Search in lib/config files
    const configSearch = execSync(`grep -r "${collection}" lib/ --include="*.ts" 2>/dev/null || true`, { encoding: 'utf8' });
    usage.configFiles = parseGrepResults(configSearch);
    
    // Search for environment variable references
    const envSearch = execSync(`grep -r "COLLECTION.*${collection.toUpperCase()}" . --include="*.env*" --include="*.ts" --include="*.js" 2>/dev/null || true`, { encoding: 'utf8' });
    usage.envReferences = parseGrepResults(envSearch);
    
    usage.totalReferences = 
      usage.apiRoutes.length + 
      usage.components.length + 
      (usage.frontend?.length || 0) +
      usage.types.length + 
      usage.configFiles.length +
      (usage.envReferences?.length || 0);
      
    // Log findings
    if (usage.totalReferences > 0) {
      log(`   📊 Total references: ${usage.totalReferences}`, 'yellow');
      if (usage.apiRoutes.length > 0) log(`     - API routes: ${usage.apiRoutes.length}`, 'cyan');
      if (usage.components.length > 0) log(`     - Components: ${usage.components.length}`, 'cyan');
      if (usage.frontend?.length > 0) log(`     - Frontend: ${usage.frontend.length}`, 'cyan');
      if (usage.types.length > 0) log(`     - Types: ${usage.types.length}`, 'cyan');
      if (usage.configFiles.length > 0) log(`     - Config: ${usage.configFiles.length}`, 'cyan');
      if (usage.envReferences?.length > 0) log(`     - Env vars: ${usage.envReferences.length}`, 'cyan');
    } else {
      log(`   ✅ No active usage found - safe to clean up`, 'green');
    }
    
  } catch (error) {
    log(`   ⚠️ Error searching for ${collection}: ${error.message}`, 'yellow');
  }
  
  return usage;
}

function parseGrepResults(output) {
  if (!output.trim()) return [];
  
  return output.trim().split('\n').map(line => {
    const [filePath, ...contentParts] = line.split(':');
    return {
      file: filePath,
      content: contentParts.join(':').trim(),
      line: line
    };
  });
}

function assessRiskLevel(collection, usage) {
  const { totalReferences, apiRoutes, components, frontend } = usage;
  
  // High risk: Heavily used in critical paths
  if (apiRoutes.length > 3 || components.length > 5 || totalReferences > 10) {
    return {
      level: 'HIGH',
      reason: `Heavily used (${totalReferences} references) - requires careful migration`,
      codeUpdateRequired: true
    };
  }
  
  // Medium risk: Some usage, manageable to update
  if (totalReferences > 0) {
    return {
      level: 'MEDIUM', 
      reason: `Moderate usage (${totalReferences} references) - update code before cleanup`,
      codeUpdateRequired: true
    };
  }
  
  // Safe: No usage found
  return {
    level: 'SAFE',
    reason: 'No active usage found - safe to clean up',
    codeUpdateRequired: false
  };
}

function generateUsageReport(usageReport) {
  log('\n📊 USAGE ANALYSIS REPORT', 'bright');
  log('════════════════════════════════════════', 'bright');
  
  // Safe to cleanup
  if (usageReport.safeToCleanup.length > 0) {
    log('\n✅ SAFE TO CLEANUP (No Active Usage)', 'green');
    usageReport.safeToCleanup.forEach(collection => {
      log(`   - ${collection}: ${usageReport.riskAssessment[collection].reason}`, 'green');
    });
  }
  
  // Requires code updates
  if (usageReport.requiresCodeUpdate.length > 0) {
    log('\n⚠️ REQUIRES CODE UPDATES', 'yellow');
    usageReport.requiresCodeUpdate.forEach(collection => {
      const usage = usageReport.collections[collection];
      const risk = usageReport.riskAssessment[collection];
      log(`   - ${collection}: ${risk.reason}`, 'yellow');
      
      // Show specific files that need updates
      const allFiles = [
        ...usage.apiRoutes,
        ...usage.components,
        ...(usage.frontend || []),
        ...usage.types,
        ...usage.configFiles
      ];
      
      const uniqueFiles = [...new Set(allFiles.map(ref => ref.file))];
      if (uniqueFiles.length > 0) {
        log(`     Files to update: ${uniqueFiles.length}`, 'cyan');
        uniqueFiles.slice(0, 5).forEach(file => log(`       • ${file}`, 'cyan'));
        if (uniqueFiles.length > 5) log(`       • ... and ${uniqueFiles.length - 5} more`, 'cyan');
      }
    });
  }
  
  // High risk
  if (usageReport.highRisk.length > 0) {
    log('\n🚨 HIGH RISK - REQUIRES CAREFUL MIGRATION', 'red');
    usageReport.highRisk.forEach(collection => {
      const risk = usageReport.riskAssessment[collection];
      log(`   - ${collection}: ${risk.reason}`, 'red');
    });
  }
}

function generateMigrationStrategy(usageReport) {
  log('\n🚀 MIGRATION STRATEGY', 'bright');
  log('════════════════════════════════════════', 'bright');
  
  // For duplicate collections, show migration path
  Object.entries(CLEANUP_CANDIDATES.duplicate).forEach(([legacy, modern]) => {
    const legacyUsage = usageReport.collections[legacy];
    const modernUsage = usageReport.collections[modern];
    
    log(`\n📦 ${legacy} → ${modern}`, 'magenta');
    
    if (legacyUsage.totalReferences === 0) {
      log(`   ✅ ${legacy} not used - safe to delete`, 'green');
    } else {
      log(`   ⚡ Migration required: ${legacyUsage.totalReferences} references to update`, 'yellow');
      
      // Generate specific migration steps
      const steps = generateMigrationSteps(legacy, modern, legacyUsage, modernUsage);
      steps.forEach((step, index) => {
        log(`   ${index + 1}. ${step}`, 'cyan');
      });
    }
  });
  
  // For legacy collections
  log('\n🧹 Legacy Collection Strategy', 'magenta');
  CLEANUP_CANDIDATES.legacy.forEach(collection => {
    const usage = usageReport.collections[collection];
    const risk = usageReport.riskAssessment[collection];
    
    log(`   ${collection}: ${risk.reason}`, risk.level === 'SAFE' ? 'green' : 'yellow');
    
    if (usage.totalReferences > 0) {
      log(`     → Archive collection but update ${usage.totalReferences} code references first`, 'yellow');
    } else {
      log(`     → Safe to archive immediately`, 'green');
    }
  });
}

function generateMigrationSteps(legacy, modern, legacyUsage, modernUsage) {
  const steps = [];
  
  // Step 1: Update API routes
  if (legacyUsage.apiRoutes.length > 0) {
    steps.push(`Update ${legacyUsage.apiRoutes.length} API routes to use '${modern}'`);
  }
  
  // Step 2: Update components
  if (legacyUsage.components.length > 0) {
    steps.push(`Update ${legacyUsage.components.length} components to query '${modern}'`);
  }
  
  // Step 3: Update types
  if (legacyUsage.types.length > 0) {
    steps.push(`Update TypeScript interfaces to use '${modern}' collection`);
  }
  
  // Step 4: Update config
  if (legacyUsage.configFiles.length > 0) {
    steps.push(`Update configuration files to reference '${modern}'`);
  }
  
  // Step 5: Migrate data
  steps.push(`Migrate data from '${legacy}' to '${modern}' collection`);
  
  // Step 6: Test
  steps.push('Test all functionality with updated collection references');
  
  // Step 7: Remove old collection
  steps.push(`Remove '${legacy}' collection after successful migration`);
  
  return steps;
}

// Generate update scripts for each collection migration
function generateUpdateScripts(usageReport) {
  log('\n🔧 Generating Update Scripts...', 'bright');
  
  Object.entries(CLEANUP_CANDIDATES.duplicate).forEach(([legacy, modern]) => {
    const usage = usageReport.collections[legacy];
    
    if (usage.totalReferences > 0) {
      generateCollectionUpdateScript(legacy, modern, usage);
    }
  });
}

function generateCollectionUpdateScript(legacy, modern, usage) {
  const scriptContent = `#!/bin/bash

# Auto-generated script to update ${legacy} references to ${modern}
# Generated on ${new Date().toISOString()}

echo "🔄 Updating ${legacy} references to ${modern}..."

${usage.apiRoutes.map(ref => 
  `# Update: ${ref.file}\nsed -i '' 's/"${legacy}"/"${modern}"/g' "${ref.file}"`
).join('\n')}

${usage.components.map(ref => 
  `# Update: ${ref.file}\nsed -i '' 's/"${legacy}"/"${modern}"/g' "${ref.file}"`
).join('\n')}

${usage.types.map(ref => 
  `# Update: ${ref.file}\nsed -i '' 's/${legacy}/${modern}/g' "${ref.file}"`
).join('\n')}

echo "✅ Updated all ${legacy} references to ${modern}"
echo "⚠️  Please review changes and test thoroughly"
`;

  const scriptPath = `scripts/update-${legacy}-to-${modern}.sh`;
  fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
  log(`   📝 Generated: ${scriptPath}`, 'green');
}

if (require.main === module) {
  const report = analyzeCollectionUsage();
  
  log('\n🎯 READY FOR SAFE CLEANUP', 'bright');
  log('════════════════════════════════════════', 'bright');
  log('1. Review the analysis above', 'cyan');
  log('2. Run update scripts for collections with active usage', 'cyan');
  log('3. Test application thoroughly', 'cyan');
  log('4. Then run database cleanup script', 'cyan');
  
  generateUpdateScripts(report);
}