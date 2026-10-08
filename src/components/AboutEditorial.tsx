import { ActionLink } from "./Marketing";
import { OptimizedImage } from "./OptimizedImage";
import { aboutCandidPhotos, aboutCeoPhoto } from "../data/aboutEditorialPhotos";
import "./about-editorial.css";

const candidSlots = ["one", "two", "three", "four", "five", "six", "seven", "eight"];

export function AboutCandidIntro() {
  return (
    <section className="ae-editorial ae-candid-intro" aria-labelledby="about-candid-title">
      <figure className="ae-candid-collage">
        <div className="ae-candid-grid">
          {aboutCandidPhotos.map((photo, index) => (
            <div className={`ae-candid-tile ae-candid-tile--${candidSlots[index]}`} key={photo.id}>
              <OptimizedImage
                src={photo.src}
                section={photo.section}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                style={{ objectPosition: photo.objectPosition }}
                sizes={`(max-width: 760px) 25vw, ${[25, 16.67, 33.34, 25, 16.67, 33.34, 25, 25][index]}vw`}
                loading="eager"
                fetchPriority={index === 2 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>
        <figcaption>A few moments from the Foam community.</figcaption>
      </figure>

      <div className="ae-intro-copy">
        <p className="ae-eyebrow">About Foam</p>
        <h1 id="about-candid-title">
          <span>For the people</span>
          <span>behind <em>the talent.</em></span>
        </h1>
        <p className="ae-intro-description">
          Big ideas need someone in their corner. Foam gives talent managers the tools to turn a
          creator’s potential into a conversation that matters.
        </p>
        <ActionLink to="/kit-story" className="ae-action">See the story</ActionLink>
      </div>
    </section>
  );
}

export function AboutCeoNote() {
  return (
    <section className="ae-editorial ae-ceo-note" aria-label="Draft note from Simon">
      <div className="ae-ceo-layout">
        <div className="ae-ceo-copy">
          <p className="ae-draft-label">Draft for Simon’s approval</p>
          <blockquote>
            <p>
              “Behind every creator is someone who sees what’s possible. We’re building Foam to give
              those people more time for the conversations, ideas and relationships that move talent
              forward.”
            </p>
          </blockquote>
          <p className="ae-ceo-attribution">
            <strong>Simon Moss</strong>
            <span>CEO, Foam</span>
          </p>
          <ActionLink to="/features" className="ae-action">See what we’re building</ActionLink>
        </div>
        <div className="ae-ceo-photo">
          <OptimizedImage
            src={aboutCeoPhoto.src}
            section={aboutCeoPhoto.section}
            alt="Simon Moss holding a microphone at a team event; photograph edited with AI to remove another presenter and adjust Simon’s microphone pose."
            width={aboutCeoPhoto.width}
            height={aboutCeoPhoto.height}
            sizes="(max-width: 760px) calc(100vw - 48px), 480px"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
