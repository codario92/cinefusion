"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type AssetType = "character" | "location" | "scene";

type CharacterRow = { id: string; name: string; created_at?: string };
type LocationRow = { id: string; name: string; created_at?: string };
type SceneRow = { id: string; title: string; created_at?: string };

type Asset = {
  id: string;
  label: string;
  type: AssetType;
  created_at?: string;
  // optional thumbnail support (we’ll wire it later)
  thumbUrl?: string | null;
};

function initials(label: string) {
  const parts = label.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function typeToRoute(type: AssetType) {
  if (type === "character") return "characters";
  if (type === "location") return "locations";
  return "scenes";
}

export default function SandboxAssetDrawer({
  projectId,
  selectedType,
}: {
  projectId: string;
  selectedType?: AssetType;
}) {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AssetType>(selectedType ?? "character");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (selectedType) setTab(selectedType);
  }, [selectedType]);

  async function load() {
    if (!projectId) return;
    setLoading(true);
    setErr("");

    try {
      // Load all three in parallel (fast + simple)
      const [chars, locs, scenes] = await Promise.all([
        supabase
          .from("sandbox_characters")
          .select("id, name, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("sandbox_locations")
          .select("id, name, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("sandbox_scenes")
          .select("id, title, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
      ]);

      const e =
        chars.error?.message ||
        locs.error?.message ||
        scenes.error?.message ||
        "";
      if (e) setErr(e);

      const mapped: Asset[] = [
        ...((chars.data ?? []) as CharacterRow[]).map((r) => ({
          id: r.id,
          label: r.name,
          type: "character" as const,
          created_at: r.created_at,
        })),
        ...((locs.data ?? []) as LocationRow[]).map((r) => ({
          id: r.id,
          label: r.name,
          type: "location" as const,
          created_at: r.created_at,
        })),
        ...((scenes.data ?? []) as SceneRow[]).map((r) => ({
          id: r.id,
          label: r.title,
          type: "scene" as const,
          created_at: r.created_at,
        })),
      ];

      setAssets(mapped);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // preload once so opening drawer is instant
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const filtered = assets
    .filter((a) => a.type === tab)
    .filter((a) => (q.trim() ? a.label.toLowerCase().includes(q.toLowerCase()) : true));

  function jumpToAsset(a: Asset) {
    const route = typeToRoute(a.type);

    // Build the same project sandbox route you’re already using:
    // /dashboard/projects/[id]/sandbox/<route>?select=<id>
    const base = pathname?.split("/sandbox/")[0]; // "/dashboard/projects/<id>"
    const target = `${base}/sandbox/${route}?select=${a.id}`;

    router.push(target);
    setOpen(false);
  }

  return (
    <>
      {/* floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/20 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/10 hover:bg-fuchsia-500/25"
      >
        Assets
      </button>

      {/* overlay */}
      {open ? (
        <button
          type="button"
          aria-label="Close assets"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      ) : null}

      {/* drawer */}
      <div
        className={[
          "fixed right-0 top-0 z-50 h-full w-105 max-w-[92vw] transform border-l border-white/10 bg-[#08040f]/95 shadow-2xl transition",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-white">Continuity Vault</div>
              <div className="text-xs text-white/60">Browse assets by folder + jump to edit.</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="px-5 pt-4">
            {/* tabs */}
            <div className="grid grid-cols-3 gap-2">
              {([
                ["character", "Characters"],
                ["location", "Locations"],
                ["scene", "Scenes"],
              ] as const).map(([t, label]) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={[
                      "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* search */}
            <div className="mt-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-fuchsia-400/60"
              />
            </div>

            {err ? (
              <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                {err}
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between text-xs text-white/60">
              <span>{loading ? "Loading…" : `${filtered.length} item(s)`}</span>
              <button
                type="button"
                onClick={load}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* list */}
          <div className="mt-4 flex-1 overflow-auto px-5 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((a) => (
                <button
                  key={`${a.type}-${a.id}`}
                  type="button"
                  onClick={() => jumpToAsset(a)}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
                >
                  <div className="relative mb-2 aspect-16/10 overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-fuchsia-500/20 via-white/5 to-cyan-400/10">
                    {a.thumbUrl ? (
                      // If/when you add real thumbnails, this will show automatically
                      // (for now it stays as the gradient tile)
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.thumbUrl}
                        alt={a.label}
                        className="h-full w-full object-cover opacity-90"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white/80">
                          {initials(a.label)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="line-clamp-2 text-sm font-semibold text-white">
                    {a.label}
                  </div>
                  <div className="mt-1 text-xs text-white/50 group-hover:text-white/60">
                    Click to edit CIF →
                  </div>
                </button>
              ))}
            </div>

            {!loading && filtered.length === 0 ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                Nothing found in this folder.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
