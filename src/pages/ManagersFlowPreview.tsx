import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { WebsiteImageRoute } from "../components/WebsiteImageScope";
import { ManagersLanding } from "./ManagersLanding";
import "../components/people-colour-theme.css";
import "./managers-flow-preview.css";

const PREVIEW_PATH = "/managers-flow-preview";

/** Local comparison only; the route is excluded from production. */
export function ManagersFlowPreview() {
  const [params, setParams] = useSearchParams();
  const proposed = params.get("order") !== "current";

  useEffect(() => {
    document.title = `Managers · ${proposed ? "Proposed" : "Current"} order | Foam`;
  }, [proposed]);

  return (
    <WebsiteImageRoute route="/">
      <div className="pc-site min-h-screen bg-surface managers-flow-preview">
        <Nav managersLanding={PREVIEW_PATH} />
        <main id="main-content" tabIndex={-1}>
          <ManagersLanding previewOrder={proposed} />
        </main>
        <Footer managersLanding={PREVIEW_PATH} />
        <aside className="mfp-comparison" aria-label="Managers page comparison">
          <span className="mfp-label">Managers · Preview</span>
          <div className="mfp-switch" role="group" aria-label="Page order">
            <button type="button" aria-pressed={!proposed} onClick={() => setParams({ order: "current" })}>Current</button>
            <button type="button" aria-pressed={proposed} onClick={() => setParams({ order: "proposed" })}>Proposed</button>
          </div>
          <a href="#foam-film">Jump to film <span aria-hidden="true">↓</span></a>
        </aside>
      </div>
    </WebsiteImageRoute>
  );
}
