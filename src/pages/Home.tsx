import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ClosingCTA } from "../components/ClosingCTA";
import { MobileFade } from "../components/MobileFade";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { LabIcon } from "../components/TalentLabIcon";
import { formatWebsiteMetric, websiteAria, websiteContentStats, websiteProfile, websiteSamantha } from "../data/websiteTalent";

const FG_R  = "font-founders font-normal";
const FG_M  = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

const A = `${import.meta.env.BASE_URL}assets`;

const icFoam = `${A}/fdb3b.svg`;
const icMagnify = `${A}/333bb.svg`;
const icShare = `${A}/a2840.svg`;
const icPlus = `${A}/30501.svg`;
const icFilters = `${A}/462ac.svg`;
const icGrid = `${A}/8b982.svg`;
const icSort = `${A}/de843.svg`;
const icCheck = `${A}/875ea.svg`;
const icNavHome = `${A}/db233.svg`;
const icNavSearch = `${A}/5630d.svg`;
const icNavLists = `${A}/26407.svg`;
const icNavWatch = `${A}/5c880.svg`;
const icNavChat = `${A}/4f583.svg`;

/** The same approved fictional creator throughout the public pitch story. */
const STAGE = {
  ...websiteProfile(websiteSamantha),
  photo: websiteSamantha.portrait,
  bioShort: `${websiteSamantha.bio.split(". ")[0]}.`,
  kitName: "Samantha-Pikka-haircare'26",
  agency: "Vale Studio",
  manager: "Rowan Hale",
};

const POST_STILLS = websiteSamantha.content.filter((tile) => tile.type === "still");
const CONTENT = POST_STILLS.map((tile) => ({
  src: tile.thumb,
  alt: `${STAGE.name}: ${tile.caption || "creator content"}`,
  views: tile.views ? formatWebsiteMetric(tile.views) : null,
  engagements: tile.engagements === undefined ? null : formatWebsiteMetric(tile.engagements),
  platform: { instagram: "IG", tiktok: "TT", youtube: "YT" }[tile.platform],
}));
const CONTENT_STATS = websiteContentStats(POST_STILLS.filter((tile) => (tile.views ?? 0) > 0));
const TOP_POST_VIEWS = formatWebsiteMetric(Math.max(...POST_STILLS.map((tile) => tile.views ?? 0)));

const ROSTER = [websiteSamantha, websiteAria].map((talent) => ({ name: talent.displayName, img: talent.portrait }));

// ─── Gmail embed (exported for Features) ─────────────────────────────────────
export function GmailView({ step: controlled }: { step?: number } = {}) {
  const [step, setStep] = useState(0);
  const root = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (controlled != null) {
      setStep(controlled);
      return;
    }
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { setStep(0); return; }
      setStep(0);
      const ids = [700, 1600, 2400].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
      (el as any)._ids = ids;
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      const ids = (root.current as any)?._ids;
      if (ids) ids.forEach(clearTimeout);
    };
  }, [controlled]);

  return (
    <div ref={root} className="bg-[#e9eef6] overflow-hidden relative">
      <div
        className="pointer-events-none absolute z-50 size-10 rounded-full border-[3px] border-[#c6f31e] bg-[#c6f31e]/30 shadow-[0_0_0_6px_rgba(198,243,30,0.25)] transition-all duration-300"
        style={{
          left: ["72%", "78%", "28%", "28%"][Math.min(step, 3)],
          top: ["78%", "78%", "42%", "42%"][Math.min(step, 3)],
        }}
      />
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
                    <img alt={STAGE.name} src={STAGE.photo} className="size-full object-cover object-top" />
                  </div>
                  <div>
                    <p className={`${FG_SB} text-[13px] text-[#202124]`}>{STAGE.name}</p>
                    <p className={`${FG_R} text-[10px] text-[#5f6368]`}>{STAGE.loc} · {STAGE.age}</p>
                    <p className={`${FG_M} text-[11px] text-[#202124] mt-1`}>IG {STAGE.ig.n} · TT {STAGE.tt.n} · YT {STAGE.yt.n} · LI {STAGE.li.n}</p>
                  </div>
                </div>
                <p className={`${FG_R} text-[11px] text-[#202124] leading-4 mt-2`}>
                  {STAGE.bioShort}
                </p>
                <p className={`${FG_M} text-[11px] text-[#1a73e8] mt-2`}>View media kit →</p>
                <div className="mt-3 border border-[#e8eaed] rounded-[10px] p-3 grid grid-cols-2 gap-2">
                  {CONTENT_STATS.map(([value, label]) => (
                    <p key={label} className={`${FG_R} text-[10px] text-[#5f6368]`}>{label} <b className="text-[#202124]">{value}</b></p>
                  ))}
                </div>
                <p className={`${FG_R} text-[10px] text-[#137333] mt-2`}>Illustrative demo data · AI-generated talent</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white border-l border-[#eeefef] flex flex-col">
          <div className="px-3 pt-3 pb-2 flex items-center gap-3 border-b border-[#eeefef]">
            <span className={`${FG_SB} text-[11px] text-[#101828] border-b-2 border-[#7a0036] pb-1`}>Talent</span>
            <span className={`${FG_R} text-[11px] text-[#6a7282] pb-1`}>Lists</span>
            <span className={`${FG_R} text-[11px] text-[#6a7282] pb-1`}>Kits</span>
          </div>
          {step === 0 && (
            <div className="p-3 grid grid-cols-2 gap-2">
              {ROSTER.map((person) => (
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
                <img alt={STAGE.name} src={STAGE.photo} className="size-full object-cover object-top" />
              </div>
              <p className={`${FG_SB} text-[13px] text-[#101828] mt-2`}>{STAGE.name}</p>
              <p className={`${FG_R} text-[10px] text-[#6a7282]`}>{STAGE.loc}</p>
              <div className="flex justify-center gap-1.5 mt-3">
                <span className={`${FG_M} text-[10px] border border-[#e8eaed] rounded-full px-2 h-6 inline-flex items-center`}>Basic</span>
                <span className={`${FG_M} text-[10px] rounded-full px-2 h-6 inline-flex items-center`} style={{ background: step >= 2 ? "#7ddec0" : "#f4f5f6" }}>{step === 2 ? "Copied!" : "Detail"}</span>
                <span className={`${FG_M} text-[10px] border border-[#e8eaed] rounded-full px-2 h-6 inline-flex items-center`}>Text</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product-faithful media kit (cream / burgundy) ───────────────────────────
function MediaKitView({ scrollY = 0, dense = false }: { scrollY?: number; dense?: boolean }) {
  const cream = "#F4E6C8";
  const burgundy = "#7a0036";
  return (
    <div className="overflow-hidden" style={{ background: cream }}>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="size-6 rounded-[4px] bg-[#7a0036] flex items-center justify-center">
          <span className="text-white text-[11px] font-semibold leading-none">F</span>
        </div>
        <button type="button" className={`${FG_M} text-[11px] text-[#7a0036] border border-[#7a0036]/40 rounded-full px-3 h-7`}>
          Contact
        </button>
      </div>
      <div
        className="transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${-scrollY}%)` }}
      >
        <div className="px-5 pb-5 flex gap-4 items-start">
          <div className="rounded-[14px] overflow-hidden shrink-0 bg-[#e8d4b0]" style={{ width: dense ? 140 : 168, height: dense ? 140 : 168 }}>
            <img alt={STAGE.name} src={STAGE.photo} className="size-full object-cover object-top" />
          </div>
          <div className="min-w-0 pt-1">
            <p className={`${FG_SB} text-[#7a0036] leading-[1.05] tracking-[-0.5px]`} style={{ fontSize: dense ? 22 : "clamp(22px, 3.2vw, 28px)" }}>
              {STAGE.name}
            </p>
            <p className={`${FG_R} text-[11px] text-[#7a0036]/70 mt-2`}>
              {STAGE.loc}&nbsp;|&nbsp;{STAGE.age} years old&nbsp;|&nbsp;{STAGE.gender}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {["IG", "TT", "YT", "LI"].map((label) => (
                <span key={label} className="size-7 rounded-full border border-[#7a0036]/35 inline-flex items-center justify-center bg-[#7a0036]/08 text-[9px] text-[#7a0036] font-medium">
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-3 rounded-[10px] px-3 py-2" style={{ background: "rgba(122,0,54,0.08)" }}>
              <p className={`${FG_R} text-[10px] text-[#7a0036]/55 uppercase tracking-[0.4px]`}>Verticals</p>
              <p className={`${FG_M} text-[12px] text-[#7a0036] mt-0.5`}>{STAGE.verticals}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5" style={{ background: burgundy }}>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className={`${FG_SB} text-[15px] text-[#F4E6C8]`}>Platforms</p>
              <p className={`${FG_SB} text-[32px] text-[#F4E6C8] leading-none mt-1`}>{STAGE.total}</p>
              <p className={`${FG_R} text-[11px] text-[#F4E6C8]/70 mt-1`}>Total audience</p>
            </div>
            <div className="flex gap-x-4 gap-y-3 flex-wrap">
              {STAGE.platforms.map((row) => (
                <div key={row.network} className="text-right min-w-[64px]">
                  <p className={`${FG_R} text-[10px] text-[#F4E6C8]/70 mb-1`}>{row.label}</p>
                  <p className={`${FG_SB} text-[18px] text-[#F4E6C8] leading-none`}>{row.count}</p>
                  {row.handle && <p className={`${FG_R} text-[10px] text-[#F4E6C8]/70 mt-1`}>{row.handle}</p>}
                </div>
              ))}
            </div>
          </div>
          <p className={`${FG_R} text-[13px] text-[#F4E6C8] leading-5 mt-5 max-w-[520px]`}>{STAGE.bioShort}</p>
        </div>

        <div className="px-5 py-5" style={{ background: cream }}>
          <div className="grid grid-cols-3 gap-2">
            {CONTENT.slice(0, dense ? 6 : 6).map((tile) => (
              <div key={tile.src + tile.views} className="relative rounded-[10px] overflow-hidden bg-[#ead9b8] aspect-[3/4]">
                <img alt={tile.alt} src={tile.src} className="size-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent">
                  <span className={`${FG_M} text-[10px] text-white inline-flex items-center gap-1`}>{tile.views ? <><LabIcon name="eye" size={11} />{tile.views}</> : "Draft asset"}</span>
                  <span className="text-[9px] text-white/80">{tile.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6" style={{ background: cream }}>
          <div className="rounded-[14px] border border-[#ead9b8] bg-[#f7efe0] p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#7a0036]">IG</span>
                <div>
                  <p className={`${FG_SB} text-[14px] text-[#101828]`}>Instagram</p>
                  <p className={`${FG_R} text-[11px] text-[#6a7282]`}>{STAGE.ig.h}</p>
                </div>
              </div>
              <p className={`${FG_R} text-[11px] text-[#7a0036]`}>Illustrative post data</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {CONTENT_STATS.map(([val, lab]) => (
                <div key={lab} className="rounded-[10px] bg-white/70 px-3 py-2.5">
                  <p className={`${FG_SB} text-[18px] leading-none text-[#101828]`}>{val}</p>
                  <p className={`${FG_R} text-[11px] text-[#6a7282] mt-1`}>{lab}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[10px] bg-white/70 px-3 py-3">
              <p className={`${FG_R} text-[11px] text-[#6a7282]`}>Total followers</p>
              <p className={`${FG_SB} text-[24px] leading-none text-[#101828] mt-1`}>{STAGE.ig.n}</p>
              <p className={`${FG_R} text-[11px] text-[#7a0036] mt-1`}>Illustrative audience trend</p>
              <svg viewBox="0 0 320 56" className="w-full h-12 mt-3" aria-hidden>
                <polyline fill="none" stroke="#7a0036" strokeWidth="2.4" points="4,48 36,44 68,42 100,38 132,34 164,30 196,28 228,24 260,20 292,16 316,12" />
                <circle cx="316" cy="12" r="3.5" fill="#7a0036" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KitEditorChrome({ children, scrollHint = false }: { children: React.ReactNode; scrollHint?: boolean }) {
  return (
    <div className="rounded-[18px] overflow-hidden border border-[#e2e4e8] bg-white shadow-[0_28px_70px_rgba(16,24,40,0.28)]">
      <div className="h-11 border-b border-[#e6e8ec] flex items-center px-3 gap-2 bg-white">
        <span className="size-6 rounded-full border border-[#e6e8ec] text-[#6a7282] flex items-center justify-center text-sm">‹</span>
        <p className={`${FG_R} text-[12px] text-[#6a7282] truncate`}>
          Media kits / <span className={`${FG_M} text-[#101828]`}>{STAGE.kitName}</span>
        </p>
        <button type="button" className={`${FG_M} ml-auto h-8 rounded-full bg-[#185abc] text-white text-[12px] px-3.5 inline-flex items-center gap-1.5`}>
          <img alt="" src={icShare} className="size-3 brightness-0 invert" />
          Share
        </button>
      </div>
      <div className="flex min-h-0" style={{ height: scrollHint ? 460 : 420 }}>
        <aside className="hidden sm:block w-[168px] shrink-0 border-r border-[#e6e8ec] bg-white p-3 overflow-hidden">
          <p className={`${FG_R} text-[10px] text-[#6a7282] mb-1`}>Media kit name</p>
          <p className={`${FG_M} text-[12px] text-[#101828] mb-3 truncate`}>{STAGE.kitName}</p>
          <p className={`${FG_R} text-[10px] text-[#6a7282] mb-2`}>Platform analytics</p>
          <div className="flex gap-1.5 mb-3">
            {["IG", "TT", "YT", "LI"].map((label) => (
              <div key={label} className="size-8 rounded-[8px] bg-[#f4f5f7] border border-[#eeefef] flex items-center justify-center text-[9px] font-medium">
                {label}
              </div>
            ))}
          </div>
          <p className={`${FG_R} text-[10px] text-[#6a7282] mb-2`}>Types</p>
          {["Platform content", "Text", "Video", "Brand Experience"].map((x) => (
            <div key={x} className={`${FG_R} rounded-[10px] bg-[#f4f5f7] h-8 mb-1.5 flex items-center justify-between px-2.5 text-[10px] text-[#4a5565]`}>
              {x}<span>+</span>
            </div>
          ))}
        </aside>
        <div className="flex-1 min-w-0 overflow-hidden bg-[#e8ebe4]">
          {children}
        </div>
      </div>
    </div>
  );
}

function MediaKitCard() {
  const [tab, setTab] = useState<"kit" | "gmail">("kit");
  return (
    <div className="w-full" style={{ maxWidth: tab === "gmail" ? 640 : 560 }}>
      <div className="flex items-center gap-1 px-1 pb-3">
        <button type="button" onClick={() => setTab("kit")} className={`${FG_M} text-[13px] px-4 h-8 rounded-full transition-colors ${tab === "kit" ? "text-[#101828] bg-white border border-[#dedede] shadow-sm" : "text-[#6a7282] hover:text-[#101828]"}`}>Media kit</button>
        <button type="button" onClick={() => setTab("gmail")} className={`${tab === "gmail" ? FG_M : FG_R} text-[13px] px-4 h-8 rounded-full transition-colors ${tab === "gmail" ? "text-[#101828] bg-white border border-[#dedede] shadow-sm" : "text-[#6a7282] hover:text-[#101828]"}`}>Gmail embed</button>
      </div>
      {tab === "kit" ? (
        <KitEditorChrome scrollHint>
          <div className="h-full overflow-hidden">
            <MediaKitView dense />
          </div>
        </KitEditorChrome>
      ) : (
        <div className="rounded-[18px] overflow-hidden shadow-[0_28px_70px_rgba(16,24,40,0.28)] border border-[#e2e4e8]">
          <GmailView />
        </div>
      )}
      <p className={`${FG_R} text-[10px] text-[#b7bfce] mt-3`}>AI-generated demo talent · Illustrative metrics</p>
    </div>
  );
}

// ─── App chrome: Lists + Explore (staged names only) ─────────────────────────
function AppRail({ active }: { active: "lists" | "explore" }) {
  const items = [
    { id: "talent", icon: icNavHome, label: "Talent directory" },
    { id: "explore", icon: icNavSearch, label: "Explore content" },
    { id: "watch", icon: icNavWatch, label: "Watchlists" },
    { id: "lists", icon: icNavLists, label: "Lists" },
    { id: "kits", icon: icNavChat, label: "Media kits" },
  ];
  return (
    <div className="w-[158px] shrink-0 bg-[#f7f8fa] border-r border-[#eeefef] flex flex-col py-3 px-2.5">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="size-7 bg-[#101828] rounded-[8px] flex items-center justify-center">
          <img alt="Foam" className="size-3.5" src={icFoam} />
        </div>
        <div>
          <p className={`${FG_M} text-[12px] text-[#101828] leading-none`}>foam</p>
          <p className={`${FG_R} text-[9px] text-[#99a1af]`}>Beta</p>
        </div>
      </div>
      <p className={`${FG_R} text-[9px] text-[#99a1af] px-2 mb-1`}>Overview</p>
      {items.slice(0, 3).map((it) => (
        <div key={it.id} className={`h-8 rounded-[8px] px-2 flex items-center gap-2 mb-0.5 ${active === "explore" && it.id === "explore" ? "bg-[#e8eefc] text-[#185abc]" : "text-[#4a5565]"}`}>
          <img alt="" className="size-3.5 opacity-70" src={it.icon} />
          <span className={`${FG_R} text-[10px]`}>{it.label}</span>
        </div>
      ))}
      <p className={`${FG_R} text-[9px] text-[#99a1af] px-2 mt-3 mb-1`}>Share</p>
      {items.slice(3).map((it) => (
        <div key={it.id} className={`h-8 rounded-[8px] px-2 flex items-center gap-2 mb-0.5 ${active === "lists" && it.id === "lists" ? "bg-[#e8eefc] text-[#185abc]" : "text-[#4a5565]"}`}>
          <img alt="" className="size-3.5 opacity-70" src={it.icon} />
          <span className={`${FG_R} text-[10px]`}>{it.label}</span>
        </div>
      ))}
      <div className="mt-auto rounded-[10px] border border-[#eeefef] bg-white p-2">
        <p className={`${FG_M} text-[11px] text-[#101828]`}>{STAGE.agency}</p>
        <p className={`${FG_R} text-[10px] text-[#6a7282]`}>Beauty roster</p>
      </div>
    </div>
  );
}

function ListsAppView() {
  const rows = [
    { name: "Haircare shortlist", talent: "2 Talent", owner: STAGE.manager, created: "Mar 12", modified: "2d ago" },
    { name: "Beauty roster", talent: "2 Talent", owner: STAGE.manager, created: "Jan 8", modified: "5d ago" },
    { name: "Vale Studio beauty", talent: "2 Talent", owner: "Jamie Vale", created: "Feb 20", modified: "Mar 1" },
    { name: "Instagram 100K+", talent: "2 Talent", owner: STAGE.manager, created: "Apr 2", modified: "1w ago" },
  ];
  return (
    <div className="flex flex-col flex-1 min-w-0 bg-white overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <p className={`${FG_SB} text-[20px] text-[#101828]`}>Lists</p>
        <div className="flex-1 max-w-[280px] mx-auto h-9 rounded-full border border-[#e8eaed] bg-[#f9fafb] px-3 flex items-center gap-2">
          <img alt="" src={icMagnify} className="size-3.5 opacity-50" />
          <span className={`${FG_R} text-[12px] text-[#99a1af]`}>Search lists</span>
        </div>
        <button type="button" className={`${FG_M} h-8 rounded-full bg-[#185abc] text-white text-[12px] px-3 inline-flex items-center gap-1`}>
          <img alt="" src={icPlus} className="size-3 brightness-0 invert" />
          Create
        </button>
      </div>
      <div className="px-4 pb-2 flex items-center gap-2 text-[11px]">
        <span className={`${FG_R} h-7 px-2.5 rounded-full border border-[#e8eaed] text-[#4a5565] inline-flex items-center`}>Talent ▾</span>
        <span className={`${FG_R} h-7 px-2.5 rounded-full border border-[#e8eaed] text-[#4a5565] inline-flex items-center`}>Owner ▾</span>
        <span className={`${FG_R} text-[#185abc] ml-1`}>Reset</span>
        <span className={`${FG_R} text-[#6a7282] ml-auto`}>Date created (Most recent)</span>
      </div>
      <div className="px-4 overflow-hidden">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3 border-t border-[#eeefef] py-3">
            <span className="size-3.5 rounded-[3px] border border-[#d0d5dd]" />
            <img alt="" src={icNavLists} className="size-3.5 opacity-50" />
            <div className="flex-1 min-w-0">
              <p className={`${FG_M} text-[13px] text-[#101828] truncate`}>{row.name}</p>
              <p className={`${FG_R} text-[11px] text-[#6a7282]`}>{row.talent}</p>
            </div>
            <p className={`${FG_R} text-[11px] text-[#6a7282] w-[88px] truncate hidden sm:block`}>{row.owner}</p>
            <p className={`${FG_R} text-[11px] text-[#6a7282] w-[52px] hidden md:block`}>{row.created}</p>
            <p className={`${FG_R} text-[11px] text-[#6a7282] w-[52px]`}>{row.modified}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExploreAppView({ query = "haircare" }: { query?: string }) {
  return (
    <div className="flex flex-col flex-1 min-w-0 bg-[#f9fafb] overflow-hidden">
      <div className="bg-white border-b border-[#eeefef] px-4 py-3 flex items-center gap-3">
        <p className={`${FG_SB} text-[15px] text-[#101828] shrink-0`}>Explore content</p>
        <div className="flex-1 h-9 rounded-full border border-[#e8eaed] bg-white px-3 flex items-center gap-2 shadow-sm">
          <img alt="" src={icMagnify} className="size-3.5 opacity-50" />
          <span className={`${FG_M} text-[12px] text-[#101828]`}>{query}</span>
          <span className={`${FG_R} text-[11px] text-[#99a1af] ml-auto`}>×</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className={`${FG_R} h-7 px-2 rounded-[6px] border border-[#eeefef] text-[10px] text-[#6a7282] inline-flex items-center gap-1`}>
            <img alt="" src={icSort} className="size-3 opacity-60" /> Sort
          </span>
          <span className={`${FG_R} h-7 px-2 rounded-[6px] border border-[#eeefef] text-[10px] text-[#6a7282] inline-flex items-center gap-1`}>
            <img alt="" src={icGrid} className="size-3 opacity-60" /> Grid
          </span>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-[150px] shrink-0 border-r border-[#eeefef] bg-white p-3 hidden sm:block">
          <div className="flex items-center gap-1 mb-3">
            <img alt="" src={icFilters} className="size-3 opacity-60" />
            <span className={`${FG_M} text-[11px]`}>Filters</span>
          </div>
          <p className={`${FG_M} text-[10px] mb-1`}>Talent</p>
          <div className="h-7 rounded-[6px] border border-[#eeefef] bg-[#f4f5f6] px-2 flex items-center gap-1 mb-3">
            <img alt="" src={icMagnify} className="size-2.5 opacity-40" />
            <span className={`${FG_R} text-[9px] text-[#99a1af]`}>Name or handle</span>
          </div>
          <p className={`${FG_M} text-[10px] mb-2`}>Platform</p>
          {["Any", "Instagram", "TikTok", "YouTube"].map((p, i) => (
            <div key={p} className="flex items-center gap-1.5 mb-1.5">
              <span className={`size-2.5 rounded-[2px] border flex items-center justify-center ${i === 0 ? "bg-[#155fef] border-[#155fef]" : "border-[#dedede]"}`}>
                {i === 0 ? <img alt="" src={icCheck} className="size-1.5" /> : null}
              </span>
              <span className={`${FG_R} text-[10px]`}>{p}</span>
            </div>
          ))}
          <p className={`${FG_M} text-[10px] mt-3 mb-2`}>Performance</p>
          {["Views", "Likes", "Comments"].map((m) => (
            <div key={m} className="flex items-center justify-between mb-1.5">
              <span className={`${FG_R} text-[10px] text-[#6a7282]`}>{m}</span>
              <span className={`${FG_R} text-[9px] text-[#6a7282] border border-[#eeefef] rounded px-1`}>Any</span>
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between">
            <span className={`${FG_R} text-[10px] text-[#185abc]`}>Reset all</span>
            <span className={`${FG_M} text-[10px] text-white bg-[#185abc] rounded-full px-2.5 h-6 inline-flex items-center`}>Apply</span>
          </div>
        </div>
        <div className="flex-1 p-3 overflow-hidden">
          <div className="grid grid-cols-3 gap-2">
            {CONTENT.map((tile, i) => (
              <div key={tile.src} className="relative rounded-[10px] overflow-hidden bg-[#101828] aspect-[3/4]">
                <img alt={tile.alt} src={tile.src} className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {i === 0 && (
                  <span className={`${FG_M} absolute top-1.5 left-1.5 bg-white/95 text-[8px] text-[#101828] rounded px-1.5 py-0.5`}>Strong Match</span>
                )}
                <div className="absolute bottom-0 inset-x-0 p-1.5">
                  <div className={`${FG_R} text-[9px] text-white/90 flex gap-2 mb-1`}>
                    {tile.views && <span className="inline-flex items-center gap-1"><LabIcon name="eye" size={10} />{tile.views}</span>}
                    {tile.engagements && <span className="inline-flex items-center gap-1"><LabIcon name="heart" size={10} />{tile.engagements}</span>}
                    {!tile.views && <span>Draft asset</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <img alt="" src={STAGE.photo} className="size-4 rounded-full object-cover" />
                    <span className={`${FG_M} text-[9px] text-white truncate`}>{STAGE.name}</span>
                    <span className="text-[8px] text-white/80 ml-auto">{tile.platform}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FoamProductFrame({ children, height = 420 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="rounded-[16px] overflow-hidden border border-[#dedede] shadow-[0_24px_64px_rgba(16,24,40,0.14)] bg-white">
      <div className="bg-[#f4f5f6] border-b border-[#eeefef] px-4 h-9 flex items-center gap-3">
        <div className="flex gap-[6px]">
          <div className="size-2.5 rounded-full bg-[#ff5f57]" />
          <div className="size-2.5 rounded-full bg-[#febc2e]" />
          <div className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-white border border-[#eeefef] rounded-[6px] h-[20px] flex items-center px-3 max-w-[220px] mx-auto">
          <span className={`${FG_R} text-[10px] text-[#99a1af]`}>Foam.io</span>
        </div>
      </div>
      <div className="flex overflow-hidden" style={{ height }}>{children}</div>
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen bg-navy flex items-center px-6 pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-14">
          <div className="flex-1 min-w-0 max-w-[520px]">
            <p className={`${FG_M} text-[11px] uppercase tracking-[2px] mb-8`} style={{ color: "var(--text-subtle)" }}>
              The truth layer
            </p>
            <h1
              className={`${FG_SB} text-white leading-[1.0] tracking-[-2px] mb-7`}
              style={{ fontSize: "clamp(48px, 6.5vw, 80px)" }}
            >
              Numbers everyone in the deal can trust.
            </h1>
            <p
              className={`${FG_R} text-[17px] leading-7 mb-12`}
              style={{ color: "var(--text-subtle)", maxWidth: 480 }}
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
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#pitch-loop"
                className={`${FG_M} text-[16px] text-white flex items-center gap-2 border-b border-white/30 hover:border-white/70 transition-colors pb-[2px]`}
              >
                Follow a pitch
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex-1 min-w-0 w-full flex justify-center lg:justify-end">
            <MediaKitCard />
          </div>
        </div>
      </div>
    </section>
  );
}

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

// ─── Continuous pitch-on-scroll (same staged talent end to end) ──────────────
function PitchStoryDesktop() {
  const [step, setStep] = useState(0);
  const STEPS = [
    ["01", "The brief"],
    ["02", "Explore"],
    ["03", "The list"],
    ["04", "The kit"],
    ["05", "Shared"],
  ];
  const COPY = [
    ["01 / The brief", "Who makes haircare feel effortless?", "A haircare brand wants approachable routines, 100K+ on Instagram, and a creator who can make the product part of everyday life. Options by Friday.", "You already know who."],
    ["02 / Explore", "Type it the way you'd say it.", `Search ${STAGE.agency}'s content for "haircare". Find the curl routine that backs up ${STAGE.name}.`, "Now put them on a list."],
    ["03 / The list", "One shortlist. Shareable.", "A beauty shortlist brings Samantha Pikka and Aria Quen together. Compare their content, audiences and individual fit for the brief.", "Open the kit."],
    ["04 / The kit", "Connected numbers. Your colours.", `${STAGE.name}. ${STAGE.total} total audience. IG ${STAGE.ig.n}, TT ${STAGE.tt.n}, YT ${STAGE.yt.n}, LI ${STAGE.li.n}. Content and receipts on the same scroll.`, "Share it."],
    ["05 / Shared", "They opened it. You know.", "Paste into Gmail from Foam. See which client opened the list, which profiles they viewed, and when they came back.", "Make the next conversation count."],
  ];
  const go = (n: number) => setStep((s) => (s + n + 5) % 5);
  const touchX = useRef<number | null>(null);
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const passed = Math.min(Math.max(-rect.top, 0), total);
      const next = Math.min(4, Math.floor((passed / total) * 5));
      setStep((s) => (s === next ? s : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={root}
      id="pitch-loop"
      className="relative h-[220vh] bg-[#f7f8fb]"
      onTouchStart={(e) => { touchX.current = e.changedTouches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -40) go(1);
        if (dx > 40) go(-1);
        touchX.current = null;
      }}
    >
      <div className="sticky top-0 h-screen overflow-hidden px-6 py-10 flex flex-col justify-center">
        <div className="max-w-[1200px] mx-auto w-full">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <p className={`${FG_R} text-sm text-muted`}>One pitch. Same talent. Foam working on scroll.</p>
            <p className={`${FG_R} text-sm text-muted`}>Haircare brief · Staged example · {STAGE.name}</p>
          </div>
          <div className="grid lg:grid-cols-[0.78fr_1.22fr] gap-8 xl:gap-12 items-start">
            <div>
              <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted mb-4`}>{COPY[step][0]}</p>
              <h2 className={`${FG_SB} text-[34px] md:text-[40px] leading-[1.05] tracking-[-1px] text-text mb-5`}>
                {COPY[step][1]}
              </h2>
              <p className={`${FG_R} text-[16px] leading-7 text-muted mb-6 max-w-[400px]`}>
                {COPY[step][2]}
              </p>
              <div className="border-t border-border pt-5">
                <p className={`${FG_M} text-sm text-text`}>{COPY[step][3]}</p>
              </div>
              {step === 3 && (
                <div className="mt-6 grid grid-cols-3 gap-3 max-w-[360px]">
                  {[
                    [STAGE.totalShort, "Total audience"],
                    [STAGE.ig.n, "Instagram"],
                    [TOP_POST_VIEWS, "Top post views"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <p className={`${FG_SB} text-[22px] text-text leading-none`}>{v}</p>
                      <p className={`${FG_R} text-[11px] text-muted mt-1`}>{l}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[24px] p-2.5 md:p-3" style={{ background: "linear-gradient(180deg,#eef2f8 0%,#f7f8fb 100%)", boxShadow: "0 30px 80px rgba(16,24,40,0.12)" }}>
              {step === 0 && (
                <div className="bg-white rounded-[18px] overflow-hidden border border-[#e8eaed] flex flex-col min-h-[400px]">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#eef0f3]">
                    <span className={`${FG_SB} text-[15px] text-[#d93025]`}>M</span>
                    <span className={`${FG_SB} text-[14px] text-[#202124]`}>Gmail</span>
                    <div className="flex-1 h-8 rounded-full bg-[#e8f0fe] px-4 flex items-center text-[12px] text-[#5f6368]">Search mail</div>
                    <div className="size-8 rounded-full bg-[#e6c9a8] text-[#5b4636] flex items-center justify-center text-[12px] font-medium">R</div>
                  </div>
                  <div className="flex flex-1 min-h-0">
                    <div className="w-[110px] shrink-0 bg-[#f4f6fb] p-3 text-[11px] text-[#5f6368] border-r border-[#eef0f3]">
                      <p className={`${FG_M} bg-[#d3e3fd] text-[#041e49] rounded-full px-3 py-1.5 mb-2 text-center`}>Compose</p>
                      <div className={`${FG_M} bg-[#e8f0fe] text-[#041e49] rounded-full px-3 py-1.5 mb-3 flex items-center justify-between`}>Inbox <span>12</span></div>
                      <p className="px-2 py-1">Starred</p>
                      <p className="px-2 py-1">Sent</p>
                    </div>
                    <div className="flex-1 p-5">
                      <p className={`${FG_SB} text-[16px] text-[#202124] mb-4`}>Haircare launch: who should we meet?</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="size-8 rounded-full bg-[#d3e3fd] text-[#041e49] flex items-center justify-center text-[12px] shrink-0">A</div>
                        <div>
                          <p className={`${FG_M} text-[12px] text-[#202124]`}>Alex · Everyday Hair</p>
                          <p className={`${FG_R} text-[11px] text-[#5f6368]`}>to me · 10:42 AM</p>
                        </div>
                      </div>
                      <p className={`${FG_R} text-[13px] text-[#202124] leading-5 mb-3`}>Hi {STAGE.manager.split(" ")[0]},</p>
                      <p className={`${FG_R} text-[13px] text-[#202124] leading-5 mb-3`}>
                        We're looking for a beauty creator who makes haircare feel approachable. Someone with a routine their audience can actually follow.
                      </p>
                      <div className="border-l-2 border-[#d3e3fd] pl-3 mb-3 text-[13px] text-[#202124] space-y-1">
                        <p>100K+ on Instagram</p>
                        <p>Approachable beauty content</p>
                        <p>Everyday haircare routines</p>
                      </div>
                      <p className={`${FG_R} text-[13px] text-[#202124]`}>Could you send a few options by Friday?</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <FoamProductFrame height={420}>
                  <AppRail active="explore" />
                  <ExploreAppView query="haircare" />
                </FoamProductFrame>
              )}

              {step === 2 && (
                <FoamProductFrame height={420}>
                  <AppRail active="lists" />
                  <ListsAppView />
                </FoamProductFrame>
              )}

              {step === 3 && (
                <KitEditorChrome>
                  <div className="h-full overflow-hidden">
                    <MediaKitView dense scrollY={18} />
                  </div>
                </KitEditorChrome>
              )}

              {step === 4 && (
                <div className="grid md:grid-cols-2 gap-3 min-h-[400px]">
                  <div className="rounded-[18px] overflow-hidden border border-[#e8eaed] bg-white">
                    <GmailView step={3} />
                  </div>
                  <div className="bg-[#f4f5f7] rounded-[18px] border border-[#e8eaed] p-5">
                    <div className="flex items-center justify-between mb-6">
                      <p className={`${FG_SB} text-[16px] text-text`}>foam <span className={`${FG_R} text-sm text-muted ml-2`}>Notifications</span></p>
                      <div className="size-8 rounded-full bg-[#e6c9a8] flex items-center justify-center text-[12px]">R</div>
                    </div>
                    <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted mb-2`}>Shared list · Haircare shortlist</p>
                    <h3 className={`${FG_SB} text-[24px] text-text mb-1`}>Your pitch has company.</h3>
                    <p className={`${FG_R} text-sm text-muted mb-5`}>Alex at Everyday Hair</p>
                    {[
                      ["10:18 AM", "Opened your list", "Haircare shortlist", false],
                      ["10:21 AM", `Viewed ${STAGE.name}'s profile`, "A closer look at your recommendation", false],
                      ["2:46 PM", "Returned to your list", "Another look, later that afternoon", true],
                    ].map(([time, title, sub, fresh]) => (
                      <div key={String(title)} className="border-t border-border py-3.5 flex items-start justify-between gap-3">
                        <div>
                          <p className={`${FG_R} text-[11px] text-muted`}>{time}</p>
                          <p className={`${FG_SB} text-sm text-text`}>{title}</p>
                          <p className={`${FG_R} text-sm text-muted`}>{sub}</p>
                        </div>
                        {fresh ? <span className="text-[11px] bg-[#e8f0fe] text-[#185abc] rounded-full px-2 py-0.5">New</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-5 gap-3">
            {STEPS.map(([n, label], i) => (
              <button key={n} type="button" onClick={() => setStep(i)} className="text-left">
                <div className={`h-[3px] mb-3 transition-colors ${i === step ? "bg-[#c6f31e]" : "bg-[#e5e5e5]"}`} />
                <p className={`${FG_M} text-[12px] ${i === step ? "text-text" : "text-muted"}`}>{n}  {label}</p>
              </button>
            ))}
          </div>
          <p className={`${FG_R} text-[12px] text-muted mt-5`}>Staged product example. AI-generated creators and illustrative figures.</p>
        </div>
      </div>
    </section>
  );
}

function PitchBeatFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[20px] p-2 mt-6"
      style={{ background: "linear-gradient(180deg,#eef2f8 0%,#f7f8fb 100%)", boxShadow: "0 18px 48px rgba(16,24,40,0.1)" }}
    >
      {children}
    </div>
  );
}

/** Mobile home pitch: same five beats as stacked sections, no sticky scrub. */
function PitchStoryMobile() {
  const COPY = [
    {
      kicker: "01 / The brief",
      title: "Who makes haircare feel effortless?",
      body: "A haircare brand wants approachable routines, 100K+ on Instagram, and a creator who can make the product part of everyday life. Options by Friday.",
      next: "You already know who.",
      frame: "brief" as const,
    },
    {
      kicker: "02 / Explore",
      title: "Type it the way you'd say it.",
      body: `Search ${STAGE.agency}'s content for "haircare". Find the curl routine that backs up ${STAGE.name}.`,
      next: "Now put them on a list.",
      frame: "explore" as const,
    },
    {
      kicker: "03 / The list",
      title: "One shortlist. Shareable.",
      body: "A beauty shortlist brings Samantha Pikka and Aria Quen together. Compare their content, audiences and individual fit for the brief.",
      next: "Open the kit.",
      frame: "lists" as const,
    },
    {
      kicker: "04 / The kit",
      title: "Connected numbers. Your colours.",
      body: `${STAGE.name}. ${STAGE.total} total audience. IG ${STAGE.ig.n}, TT ${STAGE.tt.n}, YT ${STAGE.yt.n}, LI ${STAGE.li.n}. Content and receipts on the same page.`,
      next: "Share it.",
      frame: "kit" as const,
    },
    {
      kicker: "05 / Shared",
      title: "They opened it. You know.",
      body: "Paste into Gmail from Foam. See which client opened the list, which profiles they viewed, and when they came back.",
      next: "Make the next conversation count.",
      frame: "shared" as const,
    },
  ];

  return (
    <section id="pitch-loop" className="bg-[#f7f8fb]">
      <div className="px-5 pt-12 pb-4">
        <MobileFade>
          <p className={`${FG_R} text-sm text-muted`}>One pitch. Same talent. Foam from brief to open.</p>
          <p className={`${FG_R} text-sm text-muted mt-1`}>Haircare brief · Staged example · {STAGE.name}</p>
        </MobileFade>
      </div>

      {COPY.map((beat, i) => (
        <div key={beat.kicker} className="px-5 py-10 border-t border-[#e8eaed]/80">
          <MobileFade delayMs={i === 0 ? 0 : 40}>
            <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted mb-3`}>{beat.kicker}</p>
            <h2 className={`${FG_SB} text-[28px] leading-[1.08] tracking-[-0.8px] text-text mb-4`}>
              {beat.title}
            </h2>
            <p className={`${FG_R} text-[15px] leading-6 text-muted mb-5`}>{beat.body}</p>
            <div className="border-t border-border pt-4">
              <p className={`${FG_M} text-sm text-text`}>{beat.next}</p>
            </div>
            {beat.frame === "kit" && (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  [STAGE.totalShort, "Total audience"],
                  [STAGE.ig.n, "Instagram"],
                  [TOP_POST_VIEWS, "Top post views"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className={`${FG_SB} text-[20px] text-text leading-none`}>{v}</p>
                    <p className={`${FG_R} text-[11px] text-muted mt-1`}>{l}</p>
                  </div>
                ))}
              </div>
            )}
          </MobileFade>

          <MobileFade delayMs={80}>
            <PitchBeatFrame>
              {beat.frame === "brief" && (
                <div className="bg-white rounded-[16px] overflow-hidden border border-[#e8eaed] p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`${FG_SB} text-[14px] text-[#d93025]`}>M</span>
                    <span className={`${FG_SB} text-[13px] text-[#202124]`}>Gmail</span>
                  </div>
                  <p className={`${FG_SB} text-[15px] text-[#202124] mb-3`}>Haircare launch: who should we meet?</p>
                  <p className={`${FG_M} text-[12px] text-[#202124] mb-1`}>Alex · Everyday Hair</p>
                  <p className={`${FG_R} text-[13px] text-[#202124] leading-5 mb-3`}>
                    Looking for a beauty creator with an everyday haircare routine. 100K+ on Instagram. Options by Friday?
                  </p>
                  <div className="border-l-2 border-[#d3e3fd] pl-3 text-[12px] text-[#202124] space-y-1">
                    <p>100K+ on Instagram</p>
                    <p>Approachable beauty content</p>
                    <p>Everyday haircare routines</p>
                  </div>
                </div>
              )}
              {beat.frame === "explore" && (
                <FoamProductFrame height={360}>
                  <ExploreAppView query="haircare" />
                </FoamProductFrame>
              )}
              {beat.frame === "lists" && (
                <FoamProductFrame height={360}>
                  <ListsAppView />
                </FoamProductFrame>
              )}
              {beat.frame === "kit" && (
                <KitEditorChrome>
                  <div className="h-full overflow-hidden">
                    <MediaKitView dense scrollY={8} />
                  </div>
                </KitEditorChrome>
              )}
              {beat.frame === "shared" && (
                <div className="flex flex-col gap-3">
                  <div className="rounded-[16px] overflow-hidden border border-[#e8eaed] bg-white">
                    <GmailView step={3} />
                  </div>
                  <div className="bg-[#f4f5f7] rounded-[16px] border border-[#e8eaed] p-4">
                    <p className={`${FG_M} text-[11px] uppercase tracking-[0.8px] text-muted mb-2`}>Shared list · Haircare shortlist</p>
                    <h3 className={`${FG_SB} text-[20px] text-text mb-1`}>Your pitch has company.</h3>
                    <p className={`${FG_R} text-sm text-muted mb-4`}>Alex at Everyday Hair</p>
                    {[
                      ["10:18 AM", "Opened your list"],
                      ["10:21 AM", `Viewed ${STAGE.name}'s profile`],
                      ["2:46 PM", "Returned to your list"],
                    ].map(([time, title]) => (
                      <div key={title} className="border-t border-border py-3">
                        <p className={`${FG_R} text-[11px] text-muted`}>{time}</p>
                        <p className={`${FG_SB} text-sm text-text`}>{title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PitchBeatFrame>
          </MobileFade>
        </div>
      ))}

      <p className={`${FG_R} text-[12px] text-muted px-5 pb-10`}>
        Staged product example. AI-generated creators and illustrative figures.
      </p>
    </section>
  );
}

function PitchStory() {
  const isDesktop = useIsDesktop();
  if (isDesktop === null) {
    return <section id="pitch-loop" className="min-h-[40vh] bg-[#f7f8fb]" aria-hidden />;
  }
  return isDesktop ? <PitchStoryDesktop /> : <PitchStoryMobile />;
}

function ShareProof() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
        <div>
          <p className={`${FG_M} text-xs text-brand uppercase tracking-[0.8px] mb-4`}>From kit to inbox</p>
          <h2 className={`${FG_SB} text-text leading-[1.05] tracking-[-1px] mb-5`} style={{ fontSize: "clamp(28px, 3.6vw, 42px)" }}>
            Same numbers in the reply the brand opens.
          </h2>
          <p className={`${FG_R} text-[16px] leading-7 text-muted mb-6 max-w-[420px]`}>
            {STAGE.name}'s kit, list, and Gmail embed stay on one thread: {STAGE.total} total, IG {STAGE.ig.n}, TT {STAGE.tt.n}, YT {STAGE.yt.n}, LI {STAGE.li.n}.
          </p>
          <div className="flex flex-col gap-2.5 mb-8">
            {[
              "Live stats at the moment of send",
              "Brand opens tracked automatically",
              "Works directly inside Gmail",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="size-[6px] rounded-full bg-brand shrink-0" />
                <span className={`${FG_R} text-[15px] text-muted`}>{f}</span>
              </div>
            ))}
          </div>
          <Link to="/demo" className={`${FG_M} text-[15px] text-brand hover:opacity-80 transition-opacity`}>
            Get a demo →
          </Link>
        </div>
        <div className="rounded-[20px] overflow-hidden border border-[#e8eaed] shadow-[0_20px_50px_rgba(16,24,40,0.1)]">
          <GmailView step={3} />
        </div>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <LogoMarquee />
      <ValueProp />
      <ProofBar />
      <PitchStory />
      <ShareProof />
      <ClosingCTA
        headline="Get a demo."
        sub="Creators connect their data at source. Managers pitch with it."
      />
    </>
  );
}
