import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { normalizeWebsiteAssetSrc, websiteAssetUsage, type WebsiteAssetUsage } from "../data/websiteAssetUsage";
import { websiteSettingsPages } from "../lib/websiteImageSettings";
import { PRIVATE_LIBRARY, prepareLibraryImage } from "../lib/githubTalentLibrary";
import type { TalentLibraryController } from "../hooks/useTalentLibrary";
import { LabIcon } from "./TalentLabIcon";

const pages = websiteSettingsPages();
const pageNames = new Map(pages.map((page) => [page.route, page.label]));
const canonical = (src: string) => normalizeWebsiteAssetSrc(src).replace(/^\//, "");
const pageUrl = (route: string) => PRIVATE_LIBRARY
  ? `https://steveblackboxapi.github.io/NEWFOAMHOME${route}`
  : `${import.meta.env.BASE_URL.replace(/\/$/, "")}${route}`;

export function TalentLabSettings({ library, onBack, onManage }: {
  library: TalentLibraryController;
  onBack: () => void;
  onManage: (id: string) => void;
}) {
  const [params, setParams] = useSearchParams();
  const tab = params.get("settingsTab") === "library" ? "library" : "website";
  const page = pages.find((item) => item.route === params.get("settingsPage")) || pages[0];
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const replacement = useRef<WebsiteAssetUsage | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const busy = library.saving || processing;
  const editable = library.ready && !library.loading && !busy;
  useEffect(() => { heading.current?.focus(); }, []);
  const changeTab = (next: "website" | "library") => {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      updated.set("settingsTab", next);
      return updated;
    });
    setMessage("");
    setError("");
  };
  const imageFor = (asset: WebsiteAssetUsage) => library.websiteImages[canonical(asset.src)] || asset.src;
  const returnLabel = params.get("from") === "talent" ? "Talent directory" : params.get("from") === "saved" ? "Saved assets" : "Explore content";
  const otherAssets = websiteAssetUsage.filter((asset) =>
    asset.uses.some((use) => use.route === page.route) && !/\.(?:png|jpe?g|webp)$/i.test(canonical(asset.src)));
  const replace = async (file: File) => {
    const asset = replacement.current;
    if (!asset || !editable) return;
    setProcessing(true);
    setError("");
    setMessage("");
    try {
      const prepared = await prepareLibraryImage(file);
      library.addUpload(prepared.upload, prepared.preview);
      library.replaceWebsiteImage(canonical(asset.src), prepared.src);
      setMessage(`Replacement ready for ${asset.label}. Save changes to update all ${asset.uses.length} website ${asset.uses.length === 1 ? "placement" : "placements"}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This image could not be opened.");
    } finally {
      setProcessing(false);
      replacement.current = null;
    }
  };
  return (
    <main className="tl-settings" id="talent-results" tabIndex={-1}>
      <button className="tl-settings-back" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to {returnLabel}
      </button>
      <div className="tl-settings-tabs" ref={tabs} role="tablist" aria-label="Settings sections" onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "website" : event.key === "End" ? "library" : tab === "website" ? "library" : "website";
        changeTab(next);
        tabs.current?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();
      }}>
        <button id="tl-settings-website-tab" data-tab="website" type="button" role="tab" aria-selected={tab === "website"}
          aria-controls="tl-settings-panel" tabIndex={tab === "website" ? 0 : -1} onClick={() => changeTab("website")}>
          <LabIcon name="image" size={18} /> Website images
        </button>
        <button id="tl-settings-library-tab" data-tab="library" type="button" role="tab" aria-selected={tab === "library"}
          aria-controls="tl-settings-panel" tabIndex={tab === "library" ? 0 : -1} onClick={() => changeTab("library")}>
          <LabIcon name="people" size={18} /> Talent library
        </button>
      </div>
      <section className="tl-settings-panel" id="tl-settings-panel" role="tabpanel" aria-labelledby={`tl-settings-${tab}-tab`}>
        <div className="tl-settings-heading">
          <div>
            <h2 ref={heading} tabIndex={-1}>{tab === "website" ? "Website images" : "Talent library"}</h2>
            <p>{tab === "website"
              ? "Find an image by page and section. Replace it once, then save to update every place it appears."
              : "Add talent, update profiles and organize your library images."}</p>
          </div>
          <span className={`tl-settings-connection ${library.connected ? "is-connected" : ""}`}>
            <i /> {library.loading ? "Loading library…" : library.connected ? "Connected" : "Not connected"}
          </span>
        </div>
        <div className="tl-settings-actions">
          <span>{processing ? "Preparing image…" : library.loading ? "Loading your saved library…" : !library.ready
            ? "Load the library to edit website images" : library.dirty ? "You have unsaved changes" : library.error ? "Check the library connection" : "Your changes are saved"}</span>
          <div>
            {!library.connected && <button className="tl-button" type="button" onClick={() => onManage("")}>Connect library</button>}
            <button className="tl-button" type="button" disabled={busy || library.loading} onClick={() => {
              if (!library.dirty || window.confirm("Discard your unsaved changes and load the latest saved library?")) { setMessage(""); void library.refresh(); }
            }}>Refresh</button>
            {library.dirty && <button className="tl-button" type="button" disabled={busy} onClick={() => {
              if (window.confirm("Discard your unsaved changes? Your saved images stay as they are.")) { library.reset(); setMessage(""); setError(""); }
            }}>Discard draft</button>}
            <button className="tl-button tl-primary" type="button" disabled={!library.dirty || !library.connected || busy} onClick={async () => {
              setError("");
              try { const saved = await library.save(); if (saved) setMessage("Changes saved."); } catch { /* The library reports the save error. */ }
            }}>{library.saving ? "Saving…" : "Save changes"}</button>
          </div>
        </div>
        {(error || library.error) && <p className="tl-settings-notice is-error" role="alert">{error || library.error}</p>}
        {message && <p className="tl-settings-notice" role="status">{message}</p>}
        {library.hasWebsiteReplacements && library.publication && (
          <p className={`tl-settings-notice ${library.publication.queued === false ? "is-error" : ""}`} role="status">
            {library.publication.published ? "Website images are live. Open website pages will refresh when idle."
              : library.publication.queued ? "Website update queued. The saved replacements will appear after publishing finishes."
                : library.publication.error}
            {library.publication.queued === false && <button className="tl-button" type="button" disabled={busy || library.dirty || !library.connected}
              onClick={() => void library.retryPublication()}>Retry website update</button>}
          </p>
        )}
        {tab === "website" ? (
          <div className="tl-website-map">
            <nav className="tl-website-pages" aria-label="Website pages">
              <span className="tl-settings-overline">PAGES · {pages.length}</span>
              {pages.map((item) => {
                const preview = item.sections.find((section) => !section.name.startsWith("Footer"))?.assets[0] || item.sections[0]?.assets[0];
                return <button type="button" key={item.route} aria-current={item.route === page.route ? "page" : undefined}
                  onClick={() => setParams((previous) => { const updated = new URLSearchParams(previous); updated.set("settingsPage", item.route); return updated; })}>
                  {preview && <img src={imageFor(preview)} alt="" loading="lazy" />}
                  <span><strong>{item.label}</strong><small>{item.imageCount} images</small></span>
                  <LabIcon name="chevron" size={14} />
                </button>;
              })}
            </nav>
            <div className="tl-website-page">
              <header className="tl-website-page-heading">
                <div><span className="tl-settings-overline">WEBSITE PAGE</span><h3>{page.label}</h3></div>
                <a className="tl-button" href={pageUrl(page.route)} target="_blank" rel="noopener noreferrer">Open page <LabIcon name="external" size={14} /></a>
              </header>
              {[...page.sections].sort((a, b) => Number(a.name.startsWith("Footer")) - Number(b.name.startsWith("Footer"))).map((section) => (
                <section className="tl-website-section" key={section.name} aria-label={section.name}>
                  <h4><span aria-hidden="true" />{section.name}<small>{section.assets.length}</small></h4>
                  <div className="tl-website-images">
                    {section.assets.map((asset) => {
                      const source = canonical(asset.src);
                      const changed = library.changedWebsiteImages.includes(source);
                      return <article className="tl-website-image" key={source}>
                        <div className="tl-website-thumbnail"><img src={imageFor(asset)} alt={asset.label} loading="lazy" decoding="async" />
                          {changed && <span>Unsaved replacement</span>}
                        </div>
                        <div className="tl-website-image-info">
                          <h5>{asset.label}</h5>
                          <p>{asset.kind === "artwork" ? "Artwork / background" : asset.kind === "reference-photo" ? "Website photograph" : "Talent image"}</p>
                          <details className="tl-website-placements">
                            <summary>{asset.uses.length} website {asset.uses.length === 1 ? "placement" : "placements"} <LabIcon name="chevron" size={12} /></summary>
                            <ul>{asset.uses.map((use) => <li key={`${use.route}:${use.section}`}><strong>{pageNames.get(use.route) || use.route}</strong><span>{use.section}</span></li>)}</ul>
                          </details>
                          <button className="tl-button" type="button" disabled={!editable}
                            aria-label={`Replace ${asset.label} in ${section.name}`} onClick={() => { replacement.current = asset; fileInput.current?.click(); }}>
                            <LabIcon name="image" size={15} /> Replace image
                          </button>
                        </div>
                      </article>;
                    })}
                  </div>
                </section>
              ))}
              {otherAssets.length > 0 && <details className="tl-website-other"><summary>Other page assets · {otherAssets.length}</summary>
                <p>Video, audio and vector artwork are listed for reference.</p>
                <ul>{otherAssets.map((asset) => <li key={asset.src}>{asset.label}<span>{/\.svg$/i.test(canonical(asset.src)) ? "Vector artwork" : /\.(mp4|webm)$/i.test(canonical(asset.src)) ? "Video" : "Audio"}</span></li>)}</ul>
              </details>}
            </div>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden aria-label="Choose replacement website image"
              onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void replace(file); }} />
          </div>
        ) : (
          <div className="tl-settings-library">
            <div className="tl-settings-library-intro"><div><strong>{library.profiles.length} talent profiles</strong><p>New images and profiles stay in your library.</p></div>
              <button className="tl-button tl-primary" type="button" onClick={() => onManage("")}><LabIcon name="people" size={17} /> Add talent / images</button>
            </div>
            <div className="tl-settings-talents">{library.profiles.map((talent) => <button type="button" key={talent.id} onClick={() => onManage(talent.id)}>
              <img src={talent.portrait} alt="" loading="lazy" /><span><strong>{talent.displayName}</strong><small>{talent.content.length + 1} assets</small></span><LabIcon name="arrow" size={16} />
            </button>)}</div>
          </div>
        )}
      </section>
      {PRIVATE_LIBRARY && <section className="tl-settings-session" aria-label="Your editing session">
        <div><h2>Your editing session</h2><p>Closes your editing session and asks for the password next time. Your saved images stay safe.</p></div>
        <button className="tl-button" type="button" disabled={busy} onClick={() => {
          if (!library.dirty || window.confirm("You have unsaved changes. Discard them and lock this browser? Your saved images stay safe.")) { library.reset(); void library.disconnect(); }
        }}>Lock this browser</button>
      </section>}
    </main>
  );
}
