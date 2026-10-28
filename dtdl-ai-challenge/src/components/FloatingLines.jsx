
import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const WIDTH = 2600;

function wavePath(y, amp, period) {
  const half = period / 2;
  let d = `M0 ${y} Q${period / 4} ${y - amp} ${half} ${y}`;

  for (let x = period; x <= WIDTH; x += half) {
    d += ` T${x} ${y}`;
  }

  return d;
}

const LINES = [
  { y: 120, amp: 34, period: 720, dur: 15, opacity: 0.5 },
  { y: 170, amp: 22, period: 540, dur: 12, opacity: 0.32, reverse: true },
  { y: 235, amp: 44, period: 960, dur: 19, opacity: 0.28, extra: true },
  { y: 290, amp: 16, period: 360, dur: 10, opacity: 0.22, reverse: true, extra: true },
].map((line) => ({
  ...line,
  d: wavePath(line.y, line.amp, line.period),
}));

function Line({ cfg, index, sy }) {
const y = useTransform(sy, (v) => v * (25 + index * 10));
  const trail = cfg.reverse ? -30 : 30;

  return (
    <motion.g
      style={{ y }}
      className={cfg.extra ? "fl__extra" : undefined}
    >
      <g
        className="fl__drift"
        style={{
          "--shift": `${cfg.period}px`,
          animationDuration: `${cfg.dur}s`,
          animationDirection: cfg.reverse ? "reverse" : "normal",
        }}
      >
        {/* Soft magenta shadow, drawn behind the crisp wave */}
       <path
  d={cfg.d}
  className="fl__path fl__shadow"
  filter="url(#fl-glow)"
  transform={`translate(${trail} 0)`}
  style={{
    opacity: Math.min(0.7, cfg.opacity + 0.25),
  }}
/>

        {/* Crisp foreground wave */}
        <path
          d={cfg.d}
          className="fl__path"
          style={{ opacity: cfg.opacity }}
        />
      </g>
    </motion.g>
  );
}

export default function FloatingLines() {
  const reduce = useReducedMotion();
  const my = useMotionValue(0);
  const sy = useSpring(my, {
    stiffness: 65,
    damping: 20,
  });

  useEffect(() => {
    if (
      reduce ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const onMove = (e) => {
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce, my]);

  return (
    <div className="fl" aria-hidden="true">
      <motion.svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <defs>
          <filter
            id="fl-glow"
            filterUnits="userSpaceOnUse"
            x="-100"
            y="-60"
            width="2900"
            height="520"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {LINES.map((cfg, i) => (
          <Line key={i} cfg={cfg} index={i} sy={sy} />
        ))}
      </motion.svg>
    </div>
  );
}
