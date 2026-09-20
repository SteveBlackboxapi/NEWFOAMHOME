import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import {
  formatAudience,
  stagedTalent,
  type StagedTalent,
  type TalentNetwork,
} from "../data/stagedTalent";

const NETWORK_LABEL: Record<TalentNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitch: "Twitch",
  linkedin: "LinkedIn",
};

const FIELD_HINT = [
  "id",
  "displayName",
  "age",
  "location",
  "bio",
  "verticals",
  "platforms",
  "totalAudience",
  "portrait",
  "motion",
  "motionStatus",
  "content",
];

function TalentCard({
  talent,
  selected,
  onSelect,
}: {
  talent: StagedTalent;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "group text-left rounded-[16px] border bg-surface overflow-hidden transition-colors w-full",
        selected
          ? "border-brand/50 shadow-[0_0_0_1px_rgba(122,0,54,0.08)]"
          : "border-border hover:border-border-dark",
      ].join(" ")}
    >
      <div className="aspect-[4/5] bg-raised overflow-hidden relative">
        <img
          src={talent.portrait}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          className={`${FG_M} absolute left-3 top-3 rounded-full border border-white/30 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[1px] text-white backdrop-blur-sm`}
        >
          {talent.motionStatus === "ready" ? "Motion ready" : "Still"}
        </span>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className={`${FG_SB} text-[18px] tracking-[-0.3px] text-text`}>
            {talent.displayName}
          </h2>
          <span className={`${FG_M} text-[12px] text-subtle shrink-0`}>
            {formatAudience(talent.totalAudience)}
          </span>
        </div>
        <p className={`${FG_R} text-[13px] text-muted mb-3`}>
          {talent.location} · {talent.age}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {talent.verticals.slice(0, 3).map((v) => (
            <span
              key={v}
              className={`${FG_M} rounded-full border border-border bg-raised px-2.5 py-1 text-[11px] text-muted`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

function DetailPanel({
  talent,
  onClose,
}: {
  talent: StagedTalent;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-0 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0a0e1a]/45 backdrop-blur-[2px]"
        aria-label="Close detail"
        onClick={onClose}
      />
      <div className="relative z-10 w-full md:max-w-[920px] max-h-[92vh] overflow-y-auto rounded-t-[20px] md:rounded-[20px] border border-border bg-[#faf8f5] shadow-[0_24px_64px_rgba(16,24,40,0.28)]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-[#faf8f5]/95 px-5 md:px-7 h-14 backdrop-blur-sm">
          <span className={`${FG_M} text-[11px] uppercase tracking-[1.4px] text-subtle`}>
            Profile · {talent.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`${FG_M} text-[13px] text-muted hover:text-text transition-colors`}
          >
            Close
          </button>
        </div>

        <div className="grid md:grid-cols-[280px_1fr] gap-0 md:gap-8 p-5 md:p-7">
          <div>
            <div className="aspect-[4/5] rounded-[14px] overflow-hidden bg-raised border border-border mb-4">
              <img
                src={talent.portrait}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <p className={`${FG_M} text-[11px] uppercase tracking-[1px] text-subtle mb-1`}>
              Motion
            </p>
            <p className={`${FG_R} text-[14px] text-muted mb-4`}>
              {talent.motionStatus === "ready" && talent.motion
                ? "Short loop attached"
                : "Placeholder · loop not attached yet"}
            </p>
            <p className={`${FG_M} text-[11px] uppercase tracking-[1px] text-subtle mb-2`}>
              Platforms
            </p>
            <ul className="flex flex-col gap-2 mb-1">
              {talent.platforms.map((p) => (
                <li
                  key={`${p.network}-${p.handle}`}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className={`${FG_M} text-[13px] text-text`}>
                      {NETWORK_LABEL[p.network]}
                    </p>
                    <p className={`${FG_R} text-[12px] text-subtle truncate`}>
                      {p.handle}
                    </p>
                  </div>
                  <span className={`${FG_SB} text-[14px] text-text shrink-0`}>
                    {formatAudience(p.followers)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={`${FG_M} text-[11px] uppercase tracking-[1.6px] text-brand mb-2`}>
              Staged talent
            </p>
            <h2
              id={titleId}
              className={`${FG_SB} text-[32px] md:text-[40px] leading-[1.05] tracking-[-1.2px] text-text mb-3`}
            >
              {talent.displayName}
            </h2>
            <p className={`${FG_R} text-[15px] text-muted mb-4`}>
              {talent.location} · {talent.age} · total{" "}
              <span className={`${FG_M} text-text`}>
                {formatAudience(talent.totalAudience)}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {talent.verticals.map((v) => (
                <span
                  key={v}
                  className={`${FG_M} rounded-full border border-brand/20 bg-brand-light px-2.5 py-1 text-[11px] text-brand`}
                >
                  {v}
                </span>
              ))}
            </div>
            <p className={`${FG_R} text-[16px] leading-7 text-text/90 mb-8 max-w-[52ch]`}>
              {talent.bio}
            </p>

            <p className={`${FG_M} text-[11px] uppercase tracking-[1.4px] text-subtle mb-3`}>
              Content tiles · {talent.content.length}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
              {talent.content.map((tile, i) => (
                <figure
                  key={`${talent.id}-tile-${i}`}
                  className="rounded-[12px] overflow-hidden border border-border bg-surface"
                >
                  <div className="aspect-[3/4] bg-raised relative">
                    <img
                      src={tile.thumb}
                      alt=""
                      className="size-full object-cover"
                    />
                    <span
                      className={`${FG_M} absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] uppercase tracking-[0.8px] text-white`}
                    >
                      {tile.type}
                    </span>
                  </div>
                  <figcaption className="px-2.5 py-2">
                    {tile.caption ? (
                      <p className={`${FG_R} text-[12px] text-text truncate`}>
                        {tile.caption}
                      </p>
                    ) : null}
                    {typeof tile.views === "number" ? (
                      <p className={`${FG_M} text-[11px] text-subtle`}>
                        {formatAudience(tile.views)} views
                      </p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="rounded-[12px] border border-dashed border-border-dark bg-surface/70 px-4 py-3">
              <p className={`${FG_M} text-[11px] uppercase tracking-[1.2px] text-subtle mb-1`}>
                Fields for reuse
              </p>
              <p className={`${FG_R} text-[12px] leading-5 text-muted break-all`}>
                {FIELD_HINT.join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LabTalent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = stagedTalent.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="font-founders font-normal min-h-screen bg-[#f7f4ef] text-text">
      <header className="border-b border-border bg-[#faf8f5]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`${FG_M} text-[11px] uppercase tracking-[1.4px] text-subtle`}>
              Foam
            </span>
            <span
              className={`${FG_M} inline-flex items-center rounded-full border border-brand/25 bg-brand-light px-2.5 py-1 text-[11px] tracking-[0.4px] text-brand`}
            >
              Lab · Talent
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

      <main className="max-w-[1120px] mx-auto px-6 pt-12 pb-24">
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-subtle mb-5`}>
          Unlisted catalogue
        </p>
        <h1 className={`${FG_SB} text-[40px] md:text-[52px] leading-[1.05] tracking-[-1.4px] text-text mb-5`}>
          Staged talent
        </h1>
        <p className={`${FG_R} text-[17px] leading-7 text-muted max-w-[560px] mb-3`}>
          Twelve invented profiles with structured fields for later reuse. Not linked
          from the public site.
        </p>
        <p className={`${FG_R} text-[14px] leading-6 text-subtle max-w-[560px] mb-10`}>
          Abstract portraits and demo content tiles only. Fake handles end in .fake.
          Data lives in <span className={`${FG_M} text-muted`}>src/data/stagedTalent.ts</span>.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className={`${FG_M} text-[12px] text-muted`}>
            {stagedTalent.length} profiles
          </span>
          <span className="text-border-dark">·</span>
          <span className={`${FG_R} text-[12px] text-subtle`}>
            Fields: id, platforms, portrait, motion, content
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {stagedTalent.map((talent) => (
            <TalentCard
              key={talent.id}
              talent={talent}
              selected={selectedId === talent.id}
              onSelect={() => setSelectedId(talent.id)}
            />
          ))}
        </div>
      </main>

      {selected ? (
        <DetailPanel talent={selected} onClose={() => setSelectedId(null)} />
      ) : null}
    </div>
  );
}
