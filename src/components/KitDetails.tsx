import type { TalentNetwork } from "../data/stagedTalent";
import "./kit-details.css";

const A = `${import.meta.env.BASE_URL}assets`;
const platformAssets: Partial<Record<TalentNetwork, string>> = {
  instagram: `${A}/60920.svg`,
  tiktok: `${A}/31c2a.svg`,
  youtube: `${A}/572b1.svg`,
};

/** Product icons inherit the cream/burgundy colour of the surrounding kit. */
export function KitPlatformIcon({
  network,
  label,
  size = 22,
}: {
  network: TalentNetwork;
  label: string;
  size?: number;
}) {
  if (network === "linkedin") {
    return (
      <svg
        className="kit-platform-icon"
        viewBox="0 0 24 24"
        role="img"
        aria-label={label}
        style={{ width: size, height: size }}
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M3 2h18a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm2.4 8h3v9h-3v-9Zm1.5-5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm3.4 5h2.8v1.2c.6-.9 1.4-1.4 2.8-1.4 2.8 0 3.3 1.7 3.3 4V19h-3v-4.6c0-1.1 0-2.4-1.5-2.4s-1.6 1.2-1.6 2.3V19h-2.8v-9Z"
        />
      </svg>
    );
  }
  const src = platformAssets[network];
  if (!src) return <span>{label}</span>;
  return (
    <span
      className="kit-platform-icon kit-detail-mask"
      role="img"
      aria-label={label}
      style={{
        width: size,
        height: size,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
      }}
    />
  );
}

/** Visual connected-data marker in this fictional product demonstration. */
export function KitVerifiedBadge() {
  return (
    <svg className="kit-verified-badge" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3h16v8c0 5.1-8 10-8 10S4 16.1 4 11V3Z" fill="#ffb5dc" />
      <path
        d="m8 11 2.7 2.8L16.5 8"
        fill="none"
        stroke="#7a0036"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Editor chrome in the website demo; deliberately not a focusable control. */
export function KitEditHandle() {
  return (
    <div className="kit-edit-handle" aria-hidden="true">
      <span
        className="kit-detail-mask kit-edit-grip"
        style={{
          maskImage: `url("${A}/23d4f.svg")`,
          WebkitMaskImage: `url("${A}/23d4f.svg")`,
        }}
      />
      <span className="kit-edit-divider" />
      <span
        className="kit-detail-mask kit-edit-pencil"
        style={{
          maskImage: `url("${A}/5f955.svg")`,
          WebkitMaskImage: `url("${A}/5f955.svg")`,
        }}
      />
    </div>
  );
}
