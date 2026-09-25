import { PC, PeopleTiles } from "../components/PeopleColour";
import { Link } from "react-router";
import { ClosingCTA } from "../components/ClosingCTA";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  Reveal,
} from "../components/Marketing";

import "./editorial-pages.css";

const relationships = [
  {
    number: "01",
    role: "For managers",
    title: "More room to champion your talent.",
    description:
      "Bring the profile, the content and the pitch together. Spend less of your day pulling the pieces into place, and more of it shaping what comes next.",
    to: "/managers",
  },
  {
    number: "02",
    role: "For creators",
    title: "The work. The person. The possibility.",
    description:
      "Your content is part of a bigger story. Give your manager the context to represent it, and help potential partners see what makes you you.",
    to: "/creators",
  },
  {
    number: "03",
    role: "For brands",
    title: "A clearer picture of the right fit.",
    description:
      "Go from a name on a shortlist to a creator you can understand. See the work alongside the profile, and give the next conversation a better starting point.",
    to: "/brands",
  },
];

export function About() {
  return (
    <MarketingPage className="ep-page ep-about">
      <PageIntro
        eyebrow="About Foam"
        title={
          <>
            For the people
            <br />
            behind
            <br />
            <em>the talent.</em>
          </>
        }
        description="Big ideas need someone in their corner. Foam gives talent managers the tools to turn a creator’s potential into a conversation that matters."
        visual={<PeopleTiles kind="about" message="All kinds. All here." />}
      >
        <ActionLink to="/kit-story" className="ep-button-ink">
          See the story
        </ActionLink>
      </PageIntro>
      <section className="mp-section mp-dark ep-belief" style={{ backgroundImage: `url("${PC}/studio-moment.webp")` }}>
        <div className="mp-container">
          <Reveal>
            <div className="ep-belief-top">
              <p className="mp-eyebrow">What we believe</p>
              <FoamGlyph kind="spark" />
            </div>
            <h2>
              A creator brings
              <br />
              the possibility.
              <br />
              <span>
                A manager helps
                <br />
                make it happen.
              </span>
            </h2>
            <div className="ep-belief-bottom">
              <span className="ep-small-label">
                Built around that partnership.
              </span>
              <p>
                There’s a person behind every post, and a bigger ambition behind
                every pitch. We build tools that give managers more time for the
                relationships and ideas that move a career forward.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="mp-section ep-relationships">
        <div className="mp-container">
          <Reveal className="ep-split-heading">
            <h2 className="mp-heading">
              Different roles.
              <br />
              Shared possibility.
            </h2>
            <p className="mp-body">
              A good partnership starts with people understanding each other.
              Foam helps put the right context in the right hands.
            </p>
          </Reveal>
          <div className="ep-role-list">
            {relationships.map((item) => (
              <Reveal key={item.number}>
                <article className="ep-role-row">
                  <span className="ep-row-number" aria-hidden="true">
                    {item.number}
                  </span>
                  <div className="ep-role-heading">
                    <p className="mp-eyebrow">{item.role}</p>
                    <h3>{item.title}</h3>
                  </div>
                  <div className="ep-role-description">
                    <p>{item.description}</p>
                    <Link className="mp-link" to={item.to}>
                      Explore {item.role.toLowerCase()}{" "}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section
        id="next-conversation"
        className="mp-section mp-blue ep-about-invitation"
      >
        <div className="mp-container">
          <Reveal className="ep-invitation-layout">
            <figure className="ep-invitation-people">
              <div className="ep-invitation-mosaic">
                <img
                  className="ep-invitation-portrait"
                  src={`${PC}/story-refresh-v1/ada-flash.webp`}
                  alt="AI-generated fictional creative Ada at her studio desk, photographed with direct flash"
                  width="1024"
                  height="1536"
                  loading="lazy"
                  decoding="async"
                />
                <div className="ep-invitation-colour">
                  <span>foam</span>
                  <p>
                    Made
                    <br />
                    possible.
                  </p>
                </div>
                <img
                  className="ep-invitation-moment"
                  src={`${PC}/story-refresh-v1/outdoor-creator.webp`}
                  alt="AI-generated fictional creator Iris wearing sunglasses beneath a bright blue sky"
                  width="1024"
                  height="1536"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>Fictional people made with AI</figcaption>
            </figure>
            <div>
              <p className="mp-eyebrow">From belief to the everyday</p>
              <h2 className="mp-heading">
                Make the next
                <br />
                conversation count.
              </h2>
              <p className="mp-body">
                A media kit that brings the story together. A shortlist built
                around the brief. A useful answer, right inside your inbox.
              </p>
              <div className="mp-actions">
                <ActionLink to="/features" className="ep-button-ink">
                  Explore the tools
                </ActionLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <ClosingCTA
        headline="Let’s meet your next possibility."
        sub="Bring your team, your questions or a brief. We’ll show you how Foam fits into your day."
        primaryLabel="Book a demo"
        secondaryLabel="Explore Inside Foam"
        secondaryTo="/updates"
      />
    </MarketingPage>
  );
}
