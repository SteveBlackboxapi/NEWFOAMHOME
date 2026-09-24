import {
  MiniAccounts,
  MiniAvatar,
  MiniBar,
  MiniFoamMark,
  MiniIcon,
  MiniPhoto,
} from "./MiniPrimitives";
import { websiteAria, websiteNia, websiteSamantha } from "../../data/websiteTalent";
import { KitPlatformIcon } from "../KitDetails";
import "./mini-discovery.css";

const people = [
  { person: "samantha", name: "Samantha", category: "Beauty & curls" },
  { person: "aria", name: "Aria", category: "Everyday style" },
  { person: "nia", name: "Nia", category: "Life, beautifully" },
] as const;

const contentResults = [
  { name: "Samantha", tile: websiteSamantha.content.find((tile) => tile.id === "0")! },
  { name: "Aria", tile: websiteAria.content[0] },
  { name: "Nia", tile: websiteNia.content[0] },
];

export function MiniSearch() {
  return (
    <div className="mui-d-scene mui-d-search">
      <div className="mui-card mui-d-search-window">
        <div className="mui-d-window-title">
          <MiniFoamMark size={25} />
          <span>Explore content</span>
          <MiniIcon name="grid" size={18} />
        </div>
        <div className="mui-d-search-results">
          {contentResults.map(({ name, tile }) => (
            <div className="mui-d-result" key={name}>
              <img src={tile.thumb} alt="" loading="lazy" decoding="async" />
              <span className="mui-d-result-caption">
                {name}
                <KitPlatformIcon network={tile.platform} label={tile.platform} size={17} />
              </span>
            </div>
          ))}
        </div>
        <div className="mui-d-result-bottom">
          <MiniIcon name="check" size={15} />
          <MiniBar width={138} />
          <MiniBar width={55} />
        </div>
      </div>
      <div className="mui-card mui-d-search-query">
        <MiniIcon name="search" size={22} />
        <span>Skincare, with a little personality</span>
        <i />
      </div>
      <div className="mui-card mui-d-fit-note">
        <span className="mui-d-tick">
          <MiniIcon name="check" size={15} />
        </span>
        <span>Found your next good thing.</span>
      </div>
    </div>
  );
}

export function MiniShortlist() {
  return (
    <div className="mui-d-scene mui-d-shortlist">
      <div className="mui-card mui-d-shortlist-window">
        <div className="mui-d-list-heading">
          <div className="mui-d-folder">
            <MiniIcon name="users" size={20} />
          </div>
          <div>
            <span className="mui-d-eyebrow">YOUR SHORTLIST</span>
            <h3>The everyday edit</h3>
          </div>
        </div>
        <div className="mui-d-talent-rows">
          {people.map(({ person, name }) => (
            <div className="mui-d-talent-row" key={person}>
              <MiniAvatar person={person} size={40} />
              <div>
                <strong>{name}</strong>
                <MiniAccounts person={person} />
              </div>
              <span className="mui-d-small-check">
                <MiniIcon name="check" size={13} />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mui-card mui-d-shortlist-preview">
        <div className="mui-d-preview-photos">
          <MiniPhoto person="samantha" />
          <MiniPhoto person="aria" />
          <MiniPhoto person="nia" />
        </div>
        <strong>A good little line-up.</strong>
        <div className="mui-d-preview-line">
          <MiniIcon name="link" size={15} />
          <span>Ready to share</span>
          <MiniIcon name="arrow" size={16} />
        </div>
      </div>
      <div className="mui-pill mui-lime mui-d-selection-note">
        <MiniIcon name="check" size={16} /> Three names. One lovely list.
      </div>
    </div>
  );
}

export function MiniRoster() {
  return (
    <div className="mui-d-scene mui-d-roster">
      <div className="mui-card mui-d-roster-window">
        <div className="mui-d-roster-rail">
          <MiniFoamMark size={29} />
          <span className="mui-d-active-icon">
            <MiniIcon name="users" size={20} />
          </span>
          <MiniIcon name="search" size={18} />
          <MiniIcon name="bookmark" size={18} />
          <MiniAvatar person="elise" size={26} />
        </div>
        <div className="mui-d-roster-body">
          <div className="mui-d-roster-heading">
            <div>
              <span className="mui-d-eyebrow">YOUR ROSTER</span>
              <h3>All kinds of brilliant.</h3>
            </div>
            <span className="mui-d-add">
              <MiniIcon name="plus" size={20} />
            </span>
          </div>
          <div className="mui-d-roster-cards">
            {people.map(({ person, name }) => (
              <div className="mui-d-roster-person" key={person}>
                <MiniPhoto person={person} />
                <strong>{name}</strong>
                <MiniAccounts person={person} />
              </div>
            ))}
          </div>
          <div className="mui-d-roster-foot">
            <MiniBar width={82} />
            <MiniBar width={52} />
            <span>24 creators</span>
          </div>
        </div>
      </div>
      <div className="mui-card mui-d-roster-note">
        <span className="mui-d-tick">
          <MiniIcon name="check" size={16} />
        </span>
        <span>Your people. All together.</span>
      </div>
    </div>
  );
}

export function MiniSavedContent() {
  return (
    <div className="mui-d-scene mui-d-saved">
      <div className="mui-card mui-d-saved-window">
        <div className="mui-d-saved-heading">
          <div>
            <MiniIcon name="bookmark" size={20} />
            <h3>The good stuff</h3>
          </div>
          <span className="mui-d-count">12 saved</span>
        </div>
        <div className="mui-d-masonry">
          <div>
            <div className="mui-d-saved-photo mui-d-saved-tall">
              <MiniPhoto person="samantha" />
              <span>
                <MiniIcon name="bookmark" size={14} />
              </span>
            </div>
            <MiniBar width="76%" />
          </div>
          <div>
            <div className="mui-d-saved-photo mui-d-saved-short">
              <MiniPhoto person="nia" />
              <span>
                <MiniIcon name="bookmark" size={14} />
              </span>
            </div>
            <div className="mui-d-saved-photo mui-d-saved-small">
              <MiniPhoto person="elise" />
            </div>
          </div>
          <div>
            <div className="mui-d-saved-photo mui-d-saved-tall">
              <MiniPhoto person="aria" />
              <span>
                <MiniIcon name="bookmark" size={14} />
              </span>
            </div>
            <MiniBar width="58%" />
          </div>
        </div>
      </div>
      <div className="mui-card mui-d-saved-note">
        <div className="mui-d-saved-note-icon">
          <MiniIcon name="bookmark" size={22} />
        </div>
        <div>
          <strong>One for later.</strong>
          <span>Saved to your collection</span>
        </div>
        <MiniIcon name="check" size={18} />
      </div>
      <span className="mui-d-saved-spark">
        <MiniIcon name="plus" size={24} />
      </span>
    </div>
  );
}
