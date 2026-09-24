import type { ReactNode } from "react";
import { A, img } from "../../lib/assets";

export type MiniPerson = "samantha" | "aria" | "nia" | "elise";
const photos: Record<MiniPerson, string> = {
  samantha: "talent/samantha-pikka-v2/samantha-pikka-v2-portrait.webp",
  aria: "talent/aria-quen-v2/aria-quen-v2-portrait.webp",
  nia: "talent/nia-brooks/nia-brooks-profile.webp",
  elise: "talent/elise-morgan/elise-morgan-hotel-selfie.webp",
};

export function MiniIcon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M6 18 18 6M6 6h12v12" />,
    link: (
      <>
        <path
          d="m10 13 4-4M8 15l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
          transform="translate(1 1)"
        />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="5" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8 10 7-4M8 14l7 4" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="3" />
        <path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
      </>
    ),
    heart: (
      <path d="M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z" />
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    users: (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a4 4 0 0 1 0 8m3 3a6 6 0 0 1 3 6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 15l4-5 4 2 5-8" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 8 3v6c0 5-5 9-8 11-3-2-8-6-8-11V5Z" />
        <path d="m8 11 3 3 5-6" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    note: (
      <>
        <path d="M5 3h14v14l-4 4H5Z" />
        <path d="M9 8h6M9 12h6M15 21v-4h4" />
      </>
    ),
    chevron: <path d="m8 4 8 8-8 8" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      className={`mui-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.grid}
    </svg>
  );
}

export function MiniAvatar({
  person,
  size = 38,
  className = "",
}: {
  person: MiniPerson;
  size?: number;
  className?: string;
}) {
  return (
    <img
      className={`mui-avatar ${className}`}
      src={`${A}/${photos[person]}`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
    />
  );
}
export function MiniPhoto({
  person,
  className = "",
}: {
  person: MiniPerson;
  className?: string;
}) {
  return (
    <img
      className={`mui-photo ${className}`}
      src={`${A}/${photos[person]}`}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}
export function MiniBar({
  width = "100%",
  className = "",
}: {
  width?: number | string;
  className?: string;
}) {
  return <span className={`mui-bar ${className}`} style={{ width }} />;
}
export function MiniFoamMark({ size = 26 }: { size?: number }) {
  return (
    <img
      className="mui-foam-mark"
      src={img.foamSymbol}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, padding: Math.round(size * 0.2) }}
    />
  );
}
export function MiniFrame({
  title = "",
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mui-card mui-frame ${className}`}>
      <div className="mui-frame-header">
        <MiniFoamMark size={23} />
        <span>{title}</span>
        <span className="mui-frame-dots">•••</span>
      </div>
      {children}
    </div>
  );
}
