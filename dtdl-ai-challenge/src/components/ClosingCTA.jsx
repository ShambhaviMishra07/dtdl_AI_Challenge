import GlowButton from "./GlowButton";

/**
 * TODO: connect the real application URL here (keep in sync with Hero.jsx and ProcessSection.jsx).
 * "#apply" scrolls to the existing CTA, so it never dead-ends.
 */
const APPLY_URL = null;

export default function ClosingCTA() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta__inner">
        <div>
          <h2 className="cta__title" id="cta-title">Ready to see what you can build?</h2>
          <p className="cta__text">
            Bring your ideas, explore the possibilities, and take on the DTDL AI Challenge.
          </p>
        </div>
        <GlowButton href={APPLY_URL ?? "#apply"}>Accept the Challenge</GlowButton>
      </div>
    </section>
  );
}