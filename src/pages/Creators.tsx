import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

export function Creators() {
  return (
    <>
      <section className="pt-36 pb-24 px-6 bg-surface">
        <p className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase mb-8`}>For creators</p>
        <h1 className={`${FG_SB} text-[56px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
          Your accounts.<br /><em className="not-italic text-brand">Your connection.</em>
        </h1>
        <p className={`${FG_R} text-lg text-muted max-w-[560px]`}>
          Connect Instagram, TikTok, and YouTube once. Your manager gets live numbers. You keep control.
        </p>
      </section>
      <ClosingCTA />
    </>
  );
}
