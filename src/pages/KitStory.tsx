import { DEMO_URL } from "../lib/siteLinks";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from "react";
import { Link } from "react-router";
import { AIDisclosure } from "../components/AIDisclosure";
import { KitFeaturedMedia } from "../components/KitFeaturedMedia";
import { KIT_FEATURED_CONTENT } from "../data/kitFeaturedContent";
import { KitShareStatus } from "../components/KitShareStatus";
import { MediaKitLogo } from "../components/MediaKitLogo";
import { ChromeStory } from "./ChromeStory";
import { FoundStory } from "./FoundStory";
import { KitStoryMobile } from "./KitStoryMobile";
import {
  formatWebsiteMetric,
  websiteProfile,
  websiteSamantha,
} from "../data/websiteTalent";

import { KitMetrics, KitGrowth, KitAudience } from "../components/KitAnalytics";
import {
  KitEditHandle,
  KitPlatformIcon,
  KitVerifiedBadge,
} from "../components/KitDetails";
import { LabIcon, type LabIconName } from "../components/TalentLabIcon";
import {
  kitPan,
  kitRevealStarts,
  kitStoryTimeline,
  kitShareCursor,
  kitPlanePose,
  kitFeaturedOpacity,
  KIT_STORY_HEIGHT_VH,
  KIT_CHROME_OVERLAP_VH,
  KIT_JUMP_POINTS,
  type KitPanTargets,
  type KitRevealLayout,
} from "../lib/kitStoryMotion";
import "./kit-story.css";

const A = `${import.meta.env.BASE_URL}assets`;
const CLIP = `${A}/io-portrait-web.mp4`;
const POSTER = `${A}/io-portrait-poster.webp`;
const FG_R = "font-founders font-normal";
const FG_M = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

const icIG = `${A}/20684.svg`;
const icTT = `${A}/8509e.svg`;
const icYT = `${A}/d0b8e.svg`;
const icShare = `${A}/a2840.svg`;
const icFoam = `${A}/fdb3b.svg`;

const CREAM = "#fff6eb";
const BURGUNDY = "#7a0036";

/** The same approved fictional profile used throughout the website examples. */
const STAGE = {
  ...websiteProfile(websiteSamantha),
  kitName: "Samantha-Pikka-haircare'26",
  shareUrl: "https://foam.io/m/samantha-pikka",
};

// Count timing follows the first actual figure; section headers can enter much earlier.
const COUNT_ANCHORS = {
  platforms: "[data-kit-count-anchor]",
  metrics: '.ka-metric-card dd > span[aria-hidden="true"]',
  growth: '.ka-followers > span[aria-hidden="true"]',
  audience: '.ka-percentage > span[aria-hidden="true"]',
};
const PLATFORM_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function KitNav({
  sharePulse,
  onPreview,
  onShare,
  shareRef,
}: {
  sharePulse: boolean;
  onPreview: () => void;
  onShare: () => void;
  shareRef: Ref<HTMLButtonElement>;
}) {
  return (
    <div className="h-12 bg-white border-b border-[#e6e8ec] flex items-center px-3 gap-2 rounded-t-[20px]">
      <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">
        ‹
      </span>
      <p className={`${FG_R} text-[13px] text-[#6a7282] truncate`}>
        Media kits /{" "}
        <span className={`${FG_M} text-[#101828]`}>{STAGE.kitName}</span>
      </p>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Jump to media kit preview"
          onClick={onPreview}
          className="size-8 rounded-full border border-[#e6e8ec] text-[#6a7282] inline-flex items-center justify-center hover:border-[#cfcfcf]"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path d="M3.5 2.2v7.6L10 6 3.5 2.2Z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          ref={shareRef}
          onClick={onShare}
          className={`${FG_M} h-8 rounded-full bg-[#185abc] text-white text-[13px] px-3.5 inline-flex items-center gap-1.5 ${sharePulse ? "ring-4 ring-[#185abc]/25 scale-[0.97]" : ""}`}
        >
          <img alt="" src={icShare} className="size-3 brightness-0 invert" />
          Share
        </button>
      </div>
    </div>
  );
}

function EditorRail() {
  const icons: LabIconName[] = ["people", "explore", "search", "grid", "image"];
  return (
    <div className="ks-rail" aria-hidden="true">
      <span className="ks-rail-item bg-[#1e2939] mb-5">
        <img alt="" src={icFoam} className="size-5 brightness-0 invert" />
      </span>
      {icons.map((icon, index) => (
        <span
          key={icon}
          className={`ks-rail-item ${index === 4 ? "is-active" : ""}`}
        >
          <LabIcon name={icon} size={21} />
        </span>
      ))}
      <span className="ks-rail-item mt-auto text-[10px] rounded-full bg-[#e9ecf1]">
        SP
      </span>
    </div>
  );
}

function EditorSidebar({ collapse }: { collapse: number }) {
  return (
    <aside
      className="ks-sidebar"
      style={{
        width: `calc(clamp(180px, 19vw, 260px) * ${1 - collapse})`,
        opacity: 1 - collapse,
      }}
      aria-label="Media kit editor"
    >
      <div className="ks-sidebar-inner">
        <div className="ks-sidebar-section">
          <p className="ks-sidebar-label">Media kit name</p>
          <p className="ks-sidebar-title">{STAGE.kitName}</p>
        </div>
        <div className="ks-sidebar-section">
          <p className="ks-sidebar-label">Platform analytics</p>
          <div className="ks-platform-buttons">
            {[
              [icIG, "Instagram"],
              [icTT, "TikTok"],
              [icYT, "YouTube"],
            ].map(([src, label]) => (
              <span key={label} className="ks-platform-button">
                <img src={src} alt="" className="size-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="ks-sidebar-section">
          <p className="ks-sidebar-label">Types</p>
          {(
            [
              ["image", "Platform content"],
              ["grid", "Text block"],
              ["play", "Video"],
              ["bookmark", "Brand experience"],
            ] as const
          ).map(([icon, label]) => (
            <div key={label} className="ks-sidebar-type">
              <LabIcon name={icon} size={16} />
              <span>{label}</span>
              <span>+</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function NetworkStats({ stats }: { stats: { val: string; label: string }[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true);
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="bg-[#0a0a0a] text-white px-6 py-28 md:py-36">
      <div className="max-w-[1200px] mx-auto">
        <p
          className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-white/45 mb-14`}
        >
          The network in use
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((s, i) => (
            <div
              key={s.val}
              style={{
                opacity: on ? 1 : 0,
                filter: on ? "blur(0px)" : "blur(18px)",
                transform: on ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 700ms ease ${i * 90}ms, filter 800ms ease ${i * 90}ms, transform 700ms ease ${i * 90}ms`,
              }}
            >
              <p
                className={`${FG_SB} text-[56px] md:text-[72px] tracking-[-2px] leading-none mb-4`}
              >
                {s.val}
              </p>
              <p
                className={`${FG_R} text-[15px] leading-6 text-white/55 max-w-[220px]`}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AfterShare() {
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const halt = paused || hovering;
  const [active, setActive] = useState(0);
  // Crop to each logo's artwork in the 3520 × 1120 sheet, excluding transparent padding.
  const LOGOS = [
    {
      label: "tbh talent",
      x: 277,
      y: 604,
      width: 325,
      height: 192,
      displayWidth: 172,
    },
    {
      label: "The Brand Row",
      x: 1236,
      y: 641,
      width: 168,
      height: 117,
      displayWidth: 160,
    },
    {
      label: "Eleven Eleven Collective",
      x: 1840,
      y: 638,
      width: 720,
      height: 124,
      displayWidth: 200,
    },
    {
      label: "Hiller Media Group",
      x: 2912,
      y: 632,
      width: 335,
      height: 135,
      displayWidth: 172,
    },
    {
      label: "Good Answer",
      x: 117,
      y: 900,
      width: 646,
      height: 160,
      displayWidth: 200,
    },
    {
      label: "Gersh Agency",
      x: 184,
      y: 70,
      width: 512,
      height: 140,
      displayWidth: 180,
    },
    {
      label: "Select Management Group",
      x: 1177,
      y: 44,
      width: 286,
      height: 192,
      displayWidth: 168,
    },
  ];
  const sheet = `${A}/agency-logos.webp`;
  const CARDS = [
    {
      kicker: "I manage talent",
      headline: "Pitch your roster with numbers a brand can believe.",
      cta: "For managers",
      to: "/managers",
    },
    {
      kicker: "I'm a creator",
      headline: "Connect your accounts. Help your manager make the case.",
      cta: "For creators",
      to: "/creators",
    },
    {
      kicker: "I'm a brand or agency",
      headline: "Someone sent you a Foam link. Here's what's behind it.",
      cta: "For brands",
      to: "/brands",
    },
  ];
  const STATS = [
    { val: "1,300+", label: "talent managers active every month" },
    { val: "800+", label: "creator agencies active every month" },
    { val: "~6,000", label: "kits, lists, rosters and embeds shared a week" },
    {
      val: "440,000+",
      label: "brand and agency opens of kits, lists and rosters",
    },
  ];
  return (
    <div className="bg-white" id="after-share">
      <section className="ks-agency-ticker pt-16 pb-6">
        <p className={`${FG_R} text-sm text-[#6a7282] text-center mb-8`}>
          In good company. Across 800+ creator agencies.
        </p>
        <div
          className="overflow-hidden"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div
            className="ks-agency-marquee flex w-max animate-[logoMarquee_90s_linear_infinite]"
            style={{ animationPlayState: halt ? "paused" : "running" }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 gap-12 pr-12"
                aria-hidden={copy === 1 ? true : undefined}
              >
                {LOGOS.map((logo) => {
                  const scale = logo.displayWidth / logo.width;
                  return (
                    <div
                      key={`${copy}-${logo.label}`}
                      className="ks-agency-logo-slot"
                    >
                      <div
                        role="img"
                        aria-label={logo.label}
                        style={{
                          width: logo.displayWidth,
                          height: logo.height * scale,
                          backgroundImage: `url(${sheet})`,
                          backgroundSize: `${3520 * scale}px ${1120 * scale}px`,
                          backgroundPosition: `${-logo.x * scale}px ${-logo.y * scale}px`,
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            className="h-9 px-4 rounded-full border border-[#e8e8e8] text-[13px] text-[#6a7282] inline-flex items-center hover:border-[#cfcfcf]"
          >
            {halt ? "Play" : "Pause"}
          </button>
        </div>
      </section>
      <section className="relative h-[160vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center px-6">
          <div className="max-w-[1200px] mx-auto w-full">
            <p
              className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] text-center mb-3`}
            >
              Start here
            </p>
            <p
              className={`${FG_SB} text-[32px] md:text-[44px] leading-[1.05] tracking-[-1px] text-[#101828] text-center mb-10`}
            >
              Who are you in the deal?
            </p>
            <div
              className="grid md:grid-cols-3 gap-6 md:gap-8 items-center"
              onMouseLeave={() => setActive(0)}
            >
              {CARDS.map((card, i) => {
                const on = active === i;
                return (
                  <Link
                    key={card.to}
                    to={card.to}
                    onMouseEnter={() => setActive(i)}
                    className={`aspect-square rounded-[24px] border p-8 md:p-9 flex flex-col ${on ? "border-[#c6f31e] bg-[#c6f31e] z-10" : "border-[#e8e8e8] bg-white z-0"}`}
                    style={{
                      transform: on ? "scale(1.08)" : "scale(0.92)",
                      transformOrigin: "center",
                      transition:
                        "transform 280ms ease, background-color 220ms ease, border-color 220ms ease",
                    }}
                  >
                    <p
                      className={`${FG_M} text-[11px] uppercase tracking-[0.8px] mb-5 ${on ? "text-[#3d4a08]" : "text-[#6a7282]"}`}
                    >
                      {card.kicker}
                    </p>
                    <p
                      className={`${FG_SB} text-[22px] md:text-[26px] leading-8 tracking-[-0.5px] text-[#101828] flex-1`}
                    >
                      {card.headline}
                    </p>
                    <p
                      className={`${FG_M} text-[15px] mt-auto pt-6 flex items-center justify-between ${on ? "text-[#101828]" : "text-[#6a7282]"}`}
                    >
                      {card.cta}
                      <span>↗</span>
                    </p>
                  </Link>
                );
              })}
            </div>
            <p
              className={`${FG_R} text-[13px] text-[#6a7282] text-center mt-8`}
            >
              Pick a path, or keep scrolling.
            </p>
          </div>
        </div>
      </section>
      <NetworkStats stats={STATS} />
    </div>
  );
}

function KitStoryDesktop() {
  const track = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const well = useRef<HTMLDivElement | null>(null);
  const vid = useRef<HTMLVideoElement | null>(null);
  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const shareButton = useRef<HTMLButtonElement | null>(null);
  const copyButton = useRef<HTMLSpanElement | null>(null);
  const shareCursor = useRef<HTMLDivElement | null>(null);
  const sendoffLogo = useRef<HTMLDivElement | null>(null);
  const paperPlane = useRef<SVGSVGElement | null>(null);
  const [p, setProg] = useState(0);
  const [slot, setSlot] = useState({
    l: 60,
    t: 22,
    w: 30,
    h: 40,
    stageHeight: 720,
    clipTop: 0,
    clipRight: 0,
    clipBottom: 0,
    clipLeft: 0,
  });
  const [targets, setTargets] = useState<KitPanTargets>({
    platforms: 0,
    content: 0,
    metrics: 0,
    growth: 0,
    audience: 0,
  });
  const [revealLayout, setRevealLayout] = useState<KitRevealLayout | null>(
    null,
  );
  const [featuredLayout, setFeaturedLayout] = useState<{
    top: number;
    height: number;
    viewportHeight: number;
  } | null>(null);

  useLayoutEffect(() => {
    const el = track.current;
    const panel = viewport.current;
    const body = content.current;
    if (!el || !panel || !body) return;
    let frame = 0;
    let active = true;
    const measure = () => {
      frame = 0;
      if (!active) return;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      setProg(clamp(-el.getBoundingClientRect().top / total));
      const bodyRect = body.getBoundingClientRect();
      const maxPan = Math.max(0, body.offsetHeight - panel.clientHeight);
      const next = {} as KitPanTargets;
      const nextReveal: KitRevealLayout = {
        viewportHeight: panel.clientHeight,
        platforms: 0,
        metrics: 0,
        growth: 0,
        audience: 0,
      };
      for (const key of [
        "platforms",
        "content",
        "metrics",
        "growth",
        "audience",
      ] as const) {
        const section = body.querySelector<HTMLElement>(
          `[data-kit-section="${key}"]`,
        );
        const rect = section?.getBoundingClientRect();
        if (key !== "content" && rect) {
          const countRect = section
            ?.querySelector<HTMLElement>(COUNT_ANCHORS[key])
            ?.getBoundingClientRect();
          nextReveal[key] = (countRect?.top ?? rect.top) - bodyRect.top;
        }
        next[key] = rect
          ? clamp(
              rect.top -
                bodyRect.top -
                Math.max(18, (panel.clientHeight - rect.height) / 2),
              0,
              maxPan,
            )
          : 0;
      }
      setTargets((previous) =>
        Object.keys(next).every(
          (key) =>
            Math.abs(
              previous[key as keyof KitPanTargets] -
                next[key as keyof KitPanTargets],
            ) < 0.25,
        )
          ? previous
          : next,
      );
      setRevealLayout((previous) =>
        previous &&
        Object.keys(nextReveal).every(
          (key) =>
            Math.abs(
              previous[key as keyof KitRevealLayout] -
                nextReveal[key as keyof KitRevealLayout],
            ) < 0.25,
        )
          ? previous
          : nextReveal,
      );
      const featured = body
        .querySelector<HTMLElement>(".ks-content-grid")
        ?.getBoundingClientRect();
      if (featured) {
        const nextFeatured = {
          top: featured.top - bodyRect.top,
          height: featured.height,
          viewportHeight: panel.clientHeight,
        };
        setFeaturedLayout((previous) =>
          previous &&
          Math.abs(previous.top - nextFeatured.top) < 0.25 &&
          Math.abs(previous.height - nextFeatured.height) < 0.25 &&
          Math.abs(previous.viewportHeight - nextFeatured.viewportHeight) < 0.25
            ? previous
            : nextFeatured,
        );
      }
      const s = stage.current?.getBoundingClientRect();
      const w = well.current?.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      if (s && w && w.width > 8) {
        const nextSlot = {
          l: ((w.left - s.left) / s.width) * 100,
          // Cancel the content translation; apply the current pan during render.
          t: ((w.top - bodyRect.top + panelRect.top - s.top) / s.height) * 100,
          w: (w.width / s.width) * 100,
          h: (w.height / s.height) * 100,
          stageHeight: s.height,
          clipTop: ((panelRect.top - s.top) / s.height) * 100,
          clipRight: ((s.right - panelRect.right) / s.width) * 100,
          clipBottom: ((s.bottom - panelRect.bottom) / s.height) * 100,
          clipLeft: ((panelRect.left - s.left) / s.width) * 100,
        };
        setSlot((previous) =>
          Object.keys(nextSlot).every(
            (key) =>
              Math.abs(
                previous[key as keyof typeof nextSlot] -
                  nextSlot[key as keyof typeof nextSlot],
              ) < 0.02,
          )
            ? previous
            : nextSlot,
        );
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    observer.observe(panel);
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    document.fonts.ready.then(() => {
      if (active) schedule();
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, []);

  const jumpTo = (progress: number) => {
    const el = track.current;
    if (!el) return;
    window.scrollTo({
      top: Math.ceil(
        window.scrollY +
          el.getBoundingClientRect().top +
          progress * (el.offsetHeight - window.innerHeight),
      ),
      behavior: "instant",
    });
  };
  const revealStarts = useMemo(
    () => (revealLayout ? kitRevealStarts(targets, revealLayout) : undefined),
    [targets, revealLayout],
  );
  const timeline = kitStoryTimeline(p, revealStarts);
  const {
    pack,
    aimShare,
    shareOpen,
    generated,
    aimCopy,
    copied,
    shareFade,
    publicize,
    kitOut,
    fold,
    fly,
    planeIn,
    planeEmerge,
    sharedIn,
    sharedOut,
    headlineOpacity: headlineOp,
  } = timeline;
  const pan = kitPan(p, targets);
  const kitIn = clamp((pack - 0.68) / 0.32);
  const landed = pack === 1;
  const sharedOp = sharedIn * (1 - ease(sharedOut));
  const shareModalOp = shareOpen * (1 - shareFade);
  const canvasLight = kitIn > 0.12 || sharedIn > 0 || fold > 0;
  const kitVisible = kitIn > 0.01 && kitOut < 0.98;
  const kitFade = kitIn * (1 - ease(kitOut));

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (landed) v.pause();
    else v.play().catch(() => undefined);
  }, [landed]);

  const photoL = lerp(0, slot.l, pack);
  const photoT = lerp(0, slot.t, pack) - (pan / slot.stageHeight) * 100;
  const photoW = lerp(100, slot.w, pack);
  const photoH = lerp(100, slot.h, pack);
  // Read after this render so the ring uses the current Copy/Copied label and
  // responsive toolbar geometry, with no stale frame on scroll or resize.
  useLayoutEffect(() => {
    const cursor = shareCursor.current;
    const stageRect = stage.current?.getBoundingClientRect();
    const shareRect = shareButton.current?.getBoundingClientRect();
    if (!cursor || !stageRect || !shareRect) return;
    const point = kitShareCursor(
      stageRect,
      shareRect,
      copyButton.current?.getBoundingClientRect() ?? null,
      aimShare,
      aimCopy,
    );
    cursor.style.left = `${point.x}px`;
    cursor.style.top = `${point.y}px`;
  });
  useLayoutEffect(() => {
    const plane = paperPlane.current;
    const stageRect = stage.current?.getBoundingClientRect();
    const logoRect = sendoffLogo.current?.getBoundingClientRect();
    if (!plane || !stageRect || !logoRect) return;
    const pose = kitPlanePose(stageRect, logoRect, planeEmerge, fly);
    plane.style.left = `${pose.x}px`;
    plane.style.top = `${pose.y}px`;
    plane.style.width = `${pose.width}px`;
    plane.style.transform = `translate(-50%, -50%) rotate(${pose.rotation}deg)`;
  });
  const cursorOn = aimShare > 0.02 && shareFade < 0.2;
  const stageBg = canvasLight ? "#eef0f4" : "#000";

  return (
    <div
      className="text-[#101828] overflow-x-clip"
      style={{ background: stageBg }}
    >
      <div className="fixed top-1 left-4 z-[70]">
        <Link
          to="/"
          className={`${FG_M} text-[12px] inline-flex items-center gap-2 rounded-full px-3 h-8 border ${canvasLight ? "text-[#101828] border-[#d8dbe2] bg-white/90" : "text-white/85 border-white/20 bg-black/30"}`}
        >
          ← Foam
        </Link>
      </div>

      <section
        ref={track}
        className="relative"
        style={{ height: `${KIT_STORY_HEIGHT_VH}vh` }}
        data-kit-story-track
      >
        <div
          ref={stage}
          className="sticky top-0 h-screen overflow-clip"
          style={{
            background: stageBg,
            transition: "background-color 420ms ease",
          }}
        >
          {/* Editor + kit canvas */}
          <div
            className="absolute inset-x-3 md:inset-x-4 top-[5.5%] bottom-[4.5%] z-10 rounded-[20px] bg-white border border-[#e2e4e8] overflow-hidden flex flex-col shadow-[0_28px_70px_rgba(16,24,40,0.18)]"
            style={{
              opacity: kitFade,
              pointerEvents: kitVisible ? "auto" : "none",
            }}
            aria-hidden={!kitVisible}
            inert={!kitVisible}
          >
            <div className="h-12 shrink-0" />
            <div className="flex min-h-0 flex-1">
              <EditorRail />
              <EditorSidebar collapse={publicize} />
              <div
                ref={viewport}
                className="relative flex-1 overflow-hidden bg-[#dddddd]"
                data-kit-viewport
              >
                <div
                  ref={content}
                  className="flow-root"
                  style={{
                    transform: `translateY(${-pan}px)`,
                    willChange: "transform",
                  }}
                  data-kit-pan
                >
                  <article
                    className="ks-kit"
                    aria-label="Samantha Pikka example media kit"
                  >
                    <div className="ks-contact-row">
                      <span className="rounded-full border border-[#000]/50 text-[#000] px-5 py-2 text-[13px]">
                        Contact
                      </span>
                    </div>
                    <div className="ks-profile" data-kit-section="profile">
                      <div>
                        <h2 className="ks-profile-name">{STAGE.name}</h2>
                        <p className="ks-profile-details">
                          <LabIcon name="pin" size={15} />
                          <span>{STAGE.loc}</span>
                          <span>{STAGE.age} yo</span>
                          <span>{STAGE.gender}</span>
                        </p>
                        <div
                          className="ks-socials"
                          aria-label="Instagram, TikTok and YouTube"
                        >
                          {(["instagram", "tiktok", "youtube"] as const).map(
                            (network) => (
                              <span key={network}>
                                <KitPlatformIcon
                                  network={network}
                                  label={PLATFORM_LABELS[network]}
                                  size={16}
                                />
                              </span>
                            ),
                          )}
                        </div>
                        <div className="ks-verticals">
                          <small>Verticals</small>
                          <p>{STAGE.verticals}</p>
                        </div>
                      </div>
                      <figure className="ks-portrait">
                        <div ref={well}>
                          <img src={POSTER} alt={`${STAGE.name} portrait`} />
                        </div>
                        <figcaption className="ks-disclosure">
                          <AIDisclosure detail="Fictional creator" />
                        </figcaption>
                      </figure>
                    </div>
                    <section
                      className="ks-platforms"
                      data-kit-section="platforms"
                      data-progress={timeline.platforms}
                      aria-label="Platform audience"
                    >
                      <KitEditHandle />
                      <div className="ks-platform-row">
                        <div className="ks-platform-total">
                          <h3>Platforms</h3>
                          <strong>
                            <span aria-hidden="true" data-kit-count-anchor>
                              {Math.round(
                                websiteSamantha.totalAudience *
                                  timeline.platforms,
                              ).toLocaleString("en-US")}
                            </span>
                            <span className="sr-only">{STAGE.total}</span>
                          </strong>
                          <small>Total audience</small>
                        </div>
                        {websiteSamantha.platforms.map((platform) => (
                          <div
                            className="ks-platform-stat"
                            key={platform.network}
                          >
                            <KitPlatformIcon
                              network={platform.network}
                              label={
                                STAGE.platforms.find(
                                  (item) => item.network === platform.network,
                                )?.label ?? platform.network
                              }
                            />
                            <strong>
                              <span aria-hidden="true">
                                {formatWebsiteMetric(
                                  Math.round(
                                    platform.followers * timeline.platforms,
                                  ),
                                )}
                              </span>
                              <span className="sr-only">
                                {formatWebsiteMetric(platform.followers)}
                              </span>
                              <KitVerifiedBadge />
                            </strong>
                            <small>{platform.handle}</small>
                          </div>
                        ))}
                      </div>
                      <p className="ks-bio">{STAGE.bio}</p>
                    </section>
                    <section
                      className="ks-content"
                      data-kit-section="content"
                      aria-label="Featured content"
                    >
                      <div className="ks-section-heading">
                        <h3>Featured content</h3>
                        <small>Demo figures</small>
                      </div>
                      <div className="ks-content-grid">
                        {KIT_FEATURED_CONTENT.map((tile) => (
                          <figure
                            key={tile.thumb}
                            style={{
                              opacity: kitFeaturedOpacity(pan, featuredLayout),
                            }}
                          >
                            <KitFeaturedMedia
                              tile={tile}
                              alt={`${STAGE.name}: ${tile.caption}`}
                              className="ks-content-image"
                            />
                            <figcaption className="ks-disclosure">
                              <AIDisclosure />
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </section>
                    <div className="ks-analytics">
                      <KitMetrics progress={timeline.metrics} />
                      <KitGrowth progress={timeline.growth} />
                      <KitAudience progress={timeline.audience} />
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>

          {/* One video shrinks into the right-hand portrait and stays frozen there. */}
          <div
            className="absolute inset-0 z-[22] pointer-events-none"
            aria-hidden="true"
            style={{
              clipPath: landed
                ? `inset(${slot.clipTop}% ${slot.clipRight}% ${slot.clipBottom}% ${slot.clipLeft}%)`
                : undefined,
            }}
          >
            <div
              data-kit-portrait-video
              className="absolute overflow-hidden bg-black"
              style={{
                left: `${photoL}%`,
                top: `${photoT}%`,
                width: `${photoW}%`,
                height: `${photoH}%`,
                borderRadius: `${lerp(0, 17, pack)}px`,
                opacity: 1 - ease(kitOut),
              }}
            >
              <video
                ref={vid}
                className="size-full object-cover object-[center_20%]"
                src={CLIP}
                poster={POSTER}
                muted
                loop
                playsInline
              />
            </div>
          </div>

          {/* Mask so sticky nav sits cleanly above the kit */}
          {kitFade > 0 && (
            <div
              className="absolute inset-x-0 top-0 z-[25] h-[calc(5.5%+48px)] pointer-events-none"
              style={{ opacity: kitFade, background: stageBg }}
            />
          )}
          {kitFade > 0 && (
            <div
              className="absolute inset-x-3 md:inset-x-4 top-[5.5%] z-30"
              aria-hidden={!kitVisible}
              inert={!kitVisible}
              style={{
                opacity: kitFade,
                pointerEvents: kitVisible ? "auto" : "none",
              }}
            >
              <KitNav
                sharePulse={aimShare > 0.55 && shareOpen < 0.35}
                onPreview={() => jumpTo(KIT_JUMP_POINTS.profile)}
                onShare={() => jumpTo(KIT_JUMP_POINTS.share)}
                shareRef={shareButton}
              />
            </div>
          )}

          {/* Truth-layer hero copy */}
          <div
            className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-16 pointer-events-none"
            aria-hidden={headlineOp < 0.02}
            inert={headlineOp < 0.02}
            style={{ opacity: headlineOp }}
          >
            <p
              className={`${FG_M} text-[11px] uppercase tracking-[2px] text-white/70 mb-6`}
            >
              The truth layer
            </p>
            <h1 className={`${FG_SB} ks-hero-title text-white`}>
              <span>Numbers that</span> <span>everyone in the</span>{" "}
              <span>deal can trust</span>
            </h1>
            <p
              className={`${FG_R} mt-6 max-w-[34em] text-[17px] md:text-[19px] leading-7 text-white/85`}
            >
              Creators connect their data at source. Managers pitch with it.
              Brands decide on it. No screenshots, no guesswork, no "let me
              check and get back to you."
            </p>
            <div className="mt-10 flex items-center gap-6 flex-wrap pointer-events-auto">
              <a
                href={DEMO_URL}
                className={`${FG_SB} text-[#101828] text-[16px] px-8 h-14 rounded-full inline-flex items-center gap-2`}
                style={{ background: "#c6f31e" }}
              >
                Get a demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 12L12 2M12 2H5M12 2V9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => jumpTo(KIT_JUMP_POINTS.profile)}
                className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/40 pb-[2px]`}
              >
                Follow a pitch
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 2V10M6 10L2 6M6 10L10 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-5 text-[12px] text-white/60">
              Scroll to explore. Scroll back to rewind.
            </p>
          </div>

          {/* Share modal */}
          <div
            className="absolute inset-0 z-30 pointer-events-none bg-black/20"
            style={{ opacity: shareModalOp }}
          />
          <div
            className="absolute z-40 left-1/2 top-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)]"
            aria-hidden={shareModalOp < 0.02}
            inert={shareModalOp < 0.02}
            style={{
              opacity: shareModalOp,
              transform: "translate(-50%,-50%)",
              pointerEvents: shareModalOp > 0.02 ? "auto" : "none",
            }}
          >
            <div className="px-5 py-3 border-b border-[#eeefef] flex justify-between">
              <p className={`${FG_M} text-[16px]`}>Share</p>
              <button
                type="button"
                aria-label="Close share preview"
                onClick={() => jumpTo(KIT_JUMP_POINTS.audience)}
                className="text-[#6a7282] size-6 rounded-full hover:bg-[#f2f4f7]"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <p className={`${FG_R} text-[13px] mb-4`}>{STAGE.kitName}</p>
              {generated < 0.4 ? (
                <div
                  className={`${FG_R} h-11 rounded-full border border-[#d0d5dd] flex items-center justify-center text-[13px]`}
                >
                  Generate share link
                </div>
              ) : (
                <div
                  className={`h-11 rounded-full border flex items-center px-3 gap-2 ${copied > 0.35 ? "border-[#185abc]" : "border-[#d0d5dd]"}`}
                  style={{ opacity: 0.6 + generated * 0.4 }}
                >
                  <span className={`${FG_R} text-[12px] truncate flex-1`}>
                    {STAGE.shareUrl}
                  </span>
                  <span
                    ref={copyButton}
                    className={`${FG_M} min-w-[80px] inline-flex justify-center text-[12px] rounded-full px-3 py-1 ${copied > 0.35 ? "bg-[#185abc] text-white" : "border border-[#d0d5dd]"}`}
                  >
                    {copied > 0.35 ? "Copied" : "Copy link"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            ref={shareCursor}
            aria-hidden="true"
            data-kit-share-cursor
            className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#2674ff] bg-[#2674ff]/10 -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: cursorOn ? 1 : 0,
              scale: 1 + Math.sin(copied * Math.PI) * 0.16,
            }}
          />

          {/* Separate layers let the plane emerge behind the opaque parts of the logo. */}
          <div
            className="pointer-events-none absolute inset-0 z-40 bg-[#eef0f4]"
            aria-hidden="true"
            style={{ opacity: sharedOp }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[42] flex flex-col items-center justify-center px-6 text-center"
            aria-hidden={sharedOp < 0.02}
            style={{
              opacity: sharedOp,
              transform: `translateY(${(1 - sharedIn) * 14}px)`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div
                ref={sendoffLogo}
                className="ks-sendoff-logo"
                data-kit-sendoff-logo
              >
                <MediaKitLogo className="w-full" />
              </div>
              <p
                className={`${FG_SB} text-[#101828] text-[72px] md:text-[96px] leading-none tracking-[-3px]`}
              >
                Media Kit
              </p>
              <p className={`${FG_R} mt-4 text-[18px] text-[#6a7282]`}>
                <KitShareStatus />
              </p>
            </div>
          </div>

          <svg
            ref={paperPlane}
            viewBox="0 0 120 72"
            aria-hidden="true"
            data-kit-paper-plane
            className="absolute z-[41] pointer-events-none drop-shadow-[0_16px_28px_rgba(16,24,40,0.28)]"
            style={{ opacity: planeIn }}
          >
            <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill={BURGUNDY} />
            <path d="M44 40 L114 6 L60 40 Z" fill={CREAM} />
          </svg>
        </div>
      </section>

      <div
        className="ks-chrome-handoff"
        data-kit-chrome-handoff
        style={{
          marginTop: `-${KIT_CHROME_OVERLAP_VH}vh`,
          opacity: timeline.chromeIn,
          pointerEvents: timeline.chromeIn === 1 ? "auto" : "none",
        }}
        inert={timeline.chromeIn < 1}
        aria-hidden={timeline.chromeIn < 1}
      >
        <ChromeStory embedded />
      </div>
      <AfterShare />
      <FoundStory />
    </div>
  );
}

const DESKTOP_KIT_QUERY = "(min-width: 1024px) and (min-height: 600px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeKitLayout(onChange: () => void) {
  const queries = [DESKTOP_KIT_QUERY, REDUCED_MOTION_QUERY].map((query) =>
    window.matchMedia(query),
  );
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () =>
    queries.forEach((query) => query.removeEventListener("change", onChange));
}

function desktopKitSnapshot() {
  return (
    window.matchMedia(DESKTOP_KIT_QUERY).matches &&
    !window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/** Resolve layout on the first client render so browser scroll restoration has a full-height page. */
export function KitStory() {
  const isDesktop = useSyncExternalStore(
    subscribeKitLayout,
    desktopKitSnapshot,
    () => false,
  );
  return isDesktop ? <KitStoryDesktop /> : <KitStoryMobile />;
}
