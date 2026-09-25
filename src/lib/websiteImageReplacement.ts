import { labTalent } from "../data/labTalentCatalogue";
import { normalizeWebsiteAssetSrc, websiteUsageFor } from "../data/websiteAssetUsage";

const baselineImages = new Map(labTalent.flatMap((talent) => [
  [`${talent.id}:portrait`, talent.portrait],
  ...talent.content.map((tile, index) => [`${talent.id}:${tile.id ?? index}`, tile.thumb]),
] as [string, string][]));

/** Stable IDs resolve the original placement even after repeated uploaded replacements. */
export function websiteReplacementSource(assetId: string): string | undefined {
  const source = baselineImages.get(assetId);
  if (!source || !websiteUsageFor(source)?.uses.length) return;
  const canonical = normalizeWebsiteAssetSrc(source).replace(/^\//, "");
  return /\.(?:png|jpe?g|webp)$/.test(canonical) ? canonical : undefined;
}
