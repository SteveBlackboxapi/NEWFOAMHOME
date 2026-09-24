import { useState } from "react";
import { PeopleTiles } from "../components/PeopleColour";
import { ClosingCTA } from "../components/ClosingCTA";
import { MiniIllustration } from "../components/mini-ui/MiniIllustration";
import { PlatformPresence } from "../components/TalentSearchDemo";
import {
  ActionLink,
  FoamGlyph,
  MarketingPage,
  PageIntro,
  Reveal,
  SectionIntro,
} from "../components/Marketing";
import { LiveActivityControl, LiveCreatorCard } from "../components/LiveCreatorCard";
import { creatorLiveExamples } from "../data/creatorLiveExamples";
import { useMediaQuery } from "../hooks/useMediaQuery";
import "./audience-pages.css";
import "./audience-miniatures.css";

export function Creators() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
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
          <Reveal className="ap-work-spread ap-live-spread">
            <LiveCreatorCard example={creatorLiveExamples[0]} paused={paused} reducedMotion={reducedMotion} variant="story" />
            <div className="ap-work-note">
              <FoamGlyph kind="spark" />
              <p>
                Your content
                <br />
                starts the story.
              </p>
              <span>The numbers add context.</span>
            </div>
            <LiveCreatorCard example={creatorLiveExamples[1]} paused={paused} reducedMotion={reducedMotion} variant="story" />
          </Reveal>
          <div className="ap-live-toolbar">
            <p>Illustrative live moments · Simulated comments and reactions</p>
            <LiveActivityControl paused={paused} reducedMotion={reducedMotion} onToggle={() => setPaused((value) => !value)} />
          </div>
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
                  <PlatformPresence />
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
            <div className="mp-actions">
              <ActionLink to="/kit-story">See how it comes together</ActionLink>
            </div>
          </div>
          <Reveal className="ap-miniature-stage">
            <MiniIllustration kind="connections" />
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
