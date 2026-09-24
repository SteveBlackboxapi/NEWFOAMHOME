import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Link } from "react-router";
import { Nav } from "../components/Nav";
import { KitPlatformIcon } from "../components/KitDetails";
import { useMediaQuery } from "../hooks/useMediaQuery";
import "./live-study.css";

const ASSETS = `${import.meta.env.BASE_URL}assets/people-colour/story-refresh-v1`;

type Platform = "tiktok" | "instagram";
type IconName = "heart" | "eye" | "close" | "share" | "more" | "pause" | "play";
type Comment = { name: string; text: string; colour: string };
type LiveExample = {
  platform: Platform;
  name: string;
  handle: string;
  image: string;
  alt: string;
  title: string;
  description: string;
  viewers: number;
  comments: Comment[];
};

const EXAMPLES: LiveExample[] = [
  {
    platform: "tiktok",
    name: "Tessa Quinn",
    handle: "tessaquinn",
    image: `${ASSETS}/tessa-live.webp`,
    alt: "Fictional creator Tessa Quinn chatting to the camera after an outdoor workout.",
    title: "The everyday moments.",
    description: "A post-workout catch-up. A few familiar faces.",
    viewers: 1248,
    comments: [
      { name: "mila.moves", text: "Made it for the cool down 🤍", colour: "#9d82ab" },
      { name: "jess", text: "This is my favourite part of the day", colour: "#728986" },
      { name: "ellie.runs", text: "What's on the playlist today?", colour: "#8c6f80" },
      { name: "nia", text: "The sunshine is everything ☀️", colour: "#716f92" },
      { name: "leah", text: "Okay, joining you tomorrow!", colour: "#847c67" },
      { name: "sofie", text: "Five minutes for ourselves. Yes.", colour: "#6d8295" },
    ],
  },
  {
    platform: "instagram",
    name: "Luca Marin",
    handle: "lucamarin",
    image: `${ASSETS}/luca-live.webp`,
    alt: "Fictional creator Luca Marin talking to the camera from a sunny outdoor café.",
    title: "The things you know.",
    description: "Coffee, a good view, and the conversation in between.",
    viewers: 862,
    comments: [
      { name: "sammie", text: "Okay where is this place?", colour: "#8b829f" },
      { name: "james.l", text: "That view never gets old", colour: "#708c92" },
      { name: "amy", text: "Coffee and a catch-up. Perfect 🤍", colour: "#957e70" },
      { name: "theo", text: "Saved your last recommendation!", colour: "#6f7e96" },
      { name: "olivia", text: "Taking us with you, as always", colour: "#95818b" },
      { name: "ben", text: "What are we ordering today?", colour: "#7a8c75" },
    ],
  },
];

function Icon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "heart" && <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.9l-1.2-1.3a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />}
      {name === "eye" && <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>}
      {name === "close" && <path d="m6 6 12 12M6 18 18 6" />}
      {name === "share" && <><path d="m22 2-7 20-4-9L2 9 22 2ZM11 13 22 2" /></>}
      {name === "more" && <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>}
      {name === "pause" && <><path d="M8 5v14M16 5v14" strokeWidth="3" /></>}
      {name === "play" && <path d="m8 4 12 8-12 8V4Z" fill="currentColor" stroke="none" />}
    </svg>
  );
}

/** Stop both timer work and CSS motion whenever a card cannot be seen. */
function useVisibleCard(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && pageVisible;
}

function LiveCard({ example, paused, reducedMotion }: {
  example: LiveExample;
  paused: boolean;
  reducedMotion: boolean | null;
}) {
  const card = useRef<HTMLElement>(null);
  const visible = useVisibleCard(card);
  const running = visible && !paused && reducedMotion === false;
  const [tick, setTick] = useState(0);
  const [sent, setSent] = useState(0);
  const [bursts, setBursts] = useState<number[]>([]);
  const nextHeart = useRef(0);
  const tiktok = example.platform === "tiktok";
  const label = tiktok ? "TikTok LIVE" : "Instagram Live";
  const commentOffset = Math.floor(tick / 5) % example.comments.length;
  const comments = [0, 1, 2].map((index) => example.comments[(commentOffset + index) % example.comments.length]);
  const audience = example.viewers + [0, 2, 4, 3, 5, 8, 7, 9][Math.floor(tick / 3) % 8];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 800);
    return () => window.clearInterval(timer);
  }, [running]);

  function sendHeart() {
    setSent((value) => value + 1);
    if (!running) return;
    const id = ++nextHeart.current;
    setBursts((current) => [...current.slice(-5), id]);
  }

  return (
    <article className={`ls-example ls-example-${example.platform}`}>
      <div className="ls-platform-label">
        <span><KitPlatformIcon network={example.platform} label={tiktok ? "TikTok" : "Instagram"} size={20} />{label}</span>
        <span className="ls-example-number">{tiktok ? "01" : "02"}</span>
      </div>
      <section ref={card} className={`ls-viewer ls-viewer-${example.platform}`} data-running={running} aria-label={`${example.name} — ${label} concept`}>
        <img className="ls-portrait" src={example.image} alt={example.alt} width="941" height="1672" decoding="async" />
        <div className="ls-image-shade" />
        <div className="ls-viewer-top">
          <div className="ls-person-pill">
            <img className="ls-avatar" src={example.image} alt="" width="38" height="38" />
            <div className="ls-person-name">
              <strong>{example.handle}</strong>
              {tiktok && <span>12.8K likes</span>}
            </div>
          </div>
          <div className="ls-top-status">
            <span className="ls-live-badge">LIVE</span>
            <span className="ls-viewer-count" aria-label={`${audience.toLocaleString("en-US")} illustrative viewers`}><Icon name="eye" />{audience.toLocaleString("en-US")}</span>
            <span className="ls-decorative-close" aria-hidden="true"><Icon name="close" /></span>
          </div>
        </div>
        {tiktok && <div className="ls-live-topic">A little reset, together</div>}
        <div className="ls-viewer-bottom">
          <div className="ls-comments" aria-label="Simulated comments" aria-live="off">
            {comments.map((comment, index) => (
              <div className="ls-comment" key={`${commentOffset}-${index}`}>
                <span className="ls-comment-avatar" style={{ backgroundColor: comment.colour }} aria-hidden="true">{comment.name[0]}</span>
                <p><strong>{comment.name}</strong><span>{comment.text}</span></p>
              </div>
            ))}
          </div>
          <div className="ls-composer">
            <span className="ls-comment-prompt" aria-label="Comment field, visual preview only">{tiktok ? "Say something nice…" : "Comment"}</span>
            <span className="ls-decorative-action" aria-hidden="true"><Icon name={tiktok ? "more" : "share"} /></span>
            <button className="ls-heart-button" type="button" onClick={sendHeart} aria-label={`Send a demo heart to ${example.name}`} title="Send a demo heart"><Icon name="heart" filled={sent > 0} /></button>
          </div>
        </div>
        <div className="ls-floating-hearts" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => <span className="ls-floating-heart" key={index} style={{ "--heart-index": index } as CSSProperties}><Icon name="heart" filled /></span>)}
          {bursts.map((id) => <span className="ls-floating-heart ls-heart-burst" key={`sent-${id}`} style={{ "--heart-index": id % 5 } as CSSProperties} onAnimationEnd={() => setBursts((current) => current.filter((value) => value !== id))}><Icon name="heart" filled /></span>)}
        </div>
      </section>
      <div className="ls-example-caption">
        <div><h2>{example.title}</h2><p>{example.description}</p></div>
        <span className="ls-reaction-feedback" role="status">{sent > 0 ? `♥ ${sent} sent` : ""}</span>
      </div>
    </article>
  );
}

export function LiveStudy() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const previous = document.title;
    document.title = "A little more live — Concept preview | Foam";
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="pc-site ls-page">
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <header className="ls-intro">
          <div><p className="ls-eyebrow">A Foam exploration</p><h1>A little<br /><span>more live.</span></h1></div>
          <div className="ls-intro-copy"><p>A familiar face. An everyday moment. A conversation you want to be part of.</p><p className="ls-intro-secondary">Two ways to bring a creator’s world a little closer.</p><Link to="/creators" className="ls-back-link">Back to the creator story <span aria-hidden="true">↗</span></Link></div>
        </header>
        <div className="ls-study-toolbar">
          <p>Concept preview · AI-generated creators · Simulated activity</p>
          {reducedMotion ? <span className="ls-motion-note">Motion reduced</span> : <button className="ls-activity-toggle" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}><Icon name={paused ? "play" : "pause"} />{paused ? "Play activity" : "Pause activity"}</button>}
        </div>
        <div className="ls-pair">
          {EXAMPLES.map((example) => <LiveCard key={example.platform} example={example} paused={paused} reducedMotion={reducedMotion} />)}
        </div>
        <footer className="ls-outro"><p>The content starts the story.<br /><span>The conversation brings it to life.</span></p><Link to="/">Explore Foam <span aria-hidden="true">↗</span></Link></footer>
      </main>
    </div>
  );
}
