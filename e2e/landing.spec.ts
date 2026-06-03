import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/go lev/i);
  });

  test('should navigate to pricing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /preços/i }).click();
    await expect(page).toHaveURL('/pricing');
  });

  test('should navigate to features', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /features/i }).click();
    await expect(page).toHaveURL('/features');
  });
});
