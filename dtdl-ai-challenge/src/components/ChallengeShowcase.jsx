import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ChallengeFlipCard from "./ChallengeFlipCard";
import { SLIDES } from "../data/challengeContent";
import AssembleHeading from "./AssembleHeading";

const TITLE = [
  { text: "Ideas become" },
  { text: "real", accent: true },
  { text: "when you build." },
];


const Arrow = ({ dir }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "prev" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
  </svg>
);

export default function ChallengeShowcase() {
  const reduce = useReducedMotion();
  const [[index, dir], setState] = useState([0, 0]);
  const n = SLIDES.length;
  const slide = SLIDES[index];

  const go = (next, d) => setState([(next + n) % n, d]);
  const prev = () => go(index - 1, -1);
  const next = () => go(index + 1, 1);

  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  };

  const cardV = {
    enter: (d) => ({ x: reduce ? 0 : d * 90, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: reduce ? 0 : -d * 90, opacity: 0 }),
  };
  const textV = {
    enter: (d) => ({ x: reduce ? 0 : d * 24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: reduce ? 0 : -d * 24, opacity: 0 }),
  };
  const t = reduce ? { duration: 0.15 } : { duration: 0.45, ease: [0.22, 0.8, 0.2, 1] };

  return (
    <section className="sc" id="challenge" aria-labelledby="sc-title">
      <div className="sc__inner">
        <header className="sc__head">
          <div className="eyebrow">INSIDE THE CHALLENGE</div>
         
            <AssembleHeading
            id="sc-title"
            className="sc__title"
            segments={TITLE}
            label="Ideas become real when you build."
            />

          <p className="sc__lead">Flip each card to see what the challenge is about.</p>
        </header>

        <div className="sc__layout" onKeyDown={onKeyDown}>
          <button type="button" className="sc__arrow sc__arrow--prev" onClick={prev} aria-label="Previous topic">
            <Arrow dir="prev" />
          </button>

          <div className="sc__stage">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={slide.id}
                className="sc__slide"
                custom={dir}
                variants={cardV}
                initial="enter"
                animate="center"
                exit="exit"
                transition={t}
              >
                <ChallengeFlipCard slide={slide} index={index} reduce={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="sc__panel">
            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={slide.id}
                custom={dir}
                variants={textV}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0.1 : 0.28, ease: "easeOut" }}
              >
                <h3 className="sc__panel-title">
                  <span aria-hidden="true">// </span>{slide.title}
                </h3>
                <p className="sc__panel-text">{slide.panelText}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button type="button" className="sc__arrow sc__arrow--next" onClick={next} aria-label="Next topic">
            <Arrow dir="next" />
          </button>
        </div>

        <div className="sc__controls">
          <span className="sc__count" aria-hidden="true">
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <ol className="sc__markers">
            {SLIDES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`sc__marker ${i === index ? "is-active" : ""}`}
                  aria-label={`Go to topic ${i + 1}: ${s.title}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => go(i, Math.sign(i - index) || 1)}
                >
                  <span />
                </button>
              </li>
            ))}
          </ol>
        </div>

        <p className="sr-only" aria-live="polite">
          Topic {index + 1} of {n}: {slide.title}
        </p>
      </div>
    </section>
  );
}