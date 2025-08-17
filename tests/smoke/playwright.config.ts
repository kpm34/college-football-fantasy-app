/**
 * Playwright Configuration for Smoke Tests
 * 
 * 30-second smoke tests to catch regressions post-deploy
 */

import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'https://cfbfantasy.app';

export default defineConfig({
  testDir: './smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/smoke-html' }],
    ['json', { outputFile: 'test-results/smoke-results.json' }],
    ['line']
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  timeout: 30000, // 30 second timeout per test
  globalTimeout: 300000, // 5 minute global timeout
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],
  
  // Run local dev server if testing locally
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});