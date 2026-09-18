import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

export function About() {
  return (
    <>
      <section className="pt-36 pb-24 px-6 bg-surface text-center">
        <h1 className={`${FG_SB} text-[60px] leading-[1.02] tracking-[-2px] text-text mb-6`}>
          Creator deals are still <em className="text-brand not-italic">too hard to close</em>
        </h1>
        <p className={`${FG_R} text-lg text-muted max-w-[560px] mx-auto`}>
          Foam exists to give talent managers the proof they need to get a yes.
        </p>
      </section>
      <ClosingCTA headline="Want to see the platform?" sub="Bring a real brief. We'll show you how Foam fits." />
    </>
  );
}
