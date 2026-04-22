import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; canonId: string } }
) {
  const supabase = await getSupabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: entity, error: entityErr } = await supabase
    .from("canon_entities")
    .select("id, project_id, type, name, description, is_archived, created_at, updated_at")
    .eq("id", params.canonId)
    .eq("project_id", params.projectId)
    .single();

  if (entityErr || !entity) {
    return NextResponse.json({ error: "Canon entity not found or not in this project." }, { status: 404 });
  }

  const { data: versions, error: versionsErr } = await supabase
    .from("canon_versions")
    .select("id, canon_entity_id, version, payload, notes, created_at")
    .eq("canon_entity_id", params.canonId)
    .order("version", { ascending: false });

  if (versionsErr) return NextResponse.json({ error: versionsErr.message }, { status: 500 });

  return NextResponse.json({
    projectId: params.projectId,
    canonId: params.canonId,
    canon_entity: entity,
    versions: versions ?? [],
  });
}