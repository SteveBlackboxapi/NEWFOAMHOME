import { ActionLink } from "./Marketing";
import { OptimizedImage } from "./OptimizedImage";
import { aboutCeoPhoto } from "../data/aboutEditorialPhotos";
import "./about-editorial.css";

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
