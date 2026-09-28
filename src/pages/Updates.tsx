import { MarketingImage } from "../components/MarketingImage";
import { Link } from "react-router";
import { AIDisclosure } from "../components/AIDisclosure";
import { ClosingCTA } from "../components/ClosingCTA";
import { KitPlatformIcon } from "../components/KitDetails";
import { CreatorNetwork } from "../components/CreatorNetwork";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  Reveal,
} from "../components/Marketing";
import {
  websiteAria,
  websiteElise,
  websiteNia,
  websiteSamantha,
} from "../data/websiteTalent";
import "./editorial-pages.css";
import "./inside-foam-preview.css";

function CreatorCircleAccents() {
  return (
    <div className="ifp-creator-accents" aria-hidden="true">
      {[
        { talent: websiteNia, position: "top" },
        { talent: websiteAria, position: "left" },
        { talent: websiteElise, position: "bottom" },
      ].map(({ talent, position }) => (
        <span className={`ifp-creator-circle ifp-creator-circle--${position}`} key={talent.id}>
          <MarketingImage
            section="Featured story · Creator circles" src={talent.portrait}
            alt="" loading="lazy" sizes="(max-width: 740px) 22vw, 150px"
          />
        </span>
      ))}
      {([
        ["instagram", "Instagram"],
        ["tiktok", "TikTok"],
        ["youtube", "YouTube"],
      ] as const).map(([network, label]) => (
        <span className={`ifp-social-circle ifp-social-circle--${network}`} key={network}>
          <KitPlatformIcon network={network} label={label} size={28} />
        </span>
      ))}
      <svg className="ifp-circle-spark ifp-circle-spark--one" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0 15 9 24 12 15 15 12 24 9 15 0 12 9 9Z" />
      </svg>
      <svg className="ifp-circle-spark ifp-circle-spark--two" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0 15 9 24 12 15 15 12 24 9 15 0 12 9 9Z" />
      </svg>
    </div>
  );
}

function KitCover({ preview = false }: { preview?: boolean }) {
  return (
    <figure className="ep-kit-cover" id={preview ? "inside-kit-cover" : undefined}>
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
          section="Featured story · Media kits" src={websiteSamantha.portrait}
          alt="Fictional creator Samantha Pikka in a sample media kit"
          fetchPriority="high"
          decoding="async"
        />
        {preview && <CreatorCircleAccents />}
        <span className="ep-kit-cover-tag">
          Foam Media Kits <span aria-hidden="true">↗</span>
        </span>
        {!preview && <FoamGlyph kind="spark" />}
      </Link>
      <figcaption>
        <AIDisclosure detail={preview ? "Fictional creators" : "Fictional creator"} />
      </figcaption>
    </figure>
  );
}

function InboxIllustration({ preview = false }: { preview?: boolean }) {
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
            section="Two more ways in · Foam for Chrome" src={websiteAria.portrait}
            alt="Fictional creator Aria Quen"
            loading="lazy"
            decoding="async"
          />
          <div>
            <strong>{websiteAria.displayName}</strong>
            <span>Beauty · Lifestyle</span>
          </div>
          <span className="ep-inbox-plus" aria-hidden="true">
            {preview ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            ) : "+"}
          </span>
        </div>
      </div>
      <figcaption>
        <AIDisclosure detail="Fictional creator · Workflow illustration" />
      </figcaption>
    </figure>
  );
}

function ContentIllustration({ preview = false }: { preview?: boolean }) {
  const featuredCard = (
      <div className="ep-content-scene">
        <MarketingImage
          section="Two more ways in · Content discovery" src={websiteNia.content[0].thumb}
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
          <br />A better <span className="ep-content-caption-ending">starting point.</span>
        </span>
      </div>
  );
  return (
    <figure className="ep-content-illustration" id={preview ? "inside-discovery" : undefined}>
      {preview ? (
        <div className="ifp-content-hand">
          <div className="ifp-content-back ifp-content-back--left" aria-hidden="true" />
          <div className="ifp-content-back ifp-content-back--right" aria-hidden="true" />
          {featuredCard}
        </div>
      ) : featuredCard}
      <figcaption>
        <AIDisclosure detail="Fictional creator · Workflow illustration" />
      </figcaption>
    </figure>
  );
}

export function Updates({ portraitDiscovery = true }: { portraitDiscovery?: boolean } = {}) {
  return (
    <MarketingPage className={`ep-page ep-inside${portraitDiscovery ? " ep-inside--portrait" : ""}`}>
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
            <KitCover preview={portraitDiscovery} />
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
              <InboxIllustration preview={portraitDiscovery} />
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
              <ContentIllustration preview={portraitDiscovery} />
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
      <section className="mp-section ep-reading" id={portraitDiscovery ? "inside-network" : undefined}>
        <div className="mp-container">
          <Reveal className="ep-reading-layout">
            {portraitDiscovery ? <CreatorNetwork /> : <FoamGlyph kind="orbit" />}
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
