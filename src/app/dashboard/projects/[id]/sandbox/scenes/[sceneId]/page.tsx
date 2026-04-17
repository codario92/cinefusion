import { getSupabaseServer } from "@/lib/supabase/server";
import SceneCharactersPanel from "./SceneCharactersPanel";

type SceneRow = {
  id: string;
  project_id: string;
  title: string | null;
  synopsis: string | null;
  sort_order: number | null;
  created_at: string | null;
};

type CanonEntityRow = {
  id: string;
  project_id?: string | null;
  name?: string | null;
  title?: string | null;
  current_version_id?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

type CanonVersionRow = {
  id: string;
  canon_entity_id: string;
  version?: number | null;
  notes?: string | null;
  payload?: any;
  image_url?: string | null;
  image_meta?: any;
  is_current?: boolean | null;
  created_at?: string | null;
  [key: string]: any;
};

type SceneCharacterLinkRow = {
  id: string;
  scene_id: string;
  canon_entity_id: string;
  canon_version_id: string | null;
  created_at: string | null;
};

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
    .maybeSingle<SceneRow>();

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

  const { data: canonEntities, error: canonEntitiesError } = await supabase
    .from("canon_entities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (canonEntitiesError) {
    console.error("Failed to load canon entities:", canonEntitiesError);
  }

  const safeCanonEntities: CanonEntityRow[] = Array.isArray(canonEntities)
    ? canonEntities
    : [];

  const entityIds = safeCanonEntities.map((e) => e.id).filter(Boolean);

  let safeVersions: CanonVersionRow[] = [];
  if (entityIds.length > 0) {
    const { data: versions, error: versionsError } = await supabase
      .from("canon_versions")
      .select("*")
      .in("canon_entity_id", entityIds);

    if (versionsError) {
      console.error("Failed to load canon versions:", versionsError);
    } else {
      safeVersions = Array.isArray(versions) ? versions : [];
    }
  }

  const { data: sceneLinks, error: sceneLinksError } = await supabase
    .from("scene_characters")
    .select("*")
    .eq("scene_id", sceneId)
    .order("created_at", { ascending: true });

  if (sceneLinksError) {
    console.error("Failed to load scene character links:", sceneLinksError);
  }

  const safeSceneLinks: SceneCharacterLinkRow[] = Array.isArray(sceneLinks)
    ? sceneLinks
    : [];

  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          {scene.title ?? "Untitled scene"}
        </div>

        <div style={{ opacity: 0.8, marginBottom: 16 }}>
          {scene.synopsis ?? ""}
        </div>

        <div style={{ fontSize: 12, opacity: 0.6 }}>Scene ID: {scene.id}</div>
      </div>

      <SceneCharactersPanel
        projectId={projectId}
        sceneId={sceneId}
        canonEntities={safeCanonEntities}
        versions={safeVersions}
        links={safeSceneLinks}
      />
    </div>
  );
}