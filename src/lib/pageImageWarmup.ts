import { warmImageQueue, type WarmImageRequest } from "./imageWarmup";

export const PAGE_IMAGE_WARMUP_LIMIT = 12;

type Connection = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
};

export function canWarmPageImages(online: boolean, visibility: string, connection?: Connection) {
  return online && visibility === "visible" && !connection?.saveData &&
    connection?.effectiveType !== "slow-2g" && connection?.effectiveType !== "2g";
}

export function isPublicImageWarmupRoute(pathname: string) {
  return ["/", "/managers", "/brands", "/features", "/about", "/creators", "/updates", "/demo"]
    .includes(pathname.replace(/\/+$/, "") || "/");
}

function publicPhoto(source: string, baseUrl: string, assets: URL): string | undefined {
  try {
    const url = new URL(source, baseUrl);
    return url.origin === assets.origin && url.pathname.startsWith(`${assets.pathname.replace(/\/$/, "")}/`) &&
      /\.(?:avif|webp|jpe?g|png)$/i.test(url.pathname) ? url.href : undefined;
  } catch { return undefined; }
}

function isRendered(image: HTMLImageElement) {
  if (!image.getClientRects().length) return false;
  const bounds = image.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) return false;
  for (let element: Element | null = image; element; element = element.parentElement) {
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" ||
      style.contentVisibility === "hidden") return false;
    // These marketing reveals intentionally fade from transparent after image
    // decode or scrolling. They still need their lower-page photos prepared.
    if (style.opacity === "0" && !element.matches('.mp-reveal, .mp-image[data-load-state="loading"]')) return false;
  }
  return true;
}

/** Select only the current page's rendered lazy photos; the browser chooses responsive candidates. */
export function collectPageImageWarmup(root: ParentNode, assetRoot: string, baseUrl: string): WarmImageRequest[] {
  const assets = new URL(assetRoot, baseUrl);
  if (assets.origin !== new URL(baseUrl).origin) return [];
  const requests: WarmImageRequest[] = [];
  const seen = new Set<string>();
  for (const image of root.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) {
    // Picture sources need their own media/type choice. Download links and
    // hidden mobile/desktop copies must not turn into speculative requests.
    if (image.closest("picture, a[download], [hidden], [inert]") || !isRendered(image) ||
      (image.complete && image.naturalWidth > 0)) continue;
    const src = image.getAttribute("src");
    const photo = src && publicPhoto(src, baseUrl, assets);
    if (!photo) continue;
    const srcSet = image.getAttribute("srcset") || undefined;
    const sizes = image.getAttribute("sizes") || undefined;
    // Auto sizes depend on the lazy element's layout, unlike a detached Image.
    if (sizes && /(?:^|,)\s*auto(?:\s|,|$)/i.test(sizes)) continue;
    if (srcSet && !srcSet.split(",").every((candidate) => {
      const match = /^\s*(\S+?)(?:\s+(?:[1-9]\d*w|(?:\d*\.)?\d+x))?\s*$/.exec(candidate);
      return match && publicPhoto(match[1], baseUrl, assets);
    })) continue;
    // A small avatar must not consume the larger card's native selection.
    const key = JSON.stringify([photo, srcSet || "", srcSet ? sizes || "100vw" : ""]);
    if (seen.has(key)) continue;
    seen.add(key);
    requests.push({ src: photo, ...(srcSet ? { srcSet, ...(sizes ? { sizes } : {}) } : {}) });
    if (requests.length === PAGE_IMAGE_WARMUP_LIMIT) break;
  }
  return requests;
}

/** One cancellable idle pass per public route; never delays rendering or navigation. */
export function startPageImageWarmup(assetRoot: string, waitForCache: () => Promise<void>): () => void {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const permitted = () => canWarmPageImages(navigator.onLine, document.visibilityState, connection);
  if (!permitted()) return () => {};
  const controller = new AbortController();
  let cancelIdle: (() => void) | undefined;
  const stop = () => {
    controller.abort();
    cancelIdle?.();
    window.removeEventListener("load", begin);
    window.removeEventListener("offline", stop);
    document.removeEventListener("visibilitychange", environmentChanged);
    connection?.removeEventListener?.("change", environmentChanged);
  };
  const environmentChanged = () => { if (!permitted()) stop(); };
  const warm = () => {
    if (controller.signal.aborted || !permitted()) return;
    const main = document.getElementById("main-content");
    if (main) void warmImageQueue(collectPageImageWarmup(main, assetRoot, document.baseURI), controller.signal);
  };
  const begin = () => {
    void waitForCache().then(() => {
      if (controller.signal.aborted || !permitted()) return;
      if (typeof window.requestIdleCallback === "function") {
        const idle = window.requestIdleCallback(warm, { timeout: 2500 });
        cancelIdle = () => window.cancelIdleCallback(idle);
      } else {
        const timer = window.setTimeout(warm, 250);
        cancelIdle = () => window.clearTimeout(timer);
      }
    }).catch(() => { /* Speculation must never affect the page. */ });
  };
  window.addEventListener("offline", stop, { once: true });
  document.addEventListener("visibilitychange", environmentChanged);
  connection?.addEventListener?.("change", environmentChanged);
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
  return stop;
}
