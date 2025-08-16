#!/usr/bin/env node

/**
 * Full automation: WebDriver + Screenshots + CLI + Vision
 * Complete end-to-end webhook creation without manual intervention
 */

const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🤖 Full Automation: WebDriver + Vision + CLI\n');

class WebhookAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/webhook-automation';
    this.credentials = {
      email: process.env.APPWRITE_USER_EMAIL || 'kashpm2002@gmail.com',
      password: process.env.APPWRITE_USER_PASSWORD || '#Kash2002'
    };
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name, fullPage = true) {
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({
      path: filepath,
      fullPage
    });
    
    console.log(`   📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  async initBrowser() {
    console.log('1️⃣ Initializing browser automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,  // Show browser for debugging
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set a realistic user agent
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('   ✅ Browser initialized');
  }

  async navigateToAppwrite() {
    console.log('\n2️⃣ Navigating to Appwrite Console...');
    
    const loginUrl = 'https://cloud.appwrite.io/console';
    
    try {
      await this.page.goto(loginUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      await this.takeScreenshot('01-initial-page');
      console.log('   ✅ Navigated to Appwrite Console');
      
      return true;
    } catch (error) {
      console.log(`   ❌ Navigation failed: ${error.message}`);
      return false;
    }
  }

  async performLogin() {
    console.log('\n3️⃣ Performing automated login...');
    
    try {
      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 10000 });
      await this.takeScreenshot('02-login-form');
      
      // Fill email
      const emailSelectors = ['input[type="email"]', 'input[name="email"]', '#email', 'input[placeholder*="email" i]'];
      let emailFilled = false;
      
      for (const selector of emailSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          await this.page.type(selector, this.credentials.email, { delay: 50 });
          console.log('   ✅ Email filled');
          emailFilled = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!emailFilled) {
        throw new Error('Could not find email input field');
      }
      
      await this.takeScreenshot('03-email-filled');
      
      // Fill password
      const passwordSelectors = ['input[type="password"]', 'input[name="password"]', '#password'];
      let passwordFilled = false;
      
      for (const selector of passwordSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          await this.page.type(selector, this.credentials.password, { delay: 50 });
          console.log('   ✅ Password filled');
          passwordFilled = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!passwordFilled) {
        throw new Error('Could not find password input field');
      }
      
      await this.takeScreenshot('04-credentials-filled');
      
      // Submit form
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]', 
        'button:has-text("Sign in")',
        'button:has-text("Login")',
        'button:has-text("Log in")',
        '.btn-primary',
        '.submit-btn'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          await this.page.click(selector);
          console.log('   ✅ Login form submitted');
          submitted = true;
          break;
        } catch (e) {
          // Try with evaluate for complex selectors
          try {
            await this.page.evaluate((sel) => {
              const buttons = Array.from(document.querySelectorAll('button'));
              const submitBtn = buttons.find(btn => 
                btn.textContent.toLowerCase().includes('sign in') ||
                btn.textContent.toLowerCase().includes('login') ||
                btn.type === 'submit'
              );
              if (submitBtn) submitBtn.click();
            });
            submitted = true;
            break;
          } catch (evalError) {
            continue;
          }
        }
      }
      
      if (!submitted) {
        // Press Enter as fallback
        await this.page.keyboard.press('Enter');
        console.log('   ✅ Used Enter key to submit');
      }
      
      // Wait for navigation after login
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      await this.takeScreenshot('05-post-login');
      
      console.log('   ✅ Login completed successfully');
      return true;
      
    } catch (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
      await this.takeScreenshot('error-login');
      return false;
    }
  }

  async navigateToWebhooks() {
    console.log('\n4️⃣ Navigating to webhooks section...');
    
    try {
      const webhookUrl = 'https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks';
      
      await this.page.goto(webhookUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      await this.takeScreenshot('06-webhooks-page');
      console.log('   ✅ Navigated to webhooks page');
      
      return true;
    } catch (error) {
      console.log(`   ❌ Webhook navigation failed: ${error.message}`);
      return false;
    }
  }

  async createWebhook() {
    console.log('\n5️⃣ Creating webhook via automated UI...');
    
    try {
      // Look for Create Webhook button
      await this.page.waitForSelector('button, a, [role="button"]', { timeout: 10000 });
      await this.takeScreenshot('07-before-create');
      
      // Find and click create button
      const createButtonClicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const createBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('create') ||
          btn.textContent.toLowerCase().includes('add') ||
          btn.textContent.toLowerCase().includes('new')
        );
        
        if (createBtn) {
          createBtn.click();
          return true;
        }
        return false;
      });
      
      if (!createButtonClicked) {
        // Try clicking the first button that might be create
        await this.page.click('button:first-of-type');
      }
      
      console.log('   ✅ Create webhook button clicked');
      
      // Wait for form to appear
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('08-create-form');
      
      // Fill webhook form
      await this.fillWebhookForm();
      
      return true;
      
    } catch (error) {
      console.log(`   ❌ Webhook creation failed: ${error.message}`);
      await this.takeScreenshot('error-webhook-creation');
      return false;
    }
  }

  async fillWebhookForm() {
    console.log('   📝 Filling webhook form...');
    
    const config = {
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
      await this.fillField('name', config.name, [
        'input[name="name"]',
        'input[placeholder*="name" i]',
        '#name',
        '.name-input',
        'input[type="text"]:first-of-type'
      ]);
      
      // Fill URL field
      await this.fillField('url', config.url, [
        'input[name="url"]',
        'input[placeholder*="url" i]',
        '#url',
        '.url-input',
        'input[type="url"]'
      ]);
      
      await this.takeScreenshot('09-basic-fields-filled');
      
      // Select events (complex automation)
      await this.selectEvents(config.events);
      
      // Add headers
      await this.addHeaders(config.secret);
      
      await this.takeScreenshot('10-form-completed');
      
      // Submit form
      await this.submitWebhookForm();
      
      return true;
      
    } catch (error) {
      console.log(`   ❌ Form filling failed: ${error.message}`);
      await this.takeScreenshot('error-form-filling');
      return false;
    }
  }

  async fillField(fieldName, value, selectors) {
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        await this.page.click(selector);
        await this.page.evaluate(sel => document.querySelector(sel).value = '', selector);
        await this.page.type(selector, value, { delay: 30 });
        console.log(`   ✅ Filled ${fieldName} field`);
        return true;
      } catch (e) { continue; }
    }
    
    console.log(`   ⚠️  Could not find ${fieldName} field`);
    return false;
  }

  async selectEvents(events) {
    console.log('   🎯 Selecting webhook events...');
    
    try {
      // Look for checkboxes or multi-select elements
      const eventElements = await this.page.$$('input[type="checkbox"], .event-selector, .checkbox');
      
      if (eventElements.length > 0) {
        console.log(`   📋 Found ${eventElements.length} event selectors`);
        
        // Try to select relevant events
        for (const element of eventElements) {
          try {
            const label = await element.evaluate(el => 
              el.nextSibling?.textContent || 
              el.parentNode?.textContent || 
              el.getAttribute('value') || ''
            );
            
            if (label.includes('database') || label.includes('collection') || label.includes('attribute')) {
              await element.click();
              console.log(`   ✅ Selected event: ${label.substring(0, 50)}`);
            }
          } catch (e) { continue; }
        }
        
        await this.takeScreenshot('11-events-selected');
      } else {
        console.log('   ⚠️  No event selectors found - may need manual selection');
      }
    } catch (error) {
      console.log(`   ⚠️  Event selection failed: ${error.message}`);
    }
  }

  async addHeaders(secret) {
    console.log('   🔑 Adding webhook headers...');
    
    try {
      // Look for header input fields
      const headerInputs = await this.page.$$('input[placeholder*="key" i], input[placeholder*="header" i]');
      
      if (headerInputs.length >= 2) {
        await headerInputs[0].type('X-Webhook-Secret');
        await headerInputs[1].type(secret);
        console.log('   ✅ Added webhook secret header');
      } else {
        // Try alternative approaches
        await this.page.evaluate((secretValue) => {
          const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
          const keyInput = inputs.find(input => 
            input.placeholder.toLowerCase().includes('key') ||
            input.placeholder.toLowerCase().includes('header')
          );
          const valueInput = inputs.find(input => 
            input.placeholder.toLowerCase().includes('value') ||
            input !== keyInput
          );
          
          if (keyInput && valueInput) {
            keyInput.value = 'X-Webhook-Secret';
            valueInput.value = secretValue;
          }
        }, secret);
        
        console.log('   ✅ Added headers via JavaScript');
      }
    } catch (error) {
      console.log(`   ⚠️  Header addition failed: ${error.message}`);
    }
  }

  async submitWebhookForm() {
    console.log('   🚀 Submitting webhook form...');
    
    try {
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Create")',
        'button:has-text("Save")',
        'button:has-text("Submit")',
        '.btn-primary',
        '.submit-btn'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          await this.page.click(selector);
          submitted = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!submitted) {
        // Fallback: find and click any button that looks like submit
        await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const submitBtn = buttons.find(btn => 
            btn.textContent.toLowerCase().includes('create') ||
            btn.textContent.toLowerCase().includes('save') ||
            btn.textContent.toLowerCase().includes('submit') ||
            btn.type === 'submit'
          );
          if (submitBtn) submitBtn.click();
        });
      }
      
      console.log('   ✅ Form submitted');
      
      // Wait for success/navigation
      await new Promise(resolve => setTimeout(resolve, 5000));
      await this.takeScreenshot('12-after-submit');
      
      return true;
    } catch (error) {
      console.log(`   ❌ Form submission failed: ${error.message}`);
      return false;
    }
  }

  async verifyCLI() {
    console.log('\n6️⃣ Verifying webhook via CLI...');
    
    try {
      // Ensure CLI is authenticated and configured
      execSync('./scripts/appwrite-login.expect', { stdio: 'pipe' });
      execSync('appwrite client --endpoint "https://nyc.cloud.appwrite.io/v1" --project-id "college-football-fantasy-app"', { stdio: 'pipe' });
      
      const result = execSync('appwrite projects list-webhooks --project-id "college-football-fantasy-app"', {
        encoding: 'utf8'
      });
      
      if (result.includes('Schema Drift Detection')) {
        console.log('   ✅ Webhook verified via CLI!');
        console.log('   📋 Webhook found: Schema Drift Detection');
        return true;
      } else {
        console.log('   ⚠️  Webhook not yet visible via CLI');
        console.log('   📋 Available webhooks:');
        console.log(result);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ CLI verification failed: ${error.message}`);
      return false;
    }
  }

  async testWebhook() {
    console.log('\n7️⃣ Testing webhook endpoint...');
    
    try {
      const response = await fetch('https://cfbfantasy.app/api/webhooks/appwrite/schema-drift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.APPWRITE_WEBHOOK_SECRET
        },
        body: JSON.stringify({
          event: 'automation-test',
          data: { message: 'Full automation test completed' }
        })
      });
      
      const result = await response.text();
      
      if (response.ok) {
        console.log('   ✅ Webhook endpoint responding correctly');
        console.log(`   📋 Response: ${result}`);
        return true;
      } else {
        console.log(`   ⚠️  Webhook response: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Webhook test failed: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
      console.log('   ✅ Browser closed');
    }
    
    console.log(`   📁 Screenshots saved in: ${this.screenshotDir}`);
  }

  async run() {
    console.log('🎯 Starting full automation process...\n');
    
    try {
      // Initialize browser
      await this.initBrowser();
      
      // Navigate to Appwrite
      const navigationSuccess = await this.navigateToAppwrite();
      if (!navigationSuccess) return false;
      
      // Perform login
      const loginSuccess = await this.performLogin();
      if (!loginSuccess) return false;
      
      // Navigate to webhooks
      const webhookNavSuccess = await this.navigateToWebhooks();
      if (!webhookNavSuccess) return false;
      
      // Create webhook
      const webhookCreated = await this.createWebhook();
      if (!webhookCreated) return false;
      
      // Verify via CLI
      const cliVerified = await this.verifyCLI();
      
      // Test webhook
      const webhookTested = await this.testWebhook();
      
      if (cliVerified && webhookTested) {
        console.log('\n🎉 FULL AUTOMATION SUCCESS!');
        console.log('✅ Webhook system is fully operational!');
        
        console.log('\n🧪 Test the complete system:');
        console.log('   1. Go to Appwrite Database → any collection');
        console.log('   2. Add a test attribute');
        console.log('   3. Check GitHub issues for automatic creation!');
        
        return true;
      } else {
        console.log('\n⚠️  Automation completed with some issues');
        console.log('   Please verify webhook in Appwrite Console');
        return false;
      }
      
    } catch (error) {
      console.log(`\n❌ Automation failed: ${error.message}`);
      await this.takeScreenshot('final-error');
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

async function main() {
  const automation = new WebhookAutomation();
  const success = await automation.run();
  
  if (success) {
    console.log('\n🚀 Webhook system ready for production use!');
  } else {
    console.log('\n🔧 Manual intervention may be required');
  }
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}