import { PeopleTiles } from "../components/PeopleColour";
import { MarketingImage } from "../components/MarketingImage";
import { AIDisclosure } from "../components/AIDisclosure";
import { ClosingCTA } from "../components/ClosingCTA";
import { KitPlatformIcon } from "../components/KitDetails";
import { MiniIllustration } from "../components/mini-ui/MiniIllustration";
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
import "./audience-miniatures.css";

const roster = [websiteSamantha, websiteAria, websiteNia];

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
          <MarketingImage section="A home for your roster · The beauty edit"
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
          <Reveal className="ap-miniature-stage ap-miniature-first">
            <MiniIllustration section="The media kit · Miniature preview" kind="kit" />
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
          <Reveal className="ap-miniature-stage">
            <MiniIllustration section="Foam for Chrome · Inbox miniature" kind="inbox" />
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
