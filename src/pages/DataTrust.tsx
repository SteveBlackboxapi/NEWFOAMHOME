import { useRef, useState } from "react";
import { Link } from "react-router";
import { MarketingPage } from "../components/Marketing";
import { A, img } from "../lib/assets";
import { PRIVACY_URL, TERMS_URL } from "../lib/siteLinks";
import "./data-trust.css";

type TrustTopic = "source" | "permissions" | "privacy" | "question";
function TrustIcon({
  kind,
  className = "",
}: {
  kind: TrustTopic;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "source" && (
        <>
          <rect x="6" y="6" width="14" height="14" rx="4" />
          <rect x="28" y="28" width="14" height="14" rx="4" />
          <path d="M28 6h8a6 6 0 0 1 6 6v8M20 42h-8a6 6 0 0 1-6-6v-8M18 30l12-12m-7 0h7v7" />
        </>
      )}
      {kind === "permissions" && (
        <>
          <path d="M9 12h30M9 24h30M9 36h30" />
          <circle cx="19" cy="12" r="4" fill="var(--dt-icon-fill, #fff)" />
          <circle cx="30" cy="24" r="4" fill="var(--dt-icon-fill, #fff)" />
          <circle cx="16" cy="36" r="4" fill="var(--dt-icon-fill, #fff)" />
        </>
      )}
      {kind === "privacy" && (
        <>
          <path d="m24 4 16 6v13c0 10-8 16-16 21C16 39 8 33 8 23V10Z" />
          <path d="m17 23 5 5 10-11" />
        </>
      )}
      {kind === "question" && (
        <>
          <path d="M8 8h32v24H22L12 41v-9H8Z" />
          <path d="M20 17a4 4 0 1 1 7 2.6c-2 1.3-3 2-3 4.4m0 4h.01" />
        </>
      )}
    </svg>
  );
}

const answers = [
  {
    id: "connected",
    topic: "Connected data",
    question: "Where does the information in Foam come from?",
    answer:
      "Foam brings content and performance information from connected social platforms into the tools managers use to pitch talent. The creator’s work and its supporting data can be viewed together.",
    terms: "source instagram tiktok youtube platforms numbers",
  },
  {
    id: "account",
    topic: "Account permissions",
    question: "What should I check when connecting an account?",
    answer:
      "Account connections start with the creator. Review the permissions presented when connecting, and speak with the Foam team about the information your agency needs and how it will be used.",
    terms: "access consent connect creator control permissions",
  },
  {
    id: "metrics",
    topic: "Connected data",
    question: "How should I read the audience and performance figures?",
    answer:
      "Look at the platform, the content and the creator together. A metric is one part of the picture. Confirm which information is available for a connected account before building a pitch around it.",
    terms: "numbers views engagement audience metrics statistics",
  },
  {
    id: "policy",
    topic: "Privacy",
    question: "Where can I find Foam’s privacy policy?",
    answer:
      "The privacy policy is the place for the full detail on how information is handled. If you have a question about your own account or agency setup, contact the Foam team.",
    terms: "personal data policy secure security sell share sharing protection",
    link: PRIVACY_URL,
    label: "Read the privacy policy",
  },
  {
    id: "demo",
    topic: "Website examples",
    question: "Are the creators and figures in these demos real?",
    answer:
      "Our interactive website stories use fictional, AI-generated creators and illustrative audience figures. They show how a workflow feels without exposing a real creator’s account data. They are not live results or customer claims.",
    terms:
      "ai generated fictional example illustrative demo photos images live real",
  },
];

export function DataTrust() {
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = answers.filter((item) =>
    words.every((word) =>
      `${item.question} ${item.answer} ${item.topic} ${item.terms}`
        .toLowerCase()
        .includes(word),
    ),
  );
  return (
    <MarketingPage className="dt-page">
      <section className="dt-privacy" aria-labelledby="privacy-title">
        <div className="dt-privacy-panel">
          <img
            src={`${A}/people-colour/trust-v1/privacy-helmet.webp`}
            alt="Original AI-generated portrait of a fictional woman in a cream helmet and blush jacket"
            fetchPriority="high"
            width={1672}
            height={941}
            decoding="async"
          />
          <div className="dt-privacy-copy">
            <p className="dt-eyebrow">A little peace of mind.</p>
            <h2 id="privacy-title">
              Your talent.
              <br />
              Your trust.
            </h2>
            <p>
              Understand how information is handled, so you can focus on the
              people behind it.
            </p>
            <a className="dt-text-link" href={PRIVACY_URL}>
              Explore our privacy policy <span aria-hidden="true">›</span>
            </a>
          </div>
        </div>
        <p className="dt-image-note">Illustrative image · Made with AI</p>
      </section>

      <section className="dt-hero dt-container" aria-labelledby="trust-title">
        <div className="dt-hero-symbol">
          <TrustIcon kind="privacy" />
        </div>
        <h1 id="trust-title">Data &amp; trust.</h1>
        <p className="dt-hero-line">Good work starts with confidence.</p>
        <p className="dt-hero-description">
          A clear view of where information comes from.
          <br className="dt-desktop-break" /> A place to find the answers that
          matter.
        </p>
        <nav className="dt-topics" aria-label="Data and trust topics">
          <a href="#connected-data">
            <TrustIcon kind="source" />
            <span>Connected data</span>
          </a>
          <a href="#account-permissions">
            <TrustIcon kind="permissions" />
            <span>Account permissions</span>
          </a>
          <a href={PRIVACY_URL}>
            <TrustIcon kind="privacy" />
            <span>Privacy policy</span>
          </a>
          <a href="#trust-answers">
            <TrustIcon kind="question" />
            <span>Your questions</span>
          </a>
        </nav>
      </section>

      <div className="dt-soft">
        <section
          className="dt-container dt-principles"
          aria-labelledby="principles-title"
        >
          <div className="dt-section-heading">
            <h2 id="principles-title">Clear from the start.</h2>
            <p>The connection. The context. The people behind the numbers.</p>
          </div>
          <div className="dt-feature-grid">
            <article className="dt-feature" id="connected-data">
              <div className="dt-feature-copy">
                <p className="dt-eyebrow">Connected data</p>
                <h3>
                  Closer to the source.
                  <br />A clearer picture.
                </h3>
                <p>
                  Bring content and performance information from connected
                  platforms into the same conversation as the creator’s work.
                </p>
                <a className="dt-text-link" href="#trust-answers">
                  Understand the connection <span aria-hidden="true">›</span>
                </a>
              </div>
              <div
                className="dt-source-art"
                role="img"
                aria-label="Illustration: connected platforms bring content, profile and performance information into Foam"
              >
                <div className="dt-source-platforms">
                  <span>Instagram</span>
                  <span>TikTok</span>
                  <span>YouTube</span>
                </div>
                <div className="dt-source-wires" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="dt-source-foam">
                  <img src={img.foamSymbol} alt="" />
                  <span>foam</span>
                </div>
                <div className="dt-source-output">
                  <span>Content</span>
                  <span>Profile</span>
                  <span>Performance</span>
                </div>
              </div>
            </article>
            <article className="dt-feature" id="account-permissions">
              <div className="dt-feature-copy">
                <p className="dt-eyebrow">Account permissions</p>
                <h3>
                  Start with
                  <br />
                  the creator.
                </h3>
                <p>
                  Review the permissions when connecting an account. Talk with
                  our team about the information your agency needs and how it
                  will be used.
                </p>
                <a className="dt-text-link" href="mailto:hello@foam.io">
                  Talk to the Foam team <span aria-hidden="true">›</span>
                </a>
              </div>
              <div className="dt-permission-art" aria-hidden="true">
                <div className="dt-permission-sheet">
                  <span className="dt-permission-heading">
                    A clear starting point
                  </span>
                  <div>
                    <span className="dt-step">1</span>
                    <span>Choose an account</span>
                  </div>
                  <div>
                    <span className="dt-step">2</span>
                    <span>Review the permissions</span>
                  </div>
                  <div>
                    <span className="dt-step">3</span>
                    <span>Understand the connection</span>
                  </div>
                  <small>Every connection starts with a person.</small>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <section
        className="dt-answers dt-container"
        id="trust-answers"
        aria-labelledby="answers-title"
      >
        <div className="dt-section-heading">
          <h2 id="answers-title">What would you like to know?</h2>
          <p>A few useful answers. A clear way to ask more.</p>
        </div>
        <div className="dt-search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
          <label className="dt-sr-only" htmlFor="trust-search">
            Search data and trust questions
          </label>
          <input
            id="trust-search"
            ref={searchInput}
            type="search"
            placeholder="Search data, permissions or privacy"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear question search"
              onClick={() => {
                setQuery("");
                searchInput.current?.focus();
              }}
            >
              ×
            </button>
          )}
        </div>
        <p className="dt-sr-only" role="status">
          {query
            ? `${results.length} matching question${results.length === 1 ? "" : "s"}`
            : "All questions shown"}
        </p>
        <div className="dt-questions">
          {results.map((item) => (
            <details key={item.id}>
              <summary>
                {item.question}
                <span aria-hidden="true">+</span>
              </summary>
              <div className="dt-answer">
                <p>{item.answer}</p>
                {item.link && (
                  <a className="dt-text-link" href={item.link}>
                    {item.label} <span aria-hidden="true">›</span>
                  </a>
                )}
              </div>
            </details>
          ))}
          {results.length === 0 && (
            <div className="dt-empty">
              <h3>No matching questions yet.</h3>
              <p>
                Try “privacy”, “permissions” or “demo”, or{" "}
                <a href="mailto:hello@foam.io">ask the Foam team</a>.
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        className="dt-demo-note dt-container"
        aria-labelledby="demo-title"
      >
        <div className="dt-demo-mark" aria-hidden="true">
          <img
            src={`${A}/people-colour/original-portraits-v1/blue-portrait-original-v1.webp`}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span>Demo</span>
        </div>
        <div>
          <p className="dt-eyebrow">About this website</p>
          <h2 id="demo-title">
            Real product ideas.
            <br />
            Illustrative stories.
          </h2>
          <p>
            Our walkthroughs use fictional creators and demo figures. Explore
            the experience, then talk to us about your own connected accounts.
          </p>
          <Link className="dt-text-link" to="/kit-story/">
            Explore a media kit story <span aria-hidden="true">›</span>
          </Link>
        </div>
      </section>

      <section className="dt-resources" aria-label="Policies and contact">
        <div className="dt-container dt-resource-grid">
          <a href={PRIVACY_URL}>
            <TrustIcon kind="privacy" />
            <h2>Privacy policy</h2>
            <p>The full detail on how information is handled.</p>
            <span className="dt-text-link">
              Read the policy <span aria-hidden="true">↗</span>
            </span>
          </a>
          <a href={TERMS_URL}>
            <TrustIcon kind="source" />
            <h2>Terms of use</h2>
            <p>The terms for using Foam, all in one place.</p>
            <span className="dt-text-link">
              Read the terms <span aria-hidden="true">↗</span>
            </span>
          </a>
          <a href="mailto:hello@foam.io">
            <TrustIcon kind="question" />
            <h2>Let’s talk.</h2>
            <p>A question about your account or agency setup?</p>
            <span className="dt-text-link">
              Ask the Foam team <span aria-hidden="true">↗</span>
            </span>
          </a>
        </div>
      </section>
    </MarketingPage>
  );
}
