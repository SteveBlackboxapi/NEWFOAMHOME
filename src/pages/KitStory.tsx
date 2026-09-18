import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const A = `${import.meta.env.BASE_URL}assets`;
const CLIP = `${A}/ren-kit.mp4`;

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
      <p className="text-[13px] text-[#6a7282] truncate">Media kits / <span className="text-[#101828] font-medium">Io Marin's Media Kit</span></p>
      <button type="button" className="ml-auto h-8 rounded-full bg-[#185abc] text-white text-[13px] px-3.5 inline-flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Share
      </button>
    </div>
  );
}

function Card({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-xl bg-[#ead9b8]/55 p-4">
      <p className="text-[22px] font-semibold">{n}</p>
      <p className="text-[11px] text-[#6a7282]">{l}</p>
    </div>
  );
}

export function KitStory() {
  const track = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const well = useRef<HTMLDivElement | null>(null);
  const vid = useRef<HTMLVideoElement | null>(null);
  const [p, setProg] = useState(0);
  const [slot, setSlot] = useState({ l: 22, t: 20, w: 32, h: 34 });

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
  const landed = pack >= 0.995;
  const read = range(p, 0.24, 0.58);
  const aimShare = range(p, 0.58, 0.65);
  const shareOpen = range(p, 0.65, 0.73);
  const generated = range(p, 0.73, 0.79);
  const aimCopy = range(p, 0.79, 0.86);
  const copied = range(p, 0.86, 0.9);
  const publicize = range(p, 0.9, 0.93);
  const fold = range(p, 0.93, 0.97);
  const fly = range(p, 0.97, 1);
  const sharedIn = range(p, 0.96, 1);
  const headlineOp = 1 - range(p, 0.02, 0.16);

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
    <div className="bg-[#eef0f4] text-[#101828]">
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3">
        <Link to="/" className="text-[12px] text-[#101828]/70 hover:text-[#101828]">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[360vh]">
        <div ref={stage} className="sticky top-0 h-screen overflow-hidden bg-[#eef0f4]">
          {fold < 0.2 && (
            <div className="absolute inset-x-4 top-[6%] bottom-[5%] z-10 rounded-[20px] bg-white border border-[#e2e4e8] overflow-hidden flex flex-col" style={{ opacity: pack }}>
              <div className="h-12 shrink-0" />
              <div className="flex min-h-0 flex-1">
                <aside className="shrink-0 bg-white border-r border-[#e6e8ec] overflow-hidden" style={{ width: `${lerp(220, 0, publicize)}px` }}>
                  <div className="p-4 w-[220px]">
                    <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                    <p className="text-[15px] font-medium mb-4">Io Marin's Media Kit</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">Platform analytics</p>
                    <div className="grid grid-cols-3 gap-1 mb-4">
                      {["IG", "TT", "YT"].map((x) => (
                        <div key={x} className="rounded-lg bg-[#f4f5f7] h-11 text-[10px] text-[#6a7282] flex items-end p-1">{x}</div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                    {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
                      <div key={x} className="rounded-xl bg-[#f4f5f7] h-9 mb-2 flex items-center justify-between px-3 text-[11px]">{x}<span>+</span></div>
                    ))}
                  </div>
                </aside>
                <div className="relative flex-1 overflow-hidden bg-[#F4E6C8]">
                  <div style={{ transform: `translateY(${-read * 42}%)` }}>
                    <div className="p-5">
                      <div className="flex justify-between mb-4">
                        <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                        <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                      </div>
                      <div className="flex gap-5 items-start">
                        <div ref={well} className="w-[40%] rounded-[14px] bg-[#ead9b8] aspect-[4/3]" />
                        <div className="flex-1 pt-2">
                          <p className="text-[#6b0030] text-[28px] leading-none font-semibold mb-2">Io Marin</p>
                          <p className="text-[#6b0030]/70 text-[12px] mb-3">Lisbon · 28 years old · Female</p>
                          <div className="rounded-xl bg-[#ead9b8]/70 p-3">
                            <p className="text-[11px] text-[#6b0030]/60 mb-1">Verticals</p>
                            <p className="text-[#6b0030] text-[13px]">Movement · City · Performance</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#6b0030] text-[#F4E6C8] px-8 py-8">
                      <p className="text-[15px] leading-7 max-w-[720px] mb-8">Io is a movement creator known for rooftop sessions and late miles. The work is physical, city-bound and built to be watched more than once. Illustrative Vale Studio talent — figures for demonstration only.</p>
                      <div className="border-t border-white/20 pt-6 flex items-end justify-between gap-6">
                        <div>
                          <p className="text-[22px] font-semibold">Platforms</p>
                          <p className="text-[34px] leading-none font-semibold mt-1">164K</p>
                          <p className="text-[12px] opacity-70 mt-1">Total audience</p>
                        </div>
                        <div className="flex gap-10 text-right">
                          <div><p className="text-[11px] opacity-70 mb-1">IG</p><p className="text-[24px] font-semibold">89K</p><p className="text-[11px] opacity-70">@iomarin</p></div>
                          <div><p className="text-[11px] opacity-70 mb-1">TT</p><p className="text-[24px] font-semibold">62K</p><p className="text-[11px] opacity-70">@iomarin_tt</p></div>
                          <div><p className="text-[11px] opacity-70 mb-1">YT</p><p className="text-[24px] font-semibold">13K</p><p className="text-[11px] opacity-70">@iomarin_yt</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-[#F4E6C8] space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[16px] font-semibold">Instagram <span className="text-[#6a7282] font-normal text-[13px]">@iomarin</span></p>
                        <p className="text-[12px] text-[#6b0030]">Data: Last 30 days</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Card n="247.5" l="Avg. Views" />
                        <Card n="966.7" l="Avg. Reels Views" />
                        <Card n="247.5" l="Avg. Story Views" />
                        <Card n="688.9" l="Avg. Reach" />
                      </div>
                      <div className="rounded-xl bg-[#ead9b8]/55 p-5">
                        <p className="text-[13px] font-semibold">Total followers</p>
                        <p className="text-[28px] font-semibold leading-none mt-1">89K</p>
                        <p className="text-[11px] text-[#6a7282] mb-4">+2,140 new followers</p>
                        <svg viewBox="0 0 360 90" className="w-full h-20">
                          <polyline fill="none" stroke="#6b0030" strokeWidth="2.5" points="0,70 40,70 80,68 120,68 160,66 200,48 240,28 280,22 320,20 360,20" />
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#ead9b8]/55 p-5">
                          <p className="text-[13px] font-semibold mb-4">Gender distribution</p>
                          <p className="text-[12px] mb-1 flex justify-between"><span>Female</span><span>61%</span></p>
                          <div className="h-3 bg-[#6b0030] w-[61%] mb-3" />
                          <p className="text-[12px] mb-1 flex justify-between"><span>Male</span><span>39%</span></p>
                          <div className="h-3 bg-[#6b0030] w-[39%]" />
                        </div>
                        <div className="rounded-xl bg-[#ead9b8]/55 p-5">
                          <p className="text-[13px] font-semibold mb-3">Age distribution</p>
                          {[["18-24", 18], ["25-34", 41], ["35-44", 24], ["45+", 15]].map(([l, n]) => (
                            <div key={String(l)} className="flex items-center gap-2 mb-1 text-[12px]">
                              <span className="w-10 text-[#6a7282]">{l}</span>
                              <div className="h-2 bg-[#6b0030]" style={{ width: `${Number(n) * 1.6}px` }} />
                              <span>{n}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#ead9b8]/55 p-5">
                        <p className="text-[13px] font-semibold mb-3">Country distribution</p>
                        {[["Portugal", "54%"], ["United Kingdom", "18%"], ["Spain", "11%"]].map(([c, n]) => (
                          <p key={c} className="text-[13px] flex justify-between py-1"><span>{c}</span><span>{n}</span></p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {fold < 0.2 && (
            <div className="absolute z-[15] overflow-hidden bg-black pointer-events-none" style={{ left: `${photoL}%`, top: `${photoT}%`, width: `${photoW}%`, height: `${photoH}%`, borderRadius: `${lerp(0, 14, pack)}px` }}>
              <video ref={vid} className="size-full object-cover" src={CLIP} muted loop playsInline autoPlay />
              <div className="absolute inset-0 bg-black/20" style={{ opacity: 1 - pack }} />
            </div>
          )}

          <div className="absolute inset-x-0 top-0 z-[25] h-[calc(6%+48px)] bg-[#eef0f4] pointer-events-none" />

          {fold < 0.2 && (
            <div className="absolute inset-x-4 top-[6%] z-30 pointer-events-none" style={{ opacity: pack }}>
              <KitNav />
            </div>
          )}

          <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-20 pointer-events-none" style={{ opacity: headlineOp }}>
            <p className="text-[11px] uppercase tracking-[1.6px] text-white/70 mb-5">The truth layer</p>
            <h1 className="text-white text-[48px] md:text-[72px] leading-[0.94] tracking-[-2px] font-semibold max-w-[14ch]">Numbers everyone in the deal can trust.</h1>
            <p className="mt-5 max-w-[34em] text-[16px] md:text-[18px] leading-7 text-white/85">Creators connect their data at source. Managers pitch with it. Brands decide on it. No screenshots, no guesswork, no “let me check and get back to you.”</p>
          </div>

          <div className="absolute inset-0 z-30 pointer-events-none bg-black/15" style={{ opacity: shareOpen * (1 - fold) }} />
          <div className="absolute z-40 left-1/2 top-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)]" style={{ opacity: shareOpen * (1 - fold), transform: "translate(-50%,-50%)" }}>
            <div className="px-5 py-3 border-b border-[#eeefef] flex justify-between">
              <p className="text-[16px] font-medium">Share</p>
              <span>×</span>
            </div>
            <div className="p-5">
              <p className="text-[13px] mb-4">Io Marin's Media Kit</p>
              {generated < 0.4 ? (
                <div className="h-11 rounded-full border border-[#d0d5dd] flex items-center justify-center text-[13px]">Generate share link</div>
              ) : (
                <div className={`h-11 rounded-full border flex items-center px-3 gap-2 ${copied > 0.35 ? "border-[#185abc]" : "border-[#d0d5dd]"}`}>
                  <span className="text-[12px] truncate flex-1">https://foam.io/m/io-marin</span>
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

          <svg viewBox="0 0 120 72" className="absolute z-50 drop-shadow-[0_16px_28px_rgba(16,24,40,0.28)]" style={{ width: lerp(80, 170, fly), opacity: fold * (1 - fly * 0.4), left: `${lerp(38, 120, fly)}%`, top: `${lerp(40, 12, fly) + Math.sin(fly * Math.PI) * -12}%`, transform: `rotate(${lerp(-24, 16, fly)}deg)` }}>
            <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill="#6b0030" />
            <path d="M44 40 L114 6 L60 40 Z" fill="#F4E6C8" />
          </svg>
        </div>
      </section>
    </div>
  );
}
