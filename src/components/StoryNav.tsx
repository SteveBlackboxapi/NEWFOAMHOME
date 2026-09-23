import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { A } from "../lib/assets";
import { DEMO_URL } from "../lib/siteLinks";
import { ThemeControl } from "./SiteTheme";
import "./story-nav.css";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Managers", to: "/managers" },
  { label: "Brands", to: "/brands" },
  { label: "Creators", to: "/creators" },
  { label: "Features", to: "/features" },
  { label: "Data & trust", to: "/data-trust" },
  { label: "About", to: "/about" },
];

/** White navigation belongs to the opening photo, so it leaves with the scene. */
export function StoryNav() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.key]);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      toggle.current?.focus({ preventScroll: true });
    };
    const onOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onResize = () => {
      if (!desktop.matches) return;
      if (header.current?.contains(document.activeElement))
        header.current
          ?.querySelector<HTMLAnchorElement>(".story-nav-brand")
          ?.focus({ preventScroll: true });
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <header className="story-nav" ref={header}>
      <div className="story-nav-row">
        <Link to="/" aria-label="Foam home" className="story-nav-brand">
          <img
            src={`${A}/brand/foam-logotype-white.svg`}
            alt=""
            width={90}
            height={35}
          />
        </Link>
        <nav className="story-nav-desktop" aria-label="Main navigation">
          {LINKS.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="story-nav-actions">
          <ThemeControl />
          <a className="story-nav-demo" href={DEMO_URL}>
            Get a demo <span aria-hidden="true">↗</span>
          </a>
          <button
            ref={toggle}
            type="button"
            className="story-nav-toggle"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={open ? "is-open" : ""} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>
      <div
        id={menuId}
        ref={menu}
        className="story-nav-menu"
        hidden={!open}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            !header.current?.contains(event.relatedTarget)
          )
            setOpen(false);
        }}
      >
        <nav aria-label="Mobile navigation">
          {LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
            >
              {label}
              <span aria-hidden="true">↗</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
