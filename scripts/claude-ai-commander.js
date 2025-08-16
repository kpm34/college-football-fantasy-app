#!/usr/bin/env node

/**
 * Claude AI Commander - Full AI-to-AI Communication
 * Claude analyzes screenshots and gives direct commands to the automation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🤖➡️🧠 Claude AI Commander - Full AI Communication\n');

class ClaudeAICommander {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/claude-commander';
    this.commandDir = '/tmp/claude-commands';
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    // Create directories
    [this.screenshotDir, this.commandDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    this.stepCounter = 0;
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

  async createClaudeCommandRequest(stepName, screenshotPath, context) {
    this.stepCounter++;
    const timestamp = Date.now();
    
    // Get current page info
    const pageInfo = await this.getPageInfo();
    
    // Create command request file for Claude
    const commandRequest = {
      step: this.stepCounter,
      stepName,
      timestamp,
      context,
      screenshot: screenshotPath,
      pageInfo,
      task: "Create Appwrite webhook for schema drift detection",
      instructions: `
# CLAUDE COMMAND REQUEST ${this.stepCounter}

## Current Task
Creating Appwrite webhook for schema drift detection in college-football-fantasy-app project

## Step: ${stepName}
Context: ${context}

## Screenshot Analysis Required
Screenshot saved at: ${screenshotPath}
Please analyze this screenshot to understand the current UI state.

## Page Information
- URL: ${pageInfo.url}
- Title: ${pageInfo.title}
- Visible buttons: ${pageInfo.buttons.join(', ')}
- Form inputs: ${pageInfo.inputs.length} inputs found
- Current organization: ${pageInfo.organization || 'unknown'}

## Command Format Required
Please respond with EXACTLY ONE command in this format:

**COMMAND_CLICK:** <element_description>
- Example: COMMAND_CLICK: Create webhook button
- Example: COMMAND_CLICK: button containing "Sign in"

**COMMAND_TYPE:** <field_selector>|<text_to_type>
- Example: COMMAND_TYPE: input[name="name"]|Schema Drift Detection
- Example: COMMAND_TYPE: input[placeholder*="url"]|https://cfbfantasy.app/api/webhooks/appwrite/schema-drift

**COMMAND_NAVIGATE:** <url>
- Example: COMMAND_NAVIGATE: https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks

**COMMAND_HOVER:** <element_description>
- Example: COMMAND_HOVER: organization switcher
- Example: COMMAND_HOVER: Kash Pro dropdown

**COMMAND_WAIT:** <seconds>
- Example: COMMAND_WAIT: 3

**COMMAND_SUCCESS:** <success_message>
- Example: COMMAND_SUCCESS: Webhook created successfully

**COMMAND_MANUAL:** <instruction_for_human>
- Example: COMMAND_MANUAL: Please login manually then continue

## Webhook Configuration Details
When filling the form, use these values:
- Name: Schema Drift Detection  
- URL: https://cfbfantasy.app/api/webhooks/appwrite/schema-drift
- Events: Select all database-related events (collections, attributes, indexes)
- Headers: X-Webhook-Secret = ${process.env.APPWRITE_WEBHOOK_SECRET || '[SECRET_FROM_ENV]'}

## Important Notes
- We need to be in the "Kash" organization
- Project name is "college-football-fantasy-app"
- Final goal is Settings → Webhooks → Create webhook form → Submit

Please analyze the screenshot and provide the next command.
      `,
      responseFile: path.join(this.commandDir, `claude-response-${this.stepCounter}-${timestamp}.txt`)
    };
    
    // Save the request
    const requestFile = path.join(this.commandDir, `claude-request-${this.stepCounter}-${timestamp}.json`);
    fs.writeFileSync(requestFile, JSON.stringify(commandRequest, null, 2));
    
    // Save the markdown instruction
    const instructionFile = path.join(this.commandDir, `claude-instruction-${this.stepCounter}-${timestamp}.md`);
    fs.writeFileSync(instructionFile, commandRequest.instructions);
    
    console.log(`   📤 Command request created: ${path.basename(requestFile)}`);
    console.log(`   📝 Instructions for Claude: ${path.basename(instructionFile)}`);
    
    return { requestFile, instructionFile, responseFile: commandRequest.responseFile };
  }

  async getPageInfo() {
    try {
      return await this.page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          buttons: Array.from(document.querySelectorAll('button, [role="button"], a')).map(btn => 
            btn.textContent.trim()).filter(text => text && text.length < 50).slice(0, 10),
          inputs: Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            name: input.name,
            placeholder: input.placeholder,
            id: input.id
          })),
          organization: document.querySelector('[data-org], .org-name, .organization')?.textContent?.trim() || 
                       Array.from(document.querySelectorAll('*')).find(el => 
                         el.textContent && el.textContent.includes('Kash'))?.textContent?.trim()
        };
      });
    } catch (error) {
      return {
        url: 'unknown',
        title: 'unknown', 
        buttons: [],
        inputs: [],
        organization: 'unknown'
      };
    }
  }

  async waitForClaudeResponse(responseFile, timeoutSeconds = 60) {
    console.log(`   ⏳ Waiting for Claude's command (timeout: ${timeoutSeconds}s)...`);
    console.log(`   📄 Response expected in: ${path.basename(responseFile)}`);
    console.log('\n   💡 MANUAL STEP: Share the screenshot and instruction file with Claude Code');
    console.log(`   📸 Screenshot: ${this.screenshotDir}`);
    console.log(`   📝 Instructions: ${this.commandDir}`);
    console.log('\n   🔄 Checking for response file...');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutSeconds * 1000) {
      if (fs.existsSync(responseFile)) {
        const response = fs.readFileSync(responseFile, 'utf8').trim();
        if (response) {
          console.log(`   ✅ Claude responded: ${response}`);
          return response;
        }
      }
      
      // Show waiting indicator
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n   ⏰ Timeout waiting for Claude response');
    return null;
  }

  async executeClaudeCommand(command) {
    if (!command) {
      console.log('   ❌ No command received');
      return false;
    }
    
    const [commandType, commandData] = command.split(':').map(s => s.trim());
    
    console.log(`   🎯 Executing Claude's command: ${commandType}`);
    console.log(`   📋 Command data: ${commandData}`);
    
    try {
      switch (commandType.toUpperCase()) {
        case 'COMMAND_CLICK':
          return await this.executeClick(commandData);
          
        case 'COMMAND_TYPE':
          const [selector, text] = commandData.split('|').map(s => s.trim());
          return await this.executeType(selector, text);
          
        case 'COMMAND_NAVIGATE':
          return await this.executeNavigate(commandData);
          
        case 'COMMAND_HOVER':
          return await this.executeHover(commandData);
          
        case 'COMMAND_WAIT':
          const seconds = parseInt(commandData) || 3;
          console.log(`   ⏳ Waiting ${seconds} seconds...`);
          await new Promise(resolve => setTimeout(resolve, seconds * 1000));
          return true;
          
        case 'COMMAND_SUCCESS':
          console.log(`   🎉 Success: ${commandData}`);
          return 'success';
          
        case 'COMMAND_MANUAL':
          console.log(`   👤 Manual intervention required: ${commandData}`);
          console.log('   ⏸️  Pausing for 10 seconds for manual action...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          return true;
          
        default:
          console.log(`   ❓ Unknown command type: ${commandType}`);
          return false;
      }
    } catch (error) {
      console.log(`   ❌ Command execution failed: ${error.message}`);
      return false;
    }
  }

  async executeClick(elementDescription) {
    try {
      const result = await this.page.evaluate((desc) => {
        const allElements = Array.from(document.querySelectorAll('button, a, [role="button"], [onclick]'));
        const descLower = desc.toLowerCase();
        
        const target = allElements.find(el => {
          const text = el.textContent.toLowerCase();
          return text.includes('create webhook') ||
                 text.includes('create') ||
                 text.includes('sign in') ||
                 text.includes('login') ||
                 text.includes('submit') ||
                 text.includes('save') ||
                 text.includes(descLower.replace(/button|containing/g, '').trim());
        });
        
        if (target) {
          target.click();
          return { success: true, element: target.textContent.trim() };
        }
        
        return { success: false, available: allElements.map(el => el.textContent.trim()).slice(0, 5) };
      }, elementDescription);
      
      if (result.success) {
        console.log(`   ✅ Clicked: ${result.element}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for response
        return true;
      } else {
        console.log(`   ❌ Element not found: ${elementDescription}`);
        console.log(`   📋 Available elements: ${result.available.join(', ')}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Click execution failed: ${error.message}`);
      return false;
    }
  }

  async executeType(selector, text) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      
      // Clear field first
      await this.page.evaluate(sel => {
        const input = document.querySelector(sel);
        if (input) input.value = '';
      }, selector);
      
      await this.page.type(selector, text, { delay: 50 });
      console.log(`   ✅ Typed "${text}" into ${selector}`);
      return true;
    } catch (error) {
      console.log(`   ❌ Type execution failed: ${error.message}`);
      
      // Try alternative selectors
      const alternatives = [
        'input[type="text"]',
        'input[name="name"]',
        'input[name="url"]',
        'input[placeholder*="name"]',
        'input[placeholder*="url"]'
      ];
      
      for (const altSelector of alternatives) {
        try {
          await this.page.click(altSelector);
          await this.page.type(altSelector, text);
          console.log(`   ✅ Used alternative selector: ${altSelector}`);
          return true;
        } catch (e) {
          continue;
        }
      }
      
      return false;
    }
  }

  async executeNavigate(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      console.log(`   ✅ Navigated to: ${url}`);
      return true;
    } catch (error) {
      console.log(`   ❌ Navigation failed: ${error.message}`);
      return false;
    }
  }

  async executeHover(elementDescription) {
    try {
      const result = await this.page.evaluate((desc) => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const descLower = desc.toLowerCase();
        
        const target = allElements.find(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('kash') ||
                 text.includes('organization') ||
                 text.includes(descLower);
        });
        
        if (target) {
          const event = new MouseEvent('mouseenter', { bubbles: true });
          target.dispatchEvent(event);
          return { success: true, element: target.textContent.trim() };
        }
        
        return { success: false };
      }, elementDescription);
      
      if (result.success) {
        console.log(`   ✅ Hovered: ${result.element}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      } else {
        console.log(`   ❌ Hover target not found: ${elementDescription}`);
        return false;
      }
    } catch (error) {
      console.log(`   ❌ Hover execution failed: ${error.message}`);
      return false;
    }
  }

  async aiGuidedStep(stepName, context) {
    console.log(`\n🤖 AI STEP ${this.stepCounter + 1}: ${stepName}`);
    
    // Take screenshot
    const screenshot = await this.takeScreenshot(
      stepName.toLowerCase().replace(/\s+/g, '-'),
      `AI Step: ${stepName}`
    );
    
    // Create command request for Claude
    const { requestFile, instructionFile, responseFile } = await this.createClaudeCommandRequest(
      stepName,
      screenshot,
      context
    );
    
    // Wait for Claude's response
    const command = await this.waitForClaudeResponse(responseFile, 90);
    
    if (!command) {
      console.log('   ⏭️  No command received, continuing with default action...');
      return true;
    }
    
    // Execute Claude's command
    const result = await this.executeClaudeCommand(command);
    
    // Small delay for UI to settle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return result;
  }

  async init() {
    console.log('1️⃣ Initializing Claude AI Commander...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--remote-debugging-port=9222']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('   ✅ Browser and AI communication ready');
    console.log(`   📂 Screenshots: ${this.screenshotDir}`);
    console.log(`   📂 Commands: ${this.commandDir}`);
  }

  async run() {
    try {
      await this.init();
      
      console.log('\n🚀 Starting AI-guided webhook automation...');
      console.log('🤖 Automation will pause at each step for Claude\'s analysis and commands');
      
      // Navigate to Appwrite
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
      
      // AI-guided steps
      let result;
      
      result = await this.aiGuidedStep(
        'Initial Login',
        'Navigate to Appwrite console and handle login process'
      );
      
      result = await this.aiGuidedStep(
        'Organization Switch',
        'Switch to Kash organization if needed'
      );
      
      result = await this.aiGuidedStep(
        'Project Selection',
        'Find and select college-football-fantasy-app project'
      );
      
      result = await this.aiGuidedStep(
        'Settings Navigation',
        'Navigate to project Settings and then Webhooks section'
      );
      
      result = await this.aiGuidedStep(
        'Webhook Creation',
        'Click Create webhook button to open the form'
      );
      
      result = await this.aiGuidedStep(
        'Form Name Field',
        'Fill webhook name field with "Schema Drift Detection"'
      );
      
      result = await this.aiGuidedStep(
        'Form URL Field', 
        'Fill webhook URL field with the endpoint URL'
      );
      
      result = await this.aiGuidedStep(
        'Event Selection',
        'Select appropriate database events for schema drift detection'
      );
      
      result = await this.aiGuidedStep(
        'Headers Configuration',
        'Add X-Webhook-Secret header with the secret value'
      );
      
      result = await this.aiGuidedStep(
        'Form Submission',
        'Submit the completed webhook form'
      );
      
      result = await this.aiGuidedStep(
        'Success Verification',
        'Verify webhook was created successfully and appears in the list'
      );
      
      if (result === 'success') {
        console.log('\n🎉 AI-guided automation completed successfully!');
        return true;
      }
      
      console.log('\n✅ Automation completed - check final results');
      return true;
      
    } catch (error) {
      console.log(`\n❌ AI automation failed: ${error.message}`);
      await this.takeScreenshot('ai-error', `Error: ${error.message}`);
      return false;
    } finally {
      console.log('\n📋 AI Automation Summary:');
      console.log(`   📸 Screenshots: ${this.screenshotDir}`);
      console.log(`   💬 Claude commands: ${this.commandDir}`);
      console.log('   🌐 Browser left open for verification');
    }
  }
}

async function main() {
  console.log('🎯 Starting Claude AI Commander for Webhook Automation');
  console.log('🤖🧠 This creates full AI-to-AI communication for automation\n');
  
  const commander = new ClaudeAICommander();
  const success = await commander.run();
  
  console.log('\n📖 How this AI-to-AI system works:');
  console.log('   1. 🤖 Automation takes screenshots at each step');
  console.log('   2. 📤 Creates command requests for Claude with context');
  console.log('   3. 🧠 Claude analyzes screenshots and provides commands');
  console.log('   4. ⚡ Automation executes Claude\'s commands automatically');
  console.log('   5. 🔄 Process repeats until task is complete');
  
  console.log(success ? '\n🚀 AI automation system ready!' : '\n🔧 Check logs for completion status');
}

if (require.main === module) {
  main().catch(console.error);
}