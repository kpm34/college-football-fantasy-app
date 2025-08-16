#!/usr/bin/env node

/**
 * Smart Environment-Aware Webhook Automation
 * Intelligently senses the current state and adapts accordingly
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🧠 Smart Environment-Aware Webhook Automation\n');

class SmartEnvWebhook {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/smart-env-webhook';
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    // Environment state
    this.currentState = {
      isLoggedIn: false,
      currentOrg: null,
      currentProject: null,
      availableProjects: [],
      targetProject: null,
      onWebhooksPage: false
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
    if (description) console.log(`   💭 ${description}`);
    
    return filepath;
  }

  async analyzeEnvironment() {
    console.log('🔍 Analyzing current environment...');
    
    try {
      const envData = await this.page.evaluate(() => {
        const url = window.location.href;
        const title = document.title;
        
        // Check if logged in
        const isLoggedIn = !url.includes('/login') && 
                          !document.querySelector('input[type="password"]');
        
        // Get current organization
        const orgElement = document.querySelector('[data-org], .org-name, .organization-name') ||
                          Array.from(document.querySelectorAll('*')).find(el => 
                            el.textContent && el.textContent.match(/Organization|Org/i));
        const currentOrg = orgElement ? orgElement.textContent.trim() : null;
        
        // Detect current project
        const projectInUrl = url.match(/project-([^\/]+)/)?.[1];
        const projectElement = document.querySelector('.project-name, [data-project]') ||
                              Array.from(document.querySelectorAll('h1, h2, .title')).find(el =>
                                el.textContent && el.textContent.toLowerCase().includes('project'));
        const currentProject = projectInUrl || (projectElement ? projectElement.textContent.trim() : null);
        
        // Find available projects
        const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"], .project-card, .project-item'));
        const availableProjects = projectLinks.map(link => ({
          name: link.textContent.trim(),
          href: link.href || null,
          id: link.href ? link.href.match(/project-([^\/]+)/)?.[1] : null
        })).filter(p => p.id);
        
        // Check if on webhooks page
        const onWebhooksPage = url.includes('/webhooks') || 
                              document.querySelector('h1, h2, .title')?.textContent?.toLowerCase().includes('webhook');
        
        // Check for Create webhook button
        const hasCreateWebhookBtn = Array.from(document.querySelectorAll('button, a, [role="button"]')).some(btn =>
          btn.textContent.toLowerCase().includes('create webhook')
        );
        
        // Get all clickable elements for context
        const clickableElements = Array.from(document.querySelectorAll('button, a, [role="button"]'))
          .map(el => el.textContent.trim())
          .filter(text => text && text.length < 50)
          .slice(0, 10);
        
        return {
          url,
          title,
          isLoggedIn,
          currentOrg,
          currentProject,
          availableProjects,
          onWebhooksPage,
          hasCreateWebhookBtn,
          clickableElements,
          pageType: url.includes('/login') ? 'login' :
                   url.includes('/project') ? 'project' :
                   url.includes('/console') ? 'console' : 'unknown'
        };
      });
      
      // Update internal state
      this.currentState = { ...this.currentState, ...envData };
      
      console.log('📊 Environment Analysis:');
      console.log(`   🌐 URL: ${envData.url}`);
      console.log(`   📄 Page Type: ${envData.pageType}`);
      console.log(`   🔐 Logged In: ${envData.isLoggedIn ? 'YES' : 'NO'}`);
      console.log(`   🏢 Organization: ${envData.currentOrg || 'Not detected'}`);
      console.log(`   📁 Current Project: ${envData.currentProject || 'None'}`);
      console.log(`   📋 Available Projects: ${envData.availableProjects.length}`);
      console.log(`   🪝 On Webhooks Page: ${envData.onWebhooksPage ? 'YES' : 'NO'}`);
      console.log(`   ➕ Has Create Button: ${envData.hasCreateWebhookBtn ? 'YES' : 'NO'}`);
      console.log(`   🔘 Clickable Elements: ${envData.clickableElements.join(', ')}`);
      
      return envData;
    } catch (error) {
      console.log(`❌ Environment analysis failed: ${error.message}`);
      return null;
    }
  }

  async findTargetProject() {
    console.log('🎯 Finding target project...');
    
    const projects = this.currentState.availableProjects;
    
    // Look for college football project
    const targets = [
      'college-football-fantasy-app',
      'college-football-fantasy',
      'cfbfantasy',
      'football',
      'college'
    ];
    
    for (const target of targets) {
      const found = projects.find(p => 
        p.id === target || 
        p.name.toLowerCase().includes(target.toLowerCase()) ||
        p.id.toLowerCase().includes(target.toLowerCase())
      );
      
      if (found) {
        console.log(`   ✅ Found target project: ${found.name} (${found.id})`);
        this.currentState.targetProject = found;
        return found;
      }
    }
    
    // If no specific match, show all projects for analysis
    if (projects.length > 0) {
      console.log('   📋 Available projects:');
      projects.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.name} (${p.id})`);
      });
      
      // Use CLI to get the actual project we know exists
      try {
        const cliResult = this.getProjectFromCLI();
        if (cliResult) {
          console.log(`   🔧 Using CLI-detected project: ${cliResult}`);
          this.currentState.targetProject = { id: cliResult, name: cliResult };
          return this.currentState.targetProject;
        }
      } catch (e) {
        console.log('   ⚠️ CLI detection failed');
      }
    }
    
    return null;
  }

  getProjectFromCLI() {
    try {
      const { execSync } = require('child_process');
      const result = execSync('appwrite projects list --json', { encoding: 'utf8' });
      const projects = JSON.parse(result);
      
      const collegeProject = projects.projects?.find(p => 
        p.name.toLowerCase().includes('college') || 
        p.$id.includes('college-football-fantasy-app')
      );
      
      return collegeProject ? collegeProject.$id : null;
    } catch (error) {
      return null;
    }
  }

  async smartNavigateToProject(targetProject) {
    console.log(`🧭 Smart navigation to project: ${targetProject.id}`);
    
    try {
      // First try clicking on the project if it's visible
      const projectClicked = await this.page.evaluate((projectName) => {
        const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"], .project-card, .project-item'));
        const target = projectLinks.find(link => 
          link.href.includes(projectName) || 
          link.textContent.toLowerCase().includes(projectName.toLowerCase())
        );
        
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, targetProject.id);
      
      if (projectClicked) {
        console.log('   ✅ Clicked on project from UI');
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        return true;
      }
      
      // Try direct URL navigation
      console.log('   🔄 Trying direct URL navigation...');
      const directUrl = `https://cloud.appwrite.io/console/project-${targetProject.id}`;
      await this.page.goto(directUrl, { waitUntil: 'networkidle0' });
      
      // Check if we got a 404
      const has404 = await this.page.evaluate(() => {
        return document.body.textContent.includes('404') || 
               document.body.textContent.includes('not be found');
      });
      
      if (has404) {
        console.log('   ❌ Direct navigation failed - project not found in current org');
        return false;
      }
      
      console.log('   ✅ Direct navigation successful');
      return true;
      
    } catch (error) {
      console.log(`   ❌ Project navigation failed: ${error.message}`);
      return false;
    }
  }

  async smartOrganizationHandling() {
    console.log('🏢 Smart organization handling...');
    
    const currentOrg = this.currentState.currentOrg;
    console.log(`   📊 Current org: ${currentOrg || 'unknown'}`);
    
    // If we already have a target project, check if it's accessible
    if (this.currentState.targetProject) {
      const accessible = await this.testProjectAccess(this.currentState.targetProject.id);
      if (accessible) {
        console.log('   ✅ Project accessible in current organization');
        return true;
      }
    }
    
    // Try to find organization switcher
    console.log('   🔄 Looking for organization switcher...');
    const orgSwitched = await this.page.evaluate(() => {
      // Look for org switcher elements
      const orgElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.toLowerCase().includes('organization') || 
               text.toLowerCase().includes('kash') ||
               el.getAttribute('data-org') ||
               el.className.includes('org');
      });
      
      for (const element of orgElements) {
        // Try to hover and trigger dropdown
        const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
        element.dispatchEvent(hoverEvent);
        
        // Wait a bit then look for switch options
        setTimeout(() => {
          const switchElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent || '';
            return text.toLowerCase().includes('switch') ||
                   text.toLowerCase().includes('kash') ||
                   text.trim() === 'Kash';
          });
          
          if (switchElements.length > 0) {
            switchElements[0].click();
            return true;
          }
        }, 1000);
      }
      
      return false;
    });
    
    if (orgSwitched) {
      console.log('   ✅ Organization switch attempted');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('   ⚠️ No organization switcher found');
    }
    
    return true;
  }

  async testProjectAccess(projectId) {
    try {
      const testUrl = `https://cloud.appwrite.io/console/project-${projectId}`;
      const response = await this.page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
      
      const has404 = await this.page.evaluate(() => {
        return document.body.textContent.includes('404') || 
               document.body.textContent.includes('not be found');
      });
      
      return !has404;
    } catch (error) {
      return false;
    }
  }

  async smartWebhookCreation() {
    console.log('🪝 Smart webhook creation...');
    
    // Navigate to webhooks page
    const targetProject = this.currentState.targetProject;
    if (!targetProject) {
      console.log('   ❌ No target project identified');
      return false;
    }
    
    const webhookUrl = `https://cloud.appwrite.io/console/project-${targetProject.id}/settings/webhooks`;
    console.log(`   🔗 Navigating to: ${webhookUrl}`);
    
    await this.page.goto(webhookUrl, { waitUntil: 'networkidle0' });
    await this.takeScreenshot('webhooks-page', 'Webhooks page loaded');
    
    // Check for 404 again
    const has404 = await this.page.evaluate(() => {
      return document.body.textContent.includes('404');
    });
    
    if (has404) {
      console.log('   ❌ Cannot access webhooks page - wrong organization or project');
      return false;
    }
    
    console.log('   ✅ Successfully reached webhooks page');
    
    // Look for Create webhook button with multiple strategies
    const createButtonFound = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], .btn'));
      
      // Strategy 1: Exact text match
      let createBtn = buttons.find(btn => 
        btn.textContent.trim().toLowerCase() === 'create webhook'
      );
      
      // Strategy 2: Contains create webhook
      if (!createBtn) {
        createBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('create webhook')
        );
      }
      
      // Strategy 3: Just "create" near webhook content
      if (!createBtn) {
        const pageHasWebhookContent = document.body.textContent.toLowerCase().includes('webhook');
        if (pageHasWebhookContent) {
          createBtn = buttons.find(btn => 
            btn.textContent.toLowerCase().includes('create')
          );
        }
      }
      
      // Strategy 4: Look for add/new buttons
      if (!createBtn) {
        createBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('add') || text.includes('new') || text === '+';
        });
      }
      
      if (createBtn) {
        createBtn.click();
        return { found: true, text: createBtn.textContent.trim() };
      }
      
      return { 
        found: false, 
        availableButtons: buttons.map(b => b.textContent.trim()).slice(0, 10)
      };
    });
    
    if (createButtonFound.found) {
      console.log(`   ✅ Clicked create button: "${createButtonFound.text}"`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.takeScreenshot('webhook-form', 'Webhook form opened');
      
      return await this.fillWebhookForm();
    } else {
      console.log('   ❌ No create webhook button found');
      console.log(`   📋 Available buttons: ${createButtonFound.availableButtons.join(', ')}`);
      return false;
    }
  }

  async fillWebhookForm() {
    console.log('📝 Filling webhook form intelligently...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
      secret: process.env.APPWRITE_WEBHOOK_SECRET
    };
    
    try {
      // Smart form filling with multiple strategies
      const formFilled = await this.page.evaluate((config) => {
        const inputs = Array.from(document.querySelectorAll('input'));
        let nameField = null;
        let urlField = null;
        
        // Find name field
        nameField = inputs.find(input => 
          input.name === 'name' ||
          input.placeholder?.toLowerCase().includes('name') ||
          input.id === 'name' ||
          input.getAttribute('label')?.toLowerCase().includes('name')
        );
        
        // Find URL field
        urlField = inputs.find(input => 
          input.name === 'url' ||
          input.placeholder?.toLowerCase().includes('url') ||
          input.type === 'url' ||
          input.id === 'url'
        );
        
        // Fallback: use position-based detection
        if (!nameField && inputs.length >= 2) {
          nameField = inputs[0];
        }
        if (!urlField && inputs.length >= 2) {
          urlField = inputs[1];
        }
        
        // Fill fields
        let filled = 0;
        if (nameField) {
          nameField.value = config.name;
          nameField.dispatchEvent(new Event('input', { bubbles: true }));
          filled++;
        }
        
        if (urlField) {
          urlField.value = config.url;
          urlField.dispatchEvent(new Event('input', { bubbles: true }));
          filled++;
        }
        
        return { filled, totalInputs: inputs.length };
      }, config);
      
      console.log(`   ✅ Filled ${formFilled.filled}/${formFilled.totalInputs} form fields`);
      
      // Select database events
      await this.selectDatabaseEvents();
      
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
        console.log('   ✅ Webhook form submitted!');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await this.takeScreenshot('webhook-created', 'Webhook creation completed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log(`   ❌ Form filling failed: ${error.message}`);
      return false;
    }
  }

  async selectDatabaseEvents() {
    console.log('   🎯 Selecting database events...');
    
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
    
    console.log(`   📋 Selected ${selected} database events`);
  }

  async init() {
    console.log('🔧 Initializing smart environment-aware automation...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('✅ Smart automation ready');
    console.log(`📂 Screenshots: ${this.screenshotDir}`);
  }

  async run() {
    try {
      await this.init();
      
      console.log('\n🧠 Starting smart environment-aware webhook automation...');
      console.log('🎯 Will adapt to whatever state is encountered\n');
      
      // Navigate to Appwrite
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
      await this.takeScreenshot('00-initial-state', 'Initial page load');
      
      // Analyze current environment
      const env = await this.analyzeEnvironment();
      if (!env) return false;
      
      // Handle login if needed
      if (!env.isLoggedIn) {
        console.log('\n🔐 Login required...');
        await this.handleLogin();
        await this.analyzeEnvironment(); // Re-analyze after login
      }
      
      // Find target project
      await this.findTargetProject();
      
      // Handle organization switching if needed
      await this.smartOrganizationHandling();
      
      // Navigate to project and create webhook
      const success = await this.smartWebhookCreation();
      
      if (success) {
        console.log('\n🎉 SUCCESS! Smart automation completed webhook creation!');
      } else {
        console.log('\n⚠️ Automation completed but manual verification needed');
      }
      
      console.log(`\n📸 All screenshots saved to: ${this.screenshotDir}`);
      console.log('🌐 Browser left open for verification');
      
      return success;
      
    } catch (error) {
      console.log(`\n❌ Smart automation failed: ${error.message}`);
      await this.takeScreenshot('error-final', `Error: ${error.message}`);
      return false;
    }
  }

  async handleLogin() {
    const loginSuccess = await this.page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.textContent.toLowerCase().includes('sign in')
      );
      
      if (emailInput && passwordInput && submitBtn) {
        emailInput.value = 'kashpm2002@gmail.com';
        passwordInput.value = '#Kash2002';
        submitBtn.click();
        return true;
      }
      return false;
    });
    
    if (loginSuccess) {
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('   ✅ Login completed');
    }
  }
}

async function main() {
  const automation = new SmartEnvWebhook();
  const success = await automation.run();
  
  console.log(success ? '\n🚀 Smart automation successful!' : '\n🔧 Check results and screenshots');
}

if (require.main === module) {
  main().catch(console.error);
}