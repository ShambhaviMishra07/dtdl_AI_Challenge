import { useEffect, useMemo, useRef } from "react";

const RADIUS = 130; // px of influence
const STIFFNESS = 0.12;
const DAMPING = 0.78;

export default function InteractiveChallengeText({
  text = "FIVE ROUNDS. TWELVE MINUTES. ONE AI CHALLENGE.",
  accentFrom = 5, // index of first accented word ("AI CHALLENGE.")
}) {
  const rootRef = useRef(null);
  const charRefs = useRef([]);
  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Touch devices: a single subtle wave when scrolled into view.
    if (!finePointer) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            root.classList.add("is-waving");
            io.disconnect();
          }
        },
        { threshold: 0.6 }
      );
      io.observe(root);
      return () => io.disconnect();
    }

    const chars = charRefs.current.filter(Boolean);
    const n = chars.length;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const vx = new Float32Array(n);
    const vy = new Float32Array(n);
    let centers = [];
    let pointer = null;
    let raf = 0;

    // Resting centers (relative to root), with current offset removed.
    const measure = () => {
      const r = root.getBoundingClientRect();
      centers = chars.map((el, i) => {
        const b = el.getBoundingClientRect();
        return {
          x: b.left - r.left + b.width / 2 - px[i],
          y: b.top - r.top + b.height / 2 - py[i],
        };
      });
    };

    const tick = () => {
      let moving = false;

      for (let i = 0; i < n; i++) {
        let tx = 0;
        let ty = 0;

        if (pointer) {
          const dx = centers[i].x - pointer.x;
          const dy = centers[i].y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            const f = (1 - d / RADIUS) ** 2;
            const inv = d || 1;
            tx = (dx / inv) * f * 18; // pushed away sideways
            ty = -f * 26 + (dy / inv) * f * 8; // lifted like a wave crest
          }
        }

        vx[i] = (vx[i] + (tx - px[i]) * STIFFNESS) * DAMPING;
        vy[i] = (vy[i] + (ty - py[i]) * STIFFNESS) * DAMPING;
        px[i] += vx[i];
        py[i] += vy[i];

        const settled =
          Math.abs(vx[i]) < 0.01 && Math.abs(vy[i]) < 0.01 &&
          Math.abs(px[i] - tx) < 0.05 && Math.abs(py[i] - ty) < 0.05;

        if (!settled) moving = true;

        chars[i].style.transform =
          !pointer && settled
            ? ""
            : `translate3d(${px[i].toFixed(2)}px, ${py[i].toFixed(2)}px, 0)`;
      }

      raf = pointer || moving ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onEnter = () => measure();
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      start();
    };
    const onLeave = () => {
      pointer = null;
      start();
    };
    const onResize = () => measure();

    measure();
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [text]);

  let charIndex = 0;

  return (
    <p className="ict" ref={rootRef}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <span key={wi}>
            <span className={`ict__word ${wi >= accentFrom ? "ict__word--accent" : ""}`}>
              {[...word].map((ch) => {
                const i = charIndex++;
                return (
                  <span
                    key={i}
                    className="ict__char"
                    style={{ "--i": i }}
                    ref={(el) => (charRefs.current[i] = el)}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </p>
  );
}