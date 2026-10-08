import { useFooterSongControl } from "./FooterSong";
import "./nav-song-control.css";

/** The header and footer control the same persistent audio element. */
export function NavSongControl() {
  const { playbackAvailable, open, playing, pending, toggle } = useFooterSongControl();
  if (!playbackAvailable) return null;
  const active = playing || pending;
  const label = active ? "Pause the tune" : "Play the tune";
  return (
    <button
      className={`nav-song-control${playing ? " is-playing" : ""}`}
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={active}
      aria-controls={open ? "foam-song-player" : undefined}
      title={`${label} — Feed the Feed`}
    >
      <span className="nav-song-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l11-2v13M9 9l11-2" />
          <ellipse cx="6" cy="18" rx="3" ry="2.5" />
          <ellipse cx="17" cy="16" rx="3" ry="2.5" />
        </svg>
        <i className="nav-song-playing" />
      </span>
      <span className="nav-song-label">{label}</span>
    </button>
  );
}
