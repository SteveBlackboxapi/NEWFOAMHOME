/**
 * FoamAppScreen — faithful reproduction of the actual Foam product UI
 * Used as visual proof in marketing page mockup sections.
 *
 * Two variants:
 *   variant="roster"  → talent list with View media kit CTAs
 *   variant="search"  → content search masonry grid
 */

const A = `${import.meta.env.BASE_URL}assets`;

// ─── Sidebar icons (from Figma design assets) ──────────────────────────────
const icNavHome    = `${A}/db233.svg`; // people/roster
const icNavSearch  = `${A}/5630d.svg`; // content search (nav icon 1)
const icNavLists   = `${A}/26407.svg`; // lists
const icNavWatch   = `${A}/5c880.svg`; // watchlist
const icNavChat    = `${A}/4f583.svg`; // messaging
const icFoamLogo   = `${A}/fdb3b.svg`; // foam F symbol (white)
const icBriefcase  = `${A}/f1847.svg`;
const icIG         = `${A}/20684.svg`;
const icTT         = `${A}/8509e.svg`;
const icYT         = `${A}/d0b8e.svg`;
const icMagnify    = `${A}/333bb.svg`;
const icPlus       = `${A}/30501.svg`;
const icShare      = `${A}/a2840.svg`;
const icFilters    = `${A}/462ac.svg`;
const icGrid       = `${A}/8b982.svg`;
const icSort       = `${A}/de843.svg`;
const icCheck      = `${A}/875ea.svg`;
const icRadio      = `${A}/5fb1f.svg`;

// Talent portrait photos
const photoAliedy   = `${A}/9e849.png`;
const photoCarolyn  = `${A}/3546d.png`;
const photoCassandra= `${A}/b93cd.png`;

// Content grid images (from Explore content screen)
const contentImgs = [
  `${A}/5f2d5.png`, `${A}/3cf05.png`, `${A}/d52d8.png`, `${A}/fe72f.png`,
  `${A}/d63c0.png`, `${A}/ded1e.png`, `${A}/53bfb.png`, `${A}/1f42c.png`,
  `${A}/7c514.png`, `${A}/36267.png`, `${A}/3ce59.png`, `${A}/03ef9.png`,
  `${A}/499ca.png`, `${A}/79673.png`, `${A}/f28d9.png`, `${A}/60da6.png`,
];

const platformIcons: Record<string, string> = { ig: icIG, tt: icTT, yt: icYT };

// ─── Browser chrome ──────────────────────────────────────────────────────────
function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] overflow-hidden border border-[#dedede] shadow-[0_24px_64px_rgba(16,24,40,0.14)] bg-white select-none">
      {/* Title bar */}
      <div className="bg-[#f4f5f6] border-b border-[#eeefef] px-4 h-10 flex items-center gap-3">
        <div className="flex gap-[6px]">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-white border border-[#eeefef] rounded-[6px] h-[22px] flex items-center px-3 max-w-[260px] mx-auto gap-2">
          <div className="size-[10px] rounded-full bg-[#eeefef] shrink-0" />
          <span className="font-founders font-normal text-[10px] text-[#99a1af]">Foam.io</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── App sidebar ─────────────────────────────────────────────────────────────
function AppSidebar({ active }: { active: "roster" | "search" }) {
  const items = [
    { id: "roster", icon: icNavHome   },
    { id: "search", icon: icNavSearch },
    { id: "lists",  icon: icNavLists  },
    { id: "watch",  icon: icNavWatch  },
    { id: "chat",   icon: icNavChat   },
  ];
  return (
    <div className="w-12 bg-[#0a0e1a] flex flex-col items-center py-3 gap-1 shrink-0">
      {/* Foam logo */}
      <div className="size-8 bg-[#7a0036] rounded-[8px] flex items-center justify-center mb-2 shrink-0">
        <img alt="Foam" className="size-[18px]" src={icFoamLogo} />
      </div>
      {items.map(it => (
        <div
          key={it.id}
          className={`size-9 rounded-[8px] flex items-center justify-center ${
            it.id === active ? "bg-white/10" : ""
          }`}
        >
          <img alt="" className="size-4 opacity-60" src={it.icon} />
        </div>
      ))}
      <div className="flex-1" />
      <div className="size-7 rounded-full bg-[#1e2939] flex items-center justify-center mb-1">
        <span className="font-founders font-medium text-[10px] text-white">A</span>
      </div>
    </div>
  );
}

// ─── Roster view ─────────────────────────────────────────────────────────────
function SocialStat({ icon, val }: { icon: string; val: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <img alt="" className="size-[14px] shrink-0" src={icon} />
      <span className="font-founders font-medium text-[12px] leading-[18px] tracking-[0.2px] text-[#101828]">{val}</span>
    </div>
  );
}

function TalentTag({ label }: { label: string }) {
  return (
    <span className="font-founders font-normal text-[10px] leading-[14px] tracking-[0.2px] text-[#101828] bg-[#f4f5f6] border border-[#eeefef] rounded-[4px] px-[6px] py-[2px] shrink-0">
      {label}
    </span>
  );
}

type TalentRow = {
  photo: string;
  name: string;
  age: string;
  gender: string;
  location: string;
  ig: string; tt: string; yt: string;
  bio: string;
  tags: string[];
  manager: string;
};

function TalentCard({ t }: { t: TalentRow }) {
  return (
    <div className="border-b border-[#eeefef] px-4 py-4 flex gap-4 items-start">
      <div className="relative size-[72px] rounded-[10px] overflow-hidden shrink-0 bg-[#f4f5f6]">
        <img
          alt={t.name}
          src={t.photo}
          className="absolute top-0 left-[-4%] w-[108%] h-[115%] object-cover object-top"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="font-founders font-medium text-[14px] leading-[20px] tracking-[0.2px] text-[#101828]">{t.name}</p>
            <p className="font-founders font-normal text-[12px] leading-[18px] tracking-[0.2px] text-[#6a7282]">
              {t.age} · {t.gender}
            </p>
            <p className="font-founders font-normal text-[12px] leading-[18px] tracking-[0.2px] text-[#6a7282]">{t.location}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-[2px]">
            <SocialStat icon={icIG} val={t.ig} />
            <SocialStat icon={icTT} val={t.tt} />
            <SocialStat icon={icYT} val={t.yt} />
          </div>
        </div>
        <p className="font-founders font-normal text-[11px] leading-[16px] tracking-[0.2px] text-[#6a7282] mt-2 line-clamp-2">{t.bio}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="flex items-center gap-1">
            <img alt="" className="size-[10px] opacity-40" src={icBriefcase} />
            <span className="font-founders font-normal text-[10px] leading-[14px] tracking-[0.2px] text-[#99a1af]">{t.manager}</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {t.tags.map(tag => <TalentTag key={tag} label={tag} />)}
          </div>
        </div>
      </div>
      <button className="shrink-0 bg-[#7a0036] text-white font-founders font-medium text-[11px] leading-[14px] tracking-[0.2px] px-3 h-7 rounded-full hover:bg-[#6a002f] transition-colors">
        View media kit
      </button>
    </div>
  );
}

const TALENT_DATA: TalentRow[] = [
  {
    photo: photoAliedy,
    name: "Ren Cole", age: "32y", gender: "Male", location: "Portland, OR",
    ig: "131K", tt: "97K", yt: "58K",
    bio: "Early miles and long runs. A roster example for demonstration only.",
    tags: ["Beauty", "Advocacy", "BIPOC"],
    manager: "Rowan Hale",
  },
  {
    photo: photoCarolyn,
    name: "Io Marin", age: "28y", gender: "Female", location: "Lisbon",
    ig: "164K", tt: "89K", yt: "12K",
    bio: "Early miles and long runs. A roster example for demonstration only.",
    tags: ["Beauty", "Advocacy", "BIPOC"],
    manager: "Rowan Hale",
  },
  {
    photo: photoCassandra,
    name: "Sable Quinn", age: "33y", gender: "Female", location: "Glasgow",
    ig: "131K", tt: "97K", yt: "58K",
    bio: "Studio sessions and late rooms. A roster example for demonstration only.",
    tags: ["Beauty", "Advocacy", "BIPOC"],
    manager: "Rowan Hale",
  },
];

function RosterView() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-[#eeefef] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <img alt="Vale Studio" className="h-5 shrink-0" src={`${A}/cb650.svg`} />
          <span className="font-founders font-normal text-[11px] text-[#99a1af]">/</span>
          <div>
            <p className="font-founders font-medium text-[13px] leading-tight text-[#101828]">Harbor Spring Roster</p>
            <p className="font-founders font-normal text-[10px] text-[#6a7282]">14 talent</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-[#f4f5f6] border border-[#eeefef] rounded-[6px] px-2 h-7">
            <img alt="" className="size-3 opacity-50" src={icMagnify} />
            <span className="font-founders font-normal text-[10px] text-[#99a1af]">Name or handle</span>
          </div>
          <button className="flex items-center gap-1 bg-[#7a0036] text-white rounded-full px-2 h-6 shrink-0">
            <img alt="" className="size-3" src={icPlus} />
            <span className="font-founders font-medium text-[10px]">Add talent</span>
          </button>
          <button className="flex items-center gap-1 border border-[#eeefef] rounded-full px-2 h-6 shrink-0">
            <img alt="" className="size-3" src={icShare} />
            <span className="font-founders font-medium text-[10px] text-[#101828]">Share</span>
          </button>
        </div>
      </div>
      {/* Talent cards */}
      <div className="overflow-hidden flex-1">
        {TALENT_DATA.map(t => <TalentCard key={t.name} t={t} />)}
      </div>
    </div>
  );
}

// ─── Content search view ──────────────────────────────────────────────────────
function FilterSidebar() {
  return (
    <div className="w-[160px] shrink-0 border-r border-[#eeefef] overflow-hidden bg-white py-3 px-3 flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <img alt="" className="size-[12px] opacity-60" src={icFilters} />
        <span className="font-founders font-medium text-[11px] text-[#101828]">Filters</span>
      </div>
      {/* Talent filter */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-founders font-medium text-[10px] text-[#101828]">Talent</span>
          <div className="size-3 rounded-full bg-[#eeefef] flex items-center justify-center">
            <span className="text-[7px] text-[#6a7282]">^</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#f4f5f6] border border-[#eeefef] rounded-[4px] px-2 h-6">
          <img alt="" className="size-[10px] opacity-40" src={icMagnify} />
          <span className="font-founders font-normal text-[9px] text-[#99a1af]">Name or handle</span>
        </div>
      </div>
      {/* Platform filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-founders font-medium text-[10px] text-[#101828]">Platform</span>
          <div className="size-3 rounded-full bg-[#eeefef] flex items-center justify-center">
            <span className="text-[7px] text-[#6a7282]">^</span>
          </div>
        </div>
        {["Any", "Instagram", "TikTok", "YouTube"].map((p, i) => (
          <div key={p} className="flex items-center gap-[6px] mb-1">
            <div className={`size-[10px] rounded-[2px] border ${i === 0 ? "bg-[#155fef] border-[#155fef]" : "border-[#dedede]"} flex items-center justify-center`}>
              {i === 0 && <img alt="" className="size-[6px]" src={icCheck} />}
            </div>
            <span className="font-founders font-normal text-[10px] text-[#101828]">{p}</span>
          </div>
        ))}
      </div>
      {/* Performance metrics */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-founders font-medium text-[10px] text-[#101828]">Performance metrics</span>
          <div className="size-3 rounded-full bg-[#eeefef] flex items-center justify-center">
            <span className="text-[7px] text-[#6a7282]">^</span>
          </div>
        </div>
        {["Views", "Likes", "Comments"].map(m => (
          <div key={m} className="flex items-center justify-between mb-2">
            <span className="font-founders font-normal text-[10px] text-[#6a7282]">{m}</span>
            <div className="flex items-center gap-1 border border-[#eeefef] rounded-[4px] px-1 h-[18px]">
              <span className="font-founders font-normal text-[9px] text-[#6a7282]">Any</span>
              <span className="text-[8px] text-[#99a1af]">▾</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ContentCardProps = {
  imgSrc: string;
  platform: "ig" | "tt" | "yt";
  views: string;
  likes: string;
  comments: string;
  creator: string;
  match?: boolean;
};

function ContentCard({ imgSrc, platform, views, likes, comments, creator, match }: ContentCardProps) {
  return (
    <div className="relative rounded-[8px] overflow-hidden bg-[#101828] aspect-[9/16]">
      <img alt="" className="absolute inset-0 size-full object-cover" src={imgSrc} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {match && (
        <div className="absolute top-1 left-1 bg-white/90 rounded-[4px] px-1 py-[2px]">
          <span className="font-founders font-medium text-[7px] text-[#101828]">Strong Match</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-[6px]">
        <div className="flex items-center gap-1 mb-1">
          <img alt="" className="size-[10px] opacity-70" src={icIG} />
          <span className="font-founders font-normal text-[8px] text-white/80">{views}</span>
          <img alt="" className="size-[10px] opacity-70 ml-1" src={icTT} />
          <span className="font-founders font-normal text-[8px] text-white/80">{likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-[14px] rounded-full bg-[#7a0036] flex items-center justify-center shrink-0">
            <span className="font-founders font-medium text-[7px] text-white">A</span>
          </div>
          <span className="font-founders font-normal text-[8px] text-white">{creator}</span>
          <img alt="" className="size-[10px] opacity-70 ml-auto" src={platformIcons[platform]} />
        </div>
      </div>
    </div>
  );
}

const CONTENT_PLATFORMS: ContentCardProps["platform"][] = ["ig","tt","yt","ig","tt","ig","tt","yt","ig","tt","ig","tt","yt","ig","tt","ig"];

function ContentSearchView() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search header */}
      <div className="border-b border-[#eeefef] px-4 py-3 flex items-center gap-3 shrink-0">
        <p className="font-founders font-medium text-[13px] text-[#101828] shrink-0">Explore content</p>
        <div className="flex-1 flex items-center gap-2 bg-[#f4f5f6] border border-[#eeefef] rounded-[20px] px-3 h-8">
          <img alt="" className="size-3 opacity-50" src={icMagnify} />
          <span className="font-founders font-normal text-[11px] text-[#99a1af]">Describe the content you're searching for</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-[#eeefef] rounded-[6px] px-2 h-7">
            <img alt="" className="size-3 opacity-60" src={icSort} />
            <span className="font-founders font-normal text-[10px] text-[#6a7282]">Sort</span>
          </div>
          <div className="flex items-center gap-1 border border-[#eeefef] rounded-[6px] px-2 h-7">
            <img alt="" className="size-3 opacity-60" src={icGrid} />
            <span className="font-founders font-normal text-[10px] text-[#6a7282]">Grid</span>
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar />
        {/* Masonry grid */}
        <div className="flex-1 overflow-hidden p-3">
          <div className="columns-4 gap-2 space-y-2">
            {contentImgs.map((src, i) => (
              <div key={i} className="break-inside-avoid mb-2">
                <ContentCard
                  imgSrc={src}
                  platform={CONTENT_PLATFORMS[i % CONTENT_PLATFORMS.length]}
                  views="980.2K"
                  likes="293.2K"
                  comments="124.8K"
                  creator="Ren Cole"
                  match={i % 3 === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
type Props = {
  variant?: "roster" | "search";
  className?: string;
};

export function FoamAppScreen({ variant = "roster", className = "" }: Props) {
  return (
    <div className={className}>
      <BrowserChrome>
        <div className="flex overflow-hidden" style={{ height: variant === "roster" ? 380 : 420 }}>
          <AppSidebar active={variant === "roster" ? "roster" : "search"} />
          {variant === "roster" ? <RosterView /> : <ContentSearchView />}
        </div>
      </BrowserChrome>
    </div>
  );
}
