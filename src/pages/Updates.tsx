import { FG_R, FG_M, FG_SB } from "../lib/assets";

const UPDATES = [
  {
    tag: "New",
    tagColor: "bg-brand-light text-brand",
    date: "September 2026",
    title: "Tracking notifications in Gmail",
    desc: "When a brand opens a media kit you shared via the Chrome extension, you now get an instant Gmail notification — including time spent and which creator they spent the most time on.",
  },
  {
    tag: "Improved",
    tagColor: "bg-blue-light text-blue",
    date: "August 2026",
    title: "Audience demographics now include age × gender breakdown",
    desc: "Media kits now show a cross-tab of age range and gender for each platform's audience. Brands asked for this — we shipped it in 3 weeks.",
  },
  {
    tag: "New",
    tagColor: "bg-brand-light text-brand",
    date: "July 2026",
    title: "Lists now support custom ordering",
    desc: "You can now drag creators into any order within a list before sharing with a brand. Your shortlist, your logic.",
  },
  {
    tag: "Improved",
    tagColor: "bg-blue-light text-blue",
    date: "June 2026",
    title: "Content search is 3× faster",
    desc: "We rebuilt the search index across the creator content store. Keyword results now surface in under 200ms for most queries.",
  },
  {
    tag: "Fix",
    tagColor: "bg-raised text-muted border border-border",
    date: "May 2026",
    title: "TikTok follower counts were showing 24h-delayed data",
    desc: "An API caching bug caused TikTok follower counts to reflect data from 24 hours earlier. Now fixed — all platforms pull live at kit-open time.",
  },
  {
    tag: "New",
    tagColor: "bg-brand-light text-brand",
    date: "April 2026",
    title: "Watchlists — track creators before you sign them",
    desc: "Monitor growth across Instagram, TikTok, and YouTube for creators you haven't signed yet. Private to your account. Converts to roster when you're ready.",
  },
];

function Hero() {
  return (
    <section className="pt-36 pb-20 px-6 bg-surface">
      <div className="max-w-[760px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
          <div className="size-[6px] rounded-full bg-border-dark" />
          <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>Product updates</span>
        </div>
        <h1 className={`${FG_SB} text-[60px] md:text-[72px] leading-[1.02] tracking-[-2px] text-text mb-5`}>
          What we've shipped
        </h1>
        <p className={`${FG_R} text-lg leading-7 text-muted`}>
          Foam ships fast, mostly based on what managers tell us is slowing them down. Here's the recent history.
        </p>
      </div>
    </section>
  );
}

export function Updates() {
  return (
    <>
      <Hero />
      <section className="pb-32 px-6 bg-surface">
        <div className="max-w-[760px] mx-auto">
          <div className="flex flex-col gap-0">
            {UPDATES.map((u, i) => (
              <div key={u.title} className={`flex flex-col gap-4 py-10 ${i < UPDATES.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`${FG_M} text-xs px-3 py-[4px] rounded-full ${u.tagColor}`}>{u.tag}</span>
                  <span className={`${FG_R} text-xs text-muted`}>{u.date}</span>
                </div>
                <h2 className={`${FG_M} text-xl text-text leading-snug`}>{u.title}</h2>
                <p className={`${FG_R} text-[15px] leading-6 text-muted`}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
