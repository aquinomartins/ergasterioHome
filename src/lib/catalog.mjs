export const categories = [
  'Todos os temas',
  'Ciência',
  'Arte & criação',
  'Tecnologia',
  'Sociedade',
];

export function inferCategory(repo) {
  const text =
    `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
  if (/cell|anatom|biolog|human-atlas|saúde|health|science/.test(text)) return 'Ciência';
  if (/art|music|bach|design|cria|ninth|andante|nuvens/.test(text)) return 'Arte & criação';
  if (/mercado|socied|educa|colegio|humanitas|predit|peabiru/.test(text)) return 'Sociedade';
  return 'Tecnologia';
}

export function normalizeRepository(repo, config) {
  const override = config.projects[repo.name] ?? {};
  if (
    repo.archived ||
    repo.private ||
    config.excluded.includes(repo.name) ||
    repo.name.endsWith('-Backup-')
  )
    return null;
  const category = override.category ?? inferCategory(repo);
  const homepage = safeWebUrl(override.homepage ?? repo.homepage);
  const sourceUrl = `https://github.com/${config.owner}/${encodeURIComponent(repo.name)}`;
  return {
    id: repo.name,
    name: override.name ?? repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase()),
    title: override.title ?? repo.name.replace(/[-_]/g, ' '),
    description:
      override.description ??
      repo.description ??
      'Uma nova ideia no laboratório. Explore o projeto e acompanhe sua evolução.',
    category,
    art:
      override.art ??
      { Ciência: 'cell', 'Arte & criação': 'art', Sociedade: 'network' }[category] ??
      'code',
    tags: override.tags ?? [category, repo.language ?? 'Projeto aberto'],
    objectives: override.objectives ?? [
      'Conhecer a proposta do projeto',
      'Investigar suas possibilidades',
      'Acompanhar o desenvolvimento no repositório',
    ],
    featured: Boolean(override.featured),
    homepage,
    sourceUrl,
    updatedAt: repo.updated_at ?? null,
    isFork: Boolean(repo.fork),
  };
}

export function safeWebUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function seededShuffle(items, seed) {
  let state = [...String(seed)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function filterProjects(projects, category, query) {
  const normalize = (s) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  const search = normalize(query.trim());
  return projects.filter(
    (p) =>
      (category === 'Todos os temas' || p.category === category) &&
      normalize(`${p.name} ${p.title} ${p.description} ${p.tags.join(' ')}`).includes(search),
  );
}
