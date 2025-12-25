import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000, // Global test timeout
  expect: { timeout: 5_000 },
  fullyParallel: true, // Enable parallel execution
  retries: process.env.CI ? 2 : 0, // Retries for CI
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true, // Headless for CI
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10_000,
    trace: 'on-first-retry', // Traces for debugging failures
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    baseURL: process.env.BASE_URL || 'https://demo.playwright.dev/todomvc',
    storageState: 'storageState.json', // For session reuse
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  ],
  workers: process.env.CI ? 4 : undefined, // Sharding for CI
});
