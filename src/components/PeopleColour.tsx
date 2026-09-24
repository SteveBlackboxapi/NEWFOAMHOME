import { MiniIllustration } from "./mini-ui/MiniIllustration";
import { Reveal } from "./Marketing";
import { websiteFitness } from "../data/campaignTalent";
import { websiteMatcha } from "../data/matchaTalent";
import "./mini-ui/mini-product-cards.css";
import { Link } from "react-router";
import { DiscoveryArtwork, DiscoverySearch } from "./DiscoverySearch";
import { A } from "../lib/assets";
import "./people-colour.css";
import "./home-creative-polish.css";

export const PC = `${A}/people-colour`;

/** Artwork and palette from the approved second direction. No shared story styles. */
export function CreatorWall() {
  return (
    <div className="pc-design pc-wall-block">
      <div className="pc-wall-viewport">
        <div className="pc-creator-wall">
          <div className="pc-wall-column pc-col-one">
            <figure className="pc-creator-tile">
              <img
                src={`${A}/talent/elise-morgan/elise-morgan-hotel-selfie.webp`}
                alt="Fictional creator Elise taking a hotel mirror selfie"
                width="941"
                height="1672"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Your talent.</figcaption>
            </figure>
            <figure className="pc-creator-tile pc-colour-tile pc-pale">
              <div className="pc-tile-message">
                <span className="pc-tile-star" aria-hidden="true">
                  ✳
                </span>
                <p>
                  Different
                  <br /> by nature.
                </p>
              </div>
            </figure>
          </div>
          <div className="pc-wall-column pc-col-two">
            <figure className="pc-creator-tile pc-colour-tile pc-lime">
              <div className="pc-tile-message">
                <span className="pc-tiny-wordmark">foam</span>
                <p>
                  Make
                  <br /> room.
                </p>
                <span>FOR WHAT’S NEXT ↗</span>
              </div>
            </figure>
            <figure className="pc-creator-tile">
              <img
                src={`${A}/talent/nia-brooks/nia-brooks-skincare.webp`}
                alt="Fictional creator Nia sharing her skincare routine"
                width="941"
                height="1672"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
          <div className="pc-wall-column pc-col-three">
            <figure className="pc-creator-tile">
              <img
                src={`${PC}/story-refresh-v1/music-creator.webp`}
                alt="AI-generated fictional musician Nico having coffee at his home-studio desk"
                width="1024"
                height="1536"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure className="pc-creator-tile">
              <img
                src={`${A}/talent/discovery-v1/jax-live-set.webp`}
                alt="Fictional creator Jax playing a live synth set, made with AI"
                width="1122"
                height="1402"
                loading="lazy"
                decoding="async"
              />
              <figcaption>In the making.</figcaption>
            </figure>
          </div>
          <div className="pc-wall-column pc-col-four">
            <figure className="pc-creator-tile">
              <img
                src={`${PC}/story-refresh-v1/outdoor-creator.webp`}
                alt="AI-generated fictional creator Iris wearing sunglasses beneath a bright blue sky"
                width="1024"
                height="1536"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure className="pc-creator-tile pc-colour-tile pc-wine">
              <div className="pc-tile-message">
                <span className="pc-tile-loop" aria-hidden="true">
                  ↗
                </span>
                <p>
                  The next
                  <br /> good thing.
                </p>
              </div>
            </figure>
          </div>
          <div className="pc-wall-column pc-col-five">
            <figure className="pc-creator-tile pc-colour-tile pc-blue">
              <div className="pc-tile-message">
                <DiscoveryArtwork />
                <p>Found it.</p>
              </div>
            </figure>
            <figure className="pc-creator-tile">
              <img
                src={`${A}/talent/samantha-pikka-v3/samantha-pikka-dance-solo.webp`}
                alt="Fictional creator Samantha sharing a dance moment"
                width="941"
                height="1672"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
          <div className="pc-wall-column pc-col-six">
            <figure className="pc-creator-tile">
              <img
                src={`${PC}/story-refresh-v1/ada-flash.webp`}
                alt="AI-generated fictional creative Ada at her studio desk, photographed with direct flash"
                width="1024"
                height="1536"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Their world.</figcaption>
            </figure>
            <figure className="pc-creator-tile pc-colour-tile pc-sage">
              <div className="pc-tile-message">
                <span className="pc-tiny-wordmark">foam</span>
                <p>
                  All kinds
                  <br /> of brilliant.
                </p>
              </div>
            </figure>
          </div>
          <div className="pc-wall-column pc-col-seven">
            <figure className="pc-creator-tile">
              <img
                src={`${PC}/original-portraits-v1/blue-portrait-original-v1.webp`}
                alt="AI-generated fictional creative laughing against a vivid blue backdrop"
                width="1448"
                height="1086"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure className="pc-creator-tile">
              <img
                src={websiteFitness.content[0].thumb}
                alt="Avery Cole’s fictional fitness profile, using supplied waterfront imagery"
                width="1800"
                height="1282"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </div>
      <p className="pc-image-note pc-shell">
        Includes fictional creators made with AI.
      </p>
    </div>
  );
}

export function PhotoFeature() {
  return (
    <section
      className="pc-design pc-photo-section pc-shell"
      aria-label="For creators and their champions"
    >
      <Reveal className="pc-photo-banner pc-photo-reveal">
        <img
          className="pc-banner-image"
          src={`${PC}/studio-moment.webp`}
          width="1672"
          height="940"
          alt="Illustrative creative collaborators reviewing work together, made with AI"
          loading="lazy"
          decoding="async"
        />
        <div className="pc-banner-copy">
          <p className="pc-eyebrow">POWERING CREATORS AND THEIR CHAMPIONS</p>
          <h2>
            Good work.
            <br /> Deserves
            <br /> to be seen.
          </h2>
          <p>
            For the people making it.
            <br /> And the people making it happen.
          </p>
          <Link className="pc-pill pc-white" to="/about">
            This is Foam <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <span className="pc-banner-brand" aria-hidden="true">
          foam
        </span>
        <small className="pc-banner-credit">
          Illustrative scene · Made with AI
        </small>
      </Reveal>
    </section>
  );
}

export function WorkspaceGrid() {
  return (
    <section
      className="pc-design pc-mixed-idea"
      aria-labelledby="workspace-heading"
    >
      <div className="pc-shell">
        <div className="pc-section-intro">
          <h2 id="workspace-heading">
            A little of everything.
            <br />
            All working together.
          </h2>
          <p>
            A connected place to find the right talent and content, bring their
            story to life and get the next conversation started.
          </p>
        </div>
        <div className="pc-mixed-grid">
          <div className="pc-mixed-column">
            <Link className="pc-people-card" to="/managers">
              <div className="pc-card-copy">
                <span className="pc-eyebrow">THE PEOPLE</span>
                <h3>
                  Built around
                  <br /> your kind of team.
                </h3>
              </div>
              <img
                src={`${PC}/collaborators.webp`}
                alt="Collaborators using laptops, in an illustrative photograph"
                width="736"
                height="552"
                loading="lazy"
                decoding="async"
              />
              <div className="pc-people-card-bottom">
                <p>
                  Great talent.
                  <br /> Good company.
                </p>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
            <div className="pc-small-colour-note">
              <span className="pc-small-orbit" aria-hidden="true">
                ✳
              </span>
              <p>
                Big ideas.
                <br /> Small teams. <b>Foam.</b>
              </p>
            </div>
          </div>
          <div className="pc-mixed-column">
            <article className="pc-kit-card">
              <div>
                <span className="pc-eyebrow">THE STORY</span>
                <h3>
                  Their best work.
                  <br /> One beautiful link.
                </h3>
                <Link to="/kit-story/">
                  Explore Media Kit <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <img
                src={`${A}/foam-media-kit.webp`}
                width="300"
                height="300"
                alt="Foam Media Kit icon"
                loading="lazy"
                decoding="async"
              />
            </article>
            <DiscoverySearch />
            <div className="pc-quiet-card">
              <span className="pc-status-dot" aria-hidden="true"></span>
              <p>
                The work. The context.
                <br /> <b>Finally, together.</b>
              </p>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
          <div className="pc-mixed-column">
            <article className="pc-mobile-card">
              <div className="pc-card-copy">
                <span className="pc-eyebrow">THE INTRODUCTION</span>
                <h3>
                  A good impression.
                  <br /> On every screen.
                </h3>
              </div>
              <div className="pc-phone">
                <div className="pc-phone-speaker" aria-hidden="true"></div>
                <div className="pc-phone-top">
                  <span>9:41</span>
                  <span>● ▰</span>
                </div>
                <div className="pc-phone-content">
                  <div className="pc-phone-logo">
                    foam <span>MEDIA KIT</span>
                  </div>
                  <img
                    src={`${A}/talent/elise-morgan/elise-morgan-hotel-selfie.webp`}
                    alt="Elise’s fictional travel and fashion media kit"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="pc-phone-bio">
                    <span>TRAVEL · LIFESTYLE</span>
                    <h4>Elise Morgan</h4>
                    <p>
                      A fresh perspective.
                      <br /> Wherever the day takes her.
                    </p>
                  </div>
                  <div className="pc-phone-foot">
                    <span>Selected work</span>
                    <span>↗</span>
                  </div>
                </div>
              </div>
            </article>
            <article className="pc-chrome-card pc-chrome-preview">
              <Reveal className="pc-chrome-preview-art">
                <MiniIllustration kind="chrome" disclosure={false} />
              </Reveal>
              <div className="pc-chrome-preview-copy">
                <span className="pc-eyebrow">FOAM FOR CHROME</span>
                <h3>
                  Right where
                  <br /> you work.
                </h3>
                <Link to="https://chromewebstore.google.com/detail/foam-the-essential-chrome/iocblckedogkccdepdjfceomgncpeadf">
                  Get Foam for Chrome <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
        <p className="pc-image-note">
          Illustrative product layouts and photography. Fictional creators made
          with AI.
        </p>
      </div>
    </section>
  );
}

export function ProductFamily({
  heading = true,
  miniatures = false,
}: {
  heading?: boolean;
  miniatures?: boolean;
}) {
  return (
    <section
      className={`pc-design pc-product-family pc-shell${miniatures ? " pc-product-miniatures" : ""}`}
      aria-label="Explore Foam products"
    >
      {heading && (
        <div className="pc-calm-title">
          <p className="pc-eyebrow">SMALL TOOLS. BIG POSSIBILITIES.</p>
          <h2>
            More time for
            <br />
            the good part.
          </h2>
          <p>A few helpful things. Made for the way you work.</p>
        </div>
      )}
      <div className="pc-tool-row">
        <Link className="pc-tool-card" to="/kit-story/">
          {miniatures ? (
            <MiniIllustration kind="kit" />
          ) : (
            <div className="pc-tool-image pc-cream">
              <img
                src={`${A}/foam-media-kit.webp`}
                alt="Foam Media Kit icon"
                width="300"
                height="300"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <div className="pc-tool-info">
            <div>
              <span className="pc-eyebrow">MAKE THE INTRODUCTION</span>
              <h3>Media Kit</h3>
              <p>The whole story. One link.</p>
            </div>
            {miniatures ? (
              <span className="pc-miniature-link">
                <span>Explore the media kit</span> <span aria-hidden="true">↗</span>
              </span>
            ) : (
              <span className="pc-round-arrow" aria-hidden="true">
                ↗
              </span>
            )}
          </div>
        </Link>
        <Link className="pc-tool-card" to="/kit-story/#found-with-foam">
          {miniatures ? (
            <MiniIllustration kind="search" />
          ) : (
            <div className="pc-tool-image pc-ice">
              <DiscoveryArtwork />
            </div>
          )}
          <div className="pc-tool-info">
            <div>
              <span className="pc-eyebrow">FIND THE MOMENT</span>
              <h3>Found with Foam</h3>
              <p>The right content. In context.</p>
            </div>
            {miniatures ? (
              <span className="pc-miniature-link">
                <span>Find content</span> <span aria-hidden="true">↗</span>
              </span>
            ) : (
              <span className="pc-round-arrow" aria-hidden="true">
                ↗
              </span>
            )}
          </div>
        </Link>
        <Link className="pc-tool-card" to="/chrome-story/">
          {miniatures ? (
            <MiniIllustration kind="inbox" />
          ) : (
            <div className="pc-tool-image pc-mist pc-chrome-artwork">
              <img
                className="pc-chrome-tool"
                src={`${A}/chrome-store-transparent.webp`}
                alt="Chrome Web Store logo"
                width="300"
                height="300"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <div className="pc-tool-info">
            <div>
              <span className="pc-eyebrow">KEEP THINGS MOVING</span>
              <h3>Foam for Chrome</h3>
              <p>Your talent. Close at hand.</p>
            </div>
            {miniatures ? (
              <span className="pc-miniature-link">
                <span>See Foam for Chrome</span> <span aria-hidden="true">↗</span>
              </span>
            ) : (
              <span className="pc-round-arrow" aria-hidden="true">
                ↗
              </span>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}

const portraits = {
  managers: [
    "elise-morgan/elise-morgan-hotel-selfie.webp",
    "discovery-v1/jax-live-set.webp",
    "nova-reed-v2/nova-reed-walk.webp",
  ],
  brands: [
    "fitness-creator/waterfront.webp",
    "nia-brooks/nia-brooks-skincare.webp",
    "theo-lane/matcha.webp",
  ],
  creators: [
    "nova-reed-v2/nova-reed-walk.webp",
    "elise-morgan/elise-morgan-hotel-selfie.webp",
    "lena-croft-v2/lena-croft-outfit.webp",
  ],
  about: [
    "lena-croft-v2/lena-croft-outfit.webp",
    "samantha-pikka-v3/samantha-pikka-dance-solo.webp",
    "nia-brooks/nia-brooks-skincare.webp",
  ],
};
export function PeopleTiles({
  kind = "managers",
  message = "All kinds of brilliant.",
}: {
  kind?: keyof typeof portraits;
  message?: string;
}) {
  return (
    <div className="pc-design pc-people-tiles">
      <div className="pc-people-tiles-grid">
        <img
          src={kind === "brands" ? websiteFitness.content[0].thumb : `${A}/talent/${portraits[kind][0]}`}
          alt={kind === "brands" ? "Avery Cole, a fictional fitness profile using supplied imagery" : "Fictional creator made with AI"}
          decoding="async"
        />
        <div className="pc-person-colour">
          <span className="pc-tiny-wordmark">foam</span>
          <p>{message}</p>
          <span aria-hidden="true">↗</span>
        </div>
        <img
          src={`${A}/talent/${portraits[kind][1]}`}
          alt={
            kind === "managers"
              ? "Fictional creator Jax playing a live synth set, made with AI"
              : "Fictional creator filming a routine, made with AI"
          }
          decoding="async"
        />
        <img
          src={kind === "brands" ? websiteMatcha.portrait : `${A}/talent/${portraits[kind][2]}`}
          alt={kind === "brands" ? "Theo Lane enjoying an iced matcha, fictional lifestyle creator made with AI" : "Fictional creator sharing their work, made with AI"}
          decoding="async"
        />
      </div>
      <p className="pc-image-note">{kind === "brands" ? "Fictional profiles · Supplied and AI-generated imagery" : "Fictional creators · Made with AI"}</p>
    </div>
  );
}
