import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "react-router";
import {
  formatAudience,
  type TalentNetwork,
  type TileCaptionSettings,
} from "../data/stagedTalent";
import { useTalentLibrary } from "../hooks/useTalentLibrary";
import {
  TalentLibraryManager,
  placementsForAsset,
} from "../components/TalentLibraryManager";
import { discoverySearches } from "../data/discoveryContent";
import {
  discoveryRank,
  matchesDiscoveryQuery,
  readDiscoveryQuery,
} from "../lib/discoverySearch";
import {
  distributeTalentContent,
  talentContentColumns,
} from "../lib/talentLabLayout";
import { img } from "../lib/assets";
import { PRIVATE_LIBRARY } from "../lib/githubTalentLibrary";
import {
  assetsFor,
  hasAssignedAudience,
  assetKind,
  readCaption,
  writeCaption,
  readSaved,
  readyVideoSources,
  SAVED_KEY,
  NETWORK_NAMES,
  downloadPack,
  exportData,
  type LabAsset,
} from "../lib/talentLab";
import { LabIcon, type LabIconName } from "../components/TalentLabIcon";
import { AIDisclosure, AssetCard } from "../components/TalentLabMedia";
import { TalentLabProfile } from "../components/TalentLabProfile";
import {
  TalentContentTable,
  TalentDirectoryTable,
  TalentLayoutSelect,
  TalentNetworkIcon,
  type TalentLayout,
} from "../components/TalentLabTables";
import { matchesTalentPlatforms, mixFeaturedPlatforms, talentNetworks } from "../lib/talentPlatforms";
import { ChromeWallpaperSettings } from "../components/ChromeWallpaperSettings";
import "./talent-lab.css";
import "./lab-marketing.css";

type View = "talent" | "content" | "saved";
type Filters = {
  talent: string;
  platforms: TalentNetwork[];
  category: string;
  kind: string;
  audience: string;
  views: string;
};
const EMPTY: Filters = {
  talent: "",
  platforms: [],
  category: "",
  kind: "",
  audience: "",
  views: "",
};
const navItems: { view: View; icon: LabIconName; label: string }[] = [
  { view: "talent", icon: "people", label: "Talent directory" },
  { view: "content", icon: "explore", label: "Explore content" },
  { view: "saved", icon: "bookmark", label: "Saved assets" },
];

export function LabTalent() {
  const library = useTalentLibrary();
  const stagedTalent = library.profiles;
  const allAssets = useMemo(
    () => stagedTalent.flatMap(assetsFor),
    [stagedTalent],
  );
  const contentAssets = useMemo(
    () => allAssets.filter((a) => a.tile),
    [allAssets],
  );
  const imageAssetCount = allAssets.filter(
    (asset) => !asset.tile?.video,
  ).length;
  const readyVideoCount = new Set(stagedTalent.flatMap(readyVideoSources)).size;
  const categories = [
    ...new Set(stagedTalent.flatMap((t) => t.verticals)),
  ].sort();
  const [managing, setManaging] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const view: View =
    params.get("view") === "content" || params.get("view") === "saved"
      ? (params.get("view") as View)
      : "talent";
  const selected = stagedTalent.find((t) => t.id === params.get("talent"));
  const query = readDiscoveryQuery(params);
  const setQuery = (next: string) =>
    setParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (next) updated.set("q", next);
        else updated.delete("q");
        return updated;
      },
      { replace: true },
    );
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [filterOpen, setFilterOpen] = useState(false);
  const layout: TalentLayout = params.get("layout") === "table"
    ? "table"
    : params.get("layout") === "compact"
      ? "compact"
      : "gallery";
  const compact = layout === "compact";
  const setLayout = (next: TalentLayout) => setParams((prev) => {
    const updated = new URLSearchParams(prev);
    if (next === "gallery") updated.delete("layout");
    else updated.set("layout", next);
    return updated;
  }, { replace: true });
  const directoryNetworks = useMemo<TalentNetwork[]>(() => [
    "instagram", "tiktok", "youtube",
    ...(["twitch", "linkedin"] as const).filter((network) =>
      stagedTalent.some((talent) => talent.platforms.some((platform) => platform.network === network)),
    ),
  ], [stagedTalent]);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const contentColumnCount = talentContentColumns(viewportWidth, compact);
  const [sort, setSort] = useState("curated");
  const [saved, setSaved] = useState(() =>
    readSaved().filter((id) => allAssets.some((a) => a.id === id)),
  );
  const [captions, setCaptions] = useState<Record<string, TileCaptionSettings>>(
    () => Object.fromEntries(contentAssets.map((a) => [a.id, readCaption(a)!])),
  );
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const filterToggle = useRef<HTMLButtonElement>(null);
  const filterPanel = useRef<HTMLElement>(null);
  const search = query.trim().toLowerCase();
  const activeCount = Object.values(filters).reduce(
    (n, value) => n + (Array.isArray(value) ? value.length : value ? 1 : 0),
    0,
  );
  const title = navItems.find((n) => n.view === view)!.label;

  useEffect(() => {
    document.title = `${title} · Foam Lab`;
  }, [title]);
  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === SAVED_KEY)
        setSaved(
          readSaved().filter((id) => allAssets.some((a) => a.id === id)),
        );
      if (event.key?.startsWith("foam-lab-talent-caption:"))
        setCaptions(
          Object.fromEntries(contentAssets.map((a) => [a.id, readCaption(a)!])),
        );
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  useEffect(() => {
    if (!filterOpen) return;
    filterPanel.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
        filterToggle.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [filterOpen]);

  const changeView = (next: View) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("view", next);
      p.delete("talent");
      p.delete("asset");
      p.delete("q");
      return p;
    });
    setFilters(EMPTY);
    setDraft(EMPTY);
    setSort("curated");
    setFilterOpen(false);
  };
  const openProfile = (id: string, asset?: string) =>
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("talent", id);
      if (asset) p.set("asset", asset);
      else p.delete("asset");
      return p;
    });
  const closeProfile = () =>
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete("talent");
        p.delete("asset");
        return p;
      },
      { replace: true },
    );
  const toggleSaved = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      setToast("Saved for this visit. Browser storage is unavailable.");
    }
  };
  const updateCaption = (asset: LabAsset, caption: TileCaptionSettings) => {
    setCaptions((prev) => ({ ...prev, [asset.id]: caption }));
    if (!writeCaption(asset, caption))
      setToast(
        "The edit is visible, but browser storage is unavailable. Download the image before leaving.",
      );
  };
  const pack = async (assets: LabAsset[], name: string) => {
    if (busy || !assets.length) return;
    setBusy(true);
    setProgress("Preparing download…");
    try {
      await downloadPack(assets, name, (done, total) =>
        setProgress(`Preparing ${done} of ${total} files…`),
      );
      setToast(
        "Your ZIP download is ready. Originals and profile data are included.",
      );
    } catch (error) {
      setToast(
        error instanceof Error
          ? error.message
          : "Download failed. Please try again.",
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  };
  const clearFilters = () => {
    setFilters(EMPTY);
    setDraft(EMPTY);
    setQuery("");
  };
  const matchingTalent = useMemo(
    () =>
      stagedTalent.filter((t) => {
        const text = [
          t.displayName,
          t.location,
          t.bio,
          ...t.verticals,
          ...t.platforms.map((p) => p.handle),
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!filters.talent || t.id === filters.talent) &&
          (!filters.category || t.verticals.includes(filters.category)) &&
          matchesTalentPlatforms(t, filters.platforms) &&
          (!filters.audience ||
            (hasAssignedAudience(t) &&
              (filters.audience === "1m"
                ? t.totalAudience >= 1_000_000
                : filters.audience === "500k"
                  ? t.totalAudience >= 500_000 && t.totalAudience < 1_000_000
                  : t.totalAudience < 500_000))) &&
          (view !== "talent" || !search || text.includes(search))
        );
      }),
    [filters, search, view, stagedTalent],
  );
  const visibleTalent = [...matchingTalent].sort((a, b) =>
    sort === "name"
      ? a.displayName.localeCompare(b.displayName)
      : sort === "audience"
        ? b.totalAudience - a.totalAudience
        : 0,
  );
  const sortedAssets = (
    view === "saved"
      ? allAssets.filter((a) => saved.includes(a.id))
      : contentAssets
  )
    .filter(
      (a) =>
        matchingTalent.some((t) => t.id === a.talent.id) &&
        (!filters.platforms.length ||
          (!!a.tile && filters.platforms.includes(a.tile.platform))) &&
        (!filters.kind || assetKind(a) === filters.kind) &&
        (!filters.views || (a.tile?.views ?? 0) >= Number(filters.views)) &&
        matchesDiscoveryQuery(a, query, captions[a.id]?.text),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.talent.displayName.localeCompare(b.talent.displayName)
        : sort === "views"
          ? (b.tile?.views ?? 0) - (a.tile?.views ?? 0)
          : sort === "audience"
            ? b.talent.totalAudience - a.talent.totalAudience
            : discoveryRank(a, query) - discoveryRank(b, query) ||
              a.index - b.index ||
              stagedTalent.indexOf(a.talent) - stagedTalent.indexOf(b.talent),
    );
  const visibleAssets = view === "content" && sort === "curated" && !query.trim()
    ? mixFeaturedPlatforms(sortedAssets)
    : sortedAssets;
  const visibleProfiles =
    view === "talent"
      ? visibleTalent
      : [
          ...new Map(
            visibleAssets.map((a) => [a.talent.id, a.talent]),
          ).values(),
        ];
  const count = view === "talent" ? visibleTalent.length : visibleAssets.length;

  return (
    <div className="tl-app tl-shell pc-lab">
      <meta name="robots" content="noindex, nofollow" />
      <a className="tl-skip" href="#talent-results">
        Skip to results
      </a>
      <nav className="tl-nav" aria-label="Lab navigation">
        <a
          className="tl-brand"
          href={
            PRIVATE_LIBRARY
              ? "https://steveblackboxapi.github.io/NEWFOAMHOME/kit-story/"
              : `${import.meta.env.BASE_URL}kit-story/`
          }
          title="Foam — Media Kit story"
          aria-label="Foam — Media Kit story"
        >
          <img src={img.foamSymbol} alt="" />
        </a>
        <div className="tl-nav-items">
          {navItems.map((item) => (
            <button
              key={item.view}
              className={`tl-nav-item ${view === item.view ? "active" : ""}`}
              onClick={() => changeView(item.view)}
              aria-label={item.label}
              aria-current={view === item.view ? "page" : undefined}
              title={item.label}
            >
              <LabIcon name={item.icon} size={23} />
              {item.view === "saved" && saved.length > 0 && (
                <span className="tl-nav-count">{saved.length}</span>
              )}
              <span className="tl-nav-tooltip">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="tl-nav-bottom">
          <a
            href={
              PRIVATE_LIBRARY
                ? "https://steveblackboxapi.github.io/NEWFOAMHOME/"
                : import.meta.env.BASE_URL
            }
            className="tl-nav-item"
            title="Back to website"
            aria-label="Back to website"
          >
            <LabIcon name="external" />
          </a>
          <span className="tl-avatar" title="Demo workspace">
            FL
          </span>
        </div>
      </nav>
      <div className="tl-main">
        <header className="tl-header">
          <div className="tl-title">
            <span className="tl-eyebrow">FOAM LAB</span>
            <h1>{title}</h1>
          </div>
          <label className="tl-search">
            <LabIcon name="search" size={20} />
            <span className="tl-sr-only">Search talent and content</span>
            <input
              type="search"
              aria-label="Search talent and content"
              placeholder={
                view === "talent"
                  ? "Search by name, handle or interest"
                  : "Search creators, content or captions"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <LabIcon name="close" size={16} />
              </button>
            )}
          </label>
          <span className="tl-workspace-label">
            <span /> Demo workspace
          </span>
          <ChromeWallpaperSettings />
        </header>
        <div className="tl-online-status">
          <span>
            {library.loading
              ? "Loading the online library…"
              : library.error
                ? "Online library unavailable — open Manage library to reconnect."
                : library.dirty
                  ? "Unsaved library changes"
                  : "GitHub library · changes saved for review"}
          </span>
          {PRIVATE_LIBRARY && (
            <button
              className="tl-button"
              onClick={() => {
                if (
                  !library.dirty ||
                  window.confirm(
                    "Discard your unsaved draft and lock the library?",
                  )
                ) {
                  library.reset();
                  void library.disconnect();
                }
              }}
            >
              Lock library
            </button>
          )}
          <button
            className="tl-button tl-primary"
            onClick={() => setManaging("")}
          >
            Add talent / manage images
          </button>
        </div>
        <div className="tl-intro">
          <p>
            {view === "talent"
              ? "Every character. Every asset. One place."
              : view === "content"
                ? "Browse, save and download content across your talent."
                : "Your picks, ready for the next story."}
          </p>
          <span>
            {stagedTalent.length} creators <i /> {imageAssetCount} images
            {readyVideoCount > 0 && (
              <>
                <i /> {readyVideoCount}{" "}
                {readyVideoCount === 1 ? "video" : "videos"}
              </>
            )}
          </span>
        </div>
        {view === "content" && (
          <nav
            className="tl-discovery-queries"
            aria-label="Suggested content searches"
          >
            <span>Try a search</span>
            {discoverySearches.map((example) => (
              <button
                key={example.id}
                type="button"
                aria-pressed={query === example.query}
                onClick={() => {
                  setQuery(example.query);
                  setSort("curated");
                }}
              >
                {example.query}
              </button>
            ))}
          </nav>
        )}
        <section
          className={`tl-workbench ${filterOpen ? "tl-filters-open" : ""}`}
          aria-label="Talent workspace"
        >
          <aside
            className="tl-filters"
            ref={filterPanel}
            tabIndex={-1}
            aria-label="Filters"
          >
            <div className="tl-filter-heading">
              <LabIcon name="filter" size={18} />
              <h2>Filters</h2>
              {activeCount > 0 && (
                <span className="tl-count">{activeCount}</span>
              )}
              <button
                className="tl-icon-button tl-mobile-only"
                aria-label="Close filters"
                onClick={() => {
                  setFilterOpen(false);
                  filterToggle.current?.focus();
                }}
              >
                <LabIcon name="close" size={18} />
              </button>
            </div>
            <div className="tl-filter-body">
              <details open>
                <summary>
                  Talent <LabIcon name="chevron" size={14} />
                </summary>
                <label className="tl-sr-only" htmlFor="tl-talent-filter">
                  Choose talent
                </label>
                <select
                  id="tl-talent-filter"
                  value={draft.talent}
                  onChange={(e) =>
                    setDraft({ ...draft, talent: e.target.value })
                  }
                >
                  <option value="">All talent</option>
                  {stagedTalent.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.displayName}
                    </option>
                  ))}
                </select>
              </details>
              <details open>
                <summary>
                  Category <LabIcon name="chevron" size={14} />
                </summary>
                <label className="tl-sr-only" htmlFor="tl-category-filter">
                  Choose category
                </label>
                <select
                  id="tl-category-filter"
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                >
                  <option value="">All interests</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </details>
              <details open>
                <summary>
                  Platform <LabIcon name="chevron" size={14} />
                </summary>
                <div className="tl-checkbox-list">
                  <label>
                    <input
                      type="checkbox"
                      checked={!draft.platforms.length}
                      onChange={() => setDraft({ ...draft, platforms: [] })}
                    />
                    Any platform
                  </label>
                  {(Object.keys(NETWORK_NAMES) as TalentNetwork[])
                    .filter(
                      (p) =>
                        view === "talent" ||
                        ["instagram", "tiktok", "youtube"].includes(p),
                    )
                    .map((p) => (
                      <label key={p}>
                        <input
                          type="checkbox"
                          aria-label={NETWORK_NAMES[p]}
                          checked={draft.platforms.includes(p)}
                          onChange={() =>
                            setDraft({
                              ...draft,
                              platforms: draft.platforms.includes(p)
                                ? draft.platforms.filter((x) => x !== p)
                                : [...draft.platforms, p],
                            })
                          }
                        />
                        <TalentNetworkIcon network={p} />
                        {NETWORK_NAMES[p]}
                      </label>
                    ))}
                </div>
              </details>
              {view !== "talent" && (
                <details open>
                  <summary>
                    Asset type <LabIcon name="chevron" size={14} />
                  </summary>
                  <label className="tl-sr-only" htmlFor="tl-kind-filter">
                    Choose asset type
                  </label>
                  <select
                    id="tl-kind-filter"
                    value={draft.kind}
                    onChange={(e) =>
                      setDraft({ ...draft, kind: e.target.value })
                    }
                  >
                    <option value="">All assets</option>
                    <option value="still">Images</option>
                    <option value="video">Ready videos</option>
                    <option value="planned">Video planned</option>
                  </select>
                </details>
              )}
              <details open>
                <summary>
                  {view === "talent" ? "Audience" : "Performance"}{" "}
                  <LabIcon name="chevron" size={14} />
                </summary>
                <label className="tl-filter-label">
                  Total audience
                  <select
                    value={draft.audience}
                    onChange={(e) =>
                      setDraft({ ...draft, audience: e.target.value })
                    }
                  >
                    <option value="">Any size</option>
                    <option value="under500k">Under 500K</option>
                    <option value="500k">500K–1M</option>
                    <option value="1m">1M and above</option>
                  </select>
                </label>
                {view !== "talent" && (
                  <label className="tl-filter-label">
                    Post views
                    <select
                      value={draft.views}
                      onChange={(e) =>
                        setDraft({ ...draft, views: e.target.value })
                      }
                    >
                      <option value="">Any views</option>
                      <option value="100000">100K and above</option>
                      <option value="500000">500K and above</option>
                      <option value="1000000">1M and above</option>
                    </select>
                  </label>
                )}
              </details>
            </div>
            <div className="tl-filter-footer">
              <button className="tl-text-button" onClick={clearFilters}>
                Reset all
              </button>
              <button
                className="tl-button tl-primary"
                onClick={() => {
                  setFilters({ ...draft });
                  setFilterOpen(false);
                  if (filterOpen) filterToggle.current?.focus();
                }}
              >
                Apply filters
              </button>
            </div>
          </aside>
          <div className="tl-results" id="talent-results" tabIndex={-1}>
            <div className="tl-results-toolbar">
              <div className="tl-tabs" aria-label="Library view">
                <button
                  className={view === "talent" ? "active" : ""}
                  aria-pressed={view === "talent"}
                  onClick={() => changeView("talent")}
                >
                  Talent <span>{stagedTalent.length}</span>
                </button>
                <button
                  className={view === "content" ? "active" : ""}
                  aria-pressed={view === "content"}
                  onClick={() => changeView("content")}
                >
                  Content <span>{contentAssets.length}</span>
                </button>
                {view === "saved" && (
                  <button className="active" aria-pressed="true">
                    Saved <span>{saved.length}</span>
                  </button>
                )}
              </div>
              <div className="tl-toolbar-actions">
                <button
                  className="tl-icon-button tl-mobile-only"
                  ref={filterToggle}
                  aria-label="Show filters"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <LabIcon name="filter" />
                </button>
                <label className="tl-sort">
                  <span className="tl-sr-only">Sort results</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="curated">Curated order</option>
                    <option value="name">Name A–Z</option>
                    <option value="audience">Largest audience</option>
                    {view !== "talent" && (
                      <option value="views">Most viewed</option>
                    )}
                  </select>
                </label>
                <TalentLayoutSelect talentView={view === "talent"} value={layout} onChange={setLayout} />
              </div>
            </div>
            <div className="tl-results-meta">
              <span role="status">
                {count}{" "}
                {view === "talent"
                  ? count === 1
                    ? "creator"
                    : "creators"
                  : count === 1
                    ? "asset"
                    : "assets"}
                {search
                  ? ` matching “${query.trim()}”`
                  : activeCount
                    ? count === 1
                      ? " matches your filters"
                      : " match your filters"
                    : view === "saved"
                      ? " saved on this browser"
                      : " in your library"}
              </span>
              <div className="tl-actions">
                {(activeCount > 0 || search) && (
                  <button className="tl-text-button" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
                {view === "saved" ? (
                  <button
                    className="tl-text-button"
                    disabled={busy || !count}
                    onClick={() => pack(visibleAssets, "foam-saved-assets.zip")}
                  >
                    <LabIcon name="download" size={15} />
                    {busy ? "Preparing…" : "Download saved"}
                  </button>
                ) : (
                  <button
                    className="tl-text-button"
                    disabled={!count}
                    onClick={() => {
                      exportData(visibleProfiles);
                      setToast(
                        "Character data exported, including local caption drafts.",
                      );
                    }}
                  >
                    <LabIcon name="download" size={15} />
                    Export data
                  </button>
                )}
              </div>
            </div>
            {!!activeCount && (
              <div className="tl-applied-filters">
                {filters.talent && (
                  <span>
                    {
                      stagedTalent.find((t) => t.id === filters.talent)
                        ?.displayName
                    }
                  </span>
                )}
                {filters.category && <span>{filters.category}</span>}
                {filters.platforms.map((p) => (
                  <span key={p}>{NETWORK_NAMES[p]}</span>
                ))}
                {filters.kind && (
                  <span>
                    {filters.kind === "planned"
                      ? "Video planned"
                      : filters.kind === "video"
                        ? "Ready videos"
                        : "Images"}
                  </span>
                )}
                {filters.audience && (
                  <span>
                    {filters.audience === "1m"
                      ? "1M+ audience"
                      : filters.audience === "500k"
                        ? "500K–1M audience"
                        : "Under 500K audience"}
                  </span>
                )}
                {filters.views && (
                  <span>{formatAudience(Number(filters.views))}+ views</span>
                )}
              </div>
            )}
            {!count ? (
              <div className="tl-empty">
                <div>
                  <LabIcon
                    name={
                      view === "saved" && !saved.length ? "bookmark" : "search"
                    }
                    size={30}
                  />
                </div>
                <h2>
                  {view === "saved" && !saved.length
                    ? "A place for your next story"
                    : filters.kind === "video"
                      ? "No ready videos yet"
                      : "No matches this time"}
                </h2>
                <p>
                  {view === "saved" && !saved.length
                    ? "Save images and videos from the talent library or content feed. They’ll be here when you need them."
                    : filters.kind === "video"
                      ? "Planned videos currently have a still image. Switch to Video planned to explore those assets."
                      : "Try another name, interest or combination of filters."}
                </p>
                <button
                  className="tl-button tl-primary"
                  onClick={
                    view === "saved" && !saved.length
                      ? () => changeView("content")
                      : clearFilters
                  }
                >
                  {view === "saved" && !saved.length
                    ? "Explore content"
                    : "Clear filters"}
                </button>
              </div>
            ) : layout === "table" ? (
              view === "talent" ? (
                <TalentDirectoryTable talent={visibleTalent} networks={directoryNetworks} saved={saved} onOpen={openProfile} onSave={toggleSaved} />
              ) : (
                <TalentContentTable assets={visibleAssets} saved={saved} onOpen={openProfile} onSave={toggleSaved} />
              )
            ) : view === "talent" ? (
              <div className={`tl-talent-grid ${compact ? "compact" : ""}`}>
                {visibleTalent.map((talent) => (
                  <article className="tl-talent-card" key={talent.id}>
                    <button
                      className="tl-talent-open"
                      onClick={() => openProfile(talent.id)}
                      aria-label={`Open ${talent.displayName} profile`}
                    >
                      <div className="tl-talent-portrait">
                        <img
                          src={talent.portrait}
                          alt={talent.displayName}
                          loading="lazy"
                        />
                        <span className="tl-card-shade" />
                        <span className="tl-asset-count">
                          <LabIcon name="image" size={13} />
                          {assetsFor(talent).length} assets
                        </span>
                        <div className="tl-talent-identity">
                          <span>{talent.verticals[0]}</span>
                          <h2>{talent.displayName}</h2>
                          <p>{talent.location}</p>
                        </div>
                      </div>
                      <AIDisclosure
                        className="tl-talent-disclosure"
                        provenance={talent.provenance}
                      />
                      <div className="tl-talent-info">
                        <div>
                          <strong>
                            {hasAssignedAudience(talent)
                              ? formatAudience(talent.totalAudience)
                              : "—"}
                          </strong>
                          <span>
                            {hasAssignedAudience(talent)
                              ? "Total audience"
                              : "Audience not assigned"}
                          </span>
                        </div>
                        <div className="tl-platform-pills">
                          {talentNetworks(talent).map((network) => (
                            <span
                              className="tl-network-pill"
                              key={network}
                              title={NETWORK_NAMES[network]}
                            >
                              <TalentNetworkIcon network={network} />
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="tl-talent-tags">
                        {talent.verticals.slice(0, 3).map((v) => (
                          <span key={v}>{v}</span>
                        ))}
                        <LabIcon name="arrow" size={17} />
                      </div>
                    </button>
                    <div className="tl-card-usage">
                      {assetsFor(talent).some(
                        (a) => placementsForAsset(a).length,
                      )
                        ? "Used on the website"
                        : "Library only"}
                    </div>
                    <button
                      className={`tl-card-save ${saved.includes(`${talent.id}:portrait`) ? "is-saved" : ""}`}
                      onClick={() => toggleSaved(`${talent.id}:portrait`)}
                      aria-label={`${saved.includes(`${talent.id}:portrait`) ? "Unsave" : "Save"} ${talent.displayName} portrait`}
                      aria-pressed={saved.includes(`${talent.id}:portrait`)}
                    >
                      <LabIcon name="bookmark" size={17} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div
                className={`tl-content-grid ${compact ? "compact" : ""}`}
                style={
                  {
                    "--tl-content-columns": contentColumnCount,
                  } as CSSProperties
                }
              >
                {distributeTalentContent(visibleAssets, contentColumnCount).map(
                  (column, columnIndex) => (
                    <div className="tl-content-column" key={columnIndex}>
                      {column.map(({ item: asset, position }) => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          caption={captions[asset.id]}
                          saved={saved.includes(asset.id)}
                          onSave={() => toggleSaved(asset.id)}
                          onOpen={() => openProfile(asset.talent.id, asset.id)}
                          position={position}
                        />
                      ))}
                    </div>
                  ),
                )}
              </div>
            )}
            <footer className="tl-library-footer">
              <span>
                <span className="tl-signal" />
                Made for the stories you’re building.
              </span>
              <span>Fictional talent & demo metrics</span>
            </footer>
          </div>
        </section>
        <footer className="tl-page-footer">
          <span>
            Foam Lab <i /> Talent & content library
          </span>
          <span>
            GitHub library · Bookmarks and captions saved in this browser
          </span>
        </footer>
      </div>
      {selected && (
        <TalentLabProfile
          key={selected.id}
          talent={selected}
          initialAsset={params.get("asset")}
          captions={captions}
          onCaption={updateCaption}
          saved={saved}
          onSave={toggleSaved}
          onClose={closeProfile}
          onPack={pack}
          busy={busy}
          notify={setToast}
          notice={progress || toast}
          onManage={() => {
            closeProfile();
            setManaging(selected.id);
          }}
        />
      )}
      {managing !== null && (
        <TalentLibraryManager
          library={library}
          initialId={managing}
          onClose={() => setManaging(null)}
        />
      )}
      {(toast || progress) && (
        <div className="tl-toast" role="status">
          <LabIcon name={busy ? "download" : "check"} size={17} />
          <span>{progress || toast}</span>
          {!busy && (
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <LabIcon name="close" size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
