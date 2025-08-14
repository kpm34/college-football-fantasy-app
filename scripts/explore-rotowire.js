#!/usr/bin/env node

// This script explores Rotowire features - run it manually to see what's available
// DO NOT commit this file with credentials!

const { chromium } = require('playwright');

async function exploreRotowire() {
  console.log('🏈 Exploring Rotowire College Football Features...\n');
  
  const browser = await chromium.launch({
    headless: false, // Set to false to see the browser
    slowMo: 500 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Login
    console.log('1. Logging in...');
    await page.goto('https://www.rotowire.com/users/login.php');
    
    // Use the credentials you provided
    await page.fill('input[name="email"]', 'kashpm2002@gmail.com');
    await page.fill('input[name="password"]', '#Kash2002');
    
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    
    console.log('✅ Logged in successfully\n');
    
    // Explore main navigation
    console.log('2. Exploring main navigation...');
    await page.goto('https://www.rotowire.com/football/');
    await page.waitForTimeout(2000);
    
    // Look for college football section
    const cfbLink = await page.$('a[href*="college"]');
    if (cfbLink) {
      await cfbLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Check what features are available
    console.log('3. Available features for college football:\n');
    
    const features = await page.evaluate(() => {
      const items = [];
      
      // Look for navigation links
      document.querySelectorAll('nav a, .nav a, .menu a, [class*="nav"] a').forEach(link => {
        const href = link.href;
        const text = link.textContent?.trim();
        
        if (text && href && href.includes('rotowire.com')) {
          items.push(`${text}: ${href}`);
        }
      });
      
      // Look for data tables
      const tables = document.querySelectorAll('table');
      tables.forEach((table, index) => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim());
        if (headers.length > 0) {
          items.push(`\nTable ${index + 1} headers: ${headers.join(', ')}`);
        }
      });
      
      // Look for specific sections
      const sections = document.querySelectorAll('[class*="section"], [class*="widget"], [class*="module"]');
      sections.forEach(section => {
        const title = section.querySelector('h2, h3, h4')?.textContent?.trim();
        if (title) {
          items.push(`\nSection: ${title}`);
        }
      });
      
      return items;
    });
    
    features.forEach(feature => console.log(`- ${feature}`));
    
    // Check specific pages
    console.log('\n4. Checking specific pages...\n');
    
    const pagesToCheck = [
      { url: 'https://www.rotowire.com/football/news.php?league=CFB', name: 'CFB News' },
      { url: 'https://www.rotowire.com/football/injuries.php?league=CFB', name: 'CFB Injuries' },
      { url: 'https://www.rotowire.com/football/depth-charts.php?league=CFB', name: 'CFB Depth Charts' },
      { url: 'https://www.rotowire.com/football/stats.php?league=CFB', name: 'CFB Stats' },
      { url: 'https://www.rotowire.com/football/projections.php?league=CFB', name: 'CFB Projections' }
    ];
    
    for (const pageInfo of pagesToCheck) {
      try {
        console.log(`Checking ${pageInfo.name}...`);
        await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
        
        const hasContent = await page.evaluate(() => {
          const mainContent = document.querySelector('main, #content, .content, [class*="main"]');
          return mainContent ? mainContent.textContent?.length > 100 : false;
        });
        
        console.log(`✅ ${pageInfo.name}: ${hasContent ? 'Available' : 'Not found'}`);
        
        if (hasContent) {
          // Get a sample of what's on the page
          const sample = await page.evaluate(() => {
            const firstItems = [];
            // Try to find data items
            const items = document.querySelectorAll('.news-feed-item, .player-row, tr[data-player], .injury-item');
            items.forEach((item, index) => {
              if (index < 3) {
                firstItems.push(item.textContent?.trim().substring(0, 100) + '...');
              }
            });
            return firstItems;
          });
          
          if (sample.length > 0) {
            console.log('   Sample content:');
            sample.forEach(s => console.log(`   - ${s}`));
          }
        }
        
        await page.waitForTimeout(1000); // Be respectful between requests
      } catch (error) {
        console.log(`❌ ${pageInfo.name}: Error accessing page`);
      }
    }
    
    console.log('\n5. Key findings:');
    console.log('- News updates available');
    console.log('- Player injuries tracking');
    console.log('- Depth charts for teams');
    console.log('- Statistical data');
    console.log('- Game projections');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('\n\nPress any key to close the browser...');
    await page.waitForTimeout(5000); // Give time to see results
    await browser.close();
  }
}

exploreRotowire().catch(console.error);
