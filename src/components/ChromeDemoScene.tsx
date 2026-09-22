import { useLayoutEffect, useRef, useState } from "react";
import { AIDisclosure } from "./AIDisclosure";
import { KitPlatformIcon } from "./KitDetails";
import { LabIcon } from "./TalentLabIcon";
import {
  websiteAria,
  websiteProfile,
  websiteSamantha,
  websiteContentStats,
} from "../data/websiteTalent";
import { type ChromeStage } from "../lib/chromeDemo";
import { A } from "../lib/assets";
import "./chrome-demo.css";

const PROFILE = websiteProfile(websiteSamantha);
const TALENT = [websiteAria, websiteSamantha].map(websiteProfile);
const BIO = `${PROFILE.bio.split(". ")[0]}.`;
const POSTS = websiteContentStats(websiteSamantha.content.slice(0, 4));
const PLATFORMS = PROFILE.platforms.filter((platform) =>
  ["instagram", "tiktok", "youtube"].includes(platform.network),
);

function MailTool({ name }: { name: "archive" | "trash" | "attach" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "archive" ? (
        <>
          <path d="M4 8h16v12H4V8Z" />
          <path d="M3 4h18v4H3zM9 12h6" />
        </>
      ) : name === "trash" ? (
        <>
          <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" />
        </>
      ) : (
        <path d="m8 13 7-7a3 3 0 0 1 4 4l-9 9a5 5 0 0 1-7-7L13 2M6 15l9-9" />
      )}
    </svg>
  );
}

export function ChromeBrandBrief({
  condensed = false,
}: {
  condensed?: boolean;
}) {
  return (
    <article className={`cs-brand-email ${condensed ? "is-condensed" : ""}`}>
      <header>
        <span className="cs-sender-avatar">R</span>
        <div>
          <strong>Rose Finch</strong>
          <span className="cs-email-address"> &lt;rose@haven.example&gt;</span>
          <p>to Alex · Northline Talent</p>
        </div>
        <time>10:42 AM</time>
      </header>
      <div className="cs-email-copy">
        <p>Hi Alex,</p>
        <p>
          We’re launching our everyday curl-care range and looking for an
          LA-based beauty creator with natural curls and a warm, relatable
          style.
        </p>
        <p>
          Someone who makes haircare feel easy. Could you send a recommendation
          from your roster, with their audience numbers and media kit?
        </p>
        <p>
          Thanks,
          <br />
          Rose
          <br />
          <span className="cs-signature-brand">Haven Hair</span>
        </p>
      </div>
    </article>
  );
}

/** A rich email embed uses the same approved creator and figures as the kit. */
export function ChromeCreatorEmbed() {
  return (
    <div className="cs-creator-embed">
      <div className="cs-embed-identity">
        <img src={PROFILE.portrait} alt={`${PROFILE.name} portrait`} />
        <div>
          <strong>{PROFILE.name}</strong>
          <p>
            {PROFILE.loc} · {PROFILE.age}
          </p>
          <div className="cs-embed-platforms">
            {PLATFORMS.map((platform) => (
              <span key={platform.network}>
                <KitPlatformIcon
                  network={platform.network}
                  label={platform.label}
                  size={12}
                />
                <span>{platform.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <AIDisclosure size={8} />
      <p className="cs-embed-bio">{BIO}</p>
      <span className="cs-embed-kit">
        View Media Kit <span aria-hidden="true">↗</span>
      </span>
      <div className="cs-embed-insights">
        <section>
          <h4>Featured content</h4>
          <dl>
            {POSTS.map(([value, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h4>Connected platforms</h4>
          <dl>
            {PLATFORMS.map((platform) => (
              <div key={platform.network}>
                <dt>{platform.label}</dt>
                <dd>{platform.count}</dd>
              </div>
            ))}
          </dl>
          <p>Demo audience figures</p>
        </section>
      </div>
    </div>
  );
}

export function ChromeReply({
  pasted,
  onPaste,
}: {
  pasted: boolean;
  onPaste?: () => void;
}) {
  return (
    <section
      className={`cs-reply ${pasted ? "is-pasted" : ""}`}
      aria-label="Talent manager’s reply draft"
    >
      <header>
        <span aria-hidden="true">↩</span> <strong>Rose Finch</strong>
        <span>&lt;rose@haven.example&gt;</span>
        <small>Draft</small>
      </header>
      <div className="cs-reply-body">
        <p>Hi Rose,</p>
        <p>
          Samantha Pikka feels like a great fit. She makes everyday curl-care
          routines feel simple and approachable. Here’s her profile and media
          kit:
        </p>
        {pasted ? (
          <ChromeCreatorEmbed />
        ) : (
          <button
            type="button"
            data-chrome-target="paste"
            className="cs-paste-space"
            disabled={!onPaste}
            onClick={onPaste}
          >
            <span className="cs-insertion-point" aria-hidden="true" />
            {onPaste ? "Paste creator profile" : "Your creator details go here"}
          </button>
        )}
      </div>
      <footer>
        <span className="cs-send-preview">
          Send <span aria-hidden="true">▾</span>
        </span>
        <span className="cs-formatting" aria-hidden="true">
          <u>A</u>
          <MailTool name="attach" />
          <LabIcon name="link" size={14} />
        </span>
        {pasted && (
          <span className="cs-draft-ready">
            <LabIcon name="check" size={12} /> Ready to send
          </span>
        )}
      </footer>
    </section>
  );
}

export function ChromeExtensionPanel({
  stage,
  onStage,
}: {
  stage: ChromeStage;
  onStage?: (stage: ChromeStage) => void;
}) {
  const selected = stage >= 2;
  const copied = stage >= 3;
  return (
    <aside className="cs-extension" aria-label="Foam extension demo">
      <header className="cs-extension-header">
        <span className="cs-foam-mark">
          <img src={`${A}/fdb3b.svg`} alt="Foam" />
        </span>
        <strong>Foam</strong>
        <span className="cs-extension-header-end" aria-hidden="true">
          ×
        </span>
      </header>
      {!selected ? (
        <div className="cs-extension-list">
          <nav aria-label="Extension preview sections">
            <span>Talent</span>
            <span>Lists</span>
            <span>Media Kits</span>
          </nav>
          <div className="cs-extension-filter">
            <span>All Talent⌄</span>
            <LabIcon name="search" size={15} />
          </div>
          <div className="cs-extension-talents">
            {TALENT.map((talent) => (
              <div key={talent.id}>
                {talent.id === PROFILE.id ? (
                  <button
                    type="button"
                    className="cs-talent-choice"
                    data-chrome-target="talent"
                    onClick={() => onStage?.(2)}
                    aria-label="Choose Samantha Pikka"
                  >
                    <img src={talent.portrait} alt="" />
                    <strong>{talent.name}</strong>
                  </button>
                ) : (
                  <div className="cs-talent-choice">
                    <img src={talent.portrait} alt="" />
                    <strong>{talent.name}</strong>
                  </div>
                )}
                <AIDisclosure size={8} />
              </div>
            ))}
          </div>
          <p className="cs-roster-note">Your people. Right where you work.</p>
        </div>
      ) : (
        <>
          <div className="cs-extension-profile">
            <span className="cs-panel-back" aria-hidden="true">
              ‹
            </span>
            <figure>
              <img src={PROFILE.portrait} alt={`${PROFILE.name} portrait`} />
              <figcaption>
                <AIDisclosure size={8} className="justify-center" />
              </figcaption>
            </figure>
            <h3>
              {PROFILE.name} <span aria-hidden="true">↗</span>
            </h3>
            <p className="cs-profile-location">
              {PROFILE.loc} · Age: {PROFILE.age}
            </p>
            <div className="cs-panel-platforms">
              {PLATFORMS.map((platform) => (
                <span key={platform.network}>
                  <KitPlatformIcon
                    network={platform.network}
                    label={platform.label}
                    size={16}
                  />
                  {platform.count}
                </span>
              ))}
            </div>
            <div className="cs-profile-tags">
              {websiteSamantha.verticals.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="cs-panel-bio">{BIO}</p>
          </div>
          <div className="cs-embed-options">
            <p>Choose what is included in embeds</p>
            <div>
              Include Biography
              <span className="cs-toggle" role="img" aria-label="Included" />
            </div>
            <div>
              Include primary media kit
              <span className="cs-toggle" role="img" aria-label="Included" />
            </div>
            <div className="cs-copy-options">
              <span>Basic</span>
              <button
                type="button"
                data-chrome-target="copy"
                className={copied ? "is-copied" : ""}
                onClick={() => onStage?.(3)}
              >
                <LabIcon name={copied ? "check" : "copy"} size={12} />
                {copied ? "Copied" : "Detail"}
              </button>
              <span>Text</span>
            </div>
            {copied && (
              <p className="cs-copy-confirmation">
                Profile copied. Paste it into your reply.
              </p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export function ChromeDemoWindow({
  stage,
  onStage,
  cursor = false,
}: {
  stage: ChromeStage;
  onStage: (stage: ChromeStage) => void;
  cursor?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const root = frame.current;
      const target = root?.querySelector(
        `[data-chrome-target="${["reply", "talent", "copy", "paste", "paste"][stage]}"]`,
      );
      if (!root || !target || stage === 4) {
        setPoint(null);
        return;
      }
      const bounds = root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPoint({
        x: rect.left - bounds.left + rect.width * 0.72,
        y: rect.top - bounds.top + rect.height * 0.68,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [stage]);
  return (
    <div className="cs-browser" ref={frame}>
      <div className="cs-browser-toolbar">
        <span className="cs-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="cs-browser-tab">
          M&nbsp; Curl-care launch — Inbox <span>×</span>
        </span>
        <span className="cs-chrome-profile">A</span>
      </div>
      <div className="cs-address-bar">
        <span aria-hidden="true">← &nbsp; → &nbsp; ↻</span>
        <div>
          <span aria-hidden="true">⌕</span> mail.google.com/mail/u/0/#inbox
        </div>
        <span className="cs-toolbar-foam">
          <img src={`${A}/fdb3b.svg`} alt="Foam extension" />
        </span>
      </div>
      <div className="cs-browser-content">
        <div className="cs-mail-app">
          <div className="cs-mail-search">
            <span className="cs-gmail-wordmark">
              M <strong>Gmail</strong>
            </span>
            <span className="cs-search-field">
              <LabIcon name="search" size={15} />
              Search mail
            </span>
            <span className="cs-mail-avatar">A</span>
          </div>
          <div className="cs-mail-layout">
            <nav className="cs-mail-folders" aria-label="Email demo folders">
              <span className="cs-compose">＋ Compose</span>
              <strong>
                Inbox <small>3</small>
              </strong>
              <span>Starred</span>
              <span>Sent</span>
              <span>
                Drafts <small>{stage > 0 ? 1 : ""}</small>
              </span>
            </nav>
            <div className={`cs-thread ${stage === 4 ? "is-pasted" : ""}`}>
              <div className="cs-thread-tools" aria-hidden="true">
                <span className="cs-thread-action-icons">
                  ←<MailTool name="archive" />
                  <MailTool name="trash" />
                </span>
                <span>1 of 24 &nbsp; ‹ &nbsp; ›</span>
              </div>
              <h3>
                A creator for our curl-care launch <span>Inbox</span>
              </h3>
              <ChromeBrandBrief condensed={stage > 0} />
              {stage === 0 ? (
                <button
                  className="cs-reply-button"
                  type="button"
                  data-chrome-target="reply"
                  onClick={() => onStage(1)}
                >
                  ↩ Reply
                </button>
              ) : (
                <ChromeReply
                  pasted={stage >= 4}
                  onPaste={stage >= 3 ? () => onStage(4) : undefined}
                />
              )}
            </div>
          </div>
        </div>
        {stage > 0 && <ChromeExtensionPanel stage={stage} onStage={onStage} />}
      </div>
      {cursor && point && (
        <svg
          className="cs-demo-cursor"
          width="24"
          height="30"
          viewBox="0 0 24 30"
          style={{ left: point.x, top: point.y }}
          aria-hidden="true"
        >
          <path
            d="M3 2v23l6-7 5 10 4-2-5-10h9Z"
            fill="#101828"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
      )}
    </div>
  );
}
