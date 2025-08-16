#!/usr/bin/env node

/**
 * Sense-Ask-Execute Automation Loop
 * 1. Sense page -> 2. Ask for instructions -> 3. Execute exactly -> 4. Repeat
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🔄 Sense-Ask-Execute Automation Loop\n');

class SenseAskExecute {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/sense-ask-execute';
    this.stepCounter = 0;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name) {
    const timestamp = Date.now();
    const filename = `${timestamp}-step-${this.stepCounter}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${filename}`);
    
    return filepath;
  }

  async sensePage() {
    console.log(`\n🔍 STEP ${this.stepCounter}: SENSING PAGE...`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const pageData = await this.page.evaluate(() => {
        const url = window.location.href;
        const title = document.title;
        
        // Get all visible buttons
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'))
          .filter(btn => btn.offsetParent !== null) // Only visible elements
          .map(btn => btn.textContent.trim())
          .filter(text => text && text.length < 100);
        
        // Get all form inputs
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'))
          .filter(input => input.offsetParent !== null)
          .map(input => ({
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || 'unnamed',
            placeholder: input.placeholder || '',
            id: input.id || '',
            value: input.value || ''
          }));
        
        // Get important text content
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, .title, .heading'))
          .filter(h => h.offsetParent !== null)
          .map(h => h.textContent.trim())
          .filter(text => text && text.length < 200);
        
        // Get links
        const links = Array.from(document.querySelectorAll('a[href]'))
          .filter(link => link.offsetParent !== null && link.textContent.trim())
          .map(link => ({
            text: link.textContent.trim(),
            href: link.href
          }))
          .slice(0, 10);
        
        // Detect page type
        let pageType = 'unknown';
        if (url.includes('/login')) pageType = 'login';
        else if (url.includes('/console') && !url.includes('/project')) pageType = 'console-home';
        else if (url.includes('/project-') && url.includes('/settings/webhooks')) pageType = 'webhooks';
        else if (url.includes('/project-')) pageType = 'project';
        else if (url.includes('/console')) pageType = 'console';
        
        // Check for errors
        const hasError = document.body.textContent.includes('404') || 
                         document.body.textContent.includes('error') ||
                         document.body.textContent.includes('not found');
        
        return {
          url,
          title,
          pageType,
          hasError,
          buttons: buttons.slice(0, 15),
          inputs,
          headings: headings.slice(0, 8),
          links,
          totalButtons: buttons.length,
          totalInputs: inputs.length
        };
      });
      
      // Take screenshot
      await this.takeScreenshot('sensed');
      
      // Display sensing results
      console.log('📊 PAGE SENSING RESULTS:');
      console.log(`   🌐 URL: ${pageData.url}`);
      console.log(`   📄 Title: ${pageData.title}`);
      console.log(`   🏷️  Page Type: ${pageData.pageType.toUpperCase()}`);
      console.log(`   ❌ Has Error: ${pageData.hasError ? 'YES' : 'NO'}`);
      console.log(`   📋 Headings: ${pageData.headings.join(' | ')}`);
      console.log(`   🔘 Buttons (${pageData.totalButtons} total):`);
      pageData.buttons.forEach((btn, i) => console.log(`      ${i+1}. "${btn}"`));
      console.log(`   📝 Inputs (${pageData.totalInputs} total):`);
      pageData.inputs.forEach((input, i) => console.log(`      ${i+1}. ${input.type} - ${input.name} - "${input.placeholder}"`));
      console.log(`   🔗 Links: ${pageData.links.map(l => l.text).join(', ')}`);
      
      return pageData;
      
    } catch (error) {
      console.log(`❌ Page sensing failed: ${error.message}`);
      return null;
    }
  }

  async askForInstructions(pageData) {
    console.log('\n💭 ASK FOR INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('🎯 GOAL: Create Appwrite webhook for schema drift detection');
    console.log('📍 CURRENT STATE: Page sensed and analyzed');
    console.log('🤖 AWAITING YOUR EXACT INSTRUCTIONS...');
    
    console.log('\n📝 INSTRUCTION FORMATS:');
    console.log('   CLICK: <button text or number>');
    console.log('   TYPE: <field name/number>|<text to type>');
    console.log('   NAVIGATE: <url>');
    console.log('   WAIT: <seconds>');
    console.log('   SUCCESS: (task completed)');
    console.log('   SENSE: (re-analyze current page)');
    
    return new Promise((resolve) => {
      this.rl.question('\n🎯 What should I do next? ', (answer) => {
        const instruction = answer.trim();
        console.log(`\n✅ INSTRUCTION RECEIVED: "${instruction}"`);
        resolve(instruction);
      });
    });
  }

  async executeInstruction(instruction) {
    console.log('\n⚡ EXECUTING INSTRUCTION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Instruction: "${instruction}"`);
    
    const [command, data] = instruction.split(':').map(s => s.trim());
    
    try {
      switch (command.toUpperCase()) {
        case 'CLICK':
          return await this.executeClick(data);
          
        case 'TYPE':
          const [field, text] = data.split('|').map(s => s.trim());
          return await this.executeType(field, text);
          
        case 'NAVIGATE':
          return await this.executeNavigate(data);
          
        case 'WAIT':
          const seconds = parseInt(data) || 3;
          console.log(`⏳ Waiting ${seconds} seconds...`);
          await new Promise(resolve => setTimeout(resolve, seconds * 1000));
          console.log('✅ Wait completed');
          return { success: true, action: 'waited' };
          
        case 'SUCCESS':
          console.log('🎉 TASK MARKED AS COMPLETED!');
          return { success: true, action: 'completed', completed: true };
          
        case 'SENSE':
          console.log('🔄 Re-sensing requested');
          return { success: true, action: 'sense-again' };
          
        default:
          console.log(`❓ Unknown command: ${command}`);
          console.log('📝 Please use: CLICK, TYPE, NAVIGATE, WAIT, SUCCESS, or SENSE');
          return { success: false, action: 'unknown-command' };
      }
    } catch (error) {
      console.log(`❌ Execution failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async executeClick(target) {
    console.log(`🖱️  CLICK TARGET: "${target}"`);
    
    const result = await this.page.evaluate((target) => {
      const allClickable = Array.from(document.querySelectorAll('button, a, [role="button"], [onclick]'))
        .filter(el => el.offsetParent !== null);
      
      let elementToClick = null;
      
      // Strategy 1: Exact text match
      elementToClick = allClickable.find(el => 
        el.textContent.trim() === target
      );
      
      // Strategy 2: Contains text
      if (!elementToClick) {
        elementToClick = allClickable.find(el => 
          el.textContent.toLowerCase().includes(target.toLowerCase())
        );
      }
      
      // Strategy 3: By number (if target is a number)
      if (!elementToClick && /^\d+$/.test(target)) {
        const index = parseInt(target) - 1;
        elementToClick = allClickable[index];
      }
      
      if (elementToClick) {
        elementToClick.click();
        return {
          success: true,
          clicked: elementToClick.textContent.trim(),
          tagName: elementToClick.tagName.toLowerCase()
        };
      }
      
      return {
        success: false,
        available: allClickable.map(el => el.textContent.trim()).slice(0, 10)
      };
    }, target);
    
    if (result.success) {
      console.log(`✅ CLICKED: "${result.clicked}" (${result.tagName})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for response
      await this.takeScreenshot('after-click');
      return { success: true, action: 'clicked', target: result.clicked };
    } else {
      console.log(`❌ CLICK FAILED: Could not find "${target}"`);
      console.log(`📋 Available clickable elements: ${result.available.join(', ')}`);
      return { success: false, action: 'click-failed', available: result.available };
    }
  }

  async executeType(field, text) {
    console.log(`⌨️  TYPE TARGET: "${field}" -> "${text}"`);
    
    const result = await this.page.evaluate((field, text) => {
      const allInputs = Array.from(document.querySelectorAll('input, textarea, select'))
        .filter(el => el.offsetParent !== null);
      
      let inputToType = null;
      
      // Strategy 1: By name
      inputToType = allInputs.find(input => input.name === field);
      
      // Strategy 2: By placeholder
      if (!inputToType) {
        inputToType = allInputs.find(input => 
          input.placeholder && input.placeholder.toLowerCase().includes(field.toLowerCase())
        );
      }
      
      // Strategy 3: By id
      if (!inputToType) {
        inputToType = allInputs.find(input => input.id === field);
      }
      
      // Strategy 4: By number
      if (!inputToType && /^\d+$/.test(field)) {
        const index = parseInt(field) - 1;
        inputToType = allInputs[index];
      }
      
      // Strategy 5: Smart detection
      if (!inputToType) {
        if (field.toLowerCase().includes('name')) {
          inputToType = allInputs.find(input => 
            input.name?.includes('name') || 
            input.placeholder?.toLowerCase().includes('name') ||
            input.id?.includes('name')
          );
        } else if (field.toLowerCase().includes('url')) {
          inputToType = allInputs.find(input => 
            input.type === 'url' ||
            input.name?.includes('url') || 
            input.placeholder?.toLowerCase().includes('url')
          );
        } else if (field.toLowerCase().includes('email')) {
          inputToType = allInputs.find(input => input.type === 'email');
        } else if (field.toLowerCase().includes('password')) {
          inputToType = allInputs.find(input => input.type === 'password');
        }
      }
      
      if (inputToType) {
        inputToType.value = text;
        inputToType.dispatchEvent(new Event('input', { bubbles: true }));
        inputToType.dispatchEvent(new Event('change', { bubbles: true }));
        
        return {
          success: true,
          field: inputToType.name || inputToType.placeholder || inputToType.id || 'unnamed',
          type: inputToType.type || inputToType.tagName.toLowerCase()
        };
      }
      
      return {
        success: false,
        available: allInputs.map(input => ({
          name: input.name || 'unnamed',
          placeholder: input.placeholder || '',
          type: input.type || input.tagName.toLowerCase(),
          id: input.id || ''
        }))
      };
    }, field, text);
    
    if (result.success) {
      console.log(`✅ TYPED: "${text}" into ${result.field} (${result.type})`);
      await this.takeScreenshot('after-type');
      return { success: true, action: 'typed', field: result.field, text };
    } else {
      console.log(`❌ TYPE FAILED: Could not find field "${field}"`);
      console.log('📋 Available fields:');
      result.available.forEach((field, i) => 
        console.log(`   ${i+1}. ${field.type} - ${field.name} - "${field.placeholder}"`)
      );
      return { success: false, action: 'type-failed', available: result.available };
    }
  }

  async executeNavigate(url) {
    console.log(`🧭 NAVIGATE TO: ${url}`);
    
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      console.log('✅ NAVIGATION COMPLETED');
      await this.takeScreenshot('after-navigate');
      return { success: true, action: 'navigated', url };
    } catch (error) {
      console.log(`❌ NAVIGATION FAILED: ${error.message}`);
      return { success: false, action: 'navigation-failed', error: error.message };
    }
  }

  async runLoop() {
    console.log('🔄 STARTING SENSE-ASK-EXECUTE LOOP');
    console.log('🎯 Goal: Create Appwrite webhook for schema drift detection\n');
    
    let maxSteps = 50; // Prevent infinite loops
    
    while (this.stepCounter < maxSteps) {
      this.stepCounter++;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔄 LOOP ITERATION ${this.stepCounter}`);
      console.log(`${'='.repeat(80)}`);
      
      // STEP 1: SENSE
      const pageData = await this.sensePage();
      if (!pageData) {
        console.log('❌ Sensing failed, breaking loop');
        break;
      }
      
      // STEP 2: ASK
      const instruction = await this.askForInstructions(pageData);
      if (!instruction) {
        console.log('❌ No instruction received, breaking loop');
        break;
      }
      
      // STEP 3: EXECUTE
      const result = await this.executeInstruction(instruction);
      
      // Check if task is completed
      if (result.completed) {
        console.log('\n🎉 TASK COMPLETED SUCCESSFULLY!');
        break;
      }
      
      // Small delay before next iteration
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (this.stepCounter >= maxSteps) {
      console.log('\n⏰ Maximum steps reached, ending loop');
    }
    
    console.log(`\n📊 LOOP SUMMARY:`);
    console.log(`   🔢 Total Steps: ${this.stepCounter}`);
    console.log(`   📸 Screenshots: ${this.screenshotDir}`);
    console.log('   🌐 Browser left open for verification');
  }

  async init() {
    console.log('🔧 Initializing Sense-Ask-Execute automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('✅ Ready for sense-ask-execute loop');
    console.log(`📂 Screenshots will be saved to: ${this.screenshotDir}`);
  }

  async cleanup() {
    this.rl.close();
    console.log('\n🧹 Cleanup completed');
  }

  async run() {
    try {
      await this.init();
      
      // Start at Appwrite console
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'domcontentloaded' });
      
      // Run the sense-ask-execute loop
      await this.runLoop();
      
    } catch (error) {
      console.log(`\n❌ Loop error: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }
}

async function main() {
  console.log('🎯 Sense-Ask-Execute Automation');
  console.log('📋 This will sense the page, ask for instructions, and execute exactly as told');
  console.log('🔄 The loop continues until you mark the task as complete\n');
  
  const automation = new SenseAskExecute();
  await automation.run();
}

if (require.main === module) {
  main().catch(console.error);
}