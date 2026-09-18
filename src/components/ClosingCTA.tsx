import { Link } from "react-router";
import { FG_M, FG_R, FG_SB } from "../lib/assets";

type Props = {
  headline?: string;
  sub?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
};

export function ClosingCTA({
  headline = "Ready to pitch smarter?",
  sub = "Join 1,300+ talent managers who use Foam to win more deals.",
  primaryLabel = "Book a demo",
  primaryTo = "/demo",
  secondaryLabel = "See features",
  secondaryTo = "/features",
}: Props) {
  return (
    <section className="py-24 px-6 bg-navy">
      <div className="max-w-[760px] mx-auto text-center">
        <h2 className={`${FG_SB} text-[48px] leading-[1.05] tracking-[-1.5px] text-white mb-5`}>
          {headline}
        </h2>
        <p className={`${FG_R} text-lg text-subtle mb-10 max-w-[480px] mx-auto leading-7`}>{sub}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={primaryTo} className={`${FG_M} bg-brand text-white text-[15px] px-8 h-12 rounded-full flex items-center hover:bg-brand-hover transition-colors`}>
            {primaryLabel}
          </Link>
          <Link to={secondaryTo} className={`${FG_M} bg-white/10 text-white text-[15px] px-8 h-12 rounded-full flex items-center hover:bg-white/15 transition-colors`}>
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
