import { useLayoutEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

/* ---------- Miniature interface previews (decorative) ---------- */

function AnalyticsPreview() {
  const bars = [38, 56, 44, 72, 60, 84, 66, 92];
  return (
    <div className="pv">
      <div className="pv__bar"><i /><i /><i /><span>insights.dashboard</span></div>
      <div className="pv__body">
        <div className="pv__metrics">
          {[
            ["ACCURACY", "94.2%", "+2.1"],
            ["LATENCY", "118ms", "-14"],
            ["RUNS", "1,284", "+86"],
          ].map(([k, v, d]) => (
            <div className="pv__metric" key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
              <em>{d}</em>
            </div>
          ))}
        </div>
        <div className="pv__charts">
          <div className="pv__panel">
            <div className="pv__panel-head"><span>Model performance</span><b>LIVE</b></div>
            <svg viewBox="0 0 220 90" preserveAspectRatio="none" className="pv__chart">
              {[22, 44, 66].map((y) => (
                <line key={y} x1="0" x2="220" y1={y} y2={y} className="pv__grid" />
              ))}
              <path className="pv__area" d="M0 70 C22 66 34 50 56 52 S92 34 114 38 S154 20 176 24 S206 10 220 8 L220 90 L0 90Z" />
              <path className="pv__line" d="M0 70 C22 66 34 50 56 52 S92 34 114 38 S154 20 176 24 S206 10 220 8" />
              <circle cx="176" cy="24" r="3" className="pv__dot" />
            </svg>
          </div>
          <div className="pv__panel">
            <div className="pv__panel-head"><span>Runs</span></div>
            <div className="pv__bars">
              {bars.map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} className={i === 7 ? "on" : ""} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelinePreview() {
  const Node = ({ x, y, w, label, hot }) => (
    <g>
      <rect x={x} y={y} width={w} height="28" rx="6" className={`pv__node ${hot ? "hot" : ""}`} />
      <text x={x + w / 2} y={y + 17} textAnchor="middle" className="pv__node-text">{label}</text>
    </g>
  );
  const links = [
    "M80 24 H125",
    "M195 24 H250",
    "M160 38 C160 55 95 52 95 70",
    "M285 38 C285 55 235 52 235 70",
    "M95 98 C95 118 165 112 165 130",
    "M235 98 C235 118 165 112 165 130",
  ];
  return (
    <div className="pv">
      <div className="pv__bar"><i /><i /><i /><span>workflow.pipeline</span></div>
      <div className="pv__body">
        <svg viewBox="0 0 330 170" className="pv__flow">
          {links.map((d, i) => (
            <g key={i}>
              <path d={d} className="pv__link" />
              <path d={d} className="pv__link-flow" style={{ animationDelay: `${i * 0.35}s` }} />
            </g>
          ))}
          <Node x={10} y={10} w={70} label="PROMPT" />
          <Node x={125} y={10} w={70} label="RETRIEVE" />
          <Node x={250} y={10} w={70} label="MODEL" hot />
          <Node x={60} y={70} w={70} label="TOOLS" />
          <Node x={200} y={70} w={70} label="EVAL" />
          <Node x={125} y={130} w={80} label="OUTPUT" hot />
        </svg>
        <div className="pv__code">
          <span><b>run</b>(prompt) <em>{"->"}</em> retrieve</span>
          <span>model.<b>score</b>(output) <em>ok</em></span>
        </div>
      </div>
    </div>
  );
}

function PrototypePreview() {
  return (
    <div className="pv">
      <div className="pv__bar"><i /><i /><i /><span>prototype.lab</span></div>
      <div className="pv__split">
        <div className="pv__rail"><i /><i className="on" /><i /><i /></div>
        <div className="pv__main">
          <div className="pv__tabs">
            <span>v1</span><span>v2</span><span className="on">v3</span>
            <em>iterating</em>
          </div>
          <div className="pv__card">
            <div className="pv__skel w70" />
            <div className="pv__skel w45" />
            <div className="pv__chips"><span>summary</span><span className="on">tone</span><span>facts</span></div>
            <div className="pv__row">
              <label>Temperature</label>
              <div className="pv__slider"><b /></div>
            </div>
            <div className="pv__row">
              <label>Auto-refine</label>
              <div className="pv__toggle on"><b /></div>
            </div>
            <div className="pv__progress"><span /></div>
            <div className="pv__fake-btn">Run experiment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Project data: swap Preview for real screenshots later ---------- */

export const PROJECTS = [
  {
    id: "analytics",
    label: "AI ANALYTICS",
    description: "Sample preview of a dashboard with metric cards and a performance chart.",
    Preview: AnalyticsPreview,
  },
  {
    id: "systems",
    label: "INTELLIGENT SYSTEMS",
    description: "Sample preview of a model pipeline with connected processing steps.",
    Preview: PipelinePreview,
  },
  {
    id: "prototyping",
    label: "RAPID PROTOTYPING",
    description: "Sample preview of a prototype interface with versions and tunable controls.",
    Preview: PrototypePreview,
  },
];

/* ---------- Continuous carousel ---------- */

const SPEED = 80; // px per second

function Slide({ project, hidden }) {
  const { Preview } = project;
  return (
    <figure className="pshow__item" aria-hidden={hidden || undefined}>
      <div className="pshow__label"><i aria-hidden="true" />{project.label}</div>
      <div className="pshow__card" aria-hidden="true">
        <Preview />
      </div>
      {!hidden && <figcaption className="sr-only">{project.label}: {project.description}</figcaption>}
    </figure>
  );
}

export default function ProjectShowcase() {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const half = useRef(0);
  const speed = useRef(1);
  const target = useRef(1);
  const inView = useInView(wrapRef);

  // Width of one full set = exactly half the track (two identical sets).
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      half.current = el.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || !half.current) return;
    const dt = Math.min(delta, 50); // avoid jumps after tab switches
    // ease speed toward 0 (hover) or 1 (running) for smooth pause/resume
    speed.current += (target.current - speed.current) * Math.min(1, dt / 180);
    let next = x.get() - SPEED * speed.current * (dt / 1000);
    if (next <= -half.current) next += half.current;
    x.set(next);
  });

  return (
    <div
      ref={wrapRef}
      className={`pshow ${reduce ? "is-static" : ""}`}
      role="region"
      aria-label="Examples of projects you could build"
      tabIndex={reduce ? 0 : undefined}
      onPointerEnter={() => (target.current = 0)}
      onPointerLeave={() => (target.current = 1)}
    >
      <motion.div className="pshow__track" ref={trackRef} style={reduce ? undefined : { x }}>
        <div className="pshow__set">
          {PROJECTS.map((p) => (
            <Slide key={p.id} project={p} />
          ))}
        </div>
        {!reduce && (
          <div className="pshow__set" aria-hidden="true">
            {PROJECTS.map((p) => (
              <Slide key={p.id} project={p} hidden />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}