import { OptimizedImage } from "./OptimizedImage";
import { useWebsiteImage } from "./WebsiteImageScope";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router";
import { overviewFilm } from "../data/overviewFilm";
import { Reveal } from "./Marketing";
import { useStopFooterSong } from "./FooterSong";
import "./overview-film.css";

function FilmPlayer({ onClose }: { onClose: () => void }) {
  const poster = useWebsiteImage(overviewFilm.poster, "See Foam in action");
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = dialog.current!;
    const player = video.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    // Playback starts only after the visitor explicitly opens the film.
    void player.play().catch(() => { /* Native controls remain available. */ });
    return () => {
      player.pause();
      element.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialog}
      className="of-dialog"
      aria-labelledby="overview-film-player-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className="of-player-heading">
        <h2 id="overview-film-player-title">{overviewFilm.title}</h2>
        <button type="button" onClick={onClose} aria-label="Close film" autoFocus>
          Close <span aria-hidden="true">×</span>
        </button>
      </div>
      <video ref={video} controls playsInline preload="metadata" poster={poster} aria-label="Foam overview film">
        <source src={overviewFilm.src} type="video/mp4" />
        Your browser cannot play this film. <a href={overviewFilm.src}>Open the video</a>.
      </video>
    </dialog>,
    document.body,
  );
}

export function OverviewFilm() {
  const [open, setOpen] = useState(false);
  const stopSong = useStopFooterSong();
  const openFilm = () => { stopSong(); setOpen(true); };
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== "#foam-film") return;
    const frame = requestAnimationFrame(() => document.getElementById("foam-film")?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <section className="of-section pc-shell" id="foam-film" aria-labelledby="overview-film-title">
      <Reveal className="of-layout">
        <div className="of-copy">
          <p className="pc-eyebrow">A closer look</p>
          <h2 id="overview-film-title">See Foam<br />in action.</h2>
          <p className="of-description">See how Foam brings talent, content and conversations together.</p>
          <button className="of-watch-link" type="button" onClick={openFilm} aria-haspopup="dialog">
            Watch the film <span className="of-duration">· {overviewFilm.duration}</span> <span aria-hidden="true">↗</span>
          </button>
        </div>
        <button className="of-poster" type="button" onClick={openFilm} aria-label="Play the Foam overview film" aria-haspopup="dialog">
          <OptimizedImage section="See Foam in action" src={overviewFilm.poster} alt="" width={overviewFilm.posterWidth} height={overviewFilm.posterHeight} loading="lazy" decoding="async" />
        </button>
      </Reveal>
      {open && <FilmPlayer onClose={() => setOpen(false)} />}
    </section>
  );
}
