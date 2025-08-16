#!/usr/bin/env node

/**
 * Robust Webhook Automation - No timeouts, just smart detection
 * Handles all edge cases and adapts to any situation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('💪 Robust Webhook Automation\n');

class RobustWebhookAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/robust-webhook';
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name) {
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 ${filename}`);
    
    return filepath;
  }

  async waitAndCheck(conditionFn, description, maxAttempts = 20) {
    console.log(`⏳ Waiting for: ${description}`);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await conditionFn();
        if (result) {
          console.log(`✅ ${description} - Success!`);
          return result;
        }
      } catch (e) {
        // Continue trying
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      process.stdout.write('.');
    }
    
    console.log(`\n⚠️ ${description} - Timeout`);
    return false;
  }

  async getCurrentState() {
    try {
      return await this.page.evaluate(() => {
        const url = window.location.href;
        
        return {
          url,
          isLoginPage: url.includes('/login'),
          isConsolePage: url.includes('/console') && !url.includes('/login'),
          hasPasswordField: !!document.querySelector('input[type="password"]'),
          hasWebhookButton: Array.from(document.querySelectorAll('*')).some(el => 
            el.textContent && el.textContent.toLowerCase().includes('create webhook')),
          has404: document.body.textContent.includes('404'),
          currentPageTitle: document.title,
          availableButtons: Array.from(document.querySelectorAll('button, a, [role="button"]'))
            .map(btn => btn.textContent.trim())
            .filter(text => text && text.length < 50)
            .slice(0, 8)
        };
      });
    } catch (error) {
      return { url: 'unknown', error: true };
    }
  }

  async smartLogin() {
    console.log('🔐 Smart Login Process');
    
    const state = await this.getCurrentState();
    await this.takeScreenshot('login-start');
    
    if (!state.isLoginPage && !state.hasPasswordField) {
      console.log('✅ Already logged in!');
      return true;
    }
    
    console.log('📝 Filling login form...');
    
    // Fill email
    const emailFilled = await this.page.evaluate((email) => {
      const emailInput = document.querySelector('input[type="email"], input[name="email"]');
      if (emailInput) {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, this.credentials.email);
    
    // Fill password
    const passwordFilled = await this.page.evaluate((password) => {
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, this.credentials.password);
    
    if (!emailFilled || !passwordFilled) {
      console.log('❌ Could not fill login form');
      return false;
    }
    
    await this.takeScreenshot('credentials-filled');
    
    // Submit form
    const submitted = await this.page.evaluate(() => {
      const submitButton = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.toLowerCase().includes('sign in') || btn.type === 'submit'
      );
      
      if (submitButton) {
        submitButton.click();
        return true;
      }
      return false;
    });
    
    if (!submitted) {
      console.log('❌ Could not submit login form');
      return false;
    }
    
    console.log('⚡ Login submitted, waiting for redirect...');
    
    // Wait for login to complete by checking URL change
    const loginComplete = await this.waitAndCheck(
      async () => {
        const currentState = await this.getCurrentState();
        return !currentState.isLoginPage && !currentState.hasPasswordField;
      },
      'Login completion',
      15
    );
    
    if (loginComplete) {
      await this.takeScreenshot('login-complete');
    }
    
    return loginComplete;
  }

  async findAndNavigateToProject() {
    console.log('🎯 Finding college football project...');
    
    await this.takeScreenshot('project-search');
    
    // First try to find the project in the current page
    const projectFound = await this.page.evaluate(() => {
      const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"]'));
      
      for (const link of projectLinks) {
        const text = link.textContent.toLowerCase();
        const href = link.href.toLowerCase();
        
        if (text.includes('college') || 
            text.includes('football') || 
            text.includes('fantasy') ||
            href.includes('college-football-fantasy-app')) {
          link.click();
          return { found: true, text: link.textContent.trim() };
        }
      }
      
      return { found: false, available: projectLinks.map(l => l.textContent.trim()).slice(0, 5) };
    });
    
    if (projectFound.found) {
      console.log(`✅ Clicked on project: ${projectFound.text}`);
      
      // Wait for navigation without strict timeout
      await this.waitAndCheck(
        async () => {
          const state = await this.getCurrentState();
          return state.url.includes('/project');
        },
        'Project page load',
        10
      );
      
      await this.takeScreenshot('project-loaded');
      return true;
    }
    
    console.log('🔄 Project not found in UI, trying direct navigation...');
    console.log(`📋 Available projects: ${projectFound.available.join(', ')}`);
    
    // Try direct navigation to known project ID
    const directUrl = 'https://cloud.appwrite.io/console/project-college-football-fantasy-app';
    console.log(`🔗 Navigating directly to: ${directUrl}`);
    
    await this.page.goto(directUrl, { waitUntil: 'domcontentloaded' });
    await this.takeScreenshot('direct-navigation');
    
    // Check if we got 404
    const state = await this.getCurrentState();
    if (state.has404) {
      console.log('❌ Project not accessible - might be in wrong organization');
      
      // Try to switch organization first
      const orgSwitched = await this.tryOrganizationSwitch();
      if (orgSwitched) {
        // Try direct navigation again
        await this.page.goto(directUrl, { waitUntil: 'domcontentloaded' });
        const newState = await this.getCurrentState();
        return !newState.has404;
      }
      
      return false;
    }
    
    console.log('✅ Direct navigation successful');
    return true;
  }

  async tryOrganizationSwitch() {
    console.log('🏢 Attempting organization switch...');
    
    await this.takeScreenshot('before-org-switch');
    
    const switched = await this.page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      
      // Look for elements that might contain "Kash" or organization info
      const orgElements = allElements.filter(el => {
        const text = el.textContent || '';
        return text.toLowerCase().includes('kash') || 
               text.toLowerCase().includes('organization') ||
               el.className.includes('org');
      });
      
      for (const element of orgElements) {
        // Try hover
        element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        
        // Try click
        element.click();
        
        // Look for switch options after a delay
        setTimeout(() => {
          const switchElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            return text.toLowerCase().includes('switch') || 
                   text.trim().toLowerCase() === 'kash';
          });
          
          if (switchElements.length > 0) {
            switchElements[0].click();
          }
        }, 1000);
      }
      
      return orgElements.length > 0;
    });
    
    if (switched) {
      console.log('✅ Organization switch attempted');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('after-org-switch');
    } else {
      console.log('⚠️ No organization switcher found');
    }
    
    return switched;
  }

  async navigateToWebhooks() {
    console.log('🪝 Navigating to webhooks...');
    
    // Try direct webhook URL
    const webhookUrl = 'https://cloud.appwrite.io/console/project-college-football-fantasy-app/settings/webhooks';
    console.log(`🔗 Going to: ${webhookUrl}`);
    
    await this.page.goto(webhookUrl, { waitUntil: 'domcontentloaded' });
    await this.takeScreenshot('webhooks-page');
    
    const state = await this.getCurrentState();
    
    if (state.has404) {
      console.log('❌ Cannot access webhooks page');
      return false;
    }
    
    console.log('✅ Webhooks page loaded');
    return true;
  }

  async createWebhook() {
    console.log('➕ Creating webhook...');
    
    await this.takeScreenshot('before-create');
    
    // Look for create button with multiple strategies
    const createResult = await this.page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"], .btn'));
      
      // Strategy 1: Exact match
      let createBtn = allButtons.find(btn => 
        btn.textContent.trim().toLowerCase() === 'create webhook'
      );
      
      // Strategy 2: Contains create webhook
      if (!createBtn) {
        createBtn = allButtons.find(btn => 
          btn.textContent.toLowerCase().includes('create webhook')
        );
      }
      
      // Strategy 3: Just "create" if page contains webhook content
      if (!createBtn && document.body.textContent.toLowerCase().includes('webhook')) {
        createBtn = allButtons.find(btn => 
          btn.textContent.toLowerCase() === 'create' ||
          btn.textContent.toLowerCase().includes('create')
        );
      }
      
      // Strategy 4: Any button with + or similar
      if (!createBtn) {
        createBtn = allButtons.find(btn => 
          btn.textContent.trim() === '+' ||
          btn.textContent.toLowerCase().includes('add') ||
          btn.textContent.toLowerCase().includes('new')
        );
      }
      
      if (createBtn) {
        createBtn.click();
        return { 
          success: true, 
          buttonText: createBtn.textContent.trim() 
        };
      }
      
      return { 
        success: false, 
        availableButtons: allButtons.map(b => b.textContent.trim()).filter(t => t).slice(0, 10)
      };
    });
    
    if (!createResult.success) {
      console.log('❌ No create button found');
      console.log(`📋 Available buttons: ${createResult.availableButtons.join(', ')}`);
      return false;
    }
    
    console.log(`✅ Clicked: "${createResult.buttonText}"`);
    
    // Wait for form to appear
    const formAppeared = await this.waitAndCheck(
      async () => {
        const inputs = await this.page.$$('input[type="text"], input[name="name"], input[name="url"]');
        return inputs.length >= 2;
      },
      'Webhook form appearance',
      10
    );
    
    if (!formAppeared) {
      console.log('❌ Webhook form did not appear');
      return false;
    }
    
    await this.takeScreenshot('form-appeared');
    return await this.fillForm();
  }

  async fillForm() {
    console.log('📝 Filling webhook form...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift'
    };
    
    // Fill name field
    const nameFilled = await this.page.evaluate((name) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameField = inputs.find(input => 
        input.name === 'name' ||
        input.placeholder?.toLowerCase().includes('name') ||
        input.id === 'name'
      ) || inputs[0]; // Fallback to first input
      
      if (nameField) {
        nameField.value = name;
        nameField.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, config.name);
    
    // Fill URL field
    const urlFilled = await this.page.evaluate((url) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const urlField = inputs.find(input => 
        input.name === 'url' ||
        input.placeholder?.toLowerCase().includes('url') ||
        input.type === 'url' ||
        input.id === 'url'
      ) || inputs[1]; // Fallback to second input
      
      if (urlField) {
        urlField.value = url;
        urlField.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      return false;
    }, config.url);
    
    console.log(`📋 Form fields filled: name=${nameFilled}, url=${urlFilled}`);
    
    await this.takeScreenshot('form-filled');
    
    // Select some events (optional)
    await this.page.evaluate(() => {
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      checkboxes.slice(0, 3).forEach(cb => {
        if (!cb.checked) cb.click();
      });
    });
    
    // Submit form
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
      console.log('✅ Form submitted!');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('submitted');
      return true;
    }
    
    console.log('❌ Could not submit form');
    return false;
  }

  async init() {
    console.log('🔧 Initializing robust automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-first-run']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('✅ Robust automation ready');
  }

  async run() {
    try {
      await this.init();
      
      console.log('\n💪 Starting robust webhook automation...');
      console.log('🎯 Will handle any situation encountered\n');
      
      // Go to Appwrite
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'domcontentloaded' });
      
      // Step-by-step execution
      const loginSuccess = await this.smartLogin();
      if (!loginSuccess) {
        console.log('❌ Login failed');
        return false;
      }
      
      const projectSuccess = await this.findAndNavigateToProject();
      if (!projectSuccess) {
        console.log('❌ Could not access project');
        return false;
      }
      
      const webhooksSuccess = await this.navigateToWebhooks();
      if (!webhooksSuccess) {
        console.log('❌ Could not access webhooks page');
        return false;
      }
      
      const webhookCreated = await this.createWebhook();
      
      if (webhookCreated) {
        console.log('\n🎉 SUCCESS! Webhook creation completed!');
        console.log('✅ Schema Drift Detection webhook should now be active');
      } else {
        console.log('\n⚠️ Webhook creation incomplete - check manually');
      }
      
      console.log(`\n📸 Screenshots saved to: ${this.screenshotDir}`);
      console.log('🌐 Browser left open for verification');
      
      return webhookCreated;
      
    } catch (error) {
      console.log(`\n❌ Robust automation error: ${error.message}`);
      await this.takeScreenshot('final-error');
      return false;
    }
  }
}

async function main() {
  const automation = new RobustWebhookAutomation();
  const success = await automation.run();
  
  console.log(success ? '\n🚀 Robust automation completed!' : '\n🔧 Manual verification recommended');
}

if (require.main === module) {
  main().catch(console.error);
}