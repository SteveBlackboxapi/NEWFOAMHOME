import { OptimizedImage } from "../components/OptimizedImage";
import { WebsiteBackgroundImage } from "../components/WebsiteImageScope";
import { useEffect, useRef, useState } from "react";
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
import { useMediaQuery, usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { StoryBenefits } from "../components/StoryBenefits";
import { ChromeMobileCopyPaste } from "../components/ChromeMobileCopyPaste";
import "./chrome-story.css";

/** The same inbox workflow in readable, naturally scrolling frames. */
export function ChromeStoryMobile({
  embedded = false,
}: { embedded?: boolean } = {}) {
  const Heading = embedded ? "h2" : "h1";
  const wallpaper = useChromeWallpaper();
  const desktopBackground = embedded ? KIT_STORY_CHROME_BACKGROUND : chromeWallpaperBackground(wallpaper);
  const reduced = usePrefersReducedMotion();
  const phone = useMediaQuery("(max-width: 767px)") === true;
  const [sent, setSent] = useState(false);
  const finale = useRef<HTMLDivElement>(null);
  const finaleBenefits = useRef<HTMLDivElement>(null);
  const [finaleVisible, setFinaleVisible] = useState(false);
  useEffect(() => {
    if (reduced) {
      setFinaleVisible(true);
      return;
    }
    // On phones, wait for the checklist itself rather than the earlier logo/title.
    const element = phone ? finaleBenefits.current : finale.current;
    if (!element) return;
    if (phone) setFinaleVisible(false);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && (!phone || entry.intersectionRatio >= 1)) {
        setFinaleVisible(true);
        if (!phone) observer.disconnect();
      } else if (phone && !entry.isIntersecting) {
        // Re-entering the phone recap should write and check the rows again.
        setFinaleVisible(false);
      }
    }, { threshold: phone ? [0, 1] : 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [phone, reduced]);
  const send = () => {
    setSent(true);
    finale.current?.scrollIntoView({
      block: "start",
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const preview = useRef<HTMLElement>(null);
  useChromePreviewEntry(preview);
  const [panelStage, setPanelStage] = useState<ChromeStage>(2);
  const background = (
    <WebsiteBackgroundImage
      background={desktopBackground}
      section="Foam for Chrome · Desktop background"
      media="(max-width: 1023px)"
      sizes="(max-width: 900px) calc(100vw - 40px), 860px"
    />
  );
  return (
    <div className="cs-story cs-mobile-story">
      {!embedded && (
        <div className="cs-mobile-back">
          <Link to="/">← Managers</Link>
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
            profile into your reply.
            <br />All without leaving your inbox.
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
            <div className="cs-mobile-desktop">
              {background}
              <div className="cs-mobile-email-window">
                <div className="cs-mobile-window-bar">
                  <span>● ● ●</span> mail.google.com
                </div>
                <div className="cs-mobile-email-content">
                  <h4>A creator for our Curl Care launch</h4>
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
            <div className="cs-mobile-desktop cs-mobile-extension-stage">
              {background}
              <ChromeExtensionPanel
                stage={panelStage}
                onStage={setPanelStage}
              />
            </div>
          </MobileFade>
        </section>
        {phone ? (
          <ChromeMobileCopyPaste
            background={background}
            alreadyCopied={panelStage >= 4}
            sent={sent}
            onSend={send}
          />
        ) : <section>
          <MobileFade>
            <div className="cs-mobile-step-title">
              <span>03</span>
              <h3>Paste. Send. You’re done.</h3>
            </div>
            <div className="cs-mobile-desktop">
              {background}
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
        </section>}
      </div>
      <div ref={finale} className="cs-mobile-finale-anchor">
        <MobileFade className="cs-mobile-finale">
          {sent && (
            <p className="cs-mobile-sent" role="status">
              ✓ Message sent
            </p>
          )}
          <div className="cs-finale-content">
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
            </a>
            <div ref={finaleBenefits} className="cs-finale-benefits">
              <StoryBenefits variant="chrome" active={finaleVisible || reduced} />
            </div>
          </div>
        </MobileFade>
      </div>
    </div>
  );
}
