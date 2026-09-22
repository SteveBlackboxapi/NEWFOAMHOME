import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router";
import { img } from "../lib/assets";
import { DEMO_URL } from "../lib/siteLinks";
import "./site-shell.css";

const LINKS = [
  { label: "Managers", to: "/managers" },
  { label: "Brands", to: "/brands" },
  { label: "Creators", to: "/creators" },
  { label: "Features", to: "/features" },
  { label: "Data & trust", to: "/data-trust" },
  { label: "About", to: "/about" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const previousLocation = useRef(location.key);

  useEffect(() => {
    if (previousLocation.current === location.key) return;
    previousLocation.current = location.key;
    const focusWasInMenu = menu.current?.contains(document.activeElement);
    setOpen(false);
    if (focusWasInMenu) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [location.key]);

  useEffect(() => {
    if (!open) return;
    const firstLink = menu.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus({ preventScroll: true });
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
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const onResize = () => {
      if (!desktop.matches) return;
      if (menu.current?.contains(document.activeElement)) {
        header.current
          ?.querySelector<HTMLAnchorElement>(".site-brand")
          ?.focus({ preventScroll: true });
      }
      setOpen(false);
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  function onMobileNavigate() {
    setOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
  }

  return (
    <header className="site-header" ref={header}>
      <a className="site-skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="site-nav-bar">
        <Link to="/kit-story/" aria-label="Foam story" className="site-brand">
          <img alt="" src={img.foamSymbol} width={36} height={36} />
          <span>foam</span>
        </Link>
        <nav className="site-desktop-nav" aria-label="Main navigation">
          {LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="site-nav-actions">
          <a href={DEMO_URL} className="site-nav-demo">
            Get a demo <span aria-hidden="true">↗</span>
          </a>
          <button
            ref={toggle}
            className="site-menu-toggle"
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
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
        ref={menu}
        id="site-mobile-menu"
        className="site-mobile-menu"
        hidden={!open}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            !header.current?.contains(event.relatedTarget)
          )
            setOpen(false);
        }}
      >
        <p className="site-menu-eyebrow">A whole world of talent.</p>
        <nav aria-label="Mobile navigation">
          {LINKS.map(({ label, to }, index) => (
            <NavLink
              key={to}
              to={to}
              onClick={onMobileNavigate}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              <span className="site-menu-number" aria-hidden="true">
                0{index + 1}
              </span>
              {label}
              <span className="site-menu-arrow" aria-hidden="true">
                ↗
              </span>
            </NavLink>
          ))}
        </nav>
        <a href={DEMO_URL} className="site-mobile-demo">
          Let’s see what’s possible <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
