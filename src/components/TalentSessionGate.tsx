import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { PRIVATE_LIBRARY } from "../lib/githubTalentLibrary";
import "./TalentSessionGate.css";

/** Keep the library mounted across expiry so a sign-in never discards a draft. */
export function TalentSessionGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(!PRIVATE_LIBRARY);
  const [state, setState] = useState<"checking" | "ready" | "expired" | "offline">(PRIVATE_LIBRARY ? "checking" : "ready");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const expiry = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  const checking = useRef(false);
  const alive = useRef(true);
  const expire = useCallback(() => {
    generation.current++;
    clearTimeout(expiry.current);
    setState("expired");
  }, []);
  const check = useCallback(async (force = false) => {
    if (checking.current && !force) return;
    checking.current = true;
    const version = generation.current;
    const started = performance.now();
    try {
      const result = await fetch("/api/status", { cache: "no-store", credentials: "same-origin", signal: AbortSignal.timeout(10000) });
      if (!alive.current || version !== generation.current) return;
      if (result.status === 401) { expire(); return; }
      if (!result.ok) throw new Error("unavailable");
      const status = await result.json();
      if (!alive.current || version !== generation.current) return;
      clearTimeout(expiry.current);
      if (typeof status.sessionRemainingSeconds === "number") {
        const remaining = status.sessionRemainingSeconds * 1000 - (performance.now() - started);
        if (remaining <= 0) { expire(); return; }
        expiry.current = setTimeout(expire, remaining);
      }
      setUnlocked(true);
      setState("ready");
      setMessage("");

    } catch {
      if (alive.current && version === generation.current) setState(current => current === "expired" ? current : "offline");
    } finally { checking.current = false; }
  }, [expire]);
  useEffect(() => {
    if (!PRIVATE_LIBRARY) return;
    alive.current = true;
    const initial = setTimeout(() => void check(), 0);
    const resume = () => { if (document.visibilityState === "visible") void check(); };
    const assetError = (event: Event) => {
      if (event.target instanceof HTMLImageElement || event.target instanceof HTMLMediaElement) void check();
    };
    const interval = setInterval(resume, 60000);
    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    document.addEventListener("error", assetError, true);
    window.addEventListener("foam:session-expired", expire);
    return () => {
      alive.current = false;
      generation.current++;
      clearTimeout(initial);
      clearTimeout(expiry.current);
      clearInterval(interval);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
      document.removeEventListener("error", assetError, true);
      window.removeEventListener("foam:session-expired", expire);
    };
  }, [check, expire]);
  useEffect(() => {
    if (state === "ready") dialog.current?.close();
    else if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [state]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get("password") || "");
    setBusy(true);
    setMessage("");
    try {
      const result = await fetch("/api/login", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }), signal: AbortSignal.timeout(10000) });
      if (!result.ok) {
        setMessage(result.status === 401 ? "That password wasn’t recognised. Please try again." : result.status === 429 ? "Too many attempts. Please wait a minute and try again." : "Could not sign in. Please try again.");
        return;
      }
      form.reset();
      generation.current++;
      // Ignore an older in-flight status response after a fresh sign-in.
      await check(true);
      document.querySelectorAll<HTMLImageElement>("img").forEach(image => {
        if (image.complete && !image.naturalWidth && image.getAttribute("src")) image.src = image.src;
      });
    } catch { setMessage("Could not connect. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  if (!PRIVATE_LIBRARY) return children;
  return <>
    {unlocked && children}
    <dialog ref={dialog} className="lab-session-gate" aria-labelledby="lab-session-title" onCancel={event => event.preventDefault()}>
      <div className="lab-session-card">
        <p className="lab-session-brand">foam · Talent Lab</p>
        <h1 id="lab-session-title">{state === "expired" ? "Sign in to continue" : state === "offline" ? "Let’s reconnect" : "Checking your session…"}</h1>
        {state === "expired" ? <>
          <p>Your session has ended. Unlock the Lab to see your images and carry on.{unlocked ? " Any unsaved edits are still here." : ""}</p>
          <form onSubmit={login}>
            <label htmlFor="lab-session-password">Lab password</label>
            <input id="lab-session-password" name="password" type="password" autoComplete="current-password" required maxLength={256} autoFocus />
            <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Unlock Talent Lab"}</button>
          </form>
        </> : state === "offline" ? <>
          <p>We couldn’t check your sign-in. Check your connection, then try again. Your work is still here.</p>
          <button onClick={() => void check()}>Try again</button>
        </> : <p>Please wait while we check your access.</p>}
        {message && <p role="alert">{message}</p>}
      </div>
    </dialog>
  </>;
}
