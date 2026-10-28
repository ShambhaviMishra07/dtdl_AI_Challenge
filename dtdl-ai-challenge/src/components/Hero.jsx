// import { motion, useReducedMotion } from "motion/react";
// import KineticHeading from "./KineticHeading";
// import InteractiveChallengeText from "./InteractiveChallengeText";
// import AIChallengeVisual from "./AIChallengeVisual";
// import GlowButton from "./GlowButton";

// /**
//  * TODO: connect the real application URL / form here.
//  * While null, the CTA just points at the placeholder "#apply" anchor.
//  */
// const APPLY_URL = null;

// export default function Hero() {
//   const reduce = useReducedMotion();

//   const fade = (delay) => ({
//     initial: { opacity: 0, y: reduce ? 0 : 16 },
//     animate: { opacity: 1, y: 0 },
//     transition: { duration: 0.7, delay, ease: "easeOut" },
//   });

//   return (
//     <section className="hero" id="top" aria-labelledby="hero-title">
//       <div className="hero__bg" aria-hidden="true" />

//       <div className="hero__inner">
//         <div className="hero__copy" id="hero-title">
//           <motion.div className="eyebrow" {...fade(0)}>
//             AI CHALLENGE / 2026
//           </motion.div>

//           <KineticHeading />

//           <motion.div {...fade(1.9)}>
//             <InteractiveChallengeText />
//             <p className="hero__sub">Think fast. Build boldly. Show us what you can do.</p>
//           </motion.div>

//           <motion.div className="hero__cta" {...fade(2.15)}>
//             <GlowButton href={APPLY_URL ?? "#apply"}>Accept the Challenge</GlowButton>
//             <span className="hero__hint">5 ROUNDS / 12 MIN</span>
//           </motion.div>
//         </div>

//         <AIChallengeVisual />
//       </div>
//     </section>
//   );
// }


import { motion, useReducedMotion } from "motion/react";
import KineticHeading from "./KineticHeading";
import InteractiveChallengeText from "./InteractiveChallengeText";
import NeuralNetworkBackground from "./NeuralNetworkBackground";
import GlowButton from "./GlowButton";

/**
 * TODO: connect the real application URL / form here.
 * While null, the CTA just points at the placeholder "#apply" anchor.
 */
const APPLY_URL = null;

export default function Hero() {
  const reduce = useReducedMotion();

  const fade = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: "easeOut" },
  });

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true" />
      <NeuralNetworkBackground />

      <div className="hero__inner">
        <div className="hero__copy" id="hero-title">
          <motion.div className="eyebrow" {...fade(0)}>
            AI CHALLENGE / 2026
          </motion.div>

          <KineticHeading />

          <motion.div {...fade(1.9)}>
            <InteractiveChallengeText />
            <p className="hero__sub">Think fast. Build boldly. Show us what you can do.</p>
          </motion.div>

           <motion.div className="hero__cta" {...fade(2.15)}>
            <GlowButton href={APPLY_URL ?? "#apply"}>
                Accept the Challenge
            </GlowButton>
            </motion.div>
        </div>
      </div>
    </section>
  );
}