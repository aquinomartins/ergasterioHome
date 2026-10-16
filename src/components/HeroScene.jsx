import { useEffect, useRef, useState } from 'react';

export default function HeroScene() {
  const mount = useRef(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let disposed = false,
      renderer,
      frame,
      observer,
      resizeObserver,
      geometry,
      material;
    let visible = true;
    const el = mount.current;
    const pointer = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width - 0.5;
      pointer.y = (e.clientY - r.top) / r.height - 0.5;
    };
    async function init() {
      try {
        const THREE = await import('three');
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
        renderer.setClearColor(0, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.z = 6.3;
        scene.add(new THREE.AmbientLight(0xffecd9, 2.0));
        const key = new THREE.DirectionalLight(0xfff6de, 5);
        key.position.set(-3, 4, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xe5eeaa, 2.3);
        rim.position.set(3, 1, -2);
        scene.add(rim);
        const bottom = new THREE.DirectionalLight(0xc78967, 2);
        bottom.position.set(1, -3, 1);
        scene.add(bottom);
        geometry = new THREE.TorusKnotGeometry(1.02, 0.32, 260, 36, 2, 3);
        material = new THREE.MeshPhysicalMaterial({
          color: 0xe6c9a3,
          roughness: 0.38,
          metalness: 0.33,
          clearcoat: 0.2,
        });
        const knot = new THREE.Mesh(geometry, material);
        knot.rotation.set(0.32, 0.25, -0.4);
        scene.add(knot);
        el.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        const resize = () => {
          const w = el.clientWidth,
            h = el.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(el);
        resize();
        observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        observer.observe(el);
        el.addEventListener('pointermove', onMove);
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        let last = 0;
        const animate = (time) => {
          if (disposed) return;
          frame = requestAnimationFrame(animate);
          if (!visible || document.hidden || time - last < 32) return;
          last = time;
          if (!reduced) {
            knot.rotation.y = 0.25 + time * 0.000055 + pointer.x * 0.3;
            knot.rotation.x += (0.32 + pointer.y * 0.15 - knot.rotation.x) * 0.035;
            knot.position.y = Math.sin(time * 0.0006) * 0.065;
          }
          renderer.render(scene, camera);
        };
        setLoaded(true);
        if (!reduced) frame = requestAnimationFrame(animate);
      } catch {
        /* A composição SVG permanece disponível sem WebGL. */
      }
    }
    init();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resizeObserver?.disconnect();
      el.removeEventListener('pointermove', onMove);
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div
      className="hero-visual"
      role="img"
      aria-label="Escultura digital em movimento: um encontro entre arte, ciência e tecnologia"
    >
      <div className="hero-halo" />
      <svg className="orbit-system" viewBox="0 0 600 580" aria-hidden="true">
        <defs>
          <path id="orbit-text" d="M300 82a205 205 0 1 1-1 0" />
        </defs>
        <g fill="none" stroke="#a3b39b" strokeWidth=".65">
          <ellipse
            cx="300"
            cy="286"
            rx="241"
            ry="101"
            transform="rotate(-30 300 286)"
            opacity=".3"
          />
          <ellipse
            cx="300"
            cy="286"
            rx="241"
            ry="101"
            transform="rotate(39 300 286)"
            opacity=".17"
          />
          <circle cx="300" cy="286" r="205" strokeDasharray="2 7" opacity=".22" />
          <circle cx="300" cy="286" r="249" opacity=".1" />
        </g>
        <g stroke="#b8c3ab" opacity=".4" strokeWidth=".7">
          <path d="M20 286H50m500 0h30M300 7v30m0 499v30" />
          <path d="M66 76l8 8m-8 0 8-8M526 486l8 8m-8 0 8-8" />
        </g>
        <g fontFamily="monospace" fontSize="9" letterSpacing="3" fill="#a2ae98">
          <text>
            <textPath href="#orbit-text" startOffset="3%">
              ARTE · CIÊNCIA · TECNOLOGIA · POSSIBILIDADES INFINITAS ·
            </textPath>
          </text>
        </g>
        <circle cx="108" cy="414" r="4" fill="#e5ef9b" />
        <circle cx="490" cy="160" r="3" fill="#e5ef9b" />
        <g fill="#c6cdb9" fontFamily="monospace" fontSize="9">
          <text x="40" y="458">
            01 / EXPERIMENTAR
          </text>
          <text x="419" y="114">
            02 / CONECTAR
          </text>
        </g>
      </svg>
      <div ref={mount} className="sculpture-mount" />
      {!loaded && (
        <svg className="sculpture-fallback" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <linearGradient id="knot-fallback" x2="1" y2="1">
              <stop stopColor="#f2e6c3" />
              <stop offset=".5" stopColor="#b19471" />
              <stop offset="1" stopColor="#e7bb8e" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#knot-fallback)" strokeWidth="48">
            <ellipse cx="200" cy="200" rx="106" ry="56" transform="rotate(-55 200 200)" />
            <ellipse cx="200" cy="200" rx="106" ry="56" transform="rotate(65 200 200)" />
          </g>
        </svg>
      )}
      <div className="visual-caption">
        <span className="status-dot" /> IDEIAS EM ESTADO DE POSSIBILIDADE <span>↗</span>
      </div>
    </div>
  );
}
