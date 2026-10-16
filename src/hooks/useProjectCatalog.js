import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import initialCatalog from 'virtual:catalog';
import config from '../../ergasterio-projects.json';
import githubConfig from '../../config/catalog.json';
import { loadCatalog } from '../lib/feed.mjs';
import {
  initialServerProjects,
  validServerCatalog,
  combineProjects,
} from '../lib/server-catalog.mjs';

export default function useProjectCatalog() {
  const [server, setServer] = useState(() => initialServerProjects(config));
  const [github, setGithub] = useState(initialCatalog);
  const [serverStatus, setServerStatus] = useState('initial');
  const [scannedAt, setScannedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef(null);
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setRefreshing(true);
    let connected = false;
    const fetchServer = async () => {
      try {
        const response = await fetch(new URL('./projects.php', window.location.href), {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json'))
          throw new Error('index_unavailable');
        const data = await response.json();
        if (!validServerCatalog(data, config.owner)) throw new Error('invalid_index');
        if (controller.signal.aborted) return;
        setServer(data.projects);
        setScannedAt(data.scannedAt);
        setServerStatus('ready');
        connected = true;
      } catch {
        if (!controller.signal.aborted) setServerStatus('unavailable');
      }
    };
    await Promise.allSettled([
      fetchServer(),
      loadCatalog({
        localUrl: import.meta.env.DEV ? `${import.meta.env.BASE_URL}data/repositories.json` : null,
        feedUrl: import.meta.env.DEV ? null : githubConfig.catalogFeed,
        owner: githubConfig.owner,
        signal: controller.signal,
        onUpdate: (next) =>
          setGithub((current) =>
            Date.parse(next.syncedAt) >= Date.parse(current.syncedAt) ? next : current,
          ),
      }),
    ]);
    if (!controller.signal.aborted) setRefreshing(false);
    return connected;
  }, []);
  useEffect(() => {
    refresh();
    const visible = () => {
      if (!document.hidden) refresh();
    };
    const interval = setInterval(visible, 90000);
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', visible);
      request.current?.abort();
    };
  }, [refresh]);
  const base = new URL('./', window.location.href).pathname;
  const projects = useMemo(
    () => combineProjects(server, github.projects, config, base),
    [server, github, base],
  );
  return { projects, serverStatus, scannedAt, refreshing, refresh, owner: config.owner };
}
