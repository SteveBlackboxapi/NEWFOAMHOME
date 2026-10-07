import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  captionBackgrounds,
  captionFont,
  measureCaption,
} from "../lib/captionLayout";
import {
  CAPTION_FONT_OPTIONS,
  type TileCaptionSettings,
} from "../data/stagedTalent";
import { assetKind, type LabAsset } from "../lib/talentLab";
import { placementsForAsset } from "./TalentLibraryManager";
import { LabIcon } from "./TalentLabIcon";
import { ContentMetrics, ContentPlatformIcon } from "./ContentMetrics";
import { AIDisclosure as MediaAIDisclosure } from "./AIDisclosure";

export function AIDisclosure({
  className = "",
  provenance,
}: {
  className?: string;
  provenance?: "ai-generated" | "uploaded" | "reference";
}) {
  if (provenance === "uploaded" || provenance === "reference")
    return (
      <span className={`tl-ai-disclosure ${className}`}>
        {provenance === "uploaded"
          ? "Uploaded image · origin not verified"
          : "Supplied reference photo"}
      </span>
    );
  return (
    <MediaAIDisclosure className={`tl-ai-disclosure ${className}`.trim()} />
  );
}

type CaptionProps = { settings?: TileCaptionSettings; onMove?: (index: number, x: number, y: number) => void; onSelect?: (index: number) => void; selectedBlock?: number };
export function Caption({ settings, onMove, onSelect, selectedBlock }: CaptionProps) {
  if (!settings) return null;
  return <>{[settings, ...(settings.blocks ?? [])].map((block, index) => <CaptionBlock key={index} settings={block} onMove={onMove ? (_, x, y) => onMove(index, x, y) : undefined} onSelect={() => onSelect?.(index)} selectedBlock={selectedBlock === index ? 0 : undefined} />)}</>;
}

function CaptionBlock({ settings, onMove, onSelect, selectedBlock }: CaptionProps) {
  const drag = useRef<{ x: number; y: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const [fontRevision, setFontRevision] = useState(0);
  const font = settings ? captionFont(settings) : "";
  const text = settings?.text || "";
  useEffect(() => {
    if (!font || !text) return;
    let active = true;
    document.fonts
      .load(font, text)
      .then(() => {
        if (active) setFontRevision((revision) => revision + 1);
      })
      .catch(() => {
        /* The declared fallback font still renders and exports. */
      });
    return () => {
      active = false;
    };
  }, [font, text]);
  const layout = useMemo(() => {
    if (!settings?.visible || !settings.text.trim()) return null;
    const ctx = document.createElement("canvas").getContext("2d");
    return ctx ? measureCaption(ctx, settings) : null;
  }, [settings, fontRevision]);
  if (!settings || !layout) return null;
  const style: CSSProperties = {
    pointerEvents: onMove ? "auto" : "none",
    cursor: onMove ? "grab" : undefined,
    touchAction: onMove ? "none" : undefined,
    outline: onMove && selectedBlock === 0 ? "1px dashed #155eef" : undefined,
    left: `clamp(${layout.width / 21.6}cqw, ${settings.x}%, calc(100% - ${layout.width / 21.6}cqw))`,
    top: `clamp(${layout.height / 21.6}cqw, ${settings.y}%, calc(100% - ${layout.height / 21.6}cqw))`,
    width: `${layout.width / 10.8}cqw`,
    overflow: "visible",
  };
  return (
    <svg
      className="tl-caption"
      style={style}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={settings.text}
      tabIndex={onMove ? 0 : undefined}
      onPointerDown={onMove ? event => {
        const rect = event.currentTarget.parentElement!.getBoundingClientRect();
        drag.current = { x: settings.x, y: settings.y, startX: event.clientX, startY: event.clientY, width: rect.width, height: rect.height };
        onSelect?.(0); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
      } : undefined}
      onPointerMove={onMove ? event => {
        if (!drag.current) return;
        const d = drag.current;
        onMove(0, Math.max(10, Math.min(90, d.x + (event.clientX - d.startX) / d.width * 100)), Math.max(10, Math.min(90, d.y + (event.clientY - d.startY) / d.height * 100)));
      } : undefined}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      onKeyDown={onMove ? event => {
        const delta = event.shiftKey ? 5 : 1;
        const moves: Record<string, [number, number]> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] };
        if (moves[event.key]) { event.preventDefault(); onSelect?.(0); onMove(0, Math.max(10, Math.min(90, settings.x + moves[event.key][0])), Math.max(10, Math.min(90, settings.y + moves[event.key][1]))); }
      } : undefined}
      data-selected={onMove && selectedBlock === 0 ? "true" : undefined}
    >
      <g
        fill={settings.backgroundColor}
        opacity={settings.backgroundOpacity / 100}
      >
        {captionBackgrounds(layout, settings).map((rect, index) => (
          <rect
            key={index}
            {...rect}
            rx={Math.min(
              settings.radius * 3.6,
              rect.height / 2,
              rect.width / 2,
            )}
          />
        ))}
      </g>
      <g
        fill={settings.fill}
        stroke={settings.strokeWidth ? settings.stroke : "none"}
        strokeWidth={settings.strokeWidth * 3.6}
        strokeLinejoin="round"
        paintOrder="stroke fill"
        style={{
          fontFamily: CAPTION_FONT_OPTIONS.find((f) => f.id === settings.font)
            ?.css,
          fontSize: settings.size * 3.6,
          fontWeight: settings.weight,
          fontStyle: settings.italic ? "italic" : "normal",
          filter:
            settings.shadowBlur !== undefined || settings.shadowX !== undefined || settings.shadowY !== undefined
              ? `drop-shadow(${(settings.shadowX ?? 0) * 3.6}px ${(settings.shadowY ?? 0) * 3.6}px ${(settings.shadowBlur ?? 0) * 3.6}px ${settings.shadowColor ?? "#000000"})`
              : !settings.strokeWidth && settings.background === "none"
              ? "drop-shadow(0 2px 4px #0008)"
              : undefined,
        }}
      >
        {layout.lines.map((line, index) => (
          <text key={index} x={line.x} y={line.y}>
            {line.text}
          </text>
        ))}
      </g>
    </svg>
  );
}

export function AssetCard({
  asset,
  caption,
  saved,
  onSave,
  onOpen,
  position = 0,
}: {
  asset: LabAsset;
  caption?: TileCaptionSettings;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  position?: number;
}) {
  const kind = assetKind(asset);
  const isYouTube = asset.tile?.platform === "youtube";
  return (
    <article className="tl-content-card">
      <div
        className={`tl-card-media tl-ratio-${position % 4}${isYouTube ? " is-youtube" : ""}`}
        style={
          isYouTube
            ? { aspectRatio: "4 / 3" }
            : asset.tile?.aspectRatio
              ? { aspectRatio: asset.tile.aspectRatio }
              : undefined
        }
      >
        <button
          className="tl-media-button"
          onClick={onOpen}
          aria-label={`Open ${asset.title} by ${asset.talent.displayName}`}
        >
          <img
            className="tl-cover"
            src={asset.src}
            alt={asset.title}
            loading="lazy"
          />
          {/* Wide YouTube previews reserve the overlay for metrics; editor captions stay unchanged. */}
          {kind !== "video" && !isYouTube && <Caption settings={caption} />}
          <span className="tl-card-shade" />
          {kind !== "still" && (
            <span className="tl-media-kind">
              <LabIcon name={kind === "video" ? "play" : "image"} size={12} />
              {kind === "video" ? "Video" : "Video planned"}
            </span>
          )}
          <span className="tl-content-bottom">
            {asset.tile && (
              <ContentMetrics tile={asset.tile} className="tl-metrics" />
            )}
            <span className="tl-content-person">
              <img src={asset.talent.portrait} alt="" loading="lazy" />
              <span>{asset.talent.displayName}</span>
              {asset.tile && (
                <ContentPlatformIcon network={asset.tile.platform} />
              )}
            </span>
          </span>
        </button>
        <button
          className={`tl-card-save ${saved ? "is-saved" : ""}`}
          onClick={onSave}
          aria-label={`${saved ? "Unsave" : "Save"} ${asset.title}`}
          aria-pressed={saved}
          title={saved ? "Remove from saved" : "Save asset"}
        >
          <LabIcon name="bookmark" size={17} />
        </button>
      </div>
      <AIDisclosure
        provenance={asset.tile?.provenance || asset.talent.provenance}
      />
      <div className="tl-card-usage">
        {placementsForAsset(asset).length
          ? `Used on website · ${placementsForAsset(asset).length} placements`
          : "Library only"}
      </div>
    </article>
  );
}
