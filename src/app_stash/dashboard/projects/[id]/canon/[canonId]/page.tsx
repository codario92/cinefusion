import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import VersionsDnDList from "./VersionsDnDList";
import NewCanonVersionForm from "./NewCanonVersionForm";

type Props = {
  params: {
    id: string;        // projectId
    canonId: string;
  };
};

export default async function CanonPage({ params }: Props) {
  const { id: projectId, canonId } = params;

  const supabase = await getSupabaseServer();

  /* =========================
     GET CANON ENTITY
  ========================= */
  const { data: canon } = await supabase
    .from("canon_entities")
    .select("*")
    .eq("id", canonId)
    .single();

  if (!canon) return notFound();

  /* =========================
     GET VERSIONS (FIXED ORDER)
  ========================= */
  const { data: versions } = await supabase
    .from("canon_versions")
    .select("*")
    .eq("canon_entity_id", canonId)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("version", { ascending: false });

  /* =========================
     SAFETY FALLBACK
     (if sort_order doesn't exist yet)
  ========================= */
  const safeVersions =
    versions?.length
      ? versions.map((v, i) => ({
          ...v,
          sort_order: v.sort_order ?? i,
        }))
      : [];

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {canon.name}
        </h1>
        <p className="text-sm text-white/50">
          Canon ID: {canon.id}
        </p>
      </div>

      {/* CREATE NEW VERSION */}
      <NewCanonVersionForm
        projectId={projectId}
        canonId={canonId}
      />

      {/* VERSIONS LIST */}
      <VersionsDnDList
        projectId={projectId}
        canonId={canonId}
        initialVersions={safeVersions}
      />
    </div>
  );
}