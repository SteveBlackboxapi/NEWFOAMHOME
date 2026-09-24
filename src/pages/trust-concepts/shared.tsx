import type { ReactNode } from "react";
import { Link } from "react-router";
import { DEMO_URL, PRIVACY_URL, TERMS_URL } from "../../lib/siteLinks";

export function TrustAction({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  const destination = to === "/demo" ? DEMO_URL : to;
  const content = (
    <>
      {children}
      <span aria-hidden="true">↗</span>
    </>
  );
  const className = `tl-button${secondary ? " tl-button-secondary" : ""}`;
  return /^(https?:|mailto:|#)/.test(destination) ? (
    <a className={className} href={destination}>
      {content}
    </a>
  ) : (
    <Link className={className} to={destination}>
      {content}
    </Link>
  );
}

export function DemoNote() {
  return (
    <p className="tl-demo-note">
      <span aria-hidden="true">✳</span> Website examples use fictional,
      AI-generated creators and illustrative figures. They are not live accounts
      or customer results.
    </p>
  );
}

const questions = [
  {
    q: "Where does the information come from?",
    a: (
      <>
        Foam brings content and metrics from social platforms into creator
        profiles, media kits and other pitching tools. Its platform connections
        use social APIs. Check which account and platform a figure relates to
        before using it in a pitch.
      </>
    ),
  },
  {
    q: "What should a creator check when connecting?",
    a: (
      <>
        Review the account you are connecting and the permissions the platform
        asks you to approve. Available information can depend on the platform
        and connection. Ask the Foam team about the access needed for your
        agency’s setup.
      </>
    ),
  },
  {
    q: "How should I read a figure—and how current is it?",
    a: (
      <>
        Read the metric alongside its platform, reporting period and the
        creator’s work. A follower total and a post’s views describe different
        things. If you need to confirm when a particular figure was refreshed,{" "}
        <a href="mailto:hello@foam.io">ask the Foam team</a> before relying on
        it.
      </>
    ),
  },
  {
    q: "Are the creators and numbers on this website real?",
    a: (
      <>
        The website walkthroughs use fictional, AI-generated creators and
        demonstration figures. They illustrate the workflow without showing a
        real creator’s private account data. They are not live results or
        customer claims.
      </>
    ),
  },
  {
    q: "Where is the full privacy information?",
    a: (
      <>
        The <a href={PRIVACY_URL}>privacy policy</a> explains how information is
        handled. For a question about a connection or your team’s access,{" "}
        <a href="mailto:hello@foam.io">contact Foam</a> with the details of your
        setup.
      </>
    ),
  },
];

export function TrustQuestions({
  title = "A few good questions.",
}: {
  title?: string;
}) {
  return (
    <section
      className="tl-questions tl-shell tl-section"
      aria-labelledby="tl-questions-title"
    >
      <div>
        <p className="tl-eyebrow">THE USEFUL DETAIL</p>
        <h2 id="tl-questions-title">{title}</h2>
        <p className="tl-question-intro">
          Start here. We’re here for the specifics, too.
        </p>
        <a className="tl-text-link" href="mailto:hello@foam.io">
          Ask the Foam team <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="tl-question-list">
        {questions.map(({ q, a }, i) => (
          <details key={q} open={i === 0}>
            <summary>
              {q}
              <span aria-hidden="true">+</span>
            </summary>
            <div>{a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function TrustClosing({
  title = "Your setup. Your questions. Let’s take a look.",
  children = "See how Foam brings your talent’s work and platform information into the same conversation.",
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <section className="tl-closing tl-shell">
      <div className="tl-closing-card">
        <div>
          <p className="tl-eyebrow">LET’S MAKE IT CLEAR</p>
          <h2>{title}</h2>
          <p>{children}</p>
        </div>
        <div className="tl-actions">
          <TrustAction to="/demo">Get a demo</TrustAction>
          <TrustAction to="mailto:hello@foam.io" secondary>
            Ask about your setup
          </TrustAction>
        </div>
      </div>
      <div className="tl-legal">
        <span>The full detail, whenever you need it.</span>
        <div>
          <a href={PRIVACY_URL}>Privacy policy ↗</a>
          <a href={TERMS_URL}>Terms of use ↗</a>
        </div>
      </div>
    </section>
  );
}
