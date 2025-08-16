#!/usr/bin/env node

/**
 * Interactive Webhook Automation with Claude Communication
 * Can pause at any step for human guidance and screenshot analysis
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🤖 Interactive Webhook Automation with Claude Communication\n');

class InteractiveWebhookAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/interactive-webhook-automation';
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`   📸 Screenshot: ${filename}`);
    if (description) console.log(`   📋 ${description}`);
    
    return filepath;
  }

  async pauseForGuidance(stepName, question = '') {
    console.log(`\n⏸️  PAUSED AT: ${stepName}`);
    if (question) console.log(`❓ ${question}`);
    
    console.log('\n📸 Taking current screenshot for Claude analysis...');
    const screenshot = await this.takeScreenshot(`pause-${stepName.toLowerCase().replace(/\s+/g, '-')}`);
    
    console.log('\n🔍 Current screenshot saved. Share this with Claude for guidance:');
    console.log(`   File: ${screenshot}`);
    
    console.log('\n📝 Available commands:');
    console.log('   • "continue" - proceed with automation');
    console.log('   • "screenshot" - take another screenshot');
    console.log('   • "inspect" - show current page info');
    console.log('   • "click [selector]" - click an element');
    console.log('   • "type [selector] [text]" - type text');
    console.log('   • "navigate [url]" - go to URL');
    console.log('   • "evaluate [code]" - run JavaScript');
    console.log('   • "quit" - exit automation');
    
    return new Promise((resolve) => {
      const askForCommand = () => {
        this.rl.question('\n🎯 Enter command (or "continue"): ', async (answer) => {
          const cmd = answer.trim().toLowerCase();
          
          if (cmd === 'continue') {
            resolve('continue');
          } else if (cmd === 'screenshot') {
            await this.takeScreenshot(`manual-${Date.now()}`, 'Manual screenshot requested');
            askForCommand();
          } else if (cmd === 'inspect') {
            await this.inspectCurrentPage();
            askForCommand();
          } else if (cmd.startsWith('click ')) {
            const selector = cmd.substring(6);
            await this.manualClick(selector);
            askForCommand();
          } else if (cmd.startsWith('type ')) {
            const parts = cmd.substring(5).split(' ');
            const selector = parts[0];
            const text = parts.slice(1).join(' ');
            await this.manualType(selector, text);
            askForCommand();
          } else if (cmd.startsWith('navigate ')) {
            const url = cmd.substring(9);
            await this.page.goto(url, { waitUntil: 'networkidle0' });
            console.log(`   ✅ Navigated to ${url}`);
            await this.takeScreenshot('after-navigation');
            askForCommand();
          } else if (cmd.startsWith('evaluate ')) {
            const code = cmd.substring(9);
            try {
              const result = await this.page.evaluate(code);
              console.log(`   ✅ Result: ${JSON.stringify(result)}`);
            } catch (error) {
              console.log(`   ❌ Error: ${error.message}`);
            }
            askForCommand();
          } else if (cmd === 'quit') {
            resolve('quit');
          } else {
            console.log('   ❌ Unknown command');
            askForCommand();
          }
        });
      };
      
      askForCommand();
    });
  }

  async inspectCurrentPage() {
    try {
      const info = await this.page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          buttons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent.trim()).filter(text => text),
          inputs: Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            name: input.name,
            placeholder: input.placeholder,
            id: input.id
          })),
          links: Array.from(document.querySelectorAll('a')).slice(0, 10).map(link => ({
            text: link.textContent.trim(),
            href: link.href
          }))
        };
      });
      
      console.log('\n📋 Current Page Info:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Title: ${info.title}`);
      console.log(`   Buttons: ${info.buttons.join(', ')}`);
      console.log(`   Inputs: ${info.inputs.length} found`);
      console.log(`   Links: ${info.links.length} found (showing first 10)`);
      
    } catch (error) {
      console.log(`   ❌ Inspection failed: ${error.message}`);
    }
  }

  async manualClick(selector) {
    try {
      await this.page.click(selector);
      console.log(`   ✅ Clicked ${selector}`);
      await this.takeScreenshot('after-manual-click');
    } catch (error) {
      console.log(`   ❌ Click failed: ${error.message}`);
    }
  }

  async manualType(selector, text) {
    try {
      await this.page.click(selector);
      await this.page.type(selector, text);
      console.log(`   ✅ Typed "${text}" in ${selector}`);
      await this.takeScreenshot('after-manual-type');
    } catch (error) {
      console.log(`   ❌ Type failed: ${error.message}`);
    }
  }

  async init() {
    console.log('1️⃣ Initializing browser...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--remote-debugging-port=9222']
    });
    
    this.page = await this.browser.newPage();
    console.log('   ✅ Browser ready');
  }

  async navigateAndLogin() {
    console.log('\n2️⃣ Navigating to Appwrite and logging in...');
    
    await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
    await this.takeScreenshot('01-appwrite-console', 'Initial Appwrite console page');
    
    const guidance = await this.pauseForGuidance(
      'Login Page',
      'Do you see the login form? Should we proceed with automated login or need manual intervention?'
    );
    
    if (guidance === 'quit') return false;
    
    // Attempt automated login
    try {
      await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await this.page.type('input[type="email"]', this.credentials.email);
      await this.page.type('input[type="password"]', this.credentials.password);
      
      await this.takeScreenshot('02-credentials-entered', 'Login credentials entered');
      
      // Submit form
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('sign in') ||
          btn.type === 'submit'
        );
        if (submitBtn) submitBtn.click();
      });
      
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      await this.takeScreenshot('03-after-login', 'After login attempt');
      
      console.log('   ✅ Login attempt completed');
      
    } catch (error) {
      console.log(`   ⚠️  Automated login failed: ${error.message}`);
      const guidance2 = await this.pauseForGuidance(
        'Login Failed',
        'Automated login failed. Please login manually, then type "continue"'
      );
      
      if (guidance2 === 'quit') return false;
    }
    
    return true;
  }

  async navigateToWebhooks() {
    console.log('\n3️⃣ Navigating to webhooks...');
    
    await this.takeScreenshot('04-current-state', 'Current state before webhook navigation');
    
    const guidance = await this.pauseForGuidance(
      'Organization and Project Selection',
      'Are we in the correct organization (Kash) and can you see the college football project?'
    );
    
    if (guidance === 'quit') return false;
    
    // Try direct navigation to webhooks
    try {
      await this.page.goto('https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks', {
        waitUntil: 'networkidle0'
      });
      
      await this.takeScreenshot('05-webhooks-page', 'Direct navigation to webhooks page');
      console.log('   ✅ Direct navigation to webhooks successful');
      
    } catch (error) {
      console.log(`   ⚠️  Direct navigation failed: ${error.message}`);
      
      const guidance2 = await this.pauseForGuidance(
        'Navigation Failed',
        'Direct navigation to webhooks failed. Please navigate manually to Settings → Webhooks, then type "continue"'
      );
      
      if (guidance2 === 'quit') return false;
    }
    
    return true;
  }

  async createWebhook() {
    console.log('\n4️⃣ Creating webhook...');
    
    await this.takeScreenshot('06-webhook-page', 'Webhook page before creation');
    
    const guidance = await this.pauseForGuidance(
      'Webhook Creation',
      'Can you see the "Create webhook" button? Should we click it or need different approach?'
    );
    
    if (guidance === 'quit') return false;
    
    // Try to find and click Create webhook button
    try {
      const createButtonFound = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const createBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('create webhook')
        );
        
        if (createBtn) {
          createBtn.click();
          return true;
        }
        return false;
      });
      
      if (createButtonFound) {
        console.log('   ✅ Found and clicked Create webhook button');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('07-webhook-form', 'Webhook creation form');
        
        return await this.fillWebhookForm();
      } else {
        const guidance2 = await this.pauseForGuidance(
          'Create Button Not Found',
          'Could not find Create webhook button. Please click it manually, then type "continue"'
        );
        
        if (guidance2 === 'quit') return false;
        return await this.fillWebhookForm();
      }
      
    } catch (error) {
      console.log(`   ❌ Webhook creation failed: ${error.message}`);
      return false;
    }
  }

  async fillWebhookForm() {
    console.log('\n5️⃣ Filling webhook form...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
      secret: process.env.APPWRITE_WEBHOOK_SECRET
    };
    
    await this.takeScreenshot('08-form-start', 'Webhook form ready to fill');
    
    const guidance = await this.pauseForGuidance(
      'Form Filling',
      'Can you see the webhook form with name and URL fields? Should we proceed with automated filling?'
    );
    
    if (guidance === 'quit') return false;
    
    try {
      // Fill name field
      const nameSelectors = ['input[name="name"]', 'input[placeholder*="name"]', '#name', 'input[type="text"]'];
      let nameFilled = false;
      
      for (const selector of nameSelectors) {
        try {
          await this.page.click(selector);
          await this.page.evaluate(sel => document.querySelector(sel).value = '', selector);
          await this.page.type(selector, config.name);
          console.log('   ✅ Name filled');
          nameFilled = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!nameFilled) {
        const guidance2 = await this.pauseForGuidance(
          'Name Field',
          'Could not fill name field automatically. Please fill it manually with "Schema Drift Detection"'
        );
        if (guidance2 === 'quit') return false;
      }
      
      // Fill URL field
      const urlSelectors = ['input[name="url"]', 'input[placeholder*="url"]', '#url', 'input[type="url"]'];
      let urlFilled = false;
      
      for (const selector of urlSelectors) {
        try {
          await this.page.click(selector);
          await this.page.evaluate(sel => document.querySelector(sel).value = '', selector);
          await this.page.type(selector, config.url);
          console.log('   ✅ URL filled');
          urlFilled = true;
          break;
        } catch (e) { continue; }
      }
      
      if (!urlFilled) {
        const guidance3 = await this.pauseForGuidance(
          'URL Field',
          `Could not fill URL field automatically. Please fill it manually with "${config.url}"`
        );
        if (guidance3 === 'quit') return false;
      }
      
      await this.takeScreenshot('09-basic-fields', 'Basic fields filled');
      
      // Event selection and headers
      const guidance4 = await this.pauseForGuidance(
        'Events and Headers',
        'Please select database events and add header "X-Webhook-Secret" with the webhook secret. When ready, type "continue"'
      );
      
      if (guidance4 === 'quit') return false;
      
      // Submit form
      const guidance5 = await this.pauseForGuidance(
        'Form Submission',
        'Form should be complete. Should we submit it now?'
      );
      
      if (guidance5 === 'quit') return false;
      
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
        console.log('   ✅ Form submitted');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.takeScreenshot('10-submitted', 'Form submitted');
        return true;
      } else {
        const guidance6 = await this.pauseForGuidance(
          'Submission',
          'Could not submit automatically. Please click the submit button manually'
        );
        return guidance6 !== 'quit';
      }
      
    } catch (error) {
      console.log(`   ❌ Form filling error: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    console.log(`📁 Screenshots saved in: ${this.screenshotDir}`);
    this.rl.close();
  }

  async run() {
    try {
      await this.init();
      
      const loginSuccess = await this.navigateAndLogin();
      if (!loginSuccess) return false;
      
      const webhookNavSuccess = await this.navigateToWebhooks();
      if (!webhookNavSuccess) return false;
      
      const webhookCreated = await this.createWebhook();
      
      if (webhookCreated) {
        console.log('\n🎉 Webhook creation completed successfully!');
        
        const finalGuidance = await this.pauseForGuidance(
          'Verification',
          'Please verify the webhook was created correctly. Check Appwrite console and test if needed.'
        );
        
        return finalGuidance !== 'quit';
      } else {
        console.log('\n⚠️  Webhook creation incomplete');
        return false;
      }
      
    } catch (error) {
      console.log(`\n❌ Automation failed: ${error.message}`);
      await this.takeScreenshot('final-error', 'Final error state');
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

async function main() {
  const automation = new InteractiveWebhookAutomation();
  const success = await automation.run();
  
  console.log(success ? '\n🚀 Automation completed!' : '\n🔧 Automation ended');
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}