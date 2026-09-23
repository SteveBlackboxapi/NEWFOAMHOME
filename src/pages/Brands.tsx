import { PeopleTiles } from "../components/PeopleColour";
import { MarketingImage } from "../components/MarketingImage";
import { AIDisclosure } from "../components/AIDisclosure";
import { ClosingCTA } from "../components/ClosingCTA";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  Reveal,
  SectionIntro,
} from "../components/Marketing";
import {
  websiteAria,
  websiteNia,
  websiteProfile,
  websiteSamantha,
} from "../data/websiteTalent";
import "./audience-pages.css";

const samantha = websiteProfile(websiteSamantha);
const evidence = [
  {
    talent: websiteAria,
    tile: websiteAria.content[0],
    label: "Everyday beauty",
    className: "ap-evidence-tall",
  },
  {
    talent: websiteSamantha,
    tile: websiteSamantha.content[0],
    label: "A little personality",
    className: "ap-evidence-short",
  },
  {
    talent: websiteNia,
    tile: websiteNia.content[0],
    label: "A closer look",
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
        description="Meet the creator. Explore the work. Understand the audience. A Foam link gives your next partnership a clearer starting point."
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
              description="The way someone talks, makes, moves and shares matters. Put their content alongside the data when you're considering a collaboration."
            />
            <span className="ap-side-note">
              Real context.
              <br />
              Room for instinct.
            </span>
          </div>
          <Reveal className="ap-evidence-grid">
            {evidence.map(({ talent, tile, label, className }) => (
              <figure key={talent.id} className={className}>
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
                  <AIDisclosure detail="Fictional creator" />
                </figcaption>
              </figure>
            ))}
          </Reveal>
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
            <FoamGlyph kind="orbit" className="ap-decision-glyph" />
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
          <Reveal className="ap-shared-stage">
            <div className="ap-shared-card">
              <div className="ap-window-bar">
                <span>Media kit</span>
                <span className="ap-example">Example preview</span>
              </div>
              <MarketingImage
                className="ap-shared-photo"
                src={samantha.portrait}
                alt={samantha.name}
                loading="lazy"
                decoding="async"
              />
              <div className="ap-shared-body">
                <span className="ap-small-label">{samantha.verticals}</span>
                <h3>{samantha.name}</h3>
                <p>
                  {samantha.totalShort} <span>total demo audience</span>
                </p>
                <AIDisclosure detail="Fictional creator · Demo figures" />
              </div>
            </div>
            <span className="ap-link-ribbon">One link. A fuller picture.</span>
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
