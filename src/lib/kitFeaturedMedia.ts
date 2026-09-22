export type KitImageStatus = "loading" | "ready" | "error";

/** Observe bytes and decoding together, including images already in the browser cache. */
export function observeKitImage(
  image: HTMLImageElement,
  onStatus: (status: KitImageStatus) => void,
) {
  let active = true;
  let decoding = false;
  let failed = false;
  const fail = () => {
    if (active) {
      failed = true;
      onStatus("error");
    }
  };
  const loaded = async () => {
    if (!active || decoding || failed) return;
    if (!image.naturalWidth) {
      fail();
      return;
    }
    decoding = true;
    try {
      if (typeof image.decode === "function") await image.decode();
    } catch {
      // Some browsers reject decode() even though a loaded image can be drawn.
      // The natural size below distinguishes that case from a broken image.
    }
    if (active && !failed) onStatus(image.naturalWidth ? "ready" : "error");
  };
  onStatus("loading");
  image.addEventListener("load", loaded);
  image.addEventListener("error", fail);
  if (image.complete) void loaded();
  return () => {
    active = false;
    image.removeEventListener("load", loaded);
    image.removeEventListener("error", fail);
  };
}
