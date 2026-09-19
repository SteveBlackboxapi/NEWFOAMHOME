import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChromeStory } from "./ChromeStory";

const A = `${import.meta.env.BASE_URL}assets`;
const CLIP = `${A}/io-portrait-web.mp4`;
const POSTER = `${A}/io-portrait-poster.webp`;
const FG_R = "font-founders font-normal";
const FG_M = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

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

function KitNav() {
  return (
    <div className="h-12 bg-white border-b border-[#e6e8ec] flex items-center px-4 gap-3 rounded-t-[20px]">
      <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
      <p className="text-[13px] text-[#6a7282] truncate">Media kits / <span className="text-[#101828] font-medium">Samantha-Pikka-haircare'26</span></p>
      <button type="button" className="ml-auto h-8 rounded-full bg-[#185abc] text-white text-[13px] px-3.5 inline-flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Share
      </button>
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

function Plat({ label, val, handle }: { label: string; val: string; handle: string }) {
  return (
    <div className="min-w-[88px]">
      <p className="text-[11px] opacity-70 mb-1">{label}</p>
      <p className="text-[24px] font-semibold leading-none">{val}</p>
      <p className="text-[11px] opacity-70 mt-1">{handle}</p>
    </div>
  );
}

export function KitStory() {
  const track = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const well = useRef<HTMLDivElement | null>(null);
  const vid = useRef<HTMLVideoElement | null>(null);
  const [p, setProg] = useState(0);
  const [slot, setSlot] = useState({ l: 58, t: 22, w: 28, h: 38 });

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

  const pack = ease(range(p, 0.02, 0.22));
  const kitIn = clamp((pack - 0.72) / 0.28);
  const landed = pack >= 0.995;
  const read = range(p, 0.22, 0.68);
  const aimShare = range(p, 0.70, 0.76);
  const shareOpen = range(p, 0.76, 0.82);
  const generated = range(p, 0.82, 0.86);
  const aimCopy = range(p, 0.86, 0.90);
  const copied = range(p, 0.90, 0.93);
  const publicize = range(p, 0.93, 0.95);
  const fold = range(p, 0.95, 0.98);
  const fly = range(p, 0.97, 1);
  const sharedIn = range(p, 0.96, 1);
  const headlineOp = 1 - range(p, 0.02, 0.16);
  const light = kitIn > 0.2 || fold > 0 || sharedIn > 0;

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
  const cursorOn = aimShare > 0.02 && fold < 0.2;

  return (
    <div className="text-[#101828]" style={{ background: light ? "#eef0f4" : "#000" }}>
      <div className="fixed top-4 left-4 z-[70] flex items-center gap-3">
        <Link to="/" className={`text-[12px] ${light ? "text-[#101828]/70" : "text-white/80"}`}>← Home</Link>
        <span className={`text-[10px] uppercase tracking-[1px] ${light ? "text-[#5a6408]" : "text-white/50"}`}>Kit story test</span>
      </div>
      <section ref={track} className="relative h-[420vh]">
        <div ref={stage} className="sticky top-0 h-screen overflow-hidden" style={{ background: light ? "#eef0f4" : "#000" }}>
          {fold < 0.2 && (
            <div className="absolute inset-x-4 top-[6%] bottom-[5%] z-10 rounded-[20px] bg-white border border-[#e2e4e8] overflow-hidden flex flex-col" style={{ opacity: kitIn }}>
              <div className="h-12 shrink-0" />
              <div className="flex min-h-0 flex-1">
                <aside className="shrink-0 bg-white border-r border-[#e6e8ec] overflow-hidden" style={{ width: `${lerp(220, 0, publicize)}px` }}>
                  <div className="p-4 w-[220px]">
                    <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                    <p className="text-[15px] font-medium mb-4">Samantha-Pikka-haircare'26</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                    {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
                      <div key={x} className="rounded-xl bg-[#f4f5f7] h-9 mb-2 flex items-center justify-between px-3 text-[11px]">{x}<span>+</span></div>
                    ))}
                  </div>
                </aside>
                <div className="relative flex-1 overflow-hidden bg-[#e8ebe4]">
                  <div style={{ transform: `translateY(${-read * 62}%)` }}>
                    <div className="m-4 md:m-5 rounded-[18px] overflow-hidden bg-[#F4E6C8]">
                      <div className="px-7 pt-6 pb-8 md:px-10 md:pt-8 md:pb-10">
                        <div className="flex justify-end mb-10">
                          <span className="border border-[#6b0030]/40 text-[#6b0030] rounded-full px-4 py-1.5 text-[13px]">Contact</span>
                        </div>
                        <div className="flex gap-8 md:gap-12 items-center">
                          <div className="flex-1 min-w-0">
                            <p className="text-[#6b0030] text-[42px] md:text-[56px] leading-[0.95] font-semibold tracking-[-1.2px] mb-5">Samantha Pikka</p>
                            <p className="text-[#101828] text-[15px] md:text-[16px] mb-6">Los Angeles, CA&nbsp;&nbsp;|&nbsp;&nbsp;26 yo&nbsp;&nbsp;|&nbsp;&nbsp;Female</p>
                            <div className="flex gap-3 mb-6">
                              {["IG", "TT", "YT"].map((lab) => (
                                <span key={lab} className="size-10 rounded-full border border-[#6b0030]/40 text-[#6b0030] text-[12px] font-semibold inline-flex items-center justify-center">{lab}</span>
                              ))}
                            </div>
                            <div className="inline-flex flex-col rounded-2xl bg-[#6b0030]/10 text-[#6b0030] px-5 py-3.5">
                              <span className="text-[12px] opacity-70 mb-1">Verticals</span>
                              <span className="text-[16px]">Beauty · Advocacy · Education</span>
                            </div>
                          </div>
                          <div ref={well} className="w-[44%] shrink-0 rounded-[16px] bg-[#ead9b8] aspect-square" />
                        </div>
                      </div>
                      <div className="bg-[#6b0030] text-[#F4E6C8] px-6 md:px-8 py-8">
                        <div className="flex items-end justify-between gap-8 flex-wrap mb-8">
                          <div>
                            <p className="text-[22px] font-semibold">Platforms</p>
                            <p className="text-[36px] leading-none font-semibold mt-1">1,155,300</p>
                            <p className="text-[12px] opacity-70 mt-1">Total audience</p>
                          </div>
                          <div className="flex gap-6 md:gap-8">
                            <Plat label="Instagram" val="570.1K" handle="@samanthapikka3" />
                            <Plat label="TikTok" val="157.2K" handle="@sampikka" />
                            <Plat label="YouTube" val="418K" handle="@samiepikka4" />
                            <Plat label="LinkedIn" val="10K" handle="" />
                          </div>
                        </div>
                        <p className="text-[16px] leading-7 max-w-[820px]">Samantha Pikka is an LA-based beauty creator with a passion for making skincare and haircare feel simple, approachable, and fun. At 26, she shares honest product reviews, easy-to-follow routines, beauty discoveries, and practical tips with her growing audience. Known for her warm, relatable style, Samantha focuses on products she genuinely loves, helping her community discover what's worth trying while making everyday beauty feel a little less complicated.</p>
                      </div>
                      <div className="bg-[#F4E6C8] px-6 md:px-8 py-6">
                        <div className="grid grid-cols-4 gap-3 items-start">
                          {[
                            { views: "116k", likes: "4.6k", h: 340, pos: "28% 18%" },
                            { views: "110k", likes: "34.6k", h: 248, pos: "62% 22%" },
                            { views: "93.2k", likes: "31.2k", h: 320, pos: "48% 30%" },
                            { views: "154.3k", likes: "74.9k", h: 236, pos: "70% 16%" },
                          ].map((tile) => (
                            <div key={tile.views} className="relative rounded-[14px] overflow-hidden bg-[#ead9b8]" style={{ height: tile.h }}>
                              <img src={POSTER} alt="" className="size-full object-cover" style={{ objectPosition: tile.pos }} />
                              <div className="absolute inset-x-0 bottom-0 px-2.5 py-2 text-white text-[11px] flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
                                <span>{tile.views}</span>
                                <span>{tile.likes}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#F4E6C8] px-6 md:px-8 pb-10">
                        <div className="rounded-[16px] bg-[#f7efe0] border border-[#ead9b8] p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-[16px] font-semibold">Instagram</p>
                              <p className="text-[12px] text-[#6a7282]">@samanthapikka3</p>
                            </div>
                            <p className="text-[12px] text-[#6b0030]">Data synced: Last 28d</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            {[["672.0K", "Avg. Views"], ["22K", "Avg. Likes"], ["8.3K", "Avg. Comments"], ["31.8K", "Avg. Shares"]].map(([val, lab]) => (
                              <div key={lab} className="rounded-[12px] bg-white/70 px-4 py-3">
                                <p className="text-[22px] font-semibold leading-none mb-1">{val}</p>
                                <p className="text-[12px] text-[#6a7282]">{lab}</p>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-[12px] bg-white/70 px-4 py-4 mb-3">
                            <p className="text-[12px] text-[#6a7282] mb-1">Total subscribers</p>
                            <p className="text-[28px] font-semibold leading-none mb-1">72.9K</p>
                            <p className="text-[12px] text-[#6b0030] mb-4">+5,976 new followers</p>
                            <svg viewBox="0 0 320 72" className="w-full h-16">
                              <polyline fill="none" stroke="#6b0030" strokeWidth="2.4" points="4,64 32,60 60,58 88,54 116,50 144,46 172,38 200,34 228,36 256,30 284,24 316,18" />
                              <circle cx="316" cy="18" r="3.5" fill="#6b0030" />
                            </svg>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-[12px] bg-white/70 px-4 py-4">
                              <p className="text-[13px] font-medium mb-3">Age distribution</p>
                              {[["13-17", "14%"], ["18-24", "20%"], ["25-34", "20%"]].map(([lab, val]) => (
                                <div key={lab} className="flex items-center gap-2 text-[12px] mb-2">
                                  <span className="w-10 text-[#6a7282]">{lab}</span>
                                  <span className="h-2 rounded-full bg-[#6b0030]" style={{ width: val }} />
                                  <span>{val}</span>
                                </div>
                              ))}
                            </div>
                            <div className="rounded-[12px] bg-white/70 px-4 py-4">
                              <p className="text-[13px] font-medium mb-3">Gender distribution</p>
                              <div className="flex items-center gap-2 text-[12px]">
                                <span className="w-14 text-[#6a7282]">Female</span>
                                <span className="h-2 rounded-full bg-[#6b0030] w-[60%]" />
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
          )}
          {fold < 0.2 && (
            <div className="absolute z-[22] overflow-hidden bg-black pointer-events-none" style={{ left: `${photoL}%`, top: `${photoT}%`, width: `${photoW}%`, height: `${photoH}%`, borderRadius: `${lerp(0, 14, pack)}px` }}>
              <video ref={vid} className="size-full object-cover object-[center_20%]" src={CLIP} poster={POSTER} muted loop playsInline autoPlay />
            </div>
          )}
          {kitIn > 0 && fold < 0.2 && <div className="absolute inset-x-0 top-0 z-[25] h-[calc(6%+48px)] bg-[#eef0f4] pointer-events-none" style={{ opacity: kitIn }} />}
          {fold < 0.2 && (
            <div className="absolute inset-x-4 top-[6%] z-30 pointer-events-none" style={{ opacity: kitIn }}>
              <KitNav />
            </div>
          )}
          <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-16 pointer-events-none" style={{ opacity: headlineOp }}>
            <p className={`${FG_M} text-[11px] uppercase tracking-[2px] text-white/70 mb-6`}>The truth layer</p>
            <h1 className={`${FG_SB} text-white leading-[0.92] tracking-[-2.5px] max-w-[13ch]`} style={{ fontSize: "clamp(52px, 8vw, 96px)" }}>Numbers everyone in the deal can trust.</h1>
            <p className={`${FG_R} mt-6 max-w-[34em] text-[17px] md:text-[19px] leading-7 text-white/85`}>Creators connect their data at source. Managers pitch with it. Brands decide on it. No screenshots, no guesswork, no “let me check and get back to you.”</p>
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
          <div className="absolute inset-0 z-30 pointer-events-none bg-black/15" style={{ opacity: shareOpen * (1 - fold) }} />
          <div className="absolute z-40 left-1/2 top-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)]" style={{ opacity: shareOpen * (1 - fold), transform: "translate(-50%,-50%)" }}>
            <div className="px-5 py-3 border-b border-[#eeefef] flex justify-between"><p className="text-[16px] font-medium">Share</p><span>×</span></div>
            <div className="p-5">
              <p className="text-[13px] mb-4">Samantha-Pikka-haircare'26</p>
              {generated < 0.4 ? (
                <div className="h-11 rounded-full border border-[#d0d5dd] flex items-center justify-center text-[13px]">Generate share link</div>
              ) : (
                <div className={`h-11 rounded-full border flex items-center px-3 gap-2 ${copied > 0.35 ? "border-[#185abc]" : "border-[#d0d5dd]"}`}>
                  <span className="text-[12px] truncate flex-1">https://foam.io/m/samantha-pikka</span>
                  <span className={`text-[12px] rounded-full px-3 py-1 ${copied > 0.35 ? "bg-[#185abc] text-white" : "border border-[#d0d5dd]"}`}>{copied > 0.35 ? "Copied" : "Copy link"}</span>
                </div>
              )}
            </div>
          </div>
          <div className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 -translate-x-1/2 -translate-y-1/2" style={{ opacity: cursorOn ? 1 : 0, left: `${cursorL}%`, top: `${cursorT}%` }} />
          <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center text-center" style={{ opacity: sharedIn, transform: `translateY(${(1 - sharedIn) * 12}px)` }}>
            <p className="text-[#101828] text-[72px] md:text-[96px] leading-none tracking-[-3px] font-semibold">Media Kit</p>
            <p className="mt-4 text-[18px] text-[#6a7282]">On its way</p>
          </div>
          <svg viewBox="0 0 120 72" className="absolute z-[80] drop-shadow-[0_16px_28px_rgba(16,24,40,0.28)]" style={{ width: lerp(80, 170, fly), opacity: fold * (1 - fly * 0.35), left: `${lerp(38, 118, fly)}%`, top: `${lerp(42, 4, fly) + Math.sin(fly * Math.PI) * -10}%`, transform: `rotate(${lerp(-24, 18, fly)}deg)` }}>
            <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill="#6b0030" />
            <path d="M44 40 L114 6 L60 40 Z" fill="#F4E6C8" />
          </svg>
        </div>
      </section>
      <ChromeStory embedded />
      <AfterShare />
    </div>
  );
}
