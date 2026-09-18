import { NavLink, Link } from "react-router";
import { img } from "../lib/assets";

const FG_R  = "font-founders font-normal";
const FG_M  = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

const LINKS = [
  { label: "Managers",     to: "/managers" },
  { label: "Brands",       to: "/brands" },
  { label: "Features",     to: "/features" },
  { label: "Data & trust", to: "/data-trust" },
  { label: "About",        to: "/about" },
];

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-[10px] shrink-0">
          <div className="bg-[#101828] flex items-center justify-center rounded-full size-9 shrink-0">
            <img alt="Foam" className="size-[20px] brightness-0 invert" src={img.foamSymbol} />
          </div>
          <span className={`${FG_SB} text-xl text-text tracking-[-0.4px]`}>foam</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center">
          {LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${isActive ? FG_M + " text-text" : FG_R + " text-muted hover:text-text"} text-sm transition-colors`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/demo"
            className={`${FG_M} text-sm text-text border border-border-dark px-5 h-9 rounded-full flex items-center gap-1 hover:bg-raised transition-colors`}
          >
            Get a demo
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 8.5L8.5 1.5M8.5 1.5H4M8.5 1.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
