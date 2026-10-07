import { useWebsiteImageResolver } from "./WebsiteImageScope";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { discoverySearches, type DiscoveryAsset } from "../data/discoveryContent";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { imageSources } from "../lib/imageAssets";
import { warmImageQueue } from "../lib/imageWarmup";
import { OptimizedImage } from "./OptimizedImage";
import "./discovery-search.css";

const DISCOVERY_IMAGE_SIZES = "(max-width: 700px) 28vw, (max-width: 1100px) 22vw, 200px";
// Product card: 82% of each card (capped at 310px), less padding and three-column gaps.
const ARTWORK_IMAGE_SIZES = "(max-width: 414px) calc((82vw - 69.52px) / 3), (max-width: 760px) 90px, (max-width: 1080px) calc((82vw - 193.8px) / 9), (max-width: 1278px) calc((82vw - 238.08px) / 9), 90px";

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
  assets = discoverySearches[0].assets,
  sizes = ARTWORK_IMAGE_SIZES,
  loading = "lazy",
}: {
  resultLabel?: string;
  section?: string;
  assets?: readonly DiscoveryAsset[];
  sizes?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <div className="pc-discovery-art" aria-hidden="true">
      <div className="pc-discovery-art-search">
        <SearchIcon />
        <span>Find your next good thing</span>
      </div>
      <div className="pc-discovery-art-results">
        {assets.slice(0, 3).map((asset) => (
          <OptimizedImage section={section}
            key={asset.id}
            src={asset.src}
            sizes={sizes}
            alt=""
            loading={loading}
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
  const [preparedNext, setPreparedNext] = useState<number | null>(null);
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
    // Decode the next result set before the automatic transition can expose it.
    setPreparedNext(null);
    if (!visible) return;
    const controller = new AbortController();
    const nextIndex = (active + 1) % discoverySearches.length;
    const next = discoverySearches[nextIndex];
    const images = next.assets.slice(0, 3).map(({ src: original }) => {
      const src = resolve(original, `Content discovery · ${next.query}`);
      return { src, sizes: DISCOVERY_IMAGE_SIZES, srcSet: imageSources(src) };
    });
    const finish = () => {
      if (!controller.signal.aborted) setPreparedNext(nextIndex);
    };
    // The queue settles failed/time-limited requests too, so a missing photo
    // cannot stop the sequence indefinitely. Manual controls remain immediate.
    void warmImageQueue(images, controller.signal).then(finish, finish);
    return () => controller.abort();
  }, [active, visible]);

  useEffect(() => {
    setQuery(discoverySearches[active].query);
    setTyping(false);
    const nextIndex = (active + 1) % discoverySearches.length;
    if (!running || preparedNext !== nextIndex) return;
    let typingTimer: number | undefined;
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
  }, [active, running, preparedNext]);

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
