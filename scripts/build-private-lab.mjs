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
assets["/assets/brand/foam-logotype-white.svg"] = {
  body: gzipSync(
    await readFile("public/assets/brand/foam-logotype-white.svg"),
  ).toString("base64"),
  contentType: "image/svg+xml",
  encoding: "gzip",
};
await mkdir("workers/talent-lab", { recursive: true });
await writeFile(
  "workers/talent-lab/site-assets.mjs",
  "export default " + JSON.stringify(assets) + ";\n",
);
console.log(
  `Prepared ${Object.keys(assets).length} private Lab files. Website image files remain on their existing origin.`,
);
