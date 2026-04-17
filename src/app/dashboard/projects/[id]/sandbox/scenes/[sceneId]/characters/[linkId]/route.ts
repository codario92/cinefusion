import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  {
    params,
  }: {
    params: Promise<{ projectId: string; sceneId: string; linkId: string }>;
  }
) {
  try {
    const { projectId, sceneId, linkId } = await params;
    const supabase = await getSupabaseServer();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { error: deleteError } = await supabase
      .from("scene_characters")
      .delete()
      .eq("id", linkId)
      .eq("scene_id", sceneId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}