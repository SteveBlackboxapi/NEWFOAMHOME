import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { img } from "../lib/assets";

const A = `${import.meta.env.BASE_URL}assets`;
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

const WALLPAPER =
  "radial-gradient(ellipse 36% 90% at 100% 42%, rgba(198,243,30,0.95) 0%, rgba(198,243,30,0.18) 38%, transparent 62%)," +
  "linear-gradient(180deg, #070707 0%, #111111 26%, #f3efe6 46%, #c9daf0 68%, #8eb6de 100%)";

const TALENT = [
  { name: "Ren Cole", img: img.talent1 },
  { name: "Io Marin", img: img.talent2 },
  { name: "Sable Voss", img: img.talent3 },
];

function StatBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className={`${FG_M} text-[11px] text-[#101828] mb-1.5`}>{title}</p>
      {rows.map(([label, val]) => (
        <div key={label} className="flex gap-2 text-[11px] leading-5">
          <span className="text-[#101828] w-10">{val}</span>
          <span className="text-[#6a7282]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function AfterStory() {
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
    <div className="bg-white" id="after-story">
      <section className="pt-16 pb-6">
        <p className={`${FG_R} text-sm text-[#6a7282] text-center mb-8`}>In good company. Across 800+ creator agencies.</p>
        <div className="overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
          <div className="flex w-max animate-[logoMarquee_90s_linear_infinite]">
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
          <span className="h-9 px-4 rounded-full border border-[#e8e8e8] text-[13px] text-[#6a7282] inline-flex items-center">Pause</span>
        </div>
      </section>
      <section className="px-6 py-10">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-4">
          {CARDS.map((card) => (
            <Link key={card.to} to={card.to} className="rounded-[20px] border border-[#e8e8e8] bg-white p-8 min-h-[220px] flex flex-col hover:border-[#cfcfcf]">
              <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-[#6a7282] mb-4`}>{card.kicker}</p>
              <p className={`${FG_SB} text-[22px] leading-7 tracking-[-0.4px] text-[#101828] flex-1`}>{card.headline}</p>
              <p className={`${FG_M} text-sm text-[#6a7282] mt-8 flex items-center justify-between`}>{card.cta}<span>↗</span></p>
            </Link>
          ))}
        </div>
      </section>
      <section className="px-6 pb-24 pt-6">
        <div className="max-w-[1200px] mx-auto">
          <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-[#6a7282] mb-10`}>The network in use</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STATS.map((s) => (
              <div key={s.val}>
                <p className={`${FG_SB} text-[40px] tracking-[-1px] text-[#101828] leading-none mb-2`}>{s.val}</p>
                <p className={`${FG_R} text-sm text-[#6a7282] max-w-[200px]`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ChromeStory({ embedded = false }: { embedded?: boolean } = {}) {
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

  const enter = ease(range(p, 0.0, 0.06));
  const aimTile = ease(range(p, 0.06, 0.16));
  const openProfile = range(p, 0.16, 0.22);
  const inProfile = openProfile > 0.55;
  const aimDetail = ease(range(p, 0.24, 0.36));
  const detailOn = range(p, 0.36, 0.42) > 0.4;
  const aimPaste = ease(range(p, 0.42, 0.58));
  const paste = ease(range(p, 0.56, 0.7));
  const proof = ease(range(p, 0.66, 0.82));
  const hold = range(p, 0.82, 0.94);

  const cursorL = aimPaste > 0.02 ? lerp(86, 42, aimPaste) : aimDetail > 0.02 ? lerp(84, 86, aimDetail) : lerp(58, 84, aimTile);
  const cursorT = aimPaste > 0.02 ? lerp(86, 48, aimPaste) : aimDetail > 0.02 ? lerp(42, 86, aimDetail) : lerp(28, 42, aimTile);
  const cursorOn = aimTile > 0.08 && paste < 0.95;

  return (
    <div className="bg-[#eef0f4] text-[#101828]">
      {!embedded && (
        <div className="fixed top-4 left-4 z-[70] flex items-center gap-3">
          <Link to="/" className="text-[12px] text-[#101828]/70">← Home</Link>
          <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Chrome story test</span>
          <Link to="/kit-story" className="text-[12px] text-[#101828]/50">Kit story</Link>
        </div>
      )}

      <section className={`px-6 pb-10 max-w-[1100px] mx-auto ${embedded ? "pt-16" : "pt-24"}`}>
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>Foam for Chrome</p>
        <h1 className={`${FG_SB} text-[40px] md:text-[64px] leading-[0.96] tracking-[-1.8px] max-w-[16ch]`}>
          Pick the talent. Choose Detail. Paste the pitch.
        </h1>
        <p className={`${FG_R} mt-5 max-w-[36em] text-[17px] leading-7 text-[#6a7282]`}>
          The side panel stays on Gmail. Open a creator, decide what the brand sees, drop it into the draft.
        </p>
      </section>

      <section ref={track} className="relative h-[360vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0 scale-110" style={{ background: WALLPAPER, filter: "blur(28px)" }} />
          <div className="absolute inset-0 opacity-40" style={{ background: WALLPAPER }} />

          <div className="absolute inset-x-3 md:inset-x-8 top-[8%] bottom-[6%] rounded-[16px] bg-[#2b2b2f] shadow-[0_40px_90px_rgba(0,0,0,0.38)] overflow-hidden flex flex-col" style={{ opacity: lerp(0.45, 1, enter) }}>
            <div className="h-10 shrink-0 bg-[#3c3c42] flex items-center px-3 gap-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-3 h-6 flex-1 max-w-[480px] rounded-md bg-[#2b2b2f] text-[11px] text-white/50 flex items-center px-3">mail.google.com</div>
              <span className="size-6 rounded bg-[#185abc] text-white text-[10px] font-semibold flex items-center justify-center">F</span>
            </div>

            <div className="flex min-h-0 flex-1 bg-[#d3d8de]">
              <div className="relative flex-1 min-w-0 p-5 md:p-8 flex items-start justify-center">
                <div className="w-full max-w-[740px] bg-white rounded-[12px] shadow-[0_18px_50px_rgba(16,24,40,0.2)] overflow-hidden">
                  <div className="h-11 border-b border-[#eeefef] flex items-center px-4">
                    <p className={`${FG_M} text-[14px] flex-1`}>New Message</p>
                    <span className="text-[#6a7282] text-sm">—   ☐   ×</span>
                  </div>
                  <div className="px-4 py-2 border-b border-[#f1f2f4] text-[12px] text-[#6a7282]">Recipients</div>
                  <div className="px-4 py-2 border-b border-[#f1f2f4] text-[12px] text-[#6a7282]">Subject</div>
                  <div className="p-4 min-h-[360px]">
                    <div style={{ opacity: paste }}>
                      <div className="flex gap-3 items-start mb-3">
                        <img src={img.talent2} alt="" className="size-11 rounded-full object-cover" />
                        <div>
                          <p className={`${FG_SB} text-[14px]`}>Io Marin</p>
                          <p className="text-[11px] text-[#6a7282]">Lisbon · 28</p>
                          <p className="text-[11px] text-[#185abc]">164K · 89K · 12K</p>
                        </div>
                      </div>
                      <p className={`${FG_R} text-[13px] leading-5 text-[#344054] max-w-[560px] mb-3`}>
                        Io is a movement creator known for rooftop sessions and late miles. Vale Studio roster — demonstration only.
                      </p>
                      <p className="text-[12px] text-[#185abc] mb-3">View Media Kit →</p>
                      <div className="rounded-xl border border-[#e8eaed] p-4 grid grid-cols-3 gap-5" style={{ opacity: proof }}>
                        <StatBlock title="Instagram Posts Highlights" rows={[["Avg Reach", "688.9"], ["Avg Views", "247.5"], ["Eng. rate", "2.9%"]]} />
                        <StatBlock title="Instagram Audience Summary" rows={[["ES 85.8%", ""], ["Female 68.6%", ""], ["25–34 31%", ""]]} />
                        <StatBlock title="Age" rows={[["18–24", "20%"], ["25–34", "31%"], ["35–44", "18%"]]} />
                      </div>
                    </div>
                  </div>
                  <div className="h-12 border-t border-[#eeefef] flex items-center px-3 gap-2">
                    <span className="h-8 px-4 rounded-full bg-[#0b57d0] text-white text-[13px] inline-flex items-center">Send</span>
                  </div>
                </div>
              </div>

              <aside className="w-[300px] shrink-0 bg-white border-l border-[#e6e8ec] flex flex-col overflow-hidden">
                <div className="h-11 border-b border-[#eef0f3] flex items-center px-3 gap-2">
                  <span className="text-[#6a7282]">{inProfile ? "‹" : ""}</span>
                  <p className={`${FG_M} text-[13px]`}>{inProfile ? "Talent" : "Foam"}</p>
                </div>

                {!inProfile ? (
                  <>
                    <div className="px-3 pt-3 flex gap-4 text-[12px] text-[#6a7282]">
                      <span className={`${FG_M} text-[#101828] border-b-2 border-[#101828] pb-2`}>Talent</span>
                      <span className="pb-2">Lists</span>
                      <span className="pb-2">Media Kits</span>
                    </div>
                    <div className="px-3 py-3 flex items-center justify-between">
                      <span className="h-7 px-3 rounded-full border border-[#e6e8ec] text-[11px]">All Talent</span>
                    </div>
                    <div className="px-3 grid grid-cols-2 gap-2">
                      {TALENT.map((t) => (
                        <div key={t.name}>
                          <img src={t.img} alt="" className="w-full aspect-square object-cover rounded-[10px]" />
                          <p className="text-[10px] mt-1 truncate">{t.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 overflow-hidden px-4 py-4 text-center">
                    <img src={img.talent2} alt="" className="size-24 mx-auto rounded-[12px] object-cover mb-3" />
                    <p className={`${FG_SB} text-[16px]`}>Io Marin</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">Lisbon · 28</p>
                    <p className="text-[12px] text-[#185abc] mb-3">164K · 89K · 12K</p>
                    <div className="flex justify-center gap-2 mb-3">
                      {["Movement", "City", "Film"].map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4f5f7]">{tag}</span>
                      ))}
                    </div>
                    <p className={`${FG_R} text-[11px] leading-4 text-[#4a5565] text-left mb-4`}>
                      Io is a movement creator known for rooftop sessions and late miles.
                    </p>
                    <p className="text-left text-[11px] text-[#6a7282] mb-2">Choose what is included in embeds</p>
                    <div className="text-left text-[12px] space-y-2 mb-4">
                      <div className="flex justify-between"><span>Include Biography</span><span className="w-8 h-4 rounded-full bg-[#f59e0b]" /></div>
                      <div className="flex justify-between"><span>Include primary media kit</span><span className="w-8 h-4 rounded-full bg-[#f59e0b]" /></div>
                    </div>
                    <div className="flex gap-2">
                      {(["Basic", "Detail", "Text"] as const).map((lab) => (
                        <span
                          key={lab}
                          className={`flex-1 h-8 rounded-full text-[11px] inline-flex items-center justify-center border ${
                            lab === "Detail" && detailOn ? "bg-[#c6f31e] border-[#c6f31e] text-[#101828]" : "border-[#d0d5dd]"
                          }`}
                        >
                          {lab}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>

          <div
            className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: cursorOn ? 1 : 0, left: `${cursorL}%`, top: `${cursorT}%` }}
          />
        </div>
      </section>

      <section className="px-6 py-24 max-w-[1100px] mx-auto" style={{ opacity: lerp(0.4, 1, hold) }}>
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>What just happened</p>
        <h2 className={`${FG_SB} text-[36px] md:text-[48px] leading-[1.02] tracking-[-1.2px] max-w-[18ch] mb-6`}>
          Grid. Profile. Detail. Inbox.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-[15px] leading-7 text-[#6a7282]">
          <p>Open the creator in the panel. The roster never leaves Gmail.</p>
          <p>Basic, Detail or Text. You choose how much proof the brand gets.</p>
          <p>Paste. The draft carries the card and a link to the kit.</p>
        </div>
        <div className="mt-10 flex gap-4">
          <Link to="/demo" className={`${FG_SB} h-12 px-6 rounded-full bg-[#c6f31e] text-[#101828] inline-flex items-center`}>Get a demo</Link>
          <Link to="/features" className={`${FG_M} h-12 px-6 rounded-full border border-[#d0d5dd] inline-flex items-center`}>All features</Link>
        </div>
      </section>

      {!embedded && <AfterStory />}
    </div>
  );
}
