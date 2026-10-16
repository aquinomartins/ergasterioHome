import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('desktop: explorar, buscar, salvar, retomar e concluir uma etapa', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sua curiosidade');
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.screenshot({ path: '/tmp/ergasterio-desktop.png', fullPage: true });
  await page.getByRole('searchbox').fill('anatomia');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Salvar Human Atlas no radar', exact: true }).click();
  await page.getByRole('button', { name: /Meu radar/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Human Atlas');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /Meu radar/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Human Atlas');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /TRILHA ABERTA.*A ciência de ver além/ }).click();
  await page.getByRole('button', { name: 'Concluir etapa 1', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('1 de 3 etapas');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Me surpreenda', exact: true }).click();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /Abrir experiência|Conhecer o projeto/ }),
  ).toHaveAttribute('href', /^https:\/\//);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Privacidade', exact: true }).click();
  await page.getByRole('button', { name: 'Apagar meus dados locais' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Meu radar/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Dê espaço à próxima descoberta.');
  expect(errors).toEqual([]);
});

test('mobile: menu, filtros, zero resultados, detalhes e ofertas honestas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Explorar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Abrir menu', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.getByRole('button', { name: 'Arte & criação', exact: true }).last().click();
  await expect(page.locator('.project-card')).not.toHaveCount(0);
  await page.getByRole('searchbox').fill('nenhum-resultado-xyz');
  await expect(page.getByText('Não encontramos esse tema por aqui.')).toBeVisible();
  await page.getByRole('button', { name: 'Explorar todas as experiências' }).click();
  await page.locator('.cover-open').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Veja o que está por vir' }).click();
  await expect(page.getByRole('dialog')).toContainText('Inscrições ainda não abertas');
  await page.getByRole('button', { name: 'Guardar no meu radar' }).click();
  await expect(page.getByRole('button', { name: 'No meu radar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.reload();
  await page.screenshot({ path: '/tmp/ergasterio-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('laboratório responde às variáveis e página atende às verificações automáticas de acessibilidade', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const figure = page.locator('.lab-visual svg');
  const before = await figure.locator('path[stroke="url(#lab-line)"]').getAttribute('d');
  await page.getByRole('button', { name: 'Equilíbrio', exact: true }).click();
  await expect(figure).toHaveAttribute('aria-label', /horizontal 1, vertical 1/);
  await expect(page.locator('.lab-insight')).toContainText('Frequências iguais');
  expect(await figure.locator('path[stroke="url(#lab-line)"]').getAttribute('d')).not.toBe(before);
  await page.getByRole('slider', { name: 'Frequência horizontal' }).fill('4');
  await expect(figure).toHaveAttribute('aria-label', /horizontal 4/);
  await page.getByRole('button', { name: 'Recomeçar o experimento' }).click();
  await expect(figure).toHaveAttribute('aria-label', /horizontal 2, vertical 3/);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  ).toEqual([]);
});

test('sem conexão para atualização o catálogo inicial continua disponível', async ({ page }) => {
  await page.route('**/data/repositories.json', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Me surpreenda', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Me surpreenda', exact: true })).toBeFocused();
});
