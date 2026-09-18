import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { Managers } from "./pages/Managers";
import { Brands } from "./pages/Brands";
import { Features } from "./pages/Features";
import { About } from "./pages/About";
import { Creators } from "./pages/Creators";
import { DataTrust } from "./pages/DataTrust";
import { Updates } from "./pages/Updates";
import { Demo } from "./pages/Demo";
import { KitStory } from "./pages/KitStory";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter(
  [
    { path: "kit-story", Component: KitStory },
    {
      path: "/",
      Component: Root,
      children: [
        { index: true, Component: Home },
        { path: "managers",   Component: Managers  },
        { path: "brands",     Component: Brands    },
        { path: "features",   Component: Features  },
        { path: "about",      Component: About     },
        { path: "creators",   Component: Creators  },
        { path: "data-trust", Component: DataTrust },
        { path: "updates",    Component: Updates   },
        { path: "demo",       Component: Demo      },
        { path: "*",          Component: NotFound  },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);
