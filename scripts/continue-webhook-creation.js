#!/usr/bin/env node

/**
 * Continue webhook creation from current state
 * Uses screenshot analysis to guide the automation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🔄 Continuing Webhook Creation from Current State\n');

class WebhookContinuation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/smart-webhook-automation';
  }

  async takeScreenshot(name, waitTime = 2000) {
    await new Promise(resolve => setTimeout(resolve, waitTime));
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`   📸 ${name} (waited ${waitTime}ms)`);
    return filepath;
  }

  async connectToExistingBrowser() {
    console.log('1️⃣ Connecting to existing browser session...');
    
    // Get WebSocket URL from running Chrome
    try {
      const response = await fetch('http://localhost:9222/json');
      const targets = await response.json();
      const appwriteTarget = targets.find(target => 
        target.url.includes('appwrite.io') && target.type === 'page'
      );
      
      if (appwriteTarget) {
        this.browser = await puppeteer.connect({
          browserWSEndpoint: appwriteTarget.webSocketDebuggerUrl
        });
        
        const pages = await this.browser.pages();
        this.page = pages.find(page => page.url().includes('appwrite.io'));
        
        if (this.page) {
          console.log('   ✅ Connected to existing Appwrite session');
          await this.takeScreenshot('00-current-state');
          return true;
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not connect to existing browser, starting new one');
    }
    
    return false;
  }

  async startNewBrowser() {
    console.log('1️⃣ Starting fresh browser session...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--remote-debugging-port=9222']
    });
    
    this.page = await this.browser.newPage();
    console.log('   ✅ New browser ready');
    
    // Navigate directly to webhooks page
    await this.page.goto('https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks', {
      waitUntil: 'networkidle0'
    });
    
    await this.takeScreenshot('00-webhooks-page');
    return true;
  }

  async createWebhookFromCurrentState() {
    console.log('\n2️⃣ Creating webhook from current state...');
    
    await this.takeScreenshot('01-before-action');
    
    // First, close any open modals
    const modalClosed = await this.page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
      const closeBtn = closeButtons.find(btn => 
        btn.textContent.includes('×') || 
        btn.textContent.toLowerCase().includes('close') ||
        btn.textContent.toLowerCase().includes('cancel')
      );
      
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
      return false;
    });
    
    if (modalClosed) {
      console.log('   ✅ Closed modal');
      await this.takeScreenshot('02-modal-closed');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Now look for Create webhook button
    const webhookButtonFound = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const webhookBtn = buttons.find(btn => {
        const text = btn.textContent.toLowerCase();
        return text.includes('create webhook');
      });
      
      if (webhookBtn) {
        webhookBtn.click();
        return true;
      }
      return false;
    });
    
    if (webhookButtonFound) {
      console.log('   ✅ Found and clicked Create webhook button');
      await this.takeScreenshot('03-webhook-form');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Fill the webhook form
      await this.fillWebhookForm();
      return true;
    }
    
    console.log('   ❌ Could not find Create webhook button');
    await this.takeScreenshot('error-no-button');
    return false;
  }

  async fillWebhookForm() {
    console.log('   📝 Filling webhook form...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
      secret: process.env.APPWRITE_WEBHOOK_SECRET
    };
    
    try {
      // Fill name field
      await this.page.waitForSelector('input[name="name"], input[placeholder*="name"], #name', { timeout: 5000 });
      
      const nameSelectors = ['input[name="name"]', 'input[placeholder*="name"]', '#name', 'input[type="text"]'];
      for (const selector of nameSelectors) {
        try {
          await this.page.click(selector);
          await this.page.evaluate(sel => document.querySelector(sel).value = '', selector);
          await this.page.type(selector, config.name);
          console.log('   ✅ Name filled');
          break;
        } catch (e) { continue; }
      }
      
      await this.takeScreenshot('04-name-filled');
      
      // Fill URL field
      const urlSelectors = ['input[name="url"]', 'input[placeholder*="url"]', '#url', 'input[type="url"]'];
      for (const selector of urlSelectors) {
        try {
          await this.page.click(selector);
          await this.page.evaluate(sel => document.querySelector(sel).value = '', selector);
          await this.page.type(selector, config.url);
          console.log('   ✅ URL filled');
          break;
        } catch (e) { continue; }
      }
      
      await this.takeScreenshot('05-basic-fields-filled');
      
      // Select database events
      console.log('   🎯 Selecting database events...');
      const eventsSelected = await this.selectDatabaseEvents();
      
      if (eventsSelected) {
        await this.takeScreenshot('06-events-selected');
      }
      
      // Add headers
      console.log('   🔑 Adding webhook headers...');
      await this.addWebhookHeaders(config.secret);
      
      await this.takeScreenshot('07-form-complete');
      
      // Submit form
      const submitted = await this.submitForm();
      
      if (submitted) {
        await this.takeScreenshot('08-submitted');
        console.log('   ✅ Webhook form submitted successfully!');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.log(`   ❌ Form filling failed: ${error.message}`);
      await this.takeScreenshot('error-form-filling');
      return false;
    }
  }

  async selectDatabaseEvents() {
    try {
      const selected = await this.page.evaluate(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        let selectedCount = 0;
        
        checkboxes.forEach(checkbox => {
          const label = checkbox.nextSibling?.textContent || 
                       checkbox.parentNode?.textContent || 
                       checkbox.getAttribute('value') || '';
          
          if (label.toLowerCase().includes('database') || 
              label.toLowerCase().includes('collection') || 
              label.toLowerCase().includes('attribute')) {
            if (!checkbox.checked) {
              checkbox.click();
              selectedCount++;
            }
          }
        });
        
        return selectedCount;
      });
      
      console.log(`   ✅ Selected ${selected} database events`);
      return selected > 0;
    } catch (error) {
      console.log(`   ⚠️  Event selection failed: ${error.message}`);
      return false;
    }
  }

  async addWebhookHeaders(secret) {
    try {
      // Look for header key/value inputs
      const headerInputs = await this.page.$$('input[placeholder*="key"], input[placeholder*="header"], input[placeholder*="name"]');
      
      if (headerInputs.length >= 2) {
        await headerInputs[0].type('X-Webhook-Secret');
        
        // Find corresponding value input
        const valueInputs = await this.page.$$('input[placeholder*="value"]');
        if (valueInputs.length > 0) {
          await valueInputs[0].type(secret);
          console.log('   ✅ Added webhook secret header');
          return true;
        }
      }
      
      console.log('   ⚠️  Could not find header inputs');
      return false;
    } catch (error) {
      console.log(`   ⚠️  Header addition failed: ${error.message}`);
      return false;
    }
  }

  async submitForm() {
    try {
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
        await new Promise(resolve => setTimeout(resolve, 5000));
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(`   ❌ Form submission failed: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    console.log('\n🧹 Keeping browser open for verification...');
    console.log(`📁 Screenshots saved in: ${this.screenshotDir}`);
  }

  async run() {
    try {
      // Try to connect to existing browser first
      let connected = await this.connectToExistingBrowser();
      
      if (!connected) {
        connected = await this.startNewBrowser();
      }
      
      if (!connected) {
        throw new Error('Could not establish browser connection');
      }
      
      const success = await this.createWebhookFromCurrentState();
      
      if (success) {
        console.log('\n🎉 Webhook creation completed successfully!');
      } else {
        console.log('\n⚠️  Webhook creation needs manual intervention');
      }
      
      await this.cleanup();
      return success;
      
    } catch (error) {
      console.log(`\n❌ Automation failed: ${error.message}`);
      await this.takeScreenshot('final-error');
      return false;
    }
  }
}

async function main() {
  const continuation = new WebhookContinuation();
  const success = await continuation.run();
  
  console.log(success ? '\n🚀 Ready!' : '\n🔧 Check browser for manual steps needed');
  // Don't exit - keep process alive to maintain browser connection
}

if (require.main === module) {
  main().catch(console.error);
}