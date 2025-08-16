#!/usr/bin/env node

/**
 * Automated Appwrite login that can handle interactive prompts
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🤖 Automated Appwrite Login\n');

// Store credentials securely in environment or prompt
const CREDENTIALS = {
  email: process.env.APPWRITE_USER_EMAIL || 'kashpm2002@gmail.com',
  password: process.env.APPWRITE_USER_PASSWORD || '#Kash2002'  // Direct password for automation
};

async function promptForPassword() {
  if (CREDENTIALS.password) {
    console.log('✅ Password found in environment');
    return CREDENTIALS.password;
  }
  
  console.log('🔑 Password needed for automated login');
  console.log('💡 You can set APPWRITE_USER_PASSWORD in .env.local for future use');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Enter your Appwrite password: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function clearExistingSessions() {
  console.log('🧹 Clearing existing sessions...');
  
  try {
    // Remove any local session files
    const appwriteDir = path.join(require('os').homedir(), '.appwrite');
    if (fs.existsSync(appwriteDir)) {
      const sessionFiles = ['cookie', 'session', 'prefs.json'];
      sessionFiles.forEach(file => {
        const filePath = path.join(appwriteDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`   ✅ Removed ${file}`);
        }
      });
    }
    
    // Clear CLI configuration
    execSync('appwrite client --endpoint "" --project-id "" --key ""', { 
      stdio: 'pipe' 
    });
    
  } catch (error) {
    console.log('   ⚠️  Session clearing completed (some errors expected)');
  }
}

async function performAutomatedLogin(email, password) {
  console.log(`🔐 Logging in as: ${email}`);
  
  return new Promise((resolve) => {
    const loginProcess = spawn('appwrite', ['login'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let currentStep = 'initial';
    let output = '';
    let errorOutput = '';
    
    loginProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`   📋 ${text.trim()}`);
      
      // Handle different prompts
      if (text.includes('Enter your email') || text.includes('email')) {
        console.log(`   📧 Sending email: ${email}`);
        loginProcess.stdin.write(`${email}\n`);
        currentStep = 'email_sent';
      }
      
      if (text.includes('Enter your password') || text.includes('password')) {
        console.log('   🔑 Sending password...');
        loginProcess.stdin.write(`${password}\n`);
        currentStep = 'password_sent';
      }
      
      if (text.includes('What you like to do') || text.includes('Login to an account')) {
        console.log('   📋 Selecting login option...');
        loginProcess.stdin.write('1\n');
        currentStep = 'option_selected';
      }
      
      // Handle 2FA if prompted
      if (text.includes('verification code') || text.includes('2FA') || text.includes('authenticator')) {
        console.log('   🔐 2FA required - please check your authenticator app');
        console.log('   ⏳ Waiting for 2FA input...');
        currentStep = 'waiting_2fa';
      }
      
      if (text.includes('Success') || text.includes('successfully') || text.includes('logged in')) {
        console.log('   ✅ Login successful!');
        currentStep = 'success';
      }
    });
    
    loginProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.log(`   ⚠️  ${text.trim()}`);
    });
    
    loginProcess.on('close', (code) => {
      console.log(`\n📊 Login process ended with code: ${code}`);
      
      if (code === 0 || currentStep === 'success') {
        console.log('✅ Login completed successfully');
        resolve(true);
      } else if (currentStep === 'waiting_2fa') {
        console.log('⏳ Login paused for 2FA - please complete manually');
        resolve('pending_2fa');
      } else {
        console.log('❌ Login failed');
        console.log('📋 Output:', output.substring(0, 500));
        console.log('📋 Errors:', errorOutput.substring(0, 500));
        resolve(false);
      }
    });
    
    // Timeout after 2 minutes
    setTimeout(() => {
      if (currentStep !== 'success') {
        console.log('⏱️  Login timeout - may need manual completion');
        loginProcess.kill();
        resolve('timeout');
      }
    }, 120000);
  });
}

async function verifyLogin() {
  console.log('\n🔍 Verifying login status...');
  
  try {
    // Set proper endpoint first
    execSync('appwrite client --endpoint "https://nyc.cloud.appwrite.io/v1" --project-id "college-football-fantasy-app"', {
      stdio: 'pipe'
    });
    
    const result = execSync('appwrite account get', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('email')) {
      const emailMatch = result.match(/"email":\s*"([^"]+)"/);
      console.log(`   ✅ Verified login as: ${emailMatch ? emailMatch[1] : 'user'}`);
      return true;
    }
    
  } catch (error) {
    console.log('   ❌ Login verification failed');
    console.log(`   Error: ${error.message.substring(0, 100)}`);
  }
  
  return false;
}

async function createWebhookWithUserSession() {
  console.log('\n📡 Creating webhook with user session...');
  
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
    ];
    
    const command = `appwrite projects create-webhook \
      --project-id "college-football-fantasy-app" \
      --name "Schema Drift Detection" \
      --url "https://cfbfantasy.app/api/webhooks/appwrite/schema-drift" \
      --events "${events.join(',')}" \
      --security true`;
    
    console.log('   🔧 Executing webhook creation...');
    
    const result = execSync(command, {
      encoding: 'utf8'
    });
    
    console.log('\n🎉 WEBHOOK CREATED SUCCESSFULLY!');
    console.log('\n📋 Result:');
    console.log(result);
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Webhook creation failed: ${error.message}`);
    
    if (error.message.includes('already exists')) {
      console.log('💡 Webhook already exists - that\'s okay!');
      return true;
    }
    
    return false;
  }
}

async function listAndVerifyWebhooks() {
  console.log('\n📋 Verifying webhook exists...');
  
  try {
    const result = execSync('appwrite projects list-webhooks --project-id "college-football-fantasy-app"', {
      encoding: 'utf8'
    });
    
    console.log('✅ Current webhooks:');
    console.log(result);
    
    if (result.includes('Schema Drift Detection')) {
      console.log('\n🎉 Schema Drift Detection webhook confirmed!');
      return true;
    }
    
  } catch (error) {
    console.log(`   ❌ Could not verify webhooks: ${error.message}`);
  }
  
  return false;
}

async function main() {
  console.log(`📂 Project: college-football-fantasy-app`);
  console.log(`📧 Email: ${CREDENTIALS.email}\n`);
  
  // Step 1: Get password
  const password = await promptForPassword();
  
  if (!password) {
    console.log('❌ Password required for automated login');
    return;
  }
  
  // Step 2: Clear existing sessions
  await clearExistingSessions();
  
  // Step 3: Perform automated login
  const loginResult = await performAutomatedLogin(CREDENTIALS.email, password);
  
  if (loginResult === true) {
    console.log('\n✅ Login completed automatically');
  } else if (loginResult === 'pending_2fa') {
    console.log('\n⏳ Please complete 2FA in your terminal, then I\'ll continue...');
    console.log('   After 2FA completion, run: node scripts/create-webhook-after-login.js');
    return;
  } else if (loginResult === 'timeout') {
    console.log('\n⏱️  Login process timed out - please complete manually');
    return;
  } else {
    console.log('\n❌ Automated login failed');
    return;
  }
  
  // Step 4: Verify login
  const isVerified = await verifyLogin();
  
  if (!isVerified) {
    console.log('\n❌ Login verification failed');
    return;
  }
  
  // Step 5: Create webhook
  const webhookCreated = await createWebhookWithUserSession();
  
  if (!webhookCreated) {
    console.log('\n❌ Webhook creation failed');
    return;
  }
  
  // Step 6: Verify webhook
  const webhookExists = await listAndVerifyWebhooks();
  
  if (webhookExists) {
    console.log('\n🎉 COMPLETE SUCCESS!');
    console.log('\n✅ Fully Automated Webhook System Active!');
    console.log('\n🧪 Test it now:');
    console.log('   1. Go to: https://cloud.appwrite.io/console/project-college-football-fantasy-app/database');
    console.log('   2. Pick any collection → Settings → Attributes');
    console.log('   3. Add test attribute → GitHub issue auto-created!');
    
  } else {
    console.log('\n⚠️  Webhook created but verification incomplete');
  }
}

if (require.main === module) {
  main().catch(console.error);
}