#!/usr/bin/env node

/**
 * Claude Direct Commander - Real-time AI Communication
 * Automation communicates directly with Claude through console
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🤖💬 Claude Direct Commander - Real-time AI Communication\n');

class ClaudeDirectCommander {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/claude-direct';
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
    
    this.stepCounter = 0;
  }

  async takeScreenshot(name, description = '') {
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${filename}`);
    if (description) console.log(`📋 ${description}`);
    
    return filepath;
  }

  async getPageAnalysis() {
    try {
      return await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'))
          .map(btn => btn.textContent.trim())
          .filter(text => text && text.length < 50)
          .slice(0, 8);

        const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
          type: input.type,
          name: input.name || 'unnamed',
          placeholder: input.placeholder || 'no placeholder',
          visible: input.offsetParent !== null
        })).filter(input => input.visible).slice(0, 5);

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, .title'))
          .map(h => h.textContent.trim())
          .filter(text => text && text.length < 100)
          .slice(0, 3);

        return {
          url: window.location.href,
          title: document.title,
          buttons,
          inputs,
          headings,
          hasLoginForm: !!document.querySelector('input[type="password"]'),
          hasWebhookButton: buttons.some(btn => btn.toLowerCase().includes('webhook')),
          hasCreateButton: buttons.some(btn => btn.toLowerCase().includes('create')),
          currentOrg: Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent && el.textContent.includes('Kash'))?.textContent?.trim()
        };
      });
    } catch (error) {
      return { url: 'unknown', title: 'unknown', buttons: [], inputs: [], headings: [] };
    }
  }

  async askClaude(stepName, context) {
    this.stepCounter++;
    
    console.log(`\n🤖 AI STEP ${this.stepCounter}: ${stepName}`);
    console.log(`📍 Context: ${context}`);
    
    // Take screenshot
    const screenshot = await this.takeScreenshot(
      stepName.toLowerCase().replace(/\s+/g, '-'),
      `Step: ${stepName}`
    );
    
    // Get page analysis
    const analysis = await this.getPageAnalysis();
    
    console.log('\n📊 PAGE ANALYSIS:');
    console.log(`   🌐 URL: ${analysis.url}`);
    console.log(`   📄 Title: ${analysis.title}`);
    console.log(`   🏢 Organization: ${analysis.currentOrg || 'not detected'}`);
    console.log(`   🔘 Buttons: ${analysis.buttons.join(', ')}`);
    console.log(`   📝 Inputs: ${analysis.inputs.length} form fields`);
    console.log(`   📋 Headings: ${analysis.headings.join(', ')}`);
    console.log(`   🔐 Login form: ${analysis.hasLoginForm ? 'YES' : 'NO'}`);
    console.log(`   🪝 Webhook button: ${analysis.hasWebhookButton ? 'YES' : 'NO'}`);
    console.log(`   ➕ Create button: ${analysis.hasCreateButton ? 'YES' : 'NO'}`);
    
    console.log(`\n📸 Screenshot saved: ${path.basename(screenshot)}`);
    
    console.log('\n🧠 CLAUDE - PLEASE ANALYZE AND RESPOND:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Task: Create Appwrite webhook for schema drift detection`);
    console.log(`Current Step: ${stepName}`);
    console.log(`Context: ${context}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n💬 RESPONSE FORMAT - Type one of these commands:');
    console.log('   CLICK: <element description>');
    console.log('   TYPE: <field>|<text>');
    console.log('   NAVIGATE: <url>');
    console.log('   WAIT: <seconds>');
    console.log('   SUCCESS: <message>');
    console.log('   MANUAL: <instruction>');
    console.log('   CONTINUE: (proceed to next step)');
    
    return new Promise((resolve) => {
      this.rl.question('\n🎯 Claude, what should I do next? ', (answer) => {
        const command = answer.trim();
        console.log(`\n✅ Received command: ${command}`);
        resolve(command);
      });
    });
  }

  async executeCommand(command) {
    if (!command) {
      console.log('❌ No command provided');
      return false;
    }

    const [action, data] = command.split(':').map(s => s.trim());
    
    console.log(`⚡ Executing: ${action.toUpperCase()}`);
    if (data) console.log(`📋 Data: ${data}`);
    
    try {
      switch (action.toUpperCase()) {
        case 'CLICK':
          return await this.performClick(data);
          
        case 'TYPE':
          const [field, text] = data.split('|').map(s => s.trim());
          return await this.performType(field, text);
          
        case 'NAVIGATE':
          return await this.performNavigate(data);
          
        case 'WAIT':
          const seconds = parseInt(data) || 3;
          console.log(`⏳ Waiting ${seconds} seconds...`);
          await new Promise(resolve => setTimeout(resolve, seconds * 1000));
          return true;
          
        case 'SUCCESS':
          console.log(`🎉 SUCCESS: ${data}`);
          return 'success';
          
        case 'MANUAL':
          console.log(`👤 MANUAL STEP: ${data}`);
          console.log('⏸️ Pausing 10 seconds for manual action...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          return true;
          
        case 'CONTINUE':
          console.log('➡️ CONTINUING to next step...');
          return true;
          
        default:
          console.log(`❓ Unknown command: ${action}`);
          return false;
      }
    } catch (error) {
      console.log(`❌ Command failed: ${error.message}`);
      return false;
    }
  }

  async performClick(description) {
    try {
      const result = await this.page.evaluate((desc) => {
        const allClickable = Array.from(document.querySelectorAll('button, a, [role="button"], [onclick]'));
        const descLower = desc.toLowerCase();
        
        // Try exact matches first
        let target = allClickable.find(el => {
          const text = el.textContent.toLowerCase().trim();
          return text === descLower || 
                 text.includes('create webhook') ||
                 text.includes('sign in') ||
                 text.includes('login');
        });
        
        // Fuzzy matching
        if (!target) {
          target = allClickable.find(el => {
            const text = el.textContent.toLowerCase();
            return descLower.split(' ').some(word => text.includes(word));
          });
        }
        
        if (target) {
          target.click();
          return { 
            success: true, 
            clicked: target.textContent.trim(),
            type: target.tagName.toLowerCase()
          };
        }
        
        return { 
          success: false, 
          available: allClickable.map(el => el.textContent.trim()).slice(0, 8)
        };
      }, description);
      
      if (result.success) {
        console.log(`✅ Clicked: "${result.clicked}" (${result.type})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      } else {
        console.log(`❌ Could not find: "${description}"`);
        console.log(`📋 Available: ${result.available.join(', ')}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Click failed: ${error.message}`);
      return false;
    }
  }

  async performType(field, text) {
    try {
      let selector;
      
      // Smart field detection
      if (field.toLowerCase().includes('name')) {
        selector = 'input[name="name"], input[placeholder*="name"], #name';
      } else if (field.toLowerCase().includes('url')) {
        selector = 'input[name="url"], input[placeholder*="url"], #url, input[type="url"]';
      } else if (field.toLowerCase().includes('email')) {
        selector = 'input[type="email"], input[name="email"]';
      } else if (field.toLowerCase().includes('password')) {
        selector = 'input[type="password"], input[name="password"]';
      } else {
        // Try to use as direct selector
        selector = field;
      }
      
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      
      // Clear field
      await this.page.evaluate(sel => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, selector);
      
      await this.page.type(selector, text, { delay: 50 });
      console.log(`✅ Typed "${text}" in ${field} field`);
      return true;
      
    } catch (error) {
      console.log(`❌ Type failed: ${error.message}`);
      
      // Try fallback
      try {
        const fallbackSelector = 'input[type="text"]:visible, input:not([type]):visible';
        await this.page.click(fallbackSelector);
        await this.page.type(fallbackSelector, text);
        console.log(`✅ Used fallback selector for typing`);
        return true;
      } catch (e) {
        console.log(`❌ Fallback also failed`);
        return false;
      }
    }
  }

  async performNavigate(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      console.log(`✅ Navigated to: ${url}`);
      return true;
    } catch (error) {
      console.log(`❌ Navigation failed: ${error.message}`);
      return false;
    }
  }

  async init() {
    console.log('1️⃣ Initializing Direct Commander...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('✅ Browser ready for direct Claude communication');
    console.log(`📂 Screenshots will be saved to: ${this.screenshotDir}`);
  }

  async runWithClaude() {
    try {
      await this.init();
      
      console.log('\n🚀 Starting direct Claude-guided automation...');
      console.log('💬 Real-time communication between automation and Claude');
      
      // Navigate to Appwrite
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
      
      // Step-by-step with Claude guidance
      let result;
      
      result = await this.askClaude(
        'Initial Login Page',
        'Just loaded Appwrite console. Need to handle login or already logged in?'
      );
      let cmdResult = await this.executeCommand(result);
      
      if (cmdResult === 'success') return true;
      
      // Continue with more steps based on Claude's guidance
      let maxSteps = 15; // Prevent infinite loops
      let currentStep = 1;
      
      while (currentStep < maxSteps) {
        currentStep++;
        
        const stepName = `Dynamic Step ${currentStep}`;
        const context = 'Following Claude\'s previous command, what should happen next?';
        
        result = await this.askClaude(stepName, context);
        cmdResult = await this.executeCommand(result);
        
        if (cmdResult === 'success') {
          console.log('\n🎉 Task completed successfully!');
          break;
        }
        
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Final verification
      await this.askClaude(
        'Final Verification',
        'Please verify the webhook was created successfully'
      );
      
      return true;
      
    } catch (error) {
      console.log(`\n❌ Direct automation failed: ${error.message}`);
      await this.takeScreenshot('error-state');
      return false;
    } finally {
      console.log('\n📋 Session Summary:');
      console.log(`📸 Screenshots: ${this.screenshotDir}`);
      console.log('🌐 Browser left open for verification');
      this.rl.close();
    }
  }
}

async function main() {
  console.log('🎯 Claude Direct Commander');
  console.log('💡 This allows real-time communication between automation and Claude');
  console.log('🔄 No file waiting - direct console communication!\n');
  
  const commander = new ClaudeDirectCommander();
  const success = await commander.runWithClaude();
  
  console.log(success ? '\n✅ Direct automation completed!' : '\n⚠️ Check results');
  
  console.log('\n📖 How this works:');
  console.log('   1. 🤖 Automation takes screenshot + analyzes page');
  console.log('   2. 💬 Asks Claude directly in console for next command');
  console.log('   3. 🧠 Claude responds with specific action');
  console.log('   4. ⚡ Automation executes immediately');
  console.log('   5. 🔄 Repeats until webhook is created');
}

if (require.main === module) {
  main().catch(console.error);
}