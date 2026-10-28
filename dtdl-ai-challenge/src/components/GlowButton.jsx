export default function GlowButton({ href = "#apply", onClick, children }) {
  return (
    <a className="glow-btn" href={href} onClick={onClick}>
      <span>{children}</span>
      <svg
        className="glow-btn__arrow"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  );
}