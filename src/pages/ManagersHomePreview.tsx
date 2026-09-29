import { useEffect } from "react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ManagersLanding } from "./ManagersLanding";
import "../components/people-colour-theme.css";
import "./managers-home-preview.css";

const PREVIEW_PATH = "/managers-home-preview";

/** Local comparison route, kept out of production builds. */
export function ManagersHomePreview() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Managers · Combined page test | Foam";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  return (
    <div className="pc-site min-h-screen bg-surface">
      <Nav managersLanding={PREVIEW_PATH} />
      <main id="main-content" tabIndex={-1}>
        <ManagersLanding />
      </main>
      <Footer managersLanding={PREVIEW_PATH} />
      <aside className="cmp-preview-label" aria-label="Combined Managers test page">
        <span>Managers · Test page</span>
        <a href="#combined-roster">Roster ↓</a>
        <a href="#combined-media-kit">Media kit ↓</a>
        <a href="#combined-inbox">Inbox ↓</a>
      </aside>
    </div>
  );
}
