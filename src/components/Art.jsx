import { useId } from 'react';

export function ProjectArt({ type = 'cell', className = '' }) {
  const id = useId().replaceAll(':', '');
  if (type === 'anatomy')
    return (
      <svg
        className={`project-art ${className}`}
        viewBox="0 0 640 440"
        role="img"
        aria-label="Estudo visual da anatomia humana em linhas e pontos"
      >
        <defs>
          <radialGradient id={`${id}bg`}>
            <stop stopColor="#244638" />
            <stop offset="1" stopColor="#122b25" />
          </radialGradient>
          <linearGradient id={`${id}body`} x2="1" y2="1">
            <stop stopColor="#edf1cd" />
            <stop offset="1" stopColor="#719582" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <rect width="640" height="440" fill={`url(#${id}bg)`} />
        <g stroke="#a2b6a0" strokeWidth=".45" opacity=".15">
          {Array.from({ length: 17 }, (_, i) => (
            <path key={i} d={`M${i * 40} 0V440 M0 ${i * 40}H640`} />
          ))}
        </g>
        <g transform="translate(324 210)" fill="none" stroke={`url(#${id}body)`}>
          <ellipse cy="-108" rx="36" ry="46" strokeWidth="1.4" />
          {Array.from({ length: 13 }, (_, i) => (
            <ellipse
              key={i}
              cy={-145 + i * 6}
              rx={Math.sqrt(Math.max(0, 1 - ((-145 + i * 6 + 108) / 46) ** 2)) * 36}
              ry="7"
              opacity=".64"
              strokeWidth=".65"
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${-27 + i * 6.8} -140 Q${-47 + i * 11.5} -107 ${-24 + i * 6} -72`}
              opacity=".65"
              strokeWidth=".65"
            />
          ))}
          <path
            d="M-19-67L-23-45Q-43-39-74-33L-106-5-118 70-128 130-109 136-83 76-73 24-58 9-48 72-54 111-44 153-53 230 M19-67L23-45Q43-39 74-33L106-5 118 70 128 130 109 136 83 76 73 24 58 9 48 72 54 111 44 153 53 230"
            strokeWidth="1.6"
          />
          {Array.from({ length: 24 }, (_, i) => {
            const y = -40 + i * 8;
            const w = y < 5 ? 45 + y * 0.45 : y < 80 ? 55 - y * 0.15 : 42 + (y - 80) * 0.2;
            return (
              <ellipse
                key={i}
                cy={y}
                rx={w}
                ry={12 + i * 0.2}
                strokeWidth=".7"
                opacity={0.7 - i * 0.013}
              />
            );
          })}
          {Array.from({ length: 15 }, (_, i) => {
            const x = -44 + i * 6.3;
            return (
              <path
                key={i}
                d={`M${x * 0.5}-48 Q${x * 1.7} 14 ${x} 100 Q${x * 1.8} 150 ${x * 0.8} 196`}
                strokeWidth=".65"
                opacity=".55"
              />
            );
          })}
          <path d="M0-65V195 M-69-30Q0 0 69-30 M-54 109Q0 141 54 109" strokeWidth="1" />
          {[-1, 1].map((side) => (
            <g key={side} transform={`scale(${side} 1)`}>
              {Array.from({ length: 13 }, (_, i) => (
                <ellipse
                  key={i}
                  transform={`translate(${90 + i * 2.2} ${i * 11}) rotate(15)`}
                  rx={13 - i * 0.35}
                  ry="4"
                  strokeWidth=".7"
                  opacity=".65"
                />
              ))}
            </g>
          ))}
        </g>
        <g fontFamily="monospace" fontSize="9" fill="#bbc8b4" opacity=".8">
          <text x="35" y="38">
            FIG. 01 / HOMO SAPIENS
          </text>
          <text x="35" y="407">
            UM SISTEMA DE POSSIBILIDADES
          </text>
          <text x="524" y="407">
            ATLAS / 3D
          </text>
        </g>
        <g fill="none" stroke="#dce8bd" strokeWidth=".6" opacity=".7">
          <circle cx="348" cy="205" r="5" />
          <path d="M353 205H448L468 184H540" />
          <circle cx="304" cy="123" r="3" />
          <path d="M301 123H217L197 142H129" />
        </g>
        <text x="470" y="178" fill="#cdd8ba" fontSize="9" fontFamily="monospace">
          CURIOSIDADE VIVA
        </text>
      </svg>
    );

  if (type === 'cell')
    return (
      <svg
        className={`project-art ${className}`}
        viewBox="0 0 640 440"
        role="img"
        aria-label="Célula translúcida com núcleo e organelas em tons de coral"
      >
        <defs>
          <radialGradient id={`${id}bg`}>
            <stop stopColor="#745a48" />
            <stop offset="1" stopColor="#302e29" />
          </radialGradient>
          <radialGradient id={`${id}cell`} cx=".32" cy=".2" r=".83">
            <stop stopColor="#f8d8b3" stopOpacity=".9" />
            <stop offset=".35" stopColor="#e7a87d" stopOpacity=".4" />
            <stop offset=".85" stopColor="#b37155" stopOpacity=".25" />
            <stop offset="1" stopColor="#f6cfa7" stopOpacity=".75" />
          </radialGradient>
          <radialGradient id={`${id}core`} cx=".3" cy=".22">
            <stop stopColor="#ffcf9e" />
            <stop offset=".35" stopColor="#dc7f5b" />
            <stop offset="1" stopColor="#743629" />
          </radialGradient>
          <filter id={`${id}shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dy="12" stdDeviation="13" floodColor="#15120c" floodOpacity=".6" />
          </filter>
        </defs>
        <rect width="640" height="440" fill={`url(#${id}bg)`} />
        <ellipse cx="330" cy="369" rx="128" ry="16" fill="#171810" opacity=".3" />
        <g filter={`url(#${id}shadow)`} transform="translate(320 213) rotate(-18)">
          <path
            d="M-132-34C-116-121-38-153 39-132 129-112 164-40 143 35 126 108 62 151-17 134-92 122-151 54-132-34Z"
            fill={`url(#${id}cell)`}
            stroke="#f4d3ab"
            strokeWidth="2"
          />
          {Array.from({ length: 35 }, (_, i) => {
            const a = (i * Math.PI * 2) / 35;
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * (126 + Math.sin(a * 3) * 8)}
                cy={Math.sin(a) * 125}
                rx="3"
                ry="5"
                transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 126} ${Math.sin(a) * 125})`}
                fill="#ffe5b9"
                opacity=".55"
              />
            );
          })}
          <ellipse
            cx="8"
            cy="7"
            rx="60"
            ry="58"
            fill={`url(#${id}core)`}
            stroke="#eebd92"
            strokeWidth="1.2"
          />
          <ellipse cx="-3" cy="-2" rx="20" ry="19" fill="#f0b789" opacity=".7" />
          {Array.from({ length: 14 }, (_, i) => (
            <path
              key={i}
              d={`M${-37 + i * 5} ${-28 + Math.sin(i) * 6}q18 16 0 32t4 19`}
              fill="none"
              stroke="#6e352c"
              opacity=".4"
              strokeWidth="1.3"
            />
          ))}
          {[
            [-85, -26, 35],
            [-40, -92, -30],
            [80, -46, 50],
            [56, 91, -15],
            [-66, 68, 20],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <rect
                x="-21"
                y="-10"
                width="42"
                height="20"
                rx="10"
                fill="#b9825b"
                stroke="#e7c49b"
              />
              <path d="M-14 0q5-10 8 0t8 0t8 0t7 0" fill="none" stroke="#eacfa0" strokeWidth="2" />
            </g>
          ))}
          {Array.from({ length: 45 }, (_, i) => {
            const a = i * 2.4,
              r = 70 + (i % 5) * 11;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * r}
                cy={Math.sin(a) * r}
                r={1 + (i % 3) * 0.7}
                fill="#ffe2b7"
                opacity=".55"
              />
            );
          })}
          <path
            d="M-127-32C-104-104-32-135 37-115"
            fill="none"
            stroke="#fff3d6"
            strokeWidth="4"
            opacity=".45"
          />
        </g>
        <g fontFamily="monospace" fontSize="9" fill="#e9cbb0">
          <text x="35" y="38">
            FIG. 02 / MICROCOSMOS
          </text>
          <text x="35" y="407">
            O EXTRAORDINÁRIO ESTÁ NO DETALHE
          </text>
          <text x="550" y="407">
            × 3.000
          </text>
        </g>
        <g stroke="#f0c8a6" fill="none" opacity=".5" strokeWidth=".7">
          <path d="M375 214h76l20-20h65" />
          <circle cx="375" cy="214" r="4" />
        </g>
      </svg>
    );

  const isArt = type === 'art' || type === 'sound';
  return (
    <svg
      className={`project-art ${className}`}
      viewBox="0 0 640 440"
      role="img"
      aria-label={
        isArt
          ? 'Escultura abstrata de ondas e linhas em azul elétrico'
          : 'Constelação de ideias conectadas em um espaço digital'
      }
    >
      <defs>
        <radialGradient id={`${id}bg`}>
          <stop stopColor={isArt ? '#303858' : '#273b3a'} />
          <stop offset="1" stopColor={isArt ? '#161e31' : '#132423'} />
        </radialGradient>
        <linearGradient id={`${id}line`} x2=".8" y2="1">
          <stop stopColor="#b9d5fe" />
          <stop offset=".5" stopColor="#6d8eff" />
          <stop offset="1" stopColor="#b096ed" />
        </linearGradient>
      </defs>
      <rect width="640" height="440" fill={`url(#${id}bg)`} />
      <g transform="translate(325 215) rotate(-24)" fill="none" stroke={`url(#${id}line)`}>
        {Array.from({ length: 65 }, (_, i) => {
          const r = 20 + i * 2;
          let d = '';
          for (let j = 0; j <= 160; j++) {
            const a = (j / 160) * Math.PI * 2;
            const wave = 1 + 0.19 * Math.cos(a * 3 + i * 0.04) + 0.06 * Math.sin(a * 7);
            const x = Math.cos(a) * r * wave * 1.28;
            const y = Math.sin(a) * r * wave * 0.91;
            d += `${j ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
          }
          return (
            <path
              key={i}
              d={d + 'Z'}
              strokeWidth={i % 4 === 0 ? 1.1 : 0.65}
              opacity={0.45 + i / 130}
            />
          );
        })}
      </g>
      <g fontFamily="monospace" fontSize="9" fill="#bcc8f3">
        <text x="35" y="38">
          FIG. 03 / NOVAS PERCEPÇÕES
        </text>
        <text x="35" y="407">
          NEM TUDO CABE EM UMA DEFINIÇÃO
        </text>
        <text x="536" y="407">
          ∞ / TEMPO
        </text>
      </g>
      <path d="M40 192v56m-28-28h56M572 220h28" stroke="#9cafdf" strokeWidth=".7" opacity=".5" />
    </svg>
  );
}
