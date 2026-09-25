const VERSION = /^[a-f0-9]{16,64}$/i;
const CHECK_EVERY = 60_000;
const CHECK_THROTTLE = 10_000;
const IDLE_BEFORE_REFRESH = 15_000;
const RETRY_WHEN_BUSY = 5_000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;
const SCROLL_KEY = "foam:website-update-scroll:v1";
const SCROLL_MAX_AGE = 5 * 60_000;
const CANCEL_RESTORE_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel", "hashchange", "popstate"] as const;

function saveUpdateScroll(destination: URL, version: string) {
  if (destination.href.length > 2048) return;
  try {
    window.sessionStorage.setItem(SCROLL_KEY, JSON.stringify({
      url: destination.href, version, at: Date.now(),
      x: Math.max(0, Math.min(10_000_000, window.scrollX)),
      y: Math.max(0, Math.min(10_000_000, window.scrollY)),
    }));
  } catch { /* Refreshing still works when session storage is unavailable. */ }
}

/** One-use reading-position handoff for this exact automatic navigation only. */
export function restoreWebsiteUpdateScroll(): () => void {
  let saved: Record<string, unknown>;
  try {
    const raw = window.sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return () => undefined;
    // Claim the handoff once. A different navigation must never reuse it later.
    window.sessionStorage.removeItem(SCROLL_KEY);
    if (raw.length > 3072) return () => undefined;
    saved = JSON.parse(raw);
  } catch { return () => undefined; }
  if (!saved || typeof saved !== "object" || saved.url !== window.location.href || typeof saved.version !== "string" || !VERSION.test(saved.version)) return () => undefined;
  if (new URL(window.location.href).searchParams.get("foam-update") !== saved.version) return () => undefined;
  if (typeof saved.at !== "number" || !Number.isFinite(saved.at) || Date.now() - saved.at < 0 || Date.now() - saved.at > SCROLL_MAX_AGE) return () => undefined;
  if (typeof saved.x !== "number" || typeof saved.y !== "number" || !Number.isFinite(saved.x) || !Number.isFinite(saved.y) || saved.x < 0 || saved.y < 0 || saved.x > 10_000_000 || saved.y > 10_000_000) return () => undefined;
  const { x, y, url } = saved;
  let frame = 0;
  let scheduled = false;
  let stopped = false;
  const stop = () => {
    stopped = true;
    window.cancelAnimationFrame(frame);
    document.removeEventListener("DOMContentLoaded", schedule);
    window.removeEventListener("load", schedule);
    for (const event of CANCEL_RESTORE_EVENTS) window.removeEventListener(event, stop);
  };
  const schedule = () => {
    if (stopped || scheduled) return;
    scheduled = true;
    // React/router commit first; then restore without a smooth-scroll animation.
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        if (!stopped && window.location.href === url) window.scrollTo({ left: x, top: y, behavior: "instant" });
        stop();
      });
    });
  };
  for (const event of CANCEL_RESTORE_EVENTS) window.addEventListener(event, stop, { passive: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
    window.addEventListener("load", schedule, { once: true });
  } else schedule();
  return stop;
}

/** Keep public pages current without interrupting playback, editing or a dialog. */
export function startWebsiteUpdateChecks(currentVersion: string | undefined, baseUrl: string): () => void {
  if (!currentVersion || !VERSION.test(currentVersion)) return () => undefined;
  const cancelScrollRestore = restoreWebsiteUpdateScroll();
  const current = currentVersion.toLowerCase();
  const endpoint = new URL("website-version.json", new URL(baseUrl, window.location.href));
  const dirtyForms = new Set<Element>();
  let active = true;
  let checking = false;
  let reloading = false;
  let lastChecked = -Infinity;
  let lastActivity = Date.now();
  let pendingVersion: string | null = null;
  let pendingTimer: number | undefined;
  let request: AbortController | undefined;
  let requestTimeout: number | undefined;

  const clearPendingTimer = () => {
    window.clearTimeout(pendingTimer);
    pendingTimer = undefined;
  };
  const visible = () => document.visibilityState === "visible" && !document.hidden;
  const online = () => navigator.onLine !== false;
  const busy = () => {
    const focused = document.activeElement;
    if (focused && (focused.closest("form") || focused.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))) return true;
    for (const form of dirtyForms) {
      if (!form.isConnected) dirtyForms.delete(form);
    }
    if (dirtyForms.size) return true;
    for (const media of document.querySelectorAll<HTMLMediaElement>("audio, video")) {
      if (media.paused || media.ended) continue;
      // Silent looping backdrops can keep playing forever. Protect meaningful
      // playback, including custom players that opt in with this attribute.
      if (media.tagName !== "VIDEO" || media.controls || !media.muted || !(media as HTMLVideoElement).loop || media.hasAttribute("data-block-site-update")) return true;
    }
    for (const dialog of document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"]')) {
      if (dialog.hidden || dialog.getAttribute("aria-hidden") === "true" || !dialog.getClientRects().length) continue;
      const style = window.getComputedStyle(dialog);
      if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") return true;
    }
    return false;
  };
  const scheduleRefresh = (delay = 0) => {
    if (!active || reloading || !pendingVersion || !visible()) return;
    clearPendingTimer();
    pendingTimer = window.setTimeout(attemptRefresh, delay);
  };
  const attemptRefresh = () => {
    pendingTimer = undefined;
    if (!active || reloading || !pendingVersion || !visible()) return;
    const untilIdle = IDLE_BEFORE_REFRESH - (Date.now() - lastActivity);
    if (untilIdle > 0) {
      scheduleRefresh(untilIdle);
      return;
    }
    if (!online() || busy()) {
      scheduleRefresh(RETRY_WHEN_BUSY);
      return;
    }
    const destination = new URL(window.location.href);
    // If a deployment is still propagating, never loop on the same new token.
    if (destination.searchParams.get("foam-update") === pendingVersion) return;
    destination.searchParams.set("foam-update", pendingVersion);
    saveUpdateScroll(destination, pendingVersion);
    reloading = true;
    window.location.replace(destination.href);
  };
  const check = async () => {
    if (!active || reloading || checking || !visible() || !online() || Date.now() - lastChecked < CHECK_THROTTLE) return;
    checking = true;
    lastChecked = Date.now();
    request = new AbortController();
    const checkingRequest = request;
    requestTimeout = window.setTimeout(() => checkingRequest.abort(), 10_000);
    const url = new URL(endpoint);
    url.searchParams.set("t", String(lastChecked));
    try {
      const response = await fetch(url.href, { cache: "no-store", credentials: "same-origin", signal: request.signal });
      if (!response.ok) return;
      const data: unknown = await response.json();
      if (!active || checkingRequest.signal.aborted || !data || typeof data !== "object" || !("version" in data) || typeof data.version !== "string" || !VERSION.test(data.version)) return;
      pendingVersion = data.version.toLowerCase() === current ? null : data.version.toLowerCase();
      clearPendingTimer();
      if (pendingVersion) scheduleRefresh();
    } catch { /* Offline, blocked requests or a publishing transition leave the page alone. */ }
    finally {
      window.clearTimeout(requestTimeout);
      requestTimeout = undefined;
      checking = false;
    }
  };
  const activity = () => { lastActivity = Date.now(); };
  const revisit = () => {
    if (!visible()) {
      clearPendingTimer();
      return;
    }
    activity();
    void check();
    scheduleRefresh(IDLE_BEFORE_REFRESH);
  };
  const dirty = (event: Event) => {
    activity();
    if (!(event.target instanceof Element)) return;
    const form = event.target.closest("form");
    const control = event.target.closest("input, textarea, select, [contenteditable]");
    if (form || control) dirtyForms.add(form || control!);
  };
  const saved = (event: Event) => {
    activity();
    if (!(event.target instanceof Element)) return;
    const target = event.target;
    for (const form of dirtyForms) {
      if (form === target || target.contains(form)) dirtyForms.delete(form);
    }
  };

  for (const event of ACTIVITY_EVENTS) window.addEventListener(event, activity, { passive: true });
  window.addEventListener("focus", revisit);
  document.addEventListener("visibilitychange", revisit);
  document.addEventListener("input", dirty, true);
  document.addEventListener("change", dirty, true);
  document.addEventListener("submit", saved, true);
  document.addEventListener("reset", saved, true);
  const interval = window.setInterval(() => { void check(); }, CHECK_EVERY);
  void check();
  return () => {
    active = false;
    cancelScrollRestore();
    request?.abort();
    window.clearTimeout(requestTimeout);
    clearPendingTimer();
    window.clearInterval(interval);
    for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, activity);
    window.removeEventListener("focus", revisit);
    document.removeEventListener("visibilitychange", revisit);
    document.removeEventListener("input", dirty, true);
    document.removeEventListener("change", dirty, true);
    document.removeEventListener("submit", saved, true);
    document.removeEventListener("reset", saved, true);
  };
}

let stopUpdates: (() => void) | undefined;

export function registerWebsiteUpdates(): () => void {
  if (!import.meta.env.PROD || import.meta.env.VITE_PRIVATE_LAB === "true" || typeof window === "undefined") return () => undefined;
  if (!stopUpdates) {
    const stop = startWebsiteUpdateChecks(import.meta.env.VITE_WEBSITE_VERSION, import.meta.env.BASE_URL);
    stopUpdates = () => { stop(); stopUpdates = undefined; };
  }
  return stopUpdates;
}
