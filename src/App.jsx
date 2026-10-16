import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  X,
  Search,
  Shuffle,
  Plus,
  Minus,
  Menu,
  MoveUpRight,
  Orbit,
  Fingerprint,
  Layers,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import HeroScene from './components/HeroScene.jsx';
import MiniLab from './components/MiniLab.jsx';
import products from '../config/products.json';
import catalogConfig from '../config/catalog.json';
import { loadCatalog } from './lib/feed.mjs';
import { purchaseLink, formatPrice } from './lib/products.mjs';
import { ProjectArt } from './components/Art.jsx';
import { categories, filterProjects, seededShuffle } from './lib/catalog.mjs';
import initialCatalog from 'virtual:catalog';

const tracks = [
  {
    id: 'vida',
    number: '01',
    title: 'A ciência de ver além.',
    subtitle: 'Do invisível ao extraordinário.',
    description:
      'Uma jornada pelo corpo humano e pelo universo das células. Explore, compare e descubra como a vida se organiza.',
    category: 'Ciência',
    art: 'cell',
    projectIds: ['human-atlas', '3DCellForge', 'cell-architecture-studio'],
    steps: [
      'Explore os sistemas do corpo no Human Atlas.',
      'Investigue uma célula e identifique três organelas.',
      'Compare estruturas e registre uma nova pergunta.',
    ],
    label: 'Anatomia · Biologia · Visualização',
  },
  {
    id: 'criacao',
    number: '02',
    title: 'Outras formas de criar.',
    subtitle: 'O encontro de mundos que pareciam distantes.',
    description:
      'Experimente as conexões entre tempo, arte e linguagem digital. Um convite a olhar de novo — e criar a partir disso.',
    category: 'Arte & criação',
    art: 'art',
    projectIds: ['theninthart_OFICIAL', 'articraft', 'bachianash'],
    steps: [
      'Percorra a experiência interativa The Ninth Art.',
      'Escolha um detalhe que mudou sua percepção.',
      'Transforme essa descoberta em um esboço ou ideia.',
    ],
    label: 'Arte · Percepção · Experimentação',
  },
];

function readLocal(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(fallback))
      return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : fallback;
    if (typeof fallback === 'boolean') return typeof parsed === 'boolean' ? parsed : fallback;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
function useStored(key, fallback) {
  const [value, setValue] = useState(() => readLocal(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* O site continua funcional sem armazenamento. */
    }
  }, [key, value]);
  return [value, setValue];
}

function Brand({ footer = false }) {
  return (
    <a
      className={`brand ${footer ? 'brand-footer' : ''}`}
      href="#inicio"
      aria-label="Ergastério, início"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <g fill="currentColor" transform="translate(16 16)">
          {[0, 60, 120].map((a) => (
            <rect
              key={a}
              x="-2.3"
              y="-15"
              width="4.6"
              height="30"
              rx=".5"
              transform={`rotate(${a})`}
            />
          ))}
        </g>
      </svg>
      <span>
        ergastério<span className="brand-period">.</span>
      </span>
    </a>
  );
}

function Modal({ children, onClose, title, wide = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const d = dialog.current;
    const previous = document.activeElement;
    d.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = before;
      d.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-shell">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Fechar">
          <X size={21} />
        </button>
        <h2 id="dialog-title" className="sr-only">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

function ProjectCard({ project, onOpen, saved, onSave, index }) {
  return (
    <article className="project-card">
      <div className="project-cover">
        <button
          className="cover-open"
          onClick={() => onOpen(project)}
          aria-label={`Conhecer ${project.name}`}
        >
          <ProjectArt type={project.art} />
          <span className="cover-explore">
            Entrar na experiência <ArrowUpRight size={18} />
          </span>
        </button>
        <span className="project-kind">
          <span />
          EXPERIÊNCIA ABERTA
        </span>
        <button
          className={`bookmark-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? 'Remover' : 'Salvar'} ${project.name} ${saved ? 'do' : 'no'} radar`}
          aria-pressed={saved}
          onClick={() => onSave(project.id)}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className="cover-number">E / {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="project-card-top">
        <span>{project.category}</span>
        <span>{project.tags[1] ?? 'Projeto aberto'}</span>
      </div>
      <h3>
        <button onClick={() => onOpen(project)}>
          {project.title}
          <ArrowUpRight size={20} />
        </button>
      </h3>
      <p>{project.description}</p>
      <div className="project-card-bottom">
        <span>{project.name}</span>
        <button className="text-link" onClick={() => onOpen(project)}>
          Explorar <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [category, setCategory] = useState('Todos os temas');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [edition, setEdition] = useState(0);
  const [saved, setSaved] = useStored('ergasterio-radar-v1', []);
  const [progress, setProgress] = useStored('ergasterio-progress-v1', {});
  const [interest, setInterest] = useStored('ergasterio-interest-v1', false);
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [faq, setFaq] = useState(null);
  const notificationTimer = useRef();
  const randomCounter = useRef(0);
  const [openHero, setOpenHero] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    loadCatalog({
      localUrl: `${import.meta.env.BASE_URL}data/repositories.json`,
      feedUrl: import.meta.env.DEV ? null : catalogConfig.catalogFeed,
      owner: catalogConfig.owner,
      signal: controller.signal,
      onUpdate: (next) =>
        setCatalog((current) =>
          Date.parse(next.syncedAt) >= Date.parse(current.syncedAt) ? next : current,
        ),
    });
    return () => controller.abort();
  }, []);
  useEffect(() => () => clearTimeout(notificationTimer.current), []);
  useEffect(() => {
    if (!menu) return;
    const close = (e) => {
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);

  const announce = (message) => {
    setToast(message);
    clearTimeout(notificationTimer.current);
    notificationTimer.current = setTimeout(() => setToast(''), 3500);
  };
  const toggleSave = (id) => {
    setSaved((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };
  const day = new Date().toISOString().slice(0, 10);
  const dailyQuestion = seededShuffle(
    [
      'Qual detalhe você ainda não percebeu?',
      'Onde a ciência encontra a sua imaginação?',
      'O que muda quando você olha de novo?',
      'Que pergunta pode abrir um novo caminho?',
      'Qual ideia você quer colocar em movimento?',
    ],
    day,
  )[0];
  const hasOffers = products.some((p) => purchaseLink(p));
  const radarCount = saved.length + (interest ? 1 : 0);
  const all = seededShuffle(catalog.projects, `${day}-${edition}`);
  const ordered = [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)];
  const filtered = filterProjects(ordered, category, query);
  const visible =
    expanded || query || category !== 'Todos os temas' ? filtered : filtered.slice(0, 3);
  const surprise = () => {
    const candidates = catalog.projects.filter((p) => p.id !== modal?.project?.id);
    const project = seededShuffle(candidates, `${Date.now()}-${randomCounter.current++}`)[0];
    if (project) setModal({ type: 'project', project });
  };
  const browse = (value = 'Todos os temas') => {
    setCategory(value);
    setQuery('');
    setExpanded(value !== 'Todos os temas');
    setMenu(false);
    document
      .getElementById('explorar')
      ?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
  };
  const savedProjects = catalog.projects.filter((p) => saved.includes(p.id));
  const openProject = (project) => setModal({ type: 'project', project });

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className={menu ? 'main-nav is-open' : 'main-nav'} aria-label="Navegação principal">
            <a href="#explorar" onClick={() => setMenu(false)}>
              Explorar <ChevronDown size={12} />
            </a>
            <a href="#trilhas" onClick={() => setMenu(false)}>
              Trilhas de aprendizagem
            </a>
            <a href="#sobre" onClick={() => setMenu(false)}>
              O laboratório
            </a>
          </nav>
          <div className="header-actions">
            <button
              className="radar-link"
              onClick={() => {
                setMenu(false);
                setModal({ type: 'radar' });
              }}
            >
              <Bookmark size={16} />
              <span>Meu radar</span>
              {radarCount > 0 && <span className="radar-count">{radarCount}</span>}
            </button>
            <button
              className="menu-button icon-button"
              aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <main id="conteudo">
        <section className="hero container" id="inicio">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> PARA MENTES EM MOVIMENTO
            </div>
            <h1>
              O mundo muda.
              <br />
              Sua curiosidade
              <br />
              <span>vai além.</span>
              <svg className="heading-star" viewBox="0 0 64 64" aria-hidden="true">
                <path
                  d="M32 0v64M0 32h64M9 9l46 46M9 55 55 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </h1>
            <p>
              Um encontro entre arte, ciência e tecnologia.
              <br className="desktop-break" /> Explore ideias. Aprenda fazendo. Descubra o próximo.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#explorar">
                Encontre sua próxima descoberta <ArrowUpRight size={18} />
              </a>
              <button className="surprise-button" onClick={surprise}>
                <Shuffle size={16} /> Me surpreenda
              </button>
            </div>
            <div className="hero-note">
              <span className="mini-orbits">
                <i />
                <i />
                <i />
              </span>
              <span>
                UMA PERGUNTA PARA HOJE
                <br />
                <strong>{dailyQuestion}</strong>
              </span>
            </div>
          </div>
          <HeroScene />
          <div className="hero-foot">
            <span>O CONHECIMENTO NÃO PARA. NÓS TAMBÉM NÃO.</span>
            <a href="#explorar" aria-label="Descer para explorar">
              <span>EXPLORE O QUE VEM A SEGUIR</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <div className="theme-ribbon" aria-label="Áreas de conhecimento">
          <div className="container ribbon-inner">
            <span>Conexões que abrem caminhos</span>
            {['Ciência', 'Arte & criação', 'Tecnologia', 'Sociedade'].map((c, i) => (
              <button key={c} onClick={() => browse(c)}>
                <span className="ribbon-symbol">
                  {
                    [
                      <Orbit key="science" />,
                      <Fingerprint key="art" />,
                      <Layers key="tech" />,
                      <MoveUpRight key="society" />,
                    ][i]
                  }
                </span>
                {c}
              </button>
            ))}
            <span className="ribbon-end">
              TUDO SE CONECTA <MoveUpRight size={15} />
            </span>
          </div>
        </div>

        <section className="discovery-section container section" id="explorar">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">
                <span className="tiny-square" />
                01 — EXPLORE POSSIBILIDADES
              </div>
              <h2>
                Siga a sua curiosidade<span>.</span>
              </h2>
            </div>
            <p>
              Pequenos começos. Grandes descobertas.
              <br />
              Escolha um universo e dê o primeiro passo.
            </p>
          </div>
          <div className="catalog-toolbar">
            <div className="category-tabs" role="group" aria-label="Filtrar por tema">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? 'active' : ''}
                  aria-pressed={category === c}
                  onClick={() => {
                    setCategory(c);
                    setExpanded(c !== 'Todos os temas');
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={16} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que te move?"
                aria-label="Buscar experiências"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Limpar busca">
                  <X size={14} />
                </button>
              )}
            </label>
          </div>
          <div className="catalog-results" aria-live="polite" aria-atomic="true">
            <span className="sr-only">{filtered.length} experiências encontradas</span>
            {(query || category !== 'Todos os temas') && (
              <div className="results-label">
                {filtered.length} {filtered.length === 1 ? 'descoberta' : 'descobertas'}
                {query && ` para “${query}”`}
              </div>
            )}
          </div>
          {visible.length ? (
            <div className="project-grid">
              {visible.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  onOpen={openProject}
                  saved={saved.includes(p.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Orbit size={32} />
              <h3>Novos caminhos começam com uma pergunta.</h3>
              <p>Não encontramos esse tema por aqui. Experimente outra palavra.</p>
              <button
                className="button button-outline"
                onClick={() => {
                  setCategory('Todos os temas');
                  setQuery('');
                }}
              >
                Explorar todas as experiências <ArrowRight size={16} />
              </button>
            </div>
          )}
          <div className="catalog-footer">
            <span>
              <span className="status-dot" /> UM LABORATÓRIO VIVO. SEMPRE ALGO NOVO.
            </span>
            <div>
              <button
                className="refresh-link"
                onClick={() => {
                  setEdition(edition + 1);
                  announce('Uma nova ordem para novas descobertas.');
                }}
              >
                <Shuffle size={15} /> Outro olhar
              </button>
              {filtered.length > 3 && !query && category === 'Todos os temas' && (
                <button className="text-link" onClick={() => setExpanded(!expanded)}>
                  {expanded ? 'Ver só os destaques' : 'Ver todas as experiências'}{' '}
                  {expanded ? <Minus size={16} /> : <Plus size={16} />}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="learning-section container section" id="trilhas">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">
                <span className="tiny-square" />
                02 — CONECTE AS DESCOBERTAS
              </div>
              <h2>
                Um passo além do óbvio<span>.</span>
              </h2>
            </div>
            <p>
              Experiências que se conectam.
              <br />
              Caminhos para aprender com intenção.
            </p>
          </div>
          <div className="track-grid">
            {tracks.map((track) => (
              <button
                key={track.id}
                className={`track-card track-${track.id}`}
                onClick={() => setModal({ type: 'track', track })}
              >
                <div className="track-content">
                  <div className="track-meta">
                    <span>TRILHA ABERTA</span>
                    <span>0{track.steps.length} EXPLORAÇÕES</span>
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.subtitle}</p>
                  <div className="track-bottom">
                    <span>{track.label}</span>
                    <span className="circle-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </div>
                <div className="track-art">
                  <ProjectArt type={track.art} />
                </div>
              </button>
            ))}
          </div>
          <div className="learning-note">
            <Fingerprint size={19} />
            <p>Seu caminho é único. Comece por onde sua curiosidade apontar.</p>
            <span>SEM PRESSA. SEM FRONTEIRAS.</span>
          </div>
        </section>

        <MiniLab />

        <section className="manifesto-section" id="sobre">
          <div className="container manifesto-inner">
            <div className="manifesto-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <g fill="currentColor" transform="translate(16 16)">
                  {[0, 60, 120].map((a) => (
                    <rect
                      key={a}
                      x="-1.4"
                      y="-15"
                      width="2.8"
                      height="30"
                      transform={`rotate(${a})`}
                    />
                  ))}
                </g>
              </svg>
            </div>
            <div>
              <div className="eyebrow">03 — O ESPÍRITO ERGASTÉRIO</div>
              <h2>
                O futuro pertence
                <br />a quem <em>continua curioso.</em>
              </h2>
              <p>
                Ergastério vem da ideia de oficina. Um lugar onde o conhecimento ganha forma, as
                disciplinas se encontram e aprender é um ato de criação.
              </p>
              <button
                className="manifesto-link"
                onClick={() => setOpenHero(!openHero)}
                aria-expanded={openHero}
              >
                {openHero ? 'Um espaço sempre em construção' : 'Conheça o nosso jeito de pensar'}{' '}
                {openHero ? <Minus size={17} /> : <Plus size={17} />}
              </button>
              {openHero && (
                <div className="manifesto-expanded">
                  <p>
                    Acreditamos em aprender pela experiência, compartilhar caminhos e aproximar
                    áreas que costumam andar separadas. Reunimos projetos abertos e experimentais —
                    alguns originais, outros adaptados de iniciativas da comunidade — com crédito às
                    suas fontes.
                  </p>
                  <p>
                    Cada experiência é um convite a observar, fazer perguntas e construir suas
                    próprias conexões.
                  </p>
                </div>
              )}
            </div>
            <div className="manifesto-aside">
              <div>
                <Orbit />
                <span>Explore sem fronteiras.</span>
              </div>
              <div>
                <Layers />
                <span>Conecte o que você sabe.</span>
              </div>
              <div>
                <Fingerprint />
                <span>Crie seu próprio caminho.</span>
              </div>
              <span>APRENDER É ESTAR EM MOVIMENTO. ↗</span>
            </div>
          </div>
        </section>

        <section className="future-section container">
          <div className="future-copy">
            <div className="eyebrow">
              <span className="status-dot" /> O PRÓXIMO CAPÍTULO
            </div>
            <h2>
              Mais profundidade.
              <br />
              Novas possibilidades.
            </h2>
            <p>
              {hasOffers
                ? 'Formações e coleções para quem quer ir além. Ciência, criação e tecnologia em jornadas com propósito.'
                : 'Estamos desenhando formações e coleções para quem quer ir além. Ciência, criação e tecnologia em jornadas com propósito.'}
            </p>
            <button className="button button-primary" onClick={() => setModal({ type: 'future' })}>
              {hasOffers ? 'Conheça as formações' : 'Veja o que está por vir'}{' '}
              <ArrowUpRight size={18} />
            </button>
            <span className="future-footnote">
              {hasOffers ? 'SEU PRÓXIMO PASSO COMEÇA AQUI' : 'FORMAÇÕES EM DESENVOLVIMENTO'}
            </span>
          </div>
          <div className="future-graphic" aria-hidden="true">
            <div className="future-ring ring-one" />
            <div className="future-ring ring-two" />
            <div className="future-ring ring-three" />
            <span>
              O próximo
              <br />
              começa
              <br />
              <em>em você.</em>
            </span>
            <svg viewBox="0 0 40 40">
              <path d="M8 32 32 8M8 8h24v24" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <small>ERGASTÉRIO / CONTINUE EXPLORANDO</small>
          </div>
        </section>

        <section className="faq-section container">
          <div>
            <span className="eyebrow">ANTES DE CONTINUAR</span>
            <h2>
              A curiosidade
              <br />
              também pergunta.
            </h2>
          </div>
          <div className="faq-list">
            {[
              {
                q: 'Preciso saber por onde começar?',
                a: 'Não. Escolha um tema, experimente uma das descobertas em destaque ou use “Me surpreenda”. As trilhas abertas oferecem uma sequência quando você quiser um caminho guiado.',
              },
              {
                q: 'As experiências são gratuitas?',
                a: 'As experiências abertas podem ser exploradas nos sites ou repositórios indicados, conforme as condições de cada projeto. As futuras formações pagas serão apresentadas separadamente, com preço e condições claros.',
              },
              {
                q: 'O que muda quando eu volto?',
                a: 'Os destaques ganham uma nova ordem a cada dia. O catálogo acompanha novos projetos públicos do laboratório, e o seu radar mantém as descobertas salvas neste navegador.',
              },
            ].map((item, i) => (
              <div className="faq-item" key={item.q}>
                <h3>
                  <button
                    aria-expanded={faq === i}
                    aria-controls={`faq-${i}`}
                    onClick={() => setFaq(faq === i ? null : i)}
                  >
                    {item.q}
                    {faq === i ? <Minus size={17} /> : <Plus size={17} />}
                  </button>
                </h3>
                <div id={`faq-${i}`} hidden={faq !== i}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <div className="footer-top">
          <Brand footer />
          <p>
            Conhecimento em movimento.
            <br />
            Possibilidades em expansão.
          </p>
          <a href={`https://github.com/${catalog.owner}`} target="_blank" rel="noopener noreferrer">
            Projetos abertos <ArrowUpRight size={15} />
          </a>
          <button className="text-link" onClick={() => setModal({ type: 'privacy' })}>
            Privacidade
          </button>
          <a className="back-top" href="#inicio" aria-label="Voltar ao início">
            <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ergastério</span>
          <span>FEITO DE CURIOSIDADE. ABERTO AO QUE VEM.</span>
          <span>ARTE + CIÊNCIA + TECNOLOGIA</span>
        </div>
      </footer>

      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}

      {modal?.type === 'project' && (
        <Modal wide title={modal.project.name} onClose={() => setModal(null)}>
          <div className="project-detail">
            <div className="detail-art">
              <ProjectArt type={modal.project.art} />
              <span className="detail-art-label">UM CONVITE À DESCOBERTA ↗</span>
            </div>
            <div className="detail-content">
              <span className="eyebrow">{modal.project.category} / EXPERIÊNCIA ABERTA</span>
              <h2>{modal.project.title}</h2>
              <p>{modal.project.description}</p>
              <h3>O que você pode explorar</h3>
              <ul className="objectives">
                {modal.project.objectives.map((o) => (
                  <li key={o}>
                    <Check size={15} />
                    {o}
                  </li>
                ))}
              </ul>
              <div className="detail-cta">
                <a
                  className="button button-primary"
                  href={modal.project.homepage ?? modal.project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {modal.project.homepage ? 'Abrir experiência' : 'Conhecer o projeto'}{' '}
                  <ExternalLink size={16} />
                </a>
                <button
                  className="button button-outline"
                  aria-pressed={saved.includes(modal.project.id)}
                  onClick={() => toggleSave(modal.project.id)}
                >
                  <Bookmark
                    size={16}
                    fill={saved.includes(modal.project.id) ? 'currentColor' : 'none'}
                  />
                  {saved.includes(modal.project.id) ? 'Salvo no radar' : 'Salvar no radar'}
                </button>
              </div>
              <a
                className="source-link"
                href={modal.project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Código, documentação e créditos <ArrowUpRight size={13} />
              </a>
              {modal.project.isFork && (
                <p className="attribution-note">
                  Adaptação de um projeto da comunidade. Consulte o repositório para autoria
                  original e licença.
                </p>
              )}
              <p className="external-note">
                Você será direcionado ao {modal.project.homepage ? 'site' : 'repositório'} do
                projeto em uma nova aba.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'track' && (
        <Modal title={modal.track.title} onClose={() => setModal(null)}>
          <div className="track-detail">
            <span className="eyebrow">TRILHA ABERTA / {modal.track.category}</span>
            <h2>{modal.track.title}</h2>
            <p>{modal.track.description}</p>
            <div className="progress-caption">
              <span>Seu percurso</span>
              <span>
                {modal.track.steps.filter((_, i) => progress[`${modal.track.id}-${i}`]).length} de{' '}
                {modal.track.steps.length} etapas
              </span>
            </div>
            <div className="progress-bar">
              <span
                style={{
                  width: `${(modal.track.steps.filter((_, i) => progress[`${modal.track.id}-${i}`]).length / modal.track.steps.length) * 100}%`,
                }}
              />
            </div>
            <ol className="track-steps">
              {modal.track.steps.map((step, i) => {
                const project = catalog.projects.find((p) => p.id === modal.track.projectIds[i]);
                const done = Boolean(progress[`${modal.track.id}-${i}`]);
                return (
                  <li key={step}>
                    <button
                      className={`step-check ${done ? 'complete' : ''}`}
                      aria-label={`${done ? 'Desmarcar' : 'Concluir'} etapa ${i + 1}`}
                      aria-pressed={done}
                      onClick={() =>
                        setProgress({ ...progress, [`${modal.track.id}-${i}`]: !done })
                      }
                    >
                      {done ? <Check size={16} /> : i + 1}
                    </button>
                    <div>
                      <p>{step}</p>
                      {project && (
                        <a
                          href={project.homepage ?? project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Explorar {project.name}
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="storage-note">
              Seu progresso fica salvo neste navegador. A trilha é autoguiada e não oferece
              certificação.
            </p>
          </div>
        </Modal>
      )}

      {modal?.type === 'radar' && (
        <Modal title="Meu radar" onClose={() => setModal(null)}>
          <div className="radar-detail">
            <span className="eyebrow">SUAS PRÓXIMAS DESCOBERTAS</span>
            <h2>
              Meu radar<span>.</span>
            </h2>
            <p>Guarde o que te move. Volte quando quiser.</p>
            {interest && (
              <button className="radar-upcoming" onClick={() => setModal({ type: 'future' })}>
                <Bookmark size={17} />
                <span>
                  <strong>O próximo capítulo</strong>
                  <small>Formações no seu radar</small>
                </span>
                <ArrowUpRight size={17} />
              </button>
            )}
            {savedProjects.length ? (
              <div className="radar-list">
                {savedProjects.map((project) => (
                  <div key={project.id}>
                    <button className="radar-project" onClick={() => openProject(project)}>
                      <ProjectArt type={project.art} />
                      <span>
                        <small>{project.category}</small>
                        <strong>{project.name}</strong>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Remover ${project.name} do radar`}
                      onClick={() => toggleSave(project.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="radar-empty">
                <Bookmark size={34} />
                <h3>Dê espaço à próxima descoberta.</h3>
                <p>Toque no marcador de uma experiência para guardá-la aqui.</p>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setModal(null);
                    browse();
                  }}
                >
                  Começar a explorar <ArrowRight size={17} />
                </button>
              </div>
            )}
            <p className="storage-note">Salvo somente neste navegador, sem criar conta.</p>
          </div>
        </Modal>
      )}

      {modal?.type === 'future' && (
        <Modal title="O próximo capítulo" onClose={() => setModal(null)}>
          <div className="future-detail">
            <span className="eyebrow">
              {hasOffers ? 'FORMAÇÕES ERGASTÉRIO' : 'FORMAÇÕES EM DESENVOLVIMENTO'}
            </span>
            <h2>
              {hasOffers ? 'Seu próximo passo.' : 'O próximo capítulo'}
              <br />
              {hasOffers ? 'Novas possibilidades.' : 'está tomando forma.'}
            </h2>
            <p>
              {hasOffers
                ? 'Percursos que conectam exploração, fundamentos e criação. Escolha por onde continuar.'
                : 'Estamos preparando percursos que conectam exploração, fundamentos e criação. Duas direções para começar:'}
            </p>
            {products.map((product, i) => (
              <div className="upcoming-product" key={product.id}>
                <span>
                  {String(i + 1).padStart(2, '0')} / {product.category}
                </span>
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
                      Conhecer e comprar <ArrowUpRight size={16} />
                    </a>
                    <small>Confira programa, acesso e condições na página de compra.</small>
                  </div>
                ) : (
                  <small>Programa em elaboração · Inscrições ainda não abertas</small>
                )}
              </div>
            ))}
            <button
              className={`button ${interest ? 'button-outline' : 'button-primary'}`}
              onClick={() => {
                setInterest(!interest);
                announce(
                  interest
                    ? 'Lembrete removido do seu radar.'
                    : 'O próximo capítulo está no seu radar.',
                );
              }}
            >
              {interest ? <CheckCheck size={17} /> : <Bookmark size={17} />}{' '}
              {interest ? 'No meu radar' : 'Guardar no meu radar'}
            </button>
            <p className="storage-note">
              Este lembrete fica neste navegador. Não é uma inscrição e não envia notificações.
            </p>
          </div>
        </Modal>
      )}

      {modal?.type === 'privacy' && (
        <Modal title="Privacidade" onClose={() => setModal(null)}>
          <div className="privacy-detail">
            <span className="eyebrow">RESPEITO À SUA CURIOSIDADE</span>
            <h2>Simples. E transparente.</h2>
            <p>
              Esta Home não solicita cadastro, não coleta seu e-mail e não usa ferramentas de
              publicidade ou rastreamento.
            </p>
            <p>
              O radar, o progresso nas trilhas e os lembretes são armazenados localmente no seu
              navegador. Você pode apagá-los a qualquer momento.
            </p>
            <p>
              Ao abrir uma experiência externa ou o GitHub, passam a valer as políticas do site de
              destino. O catálogo inclui informações públicas dos projetos.
            </p>
            <button
              className="button button-outline"
              onClick={() => {
                setSaved([]);
                setProgress({});
                setInterest(false);
                announce('Seus dados locais foram apagados.');
              }}
            >
              Apagar meus dados locais <X size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
