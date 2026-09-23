import { strToU8, zipSync } from "fflate";
import {
  CAPTION_FONT_OPTIONS,
  resolveCaptionSettings,
  type StagedTalent,
  type TalentContentTile,
  type TileCaptionSettings,
} from "../data/stagedTalent";

import {
  captionBackgrounds,
  captionFont,
  captionPosition,
  measureCaption,
} from "./captionLayout";

export type LabAsset = {
  id: string;
  talent: StagedTalent;
  index: number;
  src: string;
  original?: string;
  title: string;
  tile?: TalentContentTile;
};
/** Empty fictional profiles use zero as a storage sentinel, not a reported audience. */
export const hasAssignedAudience = (talent: StagedTalent) =>
  talent.totalAudience > 0 || talent.platforms.length > 0;
export const NETWORK_NAMES = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitch: "Twitch",
  linkedin: "LinkedIn",
};
export const SHORT_NAMES = {
  instagram: "IG",
  tiktok: "TT",
  youtube: "YT",
  twitch: "TW",
  linkedin: "IN",
};
export const SAVED_KEY = "foam-lab-saved-assets:v1";
// Keep legacy numeric keys while allowing a tile to move without taking another
// asset's bookmarks or caption draft with it.
const contentId = (tile: TalentContentTile, index: number) =>
  tile.id ?? String(index);
const captionKey = (asset: LabAsset) =>
  `foam-lab-talent-caption:${asset.talent.id}:${asset.tile ? contentId(asset.tile, asset.index) : asset.index}`;

export function assetsFor(talent: StagedTalent): LabAsset[] {
  return [
    {
      id: `${talent.id}:portrait`,
      talent,
      index: -1,
      src: talent.portrait,
      original: talent.originalPortrait,
      title: `${talent.displayName} portrait`,
    },
    ...talent.content.map((tile, index) => ({
      id: `${talent.id}:${contentId(tile, index)}`,
      talent,
      index,
      src: tile.thumb,
      original: tile.original,
      title: tile.caption || `Content ${index + 1}`,
      tile,
    })),
  ];
}

export function assetKind(asset: LabAsset) {
  if (asset.tile?.video) return "video";
  if (asset.tile?.type === "clip") return "planned";
  return "still";
}

export function readyVideoSources(talent: StagedTalent): string[] {
  return [
    ...new Set([
      ...talent.content.flatMap((tile) => (tile.video ? [tile.video] : [])),
      ...(talent.motion && talent.motionStatus === "ready"
        ? [talent.motion]
        : []),
    ]),
  ];
}

/** Validate browser drafts so stale or malformed storage cannot break the editor. */
export function cleanCaption(
  input: unknown,
  fallback: TileCaptionSettings,
): TileCaptionSettings {
  const p =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const number = (key: keyof TileCaptionSettings, min: number, max: number) =>
    typeof p[key] === "number" && Number.isFinite(p[key])
      ? Math.min(max, Math.max(min, p[key] as number))
      : (fallback[key] as number);
  const color = (key: "fill" | "stroke" | "backgroundColor") =>
    typeof p[key] === "string" && /^#[\da-f]{6}$/i.test(p[key] as string)
      ? (p[key] as string)
      : fallback[key];
  return {
    visible: typeof p.visible === "boolean" ? p.visible : fallback.visible,
    text: typeof p.text === "string" ? p.text.slice(0, 1000) : fallback.text,
    x: number("x", 10, 90),
    y: number("y", 10, 90),
    size: number("size", 10, 36),
    strokeWidth: number("strokeWidth", 0, 6),
    fill: color("fill"),
    stroke: color("stroke"),
    weight:
      [400, 600, 800].includes(Number(p.weight)) && typeof p.weight === "number"
        ? (p.weight as TileCaptionSettings["weight"])
        : fallback.weight,
    italic: typeof p.italic === "boolean" ? p.italic : fallback.italic,
    uppercase:
      typeof p.uppercase === "boolean" ? p.uppercase : fallback.uppercase,
    align: ["left", "center", "right"].includes(String(p.align))
      ? (p.align as TileCaptionSettings["align"])
      : fallback.align,
    background: ["none", "box", "highlight"].includes(String(p.background))
      ? (p.background as TileCaptionSettings["background"])
      : fallback.background,
    backgroundColor: color("backgroundColor"),
    backgroundOpacity: number("backgroundOpacity", 0, 100),
    padding: number("padding", 0, 18),
    radius: number("radius", 0, 24),
    font: CAPTION_FONT_OPTIONS.some((font) => font.id === p.font)
      ? (p.font as TileCaptionSettings["font"])
      : fallback.font,
  };
}

export function readCaption(asset: LabAsset): TileCaptionSettings | undefined {
  if (!asset.tile) return undefined;
  const fallback = resolveCaptionSettings(asset.tile);
  try {
    return cleanCaption(
      JSON.parse(localStorage.getItem(captionKey(asset)) || "null"),
      fallback,
    );
  } catch {
    return fallback;
  }
}

export function writeCaption(asset: LabAsset, caption: TileCaptionSettings) {
  try {
    localStorage.setItem(captionKey(asset), JSON.stringify(caption));
    return true;
  } catch {
    return false;
  }
}

export function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function absolute(src: string) {
  return new URL(src, window.location.href).href;
}
const madeWithAI = (provenance?: string) =>
  !provenance || provenance === "ai-generated";
const provenanceLabel = (provenance?: string) =>
  madeWithAI(provenance)
    ? "Made with AI"
    : provenance === "reference"
      ? "Supplied reference photo"
      : "Uploaded image · origin not verified";
export function profileData(talent: StagedTalent) {
  return {
    ...talent,
    synthetic: madeWithAI(talent.provenance),
    aiGenerated: madeWithAI(talent.provenance),
    disclosure: provenanceLabel(talent.provenance),
    referenceImages: talent.referenceImages?.map((reference) => ({
      ...reference,
      src: absolute(reference.src),
    })),
    portrait: absolute(talent.portrait),
    originalPortrait: talent.originalPortrait
      ? absolute(talent.originalPortrait)
      : null,
    creativeDirection: talent.creativeDirection
      ? {
          ...talent.creativeDirection,
          promptFile: talent.creativeDirection.promptFile
            ? absolute(talent.creativeDirection.promptFile)
            : undefined,
        }
      : undefined,
    motion: talent.motion ? absolute(talent.motion) : null,
    content: assetsFor(talent)
      .filter((a) => a.tile)
      .map((a) => ({
        ...a.tile,
        id: a.id,
        aiGenerated: madeWithAI(a.tile?.provenance || talent.provenance),
        disclosure: provenanceLabel(a.tile?.provenance || talent.provenance),
        thumb: absolute(a.src),
        original: a.original ? absolute(a.original) : null,
        video: a.tile?.video ? absolute(a.tile.video) : null,
        availability: assetKind(a),
        captionSettings: readCaption(a),
      })),
  };
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function exportData(
  talents: StagedTalent[],
  name = "foam-talent-library.json",
) {
  saveBlob(
    new Blob(
      [
        JSON.stringify(
          {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            note: "Talent library with per-image provenance. Caption edits are browser-local drafts.",
            talent: talents.map(profileData),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
    name,
  );
}

function extension(src: string) {
  return (
    new URL(src, window.location.href).pathname.match(/\.([a-z0-9]+)$/i)?.[1] ||
    "jpg"
  );
}
export function assetFilename(asset: LabAsset, src = asset.src) {
  return `${asset.talent.id}-${asset.index < 0 ? "portrait" : `content-${asset.index + 1}`}.${extension(src)}`;
}

async function assetBytes(src: string) {
  const response = await fetch(src);
  if (
    !response.ok ||
    !(response.headers.get("content-type") || "").match(/^(image|video)\//)
  )
    throw new Error("An asset could not be downloaded. Please try again.");
  return new Uint8Array(await response.arrayBuffer());
}

async function briefBytes(src: string) {
  const response = await fetch(src);
  const contentType = response.headers.get("content-type") || "";
  if (
    !response.ok ||
    !/^(text\/(plain|markdown|x-markdown)|application\/(markdown|octet-stream))(?:;|$)/i.test(
      contentType,
    )
  )
    throw new Error(
      "The creative brief could not be downloaded. Please try again.",
    );
  const text = await response.text();
  if (
    !text.trim() ||
    text.includes("\0") ||
    /^\s*(<!doctype|<html)/i.test(text)
  )
    throw new Error("The creative brief is unavailable. Please try again.");
  return strToU8(text);
}

export async function downloadOriginal(asset: LabAsset) {
  const response = await fetch(asset.src);
  if (
    !response.ok ||
    !(response.headers.get("content-type") || "").startsWith("image/")
  )
    throw new Error("The image could not be downloaded.");
  saveBlob(await response.blob(), assetFilename(asset));
}

export async function downloadVideo(asset: LabAsset) {
  if (!asset.tile?.video)
    throw new Error("No video is available for this asset.");
  const response = await fetch(asset.tile.video);
  if (
    !response.ok ||
    !(response.headers.get("content-type") || "").startsWith("video/")
  )
    throw new Error("The video could not be downloaded.");
  saveBlob(await response.blob(), assetFilename(asset, asset.tile.video));
}

export async function downloadArchivedOriginal(asset: LabAsset) {
  if (!asset.original) throw new Error("No earlier original is available.");
  const response = await fetch(asset.original);
  if (
    !response.ok ||
    !(response.headers.get("content-type") || "").startsWith("image/")
  )
    throw new Error("The archived image could not be downloaded.");
  saveBlob(
    await response.blob(),
    assetFilename(asset, asset.original).replace(/\.[^.]+$/, "-original$&"),
  );
}

export async function downloadPack(
  assets: LabAsset[],
  name: string,
  onProgress: (done: number, total: number) => void,
) {
  const files: Record<string, Uint8Array> = {};
  const talents = [
    ...new Map(assets.map((a) => [a.talent.id, a.talent])).values(),
  ];
  const jobs: { path: string; src: string; kind?: "text" }[] = assets.flatMap(
    (a) => [
      { path: `${a.talent.id}/${assetFilename(a)}`, src: a.src },
      ...(a.original
        ? [
            {
              path: `${a.talent.id}/archive/originals/${assetFilename(a, a.original)}`,
              src: a.original,
            },
          ]
        : []),
      ...(a.tile?.video
        ? [
            {
              path: `${a.talent.id}/content-${a.index + 1}.${extension(a.tile.video)}`,
              src: a.tile.video,
            },
          ]
        : []),
    ],
  );
  for (const talent of talents) {
    for (const [index, reference] of (talent.referenceImages || []).entries()) {
      jobs.push({
        path: `${talent.id}/references/reference-${index + 1}.${extension(reference.src)}`,
        src: reference.src,
      });
    }
    if (
      talent.motion &&
      talent.motionStatus === "ready" &&
      !jobs.some((job) => absolute(job.src) === absolute(talent.motion!))
    )
      jobs.push({
        path: `${talent.id}/${talent.id}-motion.${extension(talent.motion)}`,
        src: talent.motion,
      });
    if (talent.creativeDirection?.promptFile)
      jobs.push({
        path: `${talent.id}/creative-brief.${extension(talent.creativeDirection.promptFile)}`,
        src: talent.creativeDirection.promptFile,
        kind: "text",
      });
  }
  let done = 0;
  // Four concurrent fetches keep large collections responsive without flooding requests.
  for (let offset = 0; offset < jobs.length; offset += 4) {
    await Promise.all(
      jobs.slice(offset, offset + 4).map(async (job) => {
        files[job.path] = await (job.kind === "text"
          ? briefBytes(job.src)
          : assetBytes(job.src));
        onProgress(++done, jobs.length);
      }),
    );
  }
  files["talent-data.json"] = strToU8(
    JSON.stringify(
      {
        schemaVersion: 1,
        synthetic: talents.every((talent) => madeWithAI(talent.provenance)),
        includedAssetIds: assets.map((a) => a.id),
        talent: talents.map(profileData),
      },
      null,
      2,
    ),
  );
  files["README.txt"] = strToU8(
    "Foam talent library\n\nThis library contains fictional demo talent, supplied reference photos and uploaded images. See each profile and image provenance in talent-data.json; uploads are not assumed to be AI-generated. Demo metrics are illustrative.\nCurrent images are supplied without caption overlays. Earlier images, where available, are preserved in each character's archive/originals folder; supplied reference sheets are in references.\nCaption drafts, AI disclosure, source URLs and creative direction are included in talent-data.json. A creative-brief file is included for characters with a full brief. Use Download with caption in the lab for a rendered image.\nA planned video has a thumbnail only; no video file exists yet. Ready videos are included when a source file is available.\n",
  );
  const zipped = zipSync(files, { level: 0 });
  saveBlob(new Blob([zipped as BlobPart], { type: "application/zip" }), name);
}

/** Render the asset editor's crop and caption at 1080px wide. */
export async function downloadCaptioned(
  asset: LabAsset,
  caption: TileCaptionSettings,
) {
  const image = new Image();
  image.src = asset.src;
  await image.decode();
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  const [ratioWidth, ratioHeight] = (asset.tile?.aspectRatio || "9/16")
    .split("/")
    .map(Number);
  canvas.height = Math.round((canvas.width * ratioHeight) / ratioWidth);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable in this browser.");
  const scale = Math.max(
    canvas.width / image.width,
    canvas.height / image.height,
  );
  ctx.drawImage(
    image,
    (canvas.width - image.width * scale) / 2,
    (canvas.height - image.height * scale) / 2,
    image.width * scale,
    image.height * scale,
  );
  if (caption.visible && caption.text.trim()) {
    // Explicitly load the selected face, even when exporting before it has appeared in a preview.
    await document.fonts.load(captionFont(caption), caption.text).catch(() => {
      // Match the preview's declared fallback if a font request fails.
    });
    const layout = measureCaption(ctx, caption);
    ctx.translate(
      captionPosition(caption.x, layout.width, canvas.width) - layout.width / 2,
      captionPosition(caption.y, layout.height, canvas.height) -
        layout.height / 2,
    );
    ctx.fillStyle = caption.backgroundColor;
    ctx.globalAlpha = caption.backgroundOpacity / 100;
    ctx.beginPath();
    for (const rect of captionBackgrounds(layout, caption)) {
      ctx.roundRect(
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        Math.min(caption.radius * 3.6, rect.height / 2, rect.width / 2),
      );
    }
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = caption.fill;
    ctx.strokeStyle = caption.stroke;
    ctx.lineWidth = caption.strokeWidth * 3.6;
    ctx.lineJoin = "round";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    if (!caption.strokeWidth && caption.background === "none") {
      ctx.shadowColor = "rgba(0,0,0,.5)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
    }
    for (const line of layout.lines) {
      if (caption.strokeWidth) ctx.strokeText(line.text, line.x, line.y);
      ctx.fillText(line.text, line.x, line.y);
    }
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("The captioned image could not be created.");
  saveBlob(blob, assetFilename(asset).replace(/\.[^.]+$/, "-captioned.png"));
}
