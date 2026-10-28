import { useRef } from "react";
import { motion } from "motion/react";
import { usePointerWave } from "../hooks/usePointerWave";

/**
 * lines: [[{ text, accent? }, ...], ...]. Each inner array is one visual line.
 * label: full plain text for screen readers.
 */
export default function InteractiveHeading({ lines, label, className = "", lineClassName = "", ...rest }) {
  const rootRef = useRef(null);
  const charRefs = useRef([]);

  usePointerWave(rootRef, charRefs, [label]);

  let ci = 0;

  return (
    <motion.h2 ref={rootRef} className={`ih ${className}`} {...rest}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => {
          const words = line.flatMap((seg) =>
            seg.text.split(" ").filter(Boolean).map((w) => ({ w, accent: !!seg.accent }))
          );
          return (
            <span key={li} className={lineClassName}>
              {words.map(({ w, accent }, wi) => {
                const Word = accent ? "em" : "span";
                return (
                  <span key={wi}>
                    <Word className="ict__word">
                      {[...w].map((ch) => {
                        const i = ci++;
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
                    </Word>
                    {wi < words.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </motion.h2>
  );
}