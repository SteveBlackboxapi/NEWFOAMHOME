import { OptimizedImage } from "../components/OptimizedImage";
import { useWebsiteBackground } from "../components/WebsiteImageScope";
import { useRef, useState } from "react";
import { Link } from "react-router";
import {
  ChromeBrandBrief,
  ChromeExtensionPanel,
  ChromeReply,
} from "../components/ChromeDemoScene";
import { MobileFade } from "../components/MobileFade";
import {
  CHROME_STORE,
  KIT_STORY_CHROME_BACKGROUND,
  chromeWallpaperBackground,
  useChromeWallpaper,
  useChromePreviewEntry,
  type ChromeStage,
} from "../lib/chromeDemo";
import { A } from "../lib/assets";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import "./chrome-story.css";

/** The same inbox workflow in readable, naturally scrolling frames. */
export function ChromeStoryMobile({
  embedded = false,
}: { embedded?: boolean } = {}) {
  const Heading = embedded ? "h2" : "h1";
  const wallpaper = useChromeWallpaper();
  const desktopBackground = useWebsiteBackground(embedded ? KIT_STORY_CHROME_BACKGROUND : chromeWallpaperBackground(wallpaper), "Foam for Chrome · Desktop background");
  const reduced = usePrefersReducedMotion();
  const [sent, setSent] = useState(false);
  const finale = useRef<HTMLDivElement>(null);
  const send = () => {
    setSent(true);
    finale.current?.scrollIntoView({
      block: "center",
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const preview = useRef<HTMLElement>(null);
  useChromePreviewEntry(preview);
  const [panelStage, setPanelStage] = useState<ChromeStage>(2);
  const background = {
    backgroundImage: desktopBackground,
  };
  return (
    <div className="cs-story cs-mobile-story">
      {!embedded && (
        <div className="cs-mobile-back">
          <Link to="/">← Home</Link>
          <span>Chrome story</span>
        </div>
      )}
      <section className={`cs-story-intro ${embedded ? "is-embedded" : ""}`}>
        <MobileFade>
          <p className="cs-eyebrow">Foam for Chrome</p>
          <Heading>
            A brief lands.
            <br />
            You already have the answer.
          </Heading>
          <p>
            Find the right creator, copy their details and paste a complete
            profile into your reply. All without leaving your inbox.
          </p>
        </MobileFade>
      </section>
      <div className="cs-mobile-steps">
        <section ref={preview}>
          <MobileFade>
            <div className="cs-mobile-step-title">
              <span>01</span>
              <h3>A brand asks. You’re on it.</h3>
            </div>
            <div className="cs-mobile-desktop" style={background}>
              <div className="cs-mobile-email-window">
                <div className="cs-mobile-window-bar">
                  <span>● ● ●</span> mail.google.com
                </div>
                <div className="cs-mobile-email-content">
                  <h4>A creator for our curl-care launch</h4>
                  <ChromeBrandBrief />
                </div>
              </div>
            </div>
          </MobileFade>
        </section>
        <section>
          <MobileFade>
            <div className="cs-mobile-step-title">
              <span>02</span>
              <h3>The right person. One click.</h3>
            </div>
            <p className="cs-mobile-step-copy">
              Open Samantha’s profile in Foam. Choose Detail to copy her
              biography, audience figures and media kit.
            </p>
            <div
              className="cs-mobile-desktop cs-mobile-extension-stage"
              style={background}
            >
              <ChromeExtensionPanel
                stage={panelStage}
                onStage={setPanelStage}
              />
            </div>
          </MobileFade>
        </section>
        <section>
          <MobileFade>
            <div className="cs-mobile-step-title">
              <span>03</span>
              <h3>Paste. Send. You’re done.</h3>
            </div>
            <div className="cs-mobile-desktop" style={background}>
              <div className="cs-mobile-email-window">
                <div className="cs-mobile-window-bar">
                  <span>● ● ●</span> Your reply
                </div>
                <div className="cs-mobile-reply-wrap">
                  <ChromeReply pasted sent={sent} onSend={send} />
                </div>
              </div>
            </div>
          </MobileFade>
        </section>
      </div>
      <div ref={finale}>
        <MobileFade className="cs-mobile-finale">
          {sent && (
            <p className="cs-mobile-sent" role="status">
              ✓ Message sent
            </p>
          )}
          <a href={CHROME_STORE} target="_blank" rel="noreferrer">
            <div className="cs-store-mark">
              <OptimizedImage section="Foam for Chrome · Send finale"
                src={`${A}/chrome-store-transparent.webp`}
                alt=""
                width={150}
                height={131}
              />
            </div>
            <h2>That’s the Chrome Extension.</h2>
            <span>Bring your roster to your inbox ↗</span>
          </a>
        </MobileFade>
      </div>
    </div>
  );
}
