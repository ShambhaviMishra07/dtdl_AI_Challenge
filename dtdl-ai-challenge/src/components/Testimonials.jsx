import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TESTIMONIALS } from "../data/challengeContent";
import AssembleHeading from "./AssembleHeading";

const TITLE = [{ text: "Great ideas start with a willingness to try." }];

/* ---- Tunables ---- */
const OPEN = {
  duration: 0.7,                 // seconds: card growing
  trailDuration: 1.05,           // seconds: the magenta trail (slower than the card, so it lags behind)
  ease: [0.32, 0.72, 0, 1],      // premium "weighted" easing
  trailOpacity: 0.5,             // magenta trail strength while moving (0 to 1)
  restOpacity: 0.16,             // soft glow left behind the open card
  overlay: 0.62,                 // dimming strength (0 to 1)
};

// Magenta shadow states. Compact has none; peak shows mid-expansion; rest is the final look.
const SHADOW = {
  start: "0 0 0 0 rgba(0,0,0,0), 0 0 0 0 rgba(226,0,116,0)",
  peak: "0 50px 130px -20px rgba(0,0,0,0.55), 0 0 110px 4px rgba(226,0,116,0.55)",
  rest: "0 40px 100px -24px rgba(0,0,0,0.5), 0 0 64px -10px rgba(226,0,116,0.38)",
};

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Close = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

function CardBody({ t, expanded }) {
  return (
    <figure className={expanded ? "tm__fig tm__fig--open" : "tm__fig"}>
      {t.sample && <span className="tm__badge">SAMPLE CONTENT</span>}
      <blockquote className="tm__quote">{t.quote}</blockquote>
      <figcaption className="tm__who">
        <strong>{t.name}</strong>
        <span>{t.role}</span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(null); // index of the expanded card, or null
  const plusRefs = useRef([]);
  const closeRef = useRef(null);
  const close = useCallback(() => setOpen(null), []);

  // While open: lock scroll, Escape closes, page behind is unreachable, focus moves in then back out
  useEffect(() => {
    if (open === null) return;
    const idx = open;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sbw > 0) body.style.paddingRight = `${sbw}px`; // no layout jump when the scrollbar disappears

    const root = document.getElementById("root");
    if (root) root.inert = true;

    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      if (root) root.inert = false;
      plusRefs.current[idx]?.focus({ preventScroll: true });
    };
  }, [open, close]);

  const move = reduce
    ? { duration: 0.2 }
    : { type: "tween", duration: OPEN.duration, ease: OPEN.ease };
  const trailMove = reduce
    ? { duration: 0.2 }
    : { type: "tween", duration: OPEN.trailDuration, ease: OPEN.ease };

  const t = open !== null ? TESTIMONIALS[open] : null;

  return (
    <section className="tm" id="about" aria-labelledby="tm-title">
      <div className="tm__inner">
        <header className="tm__head">
          <div className="eyebrow">PARTICIPANT PERSPECTIVES</div>
          <AssembleHeading
            id="tm-title"
            className="tm__title"
            segments={TITLE}
            label="Great ideas start with a willingness to try."
          />
          <p className="tm__lead">A space for stories about experimentation, learning, and building.</p>
        </header>

        <ul className="tm__grid">
          {TESTIMONIALS.map((item, i) => (
            <motion.li
              key={i}
              className="tm__slot"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
            >
              {open === i ? (
                /* Invisible stand-in keeps the grid from collapsing while the card is open */
                <div className="tm__card tm__card--ghost" aria-hidden="true">
                  <CardBody t={item} />
                </div>
              ) : (
                <>
                  <motion.div
                    className="tm__trail"
                    layoutId={`trail-${i}`}
                    style={{ borderRadius: 18, opacity: 0 }}
                    transition={trailMove}
                    aria-hidden="true"
                  />
                  <motion.div
                    className="tm__card"
                    layoutId={`card-${i}`}
                    style={{ borderRadius: 18 }}
                    transition={move}
                  >
                    <CardBody t={item} />
                    <button
                      type="button"
                      className="tm__plus"
                      ref={(el) => (plusRefs.current[i] = el)}
                      onClick={() => setOpen(i)}
                      aria-label={`Expand testimonial ${i + 1}`}
                      aria-haspopup="dialog"
                    >
                      <Plus />
                    </button>
                  </motion.div>
                </>
              )}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Portal to <body>: not clipped by any parent's overflow, and positioned to the viewport */}
      {createPortal(
        <AnimatePresence>
          {t && (
            <motion.div
              key="overlay"
              className="tm__overlay"
              style={{ "--ov": OPEN.overlay }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.45 }}
              onClick={close}
            >
              <div className="tm__stage" onClick={(e) => e.stopPropagation()}>
                {!reduce && (
                  <motion.div
                    className="tm__trail"
                    layoutId={`trail-${open}`}
                    style={{ borderRadius: 24 }}
                    initial={{ opacity: OPEN.trailOpacity }}
                    animate={{ opacity: OPEN.restOpacity }}
                    exit={{ opacity: OPEN.trailOpacity }}
                    transition={{ ...trailMove, opacity: { duration: 1.2, ease: "easeOut" } }}
                    aria-hidden="true"
                  />
                )}
                <motion.div
                  className="tm__panel"
                  layoutId={`card-${open}`}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Testimonial"
                  style={{ borderRadius: 24 }}
                  initial={{ boxShadow: SHADOW.start }}
                  animate={{ boxShadow: reduce ? SHADOW.rest : [SHADOW.start, SHADOW.peak, SHADOW.rest] }}
                  exit={{ boxShadow: SHADOW.start }}
                  transition={{ ...move, boxShadow: { duration: reduce ? 0.2 : OPEN.duration + 0.5, times: reduce ? undefined : [0, 0.45, 1] } }}
                >
                  <motion.div layout="position" transition={move}>
                    <CardBody t={t} expanded />
                  </motion.div>
                  <button type="button" className="tm__close" ref={closeRef} onClick={close} aria-label="Close testimonial">
                    <Close />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}