import manifest from "../data/websitePlacementImages.json";
import { A } from "./assets";

export type WebsitePlacementImages = Record<string, string>;

/** An exact placement preserves other uses of the same original photograph. */
export function websitePlacementKey(source: string, route: string, section: string): string {
  return JSON.stringify([source.replace(/^\//, ""), route.replace(/\/$/, "") || "/", section]);
}

export function resolveWebsitePlacementImage(
  src: string, route: string, section: string | undefined,
  replacements: WebsitePlacementImages = manifest.replacements,
  assetBase = A,
): string {
  if (!section || !src.startsWith(`${assetBase}/`)) return src;
  const source = `assets/${src.slice(assetBase.length + 1)}`;
  const replacement = replacements[websitePlacementKey(source, route, section)];
  // Publication generates only local raster image paths. Never turn this into a URL proxy.
  return replacement && /^assets\/website-placements\/[a-z0-9-]+\.webp$/.test(replacement)
    ? `${assetBase}/${replacement.slice("assets/".length)}` : src;
}
