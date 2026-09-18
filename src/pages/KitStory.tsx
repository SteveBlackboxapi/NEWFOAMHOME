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
  const vid = useRef<HTMLVideoElement | null>(null);
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

  const pack = range(p, 0.02, 0.34);
  const landed = pack > 0.94;
  const shareOpen = range(p, 0.36, 0.46);
  const generated = range(p, 0.46, 0.56);
  const copied = range(p, 0.56, 0.66);
  const publicize = range(p, 0.66, 0.78);
  const fold = range(p, 0.78, 0.88);
  const fly = range(p, 0.88, 1);
  const headlineOp = 1 - range(p, 0.02, 0.16);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (landed) {
      v.pause();
      return;
    }
    v.play().catch(() => undefined);
  }, [landed]);

  const photoW = lerp(100, 32, pack);
  const photoH = lerp(100, 46, pack);
  const photoL = lerp(0, 34, pack);
  const photoT = lerp(0, 20, pack);

  const kitScale = lerp(1, 0.12, fold);
  const kitRot = lerp(0, -36, fold) + fly * -18;
  const kitX = fly * 130;
  const kitY = Math.sin(fly * Math.PI) * -16 + fold * -6;
  const planeShow = fold;

  return (
    <div className="bg-[#eef0f4] text-[#101828]">
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3">
        <Link to="/" className="text-[12px] text-[#101828]/70 hover:text-[#101828]">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Kit story test</span>
      </div>

      <section ref={track} className="relative h-[260vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-[#eef0f4]">
          <div
            className="absolute inset-0 origin-center"
            style={{
              transform: `translate(${kitX}vw, ${kitY}vh) rotate(${kitRot}deg) scale(${kitScale})`,
              opacity: 1 - fly * 0.4,
            }}
          >
            <div
              className="absolute z-20 overflow-hidden bg-[#111]"
              style={{
                left: `${photoL}%`,
                top: `${photoT}%`,
                width: `${photoW}%`,
                height: `${photoH}%`,
                borderRadius: `${lerp(0, 16, pack)}px`,
              }}
            >
              <video
                ref={vid}
                className="size-full object-cover object-center"
                src={CLIP}
                muted
                loop
                playsInline
                autoPlay
              />
            </div>

            <div className="absolute inset-0 z-30 flex flex-col justify-end px-8 md:px-16 pb-24 pointer-events-none" style={{ opacity: headlineOp }}>
              <p className="text-[11px] uppercase tracking-[1.4px] text-white/80 mb-4 drop-shadow">The truth layer</p>
              <h1 className="text-white text-[52px] md:text-[78px] leading-[0.92] tracking-[-2px] font-semibold drop-shadow-lg">
                From a clip<br />to a kit you can send.
              </h1>
            </div>

            <div
              className="absolute inset-x-5 top-[8%] bottom-[6%] z-10 rounded-[20px] bg-[#eef0f4] border border-[#e2e4e8] overflow-hidden"
              style={{ opacity: pack }}
            >
              <div className="h-12 bg-white border-b border-[#e6e8ec] flex items-center px-4 gap-3">
                <span className="size-7 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm" style={{ opacity: 1 - publicize }}>‹</span>
                <p className="text-[13px] text-[#6a7282]">
                  {publicize > 0.6 ? "Shared kit" : <>Media kits / <span className="text-[#101828] font-medium">Io Marin's Media Kit</span></>}
                </p>
                <div className="ml-auto" style={{ opacity: 1 - publicize }}>
                  <span className="h-8 px-3 rounded-full bg-[#185abc] text-white text-[12px]">Share</span>
                </div>
              </div>
              <div className="flex h-[calc(100%-48px)]">
                <aside
                  className="shrink-0 bg-white border-r border-[#e6e8ec] overflow-hidden"
                  style={{ width: `${lerp(228, 0, publicize)}px`, opacity: 1 - publicize }}
                >
                  <div className="p-4 w-[228px]">
                    <p className="text-[11px] text-[#6a7282] mb-1">Media kit name</p>
                    <p className="text-[15px] font-medium mb-4">Io Marin's Media Kit</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">Types</p>
                    {["Platform content", "Text", "Video"].map((x) => (
                      <div key={x} className="rounded-xl bg-[#f4f5f7] h-10 mb-2 flex items-center justify-between px-3 text-[12px]">{x}<span>+</span></div>
                    ))}
                  </div>
                </aside>
                <div className="flex-1 p-5">
                  <div className="h-full rounded-[18px] bg-[#F4E6C8] border border-[#ead9b8] relative">
                    <div className="flex justify-between p-5">
                      <div className="size-7 rounded-[7px] bg-[#6b0030] text-[#F4E6C8] flex items-center justify-center text-[11px] font-semibold">F</div>
                      <span className="border border-[#6b0030]/35 text-[#6b0030] rounded-full px-3 py-1 text-[11px]">Contact</span>
                    </div>
                    <div className="absolute left-[46%] top-[22%] right-6">
                      <p className="text-[#6b0030] text-[34px] leading-none font-semibold mb-2">Io Marin</p>
                      <p className="text-[#6b0030]/70 text-[13px] mb-3">Lisbon · 28 · Female</p>
                      <p className="text-[#6b0030] text-[14px]">Movement · City</p>
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 bg-[#6b0030] text-[#F4E6C8] px-6 py-5 text-[14px]">
                      Early miles. Long runs. Illustrative demo talent for Vale Studio.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 z-30 pointer-events-none bg-black/20" style={{ opacity: shareOpen * (1 - publicize) }} />
          <div
            className="absolute z-40 left-1/2 top-1/2 w-[min(420px,88vw)] bg-white rounded-[16px] shadow-[0_24px_80px_rgba(16,24,40,0.25)]"
            style={{ opacity: shareOpen * (1 - publicize), transform: "translate(-50%,-50%)" }}
          >
            <div className="px-5 py-3 border-b border-[#eeefef] flex items-center justify-between">
              <p className="text-[16px] font-medium">Share</p>
              <span className="text-[#6a7282]">×</span>
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

          <svg
            viewBox="0 0 120 72"
            className="absolute z-50 drop-shadow-[0_12px_24px_rgba(16,24,40,0.25)]"
            style={{
              width: lerp(28, 160, planeShow),
              height: lerp(18, 96, planeShow),
              opacity: planeShow,
              left: `${lerp(42, 118, fly)}%`,
              top: `${lerp(44, 18, fly) + Math.sin(fly * Math.PI) * -10}%`,
              transform: `rotate(${lerp(-32, 12, fly)}deg)`,
            }}
          >
            <path d="M8 36 L112 8 L58 40 L48 64 L44 40 Z" fill="#6b0030" />
            <path d="M44 40 L112 8 L58 40 Z" fill="#F4E6C8" />
            <path d="M58 40 L72 46 L48 64" fill="#4a0022" />
          </svg>
        </div>
      </section>
    </div>
  );
}
