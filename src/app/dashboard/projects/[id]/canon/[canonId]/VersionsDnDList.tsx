"use client";

import * as React from "react";

type CanonVersionRow = {
  id: string;
  canon_entity_id: string;
  version: number;
  payload: any;
  notes: string | null;
  created_at: string;
  image_url: string | null;
  image_meta?: any;
  is_current?: boolean | null;
  sort_order?: number | null;
  sort_index?: number | null;
};

type Props = {
  projectId: string;
  canonId: string;
  initialVersions: CanonVersionRow[];
};

function getImageUrl(v: CanonVersionRow): string | null {
  if (v.image_url && typeof v.image_url === "string") return v.image_url;

  const payloadImageUrl = v?.payload?.image?.url;
  if (payloadImageUrl && typeof payloadImageUrl === "string") return payloadImageUrl;

  return null;
}

export default function VersionsDnDList({
  projectId,
  canonId,
  initialVersions,
}: Props) {
  const [versions, setVersions] = React.useState<CanonVersionRow[]>(initialVersions);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionErr, setActionErr] = React.useState<string | null>(null);
  const [actionMsg, setActionMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setVersions(initialVersions);
  }, [initialVersions]);

  async function handleSetCurrent(versionId: string) {
    try {
      setBusyId(versionId);
      setActionErr(null);
      setActionMsg(null);

      const res = await fetch(
        `/dashboard/projects/${projectId}/canon/${canonId}/versions/set-current`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ versionId }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || `Failed (${res.status})`);
      }

      setActionMsg("Current version updated.");

      setVersions((prev) =>
        prev.map((v) => ({
          ...v,
          is_current: v.id === versionId,
        }))
      );
    } catch (e: any) {
      setActionErr(e?.message || "Failed to set current.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">
          Versions ({versions.length})
        </div>
        <div className="text-xs font-mono text-white/50">
          canonId: {canonId.slice(0, 8)}...
        </div>
      </div>

      {actionErr ? (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {actionErr}
        </div>
      ) : null}

      {actionMsg ? (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {actionMsg}
        </div>
      ) : null}

      {versions.length === 0 ? (
        <div className="mt-3 text-sm text-white/60">
          No versions returned for this canon entity.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {versions.map((v) => {
            const displayImageUrl = getImageUrl(v);

            return (
              <div
                key={v.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-white">
                      <span className="font-semibold">v{v.version}</span>{" "}
                      <span className="text-white/50">•</span>{" "}
                      <span className="text-white/70">
                        {new Date(v.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1 text-xs font-mono text-white/40">
                      {v.id.slice(0, 8)}...
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.is_current ? (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                        Current
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleSetCurrent(v.id)}
                      disabled={busyId === v.id}
                      className="rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      {busyId === v.id ? "Setting..." : "Set Current"}
                    </button>
                  </div>
                </div>

                {v.notes ? (
                  <div className="mt-3 text-sm text-white/70">{v.notes}</div>
                ) : null}

                {displayImageUrl ? (
                  <div className="mt-4">
                    <div className="mb-2 text-xs text-white/50">Character Image</div>
                    <img
                      src={displayImageUrl}
                      alt={`Canon version v${v.version}`}
                      className="h-40 w-40 rounded-xl border border-white/10 object-cover bg-black/40"
                    />
                  </div>
                ) : null}

                <div className="mt-4">
                  <div className="mb-1 text-xs text-white/50">payload</div>
                  <pre className="max-h-64 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-white/80">
                    {JSON.stringify(v.payload, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}