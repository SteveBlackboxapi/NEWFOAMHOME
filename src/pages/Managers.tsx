import { Link } from "react-router";
import { img, FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";
import { FoamAppScreen } from "../components/FoamAppScreen";

function Check() {
  return (
    <div className="size-5 rounded-full bg-brand flex items-center justify-center shrink-0">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Hero() {
  return (
    <section className="pt-36 pb-24 px-6 text-center bg-surface">
      <div className="max-w-[760px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
          <div className="size-[6px] rounded-full bg-brand" />
          <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>Managers</span>
        </div>
        <h1 className={`${FG_SB} text-[60px] md:text-[72px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
          Your roster is full of{" "}
          <em className="text-brand not-italic">reasons</em> to say yes
        </h1>
        <p className={`${FG_R} text-lg leading-7 text-muted mb-10 max-w-[560px] mx-auto`}>
          Foam surfaces your creators' best data right inside your existing workflow — so every pitch lands exactly right.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link to="/demo" className={`${FG_M} bg-brand text-white text-[15px] px-7 h-11 rounded-full flex items-center hover:bg-brand-hover transition-colors`}>
            Book a demo
          </Link>
          <Link to="/features" className={`${FG_M} bg-surface border border-dark text-dark text-[15px] px-7 h-11 rounded-full flex items-center hover:bg-raised transition-colors`}>
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

function MediaKitSection() {
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 min-w-0">
            <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-4`}>Roster & media kits</p>
            <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-5`}>
              Every creator's best data, always ready to send
            </h2>
            <p className={`${FG_R} text-base leading-7 text-muted mb-8`}>
              Foam assembles live cross-platform stats, audience demographics, and top content into a single polished kit — branded to your agency, updated automatically.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "Cross-platform follower aggregation",
                "Audience age and geography breakdown",
                "Top-performing content previews",
                "One-click shareable link",
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check />
                  <span className={`${FG_R} text-[15px] text-muted`}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Real Foam app screen */}
          <div className="flex-1 min-w-0">
            <FoamAppScreen variant="roster" />
          </div>
        </div>
      </div>
    </section>
  );
}


function ThreeSteps() {
  const STEPS = [
    { n: "01", verb: "Find",     desc: "Search your roster for creators matching any brand brief — by niche, audience size, location, or demographic.", accent: "text-brand", dark: false },
    { n: "02", verb: "Assemble", desc: "Pull live platform data and agency branding into a polished kit in seconds — no screenshots, no spreadsheets.",   accent: "text-blue",  dark: false },
    { n: "03", verb: "Send",     desc: "Share via Gmail or a direct link. Brands get a professional kit; you get confirmation when they open it.",           accent: "text-white", dark: true  },
  ];
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-4`}>Three steps. One pitch.</h2>
          <p className={`${FG_R} text-base text-muted max-w-[480px] mx-auto`}>The fastest path from brief to booked — inside the tools you already use.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map(s => (
            <div key={s.n} className={`${s.dark ? "bg-dark" : "bg-raised"} border border-border rounded-[20px] p-9 flex flex-col gap-5`}>
              <span className={`${FG_M} text-xs tracking-[0.8px] uppercase ${s.dark ? "text-muted" : "text-subtle"}`}>{s.n}</span>
              <h3 className={`${FG_SB} text-[48px] leading-none tracking-[-1px] ${s.accent}`}>{s.verb}</h3>
              <p className={`${FG_R} text-[15px] leading-6 ${s.dark ? "text-subtle" : "text-muted"}`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GmailSection() {
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1 min-w-0">
            <p className={`${FG_M} text-xs text-blue uppercase tracking-[0.8px] mb-4`}>Chrome extension</p>
            <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-5`}>Drop a creator card mid-reply</h2>
            <p className={`${FG_R} text-base leading-7 text-muted mb-7`}>
              The Foam Chrome extension lets you insert a live creator card into any Gmail draft — stats, photo, and kit link — without leaving your inbox.
            </p>
            <div className={`${FG_SB} text-[52px] tracking-[-1.5px] text-text mb-1`}>7,000+</div>
            <p className={`${FG_R} text-sm text-muted`}>Gmail embeds generated every month</p>
          </div>
          {/* Gmail mockup */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="bg-surface border border-border-dark rounded-[16px] shadow-[0_8px_40px_rgba(16,24,40,0.08)] overflow-hidden w-full max-w-[440px]">
              <div className="bg-raised border-b border-border px-5 py-[14px]">
                <p className={`${FG_M} text-sm text-text`}>Re: Spring Campaign Creators</p>
                <p className={`${FG_R} text-xs text-muted mt-[2px]`}>To: brand@example.com</p>
              </div>
              <div className="p-5">
                <p className={`${FG_R} text-sm text-muted mb-4 leading-5`}>
                  Hi Eden, here's Io — she's a great fit for your spring wellness brief:
                </p>
                <div className="bg-raised border border-border rounded-xl p-[14px] flex items-center gap-3">
                  <div className="relative rounded-[8px] size-12 shrink-0 overflow-hidden">
                    <img alt="Io Marin" className="size-full object-cover object-top" src={img.talent2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${FG_M} text-sm text-text`}>Io Marin</p>
                    <div className="flex items-center gap-2 mt-[3px]">
                      {[img.instagram, img.tiktok].map((icon, i) => (
                        <div key={i} className="flex items-center gap-[3px]">
                          <img alt="" className="size-3 shrink-0" src={icon} />
                          <span className={`${FG_R} text-xs text-muted`}>164K</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className={`${FG_M} bg-brand text-white text-xs px-3 h-7 rounded-full shrink-0`}>View kit →</button>
                </div>
                <p className={`${FG_R} text-sm text-muted mt-4 leading-5`}>Let me know if you'd like more options from our roster.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RosterSection() {
  const TALENT = [
    { name: "Ren Cole",   age: "32y", loc: "Portland, OR",  img: img.talent1, gender: "Male",   ig: "131K", tt: "97K", yt: "58K" },
    { name: "Io Marin",   age: "28y", loc: "Lisbon",        img: img.talent2, gender: "Female", ig: "164K", tt: "89K", yt: "12K" },
    { name: "Sable Quinn", age: "33y", loc: "Glasgow",      img: img.talent3, gender: "Female", ig: "84K", tt: "61K", yt: "19K" },
  ];
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-3`}>Lists & rosters</p>
            <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text`}>
              Your whole roster,<br />campaign-ready
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-full h-9 px-3">
            <img alt="" className="size-[14px] shrink-0" src={img.magnifying} />
            <span className={`${FG_R} text-sm text-muted`}>Name or handle</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <span className={`${FG_SB} text-[22px] text-brand tracking-[-0.4px]`}>Vale</span>
          <div className="h-px flex-1 bg-border-dark" />
          <span className={`${FG_R} text-sm text-muted`}>14 talent</span>
        </div>
        <div className="flex flex-col gap-3">
          {TALENT.map(t => (
            <div key={t.name} className="bg-surface border border-border-dark rounded-[16px] p-5 flex items-center gap-4">
              <div className="relative rounded-xl size-14 shrink-0 overflow-hidden">
                <img alt={t.name} className="size-full object-cover object-top" src={t.img} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${FG_M} text-base text-text`}>{t.name}</p>
                <p className={`${FG_R} text-sm text-muted`}>{t.age} · {t.gender} · {t.loc}</p>
                <div className="flex items-center gap-[10px] mt-1">
                  {[[img.instagram, t.ig], [img.tiktok, t.tt], [img.youtube, t.yt]].map(([icon, val]) => (
                    <div key={val+String(icon)} className="flex items-center gap-1">
                      <img alt="" className="size-3 shrink-0" src={icon} />
                      <span className={`${FG_M} text-xs text-text`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className={`${FG_M} bg-brand text-white text-xs px-[14px] h-7 rounded-full hover:bg-brand-hover transition-colors shrink-0`}>
                View media kit
              </button>
            </div>
          ))}
          <div className="text-center pt-2">
            <button className={`${FG_M} text-sm text-muted hover:text-text transition-colors`}>+ 11 more creators</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const FEATURES = [
    { name: "Media kits",       desc: "Live cross-platform kits, branded to your agency." },
    { name: "Lists & rosters",  desc: "Organize your talent into shareable campaign lists." },
    { name: "Content search",   desc: "Find the right content for any brand brief, instantly." },
    { name: "Chrome extension", desc: "Insert creator cards directly inside Gmail." },
    { name: "Watchlists",       desc: "Track emerging creators before you sign them." },
    { name: "Talent notes",     desc: "Keep private notes on any creator in your roster." },
    { name: "Tracking",         desc: "Know when a brand opens your kit." },
  ];
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-4`}>Everything your workflow needs</h2>
          <p className={`${FG_R} text-base text-muted max-w-[440px] mx-auto`}>Seven tools, one platform. Built for managers who close deals, not manage spreadsheets.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.name} className="bg-surface border border-border rounded-[16px] p-6 flex flex-col gap-3 hover:border-border-dark hover:shadow-[0_4px_16px_rgba(16,24,40,0.06)] transition-all">
              <div className="size-2 rounded-full bg-brand" />
              <p className={`${FG_M} text-[15px] text-text`}>{f.name}</p>
              <p className={`${FG_R} text-sm leading-5 text-muted`}>{f.desc}</p>
            </div>
          ))}
          <div className="bg-dark border border-border rounded-[16px] p-6 flex flex-col gap-3">
            <div className="size-2 rounded-full bg-white/30" />
            <p className={`${FG_M} text-[15px] text-white`}>More on the way</p>
            <p className={`${FG_R} text-sm leading-5 text-muted`}>We ship fast. Bring your wishlist to a demo.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Onboarding() {
  const STEPS = [
    { n: 1, title: "Bring a brief",         desc: "Tell Foam about your open deal — brand category, budget, audience target." },
    { n: 2, title: "Invite your creators",  desc: "Creators authorize their accounts once. Their live stats flow in automatically." },
    { n: 3, title: "Send your first pitch", desc: "Foam builds the kit. You hit send. Track when it's opened." },
  ];
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-4`}>Up and running in an afternoon</h2>
          <p className={`${FG_R} text-base text-muted max-w-[440px] mx-auto`}>No long onboarding. No IT ticket. Just a brief, a roster, and a pitch.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STEPS.map(s => (
            <div key={s.n} className="flex flex-col gap-5">
              <div className="size-12 rounded-full bg-raised border border-border flex items-center justify-center shrink-0">
                <span className={`${FG_SB} text-lg text-text`}>{s.n}</span>
              </div>
              <div>
                <p className={`${FG_M} text-lg text-text mb-2`}>{s.title}</p>
                <p className={`${FG_R} text-[15px] leading-6 text-muted`}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Managers() {
  return (
    <>
      <Hero />
      <MediaKitSection />
      <ThreeSteps />
      <GmailSection />
      <RosterSection />
      <FeatureGrid />
      <Onboarding />
      <ClosingCTA />
    </>
  );
}
