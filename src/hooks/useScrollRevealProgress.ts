import { useEffect, useRef, useState } from "react";

/** Reversible progress through a section's natural scroll position. */
export function useScrollRevealProgress(reducedMotion = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;
      const viewport = window.innerHeight;
      const scroll = window.scrollY;
      const top = element.getBoundingClientRect().top + scroll;
      const start = top - viewport * 0.9;
      // A section close to the document end still reaches its final state.
      const finish = Math.min(
        top - viewport * 0.38,
        Math.max(0, document.documentElement.scrollHeight - viewport),
      );
      const next = Math.min(
        1,
        Math.max(0, (scroll - start) / Math.max(1, finish - start)),
      );
      setProgress((previous) =>
        next === 0 || next === 1 || Math.abs(previous - next) > 0.0001
          ? next
          : previous,
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Font/image layout changes can move a section without a scroll event.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return { ref, progress: reducedMotion ? 1 : progress };
}
