/**
 * TODO: set a real contact destination (e.g. "mailto:..." or a page URL).
 * While null, the Contact link is not rendered, so there is no broken link.
 */
const CONTACT_URL = null;

// Only anchors that exist today: #top (Hero), #process and #apply (ProcessSection).
// Add #challenge, #eligibility and #about here when those sections exist.
const LINKS = [
  { label: "Home", href: "#top" },
  { label: "Process", href: "#process" },
  { label: "Accept the Challenge", href: "#apply" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__panel">
        <div className="footer__top">
          <div className="footer__brand">
            <a className="logo" href="#top" aria-label="DTDL AI Challenge, back to top">
              <span className="logo__mark">
                D<span>T</span>DL
              </span>
              <span className="footer__tag">
                AI<br />CHALLENGE
              </span>
            </a>
            <p className="footer__desc">
              Think fast. Build boldly. Show us what you can do.
            </p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
            {CONTACT_URL && <a href={CONTACT_URL}>Contact</a>}
          </nav>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">© {year} DTDL AI Challenge. All rights reserved.</p>

          <a className="icon-btn footer__top-btn" href="#top" aria-label="Back to top">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}