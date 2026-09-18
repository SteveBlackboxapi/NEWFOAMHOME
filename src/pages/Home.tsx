import { Link } from "react-router";
import { ClosingCTA } from "../components/ClosingCTA";

const FG_R  = "font-founders font-normal";
const FG_M  = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

export function Home() {
  return (
    <>
      <section className="min-h-screen bg-navy flex items-center px-6 pt-20 pb-16">
        <div className="max-w-[1200px] mx-auto w-full">
          <p className={`${FG_M} text-[11px] uppercase tracking-[2px] mb-8 text-subtle`}>The truth layer</p>
          <h1 className={`${FG_SB} text-white leading-[1.0] tracking-[-2px] mb-7`} style={{ fontSize: "clamp(52px, 7vw, 88px)" }}>
            Numbers everyone in the deal can trust.
          </h1>
          <p className={`${FG_R} text-[17px] leading-7 mb-12 text-subtle max-w-[520px]`}>
            Creators connect their data at source. Managers pitch with it. Brands decide on it.
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            <Link to="/demo" className={`${FG_SB} text-[#101828] text-[16px] px-8 h-14 rounded-full inline-flex items-center`} style={{ background: "var(--lime)" }}>
              Get a demo
            </Link>
            <Link to="/features" className={`${FG_M} text-[16px] text-white border-b border-white/30 pb-[2px]`}>
              Follow a pitch
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-surface border-b border-border py-6 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-10">
          {["1,300+ talent managers", "440K+ kit opens / year", "7,000+ Gmail cards / month"].map(s => (
            <p key={s} className={`${FG_M} text-sm text-text`}>{s}</p>
          ))}
        </div>
      </section>
      <ClosingCTA
        headline="Ready to pitch with numbers everyone trusts?"
        sub="Join 1,300+ talent managers who use Foam to close more deals."
      />
    </>
  );
}
