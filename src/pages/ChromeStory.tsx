import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChromeDemoWindow } from "../components/ChromeDemoScene";
import { useMediaQuery, usePrefersReducedMotion } from "../hooks/useMediaQuery";
import {
  CHROME_STEPS,
  CHROME_STORE,
  chromeWallpaperBackground,
  useChromeWallpaper,
  useChromePreviewEntry,
  type ChromeStage,
} from "../lib/chromeDemo";
import { A } from "../lib/assets";
import { ChromeStoryMobile } from "./ChromeStoryMobile";
import "./chrome-story.css";

const STOPS = [0, 0.17, 0.35, 0.51, 0.68] as const;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

function ChromeStoryDesktop({ embedded = false }: { embedded?: boolean }) {
  const track = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const wallpaper = useChromeWallpaper();
  useChromePreviewEntry(track);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const element = track.current;
      if (!element) return;
      setProgress(
        clamp(
          -element.getBoundingClientRect().top /
            Math.max(element.offsetHeight - window.innerHeight, 1),
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  const current = STOPS.reduce<ChromeStage>(
    (step, stop, index) => (progress >= stop ? (index as ChromeStage) : step),
    0,
  );
  const finish = clamp((progress - 0.91) / 0.07);
  const goTo = useCallback((next: ChromeStage) => {
    const element = track.current;
    if (!element) return;
    const start = window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({
      top:
        start +
        (element.offsetHeight - window.innerHeight) * (STOPS[next] + 0.015),
      behavior: "smooth",
    });
  }, []);
  return (
    <div className="cs-story">
      {!embedded && (
        <div className="cs-back-link">
          <Link to="/">← Home</Link>
          <span>Chrome story</span>
        </div>
      )}
      <section className={`cs-story-intro ${embedded ? "is-embedded" : ""}`}>
        <p className="cs-eyebrow">Foam for Chrome</p>
        <h1>
          A brief lands.
          <br />
          You already have the answer.
        </h1>
        <p>
          Find the right creator, copy their details and paste a complete
          profile into your reply. All without leaving your inbox.
        </p>
      </section>
      <section
        ref={track}
        className="cs-scroll-track"
        aria-label="From a brand brief to a creator recommendation"
      >
        <div className="cs-sticky-stage">
          <div
            className="cs-desktop-wallpaper"
            style={{
              backgroundImage: chromeWallpaperBackground(wallpaper),
              opacity: 1 - finish,
            }}
          />
          <p className="cs-stage-caption" style={{ opacity: 1 - finish }}>
            {CHROME_STEPS[current].description}
          </p>
          <div
            className="cs-browser-holder"
            style={{
              opacity: 1 - finish,
              transform: `translateY(${-finish * 16}px)`,
              visibility: finish >= 1 ? "hidden" : undefined,
            }}
          >
            <ChromeDemoWindow
              stage={current}
              onStage={goTo}
              cursor={current > 0 && current < 4}
            />
          </div>
          <nav
            className="cs-step-nav"
            aria-label="Chrome demo steps"
            style={{
              opacity: 1 - finish,
              visibility: finish >= 1 ? "hidden" : undefined,
            }}
          >
            {CHROME_STEPS.map((step, index) => (
              <button
                type="button"
                key={step.label}
                onClick={() => goTo(index as ChromeStage)}
                aria-current={current === index ? "step" : undefined}
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
            ))}
          </nav>
          {finish > 0 && (
            <div
              className="cs-finale"
              style={{
                opacity: finish,
                pointerEvents: finish > 0.7 ? "auto" : "none",
              }}
              aria-hidden={finish < 0.7}
            >
              <a
                href={CHROME_STORE}
                target="_blank"
                rel="noreferrer"
                tabIndex={finish > 0.7 ? 0 : -1}
              >
                <img
                  src={`${A}/chrome-store.webp`}
                  alt=""
                  width={180}
                  height={157}
                />
                <h2>That’s the Chrome Extension.</h2>
                <span>
                  Bring your roster to your inbox{" "}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function ChromeStory({ embedded = false }: { embedded?: boolean } = {}) {
  const desktop = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const reduced = usePrefersReducedMotion();
  if (desktop === null)
    return <div className="min-h-[40vh] bg-white" aria-hidden />;
  return desktop && !reduced ? (
    <ChromeStoryDesktop embedded={embedded} />
  ) : (
    <ChromeStoryMobile embedded={embedded} />
  );
}
