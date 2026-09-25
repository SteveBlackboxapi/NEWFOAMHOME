import { build } from "vite";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
process.env.VITE_PRIVATE_LAB = "true";
await build();
const assets = {};
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filename);
    else {
      const ext = path.extname(filename);
      const contentType =
        {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".svg": "image/svg+xml",
          ".webp": "image/webp",
          ".png": "image/png",
          ".woff2": "font/woff2",
        }[ext] || "application/octet-stream";
      assets["/" + path.relative("dist-lab", filename)] = {
        body: gzipSync(await readFile(filename)).toString("base64"),
        contentType,
        encoding: "gzip",
      };
    }
  }
}
await walk("dist-lab");
// Ship only the reviewed Lab images with the private Worker. They must work
// immediately, including original downloads, before the public site is rebuilt.
const privatePhotographs = [
  "bode-shelf-install",
  "jax-synth-session",
  "suki-earbud-review",
];
const bundledPublicAssets = [
  ["/assets/brand/foam-logotype-white.svg", "image/svg+xml"],
  ...privatePhotographs.flatMap((name) => [
    [`/assets/talent/youtube-landscape-v1/${name}.webp`, "image/webp"],
    [`/assets/talent/youtube-landscape-v1/masters/${name}.png`, "image/png"],
  ]),
];
for (const [assetPath, contentType] of bundledPublicAssets) {
  assets[assetPath] = {
    body: gzipSync(await readFile(`public${assetPath}`)).toString("base64"),
    contentType,
    encoding: "gzip",
  };
}
await mkdir("workers/talent-lab", { recursive: true });
await writeFile(
  "workers/talent-lab/site-assets.mjs",
  "export default " + JSON.stringify(assets) + ";\n",
);
console.log(
  `Prepared ${Object.keys(assets).length} private Lab files, including reviewed landscape thumbnails and their originals. Other website images remain on their existing origin.`,
);
