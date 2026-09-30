import { KitStory } from "./KitStory";
import { WebsiteImageRoute } from "../components/WebsiteImageScope";
import "./kit-hero-preview.css";

/** Local review route using the same kit story as production. */
export function KitHeroPreview() {
  return <div className="khp-preview">
    <WebsiteImageRoute route="/kit-story">
      <KitStory />
    </WebsiteImageRoute>
    <aside className="khp-preview-note" aria-label="Development preview">
      <span>Local preview</span>
      <a href="/kit-story/" target="_blank" rel="noopener noreferrer">View story ↗</a>
    </aside>
  </div>;
}
