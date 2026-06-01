import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /criar conta/i })).toBeVisible();
  });

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /criar conta/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should show validation errors on empty login submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });
});
