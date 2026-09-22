import { MarketingImage } from "./MarketingImage";
import {
  websiteAria,
  websiteNia,
  websiteSamantha,
  formatWebsiteMetric,
} from "../data/websiteTalent";
import { AIDisclosure } from "./AIDisclosure";
import { A } from "../lib/assets";
import "./marketing-product.css";

export type ProductKind = "kit" | "roster" | "search" | "inbox";
const titles = {
  kit: "Samantha’s media kit",
  roster: "Your people, all together",
  search: "A moment worth sharing",
  inbox: "Your next good introduction",
};
const cast = [websiteSamantha, websiteAria, websiteNia];

function ProfileSummary() {
  return (
    <div className="mp-product-profile">
      <MarketingImage
        src={websiteSamantha.portrait}
        alt="Samantha Pikka, fictional demo creator"
        loading="lazy"
      />
      <div>
        <strong>Samantha Pikka</strong>
        <p>Beauty · Los Angeles</p>
        <div className="mp-product-socials">
          {websiteSamantha.platforms.slice(0, 3).map((p) => (
            <span key={p.network}>
              <b>{formatWebsiteMetric(p.followers)}</b> {p.network}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductPreview({ kind = "kit" }: { kind?: ProductKind }) {
  return (
    <figure className={`mp-product mp-product-${kind}`}>
      <div
        className="mp-product-window"
        aria-label={`${titles[kind]} — illustrative product preview`}
      >
        <div className="mp-product-top">
          <span aria-hidden="true">● ● ●</span>
          <span>{titles[kind]}</span>
          <MarketingImage src={`${A}/fdb3b.svg`} alt="" />
        </div>
        {kind === "kit" && (
          <div className="mp-product-kit">
            <div className="mp-product-kit-intro">
              <div>
                <p>THE MEDIA KIT</p>
                <h3>
                  Samantha
                  <br />
                  Pikka<span>Beauty. In her own way.</span>
                </h3>
              </div>
              <MarketingImage
                src={websiteSamantha.portrait}
                alt="Samantha Pikka"
                loading="lazy"
              />
            </div>
            <div className="mp-product-kit-stats">
              <strong>
                {formatWebsiteMetric(websiteSamantha.totalAudience)}
              </strong>
              <span>Total demo audience</span>
              <span>Connected platforms ↗</span>
            </div>
            <div className="mp-product-content">
              {websiteSamantha.content.slice(0, 3).map((tile) => (
                <MarketingImage
                  key={tile.thumb}
                  src={tile.thumb}
                  alt={tile.caption}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}
        {kind === "roster" && (
          <div className="mp-product-roster">
            <div className="mp-product-label">
              <strong>All talent</strong>
              <span>3 creators</span>
            </div>
            <div className="mp-product-people">
              {cast.map((person) => (
                <div key={person.id}>
                  <MarketingImage
                    src={person.portrait}
                    alt={person.displayName}
                    loading="lazy"
                  />
                  <strong>{person.displayName}</strong>
                  <span>{person.verticals[0]}</span>
                  <p>
                    {formatWebsiteMetric(person.totalAudience)}{" "}
                    <small>total audience</small>
                  </p>
                </div>
              ))}
            </div>
            <div className="mp-product-roster-note">
              <span aria-hidden="true">↗</span>One roster. Ready for the right
              brief.
            </div>
          </div>
        )}
        {kind === "search" && (
          <div className="mp-product-search">
            <div className="mp-product-query">
              <span aria-hidden="true">⌕</span> Skincare routines{" "}
              <span aria-hidden="true">×</span>
            </div>
            <div className="mp-product-results">
              {[
                websiteAria.content[0],
                websiteNia.content[0],
                websiteSamantha.content[2],
                websiteSamantha.content[0],
              ].map((tile) => (
                <div key={tile.thumb}>
                  <MarketingImage
                    src={tile.thumb}
                    alt={tile.caption}
                    loading="lazy"
                  />
                  <span>{tile.platform}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {kind === "inbox" && (
          <div className="mp-product-mail">
            <div className="mp-product-mail-subject">
              Re: A creator for your curl-care launch
            </div>
            <p>Hi Rose,</p>
            <p>
              Samantha feels like a great fit. Here’s a little more about her.
            </p>
            <div className="mp-product-mail-card">
              <ProfileSummary />
              <p>
                Simple routines. Honest reviews. A fresh take on everyday
                beauty.
              </p>
              <span className="mp-product-kit-label">Media kit included ↗</span>
            </div>
            <p>Let’s find her next great collaboration.</p>
            <div className="mp-product-mail-footer">
              <span>Profile included</span>
              <span aria-hidden="true">✓</span>
            </div>
          </div>
        )}
      </div>
      <figcaption>
        <AIDisclosure detail="Fictional creators · Demo figures" />
      </figcaption>
    </figure>
  );
}
