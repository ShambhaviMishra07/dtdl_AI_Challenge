// import { motion, useReducedMotion } from "motion/react";
// import ProjectShowcase from "./ProjectShowcase";
// import FloatingLines from "./FloatingLines";
// import GlowButton from "./GlowButton";
// import InteractiveHeading from "./InteractiveHeading";
// /**
//  * TODO: Connect the real application URL here (keep in sync with Hero.jsx).
//  * "#apply" currently scrolls to the CTA wrapper below.
//  */
// const APPLY_URL = null;

// const STEPS = [
//   {
//     n: "01",
//     title: "Accept the challenge",
//     text: "Start your application and enter the challenge.",
//   },
//   {
//     n: "02",
//     title: "Build with AI",
//     text: "Experiment, solve problems, and demonstrate your thinking.",
//   },
//   {
//     n: "03",
//     title: "Show what you built",
//     text: "Share your outcome and let the quality of your work speak for itself.",
//   },
// ];

// function Step({ step, index, reduce }) {
//   return (
//     <motion.li
//       className="step"
//       initial={reduce ? false : { opacity: 0, y: 14 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, amount: 0.6 }}
//       transition={{
//         duration: 0.5,
//         delay: index * 0.08,
//         ease: "easeOut",
//       }}
//     >
//       <span className="step__num" aria-hidden="true">
//         {step.n}
//       </span>

//       <div>
//         <h3 className="step__title">{step.title}</h3>
//         <p className="step__text">{step.text}</p>
//       </div>
//     </motion.li>
//   );
// }

// export default function ProcessSection() {
//   const reduce = useReducedMotion();

//   return (
//     <section
//       className="process"
//       id="process"
//       aria-labelledby="process-title"
//     >
//       <FloatingLines />

//       <div className="process__inner">
//         <ProjectShowcase />

//         <div className="process__content">
//           <div className="eyebrow">HOW TO TAKE PART</div>

//           {/* Floating headline */}
//           <motion.h2
//             className="process__title float-text"
//             id="process-title"
//             animate={reduce ? undefined : { y: [0, -7] }}
//             transition={{
//               duration: 7,
//               ease: "easeInOut",
//               repeat: Infinity,
//               repeatType: "mirror",
//             }}
//           >
//             <span className="process__line">
//               No <em>résumé theatre.</em>
//             </span>{" "}
//             <span className="process__line">Just show us</span>{" "}
//             <span className="process__line">
//               what you’ve <em>built.</em>
//             </span>
//           </motion.h2>

//           {/* Floating introductory paragraph */}
//           <motion.p
//             className="process__lead float-text"
//             animate={reduce ? undefined : { y: [0, -5] }}
//             transition={{
//               duration: 8.6,
//               delay: 0.9,
//               ease: "easeInOut",
//               repeat: Infinity,
//               repeatType: "mirror",
//             }}
//           >
//             We care about what you can create, how you think, and how you solve
//             problems. Experiment with AI, explore ideas, and let your work
//             speak for itself.
//           </motion.p>

//           <ol className="steps">
//             {STEPS.map((s, i) => (
//               <Step
//                 key={s.n}
//                 step={s}
//                 index={i}
//                 reduce={reduce}
//               />
//             ))}
//           </ol>

//           <div className="process__cta" id="apply">
//             <GlowButton href={APPLY_URL ?? "#apply"}>
//               Ready to take the challenge?
//             </GlowButton>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



import { motion, useReducedMotion } from "motion/react";
import ProjectShowcase from "./ProjectShowcase";
import FloatingLines from "./FloatingLines";
import GlowButton from "./GlowButton";
import InteractiveHeading from "./InteractiveHeading";

/**
 * TODO: Connect the real application URL here (keep in sync with Hero.jsx).
 * "#apply" currently scrolls to the CTA wrapper below.
 */
const APPLY_URL = null;

const HEADLINE = [
  [{ text: "No " }, { text: "résumé theatre.", accent: true }],
  [{ text: "Just show us" }],
  [{ text: "what you’ve " }, { text: "built.", accent: true }],
];

const STEPS = [
  { n: "01", title: "Accept the challenge", text: "Start your application and enter the challenge." },
  { n: "02", title: "Build with AI", text: "Experiment, solve problems, and demonstrate your thinking." },
  { n: "03", title: "Show what you built", text: "Share your outcome and let the quality of your work speak for itself." },
];

function Step({ step, index, reduce }) {
  return (
    <motion.li
      className="step"
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      <span className="step__num" aria-hidden="true">{step.n}</span>
      <div>
        <h3 className="step__title">{step.title}</h3>
        <p className="step__text">{step.text}</p>
      </div>
    </motion.li>
  );
}

export default function ProcessSection() {
  const reduce = useReducedMotion();

  return (
    <section className="process" id="process" aria-labelledby="process-title">
      <FloatingLines />

      <div className="process__inner">
        <ProjectShowcase />

        <div className="process__content">
          <div className="eyebrow">HOW TO TAKE PART</div>

          <InteractiveHeading
            id="process-title"
            className="process__title float-text"
            lineClassName="process__line"
            lines={HEADLINE}
            label="No résumé theatre. Just show us what you’ve built."
            animate={reduce ? undefined : { y: [0, -7] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          />

          <motion.p
            className="process__lead float-text"
            animate={reduce ? undefined : { y: [0, -5] }}
            transition={{ duration: 8.6, delay: 0.9, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          >
            We care about what you can create, how you think, and how you solve
            problems. Experiment with AI, explore ideas, and let your work speak
            for itself.
          </motion.p>

          <ol className="steps">
            {STEPS.map((s, i) => (
              <Step key={s.n} step={s} index={i} reduce={reduce} />
            ))}
          </ol>

          <div className="process__cta" id="apply">
            <GlowButton href={APPLY_URL ?? "#apply"}>Ready to take the challenge?</GlowButton>
          </div>
        </div>
      </div>
    </section>
  );
}
