import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/** Counts once when the figure itself enters view, alongside its existing reveal. */
export function NetworkStatValue({
  value,
  delayMs = 0,
  rootMargin = "0px",
}: {
  value: string;
  delayMs?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const completed = useRef(false);
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value.replace(/[\d,]+/, "0"));

  useEffect(() => {
    if (reduced || completed.current) {
      completed.current = true;
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let timer = 0;
    const amount = Number(value.replace(/\D/g, ""));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / 950);
            const number = Math.round(amount * (1 - Math.pow(1 - progress, 3)));
            setDisplay(value.replace(/[\d,]+/, number.toLocaleString("en-US")));
            if (progress < 1) frame = requestAnimationFrame(tick);
            else completed.current = true;
          };
          frame = requestAnimationFrame(tick);
        }, delayMs);
      },
      { threshold: 0.4, rootMargin },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, delayMs, rootMargin, reduced]);

  return (
    <span
      className="network-stat-value"
      ref={ref}
      style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
    >
      <span aria-hidden="true">{reduced ? value : display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
