import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  const supabase = await getSupabaseServer();
  const { projectId, sceneId } = params;

  const body = await req.json().catch(() => ({}));
  const title = body?.title != null ? String(body.title).trim() : undefined;
  const synopsis = body?.synopsis != null ? String(body.synopsis) : undefined;
  const notes = body?.notes != null ? String(body.notes) : undefined;

  if (title !== undefined && title.length === 0) {
    return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
  }

  const update: Record<string, any> = {};
  if (title !== undefined) update.title = title;
  if (synopsis !== undefined) update.synopsis = synopsis;
  if (notes !== undefined) update.notes = notes;

  const { data, error } = await supabase
    .from("sandbox_scenes")
    .update(update)
    .eq("id", sceneId)
    .eq("project_id", projectId)
    .select("id, project_id, title, synopsis, notes, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data }, { status: 200 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string; sceneId: string } }
) {
  const supabase = await getSupabaseServer();
  const { projectId, sceneId } = params;

  const { error } = await supabase
    .from("sandbox_scenes")
    .delete()
    .eq("id", sceneId)
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
