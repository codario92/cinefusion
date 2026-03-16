import { getSupabaseServer } from "@/lib/supabase/server";

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: string; sceneId: string }>;
}) {
  const { id: projectId, sceneId } = await params;

  const supabase = await getSupabaseServer();

  const { data: scene, error } = await supabase
    .from("sandbox_scenes")
    .select("id, project_id, title, synopsis, sort_order, created_at")
    .eq("project_id", projectId)
    .eq("id", sceneId)
    .maybeSingle();

  if (error) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        Failed to load scene: {error.message}
      </div>
    );
  }

  if (!scene) {
    return (
      <div style={{ padding: 24, color: "crimson" }}>
        Scene not found or no access.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
        {scene.title ?? "Untitled scene"}
      </div>

      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        {scene.synopsis ?? ""}
      </div>

      <div style={{ fontSize: 12, opacity: 0.6 }}>
        Scene ID: {scene.id}
      </div>
    </div>
  );
}
