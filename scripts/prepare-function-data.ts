import fs from 'fs';
import path from 'path';

// Load the full backup data
const backupPath = path.join(process.cwd(), 'exports/college_players_2025.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

console.log(`Preparing ${backupData.length} players for Appwrite Function...`);

// Save the data to the function directory
const functionDataPath = path.join(process.cwd(), 'functions/import-players/players-data.json');
fs.writeFileSync(functionDataPath, JSON.stringify(backupData, null, 2));

console.log(`✅ Data file created: functions/import-players/players-data.json`);
console.log(`   Total players: ${backupData.length}`);

// Create the appwrite.json configuration
const appwriteConfig = {
  "projectId": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "college-football-fantasy-app",
  "projectName": "College Football Fantasy App",
  "functions": [
    {
      "$id": "import-players",
      "name": "Import Players",
      "runtime": "node-18.0",
      "execute": ["any"],
      "events": [],
      "schedule": "",
      "timeout": 900,
      "enabled": true,
      "logging": true,
      "entrypoint": "index.js",
      "commands": "npm install",
      "path": "functions/import-players",
      "vars": {
        "DATABASE_ID": "college-football-fantasy",
        "COLLECTION_ID": "college_players"
      }
    }
  ]
};

const configPath = path.join(process.cwd(), 'appwrite.json');
fs.writeFileSync(configPath, JSON.stringify(appwriteConfig, null, 2));

console.log(`✅ Appwrite config created: appwrite.json`);

console.log('\n📋 Deployment Instructions:');
console.log('─'.repeat(60));
console.log('1. Install Appwrite CLI (if not already installed):');
console.log('   npm install -g appwrite');
console.log('');
console.log('2. Login to Appwrite:');
console.log('   appwrite login');
console.log('');
console.log('3. Deploy the function:');
console.log('   appwrite deploy function');
console.log('');
console.log('4. After deployment, execute the function:');
console.log('   appwrite functions createExecution --functionId import-players --data \'{"action":"count"}\'');
console.log('');
console.log('5. To import all players (in batches):');
console.log('   appwrite functions createExecution --functionId import-players --data \'{"action":"import","batchSize":500,"startIndex":0}\'');
console.log('');
console.log('6. Continue with next batches:');
console.log('   appwrite functions createExecution --functionId import-players --data \'{"action":"import","batchSize":500,"startIndex":500}\'');
console.log('   appwrite functions createExecution --functionId import-players --data \'{"action":"import","batchSize":500,"startIndex":1000}\'');
console.log('   appwrite functions createExecution --functionId import-players --data \'{"action":"import","batchSize":500,"startIndex":1500}\'');
console.log('   appwrite functions createExecution --functionId import-players --data \'{"action":"import","batchSize":500,"startIndex":2000}\'');
console.log('');
console.log('The function will import players without rate limits!');
console.log('─'.repeat(60));
