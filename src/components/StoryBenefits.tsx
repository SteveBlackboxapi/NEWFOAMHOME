import type { CSSProperties } from "react";
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
          className={`story-benefits-row${variant === "kit" && index === benefits.kit.length - 1 ? " story-benefits-sendoff" : ""}`}
          key={label}
          style={{ "--benefit-index": index } as CSSProperties}
        >
          <span className="story-benefits-tick" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="m5 10 3.2 3.2L15 6.5" pathLength="1" />
            </svg>
          </span>
          <span className="story-benefits-label">{label}</span>
        </li>
      ))}
    </ul>
  );
}
