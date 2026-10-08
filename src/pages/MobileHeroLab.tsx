import { useEffect, useRef, useState } from "react";
import { A } from "../lib/assets";
import { DEMO_URL } from "../lib/siteLinks";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { useWebsiteImage, WebsiteImageRoute } from "../components/WebsiteImageScope";
import "./mobile-hero-lab.css";

const OPTIONS = [
  {
    id: "charcoal",
    name: "Charcoal",
    description: "A familiar dark canvas. A little sky blue and lime in the words.",
  },
  {
    id: "cream",
    name: "Soft white",
    description: "More daylight, with burgundy type and a soft lime underline.",
  },
  {
    id: "blue",
    name: "Pale blue",
    description: "A brighter Foam colour block, with a small lime highlight.",
  },
] as const;

type Option = (typeof OPTIONS)[number];
type View = "all" | Option["id"];

function HeroOption({ option, index, playing }: { option: Option; index: number; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const poster = useWebsiteImage(`${A}/io-portrait-poster.webp`, "Media Kit · Samantha portrait film");

  useEffect(() => {
    if (!video.current) return;
    if (playing) void video.current.play().catch(() => { /* The poster remains if autoplay is unavailable. */ });
    else video.current.pause();
  }, [playing]);

  return (
    <article className="mhl-option" aria-labelledby={`mhl-option-${option.id}`}>
      <header className="mhl-option-heading">
        <span>0{index + 1}</span>
        <h2 id={`mhl-option-${option.id}`}>{option.name}</h2>
        <p>{option.description}</p>
      </header>
      <div className={`mhl-phone mhl-phone--${option.id}`}>
        <div className="mhl-nav">
          <img src={`${A}/brand/foam-story-lockup-white.svg`} width="100" height="40" alt="Foam" />
          <span>Mobile preview</span>
        </div>
        <div className="mhl-film">
          <video
            ref={video}
            src={`${A}/io-portrait-web.mp4`}
            poster={poster}
            muted
            loop
            playsInline
            autoPlay={playing}
            preload="metadata"
            aria-label="Samantha Pikka smiling, the same film as the homepage"
          />
        </div>
        <div className="mhl-copy">
          <p className="mhl-eyebrow">The operating system for the creator economy</p>
          <h3 className="mhl-title">
            <span className="mhl-title-line">Big <em className="mhl-talent">talent</em>.</span>
            <span className="mhl-title-line">Small <em className="mhl-admin">admin</em>.</span>
          </h3>
          <p className="mhl-description">
            <span>Give every creator a stronger introduction.</span>
            <span>Bring the roster, the numbers and the pitch together in Foam.</span>
          </p>
          <a className="mhl-cta" href={DEMO_URL}>
            Let’s talk about your roster
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 13 13 3M3 3h10v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
        <div className="mhl-next-section">
          <p>The kit</p>
          <h4>Connected numbers.<br />Your colours.</h4>
        </div>
      </div>
    </article>
  );
}

function MobileHeroExamples() {
  const [view, setView] = useState<View>("all");
  const reducedMotion = usePrefersReducedMotion();
  const [playbackChoice, setPlaybackChoice] = useState<boolean | null>(null);
  const playing = playbackChoice ?? !reducedMotion;

  return (
    <main className="mhl-page">
      <header className="mhl-intro">
        <p className="mhl-kicker">Foam · Mobile design lab</p>
        <h1>Let her smile.<br />Give the words their own space.</h1>
        <p>The same film, at full brightness. Three colour directions for the text below it.</p>
      </header>
      <div className="mhl-toolbar">
        <div className="mhl-view-options" role="group" aria-label="Choose a mobile layout to preview">
          <button type="button" aria-pressed={view === "all"} onClick={() => setView("all")}>Compare all</button>
          {OPTIONS.map((option) => (
            <button key={option.id} type="button" aria-pressed={view === option.id} onClick={() => setView(option.id)}>{option.name}</button>
          ))}
        </div>
        <button className="mhl-motion-button" type="button" aria-pressed={playing} onClick={() => setPlaybackChoice(!playing)}>
          {playing ? "Pause films" : "Play films"}
        </button>
      </div>
      <div className="mhl-grid" data-view={view}>
        {OPTIONS.map((option, index) => (view === "all" || view === option.id) && (
          <HeroOption key={option.id} option={option} index={index} playing={playing} />
        ))}
      </div>
    </main>
  );
}

/** Development-only comparisons, separate from the website's desktop hero. */
export function MobileHeroLab() {
  return <WebsiteImageRoute route="/kit-story"><MobileHeroExamples /></WebsiteImageRoute>;
}
