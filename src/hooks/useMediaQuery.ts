import { useEffect, useState } from "react";

/** `null` until the first client match (avoids wrong desktop/mobile flash). */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

/** Tailwind `md` and up (768px). Desktop scroll theatre stays on this path. */
export function useIsDesktop(): boolean | null {
  return useMediaQuery("(min-width: 768px)");
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)") === true;
}
