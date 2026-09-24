import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link } from "react-router";
import { A } from "../lib/assets";
import { ThemeControl } from "../components/SiteTheme";
import { MiniFoamMark, MiniIcon } from "../components/mini-ui/MiniPrimitives";
import {
  MiniSearch,
  MiniShortlist,
  MiniRoster,
  MiniSavedContent,
} from "../components/mini-ui/MiniDiscoveryScenes";
import {
  MiniInbox,
  MiniShare,
  MiniNotes,
  MiniPermissions,
} from "../components/mini-ui/MiniWorkflowScenes";
import {
  MiniKit,
  MiniAnalytics,
  MiniWatchlist,
  MiniConnections,
} from "../components/mini-ui/MiniDetailScenes";
import "./mini-ui.css";

type Category = "Discover" | "Present" | "Manage";
type Concept = {
  id: string;
  title: string;
  description: string;
  category: Category;
  tint: string;
  scene: ComponentType;
};
const concepts: Concept[] = [
  {
    id: "01",
    title: "Find your next good thing.",
    description: "A search, a few faces, a perfect place to start.",
    category: "Discover",
    tint: "blue",
    scene: MiniSearch,
  },
  {
    id: "02",
    title: "The whole story. One link.",
    description: "A media kit, with all the good bits left in.",
    category: "Present",
    tint: "lilac",
    scene: MiniKit,
  },
  {
    id: "03",
    title: "A little shortlist magic.",
    description: "Turn a few possibilities into a considered edit.",
    category: "Discover",
    tint: "sage",
    scene: MiniShortlist,
  },
  {
    id: "04",
    title: "Right inside your inbox.",
    description: "A creator’s introduction, ready for the reply.",
    category: "Present",
    tint: "cream",
    scene: MiniInbox,
  },
  {
    id: "05",
    title: "Small card. Bigger picture.",
    description: "Make the numbers feel useful, not overwhelming.",
    category: "Present",
    tint: "blue",
    scene: MiniAnalytics,
  },
  {
    id: "06",
    title: "Made to be passed along.",
    description: "The satisfying moment a pitch becomes a link.",
    category: "Present",
    tint: "pink",
    scene: MiniShare,
  },
  {
    id: "07",
    title: "Your people, together.",
    description: "A tiny home for a roster full of personality.",
    category: "Manage",
    tint: "cream",
    scene: MiniRoster,
  },
  {
    id: "08",
    title: "Keep an eye on possibility.",
    description: "A watchlist for the people you keep coming back to.",
    category: "Discover",
    tint: "sage",
    scene: MiniWatchlist,
  },
  {
    id: "09",
    title: "Remember the little things.",
    description: "The personal details that make a better pitch.",
    category: "Manage",
    tint: "butter",
    scene: MiniNotes,
  },
  {
    id: "10",
    title: "Save a good moment.",
    description: "Content you love, collected in one happy place.",
    category: "Discover",
    tint: "lilac",
    scene: MiniSavedContent,
  },
  {
    id: "11",
    title: "Better, connected.",
    description: "Content, people and performance in the same picture.",
    category: "Manage",
    tint: "blue",
    scene: MiniConnections,
  },
  {
    id: "12",
    title: "A little peace of mind.",
    description: "A simple way to picture access and permissions.",
    category: "Manage",
    tint: "sage",
    scene: MiniPermissions,
  },
];
const savedKey = "foam-mini-ui-favourites";
function readFavourites(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(savedKey) || "[]");
    return Array.isArray(stored)
      ? stored.filter(
          (id): id is string =>
            typeof id === "string" && concepts.some((c) => c.id === id),
        )
      : [];
  } catch {
    return [];
  }
}

function Miniature({ concept }: { concept: Concept }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () =>
      el.style.setProperty("--mini-scale", String(el.clientWidth / 560));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const Scene = concept.scene;
  return (
    <div
      ref={ref}
      className={`mui-art mui-tint-${concept.tint}`}
      role="img"
      aria-label={`${concept.title} ${concept.description} Simplified Foam interface illustration.`}
    >
      <div className="mui-stage" aria-hidden="true">
        <Scene />
      </div>
    </div>
  );
}

export function MiniUI() {
  const [filter, setFilter] = useState("All");
  const [favourites, setFavourites] = useState<string[]>(readFavourites);
  const favouritesFilter = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.title = "The Foam miniatures | Foam";
  }, []);
  function toggleFavourite(id: string) {
    if (filter === "Favourites" && favourites.includes(id)) {
      favouritesFilter.current?.focus();
    }
    const next = favourites.includes(id)
      ? favourites.filter((value) => value !== id)
      : [...favourites, id].sort();
    setFavourites(next);
    try {
      localStorage.setItem(savedKey, JSON.stringify(next));
    } catch {
      /* Selection still works for this visit. */
    }
  }
  const shown = concepts.filter(
    (c) =>
      filter === "All" ||
      c.category === filter ||
      (filter === "Favourites" && favourites.includes(c.id)),
  );
  return (
    <div className="mui-gallery">
      <header className="mui-header">
        <Link to="/" className="mui-brand" aria-label="Foam home">
          <MiniFoamMark size={30} />
          <img src={`${A}/brand/foam-wordmark.svg`} alt="Foam" />
        </Link>
        <span className="mui-header-label">THE MINIATURES</span>
        <div className="mui-header-actions">
          <ThemeControl />
          <Link to="/">
            Back to Foam <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>
      <main className="mui-main">
        <section className="mui-intro" aria-labelledby="mini-title">
          <div>
            <p className="mui-eyebrow">
              <span /> A LITTLE FOAM GOES A LONG WAY
            </p>
            <h1 id="mini-title">
              Small UI.
              <br />
              <em>Big possibility.</em>
            </h1>
          </div>
          <div className="mui-intro-note">
            <span className="mui-edition">01 — 12 / PRODUCT ILLUSTRATIONS</span>
            <p>
              Familiar Foam moments. <br />A little simpler. A little softer.{" "}
              <br />A lot more personality.
            </p>
            <span className="mui-pick-note">
              Pick your favourites. Tell us their numbers.
            </span>
          </div>
        </section>
        <div className="mui-toolbar">
          <div
            className="mui-filters"
            role="group"
            aria-label="Filter miniatures"
          >
            {["All", "Discover", "Present", "Manage", "Favourites"].map(
              (label) => (
                <button
                  key={label}
                  ref={label === "Favourites" ? favouritesFilter : undefined}
                  type="button"
                  aria-pressed={filter === label}
                  onClick={() => setFilter(label)}
                >
                  {label === "Favourites" && (
                    <MiniIcon name="heart" size={14} />
                  )}
                  {label}
                  {label === "All" && <span>12</span>}
                  {label === "Favourites" && <span>{favourites.length}</span>}
                </button>
              ),
            )}
          </div>
          <span className="mui-gallery-count" role="status">
            {shown.length} little {shown.length === 1 ? "idea" : "ideas"}
          </span>
        </div>
        <div className="mui-grid">
          {shown.map((concept) => (
            <article
              className="mui-concept"
              key={concept.id}
              id={`mini-${concept.id}`}
            >
              <Miniature concept={concept} />
              <div className="mui-caption">
                <a
                  className="mui-number"
                  href={`#mini-${concept.id}`}
                  aria-label={`Link to concept ${concept.id}`}
                >
                  {concept.id}
                </a>
                <div className="mui-caption-copy">
                  <p className="mui-category">{concept.category}</p>
                  <h2>{concept.title}</h2>
                  <p>{concept.description}</p>
                </div>
                <button
                  className={`mui-save ${favourites.includes(concept.id) ? "is-saved" : ""}`}
                  type="button"
                  aria-label={`${favourites.includes(concept.id) ? "Remove" : "Save"} concept ${concept.id}${favourites.includes(concept.id) ? " from" : " to"} favourites`}
                  aria-pressed={favourites.includes(concept.id)}
                  onClick={() => toggleFavourite(concept.id)}
                  title="Keep this one"
                >
                  <MiniIcon name="heart" size={19} />
                </button>
              </div>
            </article>
          ))}
        </div>
        {shown.length === 0 && (
          <div className="mui-empty">
            <MiniIcon name="heart" size={30} />
            <h2>A little collection of your own.</h2>
            <p>Tap a heart on any miniature to keep it here.</p>
            <button type="button" onClick={() => setFilter("All")}>
              See all 12
            </button>
          </div>
        )}
        <footer className="mui-footer">
          <div>
            <MiniFoamMark size={28} />
            <p>
              {favourites.length
                ? `Your favourites: ${favourites.join(" · ")}`
                : "Little interfaces. Lots of possibility."}
            </p>
          </div>
          <span>
            Design studies · Fictional creators made with AI · Illustrative
            figures
          </span>
        </footer>
      </main>
    </div>
  );
}
