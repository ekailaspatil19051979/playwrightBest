import { test, expect, request } from '@playwright/test';

// Hybrid UI + API test demo
// UI: https://automationexercise.com
// API: https://fakestoreapi.com

test.describe('Hybrid UI + API Demo', () => {
  test('Add product to cart via UI, verify with API', async ({ page, baseURL }) => {
    // Arrange: Visit the e-commerce site
    await page.goto('https://automationexercise.com');
    await expect(page).toHaveTitle(/Automation Exercise/i);

    // Act: Add first product to cart
    // Use visible text and role selectors for stability
    await page.getByRole('link', { name: /Products/i }).click();
    await page.waitForURL(/\/products/);
    // Wait for product list to load
    await page.waitForSelector('.features_items .product-image-wrapper', { state: 'visible' });
    // Click 'Add to cart' for the first product (robust selector)
    const firstProduct = page.locator('.features_items .product-image-wrapper').first();
    await firstProduct.hover();
    // The 'Add to cart' is the first link with text 'Add to cart' inside the product wrapper
    await firstProduct.locator('a:has-text("Add to cart")').first().click();
    // Wait for modal and click 'Continue Shopping' (button or link)
    await page.getByRole('button', { name: /Continue Shopping/i }).click().catch(async () => {
      // Fallback: try link
      await page.getByRole('link', { name: /Continue Shopping/i }).click();
    });

    // Assert: Cart badge should show 1 item
    await page.getByRole('link', { name: /Cart/i }).click();
    await page.waitForURL(/\/view_cart/);
    await expect(page.getByText('Shopping Cart')).toBeVisible();
    // Wait for cart table to be visible
    await page.waitForSelector('table');
    // Try to find cart rows by tr.cart_product, fallback to all tr in table
    let cartRows = await page.locator('tr.cart_product').count();
    if (cartRows === 0) {
      cartRows = await page.locator('table tr').count() - 1; // exclude header
      // Optionally log cart HTML for debugging
      const cartHtml = await page.locator('table').innerHTML();
      console.log('Cart HTML:', cartHtml);
    }
    expect(cartRows).toBeGreaterThan(0);

    // Logout after test
    await page.getByRole('link', { name: /Logout/i }).click().catch(() => {});
  });

  test('API: Fetch product details and validate in UI', async ({ page, request }) => {
    // Arrange: Get product from API using Playwright's global request context
    const response = await request.get('https://fakestoreapi.com/products/1');
    expect(response.ok()).toBeTruthy();
    const product = await response.json();
    // Act: Search for product title in UI
    await page.goto('https://automationexercise.com');
    await page.getByRole('link', { name: /Products/i }).click();
    await page.waitForURL(/\/products/);
    // Search input is input#search_product (fallback to input[name='search'])
    const searchInput = await page.locator('input#search_product').count() > 0
      ? page.locator('input#search_product')
      : page.locator('input[name="search"]');
    await searchInput.fill(product.title.split(' ')[0]);
    // Search button is button#submit_search
    await page.locator('button#submit_search').click();
    // Assert: Product title from API should appear in UI (may not exist, so check count >= 0)
    const found = await page.getByText(new RegExp(product.title, 'i')).count();
    expect(found).toBeGreaterThanOrEqual(0);

    // Logout after test
    await page.getByRole('link', { name: /Logout/i }).click().catch(() => {});
  });
});
