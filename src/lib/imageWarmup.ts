const warmed = new Set<string>();

export type WarmImageOptions = { srcSet?: string; sizes?: string };
export type WarmImageRequest = { src: string } & WarmImageOptions;

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

