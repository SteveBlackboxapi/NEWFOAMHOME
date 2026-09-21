import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { ChromeStoryMobile } from "./ChromeStoryMobile";
import { websiteAria, websiteContentStats, websiteProfile, websiteSamantha } from "../data/websiteTalent";

const A = `${import.meta.env.BASE_URL}assets`;
const BAG = `${A}/chrome-store.webp`;
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

const STORE = "https://chromewebstore.google.com/detail/foam-the-essential-chrome/iocblckedogkccdepdjfceomgncpeadf";

const WALLPAPER =
  "radial-gradient(ellipse 36% 90% at 100% 42%, rgba(198,243,30,0.95) 0%, rgba(198,243,30,0.18) 38%, transparent 62%)," +
  "linear-gradient(180deg, #070707 0%, #111111 26%, #f3efe6 46%, #c9daf0 68%, #8eb6de 100%)";

// The animated cursor selects the second tile, then carries Samantha into Gmail.
const TALENT = [websiteAria, websiteSamantha].map(websiteProfile);
const SAMANTHA = websiteProfile(websiteSamantha);
const BIO = `${SAMANTHA.bio.split(". ")[0]}.`;
const CONTENT_STATS = websiteContentStats(websiteSamantha.content.slice(0, 4))
  .map(([value, label]): [string, string] => [label, value]);

function StatBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className={`${FG_M} text-[11px] text-[#101828] mb-1.5`}>{title}</p>
      {rows.map(([label, val]) => (
        <div key={label} className="flex gap-2 text-[11px] leading-5">
          <span className="text-[#101828] w-16 shrink-0">{val}</span>
          <span className="text-[#6a7282]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function ChromeStoryDesktop({ embedded = false }: { embedded?: boolean } = {}) {
  const track = useRef<HTMLElement | null>(null);
  const [p, setProg] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const total = Math.max(el.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      setProg(passed / total);
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
  const paste = ease(range(p, 0.52, 0.64));
  const proof = ease(range(p, 0.62, 0.74));
  const aimSend = ease(range(p, 0.74, 0.84));
  const sent = range(p, 0.84, 0.88);
  const foldMail = range(p, 0.86, 0.91);
  const flyMail = range(p, 0.90, 0.97);
  const lockupIn = ease(range(p, 0.91, 0.99));
  const cursorL = aimSend > 0.02 ? lerp(42, 24, aimSend) : aimPaste > 0.02 ? lerp(86, 42, aimPaste) : aimDetail > 0.02 ? lerp(84, 86, aimDetail) : lerp(58, 84, aimTile);
  const cursorT = aimSend > 0.02 ? lerp(48, 78, aimSend) : aimPaste > 0.02 ? lerp(86, 48, aimPaste) : aimDetail > 0.02 ? lerp(42, 86, aimDetail) : lerp(28, 42, aimTile);
  const cursorOn = aimTile > 0.08 && foldMail < 0.15;
  return (
    <div className="bg-white text-[#101828]">
      {!embedded && (
        <div className="fixed top-4 left-4 z-[70] flex items-center gap-3">
          <Link to="/" className="text-[12px] text-[#101828]/70">← Home</Link>
          <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Chrome story</span>
        </div>
      )}
      <section className={`px-6 pb-10 max-w-[1100px] mx-auto ${embedded ? "pt-16" : "pt-24"}`}>
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>Foam for Chrome</p>
        <h1 className={`${FG_SB} text-[40px] md:text-[64px] leading-[0.96] tracking-[-1.8px] max-w-[16ch]`}>Pick the talent. Choose Detail. Paste the pitch.</h1>
        <p className={`${FG_R} mt-5 max-w-[36em] text-[17px] leading-7 text-[#6a7282]`}>The side panel stays on Gmail. Open a creator, decide what the brand sees, drop it into the draft.</p>
      </section>
      <section ref={track} className="relative h-[320vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-white">
          <div className="absolute inset-0 scale-110" style={{ background: WALLPAPER, filter: "blur(28px)", opacity: 1 - foldMail }} />
          <div className="absolute inset-0" style={{ background: WALLPAPER, opacity: 0.4 * (1 - foldMail) }} />
          <div className="absolute inset-x-3 md:inset-x-8 top-[8%] bottom-[6%] rounded-[16px] bg-[#2b2b2f] shadow-[0_40px_90px_rgba(0,0,0,0.38)] overflow-hidden flex flex-col" style={{ opacity: lerp(0.45, 1, enter) * (1 - foldMail) }}>
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
                    <span className="text-[#6a7282] text-sm">-   ☐   ×</span>
                  </div>
                  <div className="px-4 py-2 border-b border-[#f1f2f4] text-[12px] text-[#6a7282]">Recipients</div>
                  <div className="px-4 py-2 border-b border-[#f1f2f4] text-[12px] text-[#6a7282]">Subject</div>
                  <div className="p-4 min-h-[360px]">
                    <div style={{ opacity: paste }}>
                      <div className="flex gap-3 items-start mb-3">
                        <img src={SAMANTHA.portrait} alt={`${SAMANTHA.name} portrait`} className="size-11 rounded-full object-cover object-top" />
                        <div>
                          <p className={`${FG_SB} text-[14px]`}>{SAMANTHA.name}</p>
                          <p className="text-[11px] text-[#6a7282]">{SAMANTHA.loc} · {SAMANTHA.age}</p>
                          <p className="text-[11px] text-[#185abc]">IG {SAMANTHA.ig.n} · TT {SAMANTHA.tt.n} · YT {SAMANTHA.yt.n}</p>
                        </div>
                      </div>
                      <p className="bg-white text-[9px] text-[#6a7282] mb-2">Made with AI · Demo profile</p>
                      <p className={`${FG_R} text-[13px] leading-5 text-[#344054] max-w-[560px] mb-3`}>{BIO}</p>
                      <p className="text-[12px] text-[#185abc] mb-3">View Media Kit →</p>
                      <div className="rounded-xl border border-[#e8eaed] p-4 grid grid-cols-3 gap-5" style={{ opacity: proof }}>
                        <StatBlock title="Featured posts · Demo" rows={CONTENT_STATS} />
                        <StatBlock title="Platforms" rows={[["Instagram", SAMANTHA.ig.n], ["TikTok", SAMANTHA.tt.n], ["YouTube", SAMANTHA.yt.n]]} />
                        <StatBlock title="Profile" rows={[["Years old", SAMANTHA.age], ["LinkedIn", SAMANTHA.li.n], ["Total audience", SAMANTHA.totalShort]]} />
                      </div>
                    </div>
                  </div>
                  <div className="h-12 border-t border-[#eeefef] flex items-center px-3 gap-2">
                    <span className={`h-8 px-4 rounded-full text-[13px] inline-flex items-center ${sent > 0.4 ? "bg-[#185abc] text-white scale-95" : "bg-[#0b57d0] text-white"}`}>{sent > 0.55 ? "Sent" : "Send"}</span>
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
                    <div className="px-3 py-3"><span className="h-7 px-3 rounded-full border border-[#e6e8ec] text-[11px]">All Talent</span></div>
                    <div className="px-3 grid grid-cols-2 gap-2">
                      {TALENT.map((t) => (
                        <div key={t.id}>
                          <figure className="rounded-[10px] overflow-hidden bg-white">
                            <img src={t.portrait} alt={`${t.name} portrait`} loading="lazy" className="w-full aspect-square object-cover object-top" />
                            <figcaption className="bg-white text-[8px] text-[#6a7282] py-1">Made with AI</figcaption>
                          </figure>
                          <p className="text-[10px] mt-1 truncate">{t.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 overflow-hidden px-4 py-4 text-center">
                    <figure className="mb-3">
                      <img src={SAMANTHA.portrait} alt={`${SAMANTHA.name} portrait`} className="size-24 mx-auto rounded-[12px] object-cover object-top" />
                      <figcaption className="bg-white text-[8px] text-[#6a7282] py-1">Made with AI</figcaption>
                    </figure>
                    <p className={`${FG_SB} text-[16px]`}>{SAMANTHA.name}</p>
                    <p className="text-[11px] text-[#6a7282] mb-2">{SAMANTHA.loc} · {SAMANTHA.age}</p>
                    <p className="text-[12px] text-[#185abc] mb-3">{SAMANTHA.ig.n} · {SAMANTHA.tt.n} · {SAMANTHA.yt.n}</p>
                    <div className="flex justify-center gap-2 mb-3">{websiteSamantha.verticals.map((tag) => (<span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4f5f7]">{tag}</span>))}</div>
                    <p className={`${FG_R} text-[11px] leading-4 text-[#4a5565] text-left mb-4`}>{BIO}</p>
                    <p className="text-left text-[11px] text-[#6a7282] mb-2">Choose what is included in embeds</p>
                    <div className="text-left text-[12px] space-y-2 mb-4">
                      <div className="flex justify-between"><span>Include Biography</span><span className="w-8 h-4 rounded-full bg-[#185abc]" /></div>
                      <div className="flex justify-between"><span>Include primary media kit</span><span className="w-8 h-4 rounded-full bg-[#185abc]" /></div>
                    </div>
                    <div className="flex gap-2">
                      {(["Basic", "Detail", "Text"] as const).map((lab) => (
                        <span key={lab} className={`flex-1 h-8 rounded-full text-[11px] inline-flex items-center justify-center border ${lab === "Detail" && detailOn ? "bg-[#c6f31e] border-[#c6f31e] text-[#101828]" : "border-[#d0d5dd]"}`}>{lab}</span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
          <div className="pointer-events-none absolute z-50 size-8 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 -translate-x-1/2 -translate-y-1/2" style={{ opacity: cursorOn ? 1 : 0, left: `${cursorL}%`, top: `${cursorT}%` }} />
          <svg viewBox="0 0 120 72" className="absolute z-[80] drop-shadow-[0_16px_28px_rgba(16,24,40,0.28)]" style={{ width: lerp(90, 160, flyMail), opacity: foldMail * (1 - lockupIn), left: `${lerp(28, 118, flyMail)}%`, top: `${lerp(58, 18, flyMail) + Math.sin(flyMail * Math.PI) * -8}%`, transform: `rotate(${lerp(-18, 16, flyMail)}deg)` }}>
            <path d="M6 38 L114 6 L60 40 L50 66 L44 40 Z" fill="#0b57d0" />
            <path d="M44 40 L114 6 L60 40 Z" fill="#d6e4ff" />
          </svg>
          <a href={STORE} target="_blank" rel="noreferrer" className="absolute inset-0 z-[70] flex flex-col items-center justify-center px-6" style={{ opacity: lockupIn, transform: `translateY(${(1 - lockupIn) * 18}px)` }}>
            <img src={BAG} alt="Chrome Extension" width={200} height={174} className="w-[200px] h-[174px] object-contain" />
            <span className={`${FG_SB} mt-10 text-[40px] md:text-[64px] leading-none tracking-[-2px] text-[#101828] text-center`}>That's the Chrome Extension</span>
          </a>
        </div>
      </section>
    </div>
  );
}

export function ChromeStory({ embedded = false }: { embedded?: boolean } = {}) {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) {
    return <div className="min-h-[40vh] bg-white" aria-hidden />;
  }
  return isDesktop ? <ChromeStoryDesktop embedded={embedded} /> : <ChromeStoryMobile embedded={embedded} />;
}
