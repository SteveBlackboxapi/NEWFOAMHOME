import { useEffect, useId, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { FG_R, FG_M, FG_SB } from "../lib/assets";
import {
  CAPTION_FONT_OPTIONS,
  formatAudience,
  resolveCaptionSettings,
  stagedTalent,
  type CaptionFontFamily,
  type ContentPlatform,
  type StagedTalent,
  type StrongKind,
  type TalentContentTile,
  type TalentNetwork,
  type TileCaptionSettings,
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
  "captionSettings",
  "views",
  "platform",
  "strongKind",
];

const CAPTION_STORAGE_PREFIX = "foam-lab-talent-caption:";

function captionStorageKey(talentId: string, tileIndex: number) {
  return `${CAPTION_STORAGE_PREFIX}${talentId}:${tileIndex}`;
}

function loadCaptionOverride(
  talentId: string,
  tileIndex: number,
  fallback: TileCaptionSettings,
): TileCaptionSettings {
  try {
    const raw = localStorage.getItem(captionStorageKey(talentId, tileIndex));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<TileCaptionSettings>;
    if (!parsed || typeof parsed !== "object") return fallback;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function saveCaptionOverride(
  talentId: string,
  tileIndex: number,
  settings: TileCaptionSettings,
) {
  try {
    localStorage.setItem(
      captionStorageKey(talentId, tileIndex),
      JSON.stringify(settings),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

function fontCss(font: CaptionFontFamily): string {
  return (
    CAPTION_FONT_OPTIONS.find((f) => f.id === font)?.css ??
    CAPTION_FONT_OPTIONS[0].css
  );
}

function captionOverlayStyle(settings: TileCaptionSettings): CSSProperties {
  const stroke = Math.max(0, settings.strokeWidth);
  const strokeColor = settings.stroke;
  // Prefer text-shadow outlines so fill colour stays visible across browsers
  // (-webkit-text-stroke often eats the fill on thin display sizes).
  const outlineShadows =
    stroke > 0
      ? [
          `${stroke}px 0 0 ${strokeColor}`,
          `-${stroke}px 0 0 ${strokeColor}`,
          `0 ${stroke}px 0 ${strokeColor}`,
          `0 -${stroke}px 0 ${strokeColor}`,
          `${stroke}px ${stroke}px 0 ${strokeColor}`,
          `-${stroke}px ${stroke}px 0 ${strokeColor}`,
          `${stroke}px -${stroke}px 0 ${strokeColor}`,
          `-${stroke}px -${stroke}px 0 ${strokeColor}`,
        ].join(", ")
      : "0 1px 2px rgba(0,0,0,0.35), 0 2px 10px rgba(0,0,0,0.25)";

  return {
    left: `${settings.x}%`,
    top: `${settings.y}%`,
    transform: "translate(-50%, -50%)",
    fontFamily: fontCss(settings.font),
    fontSize: `${settings.size}px`,
    color: settings.fill,
    WebkitTextFillColor: settings.fill,
    textShadow: outlineShadows,
  };
}

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

function CaptionOverlay({ settings }: { settings: TileCaptionSettings }) {
  if (!settings.visible || !settings.text.trim()) return null;
  return (
    <p
      className="absolute z-[2] max-w-[88%] px-1 text-center font-semibold leading-snug tracking-[-0.2px] pointer-events-none whitespace-pre-wrap break-words"
      style={captionOverlayStyle(settings)}
      data-caption-visible={settings.visible ? "true" : "false"}
      data-caption-font={settings.font}
    >
      {settings.text}
    </p>
  );
}

function ExploreCardChrome({
  tile,
  portrait,
  name,
  caption,
}: {
  tile: TalentContentTile;
  portrait: string;
  name: string;
  caption: TileCaptionSettings;
}) {
  return (
    <>
      <img
        src={tile.thumb}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

      <CaptionOverlay settings={caption} />

      <div className="absolute inset-x-0 bottom-0 p-2.5 flex flex-col gap-1.5 z-[3]">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-[6px] border border-white/10">
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
          className={`${FG_M} absolute right-2.5 top-2.5 z-[3] rounded-full bg-black/45 px-2 py-0.5 text-[9px] uppercase tracking-[0.8px] text-white/90 backdrop-blur-sm border border-white/10`}
        >
          Clip
        </span>
      ) : null}
    </>
  );
}

function ExploreCard({
  tile,
  portrait,
  name,
  caption,
  selected,
  onSelect,
}: {
  tile: TalentContentTile;
  portrait: string;
  name: string;
  caption: TileCaptionSettings;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const shellClass = [
    "group relative overflow-hidden rounded-[16px] aspect-[9/16] bg-[#1a1520] shadow-[0_8px_24px_rgba(16,24,40,0.12)] text-left w-full",
    onSelect
      ? "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      : "",
    selected ? "ring-2 ring-brand/60 ring-offset-2 ring-offset-[#faf8f5]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={shellClass}
      >
        <ExploreCardChrome
          tile={tile}
          portrait={portrait}
          name={name}
          caption={caption}
        />
      </button>
    );
  }

  return (
    <div className={shellClass}>
      <ExploreCardChrome
        tile={tile}
        portrait={portrait}
        name={name}
        caption={caption}
      />
    </div>
  );
}

function toColorInputValue(hex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#ffffff";
}

function CaptionPanel({
  settings,
  onChange,
  tileLabel,
}: {
  settings: TileCaptionSettings;
  onChange: (next: TileCaptionSettings) => void;
  tileLabel: string;
}) {
  const panelId = useId();

  const patch = (partial: Partial<TileCaptionSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="rounded-[12px] border border-border bg-surface px-4 py-4 md:px-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className={`${FG_M} text-[11px] uppercase tracking-[1.2px] text-subtle`}>
            Caption
          </p>
          <p className={`${FG_R} text-[12px] text-muted mt-0.5`}>{tileLabel}</p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <span className={`${FG_M} text-[12px] text-muted`}>Visible</span>
          <input
            type="checkbox"
            checked={settings.visible}
            onChange={(e) => patch({ visible: e.target.checked })}
            className="size-4 accent-[var(--brand)]"
            aria-describedby={panelId}
          />
        </label>
      </div>

      <div id={panelId} className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>Text</span>
          <input
            type="text"
            value={settings.text}
            onChange={(e) => patch({ text: e.target.value })}
            disabled={!settings.visible}
            placeholder="Caption or slogan"
            className={`${FG_R} w-full rounded-[8px] border border-border bg-[#faf8f5] px-3 py-2 text-[14px] text-text placeholder:text-subtle disabled:opacity-50`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>
            Vertical · {settings.y}%
          </span>
          <input
            type="range"
            min={10}
            max={90}
            step={1}
            value={settings.y}
            disabled={!settings.visible}
            onChange={(e) => patch({ y: Number(e.target.value) })}
            className="w-full accent-[var(--brand)] disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>
            Horizontal · {settings.x}%
          </span>
          <input
            type="range"
            min={10}
            max={90}
            step={1}
            value={settings.x}
            disabled={!settings.visible}
            onChange={(e) => patch({ x: Number(e.target.value) })}
            className="w-full accent-[var(--brand)] disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>Font</span>
          <select
            value={settings.font}
            disabled={!settings.visible}
            onChange={(e) =>
              patch({ font: e.target.value as CaptionFontFamily })
            }
            className={`${FG_R} w-full rounded-[8px] border border-border bg-[#faf8f5] px-3 py-2 text-[14px] text-text disabled:opacity-50`}
          >
            {CAPTION_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>
            Size · {settings.size}px
          </span>
          <input
            type="range"
            min={10}
            max={36}
            step={1}
            value={settings.size}
            disabled={!settings.visible}
            onChange={(e) => patch({ size: Number(e.target.value) })}
            className="w-full accent-[var(--brand)] disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>Fill colour</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={toColorInputValue(settings.fill)}
              disabled={!settings.visible}
              onChange={(e) => patch({ fill: e.target.value })}
              className="size-9 rounded-[6px] border border-border bg-transparent p-0.5 disabled:opacity-50 cursor-pointer"
            />
            <input
              type="text"
              value={settings.fill}
              disabled={!settings.visible}
              onChange={(e) => patch({ fill: e.target.value })}
              className={`${FG_R} flex-1 rounded-[8px] border border-border bg-[#faf8f5] px-2.5 py-2 text-[13px] text-text disabled:opacity-50`}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>Outline colour</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={toColorInputValue(settings.stroke)}
              disabled={!settings.visible}
              onChange={(e) => patch({ stroke: e.target.value })}
              className="size-9 rounded-[6px] border border-border bg-transparent p-0.5 disabled:opacity-50 cursor-pointer"
            />
            <input
              type="text"
              value={settings.stroke}
              disabled={!settings.visible}
              onChange={(e) => patch({ stroke: e.target.value })}
              className={`${FG_R} flex-1 rounded-[8px] border border-border bg-[#faf8f5] px-2.5 py-2 text-[13px] text-text disabled:opacity-50`}
            />
          </div>
        </label>

        <label className="sm:col-span-2 flex flex-col gap-1.5">
          <span className={`${FG_M} text-[11px] text-subtle`}>
            Outline width · {settings.strokeWidth}px
          </span>
          <input
            type="range"
            min={0}
            max={6}
            step={0.5}
            value={settings.strokeWidth}
            disabled={!settings.visible}
            onChange={(e) => patch({ strokeWidth: Number(e.target.value) })}
            className="w-full accent-[var(--brand)] disabled:opacity-50"
          />
        </label>
      </div>
    </div>
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
  const [activeTile, setActiveTile] = useState(0);
  const [captions, setCaptions] = useState<TileCaptionSettings[]>(() =>
    talent.content.map((tile, i) =>
      loadCaptionOverride(talent.id, i, resolveCaptionSettings(tile)),
    ),
  );

  useEffect(() => {
    setActiveTile(0);
    setCaptions(
      talent.content.map((tile, i) =>
        loadCaptionOverride(talent.id, i, resolveCaptionSettings(tile)),
      ),
    );
  }, [talent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const updateCaption = (index: number, next: TileCaptionSettings) => {
    setCaptions((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
    saveCaptionOverride(talent.id, index, next);
  };

  const activeCaption = captions[activeTile] ?? resolveCaptionSettings(
    talent.content[activeTile] ?? talent.content[0],
  );

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

            <p className={`${FG_M} text-[11px] uppercase tracking-[1.4px] text-subtle mb-2`}>
              Explore cards · {talent.content.length}
            </p>
            <p className={`${FG_R} text-[13px] text-muted mb-3`}>
              Select a tile to edit its caption overlay.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {talent.content.map((tile, i) => (
                <ExploreCard
                  key={`${talent.id}-tile-${i}`}
                  tile={tile}
                  portrait={talent.portrait}
                  name={talent.displayName}
                  caption={captions[i] ?? resolveCaptionSettings(tile)}
                  selected={activeTile === i}
                  onSelect={() => setActiveTile(i)}
                />
              ))}
            </div>

            <div className="mb-8">
              <CaptionPanel
                settings={activeCaption}
                onChange={(next) => updateCaption(activeTile, next)}
                tileLabel={`Tile ${activeTile + 1} · ${talent.content[activeTile]?.platform ?? ""}`}
              />
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
          Open a profile to edit caption overlays on content tiles.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className={`${FG_M} text-[12px] text-muted`}>
            {stagedTalent.length} profiles
          </span>
          <span className="text-border-dark">·</span>
          <span className={`${FG_R} text-[12px] text-subtle`}>
            Fields: id, platforms, portrait, motion, content, caption,
            captionSettings, views, platform, strongKind
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
