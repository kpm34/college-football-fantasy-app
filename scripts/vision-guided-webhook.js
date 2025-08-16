#!/usr/bin/env node

/**
 * Vision + CLI integrated webhook creation
 * Combines authenticated CLI session with browser automation
 */

const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
require('dotenv').config({ path: '.env.local' });

console.log('🔗 Vision-Guided Webhook Creation\n');

async function ensureCLIAuthenticated() {
  console.log('1️⃣ Ensuring CLI authentication...');
  
  try {
    // Check if already authenticated
    execSync('appwrite account get', { stdio: 'pipe' });
    console.log('   ✅ CLI already authenticated');
    return true;
  } catch (error) {
    console.log('   🔐 Running authentication...');
    
    try {
      execSync('./scripts/appwrite-login.expect', { stdio: 'inherit' });
      console.log('   ✅ CLI authentication successful');
      return true;
    } catch (authError) {
      console.log('   ❌ CLI authentication failed');
      return false;
    }
  }
}

async function launchBrowserWithSession() {
  console.log('\n2️⃣ Launching browser automation...');
  
  // Get CLI session cookie
  let sessionCookie = null;
  try {
    const sessionInfo = execSync('cat ~/.appwrite/cookie 2>/dev/null || echo ""', { 
      encoding: 'utf8' 
    });
    
    if (sessionInfo.trim()) {
      sessionCookie = sessionInfo.trim();
      console.log('   🍪 Found CLI session cookie');
    }
  } catch (error) {
    console.log('   ⚠️  No session cookie found, will login via browser');
  }
  
  const browser = await puppeteer.launch({
    headless: false,  // Show browser for debugging
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Set session cookie if available
  if (sessionCookie) {
    await page.setCookie({
      name: 'a_session_console',
      value: sessionCookie,
      domain: '.appwrite.io'
    });
  }
  
  return { browser, page };
}

async function navigateToWebhooks(page) {
  console.log('\n3️⃣ Navigating to webhooks page...');
  
  const webhookUrl = 'https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks';
  
  try {
    await page.goto(webhookUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('   ✅ Navigated to webhooks page');
    
    // Take screenshot for vision analysis
    const screenshot = await page.screenshot({
      path: '/tmp/appwrite-webhooks.png',
      fullPage: true
    });
    
    console.log('   📸 Screenshot saved for vision analysis');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Navigation failed: ${error.message}`);
    return false;
  }
}

async function createWebhookViaUI(page) {
  console.log('\n4️⃣ Creating webhook via UI automation...');
  
  try {
    // Look for "Create Webhook" button
    await page.waitForSelector('button, a, [role="button"]', { timeout: 10000 });
    
    // Find and click create webhook button
    const createButtons = await page.$$eval('button, a, [role="button"]', buttons => 
      buttons.map(btn => ({
        text: btn.textContent.trim().toLowerCase(),
        clickable: true
      }))
    );
    
    console.log('   🔍 Available buttons:', createButtons.map(b => b.text));
    
    // Click create webhook button
    const createWebhookSelector = 'button:has-text("Create"), button:has-text("webhook"), [data-testid*="create"]';
    
    try {
      await page.click(createWebhookSelector);
      console.log('   ✅ Clicked create webhook button');
    } catch (clickError) {
      // Fallback: try clicking any button with "create" text
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const createBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('create') ||
          btn.textContent.toLowerCase().includes('webhook') ||
          btn.textContent.toLowerCase().includes('add')
        );
        if (createBtn) createBtn.click();
      });
      console.log('   ✅ Used fallback method to click create button');
    }
    
    // Wait for form to appear
    await page.waitForTimeout(2000);
    
    // Fill webhook form
    await fillWebhookForm(page);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ UI automation failed: ${error.message}`);
    
    // Take screenshot of current state
    await page.screenshot({
      path: '/tmp/appwrite-error.png',
      fullPage: true
    });
    
    return false;
  }
}

async function fillWebhookForm(page) {
  console.log('   📝 Filling webhook form...');
  
  const webhookConfig = {
    name: 'Schema Drift Detection',
    url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
    events: [
      'databases.*.collections.*.create',
      'databases.*.collections.*.update',
      'databases.*.collections.*.delete',
      'databases.*.attributes.*.create',
      'databases.*.attributes.*.update',
      'databases.*.attributes.*.delete',
      'databases.*.indexes.*.create',
      'databases.*.indexes.*.update',
      'databases.*.indexes.*.delete'
    ],
    secret: process.env.APPWRITE_WEBHOOK_SECRET
  };
  
  try {
    // Fill name field
    const nameSelectors = ['input[name="name"]', 'input[placeholder*="name"]', '#name', '[data-testid*="name"]'];
    for (const selector of nameSelectors) {
      try {
        await page.type(selector, webhookConfig.name);
        console.log('   ✅ Filled name field');
        break;
      } catch (e) { continue; }
    }
    
    // Fill URL field
    const urlSelectors = ['input[name="url"]', 'input[placeholder*="url"]', '#url', '[data-testid*="url"]'];
    for (const selector of urlSelectors) {
      try {
        await page.type(selector, webhookConfig.url);
        console.log('   ✅ Filled URL field');
        break;
      } catch (e) { continue; }
    }
    
    // Select events (this will need manual intervention or more sophisticated automation)
    console.log('   ⚠️  Event selection may require manual intervention');
    
    // Add headers
    console.log('   🔑 Adding webhook secret header...');
    await addWebhookHeaders(page, webhookConfig.secret);
    
    // Take screenshot before submitting
    await page.screenshot({
      path: '/tmp/appwrite-form-filled.png',
      fullPage: true
    });
    
    console.log('   📸 Form filled - screenshot saved');
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Form filling failed: ${error.message}`);
    return false;
  }
}

async function addWebhookHeaders(page, secret) {
  try {
    // Look for headers section
    const headerInputs = await page.$$('input[placeholder*="header"], input[placeholder*="key"], input[placeholder*="value"]');
    
    if (headerInputs.length >= 2) {
      await headerInputs[0].type('X-Webhook-Secret');
      await headerInputs[1].type(secret);
      console.log('   ✅ Added webhook secret header');
    } else {
      console.log('   ⚠️  Could not find header inputs - may need manual entry');
    }
  } catch (error) {
    console.log('   ⚠️  Header automation failed - will need manual entry');
  }
}

async function verifyWebhookCreation() {
  console.log('\n5️⃣ Verifying webhook creation...');
  
  try {
    const result = execSync('appwrite projects list-webhooks --project-id "college-football-fantasy-app"', {
      encoding: 'utf8'
    });
    
    if (result.includes('Schema Drift Detection')) {
      console.log('   ✅ Webhook verified via CLI');
      return true;
    } else {
      console.log('   ⚠️  Webhook not yet visible via CLI');
      return false;
    }
  } catch (error) {
    console.log('   ⚠️  CLI verification failed');
    return false;
  }
}

async function main() {
  console.log('🎯 Integrated CLI + Vision Webhook Creation');
  console.log('📂 Project: college-football-fantasy-app\n');
  
  // Step 1: Ensure CLI authentication
  const cliAuth = await ensureCLIAuthenticated();
  if (!cliAuth) {
    console.log('❌ CLI authentication required');
    return;
  }
  
  // Step 2: Launch browser with session
  const { browser, page } = await launchBrowserWithSession();
  
  try {
    // Step 3: Navigate to webhooks
    const navigationSuccess = await navigateToWebhooks(page);
    if (!navigationSuccess) {
      console.log('❌ Navigation failed');
      await browser.close();
      return;
    }
    
    // Step 4: Create webhook via UI
    const creationSuccess = await createWebhookViaUI(page);
    
    // Keep browser open for manual intervention if needed
    if (!creationSuccess) {
      console.log('\n⚠️  Automated creation failed - browser left open for manual completion');
      console.log('📋 Manual steps:');
      console.log('   1. Click "Create Webhook" button');
      console.log('   2. Name: Schema Drift Detection');
      console.log('   3. URL: https://cfbfantasy.app/api/webhooks/appwrite/schema-drift');
      console.log('   4. Select all databases.* events');
      console.log(`   5. Header: X-Webhook-Secret = ${process.env.APPWRITE_WEBHOOK_SECRET}`);
      console.log('\n   Press Enter when done to verify...');
      
      // Wait for manual completion
      process.stdin.resume();
      await new Promise(resolve => process.stdin.on('data', resolve));
    }
    
    // Step 5: Verify creation
    const verified = await verifyWebhookCreation();
    
    if (verified) {
      console.log('\n🎉 SUCCESS! Webhook system fully operational!');
    } else {
      console.log('\n⚠️  Please verify webhook in browser');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}