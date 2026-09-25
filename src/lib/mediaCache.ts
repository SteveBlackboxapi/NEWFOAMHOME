import imageVariants from "../data/imageVariants.json";

let registration: Promise<ServiceWorkerRegistration | null> | undefined;

/** Public production assets only. Failure leaves normal browser caching in place. */
export function registerMediaCache(): Promise<ServiceWorkerRegistration | null> {
  if (
    !import.meta.env.PROD ||
    import.meta.env.VITE_PRIVATE_LAB === "true" ||
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("serviceWorker" in navigator)
  ) return Promise.resolve(null);
  if (!registration) {
    const base = new URL(import.meta.env.BASE_URL, window.location.origin);
    const script = new URL("foam-media-sw.js", base);
    script.searchParams.set("v", imageVariants.revision);
    registration = navigator.serviceWorker.register(script.href, {
      scope: base.pathname,
      updateViaCache: "none",
    }).catch(() => null);
  }
  return registration;
}

/** Give first-visit activation a short head start, without holding up the page. */
export function waitForMediaCache(timeoutMs = 1500): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return Promise.resolve();
  const worker = navigator.serviceWorker;
  if (worker.controller) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.removeEventListener("controllerchange", finish);
      resolve();
    };
    const timer = window.setTimeout(finish, timeoutMs);
    worker.addEventListener("controllerchange", finish);
    void registerMediaCache().then((result) => {
      if (!result || worker.controller) finish();
    });
  });
}
