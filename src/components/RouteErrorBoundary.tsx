import { useEffect, useState } from "react";
import { useLocation, useRouteError } from "react-router";
import { recoverRouteLoad, routeRecoveryURL, type RecoveryResult } from "../lib/routeLoadRecovery";
import "./route-error-boundary.css";

/** This stays in the entry bundle so a missing lazy page can still recover. */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const location = useLocation();
  const base = import.meta.env.BASE_URL;
  const destination = routeRecoveryURL(location, base, window.location.href)?.href || null;
  const [status, setStatus] = useState<RecoveryResult | "checking">("checking");
  useEffect(() => {
    const controller = new AbortController();
    setStatus("checking");
    void recoverRouteLoad({
      error,
      target: destination ? new URL(destination) : null,
      currentVersion: import.meta.env.VITE_WEBSITE_VERSION,
      baseUrl: base,
      enabled: import.meta.env.PROD && import.meta.env.VITE_PRIVATE_LAB !== "true",
      signal: controller.signal,
    }).then(result => { if (!controller.signal.aborted) setStatus(result); });
    return () => controller.abort();
  }, [error, destination, base]);
  const checking = status === "checking" || status === "reloading";
  return (
    <main className="route-error" id="main-content" tabIndex={-1}>
      <div className="route-error-card">
        <a className="route-error-brand" href={base} aria-label="Foam home">foam</a>
        <h1>{status === "reloading" ? "Bringing you the latest page." : "This page couldn’t load."}</h1>
        <p role="status">
          {checking ? "We’re checking for the latest version. This will only take a moment."
            : status === "offline" ? "Check your connection, then try again."
            : "Please try again, or head back to Foam."}
        </p>
        <div className="route-error-actions">
          <button type="button" onClick={() => window.location.reload()}>Try again <span aria-hidden="true">↻</span></button>
          <a href={base}>Back to Foam <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </main>
  );
}
