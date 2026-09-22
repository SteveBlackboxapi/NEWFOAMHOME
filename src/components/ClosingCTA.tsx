import { Link } from "react-router";
import { DEMO_URL } from "../lib/siteLinks";
import "./site-shell.css";

type Props = {
  headline?: string;
  sub?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
};

function CTAAction({
  to,
  label,
  secondary = false,
}: {
  to: string;
  label: string;
  secondary?: boolean;
}) {
  const destination = to === "/demo" || to === "/demo/" ? DEMO_URL : to;
  const className = `site-cta-action ${secondary ? "is-secondary" : ""}`;
  const content = (
    <>
      {label}
      <span aria-hidden="true">↗</span>
    </>
  );
  return /^(https?:|mailto:)/.test(destination) ? (
    <a href={destination} className={className}>
      {content}
    </a>
  ) : (
    <Link to={destination} className={className}>
      {content}
    </Link>
  );
}

export function ClosingCTA({
  headline = "Make room for what’s next.",
  sub = "Your people. Their potential. All the tools to bring it together.",
  primaryLabel = "Get a demo",
  primaryTo = "/demo",
  secondaryLabel = "Explore the features",
  secondaryTo = "/features",
}: Props) {
  return (
    <section className="site-cta">
      <div className="site-cta-inner">
        <div className="site-cta-copy">
          <p className="site-cta-eyebrow">Good things start here</p>
          <h2>{headline}</h2>
          <p className="site-cta-description">{sub}</p>
          <div className="site-cta-actions">
            <CTAAction to={primaryTo} label={primaryLabel} />
            <CTAAction to={secondaryTo} label={secondaryLabel} secondary />
          </div>
        </div>
        <svg
          className="site-cta-shape"
          viewBox="0 0 280 280"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 0H140V140H0V0Z" fill="#155fef" />
          <path d="M140 0C217.32 0 280 62.68 280 140H140V0Z" fill="#101828" />
          <path d="M0 140H140V280C62.68 280 0 217.32 0 140Z" fill="#101828" />
          <circle cx="210" cy="210" r="70" fill="#155fef" />
          <path
            d="M73 72L207 206M160 206H207V159"
            stroke="#fff6eb"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
