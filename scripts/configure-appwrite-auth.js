#!/usr/bin/env node

/**
 * Configure Appwrite CLI with persistent authentication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('🔐 Configuring Appwrite CLI with persistent authentication\n');

function createAppwriteConfig() {
  const homeDir = require('os').homedir();
  const appwriteDir = path.join(homeDir, '.appwrite');
  
  console.log('📁 Creating Appwrite CLI configuration...');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(appwriteDir)) {
    fs.mkdirSync(appwriteDir, { recursive: true });
    console.log(`   ✅ Created directory: ${appwriteDir}`);
  }
  
  // Create project configuration
  const projectConfig = {
    projectId: process.env.APPWRITE_PROJECT_ID,
    endpoint: process.env.APPWRITE_ENDPOINT
  };
  
  fs.writeFileSync(
    path.join(appwriteDir, 'project.json'),
    JSON.stringify(projectConfig, null, 2)
  );
  console.log('   ✅ Created project configuration');
  
  // Create preferences with API key authentication
  const preferences = {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    key: process.env.APPWRITE_API_KEY,
    selfSigned: false,
    cookie: "",
    email: "kashpm2002@gmail.com",
    preference: {
      editor: "cursor",
      ide: "cursor"
    }
  };
  
  fs.writeFileSync(
    path.join(appwriteDir, 'prefs.json'),
    JSON.stringify(preferences, null, 2)
  );
  console.log('   ✅ Created preferences with API key');
  
  return true;
}

function configureGlobalAppwriteCommands() {
  console.log('\n🔧 Configuring global Appwrite CLI...');
  
  try {
    // Set endpoint
    execSync(`appwrite client --endpoint "${process.env.APPWRITE_ENDPOINT}"`, {
      stdio: 'pipe'
    });
    console.log('   ✅ Set global endpoint');
    
    // Set project
    execSync(`appwrite client --project-id "${process.env.APPWRITE_PROJECT_ID}"`, {
      stdio: 'pipe'
    });
    console.log('   ✅ Set global project ID');
    
    // Set API key
    execSync(`appwrite client --key "${process.env.APPWRITE_API_KEY}"`, {
      stdio: 'pipe'
    });
    console.log('   ✅ Set global API key');
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed to configure global CLI: ${error.message}`);
    return false;
  }
}

function createLocalAppwriteJson() {
  console.log('\n📄 Creating local appwrite.json...');
  
  const appwriteConfig = {
    projectId: process.env.APPWRITE_PROJECT_ID,
    projectName: "College Football Fantasy App",
    endpoint: process.env.APPWRITE_ENDPOINT,
    functions: {},
    collections: [
      {
        "$id": "games",
        "name": "Games",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "teams", 
        "name": "Teams",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "leagues",
        "name": "Leagues", 
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "college_players",
        "name": "College Players",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "player_stats",
        "name": "Player Stats",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "rankings",
        "name": "Rankings",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "rosters",
        "name": "Rosters",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "lineups",
        "name": "Lineups",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "auctions",
        "name": "Auctions",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "bids",
        "name": "Bids",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "users",
        "name": "Users",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      },
      {
        "$id": "activity_log",
        "name": "Activity Log",
        "enabled": true,
        "documentSecurity": false,
        "attributes": [],
        "indexes": []
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'appwrite.json'),
    JSON.stringify(appwriteConfig, null, 2)
  );
  
  console.log('   ✅ Created appwrite.json with all collections');
}

function testAuthentication() {
  console.log('\n🧪 Testing authentication...');
  
  const tests = [
    { command: 'appwrite teams list', name: 'Teams list' },
    { command: 'appwrite databases list', name: 'Databases list' },
    { command: 'appwrite projects list-webhooks --project-id college-football-fantasy-app', name: 'Webhooks list' }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    try {
      execSync(test.command, { 
        stdio: 'pipe',
        timeout: 10000
      });
      console.log(`   ✅ ${test.name} - Success`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ ${test.name} - Failed: ${error.message.substring(0, 50)}...`);
    }
  }
  
  console.log(`\n📊 Authentication test results: ${successCount}/${tests.length} passed`);
  
  if (successCount > 0) {
    console.log('✅ Authentication is working!');
    return true;
  } else {
    console.log('❌ Authentication failed');
    return false;
  }
}

async function main() {
  console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`📂 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`🔑 API Key: ${process.env.APPWRITE_API_KEY?.substring(0, 20)}...\n`);
  
  // Create configuration files
  createAppwriteConfig();
  
  // Configure global commands
  const globalSuccess = configureGlobalAppwriteCommands();
  
  // Create local configuration
  createLocalAppwriteJson();
  
  // Test authentication
  const authSuccess = testAuthentication();
  
  if (globalSuccess && authSuccess) {
    console.log('\n🎉 Appwrite CLI authentication configured successfully!');
    console.log('\n📋 You can now use:');
    console.log('   • appwrite teams list');
    console.log('   • appwrite databases list');
    console.log('   • appwrite projects list-webhooks --project-id college-football-fantasy-app');
    console.log('   • appwrite collections list --database-id college-football-fantasy');
  } else {
    console.log('\n⚠️  Authentication setup completed with some issues');
    console.log('   Manual verification may be needed');
  }
}

if (require.main === module) {
  main().catch(console.error);
}