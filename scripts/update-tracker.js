#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.join(process.cwd(), 'docs/PROJECT_UPDATE_TRACKER.md');
const SUMMARY_PATH = path.join(process.cwd(), 'docs/PROJECT_SUMMARY.md');
const DATAFLOW_PATH = path.join(process.cwd(), 'docs/DATA_FLOW.md');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readTracker() {
  try {
    const content = fs.readFileSync(TRACKER_PATH, 'utf8');
    return content;
  } catch (error) {
    log('❌ Could not read tracker file', 'red');
    return null;
  }
}

function getEditCount(content) {
  const match = content.match(/Major Edits Counter \((\d+)\/4\)/);
  return match ? parseInt(match[1]) : 0;
}

function getLastDataFlowUpdate(content) {
  const match = content.match(/Data Flow\*\*: ([^\n]+)/);
  if (match) {
    const dateStr = match[1];
    return new Date(dateStr);
  }
  return new Date();
}

function checkUpdates() {
  log('\n📊 PROJECT UPDATE TRACKER', 'bright');
  log('========================\n', 'bright');

  const trackerContent = readTracker();
  if (!trackerContent) return;

  // Check edit count
  const editCount = getEditCount(trackerContent);
  log(`📝 Major Edits: ${editCount}/4`, editCount >= 4 ? 'yellow' : 'green');
  
  if (editCount >= 4) {
    log('⚠️  Project Summary update required!', 'yellow');
    log('   Run: npm run update:summary', 'yellow');
  }

  // Check data flow timing
  const lastDataFlow = getLastDataFlowUpdate(trackerContent);
  const now = new Date();
  const timeDiff = (now - lastDataFlow) / 1000 / 60; // minutes
  
  log(`\n⏱️  Last Data Flow Update: ${lastDataFlow.toLocaleString()}`, 'blue');
  log(`   Time since update: ${Math.floor(timeDiff)} minutes`, 'blue');
  
  if (timeDiff >= 30) {
    log('⚠️  Data Flow update required! (30+ minutes)', 'yellow');
    log('   Run: npm run update:dataflow', 'yellow');
  } else {
    log(`✅ Next update in: ${Math.ceil(30 - timeDiff)} minutes`, 'green');
  }

  // Show recent edits
  log('\n📋 Recent Major Edits:', 'bright');
  const editsMatch = trackerContent.match(/## Major Edits Counter[\s\S]*?(?=\n##)/);
  if (editsMatch) {
    const edits = editsMatch[0].split('\n').filter(line => line.match(/^\d+\./));
    edits.forEach(edit => {
      log(`   ${edit}`, 'green');
    });
  }

  // Show active integrations
  log('\n🔌 Active Integrations:', 'bright');
  const integrationsMatch = trackerContent.match(/### ✅ Completed[\s\S]*?(?=\n###)/);
  if (integrationsMatch) {
    const integrations = integrationsMatch[0].split('\n').filter(line => line.startsWith('-'));
    integrations.slice(0, 5).forEach(integration => {
      log(`   ${integration}`, 'green');
    });
    if (integrations.length > 5) {
      log(`   ... and ${integrations.length - 5} more`, 'green');
    }
  }

  log('\n💡 Quick Commands:', 'bright');
  log('   npm run update:check    - Check update status', 'blue');
  log('   npm run update:summary  - Update project summary', 'blue');
  log('   npm run update:dataflow - Update data flow', 'blue');
  log('   npm run update:track    - Track a new major edit', 'blue');
  log('');
}

function updateSummary() {
  log('📝 Updating Project Summary...', 'yellow');
  
  // Reset edit counter in tracker
  const trackerContent = readTracker();
  if (trackerContent) {
    const updated = trackerContent.replace(
      /Major Edits Counter \(\d+\/4\)/,
      'Major Edits Counter (0/4)'
    );
    fs.writeFileSync(TRACKER_PATH, updated);
    log('✅ Reset edit counter', 'green');
  }
  
  log('✅ Project Summary marked for manual update', 'green');
  log('   Please update docs/PROJECT_SUMMARY.md with recent changes', 'yellow');
}

function updateDataFlow() {
  log('🔄 Updating Data Flow timestamp...', 'yellow');
  
  const trackerContent = readTracker();
  if (trackerContent) {
    const now = new Date();
    const updated = trackerContent.replace(
      /Data Flow\*\*: [^\n]+/,
      `Data Flow**: ${now.toLocaleString()}`
    );
    fs.writeFileSync(TRACKER_PATH, updated);
    log('✅ Data Flow timestamp updated', 'green');
  }
  
  // Update DATA_FLOW.md timestamp
  const dataflowContent = fs.readFileSync(DATAFLOW_PATH, 'utf8');
  const now = new Date();
  const nextUpdate = new Date(now.getTime() + 30 * 60 * 1000);
  
  let updated = dataflowContent.replace(
    /\*\*Last Updated\*\*: [^\n]+/,
    `**Last Updated**: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
  );
  
  updated = updated.replace(
    /\*\*Next Update\*\*: [^\n]+/,
    `**Next Update**: ${nextUpdate.toLocaleTimeString()} (30 min cycle)`
  );
  
  fs.writeFileSync(DATAFLOW_PATH, updated);
  log('✅ Data Flow document updated', 'green');
}

function trackEdit(description) {
  log('📝 Tracking new major edit...', 'yellow');
  
  const trackerContent = readTracker();
  if (!trackerContent) return;
  
  const currentCount = getEditCount(trackerContent);
  const newCount = currentCount + 1;
  
  // Update counter
  let updated = trackerContent.replace(
    /Major Edits Counter \(\d+\/4\)/,
    `Major Edits Counter (${newCount}/4)`
  );
  
  // Add edit to list
  const editsSection = updated.match(/(## Major Edits Counter[\s\S]*?)(?=\n##)/);
  if (editsSection) {
    const lines = editsSection[1].split('\n');
    const editIndex = lines.findIndex(line => line.match(/^\d+\. ⏳/));
    
    if (editIndex > -1) {
      lines[editIndex] = `${newCount}. ✅ ${description}`;
    } else {
      // Add new line before "## Next Summary Update Due"
      const beforeNext = lines.findIndex(line => line.includes('Next Summary Update'));
      lines.splice(beforeNext, 0, `${newCount}. ✅ ${description}`);
    }
    
    const newSection = lines.join('\n');
    updated = updated.replace(editsSection[0], newSection);
  }
  
  fs.writeFileSync(TRACKER_PATH, updated);
  log(`✅ Tracked edit ${newCount}/4: ${description}`, 'green');
  
  if (newCount >= 4) {
    log('\n⚠️  4 edits completed! Time to update the project summary.', 'yellow');
    log('   Run: npm run update:summary', 'yellow');
  }
}

// Parse command line arguments
const command = process.argv[2];
const args = process.argv.slice(3).join(' ');

switch (command) {
  case 'check':
    checkUpdates();
    break;
  case 'summary':
    updateSummary();
    break;
  case 'dataflow':
    updateDataFlow();
    break;
  case 'track':
    if (args) {
      trackEdit(args);
    } else {
      log('❌ Please provide a description for the edit', 'red');
      log('   Example: npm run update:track "Added user profile customization"', 'yellow');
    }
    break;
  default:
    checkUpdates();
}
