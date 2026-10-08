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
};

/** A presentation list, with a single calm reveal and no interactive checkboxes. */
export function StoryBenefits({ variant, active }: StoryBenefitsProps) {
  return (
    <ul
      className={`story-benefits story-benefits--${variant}${active ? " is-active" : ""}`}
      aria-label={variant === "kit" ? "Media kit benefits" : "Chrome extension benefits"}
      aria-hidden={!active}
      role="list"
    >
      {benefits[variant].map((label, index) => (
        <li
          className="story-benefits-row"
          key={label}
          style={{ "--benefit-index": index } as CSSProperties}
        >
          <span className="story-benefits-label">{label}</span>
          <span className="story-benefits-tick" aria-hidden="true"><KitShareTick /></span>
        </li>
      ))}
    </ul>
  );
}
