import { useState } from "react";
import { Link } from "react-router";
import { ClosingCTA } from "../components/ClosingCTA";

const FG_R  = "font-founders font-normal";
const FG_M  = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

const A = `${import.meta.env.BASE_URL}assets`;

// Platform icons from the Figma asset set
const icIG = `${A}/20684.svg`;
const icTT = `${A}/8509e.svg`;
const icYT = `${A}/d0b8e.svg`;

// ─── Gmail embed view ─────────────────────────────────────────────────────────
function GmailView() {
  return (
    <div className="bg-white rounded-b-[20px] overflow-hidden" style={{ fontFamily: "var(--font-sf)" }}>
      {/* Gmail header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e8eaed]">
        <div className="flex items-center gap-2 shrink-0">
          <div className="size-6 rounded-sm bg-[#ea4335] flex items-center justify-center">
            <span className="text-white text-[11px] font-bold leading-none" style={{ fontFamily: "var(--font-sans)" }}>M</span>
          </div>
          <span className={`${FG_SB} text-[18px] text-[#5f6368]`} style={{ fontFamily: "var(--font-sans)" }}>Gmail</span>
        </div>
        <div className="flex-1 bg-[#eaf1fb] rounded-full px-4 h-9 flex items-center">
          <span className={`${FG_R} text-[13px] text-[#444746]`} style={{ fontFamily: "var(--font-sans)" }}>Search mail</span>
        </div>
        <div className="size-8 rounded-full bg-[#a8c7fa] flex items-center justify-center shrink-0">
          <span className={`${FG_M} text-[12px] text-[#00326e]`} style={{ fontFamily: "var(--font-sans)" }}>J</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-[110px] shrink-0 py-3 border-r border-[#e8eaed]">
          <div className="mx-2 mb-3">
            <button className="w-full bg-[#c2e7ff] rounded-2xl h-10 flex items-center justify-center">
              <span className="text-[13px] text-[#001d35]" style={{ fontFamily: "var(--font-sans)" }}>Compose</span>
            </button>
          </div>
          {[
            { label: "Inbox", count: "12", active: true },
            { label: "Starred" },
            { label: "Sent" },
            { label: "Drafts", count: "2" },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-3 py-[6px] rounded-r-full mr-1 ${item.active ? "bg-[#d3e3fd]" : ""}`}
            >
              <span className={`text-[12px] ${item.active ? "font-semibold text-[#001d35]" : "text-[#444746]"}`}
                style={{ fontFamily: "var(--font-sans)" }}>{item.label}</span>
              {item.count && (
                <span className="text-[11px] font-semibold text-[#001d35]" style={{ fontFamily: "var(--font-sans)" }}>{item.count}</span>
              )}
            </div>
          ))}
        </div>

        {/* Email content */}
        <div className="flex-1 min-w-0 px-5 py-4">
          <h3 className={`${FG_SB} text-[16px] text-[#202124] mb-3`} style={{ fontFamily: "var(--font-sans)" }}>
            Re: Portland Marathon — who should we meet?
          </h3>

          {/* Sender row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="size-8 rounded-full bg-[#a8c7fa] flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-[#00326e]" style={{ fontFamily: "var(--font-sans)" }}>J</span>
            </div>
            <div>
              <span className="text-[13px] font-semibold text-[#202124]" style={{ fontFamily: "var(--font-sans)" }}>Rowan · Vale Studio</span>
              <div className="text-[11px] text-[#5f6368]" style={{ fontFamily: "var(--font-sans)" }}>to Eden · 10:42 AM</div>
            </div>
          </div>

          <p className="text-[13px] text-[#202124] mb-2" style={{ fontFamily: "var(--font-sans)" }}>Hi Sam,</p>
          <p className="text-[13px] text-[#202124] mb-4 leading-5" style={{ fontFamily: "var(--font-sans)" }}>
            Ren is training for Portland. Their audience follows every mile.
          </p>

          {/* Embedded creator card */}
          <div className="border border-[#e0e0e0] rounded-[10px] overflow-hidden mb-4">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="size-9 rounded-full bg-[#f1f3f4] flex items-center justify-center shrink-0">
                <span className="text-[13px] font-semibold text-[#5f6368]" style={{ fontFamily: "var(--font-sans)" }}>A</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#202124]" style={{ fontFamily: "var(--font-sans)" }}>Ren</p>
                <p className="text-[11px] text-[#5f6368]" style={{ fontFamily: "var(--font-sans)" }}>Portland, OR · Running</p>
              </div>
            </div>
            <div className="px-4 pb-3 flex items-center gap-4">
              <div className="flex items-center gap-[6px]">
                <img alt="IG" className="size-[14px]" src={icIG} />
                <span className="text-[12px] text-[#202124]" style={{ fontFamily: "var(--font-sans)" }}>131K</span>
              </div>
              <div className="flex items-center gap-[6px]">
                <img alt="TT" className="size-[14px]" src={icTT} />
                <span className="text-[12px] text-[#202124]" style={{ fontFamily: "var(--font-sans)" }}>97K</span>
              </div>
              <span className="text-[12px] text-[#202124]" style={{ fontFamily: "var(--font-sans)" }}>YouTube <strong>64K</strong></span>
            </div>
            <div className="px-4 pb-3">
              <p className="text-[12px] text-[#5f6368] leading-5" style={{ fontFamily: "var(--font-sans)" }}>
                Early miles. Long runs. Bringing an audience along for the journey.
              </p>
            </div>
            <div className="px-4 pb-3">
              <a href="#" className="text-[12px] text-[#1a73e8] underline" style={{ fontFamily: "var(--font-sans)" }}>View media kit ↗</a>
            </div>
            <div className="grid grid-cols-2 border-t border-[#e0e0e0]">
              {[
                { label: "US audience", val: "72%" },
                { label: "Age 25–34",   val: "46%" },
              ].map((a, i) => (
                <div key={a.label} className={`px-4 py-2 ${i === 0 ? "border-r border-[#e0e0e0]" : ""}`}>
                  <p className="text-[10px] text-[#5f6368] mb-[2px]" style={{ fontFamily: "var(--font-sans)" }}>{a.label}</p>
                  <p className="text-[16px] font-semibold text-[#202124]" style={{ fontFamily: "var(--font-sans)" }}>{a.val}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[13px] text-[#202124] mb-1" style={{ fontFamily: "var(--font-sans)" }}>Happy to make the introduction.</p>
          <p className="text-[13px] text-[#202124] mb-4" style={{ fontFamily: "var(--font-sans)" }}>Rowan</p>

          <div className="flex items-center justify-between border-t border-[#e8eaed] pt-3">
            <span className="text-[10px] text-[#5f6368]" style={{ fontFamily: "var(--font-sans)" }}>Added with Foam for Chrome</span>
            <span className="text-[10px] text-[#5f6368]" style={{ fontFamily: "var(--font-sans)" }}>Detail embed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Media Kit tab view ────────────────────────────────────────────────────────
function MediaKitView() {
  return (
    <>
      {/* Kit header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-[#e8e6e2]">
        <div>
          <p className={`${FG_SB} text-[18px] text-[#101828] leading-tight`}>Vale <span className="font-normal">/</span></p>
          <p className={`${FG_R} text-[10px] text-[#99a1af] uppercase tracking-[1px] mt-[2px]`}>Talent Studio</p>
        </div>
        <button className={`${FG_M} text-[10px] text-[#101828] border border-[#101828] rounded-full px-3 h-6 uppercase tracking-[0.5px]`}>
          Media Kit
        </button>
      </div>

      {/* Creator section */}
      <div className="px-5 pt-4 pb-0 flex gap-4">
        <div className="flex-1 min-w-0">
          <p className={`${FG_R} text-[10px] text-[#99a1af] uppercase tracking-[0.8px] mb-2`}>Running · Everyday Progress</p>
          <p className="font-founders font-semibold text-[#7a0036] leading-[1.0]" style={{ fontSize: "clamp(48px, 8vw, 72px)" }}>
            Ren.
          </p>
          <p className={`${FG_R} text-[12px] text-[#6a7282] mt-1`}>Portland, Oregon</p>
          <p className={`${FG_R} text-[12px] text-[#6a7282] mt-2 leading-5 max-w-[200px]`}>
            Early miles. Long runs. Bringing an audience along for the journey.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <img alt="Instagram" className="size-4 opacity-60" src={icIG} />
            <img alt="TikTok"    className="size-4 opacity-60" src={icTT} />
            <span className={`${FG_R} text-[11px] text-[#6a7282]`}>YouTube</span>
          </div>
        </div>
        <div className="rounded-[12px] shrink-0 overflow-hidden bg-[#c4a882]" style={{ width: 160, height: 160 }}>
          <div className="size-full bg-gradient-to-br from-[#b8976a] via-[#a07c52] to-[#7a5c35] flex items-end p-3">
            <div className="bg-white/20 rounded-lg px-2 py-1">
              <span className={`${FG_SB} text-white text-[14px]`}>026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-4 bg-[#6b0030] grid grid-cols-4">
        {[
          { label: "Total followers", val: "286K" },
          { label: "Instagram",       val: "131K" },
          { label: "TikTok",          val: "97K" },
          { label: "YouTube",         val: "58K"  },
        ].map((s, i) => (
          <div key={s.label} className={`px-4 py-4 ${i < 3 ? "border-r border-white/10" : ""}`}>
            <p className={`${FG_R} text-[9px] text-white/60 uppercase tracking-[0.5px] mb-1`}>{s.label}</p>
            <p className={`${FG_SB} text-[22px] text-white leading-tight`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Audience */}
      <div className="grid grid-cols-2 border-t border-[#e8e6e2]">
        {[
          { label: "Top audience country", sub: "United States", pct: "72%" },
          { label: "Top audience age",     sub: "25–34",         pct: "46%" },
        ].map((a, i) => (
          <div key={a.label} className={`px-4 py-3 ${i === 0 ? "border-r border-[#e8e6e2]" : ""}`}>
            <p className={`${FG_R} text-[9px] text-[#99a1af] uppercase tracking-[0.5px] mb-1`}>{a.label}</p>
            <div className="flex items-baseline justify-between">
              <span className={`${FG_M} text-[13px] text-[#101828]`}>{a.sub}</span>
              <span className={`${FG_SB} text-[15px] text-[#101828]`}>{a.pct}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content footer */}
      <div className="px-4 py-3 border-t border-[#e8e6e2] flex items-center gap-3">
        <span className={`${FG_R} text-[10px] text-[#99a1af] uppercase tracking-[0.5px] shrink-0`}>Selected content</span>
        <span className={`${FG_M} text-[12px] text-[#101828]`}>Morning miles</span>
        <span className={`${FG_R} text-[11px] text-[#6a7282]`}>Training, one morning at a time.</span>
      </div>

      <p className={`${FG_R} text-[9px] text-[#99a1af] text-center pb-3`}>
        Staged product example · illustrative content and figures
      </p>
    </>
  );
}

// ─── Media Kit mockup (tabbed) ────────────────────────────────────────────────
function MediaKitCard() {
  const [tab, setTab] = useState<"kit" | "gmail">("kit");
  return (
    <div
      className="bg-[#f7f5f2] rounded-[20px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] w-full"
      style={{ maxWidth: 500 }}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-3">
        <button
          onClick={() => setTab("kit")}
          className={`${FG_M} text-[13px] px-4 h-8 rounded-full transition-colors ${
            tab === "kit"
              ? "text-[#101828] bg-white border border-[#dedede] shadow-sm"
              : "text-[#6a7282] hover:text-[#101828]"
          }`}
        >
          Media kit
        </button>
        <button
          onClick={() => setTab("gmail")}
          className={`${tab === "gmail" ? FG_M : FG_R} text-[13px] px-4 h-8 rounded-full transition-colors ${
            tab === "gmail"
              ? "text-[#101828] bg-white border border-[#dedede] shadow-sm"
              : "text-[#6a7282] hover:text-[#101828]"
          }`}
        >
          Gmail embed
        </button>
      </div>

      {tab === "kit" ? <MediaKitView /> : <GmailView />}
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen bg-navy flex items-center px-6 pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left */}
          <div className="flex-1 min-w-0 max-w-[640px]">
            <p
              className={`${FG_M} text-[11px] uppercase tracking-[2px] mb-8`}
              style={{ color: "var(--text-subtle)" }}
            >
              The truth layer
            </p>
            <h1
              className={`${FG_SB} text-white leading-[1.0] tracking-[-2px] mb-7`}
              style={{ fontSize: "clamp(52px, 7vw, 88px)" }}
            >
              Numbers everyone in the deal can trust.
            </h1>
            <p
              className={`${FG_R} text-[17px] leading-7 mb-12`}
              style={{ color: "var(--text-subtle)", maxWidth: 520 }}
            >
              Creators connect their data at source. Managers pitch with it. Brands decide on it. No screenshots, no guesswork, no "let me check and get back to you."
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              <Link
                to="/demo"
                className={`${FG_SB} text-[#101828] text-[16px] px-8 h-14 rounded-full inline-flex items-center gap-2 hover:opacity-90 transition-opacity`}
                style={{ background: "var(--lime)" }}
              >
                Get a demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/30 hover:border-white/70 transition-colors pb-[2px]`}
              >
                Follow a pitch
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — media kit mockup */}
          <div className="flex-1 min-w-0 w-full flex justify-center lg:justify-end">
            <div className="w-full" style={{ maxWidth: 500 }}>
              <MediaKitCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social proof bar ─────────────────────────────────────────────────────────
function ProofBar() {
  return (
    <section className="bg-surface border-b border-border py-6 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16">
          {[
            { val: "1,300+", label: "talent managers" },
            { val: "440K+",  label: "media kit opens / year" },
            { val: "7,000+", label: "creator cards via Gmail / month" },
          ].map(s => (
            <div key={s.val} className="flex items-baseline gap-2">
              <span className={`${FG_SB} text-[28px] tracking-[-0.5px] text-text`}>{s.val}</span>
              <span className={`${FG_R} text-sm text-muted`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Value prop section ───────────────────────────────────────────────────────
function ValueProp() {
  const ROWS = [
    {
      who: "Managers",
      headline: "Pitch with live numbers.",
      body: "Build branded media kits from connected platform data. Share a link. Know when it's opened.",
      to: "/managers",
      accent: "text-brand",
    },
    {
      who: "Brands",
      headline: "Decide on real data.",
      body: "Receive a kit and see live follower counts, audience demographics, and top content — right now, not last month.",
      to: "/brands",
      accent: "text-blue",
    },
    {
      who: "Creators",
      headline: "Authorise once. Trust always.",
      body: "Connect your accounts in minutes. Your manager gets accurate data; you keep full control.",
      to: "/creators",
      accent: "text-text",
    },
  ];
  return (
    <section id="how-it-works" className="py-28 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <h2 className={`${FG_SB} text-text leading-[1.05] tracking-[-1px] mb-5`} style={{ fontSize: "clamp(36px, 4vw, 52px)" }}>
            One source of truth.<br />Three audiences that trust it.
          </h2>
          <p className={`${FG_R} text-[17px] text-muted leading-7 max-w-[480px] mx-auto`}>
            Foam connects creators, managers, and brands through the same live data — no one's working off a stale screenshot.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROWS.map(r => (
            <div key={r.who} className="bg-surface border border-border rounded-[20px] p-8 flex flex-col gap-4">
              <p className={`${FG_M} text-xs uppercase tracking-[0.8px] text-subtle`}>{r.who}</p>
              <h3 className={`${FG_SB} text-[28px] leading-tight tracking-[-0.5px] ${r.accent}`}>{r.headline}</h3>
              <p className={`${FG_R} text-[15px] leading-6 text-muted flex-1`}>{r.body}</p>
              <Link to={r.to} className={`${FG_M} text-sm text-muted hover:text-text transition-colors mt-2`}>
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature highlight ────────────────────────────────────────────────────────
function FeatureHighlight() {
  return (
    <section className="py-28 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 min-w-0">
            <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-4`}>Chrome extension</p>
            <h2 className={`${FG_SB} text-text leading-[1.05] tracking-[-1px] mb-5`} style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>
              Pitch from your inbox, not a new tab.
            </h2>
            <p className={`${FG_R} text-[17px] leading-7 text-muted mb-8`}>
              The Foam Chrome extension drops a live creator card into any Gmail reply — follower counts, photo, and kit link — in two clicks.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Works directly inside Gmail",
                "Live stats at the moment of send",
                "Brand opens tracked automatically",
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="size-[6px] rounded-full bg-brand shrink-0" />
                  <span className={`${FG_R} text-[15px] text-muted`}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/features" className={`${FG_M} text-[15px] text-brand hover:opacity-80 transition-opacity`}>
              See all features →
            </Link>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-raised border border-border rounded-[20px] p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="size-10 rounded-full bg-navy flex items-center justify-center shrink-0">
                  <span className={`${FG_SB} text-white text-sm`}>TS</span>
                </div>
                <div>
                  <p className={`${FG_M} text-sm text-text`}>Rowan Hale</p>
                  <p className={`${FG_R} text-xs text-muted`}>rowan@vale.studio</p>
                </div>
              </div>
              <p className={`${FG_R} text-sm text-muted leading-6`}>
                Hi Eden — here's Io, she's a perfect fit for the spring wellness brief:
              </p>
              <div className="bg-surface border border-border-dark rounded-[12px] p-4 flex items-center gap-4">
                <div className="relative size-12 rounded-[10px] overflow-hidden shrink-0 bg-[#f4f5f6]">
                  <img
                    alt="Io Marin"
                    src={`${A}/3546d.png`}
                    className="absolute top-0 left-[-4%] w-[108%] h-[115%] object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${FG_M} text-sm text-text`}>Io Marin</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <img alt="IG" className="size-3" src={icIG} />
                      <span className={`${FG_M} text-xs text-text`}>164K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img alt="TT" className="size-3" src={icTT} />
                      <span className={`${FG_M} text-xs text-text`}>89K</span>
                    </div>
                  </div>
                </div>
                <button className={`${FG_M} bg-brand text-white text-xs px-3 h-7 rounded-full shrink-0`}>
                  View kit →
                </button>
              </div>
              <div className={`${FG_SB} text-[40px] tracking-[-1px] text-text`}>7,000+</div>
              <p className={`${FG_R} text-sm text-muted`}>creator cards embedded via Gmail every month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Home() {
  return (
    <>
      <Hero />
      <ProofBar />
      <ValueProp />
      <FeatureHighlight />
      <ClosingCTA
        headline="Ready to pitch with numbers everyone trusts?"
        sub="Join 1,300+ talent managers who use Foam to close more deals."
      />
    </>
  );
}
