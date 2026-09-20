import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

const PRINCIPLES = [
  {
    n: "01",
    title: "Read-only, always",
    desc: "Foam requests the minimum OAuth scope needed to read platform data. We cannot post, comment, message, or take any action on a creator's account.",
  },
  {
    n: "02",
    title: "Connected accounts, not stored numbers",
    desc: "We don't cache follower counts. Every time a media kit is opened, we pull fresh data from the platform API. What you see is what exists right now.",
  },
  {
    n: "03",
    title: "Creator consent, every time",
    desc: "A creator explicitly authorises each platform connection. Their manager cannot add a platform on their behalf. Connections can be revoked from the creator's Foam account at any time.",
  },
  {
    n: "04",
    title: "Transparent kit visibility",
    desc: "Creators can see every media kit their manager has shared. No surprises about how their data is being presented to brands.",
  },
  {
    n: "05",
    title: "No data brokering",
    desc: "We do not sell creator data to third parties, aggregate it across accounts for advertising, or share it outside the manager–brand relationship for which it was collected.",
  },
  {
    n: "06",
    title: "GDPR and CCPA aligned",
    desc: "Creators and managers can request deletion of their account and associated data at any time. We respond to verified requests within 30 days.",
  },
];

const PLATFORMS = [
  { name: "Instagram", scope: "Basic Display API", access: "Follower count, media list, audience insights" },
  { name: "TikTok",   scope: "Research API",       access: "Follower count, video metrics, audience demographics" },
  { name: "YouTube",  scope: "YouTube Data API v3",access: "Subscriber count, video performance, audience geo" },
];

function Hero() {
  return (
    <section className="pt-36 pb-24 px-6 bg-surface text-center">
      <div className="max-w-[760px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
          <div className="size-[6px] rounded-full bg-border-dark" />
          <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>Data & Trust</span>
        </div>
        <h1 className={`${FG_SB} text-[60px] md:text-[72px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
          How Foam handles<br />
          <em className="text-brand not-italic">creator data</em>
        </h1>
        <p className={`${FG_R} text-lg leading-7 text-muted max-w-[520px] mx-auto`}>
          We believe creators should know exactly what Foam does with their accounts. This page explains our six core data principles, plainly.
        </p>
      </div>
    </section>
  );
}

function Principles() {
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRINCIPLES.map(p => (
            <div key={p.n} className="bg-surface border border-border rounded-[20px] p-8 flex flex-col gap-4">
              <span className={`${FG_M} text-xs tracking-[0.8px] uppercase text-subtle`}>{p.n}</span>
              <h3 className={`${FG_M} text-xl text-text leading-snug`}>{p.title}</h3>
              <p className={`${FG_R} text-[15px] leading-6 text-muted`}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformTable() {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-4`}>Exactly what we access, by platform</h2>
          <p className={`${FG_R} text-base text-muted max-w-[560px]`}>Each platform connection uses the minimum OAuth scope required for media kit data. No posting. No messaging. No off-platform tracking.</p>
        </div>
        <div className="border border-border rounded-[16px] overflow-hidden">
          <div className="grid grid-cols-3 bg-raised px-6 py-4 border-b border-border">
            <span className={`${FG_M} text-xs text-muted uppercase tracking-[0.5px]`}>Platform</span>
            <span className={`${FG_M} text-xs text-muted uppercase tracking-[0.5px]`}>API / Scope</span>
            <span className={`${FG_M} text-xs text-muted uppercase tracking-[0.5px]`}>What we read</span>
          </div>
          {PLATFORMS.map((p, i) => (
            <div key={p.name} className={`grid grid-cols-3 px-6 py-5 gap-4 ${i < PLATFORMS.length - 1 ? "border-b border-border" : ""}`}>
              <span className={`${FG_M} text-sm text-text`}>{p.name}</span>
              <span className={`${FG_R} text-sm text-muted`}>{p.scope}</span>
              <span className={`${FG_R} text-sm text-muted`}>{p.access}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const QS = [
    {
      q: "Can my manager see my private messages?",
      a: "No. Foam's OAuth scope never includes messaging permissions on any platform.",
    },
    {
      q: "Can Foam post on my behalf?",
      a: "No. We request read-only scopes. Posting permissions are never requested or granted.",
    },
    {
      q: "How do I disconnect a platform?",
      a: "Log in to your Foam creator account, go to Settings → Connected Accounts, and click Revoke. The platform will remove our access immediately.",
    },
    {
      q: "Who sees my audience data?",
      a: "Your manager sees it to build media kits. Brands see it when a manager shares a kit. No one else.",
    },
  ];
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[760px] mx-auto">
        <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-12`}>Common questions</h2>
        <div className="flex flex-col gap-6">
          {QS.map(q => (
            <div key={q.q} className="border-b border-border pb-6 last:border-none last:pb-0">
              <p className={`${FG_M} text-base text-text mb-2`}>{q.q}</p>
              <p className={`${FG_R} text-[15px] leading-6 text-muted`}>{q.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <p className={`${FG_R} text-sm text-muted`}>
            More questions? Email us at{" "}
            <a href="mailto:privacy@foam.io" className="text-blue hover:opacity-80 transition-opacity">privacy@foam.io</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export function DataTrust() {
  return (
    <>
      <Hero />
      <Principles />
      <PlatformTable />
      <FAQ />
      <ClosingCTA
        headline="Still have questions?"
        sub="Talk to us directly. We're happy to walk through our data practices with your team or legal counsel."
        primaryLabel="Contact us"
        primaryTo="/demo"
        secondaryLabel="Book a demo"
        secondaryTo="/demo"
      />
    </>
  );
}
