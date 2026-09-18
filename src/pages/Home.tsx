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
    <div className="bg-white overflow-hidden" style={{ fontFamily: "var(--font-sf)" }}>
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#eeefef]">
        <div className="flex items-center gap-4">
          <span className={`${FG_SB} text-[13px] text-[#101828] border-b-2 border-[#f5a524] pb-2`}>Talent</span>
          <span className={`${FG_R} text-[13px] text-[#6a7282] pb-2`}>Lists</span>
          <span className={`${FG_R} text-[13px] text-[#6a7282] pb-2`}>Media Kits</span>
        </div>
      </div>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className={`${FG_M} text-[12px] text-[#101828] bg-[#f4f5f6] rounded-full px-3 h-7 inline-flex items-center`}>All Talent</span>
        <span className={`${FG_R} text-[11px] text-[#99a1af]`}>Vale Studio · demo</span>
      </div>
      <div className="px-4 pt-3 pb-5 text-center">
        <div className="size-[88px] rounded-[12px] overflow-hidden mx-auto bg-[#eee]">
          <img alt="Io Marin" src={`${A}/3546d.png`} className="size-full object-cover object-top" />
        </div>
        <p className={`${FG_SB} text-[16px] text-[#101828] mt-3`}>Io Marin</p>
        <p className={`${FG_R} text-[11px] text-[#6a7282] mt-1`}>Lisbon · Wellness</p>
        <div className="flex justify-center gap-5 mt-3">
          <div className="text-center">
            <p className={`${FG_SB} text-[13px] text-[#101828]`}>164K</p>
            <p className={`${FG_R} text-[10px] text-[#99a1af]`}>IG</p>
          </div>
          <div className="text-center">
            <p className={`${FG_SB} text-[13px] text-[#101828]`}>89K</p>
            <p className={`${FG_R} text-[10px] text-[#99a1af]`}>TT</p>
          </div>
          <div className="text-center">
            <p className={`${FG_SB} text-[13px] text-[#101828]`}>12K</p>
            <p className={`${FG_R} text-[10px] text-[#99a1af]`}>YT</p>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {["Wellness", "Rituals"].map((tag) => (
            <span key={tag} className={`${FG_M} text-[10px] text-[#101828] bg-[#f4f5f6] rounded-full px-2.5 h-6 inline-flex items-center`}>{tag}</span>
          ))}
        </div>
        <p className={`${FG_R} text-[11px] text-[#6a7282] leading-4 mt-3 px-2`}>
          Illustrative demo profile. Used to pitch from Gmail without leaving the draft.
        </p>
      </div>
      <div className="px-4 pb-4">
        <p className={`${FG_R} text-[10px] text-[#99a1af] mb-2`}>Choose what is included in embeds</p>
        <div className="flex items-center justify-between py-1.5">
          <span className={`${FG_M} text-[12px] text-[#101828]`}>Include biography</span>
          <span className="w-8 h-5 rounded-full bg-[#f5a524] relative"><span className="absolute right-0.5 top-0.5 size-4 bg-white rounded-full" /></span>
        </div>
        <div className="flex items-center justify-between py-1.5 mb-3">
          <span className={`${FG_M} text-[12px] text-[#101828]`}>Include primary media kit</span>
          <span className="w-8 h-5 rounded-full bg-[#f5a524] relative"><span className="absolute right-0.5 top-0.5 size-4 bg-white rounded-full" /></span>
        </div>
        <div className="flex gap-2">
          <span className={`${FG_M} text-[11px] border border-[#e8eaed] rounded-full px-3 h-8 inline-flex items-center`}>Basic</span>
          <span className={`${FG_M} text-[11px] rounded-full px-3 h-8 inline-flex items-center text-[#101828]`} style={{ background: "#7ddec0" }}>Detail</span>
          <span className={`${FG_M} text-[11px] border border-[#e8eaed] rounded-full px-3 h-8 inline-flex items-center`}>Text</span>
        </div>
      </div>
    </div>
  );
}

function MediaKitView() {
  return (
    <div className="overflow-hidden" style={{ background: "#F4E6C8" }}>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="size-6 rounded-[4px] bg-[#6b0030] flex items-center justify-center">
          <span className="text-white text-[11px] font-semibold leading-none">F</span>
        </div>
        <button className={`${FG_M} text-[11px] text-[#6b0030] border border-[#6b0030]/40 rounded-full px-3 h-7`}>
          Contact
        </button>
      </div>
      <div className="px-5 pb-5 flex gap-4 items-start">
        <div className="rounded-[14px] overflow-hidden shrink-0 bg-[#e8d4b0]" style={{ width: 168, height: 168 }}>
          <img alt="Ren Cole" src={`${A}/9e849.png`} className="size-full object-cover object-top" />
        </div>
        <div className="min-w-0 pt-1">
          <p className={`${FG_SB} text-[#6b0030] leading-[1.05] tracking-[-0.5px]`} style={{ fontSize: "clamp(22px, 3.2vw, 28px)" }}>
            Ren Cole
          </p>
          <p className={`${FG_R} text-[11px] text-[#6b0030]/70 mt-2`}>
            Portland, OR&nbsp;|&nbsp;32 years old&nbsp;|&nbsp;Male
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <img alt="" className="size-4 opacity-80" src={icIG} />
            <img alt="" className="size-4 opacity-80" src={icTT} />
            <img alt="" className="size-4 opacity-80" src={icYT} />
          </div>
          <div className="mt-3 rounded-[10px] px-3 py-2" style={{ background: "rgba(107,0,48,0.08)" }}>
            <p className={`${FG_R} text-[10px] text-[#6b0030]/55 uppercase tracking-[0.4px]`}>Verticals</p>
            <p className={`${FG_M} text-[12px] text-[#6b0030] mt-0.5`}>Running · Everyday Progress</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4" style={{ background: "#6b0030" }}>
        <p className={`${FG_R} text-[13px] text-[#F4E6C8] leading-5`}>
          Early miles. Long runs. Bringing an audience along for the journey. Illustrative demo talent for Vale Studio.
        </p>
      </div>
      <div className="px-5 pb-5" style={{ background: "#6b0030" }}>
        <div className="flex items-end justify-between gap-3 border-t border-white/15 pt-4">
          <div>
            <p className={`${FG_SB} text-[11px] text-[#F4E6C8]`}>Platforms</p>
            <p className={`${FG_SB} text-[28px] text-[#F4E6C8] leading-none mt-1`}>286K</p>
            <p className={`${FG_R} text-[10px] text-[#F4E6C8]/70 mt-1`}>Total audience</p>
          </div>
          <div className="flex gap-5">
            {[{ n: "131K", h: "@ren.cole" }, { n: "97K", h: "@ren.cole" }, { n: "58K", h: "Ren Cole" }].map((row) => (
              <div key={row.n} className="text-right">
                <p className={`${FG_SB} text-[18px] text-[#F4E6C8] leading-none`}>{row.n}</p>
                <p className={`${FG_R} text-[10px] text-[#F4E6C8]/70 mt-1`}>{row.h}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaKitCard() {
  const [tab, setTab] = useState<"kit" | "gmail">("kit");
  return (
    <div className="rounded-[20px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] w-full" style={{ maxWidth: 500 }}>
      <div className="flex items-center gap-1 px-4 pt-4 pb-3 bg-[#f3eee6]">
        <button onClick={() => setTab("kit")} className={`${FG_M} text-[13px] px-4 h-8 rounded-full transition-colors ${tab === "kit" ? "text-[#101828] bg-white border border-[#dedede] shadow-sm" : "text-[#6a7282] hover:text-[#101828]"}`}>Media kit</button>
        <button onClick={() => setTab("gmail")} className={`${tab === "gmail" ? FG_M : FG_R} text-[13px] px-4 h-8 rounded-full transition-colors ${tab === "gmail" ? "text-[#101828] bg-white border border-[#dedede] shadow-sm" : "text-[#6a7282] hover:text-[#101828]"}`}>Gmail embed</button>
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
