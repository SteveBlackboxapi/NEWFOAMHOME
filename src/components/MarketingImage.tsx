import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { observeKitImage, type KitImageStatus } from "../lib/kitFeaturedMedia";
import { OptimizedImage, type WebsiteImageProps } from "./OptimizedImage";
import { useWebsiteImageResolver } from "./WebsiteImageScope";

/** Reuse the story's decode-aware reveal, including cached and failed images. */
export function MarketingImage({
  src,
  className = "",
  ...props
}: WebsiteImageProps) {
  const resolve = useWebsiteImageResolver(props.section);
  const resolved = src ? resolve(src) : src;
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<{
    src: typeof src;
    status: KitImageStatus;
  }>({
    src: resolved,
    status: "loading",
  });
  const status = state.src === resolved ? state.status : "loading";

  useLayoutEffect(() => {
    if (!image.current) return;
    // A drawable cached image is ready before the next paint. Replaying the
    // loading fade on every route visit makes even cache hits feel slow.
    if (image.current.complete && image.current.naturalWidth > 0) {
      setState({ src: resolved, status: "ready" });
      return;
    }
    return observeKitImage(image.current, (next) =>
      setState({ src: resolved, status: next }),
    );
  }, [resolved]);

  return (
    <OptimizedImage
      decoding="async"
      {...props}
      ref={image}
      src={resolved}
      className={`mp-image ${className}`.trim()}
      data-load-state={status}
    />
  );
}
