import { PeopleTiles } from "../components/PeopleColour";
import { MarketingImage } from "../components/MarketingImage";
import { AIDisclosure } from "../components/AIDisclosure";
import { ClosingCTA } from "../components/ClosingCTA";
import { KitPlatformIcon } from "../components/KitDetails";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  Reveal,
  SectionIntro,
} from "../components/Marketing";
import {
  formatWebsiteMetric,
  websiteAria,
  websiteNia,
  websiteProfile,
  websiteSamantha,
} from "../data/websiteTalent";
import "./audience-pages.css";

const roster = [websiteSamantha, websiteAria, websiteNia];
const samantha = websiteProfile(websiteSamantha);
const aria = websiteProfile(websiteAria);

function RosterPreview() {
  return (
    <div
      className="ap-roster"
      aria-label="Example roster with fictional creators and demo audience figures"
    >
      <div className="ap-window-bar">
        <span className="ap-window-dot" />
        <span>Your talent, together</span>
        <span className="ap-example">Example roster</span>
      </div>
      <div className="ap-roster-heading">
        <h3>The beauty edit</h3>
        <span>{roster.length} creators</span>
      </div>
      {roster.map((talent) => (
        <div className="ap-roster-row" key={talent.id}>
          <MarketingImage
            src={talent.portrait}
            alt={talent.displayName}
            loading="lazy"
            decoding="async"
          />
          <div className="ap-roster-identity">
            <h4>{talent.displayName}</h4>
            <p>{talent.verticals.slice(0, 2).join(" · ")}</p>
            <AIDisclosure detail="Fictional creator" />
          </div>
          <div className="ap-roster-platforms">
            {websiteProfile(talent)
              .platforms.slice(0, 3)
              .map((platform) => (
                <span key={platform.network}>
                  <KitPlatformIcon
                    network={platform.network}
                    label={platform.label}
                    size={16}
                  />
                  <strong>{platform.count}</strong>
                </span>
              ))}
          </div>
          <div className="ap-roster-total">
            <strong>{formatWebsiteMetric(talent.totalAudience)}</strong>
            <span>Demo audience</span>
          </div>
        </div>
      ))}
      <div className="ap-roster-foot">
        People, platforms and the work that makes them stand out.
      </div>
    </div>
  );
}

export function Managers() {
  return (
    <MarketingPage className="audience-page ap-managers">
      <PageIntro
        eyebrow="For talent managers"
        title={
          <>
            Big talent.
            <br />
            Small admin.
          </>
        }
        description="Give every creator a stronger introduction. Bring the roster, the numbers and the pitch together in Foam."
        tone="cream"
        visual={<PeopleTiles kind="managers" message="Your people." />}
      >
        <ActionLink to="/demo">Let's talk about your roster</ActionLink>
        <ActionLink to="/kit-story" secondary>
          Follow a pitch
        </ActionLink>
      </PageIntro>

      <section className="mp-section ap-roster-section">
        <div className="mp-container">
          <div className="ap-section-top">
            <SectionIntro
              eyebrow="A home for your roster"
              title={
                <>
                  Know who fits.
                  <br />
                  Show why.
                </>
              }
              description="Keep a creator's content and audience in the same conversation. Build your shortlist with a clear view of the people behind the profiles."
            />
            <FoamGlyph kind="flower" className="ap-roster-flower" />
          </div>
          <Reveal>
            <RosterPreview />
          </Reveal>
          <div className="ap-section-end">
            <p>
              Illustrative profiles and figures. A real view of the workflow.
            </p>
            <ActionLink to="/features" secondary>
              Explore the tools
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="mp-section mp-cream">
        <div className="mp-container ap-editorial-split">
          <Reveal className="ap-kit-stage">
            <div className="ap-kit-sheet">
              <div className="ap-kit-sheet-top">
                <span>Media kit</span>
                <span>Example preview</span>
              </div>
              <div className="ap-kit-person">
                <div>
                  <span className="ap-small-label">Beauty · Haircare</span>
                  <h3>{samantha.name}</h3>
                  <p>{samantha.loc}</p>
                </div>
                <MarketingImage
                  src={samantha.portrait}
                  alt={`${samantha.name} portrait`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="ap-kit-strip">
                {samantha.platforms.slice(0, 3).map((platform) => (
                  <div key={platform.network}>
                    <KitPlatformIcon
                      network={platform.network}
                      label={platform.label}
                      size={18}
                    />
                    <strong>{platform.count}</strong>
                    <span>{platform.label}</span>
                  </div>
                ))}
              </div>
              <div className="ap-kit-disclosure">
                <AIDisclosure detail="Fictional creator · Demo figures" />
              </div>
            </div>
            <span className="ap-floating-note">
              One considered introduction.
            </span>
          </Reveal>
          <div>
            <SectionIntro
              eyebrow="The media kit"
              title={
                <>
                  Less assembling.
                  <br />
                  More representing.
                </>
              }
              description="Let the work and the numbers tell the same story. Put content, platform data and audience context into a kit that feels like your agency."
            />
            <ul className="ap-plain-list">
              <li>Your creator's work, front and centre</li>
              <li>Audience context alongside the headline figures</li>
              <li>A shareable link for the next conversation</li>
            </ul>
            <ActionLink to="/kit-story">See a kit come together</ActionLink>
          </div>
        </div>
      </section>

      <section className="mp-section">
        <div className="mp-container ap-editorial-split ap-inbox-section">
          <div>
            <SectionIntro
              eyebrow="Foam for Chrome"
              title={
                <>
                  The pitch lives
                  <br />
                  in your inbox.
                  <br />
                  <span className="ap-burgundy">So does Foam.</span>
                </>
              }
              description="Find a creator and add their card while you're writing the reply. Keep the context close and the conversation moving."
            />
            <ActionLink to="/chrome-story" secondary>
              See the inbox workflow
            </ActionLink>
          </div>
          <Reveal className="ap-mail-stage">
            <FoamGlyph kind="quarter" className="ap-mail-shape" />
            <div className="ap-mail-card">
              <div className="ap-window-bar">
                <span>Re: The everyday beauty brief</span>
                <span className="ap-example">Example draft</span>
              </div>
              <div className="ap-mail-body">
                <p>Here's a creator to consider for the brief.</p>
                <div className="ap-email-creator">
                  <MarketingImage
                    src={aria.portrait}
                    alt={aria.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3>{aria.name}</h3>
                    <p>{aria.verticals}</p>
                    <span>{aria.totalShort} demo audience</span>
                  </div>
                </div>
                <AIDisclosure detail="Fictional creator" />
                <p>
                  Her everyday routines give you a feel for the content. The kit
                  brings the audience into view.
                </p>
                <span className="ap-mail-signoff">
                  The right context, already in the conversation.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ClosingCTA
        headline="Make room for the work that matters."
        sub="Show us how you pitch. We'll show you where Foam fits."
        primaryLabel="Book a demo"
        primaryTo="/demo"
        secondaryLabel="Explore features"
        secondaryTo="/features"
      />
    </MarketingPage>
  );
}
