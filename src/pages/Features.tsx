import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";
import { FoamAppScreen } from "../components/FoamAppScreen";

const FEATURES = [
  {
    name: "Media kits",
    tagline: "Connected numbers. Your agency's colours. One link.",
    desc: "Foam pulls live follower counts, audience demographics, and top content from each creator's connected platforms and wraps it in your agency's branding. Every kit updates automatically — no manual refreshes.",
    bullets: ["Live cross-platform stats", "Agency branding built in", "Shareable link, no login required", "Audience age & geo breakdown"],
    color: "bg-raised",
    dark: false,
  },
  {
    name: "Lists & rosters",
    tagline: "Group creators, share via a single link.",
    desc: "Build campaign-specific shortlists or export your full agency roster. Share one link with a brand and they see every creator in context — stats, content, and the manager behind each one.",
    bullets: ["Campaign-scoped shortlists", "Full agency roster view", "Single shareable link per list", "Filter by niche, audience, location"],
    color: "bg-surface",
    dark: false,
  },
  {
    name: "Content search",
    tagline: "Find the moment that makes the case.",
    desc: "Search across your roster's published content by keyword, platform, or performance. Surface the exact post that proves a creator's fit for a brand's brief — without digging through profiles manually.",
    bullets: ["Keyword and platform search", "Performance-ranked results", "Direct link to original post", "Works across Instagram, TikTok, YouTube"],
    color: "bg-raised",
    dark: false,
  },
  {
    name: "Chrome extension",
    tagline: "Embeds a pitch directly into Gmail replies.",
    desc: "Install the Foam Chrome extension and drop a live creator card into any Gmail draft. The recipient sees real follower counts, a photo, and a link to the full media kit — without you leaving the inbox.",
    bullets: ["Works inside Gmail", "Live stats in every embed", "7,000+ embeds per month", "No copy-paste required"],
    color: "bg-dark",
    dark: true,
  },
  {
    name: "Watchlists",
    tagline: "Your recruitment starting point.",
    desc: "Add creators you're tracking but haven't signed yet. Monitor their growth across platforms without them knowing — then reach out when the timing is right.",
    bullets: ["Track unsigned creators", "Growth monitoring over time", "Private to your account", "Converts to roster when signed"],
    color: "bg-surface",
    dark: false,
  },
  {
    name: "Talent notes",
    tagline: "Private, close-kept creator details.",
    desc: "Keep internal notes on any creator in your roster — deal history, brand preferences, rate card notes. Notes are private to your account and never visible to creators or brands.",
    bullets: ["Fully private to your team", "Attached to creator profile", "Never shared in media kits", "Searchable across your roster"],
    color: "bg-raised",
    dark: false,
  },
  {
    name: "Tracking",
    tagline: "See who viewed. Inform your follow-up.",
    desc: "Know when a brand opens your kit — and how long they spent on it. Use that signal to time your follow-up with confidence rather than guessing.",
    bullets: ["Open notifications", "Time-spent per kit", "Per-creator view data", "Follow-up timing signal"],
    color: "bg-surface",
    dark: false,
  },
];

function Hero() {
  return (
    <section className="pt-36 pb-24 px-6 text-center bg-surface">
      <div className="max-w-[760px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
          <div className="size-[6px] rounded-full bg-text" />
          <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>Features</span>
        </div>
        <h1 className={`${FG_SB} text-[60px] md:text-[72px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
          Built around{" "}
          <em className="text-brand not-italic">the pitch</em>
        </h1>
        <p className={`${FG_R} text-lg leading-7 text-muted mb-10 max-w-[520px] mx-auto`}>
          Seven tools covering the full creator pitch lifecycle — from finding proof to delivering the pitch to a brand, then tracking if they opened it.
        </p>
        <Link to="/demo" className={`${FG_M} bg-brand text-white text-[15px] px-8 h-12 rounded-full inline-flex items-center hover:bg-brand-hover transition-colors`}>
          Get a demo
        </Link>
      </div>
    </section>
  );
}

const APP_SCREEN_VARIANTS: Record<string, "roster" | "search"> = {
  "Media kits": "roster",
  "Lists & rosters": "roster",
  "Content search": "search",
};

function FeatureBlock({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const isReversed = i % 2 === 1;
  const appVariant = APP_SCREEN_VARIANTS[f.name];
  return (
    <section className={`py-20 px-6 ${f.color}`}>
      <div className="max-w-[1200px] mx-auto">
        <div className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16`}>
          <div className="flex-1 min-w-0 max-w-[480px]">
            <p className={`${FG_M} text-xs uppercase tracking-[0.8px] mb-4 ${f.dark ? "text-muted" : "text-subtle"}`}>{f.name}</p>
            <h2 className={`${FG_SB} text-[36px] leading-[1.1] tracking-[-0.6px] mb-4 ${f.dark ? "text-white" : "text-text"}`}>
              {f.tagline}
            </h2>
            <p className={`${FG_R} text-base leading-7 mb-7 ${f.dark ? "text-subtle" : "text-muted"}`}>{f.desc}</p>
            <div className="flex flex-col gap-3">
              {f.bullets.map(b => (
                <div key={b} className="flex items-center gap-[10px]">
                  <div className={`size-[6px] rounded-full shrink-0 ${f.dark ? "bg-white/30" : "bg-border-dark"}`} />
                  <span className={`${FG_R} text-sm ${f.dark ? "text-subtle" : "text-muted"}`}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Real app screen for roster/search, styled card otherwise */}
          <div className="flex-1 min-w-0">
            {appVariant ? (
              <FoamAppScreen variant={appVariant} />
            ) : (
              <div className={`${f.dark ? "bg-white/5 border-white/10" : "bg-surface border-border"} border rounded-[20px] p-8 flex flex-col gap-6`}>
                <div className={`${FG_SB} text-[56px] leading-none tracking-[-2px] ${f.dark ? "text-white/20" : "text-border-dark"}`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className={`${FG_SB} text-2xl leading-tight tracking-[-0.4px] ${f.dark ? "text-white" : "text-text"}`}>{f.name}</p>
                <p className={`${FG_R} text-[15px] leading-6 ${f.dark ? "text-subtle" : "text-muted"}`}>{f.tagline}</p>
                <div className={`pt-4 border-t ${f.dark ? "border-white/10" : "border-border"}`}>
                  <p className={`${FG_M} text-xs ${f.dark ? "text-muted" : "text-subtle"}`}>Part of the Foam workflow</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceLinks() {
  return (
    <section className="py-20 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto text-center">
        <p className={`${FG_M} text-sm text-muted mb-8`}>Foam is built for three audiences</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {[
            { label: "Talent managers",  to: "/managers", cls: "bg-brand text-white"                  },
            { label: "Brands & agencies",to: "/brands",   cls: "bg-blue text-white"                   },
            { label: "Creators",         to: "/creators", cls: "bg-raised border border-border text-text" },
          ].map(a => (
            <Link key={a.to} to={a.to} className={`${FG_M} ${a.cls} text-[15px] px-7 h-11 rounded-full flex items-center hover:opacity-90 transition-opacity`}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <>
      <Hero />
      {FEATURES.map((f, i) => <FeatureBlock key={f.name} f={f} i={i} />)}
      <AudienceLinks />
      <ClosingCTA headline="Ready to see it in action?" sub="Bring a brief. We'll show you how Foam fits your exact workflow." />
    </>
  );
}
