import { useWebsiteImageResolver } from "./WebsiteImageScope";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { discoverySearches } from "../data/discoveryContent";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { imageSources } from "../lib/imageAssets";
import { OptimizedImage } from "./OptimizedImage";
import "./discovery-search.css";

const DISCOVERY_IMAGE_SIZES = "(max-width: 700px) 28vw, (max-width: 1100px) 22vw, 200px";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

/** A small product scene, replacing the exploratory magnifying-glass artwork. */
export function DiscoveryArtwork({
  resultLabel = "Found with Foam",
  section,
}: {
  resultLabel?: string;
  section?: string;
}) {
  const search = discoverySearches[0];
  return (
    <div className="pc-discovery-art" aria-hidden="true">
      <div className="pc-discovery-art-search">
        <SearchIcon />
        <span>Find your next good thing</span>
      </div>
      <div className="pc-discovery-art-results">
        {search.assets.slice(0, 3).map((asset) => (
          <OptimizedImage section={section}
            key={asset.id}
            src={asset.src}
            sizes={DISCOVERY_IMAGE_SIZES}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
      <span className="pc-discovery-art-found">
        {resultLabel} <span>↗</span>
      </span>
    </div>
  );
}

/** Search text and its results advance as one sequence. Controls work without motion. */
export function DiscoverySearch() {
  const resolve = useWebsiteImageResolver();
  const card = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState(discoverySearches[0].query);
  const [typing, setTyping] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const running = visible && pageVisible && !paused && reducedMotion === false;
  const current = discoverySearches[active];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (card.current) observer.observe(card.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    // Preload the next result set only when this section enters the viewport.
    if (!visible) return;
    const next = discoverySearches[(active + 1) % discoverySearches.length];
    next.assets.forEach(({ src: original }) => {
      const src = resolve(original, `Content discovery · ${next.query}`);
      const image = new Image();
      image.sizes = DISCOVERY_IMAGE_SIZES;
      const sources = imageSources(src);
      if (sources) image.srcset = sources;
      image.src = src;
    });
  }, [active, visible]);

  useEffect(() => {
    setQuery(discoverySearches[active].query);
    setTyping(false);
    if (!running) return;
    let typingTimer: number | undefined;
    const nextIndex = (active + 1) % discoverySearches.length;
    const nextQuery = discoverySearches[nextIndex].query;
    const holdTimer = window.setTimeout(() => {
      setTyping(true);
      setQuery("");
      let characters = 0;
      typingTimer = window.setInterval(() => {
        characters += 1;
        setQuery(nextQuery.slice(0, characters));
        if (characters === nextQuery.length) {
          window.clearInterval(typingTimer);
          setActive(nextIndex);
        }
      }, 36);
    }, 3200);
    return () => {
      window.clearTimeout(holdTimer);
      window.clearInterval(typingTimer);
    };
  }, [active, running]);

  return (
    <article
      className="pc-search-card pc-discovery-loop"
      id="content-discovery"
      ref={card}
      aria-label="Explore content with Foam"
    >
      <span className="pc-eyebrow">THE DISCOVERY</span>
      <h3>
        Find your
        <br />
        “that’s the one”.
      </h3>
      <div className="pc-mini-search" role="group" aria-label={`Search: ${current.query}`}>
        <SearchIcon />
        <span aria-hidden="true">
          {query}
          <i className={typing ? "is-typing" : ""} />
        </span>
      </div>
      <div
        className={`pc-search-pictures pc-discovery-results ${typing ? "is-searching" : ""}`}
        role="group"
        aria-label={`Results for ${current.query}`}
      >
        {current.assets.slice(0, 3).map((asset) => (
          <figure key={asset.id}>
            <OptimizedImage section={`Content discovery · ${current.query}`}
              src={asset.src}
              sizes={DISCOVERY_IMAGE_SIZES}
              alt={asset.alt}
              loading="lazy"
              decoding="async"
            />
            {asset.caption && <figcaption>{asset.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="pc-discovery-controls">
        <div role="group" aria-label="Example searches">
          {discoverySearches.map((search, index) => (
            <button
              key={search.id}
              type="button"
              aria-label={`Show ${search.query.toLowerCase()}`}
              aria-pressed={active === index}
              onClick={() => {
                setActive(index);
                setPaused(true);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        {reducedMotion === false && (
          <button
            type="button"
            className="pc-discovery-pause"
            aria-label={
              paused ? "Play search animation" : "Pause search animation"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "Play" : "Pause"}
          </button>
        )}
      </div>
      <Link to="/kit-story/#found-with-foam">
        Found with Foam <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
