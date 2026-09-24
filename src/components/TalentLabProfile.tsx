import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  formatAudience,
  resolveCaptionSettings,
  type StagedTalent,
  type TileCaptionSettings,
} from "../data/stagedTalent";
import {
  assetsFor,
  hasAssignedAudience,
  assetKind,
  NETWORK_NAMES,
  SHORT_NAMES,
  downloadArchivedOriginal,
  downloadCaptioned,
  downloadOriginal,
  downloadVideo,
  exportData,
  profileData,
  readyVideoSources,
  type LabAsset,
} from "../lib/talentLab";
import { LabIcon } from "./TalentLabIcon";
import { talentVideoSources } from "../lib/talentVideo";
import { AIDisclosure, Caption } from "./TalentLabMedia";
import { AssetUsage } from "./TalentLibraryManager";
import { TalentCaptionControls } from "./TalentCaptionControls";

type Props = {
  talent: StagedTalent;
  initialAsset: string | null;
  captions: Record<string, TileCaptionSettings>;
  onCaption: (asset: LabAsset, settings: TileCaptionSettings) => void;
  saved: string[];
  onSave: (id: string) => void;
  onClose: () => void;
  onPack: (assets: LabAsset[], name: string) => void;
  busy: boolean;
  notify: (message: string) => void;
  notice: string;
  onManage: () => void;
};

export function TalentLabProfile({
  talent,
  initialAsset,
  captions,
  onCaption,
  saved,
  onSave,
  onClose,
  onPack,
  busy,
  notify,
  notice,
  onManage,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.showModal();
    const cancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    el.addEventListener("cancel", cancel);
    return () => {
      el.removeEventListener("cancel", cancel);
      el.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  const assets = assetsFor(talent);
  const [tab, setTab] = useState<"overview" | "assets" | "data">(
    initialAsset ? "assets" : "overview",
  );
  const [activeId, setActiveId] = useState(initialAsset || assets[0].id);
  const active = assets.find((a) => a.id === activeId) || assets[0];
  const caption = captions[active.id];
  const [version, setVersion] = useState<"current" | "original">("current");
  const showingOriginal = version === "original" && Boolean(active.original);
  const previewRatio = showingOriginal
    ? "9/16"
    : active.index < 0
      ? "3/4"
      : active.tile?.aspectRatio || "9/16";
  const [ratioWidth, ratioHeight] = previewRatio.split("/").map(Number);
  const [downloading, setDownloading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const action = async (job: () => Promise<void>) => {
    setDownloading(true);
    try {
      await job();
      notify("Download ready.");
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Download failed. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };
  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("talent", talent.id);
    if (tab === "assets") url.searchParams.set("asset", active.id);
    else url.searchParams.delete("asset");
    try {
      await navigator.clipboard.writeText(url.href);
      notify("Profile link copied. Local caption drafts are not included.");
    } catch {
      setShareLink(url.href);
    }
  };
  const copyData = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(profileData(talent), null, 2),
      );
      notify("Character data copied.");
    } catch {
      notify("Clipboard unavailable. Use Download data instead.");
    }
  };
  const chooseAsset = (id: string) => {
    setActiveId(id);
    setVersion("current");
    setTab("assets");
  };
  return (
    <dialog
      ref={dialog}
      className="tl-dialog tl-app"
      aria-labelledby="tl-profile-name"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header className="tl-profile-header">
        <div className="tl-profile-heading">
          <img src={talent.portrait} alt="" />
          <div>
            <span className="tl-eyebrow">TALENT PROFILE</span>
            <h2 id="tl-profile-name">{talent.displayName}</h2>
          </div>
          <span className="tl-demo-tag">
            {talent.provenance === "reference"
              ? "Reference photo"
              : talent.provenance === "uploaded"
                ? "Uploaded profile"
                : "Fictional talent"}
          </span>
        </div>
        <button
          className="tl-icon-button"
          onClick={onClose}
          aria-label="Close profile"
        >
          <LabIcon name="close" />
        </button>
      </header>
      <div className="tl-profile-usage">
        <AssetUsage asset={active} />
      </div>
      <div className="tl-profile-toolbar">
        <div className="tl-tabs" aria-label="Profile sections">
          {(["overview", "assets", "data"] as const).map((item) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              aria-pressed={tab === item}
              onClick={() => setTab(item)}
            >
              {item === "overview"
                ? "Overview"
                : item === "assets"
                  ? `Assets · ${assets.length}`
                  : "Profile data"}
            </button>
          ))}
        </div>
        <div className="tl-actions">
          <button className="tl-button" onClick={onManage}>
            Manage images
          </button>
          <button className="tl-button" onClick={copyLink}>
            <LabIcon name="link" size={16} />
            <span>Copy link</span>
          </button>
          <button
            className="tl-button tl-primary"
            disabled={busy}
            onClick={() => onPack(assets, `${talent.id}-pack.zip`)}
          >
            <LabIcon name="download" size={16} />
            {busy ? "Preparing…" : "Download pack"}
          </button>
        </div>
      </div>
      {shareLink && (
        <label className="tl-share-fallback">
          Copy this profile link
          <input
            readOnly
            value={shareLink}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
      <div
        className={`tl-profile-scroll ${tab === "assets" ? "is-editor" : ""}`}
      >
        {tab === "overview" && (
          <div className="tl-overview">
            <div className="tl-overview-photo">
              <div className="tl-overview-photo-frame">
                <img
                  src={talent.portrait}
                  alt={`Portrait of ${talent.displayName}`}
                />
                <button
                  className="tl-button"
                  onClick={() => chooseAsset(assets[0].id)}
                >
                  <LabIcon name="image" size={16} /> View portrait
                </button>
              </div>
              <AIDisclosure provenance={talent.provenance} />
            </div>
            <div className="tl-overview-info">
              <div className="tl-tags">
                {talent.verticals.map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
              <h3>{talent.displayName}</h3>
              <p className="tl-location">
                <LabIcon name="pin" size={15} />
                {talent.location}
                <span>·</span>
                {talent.age > 0
                  ? `${talent.age} years old`
                  : "Age not assigned"}
              </p>
              <p className="tl-bio">{talent.bio}</p>
              {talent.creativeDirection && (
                <section
                  className="tl-creative-direction"
                  aria-label="Creative direction"
                >
                  <h4>Creative direction</h4>
                  <p>{talent.creativeDirection.summary}</p>
                  <details>
                    <summary>Identity reference</summary>
                    <ul>
                      {talent.creativeDirection.identityNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </details>
                  {talent.creativeDirection.motionBrief && (
                    <details>
                      <summary>
                        Video direction
                        <span>
                          {talent.motionStatus === "ready"
                            ? "Ready"
                            : "Planned"}
                        </span>
                      </summary>
                      <p>{talent.creativeDirection.motionBrief}</p>
                    </details>
                  )}
                  {talent.creativeDirection.promptFile && (
                    <a
                      className="tl-text-button"
                      href={talent.creativeDirection.promptFile}
                      download
                    >
                      <LabIcon name="download" size={14} /> Download creative
                      brief
                    </a>
                  )}
                </section>
              )}
              <div className="tl-summary-stats">
                <div>
                  <strong>
                    {hasAssignedAudience(talent)
                      ? formatAudience(talent.totalAudience)
                      : "—"}
                  </strong>
                  <span>
                    {hasAssignedAudience(talent)
                      ? "Total audience"
                      : "Audience not assigned"}
                  </span>
                </div>
                <div>
                  <strong>
                    {assets.filter((asset) => !asset.tile?.video).length}
                  </strong>
                  <span>Image assets</span>
                </div>
                <div>
                  <strong>{readyVideoSources(talent).length}</strong>
                  <span>Ready videos</span>
                </div>
              </div>
              <h4>
                Social profiles <span>Demo data</span>
              </h4>
              <div className="tl-platform-list">
                {!talent.platforms.length && (
                  <p>No social accounts or audience figures assigned.</p>
                )}
                {talent.platforms.map((p) => (
                  <div key={p.network}>
                    <span className="tl-network">{SHORT_NAMES[p.network]}</span>
                    <div>
                      <strong>{NETWORK_NAMES[p.network]}</strong>
                      <span>{p.handle || "Handle not supplied"}</span>
                    </div>
                    <b>{formatAudience(p.followers)}</b>
                  </div>
                ))}
              </div>
              <div className="tl-note">
                <LabIcon name="image" size={18} />
                <p>
                  Images and their history, together.
                  <br />
                  <span>
                    Download a pack for current images, preserved originals and
                    profile data. Caption drafts stay on this browser.
                  </span>
                </p>
              </div>
              {talent.motion && talent.motionStatus === "ready" && (
                <div className="tl-profile-motion-block">
                  <video
                    className="tl-profile-motion"
                    key={talent.motion}
                    playsInline
                    controls
                    preload="metadata"
                    poster={
                      talent.content.find(
                        (tile) => tile.video === talent.motion,
                      )?.thumb || talent.portrait
                    }
                    aria-label={`${talent.displayName} profile video`}
                  >
                    {talentVideoSources(talent.motion).map((source) => (
                      <source key={source.src} src={source.src} type={source.type} />
                    ))}
                  </video>
                  <AIDisclosure provenance={talent.provenance} />
                </div>
              )}
            </div>
            <section className="tl-overview-assets">
              <div>
                <h4>Content collection</h4>
                <button
                  className="tl-text-button"
                  onClick={() => chooseAsset(assets[1]?.id || assets[0].id)}
                >
                  View all assets <LabIcon name="arrow" size={16} />
                </button>
              </div>
              <div className="tl-overview-thumbs">
                {assets.slice(1).map((a) => (
                  <div className="tl-overview-thumb" key={a.id}>
                    <button
                      onClick={() => chooseAsset(a.id)}
                      aria-label={`View ${a.title}`}
                    >
                      <img src={a.src} alt={a.title} loading="lazy" />
                      <span className="tl-thumb-kind">
                        {assetKind(a) === "planned"
                          ? "Video planned"
                          : assetKind(a) === "video"
                            ? "Video"
                            : "Image"}
                      </span>
                    </button>
                    <AIDisclosure
                      provenance={a.tile?.provenance || talent.provenance}
                    />
                  </div>
                ))}
              </div>
            </section>
            {Boolean(talent.referenceImages?.length) && (
              <details className="tl-source-references">
                <summary>
                  <span>
                    Source references
                    <small>{talent.referenceImages!.length} files</small>
                  </span>
                  <LabIcon name="chevron" size={16} />
                </summary>
                <p>
                  Earlier images and profile references, preserved as supplied.
                  Open a reference to see the complete original file.
                </p>
                <div className="tl-reference-grid">
                  {talent.referenceImages!.map((reference) => (
                    <div className="tl-reference-card" key={reference.src}>
                      <a
                        href={reference.src}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${reference.label} in a new tab`}
                      >
                        <img
                          src={reference.src}
                          alt={reference.label}
                          loading="lazy"
                        />
                      </a>
                      <AIDisclosure provenance="reference" />
                      <a
                        className="tl-reference-link"
                        href={reference.src}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {reference.label}
                        <LabIcon name="external" size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
        {tab === "assets" && (
          <div className="tl-asset-editor">
            <div
              className={`tl-editor-stage ${active.original ? "has-versions" : ""}`}
            >
              <div className="tl-editor-label">
                <div>
                  <span className="tl-eyebrow">
                    {active.index < 0
                      ? "PORTRAIT"
                      : NETWORK_NAMES[active.tile!.platform].toUpperCase()}
                  </span>
                  <h3>{active.title}</h3>
                </div>
                <button
                  className={`tl-icon-button ${saved.includes(active.id) ? "is-saved" : ""}`}
                  onClick={() => onSave(active.id)}
                  aria-pressed={saved.includes(active.id)}
                  aria-label={
                    saved.includes(active.id)
                      ? "Unsave current asset"
                      : "Save current asset"
                  }
                >
                  <LabIcon name="bookmark" />
                </button>
              </div>
              {active.original && (
                <div className="tl-version-bar">
                  <div
                    className="tl-version-toggle"
                    role="group"
                    aria-label="Image version"
                  >
                    <button
                      className={!showingOriginal ? "active" : ""}
                      aria-pressed={!showingOriginal}
                      onClick={() => setVersion("current")}
                    >
                      Current
                    </button>
                    <button
                      className={showingOriginal ? "active" : ""}
                      aria-pressed={showingOriginal}
                      onClick={() => setVersion("original")}
                    >
                      Original
                    </button>
                  </div>
                  <span>
                    {showingOriginal ? "Preserved original" : "Latest image"}
                  </span>
                </div>
              )}
              <div
                className="tl-preview-figure"
                style={
                  {
                    "--tl-preview-ratio": ratioWidth / ratioHeight,
                  } as CSSProperties
                }
              >
                <div
                  className="tl-preview-media"
                  style={{ aspectRatio: previewRatio }}
                >
                  {showingOriginal ? (
                    <img
                      src={active.original}
                      alt={`${active.title} — preserved original`}
                    />
                  ) : active.tile?.video ? (
                    <video
                      key={`${active.id}:${active.tile.video}`}
                      playsInline
                      poster={active.src}
                      controls
                      preload="metadata"
                      aria-label={active.title}
                    >
                      {talentVideoSources(active.tile.video).map((source) => (
                        <source key={source.src} src={source.src} type={source.type} />
                      ))}
                    </video>
                  ) : (
                    <img src={active.src} alt={active.title} />
                  )}
                  {!showingOriginal && !active.tile?.video && (
                    <Caption settings={caption} />
                  )}
                </div>
                <AIDisclosure
                  className="tl-preview-disclosure"
                  provenance={active.tile?.provenance || talent.provenance}
                />
              </div>
              <a
                className="tl-fullsize-link"
                href={showingOriginal ? active.original : active.src}
                target="_blank"
                rel="noreferrer"
              >
                <LabIcon name="external" size={13} />
                {active.tile?.video
                  ? "Open full-size poster"
                  : "Open full-size image"}
              </a>
              {assetKind(active) === "planned" && !showingOriginal && (
                <p className="tl-placeholder-note">
                  <LabIcon name="image" size={14} /> Video planned · still image
                  available
                </p>
              )}
              <div className="tl-filmstrip" aria-label="Character assets">
                {assets.map((a) => (
                  <button
                    key={a.id}
                    aria-label={`Select ${a.title}`}
                    aria-pressed={a.id === activeId}
                    className={a.id === activeId ? "active" : ""}
                    onClick={() => chooseAsset(a.id)}
                  >
                    <img src={a.src} alt="" />
                    <span>
                      {a.index < 0
                        ? "Portrait"
                        : String(a.index + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <aside
              className="tl-editor-controls"
              aria-label="Asset details and caption editor"
            >
              <h3>Asset details</h3>
              <dl className="tl-asset-facts">
                <div>
                  <dt>Creator</dt>
                  <dd>{talent.displayName}</dd>
                </div>
                <div>
                  <dt>Available file</dt>
                  <dd>{active.tile?.video ? "Video + poster" : "Image"}</dd>
                </div>
                {active.tile && (
                  <>
                    <div>
                      <dt>Views</dt>
                      <dd>
                        {active.tile.views?.toLocaleString() ?? "Not supplied"}
                      </dd>
                    </div>
                    <div>
                      <dt>Engagements</dt>
                      <dd>
                        {active.tile.engagements?.toLocaleString() ??
                          "Not supplied"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              {active.tile?.generation && !showingOriginal && (
                <div className="tl-generation-note">
                  <span className="tl-eyebrow">
                    {active.tile.generation.version}
                  </span>
                  <p>{active.tile.generation.approach}</p>
                </div>
              )}
              {showingOriginal && (
                <div className="tl-original-note">
                  <p>
                    This earlier image is kept as part of the character’s
                    history.
                  </p>
                  {caption && <p>Switch to Current to edit the caption.</p>}
                </div>
              )}
              {caption && !showingOriginal && !active.tile?.video && (
                <TalentCaptionControls
                  settings={caption}
                  onChange={(settings) => onCaption(active, settings)}
                  onReset={() =>
                    onCaption(active, resolveCaptionSettings(active.tile!))
                  }
                />
              )}
              <div className="tl-editor-downloads">
                {active.tile?.video && (
                  <button
                    className="tl-button tl-primary"
                    disabled={downloading}
                    onClick={() => action(() => downloadVideo(active))}
                  >
                    <LabIcon name="download" size={16} />
                    Download video
                  </button>
                )}
                <button
                  className="tl-button"
                  disabled={downloading}
                  onClick={() => action(() => downloadOriginal(active))}
                >
                  <LabIcon name="download" size={16} />
                  {active.tile?.video
                    ? "Download poster"
                    : active.original
                      ? "Download current image"
                      : "Download image"}
                </button>
                {active.original && (
                  <button
                    className={`tl-button ${showingOriginal ? "tl-primary" : ""}`}
                    disabled={downloading}
                    onClick={() =>
                      action(() => downloadArchivedOriginal(active))
                    }
                  >
                    <LabIcon name="download" size={16} /> Download original
                    image
                  </button>
                )}
                {caption && !showingOriginal && !active.tile?.video && (
                  <button
                    className="tl-button tl-primary"
                    disabled={downloading}
                    onClick={() =>
                      action(() => downloadCaptioned(active, caption))
                    }
                  >
                    <LabIcon name="download" size={16} />
                    {downloading ? "Preparing…" : "Download with caption"}
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
        {tab === "data" && (
          <section className="tl-data-view">
            <div>
              <h3>A complete character record</h3>
              <p>
                Identity, social profiles, current and preserved images,
                creative direction, demo metrics and your caption settings.
              </p>
              <div className="tl-actions">
                <button
                  className="tl-button tl-primary"
                  onClick={() => exportData([talent], `${talent.id}.json`)}
                >
                  <LabIcon name="download" size={16} />
                  Download data
                </button>
                <button className="tl-button" onClick={copyData}>
                  <LabIcon name="copy" size={16} />
                  Copy data
                </button>
              </div>
            </div>
            <pre tabIndex={0} aria-label="Character data">
              {JSON.stringify(profileData(talent), null, 2)}
            </pre>
          </section>
        )}
      </div>
      {notice && (
        <div className="tl-profile-notice" role="status">
          {notice}
        </div>
      )}
    </dialog>
  );
}
