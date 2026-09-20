import { useState } from "react";
import { FG_R, FG_M, FG_SB } from "../lib/assets";

const WORKFLOWS = [
  "Media kits & pitching",
  "Lists & rosters",
  "Chrome / Gmail extension",
  "Content search",
  "Watchlists",
  "All of the above",
];

export function Demo() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", workflow: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 bg-surface pt-20">
        <div className="max-w-[480px] text-center">
          <div className="size-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              <path d="M2 10L8.5 16.5L22 2" stroke="#7a0036" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className={`${FG_SB} text-4xl tracking-[-0.8px] text-text mb-4`}>We'll be in touch</h1>
          <p className={`${FG_R} text-base text-muted leading-7`}>
            Thanks, {form.name.split(" ")[0]}. We'll review your details and send a calendar link within one business day.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-36 pb-32 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* Left */}
          <div className="flex-1 min-w-0 max-w-[480px]">
            <div className="inline-flex items-center gap-2 bg-raised border border-border rounded-full px-[14px] py-[6px] mb-8">
              <div className="size-[6px] rounded-full bg-brand" />
              <span className={`${FG_M} text-xs text-muted tracking-[0.3px] uppercase`}>Book a demo</span>
            </div>
            <h1 className={`${FG_SB} text-[52px] leading-[1.04] tracking-[-1.5px] text-text mb-5`}>
              Bring a brief.<br />
              We'll bring the platform.
            </h1>
            <p className={`${FG_R} text-base leading-7 text-muted mb-10`}>
              In 30 minutes we'll walk you through Foam using a real creator and a real brief, so you see exactly how it fits your workflow, not a generic sales deck.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { label: "30 min", desc: "No extended sales process" },
                { label: "Real data", desc: "We use a live creator profile" },
                { label: "Your brief", desc: "Bring one and we'll pitch against it" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-4">
                  <div className="shrink-0 w-[60px] h-9 bg-raised border border-border rounded-[8px] flex items-center justify-center">
                    <span className={`${FG_M} text-sm text-text`}>{f.label}</span>
                  </div>
                  <span className={`${FG_R} text-sm text-muted`}>{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 min-w-0 w-full lg:max-w-[480px]">
            <form onSubmit={handleSubmit} className="bg-raised border border-border rounded-[20px] p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-[6px]">
                <label className={`${FG_M} text-sm text-text`}>Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Ren Cole"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`${FG_R} h-11 rounded-[10px] border border-border bg-surface px-4 text-sm text-text placeholder:text-subtle outline-none focus:border-brand transition-colors`}
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className={`${FG_M} text-sm text-text`}>Work email</label>
                <input
                  type="email"
                  required
                  placeholder="ren@vale.studio"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`${FG_R} h-11 rounded-[10px] border border-border bg-surface px-4 text-sm text-text placeholder:text-subtle outline-none focus:border-brand transition-colors`}
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className={`${FG_M} text-sm text-text`}>Agency or company</label>
                <input
                  type="text"
                  placeholder="Vale Studio"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className={`${FG_R} h-11 rounded-[10px] border border-border bg-surface px-4 text-sm text-text placeholder:text-subtle outline-none focus:border-brand transition-colors`}
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className={`${FG_M} text-sm text-text`}>What part of Foam interests you most?</label>
                <select
                  value={form.workflow}
                  onChange={e => setForm(f => ({ ...f, workflow: e.target.value }))}
                  className={`${FG_R} h-11 rounded-[10px] border border-border bg-surface px-4 text-sm text-text outline-none focus:border-brand transition-colors appearance-none`}
                >
                  <option value="" disabled>Select a focus area</option>
                  {WORKFLOWS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <button
                type="submit"
                className={`${FG_M} mt-2 w-full bg-brand text-white text-[15px] h-12 rounded-full hover:bg-brand-hover transition-colors`}
              >
                Request a demo
              </button>
              <p className={`${FG_R} text-xs text-muted text-center`}>
                We respond within one business day. No hard sell.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
