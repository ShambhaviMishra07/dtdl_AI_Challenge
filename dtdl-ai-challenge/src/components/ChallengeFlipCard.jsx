
import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";

/* ---- Tunables ---- */
const FLIP = {
  duration: 0.85,
  ease: [0.45, 0.05, 0.2, 1],
  tilt: 8,
  roll: 3,
  lift: 70,
  arc: 22,
  scale: 1.03,
  glow: 1,
  glowRest: 0.12,
};

/* Original SVG visuals: one per slide, chosen by slide.visual */
const VISUALS = {
  nodes: () => (
    <svg viewBox="0 0 320 150" aria-hidden="true">
      <g className="fv-stroke">
        <path d="M40 110 L110 40 L190 90 L270 35 M110 40 L150 125 L190 90 M190 90 L270 115" />
      </g>
      {[[40, 110], [110, 40], [150, 125], [190, 90], [270, 35], [270, 115]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 9 : 5} className={i === 3 ? "fv-hot" : "fv-dot"} />
      ))}
    </svg>
  ),

  timeline: () => (
    <svg viewBox="0 0 320 150" aria-hidden="true">
      <line x1="30" y1="75" x2="290" y2="75" className="fv-stroke" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 40 + i * 60;
        return (
          <g key={i}>
            <circle cx={x} cy="75" r={i === 2 ? 9 : 5} className={i === 2 ? "fv-hot" : "fv-dot"} />
            <text x={x} y="106" textAnchor="middle" className="fv-text">R{i + 1}</text>
          </g>
        );
      })}
      <text x="160" y="42" textAnchor="middle" className="fv-text">5 ROUNDS</text>
    </svg>
  ),

  terminal: () => (
    <svg viewBox="0 0 320 150" aria-hidden="true">
      <rect x="30" y="12" width="260" height="126" rx="10" className="fv-box" />
      <line x1="30" y1="36" x2="290" y2="36" className="fv-stroke" />
      {[46, 58, 70].map((x) => (
        <circle key={x} cx={x} cy="24" r="3" className="fv-dot" />
      ))}
      <text x="46" y="65" className="fv-text">&gt; think(problem)</text>
      <text x="46" y="88" className="fv-text">&gt; experiment(ai)</text>
      <text x="46" y="111" className="fv-text fv-hot-text">&gt; build()_</text>
    </svg>
  ),

  workflow: () => (
    <svg viewBox="0 0 320 150" aria-hidden="true">
      {[["IDEA", 20], ["MODEL", 125], ["OUTPUT", 230]].map(([label, x], i) => (
        <g key={label}>
          <rect
            x={x}
            y="55"
            width="70"
            height="40"
            rx="8"
            className={`fv-box ${i === 2 ? "fv-box--hot" : ""}`}
          />
          <text x={x + 35} y="79" textAnchor="middle" className="fv-text">{label}</text>
        </g>
      ))}
      <g className="fv-stroke">
        <path d="M90 75 H125 M195 75 H230" />
      </g>
      <circle cx="107" cy="75" r="3" className="fv-hot" />
      <circle cx="212" cy="75" r="3" className="fv-hot" />
    </svg>
  ),

  geometry: () => (
    <svg viewBox="0 0 320 150" aria-hidden="true">
      <rect x="95" y="35" width="80" height="80" rx="6" transform="rotate(14 135 75)" className="fv-box" />
      <circle cx="190" cy="75" r="38" className="fv-box" />
      <polygon points="215,40 262,112 168,112" className="fv-box fv-box--hot" />
      <circle cx="190" cy="75" r="5" className="fv-hot" />
    </svg>
  ),
};

const FlipIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </svg>
);

export default function ChallengeFlipCard({ slide, index, reduce }) {
  const [flipped, setFlipped] = useState(false);
  const controls = useAnimationControls();
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const Visual = VISUALS[slide.visual];
  const num = String(index + 1).padStart(2, "0");

  // Keep the hidden face out of keyboard navigation.
  useEffect(() => {
    if (frontRef.current) frontRef.current.inert = flipped;
    if (backRef.current) backRef.current.inert = !flipped;
  }, [flipped]);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);

    if (reduce) {
      controls.start({
        rotateY: next ? 180 : 0,
        "--fg": FLIP.glowRest,
        transition: { duration: 0 },
      });
      return;
    }

    const dir = next ? 1 : -1;

    controls.start({
      rotateY: next ? 180 : 0,
      rotateX: [null, -FLIP.tilt, 0],
      rotateZ: [null, -dir * FLIP.roll, 0],
      x: [null, dir * FLIP.arc, 0],
      z: [null, FLIP.lift, 0],
      scale: [null, FLIP.scale, 1],
      "--fg": [null, FLIP.glow, FLIP.glowRest],
      transition: {
        rotateY: {
          duration: FLIP.duration,
          ease: FLIP.ease,
        },
        default: {
          duration: FLIP.duration,
          times: [0, 0.5, 1],
          ease: "easeInOut",
        },
      },
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
  };

  return (
    <div
      className="fc"
      role="group"
      aria-roledescription="flip card"
      aria-label={`${slide.title}. Press Enter or Space to flip the card.`}
      tabIndex={0}
      onClick={flip}
      onKeyDown={onKeyDown}
    >
      <motion.div
        className="fc__inner"
        initial={{ rotateY: 0, "--fg": FLIP.glowRest }}
        animate={controls}
      >
        {/* FRONT */}
        <div
          className="fc__face fc__front"
          ref={frontRef}
          aria-hidden={flipped}
        >
          <div className="fc__meta">
            <span>{num}</span> — {slide.category}
          </div>

          <div className="fc__visual">
            <Visual />
          </div>

          <div className="fc__bottom">
            <p className="fc__title">{slide.frontTitle}</p>
            <p className="fc__text">{slide.frontText}</p>
            <span className="fc__cue" aria-hidden="true">
              <FlipIcon /> Tap card to flip
            </span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="fc__face fc__back"
          ref={backRef}
          aria-hidden={!flipped}
        >
          <div className="fc__meta">
            <span>{num}</span> — {slide.category}
          </div>

          <p className="fc__title fc__title--back">{slide.title}</p>
          <p className="fc__text fc__text--back">{slide.backText}</p>

          <ul className="fc__list">
            {slide.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <span className="fc__cue fc__cue--back" aria-hidden="true">
            <FlipIcon /> Tap card to flip back
          </span>
        </div>
      </motion.div>
    </div>
  );
}
