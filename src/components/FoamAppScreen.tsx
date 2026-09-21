/**
 * FoamAppScreen — faithful reproduction of the actual Foam product UI
 * Used as visual proof in marketing page mockup sections.
 *
 * Two variants:
 *   variant="roster"  → talent list with View media kit CTAs
 *   variant="search"  → content search masonry grid
 */
import { LabIcon } from "./TalentLabIcon";
import { formatWebsiteMetric, websiteAria, websiteProfile, websiteSamantha } from "../data/websiteTalent";
import type { TalentContentTile } from "../data/stagedTalent";

const A = `${import.meta.env.BASE_URL}assets`;

// ─── Sidebar icons (from Figma design assets) ──────────────────────────────
const icNavHome    = `${A}/db233.svg`; // people/roster
const icNavSearch  = `${A}/5630d.svg`; // content search (nav icon 1)
const icNavLists   = `${A}/26407.svg`; // lists
const icNavWatch   = `${A}/5c880.svg`; // watchlist
const icNavChat    = `${A}/4f583.svg`; // messaging
const icFoamLogo   = `${A}/fdb3b.svg`; // foam F symbol (white)
const icBriefcase  = `${A}/f1847.svg`;
const icMagnify    = `${A}/333bb.svg`;
const icPlus       = `${A}/30501.svg`;
const icShare      = `${A}/a2840.svg`;
const icFilters    = `${A}/462ac.svg`;
const icGrid       = `${A}/8b982.svg`;
const icSort       = `${A}/de843.svg`;
const icCheck      = `${A}/875ea.svg`;
const WEBSITE_CAST = [websiteSamantha, websiteAria];
const creatorPosts = WEBSITE_CAST.map((talent) => talent.content.filter((tile) => tile.type === "still"));
const CONTENT_POSTS = Array.from({ length: Math.max(...creatorPosts.map((posts) => posts.length)) }, (_, index) =>
  WEBSITE_CAST.flatMap((talent, creatorIndex) => {
    const tile = creatorPosts[creatorIndex][index];
    return tile ? [{ talent, tile }] : [];
  }),
).flat();
const platformLabels = { instagram: "IG", tiktok: "TT", youtube: "YT" };

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
function AppSidebar({ active }: { active: "roster" | "search" | "lists" }) {
  const overview = [
    { id: "roster", icon: icNavHome, label: "Talent directory" },
    { id: "search", icon: icNavSearch, label: "Explore content" },
    { id: "watch", icon: icNavWatch, label: "Watchlists" },
  ];
  const share = [
    { id: "lists", icon: icNavLists, label: "Lists" },
    { id: "kits", icon: icNavChat, label: "Media kits" },
  ];
  const isActive = (id: string) =>
    (active === "roster" && id === "roster") ||
    (active === "search" && id === "search") ||
    (active === "lists" && id === "lists");
  return (
    <div className="w-[168px] bg-[#f7f8fa] border-r border-[#eeefef] flex flex-col py-3 px-3 gap-1 shrink-0">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="size-7 bg-[#101828] rounded-[8px] flex items-center justify-center shrink-0">
          <img alt="Foam" className="size-3.5" src={icFoamLogo} />
        </div>
        <div>
          <p className="font-founders font-medium text-[12px] text-[#101828] leading-none">foam</p>
          <p className="font-founders text-[9px] text-[#99a1af]">Beta</p>
        </div>
      </div>
      <p className="font-founders text-[9px] text-[#99a1af] px-2 mb-1">Overview</p>
      {overview.map(it => (
        <div
          key={it.id}
          className={`h-8 rounded-[8px] px-2 flex items-center gap-2 ${
            isActive(it.id) ? "bg-[#e8eefc] text-[#185abc]" : "text-[#4a5565]"
          }`}
        >
          <img alt="" className="size-3.5 opacity-70" src={it.icon} />
          <span className="font-founders text-[11px]">{it.label}</span>
        </div>
      ))}
      <p className="font-founders text-[9px] text-[#99a1af] px-2 mt-3 mb-1">Share</p>
      {share.map(it => (
        <div
          key={it.id}
          className={`h-8 rounded-[8px] px-2 flex items-center gap-2 ${
            isActive(it.id) ? "bg-[#e8eefc] text-[#185abc]" : "text-[#4a5565]"
          }`}
        >
          <img alt="" className="size-3.5 opacity-70" src={it.icon} />
          <span className="font-founders text-[11px]">{it.label}</span>
        </div>
      ))}
      <div className="flex-1" />
      <div className="mt-auto rounded-[10px] border border-[#eeefef] bg-white p-2">
        <p className="font-founders font-medium text-[11px] text-[#101828]">Vale Studio</p>
        <p className="font-founders text-[10px] text-[#6a7282]">Beauty roster</p>
      </div>
    </div>
  );
}

// ─── Roster view ─────────────────────────────────────────────────────────────
function SocialStat({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[9px] text-[#6a7282] font-medium">{label}</span>
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
  gender?: string;
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
              {t.age}{t.gender ? ` · ${t.gender}` : ""}
            </p>
            <p className="font-founders font-normal text-[12px] leading-[18px] tracking-[0.2px] text-[#6a7282]">{t.location}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 pt-[2px]">
            <SocialStat label="IG" val={t.ig} />
            <SocialStat label="TT" val={t.tt} />
            <SocialStat label="YT" val={t.yt} />
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

const TALENT_DATA: TalentRow[] = WEBSITE_CAST.map((talent) => {
  const profile = websiteProfile(talent);
  return {
    photo: profile.portrait,
    name: profile.name,
    age: `${profile.age}y`,
    gender: profile.gender,
    location: profile.loc,
    ig: profile.ig.n,
    tt: profile.tt.n,
    yt: profile.yt.n,
    bio: profile.bio,
    tags: talent.verticals,
    manager: "Rowan Hale",
  };
});

function RosterView() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Top bar */}
      <div className="border-b border-[#eeefef] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-founders text-[12px] text-[#6a7282]">Lists</span>
          <span className="text-[#99a1af]">/</span>
          <p className="font-founders font-medium text-[13px] text-[#101828]">Beauty roster</p>
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
          <button className="flex items-center gap-1 bg-[#185abc] text-white rounded-full px-2.5 h-6 shrink-0">
            <img alt="" className="size-3 brightness-0 invert" src={icShare} />
            <span className="font-founders font-medium text-[10px]">Share</span>
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

function ListsView() {
  const rows = [
    { name: "Haircare shortlist", talent: "2 Talent", owner: "Rowan Hale", created: "Mar 12", modified: "2d ago" },
    { name: "Beauty roster", talent: "2 Talent", owner: "Rowan Hale", created: "Jan 8", modified: "5d ago" },
    { name: "Vale Studio beauty", talent: "2 Talent", owner: "Jamie Vale", created: "Feb 20", modified: "Mar 1" },
    { name: "Instagram 100K+", talent: "2 Talent", owner: "Rowan Hale", created: "Apr 2", modified: "1w ago" },
  ];
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <p className="font-founders font-semibold text-[18px] text-[#101828]">Lists</p>
        <div className="flex-1 max-w-[240px] mx-auto h-8 rounded-full border border-[#e8eaed] bg-[#f9fafb] px-3 flex items-center gap-2">
          <img alt="" src={icMagnify} className="size-3 opacity-50" />
          <span className="font-founders text-[11px] text-[#99a1af]">Search lists</span>
        </div>
        <button type="button" className="h-7 rounded-full bg-[#185abc] text-white text-[11px] px-3 inline-flex items-center gap-1 font-founders font-medium">
          <img alt="" src={icPlus} className="size-3 brightness-0 invert" />
          Create
        </button>
      </div>
      <div className="px-4 pb-2 flex items-center gap-2 text-[10px]">
        <span className="h-6 px-2 rounded-full border border-[#e8eaed] text-[#4a5565] inline-flex items-center font-founders">Talent ▾</span>
        <span className="h-6 px-2 rounded-full border border-[#e8eaed] text-[#4a5565] inline-flex items-center font-founders">Owner ▾</span>
        <span className="font-founders text-[#185abc]">Reset</span>
        <span className="font-founders text-[#6a7282] ml-auto">Date created (Most recent)</span>
      </div>
      <div className="px-4 overflow-hidden">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3 border-t border-[#eeefef] py-2.5">
            <span className="size-3 rounded-[3px] border border-[#d0d5dd]" />
            <img alt="" src={icNavLists} className="size-3.5 opacity-50" />
            <div className="flex-1 min-w-0">
              <p className="font-founders font-medium text-[12px] text-[#101828] truncate">{row.name}</p>
              <p className="font-founders text-[10px] text-[#6a7282]">{row.talent}</p>
            </div>
            <p className="font-founders text-[10px] text-[#6a7282] w-[72px] truncate">{row.owner}</p>
            <p className="font-founders text-[10px] text-[#6a7282] w-[44px]">{row.created}</p>
            <p className="font-founders text-[10px] text-[#6a7282] w-[44px]">{row.modified}</p>
          </div>
        ))}
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
  tile: TalentContentTile;
  creator: string;
  portrait: string;
};

function ContentCard({ tile, creator, portrait }: ContentCardProps) {
  return (
    <div className="relative rounded-[8px] overflow-hidden bg-[#101828]" style={{ aspectRatio: tile.aspectRatio || "9/16" }}>
      <img alt={`${creator}: ${tile.caption || "creator content"}`} className="absolute inset-0 size-full object-cover" src={tile.thumb} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-[6px]">
        <div className="flex items-center gap-2 mb-1 font-founders text-[8px] text-white/90">
          {Boolean(tile.views) && <span className="inline-flex items-center gap-1" aria-label={`${formatWebsiteMetric(tile.views!)} views`}><LabIcon name="eye" size={10} />{formatWebsiteMetric(tile.views!)}</span>}
          {tile.engagements !== undefined && <span className="inline-flex items-center gap-1" aria-label={`${formatWebsiteMetric(tile.engagements)} engagements`}><LabIcon name="heart" size={10} />{formatWebsiteMetric(tile.engagements)}</span>}
          {!tile.views && <span>Draft asset</span>}
        </div>
        <div className="flex items-center gap-1">
          <img alt="" className="size-[14px] rounded-full object-cover shrink-0" src={portrait} />
          <span className="font-founders font-normal text-[8px] text-white truncate">{creator}</span>
          <span className="font-founders text-[8px] text-white/80 ml-auto">{platformLabels[tile.platform]}</span>
        </div>
      </div>
    </div>
  );
}

function ContentSearchView() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search header */}
      <div className="border-b border-[#eeefef] px-4 py-3 flex items-center gap-3 shrink-0">
        <p className="font-founders font-medium text-[13px] text-[#101828] shrink-0">Explore content</p>
        <div className="flex-1 flex items-center gap-2 bg-[#f4f5f6] border border-[#eeefef] rounded-[20px] px-3 h-8">
          <img alt="" className="size-3 opacity-50" src={icMagnify} />
          <span className="font-founders font-normal text-[11px] text-[#99a1af]">Describe the content you're looking for</span>
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
            {CONTENT_POSTS.map(({ talent, tile }) => (
              <div key={`${talent.id}:${tile.thumb}`} className="break-inside-avoid mb-2">
                <ContentCard
                  tile={tile}
                  creator={talent.displayName}
                  portrait={talent.portrait}
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
  variant?: "roster" | "search" | "lists";
  className?: string;
};

export function FoamAppScreen({ variant = "roster", className = "" }: Props) {
  const active = variant === "search" ? "search" : variant === "lists" ? "lists" : "roster";
  const height = variant === "roster" ? 380 : 420;
  return (
    <div className={className}>
      <BrowserChrome>
        <div className="flex overflow-hidden" style={{ height }}>
          <AppSidebar active={active} />
          {variant === "search" ? <ContentSearchView /> : variant === "lists" ? <ListsView /> : <RosterView />}
        </div>
      </BrowserChrome>
      <p className="font-founders text-[10px] text-[#6a7282] mt-2">AI-generated demo talent · Illustrative metrics</p>
    </div>
  );
}
