import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";

const privateLab = process.env.VITE_PRIVATE_LAB === "true";
// Match the running client to its published assets without relying on a cached
// HTML document or a Git commit (Lab image-only builds keep the same commit).
const websiteHash = createHash('sha256');
function hashDirectory(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) hashDirectory(filename);
    else websiteHash.update(filename).update(readFileSync(filename));
  }
}
hashDirectory('src');
for (const filename of ['index.html', 'vite.config.ts', 'package-lock.json', 'public/foam-media-sw.js'])
  websiteHash.update(filename).update(readFileSync(filename));
const websiteVersion = websiteHash.digest('hex');

export default defineConfig({
  define: { 'import.meta.env.VITE_WEBSITE_VERSION': JSON.stringify(websiteVersion) },
  base:
    !privateLab && process.env.GITHUB_PAGES === "true" ? "/NEWFOAMHOME/" : "/",
  publicDir: privateLab ? false : "public",
  build: { outDir: privateLab ? "dist-lab" : "dist" },
  plugins: [react(), tailwindcss(), {
    name: 'kit-opening-poster',
    generateBundle() {
      if (!privateLab) this.emitFile({ type: 'asset', fileName: 'website-version.json', source: JSON.stringify({ version: websiteVersion }) + '\n' });
    },
    transformIndexHtml() {
      if (privateLab) return [];
      const { revision } = JSON.parse(readFileSync(new URL('./src/data/imageVariants.json', import.meta.url), 'utf8'));
      const base = process.env.GITHUB_PAGES === 'true' ? '/NEWFOAMHOME/' : '/';
      const { replacements } = JSON.parse(readFileSync(new URL('./src/data/websitePlacementImages.json', import.meta.url), 'utf8'));
      const key = JSON.stringify(['assets/io-portrait-poster.webp', '/kit-story', 'Media Kit · Samantha portrait film']);
      const source = replacements[key] || 'assets/io-portrait-poster.webp';
      const poster = `${base}media/${revision}/${source}`;
      return [{ tag: 'script', injectTo: 'head' as const, children:
        `if(location.pathname.replace(/\\/$/,'').endsWith('/kit-story')){const l=document.createElement('link');l.rel='preload';l.as='image';l.fetchPriority='high';l.href=${JSON.stringify(poster)};document.head.appendChild(l);}`,
      }];
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
});
