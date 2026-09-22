import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { A } from "./assets";

export const CHROME_STORE =
  "https://chromewebstore.google.com/detail/foam-the-essential-chrome/iocblckedogkccdepdjfceomgncpeadf";

export const CHROME_STEPS = [
  { label: "The brief", description: "A brand asks for the right creator." },
  { label: "Reply", description: "Your roster is right beside your reply." },
  { label: "Choose", description: "Find the person who fits the brief." },
  { label: "Copy", description: "One click copies the details that matter." },
  { label: "Paste", description: "A complete creator profile, ready to send." },
] as const;
export type ChromeStage = 0 | 1 | 2 | 3 | 4;

export const CHROME_WALLPAPERS = {
  original: `url("${A}/chrome-desktop-landscape.png")`,
  sage: "radial-gradient(ellipse at 20% 20%, #eef0df, transparent 62%), linear-gradient(130deg, #7b9383, #c0cebd 54%, #e2e5d3)",
  blue: "radial-gradient(ellipse at 72% 25%, #e4ebf8, transparent 62%), linear-gradient(145deg, #57718f, #acc3d7 54%, #d9e5ed)",
};
export type ChromeWallpaper = {
  preset: keyof typeof CHROME_WALLPAPERS;
  image?: string;
  name?: string;
};
const KEY = "foam-lab-chrome-wallpaper:v1";
const EVENT = "foam-chrome-wallpaper-change";
const MAX_IMAGE_CHARACTERS = 2_000_000;
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
let lastValidatedImage: string | null = null;

class ChromeWallpaperInputError extends Error {}

export function chromeWallpaperFailureMessage(error: unknown) {
  if (error instanceof ChromeWallpaperInputError) return error.message;
  if (error instanceof Error && error.name === "QuotaExceededError")
    return "There is not enough browser storage for this image. Try a smaller one.";
  if (error instanceof Error && error.name === "SecurityError")
    return "Browser storage is blocked. Allow local storage to save a background.";
  return "The background could not be saved. Try another image or allow local storage.";
}

export function useChromePreviewEntry(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("preview") !== "desktop"
    )
      return;
    const frame = requestAnimationFrame(() =>
      ref.current?.scrollIntoView({ block: "start", behavior: "instant" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [ref]);
}

/** Only locally prepared raster images can become a CSS background URL. */
export function isChromeWallpaperImage(value: unknown): value is string {
  if (typeof value !== "string" || value.length > MAX_IMAGE_CHARACTERS)
    return false;
  if (value === lastValidatedImage) return true;
  const match =
    /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) return false;
  try {
    const bytes = atob(match[2].slice(0, 32));
    const valid =
      match[1] === "png"
        ? bytes.startsWith("\x89PNG\r\n\x1a\n")
        : match[1] === "jpeg"
          ? bytes.startsWith("\xff\xd8\xff")
          : bytes.startsWith("RIFF") && bytes.slice(8, 12) === "WEBP";
    if (valid) lastValidatedImage = value;
    return valid;
  } catch {
    return false;
  }
}

export function parseChromeWallpaper(raw: string | null): {
  wallpaper: ChromeWallpaper;
  issue?: string;
} {
  const fallback: ChromeWallpaper = { preset: "original" };
  if (raw === null) return { wallpaper: fallback };
  const issue =
    "The saved background could not be restored. Choose a preset or upload the image again.";
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      return { wallpaper: fallback, issue };
    const saved = value as Record<string, unknown>;
    if (
      typeof saved.preset !== "string" ||
      !Object.prototype.hasOwnProperty.call(CHROME_WALLPAPERS, saved.preset)
    )
      return { wallpaper: fallback, issue };
    const preset = saved.preset as ChromeWallpaper["preset"];
    if (saved.image !== undefined && !isChromeWallpaperImage(saved.image))
      return { wallpaper: { preset }, issue };
    return {
      wallpaper: {
        preset,
        ...(saved.image ? { image: saved.image as string } : {}),
        ...(saved.image && typeof saved.name === "string"
          ? { name: saved.name.slice(0, 200) }
          : {}),
      },
    };
  } catch {
    return { wallpaper: fallback, issue };
  }
}

export function readChromeWallpaperStorage() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) callback();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(EVENT, callback);
  };
}
export function useChromeWallpaper(): ChromeWallpaper {
  const raw = useSyncExternalStore(
    subscribe,
    readChromeWallpaperStorage,
    () => null,
  );
  return useMemo(() => parseChromeWallpaper(raw).wallpaper, [raw]);
}
export function chromeWallpaperBackground(wallpaper: ChromeWallpaper) {
  return isChromeWallpaperImage(wallpaper.image)
    ? `url("${wallpaper.image}")`
    : CHROME_WALLPAPERS[wallpaper.preset] || CHROME_WALLPAPERS.original;
}
export function saveChromeWallpaper(wallpaper: ChromeWallpaper | null) {
  if (wallpaper) {
    const parsed = parseChromeWallpaper(JSON.stringify(wallpaper));
    if (parsed.issue)
      throw new ChromeWallpaperInputError(
        "Choose a valid background image or preset.",
      );
    localStorage.setItem(KEY, JSON.stringify(parsed.wallpaper));
  } else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Keep a local preview comfortably within browser storage limits. */
export async function prepareChromeWallpaper(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new ChromeWallpaperInputError("Choose a JPG, PNG or WebP image.");
  if (file.size > MAX_UPLOAD_BYTES)
    throw new ChromeWallpaperInputError(
      "Choose an image no larger than 20 MB.",
    );
  if (!file.size)
    throw new ChromeWallpaperInputError(
      "This file is empty. Choose another image.",
    );
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new ChromeWallpaperInputError(
        "This image could not be opened. Try another JPG, PNG or WebP.",
      );
    }
    if (!image.width || !image.height)
      throw new ChromeWallpaperInputError(
        "This image has no visible size. Choose another image.",
      );
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context)
      throw new ChromeWallpaperInputError("This image could not be prepared.");
    context.fillStyle = "#dce2df";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const prepared = canvas.toDataURL("image/webp", 0.85);
    if (!isChromeWallpaperImage(prepared))
      throw new ChromeWallpaperInputError(
        "This image is too detailed to save here. Try a smaller image.",
      );
    return prepared;
  } finally {
    URL.revokeObjectURL(url);
  }
}
