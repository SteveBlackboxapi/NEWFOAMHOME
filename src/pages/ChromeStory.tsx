import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
import {
  CHROME_STAGE_STOPS,
  CHROME_STORY_END,
  CHROME_STORY_HEIGHT_VH,
  SHOW_CHROME_STEP_NAV,
  chromeStageAt,
  chromeEntryScale,
  chromeSendoffAt,
  chromePlanePose,
  type ChromeFlightGeometry,
} from "../lib/chromeStoryMotion";
import { ChromeStoryMobile } from "./ChromeStoryMobile";
import "./chrome-story.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function ChromeStoryDesktop({ embedded = false }: { embedded?: boolean }) {
  const track = useRef<HTMLElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [flightGeometry, setFlightGeometry] =
    useState<ChromeFlightGeometry | null>(null);
  const wallpaper = useChromeWallpaper();
  useChromePreviewEntry(track);
  useLayoutEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const element = track.current;
      if (!element) return;
      const top = element.getBoundingClientRect().top;
      reveal.current?.style.setProperty(
        "--chrome-entry-scale",
        String(chromeEntryScale(top, window.innerHeight)),
      );
      setProgress(
        clamp(-top / Math.max(element.offsetHeight - window.innerHeight, 1)) *
          CHROME_STORY_END,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    const observer = new ResizeObserver(schedule);
    if (track.current) observer.observe(track.current);
    observer.observe(document.body);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) schedule();
    });
    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, []);
  const current = chromeStageAt(progress);
  const sendoff = chromeSendoffAt(progress);
  const plane = chromePlanePose(progress, flightGeometry);
  useLayoutEffect(() => {
    const root = reveal.current;
    const send = root?.querySelector<HTMLElement>(
      '[data-chrome-target="send"]',
    );
    if (!root || !send) return;
    const measure = () => {
      const bounds = root.getBoundingClientRect();
      const button = send.getBoundingClientRect();
      const scaleX = bounds.width / root.offsetWidth || 1;
      const scaleY = bounds.height / root.offsetHeight || 1;
      setFlightGeometry({
        start: {
          x: (button.left + button.width / 2 - bounds.left) / scaleX,
          y: (button.top + button.height / 2 - bounds.top) / scaleY,
        },
        width: root.offsetWidth,
        height: root.offsetHeight,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(send);
    let active = true;
    void document.fonts.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [current]);
  const goTo = useCallback((next: ChromeStage) => {
    const element = track.current;
    if (!element) return;
    const start = window.scrollY + element.getBoundingClientRect().top;
    window.scrollTo({
      top:
        start +
        (element.offsetHeight - window.innerHeight) *
          (next === 6
            ? 1
            : (CHROME_STAGE_STOPS[next] + 0.005) / CHROME_STORY_END),
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
        style={{ height: `${CHROME_STORY_HEIGHT_VH}vh` }}
        aria-label="From a brand brief to a creator recommendation"
      >
        <div className="cs-sticky-stage">
          <div className="cs-stage-reveal" ref={reveal}>
            <div
              className="cs-desktop-scene"
              style={{ opacity: sendoff.desktopOpacity }}
              inert={sendoff.desktopOpacity === 0}
              aria-hidden={sendoff.desktopOpacity === 0}
            >
              <div
                className="cs-desktop-wallpaper"
                style={{
                  backgroundImage: chromeWallpaperBackground(wallpaper),
                }}
              />
              <p className="cs-stage-caption">
                {CHROME_STEPS[current].description}
              </p>
              <div className="cs-browser-holder">
                <ChromeDemoWindow
                  stage={current}
                  progress={progress}
                  onStage={goTo}
                />
              </div>
            </div>
            <section
              className="cs-finale cs-sendoff-finale"
              aria-label="Foam Chrome extension"
              aria-hidden={!sendoff.finaleInteractive}
              inert={!sendoff.finaleInteractive}
              style={{
                opacity: sendoff.finaleOpacity,
                transform: `translateY(${sendoff.finaleOffset}px)`,
                pointerEvents: sendoff.finaleInteractive ? "auto" : "none",
              }}
            >
              <a href={CHROME_STORE} target="_blank" rel="noreferrer">
                <div className="cs-store-mark">
                  <img
                    src={`${A}/chrome-store.webp`}
                    alt=""
                    width={180}
                    height={157}
                  />
                </div>
                <h2>That’s the Chrome Extension.</h2>
                <span>
                  Bring your roster to your inbox{" "}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            </section>

            {plane && (
              <svg
                className="cs-paper-plane"
                data-chrome-paper-plane
                viewBox="0 0 120 72"
                aria-hidden="true"
                style={{
                  left: plane.x,
                  top: plane.y,
                  width: plane.width,
                  opacity: plane.opacity,
                  transform: `translate(-50%, -50%) rotate(${plane.rotation}deg) scale(${plane.scale})`,
                }}
              >
                <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill="#7a0036" />
                <path d="M44 40 L114 6 L60 40 Z" fill="#fff6eb" />
              </svg>
            )}
            {SHOW_CHROME_STEP_NAV && (
              <nav className="cs-step-nav" aria-label="Chrome demo steps">
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
            )}
          </div>
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
