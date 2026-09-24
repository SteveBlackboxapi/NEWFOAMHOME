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
