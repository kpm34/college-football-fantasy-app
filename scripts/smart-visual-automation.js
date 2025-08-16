#!/usr/bin/env node

/**
 * Smart Visual Automation - Takes before/after screenshots to verify actions
 * Uses visual comparison to determine if tasks actually worked
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('👁️ Smart Visual Automation with Before/After Verification\n');

class SmartVisualAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/smart-visual-automation';
    this.stepCounter = 0;
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name, description = '') {
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-step-${this.stepCounter}-${name}.png`;
      const filepath = path.join(this.screenshotDir, filename);
      
      await this.page.screenshot({ path: filepath, fullPage: true });
      console.log(`📸 ${filename}`);
      if (description) console.log(`   💭 ${description}`);
      
      return { filepath, filename };
    } catch (error) {
      console.log(`❌ Screenshot failed: ${error.message}`);
      return null;
    }
  }

  async getPageState() {
    try {
      return await this.page.evaluate(() => {
        const url = window.location.href;
        const title = document.title || 'No title';
        
        // Get all visible interactive elements
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], a[href]'))
          .filter(btn => btn.offsetParent !== null && btn.textContent.trim())
          .map(btn => btn.textContent.trim())
          .slice(0, 15);
        
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'))
          .filter(input => input.offsetParent !== null)
          .map(input => ({
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || 'unnamed',
            placeholder: input.placeholder || '',
            value: input.value || '',
            hasValue: !!input.value
          }));
        
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, .title, .heading'))
          .filter(h => h.offsetParent !== null && h.textContent.trim())
          .map(h => h.textContent.trim())
          .slice(0, 8);
        
        // Page state indicators
        const bodyText = document.body.textContent.toLowerCase();
        const hasError = bodyText.includes('404') || bodyText.includes('not found') || bodyText.includes('error');
        const hasLogin = bodyText.includes('sign in') || bodyText.includes('login');
        const hasWebhookContent = bodyText.includes('webhook');
        const hasCreateButton = buttons.some(b => b.toLowerCase().includes('create'));
        const hasSubmitButton = buttons.some(b => b.toLowerCase().includes('submit') || b.toLowerCase().includes('save'));
        
        // Determine page type
        let pageType = 'unknown';
        if (url.includes('/login')) pageType = 'login';
        else if (hasError) pageType = 'error';
        else if (url.includes('/webhooks')) pageType = 'webhooks';
        else if (url.includes('/project-')) pageType = 'project';
        else if (url.includes('/console')) pageType = 'console';
        
        return {
          url,
          title,
          pageType,
          hasError,
          hasLogin,
          hasWebhookContent,
          hasCreateButton,
          hasSubmitButton,
          buttons,
          inputs,
          headings,
          totalElements: buttons.length + inputs.length + headings.length
        };
      });
    } catch (error) {
      console.log(`❌ Failed to get page state: ${error.message}`);
      return { url: 'unknown', pageType: 'error', hasError: true };
    }
  }

  async compareStates(beforeState, afterState, actionDescription) {
    console.log('\n🔍 VISUAL VERIFICATION:');
    console.log('━'.repeat(60));
    console.log(`📋 Action: ${actionDescription}`);
    
    const changes = [];
    
    // URL change
    if (beforeState.url !== afterState.url) {
      changes.push(`URL changed: ${beforeState.url} → ${afterState.url}`);
      console.log(`✅ URL Changed: ${path.basename(beforeState.url)} → ${path.basename(afterState.url)}`);
    }
    
    // Page type change
    if (beforeState.pageType !== afterState.pageType) {
      changes.push(`Page type: ${beforeState.pageType} → ${afterState.pageType}`);
      console.log(`✅ Page Type: ${beforeState.pageType.toUpperCase()} → ${afterState.pageType.toUpperCase()}`);
    }
    
    // Error state changes
    if (beforeState.hasError !== afterState.hasError) {
      changes.push(`Error state: ${beforeState.hasError} → ${afterState.hasError}`);
      console.log(`${afterState.hasError ? '❌' : '✅'} Error State: ${beforeState.hasError} → ${afterState.hasError}`);
    }
    
    // Content changes
    if (beforeState.totalElements !== afterState.totalElements) {
      changes.push(`Elements: ${beforeState.totalElements} → ${afterState.totalElements}`);
      console.log(`🔄 Elements Changed: ${beforeState.totalElements} → ${afterState.totalElements}`);
    }
    
    // Button changes
    const newButtons = afterState.buttons.filter(b => !beforeState.buttons.includes(b));
    const removedButtons = beforeState.buttons.filter(b => !afterState.buttons.includes(b));
    
    if (newButtons.length > 0) {
      changes.push(`New buttons: ${newButtons.join(', ')}`);
      console.log(`➕ New Buttons: ${newButtons.join(', ')}`);
    }
    
    if (removedButtons.length > 0) {
      changes.push(`Removed buttons: ${removedButtons.join(', ')}`);
      console.log(`➖ Removed Buttons: ${removedButtons.join(', ')}`);
    }
    
    // Input value changes
    const filledInputs = afterState.inputs.filter(input => input.hasValue && 
      !beforeState.inputs.some(before => before.name === input.name && before.hasValue)
    );
    
    if (filledInputs.length > 0) {
      changes.push(`Filled inputs: ${filledInputs.map(i => i.name).join(', ')}`);
      console.log(`📝 Filled Inputs: ${filledInputs.map(i => `${i.name}(${i.type})`).join(', ')}`);
    }
    
    // Determine if action was successful
    const hasSignificantChange = changes.length > 0;
    const isPositiveChange = 
      afterState.url !== beforeState.url ||
      (beforeState.hasError && !afterState.hasError) ||
      (beforeState.hasLogin && !afterState.hasLogin) ||
      newButtons.length > 0 ||
      filledInputs.length > 0;
    
    const success = hasSignificantChange && isPositiveChange;
    
    console.log(`\n${success ? '✅' : '❌'} ACTION ${success ? 'SUCCESSFUL' : 'FAILED'}`);
    console.log(`📊 Changes Detected: ${changes.length}`);
    if (changes.length > 0) {
      changes.forEach(change => console.log(`   • ${change}`));
    }
    
    return {
      success,
      hasChanges: hasSignificantChange,
      changes,
      beforeState,
      afterState
    };
  }

  async smartAction(actionType, actionData = {}) {
    console.log(`\n⚡ SMART ACTION: ${actionType.toUpperCase()}`);
    console.log('━'.repeat(60));
    
    // Take BEFORE screenshot
    const beforeScreenshot = await this.takeScreenshot(`before-${actionType}`, `Before ${actionType}`);
    const beforeState = await this.getPageState();
    
    console.log('📊 BEFORE STATE:');
    console.log(`   🌐 URL: ${beforeState.url}`);
    console.log(`   🏷️  Type: ${beforeState.pageType.toUpperCase()}`);
    console.log(`   🔘 Buttons: ${beforeState.buttons.slice(0, 5).join(', ')}${beforeState.buttons.length > 5 ? '...' : ''}`);
    console.log(`   📝 Inputs: ${beforeState.inputs.length}`);
    console.log(`   ❌ Has Error: ${beforeState.hasError ? 'YES' : 'NO'}`);
    
    // Execute the action
    let actionResult = { success: false, action: 'no-action' };
    
    try {
      switch (actionType) {
        case 'login':
          actionResult = await this.executeLogin();
          break;
        case 'click':
          actionResult = await this.executeClick(actionData.target);
          break;
        case 'type':
          actionResult = await this.executeType(actionData.field, actionData.text);
          break;
        case 'navigate':
          actionResult = await this.executeNavigate(actionData.url);
          break;
        case 'find-project':
          actionResult = await this.executeFindProject();
          break;
        case 'create-webhook':
          actionResult = await this.executeCreateWebhook();
          break;
        case 'fill-form':
          actionResult = await this.executeFillWebhookForm();
          break;
        default:
          actionResult = { success: false, action: 'unknown-action' };
      }
    } catch (error) {
      console.log(`❌ Action execution error: ${error.message}`);
      actionResult = { success: false, action: 'execution-error', error: error.message };
    }
    
    // Wait for changes to take effect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take AFTER screenshot
    const afterScreenshot = await this.takeScreenshot(`after-${actionType}`, `After ${actionType}`);
    const afterState = await this.getPageState();
    
    console.log('\n📊 AFTER STATE:');
    console.log(`   🌐 URL: ${afterState.url}`);
    console.log(`   🏷️  Type: ${afterState.pageType.toUpperCase()}`);
    console.log(`   🔘 Buttons: ${afterState.buttons.slice(0, 5).join(', ')}${afterState.buttons.length > 5 ? '...' : ''}`);
    console.log(`   📝 Inputs: ${afterState.inputs.length}`);
    console.log(`   ❌ Has Error: ${afterState.hasError ? 'YES' : 'NO'}`);
    
    // Compare before and after
    const verification = await this.compareStates(beforeState, afterState, actionType);
    
    // Final result combining action execution and visual verification
    const finalResult = {
      ...actionResult,
      visuallyVerified: verification.success,
      actuallyWorked: actionResult.success && verification.success,
      beforeScreenshot: beforeScreenshot?.filename,
      afterScreenshot: afterScreenshot?.filename,
      verification
    };
    
    console.log(`\n🎯 FINAL RESULT: ${finalResult.actuallyWorked ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   🔧 Action Executed: ${actionResult.success ? 'YES' : 'NO'}`);
    console.log(`   👁️  Visually Verified: ${verification.success ? 'YES' : 'NO'}`);
    console.log(`   ✅ Actually Worked: ${finalResult.actuallyWorked ? 'YES' : 'NO'}`);
    
    return finalResult;
  }

  async executeLogin() {
    console.log('🔐 Executing login...');
    
    return await this.page.evaluate((creds) => {
      try {
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) {
          return { success: false, action: 'login-fields-not-found' };
        }
        
        // Fill credentials
        emailInput.value = creds.email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        passwordInput.value = creds.password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Find and click submit
        const submitBtn = Array.from(document.querySelectorAll('button')).find(btn =>
          btn.textContent.toLowerCase().includes('sign in') || btn.type === 'submit'
        );
        
        if (submitBtn) {
          submitBtn.click();
          return { success: true, action: 'login-submitted' };
        }
        
        return { success: false, action: 'submit-button-not-found' };
      } catch (error) {
        return { success: false, action: 'login-error', error: error.message };
      }
    }, this.credentials);
  }

  async executeClick(target) {
    console.log(`🖱️  Executing click on: ${target}`);
    
    return await this.page.evaluate((target) => {
      try {
        const allClickable = Array.from(document.querySelectorAll('button, a, [role="button"]'))
          .filter(el => el.offsetParent !== null);
        
        let element = allClickable.find(el => 
          el.textContent.trim().toLowerCase() === target.toLowerCase()
        );
        
        if (!element) {
          element = allClickable.find(el => 
            el.textContent.toLowerCase().includes(target.toLowerCase())
          );
        }
        
        if (element) {
          element.click();
          return { 
            success: true, 
            action: 'clicked', 
            target: element.textContent.trim() 
          };
        }
        
        return { 
          success: false, 
          action: 'element-not-found', 
          available: allClickable.map(el => el.textContent.trim()).slice(0, 10)
        };
      } catch (error) {
        return { success: false, action: 'click-error', error: error.message };
      }
    }, target);
  }

  async executeType(field, text) {
    console.log(`⌨️  Executing type in ${field}: "${text}"`);
    
    return await this.page.evaluate((field, text) => {
      try {
        const inputs = Array.from(document.querySelectorAll('input, textarea'))
          .filter(input => input.offsetParent !== null);
        
        let input = inputs.find(i => i.name === field) ||
                   inputs.find(i => i.placeholder?.toLowerCase().includes(field.toLowerCase())) ||
                   inputs.find(i => i.id === field);
        
        if (!input && field.toLowerCase().includes('name')) {
          input = inputs.find(i => i.name?.includes('name') || i.placeholder?.toLowerCase().includes('name'));
        } else if (field.toLowerCase().includes('url')) {
          input = inputs.find(i => i.type === 'url' || i.name?.includes('url') || i.placeholder?.toLowerCase().includes('url'));
        }
        
        if (input) {
          input.value = text;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          
          return { 
            success: true, 
            action: 'typed', 
            field: input.name || input.placeholder || 'unnamed',
            text 
          };
        }
        
        return { 
          success: false, 
          action: 'field-not-found',
          available: inputs.map(i => ({
            name: i.name || 'unnamed',
            placeholder: i.placeholder || '',
            type: i.type
          }))
        };
      } catch (error) {
        return { success: false, action: 'type-error', error: error.message };
      }
    }, field, text);
  }

  async executeNavigate(url) {
    console.log(`🧭 Executing navigate to: ${url}`);
    
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      return { success: true, action: 'navigated', url };
    } catch (error) {
      return { success: false, action: 'navigation-failed', error: error.message };
    }
  }

  async executeFindProject() {
    console.log('🎯 Executing find project...');
    
    const result = await this.page.evaluate(() => {
      try {
        const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"]'));
        
        for (const link of projectLinks) {
          const text = link.textContent.toLowerCase();
          const href = link.href.toLowerCase();
          
          if (text.includes('college') || text.includes('football') || 
              text.includes('fantasy') || href.includes('college-football-fantasy-app')) {
            link.click();
            return { success: true, action: 'project-found', project: link.textContent.trim() };
          }
        }
        
        return { success: false, action: 'project-not-found', available: projectLinks.map(l => l.textContent.trim()) };
      } catch (error) {
        return { success: false, action: 'find-project-error', error: error.message };
      }
    });
    
    // If not found, try direct navigation
    if (!result.success) {
      console.log('🔄 Project not found, trying direct navigation...');
      return await this.executeNavigate('https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks');
    }
    
    return result;
  }

  async executeCreateWebhook() {
    console.log('➕ Executing create webhook...');
    
    return await this.page.evaluate(() => {
      try {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'))
          .filter(btn => btn.offsetParent !== null);
        
        const createBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('create webhook') ||
          btn.textContent.toLowerCase().includes('create')
        );
        
        if (createBtn) {
          createBtn.click();
          return { success: true, action: 'create-clicked', button: createBtn.textContent.trim() };
        }
        
        return { 
          success: false, 
          action: 'create-button-not-found',
          available: buttons.map(b => b.textContent.trim()).slice(0, 10)
        };
      } catch (error) {
        return { success: false, action: 'create-webhook-error', error: error.message };
      }
    });
  }

  async executeFillWebhookForm() {
    console.log('📝 Executing fill webhook form...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift'
    };
    
    // Fill name field
    const nameResult = await this.smartAction('type', { field: 'name', text: config.name });
    
    // Fill URL field  
    const urlResult = await this.smartAction('type', { field: 'url', text: config.url });
    
    // Submit form
    const submitResult = await this.smartAction('click', { target: 'create' });
    
    return {
      success: nameResult.actuallyWorked && urlResult.actuallyWorked && submitResult.actuallyWorked,
      action: 'form-filled',
      nameResult: nameResult.actuallyWorked,
      urlResult: urlResult.actuallyWorked,
      submitResult: submitResult.actuallyWorked
    };
  }

  async runSmartAutomation() {
    console.log('🧠 STARTING SMART VISUAL AUTOMATION');
    console.log('👁️  Each action will be verified with before/after screenshots\n');
    
    let step = 0;
    const maxSteps = 15;
    
    while (step < maxSteps) {
      step++;
      this.stepCounter = step;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔄 STEP ${step}: SMART DECISION MAKING`);
      console.log(`${'='.repeat(80)}`);
      
      const currentState = await this.getPageState();
      
      console.log('🔍 CURRENT STATE:');
      console.log(`   🌐 URL: ${currentState.url}`);
      console.log(`   🏷️  Type: ${currentState.pageType.toUpperCase()}`);
      console.log(`   ❌ Error: ${currentState.hasError ? 'YES' : 'NO'}`);
      console.log(`   🔐 Login: ${currentState.hasLogin ? 'YES' : 'NO'}`);
      console.log(`   🪝 Webhook: ${currentState.hasWebhookContent ? 'YES' : 'NO'}`);
      console.log(`   ➕ Create: ${currentState.hasCreateButton ? 'YES' : 'NO'}`);
      
      let actionResult;
      
      // Smart decision making based on current state
      if (currentState.hasError) {
        console.log('🎯 DECISION: Handle error by going back to console');
        actionResult = await this.smartAction('navigate', { url: 'https://cloud.appwrite.io/console' });
      } else if (currentState.hasLogin) {
        console.log('🎯 DECISION: Login required');
        actionResult = await this.smartAction('login');
      } else if (currentState.pageType === 'console') {
        console.log('🎯 DECISION: Find college football project');
        actionResult = await this.smartAction('find-project');
      } else if (currentState.pageType === 'project' && !currentState.hasWebhookContent) {
        console.log('🎯 DECISION: Navigate to webhooks');
        actionResult = await this.smartAction('navigate', { 
          url: currentState.url.replace(/\/[^\/]*$/, '') + '/settings/webhooks' 
        });
      } else if (currentState.hasWebhookContent && currentState.hasCreateButton) {
        console.log('🎯 DECISION: Create webhook');
        actionResult = await this.smartAction('create-webhook');
      } else if (currentState.hasWebhookContent && !currentState.hasCreateButton) {
        console.log('🎯 DECISION: Fill webhook form');
        actionResult = await this.smartAction('fill-form');
      } else {
        console.log('🤔 DECISION: Unclear state, taking screenshot for analysis');
        await this.takeScreenshot('unclear-state', 'Unclear state - manual analysis needed');
        break;
      }
      
      // Check if action was successful
      if (!actionResult.actuallyWorked) {
        console.log(`❌ Step ${step} failed - action did not work as expected`);
        
        // Try recovery after 3 failures
        if (step >= 3) {
          console.log('🔄 Multiple failures, attempting recovery...');
          await this.smartAction('navigate', { url: 'https://cloud.appwrite.io/console' });
        }
      } else {
        console.log(`✅ Step ${step} successful - action verified visually`);
        
        // Check for completion
        if (actionResult.action === 'form-filled' || currentState.url.includes('webhooks')) {
          const finalState = await this.getPageState();
          if (finalState.hasWebhookContent && !finalState.hasCreateButton) {
            console.log('\n🎉 WEBHOOK CREATION COMPLETED!');
            console.log('✅ Visual verification shows success');
            break;
          }
        }
      }
      
      // Brief pause between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 AUTOMATION COMPLETE:`);
    console.log(`   🔢 Total Steps: ${step}`);
    console.log(`   📸 Screenshots: ${this.screenshotDir}`);
    console.log('   🌐 Browser left open for final verification');
  }

  async init() {
    console.log('🔧 Initializing smart visual automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--window-position=1920,0', // Secondary screen
        '--window-size=1920,1080'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('✅ Smart visual automation ready');
    console.log(`📂 Screenshots: ${this.screenshotDir}`);
  }

  async run() {
    try {
      await this.init();
      
      // Start at Appwrite console
      console.log('🚀 Starting at Appwrite console...');
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'domcontentloaded' });
      
      // Run smart automation
      await this.runSmartAutomation();
      
    } catch (error) {
      console.log(`\n❌ Automation error: ${error.message}`);
      await this.takeScreenshot('automation-error', `Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🎯 Smart Visual Automation');
  console.log('👁️  Uses before/after screenshots to verify each action worked');
  console.log('🧠 Makes intelligent decisions based on visual feedback\n');
  
  const automation = new SmartVisualAutomation();
  await automation.run();
}

if (require.main === module) {
  main().catch(console.error);
}