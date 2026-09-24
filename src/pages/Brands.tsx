import { PeopleTiles } from "../components/PeopleColour";
import { MarketingImage } from "../components/MarketingImage";
import { AIDisclosure } from "../components/AIDisclosure";
import { ClosingCTA } from "../components/ClosingCTA";
import { MiniIllustration } from "../components/mini-ui/MiniIllustration";
import {
  ActionLink,
  MarketingPage,
  PageIntro,
  Reveal,
  SectionIntro,
} from "../components/Marketing";
import { websiteNia } from "../data/websiteTalent";
import { websiteFitness } from "../data/campaignTalent";
import { websiteMatcha } from "../data/matchaTalent";
import "./audience-pages.css";
import "./audience-miniatures.css";
import "./brands-creative-range.css";

const evidence = [
  {
    talent: websiteFitness,
    tile: websiteFitness.content[1],
    label: "Made to move",
    className: "ap-evidence-tall",
  },
  {
    talent: websiteNia,
    tile: websiteNia.content[0],
    label: "Everyday beauty",
    className: "ap-evidence-short",
  },
  {
    talent: websiteMatcha,
    tile: websiteMatcha.content[0],
    label: "The little rituals",
    className: "ap-evidence-medium",
  },
];

export function Brands() {
  return (
    <MarketingPage className="audience-page ap-brands">
      <PageIntro
        eyebrow="For brands & marketing agencies"
        title={
          <>
            Good chemistry.
            <br />
            Better context.
          </>
        }
        description="From the first run to the everyday ritual. Meet the creator, explore the work and understand the audience behind your next partnership."
        tone="blue"
        visual={<PeopleTiles kind="brands" message="Find your fit." />}
      >
        <ActionLink to="/kit-story">Open the story behind a kit</ActionLink>
        <ActionLink to="/demo" secondary>
          Talk to Foam
        </ActionLink>
      </PageIntro>

      <section className="mp-section">
        <div className="mp-container">
          <div className="ap-section-top ap-evidence-heading">
            <SectionIntro
              eyebrow="Start with the work"
              title={
                <>
                  A good fit is
                  <br />
                  more than a number.
                </>
              }
              description="A training session. A beauty routine. A matcha moment. Different worlds, different ways to connect. Put the work alongside the audience when you're considering a collaboration."
            />
            <span className="ap-side-note">
              Real context.
              <br />
              Room for instinct.
            </span>
          </div>
          <div className="ap-evidence-grid">
            {evidence.map(({ talent, tile, label, className }, index) => (
              <Reveal key={talent.id} className={className} delay={index * 80}>
                <figure>
                  <div className="ap-evidence-photo">
                    <MarketingImage
                      src={tile.thumb}
                      alt={`${talent.displayName}: ${tile.caption}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{label}</span>
                  </div>
                  <figcaption>
                    <strong>{talent.displayName}</strong>
                    {talent.provenance === "reference" ? (
                      <small className="ap-supplied-credit">
                        Fictional profile · Supplied imagery
                      </small>
                    ) : (
                      <AIDisclosure detail="Fictional creator" />
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <div className="ap-evidence-footer">
            <p>Discover the content, then follow it back to the creator.</p>
            <ActionLink to="/features" secondary>
              Explore content discovery
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="mp-section ap-decision-section">
        <div className="mp-container ap-decision-layout">
          <div>
            <SectionIntro
              eyebrow="From interesting to informed"
              title={
                <>
                  Three things
                  <br />
                  worth a closer look.
                </>
              }
            />
            <Reveal className="ap-fitness-moment">
              <MarketingImage src={websiteFitness.content[0].thumb} alt="Avery Cole’s illustrative fitness story: a pause after a waterfront run" loading="lazy" />
              <span>Energy you can see.<br />Context you can explore.</span>
              <small>Fictional profile · Supplied imagery</small>
            </Reveal>
          </div>
          <div className="ap-decision-list">
            {[
              [
                "01",
                "The person",
                "Get a feel for their style, interests and the work they choose to share.",
              ],
              [
                "02",
                "The audience",
                "Read the platform and audience context alongside the content. Give the headline numbers some perspective.",
              ],
              [
                "03",
                "The conversation",
                "Bring specific questions back to the manager, with the same kit in front of you.",
              ],
            ].map(([number, title, text]) => (
              <div key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mp-section mp-cream">
        <div className="mp-container ap-editorial-split ap-brand-link-section">
          <Reveal className="ap-miniature-stage ap-miniature-first">
            <MiniIllustration kind="share" />
          </Reveal>
          <div>
            <SectionIntro
              eyebrow="Been sent a Foam link?"
              title={
                <>
                  There's a story
                  <br />
                  behind that profile.
                </>
              }
              description="A media kit brings the creator's work and audience into one place. Follow our example from the first introduction to the shared link."
            />
            <ActionLink to="/kit-story">Take a look inside</ActionLink>
          </div>
        </div>
      </section>

      <ClosingCTA
        headline="Bring a brief. Get the bigger picture."
        sub="Let's look at where Foam fits into your creator partnerships."
        primaryLabel="Talk to Foam"
        primaryTo="/demo"
        secondaryLabel="See the tools"
        secondaryTo="/features"
      />
    </MarketingPage>
  );
}
