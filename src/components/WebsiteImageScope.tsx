import { createContext, useContext, type ReactNode } from "react";
import { useLocation } from "react-router";
import { resolveWebsitePlacementImage } from "../lib/websitePlacementImages";
import { backgroundImageSource, imageSources } from "../lib/imageAssets";
import "./website-background-image.css";

const ImageSection = createContext<string | undefined>(undefined);
const ImageRoute = createContext<string | undefined>(undefined);

/** A test-page copy keeps the original page's saved image placements. */
export function WebsiteImageRoute({ route, children }: { route: string; children: ReactNode }) {
  return <ImageRoute.Provider value={route}>{children}</ImageRoute.Provider>;
}

/** Scope is semantic only: it adds no DOM or layout and follows the current public route. */
export function WebsiteImageScope({ section, children }: { section: string; children: ReactNode }) {
  return <ImageSection.Provider value={section}>{children}</ImageSection.Provider>;
}

export function useWebsiteImageResolver(section?: string) {
  const inheritedSection = useContext(ImageSection);
  const inheritedRoute = useContext(ImageRoute);
  const { pathname } = useLocation();
  return (src: string, exactSection = section || inheritedSection) =>
    import.meta.env.VITE_PRIVATE_LAB === "true" ? src : resolveWebsitePlacementImage(src, inheritedRoute || pathname, exactSection);
}

export function useWebsiteImage(src: string, section?: string): string {
  return useWebsiteImageResolver(section)(src);
}

export function useWebsiteBackground(background: string, section: string): string {
  const resolve = useWebsiteImageResolver(section);
  return background.replace(/url\(["']?([^"')]+)["']?\)/g, (_match, source: string) => `url("${resolve(source)}")`);
}

/** Native viewport/DPR selection for decorative photos, preserving saved placement overrides. */
export function WebsiteBackgroundImage({
  background,
  section,
  sizes,
  media,
  className = "",
}: {
  background: string;
  section: string;
  sizes: string;
  media: string;
  className?: string;
}) {
  const resolved = useWebsiteBackground(background, section);
  const src = backgroundImageSource(resolved);
  const srcSet = src ? imageSources(src) : undefined;
  const classes = `website-background-image ${className}`.trim();
  return src ? (
    <picture className={classes} aria-hidden="true">
      {srcSet && <source media={media} srcSet={srcSet} sizes={sizes} />}
      <img src={src} alt="" loading="lazy" decoding="async" />
    </picture>
  ) : (
    <div className={classes} style={{ backgroundImage: resolved }} aria-hidden="true" />
  );
}
