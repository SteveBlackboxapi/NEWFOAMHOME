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

  const pack = range(p, 0.08, 0.42);
  const kitIn = range(p, 0.22, 0.5);
  const restIn = range(p, 0.48, 0.68);
  const shareIn = range(p, 0.66, 0.88);

  const photoW = lerp(100, 38, pack);
  const photoH = lerp(100, 52, pack);
  const photoL = lerp(0, 8, pack);
  const photoT = lerp(0, 22, pack);
  const photoR = lerp(0, 16, pack);
  const headlineOp = 1 - range(p, 0.12, 0.32);
  const darkWash = 0.35 + pack * 0.15;

  return (
    <div className="bg-[#0b0d12] text-white min-h-screen">
      <div className="fixed top-4 left-4 z-30 flex items-center gap-3">
        <Link to="/" className="text-[12px] tracking-[0.4px] text-white/60 hover:text-white">
          ← Home
        </Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#c6f31e]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[380vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            className="absolute inset-0 bg-[#0b0d12]"
            style={{ opacity: pack }}
          />

          <img
            alt="Ren Cole"
            src={REN}
            className="absolute object-cover object-[center_20%] z-10"
            style={{
              left: `${photoL}%`,
              top: `${photoT}%`,
              width: `${photoW}%`,
              height: `${photoH}%`,
              borderRadius: `${lerp(0, 18, pack)}px`,
              filter: `brightness(${lerp(0.72, 1, pack)})`,
            }}
          />
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: `rgba(8,10,16,${darkWash * (1 - pack)})` }}
          />

          <div
            className="absolute inset-0 z-20 flex flex-col justify-end px-8 md:px-16 pb-24 max-w-[920px]"
            style={{ opacity: headlineOp, transform: `translateY(${pack * -24}px)` }}
          >
            <p className="text-[11px] uppercase tracking-[1.4px] text-white/60 mb-4">The truth layer</p>
            <h1 className="text-[52px] md:text-[80px] leading-[0.92] tracking-[-2px] font-semibold mb-6">
              Numbers everyone<br />in the deal can trust.
            </h1>
            <p className="text-[17px] text-white/70 max-w-[460px]">
              Start with the person. The kit is just the frame that makes them sendable.
            </p>
          </div>

          <div
            className="absolute z-20 right-[6%] top-[12%] w-[min(420px,42vw)]"
            style={{ opacity: kitIn, transform: `translateY(${(1 - kitIn) * 28}px)` }}
          >
            <div className="rounded-[22px] overflow-hidden border border-[#ead9b8] shadow-[0_30px_80px_rgba(0,0,0,0.35)] bg-[#F4E6C8]">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
              </div>
              <div className="px-5 pb-5 pl-[42%]">
                <p className="text-[#6b0030] text-[28px] leading-none font-semibold mb-2">Ren Cole</p>
                <p className="text-[#6b0030]/70 text-[12px] mb-3">Portland, OR · 32 · Male</p>
                <p className="text-[10px] uppercase tracking-[1px] text-[#6b0030]/50 mb-1">Verticals</p>
                <p className="text-[#6b0030] text-[13px]">Running · Everyday Progress</p>
              </div>
              <div
                className="bg-[#6b0030] text-[#F4E6C8] px-5 py-4"
                style={{ opacity: restIn }}
              >
                <p className="text-[13px] leading-5 mb-4">
                  Early miles. Long runs. Bringing an audience along for the journey. Illustrative demo talent for Vale Studio.
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.8px] opacity-70">Total audience</p>
                    <p className="text-[28px] leading-none font-semibold">286K</p>
                  </div>
                  <div className="flex gap-5 text-right">
                    <div><p className="text-[16px] font-semibold">131K</p><p className="text-[10px] opacity-70">@ren.cole</p></div>
                    <div><p className="text-[16px] font-semibold">97K</p><p className="text-[10px] opacity-70">@ren.cole</p></div>
                    <div><p className="text-[16px] font-semibold">58K</p><p className="text-[10px] opacity-70">Ren Cole</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute z-30 left-1/2 -translate-x-1/2 bottom-8 w-[min(720px,90vw)]"
            style={{ opacity: shareIn, transform: `translate(-50%, ${(1 - shareIn) * 16}px)` }}
          >
            <div className="bg-white text-[#101828] rounded-full h-10 px-4 flex items-center gap-3 shadow-lg">
              <span className="size-2.5 rounded-full bg-[#c6f31e]" />
              <span className="text-[12px] truncate">foam.io/m/ren-cole</span>
              <span className="ml-auto text-[11px] text-[#185abc]">Public link · no login</span>
            </div>
            <p className="text-center text-[12px] text-white/55 mt-3">
              The photo is the person. The kit is what you send.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
