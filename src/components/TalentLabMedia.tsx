import type { CSSProperties } from "react";
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

export function AIDisclosure({ className = "" }: { className?: string }) {
  return (
    <span className={`tl-ai-disclosure ${className}`.trim()}>
      <LabIcon name="sparkles" size={13} />
      Made with AI
    </span>
  );
}

export function Caption({ settings }: { settings?: TileCaptionSettings }) {
  if (!settings?.visible || !settings.text.trim()) return null;
  const style: CSSProperties = {
    left: `${settings.x}%`,
    top: `${settings.y}%`,
    color: settings.fill,
    fontSize: `${settings.size / 3}cqw`,
    fontFamily: CAPTION_FONT_OPTIONS.find((f) => f.id === settings.font)?.css,
    WebkitTextStroke: settings.strokeWidth
      ? `${settings.strokeWidth / 3}cqw ${settings.stroke}`
      : undefined,
    paintOrder: "stroke fill",
    textShadow: settings.strokeWidth
      ? "none"
      : "0 1px 3px #0008, 0 2px 8px #0005",
  };
  return (
    <span className="tl-caption" style={style}>
      {settings.text}
    </span>
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
          <Caption settings={caption} />
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
