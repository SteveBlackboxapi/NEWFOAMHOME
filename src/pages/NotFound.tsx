import { Link } from "react-router";
import { MarketingPage } from "../components/Marketing";
export function NotFound() {
  return (
    <MarketingPage>
      <section className="pc-not-found">
        <p className="mp-eyebrow">404 / A little off track</p>
        <h1>
          Let’s find your
          <br />
          next good thing.
        </h1>
        <p>This page may have moved. There’s plenty more to explore.</p>
        <div className="mp-actions">
          <Link className="mp-button" to="/">
            Back to Foam <span aria-hidden="true">↗</span>
          </Link>
          <Link className="mp-button mp-button-secondary" to="/features">
            Explore the tools
          </Link>
        </div>
      </section>
    </MarketingPage>
  );
}
