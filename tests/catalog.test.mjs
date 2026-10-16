import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  normalizeRepository,
  inferCategory,
  seededShuffle,
  filterProjects,
  safeWebUrl,
} from '../src/lib/catalog.mjs';
import { purchaseLink, formatPrice } from '../src/lib/products.mjs';
import { loadCatalog, validCatalog } from '../src/lib/feed.mjs';
const config = JSON.parse(await readFile(new URL('../config/catalog.json', import.meta.url)));
const catalog = JSON.parse(
  await readFile(new URL('../public/data/repositories.json', import.meta.url)),
);

test('um novo repositório público entra automaticamente no catálogo e recebe um tema', () => {
  const project = normalizeRepository(
    { name: 'novo-cell-lab', description: 'Explore biology', language: 'JavaScript' },
    config,
  );
  assert.equal(project.id, 'novo-cell-lab');
  assert.equal(project.category, 'Ciência');
  assert.equal(project.sourceUrl, 'https://github.com/aquinomartins/novo-cell-lab');
  assert.equal(project.featured, false);
});
test('projetos privados, arquivados e excluídos não são publicados', () => {
  for (const repo of [
    { name: 'privado', private: true },
    { name: 'antigo', archived: true },
    { name: 'ergasterioHome' },
    { name: 'copia-Backup-' },
  ])
    assert.equal(normalizeRepository(repo, config), null);
});
test('curadoria editorial preserva fontes e créditos de forks', () => {
  const p = normalizeRepository({ name: 'human-atlas', fork: true }, config);
  assert.equal(p.name, 'Human Atlas');
  assert.equal(p.isFork, true);
  assert.equal(p.homepage, 'https://human-atlas-seven.vercel.app/');
  assert.equal(p.objectives.length, 3);
});
test('links rejeitam protocolos executáveis e credenciais', () => {
  assert.equal(safeWebUrl('javascript:alert(1)'), null);
  assert.equal(safeWebUrl('https://user:password@example.com'), null);
  assert.equal(safeWebUrl('example.com'), 'https://example.com/');
});
test('curadoria muda com a edição sem perder ou duplicar projetos', () => {
  const values = Array.from({ length: 20 }, (_, i) => i);
  assert.deepEqual(seededShuffle(values, 'dia-1'), seededShuffle(values, 'dia-1'));
  assert.notDeepEqual(seededShuffle(values, 'dia-1'), seededShuffle(values, 'dia-2'));
  assert.deepEqual(
    seededShuffle(values, 'dia-1').sort((a, b) => a - b),
    values,
  );
});
test('busca ignora acentos e combina filtros', () => {
  assert.ok(filterProjects(catalog.projects, 'Todos os temas', 'celulas').length >= 1);
  assert.equal(filterProjects(catalog.projects, 'Arte & criação', 'anatomia').length, 0);
});
test('catálogo real é íntegro e contém experiências de destaque', () => {
  assert.ok(catalog.projects.length >= 3);
  assert.equal(new Set(catalog.projects.map((p) => p.id)).size, catalog.projects.length);
  for (const id of ['human-atlas', '3DCellForge', 'theninthart_OFICIAL'])
    assert.ok(catalog.projects.find((p) => p.id === id)?.featured);
  for (const project of catalog.projects) {
    assert.equal(new URL(project.sourceUrl).hostname, 'github.com');
    assert.ok(project.objectives.length);
    assert.ok(!config.excluded.includes(project.id));
  }
});
test('classificação contempla as áreas editoriais', () => {
  assert.equal(inferCategory({ name: 'arte-digital' }), 'Arte & criação');
  assert.equal(inferCategory({ name: 'mercado-preditivo' }), 'Sociedade');
  assert.equal(inferCategory({ name: 'novo-software' }), 'Tecnologia');
});
test('compra só é oferecida com oferta ativa, preço e link HTTPS válidos', () => {
  const product = {
    status: 'available',
    priceInCents: 19900,
    currency: 'BRL',
    checkoutUrl: 'https://checkout.example.com/course',
  };
  assert.equal(purchaseLink(product), 'https://checkout.example.com/course');
  assert.equal(purchaseLink({ ...product, status: 'coming_soon' }), null);
  assert.equal(purchaseLink({ ...product, priceInCents: null }), null);
  assert.equal(purchaseLink({ ...product, checkoutUrl: 'http://example.com' }), null);
  assert.equal(purchaseLink({ ...product, checkoutUrl: 'javascript:alert(1)' }), null);
  assert.match(formatPrice(product), /199,00/);
});
test('feed remoto publica um novo projeto sem reconstruir a Home', async () => {
  const newProject = normalizeRepository(
    { name: 'experimento-do-futuro', description: 'Novo projeto público' },
    config,
  );
  const fresh = { ...catalog, projects: [...catalog.projects, newProject] };
  const updates = [];
  const urls = [];
  await loadCatalog({
    localUrl: '/data/repositories.json',
    feedUrl: 'https://raw.githubusercontent.com/example/catalog.json',
    owner: config.owner,
    signal: new AbortController().signal,
    onUpdate: (d) => updates.push(d),
    fetcher: async (url) => {
      urls.push(url);
      return { ok: true, json: async () => (url.startsWith('/') ? catalog : fresh) };
    },
  });
  assert.equal(urls.length, 2);
  assert.equal(updates.at(-1).projects.at(-1).id, 'experimento-do-futuro');
});
test('feed inválido ou indisponível não apaga catálogo existente', async () => {
  assert.equal(validCatalog({ ...catalog, owner: 'outra-pessoa' }, config.owner), false);
  assert.equal(
    validCatalog(
      { ...catalog, projects: [{ ...catalog.projects[0], homepage: 'javascript:alert(1)' }] },
      config.owner,
    ),
    false,
  );
  const updates = [];
  await loadCatalog({
    localUrl: '/data/repositories.json',
    feedUrl: 'https://example.com/catalog.json',
    owner: config.owner,
    signal: new AbortController().signal,
    onUpdate: (d) => updates.push(d),
    fetcher: async () => {
      throw new Error('offline');
    },
  });
  assert.equal(updates.length, 0);
});
