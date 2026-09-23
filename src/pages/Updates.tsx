import { MarketingImage } from "../components/MarketingImage";
import { Link } from "react-router";
import { AIDisclosure } from "../components/AIDisclosure";
import { ClosingCTA } from "../components/ClosingCTA";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  Reveal,
} from "../components/Marketing";
import {
  websiteAria,
  websiteNia,
  websiteSamantha,
} from "../data/websiteTalent";
import "./editorial-pages.css";

function KitCover() {
  return (
    <figure className="ep-kit-cover">
      <Link
        className="ep-kit-cover-art"
        to="/kit-story"
        aria-label="Explore Samantha’s media kit story"
      >
        <div className="ep-kit-cover-type" aria-hidden="true">
          A little
          <br />
          more
          <br />
          <em>possibility.</em>
        </div>
        <MarketingImage
          src={websiteSamantha.portrait}
          alt="Fictional creator Samantha Pikka in a sample media kit"
          fetchPriority="high"
          decoding="async"
        />
        <span className="ep-kit-cover-tag">
          Foam Media Kits <span aria-hidden="true">↗</span>
        </span>
        <FoamGlyph kind="spark" />
      </Link>
      <figcaption>
        <AIDisclosure detail="Fictional creator" />
      </figcaption>
    </figure>
  );
}

function InboxIllustration() {
  return (
    <figure className="ep-inbox-illustration">
      <div className="ep-inbox-scene">
        <div className="ep-inbox-email">
          <span className="ep-inbox-subject">Re: The next campaign</span>
          <p>
            I have someone
            <br />
            you should meet.
          </p>
          <span className="ep-inbox-rule" />
          <span className="ep-inbox-rule ep-inbox-rule-short" />
          <span className="ep-inbox-rule" />
        </div>
        <div className="ep-inbox-talent">
          <MarketingImage
            src={websiteAria.portrait}
            alt="Fictional creator Aria Quen"
            loading="lazy"
            decoding="async"
          />
          <div>
            <strong>{websiteAria.displayName}</strong>
            <span>Beauty · Lifestyle</span>
          </div>
          <span className="ep-inbox-plus" aria-hidden="true">
            +
          </span>
        </div>
      </div>
      <figcaption>
        <AIDisclosure detail="Fictional creator · Workflow illustration" />
      </figcaption>
    </figure>
  );
}

function ContentIllustration() {
  return (
    <figure className="ep-content-illustration">
      <div className="ep-content-scene">
        <MarketingImage
          src={websiteNia.content[0].thumb}
          alt="Fictional creator Nia Brooks demonstrating a skincare product"
          loading="lazy"
          decoding="async"
        />
        <span className="ep-content-query">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>
          Skincare product reviews
        </span>
        <span className="ep-content-caption">
          A brief.
          <br />A better starting point.
        </span>
      </div>
      <figcaption>
        <AIDisclosure detail="Fictional creator · Workflow illustration" />
      </figcaption>
    </figure>
  );
}

export function Updates() {
  return (
    <MarketingPage className="ep-page ep-inside">
      <header className="ep-inside-intro mp-cream">
        <div className="mp-container">
          <div className="ep-inside-masthead">
            <p className="mp-eyebrow">Ideas, tools & a closer look</p>
            <span>From the world of Foam</span>
          </div>
          <div className="ep-inside-title">
            <h1>
              Inside{" "}
              <br />
              <em>Foam.</em>
            </h1>
            <FoamGlyph kind="flower" />
          </div>
          <p className="ep-inside-deck">
            The thinking behind a better pitch.
            <br />
            Explore the tools, the stories and the possibilities.
          </p>
        </div>
      </header>
      <section className="mp-section ep-lead-story">
        <div className="mp-container">
          <Reveal className="ep-lead-layout">
            <KitCover />
            <div className="ep-lead-copy">
              <p className="mp-eyebrow">In focus / Media kits</p>
              <h2>
                Every creator
                <br />
                has a story.
                <br />
                <em>Give it room.</em>
              </h2>
              <p>
                A profile is a starting point. Bring the person, their content
                and the supporting numbers into a media kit that gives the next
                conversation somewhere to go.
              </p>
              <ActionLink to="/kit-story" className="ep-button-ink">
                Explore the media kit story
              </ActionLink>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="ep-explorations mp-cream">
        <div className="mp-container">
          <div className="ep-explorations-heading">
            <h2>Two more ways in.</h2>
            <span aria-hidden="true">↓</span>
          </div>
          <Reveal>
            <article className="ep-feature-story">
              <InboxIllustration />
              <div className="ep-feature-copy">
                <p className="mp-eyebrow">The everyday / Foam for Chrome</p>
                <h3>
                  A better reply
                  <br />
                  starts here.
                </h3>
                <p>
                  The brief is in your inbox. Your next recommendation can be,
                  too. Follow the journey from a brand’s question to a creator
                  profile in your reply.
                </p>
                <Link to="/chrome-story" className="mp-link">
                  Watch the inbox story <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </Reveal>
          <Reveal>
            <article className="ep-feature-story ep-feature-story-reverse">
              <ContentIllustration />
              <div className="ep-feature-copy">
                <p className="mp-eyebrow">Discovery / Content & context</p>
                <h3>
                  Find the work.
                  <br />
                  See the possibility.
                </h3>
                <p>
                  A creator’s content can say more than a category. Explore how
                  profiles, content and curated lists help give a campaign brief
                  a useful starting point.
                </p>
                <Link to="/features" className="mp-link">
                  Explore Foam’s features <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
      <section className="mp-section ep-reading">
        <div className="mp-container">
          <Reveal className="ep-reading-layout">
            <FoamGlyph kind="orbit" />
            <div>
              <p className="mp-eyebrow">Keep exploring</p>
              <h2 className="mp-heading">The bigger picture.</h2>
              <p className="mp-body">
                Meet the purpose behind the product, or explore more
                perspectives on talent management from Foam.
              </p>
              <div className="ep-reading-links">
                <Link to="/about" className="mp-link">
                  Why we build <span aria-hidden="true">↗</span>
                </Link>
                <a
                  href="https://www.foam.io/talent-management"
                  className="mp-link"
                >
                  The Foam Booth <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <ClosingCTA
        headline="Make it part of your day."
        sub="See how these tools fit your team’s real conversations, briefs and talent."
        primaryLabel="Book a demo"
        secondaryLabel="See all features"
      />
    </MarketingPage>
  );
}
