import { Outlet, ScrollRestoration } from "react-router";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { FooterSongProvider } from "./components/FooterSong";
import { SiteMetadata } from "./components/SiteMetadata";
import "./components/people-colour-theme.css";

/** Keep history and deep links working across both marketing and story routes. */
export function NavigationLayout() {
  return (
    <FooterSongProvider>
      <SiteMetadata />
      <ScrollRestoration />
      <Outlet />
    </FooterSongProvider>
  );
}

export function Root() {
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
