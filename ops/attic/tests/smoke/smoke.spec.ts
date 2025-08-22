/**
 * Smoke Tests - 30 Second Regression Detection
 * 
 * Critical path tests to catch major regressions after deployment
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Path Smoke Tests', () => {
  test('Homepage loads and displays key elements', async ({ page }) => {
    await page.goto('/');
    
    // Should load within 5 seconds
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
    
    // Key navigation should be present
    await expect(page.locator('nav')).toBeVisible();
    
    // Should have main content area
    await expect(page.locator('main')).toBeVisible();
    
    // No JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000); // Wait for any async loading
    expect(errors.filter(e => !e.includes('404') && !e.includes('Failed to load'))).toHaveLength(0);
  });

  test('API health check returns healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.services.appwrite.status).toBe(true);
  });

  test('Players API returns data', async ({ request }) => {
    const response = await request.get('/api/players?limit=5');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('documents');
    expect(Array.isArray(data.documents)).toBe(true);
  });

  test('Games API returns current week data', async ({ request }) => {
    const response = await request.get('/api/games');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('documents');
  });

  test('League management page is accessible', async ({ page }) => {
    await page.goto('/league');
    
    // Should not redirect to error page
    expect(page.url()).toContain('/league');
    
    // Should load main content
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    
    // Should have league-related content
    await expect(page.locator('text=/league|draft|fantasy/i').first()).toBeVisible();
  });

  test('Draft system is accessible', async ({ page }) => {
    await page.goto('/draft');
    
    // Should load without 500 errors
    expect(page.url()).toContain('/draft');
    
    // Should display draft interface or join prompt
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('Conference pages load correctly', async ({ page }) => {
    const conferences = ['/sec', '/acc', '/big12', '/bigten'];
    
    for (const conf of conferences) {
      await page.goto(conf);
      
      // Should load within 3 seconds
      await expect(page.locator('main')).toBeVisible({ timeout: 3000 });
      
      // Should have conference-specific content
      await expect(page.locator('text=/teams|players|conference/i').first()).toBeVisible();
    }
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input (common UI pattern)
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="find" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('quarterback');
      await searchInput.press('Enter');
      
      // Should show results or navigate somewhere
      await page.waitForTimeout(2000);
      
      // Verify no error page
      await expect(page.locator('text=/error|404|500/i')).not.toBeVisible();
    }
  });
});

test.describe('Performance Smoke Tests', () => {
  test('Homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 8 seconds (generous for smoke test)
    expect(loadTime).toBeLessThan(8000);
  });

  test('API endpoints respond within SLA', async ({ request }) => {
    const endpoints = [
      '/api/health',
      '/api/players?limit=1',
      '/api/games?limit=1'
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBeLessThan(400);
      expect(responseTime).toBeLessThan(5000); // 5 second SLA
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test('Mobile homepage is usable', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    
    await page.goto('/');
    
    // Should load on mobile
    await expect(page.locator('main')).toBeVisible();
    
    // Should have mobile navigation
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
    
    // Touch targets should be accessible
    const buttons = page.locator('button, a');
    const firstButton = buttons.first();
    
    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      if (box) {
        // Minimum touch target size (44px recommended)
        expect(Math.min(box.width, box.height)).toBeGreaterThan(32);
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('404 pages are handled gracefully', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    // Should show 404 page, not crash
    await expect(page.locator('main')).toBeVisible();
    
    // Should have navigation back to home
    await expect(page.locator('a[href="/"], a[href="/home"]')).toBeVisible();
  });

  test('API errors are handled gracefully', async ({ request }) => {
    const response = await request.get('/api/this-endpoint-does-not-exist');
    
    // Should return proper error response, not crash
    expect(response.status()).toBeGreaterThanOrEqual(400);
    
    const contentType = response.headers()['content-type'];
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      expect(data).toHaveProperty('message');
    }
  });
});