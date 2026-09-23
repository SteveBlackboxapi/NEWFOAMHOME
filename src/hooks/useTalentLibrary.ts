import { useCallback, useEffect, useMemo, useState } from "react";
import { labTalent } from "../data/labTalentCatalogue";
import type { StagedTalent } from "../data/stagedTalent";
import {
  PRIVATE_LIBRARY,
  githubLibraryConnection,
  canonicalProfile,
  emptyLibrary,
  materializeLibrary,
  readGithubLibrary,
  saveGithubLibrary,
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
      applySnapshot(
        await saveGithubLibrary(
          token,
          snapshot,
          manifest,
          Object.values(uploads),
        ),
      );
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
    loading,
    saving,
    ready,
    error,
    dirty,
    connected: PRIVATE_LIBRARY ? serverConnected : !!token,
    connect,
    disconnect,
    refresh,
    save,
    upsert,
    remove,
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
