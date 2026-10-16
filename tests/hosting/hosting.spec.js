import { test, expect } from '@playwright/test';
test('HTML publicado funciona sem scripts, estilos ou fontes externos', async ({ page }) => {
  const errors = [],
    assets = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.route('**/*', (route) => {
    if (['script', 'stylesheet', 'font'].includes(route.request().resourceType())) {
      assets.push(route.request().url());
      return route.abort();
    }
    return route.fallback();
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Olá, curiosidade.');
  await expect(page.locator('.shortcut-grid .project-card')).toHaveCount(4);
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    'rgb(245, 246, 248)',
  );
  await page.getByRole('button', { name: 'No servidor', exact: true }).click();
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(17);
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await page.getByRole('searchbox').fill('anatomia');
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(1);
  await page
    .locator('.catalog-section')
    .getByRole('button', { name: 'Salvar Human Atlas no radar', exact: true })
    .click();
  await page
    .getByRole('navigation')
    .getByRole('button', { name: /Meu radar/ })
    .click();
  await expect(page.locator('.catalog-section')).toContainText('Human Atlas');
  await page.getByRole('navigation').getByRole('button', { name: 'Trilhas', exact: true }).click();
  await page.getByRole('button', { name: 'Equilíbrio', exact: true }).click();
  await expect(page.locator('.lab-insight')).toContainText('Frequências iguais');
  expect(assets).toEqual([]);
  expect(errors).toEqual([]);
});
test('celular abre catálogo mesmo com atualização indisponível', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/projects.php', (route) => route.abort());
  await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(29);
  await page.getByRole('button', { name: 'Me surpreenda', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
