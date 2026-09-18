import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

export function Managers() {
  return (
    <>
      <section className="pt-36 pb-24 px-6 text-center bg-surface">
        <div className="max-w-[760px] mx-auto">
          <p className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase mb-8`}>For talent managers</p>
          <h1 className={`${FG_SB} text-[60px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
            Your roster is full of <em className="text-brand not-italic">reasons</em> to say yes
          </h1>
          <p className={`${FG_R} text-lg leading-7 text-muted mb-10`}>
            Foam surfaces your creators' best data inside your existing workflow — so every pitch lands.
          </p>
          <Link to="/demo" className={`${FG_M} bg-brand text-white text-[15px] px-7 h-11 rounded-full inline-flex items-center`}>Book a demo</Link>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
