import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { img } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

function Hero() {
  return (
    <section className="pt-36 pb-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 min-w-0 max-w-[560px]">
            <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
              <div className="size-[6px] rounded-full bg-text" />
              <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>For creators</span>
            </div>
            <h1 className={`${FG_SB} text-[56px] md:text-[68px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
              Your accounts.<br />
              <em className="not-italic text-brand">Your connection.</em>
            </h1>
            <p className={`${FG_R} text-lg leading-7 text-muted mb-10`}>
              Foam connects to your Instagram, TikTok, and YouTube once. From that point on, your manager always has the numbers they need to close deals, without asking you for a screenshot.
            </p>
            <div className="flex items-center gap-3 bg-raised border border-border rounded-[14px] px-5 py-4 max-w-[360px]">
              <div className="size-2 rounded-full bg-success-dot shrink-0" />
              <p className={`${FG_R} text-sm text-muted`}>No account control transferred: read-only access only</p>
            </div>
          </div>
          {/* iOS app mockup */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="relative w-[280px]">
              {/* Phone frame */}
              <div className="bg-dark rounded-[36px] p-[10px] shadow-[0_32px_64px_rgba(0,0,0,0.28)]">
                <div className="bg-surface rounded-[28px] overflow-hidden">
                  {/* Status bar placeholder */}
                  <div className="bg-raised h-[50px] flex items-end pb-2 px-6">
                    <p className={`${FG_M} text-xs text-text`}>Connected accounts</p>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    {[
                      { icon: img.instagram, name: "Instagram", handle: "@ren.cole", status: "Connected", color: "bg-brand-light" },
                      { icon: img.tiktok,    name: "TikTok",    handle: "@ren.cole", status: "Connected", color: "bg-blue-light" },
                      { icon: img.youtube,   name: "YouTube",   handle: "Ren Cole",  status: "Pending",   color: "bg-raised"    },
                    ].map(a => (
                      <div key={a.name} className="bg-raised rounded-xl p-3 flex items-center gap-3">
                        <div className={`${a.color} size-10 rounded-xl flex items-center justify-center shrink-0`}>
                          <img alt={a.name} className="size-5 shrink-0" src={a.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`${FG_M} text-sm text-text`}>{a.name}</p>
                          <p className={`${FG_R} text-xs text-muted`}>{a.handle}</p>
                        </div>
                        <div className={`flex items-center gap-1 rounded-full px-2 py-[2px] ${a.status === "Connected" ? "bg-brand-light" : "bg-border"}`}>
                          <div className={`size-[5px] rounded-full ${a.status === "Connected" ? "bg-brand" : "bg-muted"}`} />
                          <span className={`${FG_M} text-[10px] ${a.status === "Connected" ? "text-brand" : "text-muted"}`}>{a.status}</span>
                        </div>
                      </div>
                    ))}
                    <div className="bg-brand rounded-xl p-4 mt-1">
                      <p className={`${FG_M} text-sm text-white mb-[2px]`}>Connect YouTube</p>
                      <p className={`${FG_R} text-xs text-white/70`}>Tap to authorize</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const SECTIONS = [
    {
      n: "01",
      title: "Your manager invites you",
      desc: "You'll get a text or email with a link. Tap it, log in with Foam, and you're in. No app download required.",
    },
    {
      n: "02",
      title: "Connect your accounts",
      desc: "Authorize Instagram, TikTok, and YouTube once. Foam gets read-only access. Your manager can't post, message, or take any action on your behalf.",
    },
    {
      n: "03",
      title: "Your stats flow automatically",
      desc: "Every time your manager shares a media kit, it pulls live numbers from your accounts. You never have to touch it.",
    },
    {
      n: "04",
      title: "You always see what's shared",
      desc: "Every media kit your manager sends is visible to you. You can see exactly what brands receive, always.",
    },
  ];
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-4`}>Your setup takes five minutes</h2>
          <p className={`${FG_R} text-base text-muted max-w-[480px] mx-auto`}>After that, your numbers are always current: no screenshots, no check-ins with your manager.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {SECTIONS.map(s => (
            <div key={s.n} className="flex flex-col gap-4 bg-surface border border-border rounded-[20px] p-8">
              <span className={`${FG_M} text-[36px] leading-none tracking-[-1px] text-border-dark`}>{s.n}</span>
              <h3 className={`${FG_M} text-xl text-text leading-snug`}>{s.title}</h3>
              <p className={`${FG_R} text-[15px] leading-6 text-muted`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Transparency() {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[760px] mx-auto text-center">
        <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-6`}>You're always in the picture</h2>
        <p className={`${FG_R} text-lg leading-7 text-muted mb-10`}>
          Foam is built on the principle that creators should see everything their manager sends. Every kit, every roster, every link: it's all visible to you through your creator account.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Read-only access", desc: "Foam can never post, message, or modify your accounts." },
            { label: "Revoke any time", desc: "Disconnect any platform from your settings instantly." },
            { label: "Kit transparency", desc: "See every kit your manager shares with a brand." },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-2 bg-raised border border-border rounded-[14px] p-6">
              <p className={`${FG_M} text-[15px] text-text`}>{f.label}</p>
              <p className={`${FG_R} text-sm text-muted leading-5`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Creators() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Transparency />
      <ClosingCTA
        headline="Questions about how Foam uses your data?"
        sub="Read our full data and privacy standards before connecting your accounts."
        primaryLabel="Data & Trust"
        primaryTo="/data-trust"
        secondaryLabel="Book a demo"
        secondaryTo="/demo"
      />
    </>
  );
}
