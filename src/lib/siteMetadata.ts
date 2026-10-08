/** Shared by the published HTML and client navigation. Change SITE_URL when moving host. */
export const DEFAULT_SITE_URL = "https://steveblackboxapi.github.io/NEWFOAMHOME/";

export const PREVIEW_IMAGE = {
  path: "social/foam-preview-2026-09-30.webp",
  width: 1800,
  height: 973,
  type: "image/webp",
  alt: "Foam — Big talent. Small admin. A smiling creator on the talent management website.",
};

type PageMetadata = {
  title: string;
  description: string;
  canonicalPath?: string;
  indexable: boolean;
};

const managers = {
  title: "Foam | Talent management, media kits & creator discovery",
  description: "Bring your roster, creator content and connected audience data together. Build media kits, discover content and keep the pitch moving with Foam.",
  canonicalPath: "/",
};

const pages: Record<string, Omit<PageMetadata, "indexable">> = {
  "/": managers,
  "/managers": managers,
  "/kit-story": {
    title: "Foam | Big talent. Small admin.",
    description: "Give every creator a stronger introduction. See how Foam brings your roster, connected audience data and shareable media kits into the pitch.",
  },
  "/brands": {
    title: "Foam for brands & agencies | Find your creator fit",
    description: "Meet the creator, explore their work and understand the audience behind your next partnership. Find the context for a better collaboration with Foam.",
  },
  "/creators": {
    title: "Foam for creators | Your content starts the story",
    description: "Bring your content, connected accounts and audience into the same story. Help your manager give your next opportunity the context it deserves.",
  },
  "/features": {
    title: "Foam features | Rosters, media kits & content discovery",
    description: "Explore Foam's tools for rosters, media kits, content discovery and your inbox. Keep the people, work and audience context close as you build the pitch.",
  },
  "/about": {
    title: "About Foam | For the people behind the talent",
    description: "Meet the purpose behind Foam: giving talent managers the tools to turn a creator's potential into a conversation that matters.",
  },
  "/data-trust": {
    title: "Data & trust | Foam",
    description: "See how Foam brings connected account data, creator content and selected audience figures together to support a clearer introduction.",
  },
  "/updates": {
    title: "Inside Foam | Ideas, tools & a closer look",
    description: "The thinking behind a better pitch. Explore Foam's media kits, content discovery, stories and the people behind the product.",
  },
  "/demo": {
    title: "Meet Foam | Book a demo",
    description: "Talk to Foam about your roster, your workflow and your next pitch. See how creator content, audience data and media kits can work together.",
  },
  "/chrome-story": {
    title: "Foam for Chrome | Bring your roster to your inbox",
    description: "Find the right creator and add their profile while you write your reply. See how Foam for Chrome keeps the context close and the conversation moving.",
  },
};

const previews: Record<string, string> = {
  "/kit-transition-preview": "Media Kit transition test | Foam",
  "/home-film-preview": "Homepage film preview | Foam",
  "/inside-foam-preview": "Inside Foam preview | Foam",
  "/live-study": "A little more live — Concept preview | Foam",
  "/managers-home-preview": "Managers · Combined page test | Foam",
  "/kit-hero-preview": "Foam · Larger headline dev preview",
  "/mobile-hero-lab": "Foam · Mobile hero options",
  "/lab/inspo": "Inspiration | Foam Lab",
  "/lab/mini-ui": "The Foam miniatures | Foam",
  "/lab/data-trust": "Data & trust concepts | Foam",
};

export const PUBLIC_PAGE_PATHS = Object.keys(pages);
export const STATIC_PAGE_PATHS = [...PUBLIC_PAGE_PATHS, ...Object.keys(previews).filter(path => !["/managers-home-preview", "/kit-hero-preview", "/mobile-hero-lab"].includes(path))];

export function normalizeSiteUrl(input: string) {
  const url = new URL(input);
  if (!/^https?:$/.test(url.protocol) || url.username || url.password)
    throw new Error("SITE_URL must be a public HTTP(S) website address without credentials.");
  url.search = "";
  url.hash = "";
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url.href;
}

export function getPageMetadata(path: string): PageMetadata {
  const route = path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const page = pages[route];
  if (page) return { ...page, canonicalPath: page.canonicalPath ?? route, indexable: true };
  return {
    title: previews[route] || (route.startsWith("/lab/") ? "Foam Lab" : "Page not found | Foam"),
    description: "A Foam preview page.",
    indexable: false,
  };
}

type MetadataTag = { tag: "meta" | "link"; attrs: Record<string, string> };

export function metadataTags(path: string, siteUrl: string): MetadataTag[] {
  const page = getPageMetadata(path);
  const meta = (name: string, content: string): MetadataTag => ({ tag: "meta", attrs: { name, content } });
  const og = (property: string, content: string): MetadataTag => ({ tag: "meta", attrs: { property, content } });
  const tags = [
    meta("description", page.description),
    meta("robots", page.indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow"),
  ];
  if (!page.indexable) return tags;
  const base = normalizeSiteUrl(siteUrl);
  const canonical = new URL(page.canonicalPath === "/" ? "" : `${page.canonicalPath!.slice(1)}/`, base).href;
  const image = new URL(PREVIEW_IMAGE.path, base).href;
  return [
    ...tags,
    { tag: "link", attrs: { rel: "canonical", href: canonical } },
    og("og:type", "website"),
    og("og:site_name", "Foam"),
    og("og:locale", "en_GB"),
    og("og:title", page.title),
    og("og:description", page.description),
    og("og:url", canonical),
    og("og:image", image),
    og("og:image:type", PREVIEW_IMAGE.type),
    og("og:image:width", String(PREVIEW_IMAGE.width)),
    og("og:image:height", String(PREVIEW_IMAGE.height)),
    og("og:image:alt", PREVIEW_IMAGE.alt),
    meta("twitter:card", "summary_large_image"),
    meta("twitter:title", page.title),
    meta("twitter:description", page.description),
    meta("twitter:image", image),
    meta("twitter:image:alt", PREVIEW_IMAGE.alt),
  ];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
}

export function renderMetadata(path: string, siteUrl: string) {
  return [
    `<title data-foam-seo>${escapeHtml(getPageMetadata(path).title)}</title>`,
    ...metadataTags(path, siteUrl).map(({ tag, attrs }) =>
      `<${tag} data-foam-seo ${Object.entries(attrs).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(" ")} />`),
  ].join("\n    ");
}

export function replaceMetadata(html: string, path: string, siteUrl: string) {
  const region = /<!-- foam:metadata:start -->[\s\S]*?<!-- foam:metadata:end -->/;
  if (!region.test(html)) throw new Error("Missing Foam metadata markers in the HTML template.");
  return html.replace(region, () => `<!-- foam:metadata:start -->\n    ${renderMetadata(path, siteUrl)}\n    <!-- foam:metadata:end -->`);
}

export function renderSitemap(siteUrl: string) {
  const base = normalizeSiteUrl(siteUrl);
  const paths = new Set(PUBLIC_PAGE_PATHS.map(path => getPageMetadata(path).canonicalPath!));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths].map(path =>
    `  <url><loc>${escapeHtml(new URL(path === "/" ? "" : `${path.slice(1)}/`, base).href)}</loc></url>`).join("\n")}\n</urlset>\n`;
}
