import { useEffect, useRef } from "react";
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

export function KitStory() {
  const track = useRef<HTMLElement | null>(null);
  const vid = useRef<HTMLVideoElement | null>(null);
  const pRef = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      pRef.current = passed / Math.max(total, 1);
      el.dataset.p = String(pRef.current);
      const v = vid.current;
      if (v) {
        if (pRef.current > 0.32) v.pause();
        else v.play().catch(() => undefined);
      }
      raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      const p = passed / Math.max(total, 1);
      pRef.current = p;
      (window as unknown as { __kitP?: number }).__kitP = p;
      setProg(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const [p, setProg] = useStateSafe();

  const pack = range(p, 0.02, 0.22);
  const landed = pack > 0.94;
  const read = range(p, 0.24, 0.62);
  const shareOpen = range(p, 0.64, 0.72);
  const generated = range(p, 0.72, 0.78);
  const copied = range(p, 0.78, 0.84);
  const publicize = range(p, 0.84, 0.9);
  const fold = range(p, 0.9, 0.95);
  const fly = range(p, 0.95, 1);
  const headlineOp = 1 - range(p, 0.02, 0.14);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (landed) v.pause();
    else v.play().catch(() => undefined);
  }, [landed]);

  const photoW = lerp(100, 34, pack);
  const photoH = lerp(100, 38, pack);
  const photoL = lerp(0, 28, pack);
  const photoT = lerp(0, 16, pack);
  const kitScale = lerp(1, 0.1, fold);
  const kitRot = lerp(0, -34, fold) + fly * -16;
  const kitX = fly * 130;
  const kitY = Math.sin(fly * Math.PI) * -14 + fold * -6;

  return (
    <div className="bg-[#eef0f4] text-[#101828]">
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3">
        <Link to="/" className="text-[12px] text-[#101828]/70 hover:text-[#101828]">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#eef0f4]">
          <div
            className="absolute inset-0 origin-center"
            style={{
              transform: `translate(${kitX}vw, ${kitY}vh) rotate(${kitRot}deg) scale(${kitScale})`,
              opacity: 1 - fly * 0.35,
            }}
          >
            <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-24 pointer-events-none" style={{ opacity: headlineOp }}>
              <p className="text-[11px] uppercase tracking-[1.4px] text-white/80 mb-4 drop-shadow">The truth layer</p>
              <h1 className="text-white text-[52px] md:text-[78px] leading-[0.92] tracking-[-2px] font-semibold drop-shadow-lg">
                From a clip<br />to a kit you can send.
              </h1>
            </div>

            <div className="absolute inset-x-4 top-[6%] bottom-[5%] z-10 rounded-[20px] bg-[#eef0f4] border border-[#e2e4e8] overflow-hidden flex flex-col" style={{ opacity: pack }}>
              <div className="h-12 shrink-0 bg-white border-b border-[#e6e8ec] flex items-center px-4 gap-3">
                <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm" style={{ opacity: 1 - publicize }}>‹</span>
                <p className="text-[13px] text-[#6a7282] truncate">Media kits / <span className="text-[#101828] font-medium">Io Marin's Media Kit</span></p>
                <span className="ml-auto h-8 px-3 rounded-full bg-[#185abc] text-white text-[12px]" style={{ opacity: 1 - publicize }}>Share</span>
              </div>

              <div className="flex min-h-0 flex-1">
                <aside className="shrink-0 bg-white border-r border-[#e6e8ec] overflow-hidden" style={{ width: `${lerp(220, 0, publicize)}px` }}>
                  <div className="p-4 w-[220px]">
                    <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                    <p className="text-[15px] font-medium mb-4">Io Marin's Media Kit</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">Platform analytics</p>
                    <div className="grid grid-cols-3 gap-1 mb-4">
                      {["IG", "TT", "YT"].map((x) => (
                        <div key={x} className="rounded-lg bg-[#f4f5f7] h-12 text-[10px] text-[#6a7282] flex items-end p-1">{x}</div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                    {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
                      <div key={x} className="rounded-xl bg-[#f4f5f7] h-9 mb-2 flex items-center justify-between px-3 text-[11px]">{x}<span>+</span></div>
                    ))}
                  </div>
                </aside>

                <div className="relative flex-1 overflow-hidden bg-[#d9dde3]">
                  <div className="absolute inset-0" style={{ transform: `translateY(${-read * 58}%)` }}>
                    <div className="m-4 rounded-[16px] overflow-hidden bg-[#F4E6C8]">
                      <div className="relative min-h-[420px] p-5">
                        <div className="flex justify-between mb-4">
                          <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                          <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                        </div>
                        <div className="flex gap-5 items-start">
                          <div className="w-[42%] rounded-[14px] overflow-hidden bg-black aspect-[4/3]">
                            <video ref={vid} className="size-full object-cover" src={CLIP} muted loop playsInline autoPlay />
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-[#6b0030] text-[28px] leading-none font-semibold mb-2">Io Marin</p>
                            <p className="text-[#6b0030]/70 text-[12px] mb-3">Lisbon · 28 years old · Female</p>
                            <div className="flex gap-2 mb-4 text-[#6b0030] text-[16px]">
                              <span className="size-7 rounded-full border border-[#6b0030]/40 flex items-center justify-center">IG</span>
                              <span className="size-7 rounded-full border border-[#6b0030]/40 flex items-center justify-center">TT</span>
                              <span className="size-7 rounded-full border border-[#6b0030]/40 flex items-center justify-center">YT</span>
                            </div>
                            <div className="rounded-xl bg-[#ead9b8]/70 p-3">
                              <p className="text-[11px] text-[#6b0030]/60 mb-1">Verticals</p>
                              <p className="text-[#6b0030] text-[13px]">Movement · City · Performance</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#6b0030] text-[#F4E6C8] px-6 py-6">
                        <p className="text-[14px] leading-6 mb-6 max-w-[640px]">
                          Rooftop sessions and late miles. Io builds a following that shows up for the work, not the costume. Illustrative Vale Studio talent.
                        </p>
                        <div className="flex items-end justify-between gap-4 border-t border-white/15 pt-5">
                          <div>
                            <p className="text-[18px] font-semibold">Platforms</p>
                            <p className="text-[28px] leading-none font-semibold">164K</p>
                            <p className="text-[11px] opacity-70">Total audience</p>
                          </div>
                          <div className="flex gap-8 text-right">
                            <div><p className="text-[22px] font-semibold">89K</p><p className="text-[11px] opacity-70">@iomarin</p></div>
                            <div><p className="text-[22px] font-semibold">62K</p><p className="text-[11px] opacity-70">@iomarin_tt</p></div>
                            <div><p className="text-[22px] font-semibold">13K</p><p className="text-[11px] opacity-70">@iomarin_yt</p></div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 grid grid-cols-2 gap-3 bg-[#F4E6C8]">
                        {[
                          ["247.5", "Avg. Views"],
                          ["966.7", "Avg. Reels Views"],
                          ["196.0", "Avg. Story Reach"],
                          ["2.9%", "Reach engagement"],
                        ].map(([n, l]) => (
                          <div key={l} className="rounded-xl bg-[#ead9b8]/50 p-4">
                            <p className="text-[22px] font-semibold">{n}</p>
                            <p className="text-[11px] text-[#6a7282]">{l}</p>
                          </div>
                        ))}
                        <div className="col-span-2 rounded-xl bg-[#ead9b8]/50 p-4">
                          <p className="text-[12px] font-medium mb-3">Total followers 164K</p>
                          <div className="h-16 flex items-end gap-2">
                            {[20, 22, 24, 28, 40, 62, 78, 86, 90].map((h, i) => (
                              <div key={i} className="flex-1 bg-[#6b0030] rounded-sm" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#ead9b8]/50 p-4">
                          <p className="text-[12px] font-medium mb-3">Gender</p>
                          <p className="text-[12px] mb-1">Female 61%</p>
                          <div className="h-2 bg-[#6b0030] w-[61%] mb-2" />
                          <p className="text-[12px] mb-1">Male 39%</p>
                          <div className="h-2 bg-[#6b0030] w-[39%]" />
                        </div>
                        <div className="rounded-xl bg-[#ead9b8]/50 p-4">
                          <p className="text-[12px] font-medium mb-3">Countries</p>
                          <p className="text-[12px] flex justify-between"><span>Portugal</span><span>54%</span></p>
                          <p className="text-[12px] flex justify-between"><span>UK</span><span>18%</span></p>
                          <p className="text-[12px] flex justify-between"><span>Spain</span><span>11%</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute z-20 overflow-hidden bg-black"
              style={{
                left: `${photoL}%`,
                top: `${photoT}%`,
                width: `${photoW}%`,
                height: `${photoH}%`,
                borderRadius: `${lerp(0, 16, pack)}px`,
                opacity: 1 - pack,
                pointerEvents: "none",
              }}
            >
              <video className="size-full object-cover" src={CLIP} muted loop playsInline autoPlay />
            </div>
          </div>

          <div className="absolute inset-0 z-30 pointer-events-none bg-black/20" style={{ opacity: shareOpen * (1 - fold) }} />
          <div className="absolute z-40 left-1/2 top-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)]" style={{ opacity: shareOpen * (1 - publicize), transform: "translate(-50%,-50%)" }}>
            <div className="px-5 py-3 border-b border-[#eeefef] flex items-center justify-between">
              <p className="text-[16px] font-medium">Share</p>
              <span>×</span>
            </div>
            <div className="p-5">
              <p className="text-[13px] mb-4">Io Marin's Media Kit</p>
              {generated < 0.4 ? (
                <div className="h-11 rounded-full border border-[#d0d5dd] flex items-center justify-center text-[13px]">Generate share link</div>
              ) : (
                <div className={`h-11 rounded-full border flex items-center px-3 gap-2 ${copied > 0.5 ? "border-[#185abc]" : "border-[#d0d5dd]"}`}>
                  <span className="text-[12px] truncate flex-1">https://foam.io/m/io-marin</span>
                  <span className={`text-[12px] rounded-full px-3 py-1 ${copied > 0.5 ? "bg-[#185abc] text-white" : "border border-[#d0d5dd]"}`}>{copied > 0.5 ? "Copied" : "Copy link"}</span>
                </div>
              )}
            </div>
          </div>

          <svg viewBox="0 0 120 72" className="absolute z-50 drop-shadow-[0_12px_24px_rgba(16,24,40,0.25)]" style={{ width: lerp(24, 150, fold), opacity: fold, left: `${lerp(42, 118, fly)}%`, top: `${lerp(44, 16, fly) + Math.sin(fly * Math.PI) * -8}%`, transform: `rotate(${lerp(-30, 14, fly)}deg)` }}>
            <path d="M8 36 L112 8 L58 40 L48 64 L44 40 Z" fill="#6b0030" />
            <path d="M44 40 L112 8 L58 40 Z" fill="#F4E6C8" />
          </svg>
        </div>
      </section>
    </div>
  );
}

function useStateSafe() {
  const React = require("react") as typeof import("react");
  return React.useState(0);
}
