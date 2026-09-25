import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { FooterSongProvider } from "./components/FooterSong";
import "./components/people-colour-theme.css";

/** Keep history and deep links working across both marketing and story routes. */
export function NavigationLayout() {
  return (
    <FooterSongProvider>
      <ScrollRestoration />
      <Outlet />
    </FooterSongProvider>
  );
}

export function Root() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "A world of talent",
      "/home-film-preview": "Homepage film preview",
      "/managers": "For talent managers",
      "/brands": "For brands and agencies",
      "/creators": "For creators",
      "/features": "Explore the platform",
      "/about": "About Foam",
      "/data-trust": "Data & trust",
      "/updates": "Inside Foam",
      "/demo": "Meet Foam",
    };
    document.title = `${titles[pathname.replace(/\/$/, "") || "/"] || "Page not found"} | Foam`;
    return () => {
      document.title = "Foam — Numbers everyone can trust";
    };
  }, [pathname]);
  return (
    <div className="pc-site min-h-screen bg-surface">
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
