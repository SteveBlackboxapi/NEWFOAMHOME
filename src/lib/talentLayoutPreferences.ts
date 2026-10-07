import type { TalentLayout } from "../components/TalentLabTables";

export type TalentLabView = "talent" | "content" | "saved";
export type TalentLayoutPreferences = Partial<Record<TalentLabView, TalentLayout>>;
export const TALENT_LAYOUTS_KEY = "foam-lab-view-layouts:v1";
export const DEFAULT_TALENT_LAYOUTS: Record<TalentLabView, TalentLayout> = {
  talent: "table",
  content: "compact",
  saved: "gallery",
};

const views: TalentLabView[] = ["talent", "content", "saved"];
const isLayout = (value: unknown): value is TalentLayout =>
  value === "gallery" || value === "compact" || value === "table";

export function parseTalentLayoutPreferences(serialized: string | null): TalentLayoutPreferences {
  try {
    const stored: unknown = JSON.parse(serialized || "null");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    const record = stored as Record<string, unknown>;
    return Object.fromEntries(views.flatMap((view) =>
      isLayout(record[view]) ? [[view, record[view]]] : [],
    ));
  } catch {
    return {};
  }
}

export function readTalentLayoutPreferences(): TalentLayoutPreferences {
  try {
    return parseTalentLayoutPreferences(localStorage.getItem(TALENT_LAYOUTS_KEY));
  } catch {
    return {};
  }
}

export function writeTalentLayoutPreferences(preferences: TalentLayoutPreferences) {
  try {
    localStorage.setItem(TALENT_LAYOUTS_KEY, JSON.stringify(preferences));
  } catch {
    // The current page keeps its own copy when browser storage is unavailable.
  }
}

/** Explicit links win; ordinary entry restores this section's saved choice or default. */
export function talentLayoutFromParams(
  params: URLSearchParams,
  preferences: TalentLayoutPreferences = {},
): TalentLayout {
  const value = params.get("layout");
  if (isLayout(value)) return value;
  const requestedView = params.get("view") === "settings"
    ? params.get("from") || "content"
    : params.get("view") || "talent";
  const view: TalentLabView = views.includes(requestedView as TalentLabView)
    ? requestedView as TalentLabView
    : params.get("view") === "settings" ? "content" : "talent";
  return preferences[view] || DEFAULT_TALENT_LAYOUTS[view];
}

/** Switch sections with their own layout and without selection or Settings state. */
export function paramsForTalentView(
  params: URLSearchParams,
  view: TalentLabView,
  preferences: TalentLayoutPreferences,
) {
  const updated = new URLSearchParams(params);
  updated.set("view", view);
  updated.delete("talent");
  updated.delete("asset");
  updated.delete("q");
  updated.delete("from");
  updated.delete("settingsPage");
  updated.delete("settingsTab");
  // Keep every selected layout explicit so history can restore gallery too.
  updated.set("layout", preferences[view] || DEFAULT_TALENT_LAYOUTS[view]);
  return updated;
}
