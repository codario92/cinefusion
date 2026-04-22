import { getSupabaseServer } from "@/lib/supabase/server";
import ScenesSortableList from "./ScenesSortableList";
import CreateSceneButton from "./CreateSceneButton";

type SceneRow = {
  id: string;
  project_id: string;
  title: string | null;
  synopsis: string | null;
  sort_order: number | null;
};

export default async function ScenesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sandbox_scenes")
    .select("id, project_id, title, synopsis, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          border: "1px solid rgba(255,0,0,0.35)",
          background: "rgba(255,0,0,0.08)",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        Failed to load scenes: {error.message}
      </div>
    );
  }

  const initialScenes: SceneRow[] = data ?? [];

  return (
    <div style={{ padding: 24 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>
          Scenes
        </div>

        <div style={{ fontSize: 13, opacity: 0.75, color: "white" }}>
          Drag to reorder. Click a title to edit.
        </div>

        <div style={{ marginLeft: "auto" }}>
          <CreateSceneButton projectId={projectId} />
        </div>
      </div>

      {/* Drag + drop list */}
      <ScenesSortableList projectId={projectId} initialScenes={initialScenes} />
    </div>
  );
}
