import { useState } from "react";
import { MiniIllustration } from "../../components/mini-ui/MiniIllustration";
import {
  MiniAvatar,
  MiniFoamMark,
} from "../../components/mini-ui/MiniPrimitives";
import { DemoNote, TrustAction, TrustClosing, TrustQuestions } from "./shared";
import "./source-first.css";

const lenses = [
  {
    name: "The source",
    field: "Instagram · Followers",
    title: "Name the platform.",
    copy: "This example shows a follower count for one platform. Keep that source attached to the figure when you explain it.",
  },
  {
    name: "The meaning",
    field: "Audience size · Not post views",
    title: "Know what you’re looking at.",
    copy: "An audience total is different from reach, views or engagement. Read the metric’s name before comparing numbers.",
  },
  {
    name: "The context",
    field: "Read alongside the creator’s work",
    title: "Put the number in the picture.",
    copy: "The content, the audience and the brief all matter. A figure helps the conversation; it doesn’t make the decision on its own.",
  },
];

function SourceObject() {
  const [selected, setSelected] = useState(0);
  const lens = lenses[selected];
  return (
    <figure className="ts-object">
      <div className="ts-object-top">
        <span>
          <MiniFoamMark size={28} /> Inside a media kit
        </span>
        <span className="ts-example-chip">ILLUSTRATIVE EXAMPLE</span>
      </div>
      <div className="ts-person">
        <MiniAvatar person="samantha" size={52} />
        <div>
          <strong>Samantha Pikka</strong>
          <span>Beauty · Lifestyle</span>
        </div>
        <span className="ts-person-note">Fictional creator</span>
      </div>
      <div className="ts-metric">
        <span>Instagram followers</span>
        <strong>
          570.1<span>K</span>
        </strong>
        <p>One figure. More useful with context.</p>
      </div>
      <div className="ts-source-line">
        <span className="ts-dot" aria-hidden="true" />
        <span>{lens.field}</span>
      </div>
      <div
        className="ts-lenses"
        role="tablist"
        aria-label="Explore this example figure"
      >
        {lenses.map((item, i) => (
          <button
            key={item.name}
            role="tab"
            id={`ts-tab-${i}`}
            aria-controls="ts-lens-answer"
            aria-selected={selected === i}
            tabIndex={selected === i ? 0 : -1}
            onClick={() => setSelected(i)}
            onKeyDown={(event) => {
              let next = i;
              if (event.key === "ArrowRight") next = (i + 1) % lenses.length;
              else if (event.key === "ArrowLeft")
                next = (i + lenses.length - 1) % lenses.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = lenses.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              document.getElementById(`ts-tab-${next}`)?.focus();
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div
        className="ts-lens-answer"
        id="ts-lens-answer"
        role="tabpanel"
        aria-labelledby={`ts-tab-${selected}`}
        tabIndex={0}
      >
        <strong>{lens.title}</strong>
        <p>{lens.copy}</p>
      </div>
      <figcaption>
        Demo figure · No live account is connected to this preview.
      </figcaption>
    </figure>
  );
}

export function SourceFirst() {
  return (
    <div className="ts-page">
      <section className="ts-hero tl-shell">
        <div className="ts-hero-copy">
          <p className="tl-eyebrow">DATA &amp; TRUST</p>
          <h1>
            Know where
            <br />
            the number
            <br />
            <em>came from.</em>
          </h1>
          <p className="tl-lede">
            A stronger pitch starts with a clearer picture. Bring the creator’s
            work, platform information and audience context together in Foam.
          </p>
          <div className="tl-actions">
            <TrustAction to="/demo">See Foam in action</TrustAction>
            <TrustAction to="#ts-how" secondary>
              Follow the connection
            </TrustAction>
          </div>
        </div>
        <div className="ts-hero-art">
          <SourceObject />
        </div>
      </section>
      <div className="tl-shell">
        <DemoNote />
      </div>
      <section
        className="tl-shell tl-section ts-journey"
        id="ts-how"
        aria-labelledby="ts-journey-heading"
      >
        <div className="ts-section-intro">
          <p className="tl-eyebrow">FROM THE ACCOUNT TO THE INTRODUCTION</p>
          <h2 id="ts-journey-heading">
            Less mystery.
            <br />
            More understanding.
          </h2>
          <p>Three things worth knowing before you press send.</p>
        </div>
        <div className="ts-steps">
          <article>
            <span className="ts-step-number">01</span>
            <div className="ts-step-art ts-step-account">
              <span>Creator account</span>
              <i aria-hidden="true">↗</i>
              <span>Platform information</span>
            </div>
            <h3>Start with the source.</h3>
            <p>
              Foam uses social platform APIs to bring content and metrics into
              its pitching tools. Keep the platform and account in view.
            </p>
          </article>
          <article>
            <span className="ts-step-number">02</span>
            <div className="ts-step-art ts-step-access">
              <span>Account connection</span>
              <strong>
                Review permissions <span aria-hidden="true">✓</span>
              </strong>
            </div>
            <h3>Understand the connection.</h3>
            <p>
              Check the permissions shown when an account connects. Ask which
              information is available for the way your team works.
            </p>
          </article>
          <article>
            <span className="ts-step-number">03</span>
            <div className="ts-step-art ts-step-kit">
              <span>Content</span>
              <span>Audience</span>
              <strong>
                One media kit <span aria-hidden="true">↗</span>
              </strong>
            </div>
            <h3>Give the figure context.</h3>
            <p>
              Put the work beside the numbers. Read the metric and its reporting
              period, and confirm freshness when it matters to a decision.
            </p>
          </article>
        </div>
      </section>
      <section className="ts-context-band">
        <div className="tl-shell ts-context">
          <MiniIllustration kind="kit" />
          <div>
            <p className="tl-eyebrow">THE WHOLE INTRODUCTION</p>
            <h2>
              Read the figure.
              <br />
              Meet the creator.
            </h2>
            <p className="tl-lede">
              A follower count is a starting point. A media kit makes room for
              the work, the audience and the story behind the fit.
            </p>
            <ul>
              <li>The platform the figure belongs to</li>
              <li>The metric and the period it describes</li>
              <li>The content that makes the case</li>
            </ul>
            <TrustAction to="/kit-story/">Explore a media kit</TrustAction>
          </div>
        </div>
      </section>
      <TrustQuestions />
      <TrustClosing title="Bring the brief. Ask the questions." />
    </div>
  );
}
