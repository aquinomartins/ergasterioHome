import { useMemo, useRef, useState, useEffect } from 'react';
import {
  Home,
  LayoutGrid,
  Bookmark,
  Route,
  Info,
  Github,
  Search,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Shuffle,
  Check,
  X,
  List,
  SlidersHorizontal,
  FolderOpen,
  GitBranch,
  Atom,
  Cog,
  Clock3,
  Gamepad2,
  Cloud,
  Wind,
  PencilRuler,
  Braces,
  Users,
  Fingerprint,
  Sparkles,
  Menu,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CheckCheck,
  CircleHelp,
} from 'lucide-react';
import useProjectCatalog from './hooks/useProjectCatalog.js';
import useStored from './hooks/useStored.js';
import Modal from './components/Modal.jsx';
import DiscoveryArt from './components/DiscoveryArt.jsx';
import MiniLab from './components/MiniLab.jsx';
import { categories, filterProjects, seededShuffle } from './lib/catalog.mjs';
import { purchaseLink, formatPrice } from './lib/products.mjs';
import products from '../config/products.json';

const views = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'projects', label: 'Projetos', icon: LayoutGrid },
  { id: 'favorites', label: 'Meu radar', icon: Bookmark },
  { id: 'learning', label: 'Trilhas', icon: Route },
  { id: 'about', label: 'Sobre', icon: Info },
];
const titles = {
  home: 'Olá, curiosidade.',
  projects: 'Um universo de projetos.',
  favorites: 'Suas próximas descobertas.',
  learning: 'Conecte. Explore. Aprenda.',
  about: 'Um laboratório em movimento.',
};
const iconMap = {
  motion: Fingerprint,
  cell: Atom,
  people: Users,
  drawing: PencilRuler,
  network: GitBranch,
  engine: Cog,
  turbine: Wind,
  mechanism: Cog,
  wind: Wind,
  cloud: Cloud,
  clock: Clock3,
  game: Gamepad2,
  code: Braces,
};
const categoryTone = {
  'Arte & criação': 'violet',
  Ciência: 'green',
  Engenharia: 'blue',
  Jogos: 'orange',
  Tecnologia: 'blue',
  Sociedade: 'rose',
};
const tracks = [
  {
    id: 'vida',
    title: 'A ciência de ver além.',
    category: 'Ciência',
    icon: Atom,
    description:
      'Do corpo humano às pequenas estruturas da vida. Um caminho para observar, comparar e fazer novas perguntas.',
    projects: ['human-atlas', 'cell-architecture-studio', '3DCellForge'],
    steps: [
      'Explore um sistema do corpo no Human Atlas.',
      'Investigue uma célula e identifique três organelas.',
      'Compare as estruturas e registre uma nova pergunta.',
    ],
  },
  {
    id: 'criacao',
    title: 'Outras formas de criar.',
    category: 'Arte & criação',
    icon: Fingerprint,
    description:
      'Arte, movimento e percepção em experiências que convidam a experimentar antes de encontrar respostas.',
    projects: ['andante', 'correria', 'theninthart_OFICIAL'],
    steps: [
      'Experimente um gesto e observe seu movimento no Andante.',
      'Explore a criação coletiva em Correria.',
      'Conecte uma descoberta à sua própria ideia de projeto.',
    ],
  },
];

function Brand({ onHome }) {
  return (
    <a
      href="#inicio"
      onClick={(event) => {
        event.preventDefault();
        onHome();
      }}
      className="brand"
      aria-label="Ergastério, início"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 1v30M3 8l26 16M3 24 29 8" stroke="currentColor" strokeWidth="4" />
      </svg>
      <span>
        ergastério<span>.</span>
      </span>
    </a>
  );
}
function ProjectIcon({ project, size = 25 }) {
  const Icon = iconMap[project.icon] ?? Braces;
  return (
    <span className={`project-icon tone-${categoryTone[project.category] ?? 'blue'}`}>
      <Icon size={size} strokeWidth={1.6} />
    </span>
  );
}
function ProjectCard({ project, quick, saved, onSave, onOpen }) {
  return (
    <article
      className={`project-card ${quick ? 'quick-card' : ''} tone-${categoryTone[project.category] ?? 'blue'}`}
    >
      <div className="card-top">
        <ProjectIcon project={project} />
        <span className="source-badge">
          {project.source === 'server' ? <FolderOpen size={11} /> : <Github size={11} />}{' '}
          {project.source === 'server' ? 'Servidor' : 'GitHub'}
        </span>
        <button
          className={`save-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? 'Remover' : 'Salvar'} ${project.name} ${saved ? 'do' : 'no'} radar`}
          aria-pressed={saved}
          onClick={() => onSave(project)}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3>
        <button onClick={() => onOpen(project)}>{project.name}</button>
      </h3>
      <p>{project.description}</p>
      <div className="card-bottom">
        <span className="category-name">{project.category}</span>
        <button
          onClick={() => onOpen(project)}
          className="card-action"
          aria-label={`Conhecer ${project.name}`}
        >
          {quick ? 'Explorar' : 'Abrir detalhes'}
          <ChevronRight size={16} />
        </button>
      </div>
      {project.source === 'server' && project.repository && (
        <span
          className="repository-indicator"
          role="img"
          title={`Relacionado a ${project.repository} no GitHub`}
          aria-label={`Vinculado ao GitHub: ${project.repository}`}
        >
          <GitBranch size={11} />
        </span>
      )}
    </article>
  );
}

export default function App() {
  const { projects, serverStatus, scannedAt, refreshing, refresh, owner } = useProjectCatalog();
  const [view, setView] = useState('home'),
    [menu, setMenu] = useState(false),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState('Todos os temas'),
    [origin, setOrigin] = useState('all'),
    [sort, setSort] = useState('name'),
    [layout, setLayout] = useState('grid'),
    [edition, setEdition] = useState(0),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState('');
  const [saved, setSaved] = useStored('ergasterio-radar-v1', []),
    [progress, setProgress] = useStored('ergasterio-progress-v1', {}),
    [interest, setInterest] = useStored('ergasterio-interest-v1', false);
  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const isSaved = (p) =>
    saved.includes(p.id) || Boolean(p.repository && saved.includes(p.repository));
  const toggleSave = (p) =>
    setSaved((current) =>
      isSaved(p) ? current.filter((id) => id !== p.id && id !== p.repository) : [...current, p.id],
    );
  const favorites = projects.filter(isSaved);
  const local = projects.filter((p) => p.source === 'server');
  const linked = local.filter((p) => p.repository);
  const notify = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  };
  const navigate = (id) => {
    setView(id);
    setMenu(false);
    setQuery('');
    setCategory('Todos os temas');
    setOrigin('all');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const openProject = (project) => setModal({ type: 'project', project });
  const day = new Date().toISOString().slice(0, 10);
  const shortcuts = useMemo(() => {
    const shuffled = seededShuffle(
      projects.filter((p) => p.url),
      `${day}-${edition}`,
    );
    const preferred = [
      ...shuffled.filter((p) => isSaved(p)),
      ...shuffled.filter((p) => p.featured && !isSaved(p)),
      ...shuffled.filter((p) => !p.featured && !isSaved(p)),
    ];
    const chosen = [];
    const used = new Set();
    for (const p of preferred)
      if (!used.has(p.category) && chosen.length < 4) {
        chosen.push(p);
        used.add(p.category);
      }
    for (const p of preferred)
      if (chosen.length < 4 && !chosen.some((x) => x.id === p.id)) chosen.push(p);
    return chosen;
  }, [projects, day, edition, saved]);
  const results = useMemo(() => {
    let list = filterProjects(view === 'favorites' ? favorites : projects, category, query).filter(
      (p) => origin === 'all' || p.source === origin,
    );
    return list.sort((a, b) =>
      sort === 'recent'
        ? (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)
        : a.name.localeCompare(b.name, 'pt-BR', { numeric: true }),
    );
  }, [projects, saved, view, category, query, origin, sort]);
  const surprise = () => {
    const p = seededShuffle(
      projects.filter((p) => p.url),
      Date.now(),
    )[0];
    if (p) openProject(p);
  };
  const explore = () => {
    if (view !== 'home' && view !== 'projects') navigate('projects');
    setTimeout(
      () =>
        document.getElementById('projetos')?.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        }),
      0,
    );
  };
  const clearFilters = () => {
    setQuery('');
    setCategory('Todos os temas');
    setOrigin('all');
  };
  const hasOffers = products.some((p) => purchaseLink(p));
  const findTrackProject = (id) => projects.find((p) => p.repository === id || p.id === id);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <div className="topbar-brand">
          <button
            className="mobile-menu icon-button"
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Brand onHome={() => navigate('home')} />
          <span className="brand-divider" />
          <span className="brand-tagline">Um universo de possibilidades</span>
        </div>
        <div className="topbar-right">
          <span className="living-label">
            <i /> Catálogo em movimento
          </span>
          <a
            className="github-header"
            href={`https://github.com/${owner}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={15} />
            <span>Projetos abertos</span>
            <ArrowUpRight size={13} />
          </a>
          <span className="avatar" aria-hidden="true">
            e.
          </span>
        </div>
      </header>
      <aside className={`sidebar ${menu ? 'is-open' : ''}`}>
        <nav aria-label="Navegação principal">
          {views.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? 'active' : ''}
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => navigate(item.id)}
              >
                <span>
                  <Icon size={22} strokeWidth={1.65} />
                  {item.id === 'favorites' && favorites.length > 0 && (
                    <i className="nav-count">{favorites.length}</i>
                  )}
                </span>
                <small>{item.label}</small>
              </button>
            );
          })}
        </nav>
        <button
          className="sidebar-help"
          onClick={() => setModal({ type: 'catalog' })}
          aria-label="Como funciona o catálogo"
        >
          <CircleHelp size={20} />
          <span>Ajuda</span>
        </button>
      </aside>

      <main className="workspace" id="conteudo">
        <div className="content-wrap">
          <div className="page-heading" id="inicio">
            <div>
              <div className="breadcrumb">
                Seu espaço para explorar <ChevronRight size={11} />{' '}
                {views.find((x) => x.id === view)?.label}
              </div>
              <h1>{titles[view]}</h1>
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                type="search"
                aria-label="Buscar projetos"
                placeholder="Encontre um projeto, tema ou ideia"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (view !== 'favorites') setView('projects');
                }}
              />
              {query ? (
                <button aria-label="Limpar busca" onClick={() => setQuery('')}>
                  <X size={15} />
                </button>
              ) : (
                <span className="search-hint">Buscar</span>
              )}
            </label>
          </div>

          {view === 'home' && (
            <>
              <section className="welcome-panel" aria-label="Bem-vindo ao Ergastério">
                <div className="welcome-main">
                  <div className="welcome-copy">
                    <span className="eyebrow">CONECTE IDEIAS. DESCUBRA POSSIBILIDADES.</span>
                    <h2>
                      <em>Grandes ideias.</em>
                      <br />
                      <strong>Novas conexões.</strong>
                    </h2>
                    <p>
                      Um encontro entre arte, ciência e tecnologia.
                      <br className="desktop-break" /> Seu próximo universo começa com curiosidade.
                    </p>
                    <div className="welcome-actions">
                      <button className="button button-primary" onClick={explore}>
                        Explorar todos os projetos <ArrowRight size={17} />
                      </button>
                      <button
                        className="surprise-button"
                        onClick={surprise}
                        aria-label="Me surpreenda"
                      >
                        <Shuffle size={18} />
                      </button>
                    </div>
                    <span className="welcome-footnote">
                      <Sparkles size={13} /> Sempre um novo caminho para descobrir.
                    </span>
                  </div>
                  <DiscoveryArt />
                </div>
                <div className="connections-panel">
                  <span className="panel-eyebrow">SEU LABORATÓRIO, CONECTADO</span>
                  <h3>
                    Todos os seus mundos.
                    <br />
                    Um só ponto de partida.
                  </h3>
                  <div className="connection-item">
                    <span className="connection-icon">
                      <FolderOpen size={20} />
                    </span>
                    <div>
                      <strong>Projetos do servidor</strong>
                      <span>
                        {serverStatus === 'ready'
                          ? 'Pastas indexadas automaticamente'
                          : 'Pastas do catálogo inicial'}
                      </span>
                    </div>
                    <b className="connection-count">{local.length}</b>
                  </div>
                  <div className="connection-item">
                    <span className="connection-icon github-icon">
                      <GitBranch size={20} />
                    </span>
                    <div>
                      <strong>Conexões com GitHub</strong>
                      <span>Pastas relacionadas a repositórios</span>
                    </div>
                    <b className="connection-count">{linked.length}</b>
                  </div>
                  <div className="connection-footer">
                    <span className={`sync-status ${serverStatus === 'ready' ? 'is-live' : ''}`}>
                      <i />
                      {serverStatus === 'ready' ? 'Índice atualizado' : 'Catálogo disponível'}
                    </span>
                    <button
                      disabled={refreshing}
                      onClick={async () =>
                        notify(
                          (await refresh())
                            ? 'Catálogo atualizado com as pastas do servidor.'
                            : 'O catálogo continua disponível. A leitura do servidor será tentada novamente.',
                        )
                      }
                      aria-label="Atualizar catálogo"
                    >
                      <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
                    </button>
                  </div>
                </div>
              </section>

              <section className="shortcuts-section">
                <div className="section-heading">
                  <h2>
                    Acessos rápidos <span>Um convite para começar</span>
                  </h2>
                  <button className="text-button" onClick={() => setEdition(edition + 1)}>
                    <Shuffle size={14} />
                    Outro olhar
                  </button>
                </div>
                <div className="shortcut-grid">
                  {shortcuts.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      quick
                      saved={isSaved(p)}
                      onSave={toggleSave}
                      onOpen={openProject}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {['home', 'projects', 'favorites'].includes(view) && (
            <section className="catalog-section" id="projetos">
              <div className="section-heading catalog-heading">
                <div>
                  <h2>
                    {view === 'favorites' ? 'Guardados no seu radar' : 'Todos os projetos'}{' '}
                    <span className="count-badge">
                      {view === 'favorites' ? favorites.length : projects.length}
                    </span>
                  </h2>
                  <p>
                    {view === 'favorites'
                      ? 'Para retomar quando a curiosidade chamar.'
                      : 'Diferentes temas. Novos encontros. Escolha o seu próximo caminho.'}
                  </p>
                </div>
                <div className="layout-switch" role="group" aria-label="Visualização dos projetos">
                  <button
                    aria-label="Visualização em cartões"
                    aria-pressed={layout === 'grid'}
                    onClick={() => setLayout('grid')}
                  >
                    <LayoutGrid size={17} />
                  </button>
                  <button
                    aria-label="Visualização em lista"
                    aria-pressed={layout === 'list'}
                    onClick={() => setLayout('list')}
                  >
                    <List size={19} />
                  </button>
                </div>
              </div>
              <div className="catalog-toolbar">
                <div className="origin-tabs" role="group" aria-label="Filtrar por origem">
                  {[
                    ['all', 'Todos'],
                    ['server', 'No servidor'],
                    ['github', 'GitHub'],
                  ].map(([id, label]) => (
                    <button key={id} aria-pressed={origin === id} onClick={() => setOrigin(id)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="catalog-selects">
                  <label className="sort-control">
                    <SlidersHorizontal size={13} />
                    <span className="sr-only">Ordenar projetos</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      aria-label="Ordenar projetos"
                    >
                      <option value="name">Nome A–Z</option>
                      <option value="recent">Mais recentes</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="category-tabs" role="group" aria-label="Filtrar por tema">
                {categories.map((c) => (
                  <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>
                    {c === 'Todos os temas' ? 'Todos os temas' : c}
                  </button>
                ))}
              </div>
              <div className="results-summary" role="status">
                {results.length}{' '}
                {results.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
                {query && ` para “${query}”`}
                {(query || category !== 'Todos os temas' || origin !== 'all') && (
                  <button onClick={clearFilters}>
                    Limpar filtros <X size={11} />
                  </button>
                )}
              </div>
              {results.length > 0 ? (
                layout === 'grid' ? (
                  <div className="project-grid">
                    {results.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        saved={isSaved(p)}
                        onSave={toggleSave}
                        onOpen={openProject}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="project-list">
                    {results.map((p) => (
                      <article key={p.id} className="project-list-row">
                        <ProjectIcon project={p} size={21} />
                        <button className="list-project-name" onClick={() => openProject(p)}>
                          <strong>{p.name}</strong>
                          <span>{p.description}</span>
                        </button>
                        <span className="list-category">{p.category}</span>
                        <span className="source-badge">
                          {p.source === 'server' ? <FolderOpen size={11} /> : <Github size={11} />}{' '}
                          {p.source === 'server' ? 'Servidor' : 'GitHub'}
                        </span>
                        <button
                          className={`save-button ${isSaved(p) ? 'is-saved' : ''}`}
                          aria-label={`${isSaved(p) ? 'Remover' : 'Salvar'} ${p.name} ${isSaved(p) ? 'do' : 'no'} radar`}
                          aria-pressed={isSaved(p)}
                          onClick={() => toggleSave(p)}
                        >
                          <Bookmark size={16} fill={isSaved(p) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          className="icon-button list-open"
                          onClick={() => openProject(p)}
                          aria-label={`Conhecer ${p.name}`}
                        >
                          <ArrowUpRight size={19} />
                        </button>
                      </article>
                    ))}
                  </div>
                )
              ) : (
                <div className="empty-state">
                  {view === 'favorites' ? <Bookmark size={34} /> : <Search size={34} />}
                  <h3>
                    {view === 'favorites' && !favorites.length
                      ? 'Dê espaço à próxima descoberta.'
                      : 'Uma nova descoberta pode estar em outro tema.'}
                  </h3>
                  <p>
                    {view === 'favorites' && !favorites.length
                      ? 'Salve projetos no marcador e encontre todos eles aqui.'
                      : 'Experimente outra palavra ou explore todos os temas.'}
                  </p>
                  <button
                    className="button button-primary"
                    onClick={() => {
                      if (view === 'favorites' && !favorites.length) navigate('projects');
                      else clearFilters();
                    }}
                  >
                    Explorar catálogo <ArrowRight size={16} />
                  </button>
                </div>
              )}
              <div className="catalog-footnote">
                <span>
                  <RefreshCw size={12} />
                  {serverStatus === 'ready'
                    ? 'Novas pastas públicas entram automaticamente.'
                    : 'Arte, ciência e tecnologia. Tudo se conecta.'}
                </span>
                <button onClick={() => setModal({ type: 'catalog' })}>
                  Como o catálogo funciona <Info size={12} />
                </button>
              </div>
            </section>
          )}

          {view === 'learning' && (
            <>
              <section className="learning-intro">
                <div>
                  <span className="eyebrow">CAMINHOS PARA IR ALÉM</span>
                  <h2>
                    Uma descoberta
                    <br />
                    puxa a próxima.
                  </h2>
                  <p>
                    Trilhas abertas para aprender pela experiência. Explore no seu ritmo e registre
                    cada passo.
                  </p>
                </div>
                <div className="learning-symbol" aria-hidden="true">
                  <Route size={78} strokeWidth={0.8} />
                </div>
              </section>
              <div className="track-grid">
                {tracks.map((track) => {
                  const Icon = track.icon;
                  return (
                    <button
                      className="track-card"
                      key={track.id}
                      onClick={() => setModal({ type: 'track', track })}
                    >
                      <span className={`project-icon tone-${categoryTone[track.category]}`}>
                        <Icon size={29} strokeWidth={1.4} />
                      </span>
                      <span className="track-label">TRILHA ABERTA · 3 EXPLORAÇÕES</span>
                      <h3>{track.title}</h3>
                      <p>{track.description}</p>
                      <span className="track-link">
                        Começar a explorar <ArrowRight size={17} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <MiniLab />
            </>
          )}

          {view === 'about' && (
            <section className="about-section">
              <div className="about-hero">
                <span className="eyebrow">ARTE + CIÊNCIA + TECNOLOGIA</span>
                <h2>
                  O conhecimento
                  <br />
                  gosta de encontros.
                </h2>
                <p>
                  Ergastério é uma oficina de possibilidades. Um lugar para aproximar áreas,
                  experimentar ideias e aprender com o que acontece no caminho.
                </p>
                <DiscoveryArt />
              </div>
              <div className="about-grid">
                <article>
                  <FolderOpen />
                  <h3>Do servidor para a vitrine.</h3>
                  <p>
                    Pastas públicas com uma entrada de projeto ou um manifesto são reconhecidas pelo
                    índice do servidor. Novas experiências aparecem sem reconstruir a Home.
                  </p>
                </article>
                <article>
                  <GitBranch />
                  <h3>Conexões com o GitHub.</h3>
                  <p>
                    Nomes e mapeamentos relacionam as experiências aos seus repositórios. A Home
                    reúne o acesso publicado, o código e os créditos, preservando as versões de cada
                    projeto.
                  </p>
                </article>
                <article>
                  <Fingerprint />
                  <h3>Um caminho que é seu.</h3>
                  <p>
                    Seu radar e seu progresso ficam neste navegador. Projetos originais e adaptações
                    da comunidade convivem com links às suas fontes.
                  </p>
                </article>
              </div>
              <button
                className="button button-outline"
                onClick={() => setModal({ type: 'catalog' })}
              >
                Sobre a atualização automática <RefreshCw size={16} />
              </button>
            </section>
          )}

          {['home', 'learning'].includes(view) && (
            <section className="formation-banner">
              <span className="formation-icon">
                <BookOpen size={30} strokeWidth={1.3} />
              </span>
              <div>
                <span>
                  {hasOffers ? 'FORMAÇÕES ERGASTÉRIO' : 'O PRÓXIMO CAPÍTULO · EM DESENVOLVIMENTO'}
                </span>
                <h2>Da descoberta ao próximo passo.</h2>
                <p>Novos percursos para conectar fundamentos, experimentação e criação.</p>
              </div>
              <button
                className="button button-outline"
                onClick={() => setModal({ type: 'products' })}
              >
                Conhecer as formações <ArrowUpRight size={16} />
              </button>
            </section>
          )}

          <footer className="workspace-footer">
            <span>© {new Date().getFullYear()} Ergastério · Conhecimento em movimento.</span>
            <div>
              <button onClick={() => setModal({ type: 'privacy' })}>Privacidade</button>
              <a href={`https://github.com/${owner}`} target="_blank" rel="noopener noreferrer">
                Feito para explorar <ArrowUpRight size={12} />
              </a>
            </div>
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}

      {modal?.type === 'project' && (
        <Modal title={modal.project.name} onClose={() => setModal(null)}>
          <div className="project-detail">
            <ProjectIcon project={modal.project} size={32} />
            <span className="detail-eyebrow">
              {modal.project.category} ·{' '}
              {modal.project.source === 'server' ? 'PROJETO DO SERVIDOR' : 'PROJETO NO GITHUB'}
            </span>
            <h2>{modal.project.name}</h2>
            <p>{modal.project.description}</p>
            {modal.project.folder && (
              <div className="folder-path">
                <FolderOpen size={14} />
                <span>/{modal.project.folder}/</span>
                {modal.project.repository && (
                  <span className="linked-tag">
                    <GitBranch size={11} /> GitHub relacionado
                  </span>
                )}
              </div>
            )}
            <h3>Um convite para explorar</h3>
            <ul className="objectives">
              {modal.project.objectives.map((item) => (
                <li key={item}>
                  <Check size={14} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="detail-actions">
              {modal.project.url && (
                <a
                  className="button button-primary"
                  href={modal.project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {modal.project.source === 'github' && !modal.project.homepage
                    ? 'Ver repositório'
                    : 'Abrir projeto'}{' '}
                  <ExternalLink size={15} />
                </a>
              )}
              <button
                className="button button-outline"
                aria-pressed={isSaved(modal.project)}
                onClick={() => toggleSave(modal.project)}
              >
                <Bookmark size={15} fill={isSaved(modal.project) ? 'currentColor' : 'none'} />
                {isSaved(modal.project) ? 'Salvo no radar' : 'Salvar no radar'}
              </button>
            </div>
            {!modal.project.url && (
              <p className="preparing-note">O acesso desta experiência está em preparação.</p>
            )}
            {modal.project.sourceUrl && (
              <a
                className="detail-source"
                href={modal.project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={14} /> Código, documentação e créditos <ArrowUpRight size={13} />
              </a>
            )}
            {modal.project.isFork && (
              <p className="storage-note">
                Adaptação de um projeto da comunidade. Autoria original e licença estão indicadas no
                repositório.
              </p>
            )}
          </div>
        </Modal>
      )}

      {modal?.type === 'track' && (
        <Modal title={modal.track.title} onClose={() => setModal(null)}>
          <div className="track-detail">
            <span className="detail-eyebrow">TRILHA ABERTA · {modal.track.category}</span>
            <h2>{modal.track.title}</h2>
            <p>{modal.track.description}</p>
            <div className="progress-caption">
              <span>Seu percurso</span>
              <span>
                {modal.track.steps.filter((_, i) => progress[`${modal.track.id}-${i}`]).length} de 3
                etapas
              </span>
            </div>
            <div className="progress-bar">
              <span
                style={{
                  width: `${(modal.track.steps.filter((_, i) => progress[`${modal.track.id}-${i}`]).length / 3) * 100}%`,
                }}
              />
            </div>
            <ol className="track-steps">
              {modal.track.steps.map((step, i) => {
                const project = findTrackProject(modal.track.projects[i]);
                const done = Boolean(progress[`${modal.track.id}-${i}`]);
                return (
                  <li key={step}>
                    <button
                      aria-label={`${done ? 'Desmarcar' : 'Concluir'} etapa ${i + 1}`}
                      aria-pressed={done}
                      className={`step-check ${done ? 'complete' : ''}`}
                      onClick={() =>
                        setProgress({ ...progress, [`${modal.track.id}-${i}`]: !done })
                      }
                    >
                      {done ? <Check size={15} /> : i + 1}
                    </button>
                    <div>
                      <p>{step}</p>
                      {project && (
                        <button className="text-button" onClick={() => openProject(project)}>
                          Explorar {project.name} <ArrowUpRight size={13} />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="storage-note">
              Progresso salvo neste navegador. Trilha autoguiada, sem certificação.
            </p>
          </div>
        </Modal>
      )}

      {modal?.type === 'products' && (
        <Modal title="Formações Ergastério" onClose={() => setModal(null)}>
          <div className="products-detail">
            <span className="detail-eyebrow">
              {hasOffers ? 'FORMAÇÕES ERGASTÉRIO' : 'FORMAÇÕES EM DESENVOLVIMENTO'}
            </span>
            <h2>
              Aprender mais.
              <br />
              Criar novas possibilidades.
            </h2>
            <p>Estamos conectando experiências, fundamentos e prática em novos percursos.</p>
            {products.map((product) => (
              <article className="upcoming-product" key={product.id}>
                <span>{product.category}</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                {purchaseLink(product) ? (
                  <div className="purchase-row">
                    <strong>{formatPrice(product)}</strong>
                    <a
                      className="button button-primary"
                      href={purchaseLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Conhecer e comprar <ArrowUpRight size={15} />
                    </a>
                  </div>
                ) : (
                  <small>Programa em elaboração · Inscrições ainda não abertas</small>
                )}
              </article>
            ))}
            <button
              className={`button ${interest ? 'button-outline' : 'button-primary'}`}
              onClick={() => setInterest(!interest)}
            >
              {interest ? <CheckCheck size={16} /> : <Bookmark size={16} />}{' '}
              {interest ? 'No meu radar' : 'Guardar no meu radar'}
            </button>
            <p className="storage-note">
              Um lembrete neste navegador. Não é uma inscrição e não envia notificações.
            </p>
          </div>
        </Modal>
      )}

      {modal?.type === 'catalog' && (
        <Modal title="Como o catálogo funciona" onClose={() => setModal(null)}>
          <div className="catalog-detail">
            <span className="detail-eyebrow">UM CATÁLOGO QUE ACOMPANHA SUAS IDEIAS</span>
            <h2>
              Novas pastas.
              <br />
              Novas possibilidades.
            </h2>
            <p>
              O índice lê as pastas públicas ao lado da Home. Projetos com index.html, index.php ou
              um manifesto público entram automaticamente. Pastas de configuração, código e cópias
              da Home ficam de fora.
            </p>
            <div className="catalog-state">
              <FolderOpen size={20} />
              <div>
                <strong>
                  {serverStatus === 'ready'
                    ? 'Leitura do servidor conectada'
                    : 'Exibindo o catálogo inicial'}
                </strong>
                <span>
                  {scannedAt
                    ? `Última leitura: ${new Date(scannedAt).toLocaleString('pt-BR')}`
                    : 'As experiências continuam acessíveis enquanto a atualização do servidor está indisponível.'}
                </span>
              </div>
            </div>
            <h3>Como relacionar um repositório</h3>
            <p>
              Pastas com o mesmo nome de um projeto do GitHub são associadas por nome. Para nomes
              diferentes, o mapeamento fica em ergasterio-projects.json ou no manifesto
              ergasterio.project.json da pasta.
            </p>
            <p>
              O vínculo organiza acessos e créditos. Os arquivos das experiências são preservados.
            </p>
            <button
              className="button button-primary"
              disabled={refreshing}
              onClick={async () =>
                notify(
                  (await refresh())
                    ? 'Pastas do servidor atualizadas.'
                    : 'O índice ainda está indisponível. O catálogo inicial foi preservado.',
                )
              }
            >
              <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Atualizando…' : 'Atualizar catálogo agora'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === 'privacy' && (
        <Modal title="Privacidade" onClose={() => setModal(null)}>
          <div className="privacy-detail">
            <span className="detail-eyebrow">SIMPLES E TRANSPARENTE</span>
            <h2>
              Sua curiosidade.
              <br />
              Seu espaço.
            </h2>
            <p>
              Seu radar, progresso e lembretes ficam neste navegador. Esta Home não pede cadastro,
              não coleta e-mail e não usa ferramentas de publicidade.
            </p>
            <p>
              O índice do servidor e o feed público do GitHub fornecem informações sobre os
              projetos. Ao abrir uma experiência externa, passam a valer as políticas do site de
              destino.
            </p>
            <button
              className="button button-outline"
              onClick={() => {
                setSaved([]);
                setProgress({});
                setInterest(false);
                notify('Seus dados locais foram apagados.');
              }}
            >
              Apagar meus dados locais <X size={15} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
