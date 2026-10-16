import { test, expect } from '@playwright/test';

test('a Home abre sem depender de arquivos JS, CSS ou fontes externos', async ({ page }) => {
  const errors = [];
  const externalAssets = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.route('**/*', (route) => {
    if (['script', 'stylesheet', 'font'].includes(route.request().resourceType())) {
      externalAssets.push(route.request().url());
      return route.abort();
    }
    return route.fallback();
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sua curiosidade');
  await expect(page.locator('.project-card')).toHaveCount(3);
  expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    'rgb(16, 23, 16)',
  );
  await page.getByRole('searchbox').fill('anatomia');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Salvar Human Atlas no radar', exact: true }).click();
  await page.getByRole('button', { name: /Meu radar/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Human Atlas');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Equilíbrio', exact: true }).click();
  await expect(page.locator('.lab-insight')).toContainText('Frequências iguais');
  expect(externalAssets).toEqual([]);
  expect(errors).toEqual([]);
});

test('em celular o catálogo inicial funciona mesmo se os arquivos de atualização falharem', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/data/repositories.json', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.project-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Me surpreenda', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
