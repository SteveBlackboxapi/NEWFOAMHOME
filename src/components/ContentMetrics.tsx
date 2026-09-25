import type { TalentContentTile } from "../data/stagedTalent";
import { formatWebsiteMetric } from "../data/websiteTalent";
import "./content-metrics.css";

import { A } from "../lib/assets";
const platforms = {
  instagram: { label: "Instagram", icon: "958bd.svg" },
  tiktok: { label: "TikTok", icon: "31c2a.svg" },
  youtube: { label: "YouTube", icon: "572b1.svg" },
};

function ContentIcon({ asset }: { asset: string }) {
  return (
    <span
      className="content-metric-icon"
      aria-hidden="true"
      style={{
        maskImage: `url("${A}/${asset}")`,
        WebkitMaskImage: `url("${A}/${asset}")`,
      }}
    />
  );
}

export function ContentPlatformIcon({
  network,
}: {
  network: TalentContentTile["platform"];
}) {
  const platform = platforms[network];
  return (
    <span
      className="content-platform-icon"
      role="img"
      aria-label={platform.label}
    >
      <ContentIcon asset={platform.icon} />
    </span>
  );
}

/** The kit and talent library share the original product glyphs and demo figures. */
export function ContentMetrics({
  tile,
  showPlatform = false,
  className = "",
  uppercaseSuffix = false,
}: {
  tile: Pick<TalentContentTile, "views" | "engagements" | "platform">;
  showPlatform?: boolean;
  className?: string;
  uppercaseSuffix?: boolean;
}) {
  if (
    tile.views === undefined &&
    tile.engagements === undefined &&
    !showPlatform
  )
    return null;
  return (
    <span className={`content-metrics ${className}`.trim()}>
      {(
        [
          ["Views", tile.views, "169ab.svg"],
          ["Engagements", tile.engagements, "999f1.svg"],
        ] as const
      ).map(
        ([label, value, icon]) =>
          value !== undefined && (
            <span className="content-metric" key={label} title={label}>
              <ContentIcon asset={icon} />
              <span aria-hidden="true">
                {uppercaseSuffix
                  ? formatWebsiteMetric(value)
                  : formatWebsiteMetric(value).replace("K", "k")}
              </span>
              <span className="sr-only">
                {value.toLocaleString("en-US")} {label.toLowerCase()}
              </span>
            </span>
          ),
      )}
      {showPlatform && <ContentPlatformIcon network={tile.platform} />}
    </span>
  );
}

/** The image wrapper supplies the width container, so every footer detail scales together. */
export function ContentCardOverlay({ tile }: { tile: TalentContentTile }) {
  return (
    <>
      <span className="content-card-fade" aria-hidden="true" />
      <ContentMetrics
        tile={tile}
        showPlatform
        className="content-card-footer"
      />
    </>
  );
}
