import { Link } from "react-router";
import { Home } from "./Home";
import "./home-film-preview.css";

/** Retain the approved preview URL for comparison with the published homepage. */
export function HomeFilmPreview() {
  return (
    <>
      <aside className="hfp-preview-label" aria-label="Homepage preview">
        <a href="#foam-film">Homepage · Film preview ↓</a>
        <Link to="/">Live homepage <span aria-hidden="true">↗</span></Link>
      </aside>
      <Home />
    </>
  );
}
