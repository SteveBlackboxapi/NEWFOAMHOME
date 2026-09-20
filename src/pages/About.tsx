import { Link } from "react-router";
import { img, FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

function Hero() {
  return (
    <section className="pt-36 pb-24 px-6 bg-surface text-center">
      <div className="max-w-[760px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
          <div className="size-[6px] rounded-full bg-border-dark" />
          <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>About Foam</span>
        </div>
        <h1 className={`${FG_SB} text-[60px] md:text-[72px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
          Creator deals are still<br />
          <em className="text-brand not-italic">too hard to close</em>
        </h1>
        <p className={`${FG_R} text-lg leading-7 text-muted max-w-[560px] mx-auto`}>
          Foam exists to change that. We build software that gives talent managers the proof they need to get a yes, and the tools to get it in front of the right people, fast.
        </p>
      </div>
    </section>
  );
}

function ThreeRoles() {
  const ROLES = [
    {
      role: "Managers",
      tagline: "Close more deals, faster",
      desc: "Foam gives talent managers live, branded media kits and the ability to pitch directly from Gmail, so every conversation starts with the right data.",
      to: "/managers",
      accent: "text-brand",
    },
    {
      role: "Brands",
      tagline: "Evaluate creators confidently",
      desc: "When a manager shares a Foam kit, brands see live follower counts, audience demographics, and top content, all in one clean link.",
      to: "/brands",
      accent: "text-blue",
    },
    {
      role: "Creators",
      tagline: "Your accounts. Your connection.",
      desc: "Creators authorise their own accounts once. Their data flows to their manager's kits automatically: no screenshots, no chasing.",
      to: "/creators",
      accent: "text-text",
    },
  ];
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text mb-4`}>Built for everyone in the deal</h2>
          <p className={`${FG_R} text-base text-muted max-w-[480px] mx-auto`}>Three audiences. One platform. All working from the same live source of truth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map(r => (
            <div key={r.role} className="bg-surface border border-border rounded-[20px] p-8 flex flex-col gap-4">
              <p className={`${FG_M} text-xs uppercase tracking-[0.8px] text-subtle`}>{r.role}</p>
              <h3 className={`${FG_SB} text-2xl leading-tight tracking-[-0.4px] ${r.accent}`}>{r.tagline}</h3>
              <p className={`${FG_R} text-[15px] leading-6 text-muted flex-1`}>{r.desc}</p>
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

function TeamGrid() {
  const TEAM = [
    { name: "Jordan Marks",   role: "Co-founder & CEO",  img: img.talent1 },
    { name: "Priya Srinivas", role: "Co-founder & CTO",  img: img.talent2 },
    { name: "Lee Castillo",   role: "Head of Design",    img: img.talent3 },
    { name: "Mina Elias",     role: "Head of Growth",    img: img.talent1 },
    { name: "Seb Okafor",     role: "Head of Product",   img: img.talent2 },
    { name: "Tara Lewin",     role: "Head of Ops",       img: img.talent3 },
  ];
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-3`}>The team</p>
          <h2 className={`${FG_SB} text-[40px] leading-[1.1] tracking-[-0.8px] text-text`}>Built by people who've been in the room</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {TEAM.map(t => (
            <div key={t.name} className="flex flex-col gap-3">
              <div className="relative rounded-xl overflow-hidden aspect-square bg-raised">
                <img alt={t.name} className="absolute h-[115%] left-[-7%] max-w-none top-0 w-[114%] object-cover" src={t.img} />
              </div>
              <div>
                <p className={`${FG_M} text-sm text-text`}>{t.name}</p>
                <p className={`${FG_R} text-xs text-muted`}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const STATS = [
    { val: "1,300+", label: "talent managers active monthly" },
    { val: "440K+",  label: "media kit opens per year"       },
    { val: "7,000+", label: "creator cards sent via Gmail every month" },
  ];
  return (
    <section className="py-24 px-6 bg-raised">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STATS.map(s => (
            <div key={s.val} className="flex flex-col gap-2">
              <div className={`${FG_SB} text-[56px] leading-none tracking-[-2px] text-text`}>{s.val}</div>
              <p className={`${FG_R} text-base text-muted leading-6`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <>
      <Hero />
      <ThreeRoles />
      <Stats />
      <TeamGrid />
      <ClosingCTA headline="Want to see the platform?" sub="Bring a real brief. We'll show you exactly how Foam fits your workflow." />
    </>
  );
}
