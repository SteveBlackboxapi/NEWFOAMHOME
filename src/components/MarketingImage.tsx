import {
  useLayoutEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
} from "react";
import { observeKitImage, type KitImageStatus } from "../lib/kitFeaturedMedia";

/** Reuse the story's decode-aware reveal, including cached and failed images. */
export function MarketingImage({
  src,
  className = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const image = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<{
    src: typeof src;
    status: KitImageStatus;
  }>({
    src,
    status: "loading",
  });
  const status = state.src === src ? state.status : "loading";

  useLayoutEffect(() => {
    if (!image.current) return;
    return observeKitImage(image.current, (next) =>
      setState({ src, status: next }),
    );
  }, [src]);

  return (
    <img
      decoding="async"
      {...props}
      ref={image}
      src={src}
      className={`mp-image ${className}`.trim()}
      data-load-state={status}
    />
  );
}
