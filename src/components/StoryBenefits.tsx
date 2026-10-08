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
  /** Start the recap once its story scene is visible. Inactive keeps its layout space. */
  active: boolean;
  /** Scroll progress from the full recap to its final confirmation. */
  collapse?: number;
};

/** A presentation list, with a single calm reveal and no interactive checkboxes. */
export function StoryBenefits({ variant, active, collapse }: StoryBenefitsProps) {
  const settling = collapse !== undefined;
  const collapsed = Math.max(0, Math.min(1, typeof collapse === "number" && Number.isFinite(collapse) ? collapse : 0));
  return (
    <ul
      className={`story-benefits story-benefits--${variant}${active ? " is-active" : ""}${settling ? " story-benefits--settling" : ""}`}
      style={settling ? { "--benefits-collapse": collapsed } as CSSProperties : undefined}
      aria-label={variant === "kit" ? "Media kit benefits" : "Chrome extension benefits"}
      aria-hidden={!active}
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
}
