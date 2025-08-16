#!/usr/bin/env node

/**
 * Smart webhook automation - discovers correct project ID then creates webhook
 */

const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🎯 Smart Project Discovery + Webhook Creation\n');

class SmartWebhookAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotDir = '/tmp/smart-webhook-automation';
    this.projectId = null;
    this.credentials = {
      email: 'kashpm2002@gmail.com',
      password: '#Kash2002'
    };
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async takeScreenshot(name, waitTime = 2000) {
    // Wait for interface to settle
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    const timestamp = Date.now();
    const filename = `${timestamp}-${name}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`   📸 ${name} (waited ${waitTime}ms)`);
    return filepath;
  }

  async navigateWithScreenshots(stepName, actionFn) {
    console.log(`   🔄 ${stepName}...`);
    
    // Take screenshot before action
    await this.takeScreenshot(`before-${stepName}`, 1000);
    
    // Perform action
    const result = await actionFn();
    
    // Take screenshot after action
    await this.takeScreenshot(`after-${stepName}`, 2000);
    
    return result;
  }

  async init() {
    console.log('1️⃣ Initializing browser...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox']
    });
    
    this.page = await this.browser.newPage();
    console.log('   ✅ Browser ready');
  }

  async loginAndDiscoverProject() {
    console.log('\n2️⃣ Login and project discovery...');
    
    // Navigate to console with screenshot
    await this.navigateWithScreenshots('navigate-to-console', async () => {
      await this.page.goto('https://cloud.appwrite.io/console', { waitUntil: 'networkidle0' });
      return true;
    });
    
    // Perform login with screenshots
    const loginSuccess = await this.navigateWithScreenshots('perform-login', async () => {
      await this.page.waitForSelector('input[type="email"], input[name="email"]');
      await this.page.type('input[type="email"], input[name="email"]', this.credentials.email);
      await this.page.type('input[type="password"]', this.credentials.password);
      
      // Submit login
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(btn => 
          btn.textContent.toLowerCase().includes('sign in') ||
          btn.type === 'submit'
        );
        if (submitBtn) submitBtn.click();
      });
      
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      return true;
    });
    
    if (loginSuccess) {
      console.log('   ✅ Login completed');
      
      // Discover project with screenshot guidance
      return await this.discoverProject();
    }
    
    return false;
  }

  async discoverProject() {
    console.log('\n3️⃣ Discovering correct project...');
    
    // Wait for interface to fully load after login
    return await this.navigateWithScreenshots('discover-projects', async () => {
      try {
        // First switch to the "Kash" organization
        await this.switchToKashOrganization();
        
        // Wait longer for projects to load after org switch
        await this.page.waitForSelector('a[href*="/project"], .project-card, .project-item', { timeout: 15000 });
        
        // Get all project links with extra wait
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const projects = await this.page.evaluate(() => {
          const projectLinks = Array.from(document.querySelectorAll('a[href*="/project"]'));
          return projectLinks.map(link => ({
            href: link.href,
            text: link.textContent.trim(),
            projectId: link.href.match(/project-([^\/]+)/)?.[1] || link.href.match(/\/([^\/]+)$/)?.[1]
          })).filter(p => p.projectId);
        });
        
        console.log('   📋 Found projects in Kash org:', projects.map(p => p.text || p.projectId));
        
        // Find college football project
        const collegeProject = projects.find(p => 
          p.text.toLowerCase().includes('college') ||
          p.text.toLowerCase().includes('football') ||
          p.text.toLowerCase().includes('fantasy') ||
          p.projectId.includes('college') ||
          p.projectId.includes('football')
        );
        
        if (collegeProject) {
          this.projectId = collegeProject.projectId;
          console.log(`   ✅ Found project: ${this.projectId}`);
          
          // Navigate to the project with wait
          await this.page.goto(collegeProject.href, { waitUntil: 'networkidle0' });
          return true;
        } else {
          console.log('   ⚠️  No college football project found, using first project');
          if (projects.length > 0) {
            this.projectId = projects[0].projectId;
            await this.page.goto(projects[0].href, { waitUntil: 'networkidle0' });
            return true;
          }
        }
        
        return false;
        
      } catch (error) {
        console.log(`   ❌ Project discovery failed: ${error.message}`);
        return false;
      }
    });
  }

  async switchToKashOrganization() {
    console.log('   🏢 Switching to Kash organization...');
    
    try {
      // Look for organization switcher - could be "kash pro" or similar text
      const orgSwitcherFound = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const orgElement = elements.find(el => 
          el.textContent && el.textContent.toLowerCase().includes('kash') && 
          el.textContent.toLowerCase().includes('pro')
        );
        
        if (orgElement) {
          // Hover over the element to trigger dropdown
          const event = new MouseEvent('mouseenter', { bubbles: true });
          orgElement.dispatchEvent(event);
          return true;
        }
        return false;
      });

      if (orgSwitcherFound) {
        console.log('   ✅ Found organization switcher, hovering...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Look for "Switch organization" or similar
        const switchOrgFound = await this.page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          const switchElement = elements.find(el => 
            el.textContent && el.textContent.toLowerCase().includes('switch') && 
            el.textContent.toLowerCase().includes('organization')
          );
          
          if (switchElement) {
            switchElement.click();
            return true;
          }
          return false;
        });

        if (switchOrgFound) {
          console.log('   ✅ Found "Switch organization", clicking...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Now select "Kash" organization
          const kashOrgFound = await this.page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const kashElement = elements.find(el => 
              el.textContent && el.textContent.trim().toLowerCase() === 'kash'
            );
            
            if (kashElement) {
              kashElement.click();
              return true;
            }
            return false;
          });

          if (kashOrgFound) {
            console.log('   ✅ Selected "Kash" organization');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for org switch
            return true;
          }
        }
      }
      
      console.log('   ⚠️  Could not find organization switcher, proceeding with current org');
      return false;
      
    } catch (error) {
      console.log(`   ⚠️  Organization switch failed: ${error.message}`);
      return false;
    }
  }

  async navigateToWebhooks() {
    console.log('\n4️⃣ Navigating to webhooks...');
    
    return await this.navigateWithScreenshots('navigate-to-webhooks', async () => {
      try {
        // First navigate to Settings
        console.log('   🔄 Looking for Settings...');
        const settingsFound = await this.page.evaluate(() => {
          const navItems = Array.from(document.querySelectorAll('a, button, [role="menuitem"], .sidebar a, nav a'));
          const settingsItem = navItems.find(item => 
            item.textContent.toLowerCase().includes('settings')
          );
          
          if (settingsItem) {
            settingsItem.click();
            return true;
          }
          return false;
        });
        
        if (settingsFound) {
          console.log('   ✅ Found and clicked Settings');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Now look for Webhooks in settings submenu
          console.log('   🔄 Looking for Webhooks in settings...');
          const webhooksFound = await this.page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('a, button, [role="menuitem"], .settings-menu a, .submenu a'));
            const webhooksItem = items.find(item => 
              item.textContent.toLowerCase().includes('webhook')
            );
            
            if (webhooksItem) {
              webhooksItem.click();
              return true;
            }
            return false;
          });
          
          if (webhooksFound) {
            console.log('   ✅ Found and clicked Webhooks');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
          }
        }
        
        // Fallback: try direct URL navigation using correct project ID
        console.log('   🔄 Using direct URL navigation...');
        const webhookUrl = `https://cloud.appwrite.io/console/project-${this.projectId}/settings/webhooks`;
        await this.page.goto(webhookUrl, { waitUntil: 'networkidle0' });
        console.log('   ✅ Direct webhooks navigation completed');
        return true;
        
      } catch (error) {
        console.log(`   ❌ Webhooks navigation failed: ${error.message}`);
        return false;
      }
    });
  }

  async createWebhook() {
    console.log('\n5️⃣ Creating webhook...');
    
    try {
      await this.takeScreenshot('06-before-create');
      
      // Look for Create webhook button specifically
      const createClicked = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const createBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('create webhook');
        });
        
        if (createBtn) {
          createBtn.click();
          return true;
        }
        
        // Fallback: look for any create button
        const fallbackBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('create') && !text.includes('organization');
        });
        
        if (fallbackBtn) {
          fallbackBtn.click();
          return true;
        }
        
        return false;
      });
      
      if (createClicked) {
        console.log('   ✅ Create button clicked');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('07-create-form');
        
        // Fill the form
        await this.fillForm();
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.log(`   ❌ Webhook creation failed: ${error.message}`);
      await this.takeScreenshot('error-create');
      return false;
    }
  }

  async fillForm() {
    console.log('   📝 Filling webhook form...');
    
    const config = {
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
      secret: process.env.APPWRITE_WEBHOOK_SECRET
    };
    
    try {
      // Fill name
      const nameInput = await this.page.$('input[name="name"], input[placeholder*="name" i], #name');
      if (nameInput) {
        await nameInput.click();
        await nameInput.type(config.name);
        console.log('   ✅ Name filled');
      }
      
      // Fill URL
      const urlInput = await this.page.$('input[name="url"], input[placeholder*="url" i], #url, input[type="url"]');
      if (urlInput) {
        await urlInput.click();
        await urlInput.type(config.url);
        console.log('   ✅ URL filled');
      }
      
      await this.takeScreenshot('08-basic-filled');
      
      // Select all database events (this is the tricky part)
      await this.selectDatabaseEvents();
      
      // Add webhook secret header
      await this.addWebhookSecret(config.secret);
      
      await this.takeScreenshot('09-form-complete');
      
      // Submit form
      const submitSuccess = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('create') || text.includes('save') || text.includes('submit') || btn.type === 'submit';
        });
        
        if (submitBtn) {
          submitBtn.click();
          return true;
        }
        return false;
      });
      
      if (submitSuccess) {
        console.log('   ✅ Form submitted');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.takeScreenshot('10-submitted');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.log(`   ❌ Form filling failed: ${error.message}`);
      await this.takeScreenshot('error-form');
      return false;
    }
  }

  async selectDatabaseEvents() {
    console.log('   🎯 Selecting database events...');
    
    try {
      // Look for checkboxes or selectors related to database events
      const eventsSelected = await this.page.evaluate(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        const databaseCheckboxes = checkboxes.filter(cb => {
          const label = cb.nextSibling?.textContent || cb.parentNode?.textContent || '';
          return label.toLowerCase().includes('database') || 
                 label.toLowerCase().includes('collection') || 
                 label.toLowerCase().includes('attribute');
        });
        
        // Select all database-related events
        databaseCheckboxes.forEach(cb => {
          if (!cb.checked) cb.click();
        });
        
        return databaseCheckboxes.length;
      });
      
      console.log(`   ✅ Selected ${eventsSelected} database events`);
      return eventsSelected > 0;
      
    } catch (error) {
      console.log(`   ⚠️  Event selection failed: ${error.message}`);
      return false;
    }
  }

  async addWebhookSecret(secret) {
    console.log('   🔑 Adding webhook secret...');
    
    try {
      // Look for header inputs
      const headerInputs = await this.page.$$('input[placeholder*="key" i], input[placeholder*="header" i]');
      
      if (headerInputs.length >= 2) {
        await headerInputs[0].type('X-Webhook-Secret');
        await headerInputs[1].type(secret);
        console.log('   ✅ Webhook secret added');
        return true;
      }
      
      console.log('   ⚠️  Could not find header inputs');
      return false;
      
    } catch (error) {
      console.log(`   ⚠️  Header addition failed: ${error.message}`);
      return false;
    }
  }

  async verifyCLI() {
    console.log('\n6️⃣ CLI verification...');
    
    if (!this.projectId) {
      console.log('   ❌ No project ID found');
      return false;
    }
    
    try {
      // Use discovered project ID without "project-" prefix for CLI
      execSync(`appwrite client --endpoint "https://nyc.cloud.appwrite.io/v1" --project-id "${this.projectId}"`, { stdio: 'pipe' });
      
      const result = execSync(`appwrite projects list-webhooks --project-id "${this.projectId}"`, {
        encoding: 'utf8'
      });
      
      if (result.includes('Schema Drift Detection')) {
        console.log('   ✅ Webhook verified via CLI!');
        return true;
      } else {
        console.log('   ⚠️  Webhook not found in CLI');
        return false;
      }
      
    } catch (error) {
      console.log(`   ❌ CLI verification failed: ${error.message}`);
      return false;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log(`\n📁 Screenshots: ${this.screenshotDir}`);
  }

  async run() {
    try {
      await this.init();
      
      const loginSuccess = await this.loginAndDiscoverProject();
      if (!loginSuccess) return false;
      
      const webhooksNav = await this.navigateToWebhooks();
      if (!webhooksNav) return false;
      
      const webhookCreated = await this.createWebhook();
      if (!webhookCreated) return false;
      
      const cliVerified = await this.verifyCLI();
      
      if (cliVerified) {
        console.log('\n🎉 SUCCESS! Webhook system operational!');
        return true;
      } else {
        console.log('\n⚠️  Webhook created but needs verification');
        return false;
      }
      
    } catch (error) {
      console.log(`\n❌ Automation failed: ${error.message}`);
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

async function main() {
  const automation = new SmartWebhookAutomation();
  const success = await automation.run();
  
  console.log(success ? '\n🚀 Webhook ready!' : '\n🔧 Manual check needed');
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}