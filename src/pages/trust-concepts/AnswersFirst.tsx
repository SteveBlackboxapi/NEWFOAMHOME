import { useRef, useState, type KeyboardEvent } from "react";
import {
  MiniIllustration,
  type MiniIllustrationKind,
} from "../../components/mini-ui/MiniIllustration";
import { MiniIcon } from "../../components/mini-ui/MiniPrimitives";
import { PRIVACY_URL } from "../../lib/siteLinks";
import { TrustAction, TrustClosing } from "./shared";
import "./answers-first.css";

const topics: {
  id: string;
  label: string;
  question: string;
  hint: string;
  heading: string;
  answer: string;
  detail: string;
  takeaway: string;
  miniature: MiniIllustrationKind;
  action: string;
  destination: string;
}[] = [
  {
    id: "source",
    label: "The source",
    question: "Where does the data come from?",
    hint: "From the platform to the pitch.",
    heading: "A source behind the story.",
    answer:
      "Foam uses first-party social platform APIs to bring content and performance information into your workflow. Connected creator accounts can add more detail.",
    detail:
      "The information available depends on the platform and the account connection. A creator’s work and its supporting figures belong together.",
    takeaway: "Start with the platform. Keep the creator in the picture.",
    miniature: "connections",
    action: "See it in a media kit",
    destination: "/kit-story/",
  },
  {
    id: "access",
    label: "The connection",
    question: "What am I connecting?",
    hint: "Know what you’re being asked to share.",
    heading: "Understand the connection.",
    answer:
      "An account connection starts with the creator. The connection process presents the permissions being requested, so you can review them before continuing.",
    detail:
      "Permissions can differ by platform and account. If something is unclear, ask the Foam team to explain the access needed for your particular setup.",
    takeaway: "Review the permissions. Ask about anything you’re unsure of.",
    miniature: "permissions",
    action: "Ask about your setup",
    destination: "mailto:hello@foam.io",
  },
  {
    id: "figures",
    label: "The context",
    question: "How do I read the numbers?",
    hint: "A little context makes a big difference.",
    heading: "Read the story, not just the stat.",
    answer:
      "A follower count, a view and an engagement rate each tell you something different. Read the metric alongside the platform, the content and the period it covers.",
    detail:
      "Availability and updates depend on the information supplied by the platform. For a time-sensitive pitch, ask the team how a particular figure is updated.",
    takeaway: "Check the metric, its platform and its reporting period.",
    miniature: "analytics",
    action: "Talk through the figures",
    destination: "mailto:hello@foam.io",
  },
];

export function AnswersFirst() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = (index + 1) % topics.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = (index + topics.length - 1) % topics.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = topics.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="ta-page">
      <section className="tl-shell ta-intro" aria-labelledby="ta-title">
        <div>
          <p className="tl-eyebrow">Data &amp; trust · A useful guide</p>
          <h1 id="ta-title">
            Good questions.
            <br />
            <span>Clear answers.</span>
          </h1>
        </div>
        <div className="ta-intro-aside">
          <p className="tl-lede">
            Where the information comes from. What you’re connecting. How to
            make sense of the numbers. Let’s make it simple.
          </p>
          <div className="tl-actions">
            <TrustAction to="/demo">See Foam in action</TrustAction>
          </div>
        </div>
      </section>

      <section className="tl-shell ta-guide" aria-label="Your data questions">
        <aside className="ta-index">
          <div className="ta-index-heading">
            <span>Start with a question</span>
            <span aria-hidden="true">↘</span>
          </div>
          <div
            className="ta-topic-list"
            role="tablist"
            aria-label="Explore data and trust"
            aria-orientation="vertical"
          >
            {topics.map((topic, index) => (
              <button
                key={topic.id}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                id={`ta-tab-${topic.id}`}
                type="button"
                role="tab"
                aria-selected={selected === index}
                aria-controls={`ta-panel-${topic.id}`}
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => navigate(event, index)}
                className="ta-topic"
              >
                <span className="ta-topic-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="ta-topic-copy">
                  <strong>{topic.question}</strong>
                  <span>{topic.hint}</span>
                </span>
                <span className="ta-topic-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
          <div className="ta-human-note">
            <span className="ta-human-mark" aria-hidden="true">
              <MiniIcon name="note" size={20} />
            </span>
            <p>
              Your setup may be different.
              <br />
              <a href="mailto:hello@foam.io">We’re happy to talk it through.</a>
            </p>
          </div>
        </aside>

        <div className="ta-answers">
          {topics.map((topic, index) => (
            <article
              key={topic.id}
              id={`ta-panel-${topic.id}`}
              role="tabpanel"
              aria-labelledby={`ta-tab-${topic.id}`}
              tabIndex={0}
              hidden={selected !== index}
              className="ta-answer"
            >
              <div className="ta-answer-copy">
                <p className="ta-answer-label">
                  <span aria-hidden="true">0{index + 1}</span> {topic.label}
                </p>
                <h2>{topic.heading}</h2>
                <p className="ta-answer-lede">{topic.answer}</p>
                <p className="ta-answer-detail">{topic.detail}</p>
              </div>
              <div className="ta-answer-art">
                <MiniIllustration kind={topic.miniature} />
              </div>
              <div className="ta-answer-footer">
                <p>
                  <MiniIcon name="check" size={17} />
                  {topic.takeaway}
                </p>
                <TrustAction to={topic.destination} secondary>
                  {topic.action}
                </TrustAction>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tl-shell ta-more" aria-labelledby="ta-more-title">
        <div className="ta-more-heading">
          <p className="tl-eyebrow">Two more things worth knowing</p>
          <h2 id="ta-more-title">The small print, made clear.</h2>
        </div>
        <div className="ta-more-grid">
          <article className="ta-more-card ta-privacy-card">
            <span className="ta-card-icon" aria-hidden="true">
              <MiniIcon name="shield" size={25} />
            </span>
            <h3>Where’s the privacy detail?</h3>
            <p>
              Foam’s privacy policy explains how information is handled. For a
              question about your own account or agency, the team can help you
              find the detail you need.
            </p>
            <TrustAction to={PRIVACY_URL} secondary>
              Read the privacy policy
            </TrustAction>
          </article>
          <article className="ta-more-card ta-demo-card">
            <span className="ta-card-icon" aria-hidden="true">
              <MiniIcon name="eye" size={25} />
            </span>
            <h3>Are these real creator results?</h3>
            <p>
              These website examples use fictional, AI-generated creators and
              illustrative figures. They show the workflow without displaying a
              real creator’s account data. They aren’t live results.
            </p>
            <TrustAction to="/kit-story/" secondary>
              Explore the example
            </TrustAction>
          </article>
        </div>
      </section>

      <TrustClosing title="A question about your setup?">
        Let’s walk through the connections and information your team needs.
      </TrustClosing>
    </div>
  );
}
