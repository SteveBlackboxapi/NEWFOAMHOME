import { useEffect, useRef, useState } from "react";
import "./story-scroll-controls.css";

/** A gentle repeating invitation while idle at the opening; scrolling dismisses it. */
export function StoryScrollCue() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (window.scrollY >= 24) return;
    let timer = 0;
    let dismissed = false;
    const schedule = (show: boolean, duration: number, next: () => void) => {
      if (dismissed) return;
      setVisible(show);
      timer = window.setTimeout(next, duration);
    };
    const repeat = () =>
      schedule(true, 3000, () => schedule(false, 7000, repeat));
    // Preserve the first appearance, then wait 6.5 seconds before the repeat cycle.
    schedule(true, 4600, () => schedule(false, 6500, repeat));
    const dismiss = () => {
      if (window.scrollY < 24) return;
      dismissed = true;
      clearTimeout(timer);
      setVisible(false);
    };
    window.addEventListener("scroll", dismiss, { passive: true });
    return () => {
      dismissed = true;
      clearTimeout(timer);
      window.removeEventListener("scroll", dismiss);
    };
  }, []);

  return (
    <div
      className={`story-scroll-cue ${visible ? "is-visible" : ""}`}
      aria-hidden="true"
    >
      <span className="story-scroll-mouse">
        <span />
      </span>
      <span>Scroll to explore</span>
    </div>
  );
}

/** Fixed duration keeps the return quick even through the long pinned story. */
export function StoryBackToTop() {
  const cancelScroll = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => cancelScroll.current?.(), []);

  const backToTop = () => {
    cancelScroll.current?.();
    const from = window.scrollY;
    const started = performance.now();
    let frame = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
    };
    cancelScroll.current = stop;
    const finish = () => {
      stop();
      window.scrollTo({ top: 0, behavior: "instant" });
      // A discovery deep link should not restore its old chapter on refresh.
      if (window.location.hash)
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search,
        );
      frame = requestAnimationFrame(() => {
        document
          .getElementById("kit-story-title")
          ?.focus({ preventScroll: true });
      });
    };
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      from === 0
    ) {
      finish();
      return;
    }
    const tick = (time: number) => {
      const progress = Math.min(1, (time - started) / 360);
      window.scrollTo({
        top: from * Math.pow(1 - progress, 4),
        behavior: "instant",
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    window.addEventListener("pointerdown", stop);
    frame = requestAnimationFrame(tick);
  };

  return (
    <div className="story-return">
      <button type="button" onClick={backToTop} className="story-return-button">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 19V5m-6 6 6-6 6 6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to top
      </button>
    </div>
  );
}
