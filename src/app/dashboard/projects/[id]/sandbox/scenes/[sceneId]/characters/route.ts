import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; sceneId: string }>;
  }
) {
  try {
    const { projectId, sceneId } = await params;
    const supabase = await getSupabaseServer();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const canon_entity_id = body?.canon_entity_id;
    const canon_version_id = body?.canon_version_id ?? null;

    if (!canon_entity_id) {
      return NextResponse.json(
        { error: "canon_entity_id is required" },
        { status: 400 }
      );
    }

    const { data: scene, error: sceneError } = await supabase
      .from("sandbox_scenes")
      .select("id, project_id")
      .eq("id", sceneId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (sceneError || !scene) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const { data: entity, error: entityError } = await supabase
      .from("canon_entities")
      .select("id, project_id")
      .eq("id", canon_entity_id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: "Canon entity not found" },
        { status: 404 }
      );
    }

    if (canon_version_id) {
      const { data: version, error: versionError } = await supabase
        .from("canon_versions")
        .select("id, canon_entity_id")
        .eq("id", canon_version_id)
        .eq("canon_entity_id", canon_entity_id)
        .maybeSingle();

      if (versionError || !version) {
        return NextResponse.json(
          { error: "Canon version not found" },
          { status: 404 }
        );
      }
    }

    const { data: existing } = await supabase
      .from("scene_characters")
      .select("id")
      .eq("scene_id", sceneId)
      .eq("canon_entity_id", canon_entity_id)
      .eq("canon_version_id", canon_version_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, existing: true });
    }

    const { error: insertError } = await supabase.from("scene_characters").insert({
      scene_id: sceneId,
      canon_entity_id,
      canon_version_id,
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}