import type { CSSProperties } from "react";
import { KitShareTick } from "./KitShareStatus";
import "./story-benefits.css";

const benefits = {
  kit: [
    "Relevant brand experience",
    "Latest connected numbers",
    "The best of their content",
    "Audience demographics",
    "Engagement at a glance",
    "On its way",
  ],
  chrome: [
    "Rich creator profiles",
    "Media kit links included",
    "Beautifully formatted",
    "Copy and paste in seconds",
    "Ready to send from your inbox",
  ],
} as const;

export type StoryBenefitsProps = {
  variant: keyof typeof benefits;
  /** Start the recap once its story scene is visible. */
  active: boolean;
  /** Scroll progress from the full recap to its final confirmation. */
  collapse?: number;
  /** Grow the recap into the centred desktop ending as the user scrolls. */
  reveal?: number;
};

/** A presentation list, with a single calm reveal and no interactive checkboxes. */
export function StoryBenefits({ variant, active, collapse, reveal }: StoryBenefitsProps) {
  const settling = collapse !== undefined;
  const collapsed = Math.max(0, Math.min(1, typeof collapse === "number" && Number.isFinite(collapse) ? collapse : 0));
  const revealing = reveal !== undefined;
  const revealed = Math.max(0, Math.min(1, typeof reveal === "number" && Number.isFinite(reveal) ? reveal : 1));
  const visible = active && revealed > 0;
  const list = (
    <ul
      className={`story-benefits story-benefits--${variant}${visible ? " is-active" : ""}${settling ? " story-benefits--settling" : ""}${revealing ? " story-benefits--revealing" : ""}`}
      style={settling ? { "--benefits-collapse": collapsed } as CSSProperties : undefined}
      aria-label={variant === "kit" ? "Media kit benefits" : "Chrome extension benefits"}
      aria-hidden={!visible}
      role="list"
    >
      {benefits[variant].map((label, index) => (
        <li
          className="story-benefits-row"
          key={label}
          style={{ "--benefit-index": index } as CSSProperties}
          aria-hidden={settling && (
            index === benefits[variant].length - 1 ? collapsed === 0 : collapsed === 1
          ) ? true : undefined}
        >
          <span className="story-benefits-entry">
            <span className="story-benefits-label">{label}</span>
            <span className="story-benefits-tick" aria-hidden="true"><KitShareTick /></span>
          </span>
        </li>
      ))}
    </ul>
  );
  if (!revealing) return list;
  return (
    <div
      className="story-benefits-reveal"
      style={{ gridTemplateRows: `${revealed}fr`, opacity: revealed }}
    >
      <div className="story-benefits-clip">{list}</div>
    </div>
  );
}
