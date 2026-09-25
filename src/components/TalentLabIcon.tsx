export type LabIconName =
  | "people"
  | "explore"
  | "bookmark"
  | "search"
  | "filter"
  | "settings"
  | "chevron"
  | "download"
  | "close"
  | "grid"
  | "compact"
  | "arrow"
  | "eye"
  | "heart"
  | "image"
  | "play"
  | "link"
  | "check"
  | "pin"
  | "external"
  | "reset"
  | "sparkles"
  | "copy";
const paths: Record<LabIconName, React.ReactNode> = {
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20v-2a6.5 6.5 0 0 1 13 0v2M16 5a3.5 3.5 0 0 1 0 7m2 2a6 6 0 0 1 3.5 5" />
    </>
  ),
  explore: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  filter: (
    <>
      <path d="M3 7h5m4 0h9M3 17h9m4 0h5" />
      <circle cx="10" cy="7" r="2" />
      <circle cx="14" cy="17" r="2" />
    </>
  ),
  settings: (
    <>
      <path d="m9.5 3-.5 2-1.7 1-2-.6-2.5 4.2 1.5 1.4v2l-1.5 1.4 2.5 4.2 2-.6 1.7 1 .5 2h5l.5-2 1.7-1 2 .6 2.5-4.2-1.5-1.4v-2l1.5-1.4-2.5-4.2-2 .6-1.7-1-.5-2h-5Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  compact: (
    <>
      <path d="M3 3h18v18H3zM9 3v18m6-18v18M3 9h18M3 15h18" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  eye: (
    <>
      <path d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  heart: (
    <path d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z" />
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m3 17 5-5 4 4 4-6 5 7" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8V4Z" />,
  link: (
    <>
      <path d="m10 13 4-4M8 15l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 2 1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7m0-7L11 13M10 3H4v17h17v-7" />
    </>
  ),
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 2 8M3 3v7h7" />
    </>
  ),
  sparkles: (
    <>
      <path d="m10 3 2.2 6.8L19 12l-6.8 2.2L10 21l-2.2-6.8L1 12l6.8-2.2L10 3Z" />
      <path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2Z" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M15 8V3H3v13h5" />
    </>
  ),
};
export function LabIcon({
  name,
  size = 20,
}: {
  name: LabIconName;
  size?: number;
}) {
  return (
    <svg
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
      {paths[name]}
    </svg>
  );
}
