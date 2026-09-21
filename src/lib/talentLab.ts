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
      title: `${talent.displayName} portrait`,
    },
    ...talent.content.map((tile, index) => ({
      id: `${talent.id}:${index}`,
      talent,
      index,
      src: tile.thumb,
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
    portrait: absolute(talent.portrait),
    motion: talent.motion ? absolute(talent.motion) : null,
    content: assetsFor(talent)
      .filter((a) => a.tile)
      .map((a) => ({
        ...a.tile,
        id: a.id,
        thumb: absolute(a.src),
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
export function assetFilename(asset: LabAsset) {
  return `${asset.talent.id}-${asset.index < 0 ? "portrait" : `content-${asset.index + 1}`}.${extension(asset.src)}`;
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

export async function downloadOriginal(asset: LabAsset) {
  const response = await fetch(asset.src);
  if (
    !response.ok ||
    !(response.headers.get("content-type") || "").startsWith("image/")
  )
    throw new Error("The original image could not be downloaded.");
  saveBlob(await response.blob(), assetFilename(asset));
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
  const jobs = assets.flatMap((a) => [
    { path: `${a.talent.id}/${assetFilename(a)}`, src: a.src },
    ...(a.tile?.video
      ? [
          {
            path: `${a.talent.id}/content-${a.index + 1}.${extension(a.tile.video)}`,
            src: a.tile.video,
          },
        ]
      : []),
  ]);
  for (const talent of talents) {
    if (talent.motion && talent.motionStatus === "ready")
      jobs.push({
        path: `${talent.id}/${talent.id}-motion.${extension(talent.motion)}`,
        src: talent.motion,
      });
  }
  let done = 0;
  // Four concurrent fetches keep large collections responsive without flooding requests.
  for (let offset = 0; offset < jobs.length; offset += 4) {
    await Promise.all(
      jobs.slice(offset, offset + 4).map(async (job) => {
        files[job.path] = await assetBytes(job.src);
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
    "Foam talent library\n\nThese are fictional demo characters and invented metrics.\nImages are original files. Caption drafts are included in talent-data.json and are not baked into these originals. Use Download with caption in the lab for a rendered image.\nA planned video has a thumbnail only; no video file exists yet.\n",
  );
  const zipped = zipSync(files, { level: 0 });
  saveBlob(new Blob([zipped as BlobPart], { type: "application/zip" }), name);
}

/** Render the same 9:16 crop and caption used by the asset editor, at export resolution. */
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
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable in this browser.");
  const scale = Math.max(
    canvas.width / image.width,
    canvas.height / image.height,
  );
  ctx.drawImage(
    image,
    (1080 - image.width * scale) / 2,
    (1920 - image.height * scale) / 2,
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
      const x = (1080 * caption.x) / 100,
        y =
          (1920 * caption.y) / 100 + (i - (lines.length - 1) / 2) * size * 1.3;
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
