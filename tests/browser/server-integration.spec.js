import { test, expect } from '@playwright/test';
import { mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('pacote compilado consulta PHP real e incorpora uma nova pasta no navegador', async ({
  page,
}) => {
  const root = await mkdtemp(join(tmpdir(), 'ergasterio-publish-'));
  let server;
  try {
    for (const name of ['index.html', 'projects.php', 'ergasterio-projects.json']) {
      await copyFile(new URL(`../../${name}`, import.meta.url), join(root, name));
    }
    const php =
      process.env.PHP_BIN ??
      (existsSync('/workspace/shared/php-runtime/php')
        ? '/workspace/shared/php-runtime/php'
        : 'php');
    server = spawn(php, ['-S', '127.0.0.1:5185', '-t', root], { stdio: 'ignore' });
    for (let i = 0; i < 30; i++) {
      try {
        if ((await fetch('http://127.0.0.1:5185/projects.php')).ok) break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    await page.route('https://raw.githubusercontent.com/**', (route) => route.abort());
    await page.goto('http://127.0.0.1:5185/');
    await expect(page.locator('.sync-status')).toHaveText('Índice atualizado');
    await page.getByRole('button', { name: 'No servidor', exact: true }).click();
    await expect(page.locator('.catalog-section .project-card')).toHaveCount(0);
    await mkdir(join(root, 'novo-laboratorio'));
    await writeFile(
      join(root, 'novo-laboratorio', 'index.htm'),
      '<h1>Um projeto que acabou de chegar.</h1>',
    );
    await page.getByRole('button', { name: 'Atualizar catálogo', exact: true }).click();
    await expect(page.locator('.catalog-section .project-card')).toHaveCount(1);
    await page.locator('.catalog-section .card-action').click();
    const link = page.getByRole('dialog').getByRole('link', { name: 'Abrir projeto', exact: true });
    await expect(link).toHaveAttribute('href', '/novo-laboratorio/index.htm');
    const response = await page.request.get(
      'http://127.0.0.1:5185' + (await link.getAttribute('href')),
    );
    expect(await response.text()).toContain('Um projeto que acabou de chegar.');
  } finally {
    if (server) {
      server.kill();
      if (server.exitCode === null) await once(server, 'exit');
    }
    await rm(root, { recursive: true, force: true });
  }
});
