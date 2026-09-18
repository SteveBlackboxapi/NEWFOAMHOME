import { FG_R, FG_M, FG_SB } from "../lib/assets";
import { ClosingCTA } from "../components/ClosingCTA";

const PRINCIPLES = [
  ["01", "Read-only, always"],
  ["02", "Connected accounts, not stored numbers"],
  ["03", "Creator consent, every time"],
  ["04", "Transparent kit visibility"],
  ["05", "No data brokering"],
];

export function DataTrust() {
  return (
    <>
      <section className="pt-36 pb-24 px-6 bg-surface">
        <h1 className={`${FG_SB} text-[56px] leading-[1.02] tracking-[-2px] text-text mb-10`}>Data & trust</h1>
        <div className="max-w-[760px] flex flex-col gap-6">
          {PRINCIPLES.map(([n, title]) => (
            <div key={n} className="border-b border-border pb-6">
              <p className={`${FG_M} text-xs text-subtle mb-2`}>{n}</p>
              <h2 className={`${FG_SB} text-2xl text-text`}>{title}</h2>
            </div>
          ))}
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}
