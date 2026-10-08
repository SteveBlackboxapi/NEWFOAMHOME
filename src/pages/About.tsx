import { OptimizedImage } from "../components/OptimizedImage";
import { ClosingCTA } from "../components/ClosingCTA";
import { aboutTeamPortraits } from "../data/aboutTeam";
import { AboutCandidIntro, AboutCeoNote } from "../components/AboutEditorial";
import { MarketingPage } from "../components/Marketing";
import { AboutListening, AboutSocialFeed } from "../components/AboutCommunity";
import { aboutSocialPosts } from "../data/aboutSocialPosts";

import "./editorial-pages.css";

export function About() {
  return (
    <MarketingPage className="ep-page ep-about">
      <AboutCandidIntro />
      <AboutListening />
      <section id="team" className="ep-team" aria-labelledby="team-heading">
        <div className="mp-container ep-team-heading">
          <h2 id="team-heading" className="mp-heading">The people behind Foam.</h2>
        </div>
        <div className="ep-team-scroll" role="region" aria-label="Team portraits — scroll to see everyone" tabIndex={0}>
          <div className="ep-team-grid" role="img" aria-label="Foam team portraits">
            {aboutTeamPortraits.map((portrait) => (
              <div key={portrait.id} className="ep-team-square" data-team-portrait={portrait.id}>
                <OptimizedImage
                  section="Our team"
                  src={portrait.src}
                  width={portrait.width}
                  height={portrait.height}
                  alt=""
                  sizes="(max-width: 1296px) 48px, 3.704vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <AboutCeoNote />
      <AboutSocialFeed posts={aboutSocialPosts} />
      <ClosingCTA
        headline="Let’s meet your next possibility."
        sub="Bring your team, your questions or a brief. We’ll show you how Foam fits into your day."
        primaryLabel="Book a demo"
        secondaryLabel="Explore Inside Foam"
        secondaryTo="/updates"
      />
    </MarketingPage>
  );
}
