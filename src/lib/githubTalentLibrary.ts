import { A } from "./assets";
import type { StagedTalent } from "../data/stagedTalent";

export const LIBRARY_REPO = "SteveBlackboxapi/NEWFOAMHOME";
export const LIBRARY_BRANCH = "content/talent-library";
export const LIBRARY_PATH = "public/assets/talent/library.json";
export const LIBRARY_REVIEW_URL = `https://github.com/${LIBRARY_REPO}/tree/${LIBRARY_BRANCH}/public/assets/talent`;
const API = `https://api.github.com/repos/${LIBRARY_REPO}`;
export const PRIVATE_LIBRARY = import.meta.env.VITE_PRIVATE_LAB === "true";
const SITE_ROOT = import.meta.env.BASE_URL.replace(/\/$/, "");
const UPLOAD_PATH = "public/assets/talent/uploads/";
export type LibraryManifest = {
  version: 1;
  profiles: StagedTalent[];
  removedTalentIds: string[];
  /** Explicit replacements only; legacy profile drafts are never publication instructions. */
  websiteReplacements?: Record<string, string>;
  /** One exact source/page/section placement; takes precedence over a global replacement. */
  websitePlacementReplacements?: Record<string, string>;
};
export type WebsitePublication = { revision: string; queued: boolean; published?: boolean; error?: string };
export type LibrarySnapshot = {
  manifest: LibraryManifest;
  revision: string | null;
  publication?: WebsitePublication;
};
export type LibraryUpload = { path: string; base64: string };
export const emptyLibrary = (): LibraryManifest => ({
  version: 1,
  profiles: [],
  removedTalentIds: [],
});

export class LibraryError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
async function request(
  path: string,
  token = "",
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(
    PRIVATE_LIBRARY ? `/api/github${path}` : `${API}${path}`,
    {
      method,
      cache: "no-store",
      ...(PRIVATE_LIBRARY ? { credentials: "same-origin" as const } : {}),
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        ...(!PRIVATE_LIBRARY && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  if (!response.ok) {
    const message =
      response.status === 401
        ? PRIVATE_LIBRARY
          ? "Unlock the private library to continue."
          : "GitHub did not recognise that access key."
        : response.status === 403
          ? "GitHub denied access or its request limit was reached. Check this repository has Contents read and write permission."
          : response.status === 409 || response.status === 422
            ? "The library changed on GitHub. Refresh it before saving again."
            : `GitHub could not complete the request (${response.status}). Please try again.`;
    throw new LibraryError(message, response.status);
  }
  return response.status === 204 ? null : response.json();
}
async function privateSessionRequest(
  path: string,
  method = "GET",
  body?: unknown,
) {
  const response = await fetch(`/api/${path}`, {
    method,
    cache: "no-store",
    credentials: "same-origin",
    ...(body
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (!response.ok)
    throw new LibraryError(
      response.status === 401
        ? "Unlock the private library to continue."
        : "The private library could not complete the request. Please try again.",
      response.status,
    );
  return response.json();
}
/** Private deployments use a session cookie; local access keys remain in memory only. */
export async function githubLibraryConnection(): Promise<boolean> {
  if (!PRIVATE_LIBRARY) return false;
  try {
    return (await privateSessionRequest("status")).connected === true;
  } catch (error) {
    if (error instanceof LibraryError && error.status === 401) return false;
    throw error;
  }
}

/** Only repository assets are accepted; remote manifests cannot introduce external URLs. */
export function assetPath(src: string): string {
  const prefix = `https://raw.githubusercontent.com/${LIBRARY_REPO}/`;
  if (typeof src !== "string")
    throw new LibraryError("Unrecognised library asset path.");
  let value = src;
  if (value.startsWith("/api/asset?")) {
    const url = new URL(value, "https://library.invalid");
    const path = url.searchParams.get("path");
    if (
      !path?.startsWith("assets/talent/uploads/") ||
      !/^[a-f0-9]{40}$/.test(url.searchParams.get("ref") || "") ||
      [...url.searchParams.keys()].sort().join(",") !== "path,ref"
    )
      throw new LibraryError("Unrecognised library asset path.");
    value = path;
  }
  if (value.startsWith(prefix)) {
    const at = value.indexOf("/public/", prefix.length);
    if (at < 0) throw new LibraryError("Unrecognised library image path.");
    value = value.slice(at + "/public".length);
  }
  if (value.startsWith(`${A}/`)) value = `assets/${value.slice(A.length + 1)}`;
  if (SITE_ROOT && value.startsWith(`${SITE_ROOT}/`))
    value = value.slice(SITE_ROOT.length + 1);
  value = value.replace(/^public\//, "").replace(/^\/(?!\/)/, "");
  if (
    !/^(?:assets\/[a-zA-Z0-9_./ -]+|ideas-two\/(?:assets\/[a-zA-Z0-9_./ -]+|README\.md))$/.test(
      value,
    ) ||
    value.split("/").some((part) => !part || part === "." || part === "..")
  )
    throw new LibraryError("Unrecognised library asset path.");
  return value;
}
/** Select schema fields so access keys and other imported metadata never enter a saved/exported catalogue. */
function fields<T extends object>(value: T, keys: readonly (keyof T)[]): T {
  return Object.fromEntries(
    keys
      .filter((key) => value[key] !== undefined)
      .map((key) => [key, value[key]]),
  ) as T;
}
function mapSources(
  profile: StagedTalent,
  convert: (src: string) => string,
): StagedTalent {
  return {
    ...fields(profile, [
      "provenance",
      "id",
      "displayName",
      "age",
      "gender",
      "location",
      "bio",
      "verticals",
      "platforms",
      "totalAudience",
      "portrait",
      "originalPortrait",
      "referenceImages",
      "creativeDirection",
      "motion",
      "motionStatus",
      "content",
    ]),
    platforms: profile.platforms.map((p) =>
      fields(p, ["network", "handle", "followers"]),
    ),
    portrait: convert(profile.portrait),
    originalPortrait: profile.originalPortrait
      ? convert(profile.originalPortrait)
      : undefined,
    motion: profile.motion ? convert(profile.motion) : null,
    referenceImages: profile.referenceImages?.map((r) => ({
      ...fields(r, ["label", "src"]),
      src: convert(r.src),
    })),
    creativeDirection: profile.creativeDirection
      ? {
          ...fields(profile.creativeDirection, [
            "summary",
            "identityNotes",
            "motionBrief",
            "promptFile",
          ]),
          promptFile: profile.creativeDirection.promptFile
            ? convert(profile.creativeDirection.promptFile)
            : undefined,
        }
      : undefined,
    content: profile.content.map((tile, index) => ({
      ...fields(tile, [
        "provenance",
        "id",
        "type",
        "thumb",
        "aspectRatio",
        "original",
        "generation",
        "video",
        "views",
        "caption",
        "captionSettings",
        "platform",
        "strongKind",
        "engagements",
      ]),
      // Preserve legacy numeric bookmark/caption keys when a tile is removed or reordered.
      id: tile.id ?? String(index),
      thumb: convert(tile.thumb),
      original: tile.original ? convert(tile.original) : undefined,
      video: tile.video ? convert(tile.video) : undefined,
      captionSettings: tile.captionSettings
        ? fields(tile.captionSettings, [
            "visible",
            "text",
            "y",
            "x",
            "font",
            "size",
            "fill",
            "stroke",
            "strokeWidth",
            "weight",
            "italic",
            "uppercase",
            "align",
            "background",
            "backgroundColor",
            "backgroundOpacity",
            "padding",
            "radius",
          ])
        : undefined,
      generation: tile.generation
        ? {
            ...fields(tile.generation, ["version", "approach", "prompt"]),
            prompt: tile.generation.prompt
              ? convert(tile.generation.prompt)
              : undefined,
          }
        : undefined,
    })),
  };
}
export function canonicalProfile(profile: StagedTalent) {
  return mapSources(profile, assetPath);
}
const optionalString = (value: unknown) =>
  value === undefined || typeof value === "string";
const validProvenance = (value: unknown) =>
  value === undefined ||
  ["ai-generated", "uploaded", "reference"].includes(value as string);
function validCaption(input: unknown): boolean {
  if (input === undefined) return true;
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const caption = input as Record<string, unknown>;
  const optional = (key: string, valid: (value: unknown) => boolean) =>
    caption[key] === undefined || valid(caption[key]);
  return (
    optional("text", (value) => typeof value === "string") &&
    ["visible", "italic", "uppercase"].every((key) =>
      optional(key, (value) => typeof value === "boolean"),
    ) &&
    [
      "x",
      "y",
      "size",
      "strokeWidth",
      "backgroundOpacity",
      "padding",
      "radius",
    ].every((key) =>
      optional(
        key,
        (value) => typeof value === "number" && Number.isFinite(value),
      ),
    ) &&
    ["fill", "stroke", "backgroundColor"].every((key) =>
      optional(
        key,
        (value) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value),
      ),
    ) &&
    optional("weight", (value) => [400, 600, 800].includes(value as number)) &&
    optional("font", (value) =>
      [
        "founders",
        "sf",
        "georgia",
        "mono",
        "anton",
        "bebas",
        "dm-serif",
        "caveat",
      ].includes(value as string),
    ) &&
    optional("align", (value) =>
      ["left", "center", "right"].includes(value as string),
    ) &&
    optional("background", (value) =>
      ["none", "box", "highlight"].includes(value as string),
    )
  );
}
export function parseWebsiteReplacements(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new LibraryError("The website image replacements have an unsupported format.");
  const entries = Object.entries(input);
  if (entries.length > 1000)
    throw new LibraryError("The website image replacement list is too large.");
  for (const [source, replacement] of entries) {
    if (
      assetPath(source) !== source ||
      !/^assets\/.+\.(?:png|jpe?g|webp)$/.test(source) ||
      source.startsWith("assets/talent/uploads/") ||
      typeof replacement !== "string" ||
      !/^assets\/talent\/uploads\/[a-z0-9-]+\.(?:png|jpg|webp)$/.test(replacement)
    ) throw new LibraryError("Unrecognised website image replacement.");
  }
  return Object.fromEntries(entries) as Record<string, string>;
}
/** Stable across public base paths and repeated replacements; never use an uploaded preview as source. */
export function websitePlacementKey(source: string, route: string, section: string): string {
  return JSON.stringify([assetPath(source), route, section]);
}
export function parseWebsitePlacementReplacements(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length > 3000)
    throw new LibraryError("The website placement replacements have an unsupported format.");
  const entries = Object.entries(input);
  for (const [key, replacement] of entries) {
    let placement: unknown;
    try { placement = JSON.parse(key); } catch { /* Reject malformed tuple keys below. */ }
    if (!Array.isArray(placement) || placement.length !== 3 || !placement.every((value) => typeof value === "string") ||
      JSON.stringify(placement) !== key)
      throw new LibraryError("Unrecognised website image placement.");
    const [source, route, section] = placement as string[];
    if (route.length > 200 || !route.startsWith("/") || /[^a-zA-Z0-9/_-]/.test(route) || route.includes("//") ||
      !section.trim() || section.length > 200 || /[\u0000-\u001f\u007f\u2028\u2029]/.test(source + section + replacement))
      throw new LibraryError("Unrecognised website image placement.");
    parseWebsiteReplacements({ [source]: replacement });
  }
  return Object.fromEntries(entries) as Record<string, string>;
}
export function withWebsiteImageReplacement(manifest: LibraryManifest, source: string, replacement: string): LibraryManifest {
  const canonical = assetPath(source);
  const global = parseWebsiteReplacements({ [canonical]: replacement });
  return {
    ...manifest,
    websiteReplacements: { ...manifest.websiteReplacements, ...global },
    ...(manifest.websitePlacementReplacements === undefined ? {} : {
      websitePlacementReplacements: Object.fromEntries(Object.entries(manifest.websitePlacementReplacements)
        .filter(([key]) => JSON.parse(key)[0] !== canonical)),
    }),
  };
}
export function withWebsitePlacementReplacement(manifest: LibraryManifest, source: string, route: string, section: string, replacement: string): LibraryManifest {
  const placement = parseWebsitePlacementReplacements({ [websitePlacementKey(source, route, section)]: replacement });
  return { ...manifest, websitePlacementReplacements: { ...manifest.websitePlacementReplacements, ...placement } };
}
export function parseLibrary(input: unknown): LibraryManifest {
  const value = input as LibraryManifest;
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.profiles) ||
    !Array.isArray(value.removedTalentIds) ||
    value.profiles.length > 500
  )
    throw new LibraryError("The library file has an unsupported format.");
  const ids = new Set<string>();
  for (const profile of value.profiles) {
    if (
      !profile ||
      typeof profile.id !== "string" ||
      !/^[a-z0-9-]+$/.test(profile.id) ||
      ids.has(profile.id) ||
      typeof profile.displayName !== "string" ||
      !profile.displayName.trim() ||
      profile.displayName.length > 100 ||
      typeof profile.bio !== "string" ||
      typeof profile.location !== "string" ||
      !Number.isFinite(profile.age) ||
      !Number.isFinite(profile.totalAudience) ||
      !Array.isArray(profile.verticals) ||
      !profile.verticals.every((v) => typeof v === "string") ||
      !Array.isArray(profile.platforms) ||
      !Array.isArray(profile.content) ||
      profile.content.length > 500
    )
      throw new LibraryError("The library contains an invalid profile.");
    if (
      typeof profile.portrait !== "string" ||
      !optionalString(profile.gender) ||
      !optionalString(profile.originalPortrait) ||
      !validProvenance(profile.provenance) ||
      !["placeholder", "ready"].includes(profile.motionStatus) ||
      (profile.motion !== null && typeof profile.motion !== "string") ||
      profile.age < 0 ||
      profile.totalAudience < 0 ||
      profile.platforms.some(
        (p) =>
          !p ||
          !["instagram", "tiktok", "youtube", "twitch", "linkedin"].includes(
            p.network,
          ) ||
          typeof p.handle !== "string" ||
          !Number.isFinite(p.followers) ||
          p.followers < 0,
      ) ||
      (profile.referenceImages !== undefined &&
        (!Array.isArray(profile.referenceImages) ||
          profile.referenceImages.some(
            (r) =>
              !r || typeof r.label !== "string" || typeof r.src !== "string",
          ))) ||
      (profile.creativeDirection !== undefined &&
        (!profile.creativeDirection ||
          typeof profile.creativeDirection.summary !== "string" ||
          !Array.isArray(profile.creativeDirection.identityNotes) ||
          !profile.creativeDirection.identityNotes.every(
            (n) => typeof n === "string",
          ) ||
          !optionalString(profile.creativeDirection.motionBrief) ||
          !optionalString(profile.creativeDirection.promptFile)))
    )
      throw new LibraryError("The library contains an invalid profile.");
    ids.add(profile.id);
    const tileIds = new Set<string>();
    for (const [index, tile] of profile.content.entries()) {
      if (
        !tile ||
        !["still", "clip"].includes(tile.type) ||
        !["instagram", "tiktok", "youtube"].includes(tile.platform) ||
        typeof tile.thumb !== "string" ||
        (tile.id !== undefined &&
          (typeof tile.id !== "string" || !tile.id || tileIds.has(tile.id)))
      )
        throw new LibraryError("The library contains an invalid image record.");
      if (
        !["photo", "hashtag", "link", "question"].includes(tile.strongKind) ||
        !validProvenance(tile.provenance) ||
        !optionalString(tile.original) ||
        !optionalString(tile.video) ||
        !validCaption(tile.captionSettings) ||
        (tile.caption !== undefined && typeof tile.caption !== "string") ||
        (tile.aspectRatio !== undefined &&
          !["9/16", "4/5", "16/9"].includes(tile.aspectRatio)) ||
        [tile.views, tile.engagements].some(
          (n) => n !== undefined && (!Number.isFinite(n) || n < 0),
        ) ||
        (tile.generation !== undefined &&
          (!tile.generation ||
            typeof tile.generation.version !== "string" ||
            typeof tile.generation.approach !== "string" ||
            !optionalString(tile.generation.prompt)))
      )
        throw new LibraryError("The library contains an invalid image record.");
      const id = tile.id ?? String(index);
      if (tileIds.has(id))
        throw new LibraryError(
          "The library contains a duplicate image record.",
        );
      tileIds.add(id);
    }
    canonicalProfile(profile);
  }
  if (
    !value.removedTalentIds.every(
      (id) => typeof id === "string" && /^[a-z0-9-]+$/.test(id),
    )
  )
    throw new LibraryError("The library contains an invalid removed profile.");
  return {
    version: 1,
    profiles: value.profiles.map(canonicalProfile),
    removedTalentIds: [...new Set(value.removedTalentIds)],
    ...(value.websiteReplacements === undefined ? {} : {
      websiteReplacements: parseWebsiteReplacements(value.websiteReplacements),
    }),
    ...(value.websitePlacementReplacements === undefined ? {} : {
      websitePlacementReplacements: parseWebsitePlacementReplacements(value.websitePlacementReplacements),
    }),
  };
}
export function materializeLibrary(
  base: StagedTalent[],
  manifest: LibraryManifest,
  revision: string | null,
  pending: Record<string, string> = {},
): StagedTalent[] {
  const convert = (src: string) => materializeLibraryImage(src, revision, pending);
  const overrides = new Map(
    manifest.profiles.map((p) => [p.id, mapSources(p, convert)]),
  );
  return [
    ...base.map((p) => overrides.get(p.id) || mapSources(p, convert)),
    ...manifest.profiles
      .filter((p) => !base.some((b) => b.id === p.id))
      .map((p) => overrides.get(p.id)!),
  ].filter((p) => !manifest.removedTalentIds.includes(p.id));
}
/** The sitemap and library share the same pending-preview and immutable-image resolution. */
export function materializeLibraryImage(
  src: string,
  revision: string | null,
  pending: Record<string, string> = {},
): string {
  const path = assetPath(src);
  return pending[path] ||
    (path.startsWith("assets/talent/uploads/") && revision
      ? PRIVATE_LIBRARY
        ? `/api/asset?path=${encodeURIComponent(path)}&ref=${encodeURIComponent(revision)}`
        : `https://raw.githubusercontent.com/${LIBRARY_REPO}/${revision}/public/${path}`
      : `${SITE_ROOT}/${path}`);
}
export async function readGithubLibrary(token = ""): Promise<LibrarySnapshot> {
  let ref;
  try {
    ref = await request(`/git/ref/heads/${LIBRARY_BRANCH}`, token);
  } catch (e) {
    if (e instanceof LibraryError && e.status === 404)
      return { manifest: emptyLibrary(), revision: null };
    throw e;
  }
  const revision = ref.object.sha as string;
  try {
    const file = await request(
      `/contents/${LIBRARY_PATH}?ref=${revision}`,
      token,
    );
    if (file.encoding !== "base64" || typeof file.content !== "string")
      throw new LibraryError("The library file could not be read.");
    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, "")), (c) =>
      c.charCodeAt(0),
    );
    return {
      revision,
      manifest: parseLibrary(JSON.parse(new TextDecoder().decode(bytes))),
    };
  } catch (e) {
    if (e instanceof LibraryError && e.status === 404)
      return { manifest: emptyLibrary(), revision };
    throw e;
  }
}
export async function verifyGithubAccess(token: string) {
  if (PRIVATE_LIBRARY) {
    await privateSessionRequest("connect", "POST", { token });
    return;
  }
  const repo = await request("", token);
  if (!repo.permissions?.push)
    throw new LibraryError(
      "This GitHub account cannot write to the Foam repository.",
    );
}
function uploadedPaths(manifest: LibraryManifest): Set<string> {
  const paths = new Set<string>();
  Object.values(manifest.websiteReplacements || {}).forEach((src) =>
    paths.add(`public/${src}`),
  );
  Object.values(manifest.websitePlacementReplacements || {}).forEach((src) =>
    paths.add(`public/${src}`),
  );
  manifest.profiles
    .filter((p) => !manifest.removedTalentIds.includes(p.id))
    .forEach((p) =>
      mapSources(p, (src) => {
        const path = `public/${assetPath(src)}`;
        if (path.startsWith(UPLOAD_PATH)) paths.add(path);
        return src;
      }),
    );
  return paths;
}
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
function validateUploads(uploads: LibraryUpload[]): Map<string, LibraryUpload> {
  const result = new Map<string, LibraryUpload>();
  for (const upload of uploads) {
    const ext =
      upload &&
      typeof upload.path === "string" &&
      /^public\/assets\/talent\/uploads\/[a-z0-9-]+\.(png|jpg|webp)$/.exec(
        upload.path,
      )?.[1];
    if (
      !ext ||
      typeof upload.base64 !== "string" ||
      !upload.base64.length ||
      upload.base64.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 ||
      upload.base64.length % 4 !== 0 ||
      /[^A-Za-z0-9+/=]/.test(upload.base64)
    )
      throw new LibraryError(
        "Invalid upload. Choose a PNG, JPEG or WebP under 10 MB.",
      );
    let binary: string;
    try {
      binary = atob(upload.base64);
    } catch {
      throw new LibraryError("Invalid image encoding. Add the image again.");
    }
    const bytes = Array.from(binary.slice(0, 12), (c) => c.charCodeAt(0));
    const recognised =
      ext === "png"
        ? [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
        : ext === "jpg"
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : binary.slice(0, 4) === "RIFF" && binary.slice(8, 12) === "WEBP";
    if (
      !recognised ||
      binary.length > MAX_IMAGE_BYTES ||
      result.has(upload.path)
    )
      throw new LibraryError(
        "Invalid or duplicate image upload. Choose a PNG, JPEG or WebP under 10 MB.",
      );
    result.set(upload.path, upload);
  }
  return result;
}
/** One non-forced commit: files and catalogue move together; stale editors cannot overwrite newer changes. */
export async function saveGithubLibrary(
  token: string,
  previous: LibrarySnapshot,
  input: LibraryManifest,
  uploads: LibraryUpload[],
): Promise<LibrarySnapshot> {
  if (!PRIVATE_LIBRARY && !token.trim())
    throw new LibraryError("Connect GitHub before saving.");
  const manifest = parseLibrary(input);
  // Keep the catalogue readable by the GitHub Contents JSON/base64 response.
  const catalogue = JSON.stringify(manifest, null, 2) + "\n";
  if (new TextEncoder().encode(catalogue).byteLength > 1_000_000)
    throw new LibraryError(
      "This catalogue is too large to save. Reduce long profile text or remove unused records before trying again.",
    );
  const validatedUploads = validateUploads(uploads);
  const current = await readGithubLibrary(token);
  if (current.revision !== previous.revision)
    throw new LibraryError(
      "Someone saved a newer library. Refresh before saving; your draft is still open.",
      409,
    );
  const needed = uploadedPaths(manifest);
  const existing = uploadedPaths(current.manifest);
  for (const path of needed)
    if (!existing.has(path) && !validatedUploads.has(path))
      throw new LibraryError(
        "An uploaded image is missing. Add it again before saving.",
      );
  for (const path of validatedUploads.keys())
    if (existing.has(path))
      throw new LibraryError(
        "An uploaded image already exists. Add it again to use a new filename.",
      );
  let parent = current.revision;
  if (!parent) {
    const main = await request("/git/ref/heads/main", token);
    parent = main.object.sha as string;
  }
  const parentCommit = await request(`/git/commits/${parent}`, token);
  const tree: {
    path: string;
    mode: string;
    type: string;
    sha?: string | null;
    content?: string;
  }[] = [];
  for (const upload of [...validatedUploads.values()].filter((u) =>
    needed.has(u.path),
  )) {
    const blob = await request("/git/blobs", token, "POST", {
      content: upload.base64,
      encoding: "base64",
    });
    tree.push({
      path: upload.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }
  for (const path of uploadedPaths(current.manifest))
    if (!needed.has(path))
      tree.push({ path, mode: "100644", type: "blob", sha: null });
  tree.push({
    path: LIBRARY_PATH,
    mode: "100644",
    type: "blob",
    content: catalogue,
  });
  const resultTree = await request("/git/trees", token, "POST", {
    base_tree: parentCommit.tree.sha,
    tree,
  });
  const commit = await request("/git/commits", token, "POST", {
    message: "Update Foam talent library drafts",
    tree: resultTree.sha,
    parents: [parent],
  });
  let saved;
  if (current.revision)
    saved = await request(`/git/refs/heads/${LIBRARY_BRANCH}`, token, "PATCH", {
      sha: commit.sha,
      force: false,
    });
  else
    saved = await request("/git/refs", token, "POST", {
      ref: `refs/heads/${LIBRARY_BRANCH}`,
      sha: commit.sha,
    });
  const publication = PRIVATE_LIBRARY ? saved?.publication : undefined;
  return {
    manifest,
    revision: commit.sha,
    ...(publication ? { publication } : {}),
  };
}
/** A retry publishes only the saved current revision, never the editor's unsaved draft. */
export async function retryWebsitePublication(revision: string, token = ""): Promise<WebsitePublication> {
  if (!/^[a-f0-9]{40}$/.test(revision))
    throw new LibraryError("Save the library before publishing its replacements.");
  if (PRIVATE_LIBRARY) return privateSessionRequest("publish", "POST", { revision });
  const latest = await readGithubLibrary(token);
  if (latest.revision !== revision)
    throw new LibraryError("The library changed. Refresh before publishing.", 409);
  await request("/dispatches", token, "POST", {
    event_type: "talent-library-saved",
    client_payload: { libraryRevision: revision },
  });
  return { revision, queued: true };
}
export async function readWebsitePublication(): Promise<string | null> {
  if (!PRIVATE_LIBRARY) return null;
  const value = await privateSessionRequest("publication");
  return /^[a-f0-9]{40}$/.test(value.revision || "") ? value.revision : null;
}
export async function prepareLibraryImage(file: File): Promise<{
  upload: LibraryUpload;
  src: string;
  preview: string;
  ratio: "9/16" | "4/5" | "16/9";
  name: string;
}> {
  const ext = (
    { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<
      string,
      string
    >
  )[file.type];
  if (!ext || !file.size || file.size > 10 * 1024 * 1024)
    throw new LibraryError("Choose PNG, JPEG or WebP images up to 10 MB each.");
  const bitmap = await createImageBitmap(file);
  const ratio = bitmap.width / bitmap.height;
  if (
    !bitmap.width ||
    !bitmap.height ||
    bitmap.width * bitmap.height > 60_000_000
  ) {
    bitmap.close();
    throw new LibraryError("Choose an image smaller than 60 megapixels.");
  }
  bitmap.close();
  const buffer = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buffer.length; i += 8192)
    binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
  const base64 = btoa(binary);
  const path = `${UPLOAD_PATH}${crypto.randomUUID()}.${ext}`;
  validateUploads([{ path, base64 }]);
  return {
    upload: { path, base64 },
    src: path.slice("public/".length),
    preview: `data:${file.type};base64,${base64}`,
    ratio: ratio > 1.2 ? "16/9" : ratio < 0.68 ? "9/16" : "4/5",
    name: file.name.replace(/\.[^.]+$/, ""),
  };
}
