import { useId, useRef, useState } from "react";
import { Link } from "react-router";
import {
  CHROME_WALLPAPERS,
  chromeWallpaperBackground,
  chromeWallpaperFailureMessage,
  prepareChromeWallpaper,
  parseChromeWallpaper,
  readChromeWallpaperStorage,
  saveChromeWallpaper,
  useChromeWallpaper,
} from "../lib/chromeDemo";
import "./chrome-wallpaper-settings.css";

export function ChromeWallpaperSettings() {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const wallpaper = useChromeWallpaper();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const update = (preset: keyof typeof CHROME_WALLPAPERS) => {
    try {
      saveChromeWallpaper({ preset });
      setMessage("Background updated in this browser.");
    } catch (error) {
      setMessage(chromeWallpaperFailureMessage(error));
    }
  };
  return (
    <>
      <button
        className="cs-settings-trigger"
        type="button"
        onClick={() => {
          setMessage(
            parseChromeWallpaper(readChromeWallpaperStorage()).issue || "",
          );
          dialog.current?.showModal();
        }}
      >
        Website preview
      </button>
      <dialog ref={dialog} className="cs-settings" aria-labelledby={id}>
        <header>
          <div>
            <p>FOAM LAB · WEBSITE PREVIEW</p>
            <h2 id={id}>Desktop background</h2>
          </div>
          <button
            type="button"
            aria-label="Close background settings"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </header>
        <p className="cs-settings-intro">
          Try a different wallpaper behind the Chrome extension demo.
        </p>
        <div
          className="cs-settings-preview"
          style={{ backgroundImage: chromeWallpaperBackground(wallpaper) }}
          role="img"
          aria-label="Current desktop background"
        >
          <div>
            <span />
            <span />
            <span />
            <i>mail.google.com</i>
            <div />
          </div>
        </div>
        <fieldset disabled={busy}>
          <legend>Choose a background</legend>
          <div className="cs-settings-presets">
            {(["original", "sage", "blue"] as const).map((preset) => (
              <button
                type="button"
                key={preset}
                aria-pressed={!wallpaper.image && wallpaper.preset === preset}
                onClick={() => update(preset)}
              >
                <span style={{ backgroundImage: CHROME_WALLPAPERS[preset] }} />
                {preset === "original"
                  ? "Landscape"
                  : preset === "sage"
                    ? "Sage"
                    : "Blue"}
              </button>
            ))}
          </div>
          <label className="cs-settings-upload">
            <span>{busy ? "Preparing image…" : "Upload your own image"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setBusy(true);
                setMessage("");
                try {
                  const image = await prepareChromeWallpaper(file);
                  saveChromeWallpaper({
                    preset: "original",
                    image,
                    name: file.name,
                  });
                  setMessage(
                    "Your image is applied. Open the Chrome demo to see it.",
                  );
                } catch (error) {
                  setMessage(chromeWallpaperFailureMessage(error));
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {wallpaper.name && (
            <p className="cs-settings-filename">{wallpaper.name}</p>
          )}
        </fieldset>
        <p className="cs-settings-note">
          Saved in this browser only. This changes your local preview, not the
          published background for other visitors.
        </p>
        <p className="cs-settings-message" role="status">
          {message}
        </p>
        <footer>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              try {
                saveChromeWallpaper(null);
                setMessage("Default background restored.");
              } catch (error) {
                setMessage(chromeWallpaperFailureMessage(error));
              }
            }}
          >
            Reset background
          </button>
          <Link
            to="/chrome-story?preview=desktop"
            target="_blank"
            rel="noreferrer"
          >
            Full-size preview ↗
          </Link>
        </footer>
      </dialog>
    </>
  );
}
