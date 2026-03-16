import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// GET /dashboard/projects/:id/canon
export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const projectId = ctx.params.id;

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();

  // If you want auth-gating here, uncomment:
  // const { data: authData, error: authErr } = await supabase.auth.getUser();
  // if (authErr || !authData?.user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const { data, error } = await supabase
    .from("canon_entities")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ projectId, canon: data ?? [] });
}