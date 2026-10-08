import { A } from "../lib/assets";
import type { TalentContentTile } from "./stagedTalent";

/** Approved still refresh; the existing post identity, caption and metrics stay intact. */
export const zaneShoeChatImage: Pick<TalentContentTile, "thumb" | "original" | "provenance" | "generation"> = {
  // Keep the canonical website placement stable; its saved overlay is published separately.
  thumb: `${A}/talent/discovery-v1/zane-shoe-chat.webp`,
  original: `${A}/talent/uploads/zane-holt-shoe-chat-banana-v1-original.jpg`,
  provenance: "ai-generated",
  generation: {
    version: "Nike shoe chat · Nano Banana Pro v1",
    approach: "Approved bearded-runner still generated with Google gemini-3-pro-image (Nano Banana Pro), selected from runner-a.jpg. Natural phone-camera light and skin texture are preserved. This is fictional demo imagery, not a real social post, sponsorship or endorsement.",
    prompt: `${A}/talent/zane-holt-banana-v1/provenance.json`,
  },
};

export const zaneShoeChatReferences = [
  { label: "Nike shoe chat · earlier approved thumbnail", src: `${A}/talent/zane-holt-banana-v1/previous-preview.webp` },
  { label: "Nike shoe chat · earlier original master", src: `${A}/talent/discovery-v1/masters/zane-shoe-chat.png` },
];
