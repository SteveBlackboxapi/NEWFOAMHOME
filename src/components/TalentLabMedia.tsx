import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  captionBackgrounds,
  captionFont,
  measureCaption,
} from "../lib/captionLayout";
import {
  CAPTION_FONT_OPTIONS,
  formatAudience,
  type TileCaptionSettings,
} from "../data/stagedTalent";
import {
  assetKind,
  NETWORK_NAMES,
  SHORT_NAMES,
  type LabAsset,
} from "../lib/talentLab";
import { LabIcon } from "./TalentLabIcon";
import { AIDisclosure as MediaAIDisclosure } from "./AIDisclosure";

export function AIDisclosure({ className = "" }: { className?: string }) {
  return (
    <MediaAIDisclosure className={`tl-ai-disclosure ${className}`.trim()} />
  );
}

export function Caption({ settings }: { settings?: TileCaptionSettings }) {
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
            !settings.strokeWidth && settings.background === "none"
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
  return (
    <article className="tl-content-card">
      <div
        className={`tl-card-media tl-ratio-${position % 4}`}
        style={
          asset.tile?.aspectRatio
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
          {kind !== "video" && <Caption settings={caption} />}
          <span className="tl-card-shade" />
          {kind !== "still" && (
            <span className="tl-media-kind">
              <LabIcon name={kind === "video" ? "play" : "image"} size={12} />
              {kind === "video" ? "Video" : "Video planned"}
            </span>
          )}
          <span className="tl-content-bottom">
            {asset.tile &&
              (asset.tile.views !== undefined ||
                asset.tile.engagements !== undefined) && (
                <span className="tl-metrics">
                  {asset.tile.views !== undefined && (
                    <span title="Views">
                      <LabIcon name="eye" size={15} />
                      {formatAudience(asset.tile.views)}
                    </span>
                  )}
                  {asset.tile.engagements !== undefined && (
                    <span title="Engagements">
                      <LabIcon name="heart" size={14} />
                      {formatAudience(asset.tile.engagements)}
                    </span>
                  )}
                </span>
              )}
            <span className="tl-content-person">
              <img src={asset.talent.portrait} alt="" loading="lazy" />
              <span>{asset.talent.displayName}</span>
              {asset.tile && (
                <abbr title={NETWORK_NAMES[asset.tile.platform]}>
                  {SHORT_NAMES[asset.tile.platform]}
                </abbr>
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
      <AIDisclosure />
    </article>
  );
}
