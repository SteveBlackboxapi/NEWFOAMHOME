import { WebsiteImageRoute } from "../components/WebsiteImageScope";
import { Updates } from "./Updates";
import "./inside-foam-preview.css";

/** Review Inside Foam artwork separately before changing the published page. */
export function InsideFoamPreview() {
  return <>
    <aside className="ifp-preview-tools" aria-label="Inside Foam preview controls">
      <span>Inside Foam · Test page</span>
      <a href="#inside-kit-cover">Media kit card ↓</a>
      <a href="#inside-discovery">Discovery card ↓</a>
      <a href="#inside-network">Creator network ↓</a>
      <a href="https://steveblackboxapi.github.io/NEWFOAMHOME/updates/" target="_blank" rel="noopener noreferrer">Current live page ↗</a>
    </aside>
    <WebsiteImageRoute route="/updates">
      <Updates portraitDiscovery />
    </WebsiteImageRoute>
  </>;
}
