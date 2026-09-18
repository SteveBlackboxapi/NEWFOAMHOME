import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ClosingCTA } from "../components/ClosingCTA";

const FG_R  = "font-founders font-normal";
const FG_M  = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

const A = `${import.meta.env.BASE_URL}assets`;

// Platform icons from the Figma asset set
const icIG = `${A}/20684.svg`;
const icTT = `${A}/8509e.svg`;
const icYT = `${A}/d0b8e.svg`;

// Gmail embed
function GmailView() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const ids = [700, 1600, 2400].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  const people = [
    { name: "Ren Cole", img: `${A}/9e849.png` },
    { name: "Io Marin", img: `${A}/3546d.png` },
    { name: "Sable Quinn", img: `${A}/b93cd.png` },
  ];

  return (
    <div className="bg-[#e9eef6] overflow-hidden relative">
      {step === 2 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#101828] text-white text-[11px] px-3 h-7 rounded-full inline-flex items-center">
          Copied!
        </div>
      )}
      <div className="grid grid-cols-[1.2fr_0.8fr] min-h-[440px]">
        <div className="bg-white m-3 rounded-[12px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-[#e8eaed] flex items-center justify-between">
            <span className={`${FG_M} text-[12px] text-[#202124]`}>{step >= 3 ? "Draft saved" : "New message"}</span>
          </div>
          <div className="px-3 py-2 border-b border-[#e8eaed]">
            <p className={`${FG_R} text-[11px] text-[#5f6368]`}>To</p>
            <p className={`${FG_R} text-[11px] text-[#5f6368] mt-1`}>Subject</p>
          </div>
          <div className="px-3 py-3 flex-1 overflow-hidden">
            {step < 3 ? (
              <p className={`${FG_R} text-[12px] text-[#9aa0a6]`}>Compose</p>
            ) : (
              <div className="animate-[fadeIn_400ms_ease]">
                <div className="flex gap-3">
                  <div className="size-12 rounded-[8px] overflow-hidden shrink-0 bg-[#eee]">
                    <img alt="Ren Cole" src={`${A}/9e849.png`} className="size-full object-cover object-top" />
                  </div>
                  <div>
                    <p className={`${FG_SB} text-[13px] text-[#202124]`}>Ren Cole</p>
                    <p className={`${FG_R} text-[10px] text-[#5f6368]`}>Portland · 32</p>
                    <p className={`${FG_M} text-[11px] text-[#202124] mt-1`}>IG 131K · TT 97K · YT 58K</p>
                  </div>
                </div>
                <p className={`${FG_R} text-[11px] text-[#202124] leading-4 mt-2`}>
                  Early miles. Long runs. Illustrative demo talent for Vale Studio.
                </p>
                <p className={`${FG_M} text-[11px] text-[#1a73e8] mt-2`}>View media kit →</p>
                <div className="mt-3 border border-[#e8eaed] rounded-[10px] p-3 grid grid-cols-2 gap-2">
                  <p className={`${FG_R} text-[10px] text-[#5f6368]`}>Avg reach <b className="text-[#202124]">18.4K</b></p>
                  <p className={`${FG_R} text-[10px] text-[#5f6368]`}>PT 62%</p>
                  <p className={`${FG_R} text-[10px] text-[#5f6368]`}>Avg views <b className="text-[#202124]">9.1K</b></p>
                  <p className={`${FG_R} text-[10px] text-[#5f6368]`}>25–34 41%</p>
                </div>
                <p className={`${FG_R} text-[10px] text-[#137333] mt-2`}>Certified directly from the Instagram API</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border-l border-[#eeefef] flex flex-col">
          <div className="px-3 pt-3 pb-2 flex items-center gap-3 border-b border-[#eeefef]">
            <span className={`${FG_SB} text-[11px] text-[#101828] border-b-2 border-[#f5a524] pb-1`}>Talent</span>
            <span className={`${FG_R} text-[11px] text-[#6a7282] pb-1`}>Lists</span>
            <span className={`${FG_R} text-[11px] text-[#6a7282] pb-1`}>Kits</span>
          </div>
          {step === 0 && (
            <div className="p-3 grid grid-cols-3 gap-2">
              {people.map((person) => (
                <div key={person.name}>
                  <div className="aspect-square rounded-[8px] overflow-hidden bg-[#eee]">
                    <img alt={person.name} src={person.img} className="size-full object-cover object-top" />
                  </div>
                  <p className={`${FG_R} text-[9px] text-[#6a7282] mt-1 truncate`}>{person.name}</p>
                </div>
              ))}
            </div>
          )}
          {step >= 1 && (
            <div className="px-3 py-4 text-center">
              <div className="size-16 rounded-[10px] overflow-hidden mx-auto bg-[#eee]">
                <img alt="Ren Cole" src={`${A}/9e849.png`} className="size-full object-cover object-top" />
              </div>
              <p className={`${FG_SB} text-[13px] text-[#101828] mt-2`}>Ren Cole</p>
              <p className={`${FG_R} text-[10px] text-[#6a7282]`}>Portland</p>
              <div className="flex justify-center gap-1.5 mt-3">
                <span className={`${FG_M} text-[10px] border border-[#e8eaed] rounded-full px-2 h-6 inline-flex items-center`}>Basic</span>
                <span className={`${FG_M} text-[10px] rounded-full px-2 h-6 inline-flex items-center`} style={{ background: step >= 2 ? "#7ddec0" : "#f4f5f6" }}>Detail</span>
                <span className={`${FG_M} text-[10px] border border-[#e8eaed] rounded-full px-2 h-6 inline-flex items-center`}>Text</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaKitView() {
  return (
    <div className="overflow-hidden" style={{ background: "#F4E6C8" }}>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="size-6 rounded-[4px] bg-[#6b0030] flex items-center justify-center">
          <span className="text-white text-[11px] font-semibold leading-none">F</span>
        </div>
        <button className={`${FG_M} text-[11px] text-[#6b0030] border border-[#6b0030]/40 rounded-full px-3 h-7`}>
          Contact
        </button>
      </div>
      <div className="px-5 pb-5 flex gap-4 items-start">
        <div className="rounded-[14px] overflow-hidden shrink-0 bg-[#e8d4b0]" style={{ width: 168, height: 168 }}>
          <img alt="Ren Cole" src={`${A}/9e849.png`} className="size-full object-cover object-top" />
        </div>
        <div className="min-w-0 pt-1">
          <p className={`${FG_SB} text-[#6b0030] leading-[1.05] tracking-[-0.5px]`} style={{ fontSize: "clamp(22px, 3.2vw, 28px)" }}>
            Ren Cole
          </p>
          <p className={`${FG_R} text-[11px] text-[#6b0030]/70 mt-2`}>
            Portland, OR&nbsp;|&nbsp;32 years old&nbsp;|&nbsp;Male
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <img alt="" className="size-4 opacity-80" src={icIG} />
            <img alt="" className="size-4 opacity-80" src={icTT} />
            <img alt="" className="size-4 opacity-80" src={icYT} />
          </div>
          <div className="mt-3 rounded-[10px] px-3 py-2" style={{ background: "rgba(107,0,48,0.08)" }}>
            <p className={`${FG_R} text-[10px] text-[#6b0030]/55 uppercase tracking-[0.4px]`}>Verticals</p>
            <p className={`${FG_M} text-[12px] text-[#6b0030] mt-0.5`}>Running · Everyday Progress</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4" style={{ background: "#6b0030" }}>
        <p className={`${FG_R} text-[13px] text-[#F4E6C8] leading-5`}>
          Early miles. Long runs. Bringing an audience along for the journey. Illustrative demo talent for Vale Studio.
        </p>
      </div>
      <div className="px-5 pb-5" style={{ background: "#6b0030" }}>
        <div className="flex items-end justify-between gap-3 border-t border-white/15 pt-4">
          <div>
            <p className={`${FG_SB} text-[11px] text-[#F4E6C8]`}>Platforms</p>
            <p className={`${FG_SB} text-[28px] text-[#F4E6C8] leading-none mt-1`}>286K</p>
            <p className={`${FG_R} text-[10px] text-[#F4E6C8]/70 mt-1`}>Total audience</p>
          </div>
          <div className="flex gap-5">
            {[{ n: "131K", h: "@ren.cole" }, { n: "97K", h: "@ren.cole" }, { n: "58K", h: "Ren Cole" }].map((row) => (
              <div key={row.n} className="text-right">
                <p className={`${FG_SB} text-[18px] text-[#F4E6C8] leading-none`}>{row.n}</p>
                <p className={`${FG_R} text-[10px] text-[#F4E6C8]/70 mt-1`}>{row.h}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaKitCard() {
  const [tab, setTab] = useState<"kit" | "gmail">("kit");
  return (
    <div className="rounded-[20px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] w-full" style={{ maxWidth: tab === "gmail" ? 640 : 500 }}>
      <div className="flex items-center gap-1 px-4 pt-4 pb-3 bg-[#f3eee6]">
        <button onClick={() => setTab("kit")} className={`${FG_M} text-[13px] px-4 h-8 rounded-full transition-colors ${tab === "kit" ? "text-[#101828] bg-white border border-[#dedede] shadow-sm" : "text-[#6a7282] hover:text-[#101828]"}`}>Media kit</button>
        <button onClick={() => setTab("gmail")} className={`${tab === "gmail" ? FG_M : FG_R} text-[13px] px-4 h-8 rounded-full transition-colors ${tab === "gmail" ? "text-[#101828] bg-white border border-[#dedede] shadow-sm" : "text-[#6a7282] hover:text-[#101828]"}`}>Gmail embed</button>
      </div>
      {tab === "kit" ? <MediaKitView /> : <GmailView />}
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen bg-navy flex items-center px-6 pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left */}
          <div className="flex-1 min-w-0 max-w-[640px]">
            <p
              className={`${FG_M} text-[11px] uppercase tracking-[2px] mb-8`}
              style={{ color: "var(--text-subtle)" }}
            >
              The truth layer
            </p>
            <h1
              className={`${FG_SB} text-white leading-[1.0] tracking-[-2px] mb-7`}
              style={{ fontSize: "clamp(52px, 7vw, 88px)" }}
            >
              Numbers everyone in the deal can trust.
            </h1>
            <p
              className={`${FG_R} text-[17px] leading-7 mb-12`}
              style={{ color: "var(--text-subtle)", maxWidth: 520 }}
            >
              Creators connect their data at source. Managers pitch with it. Brands decide on it. No screenshots, no guesswork, no "let me check and get back to you."
            </p>
            <div className="flex items-center gap-6 flex-wrap">
              <Link
                to="/demo"
                className={`${FG_SB} text-[#101828] text-[16px] px-8 h-14 rounded-full inline-flex items-center gap-2 hover:opacity-90 transition-opacity`}
                style={{ background: "var(--lime)" }}
              >
                Get a demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#pitch-loop"
                className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/30 hover:border-white/70 transition-colors pb-[2px]`}
              >
                Follow a pitch
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — media kit mockup */}
          <div className="flex-1 min-w-0 w-full flex justify-center lg:justify-end">
            <div className="w-full" style={{ maxWidth: 500 }}>
              <MediaKitCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Social proof bar ─────────────────────────────────────────────────────────

function LogoMarquee() {
  const LOGOS = [
    ["Gersh Agency", "0% 0%"],
    ["Select Management Group", "33.3333% 0%"],
    ["Underscore Talent", "66.6667% 0%"],
    ["Grail Talent", "100% 0%"],
    ["Kensington Grey", "0% 33.3333%"],
    ["Odyssey Entertainment Group", "33.3333% 33.3333%"],
    ["Platform Talent", "66.6667% 33.3333%"],
    ["CMG Talent", "100% 33.3333%"],
    ["tbh talent", "0% 66.6667%"],
    ["The Brand Row", "33.3333% 66.6667%"],
    ["Eleven Eleven Collective", "66.6667% 66.6667%"],
    ["Hiller Media Group", "100% 66.6667%"],
    ["Good Answer", "0% 100%"],
  ];
  const sheet = `${A}/agency-logos.png`;
  const row = (
    <div className="flex shrink-0 gap-10 pr-10">
      {LOGOS.map(([label, pos]) => (
        <div
          key={label}
          role="img"
          aria-label={label}
          className="w-52 h-16 shrink-0"
          style={{ backgroundImage: `url(${sheet})`, backgroundSize: "400% 400%", backgroundPosition: pos, backgroundRepeat: "no-repeat" }}
        />
      ))}
    </div>
  );
  return (
    <section className="bg-white pt-12 pb-8 border-b border-border">
      <p className={`${FG_R} text-sm text-muted text-center mb-6`}>In good company. Across 800+ creator agencies.</p>
      <div className="overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
        <div className="flex w-max animate-[logoMarquee_90s_linear_infinite]">
          {row}
          {row}
        </div>
      </div>
    </section>
  );
}

function ProofBar() {
  const ref = useRef<HTMLElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="bg-white py-16 px-6">
      <div className="max-w-[1200px] mx-auto">
        <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted text-center mb-10`}>The network in use</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16">
          {[
            { val: "1,300+", label: "talent managers active every month" },
            { val: "800+", label: "creator agencies active every month" },
            { val: "~6,000", label: "kits, lists, rosters and embeds shared a week" },
            { val: "440,000+", label: "brand and agency opens of kits, lists and rosters" },
          ].map((s, i) => (
            <div key={s.val} className="text-center min-w-[160px]">
              <p className={`${FG_SB} text-[40px] tracking-[-1px] text-text leading-none mb-2 ${on ? "animate-[statReveal_0.9s_ease_both]" : "opacity-0"}`} style={{ animationDelay: on ? `${i * 0.12}s` : undefined }}>{s.val}</p>
              <p className={`${FG_R} text-sm text-muted max-w-[180px] mx-auto`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Value prop section ───────────────────────────────────────────────────────
function ValueProp() {
  const CARDS = [
    {
      kicker: "I manage talent",
      headline: "Pitch your roster with numbers a brand can believe.",
      cta: "For managers",
      to: "/managers",
    },
    {
      kicker: "I'm a creator",
      headline: "Connect your accounts. Help your manager make the case.",
      cta: "For creators",
      to: "/creators",
    },
    {
      kicker: "I'm a brand or agency",
      headline: "Someone sent you a Foam link. Here's what's behind it.",
      cta: "For brands",
      to: "/brands",
    },
  ];
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-[20px] border border-[#e8e8e8] bg-white p-8 min-h-[220px] flex flex-col hover:border-[#cfcfcf] transition-colors"
          >
            <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted mb-4`}>{card.kicker}</p>
            <p className={`${FG_SB} text-[22px] leading-7 tracking-[-0.4px] text-text flex-1`}>{card.headline}</p>
            <p className={`${FG_M} text-sm text-muted mt-8 flex items-center justify-between`}>
              {card.cta}
              <span>↗</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}


function PitchStory() {
  const [step, setStep] = useState(0);
  const hover = useRef(false);
  const STEPS = [
    ["01", "The brief", "Type it the way you'd say it." if False else "“Anyone on your roster running the marathon?”"],
    ["02", "Your roster", "Type it the way you'd say it."],
    ["03", "The proof", "Seen. Heard. Captioned."],
    ["04", "Sent", "A kit a brand can believe, in your reply."],
    ["05", "They opened it", "They came back. You know."],
  ];
  const COPY = [
    ["01 / The brief", "“Anyone on your roster running the marathon?”", "A running brand wants a creator in the Boston Marathon, 100K+ on Instagram, US audience. Options by Friday.", "You already know who."],
    ["02 / Your roster", "Type it the way you'd say it.", "Search your talent's content for “marathon”. Find the training post that backs up the creator you have in mind.", "Now prove it."],
    ["03 / The proof", "Seen. Heard. Captioned.", "See what matched and where. The bib in frame. The word out loud. The caption. Follow the evidence to the moment.", "Put it in a kit."],
    ["04 / Sent", "A kit a brand can believe, in your reply.", "Connected audience data. The relevant content. Your agency's colours. Put the introduction into Gmail from the Foam extension.", "Now the interesting part."],
    ["05 / They opened it", "They came back. You know.", "See which client opened your shared list, which creator profiles they viewed, and when they returned for another look.", "Make the next conversation count."],
  ];
  useEffect(() => {
    const id = setInterval(() => {
      if (!hover.current) setStep((s) => (s + 1) % 5);
    }, 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <section
      id="pitch-loop"
      className="py-24 px-6 bg-white"
      onMouseEnter={() => { hover.current = true; }}
      onMouseLeave={() => { hover.current = false; }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <p className={`${FG_R} text-sm text-muted`}>One pitch. From brief to follow-up.</p>
          <p className={`${FG_R} text-sm text-muted`}>Marathon brief / Staged example</p>
        </div>
        <div className="grid lg:grid-cols-[0.85fr_1.25fr] gap-10 xl:gap-16 items-start">
          <div>
            <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted mb-4`}>{COPY[step][0]}</p>
            <h2 className={`${FG_SB} text-[40px] leading-[1.05] tracking-[-1px] text-text mb-6`}>
              {COPY[step][1]}
            </h2>
            <p className={`${FG_R} text-[17px] leading-7 text-muted mb-8 max-w-[420px]`}>
              {COPY[step][2]}
            </p>
            <div className="border-t border-border pt-6">
              <p className={`${FG_M} text-sm text-text`}>{COPY[step][3]}</p>
            </div>
          </div>
          <div className="rounded-[28px] p-3" style={{ background: "linear-gradient(180deg,#eef2f8 0%,#f7f8fb 100%)", boxShadow: "0 30px 80px rgba(16,24,40,0.12)" }}>
            <div className="bg-white rounded-[22px] overflow-hidden border border-[#e8eaed] flex flex-col min-h-[400px]">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#eef0f3]">
                <span className={`${FG_SB} text-[15px] text-[#d93025]`}>M</span>
                <span className={`${FG_SB} text-[14px] text-[#202124]`}>Gmail</span>
                <div className="flex-1 h-8 rounded-full bg-[#e8f0fe] px-4 flex items-center text-[12px] text-[#5f6368]">Search mail</div>
                <div className="size-8 rounded-full bg-[#e6c9a8] text-[#5b4636] flex items-center justify-center text-[12px] font-medium">J</div>
              </div>
              <div className="flex flex-1 min-h-0">
                <div className="w-[120px] shrink-0 bg-[#f4f6fb] p-3 text-[11px] text-[#5f6368] border-r border-[#eef0f3]">
                  <p className={`${FG_M} bg-[#d3e3fd] text-[#041e49] rounded-full px-3 py-1.5 mb-2 text-center`}>Compose</p>
                  <div className={`${FG_M} bg-[#e8f0fe] text-[#041e49] rounded-full px-3 py-1.5 mb-3 flex items-center justify-between`}>Inbox <span>12</span></div>
                  <p className="px-2 py-1">Starred</p>
                  <p className="px-2 py-1">Sent</p>
                  <p className="px-2 py-1 flex justify-between">Drafts <span>2</span></p>
                </div>
                <div className="flex-1 p-5">
                  <p className={`${FG_SB} text-[16px] text-[#202124] mb-4`}>Boston Marathon — who should we meet?</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 rounded-full bg-[#d3e3fd] text-[#041e49] flex items-center justify-center text-[12px] shrink-0">S</div>
                    <div>
                      <p className={`${FG_M} text-[12px] text-[#202124]`}>Sam · Pace Running</p>
                      <p className={`${FG_R} text-[11px] text-[#5f6368]`}>to me · 10:42 AM</p>
                    </div>
                  </div>
                  <p className={`${FG_R} text-[13px] text-[#202124] leading-5 mb-3`}>Hi Jamie,</p>
                  <p className={`${FG_R} text-[13px] text-[#202124] leading-5 mb-3`}>
                    We’re looking for a creator running Boston. Someone whose audience is already following their training.
                  </p>
                  <div className="border-l-2 border-[#d3e3fd] pl-3 mb-3 text-[13px] text-[#202124] space-y-1">
                    <p>100K+ on Instagram</p>
                    <p>Primarily US audience</p>
                    <p>Running the Boston Marathon</p>
                  </div>
                  <p className={`${FG_R} text-[13px] text-[#202124]`}>Could you send a few options by Friday?</p>
                  <p className={`${FG_R} text-[13px] text-[#202124] mt-3`}>Thanks!<br />Sam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-5 gap-3">
          {STEPS.map(([n, label], i) => (
            <button key={n} type="button" onClick={() => setStep(i)} className="text-left">
              <div className={`h-[3px] mb-3 ${i === step ? "bg-[#c6f31e]" : "bg-[#e5e5e5]"}`} />
              <p className={`${FG_M} text-[12px] ${i === step ? "text-text" : "text-muted"}`}>{n}  {label}</p>
            </button>
          ))}
        </div>
        <p className={`${FG_R} text-[12px] text-muted mt-6`}>Staged product example · illustrative content and figures.</p>
      </div>
    </section>
  );
}

function FeatureHighlight() {
  return (
    <section className="py-28 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 min-w-0">
            <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-4`}>The work between a brief and a yes</p>
            <h2 className={`${FG_SB} text-text leading-[1.05] tracking-[-1px] mb-5`} style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>
              You know your talent.<br />Make the brand see what you see.
            </h2>
            <p className={`${FG_R} text-[17px] leading-7 text-muted mb-8`}>
              One opportunity, followed from the inbox to the next conversation.
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Works directly inside Gmail",
                "Live stats at the moment of send",
                "Brand opens tracked automatically",
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="size-[6px] rounded-full bg-brand shrink-0" />
                  <span className={`${FG_R} text-[15px] text-muted`}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/features" className={`${FG_M} text-[15px] text-brand hover:opacity-80 transition-opacity`}>
              See all features →
            </Link>
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-raised border border-border rounded-[20px] p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="size-10 rounded-full bg-navy flex items-center justify-center shrink-0">
                  <span className={`${FG_SB} text-white text-sm`}>TS</span>
                </div>
                <div>
                  <p className={`${FG_M} text-sm text-text`}>Rowan Hale</p>
                  <p className={`${FG_R} text-xs text-muted`}>rowan@vale.studio</p>
                </div>
              </div>
              <p className={`${FG_R} text-sm text-muted leading-6`}>
                Hi Eden — here's Io, she's a perfect fit for the spring wellness brief:
              </p>
              <div className="bg-surface border border-border-dark rounded-[12px] p-4 flex items-center gap-4">
                <div className="relative size-12 rounded-[10px] overflow-hidden shrink-0 bg-[#f4f5f6]">
                  <img
                    alt="Io Marin"
                    src={`${A}/3546d.png`}
                    className="absolute top-0 left-[-4%] w-[108%] h-[115%] object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${FG_M} text-sm text-text`}>Io Marin</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <img alt="IG" className="size-3" src={icIG} />
                      <span className={`${FG_M} text-xs text-text`}>164K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img alt="TT" className="size-3" src={icTT} />
                      <span className={`${FG_M} text-xs text-text`}>89K</span>
                    </div>
                  </div>
                </div>
                <button className={`${FG_M} bg-brand text-white text-xs px-3 h-7 rounded-full shrink-0`}>
                  View kit →
                </button>
              </div>
              <div className={`${FG_SB} text-[40px] tracking-[-1px] text-text`}>7,000+</div>
              <p className={`${FG_R} text-sm text-muted`}>creator cards embedded via Gmail every month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Home() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <ValueProp />
      <ProofBar />
      <PitchStory />
      <FeatureHighlight />
      <ClosingCTA
        headline="Get a demo."
        sub="Creators connect their data at source. Managers pitch with it."
      />
    </>
  );
}
