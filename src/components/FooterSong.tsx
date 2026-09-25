import { OptimizedImage } from "./OptimizedImage";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { footerSong } from "../data/footerSong";
import "./footer-song.css";

type SongContextValue = { cardAvailable: boolean; open: boolean; playing: boolean; pending: boolean; toggle: () => void; stop: () => void };
const SongContext = createContext<SongContextValue>({ cardAvailable: false, open: false, playing: false, pending: false, toggle: () => {}, stop: () => {} });
const SONG_CARD_ROUTES = new Set(["/", "/managers", "/brands", "/creators", "/features", "/about", "/data-trust", "/updates", "/demo", "/chrome-story", "/home-film-preview"]);
const SONG_END_DELAY_MS = 6500;
const SONG_FADE_MS = 200;

export function useStopFooterSong() { return useContext(SongContext).stop; }

function timeLabel(seconds: number) {
  const whole = Math.floor(Number.isFinite(seconds) ? seconds : 0);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function PlayIcon({ playing }: { playing: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">{playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="M7 3.5v17l14-8.5z" />}</svg>;
}

function restorePageFocus() {
  // Wait for the footer card to return before handing keyboard focus back.
  requestAnimationFrame(() => {
    const card = document.querySelector<HTMLButtonElement>(".footer-song-card");
    const target = card && card.getBoundingClientRect().top < window.innerHeight && card.getBoundingClientRect().bottom > 0
      ? card : document.getElementById("main-content") ?? document.querySelector<HTMLAnchorElement>(".story-nav-brand");
    target?.focus({ preventScroll: true });
  });
}

/** Lives above page layouts so internal navigation never restarts the song. */
export function FooterSongProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const route = pathname.replace(/\/+$/, "") || "/";
  const cardAvailable = SONG_CARD_ROUTES.has(route);
  // Kit Story can carry an existing listening session, but has no song card.
  const playbackAvailable = cardAvailable || route === "/kit-story";
  const audio = useRef<HTMLAudioElement>(null);
  const playerToggle = useRef<HTMLButtonElement>(null);
  const attempt = useRef(0);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [ended, setEnded] = useState(false);
  const [fading, setFading] = useState(false);

  const stop = useCallback(() => {
    attempt.current += 1;
    const player = audio.current;
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
    setOpen(false);
    setPlaying(false);
    setPending(false);
    setCurrent(0);
    setDuration(0);
    setError(false);
    setEnded(false);
    setFading(false);
  }, []);

  useEffect(() => {
    if (!ended) return;
    const fadeTimer = window.setTimeout(() => setFading(true), SONG_END_DELAY_MS);
    const closeTimer = window.setTimeout(() => {
      const playerHadFocus = document.activeElement?.closest(".song-player");
      stop();
      if (playerHadFocus) restorePageFocus();
    }, SONG_END_DELAY_MS + SONG_FADE_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(closeTimer);
    };
  }, [ended, stop]);

  useEffect(() => { if (!playbackAvailable) stop(); }, [playbackAvailable, stop]);
  useEffect(() => {
    if (open) playerToggle.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    const player = audio.current;
    // A film ends the listening session; closing it must not bring music back.
    const onOtherMedia = (event: Event) => {
      if (event.target instanceof HTMLMediaElement && event.target !== player && !event.target.muted) {
        stop();
      }
    };
    document.addEventListener("play", onOtherMedia, true);
    return () => { document.removeEventListener("play", onOtherMedia, true); player?.pause(); };
  }, [stop]);

  function toggle() {
    const player = audio.current;
    if (!playbackAvailable || !player) return;
    setEnded(false);
    setFading(false);
    if (!player.paused || pending) {
      attempt.current += 1;
      player.pause();
      setPending(false);
      return;
    }
    setOpen(true);
    setError(false);
    setPending(true);
    if (!player.getAttribute("src")) player.src = footerSong.src;
    else if (player.error) player.load();
    if (player.ended) player.currentTime = 0;
    document.querySelectorAll<HTMLMediaElement>("video, audio").forEach((media) => {
      if (media !== player && !media.paused && !media.muted) media.pause();
    });
    const thisAttempt = ++attempt.current;
    // Keep play in the click gesture for mobile browsers. No autoplay or storage.
    void player.play().then(() => {
      if (attempt.current === thisAttempt) setPending(false);
    }).catch(() => {
      if (attempt.current !== thisAttempt) return;
      setPending(false);
      setPlaying(false);
      setError(true);
    });
  }

  function dismiss() {
    stop();
    restorePageFocus();
  }

  return <SongContext.Provider value={{ cardAvailable, open, playing, pending, toggle, stop }}>
    {children}
    <audio ref={audio} preload="none" aria-hidden="true"
      onPlay={() => { setPlaying(true); setEnded(false); setFading(false); }} onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); setPending(false); setEnded(true); }}
      onSeeking={() => { setEnded(false); setFading(false); }}
      onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
      onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
      onError={() => { if (audio.current?.getAttribute("src")) { setError(true); setPlaying(false); setPending(false); } }}
    />
    {playbackAvailable && open && <>
      <div className="song-player-space" aria-hidden="true" />
      <section className={`song-player${fading ? " is-fading" : ""}`} style={{ transitionDuration: `${SONG_FADE_MS}ms` }} aria-label="Feed the Feed music player">
        <div className="song-player-inner">
          <div className="song-player-track">
            <OptimizedImage section="Footer · A song from Foam" sizes="52px" src={footerSong.thumbnail} alt="" width="52" height="52" />
            <div><strong>{footerSong.title}</strong><span>{error ? "Couldn’t play. Please try again." : pending ? "Loading the song…" : "A song from Foam"}</span></div>
            <span className={`song-equalizer${playing ? " is-playing" : ""}`} aria-hidden="true"><i /><i /><i /><i /></span>
          </div>
          <button ref={playerToggle} className="song-player-toggle" type="button" onClick={toggle} aria-label={playing || pending ? "Pause Feed the Feed" : "Play Feed the Feed"}>
            <PlayIcon playing={playing || pending} />
          </button>
          <div className="song-player-progress">
            <span aria-hidden="true">{timeLabel(current)}</span>
            <input type="range" min="0" max={duration || 0} step="1" value={Math.min(current, duration)} disabled={!duration}
              aria-label="Song position" aria-valuetext={`${timeLabel(current)} of ${timeLabel(duration)}`}
              onChange={(e) => { if (audio.current) { audio.current.currentTime = Number(e.target.value); setCurrent(Number(e.target.value)); } }} />
            <span aria-hidden="true">{timeLabel(duration)}</span>
          </div>
          <button className="song-player-mute" type="button" onClick={() => { if (audio.current) { audio.current.muted = !muted; setMuted(!muted); } }} aria-label={muted ? "Unmute song" : "Mute song"} aria-pressed={muted}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5z" />{muted ? <path d="m16 9 6 6m0-6-6 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}</svg>
          </button>
          <button className="song-player-close" type="button" onClick={dismiss} aria-label="Stop music and close player" title="Stop music and close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <span className="song-sr-only" role="status">{error ? "The song could not play. Try the play button again." : ""}</span>
        </div>
      </section>
    </>}
  </SongContext.Provider>;
}

export function FooterSongCard() {
  const { cardAvailable, open, playing, pending, toggle } = useContext(SongContext);
  const { hash } = useLocation();
  useEffect(() => {
    if (!cardAvailable || hash !== "#foam-song") return;
    const frame = requestAnimationFrame(() => document.getElementById("foam-song")?.scrollIntoView({ block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [cardAvailable, hash]);
  if (!cardAvailable || open) return null;
  return <div className="footer-song" id="foam-song">
    <p className="footer-song-eyebrow">A song from Foam</p>
    <button className="footer-song-card" onClick={toggle} type="button" aria-label={`${playing || pending ? "Pause" : "Play"} Feed the Feed — a song from Foam`}>
      <OptimizedImage section="Footer · A song from Foam" sizes="240px" src={footerSong.cover} alt="" width={footerSong.coverWidth} height={footerSong.coverHeight} loading="lazy" decoding="async" />
      <span className="footer-song-details"><span><strong>{footerSong.title}</strong><span>{footerSong.subtitle}</span></span><span className="footer-song-play"><PlayIcon playing={playing || pending} /></span></span>
    </button>
  </div>;
}
