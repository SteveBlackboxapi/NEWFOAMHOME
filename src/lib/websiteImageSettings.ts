import {
  normalizeWebsiteAssetSrc,
  publicWebsiteRoutes,
  websiteAssetUsage,
  type WebsiteAssetUsage,
} from "../data/websiteAssetUsage";

export type WebsiteSettingsSection = {
  name: string;
  assets: WebsiteAssetUsage[];
};

export type WebsiteSettingsPage = {
  route: string;
  label: string;
  sections: WebsiteSettingsSection[];
  /** Shared placements count once within a page. */
  imageCount: number;
};

const pageLabels: Record<string, string> = {
  "/": "Home",
  "/managers": "Managers",
  "/brands": "Brands",
  "/creators": "Creators",
  "/features": "Features",
  "/about": "About",
  "/data-trust": "Data & trust",
  "/updates": "Updates",
  "/demo": "Demo",
  "/kit-story": "Media Kit story",
  "/chrome-story": "Chrome story",
};

/** Public placements only; the catalogue objects remain shared across pages. */
export function websiteSettingsPages(): WebsiteSettingsPage[] {
  return publicWebsiteRoutes.map((route) => {
    const sections = new Map<string, WebsiteSettingsSection>();
    const pageImages = new Set<string>();
    for (const asset of websiteAssetUsage) {
      const source = normalizeWebsiteAssetSrc(asset.src);
      if (!/\.(?:png|jpe?g|webp)$/i.test(source) || /\/masters\//i.test(source)) continue;
      for (const placement of asset.uses) {
        if (placement.route !== route) continue;
        let section = sections.get(placement.section);
        if (!section) {
          section = { name: placement.section, assets: [] };
          sections.set(placement.section, section);
        }
        if (!section.assets.some((entry) => normalizeWebsiteAssetSrc(entry.src) === source))
          section.assets.push(asset);
        pageImages.add(source);
      }
    }
    return {
      route,
      label: pageLabels[route] || route,
      sections: [...sections.values()],
      imageCount: pageImages.size,
    };
  });
}

const libraryViews = new Set(["talent", "content", "saved"]);

/** Keep the current library filters and remember where Settings was opened. */
export function enterLabSettings(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  if (next.get("view") !== "settings") {
    const previous = next.get("view") || "content";
    next.set("from", libraryViews.has(previous) ? previous : "content");
    next.set("view", "settings");
  }
  return next;
}

/** Restore the library view while removing only Settings navigation state. */
export function exitLabSettings(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  const previous = next.get("from") || "content";
  next.set("view", libraryViews.has(previous) ? previous : "content");
  next.delete("from");
  next.delete("settingsPage");
  next.delete("settingsTab");
  return next;
}
