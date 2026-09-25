import type { TalentLayout } from "../components/TalentLabTables";

export type TalentLabView = "talent" | "content" | "saved";
export type TalentLayoutPreferences = Partial<Record<TalentLabView, TalentLayout>>;
export const TALENT_LAYOUTS_KEY = "foam-lab-view-layouts:v1";

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

/** The URL controls the current view, including an omitted layout = gallery. */
export function talentLayoutFromParams(params: URLSearchParams): TalentLayout {
  const value = params.get("layout");
  return value === "table" || value === "compact" ? value : "gallery";
}

/** Only an intentional view switch restores that view's last layout choice. */
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
  const layout = preferences[view] || "gallery";
  if (layout === "gallery") updated.delete("layout");
  else updated.set("layout", layout);
  return updated;
}
