import { OptimizedImage } from "./OptimizedImage";
import { A } from "../lib/assets";

/** Decorative beside the visible Media Kit title. */
export function MediaKitLogo({ className = "" }: { className?: string }) {
  return (
    <OptimizedImage section="Media Kit · Opening and send finale"
      src={`${A}/foam-media-kit.webp`}
      alt=""
      width={640}
      height={640}
      decoding="async"
      className={`block h-auto shrink-0 object-contain ${className}`.trim()}
    />
  );
}
