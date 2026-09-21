import { strToU8, zipSync } from "fflate";
import {
  resolveCaptionSettings,
  type StagedTalent,
  type TalentContentTile,
  type TileCaptionSettings,
} from "../data/stagedTalent";

export type LabAsset = {
  id: string;
  talent: StagedTalent;
  index: number;
  src: string;
  original?: string;
  title: string;
  tile?: TalentContentTile;
};
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
const captionKey = (id: string, index: number) =>
  `foam-lab-talent-caption:${id}:${index}`;

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
      id: `${talent.id}:${index}`,
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
  const color = (key: "fill" | "stroke") =>
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
    font: ["founders", "sf", "georgia", "mono"].includes(String(p.font))
      ? (p.font as TileCaptionSettings["font"])
      : fallback.font,
  };
}

export function readCaption(asset: LabAsset): TileCaptionSettings | undefined {
  if (!asset.tile) return undefined;
  const fallback = resolveCaptionSettings(asset.tile);
  try {
    return cleanCaption(
      JSON.parse(
        localStorage.getItem(captionKey(asset.talent.id, asset.index)) ||
          "null",
      ),
      fallback,
    );
  } catch {
    return fallback;
  }
}

export function writeCaption(asset: LabAsset, caption: TileCaptionSettings) {
  try {
    localStorage.setItem(
      captionKey(asset.talent.id, asset.index),
      JSON.stringify(caption),
    );
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
export function profileData(talent: StagedTalent) {
  return {
    ...talent,
    synthetic: true,
    aiGenerated: true,
    disclosure: "Made with AI",
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
        aiGenerated: true,
        disclosure: "Made with AI",
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
            note: "Fictional demo talent. Caption edits are browser-local drafts.",
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
        synthetic: true,
        includedAssetIds: assets.map((a) => a.id),
        talent: talents.map(profileData),
      },
      null,
      2,
    ),
  );
  files["README.txt"] = strToU8(
    "Foam talent library\n\nMade with AI. These are fictional demo characters and invented metrics.\nCurrent images are supplied without caption overlays. Earlier images, where available, are preserved in each character's archive/originals folder; supplied reference sheets are in references.\nCaption drafts, AI disclosure, source URLs and creative direction are included in talent-data.json. A creative-brief file is included for characters with a full brief. Use Download with caption in the lab for a rendered image.\nA planned video has a thumbnail only; no video file exists yet. Ready videos are included when a source file is available.\n",
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
    const fonts = {
      founders: "'Founders Grotesk'",
      sf: "'SF Pro Text'",
      georgia: "Georgia",
      mono: "monospace",
    };
    const size = caption.size * 3.6;
    ctx.font = `600 ${size}px ${fonts[caption.font]}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines: string[] = [];
    for (const paragraph of caption.text.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > 950.4 && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    ctx.fillStyle = caption.fill;
    ctx.strokeStyle = caption.stroke;
    ctx.lineWidth = caption.strokeWidth * 3.6;
    ctx.lineJoin = "round";
    lines.forEach((line, i) => {
      const x = (canvas.width * caption.x) / 100,
        y =
          (canvas.height * caption.y) / 100 +
          (i - (lines.length - 1) / 2) * size * 1.3;
      if (caption.strokeWidth) ctx.strokeText(line, x, y);
      else {
        ctx.shadowColor = "rgba(0,0,0,.5)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
      }
      ctx.fillText(line, x, y);
    });
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("The captioned image could not be created.");
  saveBlob(blob, assetFilename(asset).replace(/\.[^.]+$/, "-captioned.png"));
}
