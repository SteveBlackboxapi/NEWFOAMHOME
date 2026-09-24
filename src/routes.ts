import { createBrowserRouter } from "react-router";
import { NavigationLayout, Root } from "./Root";
import { Home } from "./pages/Home";
import { Managers } from "./pages/Managers";
import { Brands } from "./pages/Brands";
import { Features } from "./pages/Features";
import { About } from "./pages/About";
import { Creators } from "./pages/Creators";
import { Updates } from "./pages/Updates";
import { Demo } from "./pages/Demo";
import { KitStory } from "./pages/KitStory";
import { ChromeStory } from "./pages/ChromeStory";
import { LabInspo } from "./pages/LabInspo";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter(
  [
    {
      Component: NavigationLayout,
      children: [
        { path: "kit-story", Component: KitStory },
        { path: "chrome-story", Component: ChromeStory },
        {
          path: "live-study",
          HydrateFallback: () => null,
          lazy: async () => ({
            Component: (await import("./pages/LiveStudy")).LiveStudy,
          }),
        },
        {
          path: "data-trust",
          HydrateFallback: () => null,
          lazy: async () => ({
            Component: (await import("./pages/DataTrust")).DataTrust,
          }),
        },
        { path: "lab/inspo", Component: LabInspo },
        {
          path: "lab/data-trust/:option?",
          HydrateFallback: () => null,
          lazy: async () => ({
            Component: (await import("./pages/TrustConcepts")).TrustConcepts,
          }),
        },
        {
          path: "lab/mini-ui",
          HydrateFallback: () => null,
          lazy: async () => ({
            Component: (await import("./pages/MiniUI")).MiniUI,
          }),
        },
        ...(import.meta.env.DEV || import.meta.env.VITE_PRIVATE_LAB === "true"
          ? [
              {
                path: "lab/talent",
                HydrateFallback: () => null,
                lazy: async () => ({
                  Component: (await import("./pages/LabTalent")).LabTalent,
                }),
              },
            ]
          : []),
        {
          path: "/",
          Component: Root,
          children: [
            { index: true, Component: Home },
            { path: "managers", Component: Managers },
            { path: "brands", Component: Brands },
            { path: "features", Component: Features },
            { path: "about", Component: About },
            { path: "creators", Component: Creators },
            { path: "updates", Component: Updates },
            { path: "demo", Component: Demo },
            { path: "*", Component: NotFound },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
