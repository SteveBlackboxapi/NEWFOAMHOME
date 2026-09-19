import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { img } from "../lib/assets";

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

const TALENT = [
  { name: "Ren Cole", short: "Ren Cole", img: img.talent1 },
  { name: "Io Marin", short: "Io Marin", img: img.talent2 },
  { name: "Sable Voss", short: "Sable Voss", img: img.talent3 },
];

function StatCol({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className={`${FG_M} text-[11px] text-[#101828] mb-2`}>{title}</p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 text-[11px] leading-5 text-[#4a5565]">
          <span>{v}</span>
          <span className="text-[#6a7282]">{k}</span>
        </div>
      ))}
    </div>
  );
}

export function ChromeStory() {
  const track = useRef<HTMLElement | null>(null);
  const [p, setProg] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      setProg(passed / Math.max(total, 1));
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const enter = ease(range(p, 0.0, 0.08));
  const aim = ease(range(p, 0.08, 0.18));
  const copied = range(p, 0.18, 0.26);
  const fly = ease(range(p, 0.26, 0.48));
  const land = ease(range(p, 0.46, 0.62));
  const proof = ease(range(p, 0.58, 0.78));
  const hold = range(p, 0.78, 0.92);
  const release = range(p, 0.92, 1);

  const panelW = lerp(34, 26, fly);
  const mailScale = lerp(0.92, 1, land);
  const cardL = lerp(72.5, 18, fly);
  const cardT = lerp(36, 28, fly);
  const cardW = lerp(9.2, 58, fly);
  const cardH = lerp(16, 46, fly);
  const cardR = lerp(14, 12, fly);
  const cursorL = fly > 0.02 ? lerp(77, 46, fly) : lerp(62, 77, aim);
  const cursorT = fly > 0.02 ? lerp(44, 34, fly) : lerp(22, 44, aim);
  const cursorOn = aim > 0.05 && land < 0.85;
  const flyingVisible = copied > 0.2 && land < 0.98;
  const embedOp = land;
  const stageShift = lerp(0, -4, release);

  return (
    <div className="bg-[#eef0f4] text-[#101828]">
      <div className="fixed top-4 left-4 z-[70] flex items-center gap-3">
        <Link to="/" className="text-[12px] text-[#101828]/70">← Home</Link>
        <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Chrome story test</span>
        <Link to="/kit-story" className="text-[12px] text-[#101828]/50">Kit story</Link>
      </div>

      <section className="px-6 pt-24 pb-10 max-w-[1100px] mx-auto">
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>Foam for Chrome</p>
        <h1 className={`${FG_SB} text-[40px] md:text-[64px] leading-[0.96] tracking-[-1.8px] max-w-[16ch]`}>
          Pitch from the inbox. Numbers travel with the name.
        </h1>
        <p className={`${FG_R} mt-5 max-w-[34em] text-[17px] leading-7 text-[#6a7282]`}>
          Copy a creator from the side panel. Paste into Gmail. The brand gets a live card — photo, platforms, audience — not a screenshot.
        </p>
      </section>

      <section ref={track} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden" style={{ transform: `translateY(${stageShift}vh)` }}>
          <div className="absolute inset-x-3 md:inset-x-8 top-[8%] bottom-[6%] rounded-[18px] bg-[#2b2b2f] shadow-[0_30px_80px_rgba(16,24,40,0.28)] overflow-hidden flex flex-col" style={{ opacity: lerp(0.4, 1, enter) }}>
            <div className="h-10 shrink-0 bg-[#3c3c42] flex items-center px-3 gap-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-4 h-6 flex-1 max-w-[420px] rounded-md bg-[#2b2b2f] text-[11px] text-white/50 flex items-center px-3">mail.google.com</div>
              <div className="ml-auto flex items-center gap-1.5 pr-1">
                <span className="size-6 rounded bg-[#185abc] text-white text-[10px] font-semibold flex items-center justify-center">F</span>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 bg-[#e9eef6]">
              <div className="relative flex-1 min-w-0 p-4 md:p-7 flex items-start justify-center">
                <div
                  className="w-full max-w-[720px] bg-white rounded-[12px] shadow-[0_16px_48px_rgba(16,24,40,0.18)] overflow-hidden"
                  style={{ transform: `scale(${mailScale})`, transformOrigin: "top center" }}
                >
                  <div className="h-11 border-b border-[#eeefef] flex items-center px-4">
                    <p className={`${FG_M} text-[14px] flex-1`}>New Message</p>
                    <span className="text-[#6a7282] text-sm">—   ☐   ×</span>
                  </div>
                  <div className="px-4 py-2 border-b border-[#f1f2f4] text-[12px] text-[#6a7282]">Recipients</div>
                  <div className="px-4 py-2 border-b border-[#f1f2f4] text-[12px] text-[#6a7282]">Subject</div>
                  <div className="p-4 min-h-[340px] relative">
                    <div style={{ opacity: embedOp }}>
                      <div className="flex gap-3 items-start mb-3">
                        <img src={img.talent2} alt="" className="size-12 rounded-full object-cover" />
                        <div>
                          <p className={`${FG_SB} text-[14px] leading-none`}>Io Marin</p>
                          <p className="text-[11px] text-[#6a7282] mt-1">Lisbon · 28 · Female</p>
                          <p className="text-[11px] text-[#185abc] mt-1">164K · 89K · 12K</p>
                        </div>
                      </div>
                      <p className={`${FG_R} text-[13px] leading-5 text-[#344054] max-w-[540px] mb-3`}>
                        Io is a movement creator known for rooftop sessions and late miles. Vale Studio roster example for demonstration only.
                      </p>
                      <a className="text-[12px] text-[#185abc]" href="#">View Media Kit →</a>
                      <div className="mt-3 rounded-xl border border-[#e8eaed] p-4 grid grid-cols-3 gap-4" style={{ opacity: proof }}>
                        <StatCol title="Instagram Posts" rows={[["Avg Reach", "688.9"], ["Avg Views", "247.5"], ["Eng. rate", "2.9%"]]} />
                        <StatCol title="Audience" rows={[["ES", "85.8%"], ["Female", "68.6%"], ["25–34", "31%"]]} />
                        <StatCol title="Age" rows={[["18–24", "20%"], ["25–34", "31%"], ["35–44", "18%"]]} />
                      </div>
                    </div>
                    {embedOp < 0.15 && (
                      <p className={`${FG_R} text-[13px] text-[#98a2b3]`} style={{ opacity: 1 - copied }}>Start writing, or paste a Foam card…</p>
                    )}
                  </div>
                </div>
              </div>

              <aside className="shrink-0 bg-white border-l border-[#e6e8ec] flex flex-col" style={{ width: `${panelW}%` }}>
                <div className="h-12 border-b border-[#eef0f3] flex items-center px-3 gap-2">
                  <span className="size-6 rounded bg-[#185abc] text-white text-[10px] font-semibold flex items-center justify-center">F</span>
                  <p className={`${FG_M} text-[12px] truncate`}>Foam</p>
                </div>
                <div className="px-3 pt-3 flex gap-4 text-[12px] text-[#6a7282]">
                  <span className={`${FG_M} text-[#101828] border-b-2 border-[#101828] pb-2`}>Talent</span>
                  <span className="pb-2">Lists</span>
                  <span className="pb-2">Media Kits</span>
                </div>
                <div className="px-3 py-3 flex items-center justify-between">
                  <span className="h-7 px-3 rounded-full border border-[#e6e8ec] text-[11px]">All Talent</span>
                  <span className="text-[#6a7282] text-sm">+</span>
                </div>
                <div className="px-3 grid grid-cols-2 gap-2">
                  {TALENT.map((t, i) => (
                    <div key={t.name} className="relative">
                      <img src={t.img} alt="" className="w-full aspect-square object-cover rounded-[10px]" />
                      <p className="text-[10px] mt-1 truncate text-[#344054]">{t.short}</p>
                      {i === 1 && copied > 0.15 && copied < 0.95 && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] bg-[#185abc] text-white rounded-full px-2 py-0.5">Copied</span>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          {flyingVisible && (
            <div
              className="absolute z-40 overflow-hidden bg-white shadow-[0_24px_60px_rgba(16,24,40,0.28)] pointer-events-none"
              style={{
                left: `${cardL}%`,
                top: `${cardT}%`,
                width: `${cardW}%`,
                height: `${cardH}%`,
                borderRadius: `${cardR}px`,
                opacity: 1 - land * 0.85,
                transform: `rotate(${lerp(6, 0, fly)}deg)`,
              }}
            >
              <img src={img.talent2} alt="" className="size-full object-cover" />
            </div>
          )}

          <div
            className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: cursorOn ? 1 : 0, left: `${cursorL}%`, top: `${cursorT}%` }}
          />
        </div>
      </section>

      <section className="px-6 py-24 max-w-[1100px] mx-auto" style={{ opacity: lerp(0.35, 1, hold) }}>
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>What just happened</p>
        <h2 className={`${FG_SB} text-[36px] md:text-[48px] leading-[1.02] tracking-[-1.2px] max-w-[18ch] mb-6`}>
          The extension is the shortest path from roster to send.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-[15px] leading-7 text-[#6a7282]">
          <p>Side panel stays on Gmail, Instagram, anywhere you work. Talent, lists and kits in one strip.</p>
          <p>Copy drops a live card, not a screenshot. Platforms and audience travel with the name.</p>
          <p>Brand opens the mail and can go straight to the kit. No “I’ll send numbers later.”</p>
        </div>
        <div className="mt-10 flex gap-4">
          <Link to="/demo" className={`${FG_SB} h-12 px-6 rounded-full bg-[#c6f31e] text-[#101828] inline-flex items-center`}>Get a demo</Link>
          <Link to="/features" className={`${FG_M} h-12 px-6 rounded-full border border-[#d0d5dd] inline-flex items-center`}>All features</Link>
        </div>
      </section>
    </div>
  );
}
