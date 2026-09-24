import { websiteFitness } from "./campaignTalent";
import { websiteAria, websiteNia, websiteSamantha } from "./websiteTalent";
import type { ContentPlatform, StagedTalent } from "./stagedTalent";

export const demoNetworks: { network: ContentPlatform; label: string }[] = [
  { network: "instagram", label: "Instagram" },
  { network: "tiktok", label: "TikTok" },
  { network: "youtube", label: "YouTube" },
];

// Illustrative roster size for the search animation, not a live catalogue count.
export const demoReviewTotal = 195;

// Public examples use the same fictional account figures as the creator kits.
// Filter the small approved cast so the displayed results meet the query.
const cast = [websiteSamantha, websiteAria, websiteNia, websiteFitness];
const followers = (talent: StagedTalent, network: ContentPlatform) =>
  talent.platforms.find((account) => account.network === network)?.followers ?? 0;

export const talentSearchExamples = [
  {
    id: "beauty",
    label: "By interest",
    query: "Beauty creators with over 100K Instagram followers",
    criteria: ["Beauty", "Instagram", "100K+ followers"],
    network: "instagram" as const,
    matches: cast.filter((talent) => talent.verticals.includes("Beauty") && followers(talent, "instagram") > 100_000),
  },
  {
    id: "london",
    label: "By location",
    query: "Creators in London with over 100K TikTok followers",
    criteria: ["London", "TikTok", "100K+ followers"],
    network: "tiktok" as const,
    matches: cast.filter((talent) => talent.location.includes("London") && followers(talent, "tiktok") > 100_000),
  },
  {
    id: "youtube",
    label: "By platform",
    query: "Beauty creators on YouTube with over 100K subscribers",
    criteria: ["Beauty", "YouTube", "100K+ subscribers"],
    network: "youtube" as const,
    matches: cast.filter((talent) => talent.verticals.includes("Beauty") && followers(talent, "youtube") > 100_000),
  },
];
