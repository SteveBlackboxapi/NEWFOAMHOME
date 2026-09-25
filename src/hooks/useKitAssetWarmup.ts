import { useEffect } from "react";
import { KIT_FEATURED_CONTENT } from "../data/kitFeaturedContent";
import { FOUND_RESULTS, FOUND_SEEN, FOUND_SELECTED } from "../data/foundWithFoam";
import { stagedTalent } from "../data/stagedTalent";
import { A } from "../lib/assets";
import { imageSource, imageSources } from "../lib/imageAssets";
import { waitForMediaCache } from "../lib/mediaCache";

const warmed = new Set<string>();

export type WarmImageOptions = { srcSet?: string; sizes?: string };
type WarmImageRequest = { src: string } & WarmImageOptions;

function requestKey({ src, srcSet, sizes }: WarmImageRequest) {
  // A different viewport/density can choose another responsive candidate.
  return srcSet
    ? JSON.stringify([src, srcSet, sizes || "100vw", window.innerWidth, window.devicePixelRatio || 1])
    : src;
}

/** Low-priority requests populate HTTP/worker cache, then prepare image decoding. */
export function warmImage(src: string, signal: AbortSignal, options: WarmImageOptions = {}): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  const key = requestKey({ src, ...options });
  if (warmed.has(key)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", cancel);
      if (loaded) warmed.add(key);
      else {
        image.removeAttribute("src");
        image.removeAttribute("srcset");
      }
      resolve(loaded);
    };
    const cancel = () => finish(false);
    const timeout = window.setTimeout(cancel, 20000);
    signal.addEventListener("abort", cancel, { once: true });
    image.fetchPriority = "low";
    image.decoding = "async";
    image.onload = async () => {
      try { await image.decode(); } catch { /* Loaded images can still be drawable. */ }
      finish(!signal.aborted && image.naturalWidth > 0);
    };
    image.onerror = cancel;
    // Match the visible img's native selection. Set sizes before srcset/src so
    // a wide default or the original fallback cannot start an unwanted fetch.
    if (options.srcSet) {
      image.sizes = options.sizes || "100vw";
      image.srcset = options.srcSet;
    }
    image.src = src;
  });
}

/** Exactly two requests at a time; unmounting stops queued and in-flight warm-ups. */
export async function warmImageQueue(sources: readonly (string | WarmImageRequest)[], signal: AbortSignal): Promise<void> {
  const requests = sources.map((source) => typeof source === "string" ? { src: source } : source);
  const queue = [...new Map(requests.map((request) => [requestKey(request), request])).values()];
  let next = 0;
  const run = async () => {
    while (!signal.aborted && next < queue.length) {
      const { src, ...options } = queue[next++];
      await warmImage(src, signal, options);
    }
  };
  await Promise.all([run(), run()]);
}

function kitImages() {
  const responsive = (src: string, sizes: string): WarmImageRequest => ({ src, srcSet: imageSources(src), sizes });
  const samantha = stagedTalent.find((talent) => talent.id === "samantha-pikka");
  return [
    ...KIT_FEATURED_CONTENT.map((tile) => responsive(tile.thumb, "(max-width: 767px) 44vw, (max-width: 1100px) 23vw, 240px")),
    // These two are fixed CSS/native-image sources, not responsive img elements.
    imageSource(`${A}/chrome-desktop-blurio.webp`),
    ...stagedTalent.map((talent) => responsive(talent.portrait, "130px")),
    ...(samantha ? [responsive(samantha.portrait, "43vw"), responsive(samantha.portrait, "105px"), responsive(samantha.portrait, "48px")] : []),
    imageSource(`${A}/chrome-store-transparent.webp`),
    ...FOUND_RESULTS.flatMap(({ talent, tile }) => [
      responsive(tile.thumb, "(max-width: 700px) 45vw, 280px"),
      responsive(talent.portrait, "48px"),
    ]),
    responsive(FOUND_SELECTED.tile.thumb, "(max-width: 700px) 90vw, 400px"),
    ...FOUND_SEEN.map((moment) => responsive(moment.image, "(max-width: 700px) 42vw, 240px")),
    responsive(`${A}/campaigns/found-with-foam-skincare-v4.webp`, "(max-width: 700px) 100vw, 1200px"),
    imageSource(`${A}/agency-logos.webp`),
  ];
}

export function useKitAssetWarmup() {
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      // Start from the opening poster. The rest never competes at high priority.
      await Promise.all([
        warmImage(imageSource(`${A}/io-portrait-poster.webp`), controller.signal),
        waitForMediaCache(),
      ]);
      if (!controller.signal.aborted) await warmImageQueue(kitImages(), controller.signal);
    })();
    return () => controller.abort();
  }, []);
}
