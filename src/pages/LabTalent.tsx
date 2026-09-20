import { useEffect, useId, useState } from "react";
import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import {
  formatAudience,
  stagedTalent,
  type ContentPlatform,
  type StagedTalent,
  type StrongKind,
  type TalentContentTile,
  type TalentNetwork,
} from "../data/stagedTalent";

const NETWORK_LABEL: Record<TalentNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitch: "Twitch",
  linkedin: "LinkedIn",
};

const PLATFORM_SHORT: Record<ContentPlatform, string> = {
  instagram: "IG",
  tiktok: "TT",
  youtube: "YT",
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
  "caption",
  "views",
  "platform",
  "strongKind",
];

function StrongIcon({ kind }: { kind: StrongKind }) {
  if (kind === "hashtag") {
    return <span aria-hidden className="text-[11px] font-semibold">#</span>;
  }
  if (kind === "link") {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "question") {
    return <span aria-hidden className="text-[11px] font-semibold">?</span>;
  }
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.8A1 1 0 0 1 10.5 4h3a1 1 0 0 1 .8.4L15.5 6h2A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.4-9.5-8.2C.4 8.8 2.2 5 6 5c2.1 0 3.5 1.2 4 2 .5-.8 1.9-2 4-2 3.8 0 5.6 3.8 3.5 6.8C19 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreCard({
  tile,
  portrait,
  name,
}: {
  tile: TalentContentTile;
  portrait: string;
  name: string;
}) {
  return (
    <figure className="group relative overflow-hidden rounded-[16px] aspect-[9/16] bg-[#1a1520] shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
      <img
        src={tile.thumb}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

      {tile.caption ? (
        <p
          className={`${FG_SB} absolute left-3 right-3 top-[28%] text-center text-[13px] sm:text-[14px] leading-snug tracking-[-0.2px] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]`}
        >
          {tile.caption}
        </p>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-2.5 flex flex-col gap-1.5">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 text-white backdrop-blur-[6px] border border-white/10">
          <span className={`${FG_M} text-[10px] tracking-[0.2px]`}>Strong:</span>
          <StrongIcon kind={tile.strongKind} />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-black/40 px-1.5 py-1 backdrop-blur-[6px] border border-white/10">
            <img
              src={portrait}
              alt=""
              className="size-5 rounded-full object-cover border border-white/40 shrink-0"
            />
            <span className="inline-flex items-center gap-1 text-white/95 shrink-0">
              <EyeIcon />
              <span className={`${FG_M} text-[11px]`}>{formatAudience(tile.views)}</span>
            </span>
            {typeof tile.engagements === "number" ? (
              <span className="inline-flex items-center gap-1 text-white/90 shrink-0">
                <HeartIcon />
                <span className={`${FG_M} text-[11px]`}>
                  {formatAudience(tile.engagements)}
                </span>
              </span>
            ) : null}
            <span className={`${FG_R} text-[10px] text-white/55 truncate ml-0.5`}>
              {name.split(" ")[0]}
            </span>
          </div>
          <span
            className={`${FG_SB} size-7 rounded-full bg-black/45 border border-white/15 text-[9px] tracking-[0.4px] text-white inline-flex items-center justify-center backdrop-blur-[6px] shrink-0`}
            title={tile.platform}
          >
            {PLATFORM_SHORT[tile.platform]}
          </span>
        </div>
      </div>

      {tile.type === "clip" ? (
        <span
          className={`${FG_M} absolute right-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[9px] uppercase tracking-[0.8px] text-white/90 backdrop-blur-sm border border-white/10`}
        >
          Clip
        </span>
      ) : null}
    </figure>
  );
}

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
        "group text-left rounded-[16px] border bg-[#faf8f5] overflow-hidden transition-all w-full",
        selected
          ? "border-brand/50 shadow-[0_0_0_1px_rgba(122,0,54,0.08)]"
          : "border-border hover:border-border-dark hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="aspect-[4/5] bg-raised overflow-hidden relative">
        <img
          src={talent.portrait}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
        <span
          className={`${FG_M} absolute left-3 top-3 rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[1px] text-white backdrop-blur-sm`}
        >
          {talent.motionStatus === "ready" ? "Motion ready" : "Still"}
        </span>
        <div className="absolute left-3 right-3 bottom-3 flex items-end justify-between gap-2">
          <div>
            <p className={`${FG_SB} text-[16px] text-white tracking-[-0.2px]`}>
              {talent.displayName}
            </p>
            <p className={`${FG_R} text-[12px] text-white/75`}>
              {talent.verticals[0]}
            </p>
          </div>
          <span className={`${FG_M} text-[12px] text-white/90 shrink-0`}>
            {formatAudience(talent.totalAudience)}
          </span>
        </div>
      </div>
      <div className="p-4 md:p-5">
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
      <div className="relative z-10 w-full md:max-w-[980px] max-h-[92vh] overflow-y-auto rounded-t-[20px] md:rounded-[20px] border border-border bg-[#faf8f5] shadow-[0_24px_64px_rgba(16,24,40,0.28)]">
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

        <div className="grid md:grid-cols-[260px_1fr] gap-0 md:gap-8 p-5 md:p-7">
          <div>
            <div className="aspect-[4/5] rounded-[14px] overflow-hidden bg-raised border border-border mb-4 relative">
              <img
                src={talent.portrait}
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <p className={`${FG_M} text-[11px] uppercase tracking-[1px] text-subtle mb-1`}>
              Motion
            </p>
            <p className={`${FG_R} text-[14px] text-muted mb-4`}>
              {talent.motionStatus === "ready" && talent.motion
                ? "Short loop attached"
                : "Placeholder · clip thumbs stand in until a loop is ready"}
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
              Explore cards · {talent.content.length}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-8">
              {talent.content.map((tile, i) => (
                <ExploreCard
                  key={`${talent.id}-tile-${i}`}
                  tile={tile}
                  portrait={talent.portrait}
                  name={talent.displayName}
                />
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
          Twelve invented profiles with photoreal explore cards for marketing kit
          staging. Not linked from the public site.
        </p>
        <p className={`${FG_R} text-[14px] leading-6 text-subtle max-w-[560px] mb-10`}>
          Portraits and post stills are synthetic staged assets. Fake handles end in
          .fake. Data lives in{" "}
          <span className={`${FG_M} text-muted`}>src/data/stagedTalent.ts</span>.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className={`${FG_M} text-[12px] text-muted`}>
            {stagedTalent.length} profiles
          </span>
          <span className="text-border-dark">·</span>
          <span className={`${FG_R} text-[12px] text-subtle`}>
            Fields: id, platforms, portrait, motion, content, caption, views,
            platform, strongKind
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
