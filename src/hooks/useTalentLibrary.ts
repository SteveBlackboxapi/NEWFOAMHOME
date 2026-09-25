import { useCallback, useEffect, useMemo, useState } from "react";
import { labTalent } from "../data/labTalentCatalogue";
import type { StagedTalent } from "../data/stagedTalent";
import {
  PRIVATE_LIBRARY,
  githubLibraryConnection,
  canonicalProfile,
  emptyLibrary,
  materializeLibrary,
  materializeLibraryImage,
  readGithubLibrary,
  saveGithubLibrary,
  retryWebsitePublication,
  readWebsitePublication,
  verifyGithubAccess,
  type LibraryManifest,
  type LibrarySnapshot,
  type LibraryUpload,
} from "../lib/githubTalentLibrary";

export function useTalentLibrary() {
  const [snapshot, setSnapshot] = useState<LibrarySnapshot>({
    manifest: emptyLibrary(),
    revision: null,
  });
  const [manifest, setManifest] = useState<LibraryManifest>(emptyLibrary);
  const [uploads, setUploads] = useState<Record<string, LibraryUpload>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  // Access keys stay in memory only; never in browser storage, URLs or exported data.
  const [token, setToken] = useState("");
  const [serverConnected, setServerConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(manifest) !== JSON.stringify(snapshot.manifest);
  useEffect(() => {
    const publication = snapshot.publication;
    if (!PRIVATE_LIBRARY || !publication?.queued || publication.published) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const check = async () => {
      try {
        const revision = await readWebsitePublication();
        if (active && revision === publication.revision) {
          setSnapshot((previous) => previous.revision === revision
            ? { ...previous, publication: { ...publication, published: true } }
            : previous);
          return;
        }
      } catch { /* A saved catalogue remains safe while publishing or offline. */ }
      if (active && ++attempts < 40) timer = setTimeout(check, 15_000);
    };
    timer = setTimeout(check, 10_000);
    return () => { active = false; clearTimeout(timer); };
  }, [snapshot.publication]);
  const applySnapshot = useCallback((next: LibrarySnapshot) => {
    setSnapshot(next);
    setManifest(next.manifest);
    setUploads({});
    setPreviews({});
    setReady(true);
    setError("");
  }, []);
  useEffect(() => {
    let active = true;
    if (PRIVATE_LIBRARY)
      void githubLibraryConnection().then((connected) => {
        if (active) setServerConnected(connected);
      });
    readGithubLibrary()
      .then((next) => {
        if (active) applySnapshot(next);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error
              ? e.message
              : "Could not load the online library.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applySnapshot]);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  const refresh = async () => {
    setLoading(true);
    try {
      applySnapshot(await readGithubLibrary(token));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not refresh the library.",
      );
    } finally {
      setLoading(false);
    }
  };
  const connect = async (key: string) => {
    setSaving(true);
    setError("");
    try {
      await verifyGithubAccess(key.trim());
      const next = await readGithubLibrary(key.trim());
      if (dirty && next.revision !== snapshot.revision)
        throw new Error(
          "A newer library is available. Discard your draft and refresh before connecting.",
        );
      if (PRIVATE_LIBRARY) setServerConnected(true);
      else setToken(key.trim());
      if (!dirty) applySnapshot(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect GitHub.");
      throw e;
    } finally {
      setSaving(false);
    }
  };
  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const next = await saveGithubLibrary(
        token,
        snapshot,
        manifest,
        Object.values(uploads),
      );
      applySnapshot(next);
      return next;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save. Your draft is still here.",
      );
      throw e;
    } finally {
      setSaving(false);
    }
  };
  const retryPublication = async () => {
    if (!snapshot.revision || dirty) return;
    setSaving(true);
    setError("");
    try {
      const publication = await retryWebsitePublication(snapshot.revision, token);
      setSnapshot((previous) => ({ ...previous, publication }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not queue the website update.");
    } finally {
      setSaving(false);
    }
  };
  const disconnect = async () => {
    if (!PRIVATE_LIBRARY) {
      setToken("");
      return;
    }
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok)
        throw new Error("Could not lock the library. Please try again.");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not lock the library.");
    }
  };
  const rawProfiles = useMemo(() => {
    const overrides = new Map(manifest.profiles.map((p) => [p.id, p]));
    return [
      ...labTalent.map((p) => overrides.get(p.id) || canonicalProfile(p)),
      ...manifest.profiles.filter((p) => !labTalent.some((b) => b.id === p.id)),
    ].filter((p) => !manifest.removedTalentIds.includes(p.id));
  }, [manifest]);
  const profiles = useMemo(
    () => materializeLibrary(labTalent, manifest, snapshot.revision, previews),
    [manifest, snapshot.revision, previews],
  );
  const websiteImages = useMemo(() => Object.fromEntries(
    Object.entries(manifest.websiteReplacements || {}).map(([source, replacement]) =>
      [source, materializeLibraryImage(replacement, snapshot.revision, previews)]),
  ), [manifest.websiteReplacements, snapshot.revision, previews]);
  const changedWebsiteImages = Object.keys(manifest.websiteReplacements || {}).filter((source) =>
    manifest.websiteReplacements?.[source] !== snapshot.manifest.websiteReplacements?.[source]);
  const upsert = (profile: StagedTalent) =>
    setManifest((previous) => ({
      ...previous,
      profiles: [
        ...previous.profiles.filter((p) => p.id !== profile.id),
        profile,
      ],
      removedTalentIds: previous.removedTalentIds.filter(
        (id) => id !== profile.id,
      ),
    }));
  const remove = (id: string) =>
    setManifest((previous) => ({
      ...previous,
      profiles: previous.profiles.filter((p) => p.id !== id),
      removedTalentIds: [
        ...previous.removedTalentIds.filter((value) => value !== id),
        id,
      ],
    }));
  return {
    profiles,
    rawProfiles,
    websiteImages,
    changedWebsiteImages,
    loading,
    saving,
    ready,
    error,
    dirty,
    publication: snapshot.publication,
    hasWebsiteReplacements: Object.keys(snapshot.manifest.websiteReplacements || {}).length > 0,
    connected: PRIVATE_LIBRARY ? serverConnected : !!token,
    connect,
    disconnect,
    refresh,
    save,
    retryPublication,
    upsert,
    remove,
    replaceWebsiteImage: (source: string, replacement: string) =>
      setManifest((previous) => ({
        ...previous,
        websiteReplacements: { ...previous.websiteReplacements, [source]: replacement },
      })),
    reset: () => applySnapshot(snapshot),
    addUpload: (upload: LibraryUpload, preview: string) => {
      setUploads((p) => ({ ...p, [upload.path]: upload }));
      setPreviews((p) => ({
        ...p,
        [upload.path.slice("public/".length)]: preview,
      }));
    },
  };
}
export type TalentLibraryController = ReturnType<typeof useTalentLibrary>;
