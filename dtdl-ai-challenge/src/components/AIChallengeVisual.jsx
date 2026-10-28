import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const PARTICLES = [
  [90, 120, 0], [410, 90, 1.2], [440, 300, 2.1], [60, 340, 0.7],
  [330, 450, 1.8], [150, 430, 2.6], [250, 40, 3.2], [470, 190, 0.4],
];

export default function AIChallengeVisual() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 18 });
  const y = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 18);
      my.set((e.clientY / window.innerHeight - 0.5) * 18);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  // Orbit paths (ellipses centred at 250,250)
  const pathA = "M 35 250 a 215 90 0 1 0 430 0 a 215 90 0 1 0 -430 0";
  const pathB = "M 100 250 a 150 150 0 1 0 300 0 a 150 150 0 1 0 -300 0";

  return (
    <motion.div
      className="visual"
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      role="img"
      aria-label="Animated AI core surrounded by orbiting rings, representing five rounds of an AI challenge"
    >
      <svg className="visual__svg" viewBox="0 0 500 500" aria-hidden="true">
        <defs>
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--v-core-a)" stopOpacity="0.55" />
            <stop offset="55%" stopColor="var(--v-core-a)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--v-core-a)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="core-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--v-core-a)" />
            <stop offset="100%" stopColor="var(--v-core-b)" />
          </linearGradient>
        </defs>

        {/* ambient glow */}
        <circle cx="250" cy="250" r="240" fill="url(#core-glow)" />

        {/* rounds ring: five segments */}
        <g className={reduce ? "" : "v-spin v-spin--c"}>
          <circle cx="250" cy="250" r="195" className="v-stroke" strokeWidth="2"
            strokeDasharray="205 33.3" strokeLinecap="round" style={{ stroke: "var(--v-ring)" }} />
          {[0, 1, 2, 3, 4].map((k) => {
            const a = ((k * 72 - 90) * Math.PI) / 180;
            return <circle key={k} className="v-node" r="3"
              cx={250 + 195 * Math.cos(a)} cy={250 + 195 * Math.sin(a)} />;
          })}
        </g>

        {/* tilted elliptical orbit with a traveling node */}
        <g transform="rotate(-28 250 250)">
          <path d={pathA} className="v-stroke" />
          <circle className="v-node" r="5" cx={reduce ? 465 : 0} cy={reduce ? 250 : 0}>
            {!reduce && <animateMotion dur="16s" repeatCount="indefinite" path={pathA} />}
          </circle>
          <circle className="v-node" r="2.5" cx={reduce ? 35 : 0} cy={reduce ? 250 : 0} opacity="0.7">
            {!reduce && <animateMotion dur="16s" begin="-8s" repeatCount="indefinite" path={pathA} />}
          </circle>
        </g>

        {/* second orbit, opposite tilt */}
        <g transform="rotate(38 250 250)">
          <path d={pathA} className="v-stroke v-dash" />
          <circle className="v-node" r="3.5" cx={reduce ? 250 : 0} cy={reduce ? 340 : 0}>
            {!reduce && <animateMotion dur="22s" begin="-5s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path={pathA} />}
          </circle>
        </g>

        {/* inner circular orbit */}
        <g className={reduce ? "" : "v-spin v-spin--b"}>
          <path d={pathB} className="v-stroke" />
          <circle className="v-node" r="4" cx="400" cy="250" />
        </g>

        {/* core */}
        <g className={reduce ? "" : "v-pulse"}>
          <circle cx="250" cy="250" r="78" fill="url(#core-fill)" opacity="0.22" />
          <g className={reduce ? "" : "v-spin v-spin--a"}>
            <rect x="204" y="204" width="92" height="92" rx="14"
              transform="rotate(45 250 250)" fill="none" stroke="var(--v-ring-strong)" strokeWidth="1.2" />
          </g>
          <rect x="220" y="220" width="60" height="60" rx="10"
            transform="rotate(45 250 250)" fill="url(#core-fill)" />
          <circle cx="250" cy="250" r="22" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
          <text x="250" y="256" textAnchor="middle" fontSize="16" fontWeight="800"
            fontFamily="Bricolage Grotesque, sans-serif" fill="#fff" letterSpacing="1">AI</text>
        </g>

        {/* labels */}
        <g className="v-blink" style={{ "--d": 0 }}>
          <rect x="52" y="118" width="96" height="28" rx="8" className="v-panel" />
          <text x="66" y="136" className="v-label">ROUND 01</text>
        </g>
        <g className="v-blink" style={{ "--d": 1.6 }}>
          <rect x="372" y="200" width="82" height="28" rx="8" className="v-panel" />
          <text x="386" y="218" className="v-label">MODEL</text>
        </g>
        <g className="v-blink" style={{ "--d": 3.1 }}>
          <rect x="120" y="372" width="76" height="28" rx="8" className="v-panel" />
          <text x="134" y="390" className="v-label">SOLVE</text>
        </g>
        <g className="v-blink" style={{ "--d": 4.4 }}>
          <rect x="330" y="400" width="70" height="28" rx="8" className="v-panel" />
          <text x="344" y="418" className="v-label">12:00</text>
        </g>

        {/* particles */}
        {PARTICLES.map(([cx, cy, d], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.8" className="v-node v-twinkle" style={{ "--d": d }} />
        ))}
      </svg>
    </motion.div>
  );
}