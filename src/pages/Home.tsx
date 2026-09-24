import { Link } from "react-router";
import { MarketingPage } from "../components/Marketing";
import { ClosingCTA } from "../components/ClosingCTA";
import { TalentSearchSection } from "../components/TalentSearchDemo";
import {
  CreatorWall,
  PhotoFeature,
  ProductFamily,
  WorkspaceGrid,
} from "../components/PeopleColour";

export function Home() {
  return (
    <MarketingPage className="pc-home pc-design">
      <section className="pc-home-hero" aria-labelledby="home-title">
        <div className="pc-wall-heading pc-shell">
          <p className="pc-eyebrow">FOR CREATORS AND THEIR CHAMPIONS</p>
          <h1 id="home-title">
            A world of talent.
            <br />
            Room for every kind.
          </h1>
          <p>
            The people. The possibilities. The work that makes you stop. <br />
            Bring it all together with Foam.
          </p>
          <Link className="pc-pill pc-dark" to="/features">
            Meet your workspace <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <CreatorWall />
      </section>
      <PhotoFeature />
      <section className="pc-quiet-statement pc-shell">
        <p className="pc-eyebrow">A LITTLE CLARITY GOES A LONG WAY</p>
        <h2>
          Less between you
          <br />
          and the next opportunity.
        </h2>
        <p>
          Your talent, their content and the story behind it.
          <br />
          Connected, clear and ready when you are.
        </p>
      </section>
      <WorkspaceGrid />
      <TalentSearchSection />
      <ProductFamily miniatures />
      <section
        className="pc-perspectives pc-shell"
        aria-labelledby="perspective-title"
      >
        <div>
          <p className="pc-eyebrow">A SHARED AMBITION</p>
          <h2 id="perspective-title">
            Your side of
            <br />
            the conversation.
          </h2>
        </div>
        <div className="pc-perspective-links">
          {[
            ["Managers", "More room to champion your talent.", "/managers"],
            ["Brands", "Meet the work. Understand the fit.", "/brands"],
            ["Creators", "Your work, in a better light.", "/creators"],
          ].map(([name, description, to]) => (
            <Link key={to} to={to}>
              <div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <ClosingCTA
        headline="For the talent. And everyone behind them."
        sub="Bring your people, your questions or your next big idea. Let’s see what’s possible."
        primaryLabel="Let’s talk"
        secondaryLabel="About Foam"
        secondaryTo="/about"
      />
    </MarketingPage>
  );
}
