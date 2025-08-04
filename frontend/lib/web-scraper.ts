/**
 * Advanced Web Scraping Tool with Chromium Capabilities
 * Provides dynamic web scraping with JavaScript rendering, similar to ChatGPT's browsing
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as cheerio from 'cheerio';
import { z } from 'zod';

// Configuration schema
const ScraperConfigSchema = z.object({
  headless: z.boolean().default(true),
  timeout: z.number().default(30000),
  waitForSelector: z.string().optional(),
  userAgent: z.string().optional(),
  viewport: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080)
  }).optional(),
  cookies: z.array(z.object({
    name: z.string(),
    value: z.string(),
    domain: z.string(),
    path: z.string().default('/')
  })).optional(),
  headers: z.record(z.string()).optional(),
  javascript: z.boolean().default(true),
  screenshots: z.boolean().default(false),
  proxy: z.object({
    server: z.string(),
    username: z.string().optional(),
    password: z.string().optional()
  }).optional()
});

type ScraperConfig = z.infer<typeof ScraperConfigSchema>;

// Result types
interface ScrapeResult {
  url: string;
  title: string;
  content: string;
  html: string;
  text: string;
  links: string[];
  images: string[];
  metadata: Record<string, any>;
  screenshot?: string;
  error?: string;
  timestamp: string;
}

interface ElementData {
  text: string;
  html: string;
  attributes: Record<string, string>;
  children?: ElementData[];
}

export class WebScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: ScraperConfig;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = ScraperConfigSchema.parse(config);
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) return;

    const launchOptions: any = {
      headless: this.config.headless,
      timeout: this.config.timeout,
    };

    if (this.config.proxy) {
      launchOptions.proxy = this.config.proxy;
    }

    this.browser = await chromium.launch(launchOptions);
    
    const contextOptions: any = {
      viewport: this.config.viewport,
      userAgent: this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      javaScriptEnabled: this.config.javascript,
    };

    if (this.config.headers) {
      contextOptions.extraHTTPHeaders = this.config.headers;
    }

    this.context = await this.browser.newContext(contextOptions);

    if (this.config.cookies) {
      await this.context.addCookies(this.config.cookies);
    }
  }

  /**
   * Scrape a single URL with full rendering
   */
  async scrape(url: string, options: {
    waitForSelector?: string;
    waitForTimeout?: number;
    scrollToBottom?: boolean;
    clickElements?: string[];
    fillForms?: Array<{ selector: string; value: string }>;
    extractors?: Record<string, string>;
    screenshot?: boolean;
  } = {}): Promise<ScrapeResult> {
    await this.initialize();
    
    const page = await this.context!.newPage();
    const result: ScrapeResult = {
      url,
      title: '',
      content: '',
      html: '',
      text: '',
      links: [],
      images: [],
      metadata: {},
      timestamp: new Date().toISOString()
    };

    try {
      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });

      // Wait for specific selector if provided
      if (options.waitForSelector || this.config.waitForSelector) {
        await page.waitForSelector(
          options.waitForSelector || this.config.waitForSelector!,
          { timeout: this.config.timeout }
        );
      }

      // Wait for additional time if specified
      if (options.waitForTimeout) {
        await page.waitForTimeout(options.waitForTimeout);
      }

      // Scroll to bottom to load lazy content
      if (options.scrollToBottom) {
        await this.scrollToBottom(page);
      }

      // Click elements if specified
      if (options.clickElements) {
        for (const selector of options.clickElements) {
          try {
            await page.click(selector);
            await page.waitForTimeout(1000);
          } catch (e) {
            console.warn(`Could not click ${selector}:`, e);
          }
        }
      }

      // Fill forms if specified
      if (options.fillForms) {
        for (const { selector, value } of options.fillForms) {
          try {
            await page.fill(selector, value);
          } catch (e) {
            console.warn(`Could not fill ${selector}:`, e);
          }
        }
      }

      // Get page content
      result.html = await page.content();
      result.title = await page.title();
      result.text = await page.innerText('body');

      // Extract all links
      result.links = await page.$$eval('a[href]', links =>
        links.map(link => (link as HTMLAnchorElement).href)
          .filter(href => href && !href.startsWith('javascript:'))
      );

      // Extract all images
      result.images = await page.$$eval('img[src]', images =>
        images.map(img => (img as HTMLImageElement).src)
          .filter(src => src && src.startsWith('http'))
      );

      // Extract metadata
      result.metadata = await this.extractMetadata(page);

      // Apply custom extractors
      if (options.extractors) {
        for (const [key, selector] of Object.entries(options.extractors)) {
          try {
            result.metadata[key] = await page.$eval(selector, el => el.textContent?.trim());
          } catch (e) {
            result.metadata[key] = null;
          }
        }
      }

      // Take screenshot if requested
      if (options.screenshot || this.config.screenshots) {
        result.screenshot = await page.screenshot({ 
          encoding: 'base64',
          fullPage: true 
        });
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    } finally {
      await page.close();
    }

    return result;
  }

  /**
   * Scrape multiple URLs in parallel
   */
  async scrapeMultiple(
    urls: string[],
    options: Parameters<typeof this.scrape>[1] = {},
    concurrency: number = 3
  ): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(url => this.scrape(url, options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Search and scrape - performs a search and scrapes results
   */
  async searchAndScrape(query: string, options: {
    searchEngine?: 'google' | 'bing' | 'duckduckgo';
    maxResults?: number;
    scrapeResults?: boolean;
  } = {}): Promise<{
    query: string;
    searchResults: Array<{ title: string; url: string; snippet: string }>;
    scrapedContent?: ScrapeResult[];
  }> {
    const searchEngine = options.searchEngine || 'google';
    const maxResults = options.maxResults || 10;
    
    let searchUrl: string;
    switch (searchEngine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
    }

    await this.initialize();
    const page = await this.context!.newPage();
    
    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      // Extract search results based on search engine
      let searchResults: Array<{ title: string; url: string; snippet: string }> = [];
      
      if (searchEngine === 'google') {
        searchResults = await page.$$eval('div.g', (elements) => 
          elements.slice(0, 10).map(el => {
            const titleEl = el.querySelector('h3');
            const linkEl = el.querySelector('a');
            const snippetEl = el.querySelector('.VwiC3b');
            
            return {
              title: titleEl?.textContent || '',
              url: linkEl?.href || '',
              snippet: snippetEl?.textContent || ''
            };
          }).filter(r => r.url && r.title)
        );
      }
      
      // Limit results
      searchResults = searchResults.slice(0, maxResults);
      
      // Optionally scrape the result pages
      let scrapedContent: ScrapeResult[] | undefined;
      if (options.scrapeResults) {
        const urls = searchResults.map(r => r.url);
        scrapedContent = await this.scrapeMultiple(urls);
      }
      
      return {
        query,
        searchResults,
        scrapedContent
      };
      
    } finally {
      await page.close();
    }
  }

  /**
   * Extract structured data from a page
   */
  async extractStructuredData(url: string, schema: {
    [key: string]: {
      selector: string;
      attribute?: string;
      multiple?: boolean;
      transform?: (value: string) => any;
    }
  }): Promise<Record<string, any>> {
    const scrapeResult = await this.scrape(url);
    const $ = cheerio.load(scrapeResult.html);
    const data: Record<string, any> = {};
    
    for (const [key, config] of Object.entries(schema)) {
      if (config.multiple) {
        data[key] = $(config.selector).map((_, el) => {
          const value = config.attribute 
            ? $(el).attr(config.attribute)
            : $(el).text().trim();
          return config.transform ? config.transform(value || '') : value;
        }).get();
      } else {
        const element = $(config.selector).first();
        const value = config.attribute 
          ? element.attr(config.attribute)
          : element.text().trim();
        data[key] = config.transform ? config.transform(value || '') : value;
      }
    }
    
    return data;
  }

  /**
   * Monitor a page for changes
   */
  async monitor(url: string, options: {
    interval: number;
    selector?: string;
    onChange: (oldContent: string, newContent: string) => void;
    maxChecks?: number;
  }): Promise<void> {
    let previousContent = '';
    let checks = 0;
    const maxChecks = options.maxChecks || Infinity;
    
    const check = async () => {
      if (checks >= maxChecks) return;
      
      const result = await this.scrape(url, {
        waitForSelector: options.selector
      });
      
      const currentContent = options.selector 
        ? cheerio.load(result.html)(options.selector).html() || ''
        : result.html;
      
      if (previousContent && previousContent !== currentContent) {
        options.onChange(previousContent, currentContent);
      }
      
      previousContent = currentContent;
      checks++;
      
      if (checks < maxChecks) {
        setTimeout(check, options.interval);
      }
    };
    
    await check();
  }

  /**
   * Extract tables from a page
   */
  async extractTables(url: string): Promise<Array<{
    headers: string[];
    rows: string[][];
  }>> {
    const result = await this.scrape(url);
    const $ = cheerio.load(result.html);
    const tables: Array<{ headers: string[]; rows: string[][] }> = [];
    
    $('table').each((_, table) => {
      const headers: string[] = [];
      const rows: string[][] = [];
      
      // Extract headers
      $(table).find('thead th, thead td').each((_, cell) => {
        headers.push($(cell).text().trim());
      });
      
      // If no thead, try first row
      if (headers.length === 0) {
        $(table).find('tr').first().find('th, td').each((_, cell) => {
          headers.push($(cell).text().trim());
        });
      }
      
      // Extract rows
      $(table).find('tbody tr').each((_, row) => {
        const rowData: string[] = [];
        $(row).find('td').each((_, cell) => {
          rowData.push($(cell).text().trim());
        });
        if (rowData.length > 0) {
          rows.push(rowData);
        }
      });
      
      if (headers.length > 0 || rows.length > 0) {
        tables.push({ headers, rows });
      }
    });
    
    return tables;
  }

  /**
   * Scroll to the bottom of the page to load lazy content
   */
  private async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(async () => {
      const distance = 100;
      const delay = 100;
      const height = document.body.scrollHeight;
      
      for (let i = 0; i < height; i += distance) {
        window.scrollBy(0, distance);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    });
  }

  /**
   * Extract metadata from the page
   */
  private async extractMetadata(page: Page): Promise<Record<string, any>> {
    return await page.evaluate(() => {
      const metadata: Record<string, any> = {};
      
      // Open Graph tags
      document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
        const property = meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (property && content) {
          metadata[property] = content;
        }
      });
      
      // Twitter Card tags
      document.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
        const name = meta.getAttribute('name');
        const content = meta.getAttribute('content');
        if (name && content) {
          metadata[name] = content;
        }
      });
      
      // Standard meta tags
      const description = document.querySelector('meta[name="description"]');
      if (description) {
        metadata.description = description.getAttribute('content');
      }
      
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        metadata.keywords = keywords.getAttribute('content');
      }
      
      const author = document.querySelector('meta[name="author"]');
      if (author) {
        metadata.author = author.getAttribute('content');
      }
      
      // JSON-LD structured data
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      if (jsonLd) {
        try {
          metadata.structuredData = JSON.parse(jsonLd.textContent || '{}');
        } catch (e) {
          // Invalid JSON
        }
      }
      
      return metadata;
    });
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export helper functions for common use cases
export async function quickScrape(url: string): Promise<ScrapeResult> {
  const scraper = new WebScraper();
  try {
    return await scraper.scrape(url);
  } finally {
    await scraper.close();
  }
}

export async function scrapeWithWait(
  url: string, 
  waitForSelector: string
): Promise<ScrapeResult> {
  const scraper = new WebScraper();
  try {
    return await scraper.scrape(url, { waitForSelector });
  } finally {
    await scraper.close();
  }
}

export async function searchGoogle(
  query: string,
  scrapeResults: boolean = false
): Promise<any> {
  const scraper = new WebScraper();
  try {
    return await scraper.searchAndScrape(query, { 
      searchEngine: 'google',
      scrapeResults 
    });
  } finally {
    await scraper.close();
  }
}