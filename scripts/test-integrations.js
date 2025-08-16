#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests all API integrations and tools
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testClaudeAPI() {
  log('\n🤖 Testing Claude API Integration...', 'cyan');
  
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "Claude API test successful!"' }],
    });

    if (response.content[0].text.includes('successful')) {
      log('✅ Claude API: Working perfectly!', 'green');
      return true;
    } else {
      log('⚠️  Claude API: Unexpected response', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Claude API: ${error.message}`, 'red');
    return false;
  }
}

async function testAppwrite() {
  log('\n🗄️ Testing Appwrite Database...', 'cyan');
  
  try {
    // Try both client SDK versions
    let client, databases;
    
    try {
      // Try Node SDK first
      const sdk = require('node-appwrite');
      client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);
      
      databases = new sdk.Databases(client);
    } catch {
      // Fallback to regular appwrite SDK
      const { Client, Databases } = require('appwrite');
      client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID);
      
      databases = new Databases(client);
    }
    
    // Test database connection
    const database = await databases.get(process.env.APPWRITE_DATABASE_ID);
    log('✅ Appwrite: Connected successfully!', 'green');
    log(`   Database: ${database.name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Appwrite: ${error.message}`, 'red');
    log('   This is likely due to API key permissions or network connectivity', 'yellow');
    log('   The SDK is properly configured - just check API access', 'yellow');
    return false;
  }
}

function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables...', 'cyan');
  
  const required = [
    'ANTHROPIC_API_KEY',
    'APPWRITE_ENDPOINT',
    'APPWRITE_PROJECT_ID',
    'APPWRITE_API_KEY',
    'APPWRITE_DATABASE_ID'
  ];
  
  const optional = [
    'FIGMA_ACCESS_TOKEN',
    'FIGMA_FILE_ID',
    'CFBD_API_KEY',
    'AI_GATEWAY_API_KEY'
  ];
  
  let allRequired = true;
  
  log('Required variables:', 'yellow');
  required.forEach(key => {
    if (process.env[key]) {
      log(`  ✅ ${key}`, 'green');
    } else {
      log(`  ❌ ${key} - MISSING`, 'red');
      allRequired = false;
    }
  });
  
  log('\nOptional variables:', 'yellow');
  optional.forEach(key => {
    if (process.env[key]) {
      log(`  ✅ ${key}`, 'green');
    } else {
      log(`  ⚪ ${key} - Not set`, 'reset');
    }
  });
  
  return allRequired;
}

function testCLITools() {
  log('\n🛠️ Testing CLI Tools...', 'cyan');
  
  const { execSync } = require('child_process');
  const tools = [
    { name: 'GitHub CLI', command: 'gh --version' },
    { name: 'Vercel CLI', command: 'vercel --version' },
    { name: 'Turbo', command: 'turbo --version' },
    { name: 'Act (GitHub Actions)', command: 'act --version' },
    { name: 'ngrok', command: 'ngrok version' },
    { name: 'Prettier', command: 'prettier --version' },
    { name: 'ESLint', command: 'eslint --version' }
  ];
  
  let allInstalled = true;
  
  tools.forEach(tool => {
    try {
      execSync(tool.command, { stdio: 'ignore' });
      log(`  ✅ ${tool.name}`, 'green');
    } catch (error) {
      log(`  ❌ ${tool.name} - Not found`, 'red');
      allInstalled = false;
    }
  });
  
  return allInstalled;
}

async function main() {
  log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════╗
║       Integration Test Suite             ║
║   College Football Fantasy App           ║
╚══════════════════════════════════════════╝${colors.reset}
`);

  const results = {
    env: testEnvironmentVariables(),
    cli: testCLITools(),
    claude: await testClaudeAPI(),
    appwrite: await testAppwrite()
  };
  
  log('\n📊 Test Results Summary:', 'cyan');
  log(`Environment Variables: ${results.env ? '✅ PASS' : '❌ FAIL'}`, results.env ? 'green' : 'red');
  log(`CLI Tools: ${results.cli ? '✅ PASS' : '❌ FAIL'}`, results.cli ? 'green' : 'red');
  log(`Claude API: ${results.claude ? '✅ PASS' : '❌ FAIL'}`, results.claude ? 'green' : 'red');
  log(`Appwrite DB: ${results.appwrite ? '✅ PASS' : '❌ FAIL'}`, results.appwrite ? 'green' : 'red');
  
  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 All integrations working perfectly!', 'green');
    log('You can now use:', 'cyan');
    log('  • node scripts/claude-cli.js - Interactive Claude AI', 'green');
    log('  • node scripts/figma-sync.js - Figma design sync', 'green');
    log('  • npm run dev - Start development server', 'green');
  } else {
    log('\n⚠️  Some integrations need attention', 'yellow');
    log('Check the errors above and fix any missing configurations', 'yellow');
  }
  
  return allPassed;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testClaudeAPI, testAppwrite };