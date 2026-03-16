import { getSupabaseServer } from "@/lib/supabase/server";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("projects")
    .select("id,title,created_at")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return <div style={{ padding: 24, color: "crimson" }}>Project not found or no access.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>{data.title}</h1>
      <div style={{ opacity: 0.7 }}>{new Date(data.created_at).toLocaleString()}</div>
      <div style={{ marginTop: 24, opacity: 0.8 }}>
        Next: Characters, Locations, Scenes tables + UI.
      </div>
    </div>
  );
}
