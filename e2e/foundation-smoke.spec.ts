import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/personal/today');
});

test('create a goal, add an action item, complete it', async ({ page }) => {
  await page.goto('/personal/goals');
  await page.getByPlaceholder('New goal title').fill('Launch spring collection');
  await page.getByRole('button', { name: 'New goal' }).click();
  await expect(page.getByText('Launch spring collection')).toBeVisible();

  await page.getByText('Launch spring collection').click();
  await page.getByPlaceholder('Action item title').fill('Source fabric samples');
  await page.getByRole('button', { name: 'Add action item' }).click();
  await page.getByLabel('Source fabric samples').check();
  await expect(page.getByText('1 of 1')).toBeVisible();
});

test('offline create syncs on reconnect', async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto('/personal/goals');
  await page.getByPlaceholder('New goal title').fill('Offline-created goal');
  await page.getByRole('button', { name: 'New goal' }).click();
  await expect(page.getByText('Offline-created goal')).toBeVisible();
  await expect(page.getByTestId('sync-indicator')).toContainText('Pending');

  await context.setOffline(false);
  await expect(page.getByTestId('sync-indicator')).toContainText('Synced', { timeout: 15_000 });
});
