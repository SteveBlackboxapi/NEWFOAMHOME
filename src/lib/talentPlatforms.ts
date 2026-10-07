import type { StagedTalent, TalentNetwork } from "../data/stagedTalent";

/** A demo post can have a platform before its creator has any audience figures. */
export function talentNetworks(talent: StagedTalent): TalentNetwork[] {
  return [...new Set([
    ...talent.platforms.map((account) => account.network),
    ...talent.content.map((post) => post.platform),
  ])];
}

export function matchesTalentPlatforms(
  talent: StagedTalent,
  selected: TalentNetwork[],
): boolean {
  return !selected.length || talentNetworks(talent).some((network) => selected.includes(network));
}

/** Show the library's existing platforms in the opening cards, without relabelling posts. */
export function mixFeaturedPlatforms<T extends { tile?: { platform: TalentNetwork } }>(assets: T[]): T[] {
  const networks: TalentNetwork[] = ["instagram", "tiktok", "youtube"];
  const queues = networks.map((network) => assets.filter((asset) => asset.tile?.platform === network));
  const featured: T[] = [];
  // Rotate each row too, so a three-column layout does not become one platform per column.
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < networks.length; column++) {
      const next = queues[(row + column) % networks.length].shift();
      if (next) featured.push(next);
    }
  }
  const selected = new Set(featured);
  return [...featured, ...assets.filter((asset) => !selected.has(asset))];
}
