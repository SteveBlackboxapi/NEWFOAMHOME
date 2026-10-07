import { useEffect } from "react";
import { useLocation } from "react-router";
import { A } from "../lib/assets";
import { waitForMediaCache } from "../lib/mediaCache";
import { isPublicImageWarmupRoute, startPageImageWarmup } from "../lib/pageImageWarmup";

export function usePageImageWarmup() {
  const { key, pathname } = useLocation();
  useEffect(() => {
    if (import.meta.env.VITE_PRIVATE_LAB === "true" || !isPublicImageWarmupRoute(pathname)) return;
    return startPageImageWarmup(A, waitForMediaCache);
  }, [key, pathname]);
}
