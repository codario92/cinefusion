import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const supabase = await getSupabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("canon_entities")
    .select("id, project_id, type, name, description, is_archived, created_at, updated_at")
    .eq("project_id", params.projectId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ projectId: params.projectId, canon: data ?? [] });
}