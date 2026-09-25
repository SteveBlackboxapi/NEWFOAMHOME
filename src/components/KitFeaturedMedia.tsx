import { useLayoutEffect, useRef, useState } from "react";
import type { TalentContentTile } from "../data/stagedTalent";
import { observeKitImage, type KitImageStatus } from "../lib/kitFeaturedMedia";
import { ContentCardOverlay } from "./ContentMetrics";
import { OptimizedImage } from "./OptimizedImage";

/** Only the four featured Kit photos load early; the rest of the library stays lazy. */
export function KitFeaturedMedia({
  tile,
  alt,
  className = "",
}: {
  tile: TalentContentTile;
  alt: string;
  className?: string;
}) {
  const image = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<{ src: string; status: KitImageStatus }>({
    src: tile.thumb,
    status: "loading",
  });
  const status = state.src === tile.thumb ? state.status : "loading";
  const ready = status === "ready";
  useLayoutEffect(() => {
    if (!image.current) return;
    return observeKitImage(image.current, (next) =>
      setState({ src: tile.thumb, status: next }),
    );
  }, [tile.thumb]);
  return (
    <div
      className={`ks-featured-media ${className}`.trim()}
      style={{ aspectRatio: tile.aspectRatio }}
      data-media-state={status}
      aria-busy={status === "loading"}
    >
      <div
        className="ks-featured-ready"
        style={{ opacity: ready ? 1 : 0 }}
        aria-hidden={!ready}
      >
        <OptimizedImage
          ref={image}
          src={tile.thumb}
          sizes="(max-width: 767px) 44vw, (max-width: 1100px) 23vw, 240px"
          alt={alt}
          loading="eager"
          fetchPriority="low"
          decoding="async"
        />
        <ContentCardOverlay tile={tile} />
      </div>
      {status === "error" && (
        <div
          className="ks-featured-unavailable"
          role="img"
          aria-label={`${alt}. Image unavailable.`}
        >
          Image unavailable
        </div>
      )}
    </div>
  );
}
