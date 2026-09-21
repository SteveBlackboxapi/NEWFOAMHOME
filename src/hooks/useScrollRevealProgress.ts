import { useLayoutEffect, useRef, useState } from "react";

export function scrollRevealProgress({
  sectionTop,
  scrollY,
  viewportHeight,
  documentHeight,
}: {
  sectionTop: number;
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
}) {
  const start = sectionTop - viewportHeight - 70;
  // A section close to the document end still reaches its final state.
  const finish = Math.min(
    sectionTop - viewportHeight * 0.38,
    Math.max(0, documentHeight - viewportHeight),
  );
  return Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, finish - start)));
}

/** Reversible progress through a section's natural scroll position. */
export function useScrollRevealProgress(reducedMotion = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;
      const viewport = window.innerHeight;
      const scroll = window.scrollY;
      const top = element.getBoundingClientRect().top + scroll;
      setProgress(scrollRevealProgress({
        sectionTop: top,
        scrollY: scroll,
        viewportHeight: viewport,
        documentHeight: document.documentElement.scrollHeight,
      }));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    // Font/image layout changes can move a section without a scroll event.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return { ref, progress: reducedMotion ? 1 : progress };
}
