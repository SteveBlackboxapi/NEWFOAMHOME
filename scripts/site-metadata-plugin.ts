import type { Plugin, ResolvedConfig } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { STATIC_PAGE_PATHS, replaceMetadata, renderSitemap } from "../src/lib/siteMetadata.ts";

/** Link crawlers receive metadata in the initial HTML, without running React. */
export function siteMetadataPlugin(siteUrl: string, privateLab: boolean): Plugin {
  let config: ResolvedConfig;
  return {
    name: "foam-site-metadata",
    configResolved(resolved) { config = resolved; },
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        const page = privateLab ? "/lab/talent" : config.command === "build" ? "/" : context.path.replace(/^\/index\.html$/, "/");
        return replaceMetadata(html, page, siteUrl);
      },
    },
    async closeBundle() {
      if (config.command !== "build" || privateLab) return;
      const output = path.resolve(config.root, config.build.outDir);
      const template = await readFile(path.join(output, "index.html"), "utf8");
      for (const route of STATIC_PAGE_PATHS.filter(route => route !== "/")) {
        const directory = path.join(output, route.slice(1));
        await mkdir(directory, { recursive: true });
        await writeFile(path.join(directory, "index.html"), replaceMetadata(template, route, siteUrl));
      }
      await writeFile(path.join(output, "404.html"), replaceMetadata(template, "/404", siteUrl));
      await writeFile(path.join(output, "sitemap.xml"), renderSitemap(siteUrl));
    },
  };
}
