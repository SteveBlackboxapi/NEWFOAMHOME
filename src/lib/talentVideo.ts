import { A } from "./assets";

/** Reviewed 720px playback versions; catalogue URLs still identify download masters. */
const VIDEO_PREVIEWS = new Map(
  [
    ["talent/aria-quen-v2/aria-quen-v2-makeup", "aria-makeup"],
    ["talent/lena-croft-v2/lena-croft-grwm", "lena-grwm"],
    ["talent/nia-brooks/nia-brooks-skincare", "nia-skincare"],
    ["talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh", "samantha-curl-refresh"],
  ].map(([original, preview]) => [
    `${A}/${original}.mp4`,
    `${A}/video-previews-v2/${preview}-720`,
  ]),
);

export type TalentVideoSource = { src: string; type?: string };

/** Native source selection skips unsupported WebM and uses the small MP4 fallback. */
export function talentVideoSources(original: string): TalentVideoSource[] {
  const preview = VIDEO_PREVIEWS.get(original);
  if (preview) {
    return [
      { src: `${preview}.webm`, type: 'video/webm; codecs="vp9"' },
      { src: `${preview}.mp4`, type: "video/mp4" },
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
