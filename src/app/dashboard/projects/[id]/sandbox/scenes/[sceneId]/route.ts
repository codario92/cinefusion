import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const { id: projectId, sceneId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }
    if (!sceneId) {
      return NextResponse.json({ error: "Missing sceneId" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const titleRaw = body?.title;
    const synopsisRaw = body?.synopsis;

    const patch: Record<string, any> = {};

    if (titleRaw !== undefined) {
      const title = String(titleRaw).trim();
      if (!title) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      patch.title = title;
    }

    if (synopsisRaw !== undefined) {
      const synopsis = synopsisRaw == null ? null : String(synopsisRaw).trim();
      patch.synopsis = synopsis && synopsis.length ? synopsis : null;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabase
      .from("sandbox_scenes")
      .update(patch)
      .eq("id", sceneId)
      .eq("project_id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
