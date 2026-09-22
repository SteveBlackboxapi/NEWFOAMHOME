import { DEMO_URL } from "../lib/siteLinks";
import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router";
import { AIDisclosure } from "../components/AIDisclosure";
import { KitFeaturedMedia } from "../components/KitFeaturedMedia";
import { KIT_FEATURED_CONTENT } from "../data/kitFeaturedContent";
import { KitShareStatus } from "../components/KitShareStatus";
import { MediaKitLogo } from "../components/MediaKitLogo";
import {
  KitEditHandle,
  KitPlatformIcon,
  KitVerifiedBadge,
} from "../components/KitDetails";
import type { TalentNetwork } from "../data/stagedTalent";
import { MobileFade } from "../components/MobileFade";
import { KitAudience, KitGrowth, KitMetrics } from "../components/KitAnalytics";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { useScrollRevealProgress } from "../hooks/useScrollRevealProgress";
import { kitMobileCountProgress } from "../lib/kitStoryMotion";
import { ChromeStoryMobile } from "./ChromeStoryMobile";
import { FoundStory } from "./FoundStory";
import {
  formatWebsiteMetric,
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
const PLATFORM_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

function ScrollCount({
  value,
  progress,
  compact = true,
}: {
  value: number;
  progress: number;
  compact?: boolean;
}) {
  const format = compact
    ? formatWebsiteMetric
    : (number: number) => number.toLocaleString("en-US");
  return (
    <>
      <span aria-hidden="true">
        {format(Math.round(value * kitMobileCountProgress(progress)))}
      </span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

function Plat({
  network,
  label,
  amount,
  handle,
  progress,
}: {
  network: TalentNetwork;
  label: string;
  amount: number;
  handle: string;
  progress: number;
}) {
  return (
    <div className="min-w-[72px]">
      <KitPlatformIcon network={network} label={label} />
      <p className="mt-3 flex items-center gap-1.5 text-[20px] font-semibold leading-none tabular-nums">
        <ScrollCount value={amount} progress={progress} />
        <KitVerifiedBadge />
      </p>
      {handle ? (
        <p className="text-[11px] opacity-70 mt-1 truncate">{handle}</p>
      ) : null}
    </div>
  );
}

function MobileAnalyticsSection({
  component: Component,
  reducedMotion,
}: {
  component: ComponentType<{ progress: number; reducedMotion?: boolean }>;
  reducedMotion: boolean;
}) {
  const { ref, progress } = useScrollRevealProgress(reducedMotion);
  return (
    <div ref={ref} data-reveal-progress={progress.toFixed(3)}>
      <Component
        progress={kitMobileCountProgress(progress)}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

function MobileKitCard() {
  const reducedMotion = usePrefersReducedMotion();
  const platforms = useScrollRevealProgress(reducedMotion);
  return (
    <div className="rounded-[18px] overflow-hidden border border-[#e2e4e8] bg-white shadow-[0_18px_48px_rgba(16,24,40,0.14)]">
      <div className="h-11 border-b border-[#e6e8ec] flex items-center px-3 gap-2 bg-white">
        <span className="size-6 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">
          ‹
        </span>
        <p className={`${FG_R} text-[12px] text-[#6a7282] truncate`}>
          Media kits /{" "}
          <span className={`${FG_M} text-[#101828]`}>{TALENT.kitName}</span>
        </p>
        <span
          className={`${FG_M} ml-auto h-8 rounded-full bg-[#185abc] text-white text-[12px] px-3 inline-flex items-center`}
        >
          Share
        </span>
      </div>
      <div className="bg-[#fff6eb]">
        <div className="px-4 pt-4 pb-5 md:px-8 md:pt-6 md:pb-8">
          <div className="flex justify-end mb-4">
            <span className="border border-[#7a0036]/40 text-[#7a0036] rounded-full px-3.5 py-1 text-[12px]">
              Contact
            </span>
          </div>
          <div className="flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <p
                className={`${FG_SB} text-[#7a0036] text-[clamp(22px,6vw,30px)] md:text-[44px] leading-[0.98] tracking-[-0.7px] mb-3`}
              >
                {TALENT.name}
              </p>
              <p
                className={`${FG_R} text-[11px] md:text-[15px] leading-4 md:leading-6 text-[#101828] mb-3`}
              >
                {TALENT.loc}
                <br />
                {TALENT.age} yo · {TALENT.gender}
              </p>
              <div className="flex gap-1.5 mb-3">
                {(["instagram", "tiktok", "youtube"] as const).map(
                  (network) => (
                    <span
                      key={network}
                      className="size-7 rounded-full border border-[#7a0036]/40 text-[#7a0036] text-[9px] font-semibold inline-flex items-center justify-center"
                    >
                      <KitPlatformIcon
                        network={network}
                        label={PLATFORM_LABELS[network]}
                        size={14}
                      />
                    </span>
                  ),
                )}
              </div>
              <div className="inline-flex flex-col rounded-xl bg-[#f6ece4] text-[#7a0036] px-3 py-2">
                <span className="text-[11px] opacity-70 mb-0.5">Verticals</span>
                <span className="text-[11px] md:text-[15px] leading-4 md:leading-6">
                  {TALENT.verticals}
                </span>
              </div>
            </div>
            <figure className="w-[43%] shrink-0">
              <img
                src={TALENT.portrait}
                alt={`${TALENT.name} portrait`}
                loading="lazy"
                className="block w-full aspect-[3/4] rounded-[12px] object-cover object-top"
              />
              <figcaption>
                <AIDisclosure className={FG_R} size={9} />
              </figcaption>
            </figure>
          </div>
        </div>
        <div
          ref={platforms.ref}
          className="relative bg-[#7a0036] text-[#fff6eb] px-4 pt-9 pb-6"
        >
          <KitEditHandle />
          <p className={`${FG_SB} text-[18px]`}>Platforms</p>
          <p className={`${FG_SB} text-[32px] leading-none mt-1 tabular-nums`}>
            <ScrollCount
              value={websiteSamantha.totalAudience}
              progress={platforms.progress}
              compact={false}
            />
          </p>
          <p className="text-[11px] opacity-70 mt-1 mb-5">Total audience</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-5 mb-5">
            {TALENT.platforms.map((platform) => (
              <Plat
                key={platform.network}
                network={platform.network}
                label={platform.label}
                amount={
                  websiteSamantha.platforms.find(
                    (item) => item.network === platform.network,
                  )!.followers
                }
                handle={platform.handle}
                progress={platforms.progress}
              />
            ))}
          </div>
          <p className={`${FG_R} text-[14px] leading-6 opacity-95`}>
            {TALENT.bio}
          </p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={`${FG_SB} text-[15px] text-[#101828]`}>
              Featured content
            </p>
            <span className={`${FG_R} text-[10px] text-[#6a7282]`}>
              Demo figures
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 items-start mb-6">
            {KIT_FEATURED_CONTENT.map((tile) => (
              <figure key={tile.thumb}>
                <KitFeaturedMedia
                  tile={tile}
                  alt={`${TALENT.name}: ${tile.caption}`}
                  className="ks-featured-media-mobile"
                />
                <figcaption>
                  <AIDisclosure className={FG_R} size={9} />
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="space-y-4">
            <MobileAnalyticsSection
              component={KitMetrics}
              reducedMotion={reducedMotion}
            />
            <MobileAnalyticsSection
              component={KitGrowth}
              reducedMotion={reducedMotion}
            />
            <MobileAnalyticsSection
              component={KitAudience}
              reducedMotion={reducedMotion}
            />
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
        <p className={`${FG_R} text-[13px] text-[#6a7282] mb-3`}>
          {TALENT.kitName}
        </p>
        <div className="h-11 rounded-full border border-[#185abc] flex items-center px-3 gap-2">
          <span
            className={`${FG_R} text-[12px] truncate flex-1 text-[#101828]`}
          >
            https://foam.io/m/samantha-pikka
          </span>
          <span
            className={`${FG_M} text-[12px] rounded-full px-3 py-1 bg-[#185abc] text-white`}
          >
            Copied
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileRoles() {
  const CARDS = [
    {
      kicker: "I manage talent",
      headline: "Pitch your roster with numbers a brand can believe.",
      cta: "For managers",
      to: "/managers",
    },
    {
      kicker: "I'm a creator",
      headline: "Connect your accounts. Help your manager make the case.",
      cta: "For creators",
      to: "/creators",
    },
    {
      kicker: "I'm a brand or agency",
      headline: "Someone sent you a Foam link. Here's what's behind it.",
      cta: "For brands",
      to: "/brands",
    },
  ];
  return (
    <section className="bg-white px-5 py-16" id="after-share">
      <MobileFade>
        <p
          className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] text-center mb-3`}
        >
          Start here
        </p>
        <p
          className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-[#101828] text-center mb-8`}
        >
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
              <p
                className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-[#6a7282] mb-3`}
              >
                {card.kicker}
              </p>
              <p
                className={`${FG_SB} text-[20px] leading-7 tracking-[-0.4px] text-[#101828] flex-1`}
              >
                {card.headline}
              </p>
              <p
                className={`${FG_M} text-[15px] text-[#6a7282] mt-5 flex items-center justify-between`}
              >
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
    {
      val: "440,000+",
      label: "brand and agency opens of kits, lists and rosters",
    },
  ];
  return (
    <section className="bg-[#0a0a0a] text-white px-5 py-20">
      <MobileFade>
        <p
          className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-white/45 mb-10`}
        >
          The network in use
        </p>
      </MobileFade>
      <div className="grid grid-cols-1 gap-10">
        {STATS.map((s, i) => (
          <MobileFade key={s.val} delayMs={i * 70}>
            <p
              className={`${FG_SB} text-[48px] tracking-[-1.5px] leading-none mb-3`}
            >
              {s.val}
            </p>
            <p
              className={`${FG_R} text-[15px] leading-6 text-white/55 max-w-[260px]`}
            >
              {s.label}
            </p>
          </MobileFade>
        ))}
      </div>
    </section>
  );
}

/**
 * Mobile kit-story: same narrative as desktop, normal stacked sections.
 * No tall pinned chapters; kit charts reveal with the natural page scroll.
 */
export function KitStoryMobile() {
  const reducedMotion = usePrefersReducedMotion();
  const platformReveal = useScrollRevealProgress(reducedMotion);
  const [motionPreferenceReady, setMotionPreferenceReady] = useState(false);
  useEffect(() => {
    setMotionPreferenceReady(true);
  }, []);
  return (
    <div className="text-[#101828] bg-[#e7ede0]">
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
          {motionPreferenceReady && !reducedMotion ? (
            <video
              className="size-full object-cover object-[center_20%] opacity-55"
              src={CLIP}
              poster={POSTER}
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img
              className="size-full object-cover object-[center_20%] opacity-55"
              src={POSTER}
              alt=""
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        </div>
        <MobileFade className="relative z-10">
          <p
            className={`${FG_M} text-[11px] uppercase tracking-[2px] text-white/70 mb-5`}
          >
            The truth layer
          </p>
          <h1
            className={`${FG_SB} ks-hero-title ks-hero-title-mobile text-white`}
          >
            <span>Numbers that</span> <span>everyone in the</span>{" "}
            <span>deal can trust</span>
          </h1>
          <p
            className={`${FG_R} mt-5 max-w-[34em] text-[16px] leading-7 text-white/85`}
          >
            Creators connect their data at source. Managers pitch with it.
            Brands decide on it. No screenshots, no guesswork, no “let me check
            and get back to you.”
          </p>
          <div className="mt-8 flex items-center gap-5 flex-wrap">
            <a
              href={DEMO_URL}
              className={`${FG_SB} text-[#101828] text-[16px] px-7 h-12 rounded-full inline-flex items-center gap-2`}
              style={{ background: "#c6f31e" }}
            >
              Get a demo
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 12L12 2M12 2H5M12 2V9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </a>
            <a
              href="#kit-beat"
              className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/40 pb-[2px]`}
            >
              Follow a pitch
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 2V10M6 10L2 6M6 10L10 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </MobileFade>
      </section>

      {/* 2. Kit */}
      <section
        id="kit-beat"
        className="mx-auto max-w-[1000px] px-5 py-14 bg-[#e7ede0]"
      >
        <MobileFade>
          <p
            className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] mb-3`}
          >
            The kit
          </p>
          <h2
            className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-[#101828] mb-3`}
          >
            Connected numbers. Your colours.
          </h2>
          <p
            className={`${FG_R} text-[15px] leading-6 text-[#6a7282] mb-8 max-w-[36em]`}
          >
            {TALENT.name}'s media kit in cream and burgundy. Audience,
            platforms, and content on one page a brand can open.
          </p>
        </MobileFade>
        <MobileKitCard />
      </section>

      {/* 3. Numbers / platforms callout */}
      <section className="px-5 py-14 bg-[#7a0036] text-[#fff6eb]">
        <div ref={platformReveal.ref}>
          <p
            className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#fff6eb]/60 mb-3`}
          >
            Platforms
          </p>
          <p
            className={`${FG_SB} text-[40px] leading-none tracking-[-1.2px] mb-2 tabular-nums`}
          >
            <ScrollCount
              value={websiteSamantha.totalAudience}
              progress={platformReveal.progress}
              compact={false}
            />
          </p>
          <p className={`${FG_R} text-[14px] opacity-75 mb-8`}>
            Total demo audience across connected platforms
          </p>
          <div className="grid grid-cols-2 gap-5">
            {TALENT.platforms.map((platform) => (
              <div key={platform.network}>
                <KitPlatformIcon
                  network={platform.network}
                  label={platform.label}
                />
                <p
                  className={`${FG_SB} mt-3 flex items-center gap-1.5 text-[22px] leading-none tabular-nums`}
                >
                  <ScrollCount
                    value={
                      websiteSamantha.platforms.find(
                        (item) => item.network === platform.network,
                      )!.followers
                    }
                    progress={platformReveal.progress}
                  />
                  <KitVerifiedBadge />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Share / Shared */}
      <section className="px-5 py-14 bg-[#e7ede0]">
        <MobileFade>
          <p
            className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-[#6a7282] mb-3`}
          >
            Share
          </p>
          <h2
            className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-[#101828] mb-3`}
          >
            Generate the link. Send the kit.
          </h2>
          <p
            className={`${FG_R} text-[15px] leading-6 text-[#6a7282] mb-8 max-w-[36em]`}
          >
            One share link. The brand opens the same numbers you just built.
          </p>
        </MobileFade>
        <MobileFade delayMs={60}>
          <MobileShareCard />
        </MobileFade>
        <MobileFade delayMs={120} className="mt-12 text-center">
          <p
            className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-3`}
          >
            Shared
          </p>
          <MediaKitLogo className="w-[150px] mx-auto mb-5" />
          <p
            className={`${FG_SB} text-[32px] leading-[1.02] tracking-[-1.2px] text-[#101828] max-w-[14ch] mx-auto`}
          >
            Media Kit
          </p>
          <p
            className={`${FG_R} mt-3 text-[15px] text-[#6a7282] max-w-[28em] mx-auto`}
          >
            <KitShareStatus />
          </p>
          <div className="mt-6 mx-auto w-full max-w-[360px] rounded-[18px] overflow-hidden border border-[#ead9b8] bg-[#fff6eb] text-left shadow-[0_18px_50px_rgba(16,24,40,0.14)]">
            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
              <div className="size-12 rounded-[10px] overflow-hidden bg-[#ead9b8] shrink-0">
                <img
                  src={TALENT.portrait}
                  alt={`${TALENT.name} portrait`}
                  loading="lazy"
                  className="size-full object-cover object-top"
                />
              </div>
              <div className="min-w-0">
                <p className={`${FG_SB} text-[16px] text-[#7a0036]`}>
                  {TALENT.name}
                </p>
                <p className={`${FG_R} text-[12px] text-[#6a7282]`}>
                  {TALENT.totalShort} total audience
                </p>
              </div>
            </div>
            <div className="px-4 pb-3">
              <AIDisclosure className={FG_R} detail="Demo profile" />
            </div>
            <div className="px-4 py-3 flex items-center justify-between bg-[#7a0036] text-[#fff6eb]">
              <span className={`${FG_R} text-[12px] truncate`}>
                foam.io/m/samantha-pikka
              </span>
              <span
                className={`${FG_M} text-[11px] rounded-full bg-white/15 px-2.5 py-1`}
              >
                Sent
              </span>
            </div>
          </div>
        </MobileFade>
      </section>

      {/* 5. Gmail / Chrome */}
      <ChromeStoryMobile embedded />

      {/* 6. Roles + network */}
      <MobileRoles />
      <MobileNetwork />
      <FoundStory />
    </div>
  );
}
