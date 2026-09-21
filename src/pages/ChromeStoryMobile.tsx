import { Link } from "react-router";
import { MobileFade } from "../components/MobileFade";
import { websiteContentStats, websiteProfile, websiteSamantha } from "../data/websiteTalent";

const A = `${import.meta.env.BASE_URL}assets`;
const BAG = `${A}/chrome-store.webp`;
const FG_R = "font-founders font-normal";
const FG_M = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";
const STORE = "https://chromewebstore.google.com/detail/foam-the-essential-chrome/iocblckedogkccdepdjfceomgncpeadf";
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

/** Mobile Chrome story: static product frames, no scroll scrub. */
export function ChromeStoryMobile({ embedded = false }: { embedded?: boolean } = {}) {
  return (
    <div className="bg-white text-[#101828]">
      {!embedded && (
        <div className="sticky top-0 z-[70] flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-[#eeefef]">
          <Link to="/" className="text-[12px] text-[#101828]/70">← Home</Link>
          <span className="text-[10px] uppercase tracking-[1px] text-[#5a6408]">Chrome story</span>
        </div>
      )}

      <section className={`px-5 pb-8 max-w-[640px] mx-auto ${embedded ? "pt-12" : "pt-10"}`}>
        <MobileFade>
          <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-3`}>Foam for Chrome</p>
          <h2 className={`${FG_SB} text-[32px] leading-[1.05] tracking-[-1px] max-w-[16ch]`}>
            Pick the talent. Choose Detail. Paste the pitch.
          </h2>
          <p className={`${FG_R} mt-4 max-w-[36em] text-[15px] leading-6 text-[#6a7282]`}>
            The side panel stays on Gmail. Open a creator, decide what the brand sees, drop it into the draft.
          </p>
        </MobileFade>
      </section>

      <section className="px-5 pb-12">
        <MobileFade>
          <div className="rounded-[16px] overflow-hidden border border-[#e2e4e8] shadow-[0_20px_50px_rgba(16,24,40,0.12)] bg-white">
            <div className="h-9 bg-[#3c3c42] flex items-center px-3 gap-2">
              <span className="size-2 rounded-full bg-[#ff5f57]" />
              <span className="size-2 rounded-full bg-[#febc2e]" />
              <span className="size-2 rounded-full bg-[#28c840]" />
              <div className="ml-2 h-5 flex-1 rounded-md bg-[#2b2b2f] text-[10px] text-white/50 flex items-center px-2">
                mail.google.com
              </div>
            </div>
            <div className="p-4 bg-[#f4f6fb]">
              <div className="bg-white rounded-[12px] border border-[#eeefef] overflow-hidden mb-3">
                <div className="h-10 border-b border-[#eeefef] flex items-center px-3">
                  <p className={`${FG_M} text-[13px] flex-1`}>New Message</p>
                </div>
                <div className="p-3">
                  <div className="flex gap-3 items-start mb-3">
                    <img src={SAMANTHA.portrait} alt={`${SAMANTHA.name} portrait`} loading="lazy" className="size-11 rounded-full object-cover object-top" />
                    <div>
                      <p className={`${FG_SB} text-[14px]`}>{SAMANTHA.name}</p>
                      <p className="text-[11px] text-[#6a7282]">{SAMANTHA.loc} · {SAMANTHA.age}</p>
                      <p className="text-[11px] text-[#185abc]">IG {SAMANTHA.ig.n} · TT {SAMANTHA.tt.n} · YT {SAMANTHA.yt.n}</p>
                    </div>
                  </div>
                  <p className="bg-white text-[9px] text-[#6a7282] mb-2">Made with AI · Demo profile</p>
                  <p className={`${FG_R} text-[13px] leading-5 text-[#344054] mb-3`}>
                    {BIO}
                  </p>
                  <p className="text-[12px] text-[#185abc] mb-3">View Media Kit →</p>
                  <div className="rounded-xl border border-[#e8eaed] p-3 grid grid-cols-1 gap-3">
                    <StatBlock title="Featured posts · Demo" rows={CONTENT_STATS} />
                    <StatBlock title="Platforms" rows={SAMANTHA.platforms.map((platform) => [platform.label, platform.count])} />
                  </div>
                </div>
                <div className="h-11 border-t border-[#eeefef] flex items-center px-3">
                  <span className="h-8 px-4 rounded-full text-[13px] inline-flex items-center bg-[#0b57d0] text-white">Send</span>
                </div>
              </div>
              <div className="bg-white rounded-[12px] border border-[#eeefef] p-4 text-center">
                <figure className="mb-2">
                  <img src={SAMANTHA.portrait} alt={`${SAMANTHA.name} portrait`} loading="lazy" className="size-16 mx-auto rounded-[12px] object-cover object-top" />
                  <figcaption className="bg-white text-[8px] text-[#6a7282] py-1">Made with AI</figcaption>
                </figure>
                <p className={`${FG_SB} text-[15px]`}>{SAMANTHA.name}</p>
                <p className="text-[11px] text-[#6a7282] mb-3">{SAMANTHA.loc} · {SAMANTHA.age}</p>
                <div className="flex gap-2">
                  {(["Basic", "Detail", "Text"] as const).map((lab) => (
                    <span
                      key={lab}
                      className={`flex-1 h-8 rounded-full text-[11px] inline-flex items-center justify-center border ${
                        lab === "Detail" ? "bg-[#c6f31e] border-[#c6f31e] text-[#101828]" : "border-[#d0d5dd]"
                      }`}
                    >
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </MobileFade>

        <MobileFade className="mt-14 text-center px-2" delayMs={80}>
          <a href={STORE} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center">
            <img src={BAG} alt="Chrome Extension" width={160} height={140} className="w-[160px] h-[140px] object-contain" />
            <span className={`${FG_SB} mt-8 text-[28px] leading-[1.1] tracking-[-1px] text-[#101828]`}>
              That's the Chrome Extension
            </span>
          </a>
        </MobileFade>
      </section>
    </div>
  );
}
