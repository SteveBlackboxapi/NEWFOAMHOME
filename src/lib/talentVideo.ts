import { A } from "./assets";

/** Reviewed, smaller previews only. MP4 masters remain the source of downloads. */
const WEBM_PREVIEWS = new Map(
  [
    "talent/aria-quen-v2/aria-quen-v2-makeup",
    "talent/lena-croft-v2/lena-croft-grwm",
    "talent/nia-brooks/nia-brooks-skincare",
    "talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh",
  ].map((path) => [`${A}/${path}.mp4`, `${A}/${path}.webm`]),
);

export type TalentVideoSource = { src: string; type?: string };

/** Native source selection skips unsupported WebM and retains the MP4 fallback. */
export function talentVideoSources(original: string): TalentVideoSource[] {
  const webm = WEBM_PREVIEWS.get(original);
  if (webm) {
    return [
      { src: webm, type: 'video/webm; codecs="vp9"' },
      { src: original, type: "video/mp4" },
    ];
  }
  // Do not guess alternate paths for uploads or outside sources.
  const extension = original.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  const type =
    extension === "mp4"
      ? "video/mp4"
      : extension === "webm"
        ? "video/webm"
        : undefined;
  return [{ src: original, ...(type ? { type } : {}) }];
}
