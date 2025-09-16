import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { RotowireAuth } from './auth';

export interface RotowireNews {
  id: string;
  title: string;
  content: string;
  date: string;
  player?: string;
  team?: string;
  impact?: 'high' | 'medium' | 'low';
  category?: string;
}

export interface RotowireProjection {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  opponent: string;
  projectedPoints: number;
  passingYards?: number;
  passingTDs?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
}

export class RotowireScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;

  async initialize() {
    console.log('Initializing Rotowire scraper...');
    
    this.browser = await chromium.launch({
      headless: true
    });
    
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.context.newPage();
    
    // Set up request interception to be respectful
    await this.page.route('**/*', (route) => {
      const url = route.request().url();
      // Block unnecessary resources to be faster and lighter
      if (url.includes('google-analytics') || 
          url.includes('doubleclick') || 
          url.includes('facebook') ||
          url.includes('twitter')) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  async login() {
    if (!this.page) throw new Error('Browser not initialized');
    if (this.isLoggedIn) return;
    
    console.log('Logging into Rotowire...');
    const { username, password } = RotowireAuth.getCredentials();
    
    try {
      // Go to login page
      await this.page.goto('https://www.rotowire.com/users/login.php', {
        waitUntil: 'networkidle'
      });
      
      // Fill in credentials
      await this.page.fill('input[name="email"]', username);
      await this.page.fill('input[name="password"]', password);
      
      // Submit form
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        this.page.click('button[type="submit"]')
      ]);
      
      // Check if login was successful
      const url = this.page.url();
      if (url.includes('/users/login.php')) {
        throw new Error('Login failed - check credentials');
      }
      
      this.isLoggedIn = true;
      console.log('Successfully logged into Rotowire');
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCollegeFootballNews(): Promise<RotowireNews[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in');
    }
    
    console.log('Fetching college football news...');
    
    try {
      // Navigate to college football section
      await this.page.goto('https://www.rotowire.com/football/news.php?league=CFB', {
        waitUntil: 'networkidle'
      });
      
      // Wait for news items to load
      await this.page.waitForSelector('.news-feed-item', { timeout: 10000 });
      
      // Extract news data
      const news = await this.page.evaluate(() => {
        const items: any[] = [];
        const newsElements = document.querySelectorAll('.news-feed-item');
        
        newsElements.forEach((element, index) => {
          const titleEl = element.querySelector('.news-feed__headline');
          const contentEl = element.querySelector('.news-feed__news');
          const dateEl = element.querySelector('.news-feed__date');
          const playerEl = element.querySelector('.news-feed__player-link');
          const teamEl = element.querySelector('.news-feed__team');
          
          if (titleEl && contentEl) {
            items.push({
              id: `rw-news-${Date.now()}-${index}`,
              title: titleEl.textContent?.trim() || '',
              content: contentEl.textContent?.trim() || '',
              date: dateEl?.textContent?.trim() || new Date().toISOString(),
              player: playerEl?.textContent?.trim(),
              team: teamEl?.textContent?.trim(),
              impact: 'medium', // Would need more analysis to determine
              category: 'news'
            });
          }
        });
        
        return items;
      });
      
      console.log(`Found ${news.length} news items`);
      return news;
      
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  async getPlayerProjections(week: number): Promise<RotowireProjection[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in');
    }
    
    console.log(`Fetching projections for week ${week}...`);
    
    try {
      // Navigate to projections page
      await this.page.goto(`https://www.rotowire.com/football/projections.php?league=CFB&week=${week}`, {
        waitUntil: 'networkidle'
      });
      
      // Wait for projections table
      await this.page.waitForSelector('.projections-table', { timeout: 10000 });
      
      // Extract projection data
      const projections = await this.page.evaluate(() => {
        const items: any[] = [];
        const rows = document.querySelectorAll('.projections-table tbody tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length > 10) {
            items.push({
              playerId: row.getAttribute('data-player-id') || '',
              playerName: cells[0]?.textContent?.trim() || '',
              team: cells[1]?.textContent?.trim() || '',
              position: cells[2]?.textContent?.trim() || '',
              opponent: cells[3]?.textContent?.trim() || '',
              projectedPoints: parseFloat(cells[4]?.textContent || '0'),
              passingYards: parseFloat(cells[5]?.textContent || '0'),
              passingTDs: parseFloat(cells[6]?.textContent || '0'),
              rushingYards: parseFloat(cells[7]?.textContent || '0'),
              rushingTDs: parseFloat(cells[8]?.textContent || '0'),
              receptions: parseFloat(cells[9]?.textContent || '0'),
              receivingYards: parseFloat(cells[10]?.textContent || '0'),
              receivingTDs: parseFloat(cells[11]?.textContent || '0')
            });
          }
        });
        
        return items;
      });
      
      console.log(`Found ${projections.length} player projections`);
      return projections;
      
    } catch (error) {
      console.error('Error fetching projections:', error);
      return [];
    }
  }

  async getInjuryReports(): Promise<any[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in');
    }
    
    console.log('Fetching injury reports...');
    
    try {
      // Navigate to injuries page
      await this.page.goto('https://www.rotowire.com/football/injuries.php?league=CFB', {
        waitUntil: 'networkidle'
      });
      
      // Wait for injury table
      await this.page.waitForSelector('.injury-report', { timeout: 10000 });
      
      // Extract injury data
      const injuries = await this.page.evaluate(() => {
        const items: any[] = [];
        const rows = document.querySelectorAll('.injury-report tbody tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            const playerLink = cells[0].querySelector('a');
            const playerName = playerLink?.textContent?.trim() || '';
            const team = cells[1]?.textContent?.trim() || '';
            const position = cells[2]?.textContent?.trim() || '';
            const injury = cells[3]?.textContent?.trim() || '';
            const status = cells[4]?.textContent?.trim() || '';
            const lastUpdate = cells[5]?.textContent?.trim() || new Date().toISOString();
            
            if (playerName && team) {
              items.push({
                playerName,
                team,
                position,
                injury,
                status,
                lastUpdate,
                playerId: playerLink?.getAttribute('href')?.match(/player\/(\d+)/)?.[1] || ''
              });
            }
          }
        });
        
        return items;
      });
      
      console.log(`Found ${injuries.length} injury reports`);
      return injuries;
      
    } catch (error) {
      console.error('Error fetching injuries:', error);
      return [];
    }
  }

  async getDepthCharts(): Promise<any[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in');
    }
    
    console.log('Fetching depth charts...');
    
    try {
      // Navigate to depth charts page
      await this.page.goto('https://www.rotowire.com/football/depth-charts.php?league=CFB', {
        waitUntil: 'networkidle'
      });
      
      // Wait for depth chart data
      await this.page.waitForSelector('.depth-chart-team', { timeout: 10000 });
      
      // Extract depth chart data
      const depthCharts = await this.page.evaluate(() => {
        const items: any[] = [];
        
        // Each team has its own depth chart section
        const teamSections = document.querySelectorAll('.depth-chart-team');
        
        teamSections.forEach(section => {
          const teamName = section.querySelector('.team-name')?.textContent?.trim() || '';
          
          // Each position group
          const positionGroups = section.querySelectorAll('.position-group');
          
          positionGroups.forEach(group => {
            const position = group.querySelector('.position-label')?.textContent?.trim() || '';
            const players = group.querySelectorAll('.depth-player');
            
            players.forEach((player, index) => {
              const playerLink = player.querySelector('a');
              const playerName = playerLink?.textContent?.trim() || '';
              
              if (playerName) {
                items.push({
                  team: teamName,
                  position,
                  depth: index + 1,
                  playerName,
                  playerId: playerLink?.getAttribute('href')?.match(/player\/(\d+)/)?.[1] || '',
                  notes: player.querySelector('.player-note')?.textContent?.trim()
                });
              }
            });
          });
        });
        
        return items;
      });
      
      console.log(`Found ${depthCharts.length} depth chart entries`);
      return depthCharts;
      
    } catch (error) {
      console.error('Error fetching depth charts:', error);
      return [];
    }
  }

  async getAvailableFeatures() {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in');
    }
    
    console.log('Exploring available Rotowire features...');
    
    try {
      // Go to main college football page
      await this.page.goto('https://www.rotowire.com/football/college-football.php', {
        waitUntil: 'networkidle'
      });
      
      // Look for available sections
      const features = await this.page.evaluate(() => {
        const links: any[] = [];
        const navLinks = document.querySelectorAll('a[href*="/football/"]');
        
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          const text = link.textContent?.trim();
          
          if (href && text && href.includes('CFB')) {
            links.push({
              url: href,
              feature: text,
              category: href.includes('news') ? 'news' : 
                       href.includes('projections') ? 'projections' :
                       href.includes('stats') ? 'stats' :
                       href.includes('injuries') ? 'injuries' :
                       href.includes('depth') ? 'depth-charts' : 'other'
            });
          }
        });
        
        return links;
      });
      
      console.log('Available features:', features);
      return features;
      
    } catch (error) {
      console.error('Error exploring features:', error);
      return [];
    }
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    
    this.page = null;
    this.context = null;
    this.browser = null;
    this.isLoggedIn = false;
  }
}
