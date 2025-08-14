#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Environment Configuration Check\n');

// Check for various env files
const envFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
];

console.log('📁 Checking for environment files:');
let foundEnvFile = false;

for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
    foundEnvFile = true;
    
    // Check if it contains required vars (without exposing values)
    const content = fs.readFileSync(filePath, 'utf8');
    const hasAppwriteConfig = 
      content.includes('APPWRITE_ENDPOINT') ||
      content.includes('APPWRITE_PROJECT_ID') ||
      content.includes('APPWRITE_API_KEY');
    
    if (hasAppwriteConfig) {
      console.log(`   └─ Contains Appwrite configuration`);
    }
  } else {
    console.log(`⚠️  ${file} - Not found`);
  }
}

if (!foundEnvFile) {
  console.log('\n❌ No environment files found!');
  console.log('\n📝 Create a .env.local file with:');
  console.log(`
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
APPWRITE_API_KEY=your-api-key-here

# Other required variables
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app

# Optional but recommended
SENTRY_DSN=your-sentry-dsn
KV_REST_API_URL=your-vercel-kv-url
KV_REST_API_TOKEN=your-vercel-kv-token
`);
} else {
  console.log('\n✅ Environment file(s) found');
  console.log('\n💡 To run scripts with env vars:');
  console.log('   npm run verify:sync');
  console.log('   OR');
  console.log('   npx dotenv-cli -e .env.local node scripts/verify-sync.js');
}

// Check if running in Vercel
if (process.env.VERCEL) {
  console.log('\n🚀 Running in Vercel environment');
  console.log(`   Environment: ${process.env.VERCEL_ENV}`);
  console.log(`   URL: ${process.env.VERCEL_URL}`);
} else {
  console.log('\n💻 Running locally');
  console.log('   Make sure to run "npm run dev" to load env vars');
}

console.log('\n📚 Documentation:');
console.log('   - Environment setup: docs/DEVELOPMENT_WORKFLOW.md');
console.log('   - API routes: docs/API_ROUTES.md');
console.log('   - Database schema: docs/DATABASE_SCHEMA.md\n');
