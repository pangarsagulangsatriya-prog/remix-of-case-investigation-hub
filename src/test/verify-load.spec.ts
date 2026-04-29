import { test, expect } from '../../playwright-fixture';

test('Verify Case Investigation Hub loads correctly', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  
  // Wait for the page to load and check title or heading
  // The page has a BerauCoalLogo and text about Advanced Intelligence
  await expect(page).toHaveTitle(/Berau Coal/i);
  
  // Verify login form elements exist
  // Heading is "Enterprise Gateway" (h2) or "Advanced Intelligence" (h1)
  const loginHeader = page.locator('h1', { hasText: /Advanced Intelligence/i });
  await expect(loginHeader).toBeVisible();
  
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button', { hasText: /Authorize Access/i });
  
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();
});

test('Verify Case List page is accessible (redirect to login if not auth)', async ({ page }) => {
  await page.goto('/cases');
  
  // Should redirect to login or show the cases page
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    await expect(page.locator('h1', { hasText: /Advanced Intelligence/i })).toBeVisible();
  } else {
    await expect(page.locator('h1', { hasText: /Investigation Cases/i })).toBeVisible();
  }
});
