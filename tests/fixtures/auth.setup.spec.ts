import { test } from '@playwright/test';

test('Login and save storage state', async ({ page }) => {
    // Pause for manual inspection
    // Go to the login page
    await page.goto('https://automationexercise.com/login');
    // Pause for manual inspection
    await page.pause();

  // Manual inspection only; no further actions after pause
  await page.context().storageState({ path: 'storageState.json' });
});
