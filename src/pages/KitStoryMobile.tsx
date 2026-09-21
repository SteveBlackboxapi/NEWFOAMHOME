import { Link } from "react-router";
import { MobileFade } from "../components/MobileFade";
import { ChromeStoryMobile } from "./ChromeStoryMobile";
import {
  formatWebsiteMetric,
  websiteContentStats,
  websiteProfile,
  websiteSamantha,
} from "../data/websiteTalent";

const A = `${import.meta.env.BASE_URL}assets`;
const CLIP = `${A}/io-portrait-web.mp4`;
const POSTER = `${A}/io-portrait-poster.webp`;
const FG_R = "font-founders font-normal";
const FG_M = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

/** Staged demo talent (same kit as desktop kit-story). Not a real person. */
const TALENT = {
  ...websiteProfile(websiteSamantha),
  kitName: "Samantha-Pikka-haircare'26",
};
const CONTENT = websiteSamantha.content.slice(0, 4);
const CONTENT_STATS = websiteContentStats(CONTENT);
const PLATFORM_LABELS = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

function Plat({ label, val, handle }: { label: string; val: string; handle: string }) {
  return (
    <div className="min-w-[72px]">
      <p className="text-[11px] opacity-70 mb-1">{label}</p>
      <p className="text-[20px] font-semibold leading-none">{val}</p>
      {handle ? <p className="text-[11px] opacity-70 mt-1 truncate">{handle}</p> : null}
    </div>
  );
}

function MobileKitCard() {
  return (
    <div className="rounded-[18px] overflow-hidden border border-[#e2e4e8] bg-white shadow-[0_18px_48px_rgba(16,24,40,0.14)]">
      <div className="h-11 border-b border-[#e6e8ec] flex items-center px-3 gap-2 bg-white">
        <span className="size-6 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
        <p className={`${FG_R} text-[12px] text-[#6a7282] truncate`}>
          Media kits / <span className={`${FG_M} text-[#101828]`}>{TALENT.kitName}</span>
        </p>
        <span className={`${FG_M} ml-auto h-8 rounded-full bg-[#185abc] text-white text-[12px] px-3 inline-flex items-center`}>
          Share
        </span>
      </div>
      <div className="bg-[#F4E6C8]">
        <div className="px-5 pt-5 pb-6">
          <div className="flex justify-end mb-6">
            <span className="border border-[#7a0036]/40 text-[#7a0036] rounded-full px-3.5 py-1 text-[12px]">Contact</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex-1 min-w-0">
              <p className={`${FG_SB} text-[#7a0036] text-[28px] leading-[0.95] tracking-[-0.8px] mb-3`}>{TALENT.name}</p>
              <p className={`${FG_R} text-[13px] text-[#101828] mb-4`}>
                {TALENT.loc}&nbsp;|&nbsp;{TALENT.age} yo&nbsp;|&nbsp;{TALENT.gender}
              </p>
              <div className="flex gap-2 mb-4">
                {["IG", "TT", "YT"].map((lab) => (
                  <span key={lab} className="size-9 rounded-full border border-[#7a0036]/40 text-[#7a0036] text-[11px] font-semibold inline-flex items-center justify-center">
                    {lab}
                  </span>
                ))}
              </div>
              <div className="inline-flex flex-col rounded-2xl bg-[#7a0036]/10 text-[#7a0036] px-4 py-2.5">
                <span className="text-[11px] opacity-70 mb-0.5">Verticals</span>
                <span className="text-[14px]">{TALENT.verticals}</span>
              </div>
            </div>
            <figure className="w-[38%] shrink-0 rounded-[14px] overflow-hidden bg-white">
              <img src={TALENT.portrait} alt={`${TALENT.name} portrait`} loading="lazy" className="w-full aspect-square object-cover object-top" />
              <figcaption className={`${FG_R} bg-white px-2 py-1.5 text-[9px] text-[#6a7282]`}>Made with AI</figcaption>
            </figure>
          </div>
        </div>
        <div className="bg-[#7a0036] text-[#F4E6C8] px-5 py-6">
          <p className={`${FG_SB} text-[18px]`}>Platforms</p>
          <p className={`${FG_SB} text-[32px] leading-none mt-1`}>{TALENT.total}</p>
          <p className="text-[11px] opacity-70 mt-1 mb-5">Total audience</p>
          <div className="flex gap-5 flex-wrap mb-5">
            {TALENT.platforms.map((platform) => (
              <Plat key={platform.network} label={platform.label} val={platform.count} handle={platform.handle} />
            ))}
          </div>
          <p className={`${FG_R} text-[14px] leading-6 opacity-95`}>{TALENT.bio}</p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={`${FG_SB} text-[15px] text-[#101828]`}>Featured content</p>
            <span className={`${FG_R} text-[10px] text-[#6a7282]`}>Demo figures</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 items-start mb-6">
            {CONTENT.map((tile) => (
              <figure key={tile.thumb} className="rounded-[12px] overflow-hidden bg-white">
                <div className="relative bg-[#ead9b8]" style={{ aspectRatio: tile.aspectRatio || "9/16" }}>
                  <img src={tile.thumb} alt={`${TALENT.name}: ${tile.caption}`} loading="lazy" className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 px-2 py-2 text-white bg-gradient-to-t from-black/70 to-transparent">
                    <p className={`${FG_M} text-[10px]`}>{tile.views !== undefined ? `${formatWebsiteMetric(tile.views)} views` : "New content"}</p>
                    <p className={`${FG_R} text-[9px] text-white/80`}>{PLATFORM_LABELS[tile.platform]}</p>
                  </div>
                </div>
                <figcaption className={`${FG_R} bg-white px-2 py-1.5 text-[9px] text-[#6a7282]`}>Made with AI</figcaption>
              </figure>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={`${FG_SB} text-[15px] text-[#101828]`}>Instagram</p>
            <span className={`${FG_R} text-[10px] text-[#6a7282]`}>Featured posts · Demo data</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {CONTENT_STATS.map(([val, lab]) => (
              <div key={lab} className="rounded-[12px] bg-[#f7efe0] border border-[#ead9b8] px-3.5 py-3">
                <p className={`${FG_SB} text-[20px] leading-none text-[#101828]`}>{val}</p>
                <p className={`${FG_R} text-[12px] text-[#6a7282] mt-1`}>{lab}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[12px] bg-[#f7efe0] border border-[#ead9b8] px-3.5 py-3">
            <p className={`${FG_R} text-[12px] text-[#6a7282]`}>Instagram followers</p>
            <p className={`${FG_SB} text-[26px] leading-none text-[#101828] mt-1`}>{TALENT.ig.n}</p>
            <p className={`${FG_R} text-[12px] text-[#7a0036] mt-1`}>{TALENT.ig.h} · Demo profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileShareCard() {
  return (
    <div className="rounded-[16px] bg-white border border-[#e2e4e8] shadow-[0_16px_40px_rgba(16,24,40,0.12)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#eeefef] flex justify-between items-center">
        <p className={`${FG_M} text-[15px]`}>Share</p>
        <span className="text-[#6a7282]">×</span>
      </div>
      <div className="p-4">
        <p className={`${FG_R} text-[13px] text-[#6a7282] mb-3`}>{TALENT.kitName}</p>
        <div className="h-11 rounded-full border border-[#185abc] flex items-center px-3 gap-2">
          <span className={`${FG_R} text-[12px] truncate flex-1 text-[#101828]`}>https://foam.io/m/samantha-pikka</span>
          <span className={`${FG_M} text-[12px] rounded-full px-3 py-1 bg-[#185abc] text-white`}>Copied</span>
        </div>
      </div>
    </div>
  );
}

function MobileRoles() {
  const CARDS = [
    { kicker: "I manage talent", headline: "Pitch your roster with numbers a brand can believe.", cta: "For managers", to: "/managers" },
    { kicker: "I'm a creator", headline: "Connect your accounts. Help your manager make the case.", cta: "For creators", to: "/creators" },
    { kicker: "I'm a brand or agency", headline: "Someone sent you a Foam link. Here's what's behind it.", cta: "For brands", to: "/brands" },
  ];
  return (
    <section className="bg-white px-5 py-16" id="after-share">
      <MobileFade>
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] text-center mb-3`}>Start here</p>
        <p className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-[#101828] text-center mb-8`}>
          Who are you in the deal?
        </p>
      </MobileFade>
      <div className="flex flex-col gap-4 max-w-[480px] mx-auto">
        {CARDS.map((card, i) => (
          <MobileFade key={card.to} delayMs={i * 60}>
            <Link
              to={card.to}
              className="block rounded-[20px] border border-[#e8e8e8] bg-white p-6 min-h-[140px] flex flex-col active:border-[#c6f31e] active:bg-[#c6f31e]"
            >
              <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-[#6a7282] mb-3`}>{card.kicker}</p>
              <p className={`${FG_SB} text-[20px] leading-7 tracking-[-0.4px] text-[#101828] flex-1`}>{card.headline}</p>
              <p className={`${FG_M} text-[15px] text-[#6a7282] mt-5 flex items-center justify-between`}>
                {card.cta}
                <span>↗</span>
              </p>
            </Link>
          </MobileFade>
        ))}
      </div>
    </section>
  );
}

function MobileNetwork() {
  const STATS = [
    { val: "1,300+", label: "talent managers active every month" },
    { val: "800+", label: "creator agencies active every month" },
    { val: "~6,000", label: "kits, lists, rosters and embeds shared a week" },
    { val: "440,000+", label: "brand and agency opens of kits, lists and rosters" },
  ];
  return (
    <section className="bg-[#0a0a0a] text-white px-5 py-20">
      <MobileFade>
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-white/45 mb-10`}>The network in use</p>
      </MobileFade>
      <div className="grid grid-cols-1 gap-10">
        {STATS.map((s, i) => (
          <MobileFade key={s.val} delayMs={i * 70}>
            <p className={`${FG_SB} text-[48px] tracking-[-1.5px] leading-none mb-3`}>{s.val}</p>
            <p className={`${FG_R} text-[15px] leading-6 text-white/55 max-w-[260px]`}>{s.label}</p>
          </MobileFade>
        ))}
      </div>
    </section>
  );
}

/**
 * Mobile kit-story: same narrative as desktop, normal stacked sections.
 * No sticky scrub, no tall pinned chapters, no scroll-linked timeline.
 */
export function KitStoryMobile() {
  return (
    <div className="text-[#101828] bg-[#eef0f4]">
      <div className="sticky top-0 z-[70] px-4 py-3 bg-black/80 backdrop-blur-sm">
        <Link
          to="/"
          className={`${FG_M} text-[12px] inline-flex items-center gap-2 rounded-full px-3 h-8 border text-white/85 border-white/20 bg-black/30`}
        >
          ← Foam
        </Link>
      </div>

      {/* 1. Truth layer */}
      <section className="relative min-h-[88vh] bg-black text-white flex flex-col justify-end px-5 pb-12 pt-10 overflow-hidden">
        <div className="absolute inset-0">
          <video className="size-full object-cover object-[center_20%] opacity-55" src={CLIP} poster={POSTER} muted loop playsInline autoPlay />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        </div>
        <MobileFade className="relative z-10">
          <p className={`${FG_M} text-[11px] uppercase tracking-[2px] text-white/70 mb-5`}>The truth layer</p>
          <h1 className={`${FG_SB} text-white leading-[0.95] tracking-[-1.5px] max-w-[14ch]`} style={{ fontSize: "clamp(40px, 11vw, 56px)" }}>
            Numbers everyone in the deal can trust.
          </h1>
          <p className={`${FG_R} mt-5 max-w-[34em] text-[16px] leading-7 text-white/85`}>
            Creators connect their data at source. Managers pitch with it. Brands decide on it. No screenshots, no guesswork, no “let me check and get back to you.”
          </p>
          <div className="mt-8 flex items-center gap-5 flex-wrap">
            <Link
              to="/demo"
              className={`${FG_SB} text-[#101828] text-[16px] px-7 h-12 rounded-full inline-flex items-center gap-2`}
              style={{ background: "#c6f31e" }}
            >
              Get a demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
            <a href="#kit-beat" className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/40 pb-[2px]`}>
              Follow a pitch
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </MobileFade>
      </section>

      {/* 2. Kit */}
      <section id="kit-beat" className="px-5 py-14 bg-[#eef0f4]">
        <MobileFade>
          <p className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] mb-3`}>The kit</p>
          <h2 className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-[#101828] mb-3`}>
            Connected numbers. Your colours.
          </h2>
          <p className={`${FG_R} text-[15px] leading-6 text-[#6a7282] mb-8 max-w-[36em]`}>
            {TALENT.name}'s media kit in cream and burgundy. Audience, platforms, and content on one page a brand can open.
          </p>
        </MobileFade>
        <MobileFade delayMs={80}>
          <MobileKitCard />
        </MobileFade>
      </section>

      {/* 3. Numbers / platforms callout */}
      <section className="px-5 py-14 bg-[#7a0036] text-[#F4E6C8]">
        <MobileFade>
          <p className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#F4E6C8]/60 mb-3`}>Platforms</p>
          <p className={`${FG_SB} text-[40px] leading-none tracking-[-1.2px] mb-2`}>{TALENT.total}</p>
          <p className={`${FG_R} text-[14px] opacity-75 mb-8`}>Total demo audience across connected platforms</p>
          <div className="grid grid-cols-2 gap-5">
            {TALENT.platforms.map((platform) => (
              <div key={platform.network}>
                <p className={`${FG_R} text-[12px] opacity-70 mb-1`}>{platform.label}</p>
                <p className={`${FG_SB} text-[22px] leading-none`}>{platform.count}</p>
              </div>
            ))}
          </div>
        </MobileFade>
      </section>

      {/* 4. Share / Shared */}
      <section className="px-5 py-14 bg-[#eef0f4]">
        <MobileFade>
          <p className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] mb-3`}>Share</p>
          <h2 className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-[#101828] mb-3`}>
            Generate the link. Send the kit.
          </h2>
          <p className={`${FG_R} text-[15px] leading-6 text-[#6a7282] mb-8 max-w-[36em]`}>
            One share link. The brand opens the same numbers you just built.
          </p>
        </MobileFade>
        <MobileFade delayMs={60}>
          <MobileShareCard />
        </MobileFade>
        <MobileFade delayMs={120} className="mt-12 text-center">
          <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-3`}>Shared</p>
          <p className={`${FG_SB} text-[32px] leading-[1.02] tracking-[-1.2px] text-[#101828] max-w-[14ch] mx-auto`}>
            What you see is what they get.
          </p>
          <p className={`${FG_R} mt-3 text-[15px] text-[#6a7282] max-w-[28em] mx-auto`}>
            Link copied. Same kit. Same connected numbers. Ready for the inbox.
          </p>
          <div className="mt-6 mx-auto w-full max-w-[360px] rounded-[18px] overflow-hidden border border-[#ead9b8] bg-[#F4E6C8] text-left shadow-[0_18px_50px_rgba(16,24,40,0.14)]">
            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
              <div className="size-12 rounded-[10px] overflow-hidden bg-[#ead9b8] shrink-0">
                <img src={TALENT.portrait} alt={`${TALENT.name} portrait`} loading="lazy" className="size-full object-cover object-top" />
              </div>
              <div className="min-w-0">
                <p className={`${FG_SB} text-[16px] text-[#7a0036]`}>{TALENT.name}</p>
                <p className={`${FG_R} text-[12px] text-[#6a7282]`}>{TALENT.totalShort} total audience</p>
              </div>
            </div>
            <p className={`${FG_R} bg-white px-4 py-1.5 text-[10px] text-[#6a7282]`}>Made with AI · Demo profile</p>
            <div className="px-4 py-3 flex items-center justify-between bg-[#7a0036] text-[#F4E6C8]">
              <span className={`${FG_R} text-[12px] truncate`}>foam.io/m/samantha-pikka</span>
              <span className={`${FG_M} text-[11px] rounded-full bg-white/15 px-2.5 py-1`}>Sent</span>
            </div>
          </div>
        </MobileFade>
      </section>

      {/* 5. Gmail / Chrome */}
      <ChromeStoryMobile embedded />

      {/* 6. Roles + network */}
      <MobileRoles />
      <MobileNetwork />
    </div>
  );
}
