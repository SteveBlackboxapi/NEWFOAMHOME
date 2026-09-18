import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

const FEATURES = [
  ["Media kits", "Connected numbers. Your agency's colours. One link."],
  ["Lists & rosters", "Group creators, share via a single link."],
  ["Content search", "Find the moment that makes the case."],
  ["Chrome extension", "Embeds a pitch directly into Gmail replies."],
  ["Watchlists", "Track creators before you sign them."],
  ["Talent notes", "Context that travels with the creator."],
];

export function Features() {
  return (
    <>
      <section className="pt-36 pb-16 px-6 bg-surface">
        <div className="max-w-[760px] mx-auto mb-16">
          <h1 className={`${FG_SB} text-[60px] leading-[1.02] tracking-[-2px] text-text mb-6`}>The kit. The list. The inbox.</h1>
          <p className={`${FG_R} text-lg text-muted`}>Six tiles, one product language.</p>
        </div>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-4">
          {FEATURES.map(([name, tagline]) => (
            <div key={name} className="border border-border rounded-[20px] p-8 bg-raised">
              <h2 className={`${FG_SB} text-2xl text-text mb-2`}>{name}</h2>
              <p className={`${FG_R} text-muted`}>{tagline}</p>
            </div>
          ))}
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
