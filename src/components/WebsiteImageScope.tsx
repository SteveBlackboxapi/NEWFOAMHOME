import { createContext, useContext, type ReactNode } from "react";
import { useLocation } from "react-router";
import { resolveWebsitePlacementImage } from "../lib/websitePlacementImages";

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
