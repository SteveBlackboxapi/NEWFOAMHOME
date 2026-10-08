import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChromeReply } from "./ChromeDemoScene";
import { OptimizedImage } from "./OptimizedImage";
import { LabIcon } from "./TalentLabIcon";
import { websiteProfile, websiteSamantha } from "../data/websiteTalent";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import "./chrome-mobile-copy-paste.css";

const PROFILE = websiteProfile(websiteSamantha);
type CopyPhase = "idle" | "pressing" | "copied";
type PastePhase = "waiting" | "pasting" | "complete";

/** A short, in-view phone demonstration. It never reads or writes the clipboard. */
export function ChromeMobileCopyPaste({
  background,
  alreadyCopied,
  sent,
  onSend,
}: {
  background: ReactNode;
  alreadyCopied: boolean;
  sent: boolean;
  onSend: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const copyButton = useRef<HTMLButtonElement>(null);
  const reply = useRef<HTMLDivElement>(null);
  const [copyVisible, setCopyVisible] = useState(false);
  const [pasteVisible, setPasteVisible] = useState(false);
  const [copyPhase, setCopyPhase] = useState<CopyPhase>(alreadyCopied ? "copied" : "idle");
  const [pastePhase, setPastePhase] = useState<PastePhase>("waiting");
  const shownCopyPhase = reduced || sent ? "copied" : copyPhase;
  const shownPastePhase = reduced || sent ? "complete" : pastePhase;

  useEffect(() => {
    if (alreadyCopied) setCopyPhase("copied");
  }, [alreadyCopied]);

  useEffect(() => {
    if (!reduced && !sent) return;
    setCopyPhase("copied");
    setPastePhase("complete");
  }, [reduced, sent]);

  useEffect(() => {
    const copyTarget = copyButton.current;
    // Observe the insertion point, not the tall email: don't paste before it is visible.
    const pasteTarget = reply.current?.querySelector(".cs-pasted-anchor");
    if (!copyTarget || !pasteTarget) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === copyTarget) setCopyVisible(true);
        if (entry.target === pasteTarget) setPasteVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.5, rootMargin: "0px 0px -15% 0px" });
    observer.observe(copyTarget);
    observer.observe(pasteTarget);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || sent || !copyVisible || copyPhase === "copied") return;
    const timer = window.setTimeout(
      () => setCopyPhase(copyPhase === "idle" ? "pressing" : "copied"),
      copyPhase === "idle" ? 700 : 450,
    );
    return () => window.clearTimeout(timer);
  }, [copyVisible, copyPhase, reduced, sent]);

  useEffect(() => {
    if (reduced || sent || !pasteVisible || pastePhase === "complete") return;
    const timer = window.setTimeout(() => {
      setCopyPhase("copied");
      setPastePhase(pastePhase === "waiting" ? "pasting" : "complete");
    }, 850);
    return () => window.clearTimeout(timer);
  }, [pasteVisible, pastePhase, reduced, sent]);

  function playPaste() {
    setCopyPhase("copied");
    setPasteVisible(true);
    setPastePhase(reduced ? "complete" : pastePhase === "complete" ? "waiting" : "pasting");
  }

  return (
    <div className="cs-phone-copy-paste">
      <section aria-labelledby="cs-phone-copy-title">
        <div className="cs-mobile-step-title">
          <span>03</span>
          <h3 id="cs-phone-copy-title">Copy what matters.</h3>
        </div>
        <p className="cs-mobile-step-copy">
          Choose Detail. Her biography, audience figures and media kit come with her.
        </p>
        <div className="cs-mobile-desktop">
          {background}
          <div className="cs-phone-copy-card">
            <div className="cs-phone-copy-identity">
              <OptimizedImage
                section="Foam for Chrome · Selected profile and pasted email"
                src={PROFILE.portrait} sizes="48px" alt=""
                width={48} height={48}
              />
              <div><strong>{PROFILE.name}</strong><span>Ready for your reply</span></div>
            </div>
            <div className="cs-phone-copy-options">
              <p>Choose what is included in embeds</p>
              <div className="cs-phone-copy-setting">
                Include Biography
                <span className="cs-toggle" role="img" aria-label="Included" />
              </div>
              <div className="cs-phone-copy-setting">
                Include primary media kit
                <span className="cs-toggle" role="img" aria-label="Included" />
              </div>
              <div className="cs-phone-copy-buttons">
                <span>Basic</span>
                <button ref={copyButton} type="button" data-state={shownCopyPhase}
                  aria-label="Copy Samantha’s detailed profile in demo"
                  onClick={() => setCopyPhase("copied")}>
                  <LabIcon name={shownCopyPhase === "copied" ? "check" : "copy"} size={13} />
                  {shownCopyPhase === "copied" ? "Copied" : "Detail"}
                </button>
                <span>Text</span>
              </div>
              <p className="cs-phone-copy-status" role="status">
                {shownCopyPhase === "copied" ? "Profile copied. Next, paste it into your reply." : "One click brings her details together."}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="cs-phone-paste-title">
        <div className="cs-mobile-step-title">
          <span>04</span>
          <h3 id="cs-phone-paste-title">Paste. Send. You’re done.</h3>
        </div>
        <div className="cs-phone-paste-toolbar">
          <span role="status">
            {sent ? "Reply sent" : shownPastePhase === "complete" ? "Profile pasted. Ready to send." : shownPastePhase === "pasting" ? "Pasting Samantha’s profile…" : "From Foam, straight into your reply."}
          </span>
          <button type="button" onClick={playPaste}
            disabled={sent || shownPastePhase === "pasting" || (reduced && shownPastePhase === "complete")}>
            {shownPastePhase === "complete" ? "Replay paste" : "Paste profile"}
          </button>
        </div>
        <div className="cs-mobile-desktop">
          {background}
          <div className="cs-mobile-email-window">
            <div className="cs-mobile-window-bar"><span>● ● ●</span> Your reply</div>
            <div ref={reply} className="cs-mobile-reply-wrap cs-phone-paste-reply" data-phase={shownPastePhase}>
              {/* Reserve the finished email height while the profile is revealed. */}
              <ChromeReply pasted sent={sent} onSend={shownPastePhase === "complete" ? onSend : undefined} />
              <div className="cs-phone-paste-placeholder" aria-hidden="true">
                <LabIcon name="copy" size={24} />
                <strong>A complete introduction.</strong>
                <p>Her profile, numbers and media kit appear together.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
