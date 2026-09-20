import { Link } from "react-router";
import { img, FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

function Hero() {
  return (
    <section className="pt-36 pb-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
              <div className="size-[6px] rounded-full bg-blue" />
              <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>For brands and marketing agencies</span>
            </div>
            <h1 className={`${FG_SB} text-[56px] md:text-[68px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
              You've been sent a Foam link.<br />
              <em className="text-blue not-italic">Here's what's behind it.</em>
            </h1>
            <p className={`${FG_R} text-lg leading-7 text-muted mb-10 max-w-[500px]`}>
              A network of talent managers who pitch from Foam. Creator-connected audience data, relevant content and the person who represents the talent, in one place.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/demo" className={`${FG_M} bg-blue text-white text-[15px] px-8 h-12 rounded-full inline-flex items-center hover:opacity-90 transition-opacity`}>
                Get in touch
              </Link>
              <Link to="/data-trust" className={`${FG_M} text-[15px] text-blue hover:opacity-80 transition-opacity`}>
                How Foam's data works →
              </Link>
            </div>
          </div>
          {/* Link preview mockup */}
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="bg-surface border border-border-dark rounded-[20px] p-6 shadow-[0_8px_40px_rgba(16,24,40,0.08)] w-full max-w-[380px]">
              <div className="flex items-center gap-2 mb-4">
                <img alt="Foam" className="size-5" src={img.foamSymbol} />
                <span className={`${FG_M} text-sm text-muted`}>foam.io/kit/…</span>
              </div>
              <div className="relative rounded-xl overflow-hidden mb-4 h-[140px] bg-raised">
                <img alt="Creator" className="absolute inset-0 size-full object-cover object-top" src={img.talent1} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className={`${FG_SB} text-white text-lg leading-tight`}>Ren Cole</p>
                  <p className={`${FG_R} text-white/70 text-sm`}>Fitness · Portland, OR</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-raised rounded-xl p-3 mb-4">
                {[
                  { icon: img.instagram, label: "IG",  val: "142K" },
                  { icon: img.tiktok,    label: "TT",  val: "108K" },
                  { icon: img.youtube,   label: "YT",  val: "74K"  },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <img alt={s.label} className="size-4" src={s.icon} />
                    <span className={`${FG_SB} text-sm text-text`}>{s.val}</span>
                    <span className={`${FG_R} text-xs text-muted`}>{s.label}</span>
                  </div>
                ))}
              </div>
              <button className={`${FG_M} w-full bg-brand text-white text-sm h-10 rounded-full hover:bg-brand-hover transition-colors`}>
                View full media kit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KitExplainer() {
  const FIELDS = [
    "Live Instagram, TikTok, YouTube follower counts",
    "Audience age & gender breakdown",
    "Top-performing content",
    "Creator bio & niche verticals",
    "Past brand partnerships",
    "Contact via manager",
  ];
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 min-w-0">
            <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-4`}>What's in the kit</p>
            <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-5`}>
              Everything you need to say yes to a deal
            </h2>
            <p className={`${FG_R} text-base leading-7 text-muted mb-8`}>
              Every Foam media kit is built from live, connected platform data, not screenshots, not copy-pasted numbers. What you see is what's true today.
            </p>
            <div className="flex flex-col gap-3">
              {FIELDS.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="size-[6px] rounded-full bg-border-dark shrink-0" />
                  <span className={`${FG_R} text-[15px] text-muted`}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-surface border border-border rounded-[16px] overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <p className={`${FG_M} text-sm text-text`}>Audience demographics</p>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {[
                  { label: "US", pct: 68 }, { label: "UK", pct: 14 },
                  { label: "AU", pct: 8  }, { label: "CA", pct: 6  },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className={`${FG_R} text-sm text-muted w-8 shrink-0`}>{r.label}</span>
                    <div className="flex-1 h-2 bg-raised rounded-full overflow-hidden">
                      <div className="h-full bg-blue rounded-full" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className={`${FG_M} text-sm text-text w-8 text-right shrink-0`}>{r.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-6 py-4 bg-raised">
                <p className={`${FG_R} text-xs text-muted`}>Data updated · 2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DataCredibility() {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[760px] mx-auto text-center">
        <p className={`${FG_M} text-xs text-blue uppercase tracking-[0.8px] mb-4`}>Data & trust</p>
        <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-6`}>
          Numbers you can take into a meeting.
        </h2>
        <p className={`${FG_R} text-lg leading-7 text-muted mb-10`}>
          Connected metrics come from the social platforms through the creator's own authorised accounts. Available figures differ by platform and connection status. No composite scores. No estimates dressed as platform data.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-raised border border-border rounded-[10px] px-4 py-[10px]">
            <div className="size-2 rounded-full bg-success-dot" />
            <span className={`${FG_M} text-sm text-text`}>440K+ kits opened</span>
          </div>
          <Link to="/data-trust" className={`${FG_M} text-[15px] text-blue hover:opacity-80 transition-opacity`}>
            How Foam's data works →
          </Link>
        </div>
      </div>
    </section>
  );
}

function WorkspaceSection() {
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1 min-w-0">
            <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-4`}>Early access</p>
            <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-5`}>
              A place to keep what you're sent.
            </h2>
            <p className={`${FG_R} text-base leading-7 text-muted mb-8`}>
              Keep the creators worth coming back to. The managers who represent them. Their connected numbers. The content that made the case. Foam's brand workspace brings the other side of the pitch into one place, so your next brief can start from what you already know.
            </p>
            <Link
              to="/demo"
              className={`${FG_M} mt-2 inline-flex bg-blue text-white text-sm px-6 h-10 rounded-full items-center hover:opacity-90 transition-opacity`}
            >
              Talk to us about the brand side
            </Link>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-navy rounded-[20px] p-8 text-white flex flex-col gap-6">
              <div className={`${FG_SB} text-[56px] leading-none tracking-[-2px] text-white`}>440K+</div>
              <p className={`${FG_R} text-base text-subtle`}>Foam media kits, lists and rosters were opened more than 440,000 times by brands and agencies.</p>
              <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
                {["1,300+ active talent managers", "7,000+ creator cards shared via Gmail/month", "Live data from Instagram, TikTok, YouTube"].map(s => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="size-[6px] rounded-full bg-white/30 shrink-0" />
                    <span className={`${FG_R} text-sm text-subtle`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Brands() {
  return (
    <>
      <Hero />
      <KitExplainer />
      <DataCredibility />
      <WorkspaceSection />
      <ClosingCTA
        headline="One conversation starts the next."
        sub="Foam media kits, lists and rosters were opened more than 440,000 times by brands and agencies."
        primaryLabel="Get in touch"
        secondaryLabel="Our data standards"
        secondaryTo="/data-trust"
      />
    </>
  );
}
