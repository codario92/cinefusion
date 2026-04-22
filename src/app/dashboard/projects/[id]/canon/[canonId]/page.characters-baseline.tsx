// src/app/dashboard/projects/[id]/canon/[canonId]/page.tsx
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import NewCanonVersionForm from "./NewCanonVersionForm";
import VersionsDnDList from "./VersionsDnDList";

type Params = {
  id: string;
  canonId: string;
};

export default async function CanonDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id: projectId, canonId } = await params;
  const supabase = await getSupabaseServer();

  // 1) Load canon entity
  const { data: canon, error: canonErr } = await supabase
    .from("canon_entities")
    .select("id, project_id, name, type")
    .eq("id", canonId)
    .eq("project_id", projectId)
    .single();

  if (canonErr || !canon) return notFound();

  // 2) TEMP DEBUG TEST: raw versions query with NO filter
  const { data: versions, error: versionsErr } = await supabase
    .from("canon_versions")
    .select("id, canon_entity_id, version, payload, notes, created_at, image_url, image_meta, is_current, sort_order, sort_index")
    .order("created_at", { ascending: false })
    .limit(5);

  console.log("VERSIONS TEST RAW:", versions, versionsErr);

  const safeVersions = versionsErr || !versions ? [] : versions;

  return (
    <div className="space-y-6">
      {/* PROOF / DEBUG BANNER */}
      <div className="rounded-xl border-4 border-red-500 bg-red-500/10 px-4 py-3 font-mono text-sm">
        <div className="font-bold text-red-200">
          🚨 CANON PAGE PROOF BANNER — RAW QUERY TEST
        </div>

        <div className="mt-2 text-red-100">
          projectId: <span className="text-red-200">{projectId}</span>
        </div>
        <div className="text-red-100">
          canonId: <span className="text-red-200">{canonId}</span>
        </div>
        <div className="text-red-100">
          canon.id: <span className="text-red-200">{canon.id}</span>
        </div>
        <div className="text-red-100">
          versions fetched: <span className="text-red-200">{safeVersions.length}</span>
        </div>
        <div className="mt-1 text-red-100">
          versionsErr:{" "}
          <span className="text-red-200">
            {versionsErr ? JSON.stringify(versionsErr, null, 2) : "none"}
          </span>
        </div>
        <div className="mt-1 text-red-100 break-all">
          versions raw:{" "}
          <span className="text-red-200">
            {JSON.stringify(versions)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="text-sm font-semibold text-white">Canon Entity</div>
        <div className="mt-2 space-y-1 text-sm text-white/70">
          <div>
            ID: <span className="text-white/90">{canon.id}</span>
          </div>
          <div>
            Name: <span className="text-white/90">{canon.name}</span>
          </div>
          <div>
            Type: <span className="text-white/90">{canon.type}</span>
          </div>
        </div>
      </div>

      <NewCanonVersionForm projectId={projectId} canonId={canonId} />

      <VersionsDnDList
        key={`versions-${safeVersions.length}`}
        projectId={projectId}
        canonId={canonId}
        initialVersions={safeVersions}
      />
    </div>
  );
}