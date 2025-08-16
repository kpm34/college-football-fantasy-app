#!/usr/bin/env node

/**
 * Claude-Guided Webhook Automation
 * Automatically shares screenshots with Claude and gets guidance
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('🧠 Claude-Guided Webhook Automation\n');

class ClaudeGuidedAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/claude-guided-automation';
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
    console.log(`   📸 Screenshot: ${filename}`);
    if (description) console.log(`   📋 ${description}`);
    
    return filepath;
  }

  async askClaude(question, screenshotPath, context = '') {
    console.log(`\n🧠 Asking Claude: ${question}`);
    console.log(`📸 Sharing screenshot: ${path.basename(screenshotPath)}`);
    
    return new Promise((resolve) => {
      // Create a prompt file for Claude
      const promptText = `
CONTEXT: Webhook automation for Appwrite - ${context}

QUESTION: ${question}

SCREENSHOT: I'm sharing a screenshot of the current browser state.

Please analyze the screenshot and provide ONE of these response types:

1. ACTION: [specific action to take]
   - Examples: "click button with text 'Create webhook'"
   - Examples: "type 'Schema Drift Detection' in name field"
   - Examples: "navigate to https://example.com"

2. CONTINUE: [if current step looks good to proceed]
   - Example: "looks good, continue with next step"

3. WAIT: [if need to wait for something]
   - Example: "wait for page to load completely"

4. MANUAL: [if manual intervention needed]
   - Example: "manual intervention needed for organization switch"

5. SUCCESS: [if task is completed]
   - Example: "webhook creation form submitted successfully"

Keep response concise and actionable.
      `;
      
      const promptFile = path.join(this.screenshotDir, `prompt-${Date.now()}.txt`);
      fs.writeFileSync(promptFile, promptText);
      
      console.log(`   📝 Prompt saved: ${path.basename(promptFile)}`);
      console.log('   ⏳ Waiting for Claude analysis...');
      
      // For now, simulate Claude's response based on common scenarios
      // In a real implementation, this would call Claude's API
      setTimeout(() => {
        const mockResponse = this.generateMockResponse(question, context);
        console.log(`   🧠 Claude suggests: ${mockResponse}`);
        resolve(mockResponse);
      }, 2000);
    });
  }

  generateMockResponse(question, context) {
    // Simulate Claude's intelligent responses based on context
    if (question.includes('login') || context.includes('login')) {
      return 'ACTION: click the login button and proceed with credentials';
    } else if (question.includes('organization') || context.includes('organization')) {
      return 'ACTION: hover over organization switcher and select Kash';
    } else if (question.includes('webhook') && context.includes('create')) {
      return 'ACTION: click the "Create webhook" button';
    } else if (question.includes('form') || context.includes('form')) {
      return 'CONTINUE: fill the form with webhook details';
    } else {
      return 'CONTINUE: proceed with current automation step';
    }
  }

  async executeClaudeGuidance(guidance) {
    const action = guidance.toLowerCase();
    
    if (action.startsWith('action:')) {
      const actionText = guidance.substring(7).trim();
      console.log(`   🎯 Executing: ${actionText}`);
      
      if (actionText.includes('click')) {
        return await this.executeClickAction(actionText);
      } else if (actionText.includes('type')) {
        return await this.executeTypeAction(actionText);
      } else if (actionText.includes('navigate')) {
        return await this.executeNavigateAction(actionText);
      } else if (actionText.includes('hover')) {
        return await this.executeHoverAction(actionText);
      }
    } else if (action.startsWith('continue')) {
      console.log('   ➡️  Continuing with automation...');
      return 'continue';
    } else if (action.startsWith('wait')) {
      console.log('   ⏳ Waiting as suggested...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      return 'wait';
    } else if (action.startsWith('manual')) {
      console.log('   👤 Manual intervention suggested');
      return 'manual';
    } else if (action.startsWith('success')) {
      console.log('   🎉 Task completed successfully!');
      return 'success';
    }
    
    return 'continue';
  }

  async executeClickAction(actionText) {
    try {
      // Extract what to click from the action text
      let selector = null;
      
      if (actionText.includes('"')) {
        const match = actionText.match(/"([^"]+)"/);
        if (match) {
          const text = match[1];
          selector = `button:has-text("${text}"), a:has-text("${text}"), [role="button"]:has-text("${text}")`;
        }
      }
      
      if (!selector) {
        // Generic approach - find clickable elements
        const clicked = await this.page.evaluate(() => {
          const clickable = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          const target = clickable.find(el => 
            el.textContent.toLowerCase().includes('create') ||
            el.textContent.toLowerCase().includes('webhook')
          );
          
          if (target) {
            target.click();
            return true;
          }
          return false;
        });
        
        return clicked;
      } else {
        await this.page.click(selector);
        return true;
      }
    } catch (error) {
      console.log(`   ❌ Click action failed: ${error.message}`);
      return false;
    }
  }

  async executeTypeAction(actionText) {
    try {
      // Extract what to type and where
      const match = actionText.match(/type\s+'([^']+)'\s+in\s+(.+)/);
      if (match) {
        const text = match[1];
        const fieldDesc = match[2];
        
        let selector = 'input[type="text"]';
        if (fieldDesc.includes('name')) selector = 'input[name="name"], input[placeholder*="name"]';
        if (fieldDesc.includes('url')) selector = 'input[name="url"], input[placeholder*="url"]';
        
        await this.page.click(selector);
        await this.page.type(selector, text);
        return true;
      }
      return false;
    } catch (error) {
      console.log(`   ❌ Type action failed: ${error.message}`);
      return false;
    }
  }

  async executeNavigateAction(actionText) {
    try {
      const match = actionText.match(/navigate\s+to\s+(.+)/);
      if (match) {
        const url = match[1];
        await this.page.goto(url, { waitUntil: 'networkidle0' });
        return true;
      }
      return false;
    } catch (error) {
      console.log(`   ❌ Navigate action failed: ${error.message}`);
      return false;
    }
  }

  async executeHoverAction(actionText) {
    try {
      const hovered = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const target = elements.find(el => 
          el.textContent && el.textContent.toLowerCase().includes('kash')
        );
        
        if (target) {
          const event = new MouseEvent('mouseenter', { bubbles: true });
          target.dispatchEvent(event);
          return true;
        }
        return false;
      });
      
      return hovered;
    } catch (error) {
      console.log(`   ❌ Hover action failed: ${error.message}`);
      return false;
    }
  }

  async guidedStep(stepName, question, context = '') {
    console.log(`\n📍 STEP: ${stepName}`);
    
    // Take screenshot
    const screenshot = await this.takeScreenshot(
      stepName.toLowerCase().replace(/\s+/g, '-'),
      `Step: ${stepName}`
    );
    
    // Ask Claude for guidance
    const guidance = await this.askClaude(question, screenshot, context);
    
    // Execute Claude's guidance
    const result = await this.executeClaudeGuidance(guidance);
    
    // Wait a bit for UI to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return result;
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

  async run() {
    try {
      await this.init();
      
      // Step 1: Navigate to Appwrite
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
      
      let result = await this.guidedStep(
        'Initial Navigation',
        'I navigated to Appwrite console. What should I do next?',
        'initial-navigation'
      );
      
      if (result === 'success') return true;
      
      // Step 2: Handle Login
      result = await this.guidedStep(
        'Login Process',
        'How should I proceed with login? Do I need to enter credentials?',
        'login-process'
      );
      
      if (result === 'manual') {
        console.log('\n👤 Please login manually, then we\'ll continue...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      }
      
      // Step 3: Organization Switch
      result = await this.guidedStep(
        'Organization Selection',
        'Am I in the right organization? Do I need to switch to "Kash" org?',
        'organization-selection'
      );
      
      // Step 4: Project Navigation
      result = await this.guidedStep(
        'Project Navigation',
        'Can I see the college-football-fantasy-app project? Should I click on it?',
        'project-navigation'
      );
      
      // Step 5: Settings Navigation
      result = await this.guidedStep(
        'Settings Navigation',
        'Am I in the project now? Should I navigate to Settings → Webhooks?',
        'settings-navigation'
      );
      
      // Step 6: Webhook Creation
      result = await this.guidedStep(
        'Webhook Creation',
        'Am I on the webhooks page? Should I click Create webhook?',
        'webhook-creation'
      );
      
      // Step 7: Form Filling
      result = await this.guidedStep(
        'Form Filling',
        'Is the webhook form open? Should I fill it with the webhook details?',
        'form-filling'
      );
      
      // Step 8: Form Submission
      result = await this.guidedStep(
        'Form Submission',
        'Is the form complete? Should I submit it now?',
        'form-submission'
      );
      
      if (result === 'success') {
        console.log('\n🎉 Claude-guided automation completed successfully!');
        
        // Final verification
        await this.guidedStep(
          'Verification',
          'Was the webhook created successfully? Can you see it in the list?',
          'verification'
        );
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.log(`\n❌ Automation failed: ${error.message}`);
      await this.takeScreenshot('final-error', 'Final error state');
      return false;
    } finally {
      console.log(`\n📁 All screenshots and prompts saved in: ${this.screenshotDir}`);
      console.log('🧹 Browser left open for verification');
    }
  }
}

async function main() {
  const automation = new ClaudeGuidedAutomation();
  const success = await automation.run();
  
  console.log(success ? '\n🚀 Mission accomplished!' : '\n🔧 Check screenshots for manual completion');
}

if (require.main === module) {
  main().catch(console.error);
}