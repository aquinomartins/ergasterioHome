export default function DiscoveryArt() {
  return (
    <svg
      className="discovery-art"
      viewBox="0 0 390 320"
      role="img"
      aria-label="Uma caixa de ideias conecta órbitas, ciência e criação"
    >
      <defs>
        <linearGradient id="orb" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#a5a5ff" />
          <stop offset=".4" stopColor="#6665ff" />
          <stop offset="1" stopColor="#3432d8" />
        </linearGradient>
        <linearGradient id="box" x2="1" y2="1">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#e5e6ff" />
        </linearGradient>
      </defs>
      <ellipse cx="212" cy="257" rx="145" ry="44" fill="#e2e3ff" />
      <ellipse cx="207" cy="251" rx="150" ry="49" fill="none" stroke="#b5b5ff" strokeWidth=".8" />
      <path d="M98 166l99-53 99 53-99 56Z" fill="#dedfff" />
      <path d="M98 166l99 56v69l-99-56Z" fill="url(#box)" />
      <path d="M197 222l99-56v69l-99 56Z" fill="#d9daf7" />
      <path d="M98 166l-28-41 100-49 27 37Z" fill="#fff" />
      <path d="M197 113l28-37 101 49-30 41Z" fill="#d0d0ff" />
      <path d="M98 166l99 56-34 31-93-58Z" fill="#fafaff" />
      <path d="M197 222l99-56 32 29-99 58Z" fill="#b9b9ff" />
      <circle cx="199" cy="126" r="57" fill="url(#orb)" />
      <ellipse
        cx="199"
        cy="126"
        rx="83"
        ry="25"
        transform="rotate(-28 199 126)"
        fill="none"
        stroke="#bfc2ff"
        strokeWidth="1.3"
      />
      <ellipse
        cx="199"
        cy="126"
        rx="23"
        ry="57"
        transform="rotate(20 199 126)"
        fill="none"
        stroke="#d5d7ff"
        strokeWidth=".75"
        opacity=".65"
      />
      <path
        d="M157 114q44 21 86-1M164 91q33 15 69-1M154 140q44 18 89-1M164 162q32 10 65-2"
        fill="none"
        stroke="#d5d7ff"
        strokeWidth=".7"
        opacity=".5"
      />
      <circle cx="135" cy="153" r="5" fill="#fff" stroke="#9291ee" />
      <g transform="translate(47 61) rotate(-13)">
        <rect width="62" height="57" rx="10" fill="white" stroke="#e0e0f8" />
        <g stroke="#6a67f4" fill="none" strokeWidth="1.6">
          <ellipse cx="31" cy="28" rx="18" ry="7" />
          <ellipse cx="31" cy="28" rx="18" ry="7" transform="rotate(60 31 28)" />
          <ellipse cx="31" cy="28" rx="18" ry="7" transform="rotate(120 31 28)" />
        </g>
        <circle cx="31" cy="28" r="3" fill="#6a67f4" />
      </g>
      <g transform="translate(293 67) rotate(12)">
        <rect width="59" height="57" rx="10" fill="#fff0e9" />
        <path d="M17 37l7-16 15-5-7 16Z" fill="#ffad8c" />
        <path d="M24 21l8 11" stroke="white" strokeWidth="1.5" />
        <circle cx="39" cy="16" r="3" fill="#ff8a69" />
      </g>
      <g transform="translate(293 207) rotate(-8)">
        <rect width="63" height="50" rx="10" fill="white" stroke="#e5e6f5" />
        <path
          d="M25 16l-9 9 9 9m13-18 9 9-9 9m-4-22-5 29"
          fill="none"
          stroke="#6663ef"
          strokeWidth="1.5"
        />
      </g>
      <g fill="none" stroke="#aaa8f5" strokeWidth="1">
        <path d="M94 94q42-57 95-49M259 60q59 21 64 64M316 167q24 10 21 36" strokeDasharray="3 5" />
      </g>
      <g fill="#8d89f1">
        <path d="M272 31l2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" />
        <path d="M60 191l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
      </g>
      <circle cx="118" cy="44" r="3" fill="#ffbca8" />
      <circle cx="351" cy="158" r="3" fill="#c5c3ff" />
    </svg>
  );
}
