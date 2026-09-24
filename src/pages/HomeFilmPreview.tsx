import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Home } from "./Home";
import { OverviewFilm } from "../components/OverviewFilm";
import "./home-film-preview.css";

/** A preview of the same homepage composition; the main route has no film slot. */
export function HomeFilmPreview() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== "#foam-film") return;
    const frame = requestAnimationFrame(() => document.getElementById("foam-film")?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <>
      <aside className="hfp-preview-label" aria-label="Homepage preview">
        <a href="#foam-film">Homepage · Film preview ↓</a>
        <Link to="/">Original homepage <span aria-hidden="true">↗</span></Link>
      </aside>
      <Home afterWorkspace={<OverviewFilm />} />
    </>
  );
}
