import { useEffect } from "react";

const RADIUS = 170;
const STIFFNESS = 0.12;
const DAMPING = 0.78;
const PUSH = 22; // sideways displacement
const LIFT = 30; // upward displacement

export function usePointerWave(rootRef, charRefs, deps = []) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Touch devices: one subtle wave when scrolled into view
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
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
            tx = (dx / inv) * f * PUSH;
            ty = -f * LIFT + (dy / inv) * f * 8;
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
          !pointer && settled ? "" : `translate3d(${px[i].toFixed(2)}px, ${py[i].toFixed(2)}px, 0)`;
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

    measure();
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}