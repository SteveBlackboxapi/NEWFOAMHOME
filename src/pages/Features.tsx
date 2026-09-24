import { ProductFamily } from "../components/PeopleColour";
import { useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  Reveal,
  SectionIntro,
} from "../components/Marketing";
import { MiniIllustration } from "../components/mini-ui/MiniIllustration";
import { ClosingCTA } from "../components/ClosingCTA";
import { TalentSearchPreview } from "../components/TalentSearchDemo";
import "./marketing-features.css";
import "./feature-miniatures.css";

const FEATURES: {
  kind: "kit" | "roster" | "talent" | "search" | "inbox";
  illustration: "kit" | "shortlist" | "talent" | "search" | "inbox";
  name: string;
  heading: string;
  copy: string;
  link: string;
  cta: string;
}[] = [
  {
    kind: "kit",
    illustration: "kit",
    name: "Media kits",
    heading: "The whole story. In one link.",
    copy: "Put a creator’s work, connected platform numbers and audience insights together in a kit that’s ready to share.",
    link: "/kit-story/",
    cta: "See a kit come together",
  },
  {
    kind: "roster",
    illustration: "shortlist",
    name: "Lists & rosters",
    heading: "A shortlist with a point of view.",
    copy: "Bring the right people together for a brief. Give the brand a clear way to explore your recommendations.",
    link: "/managers",
    cta: "Explore the manager’s workflow",
  },
  {
    kind: "talent",
    illustration: "talent",
    name: "Talent search",
    heading: "Find the person behind the possibility.",
    copy: "Start with an interest, a location or a platform audience. Find creators and see their Instagram, TikTok and YouTube accounts together.",
    link: "/brands#talent-discovery",
    cta: "Explore talent discovery",
  },
  {
    kind: "search",
    illustration: "search",
    name: "Content search",
    heading: "Find the moment that makes the case.",
    copy: "A routine. A product review. A perfect example. Search for the content that helps explain why a creator fits.",
    link: "/kit-story/#found-with-foam",
    cta: "Try the content story",
  },
  {
    kind: "inbox",
    illustration: "inbox",
    name: "Chrome extension",
    heading: "Your roster, right where you reply.",
    copy: "Open Foam beside your inbox. Choose a creator, copy their profile and paste it into the conversation.",
    link: "/chrome-story/",
    cta: "Follow an inbox pitch",
  },
];

function FeatureExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = FEATURES[active];
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % FEATURES.length
        : event.key === "ArrowLeft"
          ? (index + FEATURES.length - 1) % FEATURES.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? FEATURES.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }
  return (
    <section className="mf-explorer mp-section" id="explore">
      <div className="mp-container">
        <SectionIntro
          eyebrow="Take a closer look"
          title="One platform. Plenty of possibility."
        />
        <div
          className="mf-tabs"
          role="tablist"
          aria-label="Explore Foam features"
        >
          {FEATURES.map((feature, index) => (
            <button
              key={feature.kind}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              role="tab"
              id={`feature-tab-${feature.kind}`}
              aria-controls={`feature-panel-${feature.kind}`}
              aria-selected={active === index}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKey(event, index)}
            >
              {feature.name}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <div
          key={current.kind}
          className="mf-feature-panel mf-feature-panel-mini"
          role="tabpanel"
          tabIndex={0}
          id={`feature-panel-${current.kind}`}
          aria-labelledby={`feature-tab-${current.kind}`}
        >
          <div className="mf-feature-copy">
            <span className="mp-eyebrow">
              0{active + 1} / {current.name}
            </span>
            <h3>{current.heading}</h3>
            <p>{current.copy}</p>
            {current.kind === "talent" ? (
              <Link to={current.link} className="td-text-link">{current.cta} <span aria-hidden="true">↗</span></Link>
            ) : <ActionLink to={current.link}>{current.cta}</ActionLink>}
          </div>
          {current.illustration === "talent" ? <TalentSearchPreview /> : <MiniIllustration kind={current.illustration} />}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <MarketingPage className="mf-features">
      <PageIntro
        eyebrow="Explore the platform"
        title={
          <>
            A little more
            <br />
            <em>“that’s the one.”</em>
          </>
        }
        description="From the first brief to the next conversation. Give a great creator pitch everything it needs."
        tone="blue"
      >
        <a href="#explore" className="mp-button">
          Find your flow <span aria-hidden="true">↓</span>
        </a>
        <ActionLink to="/demo" secondary>
          Get a demo
        </ActionLink>
      </PageIntro>
      <ProductFamily heading={false} />
      <FeatureExplorer />
      <section className="mp-section mp-dark">
        <div className="mp-container">
          <Reveal>
            <SectionIntro
              eyebrow="Room for the details"
              title={
                <>
                  The thinking behind
                  <br />
                  <em>the introduction.</em>
                </>
              }
              description="Keep the useful context close as you build the pitch."
            />
          </Reveal>
          <div className="mf-detail-grid">
            {[
              [
                "01",
                "Watchlists",
                "Keep an eye on what’s next.",
                "Bring the creators you’re considering into view, alongside the people already on your roster.",
                "orbit",
              ],
              [
                "02",
                "Talent notes",
                "Remember the little things.",
                "Keep the context that helps you choose the right creator for the next conversation.",
                "flower",
              ],
              [
                "03",
                "Tracking",
                "Keep the conversation moving.",
                "Use kit activity to help inform your follow-up after you’ve shared the pitch.",
                "spark",
              ],
            ].map(([n, name, title, copy, glyph]) => (
              <Reveal className="mf-detail" key={n}>
                <div>
                  <span>{n}</span>
                  <FoamGlyph kind={glyph as "orbit" | "flower" | "spark"} />
                </div>
                <p className="mp-eyebrow">{name}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
          <div className="mp-actions">
            <ActionLink to="/demo">See it with your team</ActionLink>
          </div>
        </div>
      </section>
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <div className="mf-paths">
              <SectionIntro
                eyebrow="Choose your perspective"
                title="What does Foam look like for you?"
              />
              <div>
                {[
                  ["Managers", "Your roster, ready to pitch.", "/managers"],
                  ["Brands", "The detail behind the fit.", "/brands"],
                  ["Creators", "Put your work in the picture.", "/creators"],
                ].map(([title, copy, to]) => (
                  <Link key={to} to={to}>
                    <span>
                      <strong>{title}</strong>
                      <small>{copy}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <ClosingCTA
        headline="Bring the brief. We’ll bring Foam."
        sub="See how the pieces work together in your team’s day."
        secondaryLabel="See Foam in action"
        secondaryTo="/kit-story/"
      />
    </MarketingPage>
  );
}
