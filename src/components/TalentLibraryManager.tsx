import { useEffect, useRef, useState } from "react";
import { labTalent } from "../data/labTalentCatalogue";
import type { StagedTalent, TalentContentTile } from "../data/stagedTalent";
import { websiteUsageFor, websiteArtwork } from "../data/websiteAssetUsage";
import { assetsFor, type LabAsset } from "../lib/talentLab";
import {
  PRIVATE_LIBRARY,
  LIBRARY_REPO,
  LIBRARY_REVIEW_URL,
  prepareLibraryImage,
} from "../lib/githubTalentLibrary";
import type { TalentLibraryController } from "../hooks/useTalentLibrary";
import "./talent-library-manager.css";

const websiteUrl = (route: string) =>
  PRIVATE_LIBRARY
    ? `https://steveblackboxapi.github.io/NEWFOAMHOME${route}`
    : `${import.meta.env.BASE_URL.replace(/\/$/, "")}${route}`;
const baselineAssets = labTalent.flatMap(assetsFor);
export function placementsForAsset(asset: LabAsset) {
  const baseline = baselineAssets.find((a) => a.id === asset.id);
  const uses = [
    ...(websiteUsageFor(baseline?.src || asset.src)?.uses || []),
    ...(websiteUsageFor(asset.src)?.uses || []),
  ];
  return [...new Map(uses.map((u) => [`${u.route}:${u.section}`, u])).values()];
}
export function AssetUsage({ asset }: { asset: LabAsset }) {
  const uses = placementsForAsset(asset);
  return (
    <div className="tl-usage">
      <strong>
        {uses.length
          ? `Website · ${uses.length} ${uses.length === 1 ? "placement" : "placements"}`
          : "Library only"}
      </strong>
      {uses.length > 0 && (
        <ul>
          {uses.map((u) => (
            <li key={`${u.route}:${u.section}`}>
              <a href={websiteUrl(u.route)} target="_blank" rel="noopener">
                {u.section} ↗
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export function TalentLibraryManager({
  library,
  initialId,
  onClose,
}: {
  library: TalentLibraryController;
  initialId?: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState(initialId || "");
  const [newName, setNewName] = useState("");
  const [key, setKey] = useState("");
  const [replacing, setReplacing] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState<{
    label: string;
    run: () => void;
  } | null>(null);
  const [artwork, setArtwork] = useState(false);
  const profile = library.rawProfiles.find((p) => p.id === selectedId);
  const rendered = library.profiles.find((p) => p.id === selectedId);
  const activeAssets = rendered ? assetsFor(rendered) : [];
  const busy = library.saving || processing;
  const editable = library.ready && !library.loading && !busy;
  const isUsed = activeAssets.some((a) => placementsForAsset(a).length > 0);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const d = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    d.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      closeRef.current();
    };
    d.addEventListener("cancel", cancel);
    return () => {
      d.removeEventListener("cancel", cancel);
      d.close();
      previous?.focus();
    };
  }, []);
  function pick(id: string) {
    setSelectedId(id);
    setArtwork(false);
    setMessage("");
    setError("");
    setConfirm(null);
  }
  async function addFiles(files: File[], replaceId: string | null = null) {
    if (!editable || !files.length) return;
    if (!profile && !newName.trim()) {
      setError("Give the new talent a name first.");
      return;
    }
    if (
      files.length > 12 ||
      files.reduce((sum, f) => sum + f.size, 0) > 40 * 1024 * 1024
    ) {
      setError("Add up to 12 images, totalling no more than 40 MB, at a time.");
      return;
    }
    if (replaceId && files.length !== 1) {
      setError("Choose one replacement image.");
      return;
    }
    setProcessing(true);
    setError("");
    setMessage("");
    try {
      const prepared = await Promise.all(files.map(prepareLibraryImage));
      const id = profile?.id || `upload-${crypto.randomUUID()}`;
      const next: StagedTalent = profile
        ? { ...profile, content: [...profile.content] }
        : {
            id,
            displayName: newName.trim().slice(0, 100),
            age: 0,
            location: "",
            bio: "",
            verticals: ["Uploaded"],
            platforms: [],
            totalAudience: 0,
            portrait: prepared[0].src,
            provenance: "uploaded",
            motion: null,
            motionStatus: "placeholder",
            content: [],
          };
      prepared.forEach((item) => library.addUpload(item.upload, item.preview));
      if (replaceId) {
        const target = activeAssets.find((a) => a.id === replaceId);
        if (!target) throw new Error("This image is no longer available.");
        if (!target.tile) {
          next.portrait = prepared[0].src;
          next.originalPortrait =
            profile?.originalPortrait || profile?.portrait;
          next.motion = null;
          next.motionStatus = "placeholder";
          next.content = next.content.map((t) => ({
            ...t,
            provenance: t.provenance || profile?.provenance || "ai-generated",
          }));
          next.provenance = "uploaded";
        } else {
          next.content[target.index] = {
            ...next.content[target.index],
            thumb: prepared[0].src,
            original:
              next.content[target.index].original ||
              next.content[target.index].thumb,
            aspectRatio: prepared[0].ratio,
            type: "still",
            video: undefined,
            views: undefined,
            engagements: undefined,
            generation: undefined,
            provenance: "uploaded",
          };
        }
      } else {
        next.content.push(
          ...prepared.map((item): TalentContentTile => ({
            id: `upload-${crypto.randomUUID()}`,
            type: "still",
            thumb: item.src,
            caption: item.name,
            captionSettings: { visible: false },
            aspectRatio: item.ratio,
            platform: "instagram",
            strongKind: "photo",
            provenance: "uploaded",
          })),
        );
      }
      library.upsert(next);
      setSelectedId(id);
      setNewName("");
      setMessage(
        replaceId
          ? "Replacement ready. Save to GitHub to keep it online."
          : "Images added to your draft. Save to GitHub to keep them online.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "That image could not be opened.",
      );
    } finally {
      setProcessing(false);
      setReplacing(null);
    }
  }
  function removeAsset(asset: LabAsset) {
    if (!profile || !asset.tile || placementsForAsset(asset).length) return;
    setConfirm({
      label: `Remove “${asset.title}” from this talent?`,
      run: () => {
        library.upsert({
          ...profile,
          content: profile.content.filter((_, i) => i !== asset.index),
        });
        setConfirm(null);
      },
    });
  }
  return (
    <dialog
      ref={dialog}
      className="tl-app tl-library-manager"
      aria-labelledby="library-manager-title"
    >
      <header>
        <div>
          <span className="tl-eyebrow">YOUR ONLINE LIBRARY</span>
          <h2 id="library-manager-title">
            Talent, images & where they’re used
          </h2>
        </div>
        <button className="tl-button" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="tl-library-connection">
        <div>
          <strong>
            {library.connected
              ? "Connected to GitHub"
              : library.loading
                ? "Loading GitHub library…"
                : "Connect GitHub to save online"}
          </strong>
          <p>
            Changes stay in the library for review. They don’t publish to the
            website automatically.
          </p>
        </div>
        {library.connected ? (
          <button
            className="tl-button"
            disabled={busy}
            onClick={() =>
              library.dirty
                ? setConfirm({
                    label: "Discard your unsaved draft and lock the library?",
                    run: () => {
                      library.reset();
                      void library.disconnect();
                    },
                  })
                : void library.disconnect()
            }
          >
            {PRIVATE_LIBRARY ? "Lock library" : "Disconnect"}
          </button>
        ) : (
          <details>
            <summary>Connect to save</summary>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                try {
                  await library.connect(key);
                  setKey("");
                } catch {
                  setKey("");
                }
              }}
            >
              <label>
                GitHub access key
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                  placeholder="Paste your fine-grained access token"
                />
              </label>
              <p>
                Choose only <b>{LIBRARY_REPO}</b>, with{" "}
                <b>Contents: read and write</b>.{" "}
                {PRIVATE_LIBRARY
                  ? "One-time setup: the key is kept encrypted on the private server, so you only need the library password next time."
                  : "The key is used for this visit only and is never saved."}
              </p>
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create a GitHub key ↗
              </a>
              <button
                className="tl-button tl-primary"
                disabled={busy || !key.trim()}
              >
                Connect GitHub
              </button>
            </form>
          </details>
        )}
      </div>
      {(error || library.error) && (
        <p className="tl-library-error" role="alert">
          {error || library.error}
        </p>
      )}
      {message && (
        <p role="status" className="tl-library-message">
          {message}
        </p>
      )}
      <div className="tl-library-actions">
        <button
          className="tl-button"
          disabled={busy || library.loading}
          onClick={() =>
            library.dirty
              ? setConfirm({
                  label:
                    "Discard this unsaved draft and load the latest GitHub library?",
                  run: () => {
                    void library.refresh();
                    setConfirm(null);
                  },
                })
              : void library.refresh()
          }
        >
          Refresh library
        </button>
        <button
          className="tl-button"
          disabled={!library.dirty || busy}
          onClick={() =>
            setConfirm({
              label: "Discard all unsaved changes?",
              run: () => {
                library.reset();
                setConfirm(null);
              },
            })
          }
        >
          Discard draft
        </button>
        <a href={LIBRARY_REVIEW_URL} target="_blank" rel="noopener noreferrer">
          View files on GitHub ↗
        </a>
        <button
          className="tl-button tl-primary"
          disabled={!library.dirty || !library.connected || busy}
          onClick={async () => {
            try {
              await library.save();
              setMessage(
                "Saved to GitHub. This library is now available on your other devices.",
              );
            } catch {}
          }}
        >
          {library.saving
            ? "Saving…"
            : library.dirty
              ? "Save changes to GitHub"
              : "No unsaved changes"}
        </button>
      </div>
      {confirm && (
        <div className="tl-library-confirm" role="alert">
          <p>{confirm.label}</p>
          <button className="tl-button" onClick={() => setConfirm(null)}>
            Keep it
          </button>
          <button className="tl-button" onClick={confirm.run}>
            Confirm
          </button>
        </div>
      )}
      <div className="tl-library-selector">
        <label>
          Choose talent
          <select
            value={artwork ? "__artwork" : selectedId}
            disabled={busy}
            onChange={(e) =>
              e.target.value === "__artwork"
                ? (setArtwork(true),
                  setSelectedId(""),
                  setConfirm(null),
                  setMessage(""),
                  setError(""))
                : pick(e.target.value)
            }
          >
            <option value="">＋ Add new talent</option>
            {library.rawProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
            <option value="__artwork">Website artwork & product images</option>
          </select>
        </label>
        {!artwork && !profile && (
          <label>
            Talent name
            <input
              value={newName}
              maxLength={100}
              disabled={!editable}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name your new talent"
            />
          </label>
        )}
      </div>
      {artwork ? (
        <>
          <p>
            Brand artwork and product images are kept separate from people.
            These placements show where each is used.
          </p>
          <div className="tl-library-image-grid">
            {websiteArtwork.map((item) => (
              <article key={item.src}>
                <img src={item.src} alt={item.label} loading="lazy" />
                <h3>{item.label}</h3>
                <ul>
                  {item.uses.map((u) => (
                    <li key={`${u.route}:${u.section}`}>
                      <a
                        target="_blank"
                        rel="noopener"
                        href={websiteUrl(u.route)}
                      >
                        {u.section} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          {profile && (
            <div className="tl-library-details">
              <label>
                Talent name
                <input
                  value={profile.displayName}
                  maxLength={100}
                  disabled={!editable}
                  onChange={(e) =>
                    library.upsert({ ...profile, displayName: e.target.value })
                  }
                />
              </label>
              <label>
                Interests
                <input
                  value={profile.verticals.join(", ")}
                  disabled={!editable}
                  onChange={(e) =>
                    library.upsert({
                      ...profile,
                      verticals: e.target.value.split(",").map((v) => v.trim()),
                    })
                  }
                />
              </label>
              <label>
                Notes
                <textarea
                  value={profile.bio}
                  disabled={!editable}
                  onChange={(e) =>
                    library.upsert({ ...profile, bio: e.target.value })
                  }
                />
              </label>
            </div>
          )}
          <div
            className={`tl-library-drop ${dragging ? "is-dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void addFiles(Array.from(e.dataTransfer.files));
            }}
          >
            <strong>
              {processing ? "Preparing your images…" : "Drop images here"}
            </strong>
            <p>PNG, JPEG or WebP · up to 10 MB each</p>
            <button
              className="tl-button"
              disabled={!editable || (!profile && !newName.trim())}
              onClick={() => fileInput.current?.click()}
            >
              Choose images
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              onChange={(e) => {
                void addFiles(Array.from(e.target.files || []));
                e.target.value = "";
              }}
            />
          </div>
          <input
            ref={replaceInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              void addFiles(Array.from(e.target.files || []), replacing);
              e.target.value = "";
            }}
          />
          <div className="tl-library-image-grid">
            {activeAssets.map((asset) => (
              <article key={asset.id}>
                <img src={asset.src} alt={asset.title} />
                <h3>{asset.tile ? asset.title : "Profile portrait"}</h3>
                <AssetUsage asset={asset} />
                <div className="tl-library-image-actions">
                  <button
                    className="tl-button"
                    disabled={!editable}
                    onClick={() => {
                      setReplacing(asset.id);
                      replaceInput.current?.click();
                    }}
                  >
                    Replace
                  </button>
                  {asset.tile && (
                    <>
                      <button
                        className="tl-button"
                        disabled={!editable}
                        onClick={() => {
                          if (profile)
                            library.upsert({
                              ...profile,
                              portrait: profile.content[asset.index].thumb,
                              provenance:
                                profile.content[asset.index].provenance,
                              motion: null,
                              motionStatus: "placeholder",
                              content: profile.content.map((t) => ({
                                ...t,
                                provenance:
                                  t.provenance ||
                                  profile.provenance ||
                                  "ai-generated",
                              })),
                            });
                        }}
                      >
                        Use as portrait
                      </button>
                      <button
                        className="tl-button"
                        disabled={
                          !editable || placementsForAsset(asset).length > 0
                        }
                        title={
                          placementsForAsset(asset).length
                            ? "Remove its website placements before deleting."
                            : undefined
                        }
                        onClick={() => removeAsset(asset)}
                      >
                        Remove image
                      </button>
                    </>
                  )}
                </div>
                {placementsForAsset(asset).length > 0 && (
                  <p className="tl-library-small">
                    This image has website placements. A replacement is a draft
                    until applied to those pages.
                  </p>
                )}
              </article>
            ))}
          </div>
          {profile && (
            <div className="tl-library-remove">
              <button
                className="tl-button"
                disabled={!editable || isUsed}
                onClick={() =>
                  setConfirm({
                    label: `Remove ${profile.displayName} and their images from the library?`,
                    run: () => {
                      library.remove(profile.id);
                      pick("");
                    },
                  })
                }
              >
                Remove talent
              </button>
              <p>
                {isUsed
                  ? "This talent is used on the website. Remove those placements before deleting the profile."
                  : "Removal is saved as a draft and can be discarded before saving."}
              </p>
            </div>
          )}
        </>
      )}
      <footer>
        {library.dirty
          ? "Unsaved draft — save before leaving."
          : "Library files are stored on GitHub."}{" "}
        Uploads use the repository’s visibility; this is not a private file
        vault.
      </footer>
    </dialog>
  );
}
