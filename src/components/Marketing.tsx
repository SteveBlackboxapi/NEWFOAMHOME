import { MarketingImage } from "./MarketingImage";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  websiteAria,
  websiteNia,
  websiteSamantha,
} from "../data/websiteTalent";
import { AIDisclosure } from "./AIDisclosure";
import { DEMO_URL } from "../lib/siteLinks";
import "./marketing.css";

export function MarketingPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mp-page ${className}`}>{children}</div>;
}

export function ActionLink({
  to,
  children,
  secondary = false,
  className = "",
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  to = to === "/demo" || to === "/demo/" ? DEMO_URL : to;
  const cls = `mp-button ${secondary ? "mp-button-secondary" : ""} ${className}`;
  const content = (
    <>
      {children}
      <span aria-hidden="true">↗</span>
    </>
  );
  return /^(https?:|mailto:)/.test(to) ? (
    <a href={to} className={cls}>
      {content}
    </a>
  ) : (
    <Link to={to} className={cls}>
      {content}
    </Link>
  );
}

/** Each section reveals once on entry; there is no pinned scroll or waiting beat. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const target = element.current;
    if (!target) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px 24px 0px" },
    );
    const show = () => {
      if (preference.matches) {
        setVisible(true);
        observer.disconnect();
      }
    };
    preference.addEventListener("change", show);
    observer.observe(target);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", show);
    };
  }, []);
  return (
    <div
      ref={element}
      className={`mp-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${Math.min(delay, 180)}ms` }}
    >
      {children}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  visual,
  children,
  tone = "cream",
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  visual?: ReactNode;
  children?: ReactNode;
  tone?: "cream" | "blue" | "lime" | "navy";
}) {
  return (
    <section
      className={`mp-intro mp-${tone} ${visual ? "mp-intro-split" : ""}`}
    >
      <div className="mp-container mp-intro-layout">
        <div className="mp-intro-copy">
          <p className="mp-eyebrow">{eyebrow}</p>
          <h1 className="mp-display">{title}</h1>
          <div className="mp-intro-description">{description}</div>
          {children && <div className="mp-actions">{children}</div>}
        </div>
        {visual && <div className="mp-intro-visual">{visual}</div>}
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mp-section-intro">
      {eyebrow && <p className="mp-eyebrow">{eyebrow}</p>}
      <h2 className="mp-heading">{title}</h2>
      {description && <p className="mp-body">{description}</p>}
    </div>
  );
}

export function FoamGlyph({
  kind = "flower",
  className = "",
}: {
  kind?: "flower" | "spark" | "orbit";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`mp-glyph ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {kind === "flower" ? (
        <g fill="currentColor">
          <circle cx="26" cy="26" r="24" />
          <circle cx="74" cy="26" r="24" />
          <circle cx="26" cy="74" r="24" />
          <circle cx="74" cy="74" r="24" />
        </g>
      ) : kind === "spark" ? (
        <path
          d="M50 0 60 31 85 15 69 40 100 50 69 60 85 85 60 69 50 100 40 69 15 85 31 60 0 50 31 40 15 15 40 31Z"
          fill="currentColor"
        />
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="8">
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="20"
            transform="rotate(-40 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="20"
            transform="rotate(40 50 50)"
          />
        </g>
      )}
    </svg>
  );
}

export function CreatorMosaic({
  variant = "mixed",
}: {
  variant?: "roster" | "beauty" | "mixed";
}) {
  const rows =
    variant === "roster"
      ? [
          [websiteSamantha.portrait, websiteAria.content[0].thumb],
          [websiteAria.portrait, websiteNia.portrait],
          [websiteNia.content[0].thumb, websiteSamantha.content[0].thumb],
        ]
      : variant === "beauty"
        ? [
            [websiteAria.content[0].thumb, websiteNia.portrait],
            [websiteNia.content[0].thumb, websiteSamantha.portrait],
            [websiteSamantha.content[2].thumb, websiteAria.portrait],
          ]
        : [
            [websiteSamantha.content[0].thumb, websiteAria.portrait],
            [websiteNia.portrait, websiteSamantha.content[1].thumb],
            [websiteAria.content[0].thumb, websiteSamantha.portrait],
          ];
  return (
    <div className={`mp-mosaic mp-mosaic-${variant}`}>
      <div className="mp-mosaic-grid" aria-hidden="true">
        {rows.map((row, i) => (
          <div className="mp-mosaic-column" key={i}>
            {row.map((src, j) => (
              <div className="mp-mosaic-tile" key={src}>
                <MarketingImage
                  src={src}
                  alt=""
                  loading={j === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className="mp-mosaic-stamp">
        People.
        <br />
        With possibility.
        <FoamGlyph kind="spark" />
      </span>
      <div className="mp-mosaic-credit">
        <AIDisclosure />
        <span>Fictional creators</span>
      </div>
    </div>
  );
}

export function ProofStrip() {
  return (
    <section className="mp-proof">
      <div className="mp-container">
        <p className="mp-eyebrow">In good company</p>
        <div className="mp-proof-grid">
          {[
            ["1,300+", "talent managers active every month"],
            ["800+", "creator agencies active every month"],
            ["~6,000", "kits, lists, rosters and embeds shared a week"],
          ].map(([value, label]) => (
            <div key={value}>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
