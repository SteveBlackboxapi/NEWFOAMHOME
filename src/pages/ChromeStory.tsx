import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { img } from "../lib/assets";

const A = `${import.meta.env.BASE_URL}assets`;
const FG_R = "font-founders font-normal";
const FG_M = "font-founders font-medium";
const FG_SB = "font-founders font-semibold";

function clamp(n: number, a = 0, b = 1) {
  return Math.min(b, Math.max(a, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function range(p: number, a: number, b: number) {
  return clamp((p - a) / (b - a));
}
function ease(t: number) {
  return t * t * (3 - 2 * t);
}

const STORE = "https://chromewebstore.google.com/detail/foam-the-essential-chrome/iocblckedogkccdepdjfceomgncpeadf";

function ChromeStoreMark() {
  return (
    <svg width="112" height="96" viewBox="0 0 112 96" fill="none" aria-hidden>
      <rect x="8" y="18" width="96" height="70" rx="16" fill="#E8EAED" />
      <rect x="8" y="18" width="96" height="28" rx="16" fill="#F1F3F4" />
      <rect x="8" y="34" width="96" height="12" fill="#F1F3F4" />
      <rect x="40" y="10" width="32" height="14" rx="7" fill="#E8EAED" />
      <rect x="44" y="14" width="24" height="6" rx="3" fill="#fff" />
      <circle cx="56" cy="64" r="22" fill="#c6f31e" />
      <text x="56" y="72" textAnchor="middle" fontSize="22" fontWeight="700" fill="#101828">F</text>
    </svg>
  );
}

const WALLPAPER =
  "radial-gradient(ellipse 36% 90% at 100% 42%, rgba(198,243,30,0.95) 0%, rgba(198,243,30,0.18) 38%, transparent 62%)," +
  "linear-gradient(180deg, #070707 0%, #111111 26%, #f3efe6 46%, #c9daf0 68%, #8eb6de 100%)";

const TALENT = [
  { name: "Ren Cole", img: img.talent1 },
  { name: "Io Marin", img: img.talent2 },
  { name: "Sable Voss", img: img.talent3 },
];

function StatBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <p className={`${FG_M} text-[11px] text-[#101828] mb-1.5`}>{title}</p>
      {rows.map(([label, val]) => (
        <div key={label} className="flex gap-2 text-[11px] leading-5">
          <span className="text-[#101828] w-10">{val}</span>
          <span className="text-[#6a7282]">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ChromeStory({ embedded = false }: { embedded?: boolean } = {}) {
  const track = useRef<HTMLElement | null>(null);
  const [p, setProg] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), Math.max(total, 1));
      setProg(passed / Math.max(total, 1));
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);
  const hold = 1;
  const cursorOn = false;
  const cursorL = 50;
  const cursorT = 50;
  const detailOn = p > 0.4;
  return (
    <div>
      <section ref={track} className="relative h-[10vh]">
        <div className="sticky top-0 h-[40vh]" style={{ background: WALLPAPER }} />
      </section>
      <section className="px-6 py-24 max-w-[1100px] mx-auto">
        <p className={`${FG_M} text-[11px] uppercase tracking-[1.8px] text-[#6a7282] mb-4`}>What just happened</p>
        <h2 className={`${FG_SB} text-[36px] md:text-[48px] leading-[1.02] tracking-[-1.2px] max-w-[18ch] mb-6`}>Grid. Profile. Detail. Inbox.</h2>
        <div className="grid md:grid-cols-3 gap-8 text-[15px] leading-7 text-[#6a7282]">
          <p>Open the creator in the panel. The roster never leaves Gmail.</p>
          <p>Basic, Detail or Text. You choose how much proof the brand gets.</p>
          <p>Paste. The draft carries the card and a link to the kit.</p>
        </div>
        <div className="mt-10 flex gap-4">
          <Link to="/demo" className={`${FG_SB} h-12 px-6 rounded-full bg-[#c6f31e] text-[#101828] inline-flex items-center`}>Get a demo</Link>
          <Link to="/features" className={`${FG_M} h-12 px-6 rounded-full border border-[#d0d5dd] inline-flex items-center`}>All features</Link>
        </div>
      </section>
      <section className="px-6 py-28 text-center">
        <a href={STORE} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center group">
          <span className="transition-transform duration-200 group-hover:scale-105">
            <ChromeStoreMark />
          </span>
          <span className={`${FG_SB} mt-8 text-[40px] md:text-[56px] leading-none tracking-[-1.5px] text-[#101828]`}>Chrome Extension</span>
          <span className={`${FG_M} mt-4 text-[15px] text-[#6a7282] group-hover:text-[#101828]`}>Add Foam for Chrome ↗</span>
        </a>
      </section>
    </div>
  );
}
