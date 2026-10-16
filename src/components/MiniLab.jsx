import { useMemo, useState } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
const presets = [
  { name: 'Equilíbrio', a: 1, b: 1, phase: 90 },
  { name: 'Ritmo', a: 2, b: 3, phase: 45 },
  { name: 'Surpresa', a: 3, b: 4, phase: 90 },
];
export default function MiniLab() {
  const [a, setA] = useState(2),
    [b, setB] = useState(3),
    [phase, setPhase] = useState(45);
  const path = useMemo(
    () =>
      Array.from({ length: 1401 }, (_, i) => {
        const t = (i / 1400) * Math.PI * 2;
        return `${i ? 'L' : 'M'}${(200 + Math.sin(a * t + (phase * Math.PI) / 180) * 118).toFixed(2)},${(160 + Math.sin(b * t) * 118).toFixed(2)}`;
      }).join(' '),
    [a, b, phase],
  );
  return (
    <section className="mini-lab container" aria-labelledby="lab-title">
      <div className="lab-visual">
        <div className="lab-visual-top">
          <span>
            <i /> LAB / 001
          </span>
          <span>FIGURAS DE LISSAJOUS</span>
        </div>
        <svg
          viewBox="0 0 400 320"
          role="img"
          aria-label={`Figura de Lissajous: frequência horizontal ${a}, vertical ${b}, fase ${phase} graus`}
        >
          <defs>
            <pattern id="lab-grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path
                d="M25 0H0V25"
                fill="none"
                stroke="#6e64ce"
                strokeOpacity=".09"
                strokeWidth=".5"
              />
            </pattern>
            <linearGradient id="lab-line" x2="1" y2="1">
              <stop stopColor="#5951e8" />
              <stop offset="1" stopColor="#a384df" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="320" fill="url(#lab-grid)" />
          <path d="M200 15V305 M15 160H385" stroke="#6e64ce" strokeWidth=".5" strokeOpacity=".2" />
          <path d={path} fill="none" stroke="url(#lab-line)" strokeWidth="1.6" />
          <circle
            cx={200 + Math.sin((phase * Math.PI) / 180) * 118}
            cy="160"
            r="4"
            fill="#5951e8"
          />
        </svg>
        <div className="lab-visual-bottom">
          <span>DUAS ONDAS. INFINITAS CONEXÕES.</span>
          <span>
            {a}:{b}
          </span>
        </div>
      </div>
      <div className="lab-controls">
        <div className="eyebrow">
          <span className="status-dot" /> UM MINUTO DE DESCOBERTA
        </div>
        <h2 id="lab-title">
          E se você mudar
          <br />
          uma variável?
        </h2>
        <p>
          Duas ondas criam um desenho. Mude a relação entre elas e veja a matemática encontrar a
          arte.
        </p>
        <div className="lab-presets" aria-label="Configurações do experimento">
          {presets.map((p) => (
            <button
              key={p.name}
              aria-pressed={a === p.a && b === p.b && phase === p.phase}
              onClick={() => {
                setA(p.a);
                setB(p.b);
                setPhase(p.phase);
              }}
            >
              {p.name}
              <ArrowUpRight size={12} />
            </button>
          ))}
        </div>
        <div className="lab-sliders">
          <label htmlFor="wave-a">
            Frequência horizontal <output htmlFor="wave-a">{a}</output>
          </label>
          <input
            id="wave-a"
            type="range"
            min="1"
            max="7"
            step="1"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
          />
          <label htmlFor="wave-b">
            Frequência vertical <output htmlFor="wave-b">{b}</output>
          </label>
          <input
            id="wave-b"
            type="range"
            min="1"
            max="7"
            step="1"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
        </div>
        <div className="lab-insight" aria-live="polite">
          <span>↳</span>
          <p>
            {a === b
              ? 'Frequências iguais criam uma elipse. Com uma fase de 90°, ela se aproxima de um círculo.'
              : `A relação ${a}:${b} produz este padrão. Proporções simples também ajudam a entender os intervalos musicais.`}
          </p>
        </div>
        <button
          className="lab-reset"
          onClick={() => {
            setA(2);
            setB(3);
            setPhase(45);
          }}
        >
          <RotateCcw size={12} /> Recomeçar o experimento
        </button>
      </div>
    </section>
  );
}
