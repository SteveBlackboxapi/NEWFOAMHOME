import { ContentSearchSection } from "../components/ContentSearchSection";
import { WebsiteImageRoute } from "../components/WebsiteImageScope";
import { ManagersWorkflowSections } from "../components/ManagersWorkflowSections";
import { ActionLink, MarketingPage } from "../components/Marketing";
import { ClosingCTA } from "../components/ClosingCTA";
import { TalentSearchSection } from "../components/TalentSearchDemo";
import { OverviewFilm } from "../components/OverviewFilm";
import { CreatorWall } from "../components/PeopleColour";
import "./managers-landing.css";

/** Shared landing page; both existing addresses retain their links and image placements. */
export function ManagersLanding() {
  return (
    <WebsiteImageRoute route="/">
      <MarketingPage className="pc-home pc-design audience-page ap-managers managers-landing">
        <section className="pc-home-hero" aria-labelledby="home-title">
          <div className="pc-wall-heading pc-shell">
            <p className="pc-eyebrow">THE TRUTH LAYER</p>
            <h1 id="home-title">
              Numbers that everyone{" "}
              <br />
              in the deal can trust
            </h1>
            <p>
              Creators connect their data at source. Managers pitch with it. Brands decide on it.
              No screenshots, no guesswork, no &quot;let me check and get back to you.&quot;
            </p>
            <div className="mp-actions managers-landing-actions">
              <ActionLink to="/demo">Get a demo</ActionLink>
              <ActionLink to="/kit-story" secondary>Follow a pitch</ActionLink>
            </div>
          </div>
          <CreatorWall />
        </section>
        <ManagersWorkflowSections />
        <OverviewFilm />
        <TalentSearchSection />
        <ContentSearchSection />
        <ClosingCTA
          headline="For the talent. And everyone behind them."
          sub="Bring your people, your questions or your next big idea. Let’s see what’s possible."
          primaryLabel="Let’s talk"
          secondaryLabel="About Foam"
          secondaryTo="/about"
        />
      </MarketingPage>
    </WebsiteImageRoute>
  );
}
