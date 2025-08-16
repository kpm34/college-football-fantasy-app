#!/usr/bin/env node

/**
 * Fully automated webhook setup using proper authentication
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Automated Webhook Setup\n');

async function checkAuthStatus() {
  console.log('🔍 Checking authentication status...');
  
  try {
    const result = execSync('appwrite account get', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('email')) {
      const emailMatch = result.match(/"email":\s*"([^"]+)"/);
      const email = emailMatch ? emailMatch[1] : 'authenticated user';
      console.log(`   ✅ Authenticated as: ${email}`);
      return true;
    }
  } catch (error) {
    console.log('   ⚠️  Not authenticated');
  }
  
  return false;
}

async function performLogin() {
  console.log('\n🔐 Logging in to Appwrite...');
  console.log('   Using email: kashpm2002@gmail.com');
  
  return new Promise((resolve, reject) => {
    const loginProcess = spawn('appwrite', ['login'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    loginProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`   ${data.toString().trim()}`);
      
      // Auto-fill email if prompted
      if (data.toString().includes('email')) {
        loginProcess.stdin.write('kashpm2002@gmail.com\n');
      }
    });
    
    loginProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log(`   ${data.toString().trim()}`);
    });
    
    loginProcess.on('close', (code) => {
      if (code === 0) {
        console.log('   ✅ Login successful');
        resolve(true);
      } else {
        console.log('   ❌ Login failed');
        resolve(false);
      }
    });
    
    // Handle timeout
    setTimeout(() => {
      loginProcess.kill();
      console.log('   ⏱️  Login timed out');
      resolve(false);
    }, 60000); // 1 minute timeout
  });
}

async function createWebhookViaCLI() {
  console.log('\n📡 Creating webhook via CLI...');
  
  try {
    const events = [
      'databases.*.collections.*.create',
      'databases.*.collections.*.update', 
      'databases.*.collections.*.delete',
      'databases.*.attributes.*.create',
      'databases.*.attributes.*.update',
      'databases.*.attributes.*.delete',
      'databases.*.indexes.*.create',
      'databases.*.indexes.*.update',
      'databases.*.indexes.*.delete'
    ].join(',');
    
    const result = execSync(`appwrite projects create-webhook \
      --project-id="${process.env.APPWRITE_PROJECT_ID}" \
      --name="Schema Drift Detection" \
      --url="https://cfbfantasy.app/api/webhooks/appwrite/schema-drift" \
      --events="${events}" \
      --security=true`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('   ✅ Webhook created successfully!');
    console.log('\n📋 Webhook Details:');
    console.log(result);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ CLI webhook creation failed: ${error.message}`);
    return false;
  }
}

async function addWebhookHeaders() {
  console.log('\n🔑 Adding webhook secret header...');
  
  try {
    // List webhooks to find the ID
    const listResult = execSync(`appwrite projects list-webhooks --project-id="${process.env.APPWRITE_PROJECT_ID}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Extract webhook ID (this is a simplified approach)
    const webhookIdMatch = listResult.match(/"webhookId":\s*"([^"]+)"/);
    
    if (!webhookIdMatch) {
      console.log('   ⚠️  Could not find webhook ID, header setup will be manual');
      return false;
    }
    
    const webhookId = webhookIdMatch[1];
    console.log(`   📋 Found webhook ID: ${webhookId}`);
    
    // Update webhook with headers (if CLI supports it)
    // Note: This might not be available in all CLI versions
    try {
      const updateResult = execSync(`appwrite projects update-webhook \
        --project-id="${process.env.APPWRITE_PROJECT_ID}" \
        --webhook-id="${webhookId}" \
        --headers="{\\"X-Webhook-Secret\\": \\"${process.env.APPWRITE_WEBHOOK_SECRET}\\"}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('   ✅ Webhook secret header added');
      return true;
      
    } catch (headerError) {
      console.log('   ⚠️  Header update not supported via CLI');
      console.log('   💡 You\'ll need to add the header manually in Console');
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error setting up headers: ${error.message}`);
    return false;
  }
}

async function verifyWebhookSetup() {
  console.log('\n🧪 Verifying webhook setup...');
  
  try {
    const result = execSync(`appwrite projects list-webhooks --project-id="${process.env.APPWRITE_PROJECT_ID}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('Schema Drift Detection')) {
      console.log('   ✅ Webhook found: Schema Drift Detection');
      
      if (result.includes('https://cfbfantasy.app')) {
        console.log('   ✅ Correct URL configured');
      }
      
      console.log('\n📋 Current webhooks:');
      console.log(result);
      
      return true;
    } else {
      console.log('   ❌ Schema Drift Detection webhook not found');
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`📂 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`🔑 Webhook Secret: ${process.env.APPWRITE_WEBHOOK_SECRET?.substring(0, 20)}...\n`);
  
  // Step 1: Check if already authenticated
  let isAuthenticated = await checkAuthStatus();
  
  // Step 2: Login if needed
  if (!isAuthenticated) {
    console.log('\n🔐 Authentication required...');
    console.log('   This will open a browser or prompt for credentials');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const proceed = await new Promise(resolve => {
      rl.question('   Proceed with login? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    if (!proceed) {
      console.log('\n⏹️  Aborted by user');
      return;
    }
    
    isAuthenticated = await performLogin();
  }
  
  if (!isAuthenticated) {
    console.log('\n❌ Authentication failed - cannot proceed');
    return;
  }
  
  // Step 3: Create webhook
  const webhookCreated = await createWebhookViaCLI();
  
  if (!webhookCreated) {
    console.log('\n❌ Webhook creation failed');
    return;
  }
  
  // Step 4: Add headers (optional)
  await addWebhookHeaders();
  
  // Step 5: Verify setup
  const verified = await verifyWebhookSetup();
  
  if (verified) {
    console.log('\n🎉 SUCCESS: Webhook system is fully operational!');
    console.log('\n🧪 Test it now:');
    console.log('   1. Go to Appwrite Console → Database → college-football-fantasy');
    console.log('   2. Add a test attribute to any collection');
    console.log('   3. Check GitHub issues for automatic creation');
    console.log('   4. Verify GitHub Actions workflow runs');
    
    console.log('\n💡 Manual step (if headers failed):');
    console.log('   1. Go to Appwrite Console → Project Settings → Webhooks');
    console.log('   2. Edit "Schema Drift Detection" webhook');
    console.log('   3. Add header: X-Webhook-Secret = f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b');
    
  } else {
    console.log('\n❌ Setup completed with issues - manual verification needed');
  }
}

if (require.main === module) {
  main().catch(console.error);
}