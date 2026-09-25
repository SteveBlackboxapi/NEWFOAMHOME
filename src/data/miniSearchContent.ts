import { websiteAria, websiteNia, websiteSamantha } from "./websiteTalent";

/** The miniature and image-placement map share the exact same three posts. */
export const miniSearchContent = [
  { name: "Samantha", tile: websiteSamantha.content.find((tile) => tile.id === "0")! },
  { name: "Aria", tile: websiteAria.content[0] },
  { name: "Nia", tile: websiteNia.content[0] },
];
