
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";

const INTERACTIVE =
  "a, button, [role='button'], input, select, textarea, label, summary";

export default function CustomCursor() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = rootRef.current;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let shown = false;

    const onMove = (e) => {
      // Both the dot and ring use these exact same coordinates.
      x.set(e.clientX);
      y.set(e.clientY);

      if (!shown) {
        shown = true;
        root.classList.add("is-on");
      }

      root.classList.toggle(
        "is-link",
        !!e.target.closest?.(INTERACTIVE)
      );
    };

    const onDown = () => root.classList.add("is-down");
    const onUp = () => root.classList.remove("is-down");

    const onLeave = () => {
      shown = false;
      root.classList.remove("is-on");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  const cursorX = reduce ? x : x;
  const cursorY = reduce ? y : y;

  return (
    <div className="cur" ref={rootRef} aria-hidden="true">
      {/* Outer ring */}
      <motion.div
        className="cur__pos cur__pos--ring"
        style={{ x: cursorX, y: cursorY }}
      >
        <div className="cur__ring" />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="cur__pos cur__pos--dot"
        style={{ x: cursorX, y: cursorY }}
      >
        <div className="cur__dot" />
      </motion.div>
    </div>
  );
}

