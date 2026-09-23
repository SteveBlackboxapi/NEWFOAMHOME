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
import { websiteAria, websiteProfile } from "../data/websiteTalent";
import "./audience-pages.css";

const aria = websiteProfile(websiteAria);

function ConnectedProfile() {
  return (
    <div className="ap-connected-card">
      <div className="ap-connected-person">
        <MarketingImage
          src={aria.portrait}
          alt={aria.name}
          loading="lazy"
          decoding="async"
        />
        <div>
          <span className="ap-small-label">Creator profile</span>
          <h3>{aria.name}</h3>
          <p>{aria.loc}</p>
        </div>
      </div>
      <div className="ap-connected-label">
        <span>Platforms</span>
        <span>Illustrative profile</span>
      </div>
      {aria.platforms.map((platform) => (
        <div className="ap-connected-row" key={platform.network}>
          <KitPlatformIcon
            network={platform.network}
            label={platform.label}
            size={23}
          />
          <div>
            <strong>{platform.label}</strong>
            <span>{platform.handle}</span>
          </div>
          <span className="ap-connected-status">Demo</span>
        </div>
      ))}
      <AIDisclosure detail="Fictional creator · Example data" />
    </div>
  );
}

export function Creators() {
  return (
    <MarketingPage className="audience-page ap-creators">
      <PageIntro
        eyebrow="For creators"
        title={
          <>
            Your work.
            <br />
            In a better light.
          </>
        }
        description="You bring the ideas, the voice and the point of view. Foam helps your manager bring the context to the next conversation."
        tone="lime"
        visual={<PeopleTiles kind="creators" message="Made by you." />}
      >
        <ActionLink to="/kit-story">See how you're presented</ActionLink>
        <ActionLink to="/features" secondary>
          Meet Foam
        </ActionLink>
      </PageIntro>

      <section className="mp-section ap-creator-work">
        <div className="mp-container">
          <div className="ap-creator-work-heading">
            <p className="mp-eyebrow">The work comes first</p>
            <h2 className="mp-heading">
              A point of view.
              <br />
              <span className="ap-burgundy">Worth a closer look.</span>
            </h2>
            <p className="mp-body">
              Your routines, your stories, your way of seeing things. Give a
              brand the chance to understand what makes your work yours.
            </p>
          </div>
          <Reveal className="ap-work-spread">
            <figure>
              <MarketingImage
                src={websiteAria.content[1].thumb}
                alt={`${aria.name}: ${websiteAria.content[1].caption}`}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>The everyday moments.</span>
                <AIDisclosure detail="Aria Quen · Fictional creator" />
              </figcaption>
            </figure>
            <div className="ap-work-note">
              <FoamGlyph kind="spark" />
              <p>
                Your content
                <br />
                starts the story.
              </p>
              <span>The numbers add context.</span>
            </div>
            <figure>
              <MarketingImage
                src={websiteAria.content[0].thumb}
                alt={`${aria.name}: ${websiteAria.content[0].caption}`}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>The things you know.</span>
                <AIDisclosure detail="Aria Quen · Fictional creator" />
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="mp-section mp-cream">
        <div className="mp-container ap-editorial-split ap-creator-setup">
          <div>
            <SectionIntro
              eyebrow="Your side of the connection"
              title={
                <>
                  A little setup.
                  <br />A clearer picture.
                </>
              }
            />
            <ol className="ap-setup-list">
              <li>
                <span>01</span>
                <div>
                  <h3>Start with your manager.</h3>
                  <p>
                    They introduce you to Foam and the profiles they need for
                    your roster.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Connect your platforms.</h3>
                  <p>
                    Review the connection details and authorise the accounts you
                    want to use.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Give the pitch more context.</h3>
                  <p>
                    Your platform data sits alongside your work, helping your
                    manager tell a fuller story.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <Reveal className="ap-connected-stage">
            <FoamGlyph kind="quarter" className="ap-connected-shape" />
            <ConnectedProfile />
          </Reveal>
        </div>
      </section>

      <section className="mp-section ap-creator-question">
        <div className="mp-container ap-question-layout">
          <FoamGlyph kind="orbit" />
          <div>
            <p className="mp-eyebrow">Know what you're connecting</p>
            <h2 className="mp-heading">
              Your questions
              <br />
              belong here.
            </h2>
            <p className="mp-body">
              Before connecting, get comfortable with how your information is
              used. Explore our data approach, or ask us to walk you through the
              creator experience.
            </p>
            <div className="mp-actions">
              <ActionLink to="/data-trust">Understand the data</ActionLink>
              <ActionLink to="/demo" secondary>
                Talk it through
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      <ClosingCTA
        headline="Let your work do more of the talking."
        sub="See how content and connected numbers come together in a Foam media kit."
        primaryLabel="Explore a media kit"
        primaryTo="/kit-story"
        secondaryLabel="See features"
        secondaryTo="/features"
      />
    </MarketingPage>
  );
}
