import {
  getStagedTalent,
  type StagedTalent,
  type TalentContentTile,
  type TalentNetwork,
} from "./stagedTalent";

/** Approved fictional cast for public website examples. No lab links or drafts. */
function approvedTalent(id: string): StagedTalent {
  const talent = getStagedTalent(id);
  if (!talent) throw new Error(`Missing website demo talent: ${id}`);
  return talent;
}

export const websiteSamantha = approvedTalent("samantha-pikka");
export const websiteAria = approvedTalent("aria-quen");
export const websiteNia = approvedTalent("nia-brooks");
export const websiteLena = approvedTalent("lena-croft");
export const websiteMira = approvedTalent("mira-vale");
export const websiteElise = approvedTalent("elise-morgan");

const platformNames: Record<TalentNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitch: "Twitch",
  linkedin: "LinkedIn",
};

export function formatWebsiteMetric(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function websiteProfile(talent: StagedTalent) {
  const social = (network: TalentNetwork) => {
    const platform = talent.platforms.find((item) => item.network === network);
    return {
      n: platform ? formatWebsiteMetric(platform.followers) : "—",
      h: platform?.handle || "",
    };
  };
  return {
    id: talent.id,
    name: talent.displayName,
    portrait: talent.portrait,
    loc: talent.location,
    age: String(talent.age),
    gender: talent.gender,
    verticals: talent.verticals.join(" · "),
    bio: talent.bio,
    total: talent.totalAudience.toLocaleString("en-US"),
    totalShort: formatWebsiteMetric(talent.totalAudience),
    platforms: talent.platforms.map((platform) => ({
      network: platform.network,
      label: platformNames[platform.network],
      count: formatWebsiteMetric(platform.followers),
      handle: platform.handle,
    })),
    ig: social("instagram"),
    tt: social("tiktok"),
    yt: social("youtube"),
    li: social("linkedin"),
  };
}

/** Describes the displayed demo posts, never invented live account analytics. */
export function websiteContentStats(
  content: TalentContentTile[],
): [string, string][] {
  const withViews = content.filter((tile) => tile.views !== undefined);
  const views = withViews.reduce((total, tile) => total + tile.views!, 0);
  const withEngagements = content.filter(
    (tile) => tile.engagements !== undefined,
  );
  const engagements = withEngagements.reduce(
    (total, tile) => total + tile.engagements!,
    0,
  );
  return [
    [String(content.length), "Featured posts"],
    [withViews.length ? formatWebsiteMetric(views) : "—", "Combined views"],
    [
      withViews.length ? formatWebsiteMetric(views / withViews.length) : "—",
      "Avg. views",
    ],
    [
      withEngagements.length ? formatWebsiteMetric(engagements) : "—",
      "Engagements",
    ],
  ];
}
