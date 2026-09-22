import { Link } from "react-router";
import { PRIVACY_URL, TERMS_URL } from "../lib/siteLinks";
import "./site-shell.css";

const COLS = [
  {
    head: "Made for you",
    links: [
      { label: "Managers", to: "/managers" },
      { label: "Brands", to: "/brands" },
      { label: "Creators", to: "/creators" },
    ],
  },
  {
    head: "Explore Foam",
    links: [
      { label: "Features", to: "/features" },
      { label: "The kit story", to: "/kit-story/" },
      { label: "Data & trust", to: "/data-trust" },
    ],
  },
  {
    head: "Say hello",
    links: [
      { label: "About us", to: "/about" },
      { label: "Inside Foam", to: "/updates" },
      { label: "Let’s talk", to: "/demo" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-intro">
            <p>
              Big on talent.
              <br />
              Bigger on possibility.
            </p>
            <a href="mailto:hello@foam.io">
              hello@foam.io <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="site-footer-columns">
            {COLS.map((column) => (
              <nav key={column.head} aria-label={column.head}>
                <h2>{column.head}</h2>
                {column.links.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <div className="site-footer-wordmark" aria-label="Foam">
          <span aria-hidden="true">foam</span>
          <svg
            className="site-footer-flower"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <path
              d="M60 60C-20 60 15-20 60 25C105-20 140 60 60 60C140 60 105 140 60 95C15 140-20 60 60 60Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="site-footer-bottom">
          <p>© {new Date().getFullYear()} Foam</p>
          <p>For the people behind the talent.</p>
          <div>
            <a href={PRIVACY_URL}>Privacy</a>
            <a href={TERMS_URL}>Website terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
