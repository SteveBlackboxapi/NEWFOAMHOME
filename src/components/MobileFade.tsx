import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/** Soft fade-in on scroll for mobile story beats. Skips motion when reduced. */
export function MobileFade({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = usePrefersReducedMotion();
  const [on, setOn] = useState(reduce);

  useEffect(() => {
    if (reduce) {
      setOn(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true);
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on || reduce ? "none" : "translateY(14px)",
        transition: reduce
          ? "none"
          : `opacity 520ms ease ${delayMs}ms, transform 520ms ease ${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
