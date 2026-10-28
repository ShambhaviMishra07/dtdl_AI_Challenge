import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ---- Tunables ---- */
export const ASSEMBLE = {
  threshold: 0.6,   // how much of the heading must be visible before it plays (0 to 1)
  stagger: 0.035,   // seconds between letters
  groupGap: 0.12,   // extra pause between groups (e.g. "Ideas become" -> "real")
  scatter: 46,      // px: how far letters start from their final spot
  rotate: 16,       // degrees: starting rotation
  stiffness: 190,   // spring speed
  damping: 12,      // lower = more overshoot (each letter adds 0 to 8 on top)
  glowPeak: 1,      // glow while moving (0 to 1)
  glowRest: 0.12,   // glow once settled
};

// deterministic pseudo-random in [-1, 1], so the layout is identical on every replay
const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

const LETTER = {
  hidden: (c) => ({
    opacity: 0,
    x: c.x,
    y: c.y,
    rotate: c.r,
    scale: 0.92,
    "--glow": ASSEMBLE.glowPeak,
    transition: { duration: 0 }, // snap back instantly when the heading leaves the screen
  }),
  show: (c) => ({
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    "--glow": ASSEMBLE.glowRest,
    transition: {
      default: { type: "spring", stiffness: c.k, damping: c.d, mass: 0.8, delay: c.delay },
      opacity: { duration: 0.3, delay: c.delay },
      "--glow": { duration: 1.2, delay: c.delay + 0.25, ease: "easeOut" },
    },
  }),
};

/**
 * segments: [{ text, accent? }]. Segments assemble one after another, left to right.
 * accent segments are wrapped in <em>, so your existing "em" styling still applies.
 * label: the full plain text, read once by screen readers.
 */
export default function AssembleHeading({ segments, label, className = "", ...rest }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [state, setState] = useState("hidden");

  const words = useMemo(() => {
    const small = typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches;
    const k = small ? 0.5 : 1; // gentler on phones
    let t = 0;
    let seed = 1;
    const out = [];
    segments.forEach((seg) => {
      let n = 0;
      seg.text.split(" ").filter(Boolean).forEach((word) => {
        const letters = [...word].map((ch) => {
          const s = seed++;
          return {
            ch,
            custom: {
              x: rand(s) * ASSEMBLE.scatter * k,
              y: rand(s + 9) * ASSEMBLE.scatter * 0.8 * k + 14 * k,
              r: rand(s + 3) * ASSEMBLE.rotate * k,
              delay: t + n++ * ASSEMBLE.stagger,
              k: ASSEMBLE.stiffness + rand(s + 5) * 30,
              d: ASSEMBLE.damping + Math.abs(rand(s + 2)) * 8,
            },
          };
        });
        out.push({ accent: !!seg.accent, letters });
      });
      t += n * ASSEMBLE.stagger + ASSEMBLE.groupGap;
    });
    return out;
  }, [segments]);

  // Play when 60% visible. Reset only when fully off screen, so it can't flicker at the edge.
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= ASSEMBLE.threshold) setState("show");
        else if (!e.isIntersecting) setState("hidden");
      },
      { threshold: [0, ASSEMBLE.threshold] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Reduced motion: plain static heading, no splitting at all
  if (reduce) {
    return (
      <h2 className={className} {...rest}>
        {segments.map((s, i) => (
          <span key={i}>
            {i > 0 ? " " : ""}
            {s.accent ? <em>{s.text}</em> : s.text}
          </span>
        ))}
      </h2>
    );
  }

  return (
    <motion.h2 ref={ref} className={`ah ${className}`} initial="hidden" animate={state} {...rest}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => {
          const Word = w.accent ? "em" : "span";
          return (
            <span key={wi}>
              {wi > 0 ? " " : ""}
              <Word className="ah__word">
                {w.letters.map((l, li) => (
                  <motion.span key={li} className="ah__char" variants={LETTER} custom={l.custom}>
                    {l.ch}
                  </motion.span>
                ))}
              </Word>
            </span>
          );
        })}
      </span>
    </motion.h2>
  );
}