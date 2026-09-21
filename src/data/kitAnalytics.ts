import { websiteSamantha } from "./websiteTalent";

/** Illustrative product-demo analytics. These are not measured account results. */
export const KIT_ANALYTICS_PROFILE = {
  name: websiteSamantha.displayName,
  portrait: websiteSamantha.portrait,
  handle:
    websiteSamantha.platforms.find((p) => p.network === "instagram")?.handle ||
    "",
  followers:
    websiteSamantha.platforms.find((p) => p.network === "instagram")
      ?.followers || 0,
  followerGrowth: 5_976,
  period: "Last 28 days · Demo data",
};

export const KIT_METRICS = [
  { id: "views", label: "Avg. views", value: 672_000 },
  { id: "likes", label: "Avg. likes", value: 22_000 },
  { id: "comments", label: "Avg. comments", value: 8_300 },
  { id: "shares", label: "Avg. shares", value: 31_800 },
] as const;

export type KitMetricId = (typeof KIT_METRICS)[number]["id"];

export const KIT_AGE_DISTRIBUTION = [
  { label: "13–17", percent: 14 },
  { label: "18–24", percent: 20 },
  { label: "25–34", percent: 20 },
  { label: "35–44", percent: 31 },
  { label: "45–54", percent: 10 },
  { label: "55+", percent: 5 },
];

export const KIT_GENDER_DISTRIBUTION = [
  { label: "Female", percent: 60 },
  { label: "Male", percent: 40 },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const ILLUSTRATIVE_OFFSETS = [
  54_300, 48_800, 51_200, 35_400, 36_700, 23_900, 28_400, 17_300, 9_700, 11_500,
  5_976, 0,
];

/** The last value matches the profile; the final illustrative increase is 5,976. */
export const KIT_FOLLOWER_HISTORY = MONTHS.map((month, index) => ({
  month,
  followers: Math.max(
    0,
    KIT_ANALYTICS_PROFILE.followers - ILLUSTRATIVE_OFFSETS[index],
  ),
}));

export function clampKitProgress(
  progress: number,
  reducedMotion = false,
): number {
  if (reducedMotion) return 1;
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}

export function kitBarProgress(
  progress: number,
  index: number,
  count: number,
): number {
  // Every visible row starts moving together; stagger completion, not its start.
  const finish = count > 1 ? 0.75 + (index / (count - 1)) * 0.25 : 1;
  return clampKitProgress(clampKitProgress(progress) / finish);
}

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatKitCount(
  value: number,
  progress = 1,
  compact = true,
): string {
  const current = Math.round(value * clampKitProgress(progress));
  return compact
    ? compactNumber.format(current)
    : current.toLocaleString("en-US");
}
