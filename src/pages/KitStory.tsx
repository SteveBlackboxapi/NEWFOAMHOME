import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const A = `${import.meta.env.BASE_URL}assets`;
const REN = `${A}/9e849.png`;

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
  const [p, setP] = useState(0);

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

  const pack = range(p, 0.02, 0.38);
  const landed = pack > 0.92;
  const clickShare = range(p, 0.42, 0.58);
  const publicize = range(p, 0.58, 0.82);
  const headlineOp = 1 - range(p, 0.04, 0.22);

  const photoW = lerp(100, 28, pack);
  const photoH = lerp(100, 42, pack);
  const photoL = lerp(0, 38, pack);
  const photoT = lerp(0, 24, pack);

  const editorOp = pack * (1 - publicize * 0.92);
  const cursorL = lerp(72, 88, clickShare);
  const cursorT = lerp(18, 8, clickShare);

  return (
    <div className="bg-[#0b0d12] text-[#101828]">
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3">
        <Link to="/" className="text-[12px] text-white/70 hover:text-white">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#c6f31e]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[240vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#0b0d12]">
          <img
            alt="Ren Cole"
            src={REN}
            className="absolute object-cover object-[center_18%] z-20"
            style={{
              left: `${photoL}%`,
              top: `${photoT}%`,
              width: `${photoW}%`,
              height: `${photoH}%`,
              borderRadius: `${lerp(0, 16, pack)}px`,
              filter: landed ? "none" : `brightness(${lerp(0.7, 1, pack)})`,
              boxShadow: landed ? "0 12px 40px rgba(0,0,0,0.25)" : "none",
            }}
          />

          {!landed && (
            <div className="absolute z-30 left-6 top-20 rounded-full bg-black/50 text-white text-[10px] px-2 py-1 tracking-[0.8px] uppercase">
              Live
            </div>
          )}
          {landed && clickShare < 0.9 && (
            <div className="absolute z-30 text-[10px] uppercase tracking-[0.8px] text-white/80" style={{ left: `${photoL + 1}%`, top: `${photoT + photoH + 1}%` }}>
              Still
            </div>
          )}

          <div
            className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-24 pointer-events-none"
            style={{ opacity: headlineOp }}
          >
            <p className="text-[11px] uppercase tracking-[1.4px] text-white/60 mb-4">The truth layer</p>
            <h1 className="text-white text-[52px] md:text-[78px] leading-[0.92] tracking-[-2px] font-semibold mb-5">
              From a clip<br />to a kit you can send.
            </h1>
            <p className="text-[16px] text-white/70 max-w-[420px]">Scroll. The picture lands. Share. That is the public link.</p>
          </div>

          <div
            className="absolute inset-x-6 top-[10%] bottom-[8%] z-10 rounded-[20px] bg-[#eef0f4] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
            style={{ opacity: editorOp }}
          >
            <div className="h-12 bg-white border-b border-[#e6e8ec] flex items-center px-4 gap-3">
              <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
              <p className="text-[13px] text-[#6a7282]">Media kits / <span className="text-[#101828] font-medium">Ren Cole's Media Kit</span></p>
              <div className="ml-auto flex items-center gap-2">
                <span className="size-8 rounded-full border border-[#e6e8ec]" />
                <span
                  className="h-8 px-3 rounded-full text-white text-[12px] flex items-center gap-1"
                  style={{ background: clickShare > 0.55 ? "#0f9d58" : "#185abc" }}
                >
                  {clickShare > 0.55 ? "Copied link" : "Share"}
                </span>
              </div>
            </div>

            <div className="flex h-[calc(100%-48px)]">
              <aside
                className="w-[240px] shrink-0 bg-white border-r border-[#e6e8ec] p-4 overflow-hidden"
                style={{ opacity: 1 - publicize, width: `${lerp(240, 0, publicize)}px`, padding: publicize > 0.7 ? 0 : undefined }}
              >
                <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                <p className="text-[15px] font-medium mb-5">Ren Cole's Media Kit</p>
                <p className="text-[11px] text-[#6a7282] mb-2">Platform analytics</p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {["IG", "TT", "YT"].map((x) => (
                    <div key={x} className="rounded-xl bg-[#f4f5f7] h-14 flex items-end p-2 text-[10px] text-[#6a7282]">{x}</div>
                  ))}
                </div>
                <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
                  <div key={x} className="rounded-xl bg-[#f4f5f7] h-10 mb-2 flex items-center justify-between px-3 text-[12px]">
                    {x}<span className="text-[#99a1af]">+</span>
                  </div>
                ))}
              </aside>

              <div className="flex-1 p-5 overflow-hidden">
                <div className="h-full rounded-[18px] bg-[#F4E6C8] border border-[#ead9b8] relative">
                  <div className="flex justify-between p-5">
                    <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                    <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                  </div>
                  <div className="absolute left-[42%] top-[22%] right-6">
                    <p className="text-[#6b0030] text-[36px] leading-none font-semibold mb-2">Ren Cole</p>
                    <p className="text-[#6b0030]/70 text-[13px] mb-4">Portland, OR · 32 years old · Male</p>
                    <p className="text-[10px] uppercase tracking-[1px] text-[#6b0030]/50 mb-1">Verticals</p>
                    <p className="text-[#6b0030] text-[14px]">Running · Everyday Progress</p>
                  </div>
                  <div className="absolute left-0 right-0 bottom-0 bg-[#6b0030] text-[#F4E6C8] px-6 py-5">
                    <p className="text-[14px] leading-5 mb-3 max-w-[640px]">
                      Early miles. Long runs. Bringing an audience along for the journey. Illustrative demo talent for Vale Studio.
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.8px] opacity-70">Total audience</p>
                        <p className="text-[28px] leading-none font-semibold">286K</p>
                      </div>
                      <div className="flex gap-6 text-right text-[13px]">
                        <span>131K</span><span>97K</span><span>58K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute z-40 size-10 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/25 shadow-[0_0_0_6px_rgba(198,243,30,0.2)]"
            style={{
              opacity: landed && publicize < 0.85 ? 1 : 0,
              left: `${cursorL}%`,
              top: `${cursorT}%`,
              transition: "left 200ms linear, top 200ms linear",
            }}
          />
        </div>
      </section>

      <section className="min-h-screen bg-[#eef0f4] px-6 py-16">
        <div className="max-w-[980px] mx-auto">
          <p className="text-[12px] uppercase tracking-[1px] text-[#6a7282] mb-3">The link they open</p>
          <h2 className="text-[36px] tracking-[-1px] font-semibold mb-8">No editor. No login. Just the kit.</h2>
          <div className="rounded-[22px] overflow-hidden bg-[#F4E6C8] border border-[#ead9b8] shadow-[0_24px_60px_rgba(16,24,40,0.12)]">
            <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 p-6 items-start">
              <img alt="Ren Cole" src={REN} className="w-full h-[340px] object-cover object-top rounded-[16px]" />
              <div className="pt-2">
                <div className="flex justify-between items-start mb-6">
                  <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                  <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                </div>
                <p className="text-[#6b0030] text-[40px] leading-none font-semibold mb-3">Ren Cole</p>
                <p className="text-[#6b0030]/70 text-[14px] mb-5">Portland, OR · 32 years old · Male</p>
                <p className="text-[10px] uppercase tracking-[1px] text-[#6b0030]/50 mb-1">Verticals</p>
                <p className="text-[#6b0030] text-[15px]">Running · Everyday Progress</p>
              </div>
            </div>
            <div className="bg-[#6b0030] text-[#F4E6C8] px-6 py-6">
              <p className="text-[16px] leading-6 mb-5 max-w-[720px]">
                Early miles. Long runs. Bringing an audience along for the journey. Illustrative demo talent for Vale Studio.
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.8px] opacity-70">Total audience</p>
                  <p className="text-[32px] leading-none font-semibold">286K</p>
                </div>
                <p className="text-[13px] opacity-80">foam.io/m/ren-cole</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
