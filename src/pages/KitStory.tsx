import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { ChromeStory } from "./ChromeStory";
import { KitStoryMobile } from "./KitStoryMobile";
import {
  formatWebsiteMetric,
  websiteContentStats,
  websiteProfile,
  websiteSamantha,
} from "../data/websiteTalent";

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
const icNavHome = `${A}/db233.svg`;
const icNavSearch = `${A}/5630d.svg`;
const icNavLists = `${A}/26407.svg`;
const icNavWatch = `${A}/5c880.svg`;
const icNavChat = `${A}/4f583.svg`;

const CREAM = "#F4E6C8";
const BURGUNDY = "#7a0036";

/** The same approved fictional profile used throughout the website examples. */
const STAGE = {
  ...websiteProfile(websiteSamantha),
  kitName: "Samantha-Pikka-haircare'26",
  shareUrl: "https://foam.io/m/samantha-pikka",
};

const TILES = websiteSamantha.content.slice(0, 4).map((tile, index) => ({
  ...tile,
  h: [340, 248, 320, 236][index],
}));
const CONTENT_STATS = websiteContentStats(TILES);
const PLATFORM_LABELS = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function range(p: number, a: number, b: number) {
  return clamp((p - a) / (b - a));
}
function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function KitNav({ sharePulse }: { sharePulse: boolean }) {
  return (
    <div className="h-12 bg-white border-b border-[#e6e8ec] flex items-center px-3 gap-2 rounded-t-[20px]">
      <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
      <p className={`${FG_R} text-[13px] text-[#6a7282] truncate`}>
        Media kits / <span className={`${FG_M} text-[#101828]`}>{STAGE.kitName}</span>
      </p>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Preview"
          className="size-8 rounded-full border border-[#e6e8ec] text-[#6a7282] inline-flex items-center justify-center hover:border-[#cfcfcf]"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3.5 2.2v7.6L10 6 3.5 2.2Z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className={`${FG_M} h-8 rounded-full bg-[#185abc] text-white text-[13px] px-3.5 inline-flex items-center gap-1.5 ${sharePulse ? "ring-4 ring-[#185abc]/25 scale-[0.97]" : ""}`}
          style={{ transition: "box-shadow 220ms ease, transform 220ms ease" }}
        >
          <img alt="" src={icShare} className="size-3 brightness-0 invert" />
          Share
        </button>
      </div>
    </div>
  );
}

function EditorRail() {
  const items = [
    { src: icFoam, active: false, invert: true },
    { src: icNavHome, active: false },
    { src: icNavSearch, active: false },
    { src: icNavWatch, active: false },
    { src: icNavLists, active: false },
    { src: icNavChat, active: true },
  ];
  return (
    <div className="w-12 shrink-0 bg-[#1e1f24] flex flex-col items-center py-3 gap-1">
      {items.map((it, i) => (
        <div
          key={it.src + i}
          className={`size-8 rounded-[10px] flex items-center justify-center ${it.active ? "bg-[#185abc]" : "bg-transparent"}`}
        >
          <img
            alt=""
            src={it.src}
            className={`size-3.5 ${it.invert || it.active ? "brightness-0 invert" : "opacity-70 invert"}`}
          />
        </div>
      ))}
      <div className="mt-auto flex flex-col items-center gap-2 pb-1">
        <img alt="" src={icNavChat} className="size-3.5 opacity-60 invert" />
        <div className="size-7 rounded-full bg-[#3a3b42] text-[10px] text-white/80 inline-flex items-center justify-center">SP</div>
      </div>
    </div>
  );
}

function EditorSidebar({ collapse }: { collapse: number }) {
  return (
    <aside
      className="shrink-0 bg-white border-r border-[#e6e8ec] overflow-hidden"
      style={{ width: `${lerp(220, 0, collapse)}px`, opacity: 1 - collapse }}
    >
      <div className="p-4 w-[220px]">
        <p className={`${FG_R} text-[11px] text-[#6a7282] mb-1`}>Media kit name</p>
        <p className={`${FG_M} text-[14px] text-[#101828] mb-4 truncate`}>{STAGE.kitName}</p>
        <p className={`${FG_R} text-[11px] text-[#6a7282] mb-2`}>Platform analytics</p>
        <div className="flex gap-2 mb-4">
          {[
            { src: icIG, on: true },
            { src: icTT, on: true },
            { src: icYT, on: true },
          ].map((p) => (
            <div
              key={p.src}
              className={`h-9 flex-1 rounded-[10px] border flex items-center justify-center ${p.on ? "bg-[#e8eefc] border-[#c5d4f5]" : "bg-[#f4f5f7] border-[#eeefef]"}`}
            >
              <img alt="" src={p.src} className="size-4" />
            </div>
          ))}
        </div>
        <p className={`${FG_R} text-[11px] text-[#6a7282] mb-2`}>Types</p>
        {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
          <div
            key={x}
            className={`${FG_R} rounded-xl bg-[#f4f5f7] h-9 mb-2 flex items-center justify-between px-3 text-[11px] text-[#4a5565]`}
          >
            {x}
            <span className="text-[#99a1af]">+</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Plat({ label, val, handle, icon }: { label: string; val: string; handle: string; icon?: string }) {
  return (
    <div className="min-w-[88px]">
      <div className="flex items-center gap-1.5 mb-1">
        {icon ? <img alt="" src={icon} className="size-3.5 brightness-0 invert opacity-80" /> : null}
        <p className="text-[11px] opacity-70">{label}</p>
      </div>
      <p className="text-[24px] font-semibold leading-none">{val}</p>
      {handle ? <p className="text-[11px] opacity-70 mt-1">{handle}</p> : null}
    </div>
  );
}

function NetworkStats({ stats }: { stats: { val: string; label: string }[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.28 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="bg-[#0a0a0a] text-white px-6 py-28 md:py-36">
      <div className="max-w-[1200px] mx-auto">
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-white/45 mb-14`}>The network in use</p>
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
              <p className={`${FG_SB} text-[56px] md:text-[72px] tracking-[-2px] leading-none mb-4`}>{s.val}</p>
              <p className={`${FG_R} text-[15px] leading-6 text-white/55 max-w-[220px]`}>{s.label}</p>
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
  const LOGOS = [
    ["tbh talent", "0% 66.6667%"],
    ["The Brand Row", "33.3333% 66.6667%"],
    ["Eleven Eleven Collective", "66.6667% 66.6667%"],
    ["Hiller Media Group", "100% 66.6667%"],
    ["Good Answer", "0% 100%"],
    ["Gersh Agency", "0% 0%"],
    ["Select Management Group", "33.3333% 0%"],
  ];
  const sheet = `${A}/agency-logos.png`;
  const CARDS = [
    { kicker: "I manage talent", headline: "Pitch your roster with numbers a brand can believe.", cta: "For managers", to: "/managers" },
    { kicker: "I'm a creator", headline: "Connect your accounts. Help your manager make the case.", cta: "For creators", to: "/creators" },
    { kicker: "I'm a brand or agency", headline: "Someone sent you a Foam link. Here's what's behind it.", cta: "For brands", to: "/brands" },
  ];
  const STATS = [
    { val: "1,300+", label: "talent managers active every month" },
    { val: "800+", label: "creator agencies active every month" },
    { val: "~6,000", label: "kits, lists, rosters and embeds shared a week" },
    { val: "440,000+", label: "brand and agency opens of kits, lists and rosters" },
  ];
  return (
    <div className="bg-white" id="after-share">
      <section className="pt-16 pb-6">
        <p className={`${FG_R} text-sm text-[#6a7282] text-center mb-8`}>In good company. Across 800+ creator agencies.</p>
        <div className="overflow-hidden" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
          <div className="flex w-max animate-[logoMarquee_90s_linear_infinite]" style={{ animationPlayState: halt ? "paused" : "running" }}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 gap-10 pr-10">
                {LOGOS.map(([label, pos]) => (
                  <div key={`${copy}-${label}`} role="img" aria-label={label} className="w-52 h-16 shrink-0" style={{ backgroundImage: `url(${sheet})`, backgroundSize: "400% 400%", backgroundPosition: pos }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button type="button" onClick={() => setPaused((v) => !v)} className="h-9 px-4 rounded-full border border-[#e8e8e8] text-[13px] text-[#6a7282] inline-flex items-center hover:border-[#cfcfcf]">
            {halt ? "Play" : "Pause"}
          </button>
        </div>
      </section>
      <section className="relative h-[160vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center px-6">
          <div className="max-w-[1200px] mx-auto w-full">
            <p className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] text-center mb-3`}>Start here</p>
            <p className={`${FG_SB} text-[32px] md:text-[44px] leading-[1.05] tracking-[-1px] text-[#101828] text-center mb-10`}>Who are you in the deal?</p>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-center" onMouseLeave={() => setActive(0)}>
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
                      transition: "transform 280ms ease, background-color 220ms ease, border-color 220ms ease",
                    }}
                  >
                    <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] mb-5 ${on ? "text-[#3d4a08]" : "text-[#6a7282]"}`}>{card.kicker}</p>
                    <p className={`${FG_SB} text-[22px] md:text-[26px] leading-8 tracking-[-0.5px] text-[#101828] flex-1`}>{card.headline}</p>
                    <p className={`${FG_M} text-[15px] mt-auto pt-6 flex items-center justify-between ${on ? "text-[#101828]" : "text-[#6a7282]"}`}>{card.cta}<span>↗</span></p>
                  </Link>
                );
              })}
            </div>
            <p className={`${FG_R} text-[13px] text-[#6a7282] text-center mt-8`}>Pick a path, or keep scrolling.</p>
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
  const [p, setProg] = useState(0);
  const [slot, setSlot] = useState({ l: 8, t: 18, w: 32, h: 36 });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      setProg(passed / Math.max(total, 1));
      const s = stage.current?.getBoundingClientRect();
      const w = well.current?.getBoundingClientRect();
      if (s && w && w.width > 8) {
        setSlot({
          l: ((w.left - s.left) / s.width) * 100,
          t: ((w.top - s.top) / s.height) * 100,
          w: (w.width / s.width) * 100,
          h: (w.height / s.height) * 100,
        });
      }
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const pack = ease(range(p, 0.02, 0.20));
  const kitIn = clamp((pack - 0.68) / 0.32);
  const landed = pack >= 0.995;
  const read = range(p, 0.20, 0.64);
  const aimShare = range(p, 0.66, 0.72);
  const shareOpen = range(p, 0.72, 0.78);
  const generated = range(p, 0.78, 0.82);
  const aimCopy = range(p, 0.82, 0.86);
  const copied = range(p, 0.86, 0.90);
  const shareFade = range(p, 0.90, 0.93);
  const publicize = range(p, 0.90, 0.93);
  const kitOut = range(p, 0.91, 0.94);
  const fold = range(p, 0.93, 0.97);
  const fly = range(p, 0.95, 1);
  const sharedIn = ease(range(p, 0.925, 0.95));
  const sharedOut = range(p, 0.975, 1);
  const sharedOp = sharedIn * (1 - ease(sharedOut));
  const shareModalOp = shareOpen * (1 - shareFade);
  const headlineOp = 1 - range(p, 0.02, 0.14);
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
  const photoT = lerp(0, slot.t, pack);
  const photoW = lerp(100, slot.w, pack);
  const photoH = lerp(100, slot.h, pack);
  const cursorL = aimCopy > 0 ? lerp(93.6, 61.5, aimCopy) : lerp(70, 93.6, aimShare);
  const cursorT = aimCopy > 0 ? lerp(8.4, 54, aimCopy) : lerp(28, 8.4, aimShare);
  const cursorOn = aimShare > 0.02 && shareFade < 0.2;
  const stageBg = canvasLight ? "#eef0f4" : "#000";

  return (
    <div className="text-[#101828]" style={{ background: stageBg }}>
      <div className="fixed top-4 left-4 z-[70]">
        <Link
          to="/"
          className={`${FG_M} text-[12px] inline-flex items-center gap-2 rounded-full px-3 h-8 border ${canvasLight ? "text-[#101828] border-[#d8dbe2] bg-white/90" : "text-white/85 border-white/20 bg-black/30"}`}
        >
          ← Foam
        </Link>
      </div>

      <section ref={track} className="relative h-[400vh]">
        <div ref={stage} className="sticky top-0 h-screen overflow-hidden" style={{ background: stageBg, transition: "background-color 420ms ease" }}>
          {/* Editor + kit canvas */}
          <div
            className="absolute inset-x-3 md:inset-x-4 top-[5.5%] bottom-[4.5%] z-10 rounded-[20px] bg-white border border-[#e2e4e8] overflow-hidden flex flex-col shadow-[0_28px_70px_rgba(16,24,40,0.18)]"
            style={{ opacity: kitFade, pointerEvents: kitVisible ? "auto" : "none" }}
          >
            <div className="h-12 shrink-0" />
            <div className="flex min-h-0 flex-1">
              <EditorRail />
              <EditorSidebar collapse={publicize} />
              <div className="relative flex-1 overflow-hidden bg-[#e8ebe4]">
                <div style={{ transform: `translateY(${-read * 58}%)` }}>
                  <div className="m-3 md:m-5 rounded-[18px] overflow-hidden" style={{ background: CREAM }}>
                    {/* Hero */}
                    <div className="px-6 pt-5 pb-8 md:px-9 md:pt-6 md:pb-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="size-8 rounded-[6px] bg-[#101828] flex items-center justify-center">
                          <img alt="" src={icFoam} className="size-3.5 brightness-0 invert" />
                        </div>
                        <span
                          className={`${FG_M} rounded-full px-4 py-1.5 text-[13px] border`}
                          style={{ borderColor: "rgba(122,0,54,0.4)", color: BURGUNDY }}
                        >
                          Contact
                        </span>
                      </div>
                      <div className="flex gap-7 md:gap-10 items-start">
                        <figure className="w-[42%] shrink-0 rounded-[16px] overflow-hidden bg-white">
                          <div ref={well} className="bg-[#ead9b8] aspect-square">
                            <img src={STAGE.portrait} alt={`${STAGE.name} portrait`} className="size-full object-cover object-top" />
                          </div>
                          <figcaption className={`${FG_R} bg-white text-[#6a7282] text-[10px] px-3 py-1.5`}>Made with AI · Fictional creator</figcaption>
                        </figure>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className={`${FG_SB} leading-[0.95] tracking-[-1.2px] mb-4`} style={{ color: BURGUNDY, fontSize: "clamp(34px, 5vw, 52px)" }}>
                            {STAGE.name}
                          </p>
                          <p className={`${FG_R} text-[#101828] text-[14px] md:text-[15px] mb-5`}>
                            {STAGE.loc}&nbsp;&nbsp;|&nbsp;&nbsp;{STAGE.age} yo&nbsp;&nbsp;|&nbsp;&nbsp;{STAGE.gender}
                          </p>
                          <div className="flex gap-2.5 mb-5">
                            {[icIG, icTT, icYT].map((src) => (
                              <span
                                key={src}
                                className="size-10 rounded-full border inline-flex items-center justify-center"
                                style={{ borderColor: "rgba(122,0,54,0.35)", background: "rgba(122,0,54,0.08)" }}
                              >
                                <img alt="" src={src} className="size-4" />
                              </span>
                            ))}
                          </div>
                          <div className="inline-flex flex-col rounded-2xl px-5 py-3.5" style={{ background: "rgba(122,0,54,0.10)", color: BURGUNDY }}>
                            <span className={`${FG_R} text-[12px] opacity-70 mb-1`}>Verticals</span>
                            <span className={`${FG_M} text-[15px]`}>{STAGE.verticals}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="px-6 md:px-8 py-8" style={{ background: BURGUNDY, color: CREAM }}>
                      <div className="flex items-end justify-between gap-8 flex-wrap mb-8">
                        <div>
                          <p className={`${FG_SB} text-[22px]`}>Platforms</p>
                          <p className={`${FG_SB} text-[36px] leading-none mt-1`}>{STAGE.total}</p>
                          <p className={`${FG_R} text-[12px] opacity-70 mt-1`}>Total audience</p>
                        </div>
                        <div className="flex gap-6 md:gap-8">
                          <Plat label="Instagram" val={STAGE.ig.n} handle={STAGE.ig.h} icon={icIG} />
                          <Plat label="TikTok" val={STAGE.tt.n} handle={STAGE.tt.h} icon={icTT} />
                          <Plat label="YouTube" val={STAGE.yt.n} handle={STAGE.yt.h} icon={icYT} />
                          <Plat label="LinkedIn" val={STAGE.li.n} handle={STAGE.li.h} icon="" />
                        </div>
                      </div>
                      <p className={`${FG_R} text-[15px] md:text-[16px] leading-7 max-w-[820px]`}>{STAGE.bio}</p>
                    </div>

                    {/* Content tiles */}
                    <div className="px-6 md:px-8 py-6" style={{ background: CREAM }}>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <p className={`${FG_SB} text-[16px]`}>Featured content</p>
                        <span className={`${FG_R} text-[11px] text-[#6a7282]`}>Demo figures</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 items-start">
                        {TILES.map((tile) => (
                          <figure key={tile.thumb} className="rounded-[14px] overflow-hidden bg-white">
                            <div className="relative bg-[#ead9b8]" style={{ height: tile.h }}>
                              <img src={tile.thumb} alt={`${STAGE.name}: ${tile.caption}`} loading="lazy" className="size-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 px-2.5 py-2 text-white flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent">
                                <span className={`${FG_M} text-[11px]`}>{tile.views !== undefined ? `${formatWebsiteMetric(tile.views)} views` : "New content"}</span>
                                <span className={`${FG_R} text-[9px]`}>{PLATFORM_LABELS[tile.platform]}</span>
                              </div>
                            </div>
                            <figcaption className={`${FG_R} bg-white text-[#6a7282] text-[10px] px-2.5 py-1.5`}>Made with AI</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>

                    {/* Analytics receipt */}
                    <div className="px-6 md:px-8 pb-10" style={{ background: CREAM }}>
                      <div className="rounded-[16px] bg-[#f7efe0] border border-[#ead9b8] p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <img alt="" src={icIG} className="size-4" />
                            <div>
                              <p className={`${FG_SB} text-[16px]`}>Instagram</p>
                              <p className={`${FG_R} text-[12px] text-[#6a7282]`}>{STAGE.ig.h}</p>
                            </div>
                          </div>
                          <p className={`${FG_R} text-[12px]`} style={{ color: BURGUNDY }}>Featured posts · Demo data</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {CONTENT_STATS.map(([val, lab]) => (
                            <div key={lab} className="rounded-[12px] bg-white/70 px-4 py-3">
                              <p className={`${FG_SB} text-[22px] leading-none mb-1`}>{val}</p>
                              <p className={`${FG_R} text-[12px] text-[#6a7282]`}>{lab}</p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-[12px] bg-white/70 px-4 py-4 mb-3">
                          <p className={`${FG_R} text-[12px] text-[#6a7282] mb-1`}>Total followers</p>
                          <p className={`${FG_SB} text-[28px] leading-none mb-1`}>{STAGE.ig.n}</p>
                          <p className={`${FG_R} text-[12px] mb-4`} style={{ color: BURGUNDY }}>Illustrative account trend</p>
                          <svg viewBox="0 0 320 72" className="w-full h-16" aria-hidden>
                            <polyline fill="none" stroke={BURGUNDY} strokeWidth="2.4" points="4,64 32,60 60,58 88,54 116,50 144,46 172,38 200,34 228,36 256,30 284,24 316,18" />
                            <circle cx="316" cy="18" r="3.5" fill={BURGUNDY} />
                          </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-[12px] bg-white/70 px-4 py-4">
                            <p className={`${FG_M} text-[13px] mb-3`}>Example age distribution</p>
                            {[["13-17", "14%"], ["18-24", "20%"], ["25-34", "20%"]].map(([lab, val]) => (
                              <div key={lab} className="flex items-center gap-2 text-[12px] mb-2">
                                <span className="w-10 text-[#6a7282]">{lab}</span>
                                <span className="h-2 rounded-full" style={{ width: val, background: BURGUNDY }} />
                                <span>{val}</span>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-[12px] bg-white/70 px-4 py-4">
                            <p className={`${FG_M} text-[13px] mb-3`}>Example gender distribution</p>
                            <div className="flex items-center gap-2 text-[12px]">
                              <span className="w-14 text-[#6a7282]">Female</span>
                              <span className="h-2 rounded-full w-[60%]" style={{ background: BURGUNDY }} />
                              <span>60%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portrait packing into the well */}
          {fold < 0.85 && (
            <div
              className="absolute z-[22] overflow-hidden bg-black pointer-events-none"
              style={{
                left: `${photoL}%`,
                top: `${photoT}%`,
                width: `${photoW}%`,
                height: `${photoH}%`,
                borderRadius: `${lerp(0, 14, pack)}px`,
                opacity: (1 - ease(fold) * 0.9) * (1 - ease(range(pack, 0.94, 1))),
              }}
            >
              <video ref={vid} className="size-full object-cover object-[center_20%]" src={CLIP} poster={POSTER} muted loop playsInline autoPlay />
            </div>
          )}

          {/* Mask so sticky nav sits cleanly above the kit */}
          {kitFade > 0 && (
            <div className="absolute inset-x-0 top-0 z-[25] h-[calc(5.5%+48px)] pointer-events-none" style={{ opacity: kitFade, background: stageBg }} />
          )}
          {kitFade > 0 && (
            <div className="absolute inset-x-3 md:inset-x-4 top-[5.5%] z-30 pointer-events-none" style={{ opacity: kitFade }}>
              <KitNav sharePulse={aimShare > 0.55 && shareOpen < 0.35} />
            </div>
          )}

          {/* Truth-layer hero copy */}
          <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-16 pointer-events-none" style={{ opacity: headlineOp }}>
            <p className={`${FG_M} text-[11px] uppercase tracking-[2px] text-white/70 mb-6`}>The truth layer</p>
            <h1 className={`${FG_SB} text-white leading-[0.92] tracking-[-2.5px] max-w-[13ch]`} style={{ fontSize: "clamp(52px, 8vw, 96px)" }}>
              Numbers everyone in the deal can trust.
            </h1>
            <p className={`${FG_R} mt-6 max-w-[34em] text-[17px] md:text-[19px] leading-7 text-white/85`}>
              Creators connect their data at source. Managers pitch with it. Brands decide on it. No screenshots, no guesswork, no "let me check and get back to you."
            </p>
            <div className="mt-10 flex items-center gap-6 flex-wrap pointer-events-auto">
              <Link to="/demo" className={`${FG_SB} text-[#101828] text-[16px] px-8 h-14 rounded-full inline-flex items-center gap-2`} style={{ background: "#c6f31e" }}>
                Get a demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </Link>
              <a href="#after-share" className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/40 pb-[2px]`}>
                Follow a pitch
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </a>
            </div>
          </div>

          {/* Share modal */}
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/20" style={{ opacity: shareModalOp }} />
          <div
            className="absolute z-40 left-1/2 top-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)]"
            style={{ opacity: shareModalOp, transform: "translate(-50%,-50%)" }}
          >
            <div className="px-5 py-3 border-b border-[#eeefef] flex justify-between">
              <p className={`${FG_M} text-[16px]`}>Share</p>
              <span className="text-[#6a7282]">×</span>
            </div>
            <div className="p-5">
              <p className={`${FG_R} text-[13px] mb-4`}>{STAGE.kitName}</p>
              {generated < 0.4 ? (
                <div className={`${FG_R} h-11 rounded-full border border-[#d0d5dd] flex items-center justify-center text-[13px]`}>Generate share link</div>
              ) : (
                <div className={`h-11 rounded-full border flex items-center px-3 gap-2 ${copied > 0.35 ? "border-[#185abc]" : "border-[#d0d5dd]"}`}>
                  <span className={`${FG_R} text-[12px] truncate flex-1`}>{STAGE.shareUrl}</span>
                  <span className={`${FG_M} text-[12px] rounded-full px-3 py-1 ${copied > 0.35 ? "bg-[#185abc] text-white" : "border border-[#d0d5dd]"}`}>
                    {copied > 0.35 ? "Copied" : "Copy link"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: cursorOn ? 1 : 0, left: `${cursorL}%`, top: `${cursorT}%` }}
          />

          {/* Finished share climax: what you see is what they get */}
          <div
            className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6"
            style={{
              opacity: sharedOp,
              transform: `translateY(${(1 - sharedIn) * 14}px)`,
            }}
          >
            <div className="absolute inset-0" style={{ background: "#eef0f4" }} />
            <div className="relative flex flex-col items-center">
              <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>Shared</p>
              <p className={`${FG_SB} text-[#101828] text-[42px] md:text-[64px] leading-[0.98] tracking-[-2px] text-center max-w-[14ch]`}>
                What you see is what they get.
              </p>
              <p className={`${FG_R} mt-4 text-[16px] md:text-[18px] text-[#6a7282] text-center max-w-[28em]`}>
                Link copied. Same kit. Same connected numbers. Ready for the inbox.
              </p>
              <div
                className="mt-8 w-[min(360px,90vw)] rounded-[18px] overflow-hidden border border-[#ead9b8] shadow-[0_18px_50px_rgba(16,24,40,0.14)]"
                style={{ background: CREAM }}
              >
                <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                  <div className="size-12 rounded-[10px] overflow-hidden bg-[#ead9b8] shrink-0">
                    <img src={STAGE.portrait} alt={`${STAGE.name} portrait`} className="size-full object-cover object-top" />
                  </div>
                  <div className="min-w-0">
                    <p className={`${FG_SB} text-[16px]`} style={{ color: BURGUNDY }}>{STAGE.name}</p>
                    <p className={`${FG_R} text-[12px] text-[#6a7282]`}>{STAGE.totalShort} total audience</p>
                  </div>
                </div>
                <p className={`${FG_R} bg-white px-4 py-1.5 text-[10px] text-[#6a7282]`}>Made with AI · Demo profile</p>
                <div className="px-4 py-3 flex items-center justify-between" style={{ background: BURGUNDY, color: CREAM }}>
                  <span className={`${FG_R} text-[12px] truncate`}>{STAGE.shareUrl.replace("https://", "")}</span>
                  <span className={`${FG_M} text-[11px] rounded-full bg-white/15 px-2.5 py-1`}>Sent</span>
                </div>
              </div>
            </div>
          </div>

          <svg
            viewBox="0 0 120 72"
            className="absolute z-[80] drop-shadow-[0_16px_28px_rgba(16,24,40,0.28)]"
            style={{
              width: lerp(80, 170, fly),
              opacity: sharedOut * (1 - fly * 0.45),
              left: `${lerp(42, 118, fly)}%`,
              top: `${lerp(48, 6, fly) + Math.sin(fly * Math.PI) * -10}%`,
              transform: `rotate(${lerp(-18, 18, fly)}deg)`,
            }}
          >
            <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill={BURGUNDY} />
            <path d="M44 40 L114 6 L60 40 Z" fill={CREAM} />
          </svg>
        </div>
      </section>

      <ChromeStory embedded />
      <AfterShare />
    </div>
  );
}

/** Desktop keeps scroll-scrub theatre; mobile (< md / 768px) uses stacked sections. */
export function KitStory() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) {
    return <div className="min-h-screen bg-[#eef0f4]" aria-hidden />;
  }
  return isDesktop ? <KitStoryDesktop /> : <KitStoryMobile />;
}
