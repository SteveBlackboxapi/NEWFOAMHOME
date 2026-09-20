import { Link } from "react-router";
import { img, FG_M, FG_R, FG_SB } from "../lib/assets";

const COLS = [
  {
    head: "Product",
    links: [
      { label: "For managers", to: "/managers" },
      { label: "For brands",   to: "/brands" },
      { label: "For creators", to: "/creators" },
      { label: "Features",     to: "/features" },
      { label: "Updates",      to: "/updates" },
    ],
  },
  {
    head: "Company",
    links: [
      { label: "About",        to: "/about" },
      { label: "Data & Trust", to: "/data-trust" },
      { label: "Book a demo",  to: "/demo" },
    ],
  },
  {
    head: "Legal & contact",
    links: [
      { label: "Privacy policy",   to: "#" },
      { label: "Terms of service", to: "#" },
      { label: "hello@foam.io",    to: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-[10px]">
              <div className="bg-dark flex items-center justify-center p-[5px] rounded-[8px] size-8">
                <img alt="Foam" className="size-[22px]" src={img.foamSymbol} />
              </div>
              <span className={`${FG_SB} text-lg tracking-[-0.3px]`}>foam</span>
            </div>
            <p className={`${FG_R} text-sm text-subtle leading-6 max-w-[220px]`}>
              The pitch platform for talent managers, built around how deals actually get done.
            </p>
            <p className={`${FG_R} text-xs text-subtle`}>1,300+ talent managers active monthly</p>
          </div>
          {COLS.map(col => (
            <div key={col.head} className="flex flex-col gap-4">
              <p className={`${FG_M} text-xs text-subtle uppercase tracking-[0.6px]`}>{col.head}</p>
              <div className="flex flex-col gap-3">
                {col.links.map(l => (
                  <Link key={l.label} to={l.to} className={`${FG_R} text-sm text-subtle hover:text-white transition-colors`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`${FG_R} text-xs text-subtle`}>© {new Date().getFullYear()} Foam. All rights reserved.</p>
          <p className={`${FG_R} text-xs text-subtle`}>Made for the best managers in the business.</p>
        </div>
      </div>
    </footer>
  );
}
