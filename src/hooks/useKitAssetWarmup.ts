import { resolveWebsitePlacementImage } from "../lib/websitePlacementImages";
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

function kitImage(src: string, section: string) {
  return resolveWebsitePlacementImage(src, "/kit-story", section);
}

function kitImages() {
  const responsive = (source: string, sizes: string, section: string): WarmImageRequest => {
    const src = kitImage(source, section);
    return { src, srcSet: imageSources(src), sizes };
  };
  const samantha = stagedTalent.find((talent) => talent.id === "samantha-pikka");
  return [
    ...KIT_FEATURED_CONTENT.map((tile) => responsive(tile.thumb, "(max-width: 767px) 44vw, (max-width: 1100px) 23vw, 240px", "Media Kit · Featured content")),
    imageSource(kitImage(`${A}/chrome-desktop-blurio.webp`, "Foam for Chrome · Desktop background")),
    ...stagedTalent.map((talent) => responsive(talent.portrait, "130px", "Foam for Chrome · Extension roster")),
    ...(samantha ? [
      responsive(samantha.portrait, "43vw", "Media Kit · Profile and sharing preview"),
      responsive(samantha.portrait, "105px", "Foam for Chrome · Selected profile and pasted email"),
      responsive(samantha.portrait, "48px", "Foam for Chrome · Selected profile and pasted email"),
    ] : []),
    imageSource(kitImage(`${A}/chrome-store-transparent.webp`, "Foam for Chrome · Send finale")),
    ...FOUND_RESULTS.flatMap(({ talent, tile }) => [
      responsive(tile.thumb, "(max-width: 700px) 45vw, 280px", "Found with Foam · Search results"),
      responsive(talent.portrait, "48px", "Found with Foam · Result avatars"),
    ]),
    responsive(FOUND_SELECTED.tile.thumb, "(max-width: 700px) 90vw, 400px", "Found with Foam · Review video poster"),
    ...FOUND_SEEN.map((moment) => responsive(moment.image, "(max-width: 700px) 42vw, 240px", `Found with Foam · Evidence: ${moment.label}`)),
    responsive(`${A}/campaigns/found-with-foam-skincare-v4.webp`, "(max-width: 700px) 100vw, 1200px", "From a search to your next campaign"),
    imageSource(kitImage(`${A}/agency-logos.webp`, "In good company · Agency ticker")),
  ];
}

export function useKitAssetWarmup() {
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      // Start from the opening poster. The rest never competes at high priority.
      await Promise.all([
        warmImage(imageSource(kitImage(`${A}/io-portrait-poster.webp`, "Media Kit · Samantha portrait film")), controller.signal),
        waitForMediaCache(),
      ]);
      if (!controller.signal.aborted) await warmImageQueue(kitImages(), controller.signal);
    })();
    return () => controller.abort();
  }, []);
}
