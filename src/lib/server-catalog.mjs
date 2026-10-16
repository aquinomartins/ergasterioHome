import { inferCategory, safeWebUrl } from './catalog.mjs';

const canonical = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const slug = (value) => /^[^./\\][^/\\\x00]*$/.test(value) && value !== '..';

export function initialServerProjects(config) {
  return Object.entries(config.folders).map(([folder, metadata]) => ({
    folder,
    ...metadata,
    entry: 'index.html',
    published: !metadata.preparing,
  }));
}

export function validServerCatalog(data, owner) {
  if (
    data?.schemaVersion !== 1 ||
    data.owner !== owner ||
    !Array.isArray(data.projects) ||
    !Number.isFinite(Date.parse(data.scannedAt))
  )
    return false;
  const seen = new Set();
  return data.projects.every((p) => {
    if (
      !p ||
      typeof p.folder !== 'string' ||
      !slug(p.folder) ||
      seen.has(p.folder) ||
      typeof p.name !== 'string' ||
      typeof p.description !== 'string' ||
      typeof p.published !== 'boolean'
    )
      return false;
    seen.add(p.folder);
    if (
      p.repository != null &&
      (typeof p.repository !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(p.repository))
    )
      return false;
    return (
      p.entry === null ||
      (typeof p.entry === 'string' &&
        !p.entry.split('/').some((s) => s === '..' || s === '.') &&
        !/[?#:\\\x00]/.test(p.entry) &&
        !p.entry.startsWith('/'))
    );
  });
}

export function combineProjects(server, repositories, config, basePath = '/') {
  const attached = new Set();
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const result = server.map((folder) => {
    const metadata = config.folders[folder.folder] ?? {};
    const requested = folder.repository;
    const repo = repositories.find(
      (r) => canonical(r.id) === canonical(requested ?? folder.folder),
    );
    const repository = repo?.id ?? requested ?? null;
    if (repo) attached.add(repo.id);
    const sourceUrl = repository
      ? `https://github.com/${config.owner}/${encodeURIComponent(repository)}`
      : null;
    const entry = folder.entry ? folder.entry.split('/').map(encodeURIComponent).join('/') : '';
    const url = folder.published ? `${base}${encodeURIComponent(folder.folder)}/${entry}` : null;
    return {
      id: `server:${folder.folder}`,
      name: folder.name,
      title: folder.name,
      description: folder.description,
      category: folder.category ?? inferCategory({ name: folder.folder }),
      icon: folder.icon ?? metadata.icon ?? 'code',
      art: repo?.art ?? 'code',
      tags: [folder.category ?? 'Tecnologia', 'Servidor'],
      featured: Boolean(folder.featured),
      source: 'server',
      folder: folder.folder,
      repository,
      sourceUrl,
      url,
      homepage: url,
      published: folder.published,
      updatedAt: folder.updatedAt ?? null,
      objectives: repo?.objectives ?? [
        'Explorar a experiência publicada',
        'Conectar ideias e investigar possibilidades',
      ],
    };
  });
  for (const repo of repositories) {
    if (attached.has(repo.id)) continue;
    result.push({
      ...repo,
      source: 'github',
      repository: repo.id,
      url: safeWebUrl(repo.homepage) ?? repo.sourceUrl,
      icon:
        { Ciência: 'cell', 'Arte & criação': 'drawing', Sociedade: 'network' }[repo.category] ??
        'code',
      published: Boolean(repo.homepage),
      folder: null,
    });
  }
  return result;
}
