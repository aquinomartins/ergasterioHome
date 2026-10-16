import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizeRepository } from '../src/lib/catalog.mjs';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('config/catalog.json', root), 'utf8'));
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'Ergasterio-Catalog' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function request(url, requestHeaders = {}) {
  const response = await fetch(url, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok)
    throw new Error(`HTTP ${response.status} ao consultar ${new URL(url).hostname}`);
  return response;
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fonte alternativa pública: a listagem oficial do GitHub, sem autenticação.
// O fallback nunca substitui um catálogo válido por uma resposta vazia ou incompleta.
async function fromPublicPages() {
  const repos = [];
  for (let page = 1; page <= 100; page++) {
    const html = await (
      await request(`https://github.com/${config.owner}?tab=repositories&page=${page}`)
    ).text();
    const list = html.match(
      /<ul[^>]*data-filterable-for="your-repos-filter"[^>]*>([\s\S]*?)<\/ul>/,
    )?.[1];
    if (!list)
      throw new Error('A listagem pública mudou de formato; catálogo anterior preservado.');
    const entries = list.split(/<li\s/).slice(1);
    for (const entry of entries) {
      const name = entry.match(/itemprop="name codeRepository"[^>]*>\s*([^<]+)/)?.[1]?.trim();
      if (!name) throw new Error('Repositório sem nome na listagem pública.');
      repos.push({
        name,
        description: decodeHtml(
          entry.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '',
        ),
        language: decodeHtml(
          entry.match(/itemprop="programmingLanguage"[^>]*>(.*?)<\/span>/)?.[1] ?? '',
        ),
        updated_at: entry.match(/<relative-time datetime="([^"]+)"/)?.[1] ?? null,
        archived: /Label[^>]*>\s*(?:Public archive|Archived)/i.test(entry),
        fork: /Forked from/.test(entry),
      });
    }
    if (!/rel="next"|class="next_page"(?![^>]*disabled)/.test(html)) return repos;
  }
  throw new Error('Limite de paginação excedido; catálogo anterior preservado.');
}

async function fromApi() {
  const repos = [];
  for (let page = 1; page <= 100; page++) {
    const response = await request(
      `https://api.github.com/users/${config.owner}/repos?per_page=100&type=owner&sort=updated&page=${page}`,
      headers,
    );
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Resposta inesperada da API.');
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
  throw new Error('Limite de paginação excedido.');
}

try {
  let repos;
  let source = 'github-api';
  try {
    repos = await fromApi();
  } catch (error) {
    console.warn(`API indisponível (${error.message}). Consultando listagem pública oficial.`);
    repos = await fromPublicPages();
    source = 'github-public-pages';
  }
  if (!repos.length)
    throw new Error('Nenhum repositório encontrado; catálogo anterior preservado.');
  const projects = repos.map((r) => normalizeRepository(r, config)).filter(Boolean);
  const catalog = { owner: config.owner, syncedAt: new Date().toISOString(), source, projects };
  const dir = new URL('public/data/', root);
  await mkdir(dir, { recursive: true });
  const target = new URL('repositories.json', dir);
  const temporary = new URL('repositories.json.tmp', dir);
  await writeFile(temporary, JSON.stringify(catalog, null, 2) + '\n');
  await rename(temporary, target);
  console.log(
    `${projects.length} projetos sincronizados de ${repos.length} repositórios. Catálogo: ${fileURLToPath(target)}`,
  );
} catch (error) {
  console.error(`Sincronização não concluída: ${error.message}`);
  process.exitCode = 1;
}
