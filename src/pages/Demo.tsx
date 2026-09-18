import { useState } from "react";
import { FG_R, FG_M, FG_SB } from "../lib/assets";

export function Demo() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 bg-surface pt-20">
        <div className="text-center max-w-[480px]">
          <h1 className={`${FG_SB} text-4xl text-text mb-4`}>We'll be in touch</h1>
          <p className={`${FG_R} text-muted`}>Thanks{name ? `, ${name.split(" ")[0]}` : ""}. Calendar link within one business day.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-36 pb-32 px-6 bg-surface">
      <div className="max-w-[480px]">
        <h1 className={`${FG_SB} text-[52px] leading-[1.04] tracking-[-1.5px] text-text mb-5`}>
          Bring a brief.<br />We'll bring the platform.
        </h1>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex flex-col gap-4 mt-10">
          <input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className={`${FG_R} h-11 rounded-[10px] border border-border px-4`} />
          <input required type="email" placeholder="Work email" className={`${FG_R} h-11 rounded-[10px] border border-border px-4`} />
          <button type="submit" className={`${FG_M} bg-brand text-white h-12 rounded-full`}>Request a demo</button>
        </form>
      </div>
    </section>
  );
}
