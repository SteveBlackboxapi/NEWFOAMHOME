import { useEffect } from "react";
import { useLocation } from "react-router";
import { DEFAULT_SITE_URL, getPageMetadata, metadataTags } from "../lib/siteMetadata";

/** Keep client-side navigation consistent with each route's published HTML. */
export function SiteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = getPageMetadata(pathname).title;
    document.head.querySelectorAll("meta[data-foam-seo], link[data-foam-seo]").forEach(node => node.remove());
    for (const { tag, attrs } of metadataTags(pathname, import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL)) {
      const element = document.createElement(tag);
      element.setAttribute("data-foam-seo", "");
      for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
      document.head.appendChild(element);
    }
  }, [pathname]);
  return null;
}
