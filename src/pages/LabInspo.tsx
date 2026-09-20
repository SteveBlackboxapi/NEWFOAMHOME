import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";

type Verdict = "Steal" | "Later" | "Skip";

type Resource = {
  name: string;
  url: string;
  blurb: string;
  note: string;
  verdict: Verdict;
  priority?: boolean;
};

const RESOURCES: Resource[] = [
  {
    name: "inspomcp.dev",
    url: "https://inspomcp.dev",
    blurb: "800+ real sites indexed for coding agents.",
    note: "Primary reference bank for Foam polish. Pull layout, type, and section craft from live products, not moodboards.",
    verdict: "Steal",
    priority: true,
  },
  {
    name: "obsidianui.dev",
    url: "https://obsidianui.dev",
    blurb: "Motion-first React components.",
    note: "Steal scroll and transition craft only. Do not import the kit as Foam chrome.",
    verdict: "Steal",
  },
  {
    name: "motionsites.ai",
    url: "https://motionsites.ai",
    blurb: "AI prompts for animated marketing sites.",
    note: "Use only when motion clarifies the product story. Skip decorative animation.",
    verdict: "Steal",
  },
  {
    name: "goatedui.dev",
    url: "https://goatedui.dev",
    blurb: "Web, UI, icon, and OG inspiration.",
    note: "Light browsing for icon and OG ideas. Keep Foam’s own mark and type.",
    verdict: "Steal",
  },
  {
    name: "reelfolio.io",
    url: "https://reelfolio.io",
    blurb: "Screenshots into showreels.",
    note: "Later marketing asset pipeline. Not for page chrome.",
    verdict: "Later",
  },
  {
    name: "bencho.dev",
    url: "https://bencho.dev",
    blurb: "Live, tweakable UI blocks.",
    note: "Explore patterns in isolation. Do not ship blocks into kit-story or home.",
    verdict: "Later",
  },
  {
    name: "ui.halaska.com",
    url: "https://ui.halaska.com",
    blurb: "One-file AI UI kit.",
    note: "Skip as Foam identity. Useful only for throwaway prototypes.",
    verdict: "Skip",
  },
  {
    name: "builtbydesigners.com",
    url: "https://builtbydesigners.com",
    blurb: "Designer-built site directory.",
    note: "Light browsing only. Not a dependency and not a source of Foam chrome.",
    verdict: "Skip",
  },
  {
    name: "on.design",
    url: "https://on.design",
    blurb: "Invite-only design community.",
    note: "Low priority for now. Skip until there is a concrete need.",
    verdict: "Skip",
  },
];

const VERDICT_STYLE: Record<Verdict, string> = {
  Steal: "bg-lime/25 text-[#1a2e05] border-lime/60",
  Later: "bg-blue-light text-blue border-blue/25",
  Skip: "bg-raised text-muted border-border-dark",
};

export function LabInspo() {
  return (
    <div className="font-founders font-normal min-h-screen bg-[#f7f8fa] text-text">
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[920px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`${FG_M} text-[11px] uppercase tracking-[1.4px] text-subtle`}>
              Foam
            </span>
            <span
              className={`${FG_M} inline-flex items-center rounded-full border border-border bg-raised px-2.5 py-1 text-[11px] tracking-[0.4px] text-muted`}
            >
              Lab · Inspo
            </span>
          </div>
          <Link
            to="/"
            className={`${FG_M} text-[13px] text-muted hover:text-text transition-colors shrink-0`}
          >
            Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-[920px] mx-auto px-6 pt-14 pb-24">
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-subtle mb-5`}>
          Sandbox
        </p>
        <h1 className={`${FG_SB} text-[40px] md:text-[52px] leading-[1.05] tracking-[-1.4px] text-text mb-5`}>
          Design inspo for Foam
        </h1>
        <p className={`${FG_R} text-[17px] leading-7 text-muted max-w-[560px] mb-4`}>
          Isolated lab page. Nothing here ships into kit-story or home until it is
          explicitly merged.
        </p>
        <p className={`${FG_R} text-[15px] leading-6 text-subtle max-w-[560px] mb-14`}>
          Short notes on what to steal, what to park, and what to skip. Prefer real
          product references over generic kits.
        </p>

        <ul className="flex flex-col gap-3">
          {RESOURCES.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "group block rounded-[16px] border bg-surface p-5 md:p-6 transition-colors",
                  r.priority
                    ? "border-brand/30 hover:border-brand/55 shadow-[0_0_0_1px_rgba(122,0,54,0.04)]"
                    : "border-border hover:border-border-dark",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className={`${FG_SB} text-[18px] tracking-[-0.3px] text-text group-hover:text-brand transition-colors`}>
                        {r.name}
                      </h2>
                      {r.priority && (
                        <span className={`${FG_M} text-[10px] uppercase tracking-[1px] text-brand`}>
                          Priority
                        </span>
                      )}
                    </div>
                    <p className={`${FG_R} text-[13px] text-subtle break-all`}>
                      {r.url.replace(/^https:\/\//, "")}
                    </p>
                  </div>
                  <span
                    className={`${FG_M} text-[11px] uppercase tracking-[1px] rounded-full border px-2.5 py-1 ${VERDICT_STYLE[r.verdict]}`}
                  >
                    {r.verdict} for Foam
                  </span>
                </div>
                <p className={`${FG_R} text-[15px] leading-6 text-muted mb-3`}>
                  {r.blurb}
                </p>
                <p className={`${FG_R} text-[14px] leading-6 text-text/80`}>
                  <span className={`${FG_M} text-subtle`}>Steal for Foam · </span>
                  {r.note}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
