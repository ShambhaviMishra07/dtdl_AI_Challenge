
// import { motion, useReducedMotion } from "motion/react";

// const LINES = [
//   { text: "DTDL", className: "kh__line--dtdl", start: 0.05, accents: { 1: "kh__char--accent" } },
//   { text: "AI", className: "kh__line--ai", start: 0.6, glow: true },
//   { text: "CHALLENGE", className: "kh__line--challenge", start: 1.0, accents: { 8: "kh__char--soft" } },
// ];

// // deterministic pseudo-random in [-1, 1]
// const rand = (seed) => {
//   const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
//   return (x - Math.floor(x)) * 2 - 1;
// };

// function Line({ line, lineIndex, reduce }) {
//   const letters = [...line.text];

//   return (
//     <motion.span
//       className={`kh__line ${line.className}`}
//       aria-hidden="true"
//       animate={
//         line.glow && !reduce
//           ? {
//               filter: [
//                 "drop-shadow(0 0 0px rgba(226,0,116,0))",
//                 "drop-shadow(0 0 24px rgba(226,0,116,0.8))",
//                 "drop-shadow(0 0 8px rgba(226,0,116,0.3))",
//               ],
//             }
//           : undefined
//       }
//       transition={{ duration: 1.1, delay: line.start + 0.55, times: [0, 0.45, 1], ease: "easeOut" }}
//     >
//       {letters.map((ch, i) => {
//         const seed = lineIndex * 20 + i + 1;
//         const initial = reduce
//           ? { opacity: 0 }
//           : {
//               opacity: 0,
//               x: rand(seed) * 70,
//               y: rand(seed + 9) * 60 + (lineIndex === 0 ? 30 : 40),
//               rotate: rand(seed + 3) * 18,
//               scale: 0.9,
//             };

//         return (
//           <motion.span
//             key={i}
//             className={`kh__char ${line.accents?.[i] ?? ""}`}
//             initial={initial}
//             animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
//             transition={
//               reduce
//                 ? { duration: 0.4, delay: lineIndex * 0.08 }
//                 : {
//                     type: "spring",
//                     stiffness: 150 + rand(seed + 5) * 30,
//                     damping: 16,
//                     mass: 0.9,
//                     delay: line.start + i * 0.055 + Math.abs(rand(seed + 7)) * 0.06,
//                   }
//             }
//           >
//             {ch}
//           </motion.span>
//         );
//       })}
//     </motion.span>
//   );
// }

// export default function KineticHeading() {
//   const reduce = useReducedMotion();

//   return (
//     <h1 className="kh">
//       <span className="sr-only">DTDL AI Challenge</span>
//       {LINES.map((line, i) => (
//         <Line key={line.text} line={line} lineIndex={i} reduce={reduce} />
//       ))}
//     </h1>
//   );
// }



import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";

/* ---- Tunables ---- */
const CONFIG = {
  stagger: 0.055,        // seconds between letters (entrance)
  scatter: 70,           // px: how far letters start from their final spot
  spring: { stiffness: 170, damping: 13, mass: 0.9 }, // lower damping = more overshoot
  readyMs: 2800,         // hover is enabled after the entrance has settled
  hoverRadius: 260,      // px: how far from the pointer letters react
  hoverPush: 34,         // px: max displacement on hover
  hoverDuration: 0.9,    // seconds for the scatter-and-return
  cooldown: 900,         // ms before hover can retrigger (stops tiny movements restarting it)
  glowPeak: 1,           // glow while moving (0 to 1)
  glowRest: 0.25,        // glow when stationary
};

const LINES = [
  { text: "DTDL", className: "kh__line--dtdl", start: 0.05, accents: { 1: "kh__char--accent" } },
  { text: "AI", className: "kh__line--ai", start: 0.75 },
  { text: "CHALLENGE", className: "kh__line--challenge", start: 1.15, accents: { 8: "kh__char--soft" } },
];

// deterministic pseudo-random in [-1, 1] (same layout on every load)
const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

function Letter({ ch, seed, lineIndex, i, start, className, reduce, burst }) {
  const controls = useAnimationControls();
  const ref = useRef(null);
  const delay = start + i * CONFIG.stagger + Math.abs(rand(seed + 7)) * 0.06;

  const initial = reduce
    ? { opacity: 0, "--glow": CONFIG.glowRest }
    : {
        opacity: 0,
        x: rand(seed) * CONFIG.scatter,
        y: rand(seed + 9) * (CONFIG.scatter * 0.85) + 30,
        rotate: rand(seed + 3) * 20,
        scale: 0.9,
        "--glow": CONFIG.glowPeak,
      };

  // Entrance: scattered -> overshoot -> settle, glow fades once settled
  useEffect(() => {
    if (reduce) {
      controls.start({ opacity: 1, transition: { duration: 0.4, delay: lineIndex * 0.08 } });
      return;
    }
    controls.start({
      opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, "--glow": CONFIG.glowRest,
      transition: {
        default: {
          type: "spring",
          ...CONFIG.spring,
          stiffness: CONFIG.spring.stiffness + rand(seed + 5) * 25,
          delay,
        },
        opacity: { duration: 0.35, delay },
        "--glow": { duration: 1.3, delay: delay + 0.3, ease: "easeOut" },
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hover: letters near the pointer are pushed away, then settle back
  useEffect(() => {
    if (!burst || reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - burst.x;
    const dy = r.top + r.height / 2 - burst.y;
    const dist = Math.hypot(dx, dy);
    const f = Math.max(0, 1 - dist / CONFIG.hoverRadius);
    if (f < 0.04) return;
    const inv = dist || 1;
    const push = f * CONFIG.hoverPush;

    controls.start({
      x: [null, (dx / inv) * push, 0],
      y: [null, (dy / inv) * push - f * 8, 0],
      rotate: [null, rand(seed + 3) * f * 12, 0],
      scale: [null, 1 + f * 0.06, 1],
      "--glow": [null, CONFIG.glowRest + 0.75 * f, CONFIG.glowRest],
      transition: {
        duration: CONFIG.hoverDuration,
        times: [0, 0.35, 1],
        ease: "easeOut",
        delay: dist / 1800, // ripple outward from the pointer
      },
    });
  }, [burst]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.span
      ref={ref}
      className={`kh__char ${className ?? ""}`}
      initial={initial}
      animate={controls}
    >
      {ch}
    </motion.span>
  );
}

export default function KineticHeading() {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(null);
  const ready = useRef(false);
  const last = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => { ready.current = true; }, CONFIG.readyMs);
    return () => clearTimeout(t);
  }, [reduce]);

  const trigger = useCallback(
    (e) => {
      if (reduce || !ready.current) return;
      const now = performance.now();
      if (now - last.current < CONFIG.cooldown) return;
      last.current = now;
      setBurst({ x: e.clientX, y: e.clientY, id: now });
    },
    [reduce]
  );

  return (
    <h1
      className="kh"
      onPointerEnter={trigger}
      onPointerMove={trigger}
      onPointerDown={trigger}
    >
      <span className="sr-only">DTDL AI Challenge</span>
      {LINES.map((line, li) => (
        <span key={line.text} className={`kh__line ${line.className}`} aria-hidden="true">
          {[...line.text].map((ch, i) => (
            <Letter
              key={`${line.text}-${i}`}
              ch={ch}
              i={i}
              lineIndex={li}
              seed={li * 20 + i + 1}
              start={line.start}
              className={line.accents?.[i]}
              reduce={reduce}
              burst={burst}
            />
          ))}
        </span>
      ))}
    </h1>
  );
}