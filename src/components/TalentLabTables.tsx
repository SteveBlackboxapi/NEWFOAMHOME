import type { StagedTalent, TalentNetwork } from "../data/stagedTalent";
import { formatAudience } from "../data/stagedTalent";
import {
  assetKind,
  hasAssignedAudience,
  NETWORK_NAMES,
  SHORT_NAMES,
  type LabAsset,
} from "../lib/talentLab";
import { ContentPlatformIcon } from "./ContentMetrics";
import { LabIcon } from "./TalentLabIcon";
import { AIDisclosure } from "./TalentLabMedia";
import "./talent-lab-tables.css";

export function TalentNetworkIcon({ network }: { network: TalentNetwork }) {
  return network === "instagram" || network === "tiktok" || network === "youtube" ? (
    <ContentPlatformIcon network={network} />
  ) : (
    <abbr title={NETWORK_NAMES[network]}>{SHORT_NAMES[network]}</abbr>
  );
}

export type TalentLayout = "gallery" | "compact" | "table";

export function TalentLayoutSelect({
  talentView,
  value,
  onChange,
}: {
  talentView: boolean;
  value: TalentLayout;
  onChange: (value: TalentLayout) => void;
}) {
  return (
    <label className="tl-layout-select">
      <span className="tl-sr-only">Display view</span>
      {value === "table" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M3 10h18M3 15h18M9 4v16" />
        </svg>
      ) : (
        <LabIcon name={value === "compact" ? "compact" : "grid"} size={18} />
      )}
      <select aria-label="Display view" value={value} onChange={(event) => onChange(event.target.value as TalentLayout)}>
        <option value="gallery">{talentView ? "Card view" : "Masonry view"}</option>
        <option value="compact">{talentView ? "Compact cards" : "Compact masonry"}</option>
        <option value="table">Table view</option>
      </select>
    </label>
  );
}

function Metric({ value }: { value?: number }) {
  return value === undefined ? (
    <span className="tl-table-unknown" aria-label="Not assigned">—</span>
  ) : (
    <span title={value.toLocaleString("en-US")}>{formatAudience(value)}</span>
  );
}

function SaveButton({ saved, label, onSave }: { saved: boolean; label: string; onSave: () => void }) {
  return (
    <button
      className={`tl-table-save ${saved ? "is-saved" : ""}`}
      onClick={onSave}
      aria-label={`${saved ? "Unsave" : "Save"} ${label}`}
      aria-pressed={saved}
      title={saved ? "Remove from saved" : "Save asset"}
    >
      <LabIcon name="bookmark" size={18} />
    </button>
  );
}

export function TalentDirectoryTable({
  talent,
  networks,
  saved,
  onOpen,
  onSave,
}: {
  talent: StagedTalent[];
  networks: TalentNetwork[];
  saved: string[];
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}) {
  return (
    <div className="tl-table-scroller" role="region" aria-label="Talent directory table; scroll horizontally for more columns" tabIndex={0}>
      <table className="tl-data-table tl-directory-table">
        <caption className="tl-sr-only">Talent directory. Audience figures are demo data; a dash means no figure has been assigned.</caption>
        <thead>
          <tr>
            <th scope="col">Talent</th>
            <th scope="col">Age</th>
            {networks.map((network) => (
              <th scope="col" className="tl-table-number" key={network}>
                <span className="tl-table-platform-heading"><TalentNetworkIcon network={network} /> {NETWORK_NAMES[network]}</span>
              </th>
            ))}
            <th scope="col" className="tl-table-number">Total audience</th>
            <th scope="col">Verticals</th>
            <th scope="col"><span className="tl-sr-only">Save portrait</span></th>
          </tr>
        </thead>
        <tbody>
          {talent.map((person) => (
            <tr key={person.id}>
              <th scope="row" className="tl-table-person-cell">
                <button className="tl-table-person" onClick={() => onOpen(person.id)} aria-label={`Open ${person.displayName} profile`}>
                  <img src={person.portrait} alt="" loading="lazy" />
                  <span>
                    <strong>{person.displayName}</strong>
                    <span className="tl-table-location">{person.location || "Location not assigned"}</span>
                    <AIDisclosure provenance={person.provenance} />
                  </span>
                </button>
              </th>
              <td>{person.age > 0 ? `${person.age}y` : <span className="tl-table-unknown" aria-label="Age not assigned">—</span>}</td>
              {networks.map((network) => {
                const account = person.platforms.find((platform) => platform.network === network);
                const hasPosts = person.content.some((tile) => tile.platform === network);
                return (
                  <td className="tl-table-number" key={network} title={!account && hasPosts ? `Demo posts on ${NETWORK_NAMES[network]}; audience not assigned` : account?.handle}>
                    <Metric value={account?.followers} />
                  </td>
                );
              })}
              <td className="tl-table-number tl-table-total"><Metric value={hasAssignedAudience(person) ? person.totalAudience : undefined} /></td>
              <td><div className="tl-table-tags">{person.verticals.map((vertical) => <span key={vertical}>{vertical}</span>)}</div></td>
              <td><SaveButton saved={saved.includes(`${person.id}:portrait`)} label={`${person.displayName} portrait`} onSave={() => onSave(`${person.id}:portrait`)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TalentContentTable({
  assets,
  saved,
  onOpen,
  onSave,
}: {
  assets: LabAsset[];
  saved: string[];
  onOpen: (talent: string, asset: string) => void;
  onSave: (id: string) => void;
}) {
  return (
    <div className="tl-table-scroller" role="region" aria-label="Content table; scroll horizontally for more columns" tabIndex={0}>
      <table className="tl-data-table tl-content-table">
        <caption className="tl-sr-only">Content library. Performance figures are demo data; a dash means no figure has been assigned.</caption>
        <thead>
          <tr>
            <th scope="col">Content</th>
            <th scope="col">Talent</th>
            <th scope="col">Platform</th>
            <th scope="col">Asset type</th>
            <th scope="col" className="tl-table-number">Views</th>
            <th scope="col" className="tl-table-number">Engagements</th>
            <th scope="col"><span className="tl-sr-only">Save asset</span></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const kind = assetKind(asset);
            return (
              <tr key={asset.id}>
                <th scope="row">
                  <button className="tl-table-person tl-table-content-open" onClick={() => onOpen(asset.talent.id, asset.id)} aria-label={`Open ${asset.title} by ${asset.talent.displayName}`}>
                    <span className="tl-table-thumbnail">
                      <img src={asset.src} alt="" loading="lazy" />
                      {kind === "video" && <span><LabIcon name="play" size={12} /></span>}
                    </span>
                    <span>
                      <strong title={asset.title}>{asset.title}</strong>
                      <AIDisclosure provenance={asset.tile?.provenance || asset.talent.provenance} />
                    </span>
                  </button>
                </th>
                <td>{asset.talent.displayName}</td>
                <td>{asset.tile ? <span className="tl-table-platform"><TalentNetworkIcon network={asset.tile.platform} />{NETWORK_NAMES[asset.tile.platform]}</span> : <span className="tl-table-unknown">—</span>}</td>
                <td>{kind === "video" ? "Video" : kind === "planned" ? "Video planned" : asset.tile ? "Image" : "Portrait"}</td>
                <td className="tl-table-number"><Metric value={asset.tile?.views} /></td>
                <td className="tl-table-number"><Metric value={asset.tile?.engagements} /></td>
                <td><SaveButton saved={saved.includes(asset.id)} label={asset.title} onSave={() => onSave(asset.id)} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
