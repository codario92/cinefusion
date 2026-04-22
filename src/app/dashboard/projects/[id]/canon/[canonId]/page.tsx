import { getSupabaseServer } from "@/lib/supabase/server";
import VersionsDnDList from "./VersionsDnDList";
import NewCanonVersionForm from "./NewCanonVersionForm";

type Params = {
  id: string;
  canonId: string;
};

type Props = {
  params: Promise<Params>;
};

export default async function CanonPage({ params }: Props) {
  const { id: projectId, canonId } = await params;
  const supabase = await getSupabaseServer();

  const { data: canon, error: canonErr } = await supabase
    .from("canon_entities")
    .select("*")
    .eq("id", canonId)
    .maybeSingle();

  const { data: versions, error: versionsErr } = await supabase
    .from("canon_versions")
    .select("*")
    .eq("canon_entity_id", canonId)
    .order("sort_order", { ascending: true })
    .order("version", { ascending: true });

  if (!canon) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="text-2xl font-bold">Canon Debug</h1>
        <pre className="mt-4 overflow-auto rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/80">
          {JSON.stringify(
            {
              projectId,
              canonId,
              canonErr,
              versionsErr,
              versionsCount: versions?.length ?? 0,
              firstVersion: versions?.[0] ?? null,
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  }

  const safeVersions =
    versions?.length
      ? versions.map((v, i) => ({
          ...v,
          sort_order:
            typeof v.sort_order === "number" ? v.sort_order : i + 1,
        }))
      : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {canon.name ?? "Unnamed Canon Entity"}
        </h1>
        <p className="text-sm text-white/50">Canon ID: {canon.id}</p>
      </div>

      <NewCanonVersionForm projectId={projectId} canonId={canonId} />

      <VersionsDnDList
        projectId={projectId}
        canonId={canonId}
        initialVersions={safeVersions}
      />
    </div>
  );
}