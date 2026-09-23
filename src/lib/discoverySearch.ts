import { discoverySearches } from "../data/discoveryContent";
import { discoveryFeedOrder, discoveryKeywords } from "../data/labTalentCatalogue";
import type { LabAsset } from "./talentLab";

const normalise = (value: string) => value.toLowerCase().replace(/skin[ -]+care/g, "skincare").replace(/[^a-z0-9]+/g, " ").trim();
const singular = (word: string) => /^(cats|pets|posts|products|reviews|outfits|shoes|trainers)$/.test(word) ? word.slice(0, -1) : word;
const ignored = new Set(["a", "an", "the", "posts", "post", "talking", "about", "show", "find", "me", "of", "with", "and", "in", "for"]);

/** URL remains the source of truth so direct links and browser navigation use the same query. */
export const readDiscoveryQuery = (params: URLSearchParams) => params.get("q") ?? "";

export function discoveryExample(query: string) {
  const value = normalise(query);
  return discoverySearches.find((example) =>
    value === normalise(example.query) || value === example.id ||
    (example.id === "outfits" && value === "outfit inspiration"),
  );
}

export function matchesDiscoveryQuery(asset: LabAsset, query: string, editedCaption = ""): boolean {
  const value = normalise(query);
  if (!value) return true;
  const example = discoveryExample(value);
  if (example) return example.assets.some((candidate) => candidate.id === asset.id);

  const words = value.split(" ").filter((word) => !ignored.has(word)).map(singular);
  if (!words.length) return false;
  const showcased = discoverySearches.filter((item) => item.assets.some((candidate) => candidate.id === asset.id));
  const text = normalise([
    asset.title, editedCaption, asset.talent.displayName, asset.talent.location,
    ...asset.talent.verticals, ...asset.talent.platforms.map((item) => item.handle),
    ...(discoveryKeywords[asset.id] ?? []), ...showcased.map((item) => item.query),
  ].join(" ")).split(" ").map(singular);
  return words.every((word) =>
    text.some((token) => token === word || (word.length >= 3 && token.startsWith(word))),
  );
}

export function discoveryRank(asset: LabAsset, query: string): number {
  const example = discoveryExample(query);
  const index = example
    ? example.assets.findIndex((candidate) => candidate.id === asset.id)
    : discoveryFeedOrder.indexOf(asset.id);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}
