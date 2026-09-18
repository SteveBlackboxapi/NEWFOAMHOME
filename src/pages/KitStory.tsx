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

export function KitStory() {
  const track = useRef<HTMLElement | null>(null);
  const flyVid = useRef<HTMLVideoElement | null>(null);
  const wellVid = useRef<HTMLVideoElement | null>(null);
  const [p, setProg] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      setProg(passed / Math.max(total, 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const pack = range(p, 0.02, 0.2);
  const landed = pack >= 1;
  const read = range(p, 0.22, 0.56);
  const aimShare = range(p, 0.56, 0.64);
  const shareOpen = range(p, 0.64, 0.72);
  const generated = range(p, 0.72, 0.78);
  const aimCopy = range(p, 0.78, 0.86);
  const copied = range(p, 0.86, 0.9);
  const publicize = range(p, 0.9, 0.93);
  const fold = range(p, 0.93, 0.97);
  const fly = range(p, 0.97, 1);
  const headlineOp = 1 - range(p, 0.02, 0.12);

  useEffect(() => {
    if (landed) {
      flyVid.current?.pause();
      wellVid.current?.pause();
    } else {
      flyVid.current?.play().catch(() => undefined);
    }
  }, [landed]);

  const photoW = lerp(100, 26, pack);
  const photoH = lerp(100, 30, pack);
  const photoL = lerp(0, 24.5, pack);
  const photoT = lerp(0, 20, pack);

  const cursorL = aimCopy > 0 ? lerp(93.6, 61.5, aimCopy) : lerp(62, 93.6, aimShare);
  const cursorT = aimCopy > 0 ? lerp(8.4, 54, aimCopy) : lerp(42, 8.4, aimShare);
  const cursorOn = landed && fold < 0.2;

  return (
    <div className="bg-[#eef0f4] text-[#101828]">
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3">
        <Link to="/" className="text-[12px] text-[#101828]/70 hover:text-[#101828]">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#eef0f4]">
          {fold < 0.2 && (
            <div className="absolute inset-x-4 top-[6%] bottom-[5%] z-10 rounded-[20px] bg-white border border-[#e2e4e8] overflow-hidden flex flex-col" style={{ opacity: pack }}>
              <div className="h-12 shrink-0 bg-white border-b border-[#e6e8ec] flex items-center px-4 gap-3">
                <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
                <p className="text-[13px] text-[#6a7282] truncate">Media kits / <span className="text-[#101828] font-medium">Io Marin's Media Kit</span></p>
                <button type="button" className="ml-auto h-8 rounded-full bg-[#185abc] text-white text-[13px] px-3.5 inline-flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Share
                </button>
              </div>
              <div className="flex min-h-0 flex-1">
                <aside className="shrink-0 bg-white border-r border-[#e6e8ec] overflow-hidden" style={{ width: `${lerp(220, 0, publicize)}px` }}>
                  <div className="p-4 w-[220px]">
                    <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                    <p className="text-[15px] font-medium mb-4">Io Marin's Media Kit</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                    {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
                      <div key={x} className="rounded-xl bg-[#f4f5f7] h-9 mb-2 flex items-center justify-between px-3 text-[11px]">{x}<span>+</span></div>
                    ))}
                  </div>
                </aside>
                <div className="relative flex-1 overflow-hidden bg-[#F4E6C8]">
                  <div style={{ transform: `translateY(${-read * 36}%)` }}>
                    <div className="p-5">
                      <div className="flex justify-between mb-4">
                        <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                        <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                      </div>
                      <div className="flex gap-5 items-start">
                        <div className="w-[40%] rounded-[14px] overflow-hidden bg-[#ead9b8] aspect-[4/3]">
                          {landed && (
                            <video ref={wellVid} className="size-full object-cover" src={CLIP} muted playsInline />
                          )}
                        </div>
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
                    <div className="bg-[#6b0030] text-[#F4E6C8] px-6 py-6">
                      <p className="text-[14px] leading-6 mb-6">Rooftop sessions and late miles. Illustrative Vale Studio talent.</p>
                      <div className="flex items-end justify-between border-t border-white/15 pt-5">
                        <div>
                          <p className="text-[18px] font-semibold">Platforms</p>
                          <p className="text-[28px] leading-none font-semibold">164K</p>
                        </div>
                        <div className="flex gap-8 text-right">
                          <div><p className="text-[22px] font-semibold">89K</p><p className="text-[11px] opacity-70">@iomarin</p></div>
                          <div><p className="text-[22px] font-semibold">62K</p><p className="text-[11px] opacity-70">@iomarin_tt</p></div>
                          <div><p className="text-[22px] font-semibold">13K</p><p className="text-[11px] opacity-70">@iomarin_yt</p></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-3 bg-[#F4E6C8] min-h-[52vh]">
                      {[["247.5", "Avg. Views"], ["966.7", "Avg. Reels Views"], ["196.0", "Avg. Story Reach"], ["2.9%", "Reach engagement"]].map(([n, l]) => (
                        <div key={l} className="rounded-xl bg-[#ead9b8]/50 p-4">
                          <p className="text-[22px] font-semibold">{n}</p>
                          <p className="text-[11px] text-[#6a7282]">{l}</p>
                        </div>
                      ))}
                      <div className="col-span-2 rounded-xl bg-[#ead9b8]/50 p-4">
                        <p className="text-[12px] font-medium mb-3">Followers</p>
                        <div className="h-16 flex items-end gap-2">
                          {[20, 22, 24, 28, 40, 62, 78, 86, 90].map((h, i) => (
                            <div key={i} className="flex-1 bg-[#6b0030] rounded-sm" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!landed && (
            <div
              className="absolute z-20 overflow-hidden bg-black"
              style={{
                left: `${photoL}%`,
                top: `${photoT}%`,
                width: `${photoW}%`,
                height: `${photoH}%`,
                borderRadius: `${lerp(0, 14, pack)}px`,
              }}
            >
              <video ref={flyVid} className="size-full object-cover" src={CLIP} muted loop playsInline autoPlay />
            </div>
          )}

          <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-24 pointer-events-none" style={{ opacity: headlineOp }}>
            <h1 className="text-white text-[52px] md:text-[78px] leading-[0.92] tracking-[-2px] font-semibold drop-shadow-lg">
              From a clip<br />to a kit you can send.
            </h1>
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

          <div
            className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: cursorOn ? 1 : 0, left: `${cursorL}%`, top: `${cursorT}%` }}
          />

          <svg viewBox="0 0 120 72" className="absolute z-50 drop-shadow-[0_16px_28px_rgba(16,24,40,0.28)]" style={{ width: lerp(80, 170, fly), opacity: fold, left: `${lerp(38, 120, fly)}%`, top: `${lerp(40, 12, fly) + Math.sin(fly * Math.PI) * -12}%`, transform: `rotate(${lerp(-24, 16, fly)}deg)` }}>
            <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill="#6b0030" />
            <path d="M44 40 L114 6 L60 40 Z" fill="#F4E6C8" />
          </svg>
        </div>
      </section>
    </div>
  );
}
