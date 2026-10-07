const VERSION = /^[a-f0-9]{16,64}$/i;
const CHECK_TIMEOUT = 5_000;
const ATTEMPTS_KEY = "foam:route-load-recovery:v1:";
let navigating = false;

export type RecoveryResult = "reloading" | "unavailable" | "unchanged" | "offline" | "already-tried" | "cancelled" | "not-applicable";
type RouteLocation = { pathname: string; search: string; hash: string };

/** Match browser/Vite import failures, without treating ordinary render errors as updates. */
export function isRouteLoadError(error: unknown): boolean {
  const message = error && typeof error === "object" && "message" in error ? error.message : error;
  return typeof message === "string" && /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css for/i.test(message);
}

/** useLocation is relative to the router basename; put that prefix back exactly once. */
export function routeRecoveryURL(location: RouteLocation, baseUrl: string, currentHref: string): URL | null {
  try {
    const current = new URL(currentHref);
    const base = new URL(baseUrl, current);
    if (base.origin !== current.origin || !location.pathname.startsWith("/") || location.pathname.startsWith("//") || /\\/.test(location.pathname)) return null;
    const prefix = base.pathname.replace(/\/+$/, "");
    const target = new URL(current.origin);
    target.pathname = `${prefix}${location.pathname}`;
    target.search = location.search;
    target.hash = location.hash;
    if (prefix && target.pathname !== prefix && !target.pathname.startsWith(`${prefix}/`)) return null;
    return target;
  } catch { return null; }
}

function triedVersions(key: string): string[] {
  try {
    const raw: unknown = JSON.parse(window.sessionStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw.filter((value): value is string => typeof value === "string" && VERSION.test(value)).slice(-8) : [];
  } catch { return []; }
}

/** One immediate public-release recovery, independent of the normal idle update timer. */
export async function recoverRouteLoad({
  error, target, currentVersion, baseUrl, enabled, signal,
}: {
  error: unknown;
  target: URL | null;
  currentVersion: string | undefined;
  baseUrl: string;
  enabled: boolean;
  signal: AbortSignal;
}): Promise<RecoveryResult> {
  if (!enabled || !target || !currentVersion || !VERSION.test(currentVersion) || !isRouteLoadError(error)) return "not-applicable";
  if (signal.aborted) return "cancelled";
  if (navigating) return "already-tried";
  const online = () => navigator.onLine !== false;
  if (!online()) return "offline";
  const startedAt = window.location.href;
  const base = new URL(baseUrl, startedAt);
  if (base.origin !== window.location.origin || target.origin !== base.origin) return "not-applicable";
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.addEventListener("abort", cancel, { once: true });
  const timeout = window.setTimeout(cancel, CHECK_TIMEOUT);
  try {
    const endpoint = new URL("website-version.json", base);
    endpoint.searchParams.set("t", String(Date.now()));
    const response = await fetch(endpoint.href, {
      cache: "no-store", credentials: "same-origin", redirect: "error", signal: request.signal,
    });
    if (!response.ok || response.redirected) return "unavailable";
    const latest: unknown = await response.json();
    if (signal.aborted || window.location.href !== startedAt) return "cancelled";
    if (request.signal.aborted) return "unavailable";
    if (!online()) return "offline";
    if (!latest || typeof latest !== "object" || !("version" in latest) || typeof latest.version !== "string" || !VERSION.test(latest.version)) return "unavailable";
    const version = latest.version.toLowerCase();
    if (version === currentVersion.toLowerCase()) return "unchanged";
    // The URL is the durable guard even when browser storage is disabled.
    // It also cooperates with the normal website updater's propagation guard.
    const key = ATTEMPTS_KEY + base.pathname;
    const attempts = triedVersions(key);
    if (navigating || target.searchParams.get("foam-update")?.toLowerCase() === version || attempts.includes(version)) return "already-tried";
    const destination = new URL(target);
    destination.searchParams.set("foam-update", version);
    try { window.sessionStorage.setItem(key, JSON.stringify([...attempts, version].slice(-8))); }
    catch { /* The version token still prevents repeated automatic refreshes. */ }
    navigating = true;
    try { window.location.replace(destination.href); }
    catch { navigating = false; return "unavailable"; }
    return "reloading";
  } catch {
    return signal.aborted || window.location.href !== startedAt ? "cancelled" : "unavailable";
  } finally {
    window.clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
  }
}
