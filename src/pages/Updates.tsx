import { FG_R, FG_M, FG_SB } from "../lib/assets";

const UPDATES = [
  ["New", "September 2026", "Tracking notifications in Gmail"],
  ["Improved", "August 2026", "Audience demographics now include age × gender breakdown"],
  ["New", "July 2026", "Lists now support custom ordering"],
  ["Improved", "June 2026", "Content search is 3× faster"],
  ["Fix", "May 2026", "TikTok follower counts were showing 24h-delayed data"],
  ["New", "April 2026", "Watchlists — track creators before you sign them"],
];

export function Updates() {
  return (
    <section className="pt-36 pb-32 px-6 bg-surface">
      <div className="max-w-[760px] mx-auto">
        <h1 className={`${FG_SB} text-[60px] leading-[1.02] tracking-[-2px] text-text mb-5`}>What we've shipped</h1>
        <div className="flex flex-col">
          {UPDATES.map(([tag, date, title]) => (
            <div key={title} className="py-8 border-b border-border">
              <p className={`${FG_R} text-xs text-muted mb-2`}>{tag} · {date}</p>
              <h2 className={`${FG_M} text-xl text-text`}>{title}</h2>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
