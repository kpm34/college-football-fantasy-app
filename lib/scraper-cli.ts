#!/usr/bin/env node

/**
 * CLI Interface for Web Scraper
 * Provides command-line access to web scraping functionality
 */

import { Command } from 'commander';
import { WebScraper, quickScrape, searchGoogle } from './web-scraper';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('scraper')
  .description('Advanced web scraping tool with Chromium capabilities')
  .version('1.0.0');

// Scrape command
program
  .command('scrape <url>')
  .description('Scrape a single URL')
  .option('-w, --wait <selector>', 'Wait for selector before scraping')
  .option('-s, --screenshot', 'Take a screenshot')
  .option('-o, --output <file>', 'Output file (json or html)')
  .option('--scroll', 'Scroll to bottom to load lazy content')
  .option('--timeout <ms>', 'Timeout in milliseconds', '30000')
  .option('--headless <bool>', 'Run in headless mode', 'true')
  .action(async (url, options) => {
    const spinner = ora('Scraping ' + chalk.blue(url)).start();
    
    try {
      const scraper = new WebScraper({
        headless: options.headless === 'true',
        timeout: parseInt(options.timeout),
        screenshots: options.screenshot
      });
      
      const result = await scraper.scrape(url, {
        waitForSelector: options.wait,
        scrollToBottom: options.scroll,
        screenshot: options.screenshot
      });
      
      await scraper.close();
      
      spinner.succeed('Scraping completed');
      
      // Save output if specified
      if (options.output) {
        const ext = path.extname(options.output);
        let content: string;
        
        if (ext === '.html') {
          content = result.html;
        } else {
          content = JSON.stringify(result, null, 2);
        }
        
        await fs.writeFile(options.output, content);
        console.log(chalk.green(`✓ Saved to ${options.output}`));
      } else {
        // Display summary
        console.log('\n' + chalk.bold('Title:'), result.title);
        console.log(chalk.bold('URL:'), result.url);
        console.log(chalk.bold('Links found:'), result.links.length);
        console.log(chalk.bold('Images found:'), result.images.length);
        console.log(chalk.bold('Text length:'), result.text.length, 'characters');
        
        if (result.metadata.description) {
          console.log(chalk.bold('Description:'), result.metadata.description);
        }
        
        if (result.error) {
          console.log(chalk.red('Error:'), result.error);
        }
      }
      
      if (result.screenshot && !options.output) {
        const screenshotPath = `screenshot-${Date.now()}.png`;
        await fs.writeFile(screenshotPath, result.screenshot, 'base64');
        console.log(chalk.green(`✓ Screenshot saved to ${screenshotPath}`));
      }
      
    } catch (error) {
      spinner.fail('Scraping failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Search command
program
  .command('search <query>')
  .description('Search and optionally scrape results')
  .option('-e, --engine <engine>', 'Search engine (google, bing, duckduckgo)', 'google')
  .option('-n, --max <number>', 'Maximum results', '10')
  .option('-s, --scrape', 'Scrape the search results')
  .option('-o, --output <file>', 'Output file')
  .action(async (query, options) => {
    const spinner = ora(`Searching for "${chalk.blue(query)}"`).start();
    
    try {
      const scraper = new WebScraper();
      const results = await scraper.searchAndScrape(query, {
        searchEngine: options.engine as any,
        maxResults: parseInt(options.max),
        scrapeResults: options.scrape
      });
      
      await scraper.close();
      
      spinner.succeed('Search completed');
      
      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(results, null, 2));
        console.log(chalk.green(`✓ Saved to ${options.output}`));
      } else {
        console.log('\n' + chalk.bold('Search Results:'));
        results.searchResults.forEach((result, index) => {
          console.log(`\n${chalk.yellow(`${index + 1}.`)} ${chalk.bold(result.title)}`);
          console.log(chalk.gray(result.url));
          console.log(result.snippet);
        });
        
        if (results.scrapedContent) {
          console.log('\n' + chalk.bold('Scraped Content Summary:'));
          results.scrapedContent.forEach((content, index) => {
            console.log(`${index + 1}. ${content.title} - ${content.text.length} chars`);
          });
        }
      }
    } catch (error) {
      spinner.fail('Search failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Extract command
program
  .command('extract <url>')
  .description('Extract structured data from a URL')
  .option('-t, --tables', 'Extract tables')
  .option('-l, --links', 'Extract all links')
  .option('-i, --images', 'Extract all images')
  .option('-m, --metadata', 'Extract metadata')
  .option('-o, --output <file>', 'Output file')
  .action(async (url, options) => {
    const spinner = ora('Extracting data from ' + chalk.blue(url)).start();
    
    try {
      const scraper = new WebScraper();
      const result = await scraper.scrape(url);
      const extracted: any = {};
      
      if (options.tables) {
        extracted.tables = await scraper.extractTables(url);
      }
      
      if (options.links) {
        extracted.links = result.links;
      }
      
      if (options.images) {
        extracted.images = result.images;
      }
      
      if (options.metadata) {
        extracted.metadata = result.metadata;
      }
      
      // If no specific options, extract everything
      if (!options.tables && !options.links && !options.images && !options.metadata) {
        extracted.tables = await scraper.extractTables(url);
        extracted.links = result.links;
        extracted.images = result.images;
        extracted.metadata = result.metadata;
      }
      
      await scraper.close();
      
      spinner.succeed('Extraction completed');
      
      if (options.output) {
        await fs.writeFile(options.output, JSON.stringify(extracted, null, 2));
        console.log(chalk.green(`✓ Saved to ${options.output}`));
      } else {
        console.log('\n' + chalk.bold('Extracted Data:'));
        
        if (extracted.tables) {
          console.log(chalk.yellow(`Tables found: ${extracted.tables.length}`));
        }
        
        if (extracted.links) {
          console.log(chalk.yellow(`Links found: ${extracted.links.length}`));
          console.log('First 5 links:', extracted.links.slice(0, 5));
        }
        
        if (extracted.images) {
          console.log(chalk.yellow(`Images found: ${extracted.images.length}`));
          console.log('First 5 images:', extracted.images.slice(0, 5));
        }
        
        if (extracted.metadata) {
          console.log(chalk.yellow('Metadata:'));
          console.log(JSON.stringify(extracted.metadata, null, 2));
        }
      }
    } catch (error) {
      spinner.fail('Extraction failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Monitor command
program
  .command('monitor <url>')
  .description('Monitor a URL for changes')
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '60000')
  .option('-s, --selector <selector>', 'Specific selector to monitor')
  .option('-n, --max-checks <number>', 'Maximum number of checks')
  .action(async (url, options) => {
    console.log(chalk.bold('Monitoring'), chalk.blue(url));
    console.log(chalk.gray(`Checking every ${options.interval}ms`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    const scraper = new WebScraper();
    
    let changeCount = 0;
    await scraper.monitor(url, {
      interval: parseInt(options.interval),
      selector: options.selector,
      maxChecks: options.maxChecks ? parseInt(options.maxChecks) : undefined,
      onChange: (oldContent, newContent) => {
        changeCount++;
        const timestamp = new Date().toLocaleTimeString();
        console.log(chalk.yellow(`[${timestamp}] Change #${changeCount} detected!`));
        
        if (options.selector) {
          console.log('Content changed in', chalk.blue(options.selector));
        }
        
        // Save change to file
        const changeFile = `change-${Date.now()}.html`;
        fs.writeFile(changeFile, newContent).then(() => {
          console.log(chalk.green(`✓ Change saved to ${changeFile}\n`));
        });
      }
    });
    
    process.on('SIGINT', async () => {
      console.log('\n' + chalk.yellow('Stopping monitor...'));
      await scraper.close();
      process.exit(0);
    });
  });

// Batch command
program
  .command('batch <file>')
  .description('Scrape multiple URLs from a file')
  .option('-c, --concurrency <number>', 'Number of concurrent scrapers', '3')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (file, options) => {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const urls = content.split('\n').filter(url => url.trim());
      
      console.log(chalk.bold(`Scraping ${urls.length} URLs`));
      
      const scraper = new WebScraper();
      const spinner = ora('Starting batch scrape...').start();
      
      const results = await scraper.scrapeMultiple(
        urls,
        {},
        parseInt(options.concurrency)
      );
      
      await scraper.close();
      
      spinner.succeed('Batch scraping completed');
      
      if (options.output) {
        await fs.mkdir(options.output, { recursive: true });
        
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const filename = `result-${i + 1}.json`;
          const filepath = path.join(options.output, filename);
          await fs.writeFile(filepath, JSON.stringify(result, null, 2));
        }
        
        console.log(chalk.green(`✓ Saved ${results.length} files to ${options.output}`));
      } else {
        console.log('\n' + chalk.bold('Results Summary:'));
        results.forEach((result, index) => {
          const status = result.error ? chalk.red('✗') : chalk.green('✓');
          console.log(`${status} ${index + 1}. ${result.url} - ${result.title || 'No title'}`);
          if (result.error) {
            console.log(chalk.red(`   Error: ${result.error}`));
          }
        });
      }
      
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;
      
      console.log('\n' + chalk.bold('Summary:'));
      console.log(chalk.green(`Successful: ${successful}`));
      if (failed > 0) {
        console.log(chalk.red(`Failed: ${failed}`));
      }
      
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);