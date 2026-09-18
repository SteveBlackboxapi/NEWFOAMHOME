import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const A = `${import.meta.env.BASE_URL}assets`;
const REN = `${A}/9e849.png`;
const REN_VID = `${A}/ren-kit.mp4`;

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
  const [p, setP] = useState(0);
  const [hasVid, setHasVid] = useState(true);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      setP(passed / Math.max(total, 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const pack = range(p, 0.02, 0.4);
  const landed = pack > 0.94;
  const shareOpen = range(p, 0.42, 0.52);
  const generated = range(p, 0.52, 0.62);
  const copied = range(p, 0.62, 0.74);
  const publicize = range(p, 0.74, 0.92);
  const headlineOp = 1 - range(p, 0.02, 0.18);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (landed) v.pause();
    else v.play().catch(() => undefined);
  }, [landed]);

  const photoW = lerp(100, 30, pack);
  const photoH = lerp(100, 44, pack);
  const photoL = lerp(0, 36, pack);
  const photoT = lerp(0, 22, pack);

  const modalPhase = generated < 0.5 ? 0 : copied < 0.55 ? 1 : 2;
  const cursor = [
    { l: 86, t: 7 },
    { l: 50, t: 48 },
    { l: 62, t: 50 },
  ][modalPhase === 0 && shareOpen < 0.6 ? 0 : modalPhase === 0 ? 1 : 2];

  return (
    <div className="bg-[#eef0f4] text-[#101828]">
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3 mix-blend-difference">
        <Link to="/" className="text-[12px] text-white">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#c6f31e]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[220vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#eef0f4]">
          <div
            className="absolute inset-0 bg-[#eef0f4]"
            style={{ opacity: pack }}
          />

          <div
            className="absolute z-20 overflow-hidden bg-[#d9dde4]"
            style={{
              left: `${photoL}%`,
              top: `${photoT}%`,
              width: `${photoW}%`,
              height: `${photoH}%`,
              borderRadius: `${lerp(0, 16, pack)}px`,
            }}
          >
            {hasVid && !landed ? (
              <video
                ref={vid}
                className="size-full object-cover object-[center_18%]"
                src={REN_VID}
                poster={REN}
                muted
                loop
                playsInline
                autoPlay
                onError={() => setHasVid(false)}
              />
            ) : (
              <img alt="Ren Cole" src={REN} className="size-full object-cover object-[center_18%]" />
            )}
          </div>

          <div
            className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-24 pointer-events-none"
            style={{ opacity: headlineOp }}
          >
            <p className="text-[11px] uppercase tracking-[1.4px] text-white/80 mb-4 drop-shadow">The truth layer</p>
            <h1 className="text-white text-[52px] md:text-[78px] leading-[0.92] tracking-[-2px] font-semibold mb-5 drop-shadow-lg">
              From a clip<br />to a kit you can send.
            </h1>
          </div>

          <div
            className="absolute inset-x-5 top-[8%] bottom-[6%] z-10 rounded-[20px] bg-[#eef0f4] border border-[#e2e4e8] overflow-hidden"
            style={{ opacity: pack }}
          >
            <div className="h-12 bg-white border-b border-[#e6e8ec] flex items-center px-4 gap-3">
              <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
              <p className="text-[13px] text-[#6a7282]">Media kits / <span className="text-[#101828] font-medium">Ren Cole's Media Kit</span></p>
              <div className="ml-auto flex items-center gap-2">
                <span className="size-8 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-[11px]">▶</span>
                <span className="h-8 px-3 rounded-full bg-[#185abc] text-white text-[12px]">Share</span>
              </div>
            </div>

            <div className="flex h-[calc(100%-48px)]">
              <aside
                className="shrink-0 bg-white border-r border-[#e6e8ec] p-4 overflow-hidden"
                style={{ width: `${lerp(240, 0, publicize)}px`, opacity: 1 - publicize, paddingInline: publicize > 0.65 ? 0 : undefined }}
              >
                <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                <p className="text-[15px] font-medium mb-5">Ren Cole's Media Kit</p>
                <p className="text-[11px] text-[#6a7282] mb-2">Platform analytics</p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {["Instagram", "TikTok", "YouTube"].map((x) => (
                    <div key={x} className="rounded-xl bg-[#f4f5f7] h-16 p-2 text-[10px] text-[#6a7282] flex items-end">{x}</div>
                  ))}
                </div>
                <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
                  <div key={x} className="rounded-xl bg-[#f4f5f7] h-10 mb-2 flex items-center justify-between px-3 text-[12px]">
                    {x}<span>+</span>
                  </div>
                ))}
              </aside>

              <div className="flex-1 p-5">
                <div className="h-full rounded-[18px] bg-[#F4E6C8] border border-[#ead9b8] relative">
                  <div className="flex justify-between p-5">
                    <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                    <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                  </div>
                  <div className="absolute left-[44%] top-[24%] right-6">
                    <p className="text-[#6b0030] text-[34px] leading-none font-semibold mb-2">Ren Cole</p>
                    <p className="text-[#6b0030]/70 text-[13px] mb-4">Portland, OR · 32 years old · Male</p>
                    <p className="text-[10px] uppercase tracking-[1px] text-[#6b0030]/50 mb-1">Verticals</p>
                    <p className="text-[#6b0030] text-[14px]">Running · Everyday Progress</p>
                  </div>
                  <div className="absolute left-0 right-0 bottom-0 bg-[#6b0030] text-[#F4E6C8] px-6 py-5">
                    <p className="text-[14px] leading-5 max-w-[640px]">
                      Early miles. Long runs. Bringing an audience along for the journey. Illustrative demo talent for Vale Studio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 z-30 bg-black/25"
            style={{ opacity: shareOpen * (1 - publicize) }}
          />
          <div
            className="absolute z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)] overflow-hidden"
            style={{ opacity: shareOpen * (1 - publicize), transform: `translate(-50%,-50%) scale(${0.96 + shareOpen * 0.04})` }}
          >
            <div className="px-5 py-3 border-b border-[#eeefef] flex items-center justify-between">
              <p className="text-[16px] font-medium">Share</p>
              <span className="size-7 rounded-full border border-[#eeefef] flex items-center justify-center text-[#6a7282]">×</span>
            </div>
            <div className="p-5">
              <p className="text-[13px] mb-4">Ren Cole's Media Kit</p>
              {generated < 0.4 ? (
                <div className="h-11 rounded-full border border-[#d0d5dd] flex items-center justify-center text-[13px] gap-2">
                  Generate share link
                </div>
              ) : (
                <div className={`h-11 rounded-full border flex items-center px-3 gap-2 ${copied > 0.5 ? "border-[#185abc]" : "border-[#d0d5dd]"}`}>
                  <span className="text-[12px] text-[#344054] truncate flex-1">https://foam.io/m/ren-cole</span>
                  <span className={`text-[12px] rounded-full px-3 py-1 ${copied > 0.5 ? "bg-[#185abc] text-white" : "border border-[#d0d5dd]"}`}>
                    {copied > 0.5 ? "Copied" : "Copy link"}
                  </span>
                </div>
              )}
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium">Require email to view</p>
                  <p className="text-[12px] text-[#6a7282]">You'll get an email when someone views this media kit.</p>
                </div>
                <span className="w-10 h-6 rounded-full bg-[#e5e7eb] shrink-0" />
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute z-50 size-9 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/20"
            style={{
              opacity: pack > 0.85 && publicize < 0.7 ? 1 : 0,
              left: `${cursor.l}%`,
              top: `${cursor.t}%`,
            }}
          />
        </div>
      </section>

      <section className="min-h-screen bg-[#eef0f4] px-6 py-16">
        <div className="max-w-[980px] mx-auto">
          <p className="text-[12px] uppercase tracking-[1px] text-[#6a7282] mb-3">What they open</p>
          <h2 className="text-[36px] tracking-[-1px] font-semibold mb-8">The public kit. No editor.</h2>
          <div className="rounded-[22px] overflow-hidden bg-[#F4E6C8] border border-[#ead9b8]">
            <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 p-6">
              <img alt="Ren Cole" src={REN} className="w-full h-[340px] object-cover object-top rounded-[16px]" />
              <div>
                <p className="text-[#6b0030] text-[40px] leading-none font-semibold mb-3">Ren Cole</p>
                <p className="text-[#6b0030]/70 text-[14px] mb-5">Portland, OR · 32 years old · Male</p>
                <p className="text-[#6b0030] text-[15px]">Running · Everyday Progress</p>
              </div>
            </div>
            <div className="bg-[#6b0030] text-[#F4E6C8] px-6 py-6 text-[15px]">
              Early miles. Long runs. Bringing an audience along for the journey.
              <p className="mt-4 text-[13px] opacity-80">foam.io/m/ren-cole</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
