import type { CSSProperties } from "react";
import { KitShareTick } from "./KitShareStatus";
import { storyBenefitsSequenceAt } from "../lib/storyBenefitsMotion";
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
  /** Draw the final tick only after the confirmation has reached its resting place. */
  confirmationTick?: number;
};

/** Write each benefit, check it off, then begin the next row. */
export function StoryBenefits({ variant, active, collapse, reveal, confirmationTick }: StoryBenefitsProps) {
  const settling = collapse !== undefined;
  const collapsed = Math.max(0, Math.min(1, typeof collapse === "number" && Number.isFinite(collapse) ? collapse : 0));
  const revealing = reveal !== undefined;
  const revealed = Math.max(0, Math.min(1, typeof reveal === "number" && Number.isFinite(reveal) ? reveal : 1));
  const confirmed = Math.max(0, Math.min(1, typeof confirmationTick === "number" && Number.isFinite(confirmationTick) ? confirmationTick : 0));
  const visible = active && revealed > 0;
  const sequence = revealing
    ? storyBenefitsSequenceAt(revealed, benefits[variant].length - (settling ? 1 : 0))
    : undefined;
  return (
    <ul
      className={`story-benefits story-benefits--${variant}${visible ? " is-active" : ""}${settling ? " story-benefits--settling" : ""}${revealing ? " story-benefits--revealing" : ""}`}
      style={settling ? { "--benefits-collapse": collapsed } as CSSProperties : undefined}
      aria-label={variant === "kit" ? "Media kit benefits" : "Chrome extension benefits"}
      aria-hidden={!visible}
      role="list"
    >
      {benefits[variant].map((label, index) => {
        const closing = settling && index === benefits[variant].length - 1;
        const phase = closing
          ? { space: 1, text: 1, tick: collapsed === 1 ? confirmed : 0 }
          : sequence?.rows[index];
        const hidden = closing ? collapsed === 0 : collapsed === 1 || phase?.text === 0;
        return <li
          className="story-benefits-row"
          key={label}
          style={{
            "--benefit-index": index,
            ...(revealing && phase ? {
              "--benefit-space": phase.space,
              "--benefit-text": phase.text,
              "--benefit-tick": phase.tick,
              "--benefit-tick-visible": phase.tick > 0 ? 1 : 0,
            } : {}),
          } as CSSProperties}
          aria-hidden={hidden ? true : undefined}
        >
          <span className="story-benefits-entry">
            <span className="story-benefits-label">{label}</span>
            <span className="story-benefits-tick" aria-hidden="true"><KitShareTick /></span>
          </span>
        </li>;
      })}
    </ul>
  );
}
