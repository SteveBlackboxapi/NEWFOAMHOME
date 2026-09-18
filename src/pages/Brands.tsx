import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

export function Brands() {
  return (
    <>
      <section className="pt-36 pb-24 px-6 bg-surface">
        <div className="max-w-[760px]">
          <p className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase mb-8`}>For brands & agencies</p>
          <h1 className={`${FG_SB} text-[56px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
            You've been sent <em className="text-blue not-italic">a Foam link</em>
          </h1>
          <p className={`${FG_R} text-lg leading-7 text-muted mb-10`}>
            A talent manager just shared a kit, roster, or shortlist. Here's why it's easy to say yes.
          </p>
          <Link to="/demo" className={`${FG_M} bg-blue text-white text-[15px] px-8 h-12 rounded-full inline-flex items-center`}>Book a brand walkthrough</Link>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
