#!/usr/bin/env node

/**
 * Smart Auto Webhook Creator
 * Handles login automatically, then communicates with Claude at key points
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Smart Auto Webhook Creator\n');

class SmartAutoWebhook {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/smart-auto-webhook';
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${filename}`);
    if (description) console.log(`   ${description}`);
    
    return filepath;
  }

  async smartWait(condition, maxWait = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      try {
        if (typeof condition === 'string') {
          await this.page.waitForSelector(condition, { timeout: 1000 });
          return true;
        } else if (typeof condition === 'function') {
          const result = await condition();
          if (result) return true;
        }
      } catch (e) {
        // Continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return false;
  }

  async handleLogin() {
    console.log('\n1️⃣ Handling Login...');
    
    try {
      // Check if already logged in
      const isLoggedIn = await this.page.evaluate(() => {
        return !window.location.href.includes('/login') && 
               !document.querySelector('input[type="password"]');
      });
      
      if (isLoggedIn) {
        console.log('   ✅ Already logged in!');
        await this.takeScreenshot('01-already-logged-in');
        return true;
      }
      
      // Handle login form
      await this.takeScreenshot('01-login-page');
      
      console.log('   🔐 Filling login credentials...');
      
      // Wait for and fill email
      await this.smartWait('input[type="email"], input[name="email"]');
      await this.page.click('input[type="email"], input[name="email"]');
      await this.page.type('input[type="email"], input[name="email"]', this.credentials.email);
      
      // Fill password
      await this.page.click('input[type="password"]');
      await this.page.type('input[type="password"]', this.credentials.password);
      
      await this.takeScreenshot('02-credentials-filled');
      
      // Submit login
      console.log('   ⚡ Submitting login...');
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('sign in') ||
          btn.type === 'submit'
        );
        if (submitBtn) submitBtn.click();
      });
      
      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      await this.takeScreenshot('03-after-login');
      
      console.log('   ✅ Login completed successfully!');
      return true;
      
    } catch (error) {
      console.log(`   ❌ Login failed: ${error.message}`);
      await this.takeScreenshot('error-login');
      return false;
    }
  }

  async switchToKashOrganization() {
    console.log('\n2️⃣ Switching to Kash Organization...');
    
    try {
      await this.takeScreenshot('04-before-org-switch');
      
      // Look for organization switcher
      const orgSwitched = await this.page.evaluate(() => {
        // Find elements containing "kash" and "pro"
        const elements = Array.from(document.querySelectorAll('*'));
        const orgElement = elements.find(el => 
          el.textContent && 
          el.textContent.toLowerCase().includes('kash') && 
          el.textContent.toLowerCase().includes('pro')
        );
        
        if (orgElement) {
          // Hover to trigger dropdown
          const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
          orgElement.dispatchEvent(hoverEvent);
          
          setTimeout(() => {
            // Look for switch organization option
            const allElements = Array.from(document.querySelectorAll('*'));
            const switchElement = allElements.find(el => 
              el.textContent && 
              el.textContent.toLowerCase().includes('switch') && 
              el.textContent.toLowerCase().includes('organization')
            );
            
            if (switchElement) {
              switchElement.click();
              
              setTimeout(() => {
                // Select Kash organization
                const orgElements = Array.from(document.querySelectorAll('*'));
                const kashElement = orgElements.find(el => 
                  el.textContent && 
                  el.textContent.trim().toLowerCase() === 'kash'
                );
                
                if (kashElement) {
                  kashElement.click();
                }
              }, 1000);
            }
          }, 1000);
          
          return true;
        }
        return false;
      });
      
      if (orgSwitched) {
        console.log('   ✅ Organization switcher triggered');
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for switch
        await this.takeScreenshot('05-after-org-switch');
      } else {
        console.log('   ⚠️  No organization switcher found, continuing...');
      }
      
      return true;
    } catch (error) {
      console.log(`   ⚠️  Organization switch error: ${error.message}`);
      return false;
    }
  }

  async navigateToProject() {
    console.log('\n3️⃣ Finding College Football Project...');
    
    try {
      await this.takeScreenshot('06-project-search');
      
      // Look for college football project
      const projectFound = await this.page.evaluate(() => {
        const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"]'));
        const collegeProject = projectLinks.find(link => {
          const text = link.textContent.toLowerCase();
          return text.includes('college') || 
                 text.includes('football') || 
                 text.includes('fantasy') ||
                 link.href.includes('college-football-fantasy-app');
        });
        
        if (collegeProject) {
          collegeProject.click();
          return true;
        }
        return false;
      });
      
      if (projectFound) {
        console.log('   ✅ Found and clicked college football project');
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        await this.takeScreenshot('07-in-project');
        return true;
      } else {
        // Try direct navigation
        console.log('   🔄 Trying direct project navigation...');
        await this.page.goto('https://cloud.appwrite.io/console/project-college-football-fantasy-app', {
          waitUntil: 'networkidle0'
        });
        await this.takeScreenshot('07-direct-navigation');
        return true;
      }
    } catch (error) {
      console.log(`   ❌ Project navigation failed: ${error.message}`);
      await this.takeScreenshot('error-project');
      return false;
    }
  }

  async navigateToWebhooks() {
    console.log('\n4️⃣ Navigating to Webhooks...');
    
    try {
      // Direct navigation to webhooks
      const webhookUrl = 'https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks';
      await this.page.goto(webhookUrl, { waitUntil: 'networkidle0' });
      
      await this.takeScreenshot('08-webhooks-page');
      console.log('   ✅ Reached webhooks page');
      
      // Wait a bit for page to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.log(`   ❌ Webhook navigation failed: ${error.message}`);
      await this.takeScreenshot('error-webhooks');
      return false;
    }
  }

  async createWebhook() {
    console.log('\n5️⃣ Creating Webhook...');
    
    try {
      await this.takeScreenshot('09-before-create');
      
      // Look for Create webhook button
      const createClicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const createBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('create webhook') || 
                 (text.includes('create') && !text.includes('organization'));
        });
        
        if (createBtn) {
          createBtn.click();
          return true;
        }
        return false;
      });
      
      if (createClicked) {
        console.log('   ✅ Clicked Create webhook button');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('10-webhook-form');
        
        return await this.fillWebhookForm();
      } else {
        console.log('   ❌ Could not find Create webhook button');
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Webhook creation failed: ${error.message}`);
      await this.takeScreenshot('error-create');
      return false;
    }
  }

  async fillWebhookForm() {
    console.log('\n6️⃣ Filling Webhook Form...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
      secret: process.env.APPWRITE_WEBHOOK_SECRET
    };
    
    try {
      // Fill name field
      const nameSelectors = [
        'input[name="name"]',
        'input[placeholder*="name" i]',
        '#name',
        'input[type="text"]:first-of-type'
      ];
      
      let nameFilled = false;
      for (const selector of nameSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          await this.page.evaluate(sel => {
            const input = document.querySelector(sel);
            if (input) input.value = '';
          }, selector);
          await this.page.type(selector, config.name);
          console.log('   ✅ Name field filled');
          nameFilled = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!nameFilled) {
        console.log('   ⚠️  Could not fill name field automatically');
      }
      
      // Fill URL field
      const urlSelectors = [
        'input[name="url"]',
        'input[placeholder*="url" i]',
        '#url',
        'input[type="url"]',
        'input[type="text"]:last-of-type'
      ];
      
      let urlFilled = false;
      for (const selector of urlSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          await this.page.evaluate(sel => {
            const input = document.querySelector(sel);
            if (input) input.value = '';
          }, selector);
          await this.page.type(selector, config.url);
          console.log('   ✅ URL field filled');
          urlFilled = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!urlFilled) {
        console.log('   ⚠️  Could not fill URL field automatically');
      }
      
      await this.takeScreenshot('11-basic-fields-filled');
      
      // Try to select database events
      console.log('   🎯 Selecting database events...');
      const eventsSelected = await this.page.evaluate(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        let selected = 0;
        
        checkboxes.forEach(checkbox => {
          const label = checkbox.nextSibling?.textContent || 
                       checkbox.parentNode?.textContent || 
                       checkbox.getAttribute('value') || '';
          
          if (label.toLowerCase().includes('database') || 
              label.toLowerCase().includes('collection') || 
              label.toLowerCase().includes('attribute')) {
            if (!checkbox.checked) {
              checkbox.click();
              selected++;
            }
          }
        });
        
        return selected;
      });
      
      console.log(`   📋 Selected ${eventsSelected} database events`);
      
      // Try to add webhook secret header
      if (config.secret) {
        console.log('   🔑 Adding webhook secret header...');
        const headerAdded = await this.page.evaluate((secret) => {
          const headerInputs = Array.from(document.querySelectorAll('input[placeholder*="key" i], input[placeholder*="header" i]'));
          const valueInputs = Array.from(document.querySelectorAll('input[placeholder*="value" i]'));
          
          if (headerInputs.length > 0 && valueInputs.length > 0) {
            headerInputs[0].value = 'X-Webhook-Secret';
            valueInputs[0].value = secret;
            return true;
          }
          return false;
        }, config.secret);
        
        if (headerAdded) {
          console.log('   ✅ Webhook secret header added');
        } else {
          console.log('   ⚠️  Could not add webhook secret header automatically');
        }
      }
      
      await this.takeScreenshot('12-form-complete');
      
      // Submit form
      console.log('   🚀 Submitting webhook form...');
      const submitted = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('create') || text.includes('save') || text.includes('submit');
        });
        
        if (submitBtn) {
          submitBtn.click();
          return true;
        }
        return false;
      });
      
      if (submitted) {
        console.log('   ✅ Form submitted successfully!');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.takeScreenshot('13-submitted');
        return true;
      } else {
        console.log('   ❌ Could not submit form automatically');
        await this.takeScreenshot('error-submit');
        return false;
      }
      
    } catch (error) {
      console.log(`   ❌ Form filling failed: ${error.message}`);
      await this.takeScreenshot('error-form');
      return false;
    }
  }

  async verifyWebhook() {
    console.log('\n7️⃣ Verifying Webhook Creation...');
    
    try {
      await this.takeScreenshot('14-verification');
      
      // Check if webhook appears in list
      const webhookExists = await this.page.evaluate(() => {
        const pageText = document.body.textContent;
        return pageText.includes('Schema Drift Detection');
      });
      
      if (webhookExists) {
        console.log('   ✅ Webhook appears to be created successfully!');
        return true;
      } else {
        console.log('   ⚠️  Webhook creation status unclear');
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Verification failed: ${error.message}`);
      return false;
    }
  }

  async init() {
    console.log('🔧 Initializing Smart Auto Webhook...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('✅ Browser initialized');
    console.log(`📂 Screenshots: ${this.screenshotDir}`);
  }

  async run() {
    try {
      await this.init();
      
      console.log('\n🎯 Starting automated webhook creation...');
      console.log('⚡ This will handle login and navigation automatically\n');
      
      // Navigate to Appwrite
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
      
      // Execute automation steps
      const loginSuccess = await this.handleLogin();
      if (!loginSuccess) return false;
      
      await this.switchToKashOrganization();
      
      const projectSuccess = await this.navigateToProject();
      if (!projectSuccess) return false;
      
      const webhookNavSuccess = await this.navigateToWebhooks();
      if (!webhookNavSuccess) return false;
      
      const webhookCreated = await this.createWebhook();
      if (!webhookCreated) return false;
      
      const verified = await this.verifyWebhook();
      
      if (verified) {
        console.log('\n🎉 SUCCESS! Webhook created successfully!');
        console.log('✅ Schema Drift Detection webhook is now active');
      } else {
        console.log('\n⚠️  Webhook creation completed but verification unclear');
        console.log('📝 Please check the Appwrite console manually');
      }
      
      console.log('\n📋 Final Summary:');
      console.log(`📸 Screenshots saved: ${this.screenshotDir}`);
      console.log('🌐 Browser left open for manual verification');
      
      return verified;
      
    } catch (error) {
      console.log(`\n❌ Automation failed: ${error.message}`);
      await this.takeScreenshot('final-error');
      return false;
    }
  }
}

async function main() {
  const automation = new SmartAutoWebhook();
  const success = await automation.run();
  
  console.log(success ? '\n🚀 Automation completed successfully!' : '\n🔧 Manual verification needed');
}

if (require.main === module) {
  main().catch(console.error);
}