#!/usr/bin/env node

/**
 * Dynamic Sense-Execute with Full Error Handling
 * Adapts to any environment and handles all edge cases
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🔄 Dynamic Sense-Execute with Error Handling\n');

class DynamicSenseExecute {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/dynamic-sense-execute';
    this.stepCounter = 0;
    this.lastUrl = '';
    this.lastAction = '';
    this.sameStateCounter = 0;
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name) {
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-step-${this.stepCounter}-${name}.png`;
      const filepath = path.join(this.screenshotDir, filename);
      
      await this.page.screenshot({ path: filepath, fullPage: true });
      console.log(`📸 ${filename}`);
      
      return filepath;
    } catch (error) {
      console.log(`❌ Screenshot failed: ${error.message}`);
      return null;
    }
  }

  async robustPageEvaluate(script, defaultValue = null) {
    try {
      return await this.page.evaluate(script);
    } catch (error) {
      console.log(`⚠️ Page evaluation error: ${error.message}`);
      return defaultValue;
    }
  }

  async sensePage() {
    console.log(`\n🔍 STEP ${this.stepCounter}: SENSING PAGE...`);
    console.log('━'.repeat(80));
    
    try {
      // Wait for page to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pageData = await this.robustPageEvaluate(() => {
        try {
          const url = window.location.href;
          const title = document.title || 'No title';
          
          // Safe button detection
          const buttons = [];
          try {
            const buttonElements = Array.from(document.querySelectorAll('button, [role="button"], a[href], .btn'));
            for (const btn of buttonElements) {
              if (btn.offsetParent !== null && btn.textContent) { // Only visible elements
                const text = btn.textContent.trim();
                if (text && text.length < 100) {
                  buttons.push(text);
                }
              }
            }
          } catch (e) {
            console.log('Button detection error:', e.message);
          }
          
          // Safe input detection
          const inputs = [];
          try {
            const inputElements = Array.from(document.querySelectorAll('input, textarea, select'));
            for (const input of inputElements) {
              if (input.offsetParent !== null) {
                inputs.push({
                  type: input.type || input.tagName.toLowerCase(),
                  name: input.name || 'unnamed',
                  placeholder: input.placeholder || '',
                  id: input.id || '',
                  value: input.value || ''
                });
              }
            }
          } catch (e) {
            console.log('Input detection error:', e.message);
          }
          
          // Safe heading detection
          const headings = [];
          try {
            const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, .title, .heading'));
            for (const h of headingElements) {
              if (h.offsetParent !== null && h.textContent) {
                const text = h.textContent.trim();
                if (text && text.length < 200) {
                  headings.push(text);
                }
              }
            }
          } catch (e) {
            console.log('Heading detection error:', e.message);
          }
          
          // Determine page state
          let pageState = 'unknown';
          let needsAction = 'unknown';
          
          try {
            const bodyText = document.body.textContent.toLowerCase();
            
            if (url.includes('/login') || bodyText.includes('sign in')) {
              pageState = 'login-required';
              needsAction = 'login';
            } else if (bodyText.includes('404') || bodyText.includes('not found')) {
              pageState = 'error-404';
              needsAction = 'navigation-error';
            } else if (url.includes('/project-') && url.includes('/webhooks')) {
              pageState = 'webhooks-page';
              needsAction = buttons.some(b => b.toLowerCase().includes('create')) ? 'create-webhook' : 'find-create-button';
            } else if (url.includes('/project-')) {
              pageState = 'project-page';
              needsAction = 'navigate-to-webhooks';
            } else if (url.includes('/console')) {
              pageState = 'console-home';
              needsAction = 'find-project';
            } else {
              pageState = 'unknown-page';
              needsAction = 'analyze-needed';
            }
          } catch (e) {
            console.log('State detection error:', e.message);
          }
          
          return {
            url,
            title,
            pageState,
            needsAction,
            buttons: buttons.slice(0, 15),
            inputs: inputs.slice(0, 10),
            headings: headings.slice(0, 8),
            totalButtons: buttons.length,
            totalInputs: inputs.length,
            hasPasswordField: inputs.some(i => i.type === 'password'),
            hasEmailField: inputs.some(i => i.type === 'email'),
            hasCreateButton: buttons.some(b => b.toLowerCase().includes('create')),
            hasWebhookButton: buttons.some(b => b.toLowerCase().includes('webhook')),
            timestamp: Date.now()
          };
        } catch (error) {
          return {
            error: error.message,
            url: window.location.href,
            title: document.title,
            pageState: 'evaluation-error',
            needsAction: 'retry-sensing',
            buttons: [],
            inputs: [],
            headings: [],
            totalButtons: 0,
            totalInputs: 0
          };
        }
      }, { error: 'page-evaluation-failed', pageState: 'error', needsAction: 'retry' });
      
      // Take screenshot
      await this.takeScreenshot('sensed');
      
      // Display results
      if (pageData.error) {
        console.log(`❌ PAGE SENSING ERROR: ${pageData.error}`);
      } else {
        console.log('📊 PAGE SENSING RESULTS:');
        console.log(`   🌐 URL: ${pageData.url}`);
        console.log(`   📄 Title: ${pageData.title || 'No title'}`);
        console.log(`   🏷️  State: ${pageData.pageState.toUpperCase()}`);
        console.log(`   🎯 Needs: ${pageData.needsAction.toUpperCase()}`);
        console.log(`   📋 Headings: ${pageData.headings.join(' | ') || 'None'}`);
        console.log(`   🔘 Buttons (${pageData.totalButtons}): ${pageData.buttons.join(', ') || 'None'}`);
        console.log(`   📝 Inputs (${pageData.totalInputs}): ${pageData.inputs.map(i => `${i.type}[${i.name}]`).join(', ') || 'None'}`);
        console.log(`   🔐 Has Login Fields: ${pageData.hasPasswordField && pageData.hasEmailField ? 'YES' : 'NO'}`);
        console.log(`   ➕ Has Create Button: ${pageData.hasCreateButton ? 'YES' : 'NO'}`);
        console.log(`   🪝 Has Webhook Button: ${pageData.hasWebhookButton ? 'YES' : 'NO'}`);
        
        // Check for state loops
        if (pageData.url === this.lastUrl && pageData.needsAction === this.lastAction) {
          this.sameStateCounter++;
          console.log(`   🔄 Same State Count: ${this.sameStateCounter}/3`);
        } else {
          this.sameStateCounter = 0;
        }
        
        this.lastUrl = pageData.url;
        this.lastAction = pageData.needsAction;
      }
      
      return pageData;
      
    } catch (error) {
      console.log(`❌ Sensing failed: ${error.message}`);
      await this.takeScreenshot('sense-error');
      return { 
        error: error.message, 
        pageState: 'sensing-failed', 
        needsAction: 'manual-intervention',
        buttons: [],
        inputs: []
      };
    }
  }

  async smartExecute(pageData) {
    console.log('\n⚡ SMART EXECUTION BASED ON SENSING:');
    console.log('━'.repeat(80));
    
    if (pageData.error) {
      console.log(`❌ Cannot execute due to sensing error: ${pageData.error}`);
      return { success: false, action: 'sensing-failed' };
    }
    
    console.log(`🎯 Detected Need: ${pageData.needsAction.toUpperCase()}`);
    
    // Prevent infinite loops
    if (this.sameStateCounter >= 3) {
      console.log('🔄 LOOP DETECTED: Same state repeated 3 times, trying different approach');
      return { success: false, action: 'loop-detected', needsBreakout: true };
    }
    
    try {
      switch (pageData.needsAction) {
        case 'login':
          return await this.executeLogin(pageData);
        case 'find-project':
          return await this.executeFindProject(pageData);
        case 'navigate-to-webhooks':
          return await this.executeNavigateToWebhooks(pageData);
        case 'create-webhook':
          return await this.executeCreateWebhook(pageData);
        case 'find-create-button':
          return await this.executeFindCreateButton(pageData);
        case 'navigation-error':
          return await this.executeNavigationError(pageData);
        default:
          return await this.executeAnalyzeAndProceed(pageData);
      }
    } catch (error) {
      console.log(`❌ Execution failed: ${error.message}`);
      await this.takeScreenshot('execution-error');
      return { success: false, action: 'execution-failed', error: error.message };
    }
  }

  async executeLogin(pageData) {
    console.log('🔐 EXECUTING: Login Process');
    
    if (!pageData.hasPasswordField || !pageData.hasEmailField) {
      console.log('❌ Login fields not detected');
      return { success: false, action: 'login-fields-missing' };
    }
    
    const loginResult = await this.robustPageEvaluate((creds) => {
      try {
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (emailInput && passwordInput) {
          emailInput.value = creds.email;
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          passwordInput.value = creds.password;
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Find and click submit button
          const submitButton = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent.toLowerCase().includes('sign in') || 
            btn.textContent.toLowerCase().includes('login') ||
            btn.type === 'submit'
          );
          
          if (submitButton) {
            submitButton.click();
            return { success: true, action: 'login-submitted' };
          }
          
          return { success: false, action: 'no-submit-button' };
        }
        
        return { success: false, action: 'login-fields-not-found' };
      } catch (error) {
        return { success: false, action: 'login-execution-error', error: error.message };
      }
    }, this.credentials, { success: false, action: 'login-evaluation-failed' });
    
    if (loginResult.success) {
      console.log('✅ Login form submitted');
      await this.waitForStateChange();
      await this.takeScreenshot('after-login');
    } else {
      console.log(`❌ Login failed: ${loginResult.action}`);
    }
    
    return loginResult;
  }

  async executeFindProject(pageData) {
    console.log('🎯 EXECUTING: Find College Football Project');
    
    const projectResult = await this.robustPageEvaluate(() => {
      try {
        const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"], .project-card, .project-item'));
        
        for (const link of projectLinks) {
          const text = link.textContent.toLowerCase();
          const href = link.href?.toLowerCase() || '';
          
          if (text.includes('college') || 
              text.includes('football') || 
              text.includes('fantasy') ||
              href.includes('college-football-fantasy-app')) {
            link.click();
            return { success: true, action: 'project-clicked', project: link.textContent.trim() };
          }
        }
        
        // Try direct navigation as fallback
        const directUrl = 'https://cloud.appwrite.io/console/project-college-football-fantasy-app';
        window.location.href = directUrl;
        return { success: true, action: 'direct-navigation-attempted' };
        
      } catch (error) {
        return { success: false, action: 'project-search-error', error: error.message };
      }
    }, { success: false, action: 'project-evaluation-failed' });
    
    if (projectResult.success) {
      console.log(`✅ ${projectResult.action}: ${projectResult.project || 'direct navigation'}`);
      await this.waitForStateChange();
      await this.takeScreenshot('after-project-selection');
    } else {
      console.log(`❌ Project search failed: ${projectResult.action}`);
    }
    
    return projectResult;
  }

  async executeNavigateToWebhooks(pageData) {
    console.log('🪝 EXECUTING: Navigate to Webhooks');
    
    try {
      const webhookUrl = pageData.url.replace(/\/[^\/]*$/, '') + '/settings/webhooks';
      console.log(`🔗 Navigating to: ${webhookUrl}`);
      
      await this.page.goto(webhookUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      await this.takeScreenshot('webhooks-navigation');
      console.log('✅ Webhooks navigation completed');
      
      return { success: true, action: 'webhooks-navigation' };
    } catch (error) {
      console.log(`❌ Webhooks navigation failed: ${error.message}`);
      return { success: false, action: 'webhooks-navigation-failed', error: error.message };
    }
  }

  async executeCreateWebhook(pageData) {
    console.log('➕ EXECUTING: Create Webhook');
    
    const createResult = await this.robustPageEvaluate(() => {
      try {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
        const createButton = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('create webhook') ||
          btn.textContent.toLowerCase().includes('create')
        );
        
        if (createButton) {
          createButton.click();
          return { success: true, action: 'create-button-clicked', button: createButton.textContent.trim() };
        }
        
        return { success: false, action: 'create-button-not-found', available: buttons.map(b => b.textContent.trim()).slice(0, 10) };
      } catch (error) {
        return { success: false, action: 'create-execution-error', error: error.message };
      }
    }, { success: false, action: 'create-evaluation-failed' });
    
    if (createResult.success) {
      console.log(`✅ Clicked: ${createResult.button}`);
      await this.waitForStateChange();
      await this.takeScreenshot('after-create-click');
      
      // Try to fill the form
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await this.executeWebhookFormFill();
    } else {
      console.log(`❌ Create webhook failed: ${createResult.action}`);
      if (createResult.available) {
        console.log(`📋 Available buttons: ${createResult.available.join(', ')}`);
      }
    }
    
    return createResult;
  }

  async executeWebhookFormFill() {
    console.log('📝 EXECUTING: Fill Webhook Form');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift'
    };
    
    const formResult = await this.robustPageEvaluate((config) => {
      try {
        const inputs = Array.from(document.querySelectorAll('input'));
        let filled = 0;
        
        // Fill name field
        const nameField = inputs.find(input => 
          input.name === 'name' ||
          input.placeholder?.toLowerCase().includes('name') ||
          input.id === 'name'
        ) || inputs[0];
        
        if (nameField) {
          nameField.value = config.name;
          nameField.dispatchEvent(new Event('input', { bubbles: true }));
          filled++;
        }
        
        // Fill URL field
        const urlField = inputs.find(input => 
          input.name === 'url' ||
          input.placeholder?.toLowerCase().includes('url') ||
          input.type === 'url' ||
          input.id === 'url'
        ) || inputs[1];
        
        if (urlField) {
          urlField.value = config.url;
          urlField.dispatchEvent(new Event('input', { bubbles: true }));
          filled++;
        }
        
        // Submit form
        const submitButton = Array.from(document.querySelectorAll('button')).find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('create') || text.includes('save') || text.includes('submit');
        });
        
        if (submitButton) {
          submitButton.click();
          return { success: true, action: 'form-submitted', filled };
        }
        
        return { success: false, action: 'no-submit-button', filled };
      } catch (error) {
        return { success: false, action: 'form-fill-error', error: error.message };
      }
    }, config, { success: false, action: 'form-evaluation-failed' });
    
    if (formResult.success) {
      console.log(`✅ Form filled (${formResult.filled} fields) and submitted`);
      await this.waitForStateChange();
      await this.takeScreenshot('webhook-created');
    } else {
      console.log(`❌ Form fill failed: ${formResult.action}`);
    }
    
    return formResult;
  }

  async executeFindCreateButton(pageData) {
    console.log('🔍 EXECUTING: Find Create Button');
    
    // Similar logic as executeCreateWebhook but with more thorough search
    return await this.executeCreateWebhook(pageData);
  }

  async executeNavigationError(pageData) {
    console.log('🔄 EXECUTING: Handle Navigation Error');
    
    console.log('❌ 404 or navigation error detected');
    console.log('🔄 Attempting to return to console home...');
    
    try {
      await this.page.goto('https://cloud.appwrite.io/console', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      await this.takeScreenshot('navigation-recovery');
      console.log('✅ Returned to console home');
      
      return { success: true, action: 'navigation-recovered' };
    } catch (error) {
      console.log(`❌ Navigation recovery failed: ${error.message}`);
      return { success: false, action: 'navigation-recovery-failed', error: error.message };
    }
  }

  async executeAnalyzeAndProceed(pageData) {
    console.log('🤔 EXECUTING: Analyze and Proceed');
    console.log('📊 Current state requires manual analysis');
    console.log(`🌐 URL: ${pageData.url}`);
    console.log(`🔘 Available buttons: ${pageData.buttons.join(', ') || 'None'}`);
    
    return { success: false, action: 'manual-analysis-needed', pageData };
  }

  async waitForStateChange(ms = 3000) {
    console.log(`⏳ Waiting ${ms}ms for state change...`);
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async runDynamicLoop() {
    console.log('🔄 STARTING DYNAMIC SENSE-EXECUTE LOOP');
    console.log('🎯 Goal: Create Appwrite webhook for schema drift detection\n');
    
    let maxSteps = 20;
    let consecutiveFailures = 0;
    
    while (this.stepCounter < maxSteps && consecutiveFailures < 5) {
      this.stepCounter++;
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔄 LOOP ITERATION ${this.stepCounter}`);
      console.log(`${'='.repeat(80)}`);
      
      try {
        // SENSE
        const pageData = await this.sensePage();
        
        // EXECUTE based on sensing
        const result = await this.smartExecute(pageData);
        
        if (result.success) {
          console.log(`✅ Step ${this.stepCounter} completed: ${result.action}`);
          consecutiveFailures = 0;
          
          // Check for completion conditions
          if (result.action === 'form-submitted' || result.action === 'webhook-created') {
            console.log('\n🎉 WEBHOOK CREATION COMPLETED!');
            break;
          }
        } else {
          console.log(`❌ Step ${this.stepCounter} failed: ${result.action}`);
          consecutiveFailures++;
          
          if (consecutiveFailures >= 3) {
            console.log('⚠️ Multiple consecutive failures, taking recovery action...');
            await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'domcontentloaded' });
          }
        }
        
        // Brief pause between iterations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`❌ Loop iteration ${this.stepCounter} error: ${error.message}`);
        consecutiveFailures++;
      }
    }
    
    if (consecutiveFailures >= 5) {
      console.log('\n❌ Too many consecutive failures, ending automation');
    } else if (this.stepCounter >= maxSteps) {
      console.log('\n⏰ Maximum steps reached, ending automation');
    }
    
    console.log(`\n📊 AUTOMATION SUMMARY:`);
    console.log(`   🔢 Total Steps: ${this.stepCounter}`);
    console.log(`   ❌ Consecutive Failures: ${consecutiveFailures}`);
    console.log(`   📸 Screenshots: ${this.screenshotDir}`);
    console.log('   🌐 Browser left open for verification');
  }

  async init() {
    console.log('🔧 Initializing dynamic automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized', 
        '--no-first-run', 
        '--disable-web-security',
        '--window-position=2000,0', // Open on secondary screen
        '--window-size=1920,1080',   // Set specific size
        '--new-window'               // Force new window
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Set up error handling
    this.page.on('error', (error) => {
      console.log(`🚨 Page error: ${error.message}`);
    });
    
    this.page.on('pageerror', (error) => {
      console.log(`🚨 Page script error: ${error.message}`);
    });
    
    console.log('✅ Dynamic automation ready with error handling');
    console.log(`📂 Screenshots: ${this.screenshotDir}`);
  }

  async run() {
    try {
      await this.init();
      
      // Navigate to starting point
      console.log('🚀 Starting at Appwrite console...');
      await this.page.goto('https://cloud.appwrite.io/console', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Run the dynamic loop
      await this.runDynamicLoop();
      
    } catch (error) {
      console.log(`\n❌ Fatal error: ${error.message}`);
      await this.takeScreenshot('fatal-error');
    }
  }
}

async function main() {
  console.log('🎯 Dynamic Sense-Execute Automation');
  console.log('🛡️ With comprehensive error handling for dynamic environments');
  console.log('🔄 Automatically adapts to any page state encountered\n');
  
  const automation = new DynamicSenseExecute();
  await automation.run();
}

if (require.main === module) {
  main().catch(console.error);
}