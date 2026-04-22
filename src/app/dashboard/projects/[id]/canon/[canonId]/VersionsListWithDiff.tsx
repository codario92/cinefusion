"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CanonVersion = {
  id: string;
  notes?: string | null;
  payload?: any;
  created_at?: string | null;
};

type VersionsListWithDiffProps = {
  projectId: string;
  canonId: string;
  versions: CanonVersion[];
  currentVersionId?: string | null;
};

export default function VersionsListWithDiff({
  projectId,
  canonId,
  versions,
  currentVersionId,
}: VersionsListWithDiffProps) {
  const router = useRouter();
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [settingCurrentId, setSettingCurrentId] = useState<string | null>(null);

  async function handleDuplicate(versionId: string) {
    try {
      setDuplicatingId(versionId);

      const res = await fetch(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions/${versionId}/duplicate`,
        {
          method: "POST",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to duplicate version.");
      }

      router.refresh();
    } catch (error) {
      console.error("Duplicate failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to duplicate version."
      );
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleSetCurrent(versionId: string) {
    try {
      setSettingCurrentId(versionId);

      const res = await fetch(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions/${versionId}/set-current`,
        {
          method: "POST",
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to set current version.");
      }

      router.refresh();
    } catch (error) {
      console.error("Set current failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to set current version."
      );
    } finally {
      setSettingCurrentId(null);
    }
  }

  if (!versions?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        No saved versions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">
        DUPLICATE BUTTON BUILD ACTIVE
      </div>

      {versions.map((version) => {
        const isCurrent = version.id === currentVersionId;
        const imageUrl = version?.payload?.image?.url || null;

        return (
          <div
            key={version.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">
                    Version {version.id.slice(0, 8)}
                  </h3>

                  {isCurrent ? (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300">
                      Current
                    </span>
                  ) : null}

                  {version.created_at ? (
                    <span className="text-xs text-white/50">
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  ) : null}
                </div>

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Version preview"
                    className="h-40 w-40 rounded-xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/40">
                    No image
                  </div>
                )}

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-white/40">
                    Notes
                  </div>
                  <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                    {version.notes?.trim() || "No notes."}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-white/40">
                    Payload
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                    {JSON.stringify(version.payload ?? {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex shrink-0 flex-row gap-2 md:flex-col">
                {!isCurrent ? (
                  <button
                    type="button"
                    onClick={() => handleSetCurrent(version.id)}
                    disabled={settingCurrentId === version.id}
                    className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {settingCurrentId === version.id
                      ? "Setting..."
                      : "Set Current"}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleDuplicate(version.id)}
                  disabled={duplicatingId === version.id}
                  className="rounded-md border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {duplicatingId === version.id ? "Duplicating..." : "Duplicate"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}