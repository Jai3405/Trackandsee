import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/personal/today');
});

test('calendar: add an event from a day cell', async ({ page }) => {
  await page.goto('/personal/calendar');
  await expect(page.getByRole('heading', { name: /\w+ \d{4}/, level: 1 })).toBeVisible();

  const today = new Date();
  const dayLabel = String(today.getUTCDate());
  await page.getByRole('link', { name: dayLabel, exact: true }).first().click();

  await page.getByLabel('Title').fill('E2E verify: studio walkthrough');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByText('E2E verify: studio walkthrough')).toBeVisible();
});

test('expenses: add, edit to investment, then delete', async ({ page }) => {
  await page.goto('/personal/expenses');
  await expect(page.getByRole('heading', { name: 'Expenses', level: 1 })).toBeVisible();

  const today = new Date().toISOString().slice(0, 10);
  await page.locator('input[type="date"]').first().fill(today);
  await page.getByPlaceholder('Amount').fill('42.50');
  await page.getByPlaceholder('Description').fill('E2E verify: test expense');
  await page.getByRole('button', { name: 'Add expense' }).click();

  const row = page.getByText('E2E verify: test expense');
  await expect(row).toBeVisible();

  await row.click();
  const kindSelect = page.getByLabel('Kind');
  await kindSelect.selectOption('investment');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('heading', { name: 'Investments', level: 2 })).toBeVisible();
  await expect(page.getByText('E2E verify: test expense')).toBeVisible();

  // Scope to this specific investment's card (the innermost matching div) so the
  // click lands on its own Delete button, not some other row's.
  const card = page.locator('div', { hasText: 'E2E verify: test expense' }).last();
  page.once('dialog', (dialog) => dialog.accept());
  await card.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('E2E verify: test expense')).not.toBeVisible();
});
