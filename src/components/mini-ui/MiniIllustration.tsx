import { useEffect, useRef, type ComponentType } from "react";
import { AIDisclosure } from "../AIDisclosure";
import { MiniChromeScene } from "./MiniChromeScene";
import {
  MiniSearch,
  MiniShortlist,
  MiniRoster,
  MiniSavedContent,
} from "./MiniDiscoveryScenes";
import {
  MiniInbox,
  MiniShare,
  MiniNotes,
  MiniPermissions,
} from "./MiniWorkflowScenes";
import {
  MiniKit,
  MiniAnalytics,
  MiniWatchlist,
  MiniConnections,
} from "./MiniDetailScenes";
import "./mini-illustrations.css";

const illustrations = {
  kit: {
    scene: MiniKit,
    tint: "lilac",
    label:
      "A small Foam media kit with Samantha’s profile, audience figures and a ready-to-share badge.",
  },
  search: {
    scene: MiniSearch,
    tint: "blue",
    label:
      "A content search in Foam with three fictional creators and a matching search result.",
  },
  shortlist: {
    scene: MiniShortlist,
    tint: "sage",
    label:
      "Three fictional creators collected into a Foam shortlist, ready to share.",
  },
  inbox: {
    scene: MiniInbox,
    tint: "cream",
    label:
      "The Foam extension beside an email, with a creator profile ready to copy into a reply.",
  },
  chrome: {
    scene: MiniChromeScene,
    tint: "blue",
    label:
      "Foam for Chrome: a small email window beside the Foam extension, with Samantha’s fictional profile ready to copy and a Chrome Web Store badge.",
  },
  analytics: {
    scene: MiniAnalytics,
    tint: "blue",
    label:
      "Illustrative audience figures, a growth chart and audience insights in Foam.",
  },
  share: {
    scene: MiniShare,
    tint: "pink",
    label:
      "A creator’s media kit with its share link copied and ready to send.",
  },
  roster: {
    scene: MiniRoster,
    tint: "cream",
    label: "A Foam roster bringing three fictional creator profiles together.",
  },
  watchlist: {
    scene: MiniWatchlist,
    tint: "sage",
    label:
      "A watchlist of fictional creators to keep in view for future opportunities.",
  },
  notes: {
    scene: MiniNotes,
    tint: "butter",
    label: "A team note alongside a fictional creator’s Foam profile.",
  },
  saved: {
    scene: MiniSavedContent,
    tint: "lilac",
    label: "Creator content saved into a small Foam collection.",
  },
  connections: {
    scene: MiniConnections,
    tint: "blue",
    label:
      "Content, profile, audience and performance information connected in Foam.",
  },
  permissions: {
    scene: MiniPermissions,
    tint: "sage",
    label:
      "An illustrative account-permissions panel showing audience and content access.",
  },
};
export type MiniIllustrationKind = keyof typeof illustrations;

export function MiniCanvas({
  scene: Scene,
  tint,
  label,
}: {
  scene: ComponentType;
  tint: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () =>
      el.style.setProperty("--mini-scale", String(el.clientWidth / 560));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`mui-art mui-tint-${tint}`}
      role="img"
      aria-label={label}
    >
      <div className="mui-stage" aria-hidden="true">
        <Scene />
      </div>
    </div>
  );
}

/** A decorative product illustration: the real CTA lives beside the artwork. */
export function MiniIllustration({
  kind,
  className = "",
  disclosure = true,
  label,
}: {
  kind: MiniIllustrationKind;
  className?: string;
  disclosure?: boolean;
  label?: string;
}) {
  const artwork = illustrations[kind];
  return (
    <figure className={`foam-mini ${className}`.trim()} data-miniature={kind}>
      <MiniCanvas
        scene={artwork.scene}
        tint={artwork.tint}
        label={label ?? artwork.label}
      />
      {disclosure && (
        <figcaption>
          <AIDisclosure detail="Fictional creators · Illustrative UI" />
        </figcaption>
      )}
    </figure>
  );
}
