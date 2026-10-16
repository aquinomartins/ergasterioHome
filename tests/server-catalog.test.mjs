import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { once } from 'node:events';
import {
  initialServerProjects,
  validServerCatalog,
  combineProjects,
} from '../src/lib/server-catalog.mjs';
import config from '../ergasterio-projects.json' with { type: 'json' };
const php =
  process.env.PHP_BIN ??
  (existsSync('/workspace/shared/php-runtime/php') ? '/workspace/shared/php-runtime/php' : 'php');
const endpoint = new URL('../projects.php', import.meta.url).pathname;
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'ergasterio-index-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const folder = async (name, entry = 'index.html', manifest) => {
    await mkdir(join(root, name), { recursive: true });
    if (entry) {
      await mkdir(join(root, name, entry, '..'), { recursive: true });
      await writeFile(join(root, name, entry), '<h1>Experiência</h1>');
    }
    if (manifest)
      await writeFile(join(root, name, 'ergasterio.project.json'), JSON.stringify(manifest));
  };
  const scan = (configuration = { owner: config.owner, folders: {} }) => {
    const r = spawnSync(
      php,
      [
        '-r',
        "define('ERGASTERIO_INDEX_LIBRARY',true);require $argv[1];echo json_encode(ergasterio_scan($argv[2],json_decode($argv[3],true)),JSON_THROW_ON_ERROR);",
        endpoint,
        root,
        JSON.stringify(configuration),
      ],
      { encoding: 'utf8' },
    );
    assert.equal(r.status, 0, r.stderr || r.error?.message);
    assert.equal(r.stderr, '');
    return JSON.parse(r.stdout);
  };
  return { root, folder, scan };
}

test('PHP descobre pastas novas sem rebuild e respeita os projetos conhecidos sem entrada', async (t) => {
  const { folder, scan } = await fixture(t);
  await folder('motor-novo');
  await folder('nuvens', null);
  let data = scan({ owner: config.owner, folders: { nuvens: config.folders.nuvens } });
  assert.equal(validServerCatalog(data, config.owner), true);
  assert.equal(data.projects.find((p) => p.folder === 'motor-novo').category, 'Engenharia');
  assert.equal(data.projects.find((p) => p.folder === 'nuvens').published, false);
  await folder('nova-ciência');
  data = scan();
  assert.deepEqual(
    data.projects.map((p) => p.folder),
    ['motor-novo', 'nova-ciência'],
  );
  assert.ok(!JSON.stringify(data).includes('/tmp/'));
});

test('PHP exclui pastas técnicas, cópias, projetos ocultos e symlinks', async (t) => {
  const { root, folder, scan } = await fixture(t);
  for (const name of [
    '.github',
    '_privado',
    'assets',
    'config',
    'public',
    'scripts',
    'node_modules',
    'private',
    'secrets',
    'ergasterioHome-main',
    'ergasterioHome-81eab0d',
    'backup-2026',
  ])
    await folder(name);
  await folder('sem-entrada', null);
  await folder('oculto', 'index.html', { public: false });
  await symlink('/tmp', join(root, 'link-externo'));
  await folder('projeto-seguro');
  assert.deepEqual(
    scan().projects.map((p) => p.folder),
    ['projeto-seguro'],
  );
});

test('manifestos permitem metadados e entradas próprias, impedindo caminhos externos', async (t) => {
  const { root, folder, scan } = await fixture(t);
  await folder('sonic-lab', 'demo/start.html', {
    public: true,
    name: 'Sonic laboratório',
    entry: 'demo/start.html',
    repository: 'sonic-lab',
    category: 'Jogos',
  });
  await folder('em-preparacao', null, { public: true, name: 'Em preparação' });
  await folder('travessia', null, {
    public: true,
    entry: '../projeto-seguro/index.html',
    repository: '../../private',
  });
  await folder('projeto-seguro');
  await folder('link-index', null, { public: true });
  await symlink(join(root, 'projeto-seguro/index.html'), join(root, 'link-index/index.html'));
  await folder('json-invalido');
  await writeFile(join(root, 'json-invalido', 'ergasterio.project.json'), '{');
  const data = scan();
  assert.equal(data.projects.find((p) => p.folder === 'sonic-lab').entry, 'demo/start.html');
  assert.equal(data.projects.find((p) => p.folder === 'em-preparacao').published, false);
  assert.equal(data.projects.find((p) => p.folder === 'travessia').entry, null);
  assert.equal(data.projects.find((p) => p.folder === 'travessia').repository, null);
  assert.equal(data.projects.find((p) => p.folder === 'link-index').published, false);
  assert.equal(data.projects.find((p) => p.folder === 'json-invalido').published, true);
});

test('endpoint HTTP retorna JSON e ignora tentativa de mudar a raiz pela URL', async (t) => {
  const { root, folder } = await fixture(t);
  await copyFile(endpoint, join(root, 'projects.php'));
  await writeFile(
    join(root, 'ergasterio-projects.json'),
    JSON.stringify({ owner: config.owner, folders: {} }),
  );
  await folder('primeiro');
  const server = spawn(php, ['-S', '127.0.0.1:5184', '-t', root], { stdio: 'ignore' });
  t.after(async () => {
    server.kill();
    if (server.exitCode === null) await once(server, 'exit');
  });
  let response;
  for (let i = 0; i < 30; i++) {
    try {
      response = await fetch('http://127.0.0.1:5184/projects.php?root=/etc');
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  assert.ok(response?.ok);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(
    (await response.json()).projects.map((p) => p.folder),
    ['primeiro'],
  );
  await folder('segundo');
  assert.equal(
    (await (await fetch('http://127.0.0.1:5184/projects.php')).json()).projects.length,
    2,
  );
});

test('vínculos explícitos e por nome unem GitHub e servidor sem remover versões locais', () => {
  const repositories = [
    {
      id: 'andante',
      sourceUrl: 'https://github.com/aquinomartins/andante',
      category: 'Arte & criação',
    },
    { id: 'mecanismo-n-114', sourceUrl: 'https://github.com/aquinomartins/mecanismo-n-114' },
    { id: 'outro', sourceUrl: 'https://github.com/aquinomartins/outro', category: 'Ciência' },
  ];
  const projects = combineProjects(initialServerProjects(config), repositories, config);
  assert.equal(projects.filter((p) => p.repository === 'mecanismo-n-114').length, 2);
  assert.equal(projects.filter((p) => p.repository === 'andante').length, 1);
  assert.equal(projects.find((p) => p.folder === 'celulas').repository, null);
  assert.equal(projects.find((p) => p.folder === 'andante').url, '/andante/index.html');
  assert.equal(projects.find((p) => p.folder === 'nuvens').url, null);
  assert.equal(projects.filter((p) => p.source === 'github').length, 1);
  const newer = combineProjects(
    [{ folder: 'outro', name: 'Outro', description: 'Novo', published: true, entry: 'demo.html' }],
    repositories,
    config,
    '/lab/',
  );
  assert.equal(newer[0].url, '/lab/outro/demo.html');
  assert.equal(newer[0].repository, 'outro');
});

test('frontend rejeita índices inválidos ou caminhos que escapem da pasta', () => {
  const data = {
    schemaVersion: 1,
    owner: config.owner,
    scannedAt: new Date().toISOString(),
    projects: [],
  };
  assert.equal(validServerCatalog(data, config.owner), true);
  for (const entry of ['../index.php', '/etc/index.php', 'https://example.com/a', 'a\\b.html'])
    assert.equal(
      validServerCatalog(
        {
          ...data,
          projects: [{ folder: 'novo', name: 'Novo', description: 'Olá', published: true, entry }],
        },
        config.owner,
      ),
      false,
    );
  assert.equal(validServerCatalog({ ...data, owner: 'outro' }, config.owner), false);
});

test('índice atualizado permite remover um vínculo antigo sem reconstruir a Home', () => {
  const repositories = [
    {
      id: 'mecanismo-n-114',
      category: 'Engenharia',
      sourceUrl: 'https://github.com/aquinomartins/mecanismo-n-114',
    },
  ];
  const projects = combineProjects(
    [
      {
        folder: 'mecanismo',
        name: 'Mecanismo',
        description: 'Uma experiência',
        repository: null,
        entry: 'index.html',
        published: true,
      },
    ],
    repositories,
    config,
  );
  assert.equal(projects[0].repository, null);
  assert.equal(projects.filter((p) => p.source === 'github').length, 1);
});
