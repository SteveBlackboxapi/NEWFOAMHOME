import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Link } from "react-router";
import { AIDisclosure } from "../components/AIDisclosure";
import {
  ContentMetrics,
  ContentPlatformIcon,
} from "../components/ContentMetrics";
import { LabIcon, type LabIconName } from "../components/TalentLabIcon";
import {
  FOUND_RESULTS,
  FOUND_SELECTED,
  FOUND_SEEN,
  type FoundResult,
} from "../data/foundWithFoam";
import { formatWebsiteMetric } from "../data/websiteTalent";
import {
  foundSearchExample,
  foundStoryTimeline,
  FOUND_SEARCH_QUERY,
} from "../lib/foundStoryMotion";
import "./found-story.css";

const A = `${import.meta.env.BASE_URL}assets`;
const motionQuery = "(prefers-reduced-motion: reduce)";
const clamp = (value: number) => Math.max(0, Math.min(1, value));
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** Keep the small typing update isolated from the results and camera. */
function SearchExampleText({
  query,
  paused,
  showCaret,
}: {
  query: string;
  paused: boolean;
  showCaret: boolean;
}) {
  const target = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const [example, setExample] = useState("");

  useEffect(() => {
    if (query) {
      elapsed.current = 0;
      setExample("");
      return;
    }
    if (paused || !target.current) return;
    let visible = false;
    let timer: number | undefined;
    let lastTick = 0;
    const tick = () => {
      const now = performance.now();
      elapsed.current += now - lastTick;
      lastTick = now;
      setExample(foundSearchExample(elapsed.current));
    };
    const sync = () => {
      if (visible && !document.hidden) {
        if (timer === undefined) {
          lastTick = performance.now();
          timer = window.setInterval(tick, 60);
        }
      } else {
        window.clearInterval(timer);
        timer = undefined;
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        sync();
      },
      { threshold: 0.6 },
    );
    observer.observe(target.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [query, paused]);

  // The scroll-selected query always wins, even if a timer callback is queued.
  const text = query || example;
  return (
    <>
      <span ref={target} className={text ? "fs-query" : "fs-placeholder"}>
        {text || "Describe the content you’re looking for"}
        <i
          className="fs-caret"
          style={{ opacity: text && showCaret ? 1 : 0 }}
        />
      </span>
      <span className="fs-enter" style={{ opacity: text ? 1 : 0 }}>
        ↵
      </span>
    </>
  );
}

function ResultCard({
  result,
  index,
  progress,
  highlight,
}: {
  result: FoundResult;
  index: number;
  progress: number;
  highlight: number;
}) {
  const { talent, tile } = result;
  const entered = clamp((progress - index * 0.1) / 0.7);
  const hasMetrics = (tile.views ?? 0) > 0 || (tile.engagements ?? 0) > 0;
  return (
    <figure
      className={`fs-result fs-result-${index}`}
      style={{
        opacity: entered,
        transform: `translateY(${(1 - entered) * 42}px)`,
      }}
    >
      <div
        className="fs-result-media"
        style={{
          outlineColor:
            index === 0 ? `rgba(198,243,30,${highlight})` : "transparent",
        }}
      >
        <img src={tile.thumb} alt="" loading="lazy" />
        <span className="content-card-fade" />
        <span className="fs-save">
          <LabIcon name="bookmark" size={15} />
        </span>
        <div className="fs-result-meta">
          {hasMetrics ? (
            <ContentMetrics tile={tile} className="fs-result-metrics" />
          ) : (
            <span className="fs-unpublished">Demo asset</span>
          )}
          <div className="fs-result-person">
            <img src={talent.portrait} alt="" loading="lazy" />
            <span>{talent.displayName}</span>
            <ContentPlatformIcon network={tile.platform} />
          </div>
        </div>
      </div>
      <figcaption>
        <AIDisclosure />
      </figcaption>
    </figure>
  );
}

function SearchFilters() {
  return (
    <aside className="fs-filters">
      <div>
        <strong>
          Talent <span>⌃</span>
        </strong>
        <span className="fs-filter-input">
          <LabIcon name="search" size={14} /> Name or handle
        </span>
      </div>
      <div>
        <strong>
          Roster <span>⌄</span>
        </strong>
      </div>
      <div>
        <strong>
          Platform <span>⌃</span>
        </strong>
        {["Any", "Instagram", "TikTok", "YouTube"].map((name, i) => (
          <span className="fs-check-row" key={name}>
            <i className={i === 0 ? "is-checked" : ""}>{i === 0 ? "✓" : ""}</i>
            {name}
          </span>
        ))}
      </div>
      <div className="fs-performance">
        <strong>Performance metrics</strong>
        {["Views", "Likes", "Comments", "Engagements"].map((name) => (
          <span className="fs-filter-value" key={name}>
            {name}
            <i>
              Any <span>⌄</span>
            </i>
          </span>
        ))}
      </div>
      <div className="fs-filter-actions">
        <span>Reset all filters</span>
        <span>Apply</span>
      </div>
    </aside>
  );
}

function SelectedPost({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const { talent, tile } = FOUND_SELECTED;
  const video = useRef<HTMLVideoElement>(null);
  const pendingSeek = useRef<number | null>(null);
  const [playbackIntent, setPlaybackIntent] = useState<
    "auto" | "play" | "pause"
  >("auto");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);
  const handle = talent.platforms.find(
    ({ network }) => network === tile.platform,
  )?.handle;
  useEffect(() => {
    if (!video.current) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.1),
      { threshold: 0.1 },
    );
    observer.observe(video.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const sync = () => {
      if (
        active &&
        visible &&
        (playbackIntent === "play" ||
          (playbackIntent === "auto" && !reducedMotion)) &&
        !document.hidden
      ) {
        void element.play().catch(() => {
          if (element.paused) setPlaying(false);
        });
      } else element.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      element.pause();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, visible, reducedMotion, playbackIntent]);
  useEffect(() => {
    if (!active) {
      pendingSeek.current = null;
      setElapsed(0);
    }
  }, [active]);
  const play = (element: HTMLVideoElement) => {
    setPlaybackIntent("play");
    void element.play().catch(() => {
      if (element.paused) setPlaying(false);
    });
  };
  const togglePlayback = () => {
    const element = video.current;
    if (!element || !active) return;
    if (element.paused) {
      play(element);
    } else {
      setPlaybackIntent("pause");
      element.pause();
    }
  };
  const applyPendingSeek = () => {
    const element = video.current;
    if (
      !element ||
      !active ||
      pendingSeek.current === null ||
      element.readyState < 1
    )
      return;
    const time = Math.max(
      0,
      Math.min(
        pendingSeek.current,
        Number.isFinite(element.duration)
          ? element.duration
          : pendingSeek.current,
      ),
    );
    element.currentTime = time;
    pendingSeek.current = null;
    setElapsed(time);
  };
  const seek = (time: number) => {
    const element = video.current;
    if (!element || !active) return;
    pendingSeek.current = time;
    applyPendingSeek();
    // Playing on this explicit click also loads metadata when preload is disabled.
    play(element);
  };
  return (
    <>
      <div className="fs-detail-header">
        <img src={talent.portrait} alt="" />
        <span>
          <strong>{talent.displayName}</strong>
          <small>TikTok · Video</small>
        </span>
        <span className="fs-detail-close">×</span>
      </div>
      <div className="fs-detail-body">
        <figure className="fs-detail-picture">
          <div className="fs-video-stage">
            <img className="fs-video-blur" src={tile.thumb} alt="" />
            <video
              ref={video}
              src={active ? tile.video : undefined}
              poster={tile.thumb}
              muted
              playsInline
              loop
              preload="none"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onLoadedMetadata={applyPendingSeek}
              onTimeUpdate={() => setElapsed(video.current?.currentTime ?? 0)}
              aria-label={`${talent.displayName} demonstrates a cleanser in a fictional skincare review`}
            />
            <div className="fs-video-identity">
              <img src={talent.portrait} alt="" />
              <span>
                {talent.displayName}
                <small>{handle}</small>
              </span>
              <ContentPlatformIcon network="tiktok" />
            </div>
            <div className="fs-video-caption">
              My everyday cleanser check-in
            </div>
            <button
              type="button"
              className={`fs-video-play ${playing ? "is-playing" : ""}`}
              onClick={togglePlayback}
              aria-label={
                playing ? "Pause skincare video" : "Play skincare video"
              }
              disabled={!active}
              tabIndex={active ? 0 : -1}
            >
              {playing ? <span>Ⅱ</span> : <LabIcon name="play" size={29} />}
            </button>
            <div className="fs-video-controls" aria-hidden="true">
              <span className="fs-video-progress">
                <i style={{ width: `${Math.min(100, elapsed * 10)}%` }} />
              </span>
              <span>{playing ? "Ⅱ" : "▶"}</span>
              <span>
                00:{Math.floor(elapsed).toString().padStart(2, "0")} / 00:10
              </span>
              <span className="fs-video-sound">Muted</span>
            </div>
          </div>
          <figcaption>
            <AIDisclosure />
          </figcaption>
        </figure>
        <div className="fs-detail-info">
          <div className="fs-strong-match">
            <strong>Strong match</strong>
            <p>
              This content strongly matches your search for{" "}
              <b>“skincare product reviews”</b>. Evidence found in visuals.
            </p>
          </div>
          <h4 className="fs-seen-heading">
            <LabIcon name="image" size={16} /> Seen (2)
          </h4>
          <div className="fs-seen-grid">
            {FOUND_SEEN.map((moment) => (
              <button
                type="button"
                className="fs-seen-card"
                key={moment.start}
                onClick={() => seek(moment.start)}
                disabled={!active}
                tabIndex={active ? 0 : -1}
                aria-label={`Watch ${moment.label.toLowerCase()}, ${moment.start} to ${moment.end} seconds`}
              >
                <span className="fs-seen-time">
                  <LabIcon name="play" size={12} /> 0:
                  {moment.start.toString().padStart(2, "0")} – 0:
                  {moment.end.toString().padStart(2, "0")}
                </span>
                <span className="fs-seen-picture">
                  <img src={moment.image} alt={moment.label} loading="lazy" />
                  <span>skincare product reviews</span>
                </span>
              </button>
            ))}
          </div>
          <h4>Post metrics</h4>
          <dl className="fs-post-metrics">
            <div>
              <dt>
                <LabIcon name="eye" size={16} />
                Views
              </dt>
              <dd>{formatWebsiteMetric(tile.views!)}</dd>
            </div>
            <div>
              <dt>
                <span
                  className="fs-clap"
                  style={{
                    maskImage: `url(${A}/999f1.svg)`,
                    WebkitMaskImage: `url(${A}/999f1.svg)`,
                  }}
                />
                Engagements
              </dt>
              <dd>{formatWebsiteMetric(tile.engagements!)}</dd>
            </div>
          </dl>
          <p className="fs-demo-note">Fictional creators · Demo figures</p>
        </div>
      </div>
    </>
  );
}

/** A continuous camera move: the opening search is the same bar in the results UI. */
export function FoundStory() {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => true,
  );
  const track = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const app = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [examplesPaused, setExamplesPaused] = useState(false);
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    originX: 0,
    originY: 0,
    scale: 1,
  });

  useLayoutEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!track.current) return;
      setProgress(
        clamp(
          -track.current.getBoundingClientRect().top /
            Math.max(1, track.current.offsetHeight - window.innerHeight),
        ),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [reducedMotion]);

  useLayoutEffect(() => {
    const stage = canvas.current,
      windowEl = app.current,
      bar = search.current;
    if (!stage || !windowEl || !bar) return;
    const measure = () => {
      const originX = bar.offsetLeft + bar.offsetWidth / 2;
      const originY = bar.offsetTop + bar.offsetHeight / 2;
      setCamera({
        originX,
        originY,
        x: stage.clientWidth / 2 - windowEl.offsetLeft - originX,
        y: stage.clientHeight * 0.54 - windowEl.offsetTop - originY,
        scale: Math.max(
          1,
          Math.min(2.1, (stage.clientWidth * 0.85) / bar.offsetWidth),
        ),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  const state = foundStoryTimeline(reducedMotion ? 1 : progress);
  const zoom = state.zoom;
  const intro = 1 - clamp(zoom * 2.2);
  return (
    <section
      className={`found-story ${reducedMotion ? "fs-reduced" : ""}`}
      id="found-with-foam"
      aria-labelledby="found-title"
    >
      <div className="sr-only">
        <h2>Found with Foam</h2>
        <p>
          Describe a moment, topic or creator. This example searches for
          skincare product reviews, shows a skincare post alongside related
          beauty content, then opens Nia Brooks’s cleanser review with 265,600
          views and 15,500 engagements. The Seen examples show moments
          identified in the video. All creators and figures are illustrative.
        </p>
      </div>
      <section
        ref={track}
        className="fs-track"
        aria-label="Found with Foam search demonstration"
      >
        <div
          ref={canvas}
          className="fs-canvas"
          data-progress={progress.toFixed(4)}
        >
          <div
            className="fs-intro"
            style={{ opacity: intro, transform: `translateY(${-zoom * 40}px)` }}
            aria-hidden="true"
          >
            <span className="fs-eyebrow">FOUND WITH FOAM</span>
            <h2>
              Type it the way
              <br />
              you’d say it.
            </h2>
            <p>Search by moment, topic or creator.</p>
          </div>
          <div
            ref={app}
            className="fs-window"
            aria-label="Foam discovery preview"
            style={{
              transformOrigin: `${camera.originX}px ${camera.originY}px`,
              transform: `translate(${camera.x * (1 - zoom)}px, ${camera.y * (1 - zoom)}px) scale(${1 + (camera.scale - 1) * (1 - zoom)})`,
            }}
          >
            <div className="fs-window-surface" style={{ opacity: zoom }} />
            <div className="fs-rail" style={{ opacity: zoom }}>
              <span className="fs-foam">
                <img src={`${A}/fdb3b.svg`} alt="" />
              </span>
              {(
                [
                  "people",
                  "explore",
                  "search",
                  "grid",
                  "image",
                ] as LabIconName[]
              ).map((icon, index) => (
                <span key={icon} className={index === 1 ? "is-active" : ""}>
                  <LabIcon name={icon} size={21} />
                </span>
              ))}
              <span className="fs-avatar">F</span>
            </div>
            <div className="fs-app-header" style={{ opacity: zoom }}>
              <strong>Explore content</strong>
              <span className="fs-demo-workspace">Demo workspace</span>
            </div>
            <div
              ref={search}
              className="fs-search"
              style={{
                boxShadow: `0 ${8 * (1 - zoom)}px ${36 * (1 - zoom)}px rgba(16,24,40,${0.08 * (1 - zoom)})`,
              }}
            >
              <LabIcon name="search" size={19} />
              <SearchExampleText
                query={state.query}
                paused={examplesPaused}
                showCaret={!reducedMotion && zoom < 0.8}
              />
            </div>
            <div className="fs-toolbar" style={{ opacity: zoom }}>
              <span className="fs-filter-heading">
                <LabIcon name="filter" size={16} />
                Filters
              </span>
              <span
                className="fs-query-chip"
                style={{ opacity: state.results }}
              >
                <LabIcon name="search" size={13} /> {FOUND_SEARCH_QUERY}{" "}
                <span>×</span>
              </span>
              <span className="fs-sort">
                <LabIcon name="compact" size={17} />
                <LabIcon name="chevron" size={12} />
              </span>
            </div>
            <div className="fs-filter-area" style={{ opacity: zoom }}>
              <SearchFilters />
            </div>
            <div className="fs-results" style={{ opacity: zoom }}>
              <div className="fs-results-caption">
                <span>{FOUND_RESULTS.length} beauty posts</span>
                <span>Most relevant</span>
              </div>
              <div className="fs-results-grid">
                {FOUND_RESULTS.map((result, index) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    index={index}
                    progress={state.results}
                    highlight={state.highlight}
                  />
                ))}
              </div>
            </div>
            <span
              className="fs-pointer"
              style={{
                opacity: state.highlight * (1 - state.detail),
                transform: `translate(${(1 - state.highlight) * 60}px,${(1 - state.highlight) * 45}px)`,
              }}
            />
            <div
              className="fs-detail-backdrop"
              style={{ opacity: state.detail }}
            />
            <div
              className="fs-post-detail"
              aria-hidden={state.detail <= 0.95}
              style={{
                opacity: state.detail,
                transform: `translateY(${(1 - state.detail) * 24}px) scale(${0.96 + 0.04 * state.detail})`,
              }}
            >
              <SelectedPost
                active={state.detail > 0.95}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
          {!state.query && !reducedMotion && (
            <button
              type="button"
              className="fs-example-control"
              onClick={() => setExamplesPaused((value) => !value)}
              aria-pressed={examplesPaused}
              aria-label="Pause search examples"
            >
              {examplesPaused ? "Resume examples" : "Pause examples"}
            </button>
          )}
          <p
            className="fs-scroll-cue"
            style={{ opacity: intro }}
            aria-hidden="true"
          >
            Scroll to find the moment <span>↓</span>
          </p>
          <p
            className="fs-stage-note"
            style={{ opacity: state.results * (1 - state.detail) }}
            aria-hidden="true"
          >
            The right content. With the context behind it.
          </p>
        </div>
      </section>
      <figure className="fs-campaign">
        <div className="fs-campaign-art">
          <img
            src={`${A}/campaigns/found-with-foam-skincare-v2.png`}
            width={1412}
            height={1114}
            loading="lazy"
            decoding="async"
            alt="Concept outdoor advert: Nia Brooks, the same fictional creator found in the skincare review, cleansing her face against pink, beneath Skincare product reviews and above Found with Foam."
          />
          <span className="fs-campaign-logo" aria-hidden="true">
            <i
              style={{
                maskImage: `url(${A}/fdb3b.svg)`,
                WebkitMaskImage: `url(${A}/fdb3b.svg)`,
              }}
            />
          </span>
        </div>
        <figcaption>
          <AIDisclosure detail="Concept advert" />
        </figcaption>
      </figure>
      <div className="fs-outro">
        <span className="fs-eyebrow">FOUND WITH FOAM</span>
        <h2 id="found-title">
          Find the moment
          <br />
          that makes the case.
        </h2>
        <p>From a few words to the post that belongs in your next pitch.</p>
        <Link to="/demo" className="fs-demo-link">
          Get a demo <span>↗</span>
        </Link>
        <p className="fs-accessible-query sr-only">
          Example search: {FOUND_SEARCH_QUERY}
        </p>
      </div>
    </section>
  );
}
