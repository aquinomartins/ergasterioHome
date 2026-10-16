import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import config from '../../ergasterio-projects.json' with { type: 'json' };
import { initialServerProjects } from '../../src/lib/server-catalog.mjs';
const snapshot = () => ({
  schemaVersion: 1,
  owner: config.owner,
  scannedAt: new Date().toISOString(),
  projects: initialServerProjects(config),
});
test.beforeEach(async ({ page }) => {
  await page.route('**/projects.php', (route) => route.fulfill({ json: snapshot() }));
});

test('desktop: todos os projetos, busca, radar persistente, trilhas e descoberta', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Olá, curiosidade.');
  await expect(page.locator('.sync-status')).toHaveText('Índice atualizado');
  await expect(page.locator('.shortcut-grid .project-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'No servidor', exact: true }).click();
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(17);
  await page.getByRole('button', { name: 'Visualização em lista' }).click();
  await expect(page.locator('.project-list-row')).toHaveCount(17);
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await page.getByRole('button', { name: 'Visualização em cartões' }).click();
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
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(1);
  await page.reload();
  await page
    .getByRole('navigation')
    .getByRole('button', { name: /Meu radar/ })
    .click();
  await expect(page.locator('.catalog-section')).toContainText('Human Atlas');
  await page.getByRole('navigation').getByRole('button', { name: 'Trilhas', exact: true }).click();
  await page.locator('.track-card').first().click();
  await page.getByRole('button', { name: 'Concluir etapa 1', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('1 de 3 etapas');
  await page.keyboard.press('Escape');
  await page.getByRole('navigation').getByRole('button', { name: 'Início', exact: true }).click();
  await page.getByRole('button', { name: 'Me surpreenda', exact: true }).click();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: /Abrir projeto|Ver repositório/ }),
  ).toHaveAttribute('href', /^(https:\/\/|\/)/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Me surpreenda', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Privacidade', exact: true }).click();
  await page.getByRole('button', { name: 'Apagar meus dados locais' }).click();
  await page.keyboard.press('Escape');
  await page
    .getByRole('navigation')
    .getByRole('button', { name: /Meu radar/ })
    .click();
  await expect(page.locator('.empty-state')).toContainText('Dê espaço à próxima descoberta.');
  expect(errors).toEqual([]);
});

test('índice atualizado acrescenta uma pasta nova sem reconstruir nem duplicar vínculos', async ({
  page,
}) => {
  let data = snapshot();
  await page.route('**/projects.php', (route) => route.fulfill({ json: data }));
  await page.goto('/');
  await expect(page.locator('.sync-status')).toHaveText('Índice atualizado');
  const count = await page.locator('.catalog-section .project-card').count();
  await expect(
    page
      .locator('.catalog-section .project-card')
      .filter({ has: page.getByRole('heading', { name: 'Andante', exact: true }) }),
  ).toHaveCount(1);
  data = {
    ...data,
    projects: [
      ...data.projects,
      {
        folder: 'laboratorio-novo',
        name: 'Laboratório do futuro',
        description: 'Experiência nova',
        category: 'Ciência',
        entry: 'index.html',
        published: true,
      },
    ],
  };
  await page.getByRole('button', { name: 'Atualizar catálogo', exact: true }).click();
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(count + 1);
  await page
    .locator('.catalog-section')
    .getByRole('button', { name: 'Conhecer Laboratório do futuro' })
    .click();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Abrir projeto' }),
  ).toHaveAttribute('href', '/laboratorio-novo/index.html');
});

test('mobile: navegação, filtros, detalhes, ofertas e ausência de rolagem horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Projetos', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Abrir menu', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.getByRole('button', { name: 'Engenharia', exact: true }).click();
  await expect(page.locator('.catalog-section .project-card')).not.toHaveCount(0);
  await page.getByRole('searchbox').fill('nenhum-resultado-xyz');
  await expect(page.locator('.empty-state')).toContainText('Uma nova descoberta');
  await page.getByRole('button', { name: 'Explorar catálogo', exact: true }).click();
  await page.locator('.catalog-section .card-action').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Início', exact: true }).click();
  await page.getByRole('button', { name: 'Conhecer as formações' }).click();
  await expect(page.getByRole('dialog')).toContainText('Inscrições ainda não abertas');
  await page.getByRole('button', { name: 'Guardar no meu radar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'No meu radar', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('.sync-status')).toHaveText('Índice atualizado');
  await page.screenshot({ path: '/tmp/ergasterio-mobile-final.png', fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('laboratório interativo e acessibilidade nas vistas principais', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const check = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  };
  await check();
  await page.screenshot({ path: '/tmp/ergasterio-desktop-final.png', fullPage: true });
  await page.getByRole('navigation').getByRole('button', { name: 'Trilhas', exact: true }).click();
  const figure = page.locator('.lab-visual svg');
  const before = await figure.locator('path[stroke="url(#lab-line)"]').getAttribute('d');
  await page.getByRole('button', { name: 'Equilíbrio', exact: true }).click();
  await expect(figure).toHaveAttribute('aria-label', /horizontal 1, vertical 1/);
  expect(await figure.locator('path[stroke="url(#lab-line)"]').getAttribute('d')).not.toBe(before);
  await page.getByRole('slider', { name: 'Frequência horizontal' }).fill('4');
  await expect(figure).toHaveAttribute('aria-label', /horizontal 4/);
  await page.getByRole('button', { name: 'Recomeçar o experimento' }).click();
  await expect(figure).toHaveAttribute('aria-label', /horizontal 2, vertical 3/);
  await check();
  await page.locator('.track-card').first().click();
  await check();
});

test('falha no PHP preserva catálogo; resposta vazia válida remove pastas ausentes', async ({
  page,
}) => {
  await page.route('**/projects.php', (route) => route.abort());
  await page.route('**/data/repositories.json', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('.connection-item').first()).toContainText('17');
  await page.route('**/projects.php', (route) =>
    route.fulfill({ json: { ...snapshot(), projects: [] } }),
  );
  await page.getByRole('button', { name: 'Atualizar catálogo', exact: true }).click();
  await expect(page.locator('.sync-status')).toHaveText('Índice atualizado');
  await page.getByRole('button', { name: 'No servidor', exact: true }).click();
  await expect(page.locator('.catalog-section .project-card')).toHaveCount(0);
});
