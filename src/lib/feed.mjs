import { categories, safeWebUrl } from './catalog.mjs';

export function validCatalog(data, owner) {
  if (
    data?.owner !== owner ||
    !Number.isFinite(Date.parse(data.syncedAt)) ||
    !Array.isArray(data.projects) ||
    !data.projects.length
  )
    return false;
  const seen = new Set();
  return data.projects.every((p) => {
    if (
      !p ||
      typeof p.id !== 'string' ||
      seen.has(p.id) ||
      typeof p.name !== 'string' ||
      typeof p.title !== 'string' ||
      typeof p.description !== 'string'
    )
      return false;
    seen.add(p.id);
    const url = safeWebUrl(p.sourceUrl);
    if (
      !url ||
      new URL(url).hostname !== 'github.com' ||
      !new URL(url).pathname.startsWith(`/${owner}/`)
    )
      return false;
    return (
      categories.includes(p.category) &&
      Array.isArray(p.tags) &&
      p.tags.every((t) => typeof t === 'string') &&
      Array.isArray(p.objectives) &&
      p.objectives.every((t) => typeof t === 'string') &&
      (!p.homepage || safeWebUrl(p.homepage) === p.homepage)
    );
  });
}

export async function loadCatalog({ localUrl, feedUrl, owner, signal, onUpdate, fetcher = fetch }) {
  for (const url of [localUrl, feedUrl].filter(Boolean)) {
    try {
      const response = await fetcher(url, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(7000)]),
        cache: 'no-cache',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      if (!response.ok) continue;
      const data = await response.json();
      if (validCatalog(data, owner)) onUpdate(data);
    } catch {
      if (signal.aborted) return;
    }
  }
}
