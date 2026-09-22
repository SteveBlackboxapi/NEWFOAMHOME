import { MarketingImage } from "../components/MarketingImage";
import { Link } from "react-router";
import {
  ActionLink,
  CreatorMosaic,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  ProofStrip,
  Reveal,
  SectionIntro,
} from "../components/Marketing";
import { ProductPreview } from "../components/MarketingProduct";
import { ClosingCTA } from "../components/ClosingCTA";
import { AIDisclosure } from "../components/AIDisclosure";
import {
  websiteAria,
  websiteNia,
  websiteSamantha,
} from "../data/websiteTalent";
import { A } from "../lib/assets";
import "./marketing-home.css";

export function Home() {
  return (
    <MarketingPage className="mh-home">
      <PageIntro
        eyebrow="The creator pitch platform"
        title={
          <>
            Good talent.
            <br />
            <em>Great proof.</em>
          </>
        }
        description="The people, the content and the numbers. Bring them together, and give the next great collaboration a place to start."
        visual={<CreatorMosaic />}
      >
        <ActionLink to="/kit-story/">See Foam in action</ActionLink>
        <ActionLink to="/demo" secondary>
          Get a demo
        </ActionLink>
      </PageIntro>
      <ProofStrip />
      <section className="mp-section">
        <div className="mp-container">
          <Reveal>
            <div className="mh-statement">
              <p className="mp-eyebrow">
                A little less admin. A lot more possibility.
              </p>
              <h2>
                Your people.
                <br />
                Their potential.
                <br />
                <span>
                  The proof to match.
                  <FoamGlyph kind="flower" />
                </span>
              </h2>
            </div>
          </Reveal>
          <div className="mh-product-pair">
            <Reveal className="mh-product-tile mp-cream">
              <div className="mh-tile-copy">
                <span className="mp-eyebrow">01 / Present</span>
                <h3>
                  Put their best
                  <br />
                  work forward.
                </h3>
                <p>
                  A media kit brings the creator, their audience and their
                  content into one shareable story.
                </p>
                <Link className="mp-link" to="/kit-story/">
                  Follow a pitch <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <ProductPreview kind="kit" />
            </Reveal>
            <Reveal className="mh-product-tile mp-blue" delay={80}>
              <div className="mh-tile-copy">
                <span className="mp-eyebrow">02 / Connect</span>
                <h3>
                  A good introduction.
                  <br />
                  Right in your inbox.
                </h3>
                <p>
                  Keep your creators close while you write. Bring their profile
                  and media kit into the conversation.
                </p>
                <Link className="mp-link" to="/chrome-story/">
                  Meet the extension <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <ProductPreview kind="inbox" />
            </Reveal>
          </div>
        </div>
      </section>
      <section className="mh-people mp-section mp-dark">
        <div className="mp-container">
          <Reveal>
            <SectionIntro
              eyebrow="Same deal. Different perspectives."
              title={
                <>
                  Made for everyone
                  <br />
                  <em>in the room.</em>
                </>
              }
              description="Choose your side of the conversation."
            />
          </Reveal>
          <div className="mh-audience-grid">
            {[
              {
                name: "Managers",
                line: "Make the case for your people.",
                to: "/managers",
                image: websiteSamantha.portrait,
              },
              {
                name: "Brands",
                line: "Find the fit. See the proof.",
                to: "/brands",
                image: websiteNia.portrait,
              },
              {
                name: "Creators",
                line: "Your work deserves to be seen.",
                to: "/creators",
                image: websiteAria.portrait,
              },
            ].map((item, i) => (
              <Reveal delay={i * 60} key={item.to}>
                <Link className="mh-audience-card" to={item.to}>
                  <MarketingImage src={item.image} alt="" loading="lazy" />
                  <div>
                    <span>{item.line}</span>
                    <h3>
                      {item.name}
                      <span aria-hidden="true">↗</span>
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <AIDisclosure detail="Fictional creators" />
        </div>
      </section>
      <section className="mh-found mp-section">
        <div className="mp-container">
          <Reveal>
            <div className="mh-found-heading">
              <SectionIntro
                eyebrow="Start with a spark"
                title={
                  <>
                    Find the moment.
                    <br />
                    Imagine what’s next.
                  </>
                }
              />
              <ActionLink to="/kit-story/#found-with-foam" secondary>
                Explore content search
              </ActionLink>
            </div>
          </Reveal>
          <Reveal>
            <Link
              to="/kit-story/#found-with-foam"
              className="mh-campaign-link"
              aria-label="Explore the Found with Foam content search story"
            >
              <MarketingImage
                src={`${A}/campaigns/found-with-foam-skincare-v2.webp`}
                alt="Found with Foam skincare campaign concept on a city billboard"
                loading="lazy"
                decoding="async"
              />
              <span>
                From a search to a possibility.{" "}
                <span aria-hidden="true">↗</span>
              </span>
            </Link>
            <AIDisclosure detail="Illustrative campaign" />
          </Reveal>
        </div>
      </section>
      <ClosingCTA
        headline="There’s a great pitch in your roster."
        sub="Let’s bring it out. See how Foam puts your creators’ work and data together."
        primaryLabel="Get a demo"
        secondaryLabel="Explore the platform"
        secondaryTo="/features"
      />
    </MarketingPage>
  );
}
